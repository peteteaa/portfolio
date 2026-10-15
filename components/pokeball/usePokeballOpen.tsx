"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./pokeball.css";

// Opening animation shared by the chatroom and the blackjack table: a Pokéball is thrown from wherever
// the visitor last clicked, bursts open in a white flash, and the window springs out of it.
// Closing shrinks the window back in.
//
//   const { phase, ballThrow, close } = usePokeballOpen(isOpen, onClose, "/images/masterball-new.png")  // ball is optional
//   if (phase === "throw") return ballThrow        // just the ball in flight
//   ...render the window with className={windowClass(phase)}, a <PokeballFlash /> while "open", and call close()

export type PokeballPhase = "idle" | "throw" | "open" | "closing";

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// remember the last click on the page, so the ball is thrown from the thing that opened the window
let lastPointer: { x: number; y: number } | null = null;
if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", (e) => (lastPointer = { x: e.clientX, y: e.clientY }), true);
}

export function usePokeballOpen(isOpen: boolean, onClose: () => void, ball = "/images/pokeball.png") {
  const [phase, setPhase] = useState<PokeballPhase>("idle");
  const ballRef = useRef<HTMLImageElement>(null);

  // keep the phase in step with isOpen (set during render so the window never flashes up before the throw)
  if (isOpen && phase === "idle") setPhase(reducedMotion() ? "open" : "throw");
  if (!isOpen && phase !== "idle") setPhase("idle");

  useEffect(() => {
    if (phase !== "throw" || !ballRef.current) return;
    const from = lastPointer ?? { x: window.innerWidth / 2, y: window.innerHeight - 60 };
    const to = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const at = (x: number, y: number, deg: number) => `translate(${x - 24}px, ${y - 24}px) rotate(${deg}deg)`;
    const peak = Math.min(from.y, to.y) - 140;
    const anim = ballRef.current.animate(
      [
        { transform: at(from.x, from.y, 0) },
        { transform: at((from.x + to.x) / 2, peak, 360), offset: 0.55 },
        { transform: at(to.x, to.y, 720) },
      ],
      { duration: 420, easing: "cubic-bezier(.3,.1,.4,1)", fill: "forwards" }
    );
    anim.onfinish = () => setPhase("open");
    return () => anim.cancel();
  }, [phase]);

  const close = () => {
    if (phase === "closing") return;
    if (reducedMotion()) return onClose();
    setPhase("closing");
    setTimeout(onClose, 180);
  };

  const ballThrow =
    phase === "throw" && typeof document !== "undefined"
      ? createPortal(
          <div className="pokeball-backdrop fixed inset-0" style={{ zIndex: 99999, backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={ballRef} src={ball} alt="" className="pokeball-ball" style={{ transform: "translate(-200px, -200px)" }} />
          </div>,
          document.body
        )
      : null;

  return { phase, ballThrow, close };
}

export const windowClass = (phase: PokeballPhase) => (phase === "closing" ? "pokeball-window-out" : "pokeball-window-in");
export const backdropClass = (phase: PokeballPhase) => (phase === "closing" ? "pokeball-backdrop-out" : "");

// the white burst as the ball opens; render inside the window while phase === "open"
export function PokeballFlash() {
  return <div className="pokeball-flash" aria-hidden="true" />;
}
