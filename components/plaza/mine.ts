import type { Look, PlazaCharacter } from "@/lib/plaza/look";

// The visitor's own plaza character, remembered in localStorage (the token lets them edit or delete it later).
export type Mine = { id: string; token: string; name: string; look: Look };

const KEY = "plaza-mine";

export const PLAZA_OPEN_EVENT = "plaza:open";
// CustomEvent detail: the saved PlazaCharacter, or null when it was deleted
export const PLAZA_SAVED_EVENT = "plaza:saved";

export function getMine(): Mine | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    if (v && typeof v.id === "string" && typeof v.token === "string" && typeof v.name === "string" && v.look) return v as Mine;
  } catch {}
  return null;
}

export function setMine(v: Mine) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {}
}

export function clearMine() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

export function openPlazaMaker() {
  window.dispatchEvent(new Event(PLAZA_OPEN_EVENT));
}

export function firePlazaSaved(character: PlazaCharacter | null) {
  window.dispatchEvent(new CustomEvent<PlazaCharacter | null>(PLAZA_SAVED_EVENT, { detail: character }));
}
