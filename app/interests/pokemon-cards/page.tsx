"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import Link from "next/link"
import ProfileCard from "@/components/ProfileCard"
import PackOpeningSimulator from "@/components/PackOpeningSimulator"

const TCGDEX_BASE = "https://api.tcgdex.net/v2/en"
const TCGDEX_CARDS = `${TCGDEX_BASE}/cards`
const TCGDEX_SETS = `${TCGDEX_BASE}/sets`
const TCGPLAYER_PRODUCT = "https://www.tcgplayer.com/product"
const TCGPLAYER_SEARCH = "https://www.tcgplayer.com/search/pokemon/product"
const EUR_TO_USD = 1.08

const RARITY_SHORTHAND: Record<string, string> = {
  sir: "Special illustration rare",
  sar: "Special Art Rare",
  ir: "Illustration rare",
  ur: "Ultra rare",
  rr: "Rare Rainbow",
  ex: "Double rare",
  sr: "Secret rare",
  hr: "Hyper rare",
  ar: "Art rare",
  chr: "Character rare",
  cr: "Character rare",
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  " holo": "Rare Holo",
  " holo ex": "Rare Holo EX",
  " ultra": "Rare Ultra",
  "secret": "Rare Secret",
  "rainbow": "Rare Rainbow",
  "break": "Rare BREAK",
  " prime": "Rare Prime",
  " gold": "Rare Golden",
  promo: "Promo",
  "promo rare": "Promo Rare",
}

function expandRarityShorthand(input: string): string {
  const key = input.trim().toLowerCase()
  return RARITY_SHORTHAND[key] ?? input.trim()
}

type SearchResultItem = { id: string; name: string; image?: string }
type SetListItem = { id: string; name: string; cardCount?: { total: number } }
type SetWithCards = { id: string; cards: { id: string; name: string; image?: string }[] }
type TCGdexCard = {
  id: string
  name: string
  image?: string
  rarity?: string
  set: { id: string; name: string }
  pricing?: {
    cardmarket?: { avg?: number; unit?: string }
    tcgplayer?: { id?: number; market?: number; mid?: number; low?: number; high?: number } | null
  }
}

function getHighResImageUrl(image: string | undefined): string {
  if (!image) return ""
  const base = image.endsWith("/") ? image.slice(0, -1) : image
  return `${base}/high.webp`
}

function getTCGplayerUrl(card: TCGdexCard): string {
  const id = card.pricing?.tcgplayer?.id
  if (id != null) return `${TCGPLAYER_PRODUCT}/${id}`
  const name = encodeURIComponent(card.name)
  const setName = encodeURIComponent(card.set?.name ?? "")
  const q = setName ? `${name}+${setName}` : name
  return `${TCGPLAYER_SEARCH}?q=${q}`
}
const CARD_PROPS = [//carasouel cards
  {
    avatarUrl: "https://tcgplayer-cdn.tcgplayer.com/product/478065_in_1000x1000.jpg",
    name: "Pokemon Collector",
    title: "Card Enthusiast",
    handle: "the_pokemon_collector",
    status: "Collecting Pokemon Cards",
    showUserInfo: false,
    behindGlowEnabled: true,
    iconUrl: "/images/pokeball.png",
    grainUrl: "https://www.transparenttextures.com/patterns/grain.png",
  },{
    avatarUrl: "https://tcgplayer-cdn.tcgplayer.com/product/478071_in_1000x1000.jpg",
    name: "Pokemon Collector",
    title: "Card Enthusiast",
    handle: "the_pokemon_collector",
    status: "Collecting Pokemon Cards",
    showUserInfo: false,
    behindGlowEnabled: true,
    iconUrl: "/images/pokeball.png",
    grainUrl: "https://www.transparenttextures.com/patterns/grain.png",
  },{
    avatarUrl: "https://tcgplayer-cdn.tcgplayer.com/product/113763_in_1000x1000.jpg",

    grainUrl: "https://www.transparenttextures.com/patterns/grain.png",
  },{//Pikachu 
    avatarUrl: "http://storage.googleapis.com/images.pricecharting.com/a5kgluzasqscrp5q/1600.jpg",
    iconUrl: "/images/pokeball.png",
    grainUrl: "https://www.transparenttextures.com/patterns/grain.png",
  },
  {//Blastoise
    avatarUrl: "https://tcgplayer-cdn.tcgplayer.com/product/517046_in_600x600.jpg",
    iconUrl: "/images/pokeball.png",
    grainUrl: "https://www.transparenttextures.com/patterns/grain.png",
  },

];

const CARD_COUNT = CARD_PROPS.length;
const SCROLL_THRESHOLD = 320 // pixels of scroll before switching focus (higher = slower)


function goToPrev(index: number) {
  return (index - 1 + CARD_COUNT) % CARD_COUNT
}
function goToNext(index: number) {
  return (index + 1) % CARD_COUNT
}

export default function PokemonCardsPage() {
  const [focusedIndex, setFocusedIndex] = useState(1) // start with middle card focused
  const wheelRef = useRef<HTMLDivElement>(null)
  const centerSlotRef = useRef<HTMLDivElement>(null)
  const accumulatedRef = useRef(0)
  const scrollDirectionRef = useRef<number | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [searchSet, setSearchSet] = useState("")
  const [searchRarity, setSearchRarity] = useState("")
  const [searchedCard, setSearchedCard] = useState<TCGdexCard | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleSearch = useCallback(async () => {
    const query = searchQuery.trim()
    if (!query) return
    setSearchError(null)
    setSearchedCard(null)
    setImageLoaded(false)
    setSearchLoading(true)
    try {
      const params = new URLSearchParams({ name: query })
      if (searchSet.trim()) params.set("set", searchSet.trim())
      if (searchRarity.trim()) params.set("rarity", expandRarityShorthand(searchRarity))
      const res = await fetch(`${TCGDEX_CARDS}?${params.toString()}`)
      if (!res.ok) throw new Error("Search failed")
      const list: SearchResultItem[] = await res.json()
      const hasFilters = searchSet.trim() || searchRarity.trim()
      const chosen = hasFilters
        ? list[0]
        : list[Math.floor(Math.random() * list.length)]
      if (!chosen?.id) {
        setSearchError("No cards found")
        return
      }
      const cardRes = await fetch(`${TCGDEX_CARDS}/${chosen.id}`)
      if (!cardRes.ok) throw new Error("Failed to load card")
      const card: TCGdexCard = await cardRes.json()
      setSearchedCard(card)
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSearchLoading(false)
    }
  }, [searchQuery, searchSet, searchRarity])

  const handleRandomCard = useCallback(async () => {
    setSearchError(null)
    setSearchedCard(null)
    setImageLoaded(false)
    setSearchLoading(true)
    try {
    const setsRes = await fetch(TCGDEX_SETS)
    if (!setsRes.ok) throw new Error("Failed to load sets")

    const setsList: SetListItem[] = await setsRes.json()

    const setsWithCards = setsList.filter(
      (s) => (s.cardCount?.total ?? 0) > 0
    )

    if (setsWithCards.length === 0) {
      setSearchError("No sets found")
      return
    }

    const randomSet =
      setsWithCards[Math.floor(Math.random() * setsWithCards.length)]

    const setRes = await fetch(`${TCGDEX_SETS}/${randomSet.id}`)

    if (!setRes.ok) throw new Error("Failed to load set")

    const setData: SetWithCards = await setRes.json()
      const cards = setData.cards?.filter((c) => c.id) ?? []
      if (cards.length === 0) {
        setSearchError("No cards in set")
        return
      }
      const withImage = cards.filter((c) => c.image)
      const chosen = withImage.length > 0
        ? withImage[Math.floor(Math.random() * withImage.length)]
        : cards[Math.floor(Math.random() * cards.length)]
      const cardRes = await fetch(`${TCGDEX_CARDS}/${chosen.id}`)
      if (!cardRes.ok) throw new Error("Failed to load card")
      const card: TCGdexCard = await cardRes.json()
      setSearchedCard(card)
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setSearchLoading(false)
    }
  }, [])

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    // Use dominant axis so diagonal scroll doesn't double-count; down/right = next (positive), up/left = prev (negative)
    const delta =
      Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX
    const direction = delta === 0 ? 0 : delta > 0 ? 1 : -1

    // Reset accumulation when scroll direction changes so reversing feels correct
    if (scrollDirectionRef.current !== null && scrollDirectionRef.current !== direction) {
      accumulatedRef.current = 0
    }
    scrollDirectionRef.current = direction

    accumulatedRef.current += delta
    const steps = Math.trunc(accumulatedRef.current / SCROLL_THRESHOLD)
    if (steps !== 0) {
      const step = Math.max(-1, Math.min(1, steps)) // at most ±1 per frame for predictable movement
      accumulatedRef.current -= step * SCROLL_THRESHOLD
      setFocusedIndex((prev) => (step > 0 ? goToNext(prev) : goToPrev(prev)))
    }
  }, [])

  useEffect(() => {
    const el = wheelRef.current
    if (!el) return
    el.addEventListener("wheel", handleWheel, { passive: false })
    return () => el.removeEventListener("wheel", handleWheel)
  }, [handleWheel])

  useEffect(() => {
    const el = wheelRef.current
    if (el) {
      el.focus({ preventScroll: true })
    }
  }, [])

  useEffect(() => {
    centerSlotRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
  }, [focusedIndex])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      const isPrev = e.key === "ArrowLeft" || e.key === "ArrowUp"
      const isNext = e.key === "ArrowRight" || e.key === "ArrowDown"
      if (isPrev) {
        e.preventDefault()
        e.stopPropagation()
        setFocusedIndex((prev) => goToPrev(prev))
      } else if (isNext) {
        e.preventDefault()
        e.stopPropagation()
        setFocusedIndex((prev) => goToNext(prev))
      }
    }
    const el = wheelRef.current
    if (!el) return
    el.addEventListener("keydown", handleKeyDown)
    return () => el.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Wheel layout: cards stay in DOM order 0,1,2 with stable keys so they never remount (no animation reset).
  // Center card is always at 50% of the container; others are offset left/right.
  const SLOT_STEP_PX = 220
  const slotWidth = "clamp(200px, 28vw, 280px)"
  const sideCardWidth = "clamp(120px, 18vw, 180px)"
  const getOffset = (cardIndex: number) => {
    let offset = (cardIndex - focusedIndex + CARD_COUNT) % CARD_COUNT;

    if (offset > CARD_COUNT / 2) {
      offset -= CARD_COUNT;
    }

    return offset;
  };

  return (
    <div className="p-8 font-nintendo-ds-bios">
      <h1 className="text-6xl font-bold mb-4">Pete's Pokemon Collection!</h1>
      <p className="text-3xl">Check out Pete's top hits.</p>

      <div
        ref={wheelRef}
        tabIndex={0}
        role="group"
        aria-label="Pokemon cards carousel"
        className="relative py-8 min-h-[380px] outline-none overflow-visible"
        style={{ perspective: "1000px" }}
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {CARD_PROPS.map((cardProps, cardIndex) => {
            const offset = getOffset(cardIndex)
            const isCenter = offset === 0
            const scale = isCenter ? 1 : 0.85
            const width = isCenter ? slotWidth : sideCardWidth
            const translateX = offset * SLOT_STEP_PX
            return (
              <div
                key={cardIndex}
                ref={isCenter ? centerSlotRef : undefined}
                className="absolute left-1/2 flex-shrink-0 transition-all duration-300 ease-out"
                style={{
                  width,
                  transform: `translate(calc(-50% + ${translateX}px), -50%) scale(${scale})`,
                  zIndex: isCenter ? 10 : 0,
                }}
              >
                <ProfileCard
                  {...cardProps}
                  className="w-full aspect-[5.1/7]"
                />

              </div>
            )
          })}
        </div>
      </div>


      {/* Search card */}
      <section className="mt-12 border-t border-gray-200 pt-8" aria-label="Search card">
        <h2 className="text-3xl font-nintendo-ds-bios mb-3">Search a card</h2>
        <div className="flex flex-wrap items-center gap-2 text-2xl">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Card name..."
            className="rounded-lg border border-gray-300 px-3 py-2 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Card name search"
          />
          <input
            type="text"
            value={searchSet}
            onChange={(e) => setSearchSet(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Set (e.g. sv08)"
            className="rounded-lg border border-gray-300 px-3 py-2 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by set ID"
          />
          <input
            type="text"
            value={searchRarity}
            onChange={(e) => setSearchRarity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Rarity (e.g. SIR, IR, Rare)"
            className="rounded-lg border border-gray-300 px-3 py-2 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by rarity (SIR, IR, SAR, etc.)"
            title="Supports shorthand: SIR, IR, SAR, UR, RR, Common, Rare, etc."
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searchLoading}
            className="rounded-lg bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {searchLoading ? "Loading…" : "Search"}
          </button>
          <button
            type="button"
            onClick={handleRandomCard}
            disabled={searchLoading}
            className="rounded-lg bg-purple-600 text-white px-4 py-2 font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {searchLoading ? "Loading…" : "Random card"}
          </button>
        </div>
        {searchError && (
          <p className="text-red-600 text-sm mb-4" role="alert">{searchError}</p>
        )}
        {searchedCard && (
          <div className="flex flex-col items-center gap-4 mt-8">
            <div className="w-full max-w-[280px] aspect-[5/7] relative">
              {!imageLoaded && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100 rounded-[30px] animate-pulse" aria-hidden="true">
                  <span className="text-gray-400 text-xl">Loading image…</span>
                </div>
              )}
              <ProfileCard
                avatarUrl={getHighResImageUrl(searchedCard.image)}
                name={searchedCard.name}
                title={searchedCard.set?.name ?? ""}
                showUserInfo={false}
                behindGlowEnabled={true}
                iconUrl="/images/pokeball.png"
                grainUrl="https://www.transparenttextures.com/patterns/grain.png"
                className="w-full h-full aspect-[5/7]"
              />
              {/* Hidden image to track load for high-res URL; ProfileCard doesn't expose onLoad */}
              <img
                src={getHighResImageUrl(searchedCard.image)}
                alt=""
                className="sr-only"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
              />
            </div>
            <div className="text-xl text-gray-700 text-center space-y-1">
              {searchedCard.set?.name && (
                <p><strong>Set:</strong> {searchedCard.set.name}</p>
              )}
              {searchedCard.rarity && (
                <p><strong>Rarity:</strong> {searchedCard.rarity}</p>
              )}
              {(() => {
                const tcg = searchedCard.pricing?.tcgplayer
                const cm = searchedCard.pricing?.cardmarket
                const usd =
                  tcg?.market ?? tcg?.mid ?? (cm?.avg != null ? Number(cm.avg) * EUR_TO_USD : null)
                if (usd != null) {
                  return (
                    <p><strong>Market Price (USD):</strong> ${Number(usd).toFixed(2)}</p>
                  )
                }
                return null
              })()}
            </div>
            <a
              href={getTCGplayerUrl(searchedCard)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg bg-amber-500 text-white px-4 py-2 font-medium hover:bg-amber-600 transition-colors"
            >
              View on TCGplayer
            </a>
          </div>
        )}
      </section>

      <PackOpeningSimulator />

      <Link href="/about" className="text-blue-500 block mt-8">← Back to About</Link>
    </div>
  )
}
