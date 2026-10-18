// A plaza character's appearance, shared by the maker, the walking strip and /api/plaza.
// Every field is an index into a part or palette table in components/plaza/parts.ts, so the
// only free text a visitor can submit is the name.

export const LOOK_LIMITS = {
  skin: 5,
  hair: 6,
  hairColor: 8,
  eyes: 4,
  mouth: 3,
  shirt: 8,
  pants: 6,
  extra: 4, // none, glasses, cap, pokeball bag
} as const;

export type LookKey = keyof typeof LOOK_LIMITS;
export type Look = Record<LookKey, number>;

export const LOOK_KEYS = Object.keys(LOOK_LIMITS) as LookKey[];

export const NAME_MAX = 12;

export type PlazaCharacter = {
  id: string;
  name: string;
  look: Look;
  createdAt: number;
};

export function randomLook(): Look {
  const look = {} as Look;
  for (const key of LOOK_KEYS) look[key] = Math.floor(Math.random() * LOOK_LIMITS[key]);
  return look;
}

// returns a clean copy, or null if anything is missing, extra or out of range
export function validateLook(input: unknown): Look | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  if (Object.keys(raw).length !== LOOK_KEYS.length) return null;
  const look = {} as Look;
  for (const key of LOOK_KEYS) {
    const v = raw[key];
    if (typeof v !== "number" || !Number.isInteger(v) || v < 0 || v >= LOOK_LIMITS[key]) return null;
    look[key] = v;
  }
  return look;
}

// collapses whitespace; letters (any script), digits and spaces only
export function cleanName(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const name = input.replace(/\s+/g, " ").trim();
  if (name.length < 1 || name.length > NAME_MAX) return null;
  if (!/^[\p{L}\p{N} ]+$/u.test(name)) return null;
  return name;
}
