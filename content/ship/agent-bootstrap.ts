/**
 * The agent bootstrap (plan Phase 9; packet: agent-bootstrap).
 *
 * FIVE SENTENCES, VERBATIM. The plan quotes four of them in full and marks
 * them "verbatim"; the fifth was added 2026-09-08 and is this repo's own, not
 * the packet's — see below. They are stored here once and rendered by three
 * surfaces that
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
 * THE FIFTH SENTENCE IS THIS REPO'S, ADDED 2026-09-08 (ADR 0008).
 *
 * Agents boot into this repository, act on it, and leave. Decisions made in one
 * session are invisible to the next unless something in the boot path names
 * them — and a decision nobody reads is indistinguishable from a decision never
 * made. Seven ADRs exist precisely because the same failure recurred all
 * session; putting them behind a link nobody is told to open would repeat it.
 *
 * It says "check each one's Stale-when condition" rather than "read the ADRs"
 * on purpose. An ADR whose staleness condition has been met is history, and an
 * agent that follows stale guidance confidently is worse than one that follows
 * none. That is the fourth sentence's rule applied to this repo's own records.
 *
 * THE HISTORICAL-SNAPSHOT SENTENCE IS LOAD-BEARING TWICE. It is the bootstrap's last line
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
  /** The bootstrap sentences, in order. */
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
    "Read docs/adr/README.md and every ADR whose Status is ACCEPTED; check each one's Stale-when condition before relying on it.",
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
  // The historical-snapshot sentence is LAST, so it is indexed from the end.
  // Referencing it positionally from the front broke when the ADR sentence was
  // inserted before it — exactly the drift Standing Order 07 exists to prevent.
  return agentBootstrap.lines[agentBootstrap.lines.length - 1];
}
