"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import BlackjackGame from "@/components/BlackjackGame";

// The full-screen blackjack table: used by the animated overlay (homepage, terminal) and by /blackjack.
export default function BlackjackTable({ onClose, closeLabel = "✕" }: { onClose: () => void; closeLabel?: string }) {
  // bigger cards on bigger screens so the game fills the page (BlackjackGame shrinks them itself on phones)
  const [cardSize, setCardSize] = useState(104);
  useEffect(() => {
    const fit = () => setCardSize(window.innerWidth >= 1400 && window.innerHeight >= 850 ? 150 : window.innerWidth >= 1100 ? 128 : 104);
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  return (
    <div className="flex h-full w-full flex-col bg-background text-foreground font-nintendo-ds-bios">
      <header className="flex flex-none items-center gap-3 border-b-4 border-[#00a8ff] bg-card px-4 py-2 md:px-6">
        <Image src="/images/masterball-new.png" width={36} height={36} alt="" className="pixelated" />
        <div className="min-w-0">
          <h1 className="text-3xl leading-none md:text-4xl">Blackjack</h1>
          <p className="text-lg opacity-75">Master Ball Table</p>
        </div>
        <button
          onClick={onClose}
          className="ml-auto rounded-md bg-muted px-3 py-1 text-xl hover:bg-[#00a8ff] hover:text-white"
          aria-label="Close blackjack"
        >
          {closeLabel}
        </button>
      </header>
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="mx-auto max-w-6xl">
          <BlackjackGame cardSize={cardSize} />
        </div>
      </div>
    </div>
  );
}
