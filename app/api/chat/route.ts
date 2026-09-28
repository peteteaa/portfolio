import { NextRequest } from "next/server";

export const runtime = "edge";

// Free-tier request quota is a per-model daily bucket, and the plain flash models
// have a very small one (gemini-3.6-flash allows 20/day, which a single visitor
// can burn through in one sitting). The -lite models get a much larger allowance,
// so the chatroom runs on those.
//
// The list is a fallback chain, not a retry loop: flash models are frequently
// 503 "high demand", and pinning exactly one means the chatroom is down whenever
// that one is busy. A later candidate is only ever tried when the previous one
// returned nothing at all, so a normal message still costs exactly one request.
const MODEL_CANDIDATES = Array.from(
  new Set(
    [
      process.env.GEMINI_MODEL,
      "gemini-3.5-flash-lite",
      "gemini-3.1-flash-lite",
      "gemini-flash-lite-latest",
    ].filter((model): model is string => Boolean(model && model.trim()))
  )
);

const SYSTEM_INSTRUCTION = `You are PeteBot, the chatroom assistant living on Pete Thambundit's retro
Pokemon-themed portfolio site. You are hanging out in a 90s IRC-style chatroom.

Persona:
- Friendly, casual, a little playful. Retro/Pokemon flavor is welcome but do not overdo it.
- Keep replies SHORT: one to three sentences. This is a tiny chat window, not a blog.
- Plain text or light markdown only (bold, italics, inline code, links). No long headings or tables.

About Pete:
- Pete is a software developer interested in AI/ML and web development.
- Outside of code he's into Pokemon cards, running, bouldering, and Muay Thai.
- Visitors can reach him through the Contact page of this site.

If you do not know something about Pete, say so and point the visitor at the Contact page
instead of making things up.`;

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Walk MODEL_CANDIDATES until one actually answers. A 503 means that model is
 * overloaded and a 404 means the id is wrong or retired — in both cases the model
 * served nothing, so the next candidate is worth a shot. Anything else (401 bad
 * key, 429 quota, 400 bad request) is about us, not the model: stop immediately
 * rather than replaying the same doomed call against every remaining model.
 */
async function callGemini(apiKey: string, body: string, signal: AbortSignal) {
  let lastResponse: Response | null = null;
  let lastModel = MODEL_CANDIDATES[0];

  for (const model of MODEL_CANDIDATES) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body,
        signal,
      }
    );

    lastResponse = response;
    lastModel = model;

    if (response.ok) return { response, model };
    if (response.status !== 503 && response.status !== 404) break;

    console.warn(`Gemini model ${model} unavailable (${response.status}); trying next.`);
  }

  return { response: lastResponse!, model: lastModel };
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new Response("Gemini API key is not configured.", { status: 500 });
  }

  let messages: IncomingMessage[];

  try {
    const body = await req.json();
    messages = Array.isArray(body?.messages) ? body.messages : [];
  } catch {
    return new Response("Invalid request body.", { status: 400 });
  }

  const contents = messages
    .filter((msg) => typeof msg?.content === "string" && msg.content.trim())
    .map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

  if (contents.length === 0) {
    return new Response("No messages provided.", { status: 400 });
  }

  const payload = JSON.stringify({
    contents,
    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    generationConfig: {
      temperature: 0.8,
      // Thinking tokens are drawn from this same budget, and a "low" think still
      // costs a few hundred. At 512 the reply itself could be squeezed out to
      // nothing, which surfaces in the chat as an empty message.
      maxOutputTokens: 2048,
      // Flash models think by default, and chatroom banter does not need it.
      thinkingConfig: { thinkingLevel: "low" },
    },
  });

  const { response: upstream, model } = await callGemini(apiKey, payload, req.signal);

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    console.error(`Gemini request failed (model ${model}):`, upstream.status, detail);

    // Gemini's raw quota error is a multi-line wall of billing URLs — unreadable
    // in a chat window a few hundred pixels wide. The full text is in the server
    // log above; the visitor just needs to know to come back later.
    let message: string;

    if (upstream.status === 429) {
      message = "PeteBot has hit today's free Gemini quota. Try again later!";
    } else if (upstream.status === 503) {
      message = "PeteBot is a bit overloaded right now. Give it a moment and try again.";
    } else {
      // Surface Gemini's own message so other failures stay diagnosable.
      message = `Gemini request failed (${upstream.status}).`;
      try {
        const parsed = JSON.parse(detail);
        if (parsed?.error?.message) message = parsed.error.message;
      } catch {
        /* non-JSON error body; keep the generic message */
      }
    }

    // Pass through the statuses the client can act on; collapse the rest to 502.
    const status =
      upstream.status === 503 || upstream.status === 429 ? upstream.status : 502;

    return new Response(message, { status });
  }

  // Gemini streams server-sent events; unwrap them into plain text chunks so the
  // client can just append whatever it reads.
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const reader = upstream.body.getReader();
  let buffer = "";

  /**
   * Pull the text out of one SSE event. Gemini delimits events with CRLF, so both
   * the event split and this line split have to tolerate \r — splitting on a bare
   * "\n\n" silently matches nothing and the whole response comes back empty.
   */
  function textFromEvent(event: string): string {
    let out = "";

    for (const line of event.split(/\r?\n/)) {
      if (!line.startsWith("data:")) continue;

      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;

      try {
        const parsed = JSON.parse(payload);
        const text = parsed?.candidates?.[0]?.content?.parts
          // Skip reasoning parts so internal thoughts never reach the chat.
          ?.filter((part: { thought?: boolean }) => part?.thought !== true)
          .map((part: { text?: string }) => part?.text ?? "")
          .join("");

        if (text) out += text;
      } catch (error) {
        console.error("Failed to parse Gemini SSE chunk:", error);
      }
    }

    return out;
  }

  const stream = new ReadableStream<Uint8Array>({
    // The whole read loop lives in start() on purpose. The pull()-driven version
    // of this stalled: pull was never called again after the first read, so the
    // response hung open without ever emitting a byte.
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Events are separated by a blank line; keep any partial tail buffered.
          const events = buffer.split(/\r?\n\r?\n/);
          buffer = events.pop() ?? "";

          for (const event of events) {
            const text = textFromEvent(event);
            if (text) controller.enqueue(encoder.encode(text));
          }
        }

        // A final event with no trailing blank line would otherwise be dropped.
        const tail = textFromEvent(buffer);
        if (tail) controller.enqueue(encoder.encode(tail));
      } catch (error) {
        console.error("Gemini stream failed:", error);
      } finally {
        controller.close();
      }
    },
    cancel(reason) {
      reader.cancel(reason);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
