import { LOOK_LIMITS } from "@/lib/plaza/look";

// 16x24 pixel grids. '.' is transparent, letters are roles resolved in CharacterSprite:
// S/s skin, H/h hair, T/t shirt, P/p pants, C/c cap (shirt colour), O outline, E eye, W white,
// M mouth, K shoes, G glasses, R red (ball / hair tie), X white (ball / cap logo).
// The character faces right; eyes sit one pixel right of the head's centre so mirroring reads well.

export const GRID_W = 16;
export const GRID_H = 24;

type Palette = { base: string; shade: string };

export const SKIN_TONES: Palette[] = [
  { base: "#ffe0c8", shade: "#f0bfa0" },
  { base: "#f5c9a0", shade: "#e0a67c" },
  { base: "#d9a066", shade: "#bb7f48" },
  { base: "#a8693a", shade: "#874c26" },
  { base: "#6b3f26", shade: "#4d2a17" },
];

export const HAIR_COLORS: Palette[] = [
  { base: "#2a2a2e", shade: "#17171a" },
  { base: "#4a2e1c", shade: "#33200f" },
  { base: "#7b4a26", shade: "#5c3418" },
  { base: "#f2d06b", shade: "#d1ac45" },
  { base: "#c4472b", shade: "#9a3219" },
  { base: "#e4e6ee", shade: "#b4b9c9" },
  { base: "#3f7fe0", shade: "#2d5cae" },
  { base: "#f27fb1", shade: "#d05a90" },
];

export const SHIRT_COLORS: Palette[] = [
  { base: "#e5483c", shade: "#b8332a" },
  { base: "#3f7fe0", shade: "#2d5cae" },
  { base: "#46b865", shade: "#2f8d49" },
  { base: "#f6c93a", shade: "#cf9f1b" },
  { base: "#8e5bd6", shade: "#6a3fae" },
  { base: "#f28c35", shade: "#ca6b1c" },
  { base: "#28b5b0", shade: "#1c8884" },
  { base: "#3a3a42", shade: "#232329" },
];

export const PANTS_COLORS: Palette[] = [
  { base: "#2b3a67", shade: "#1c2748" },
  { base: "#2e2e33", shade: "#1b1b1f" },
  { base: "#c9b27c", shade: "#a38e5a" },
  { base: "#8b8f99", shade: "#666a73" },
  { base: "#7a5230", shade: "#5a3a20" },
  { base: "#4d79b8", shade: "#365a92" },
];

// fixed (non-palette) role colours
export const FIXED_COLORS: Record<string, string> = {
  O: "#1f1b24",
  E: "#1f1b24",
  W: "#ffffff",
  M: "#8a2c3a",
  K: "#5a4636",
  G: "#4a5aa8",
  R: "#e53b3b",
  X: "#ffffff",
};

const BLANK = ".".repeat(GRID_W);

// build a 24-row grid from a sparse { row: string } map
function layer(rows: Record<number, string>): string[] {
  return Array.from({ length: GRID_H }, (_, y) => rows[y] ?? BLANK);
}

const SHORT_FRONT = {
  0: "....OOOOOOOO....",
  1: "...OHHHHHHHHO...",
  2: "..OHHHHHHHHHhO..",
  3: "..OHHHHHHHHHhO..",
  4: "..OHHHHHHhh.....",
  5: "..OHH...........",
};

// side hair hanging behind the head
const SIDE_BACK = (to: number) => {
  const rows: Record<number, string> = {};
  for (let y = 3; y <= to; y++) rows[y] = "OH............HO";
  rows[to + 1] = ".OO..........OO.";
  return rows;
};

export const HAIR_STYLES: { name: string; back?: string[]; front: string[] }[] = [
  { name: "Short", front: layer(SHORT_FRONT) },
  {
    name: "Spiky",
    front: layer({
      0: "....O...O...O...",
      1: "...OHO.OHO.OHO..",
      2: "..OHHHHHHHHHhO..",
      3: "..OHHHHHHHHHhO..",
      4: "..OHHHHHHHHH....",
      5: "..OHH...H.......",
    }),
  },
  {
    name: "Bob",
    back: layer(SIDE_BACK(10)),
    front: layer({
      0: "....OOOOOOOO....",
      1: "...OHHHHHHHHO...",
      2: "..OHHHHHHHHHhO..",
      3: "..OHHHHHHHHHhO..",
      4: "..OHHHHHHHHHhO..",
      5: "..OHH.......HO..",
      6: "..OHH.......HO..",
      7: "..OHH.......HO..",
      8: "..OHH.......HO..",
      9: "..OHH.......HO..",
    }),
  },
  {
    name: "Long",
    back: layer(SIDE_BACK(14)),
    front: layer({
      0: "....OOOOOOOO....",
      1: "...OHHHHHHHHO...",
      2: "..OHHHHHHHHHhO..",
      3: "..OHHHHHHHHHhO..",
      4: "..OHHHHHHHHHhO..",
      5: "..OHH.......HO..",
      6: "..OHH.......HO..",
      7: "..OHH.......HO..",
      8: "..OHH......HHO..",
      9: "..OHH......HHO..",
      10: "..OHH......HHO..",
      11: "..OHH......HHO..",
      12: "..OHH......HHO..",
      13: "..OHH......HHO..",
      14: "..OHHO....OHHO..",
    }),
  },
  {
    name: "Ponytail",
    back: layer({
      4: "OR..............",
      5: "OH..............",
      6: "OH..............",
      7: "OH..............",
      8: "OH..............",
      9: "OH..............",
      10: "OH..............",
      11: "OH..............",
      12: ".O..............",
    }),
    front: layer(SHORT_FRONT),
  },
  {
    name: "Buzz",
    front: layer({
      2: "...OHHHHHHHHO...",
      3: "..OHHHHHHHHHhO..",
      4: "..OHH......hHO..",
    }),
  },
];

export const EYE_STYLES: { name: string; grid: string[] }[] = [
  { name: "Dots", grid: layer({ 6: "......E...E.....", 7: "......E...E....." }) },
  {
    name: "Big",
    grid: layer({ 5: "......EE..EE....", 6: "......WE..WE....", 7: "......EE..EE...." }),
  },
  { name: "Happy ^^", grid: layer({ 6: "......E...E.....", 7: ".....E.E.E.E...." }) },
  { name: "Sleepy", grid: layer({ 6: "......ss..ss....", 7: "......EE..EE...." }) },
];

export const MOUTH_STYLES: { name: string; grid: string[] }[] = [
  { name: "Smile", grid: layer({ 9: ".......M.M......", 10: "........M......." }) },
  { name: "Open", grid: layer({ 9: ".......MMM......", 10: "........M......." }) },
  { name: "Flat", grid: layer({ 9: "........MM......" }) },
];

export const EXTRAS: { name: string; grid: string[] | null }[] = [
  { name: "None", grid: null },
  {
    name: "Glasses",
    grid: layer({
      4: ".....GGGGGGGG...",
      5: ".....G..GG..G...",
      6: ".....G..GG..G...",
      7: ".....G..GG..G...",
      8: ".....GGGGGGGG...",
    }),
  },
  {
    name: "Cap",
    grid: layer({
      0: "....OOOOOOOO....",
      1: "...OCCCCCCCCO...",
      2: "..OCCCCCCXCCCO..",
      3: "..OCCCCCCCCCcO..",
      4: "..OCCCCCCCcccccO",
    }),
  },
  {
    name: "Bag",
    grid: layer({
      15: "........OOOO....",
      16: "........ORRO....",
      17: "........OOOO....",
      18: "........OXXO....",
      19: "........OOOO....",
    }),
  },
];

// head outline + face + torso + arms (legs are separate so they can animate)
export const BASE_BODY: string[] = layer({
  1: "....OOOOOOOO....",
  2: "...OSSSSSSSsO...",
  3: "..OSSSSSSSSSsO..",
  4: "..OSSSSSSSSSsO..",
  5: "..OSSSSSSSSSsO..",
  6: "..OSSSSSSSSSsO..",
  7: "..OSSSSSSSSSsO..",
  8: "..OSSSSSSSSSsO..",
  9: "..OSSSSSSSSSsO..",
  10: "...OSSSSSSSsO...",
  11: "....OOOOOOOO....",
  12: "...OTTTTTTTTO...",
  13: "..OTtTTTTTTtTO..",
  14: "..OTtTTTTTTtTO..",
  15: "..OSOTTTTTTOSO..",
  16: "..OSOTTTTTTOSO..",
  17: "..OOOttttttOOO..",
});

export const LEGS: [string[], string[]] = [
  layer({
    18: "....OPPPPPPO....",
    19: "....OPPPPPPO....",
    20: "....OPPOOPPO....",
    21: "....OPPOOPPO....",
    22: "....OppOOppO....",
    23: "...OKKKOOKKKO...",
  }),
  layer({
    18: "....OPPPPPPO....",
    19: "....OPPPPPPO....",
    20: "....OPPOOPPO....",
    21: "...OPPO..OPPO...",
    22: "...OppO..OppO...",
    23: "..OKKKO..OKKKO..",
  }),
];

if (process.env.NODE_ENV !== "production") {
  const grids = [
    BASE_BODY,
    ...LEGS,
    ...HAIR_STYLES.flatMap((h) => (h.back ? [h.back, h.front] : [h.front])),
    ...EYE_STYLES.map((e) => e.grid),
    ...MOUTH_STYLES.map((m) => m.grid),
    ...EXTRAS.flatMap((e) => (e.grid ? [e.grid] : [])),
  ];
  for (const g of grids) {
    console.assert(
      g.length === GRID_H && g.every((r) => r.length === GRID_W),
      "plaza parts: grid is not 24x16",
    );
  }
  const counts: [number, number][] = [
    [SKIN_TONES.length, LOOK_LIMITS.skin],
    [HAIR_STYLES.length, LOOK_LIMITS.hair],
    [HAIR_COLORS.length, LOOK_LIMITS.hairColor],
    [EYE_STYLES.length, LOOK_LIMITS.eyes],
    [MOUTH_STYLES.length, LOOK_LIMITS.mouth],
    [SHIRT_COLORS.length, LOOK_LIMITS.shirt],
    [PANTS_COLORS.length, LOOK_LIMITS.pants],
    [EXTRAS.length, LOOK_LIMITS.extra],
  ];
  for (const [n, limit] of counts) console.assert(n === limit, "plaza parts: length != LOOK_LIMITS");
}
