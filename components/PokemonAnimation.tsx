"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// List of Pokemon run GIFs
const pokemonRunGifs = [
  "/images/jolteon-run.gif",
  "/images/umbreon-run.gif",
  "/images/eevee-run.gif",
  "/images/leafeon-run.gif",
  "/images/spoink-run.gif",
];

// The second Pokemon trails the first by GAP px, and no sprite is wider than SPRITE px, so a run
// is over once the leader is this far past the right edge (the pokemon-run keyframes in globals.css).
const SPRITE = 160;
const GAP = 150;

type Run = { id: number; first: string; second: string | null; seconds: number };

/**
 * Each run is one pass of a CSS animation across the top screen, so React only renders when a
 * new run starts, not on every frame. When it ends, a new key restarts it with fresh Pokemon.
 */
export default function PokemonAnimation({ speed = 100 }: { speed?: number }) {
  const track = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState<Run | null>(null);

  const nextRun = (id: number, first?: string): Run => {
    const randomIndex = first ? pokemonRunGifs.indexOf(first) : Math.floor(Math.random() * pokemonRunGifs.length);

    // 30% chance to show a second Pokemon, never the same one
    let second: string | null = null;
    if (!first && Math.random() < 0.3) {
      let secondIndex;
      do {
        secondIndex = Math.floor(Math.random() * pokemonRunGifs.length);
      } while (secondIndex === randomIndex);
      second = pokemonRunGifs[secondIndex];
    }

    // measured per run so a resized window keeps the same pace
    const distance = (track.current?.offsetWidth ?? window.innerWidth) + SPRITE + GAP;
    return { id, first: pokemonRunGifs[randomIndex], second, seconds: distance / speed };
  };

  // started after mount: the distance needs the real width, and the server render stays empty
  useEffect(() => setRun(nextRun(0, "/images/jolteon-run.gif")), []);

  return (
    <div ref={track} aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-20 motion-reduce:hidden">
      {run && (
        <div
          key={run.id}
          className="absolute inset-x-0 bottom-0"
          style={{ animation: `pokemon-run ${run.seconds}s linear forwards` }}
          onAnimationEnd={() => setRun(nextRun(run.id + 1))}
        >
          <div className="absolute bottom-0 right-full z-10 h-24 w-24 md:h-32 md:w-32 lg:h-40 lg:w-40">
            <Image src={run.first} alt="" width={SPRITE} height={SPRITE} className="h-full w-full object-contain pixelated" />
          </div>
          {run.second && (
            <div className="absolute bottom-0 h-24 w-24 md:h-32 md:w-32 lg:h-40 lg:w-40" style={{ right: `calc(100% + ${GAP}px)` }}>
              <Image src={run.second} alt="" width={SPRITE} height={SPRITE} className="h-full w-full object-contain pixelated" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
