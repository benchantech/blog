/**
 * Designed rituals (WYS §8.8, §15).
 *
 * `origin` is ADDED to §8.8's listing (plan §6.1): a ritual's `learnerTask` and
 * `purpose` render on Today and Practice as placeholder copy and have to be
 * distinguishable from Ben-authored material.
 *
 * FOUR RITUALS SHIP AS DATA. Detox, From Memory, the local rulebook review, and
 * the transfer check. §8.8 also names "Memory Audit later"; it is deliberately
 * NOT authored, because (WYS §2.2) requires future concepts to be "disabled and
 * invisible in v0" and an authored record is one import away from a screen.
 *
 * THE TRANSFER CHECK SHIPS WITHOUT A SURFACE, and that has a consequence worth
 * stating rather than leaving implicit. Plan Phase 7 defers the transfer-check
 * UI (no artboard draws one), while (WYS §12)'s 5-day path ends "Day 5: delayed
 * retrieval or transfer + CARRY". Q24's ratified default is that the 5-day
 * cadence path ships with Day 5 as CARRY-only — see `weeks.ts`, where the path
 * is data, and docs/facelift-unapproved.md, where the narrowing is recorded.
 *
 * `appMustNotDo` is the load-bearing field. Everything on it is a refusal the
 * spec states plainly, and Phase 7 wires components against these lists.
 */

import type { WysRitual } from "./types";

export type WysRitualId = "rit-detox" | "rit-from-memory" | "rit-rulebook-review" | "rit-transfer-check";

export const WYS_RITUAL_IDS: readonly WysRitualId[] = [
  "rit-detox",
  "rit-from-memory",
  "rit-rulebook-review",
  "rit-transfer-check"
];

export const wysRituals = [
  {
    id: "rit-detox",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    name: "Detox",
    purpose: "Separate judgment the learner has from judgment a tool was supplying.",
    aiPresence: "none",
    prerequisites: ["Stop F has been reached."],
    learnerTask: "Go a chosen stretch without the tool, then come back and answer one structured question.",
    cadence: "Once, at stop F.",
    appMustNotDo: [
      "Ask for a diary entry about what happened.",
      "Send a reminder while the exercise is running.",
      "Record anything during the exercise at all.",
      "Mark it complete because time passed."
    ],
    records: ["That the learner marked it done, and when they set their return cue."],
    remainsLocalOrOffline: ["Everything the learner noticed.", "Whatever they chose to avoid."],
    returnTiming: "Set by the learner when they start; the site holds only the cue.",
    revealSequence: ["Return", "one structured retrieval question", "then the CARRY"],
    successEvidence: ["The learner explicitly marks it taken after returning."],
    failureModes: [
      "Treating the stretch itself as the achievement.",
      "Avoiding every situation that would have tested the recall.",
      "Turning the return question into a confessional."
    ],
    principleIds: ["prn-retrieve-before-checking"],
    sourceIds: ["wys-spec-15-2", "artboard-5b-plan"],
    emptyReferenceReason:
      "The completion rule is authored, not specified; flagged in docs/facelift-unapproved.md."
  },
  {
    id: "rit-from-memory",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    name: "From Memory",
    purpose: "Attempt recall before checking, so assisted success cannot pass for learned judgment.",
    aiPresence: "none",
    prerequisites: ["At least one stop has been visited."],
    learnerTask: "Say the habit aloud, write it on paper, or type it into the scratch box, then check.",
    cadence: "Whenever the learner opens Practice.",
    appMustNotDo: [
      "Persist the scratch text.",
      "Send the scratch text anywhere.",
      "Include the scratch text in any analytics property.",
      "Keep the scratch text across a route change.",
      "Score the answer, or compare it to a model answer."
    ],
    records: ["That the learner marked it done. Nothing they wrote."],
    remainsLocalOrOffline: ["The scratch text, which is never persisted or transmitted."],
    successEvidence: ["The learner marks it done after attempting the recall."],
    failureModes: ["Checking first and then typing the answer back."],
    principleIds: ["prn-retrieve-before-checking", "prn-first-habit"],
    sourceIds: ["wys-spec-15-1", "artboard-5c-practice"],
    emptyReferenceReason: "The cadence is open (WYS §35 decision 8); the default here is learner-initiated."
  },
  {
    id: "rit-rulebook-review",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    name: "Rulebook review",
    purpose: "Keep the learner's own rules honest by attaching the case that broke each one.",
    aiPresence: "none",
    prerequisites: ["At least one rule exists locally."],
    learnerTask: "Read the rules back, revise any that a real situation has already broken.",
    cadence: "At stop H, and whenever the learner chooses.",
    appMustNotDo: [
      "Label a learner rule as Ben doctrine.",
      "Send a rule to analytics.",
      "Rewrite, complete or improve a rule with AI.",
      "Rank rules, or mark one as better than another."
    ],
    records: ["The rules themselves, in this browser, and nothing about them anywhere else."],
    remainsLocalOrOffline: ["Every rule the learner writes."],
    successEvidence: ["A rule is edited or removed by the learner."],
    failureModes: ["A rule kept without the exception that already broke it."],
    principleIds: ["prn-learner-rules-outrank"],
    sourceIds: ["wys-spec-16", "artboard-5b-progress"],
    emptyReferenceReason: "Shipping the rulebook in v0 is Q20, ratified on; the review cadence is the learner's."
  },
  {
    /**
     * Data only in v0. The MODEL, the local-state field and the
     * `wys_transfer_check_complete` event are wired; no screen renders it.
     */
    id: "rit-transfer-check",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    name: "Transfer check",
    purpose: "Ask whether the judgment survives a situation the scenario never showed.",
    aiPresence: "none",
    prerequisites: ["A stop's core decision has been committed."],
    learnerTask: "Answer one structured question about a changed situation, from memory.",
    cadence: "Delayed — days after the stop, not in the same session.",
    appMustNotDo: [
      "Ask for free text.",
      "Score the answer.",
      "Require it before a stop can be completed."
    ],
    records: ["That a transfer check was completed."],
    remainsLocalOrOffline: ["Anything the learner reasoned through to get there."],
    returnTiming: "Deliberately delayed, so it tests retention rather than recall of the last screen.",
    successEvidence: ["A completed structured retrieval, not time elapsed."],
    failureModes: ["Running it immediately, which measures short-term memory and calls it transfer."],
    principleIds: ["prn-retrieve-before-checking"],
    sourceIds: ["wys-spec-12", "wys-spec-13"],
    emptyReferenceReason:
      "No artboard draws a transfer-check surface, so v0 ships the data shape without a screen (Q24)."
  }
] as const satisfies readonly WysRitual[];

export function wysRitualById(id: WysRitualId): WysRitual {
  const record = wysRituals.find((ritual) => ritual.id === id);
  if (!record) throw new Error(`No WYS ritual with id "${id}".`);
  return record;
}
