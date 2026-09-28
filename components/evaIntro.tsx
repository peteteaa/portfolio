"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
const bootSequenceGif = [
  "/images/evawave.gif",
];
export default function EvangelionBoot() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fading after 4 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 4000);

    // Remove completely after 5 seconds
    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, 5000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
  <div
      className={`fixed inset-0 z-[9999] bg-black transition-opacity duration-1000 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {bootSequenceGif.map((gif, index) => (
  <Image
    
  key={index}
    src={gif}
    alt={`Boot sequence ${index + 1}`}
    fill
    unoptimized
    className="object-cover"
  />
))}
    </div>
  );
}