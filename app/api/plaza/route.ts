import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { cleanName, validateLook } from "@/lib/plaza/look";
import { isNameAllowed } from "@/lib/plaza/moderation";
import { createCharacter, createLimit, deleteCharacter, listRecent, updateCharacter } from "@/lib/plaza/store";

// Visitor-made characters for the walking strip at the bottom of every page.
// GET is cached at the CDN, so Redis sees roughly one read a minute however many people visit;
// writes cost one request each and creates are rate limited per IP.

const SHOWN = 40;

const error = (message: string, status: number) => NextResponse.json({ error: message }, { status });

async function readBody(req: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? body : null;
  } catch {
    return null;
  }
}

function parseCharacter(body: Record<string, unknown>) {
  const name = cleanName(body.name);
  if (!name) return { error: "Names are 1-12 letters, numbers or spaces." };
  if (!isNameAllowed(name)) return { error: "Please pick a different name." };
  const look = validateLook(body.look);
  if (!look) return { error: "That look isn't valid." };
  return { name, look };
}

function isAdmin(req: NextRequest) {
  const expected = process.env.PLAZA_ADMIN_TOKEN;
  const given = req.headers.get("x-plaza-admin");
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

const ownerError = (result: "missing" | "forbidden") =>
  result === "missing" ? error("Character not found.", 404) : error("That's not your character.", 403);

export async function GET() {
  try {
    const characters = await listRecent(SHOWN);
    return NextResponse.json(characters, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (e) {
    console.error("[plaza] list failed", e);
    return error("The plaza is closed right now.", 503);
  }
}

export async function POST(req: NextRequest) {
  const body = await readBody(req);
  if (!body) return error("Bad request.", 400);
  const parsed = parseCharacter(body);
  if ("error" in parsed) return error(parsed.error!, 400);

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
    const { success } = await createLimit().limit(ip);
    if (!success) return error("You've made a lot of characters! Try again in a bit.", 429);

    const { character, token } = await createCharacter(parsed.name, parsed.look);
    return NextResponse.json({ character, token }, { status: 201 });
  } catch (e) {
    console.error("[plaza] create failed", e);
    return error("The plaza is closed right now.", 503);
  }
}

export async function PATCH(req: NextRequest) {
  const body = await readBody(req);
  if (!body || typeof body.id !== "string") return error("Bad request.", 400);
  const parsed = parseCharacter(body);
  if ("error" in parsed) return error(parsed.error!, 400);

  try {
    const result = await updateCharacter(body.id, body.token, parsed.name, parsed.look);
    return result === "ok" ? NextResponse.json({ ok: true }) : ownerError(result);
  } catch (e) {
    console.error("[plaza] update failed", e);
    return error("The plaza is closed right now.", 503);
  }
}

export async function DELETE(req: NextRequest) {
  const body = await readBody(req);
  if (!body || typeof body.id !== "string") return error("Bad request.", 400);

  try {
    const result = await deleteCharacter(body.id, isAdmin(req) ? null : body.token);
    return result === "ok" ? NextResponse.json({ ok: true }) : ownerError(result);
  } catch (e) {
    console.error("[plaza] delete failed", e);
    return error("The plaza is closed right now.", 503);
  }
}
