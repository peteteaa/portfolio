"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import gsap from "gsap"

const TCGDEX_BASE = "https://api.tcgdex.net/v2/en"
const TCGDEX_SETS = `${TCGDEX_BASE}/sets`
const TCGDEX_SERIES_TCGP = `${TCGDEX_BASE}/series/tcgp`
const TCGDEX_CARDS = `${TCGDEX_BASE}/cards`
const TCGPLAYER_PRODUCT = "https://www.tcgplayer.com/product"
const TCGPLAYER_SEARCH = "https://www.tcgplayer.com/search/pokemon/product"
const PACK_IMAGE =
  "https://i.ebayimg.com/00/s/MTUwMVg4Mzk=/z/ZLgAAOSwJ0ZgsRYQ/$_1.JPG?set_id=880000500F"

type SetListItem = { id: string; name: string; cardCount?: { total: number } }
type SetCard = { id: string; name: string; image?: string }
type SetResponse = {
  id: string
  name: string
  cards: SetCard[]
  serie?: { id: string; name?: string }
}
type SeriesResponse = { id: string; sets?: { id: string }[] }
type PackCard = {
  id: string
  name: string
  image?: string
  rarity?: string
  illustrator?: string
  set: { id: string; name: string }
  pricing?: {
    cardmarket?: { avg?: number }
    tcgplayer?: { id?: number } | null
  }
}

/** True if the card art is from game/TCG game/3D source (e.g. Game Freak, 5ban, TCG game). */
function isGameIllustrator(illustrator: string | undefined): boolean {
  if (!illustrator) return false
  const s = illustrator.toLowerCase()
  return (
    /game\s*freak|5ban|planeta|bandai|takara|nintendo\s*\/\s*game\s*freak/i.test(s) ||
    /3d\s*graphics|digital\s*illustration\s*\(game\)/i.test(s) ||
    /\btcg\s*game\b|pokémon\s*tcg\s*game|from\s*the\s*game/i.test(s)
  )
}

const IMAGE_CHECK_TIMEOUT_MS = 5000

async function imageLoads(url: string): Promise<boolean> {
  if (!url) return false
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), IMAGE_CHECK_TIMEOUT_MS)
    const res = await fetch(url, { method: "HEAD", signal: controller.signal })
    clearTimeout(timeoutId)
    return res.ok
  } catch {
    return false
  }
}

function getHighResImageUrl(image: string | undefined): string {
  if (!image) return ""
  const base = image.endsWith("/") ? image.slice(0, -1) : image
  return `${base}/high.webp`
}

function getTCGplayerUrl(card: PackCard): string {
  const id = card.pricing?.tcgplayer?.id
  if (id != null) return `${TCGPLAYER_PRODUCT}/${id}`
  const name = encodeURIComponent(card.name)
  const setName = encodeURIComponent(card.set?.name ?? "")
  const q = setName ? `${name}+${setName}` : name
  return `${TCGPLAYER_SEARCH}?q=${q}`
}

function isRareOrHigher(rarity: string | undefined): boolean {
  if (!rarity) return false
  const r = rarity.toLowerCase()
  return (
    r.includes("rare") ||
    r.includes("ultra") ||
    r.includes("special") ||
    r.includes("holo") ||
    r.includes("secret") ||
    r.includes("illustration")
  )
}

function rarityRank(rarity: string | undefined): number {
  if (!rarity) return 0
  const r = rarity.toLowerCase()
  if (r.includes("special illustration") || r.includes("ultra rare")) return 4
  if (isRareOrHigher(rarity)) return 3
  if (/^uncommon$/i.test(rarity.trim())) return 1
  return 0
}

function isSpecialOrUltraRare(rarity: string | undefined): boolean {
  if (!rarity) return false
  const r = rarity.toLowerCase()
  return (
    r.includes("special illustration rare") ||
    r.includes("ultra rare") ||
    r.includes("special illustration") ||
    r === "ultra rare"
  )
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export default function PackOpeningSimulator() {
  const packRef = useRef<HTMLDivElement>(null)
  const packTopRef = useRef<HTMLDivElement>(null)
  const packBottomRef = useRef<HTMLDivElement>(null)
  const cardsContainerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [packCards, setPackCards] = useState<PackCard[]>([])
  const [revealedIndex, setRevealedIndex] = useState(0)
  const [phase, setPhase] = useState<"idle" | "loading" | "ready" | "opening" | "open">("idle")
  const [setName, setSetName] = useState("")
  const [setId, setSetId] = useState("")
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  const PACK_BUILD_TIMEOUT_MS = 60_000

  const buildPack = useCallback(async () => {
    setPhase("loading")
    setPackCards([])
    setRevealedIndex(0)
    try {
      await Promise.race([
        (async () => {
      const setsRes = await fetch(TCGDEX_SETS)
      if (!setsRes.ok) throw new Error("Failed to load sets")
      const setsList: SetListItem[] = await setsRes.json()
      let validSets = setsList.filter((s) => (s.cardCount?.total ?? 0) >= 10)

      // Exclude Pokémon TCG Pocket (tcgp) sets so they never appear in the simulator
      try {
        const tcgpRes = await fetch(TCGDEX_SERIES_TCGP)
        if (tcgpRes.ok) {
          const tcgpData: SeriesResponse = await tcgpRes.json()
          const tcgpSetIds = new Set((tcgpData.sets ?? []).map((s) => s.id))
          if (tcgpSetIds.size > 0) {
            validSets = validSets.filter((s) => !tcgpSetIds.has(s.id))
          }
        }
      } catch {
        // If tcgp series fetch fails, set-level check in the loop below still excludes Pocket
      }
      if (validSets.length === 0) throw new Error("No sets available")

      let chosenSetMeta: (typeof validSets)[0] | null = null
      let setData: SetResponse | null = null
      for (let attempt = 0; attempt < 15 && validSets.length > 0; attempt++) {
        chosenSetMeta = validSets[Math.floor(Math.random() * validSets.length)]
        const setRes = await fetch(`${TCGDEX_SETS}/${chosenSetMeta.id}`)
        if (!setRes.ok) continue
        const data: SetResponse = await setRes.json()
        if (data.serie?.id === "tcgp") {
          validSets = validSets.filter((s) => s.id !== chosenSetMeta!.id)
          continue
        }
        const cards = data.cards?.filter((c) => c.id && c.image) ?? []
        if (cards.length < 10) {
          validSets = validSets.filter((s) => s.id !== chosenSetMeta!.id)
          continue
        }
        setData = data
        break
      }
      if (!setData || !chosenSetMeta) throw new Error("No sets with enough cards available")
      setSetName(setData.name ?? chosenSetMeta.name)
      setSetId(chosenSetMeta.id)
      const cards = setData.cards?.filter((c) => c.id && c.image) ?? []

      const sampleSize = Math.min(80, cards.length)
      const sampled = shuffle(cards).slice(0, sampleSize)
      const fullCards: PackCard[] = await Promise.all(
        sampled.map(async (c) => {
          const res = await fetch(`${TCGDEX_CARDS}/${c.id}`)
          if (!res.ok) return null
          return res.json() as Promise<PackCard>
        })
      ).then((list) => list.filter((c): c is PackCard => c != null))

      const isPocketCard = (c: PackCard) => c.image?.includes("/tcgp/") ?? false
      const withoutGameArt = fullCards.filter(
        (c) => !isGameIllustrator(c.illustrator) && !isPocketCard(c)
      )
      if (withoutGameArt.length < 10) throw new Error("Not enough non-game cards in set")

      const imageChecks = await Promise.all(
        withoutGameArt.map(async (c) => ({
          card: c,
          ok: await imageLoads(getHighResImageUrl(c.image)),
        }))
      )
      const withValidImage = imageChecks.filter((x) => x.ok).map((x) => x.card)
      const pool = withValidImage.length >= 10 ? withValidImage : withoutGameArt

      const common = pool.filter(
        (c) => c.rarity && /^common$/i.test(c.rarity.trim())
      )
      const uncommon = pool.filter(
        (c) => c.rarity && /^uncommon$/i.test(c.rarity.trim())
      )
      const rarePlus = pool.filter((c) => isRareOrHigher(c.rarity))
      const rest = pool.filter(
        (c) =>
          !/^common$/i.test(c.rarity ?? "") &&
          !/^uncommon$/i.test(c.rarity ?? "") &&
          !isRareOrHigher(c.rarity)
      )

      const pick = <T,>(arr: T[], n: number): T[] =>
        arr.length >= n ? shuffle(arr).slice(0, n) : shuffle(arr)
      const used = new Set<string>()
      const take = (pool: PackCard[], n: number): PackCard[] => {
        const available = pool.filter((c) => !used.has(c.id))
        const chosen = pick(available.length >= n ? available : pool, n)
        chosen.forEach((c) => used.add(c.id))
        return chosen
      }
      const pack: PackCard[] = []
      pack.push(...take(common.length >= 5 ? common : [...common, ...rest], 5))
      pack.push(...take(uncommon.length >= 3 ? uncommon : [...uncommon, ...rest], 3))
      const reversePool = [...uncommon, ...common, ...rest].filter((c) => !used.has(c.id))
      pack.push(...take(reversePool.length ? reversePool : pool, 1))
      pack.push(...take(rarePlus.length >= 1 ? rarePlus : pool, 1))
      // Least rare first (index 0) = revealed first; rarest last (index 9) = revealed last
      pack.sort((a, b) => rarityRank(a.rarity) - rarityRank(b.rarity))

      const packIds = new Set(pack.map((c) => c.id))
      const replacementPool = pool.filter((c) => !packIds.has(c.id))
      for (let i = 0; i < pack.length; i++) {
        const url = getHighResImageUrl(pack[i].image)
        if (!(await imageLoads(url))) {
          const oldId = pack[i].id
          for (const candidate of shuffle(replacementPool)) {
            if (!(await imageLoads(getHighResImageUrl(candidate.image)))) continue
            pack[i] = candidate
            packIds.delete(oldId)
            packIds.add(candidate.id)
            replacementPool.splice(replacementPool.indexOf(candidate), 1)
            break
          }
        }
      }

      const cardUrls = pack.map((c) => getHighResImageUrl(c.image))
      console.debug("[PackOpeningSimulator] card URLs shown:", cardUrls)
      setPackCards(pack)
      setPhase("ready")
        })(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Pack load timed out")), PACK_BUILD_TIMEOUT_MS)
        ),
      ])
    } catch (e) {
      console.error(e)
      setPhase("idle")
    }
  }, [])

  useEffect(() => {
    if (phase !== "ready" || packCards.length === 0) return
    const packEl = packRef.current
    if (!packEl) return
    gsap.set(packEl, { transformOrigin: "center center" })
  }, [phase, packCards.length])

  const handlePackClick = useCallback(() => {
    if (phase !== "ready" || packCards.length === 0) return
    setPhase("opening")
    const top = packTopRef.current
    const bottom = packBottomRef.current
    const container = cardsContainerRef.current
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[]

    tlRef.current?.kill()
    const tl = gsap.timeline({
      onComplete: () => setPhase("open"),
    })

    tl.to(packRef.current, {
      duration: 0.2,
      scale: 1.05,
      yoyo: true,
      repeat: 1,
    })
    if (top) {
      tl.to(
        top,
        {
          clipPath: "inset(0% 0% 100% 0%)",
          rotationX: -75,
          duration: 0.45,
          ease: "power2.inOut",
        },
        "-=0.1"
      )
    }
    if (bottom) {
      tl.to(
        bottom,
        {
          opacity: 0.85,
          duration: 0.35,
          ease: "power2.out",
        },
        "<"
      )
    }
    const n = cards.length
    tl.set(container, { visibility: "visible" })
    tl.set(cards, { zIndex: (i: number) => n - 1 - i })
    cards.forEach((el, i) => {
      gsap.set(el, {
        x: -120 + Math.random() * 40,
        y: 80 + i * 4,
        rotation: -8 + Math.random() * 16,
        scale: 0.4,
        zIndex: n - 1 - i,
      })
    })
    tl.to(cards, {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      duration: 0.5,
      stagger: 0.06,
      ease: "back.out(1.2)",
      overwrite: true,
    })
    tl.to(cards, { zIndex: (i: number) => n - 1 - i }, "<")
    tlRef.current = tl
  }, [phase, packCards.length])

  const handlePackHover = useCallback(
    (enter: boolean) => {
      if (phase !== "ready" || !packRef.current) return
      if (enter) {
        gsap.to(packRef.current, {
          duration: 0.08,
          repeat: 4,
          yoyo: true,
          rotation: "+=2",
          x: "+=3",
          ease: "power1.inOut",
        })
      } else {
        gsap.killTweensOf(packRef.current)
        gsap.set(packRef.current, { x: 0, rotation: 0 })
      }
    },
    [phase]
  )

  const revealNextCard = useCallback(() => {
    if (phase !== "open" || revealedIndex >= packCards.length) return
    const cardEl = cardRefs.current[revealedIndex]
    const isSpecial = isSpecialOrUltraRare(packCards[revealedIndex]?.rarity)
    if (cardEl) {
      if (isSpecial) {
        gsap.fromTo(
          cardEl,
          { filter: "brightness(3) saturate(1.5)" },
          { filter: "brightness(1) saturate(1)", duration: 0.25, ease: "power2.out" }
        )
      }
      gsap.to(cardEl, {
        x: -320,
        rotation: -18,
        opacity: 0.4,
        duration: 0.35,
        ease: "power2.in",
        onComplete: () => {
          gsap.set(cardEl, { x: 0, rotation: 0, opacity: 1 })
        },
      })
    }
    setRevealedIndex((prev) => prev + 1)
  }, [phase, revealedIndex, packCards])

  const handleStackClick = useCallback(() => {
    revealNextCard()
  }, [revealNextCard])

  const stackSwipeRef = useRef({ startX: 0, startY: 0 })
  const handleStackTouchStart = useCallback((e: React.TouchEvent) => {
    stackSwipeRef.current.startX = e.touches[0].clientX
    stackSwipeRef.current.startY = e.touches[0].clientY
  }, [])
  const handleStackTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const dx = e.changedTouches[0].clientX - stackSwipeRef.current.startX
      const dy = e.changedTouches[0].clientY - stackSwipeRef.current.startY
      if (dx < -50 && Math.abs(dx) > Math.abs(dy)) revealNextCard()
    },
    [revealNextCard]
  )

  useEffect(() => {
    if (phase !== "open") return
    packCards.forEach((_, i) => {
      const el = cardRefs.current[i]
      if (el) gsap.set(el, { zIndex: i === revealedIndex ? 20 : 10 + i })
    })
  }, [phase, revealedIndex, packCards.length])

  return (
    <section className="mt-12 border-t border-gray-700 pt-8 bg-gray-900/40 rounded-xl p-6 -mx-2">
      <h2 className="text-lg font-semibold mb-3 text-white">Pack opening</h2>
      <p className="text-sm text-gray-400 mb-4">
        {setName && setId ? `${setName} (${setId}). ` : ""}Click &quot;Open pack&quot; to load, then click the pack to open. Click the stack to reveal each card.
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {phase === "idle" && (
          <button
            type="button"
            onClick={buildPack}
            className="rounded-lg bg-amber-600 text-white px-4 py-2 font-medium hover:bg-amber-700"
          >
            Open pack
          </button>
        )}
        {(phase === "ready" || phase === "open") && (
          <button
            type="button"
            onClick={buildPack}
            className="rounded-lg bg-gray-600 text-white px-4 py-2 font-medium hover:bg-gray-500"
          >
            New pack
          </button>
        )}
      </div>

      {phase === "loading" && (
        <p className="text-gray-400">Loading pack...</p>
      )}

      {(phase === "ready" || phase === "opening" || phase === "open") && packCards.length > 0 && (
        <div className="relative flex flex-col items-center min-h-[320px]">
          <div
            ref={packRef}
            role="button"
            tabIndex={0}
            onClick={phase === "ready" ? handlePackClick : undefined}
            onMouseEnter={() => handlePackHover(true)}
            onMouseLeave={() => handlePackHover(false)}
            onKeyDown={(e) => e.key === "Enter" && phase === "ready" && handlePackClick()}
            className="relative w-44 h-[20rem] cursor-pointer select-none rounded-lg overflow-hidden shadow-xl"
            style={{
              visibility: phase === "open" ? "hidden" : "visible",
              perspective: "400px",
              transformStyle: "preserve-3d",
            }}
          >
            <div
              ref={packTopRef}
              className="absolute inset-0 bg-gray-800 origin-top"
              style={{
                clipPath: "inset(0 0 90% 0)",
                transformOrigin: "top center",
                transformStyle: "preserve-3d",
                backfaceVisibility: "visible",
              }}
            >
              <img
                src={PACK_IMAGE}
                alt="Pack"
                loading="eager"
                decoding="async"
                className="block w-full h-full min-w-0 min-h-0 object-contain object-top bg-gray-800"
              />
            </div>
            <div
              ref={packBottomRef}
              className="absolute inset-0 bg-gray-800"
              style={{
                clipPath: "inset(10% 0 0 0)",
              }}
            >
              <img
                src={PACK_IMAGE}
                alt=""
                loading="eager"
                decoding="async"
                className="block w-full h-full min-w-0 min-h-0 object-contain object-center bg-gray-800"
              />
            </div>
          </div>

          <div
            ref={cardsContainerRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
            style={{
              visibility: phase === "open" ? "visible" : "hidden",
              width: "clamp(180px, 24vw, 260px)",
            }}
          >
            {packCards.map((card, i) => (
              <div
                key={card.id}
                ref={(el) => {
                  cardRefs.current[i] = el
                }}
                role="button"
                tabIndex={0}
                onClick={phase === "open" && revealedIndex === i ? handleStackClick : undefined}
                onKeyDown={(e) =>
                  phase === "open" && revealedIndex === i && e.key === "Enter" && handleStackClick()
                }
                onTouchStart={
                  phase === "open" && revealedIndex === i ? handleStackTouchStart : undefined
                }
                onTouchEnd={
                  phase === "open" && revealedIndex === i ? handleStackTouchEnd : undefined
                }
                className="absolute w-full aspect-[5/7] rounded-lg overflow-hidden shadow-2xl cursor-pointer select-none touch-manipulation"
                style={{
                  zIndex: phase === "open" && revealedIndex === i ? 100 : i,
                  pointerEvents: phase === "open" && revealedIndex >= i ? "auto" : "none",
                }}
              >
                <img
                  src={getHighResImageUrl(card.image)}
                  alt={card.name}
                  className="w-full h-full object-contain bg-gray-800"
                />
                {isSpecialOrUltraRare(card.rarity) && (
                  <div
                    className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-40"
                    style={{
                      background:
                        "linear-gradient(125deg, transparent 40%, rgba(255,200,100,0.4) 50%, transparent 60%)",
                      backgroundSize: "200% 200%",
                    }}
                  />
                )}
                {(revealedIndex > i || revealedIndex === i) && (
                  <div className="absolute inset-0 flex flex-col justify-end p-2 bg-gradient-to-t from-black/90 to-transparent text-white text-xs pointer-events-none">
                    <span className="font-semibold truncate">{card.name}</span>
                    {card.rarity && <span className="opacity-90">{card.rarity}</span>}
                    {card.pricing?.cardmarket?.avg != null && (
                      <span>€{Number(card.pricing.cardmarket.avg).toFixed(2)}</span>
                    )}
                    <a
                      href={getTCGplayerUrl(card)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:underline mt-1 pointer-events-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      TCGplayer →
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          {phase === "open" && (
            <p className="mt-64 text-gray-400 text-sm">
              {revealedIndex < packCards.length
                ? "Click or swipe left on the top card to reveal"
                : "Pack complete"}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
