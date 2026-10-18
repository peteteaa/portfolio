// A small name blocklist for plaza characters. It's a speed bump, not a filter: anything that
// slips through can be removed with the admin DELETE on /api/plaza.

const BLOCKED = [
  "fuck", "shit", "bitch", "cunt", "pussy", "asshole", "bastard", "whore", "slut",
  "nigg", "fag", "retard", "nazi", "hitler", "kkk", "porn", "penis", "vagina",
];

// undo common letter swaps (sh1t, a$$) before matching
const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", $: "s" };

export function isNameAllowed(name: string): boolean {
  const squashed = name
    .toLowerCase()
    .replace(/[013457@$]/g, (c) => LEET[c])
    .replace(/[^a-z]/g, "");
  return !BLOCKED.some((word) => squashed.includes(word));
}
