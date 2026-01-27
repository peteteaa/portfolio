"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// List of Pokemon run GIFs
const pokemonRunGifs = [
  "/images/jolteon-run.gif",
  "/images/umbreon-run.gif",
  "/images/eevee-run.gif",
  "/images/leafeon-run.gif",
  "/images/spoink-run.gif",
];

export default function PokemonAnimation() {
  const [jolteonPosition, setJolteonPosition] = useState(-100); // Start off-screen
  const [pokemonGif, setPokemonGif] = useState("/images/jolteon-run.gif");
  const [secondPokemonGif, setSecondPokemonGif] = useState<string | null>(null);
  const [showSecondPokemon, setShowSecondPokemon] = useState(false);
  const [isClient, setIsClient] = useState(false); // Track if we're on client-side

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Pokemon animation effect
  useEffect(() => {
    // Only run animation on client-side
    if (!isClient) return;

    // Animation function
    const movePokemon = () => {
      setJolteonPosition((prevPos) => {
        // Get window width safely
        const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1000;

        // If Pokemon has moved off the right edge of the screen
        if (prevPos > windowWidth) {
          // When reaching the edge, randomly change the Pokemon
          const randomIndex = Math.floor(Math.random() * pokemonRunGifs.length);
          setPokemonGif(pokemonRunGifs[randomIndex]);

          // 30% chance to show a second Pokemon
          const showSecond = Math.random() < 0.3;
          setShowSecondPokemon(showSecond);

          if (showSecond) {
            // Pick a different Pokemon for the second one
            let secondIndex;
            do {
              secondIndex = Math.floor(Math.random() * pokemonRunGifs.length);
            } while (secondIndex === randomIndex);

            setSecondPokemonGif(pokemonRunGifs[secondIndex]);
          } else {
            setSecondPokemonGif(null);
          }

          // Reset to left edge
          return -100;
        }

        // Move right by 1 pixel
        return prevPos + 2;
      });
    };

    // Move every 20ms (slower animation)
    const animationInterval = setInterval(movePokemon, 20);

    // Cleanup interval on component unmount
    return () => clearInterval(animationInterval);
  }, [isClient]);

  return (
    <>
      {/* Primary Pokemon GIF */}
      <div
        className="absolute z-20 h-24 w-24 md:h-32 md:w-32 lg:h-40 lg:w-40"
        style={{
          left: `${jolteonPosition}px`,
          bottom: "0",
          transition: "none",
        }}
      >
        <Image
          src={pokemonGif}
          alt="Pokemon"
          width={160}
          height={160}
          className="h-full w-full object-contain pixelated"
        />
      </div>

      {/* Second Pokemon GIF (shown conditionally) */}
      {showSecondPokemon && secondPokemonGif && (
        <div
          className="absolute z-10 h-24 w-24 md:h-32 md:w-32 lg:h-40 lg:w-40"
          style={{
            left: `${jolteonPosition - 150}px`,
            bottom: "0",
            transition: "none",
          }}
        >
          <Image
            src={secondPokemonGif}
            alt="Second Pokemon"
            width={160}
            height={160}
            className="h-full w-full object-contain pixelated"
          />
        </div>
      )}
    </>
  );
}
