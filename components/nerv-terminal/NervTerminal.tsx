"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { evaFontVars } from "../evaFonts";
import { startTerminal } from "./engine";
import { LAUNCH_KEY } from "./keys";
import RetroChatroom from "../RetroChatroom";
import BlackjackOverlay from "../blackjack/BlackjackOverlay";
import "./terminal.css";

// The NERV terminal at /terminal. The markup is static; engine.js drives it.

export default function NervTerminal() {
  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  // the `chat` command opens the chatroom right over the terminal
  const [chatOpen, setChatOpen] = useState(false);
  const [blackjackOpen, setBlackjackOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  // the engine is started once; it reads the latest theme through this ref
  const themeRef = useRef(resolvedTheme);
  themeRef.current = resolvedTheme;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // set by the launch sequence on the homepage. Cleared a moment later rather than right away,
    // so a dev-mode double mount still sees it
    let launched = false;
    try {
      launched = sessionStorage.getItem(LAUNCH_KEY) === "1";
      if (launched) setTimeout(() => sessionStorage.removeItem(LAUNCH_KEY), 1000);
    } catch {}

    return startTerminal(root, {
      launched,
      go: (path: string) => router.push(path),
      openBlackjack: () => {
        // the table has no text field to take focus, so let go of the prompt
        (document.activeElement as HTMLElement | null)?.blur();
        setBlackjackOpen(true);
      },
      openChat: () => setChatOpen(true),
      replayIntro: () => {
        try {
          sessionStorage.removeItem("eva-boot-seen");
        } catch {}
        router.push("/");
      },
      toggleTheme: () => {
        const next = themeRef.current === "light" ? "dark" : "light";
        setTheme(next);
        return next;
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={rootRef} className={`nerv-term ${evaFontVars}`}>
      <div className="monitor">
        <div className="screen" id="nt-screen">
          <div className="titlebar">
            <span>NERV-OS TTY1 — pete@central-dogma</span>
            <span className="host">pthambundit.dev</span>
            <span className="dots"><i>●</i><i>●</i><i>●</i></span>
          </div>
          <div className="panes" id="nt-panes">
            <div className="scroll" id="nt-scroll">
              {/* neofetch + ls: first thing on screen, never cleared. moved out of the scrollback when stacked or split */}
              <div className="pinned" id="nt-pinned" />
              <div id="nt-bootlog" />
              <div id="nt-out" aria-live="polite" />
              <div className="line pline" id="nt-pline">
                <span className="ps1" id="nt-ps1" /> <span className="typed" id="nt-typed" />
                <span className="blk">█</span>
              </div>
            </div>
          </div>
          <div className="status">
            <div className="wins" id="nt-wins" />
            <div className="track" id="nt-track">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="amb" id="nt-runner" src="/images/jolteon-run.gif" alt="" />
            </div>
            <div className="right">
              <button id="nt-stackbtn" data-cmd="stack" title="Pin the header to the top">⇅ stack</button>
              <button className="splitbtn" id="nt-splitbtn" data-cmd="split" title="Pin the header beside the terminal">⇆ split</button>
              <span>│</span>
              <span className="magi ok">MAGI ONLINE</span>
              <span>│</span>
              <span id="nt-clock">00:00:00</span>
            </div>
          </div>

          <div className="tcard" id="nt-tcard">
            <div className="ep" id="nt-tcep" />
            <div className="big" id="nt-tcbig" />
            <div className="jp" id="nt-tcjp" />
          </div>
          <div className="blue" id="nt-blue">
            <div className="head">PATTERN BLUE : <span id="nt-bluepath">/</span> NOT FOUND</div>
            <div className="honey" id="nt-honey" />
            <div className="sub">パターン<span>青</span>　使徒確認</div>
          </div>

          <div className="crt" />
          <div className="glare" />
          <div className="grain" />
          <div className="grain dark" />
          <div className="flick" />
          <span className="measure" id="nt-measure">MMMMMMMMMM</span>
        </div>
        <span className="badge">NERV · MAGI TERMINAL TYPE-02.6</span>
        <span className="led" />
      </div>
      <input id="nt-cmd" autoComplete="off" autoCapitalize="off" spellCheck={false} aria-label="Terminal command" />
      <BlackjackOverlay
        isOpen={blackjackOpen}
        onClose={() => {
          setBlackjackOpen(false);
          rootRef.current?.querySelector<HTMLInputElement>("#nt-cmd")?.focus({ preventScroll: true });
        }}
      />
      <RetroChatroom
        isOpen={chatOpen}
        onClose={() => {
          setChatOpen(false);
          // back to the prompt
          rootRef.current?.querySelector<HTMLInputElement>("#nt-cmd")?.focus({ preventScroll: true });
        }}
      />
    </div>
  );
}
