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
 * The Company Constitution and Current State are now the first authority an
 * agent reads. Preserved Author Ship records remain historical/governance
 * substrate rather than the company's sole current mission.
 */
/**
 * The one line another module needs to reach by name.
 *
 * NAMED, NOT INDEXED, AND THIS IS THE THIRD TIME (2026-09-10).
 * `historicalSnapshotInstruction()` returned `lines[3]` when this file had four
 * lines and that sentence was last. A line was inserted BEFORE it on
 * 2026-09-08, so the accessor was repointed to `lines[lines.length - 1]` — and
 * then a line was appended AFTER it on 2026-09-10, which broke the
 * back-indexed reference the same way the front-indexed one had broken.
 *
 * Both directions fail for one reason: a position is not an identity. The
 * constant IS the sentence, `lines` composes from it, and the accessor returns
 * it — so a line may now be added at either end, or in the middle, and nothing
 * has to be re-derived. `tests/machine-surfaces.test.ts` asserts membership
 * rather than a slot, for the same reason.
 */
export const HISTORICAL_SNAPSHOT_INSTRUCTION =
  "Do not reconstruct superseded decisions from older material when a newer captain-approved state exists.";

export const agentBootstrap = {
  id: "agent-bootstrap",
  status: "published",
  origin: "BEN_APPROVED",
  lines: [
    "Read company/CONSTITUTION.md and company/CURRENT_STATE.md first.",
    "Read docs/adr/README.md and every ADR whose Status is ACCEPTED; check each one's Stale-when condition before relying on it.",
    "When preserved Author Ship surfaces are relevant, read the current Author Ship state, Standing Orders, and the most recent Ship's Log entries for the task.",
    HISTORICAL_SNAPSHOT_INSTRUCTION,
    "Operate inside delegated authority and keep the $20 AI operating constraint in force."
  ],
  sourceIds: []
} as const satisfies AgentBootstrap;

export function agentBootstrapText(): string {
  return agentBootstrap.lines.join(" ");
}

export function historicalSnapshotInstruction(): string {
  return HISTORICAL_SNAPSHOT_INSTRUCTION;
}
