// Tiles on the homepage's bottom screen (the 3DS HOME menu). Selecting one shows its banner on the
// top screen; opening it follows `href` or runs `action`.

export type HomeAction = "terminal" | "chat" | "blackjack" | "intro" | "plaza" | "folder" | "back";

export type HomeApp = {
  id: string;
  name: string; // label under the tile
  title: string; // banner title on the top screen
  tagline: string; // banner line under the title
  img: string;
  imgSize: number;
  href?: string;
  action?: HomeAction;
};

export const HOME_APPS: HomeApp[] = [
  { id: "projects", name: "Projects", title: "Projects", tagline: "Capital Sage, LaunchPad, Love Bubbles, LeetRizz, Mahjong & more", img: "/images/umbreon.png", imgSize: 32, href: "/projects" },
  { id: "skills", name: "Skills", title: "Skills", tagline: "The languages, frameworks & tools I work with", img: "/images/greninja.png", imgSize: 48, href: "/skills" },
  { id: "contact", name: "Contact", title: "Contact", tagline: "Email, GitHub, LinkedIn & Instagram", img: "/images/beldum.png", imgSize: 48, href: "/contact" },
  { id: "about", name: "About", title: "About", tagline: "Developer Advocate · CS Student · Pokémon Trainer", img: "/images/machamp.png", imgSize: 32, href: "/about" },
  { id: "terminal", name: "Terminal", title: "NERV Terminal", tagline: "Descend to Central Dogma and explore from a real shell", img: "/images/metagross.png", imgSize: 48, action: "terminal" },
  { id: "interests", name: "Interests", title: "Interests", tagline: "Folder · Pokémon cards, bouldering, Muay Thai, running & AI / ML", img: "/images/spheal.png", imgSize: 32, action: "folder" },
  { id: "pokemon-cards", name: "Cards", title: "Pokémon Cards", tagline: "My collection, a card search & a pack-opening simulator", img: "/images/lucario.png", imgSize: 48, href: "/interests/pokemon-cards" },
  { id: "blackjack", name: "Blackjack", title: "Blackjack", tagline: "Play a hand against the dealer", img: "/images/masterball-new.png", imgSize: 40, action: "blackjack" },
  { id: "chat", name: "Chatroom", title: "Chatroom", tagline: "Chat with PeteBot", img: "/images/pokeball.png", imgSize: 40, action: "chat" },
  { id: "plaza", name: "Mii Maker", title: "Mii Maker", tagline: "Make a character to walk around the bottom of the site", img: "/images/eevee-run.gif", imgSize: 48, action: "plaza" },
  { id: "intro", name: "Intro", title: "Boot Intro", tagline: "Replay the Evangelion boot sequence", img: "/images/whooper.png", imgSize: 32, action: "intro" },
];

// contents of the Interests folder
export const INTEREST_APPS: HomeApp[] = [
  { id: "back", name: "Back", title: "HOME Menu", tagline: "Close the Interests folder", img: "", imgSize: 0, action: "back" },
  { id: "i-pokemon-cards", name: "Cards", title: "Pokémon Cards", tagline: "My collection, a card search & a pack-opening simulator", img: "/images/lucario.png", imgSize: 48, href: "/interests/pokemon-cards" },
  { id: "i-bouldering", name: "Bouldering", title: "Bouldering", tagline: "Interests & hobbies", img: "/images/aurorus.png", imgSize: 32, href: "/interests/bouldering" },
  { id: "i-muay-thai", name: "Muay Thai", title: "Muay Thai", tagline: "Interests & hobbies", img: "/images/machamp.png", imgSize: 32, href: "/interests/muay-thai" },
  { id: "i-running", name: "Running", title: "Running", tagline: "Interests & hobbies", img: "/images/jolteon-run.gif", imgSize: 48, href: "/interests/running" },
  { id: "i-ai-ml", name: "AI / ML", title: "AI / ML", tagline: "Interests & hobbies", img: "/images/lunatone.png", imgSize: 36, href: "/interests/ai-ml" },
];
