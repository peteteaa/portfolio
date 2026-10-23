"use client"

import Link from "next/link"
import Image from "next/image"
import PokemonAnimation from "@/components/PokemonAnimation"
import SkyBackground from "@/components/SkyBackground"
import HomeStatusBar from "@/components/home/HomeStatusBar"

const BADGES = [
  "1st Place Aparavi/Google/Toolhouse Hackathon (2025)",
  "2nd Place Windsurf track, GTC 2025",
  "3rd Place Tavus track, GTC 2025",
  "People's Choice, Compsigh Hackathon",
]

const EXPERIENCE = [
  {
    role: "Forward Deployed Engineer",
    org: "Toolhouse, San Francisco",
    when: "Oct 2026 – present",
  },
  {
    role: "Developer Advocate",
    org: "Toolhouse",
    when: "Jun 2025 – Oct 2026",
    points: [
      "Presented Toolhouse to 2,000+ developers at hackathons and university events, including UC Berkeley, MIT and Stanford",
      "Grew Toolhouse's Discord community 4x (1K → 4K members) in under a year through livestreams and workshops",
      "Built example applications showcasing Toolhouse integrations with modern AI workflows",
      "Wrote technical integration documentation and contributed to new product features",
      "Partnered with engineering teams to improve developer onboarding and API usability",
      "Supported developers through workshops, technical support and community engagement",
      "Pitched Toolhouse to investors and venture capitalists",
    ],
  },
  { role: "Diet Aide", org: "CreekView Retirement Community, Pleasanton", when: "2021 – 2023" },
]

const LEADERSHIP = ["AI Club", "Thai Student Union", "Muay Thai Club"]

const COMMUNITY = [
  { what: "Farmers Market volunteer, Dublin CA", when: "2020–2023" },
  { what: "Love of Ganesha volunteer, San Francisco", when: "2023–2024" },
]

const INTERESTS = [
  { href: "/interests/pokemon-cards", label: "Pokemon Cards", cls: "bg-[#4169e1] text-white" },
  { href: "/interests/bouldering", label: "Bouldering", cls: "bg-[#9932cc] text-white" },
  { href: "/interests/muay-thai", label: "Muay Thai", cls: "bg-[#ff6347] text-white" },
  { href: "/interests/ai-ml", label: "AI & ML", cls: "bg-[#ffd700] text-[#333]" },
  { href: "/interests/running", label: "Running", cls: "bg-[#4682b4] text-white" },
]

const card = "rounded-lg border border-border bg-card p-4"

export default function AboutClient() {

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground font-nintendo-ds-bios">
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
          <h1 className="text-4xl leading-none md:text-6xl">About</h1>
          <p className="mt-2 text-lg opacity-85 md:text-2xl">Trainer card &amp; story so far</p>
        </div>
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-6">
          <div className="mb-5">
            <Link href="/" className="inline-block rounded-md bg-muted px-3 py-1 text-xl hover:opacity-80">
              ◀ HOME
            </Link>
          </div>

          {/* Trainer card */}
          <section className="mb-6 overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b-4 border-[#00a8ff] bg-black/60 px-4 py-2 text-xl text-white">
              <span>TRAINER CARD</span>
              <Image src="/images/pokeball.png" width={28} height={28} alt="" className="h-7 w-7 object-contain pixelated" />
            </div>
            <div className="flex flex-col gap-5 p-4 md:flex-row md:p-6">
              <div className="mx-auto shrink-0 md:mx-0">
                <div className="h-40 w-40 overflow-hidden rounded-lg border-4 border-[#00a8ff] md:h-48 md:w-48">
                  <Image src="/images/pete.jpg" width={192} height={192} alt="Pete Thambundit" className="h-full w-full object-cover" priority />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-4xl leading-none">Pete Thambundit</h2>
                <p className="mt-2 text-2xl opacity-80">Developer Advocate · CS Student · Pokémon Trainer</p>
                <p className="mt-1 text-xl opacity-70">CS Major @USFCA</p>
                <p className="mt-4 text-xl leading-snug">
                  University of San Francisco — B.S. Computer Science, AI Concentration. Expected graduation December 2026.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xl">
                  <span className="rounded-md bg-muted px-3 py-1">Languages: English, Thai (fluent)</span>
                  <span className="rounded-md bg-muted px-3 py-1">Dean&apos;s List (2023–2024)</span>
                </div>
              </div>
            </div>
            <div className="border-t border-border bg-muted/40 p-4 md:px-6">
              <h3 className="mb-2 text-xl opacity-70">Badges</h3>
              <div className="flex flex-wrap gap-2">
                {BADGES.map((b) => (
                  <span key={b} className="rounded bg-[#ffcc00] px-2 py-1 text-lg leading-tight text-black shadow">
                    🏆 {b}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className={`${card} mb-6`}>
            <h2 className="mb-2 text-3xl">Background</h2>
            <p className="mb-2 text-xl leading-snug">
              I&apos;m a Computer Science major with a passion for creating engaging digital experiences. I enjoy going to hackathons, where I can make new friends, while also building cool projects!
            </p>
            <p className="text-xl leading-snug">
              Currently, I&apos;m focused on full-stack web development, UI/UX Design, and AI/ML as well as exploring the intersection of art and technology. When I&apos;m not coding, you can find me in the gym, practicing Muay Thai, collecting Pokemon cards, or Bouldering.
            </p>
          </section>

          <h2 className="mb-3 text-3xl">Experience</h2>
          <div className="mb-6 grid gap-4">
            {EXPERIENCE.map((e) => (
              <article key={e.role + e.when} className={card}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="text-2xl">{e.role}</h3>
                  <span className="text-lg opacity-70">{e.when}</span>
                </div>
                <p className="text-xl opacity-80">{e.org}</p>
                {e.points && (
                  <ul className="mt-3 space-y-1.5 text-xl leading-snug">
                    {e.points.map((p) => (
                      <li key={p} className="flex gap-2">
                        <span className="text-[#00a8ff]">▶</span>
                        <span className="min-w-0">{p}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <section className={card}>
              <h2 className="mb-2 text-3xl">Leadership <span className="text-xl opacity-70">2026</span></h2>
              <p className="mb-2 text-xl">President of</p>
              <div className="flex flex-wrap gap-2">
                {LEADERSHIP.map((l) => (
                  <span key={l} className="rounded bg-muted px-2 py-0.5 text-xl">{l}</span>
                ))}
              </div>
            </section>
            <section className={card}>
              <h2 className="mb-2 text-3xl">Community</h2>
              <ul className="space-y-1.5 text-xl leading-snug">
                {COMMUNITY.map((c) => (
                  <li key={c.what}>
                    {c.what} <span className="opacity-70">({c.when})</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className={card}>
            <h2 className="mb-3 text-3xl">Interests &amp; Hobbies</h2>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => (
                <Link
                  key={i.href}
                  href={i.href}
                  className={`inline-block rounded-md border-2 border-[#333] px-3 py-1 text-xl hover:opacity-85 ${i.cls}`}
                >
                  {i.label}
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
