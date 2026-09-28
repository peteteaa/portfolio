"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import PokemonAnimation from "@/components/PokemonAnimation";
import BlackjackGame from "@/components/BlackjackGame";

export default function BlackjackPage() {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const { theme } = useTheme();

  useEffect(() => {
    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const updateDateTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    setCurrentTime(`${hours}:${minutes}`);

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    setCurrentDate(`${now.getMonth() + 1}/${now.getDate()} (${days[now.getDay()]})`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-retro">
      {/* 3DS Top Screen */}
      <div className="relative h-[35vh] w-full overflow-hidden border-b-4 border-[#333333] dark:border-[#333333] light:border-[#87ceeb]">
        <div className="absolute inset-0">
          <Image
            src={theme === "dark" ? "/images/night.gif" : "/images/cloud.gif"}
            alt="Sky Background"
            width={800}
            height={400}
            className="h-full w-full object-cover pixelated"
            priority
          />
          <PokemonAnimation />
        </div>

        {/* Status Bar */}
        <div className="absolute left-0 right-0 top-0 flex items-center justify-between bg-[#0066cc]/80 p-2 text-xs text-white dark:bg-[#0066cc]/80 light:bg-[#87ceeb]/80">
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 bg-[#33ccff] dark:bg-[#33ccff] light:bg-[#4169e1]"></div>
            <span>Game Corner</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⭐ 800</span>
            <span>{currentDate}</span>
            <span>{currentTime}</span>
            <div className="h-4 w-8 bg-[#ffcc00]"></div>
          </div>
        </div>

        {/* Page Title */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-black/50 p-4">
          <Image
            src="/images/masterball-new.png"
            width={28}
            height={28}
            alt=""
            className="pixelated"
          />
          <h1 className="text-xl font-bold text-white">Blackjack</h1>
        </div>
      </div>

      {/* 3DS Bottom Screen */}
      <div className="relative flex flex-1 flex-col bg-background">
        <div className="flex-1 overflow-auto p-4">
          <div className="mb-4 flex items-center">
            <Link href="/">
              <Button variant="ghost" size="icon" className="mr-2 h-8 w-8 rounded-full bg-muted">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h2 className="text-lg font-bold text-foreground">Master Ball Table</h2>
          </div>

          <BlackjackGame />
        </div>

        <div className="border-t border-border bg-background p-2 text-center text-sm">
          <p></p>
        </div>
      </div>
    </div>
  );
}
