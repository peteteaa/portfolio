"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import TextType from "@/components/TextType";
import SkyBackground from "@/components/SkyBackground";
import PokemonAnimation from "@/components/PokemonAnimation";
import RetroChatroom from "@/components/RetroChatroom";
import EvangelionBoot, { replayEvaIntro } from "@/components/evaIntro";
import TerminalLaunch, { CRT_TARGET_ATTR, launchTerminal } from "@/components/nerv-terminal/TerminalLaunch";
import AppGrid from "@/components/home/AppGrid";
import AppBanner from "@/components/home/AppBanner";
import HomeStatusBar from "@/components/home/HomeStatusBar";
import BlackjackOverlay from "@/components/blackjack/BlackjackOverlay";
import type { HomeApp } from "@/components/home/apps";
import { openPlazaMaker } from "@/components/plaza/mine";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isChatroomOpen, setIsChatroomOpen] = useState(false);
  const [isBlackjackOpen, setIsBlackjackOpen] = useState(false);
  // the HOME menu tile whose banner is on the top screen
  const [selectedApp, setSelectedApp] = useState<HomeApp | null>(null);
  const [bannerTouch, setBannerTouch] = useState(false);
  const { theme, setTheme } = useTheme();
  const heroTitle = "Pete Thambundit's Portfolio V1.0.0";
  const heroSubtitle = "Developer Advocate, CS Student & Pokemon Trainer";

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
    <EvangelionBoot />
    <TerminalLaunch />
    
    <div {...{ [CRT_TARGET_ATTR]: "" }} className="flex min-h-screen flex-col bg-background text-foreground font-nintendo-ds-bios text-3xl md:text-6xl leading-relaxed">
      {/* 3DS Top Screen */}
      <div
        className="relative h-[35vh] w-full overflow-hidden border-b-4 border-[#333333]"
      >
        <SkyBackground day="beach" />
        <PokemonAnimation speed={200} />

        {/* Selected app banner (3DS HOME menu) */}
        {selectedApp && <AppBanner key={selectedApp.id} app={selectedApp} touch={bannerTouch} />}

        {/* Hero Content: hidden (not unmounted, so the typing doesn't restart) while a banner shows */}
        <div className={`absolute bottom-10 left-0 right-0 p-4 text-center ${selectedApp ? "invisible" : ""}`}>
          <TextType
            as="h1"
            text={heroTitle}
            loop={false}
            className="text-4xl md:text-6xl font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-nintendo-ds-bios"
            cursorClassName="text-white"
            hideCursorWhileTyping
          />
            <div className="h-2 "> {'\n'}</div>

          <TextType
            as="p"
            text={heroSubtitle}
            initialDelay={4000}
            loop={false}
            className="mt-2 text-xl md:text-2xl text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-nintendo-ds-bios"
          />
        </div>
      </div>

      {/* 3DS Bottom Screen */}
      <div className="relative flex flex-1 flex-col bg-background">
        <HomeStatusBar />
        {/* Main Content Area */}
        <div className="flex-1 p-4">
          <div className="mb-6 rounded-lg border border-border bg-card p-4 backdrop-blur-xl">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground font-nintendo-ds-bios">
                Welcome to my Portfolio!
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
            <p className="text-base md:text-2xl text-foreground font-nintendo-ds-bios">
              I'm a Computer Science major specializing in web development. Feel free to explore my
              projects and skills using the navigation below.
            </p>
          </div>

          {/* HOME menu: every tile opens something; Interests is a folder */}
          <AppGrid
            selectedId={selectedApp?.id ?? null}
            onSelect={(app, touch) => {
              setSelectedApp(app);
              setBannerTouch(touch);
            }}
            onAction={(action) => {
              if (action === "terminal") launchTerminal();
              else if (action === "chat") setIsChatroomOpen(true);
              else if (action === "blackjack") setIsBlackjackOpen(true);
              else if (action === "intro") replayEvaIntro();
              else if (action === "plaza") openPlazaMaker();
            }}
            disabled={isChatroomOpen || isBlackjackOpen}
          />
        </div>

        {/* Bottom Navigation Bar */}
        <div className="relative border-t-2 border-[#333]">
          {/* Main Navigation with Pokeball */}
          <div className="flex items-center justify-between bg-muted p-2">
            {/* the old shortcuts (intro, chat, blackjack, terminal) are tiles in the HOME menu now */}
            <div className="flex-1" />

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
                <span className="mt-1 text-lg text-foreground">GitHub</span>
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
                <span className="mt-1 text-lg text-foreground">LinkedIn</span>
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
                <span className="mt-1 text-xl">Instagram</span>
              </Link>
            </div>

            <div className="flex-1" />
          </div>

          {/* Bottom Status Bar - Empty as requested */}
          <div className="border-t border-border bg-background p-2 text-center text-xl">
            <p></p>
          </div>
        </div>
      </div>
      <RetroChatroom isOpen={isChatroomOpen} onClose={() => setIsChatroomOpen(false)} />
      <BlackjackOverlay isOpen={isBlackjackOpen} onClose={() => setIsBlackjackOpen(false)} />
    </div>
    </>
  );
}
