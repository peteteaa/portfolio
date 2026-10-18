import { memo, useMemo } from "react";
import type { Look } from "@/lib/plaza/look";
import {
  BASE_BODY,
  EXTRAS,
  EYE_STYLES,
  FIXED_COLORS,
  GRID_H,
  GRID_W,
  HAIR_COLORS,
  HAIR_STYLES,
  LEGS,
  MOUTH_STYLES,
  PANTS_COLORS,
  SHIRT_COLORS,
  SKIN_TONES,
} from "./parts";

export type SpriteRect = { x: number; y: number; w: number; fill: string };

// layers are painted into a pixel buffer so later layers replace earlier ones, then runs are merged
export function spriteRects(look: Look, frame: 0 | 1): SpriteRect[] {
  const skin = SKIN_TONES[look.skin] ?? SKIN_TONES[0];
  const hairColor = HAIR_COLORS[look.hairColor] ?? HAIR_COLORS[0];
  const shirt = SHIRT_COLORS[look.shirt] ?? SHIRT_COLORS[0];
  const pants = PANTS_COLORS[look.pants] ?? PANTS_COLORS[0];
  const hair = HAIR_STYLES[look.hair] ?? HAIR_STYLES[0];
  const eyes = EYE_STYLES[look.eyes] ?? EYE_STYLES[0];
  const mouth = MOUTH_STYLES[look.mouth] ?? MOUTH_STYLES[0];
  const extra = EXTRAS[look.extra] ?? EXTRAS[0];

  const colors: Record<string, string> = {
    ...FIXED_COLORS,
    S: skin.base,
    s: skin.shade,
    H: hairColor.base,
    h: hairColor.shade,
    T: shirt.base,
    t: shirt.shade,
    C: shirt.base,
    c: shirt.shade,
    P: pants.base,
    p: pants.shade,
  };

  const layers = [hair.back, BASE_BODY, LEGS[frame], eyes.grid, mouth.grid, hair.front, extra.grid];
  const buf: (string | undefined)[][] = Array.from({ length: GRID_H }, () => new Array(GRID_W));
  for (const grid of layers) {
    if (!grid) continue;
    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        const fill = colors[grid[y][x]];
        if (fill) buf[y][x] = fill;
      }
    }
  }

  const rects: SpriteRect[] = [];
  for (let y = 0; y < GRID_H; y++) {
    let x = 0;
    while (x < GRID_W) {
      const fill = buf[y][x];
      if (!fill) {
        x++;
        continue;
      }
      let end = x + 1;
      while (end < GRID_W && buf[y][end] === fill) end++;
      rects.push({ x, y, w: end - x, fill });
      x = end;
    }
  }
  return rects;
}

type Props = {
  look: Look;
  frame?: 0 | 1;
  facing?: 1 | -1;
  scale?: number;
  className?: string;
  title?: string;
};

function CharacterSprite({ look, frame = 0, facing = 1, scale = 3, className, title }: Props) {
  const { skin, hair, hairColor, eyes, mouth, shirt, pants, extra } = look;
  const rects = useMemo(
    () => spriteRects({ skin, hair, hairColor, eyes, mouth, shirt, pants, extra }, frame),
    [skin, hair, hairColor, eyes, mouth, shirt, pants, extra, frame],
  );

  return (
    <svg
      viewBox={`0 0 ${GRID_W} ${GRID_H}`}
      width={GRID_W * scale}
      height={GRID_H * scale}
      shapeRendering="crispEdges"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <g transform={facing === -1 ? `translate(${GRID_W} 0) scale(-1 1)` : undefined}>
        {rects.map((r) => (
          <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />
        ))}
      </g>
    </svg>
  );
}

export default memo(CharacterSprite);
