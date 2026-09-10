export type InterventionClass = "judgment" | "authority" | "context" | "failure" | "tooling";

export type ShippedOutcome = {
  id: string;
  date: string;
  outcome: string;
  durableDestination: string;
  captainMinutes: number | null;
  captainMinutesNote?: string;
  interventions: Partial<Record<InterventionClass, number>>;
};

export const USEFUL_SHIPPED_OUTCOME_DEFINITION =
  "A user-visible, operational, research, or governance change that reaches its intended durable destination and would still have value if no further work were done on it.";

export const OPERATING_METRICS_COPY = {
  metadataTitle: "Operating Metrics | BenChanTech",
  metadataDescription:
    "How Ben Chan Tech measures Captain effort against useful AI-assisted shipped outcomes.",
  eyebrow: "$20 company · measurement",
  title: "Operating metrics",
  logLabel: "Current outcome log",
  destinationLabel: "Destination",
  captainMinutesLabel: "Captain minutes",
  unknownLabel: "unknown",
  interventionNote:
    "Interventions are classified as judgment, authority, missing context, execution failure, or tooling. Unknown historical values remain unknown rather than being reconstructed from memory.",
  backLabel: "All experiments"
} as const;

export const SHIPPED_OUTCOMES: readonly ShippedOutcome[] = [
  {
    id: "ai-native-company-migration",
    date: "2026-09-10",
    outcome: "Prepared Ben Chan Tech for the $20 AI-native company mission while preserving existing public surfaces.",
    durableDestination: "GitHub / Benchantech site",
    captainMinutes: null,
    captainMinutesNote: "Not captured contemporaneously; intentionally not reconstructed.",
    interventions: {}
  },
  {
    id: "automated-usage-meter",
    date: "2026-09-10",
    outcome: "Built the lightweight GPT/Codex usage meter path without adding a paid service.",
    durableDestination: "Benchantech operating meter",
    captainMinutes: null,
    captainMinutesNote: "Not captured contemporaneously; intentionally not reconstructed.",
    interventions: {}
  }
] as const;
