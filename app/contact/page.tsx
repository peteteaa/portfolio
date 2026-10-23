"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import PokemonAnimation from "@/components/PokemonAnimation"
import SkyBackground from "@/components/SkyBackground"
import HomeStatusBar from "@/components/home/HomeStatusBar"

const EMAIL = "pthambundit[at]icloud.com"

const CONTACTS = [
  {
    label: "Email",
    handle: EMAIL,
    href: `mailto:${EMAIL}`,
    icon: "/images/mail-icon.png",
    external: false,
  },
  {
    label: "GitHub",
    handle: "github.com/peteteaa",
    href: "https://github.com/peteteaa",
    icon: "/images/github-icon.png",
    external: true,
  },
  {
    label: "LinkedIn",
    handle: "linkedin.com/in/pete-thambundit",
    href: "https://www.linkedin.com/in/pete-thambundit-91b740324/",
    icon: "/images/linkedin-icon.png",
    external: true,
  },
  {
    label: "Instagram",
    handle: "instagram.com/pete_teaa",
    href: "https://www.instagram.com/pete_teaa/",
    icon: "/images/instagram-icon.png",
    external: true,
  },
]

export default function ContactPage() {
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch (error) {
      console.error("Copy failed:", error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-nintendo-ds-bios">
      {/* 3DS top screen */}
      <div className="relative h-[35vh] min-h-[220px] w-full overflow-hidden border-b-4 border-[#333333]">
        <div className="absolute inset-0">
          <SkyBackground day="cloud" />
          <PokemonAnimation />
        </div>
      </div>

      {/* 3DS bottom screen */}
      <div className="flex flex-1 flex-col">
        <HomeStatusBar />
        {/* page title (kept off the top screen so the Pokémon run in the open) */}
        <div className="border-b-4 border-[#00a8ff] bg-card px-4 py-3 md:px-8 md:py-4">
          <h1 className="text-4xl leading-none md:text-6xl">Contact</h1>
          <p className="mt-2 text-lg opacity-85 md:text-2xl">Add me to your friend list</p>
        </div>
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <Link href="/" className="rounded-md bg-muted px-3 py-1 text-xl hover:opacity-80">
              ◀ HOME
            </Link>
            <span className="min-w-0 max-w-full rounded-md bg-card px-3 py-1 text-xl">
              Developer Advocate → Forward Deployed Engineer at Toolhouse, San Francisco
            </span>
          </div>

          <h2 className="mb-3 text-3xl">Friend list</h2>
          <div className="mb-3 grid gap-4 sm:grid-cols-2">
            {CONTACTS.map((c) => (
              <a
                key={c.label}
                href={c.href}
                {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-[#00a8ff]"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Image src={c.icon} width={40} height={40} alt="" className="h-10 w-10 object-contain pixelated" />
                </div>
                <div className="min-w-0 flex-1 basis-40">
                  <p className="text-3xl leading-none">{c.label}</p>
                  <p className="mt-1 break-all text-xl opacity-75">{c.handle}</p>
                </div>
                <span className="ml-auto shrink-0 rounded-md bg-[#00a8ff] px-3 py-1 text-xl text-white group-hover:opacity-85">
                  Open ↗
                </span>
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={copyEmail}
              className="rounded-md bg-[#ffcc00] px-3 py-1 text-xl text-black hover:opacity-85"
            >
              Copy email
            </button>
            <span aria-live="polite" className="text-xl text-[#00a8ff]">
              {copied ? "Copied!" : ""}
            </span>
          </div>

        </main>
      </div>
    </div>
  )
}
