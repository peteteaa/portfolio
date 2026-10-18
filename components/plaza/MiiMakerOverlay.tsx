"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PokeballFlash, backdropClass, usePokeballOpen, windowClass } from "@/components/pokeball/usePokeballOpen";
import { NAME_MAX, cleanName, randomLook, type Look, type LookKey, type PlazaCharacter } from "@/lib/plaza/look";
import CharacterSprite from "./CharacterSprite";
import { EXTRAS, EYE_STYLES, HAIR_COLORS, HAIR_STYLES, MOUTH_STYLES, PANTS_COLORS, SHIRT_COLORS, SKIN_TONES } from "./parts";
import { clearMine, firePlazaSaved, getMine, setMine, type Mine } from "./mine";

// Mii-style character maker, opened with the same pokéball throw as the chatroom. Esc or ✕ closes it.
// One request per click, no retries; the server's error message is shown inline.

const TABS = ["Skin", "Hair", "Eyes", "Mouth", "Outfit", "Extra"] as const;
type Tab = (typeof TABS)[number];

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Swatch = { base: string; shade: string };

const btn =
  "font-nintendo-ds-bios border-[3px] border-[#333] px-3 py-1 text-base shadow-[2px_2px_0_rgba(0,0,0,0.35)] enabled:active:translate-x-px enabled:active:translate-y-px disabled:opacity-50";

export default function MiiMakerOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { phase, ballThrow, close } = usePokeballOpen(isOpen, onClose);
  const [mine, setMineState] = useState<Mine | null>(null);
  const [name, setName] = useState("");
  const [look, setLook] = useState<Look>(() => randomLook());
  const [tab, setTab] = useState<Tab>("Skin");
  const [frame, setFrame] = useState<0 | 1>(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  // fresh form each time it opens: prefilled when the visitor already has a character
  useEffect(() => {
    if (!isOpen) return;
    const m = getMine();
    setMineState(m);
    setName(m?.name ?? "");
    setLook(m ? m.look : randomLook());
    setTab("Skin");
    setMessage("");
    setBusy(false);
  }, [isOpen]);

  useEffect(() => {
    if (phase !== "open") return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    // the panel owns the screen: no scrolling the page behind it
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  });

  // preview walks in place
  useEffect(() => {
    if (phase !== "open" || reducedMotion()) return;
    const t = setInterval(() => setFrame((f) => (f ? 0 : 1)), 200);
    return () => clearInterval(t);
  }, [phase]);

  if (!isOpen || phase === "idle") return null;
  if (phase === "throw") return ballThrow;

  const set = (key: LookKey, v: number) => setLook((l) => ({ ...l, [key]: v }));

  // one request; returns the parsed body, or null (message set) on failure
  async function send(method: "POST" | "PATCH" | "DELETE", body: object) {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/plaza", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBusy(false);
        return { status: res.status, error: typeof data.error === "string" ? data.error : "Something went wrong." };
      }
      setBusy(false);
      return { status: res.status, data };
    } catch {
      setBusy(false);
      return { status: 0, error: "Could not reach the plaza. Try again." };
    }
  }

  const submit = async () => {
    const clean = cleanName(name);
    if (!clean) return setMessage(`Name needs 1-${NAME_MAX} letters or numbers.`);
    if (mine) {
      const r = await send("PATCH", { id: mine.id, token: mine.token, name: clean, look });
      if (r.error) {
        if (r.status === 404) {
          clearMine();
          setMineState(null);
          firePlazaSaved(null);
          return setMessage("Your old character was removed. Save to make a new one.");
        }
        return setMessage(r.error);
      }
      setMine({ ...mine, name: clean, look });
      firePlazaSaved({ id: mine.id, name: clean, look, createdAt: Date.now() });
      close();
    } else {
      const r = await send("POST", { name: clean, look });
      if (r.error) return setMessage(r.error);
      const { character, token } = r.data as { character: PlazaCharacter; token: string };
      setMine({ id: character.id, token, name: clean, look });
      firePlazaSaved(character);
      close();
    }
  };

  const remove = async () => {
    if (!mine || !confirm("Delete your character?")) return;
    const r = await send("DELETE", { id: mine.id, token: mine.token });
    if (r.error && r.status !== 404) return setMessage(r.error);
    clearMine();
    firePlazaSaved(null);
    close();
  };

  const ring = (on: boolean) =>
    `border-[3px] ${on ? "border-primary ring-2 ring-primary" : "border-[#333]"} bg-background`;

  const swatches = (key: LookKey, list: Swatch[], label: string) => (
    <div className="flex flex-wrap gap-2">
      {list.map((c, i) => (
        <button
          key={i}
          type="button"
          aria-label={`${label} ${i + 1}`}
          aria-pressed={look[key] === i}
          onClick={() => set(key, i)}
          className={`h-8 w-8 ${ring(look[key] === i)}`}
          style={{ backgroundColor: c.base }}
        />
      ))}
    </div>
  );

  const thumbs = (key: LookKey, list: { name: string }[]) => (
    <div className="flex flex-wrap gap-2">
      {list.map((o, i) => (
        <button
          key={i}
          type="button"
          aria-label={o.name}
          aria-pressed={look[key] === i}
          title={o.name}
          onClick={() => set(key, i)}
          className={`flex h-[56px] w-[40px] items-center justify-center ${ring(look[key] === i)}`}
        >
          <CharacterSprite look={{ ...look, [key]: i }} scale={2} />
        </button>
      ))}
    </div>
  );

  const section = (title: string, children: React.ReactNode) => (
    <div className="mb-3">
      <div className="mb-1 text-sm opacity-70">{title}</div>
      {children}
    </div>
  );

  return createPortal(
    <div
      className={`fixed inset-0 flex items-center justify-center p-2 ${backdropClass(phase)}`}
      style={{ zIndex: 99998, backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div
        className={`font-nintendo-ds-bios relative max-h-full w-full max-w-[720px] overflow-y-auto rounded-lg border-4 border-[#333] bg-card text-foreground ${windowClass(phase)}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mii Maker"
      >
        {phase === "open" && <PokeballFlash />}
        <div className="flex items-center justify-between border-b-4 border-[#333] bg-primary px-3 py-1 text-primary-foreground">
          <h2 className="text-lg">{mine ? "Edit your character" : "Make your character"}</h2>
          <button type="button" onClick={close} aria-label="Close" className="px-2 text-lg">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4 p-3 sm:flex-row">
          <div className="flex shrink-0 flex-col items-center sm:w-[180px]">
            <div className="plaza-preview-ground flex h-[170px] w-full items-end justify-center bg-background pb-[6px]">
              <CharacterSprite look={look} frame={frame} scale={6} className="pixelated" />
            </div>
            <div className="mt-1 text-center text-base">{cleanName(name) ?? "Name"}</div>
          </div>

          <div className="min-w-0 flex-1">
            <div role="tablist" className="mb-3 flex flex-wrap gap-1">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={`border-[3px] border-[#333] px-2 text-base ${tab === t ? "bg-primary text-primary-foreground" : "bg-background"}`}
                >
                  {t}
                </button>
              ))}
            </div>
            {tab === "Skin" && section("Skin tone", swatches("skin", SKIN_TONES, "Skin tone"))}
            {tab === "Hair" && (
              <>
                {section("Style", thumbs("hair", HAIR_STYLES))}
                {section("Color", swatches("hairColor", HAIR_COLORS, "Hair color"))}
              </>
            )}
            {tab === "Eyes" && section("Eyes", thumbs("eyes", EYE_STYLES))}
            {tab === "Mouth" && section("Mouth", thumbs("mouth", MOUTH_STYLES))}
            {tab === "Outfit" && (
              <>
                {section("Shirt", swatches("shirt", SHIRT_COLORS, "Shirt color"))}
                {section("Pants", swatches("pants", PANTS_COLORS, "Pants color"))}
              </>
            )}
            {tab === "Extra" && section("Extra", thumbs("extra", EXTRAS))}
          </div>
        </div>

        <div className="border-t-4 border-[#333] p-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={NAME_MAX}
              placeholder="Name"
              aria-label="Name"
              className="font-nintendo-ds-bios min-w-0 flex-1 border-[3px] border-[#333] bg-background px-2 py-1 text-base text-foreground"
            />
            <button type="button" disabled={busy} onClick={() => setLook(randomLook())} className={`${btn} bg-secondary text-secondary-foreground`}>
              🎲 Randomize
            </button>
          </div>
          {message && (
            <p role="alert" className="mt-2 text-base text-red-600 dark:text-red-300">
              {message}
            </p>
          )}
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            {mine && (
              <button type="button" disabled={busy} onClick={remove} className={`${btn} bg-red-600 text-white`}>
                Delete
              </button>
            )}
            <button type="button" disabled={busy} onClick={submit} className={`${btn} bg-primary text-primary-foreground`}>
              {mine ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
