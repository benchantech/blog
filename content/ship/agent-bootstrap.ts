import type { ContentOrigin, ContentStatus } from "@/lib/content-status";

export interface AgentBootstrap {
  id: string;
  status: ContentStatus;
  origin: ContentOrigin;
  lines: readonly string[];
  sourceIds: readonly string[];
}

/**
 * Current repository bootstrap after the 2026-09-10 AI-native company pivot.
 *
 * The Company Constitution and Current State are now the first authority an
 * agent reads. The preserved Author Ship records remain part of the historical
 * and governance substrate, but they no longer define the company's current
 * mission by themselves.
 */
export const agentBootstrap = {
  id: "agent-bootstrap",
  status: "published",
  origin: "BEN_APPROVED",
  lines: [
    "Read company/CONSTITUTION.md and company/CURRENT_STATE.md first.",
    "Read docs/adr/README.md and every ADR whose Status is ACCEPTED; check each one's Stale-when condition before relying on it.",
    "When preserved Author Ship surfaces are relevant, read the current Author Ship state, Standing Orders, and the most recent Ship's Log entries for the task.",
    "Do not reconstruct superseded decisions from older material when a newer captain-approved state exists.",
    "Operate inside delegated authority and keep the $20 AI operating constraint in force."
  ],
  sourceIds: ["company-constitution", "company-current-state"]
} as const satisfies AgentBootstrap;

export function agentBootstrapText(): string {
  return agentBootstrap.lines.join(" ");
}

export function historicalSnapshotInstruction(): string {
  return agentBootstrap.lines[3];
}
