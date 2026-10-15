"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { evaFontVars } from "../evaFonts";
import { LAUNCH_KEY } from "./keys";
import "./launch.css";

// Launch sequence from the homepage into /terminal: the page switches off like a CRT, MAGI grants
// access, the lift descends to Central Dogma, then the terminal powers on.
// Call launchTerminal() from anywhere on the page to start it.

const LAUNCH_EVENT = "nerv:launch";
// the element that switches off like a CRT (the homepage's root container)
export const CRT_TARGET_ATTR = "data-crt-target";

export function launchTerminal() {
  window.dispatchEvent(new Event(LAUNCH_EVENT));
}

const FLOORS = ["B1", "B5", "B9", "B13", "B17", "B21", "B26", "DOGMA"];

export default function TerminalLaunch() {
  const router = useRouter();
  const [active, setActive] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    router.prefetch("/terminal");
    const onLaunch = () => setActive(true);
    window.addEventListener(LAUNCH_EVENT, onLaunch);
    return () => window.removeEventListener(LAUNCH_EVENT, onLaunch);
  }, [router]);

  useEffect(() => {
    if (!active) return;
    const root = rootRef.current!;
    const $ = (id: string) => root.querySelector("#" + id) as HTMLElement;
    const target = document.querySelector<HTMLElement>(`[${CRT_TARGET_ATTR}]`);
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    let running = true, gone = false;

    const go = () => {
      if (gone) return;
      gone = true;
      timers.forEach(clearTimeout);
      try {
        sessionStorage.setItem(LAUNCH_KEY, "1");
      } catch {}
      router.push("/terminal");
    };
    const flicker = () => {
      root.classList.remove("flicker");
      void root.offsetWidth;
      root.classList.add("flicker");
    };
    const show = (id: string) => root.querySelectorAll(".ph").forEach((p) => p.classList.toggle("on", p.id === id));

    // speed lines + floor indicator
    const speed = $("nl-speed");
    speed.innerHTML = "";
    for (let i = 0; i < 36; i++) {
      const l = document.createElement("i");
      l.style.cssText = `left:${Math.random() * 100}%;height:${18 + Math.random() * 40}vh;opacity:${0.25 + Math.random() * 0.7};--t:${0.22 + Math.random() * 0.3}s;--d:-${Math.random()}s`;
      speed.appendChild(l);
    }
    const floorEls = Array.from($("nl-floors").children);

    const onKey = (e: KeyboardEvent) => {
      if (["Escape", " ", "Enter"].includes(e.key)) {
        e.preventDefault();
        go();
      }
    };
    root.addEventListener("click", go);
    window.addEventListener("keydown", onKey);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      go();
    } else {
      // 0) the homepage switches off like a CRT, around the middle of the viewport
      if (target) {
        target.style.transformOrigin = `50% ${window.scrollY + window.innerHeight / 2}px`;
        target.classList.add("nerv-crtoff");
      }
      // 1) access request + MAGI vote (380 – 1500)
      at(380, () => {
        root.classList.add("on");
        show("nl-access");
        flicker();
      });
      ["nl-v1", "nl-v2", "nl-v3"].forEach((id, i) => {
        at(380, () => ($(id).className = "lbox vote think"));
        at(620 + i * 180, () => ($(id).className = "lbox vote yes"));
      });
      at(1220, () => $("nl-granted").classList.add("show"));
      // 2) descent (1550 – 2850): the depth counter eases down, the floor indicator follows
      at(1550, () => {
        show("nl-down");
        flicker();
        const start = performance.now(), dur = 1150, MAX = 1480;
        const tick = () => {
          if (!running) return;
          const k = Math.min(1, (performance.now() - start) / dur);
          const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          $("nl-depth").textContent = "-" + String(Math.round(MAX * e)).padStart(4, "0");
          const f = Math.min(FLOORS.length - 1, Math.floor(e * FLOORS.length));
          floorEls.forEach((el, i) => el.classList.toggle("cur", i === f));
          if (k < 1) requestAnimationFrame(tick);
        };
        tick();
      });
      at(2750, () => {
        $("nl-arrived").classList.add("on");
        flicker();
      });
      // 3) blackout, then the terminal powers on
      at(3150, () => root.classList.add("black"));
      at(3300, go);
    }

    return () => {
      running = false;
      timers.forEach(clearTimeout);
      root.removeEventListener("click", go);
      window.removeEventListener("keydown", onKey);
      target?.classList.remove("nerv-crtoff");
    };
  }, [active, router]);

  if (!active) return null;

  return (
    <div ref={rootRef} className={`nerv-launch ${evaFontVars}`} aria-hidden="true">
      <div className="grain" />

      <div className="ph" id="nl-access">
        <div className="lbox req">TERMINAL ACCESS REQUEST</div>
        <div className="jp">端末接続要求</div>
        <div className="who">GUEST <b>→</b> pete@central-dogma</div>
        <div className="votes">
          <div className="lbox vote" id="nl-v1">MELCHIOR · 1<span>承認</span></div>
          <div className="lbox vote" id="nl-v2">BALTHASAR · 2<span>承認</span></div>
          <div className="lbox vote" id="nl-v3">CASPER · 3<span>承認</span></div>
        </div>
        <div className="lbox green granted" id="nl-granted">ACCESS GRANTED — 承認</div>
      </div>

      <div className="ph" id="nl-down">
        <div className="speed" id="nl-speed" />
        <div className="stripes top" />
        <div className="stripes bot" />
        <div className="rail l" />
        <div className="rail r" />
        <div className="down">
          <div className="lbox">DESCENDING TO CENTRAL DOGMA</div>
          <div className="depth"><span id="nl-depth">-0000</span><small>M</small></div>
          <div className="jp">セントラルドグマへ降下中</div>
          <div className="floors" id="nl-floors">
            {FLOORS.map((f) => (
              <span key={f}>{f}</span>
            ))}
          </div>
        </div>
        <div className="arrived" id="nl-arrived"><div className="lbox green">ARRIVED — 到着</div></div>
      </div>

      <div className="skip">CLICK TO SKIP</div>
    </div>
  );
}
