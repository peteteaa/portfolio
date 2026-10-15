"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { PokeballFlash, backdropClass, usePokeballOpen, windowClass } from "@/components/pokeball/usePokeballOpen";
import BlackjackTable from "./BlackjackTable";

// Blackjack over the whole page, opened with the same throw as the chatroom but with a Master Ball. Esc or ✕ closes it.
export default function BlackjackOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { phase, ballThrow, close } = usePokeballOpen(isOpen, onClose, "/images/masterball-new.png");

  useEffect(() => {
    if (phase !== "open") return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    // the table owns the screen: no scrolling the page behind it
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  });

  if (!isOpen || phase === "idle") return null;
  if (phase === "throw") return ballThrow;

  return createPortal(
    <div className={`fixed inset-0 ${backdropClass(phase)}`} style={{ zIndex: 99998, backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
      <div className={`relative h-full w-full overflow-hidden ${windowClass(phase)}`} role="dialog" aria-modal="true" aria-label="Blackjack">
        {phase === "open" && <PokeballFlash />}
        <BlackjackTable onClose={close} />
      </div>
    </div>,
    document.body
  );
}
