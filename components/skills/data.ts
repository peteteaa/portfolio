// Skills on /skills. The skill list is the resume's Technical Skills plus the old skills page; "used in"
// comes from the project stacks in components/projects/data.ts, so it stays in step with /projects.
import { FEATURED, TOOLHOUSE_APPS, projectAnchor } from "@/components/projects/data";

export const CATEGORIES = ["Languages", "Frontend", "Backend & data", "AI & agents", "Cloud & tools"] as const;
export type Category = (typeof CATEGORIES)[number];

export type Skill = {
  name: string;
  category: Category;
  logo?: string; // public/images/skills (Simple Icons); tiles without one show the name as text
};

const s = (name: string, category: Category, logo?: string): Skill => ({ name, category, logo: logo && `/images/skills/${logo}.svg` });

export const SKILLS: Skill[] = [
  s("Python", "Languages", "python"),
  s("TypeScript", "Languages", "typescript"),
  s("JavaScript", "Languages", "javascript"),
  s("Java", "Languages", "java"),
  s("Golang", "Languages", "golang"),
  s("C", "Languages", "c"),
  s("HTML", "Languages", "html"),
  s("React", "Frontend", "react"),
  s("Next.js", "Frontend", "nextjs"),
  s("Tailwind CSS", "Frontend", "tailwind"),
  s("Figma", "Frontend", "figma"),
  s("Node.js", "Backend & data", "nodejs"),
  s("Express", "Backend & data", "express"),
  s("Django", "Backend & data", "django"),
  s("Firebase", "Backend & data", "firebase"),
  s("MongoDB", "Backend & data", "mongodb"),
  s("PostgreSQL", "Backend & data", "postgresql"),
  s("Toolhouse", "AI & agents"),
  s("MCP", "AI & agents", "mcp"),
  s("A2A", "AI & agents"),
  s("n8n", "AI & agents", "n8n"),
  s("Zapier", "AI & agents", "zapier"),
  s("Git", "Cloud & tools", "git"),
  s("Docker", "Cloud & tools", "docker"),
  s("AWS", "Cloud & tools"),
  s("Vercel", "Cloud & tools", "vercel"),
  s("Unity", "Cloud & tools", "unity"),
];

export const SPOKEN = ["English (fluent)", "Thai (fluent)"];

export type Evidence = { label: string; href: string; note?: string };

// project stack names that mean more than one skill
const ALIASES: Record<string, string[]> = { TSX: ["TypeScript", "React"] };

// facts that aren't in the project list
const EXTRA: Record<string, Evidence[]> = {
  "Next.js": [{ label: "This portfolio", href: "https://github.com/peteteaa/portfolio", note: "Next.js 15 App Router" }],
  React: [{ label: "This portfolio", href: "https://github.com/peteteaa/portfolio" }],
  TypeScript: [{ label: "This portfolio", href: "https://github.com/peteteaa/portfolio" }],
  "Tailwind CSS": [{ label: "This portfolio", href: "https://github.com/peteteaa/portfolio" }],
  Vercel: [{ label: "This portfolio", href: "https://github.com/peteteaa/portfolio", note: "hosting" }],
  Git: [{ label: "github.com/peteteaa", href: "https://github.com/peteteaa" }],
  Toolhouse: [{ label: "Developer Advocate → Forward Deployed Engineer", href: "/about", note: "at Toolhouse" }],
};

export function evidenceFor(skill: string): Evidence[] {
  const out: Evidence[] = [];
  for (const p of [...FEATURED, ...TOOLHOUSE_APPS]) {
    const names = p.stack.flatMap((t) => ALIASES[t] ?? [t]);
    if (names.includes(skill)) out.push({ label: p.name, href: `/projects#${projectAnchor(p.name)}`, note: p.awards?.[0] });
  }
  return [...out, ...(EXTRA[skill] ?? [])];
}
