"use client";

import { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import TextType from "@/components/TextType";
import RetroChatroom from "@/components/RetroChatroom";


export default function Home() {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [jolteonPosition, setJolteonPosition] = useState(-100); // Start off-screen
  const [pokemonGif, setPokemonGif] = useState("/images/jolteon-run.gif");
  const [secondPokemonGif, setSecondPokemonGif] = useState<string | null>(null);
  const [showSecondPokemon, setShowSecondPokemon] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isChatroomOpen, setIsChatroomOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const skyContainerRef = useRef<HTMLDivElement>(null);
  const heroTitle = "Pete Thambundit's Portfolio V0.1.3";
  const heroSubtitle = "Developer Advocate, CS Student & Pokemon Trainer";

  // List of Pokemon run GIFs
  const pokemonRunGifs = [
    "/images/jolteon-run.gif",
    "/images/umbreon-run.gif",
    "/images/eevee-run.gif",
    "/images/leafeon-run.gif",
    "/images/spoink-run.gif",
  ];

  const updateDateTime = () => {
    const now = new Date();
    setCurrentDate(now.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
    // Format time as HH:MM
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    setCurrentTime(`${hours}:${minutes}`);
  };

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Set initial time and date
    updateDateTime();

    // Update time every minute
    const interval = setInterval(updateDateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  // Pokemon animation effect
  useEffect(() => {
    // Only run animation on client-side
    if (!mounted) return;

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

        // Move right by 2 pixels
        return prevPos + 2;
      });
    };

    // Move every 10ms
    const animationInterval = setInterval(movePokemon, 10);

    // Cleanup interval on component unmount
    return () => clearInterval(animationInterval);
  }, [mounted, pokemonRunGifs]);

  if (!mounted) return null;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
<div className="flex min-h-screen flex-col bg-background text-foreground font-retro cursor-custom">
{/* 3DS Top Screen */}
      <div
        ref={skyContainerRef}
        className="relative h-[35vh] w-full overflow-hidden border-b-4 border-[#333333] dark:border-[#333333] light:border-[#87ceeb]"
      >
        <div className="absolute inset-0">
          <Image
            src={theme === "dark" ? "/images/night.gif" : "/images/cloud.gif"}
            alt="Sky Background"
            width={100}
            height={100}
            className="h-full w-full object-cover pixelated"
            priority
          />
        </div>

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

        {/* Hero Content */}
        <div className="absolute bottom-10 left-0 right-0 p-4 text-center">
          <TextType
            as="h1"
            text={heroTitle}
            loop={false}


            className="text-2xl font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
            cursorClassName="text-white"
            hideCursorWhileTyping
          />
            <div className="h-2 "> {'\n'}</div>

          <TextType
            as="p"
            text={heroSubtitle}


            initialDelay={4000}
            loop={false}
            className="mt-2 text-sm text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
          />
        </div>
      </div>

      {/* 3DS Bottom Screen */}
      <div className="relative flex flex-1 flex-col bg-background">
        {/* Main Content Area */}
        <div className="flex-1 p-4">
          <div className="mb-6 rounded-lg border border-border bg-card p-4 backdrop-blur-sm">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                Welcome to my Portfolio
              </h2>
              <Button
                onClick={toggleTheme}
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full bg-muted"
              >
                {theme === "dark" ? (
                  <Image
                    src="/images/lunatone.png"
                    width={36}
                    height={36}
                    alt="Dark Mode"
                    className="pixelated"
                  />
                ) : (
                  <Image
                    src="/images/solrock.png"
                    width={36}
                    height={36}
                    alt="Light Mode"
                    className="pixelated"
                  />
                )}
              </Button>
            </div>
            <p className="text-sm text-foreground">
              I'm a Computer Science major specializing in web development. Explore my
              projects and skills using the navigation below.
            </p>
          </div>

          {/* Folder Grid with Navigation Buttons */}
          <div className="grid grid-cols-5 gap-10">
            <Link href="/" className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-[#333]/20 dark:bg-[#333]/20 light:bg-[#333]/20 folder-select">
                <Image
                  src="/images/lucario.png"
                  width={48}
                  height={48}
                  alt="Home"
                  className="pixelated"
                />
              </div>
              <span className="mt-1 text-xs text-foreground">
                Home
              </span>
            </Link>

            <Link href="/projects" className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-[#333]/20 dark:bg-[#333]/20 light:bg-[#333]/20 folder-select">
                <Image
                  src="/images/umbreon.png"
                  width={32}
                  height={32}
                  alt="Projects"
                  className="pixelated"
                />
              </div>
              <span className="mt-1 text-xs text-foreground">
                Projects
              </span>
            </Link>

            <Link href="/skills" className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-[#333]/20 dark:bg-[#333]/20 light:bg-[#333]/20 folder-select">
                <Image
                  src="/images/greninja.png"
                  width={48}
                  height={48}
                  alt="Skills"
                  className="pixelated"
                />
              </div>
              <span className="mt-1 text-xs text-foreground">
                Skills
              </span>
            </Link>

            <Link href="/contact" className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-[#333]/20 dark:bg-[#333]/20 light:bg-[#333]/20 folder-select">
                <Image
                  src="/images/beldum.png"
                  width={48}
                  height={48}
                  alt="Contact"
                  className="pixelated"
                />
              </div>
              <span className="mt-1 text-xs text-foreground">
                Contact
              </span>
            </Link>

            <Link href="/about" className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-[#333]/20 dark:bg-[#333]/20 light:bg-[#333]/20 folder-select">
                <Image
                  src="/images/machamp.png"
                  width={32}
                  height={32}
                  alt="About"
                  className="pixelated"
                />
              </div>
              <span className="mt-1 text-xs text-foreground">
                About
              </span>
            </Link>

            <Link href="" className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-[#333]/20 dark:bg-[#333]/20 light:bg-[#333]/20 folder-select">
                <Image
                  src="/images/spheal.png"
                  width={32}
                  height={32}
                  alt=""
                  className="pixelated"
                />
              </div>
              <span className="mt-1 text-xs text-foreground"></span>
            </Link>

            <Link href="/about" className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-[#333]/20 dark:bg-[#333]/20 light:bg-[#333]/20 folder-select">
                <Image
                  src="/images/whooper.png"
                  width={32}
                  height={32}
                  alt=""
                  className="pixelated"
                />
              </div>
              <span className="mt-1 text-xs text-foreground"></span>
            </Link>

            <Link href="/about" className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-[#333]/20 dark:bg-[#333]/20 light:bg-[#333]/10 folder-select">
                <Image
                  src="/images/aurorus.png"
                  width={32}
                  height={32}
                  alt=""
                  className="pixelated"
                />
              </div>
              <span className="mt-1 text-xs text-foreground"></span>
            </Link>
            <Link href="/" className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-[#333]/20 dark:bg-[#333]/20 light:bg-[#333]/20 folder-select">
                <Image
                  src="/images/metagross.png"
                  width={48}
                  height={48}
                  alt=""
                  className="pixelated"
                />
              </div>
            </Link>
            {Array.from({ length: 0 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-md bg-[#333]/20 dark:bg-[#333]/20 light:bg-[#333]/10 folder-select"></div>
                <span className="mt-1 text-xs opacity-0">Empty</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation Bar */}
        <div className="relative border-t-2 border-[#333] dark:border-[#333] light:border-[#4169e1]">
          {/* Main Navigation with Pokeball */}
          <div className="flex items-center justify-between bg-grey-400 p-2 bg-grey-200 light:bg-grey-">
            <div className="flex items-center gap-2">
              <div className="h-12 w-12 rounded-md bg-white/20"></div>
              
              <button
                onClick={() => setIsChatroomOpen(true)}
                className="flex h-12 w-12 items-center justify-center rounded-md bg-white p-1 hover:opacity-80 transition-opacity cursor-pointer"
                aria-label="Open Chatroom"
              >
                <Image
                  src="/images/pokeball.png"
                  width={40}
                  height={40}
                  alt="Pokeball"
                  className="pixelated"
                />
              </button>

              <Link
                href="/projects"
                className="flex h-12 w-12 items-center justify-center rounded-md bg-white p-1"
              >
                <Image
                  src="/images/masterball-new.png"
                  width={40}
                  height={40}
                  alt="Projects"
                  className="pixelated"
                />
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="https://github.com/peteteaa"
                target="_blank"
                className="flex flex-col items-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-transparent">
                  <Image
                    src="/images/github-icon.png"
                    width={24}
                    height={24}
                    alt="GitHub"
                    className="pixelated"
                  />
                </div>
                <span className="mt-1 text-xs">GitHub</span>
              </Link>
              <Link
                href="https://www.linkedin.com/in/pete-thambundit-91b740324/"
                target="_blank"
                className="flex flex-col items-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-transparent">
                  <Image
                    src="/images/linkedin-icon.png"
                    width={24}
                    height={24}
                    alt="LinkedIn"
                    className="pixelated"
                  />
                </div>
                <span className="mt-1 text-xs">LinkedIn</span>
              </Link>
              <Link
                href="mailto:pthambundit@icloud.com"
                className="flex flex-col items-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-transparent">
                  <Image
                    src="/images/mail-icon.png"
                    width={24}
                    height={24}
                    alt="Email"
                    className="pixelated"
                  />
                </div>
                <span className="mt-1 text-xs">Email</span>
              </Link>
              <Link
                href="https://www.instagram.com/pete_teaa/"
                target="_blank"
                className="flex flex-col items-center"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-transparent">
                  <Image
                    src="/images/instagram-icon.png"
                    width={24}
                    height={24}
                    alt="Instagram"
                    className="pixelated"
                  />
                </div>
                <span className="mt-1 text-xs">Instagram</span>
              </Link>
            </div>

            <div>
            </div>
          </div>

          {/* Bottom Status Bar - Empty as requested */}
          <div className="border-t border-border bg-background p-2 text-center text-sm">
            <p></p>
          </div>
        </div>
      </div>
      <RetroChatroom isOpen={isChatroomOpen} onClose={() => setIsChatroomOpen(false)} />
    </div>
  );
}