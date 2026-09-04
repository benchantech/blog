/**
 * The Progress screen's own content (plan Phase 7, the Progress row; mockup
 * `5b` Progress, dc.html:121-145; WYS §13).
 *
 * (WYS §13) — **"Progress is evidence, not a score."** Everything in this
 * module exists to keep that true in the DATA rather than in the copy: the four
 * tile counts are derived from `wys:v1` and content, the denominator is
 * `weeks.length`, and there is no percentage, ratio, streak, rank or
 * agreement-with-Ben aggregate anywhere in it — not because a component
 * declines to render one, but because no function here computes one.
 *
 * Three kinds of thing live here, kept apart the way `./copy.ts` keeps them:
 *
 *  - CANONICAL RECORDS (`progressCopyRecords`) — the two claims the screen
 *    makes: what Progress is, and where the rulebook is stored. Both carry
 *    status, origin and sources and are checked by all eight governance checks.
 *  - PINNED LABELS (`progressLabels`, `progressStatTiles`) — tile labels,
 *    eyebrows and control names. Short strings that are not claims, pinned here
 *    rather than typed into the view so a node cannot end up with two names.
 *    `inspectLocalData` is a REFERENCE to `wysLabels.dataPageLinkLabel`, not a
 *    second copy of it — see the note on that key.
 *  - DERIVATIONS (`progressCounts`, `judgmentRowFor`) — pure functions over the
 *    learner's state. They take the stops and the state as ARGUMENTS, so this
 *    module never imports `./weeks.ts` and the Progress view can import it from
 *    a client component without pulling the whole curriculum — with its draft
 *    prose — into the browser bundle.
 *
 * PROVENANCE MAPPING, unchanged from `./copy.ts` and `./today.ts`: text taken
 * verbatim from an approved artboard is `status: "published"`,
 * `origin: "BEN_APPROVED"` — Ben approved the artboards. The Captain's Stamp is
 * a separate axis carried by `lib/approval-state.ts`.
 */

import type { AnyCanonicalText } from "@/lib/canonical-text";
import type { GateableRecord } from "@/lib/wys/content-gate";
import type { WysCadence, WysLocalStateV1 } from "@/lib/wys/local-state";
import { type VisitCountableStop, visitPositionFor } from "@/lib/wys/visit";
import { wysLabels } from "./copy";

/* -------------------------------------------------------------------------- */
/* 1. Canonical records                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Artboard `5b` Progress, the line under the title (dc.html:124), verbatim.
 *
 * It is the on-screen form of (WYS §13)'s "Progress is evidence, not a score"
 * and of §13's do-not-show list — a claim about how the course measures the
 * learner, not UI chrome — so it is a record rather than a label. There is no
 * longer approved form, so `full` is the drawn sentence pair and nothing is
 * added to it.
 */
export const progressEvidenceText = {
  id: "progress-is-evidence-not-a-score",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["artboard-5b-progress", "wys-spec-13"],
  variantSources: {
    short: ["artboard-5b-progress"],
    full: ["artboard-5b-progress"]
  },
  variants: {
    short: "What you've actually done. No score, no streak, no percentage.",
    full: "What you've actually done. No score, no streak, no percentage."
  }
} as const satisfies AnyCanonicalText;

/**
 * Artboard `5b` Progress, the rulebook footnote (dc.html:143), verbatim.
 *
 * A STORAGE CLAIM, so it is a record and not a label, and it is the reason the
 * export control exists at all: (plan R8) fixes a false public claim in
 * architecture, never in copy, so a screen that says "Export as text any time"
 * has to carry an export affordance. (WYS §16) requires the same thing —
 * exportable as plain text or JSON, editable, deletable — and the artboard
 * draws none of the three controls. They are recorded as additions in
 * docs/facelift-unapproved.md rather than dropped.
 */
export const rulebookStorageText = {
  id: "rulebook-stored-here-only",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["artboard-5b-rulebook-note", "wys-spec-16"],
  variantSources: {
    short: ["artboard-5b-rulebook-note"],
    full: ["artboard-5b-rulebook-note"]
  },
  variants: {
    short: "Stored here only. Export as text any time.",
    full: "Stored here only. Export as text any time."
  }
} as const satisfies AnyCanonicalText;

export const progressCopyRecords: readonly AnyCanonicalText[] = [
  progressEvidenceText,
  rulebookStorageText
];

/* -------------------------------------------------------------------------- */
/* 2. Pinned labels — one node, one name                                      */
/* -------------------------------------------------------------------------- */

/**
 * The Data page's link label is Q6, ratified: ONE link label sitewide.
 *
 * The `5b` Progress row is drawn as "Inspect local data", which is a FIFTH name
 * for the Data page beside the page title, the `4a` pill, the Lesson Zero
 * step-9 row and the tab. Plan §6.8 collapse 4 and Q6's ratified default pin
 * one page title and one link label, so this row renders the pinned label. The
 * amendment is recorded in docs/facelift-unapproved.md; reversing it is a
 * one-line change here and no component edit.
 *
 * It is a REFERENCE rather than a literal for the same reason `./copy.ts`
 * references `content/nav.ts`: two homes for one string is exactly what
 * Standing Order 07 forbids.
 */
export const progressLabels = {
  /** The screen's own name. `CourseScreen` takes it as `title`. */
  screenTitle: "Progress",

  /** Artboard eyebrows, caps TYPED IN THE COPY, never `text-transform`. */
  judgmentsEyebrow: "YOUR JUDGMENTS · KEPT OR REVISED",
  rulebookEyebrow: "YOUR RULEBOOK · YOURS, NOT BEN'S",

  /** The dashed row that opens the add form (dc.html:141). */
  addRule: "+ Add a rule",

  /** Q6, ratified. Defined in ./copy.ts; referenced here. */
  inspectLocalData: wysLabels.dataPageLinkLabel,
  dataPageHref: "/watch-your-step/data",

  /**
   * The two judgment-row states (WYS §13, "judgments revised or retained").
   * Composed by `judgmentRowFor` into "A · kept" / "C → B · revised" — the
   * artboard's own two forms.
   */
  judgmentKept: "kept",
  judgmentRevised: "revised",
  judgmentRevisionArrow: "→",

  /**
   * The zero states. The artboard draws a learner with four judgments and two
   * rules; §5.4 requires Progress to have an honest empty rendering, and an
   * empty section with no explanation reads as a broken one.
   */
  noJudgmentsYet: "Nothing committed yet.",

  /**
   * Controls the artboard does not draw and (WYS §16) requires. Authored by
   * this build; recorded as additions.
   */
  editRule: "Edit",
  deleteRule: "Delete",
  confirmDeleteRule: "Confirm delete",
  saveRule: "Save",
  cancelRule: "Cancel",
  exportRulebook: "Export as text",
  ruleFieldLabel: "Your rule",

  /** The exported file's name. Not on screen; pinned so it has one definition. */
  exportFileName: "watch-your-step-rulebook.txt"
} as const;

export type ProgressLabelKey = keyof typeof progressLabels;

/**
 * How long one learner-authored rule may be.
 *
 * AUTHORED, and a deliberate narrowing: the serializer accepts any string for
 * `rulebook[].text` because it is the one declared free-text field (WYS §16),
 * so the only thing standing between a rulebook and a pasted document is this
 * field's own limit. A rule is a sentence the learner can act on; §7.2's
 * minimisation posture says the input should not invite more than that.
 * Recorded in docs/facelift-unapproved.md.
 */
export const RULE_MAX_LENGTH = 240;

/* -------------------------------------------------------------------------- */
/* 3. The four stat tiles (mockup 5b, dc.html:125-130)                        */
/* -------------------------------------------------------------------------- */

export type ProgressStatId =
  | "stops-completed"
  | "judgments-committed"
  | "carries-taken"
  | "replay-used";

export interface ProgressStatTile {
  id: ProgressStatId;
  /** The artboard's label, verbatim, lower case as drawn. */
  label: string;
}

/**
 * Four tiles, in the drawn order.
 *
 * (WYS §13) lists seven things Progress may show and the artboard tiles four of
 * them; "transfer checks completed" has no tile because the transfer-check
 * SURFACE is deferred in v0 (Q24) and a tile that can only ever read 0 is a
 * worse answer than no tile. "learner rules created locally" and "local data
 * status" are the two sections below the tiles, not tiles. The narrowing is
 * recorded in docs/facelift-unapproved.md.
 *
 * ONLY THE FIRST TILE HAS A DENOMINATOR, as drawn. Giving the other three one
 * would turn three counts into three completion targets, which is the thing
 * §13's do-not-show list exists to prevent.
 */
export const progressStatTiles = [
  { id: "stops-completed", label: "stops completed" },
  { id: "judgments-committed", label: "judgments committed" },
  { id: "carries-taken", label: "carries taken" },
  { id: "replay-used", label: "replay used" }
] as const satisfies readonly ProgressStatTile[];

/* -------------------------------------------------------------------------- */
/* 4. The derived counts (WYS §13; plan §6.9)                                 */
/* -------------------------------------------------------------------------- */

export interface ProgressCounts {
  /** Stops whose whole cadence path is marked complete. */
  stopsCompleted: number;
  /** `weeks.length`, arriving as `stops.length`. NEVER typed (plan §6.9). */
  stopTotal: number;
  judgmentsCommitted: number;
  carriesTaken: number;
  replayUsed: number;
}

/**
 * Every count the screen renders, derived — nothing here is stored.
 *
 * WHAT EACH ONE COUNTS, because (WYS §13) names the quantities and not their
 * derivations, and because completion semantics are a stated rule rather than a
 * convention ("opening is not completion, scrolling is not completion, time on
 * page is not completion"):
 *
 *  - **stops completed** — a stop counts when every step of the learner's
 *    RESOLVED cadence path for it is marked complete. That is `visitPositionFor`
 *    (plan §5.3), reused rather than re-derived: the same function Today's
 *    counter uses, so "visit 3 of 3" and "stop completed" can never disagree.
 *    `completedLessonIds.length` would have been the wrong count — it counts
 *    VISITS, and a two-day stop half done is not a stop done.
 *  - **judgments committed** — the union of `completedScenarioIds` and the keys
 *    of `localJudgments`. §13's completion semantics make the committed
 *    judgment the thing that completes a scenario, so the two sets describe one
 *    fact; taking the union keeps the tile true whichever writer ran, including
 *    with `PERSIST_LOCAL_JUDGMENTS` off, and cannot double-count.
 *  - **carries taken** — `completedCarryIds.length`. A CARRY counts on an
 *    intentional mark and on nothing else (WYS §13).
 *  - **replay used** — the sum of `replayCounts`, which is replays used rather
 *    than scenarios replayed. "replay used" is the artboard's own label.
 *
 * NO RATIO, NO PERCENTAGE, NO REMAINDER. `stopTotal` is a denominator the
 * artboard draws ("1 of 9"); nothing here divides one count by another, and
 * nothing computes "behind", "remaining" or "on track".
 */
export function progressCounts(
  stops: readonly VisitCountableStop[],
  state: WysLocalStateV1
): ProgressCounts {
  const cadence: WysCadence | undefined = state.onboarding.cadence;

  let stopsCompleted = 0;
  for (const stop of stops) {
    if (visitPositionFor(stop, state.progress, cadence).complete) stopsCompleted += 1;
  }

  const judged = new Set<string>(state.progress.completedScenarioIds);
  for (const scenarioId of Object.keys(state.localJudgments ?? {})) judged.add(scenarioId);

  let replayUsed = 0;
  for (const count of Object.values(state.progress.replayCounts)) {
    if (Number.isFinite(count) && count > 0) replayUsed += count;
  }

  return {
    stopsCompleted,
    stopTotal: stops.length,
    judgmentsCommitted: judged.size,
    carriesTaken: state.progress.completedCarryIds.length,
    replayUsed
  };
}

/** The count a tile renders. Total over `ProgressStatId`, so a new tile is a compile error. */
export function statValue(id: ProgressStatId, counts: ProgressCounts): number {
  switch (id) {
    case "stops-completed":
      return counts.stopsCompleted;
    case "judgments-committed":
      return counts.judgmentsCommitted;
    case "carries-taken":
      return counts.carriesTaken;
    case "replay-used":
      return counts.replayUsed;
  }
}

/** "of 9" — the first tile's denominator, derived from the stop count. */
export function stopsDenominator(counts: ProgressCounts): string {
  return `of ${counts.stopTotal}`;
}

/* -------------------------------------------------------------------------- */
/* 5. The judgment rows (mockup 5b, dc.html:132-136)                          */
/* -------------------------------------------------------------------------- */

export interface JudgmentRow {
  scenarioId: string;
  /** "A · kept" or "C → B · revised". */
  state: string;
  revised: boolean;
  updatedAt: string;
}

type LocalJudgment = NonNullable<WysLocalStateV1["localJudgments"]>[string];

/**
 * One row's right-hand state, composed once.
 *
 * "A · kept" and "C → B · revised" are the artboard's two forms and they are
 * built here rather than in the view so the arrow, the separator and the two
 * words have one definition.
 *
 * THE ARTBOARD'S THIRD FORM — "B · differs from Ben" — IS NOT BUILT, and that
 * is a narrowing rather than an omission. Nothing in the content model records
 * which choice Ben endorses: `WysJudgment` carries `call` as prose and no
 * choice key, so "differs from Ben" could only be produced by this build
 * deciding what Ben's answer is — a Ben content decision (WYS §35 item 6) and a
 * position asserted in his name, which R10 forbids. Under Q21's default there
 * is also no rendered Ben judgment on the page to differ FROM. Recorded in
 * docs/facelift-unapproved.md with the field a later phase would need.
 */
export function judgmentRowFor(scenarioId: string, entry: LocalJudgment): JudgmentRow {
  const revised = typeof entry.revisedChoiceKey === "string" && entry.revisedChoiceKey.length > 0;
  const state = revised
    ? `${entry.choiceKey} ${progressLabels.judgmentRevisionArrow} ${entry.revisedChoiceKey} · ${progressLabels.judgmentRevised}`
    : `${entry.choiceKey} · ${progressLabels.judgmentKept}`;
  return { scenarioId, state, revised, updatedAt: entry.updatedAt };
}

/**
 * Every kept-or-revised row, oldest first.
 *
 * Ordered by `updatedAt` so the list is stable between renders rather than
 * following `Object.keys` insertion order, which depends on how the state was
 * last written. No "most recent first" ranking and no highlighting: a revision
 * is a state, not an event to celebrate or correct (plan Phase 7 — "differs
 * from Ben is a status with no corrective styling").
 */
export function judgmentRows(state: WysLocalStateV1): JudgmentRow[] {
  const entries = Object.entries(state.localJudgments ?? {});
  return entries
    .map(([scenarioId, entry]) => judgmentRowFor(scenarioId, entry))
    .sort((left, right) => left.updatedAt.localeCompare(right.updatedAt));
}

/* -------------------------------------------------------------------------- */
/* 6. The rulebook (WYS §16)                                                  */
/* -------------------------------------------------------------------------- */

export type RulebookEntry = WysLocalStateV1["rulebook"][number];

/**
 * The provenance every learner-authored rule renders under.
 *
 * NOT a content record: the content is the learner's, this build authored none
 * of it, and there is nothing here to register in `wysRegistry` — it is the
 * `(status, origin)` pair the gate needs to answer "may this render, and under
 * what label", stated once so no screen invents a different answer.
 *
 * `origin: "LEARNER_OWNED"` gives (plan §6.3)'s authored label, "Yours. Stored
 * in this browser only." — which is the whole claim: the learner wrote it, it
 * never left the browser, and it is not Ben doctrine (WYS §16).
 *
 * `status: "published"` IS THE LOAD-BEARING PART. Q21 ships
 * `RENDER_MARKED_DRAFT` false, so a `draft` non-Ben record is blocked in
 * production — and a learner's own rulebook blanked by a flag about BEN's
 * unapproved prose would be absurd: the flag exists to stop this build putting
 * words in Ben's mouth, and these words are the learner's. Published is also
 * literally true; nobody is waiting to approve them.
 */
export const learnerRuleProvenance: GateableRecord = {
  status: "published",
  origin: "LEARNER_OWNED"
};

/**
 * The plain-text export (WYS §16, "exportable as plain text or JSON").
 *
 * One rule per line, in stored order, and nothing else — no header, no
 * timestamps, no ids, no branding. What the learner wrote is what they get
 * back, which is the only form of export that matches "this material belongs to
 * the learner". Pure, so the "export contains exactly the rules" assertion is a
 * unit test rather than a browser one.
 */
export function rulebookAsText(rulebook: readonly RulebookEntry[]): string {
  return rulebook.map((entry) => entry.text).join("\n");
}

/** Trim and length-cap one rule on the way in. Empty input is not a rule. */
export function normaliseRuleText(input: string): string {
  return input.trim().slice(0, RULE_MAX_LENGTH);
}
