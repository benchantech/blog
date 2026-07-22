export type Audience = "human" | "ai";

export type DestinationId = "method" | "violin" | "human" | "theory";

export type StakeholderId = "studio" | "neon";

export type VesselId = "resonant-patterns" | "yy-method" | "yy-and-me" | "yys-world" | "violin-library";

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

export type Vessel = {
  id: VesselId;
  name: string;
  href: string;
  type: string;
  status: string;
  latest: string;
  latestDate: string;
};

export type YardLogEntry = {
  date: string;
  event: string;
};

export type RegistryEntry = {
  vessel: string;
  launched: string;
  status: string;
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

export const stakeholderRoutes = [
  {
    id: "studio",
    title: "For Studio.com",
    description: "Product logic, coaching architecture, and human-AI boundaries.",
    url: "/studio"
  },
  {
    id: "neon",
    title: "For Neon team",
    description: "Database architecture, deterministic routing, retrieval, and current build details.",
    url: "/neon"
  }
] satisfies StakeholderRoute[];

export const currentBuild = {
  title: "Neon-backed teaching infrastructure",
  status: "At the workbench",
  summary: "Deterministic routing, transcript-grounded retrieval, and musician-developer infrastructure.",
  links: [
    { label: "Build notes", href: "/neon" },
    { label: "Coaching runtime", href: "/studio" }
  ]
};

export const vessels = [
  {
    id: "resonant-patterns",
    name: "Resonant Patterns",
    href: "https://benchanviolin.substack.com",
    type: "Personal essays",
    status: "Underway",
    latest: "My truest tuning-fork surface: personal observations of the patterns that resonate with me.",
    latestDate: "July 2026"
  },
  {
    id: "yy-method",
    name: "The YY Method",
    href: "https://yymethod.com",
    type: "Doctrine",
    status: "Active",
    latest: "Current doctrine expressed through the YY lens, including the canonical YY Essays.",
    latestDate: "22 July 2026"
  },
  {
    id: "yy-and-me",
    name: "YY & Me",
    href: "https://yyandme.benchantech.com",
    type: "Personal record",
    status: "Active",
    latest: "The lived experience through which the method, metaphors, and discoveries emerged.",
    latestDate: "2026"
  },
  {
    id: "yys-world",
    name: "YY's World",
    href: "https://yysworld.benchantech.com",
    type: "Creative world",
    status: "Unpredictable",
    latest: "The zany, anything-goes island.",
    latestDate: "2026"
  },
  {
    id: "violin-library",
    name: "BenChanViolin Library",
    href: "https://benchanviolin.com/library",
    type: "Teaching infrastructure",
    status: "In development",
    latest: "Ben's teaching archive and the retrieval system being built around it.",
    latestDate: "July 2026"
  }
] satisfies Vessel[];

export const yardLog = [
  {
    date: "22 July 2026",
    event: "YY Essays established as an official series."
  },
  {
    date: "18 July 2026",
    event: "Library routing moved into deployment work."
  },
  {
    date: "02 July 2026",
    event: "Coaching runtime entered adversarial review."
  }
] satisfies YardLogEntry[];

export const registry = [
  { vessel: "YY & Me", launched: "2026", status: "Active" },
  { vessel: "Resonant Patterns", launched: "2026", status: "Active" },
  { vessel: "The YY Method", launched: "2026", status: "Active" },
  { vessel: "YY's World", launched: "2026", status: "Experimental" },
  { vessel: "BenChanViolin Library", launched: "2026", status: "In development" }
] satisfies RegistryEntry[];
