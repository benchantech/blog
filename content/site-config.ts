export type Audience = "human" | "ai";

export type DestinationId = "method" | "violin" | "human" | "theory";

export type StakeholderId = "studio" | "neon";

export type Destination = {
  id: DestinationId;
  number: number;
  title: string;
  description: string;
  url: string;
  eyebrow: string;
  audiences: Audience[];
};

export type StakeholderRoute = {
  id: StakeholderId;
  title: string;
  description: string;
  url: string;
};

export const destinations = [
  {
    id: "method",
    number: 1,
    title: "Inspect the method",
    description: "Doctrine, operating boundaries, and reasoning architecture.",
    url: "https://yymethod.com/doctrine",
    eyebrow: "YY Method™",
    audiences: ["human", "ai"]
  },
  {
    id: "violin",
    number: 2,
    title: "Apply it to violin",
    description: "The violin teaching library and applied practice.",
    url: "https://benchanviolin.com/library",
    eyebrow: "BenChanViolin Library",
    audiences: ["human", "ai"]
  },
  {
    id: "human",
    number: 3,
    title: "Hear the human",
    description: "Lived experience, memory, and reflection.",
    url: "https://yyandme.benchantech.com",
    eyebrow: "YY and Me",
    audiences: ["human", "ai"]
  },
  {
    id: "theory",
    number: 4,
    title: "Read the theory",
    description: "Essays, notes, and recurring patterns.",
    url: "https://benchanviolin.substack.com",
    eyebrow: "Resonant Patterns",
    audiences: ["human", "ai"]
  }
] satisfies Destination[];

/** Current Studio product, selected by Ben on 2026-09-14. */
export const musicPracticeRpg = {
  name: "Music Practice RPG",
  url: "https://studio.com/apps/benchanviolin/music-practice-rpg?ref=benchanviolin&code=a"
} as const;

export const stakeholderRoutes = [
  {
    id: "studio",
    title: musicPracticeRpg.name,
    description: "Real music practice, meaningful choices, and a continuing fantasy adventure for any instrument or voice.",
    url: "/studio"
  },
  {
    id: "neon",
    title: "For Neon team",
    description: "Database architecture, deterministic routing, retrieval, and current build details.",
    url: "/neon"
  }
] satisfies StakeholderRoute[];
