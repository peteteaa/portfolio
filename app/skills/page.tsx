"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import PokemonAnimation from "@/components/PokemonAnimation"
import HomeStatusBar from "@/components/home/HomeStatusBar"
import { CATEGORIES, SKILLS, SPOKEN, evidenceFor, type Category, type Skill } from "@/components/skills/data"
import "@/components/home/home.css"

// Skills as HOME-menu tiles: pick one (hover, focus or tap) to see where it's been used.

export default function SkillsPage() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [tab, setTab] = useState<Category | "All">("All")
  const [selected, setSelected] = useState<Skill>(SKILLS[0])
  useEffect(() => setMounted(true), [])

  const shown = tab === "All" ? SKILLS : SKILLS.filter((s) => s.category === tab)
  const counts = useMemo(() => Object.fromEntries(SKILLS.map((s) => [s.name, evidenceFor(s.name).length])), [])

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-nintendo-ds-bios">
      {/* 3DS top screen */}
      <div className="relative h-[35vh] min-h-[220px] w-full overflow-hidden border-b-4 border-[#333333]">
        <div className="absolute inset-0">
          {mounted && (
            <Image
              src={theme === "dark" ? "/images/night.gif" : "/images/cloud.gif"}
              alt=""
              width={800}
              height={400}
              className="h-full w-full object-cover pixelated"
              priority
            />
          )}
          <PokemonAnimation />
        </div>
      </div>

      {/* 3DS bottom screen */}
      <div className="flex flex-1 flex-col">
        <HomeStatusBar />
        <div className="border-b-4 border-[#00a8ff] bg-card px-4 py-3 md:px-8 md:py-4">
          <h1 className="text-4xl leading-none md:text-6xl">Skills</h1>
          <p className="mt-2 text-lg opacity-85 md:text-2xl">Pick a skill to see where I&apos;ve used it</p>
        </div>

        <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Link href="/" className="rounded-md bg-muted px-3 py-1 text-xl hover:opacity-80">
              ◀ HOME
            </Link>
            <span className="rounded-md bg-card px-3 py-1 text-xl">
              {SKILLS.length} skills · {CATEGORIES.length} categories
            </span>
          </div>

          {/* category tabs */}
          <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Skill categories">
            {(["All", ...CATEGORIES] as const).map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={tab === c}
                onClick={() => setTab(c)}
                className={`rounded-md px-3 py-1 text-xl transition-colors ${tab === c ? "bg-[#00a8ff] text-white" : "bg-muted hover:bg-muted/70"}`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_320px]">
            {/* skill info: beside the grid on desktop, above it on phones */}
            <aside className="order-first md:order-last">
              <div className="rounded-lg border border-border bg-card p-4 md:sticky md:top-4">
                <p className="mb-3 text-lg opacity-70">SKILL INFO</p>
                <div className="flex items-center gap-4">
                  <Logo skill={selected} big />
                  <div className="min-w-0">
                    <h2 className="text-4xl leading-none">{selected.name}</h2>
                    <p className="mt-1 text-xl opacity-70">{selected.category}</p>
                  </div>
                </div>
                <p className="mb-2 mt-4 text-xl">Used in</p>
                {evidenceFor(selected.name).length ? (
                  <ul className="space-y-2">
                    {evidenceFor(selected.name).map((e) => (
                      <li key={e.label}>
                        <Link
                          href={e.href}
                          {...(e.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                          className="flex items-baseline justify-between gap-2 rounded-md bg-muted px-3 py-1.5 text-xl hover:bg-[#00a8ff] hover:text-white"
                        >
                          <span className="min-w-0 truncate">{e.label}</span>
                          {e.note && <span className="shrink-0 text-base opacity-75">{e.note}</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-md bg-muted px-3 py-2 text-xl opacity-75">From my resume — no public project for it yet.</p>
                )}
              </div>
            </aside>

            {/* the tiles */}
            <section aria-label={tab === "All" ? "All skills" : tab}>
              <div className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-6">
                {shown.map((skill) => {
                  const isSel = skill.name === selected.name
                  return (
                    <button
                      key={skill.name}
                      type="button"
                      onMouseEnter={() => setSelected(skill)}
                      onFocus={() => setSelected(skill)}
                      onClick={() => setSelected(skill)}
                      aria-pressed={isSel}
                      className="flex flex-col items-center justify-self-center outline-none"
                    >
                      <span className={`folder-select relative flex h-16 w-16 items-center justify-center rounded-md ${isSel ? "is-selected" : ""}`}>
                        <Logo skill={skill} />
                        {counts[skill.name] > 0 && (
                          <span className="absolute -right-2 -top-2 z-20 rounded-full bg-[#ffcc00] px-1.5 text-sm leading-5 text-black shadow" title={`Used in ${counts[skill.name]}`}>
                            ×{counts[skill.name]}
                          </span>
                        )}
                      </span>
                      <span className="mt-1 text-center text-lg leading-tight">{skill.name}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          </div>

          <section className="mt-8 flex flex-wrap items-baseline gap-2 rounded-lg border border-border bg-card p-4">
            <span className="mr-1 text-xl opacity-70">Spoken languages</span>
            {SPOKEN.map((l) => (
              <span key={l} className="rounded bg-muted px-2 py-0.5 text-lg">
                {l}
              </span>
            ))}
          </section>
        </main>
      </div>
    </div>
  )
}

// a white app-icon tile with the brand logo (or the name, for tools without a logo)
function Logo({ skill, big }: { skill: Skill; big?: boolean }) {
  const size = big ? "h-20 w-20" : "h-16 w-16"
  return (
    <span className={`flex ${size} shrink-0 items-center justify-center rounded-md bg-white shadow-inner`}>
      {skill.logo ? (
        <Image src={skill.logo} alt="" width={40} height={40} className={big ? "h-12 w-12" : "h-9 w-9"} unoptimized />
      ) : (
        <span className={`px-1 text-center leading-none text-[#0b1220] ${big ? "text-2xl" : "text-lg"}`}>{skill.name}</span>
      )}
    </span>
  )
}
