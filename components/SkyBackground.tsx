"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

// The animated sky behind each page's top screen. These used to be GIFs of up to 17 MB; each scene
// is now a small MP4 plus a still poster. Both posters are in the server markup and CSS shows the one
// for the current theme, so the first paint is right before React knows the theme. The video for the
// active theme loads after mount, and not at all when the visitor prefers reduced motion.
export default function SkyBackground({ day }: { day: "beach" | "cloud" }) {
  const { resolvedTheme } = useTheme();
  const [animate, setAnimate] = useState(false);
  useEffect(() => setAnimate(!window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);

  const scene = resolvedTheme === "dark" ? "night" : day;

  return (
    <div className="absolute inset-0">
      <Image src={`/images/${day}-poster.webp`} alt="" fill sizes="100vw" priority className="object-cover pixelated dark:hidden" />
      <Image src="/images/night-poster.webp" alt="" fill sizes="100vw" priority className="hidden object-cover pixelated dark:block" />
      {animate && resolvedTheme && (
        <video
          key={scene}
          src={`/images/${scene}.mp4`}
          poster={`/images/${scene}-poster.webp`}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover pixelated"
        />
      )}
    </div>
  );
}
