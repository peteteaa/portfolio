import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import type { Look, PlazaCharacter } from "./look";

// Redis layout (the free plan has one database, so local dev and preview deploys use "plaza-dev:"
// keys instead of "plaza:" and never touch the live site's characters):
//   plaza:char:<id>  JSON StoredCharacter
//   plaza:recent     zset of ids, scored by createdAt; only the newest KEEP survive
const NS = process.env.VERCEL_ENV === "production" ? "plaza" : "plaza-dev";
const RECENT = `${NS}:recent`;
const charKey = (id: string) => `${NS}:char:${id}`;
const KEEP = 300;

type StoredCharacter = PlazaCharacter & { tokenHash: string };

// created on first use so `next build` doesn't need the Upstash env vars
let _redis: Redis | null = null;
function redis() {
  if (!_redis) _redis = Redis.fromEnv();
  return _redis;
}

let _createLimit: Ratelimit | null = null;
export function createLimit() {
  if (!_createLimit) {
    _createLimit = new Ratelimit({ redis: redis(), limiter: Ratelimit.slidingWindow(3, "1 h"), prefix: `${NS}:rl` });
  }
  return _createLimit;
}

const hash = (token: string) => createHash("sha256").update(token).digest("hex");

function tokenMatches(token: unknown, tokenHash: string) {
  if (typeof token !== "string" || !token) return false;
  const a = Buffer.from(hash(token), "hex");
  const b = Buffer.from(tokenHash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

const toPublic = ({ id, name, look, createdAt }: StoredCharacter): PlazaCharacter => ({ id, name, look, createdAt });

export async function listRecent(limit: number): Promise<PlazaCharacter[]> {
  const ids = await redis().zrange<string[]>(RECENT, 0, limit - 1, { rev: true });
  if (!ids.length) return [];
  const rows = await redis().mget<(StoredCharacter | null)[]>(...ids.map(charKey));
  return rows.filter((r): r is StoredCharacter => Boolean(r)).map(toPublic);
}

export async function createCharacter(name: string, look: Look): Promise<{ character: PlazaCharacter; token: string }> {
  const id = randomBytes(8).toString("hex");
  const token = randomBytes(24).toString("base64url");
  const stored: StoredCharacter = { id, name, look, createdAt: Date.now(), tokenHash: hash(token) };

  await redis().multi().set(charKey(id), stored).zadd(RECENT, { score: stored.createdAt, member: id }).exec();

  // drop everything older than the newest KEEP
  const stale = await redis().zrange<string[]>(RECENT, 0, -(KEEP + 1));
  if (stale.length) await redis().multi().zrem(RECENT, ...stale).del(...stale.map(charKey)).exec();

  return { character: toPublic(stored), token };
}

type OwnerResult = "ok" | "missing" | "forbidden";

export async function updateCharacter(id: string, token: unknown, name: string, look: Look): Promise<OwnerResult> {
  const stored = await redis().get<StoredCharacter>(charKey(id));
  if (!stored) return "missing";
  if (!tokenMatches(token, stored.tokenHash)) return "forbidden";
  await redis().set(charKey(id), { ...stored, name, look });
  return "ok";
}

// token === null means the caller is already authorized (admin)
export async function deleteCharacter(id: string, token: unknown | null): Promise<OwnerResult> {
  const stored = await redis().get<StoredCharacter>(charKey(id));
  if (!stored) return "missing";
  if (token !== null && !tokenMatches(token, stored.tokenHash)) return "forbidden";
  await redis().multi().zrem(RECENT, id).del(charKey(id)).exec();
  return "ok";
}
