/**
 * The agent bootstrap (plan Phase 9; packet: agent-bootstrap).
 *
 * FOUR SENTENCES, VERBATIM. The plan quotes them in full and marks them
 * "verbatim", so they are stored here once and rendered by three surfaces that
 * would otherwise each hand-type them: `AGENTS.md`, `/llms.txt` and
 * `/author-ship/state.json`. That is Standing Order 07 applied to an
 * instruction rather than to a claim — and `tests/machine-surfaces.test.ts`
 * asserts `AGENTS.md` contains this module's string, so the markdown file
 * cannot drift away from the code.
 *
 * `origin: "EXTERNAL_SOURCE"` — the sentences come from the planning packet,
 * not from this build and not from Ben's approved artboards. R5 is explicit
 * that the packet is unstamped and that packet-derived material must not
 * render as Ben-authored canon; `EXTERNAL_SOURCE` is the origin that says so,
 * and its `general` label is "External source — not Ben's words".
 *
 * `status: "published"` because the instruction ships: it is addressed to
 * machines reading the site, it makes no claim about Ben's positions, and
 * withholding it would leave the machine surfaces without the one line that
 * stops an agent treating a superseded decision as current.
 *
 * THE FOURTH SENTENCE IS LOAD-BEARING TWICE. It is the bootstrap's last line
 * AND it is the "historical snapshots must not be treated as current"
 * instruction the plan requires `/llms.txt` to carry. It is referenced as
 * `agentBootstrap.lines[3]`, never re-typed, so the two surfaces cannot end up
 * with two wordings of one rule.
 */

import type { ContentOrigin, ContentStatus } from "@/lib/content-status";

export interface AgentBootstrap {
  id: string;
  status: ContentStatus;
  origin: ContentOrigin;
  /** The four sentences, in order. */
  lines: readonly string[];
  sourceIds: readonly string[];
}

export const agentBootstrap = {
  id: "agent-bootstrap",
  status: "published",
  origin: "EXTERNAL_SOURCE",
  lines: [
    "Read the current Author Ship state.",
    "Read the Standing Orders.",
    "Read the most recent Ship's Log entries relevant to this task.",
    "Do not reconstruct superseded decisions from older material when a newer captain-approved state exists."
  ],
  sourceIds: ["packet-agent-bootstrap"]
} as const satisfies AgentBootstrap;

/** The bootstrap as one paragraph — the form `AGENTS.md` and `llms.txt` render. */
export function agentBootstrapText(): string {
  return agentBootstrap.lines.join(" ");
}

/**
 * The instruction that historical snapshots must not be treated as current.
 *
 * The bootstrap's fourth sentence, referenced rather than restated. One idea,
 * one canonical definition (Standing Order 07).
 */
export function historicalSnapshotInstruction(): string {
  return agentBootstrap.lines[3];
}
