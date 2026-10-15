"use client";

import Image from "next/image";
import type { HomeApp } from "./apps";

// The selected app's banner on the top screen, like the 3DS HOME menu.
export default function AppBanner({ app, touch }: { app: HomeApp; touch: boolean }) {
  return (
    <div
      key={app.id}
      className="home-banner absolute inset-x-0 bottom-0 z-30 flex items-center gap-4 border-t-4 border-[#00a8ff] bg-black/65 px-4 py-3 text-white backdrop-blur-sm md:gap-6 md:px-8 md:py-5"
    >
      <div className="home-banner-sprite flex h-20 w-20 flex-none items-center justify-center rounded-lg bg-white/10 md:h-28 md:w-28">
        {app.img ? (
          <Image src={app.img} width={96} height={96} alt="" className="h-16 w-16 object-contain pixelated md:h-24 md:w-24" />
        ) : (
          <span className="text-5xl">◀</span>
        )}
      </div>
      <div className="min-w-0">
        <div className="text-4xl leading-none md:text-6xl">{app.title}</div>
        <div className="mt-2 truncate text-lg leading-tight opacity-80 md:text-2xl">{app.tagline}</div>
      </div>
      <div className="ml-auto hidden whitespace-nowrap text-lg opacity-80 sm:block md:text-2xl">
        <span className="mr-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-base text-black md:h-8 md:w-8">A</span>
        {touch ? "Tap again" : "Open"}
      </div>
    </div>
  );
}
