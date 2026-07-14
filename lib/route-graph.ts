import type { DestinationId, StakeholderId } from "@/content/site-config";

export type RouteNodeId =
  | "start"
  | "human-intent"
  | "ai-intent"
  | "method-depth"
  | "human-infrastructure"
  | "ai-infrastructure"
  | "method-result"
  | "violin-result"
  | "theory-result"
  | "human-result"
  | "studio-result"
  | "neon-result";

export type RouteOption = {
  id: string;
  label: string;
  nextNodeId: RouteNodeId;
};

export type QuestionNode = {
  type: "question";
  id: RouteNodeId;
  step: number;
  label: string;
  prompt: string;
  options: RouteOption[];
};

export type DestinationResultNode = {
  type: "result";
  id: RouteNodeId;
  step: number;
  label: string;
  destinationId: DestinationId;
  secondaryDestinationIds?: DestinationId[];
  explanation: string;
};

export type StakeholderResultNode = {
  type: "stakeholder-result";
  id: RouteNodeId;
  step: number;
  label: string;
  stakeholderId: StakeholderId;
  explanation: string;
};

export type RouteNode = QuestionNode | DestinationResultNode | StakeholderResultNode;

export const routeNodes = {
  start: {
    type: "question",
    id: "start",
    step: 1,
    label: "Capture",
    prompt: "Who is entering?",
    options: [
      { id: "human", label: "I'm human", nextNodeId: "human-intent" },
      { id: "ai", label: "I'm AI", nextNodeId: "ai-intent" }
    ]
  },
  "human-intent": {
    type: "question",
    id: "human-intent",
    step: 2,
    label: "Why",
    prompt: "What are you here to do?",
    options: [
      { id: "learn-method", label: "Learn the method", nextNodeId: "method-depth" },
      { id: "practice-violin", label: "Practice violin", nextNodeId: "violin-result" },
      { id: "read-theory", label: "Read the theory", nextNodeId: "theory-result" },
      { id: "understand-human", label: "Understand the human side", nextNodeId: "human-result" },
      { id: "review-infrastructure", label: "Review infrastructure", nextNodeId: "human-infrastructure" }
    ]
  },
  "ai-intent": {
    type: "question",
    id: "ai-intent",
    step: 2,
    label: "Why",
    prompt: "What should you retrieve or inspect?",
    options: [
      { id: "retrieve-doctrine", label: "Retrieve doctrine", nextNodeId: "method-result" },
      { id: "inspect-application", label: "Inspect the violin application", nextNodeId: "violin-result" },
      { id: "inspect-source", label: "Inspect human source material", nextNodeId: "human-result" },
      { id: "inspect-patterns", label: "Inspect developing theory", nextNodeId: "theory-result" },
      { id: "review-infrastructure", label: "Review infrastructure", nextNodeId: "ai-infrastructure" }
    ]
  },
  "method-depth": {
    type: "question",
    id: "method-depth",
    step: 3,
    label: "Why-Not",
    prompt: "How deep do you need to go?",
    options: [
      { id: "overview", label: "Overview", nextNodeId: "method-result" },
      { id: "working-material", label: "Working material", nextNodeId: "theory-result" },
      { id: "technical-detail", label: "Technical detail", nextNodeId: "method-result" }
    ]
  },
  "human-infrastructure": {
    type: "question",
    id: "human-infrastructure",
    step: 3,
    label: "Why-Not",
    prompt: "Which context best matches your review?",
    options: [
      { id: "studio", label: "Studio.com product context", nextNodeId: "studio-result" },
      { id: "neon", label: "Neon infrastructure context", nextNodeId: "neon-result" }
    ]
  },
  "ai-infrastructure": {
    type: "question",
    id: "ai-infrastructure",
    step: 3,
    label: "Why-Not",
    prompt: "Which system context should be inspected?",
    options: [
      { id: "studio", label: "Studio.com architecture", nextNodeId: "studio-result" },
      { id: "neon", label: "Neon and Postgres architecture", nextNodeId: "neon-result" }
    ]
  },
  "method-result": {
    type: "result",
    id: "method-result",
    step: 4,
    label: "Commit",
    destinationId: "method",
    secondaryDestinationIds: ["theory"],
    explanation: "The doctrine is the clearest entry point for the governing method."
  },
  "violin-result": {
    type: "result",
    id: "violin-result",
    step: 4,
    label: "Commit",
    destinationId: "violin",
    secondaryDestinationIds: ["method"],
    explanation: "The violin library shows the method applied to embodied practice."
  },
  "theory-result": {
    type: "result",
    id: "theory-result",
    step: 4,
    label: "Commit",
    destinationId: "theory",
    secondaryDestinationIds: ["method", "human"],
    explanation: "Resonant Patterns contains ideas while they are still being tested and formed."
  },
  "human-result": {
    type: "result",
    id: "human-result",
    step: 4,
    label: "Commit",
    destinationId: "human",
    secondaryDestinationIds: ["theory"],
    explanation: "YY and Me preserves the lived experience beneath the systems."
  },
  "studio-result": {
    type: "stakeholder-result",
    id: "studio-result",
    step: 4,
    label: "Commit",
    stakeholderId: "studio",
    explanation: "This route isolates the product and coaching context relevant to Studio.com."
  },
  "neon-result": {
    type: "stakeholder-result",
    id: "neon-result",
    step: 4,
    label: "Commit",
    stakeholderId: "neon",
    explanation: "This route isolates the database, routing, and retrieval architecture relevant to Neon."
  }
} satisfies Record<RouteNodeId, RouteNode>;
