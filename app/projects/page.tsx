"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import PokemonAnimation from "@/components/PokemonAnimation"
import SkyBackground from "@/components/SkyBackground"
import HomeStatusBar from "@/components/home/HomeStatusBar"
import { FEATURED, STACK, TOOLHOUSE_APPS, projectAnchor, type Shot, type WebProject } from "@/components/projects/data"

const AWARD_COUNT = FEATURED.reduce((n, p) => n + (p.awards?.length ?? 0), 0)

export default function ProjectsPage() {
  // full-size screenshot viewer: which project's shots, and which one
  const [viewer, setViewer] = useState<{ shots: Shot[]; i: number } | null>(null)
  // arriving from a skill's "used in" link (/projects#love-bubbles): scroll to that card and highlight it.
  // In-app links change the URL without a real hash jump, so :target alone doesn't work
  const [highlight, setHighlight] = useState<string | null>(null)
  useEffect(() => {
    const go = () => {
      const id = decodeURIComponent(window.location.hash.slice(1))
      if (!id) return
      setHighlight(id)
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }))
    }
    go()
    window.addEventListener("hashchange", go)
    return () => window.removeEventListener("hashchange", go)
  }, [])

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
          <h1 className="text-4xl leading-none md:text-6xl">Projects</h1>
          <p className="mt-2 text-lg opacity-85 md:text-2xl">Hackathon wins &amp; things I&apos;ve shipped</p>
        </div>
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <Link href="/" className="rounded-md bg-muted px-3 py-1 text-xl hover:opacity-80">
              ◀ HOME
            </Link>
            <div className="flex flex-wrap gap-2 text-xl">
              <span className="rounded-md bg-card px-3 py-1">{FEATURED.length + TOOLHOUSE_APPS.length} projects</span>
              <span className="rounded-md bg-card px-3 py-1">🏆 {AWARD_COUNT} hackathon awards</span>
            </div>
          </div>

          <section className="mb-6 rounded-lg border border-border bg-card p-4">
            {Object.entries(STACK).map(([group, items]) => (
              <div key={group} className="mb-2 flex flex-wrap items-baseline gap-2 last:mb-0">
                <span className="mr-1 text-xl opacity-70">{group}</span>
                {items.map((s) => (
                  <span key={s} className="rounded bg-muted px-2 py-0.5 text-lg">
                    {s}
                  </span>
                ))}
              </div>
            ))}
          </section>

          <h2 className="mb-3 text-3xl">Projects &amp; hackathons</h2>
          <div className="mb-10 grid gap-5 md:grid-cols-2">
            {FEATURED.map((p) => (
              <ProjectCard key={p.name} project={p} highlight={highlight} onOpen={(i) => p.shots && setViewer({ shots: p.shots, i })} />
            ))}
          </div>

          <h2 className="mb-1 text-3xl">Toolhouse example apps</h2>
          <p className="mb-3 text-xl opacity-75">Example apps from my Developer Advocate work at Toolhouse, showcasing its integrations.</p>
          <div className="grid gap-5 md:grid-cols-2">
            {TOOLHOUSE_APPS.map((p) => (
              <ProjectCard key={p.name} project={p} highlight={highlight} onOpen={(i) => p.shots && setViewer({ shots: p.shots, i })} />
            ))}
          </div>
        </main>
      </div>

      {viewer && <ShotViewer shots={viewer.shots} start={viewer.i} onClose={() => setViewer(null)} />}
    </div>
  )
}

function ProjectCard({ project: p, onOpen, highlight }: { project: WebProject; onOpen: (i: number) => void; highlight?: string | null }) {
  const [i, setI] = useState(0)
  const shot = p.shots?.[i]
  return (
    <article
      id={projectAnchor(p.name)}
      className={`flex scroll-mt-4 flex-col overflow-hidden rounded-lg border border-border bg-card ${highlight === projectAnchor(p.name) ? "ring-4 ring-[#00a8ff]" : ""}`}
    >
      {/* screenshot, or a placeholder screen with the project's sprite */}
      <div className="relative aspect-video w-full overflow-hidden border-b border-border bg-[#0b1220]">
        {shot ? (
          <button className="group block h-full w-full" onClick={() => onOpen(i)} aria-label={`View ${p.name} screenshot full size`}>
            <Image
              src={shot.src}
              alt={shot.alt}
              width={shot.w}
              height={shot.h}
              sizes="(min-width: 768px) 560px, 100vw"
              className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
            />
            <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-base text-white opacity-0 transition-opacity group-hover:opacity-100">
              ⤢ View
            </span>
          </button>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-white/70">
            <Image src={p.sprite} width={64} height={64} alt="" className="h-16 w-16 object-contain pixelated" />
            <span className="text-lg">No screenshot yet</span>
          </div>
        )}
        {p.awards && (
          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            {p.awards.map((a) => (
              <span key={a} className="rounded bg-[#ffcc00] px-2 py-0.5 text-base leading-tight text-black shadow">
                🏆 {a}
              </span>
            ))}
          </div>
        )}
      </div>

      {p.shots && p.shots.length > 1 && (
        <div className="flex gap-2 border-b border-border bg-muted/40 p-2">
          {p.shots.map((s, n) => (
            <button
              key={s.src}
              onClick={() => setI(n)}
              aria-label={`Show screenshot ${n + 1}`}
              className={`h-12 w-20 overflow-hidden rounded border-2 ${n === i ? "border-[#00a8ff]" : "border-transparent opacity-70 hover:opacity-100"}`}
            >
              <Image src={s.src} alt="" width={160} height={96} className="h-full w-full object-cover object-top" />
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-3xl leading-none">{p.name}</h3>
        {p.event && <p className="mt-1 text-lg opacity-70">{p.event}</p>}
        <p className="mt-3 text-xl leading-snug">{p.summary}</p>
        {p.stack.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.stack.map((s) => (
              <span key={s} className="rounded bg-muted px-2 py-0.5 text-base">
                {s}
              </span>
            ))}
          </div>
        )}
        {(p.live || p.repo) && (
          <div className="mt-auto flex gap-3 pt-4 text-xl">
            {p.live && (
              <a href={p.live} target="_blank" rel="noopener noreferrer" className="rounded-md bg-[#00a8ff] px-3 py-1 text-white hover:opacity-85">
                Live ↗
              </a>
            )}
            {p.repo && (
              <a href={p.repo} target="_blank" rel="noopener noreferrer" className="rounded-md bg-muted px-3 py-1 hover:opacity-85">
                GitHub ↗
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

function ShotViewer({ shots, start, onClose }: { shots: Shot[]; start: number; onClose: () => void }) {
  const [i, setI] = useState(start)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      else if (e.key === "ArrowRight") setI((n) => (n + 1) % shots.length)
      else if (e.key === "ArrowLeft") setI((n) => (n - 1 + shots.length) % shots.length)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [shots.length, onClose])
  const s = shots[i]
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/85 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label="Screenshot viewer">
      <Image src={s.src} alt={s.alt} width={s.w} height={s.h} className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
      <div className="flex items-center gap-4 text-xl text-white" onClick={(e) => e.stopPropagation()}>
        {shots.length > 1 && (
          <button className="rounded bg-white/15 px-3 py-1 hover:bg-white/25" onClick={() => setI((n) => (n - 1 + shots.length) % shots.length)}>
            ◀
          </button>
        )}
        <span className="opacity-80">{s.alt}</span>
        {shots.length > 1 && (
          <button className="rounded bg-white/15 px-3 py-1 hover:bg-white/25" onClick={() => setI((n) => (n + 1) % shots.length)}>
            ▶
          </button>
        )}
        <button className="rounded bg-white/15 px-3 py-1 hover:bg-white/25" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  )
}
