"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { HOME_APPS, INTEREST_APPS, type HomeAction, type HomeApp } from "./apps";
import "./home.css";

// The 3DS HOME menu grid. Hovering a tile's icon box, focusing it or arrowing to it selects it (its banner
// shows on the top screen); moving the mouse off the box clears it. Click, Enter or a second tap opens it.
// Esc closes the folder or clears the selection.

const COLS = 5;

type Props = {
  selectedId: string | null;
  onSelect: (app: HomeApp | null, touch: boolean) => void;
  onAction: (action: Exclude<HomeAction, "folder" | "back">) => void;
  disabled?: boolean; // e.g. while the chatroom is open
};

export default function AppGrid({ selectedId, onSelect, onAction, disabled }: Props) {
  const [inFolder, setInFolder] = useState(false);
  const apps = inFolder ? INTEREST_APPS : HOME_APPS;
  const tiles = useRef<(HTMLElement | null)[]>([]);
  const pointer = useRef("mouse");
  const touch = () => pointer.current === "touch";

  const select = (i: number, focus = false) => {
    const app = apps[Math.max(0, Math.min(apps.length - 1, i))];
    onSelect(app, touch());
    if (focus) tiles.current[apps.indexOf(app)]?.focus({ preventScroll: true });
  };

  const openFolder = (open: boolean) => {
    setInFolder(open);
    const list = open ? INTEREST_APPS : HOME_APPS;
    const target = open ? list[1] : list.find((a) => a.id === "interests")!;
    onSelect(target, touch());
    // focus the matching tile once the folder has rendered
    requestAnimationFrame(() => tiles.current[list.indexOf(target)]?.focus({ preventScroll: true }));
  };

  // links navigate on their own; everything else runs here
  const activate = (app: HomeApp) => {
    if (app.action === "folder") openFolder(true);
    else if (app.action === "back") openFolder(false);
    else if (app.action) onAction(app.action);
  };

  const onTileClick = (e: MouseEvent, app: HomeApp) => {
    // touch screens: first tap selects and shows the banner, second tap opens (like a real 3DS)
    if (touch() && selectedId !== app.id) {
      e.preventDefault();
      onSelect(app, true);
      return;
    }
    if (!app.href) {
      e.preventDefault();
      activate(app);
    }
  };

  // D-pad: arrow keys move, Enter opens, Esc backs out
  useEffect(() => {
    if (disabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement as HTMLElement | null;
      if (el && (/^(input|textarea|select)$/i.test(el.tagName) || el.isContentEditable)) return;
      if (document.querySelector(".eva-boot, .nerv-launch")) return; // an intro or launch is playing
      pointer.current = "mouse";
      const idx = apps.findIndex((a) => a.id === selectedId);
      const moves: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: COLS, ArrowUp: -COLS };
      if (e.key in moves) {
        e.preventDefault();
        select(idx < 0 ? 0 : idx + moves[e.key], true);
      } else if (e.key === "Enter" && idx >= 0) {
        // handled here for every tile (preventDefault stops the browser also activating a focused one)
        e.preventDefault();
        tiles.current[idx]?.click();
      } else if (e.key === "Escape") {
        if (inFolder) openFolder(false);
        else {
          onSelect(null, false);
          el?.blur();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div>
      <div className="mb-3 h-6 text-xl text-foreground/70">
        {inFolder ? (
          <button className="hover:text-foreground" onClick={() => openFolder(false)}>
            HOME ▸ Interests
          </button>
        ) : (
          "HOME"
        )}
      </div>
      <div className="grid grid-cols-5 gap-10">
        {apps.map((app, i) => {
          const selected = app.id === selectedId;
          const icon =
            app.action === "folder" ? (
              // folder tile: tiny previews of what's inside
              <div className="grid grid-cols-2 gap-[2px]">
                {INTEREST_APPS.slice(1, 5).map((f) => (
                  <Image key={f.id} src={f.img} width={20} height={20} alt="" className="h-5 w-5 object-contain pixelated" />
                ))}
              </div>
            ) : app.img ? (
              <Image src={app.img} width={app.imgSize} height={app.imgSize} alt="" className="pixelated" />
            ) : (
              <span className="text-3xl leading-none">◀</span>
            );
          const tile = (
            <>
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-md folder-select ${app.action === "folder" ? "home-folder" : "bg-[#333]/20"} ${selected ? "is-selected" : ""}`}
                onMouseEnter={() => !touch() && onSelect(app, false)}
                onMouseLeave={() => !touch() && onSelect(null, false)}
              >
                {icon}
              </div>
              <span className="mt-1 text-xl text-foreground">{app.name}</span>
            </>
          );
          const common = {
            ref: (el: HTMLElement | null) => {
              tiles.current[i] = el;
            },
            className: "home-tile flex flex-col items-center justify-self-center outline-none",
            "aria-label": app.title,
            onPointerDown: (e: React.PointerEvent) => (pointer.current = e.pointerType),
            onFocus: () => onSelect(app, touch()),
            onClick: (e: MouseEvent) => onTileClick(e, app),
          };
          return app.href ? (
            <Link key={app.id} href={app.href} {...common}>
              {tile}
            </Link>
          ) : (
            <button key={app.id} type="button" {...common}>
              {tile}
            </button>
          );
        })}
      </div>
    </div>
  );
}
