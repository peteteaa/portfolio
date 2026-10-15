// Projects on /projects. Text comes from the resume (Resume 26) and the old /projects page;
// screenshots are in public/images/projects (README images or captures of the live sites).

// anchor id for a project's card on /projects (used by the skills page's "used in" links)
export const projectAnchor = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export type Shot = { src: string; alt: string; w: number; h: number };

export type WebProject = {
  name: string;
  event?: string;
  awards?: string[];
  summary: string;
  stack: string[];
  sprite: string; // shown when there's no screenshot yet
  shots?: Shot[];
  live?: string;
  repo?: string;
};

export const FEATURED: WebProject[] = [
  {
    name: "Capital Sage",
    event: "Aparavi / Google / Toolhouse Hackathon, 2025",
    awards: ["1st Place"],
    summary: "Personal finance tool offering stock recommendations, using Toolhouse AI and Gemini for market analysis.",
    stack: ["Toolhouse", "Gemini"],
    sprite: "/images/metagross.png",
  },
  {
    name: "LaunchPad",
    event: "NVIDIA GTC 2025",
    awards: ["2nd Place · Windsurf", "3rd Place · Tavus"],
    summary: "An AI agent that onboards junior developers to GitHub repos with video walkthroughs.",
    stack: ["Gemini", "Tavus", "GitHub API", "Node.js", "Python", "TSX"],
    sprite: "/images/beldum.png",
  },
  {
    name: "Love Bubbles",
    event: "AGI House Hackathon, 2025",
    awards: ["3rd Place"],
    summary: "AI-generated Valentine's cards with celebrity themes: a Valentine's collage generator with a Python backend and JS frontend, using Black Forest Labs' Flux 1.1 Ultra.",
    stack: ["Python", "JavaScript", "Flux 1.1 Ultra", "Windsurf"],
    sprite: "/images/spheal.png",
    shots: [
      { src: "/images/projects/lovebubbles-app.webp", alt: "Love Bubbles app: enter names and generate a card", w: 1280, h: 960 },
      { src: "/images/projects/lovebubbles-card.webp", alt: "A generated Love Bubbles Valentine's card", w: 1280, h: 960 },
      { src: "/images/projects/lovebubbles-cards.webp", alt: "Two generated cards in the Love Bubbles app", w: 1280, h: 960 },
    ],
    repo: "https://github.com/peteteaa/lovebubbles",
  },
  {
    name: "LeetRizz",
    event: "Compsigh Hackathon",
    awards: ["People's Choice"],
    summary: "A LeetCode-style game that measures a user's charisma (\"rizz\") with AI-driven scoring.",
    stack: ["TSX", "Python"],
    sprite: "/images/greninja.png",
    repo: "https://github.com/peteteaa/leetrizz",
  },
  {
    name: "Hong Kong Mahjong",
    summary: "3D Hong Kong mahjong in the browser: draw, discard and call your way to four sets and a pair against three computer players, with faan-based scoring.",
    stack: ["TypeScript", "React", "Three.js"],
    sprite: "/images/umbreon.png",
    shots: [
      { src: "/images/projects/mahjong-game.webp", alt: "A hand in progress on the 3D mahjong table", w: 1280, h: 800 },
      { src: "/images/projects/mahjong-setup.webp", alt: "Mahjong game setup: minimum faan, hands per game and table speed", w: 1280, h: 800 },
    ],
    live: "https://peteteaa-mahjong.vercel.app",
    repo: "https://github.com/peteteaa/mahjong-game",
  },
  {
    name: "WebGun",
    summary: "A browser-based, low-poly multiplayer Gun Game FPS: every kill moves you up a 20-weapon ladder, and the first knife kill wins. The server is authoritative (hit detection, lag compensation and anti-cheat checks all run server-side), and AI bots fill out empty rooms.",
    stack: ["Three.js", "Vite", "Node.js", "Express", "Socket.io"],
    sprite: "/images/machamp.png",
    shots: [
      { src: "/images/projects/webgun-game.webp", alt: "WebGun in-game: the arena, pistol and HUD as bots join", w: 1280, h: 800 },
      { src: "/images/projects/webgun-start.webp", alt: "WebGun start screen: username and map picker", w: 1280, h: 800 },
    ],
    live: "https://webgun-server.onrender.com/",
    repo: "https://github.com/peteteaa/gungame",
  },
  {
    name: "Workflow Memory",
    summary: "Agents shouldn't solve the same web task twice: an agent solves a web task once with TinyFish, the result is compiled into a saved, parameterized workflow, and anyone (human or agent) can rerun it faster and cheaper. The web app streams every TinyFish call live as a workflow is learned.",
    stack: ["TinyFish", "Gemini", "TypeScript", "Vercel"],
    sprite: "/images/spheal.png",
    live: "https://tinyfish-ochre.vercel.app",
    repo: "https://github.com/peteteaa/tinyfish",
  },
  {
    name: "PulseAI",
    event: "MCP & A2A AWS Hackathon, 2025",
    summary: "Summarizes tweets into newsletters using AWS services.",
    stack: ["AWS", "MCP", "A2A"],
    sprite: "/images/lunatone.png",
  },
  {
    name: "DonsFlow",
    event: "Donshack 2025",
    summary: "A YouTube browser with integrated notes and quiz generation, plus a magic-link login and database system.",
    stack: ["Magic-link auth"],
    sprite: "/images/whooper.png",
  },
  {
    name: "Wildfire Logger & Prediction Tool",
    event: "AI for Good & Geoengineering hackathons",
    summary: "Wildfire analysis tools built on NASA and Google Copernicus data.",
    stack: ["Python", "NASA data", "Copernicus"],
    sprite: "/images/solrock.png",
    repo: "https://github.com/peteteaa/WildFirePredictor",
  },
  {
    name: "Course Planner",
    summary: "A tool to help students plan their course schedule efficiently.",
    stack: [],
    sprite: "/images/lucario.png",
  },
];

// example apps from Developer Advocate work at Toolhouse
export const TOOLHOUSE_APPS: WebProject[] = [
  {
    name: "Event Agent",
    summary: "A chatbot interface powered by Toolhouse for managing, discovering and planning events.",
    stack: ["Toolhouse", "Lovable"],
    sprite: "/images/aurorus.png",
    shots: [{ src: "/images/projects/toolhouse-event-agent.webp", alt: "Event Agent landing page", w: 1280, h: 800 }],
    live: "https://toolhouse-event-agent.lovable.app",
    repo: "https://github.com/peteteaa/toolhouse-event-agent",
  },
  {
    name: "Intern Agent",
    summary: "An AI career assistant that helps users find jobs and internships.",
    stack: ["Toolhouse", "Lovable"],
    sprite: "/images/lucario.png",
    shots: [{ src: "/images/projects/toolhouse-intern-agent.webp", alt: "Intern Agent: AI Career Assistant form", w: 1280, h: 800 }],
    live: "https://intern-agent.lovable.app/",
    repo: "https://github.com/peteteaa/intern-agent",
  },
];

export const STACK = {
  Languages: ["Python", "Java", "Golang", "JavaScript", "TypeScript", "HTML"],
  "Frameworks & tools": ["Git", "MCP", "A2A", "Docker", "AWS", "Vercel", "Zapier", "n8n", "Toolhouse"],
};
