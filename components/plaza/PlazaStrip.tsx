"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { PlazaCharacter } from "@/lib/plaza/look";
import CharacterSprite from "./CharacterSprite";
import MiiMakerOverlay from "./MiiMakerOverlay";
import { PLAZA_OPEN_EVENT, PLAZA_SAVED_EVENT, getMine } from "./mine";
import "./plaza.css";

// A strip fixed to the bottom of every page where visitors' characters wander about. One fetch on mount,
// one rAF loop for every walker, and positions are written straight to the DOM (no React work per frame).

const SPRITE_W = 32;
const RIGHT_PAD = 44; // keeps walkers clear of the "+" button

type Walker = { x: number; speed: number; dir: 1 | -1; walking: boolean; timer: number; frameT: number; frame: 0 | 1 };

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

function pick(all: PlazaCharacter[], mineId: string | null, cap: number) {
  const mine = all.filter((c) => c.id === mineId);
  const rest = all.filter((c) => c.id !== mineId);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [...mine, ...rest].slice(0, cap);
}

export default function PlazaStrip() {
  const pathname = usePathname();
  const [server, setServer] = useState<PlazaCharacter[]>([]);
  const [mine, setMineState] = useState<PlazaCharacter | null>(null);
  const [makerOpen, setMakerOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [cap, setCap] = useState(20);
  const [seed, setSeed] = useState(0); // bumps when the server list arrives, to reshuffle once

  const els = useRef(new Map<string, HTMLElement>());
  const state = useRef(new Map<string, Walker>());
  const fresh = useRef(new Set<string>());

  // own character from localStorage, then the shared list
  useEffect(() => {
    setCap(window.innerWidth < 768 ? 12 : 20);
    const m = getMine();
    if (m) setMineState({ id: m.id, name: m.name, look: m.look, createdAt: Date.now() });
    fetch("/api/plaza")
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => {
        if (Array.isArray(list)) setServer(list);
        setSeed((n) => n + 1);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onSaved = (e: Event) => {
      const c = (e as CustomEvent<PlazaCharacter | null>).detail;
      if (c) fresh.current.add(c.id);
      setMineState((prev) => {
        if (!c && prev) state.current.delete(prev.id);
        return c;
      });
    };
    const onOpen = () => setMakerOpen(true);
    window.addEventListener(PLAZA_SAVED_EVENT, onSaved);
    window.addEventListener(PLAZA_OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener(PLAZA_SAVED_EVENT, onSaved);
      window.removeEventListener(PLAZA_OPEN_EVENT, onOpen);
    };
  }, []);

  // own character first (replacing any server copy), then a random sample of the rest
  const others = useMemo(() => server.filter((c) => c.id !== mine?.id), [server, mine?.id]);
  const sample = useMemo(
    () => pick(others, null, mine ? cap - 1 : cap),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [others, cap, seed, !!mine]
  );
  const shown = useMemo(() => (mine ? [mine, ...sample] : sample), [mine, sample]);

  const place = useCallback((id: string, w: Walker) => {
    const el = els.current.get(id);
    if (!el) return;
    el.style.transform = `translateX(${w.x.toFixed(1)}px)`;
    el.dataset.frame = String(w.frame);
    const flip = el.querySelector<HTMLElement>(".plaza-flip");
    // the sprite faces right by default
    if (flip) flip.style.transform = w.dir === 1 ? "none" : "scaleX(-1)";
  }, []);

  useEffect(() => {
    if (pathname === "/terminal") return;
    const maxX = () => Math.max(0, window.innerWidth - SPRITE_W - RIGHT_PAD);
    const ids = new Set(shown.map((c) => c.id));
    for (const id of [...state.current.keys()]) if (!ids.has(id)) state.current.delete(id);

    const still = reducedMotion();
    shown.forEach((c, i) => {
      if (state.current.has(c.id)) return;
      const entering = fresh.current.delete(c.id);
      state.current.set(c.id, {
        x: still ? ((i + 0.5) / shown.length) * maxX() : entering ? window.innerWidth : rand(0, maxX()),
        speed: rand(20, 45),
        dir: entering ? -1 : Math.random() < 0.5 ? 1 : -1,
        walking: !still,
        timer: rand(1, 4),
        frameT: 0,
        frame: 0,
      });
    });
    state.current.forEach((w, id) => place(id, w));
    if (still) return;

    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - (last || now)) / 1000, 0.1);
      last = now;
      const max = maxX();
      state.current.forEach((w, id) => {
        w.timer -= dt;
        if (w.timer <= 0) {
          const r = Math.random();
          if (w.walking && r < 0.4) {
            w.walking = false;
            w.timer = rand(1, 3);
          } else {
            w.walking = true;
            if (r > 0.7) w.dir = (w.dir * -1) as 1 | -1;
            w.timer = rand(2, 6);
          }
        }
        if (w.walking) {
          w.x += w.dir * w.speed * dt;
          // walkers entering from the right keep dir -1 until they're inside
          if (w.x <= 0) ((w.x = 0), (w.dir = 1));
          else if (w.x >= max && w.dir === 1) ((w.x = max), (w.dir = -1));
          w.frameT += dt;
          if (w.frameT > 0.15) {
            w.frameT = 0;
            w.frame = w.frame ? 0 : 1;
          }
        } else w.frame = 0;
        place(id, w);
      });
    };
    const start = () => {
      last = 0;
      raf = requestAnimationFrame(tick);
    };
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) start();
    };
    start();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [shown, pathname, place]);

  // keep still characters spread out on resize
  useEffect(() => {
    const onResize = () => {
      if (!reducedMotion()) return;
      const max = Math.max(0, window.innerWidth - SPRITE_W - RIGHT_PAD);
      let i = 0;
      state.current.forEach((w, id) => {
        w.x = ((i++ + 0.5) / state.current.size) * max;
        place(id, w);
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [place]);

  // tapping elsewhere closes an open bubble
  useEffect(() => {
    if (!openId) return;
    const close = (e: PointerEvent) => {
      if (!(e.target as Element).closest?.(".plaza-walker")) setOpenId(null);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [openId]);

  if (pathname === "/terminal") return null;

  return (
    <>
      <div className="plaza-strip" aria-label="Plaza">
        <div className="plaza-ground" />
        {shown.map((c) => {
          const own = c.id === mine?.id;
          return (
            <div
              key={c.id}
              className="plaza-walker"
              data-open={openId === c.id ? "1" : undefined}
              ref={(el) => {
                if (el) els.current.set(c.id, el);
                else els.current.delete(c.id);
              }}
            >
              <div className="plaza-bubble font-nintendo-ds-bios">
                <span>{own ? `★ ${c.name}` : c.name}</span>
                {own && (
                  <button type="button" onClick={() => setMakerOpen(true)}>
                    Edit
                  </button>
                )}
              </div>
              <div className="plaza-flip">
                <span className="plaza-f0">
                  <CharacterSprite look={c.look} frame={0} scale={2} />
                </span>
                <span className="plaza-f1">
                  <CharacterSprite look={c.look} frame={1} scale={2} />
                </span>
              </div>
              <button
                type="button"
                className="plaza-body"
                aria-label={c.name}
                style={{ position: "absolute", inset: 0 }}
                onClick={() => setOpenId((id) => (id === c.id ? null : c.id))}
              />
            </div>
          );
        })}
        <button
          type="button"
          className="plaza-plus font-nintendo-ds-bios"
          aria-label="Make your character"
          title="Make your character"
          onClick={() => setMakerOpen(true)}
        >
          +
        </button>
      </div>
      <MiiMakerOverlay isOpen={makerOpen} onClose={() => setMakerOpen(false)} />
    </>
  );
}
