/**
 * The Today screen's own content (plan Phase 7, the Today row; mockup 5b
 * dc.html:78-96; WYS §10).
 *
 * Today draws the daily loop — WATCH → TRY → JUDGE → CARRY — and almost every
 * word on it already has a single definition somewhere else: the stop title in
 * `./weeks.ts`, the scenario and its choices in `./scenarios.ts`, the judgment
 * in `./judgments.ts`, the carry in `./carries.ts`, the Commit pill and the
 * disagreement note in `./judge.ts` and `./copy.ts`. This module holds only
 * what the Today artboard adds and nothing else defines:
 *
 *  - the WATCH caption, which is Final copy drawn on `5b` and on no other
 *    surface;
 *  - the transcript slot, which is a Ben slot the `5b` caption links to and
 *    which `./sources.ts` does not carry (its nine slots are the recordings,
 *    the portraits and the two dashed regions);
 *  - the labels for the two controls Today needs that the artboard does not
 *    draw — the transcript disclosure and the CARRY mark;
 *  - which scenario a stop puts in front of the learner.
 *
 * WHY THE CORE-SCENARIO PIN IS DATA. (WYS §35 decision 9) is one of the
 * thirteen open Ben decisions and §35 requires that changing one be a content
 * or config edit, never a component edit. `todayCoreScenarioId()` is that edit
 * point: stop A's Today draws the group-chat exercise on the artboard even
 * though `scn-client-meeting` leads its `tryScenarioIds`, because the
 * client-meeting exercise is what the `4a` hero already spends on the marketing
 * page and one exercise on two surfaces would be one node drawn twice. Every
 * other stop falls through to the first entry of its own list.
 *
 * PROVENANCE MAPPING, unchanged from `./copy.ts`: text taken verbatim from an
 * approved artboard is `status: "published"`, `origin: "BEN_APPROVED"` — Ben
 * approved the artboards. The Captain's Stamp is a separate axis carried by
 * `lib/approval-state.ts`.
 */

import type { AnyCanonicalText } from "@/lib/canonical-text";
import type { WysTimeBudget } from "@/lib/wys/local-state";
import type { WysBenSlot } from "./sources";
import type { WysWeek } from "./types";

/* -------------------------------------------------------------------------- */
/* 1. Canonical records                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Artboard 5b Today, the WATCH card caption (dc.html:88), verbatim.
 *
 * It is the on-screen form of (WYS §10 WATCH)'s "no AI interpretation before
 * the human source", so it is a claim about how the course works rather than
 * UI chrome, and it is a record rather than a label. The artboard draws two
 * sentences and there is no longer approved form, so `full` is those two
 * sentences and nothing is added to them.
 */
export const todayWatchLeadText = {
  id: "today-watch-source-first",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["artboard-5b-today", "wys-spec-10"],
  variantSources: {
    short: ["artboard-5b-today"],
    full: ["artboard-5b-today"]
  },
  variants: {
    short: "Watch the whole thing first. Ben's own words come before any explanation.",
    full: "Watch the whole thing first. Ben's own words come before any explanation."
  }
} as const satisfies AnyCanonicalText;

export const todayCopyRecords: readonly AnyCanonicalText[] = [todayWatchLeadText];

/* -------------------------------------------------------------------------- */
/* 2. The transcript slot                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The transcript behind the `5b` caption's "Transcript" link (plan §13.1).
 *
 * A `WysBenSlot`, not a `WysSourceAsset`: (WYS §8.1)'s `medium` union has a
 * `transcript` member, but a transcript is not a separate source — plan §13.1
 * is explicit that "the recording is the primary source, not the transcript"
 * and that "each audio slot ships with an approved transcript carrying the same
 * approval status". So this is the SLOT the transcript will occupy, it waits on
 * the same recording `slot-today-watch-video` waits on, and nothing may fill it
 * (§6.4 — the slot props accept no body).
 *
 * It lives here rather than in `./sources.ts` because it is a Today surface and
 * `./sources.ts` is the recordings inventory; it is registered in `./index.ts`
 * exactly like every other governed record.
 */
export const todayBenSlots = [
  {
    id: "slot-today-transcript",
    status: "draft",
    origin: "BEN_AUTHORED",
    label: "Transcript — Ben source",
    awaitedAsset: "approved transcript, shipped with the recording",
    kind: "dashed",
    medium: "transcript",
    surfaces: ["/watch-your-step/today"],
    emptyReferenceReason:
      "No recording is selected, so there is nothing to transcribe and nothing to approve (WYS §35 decision 4)."
  }
] as const satisfies readonly WysBenSlot[];

export const todayTranscriptSlot: WysBenSlot = todayBenSlots[0];

/* -------------------------------------------------------------------------- */
/* 3. Pinned labels — controls the artboard does not draw                     */
/* -------------------------------------------------------------------------- */

/**
 * Short control names, pinned here rather than typed into a component, on the
 * same rule `wysLabels` follows: a two-word control has no `full` form and no
 * source beyond the surface it sits on, but it still gets one definition.
 *
 * `transcript` is the artboard's own word (dc.html:88). The other three are
 * AUTHORED by this build and recorded in `docs/facelift-unapproved.md`:
 *
 *  - `carryMark` — plan Phase 7 requires an explicit "I did it" and (WYS §13)
 *    makes an intentional mark the only thing that counts a CARRY. The `5b`
 *    carry card draws no control at all, so without this the card states a
 *    behaviour nothing can complete.
 *  - `carryMarked` — the state after the mark. One word, because it says the
 *    mark landed and asks for nothing: (WYS §10) "CARRY should often have no
 *    reporting requirement", so there is no "how did it go", no note field, no
 *    follow-up and no claim that nothing left the browser — a completed stop
 *    may fire the coarse `wys_source_period_complete` count, and a label
 *    saying otherwise would be the §34 error of fixing architecture in copy.
 *  - `carryMarkHint` — why the mark exists, in four words, so the button does
 *    not read as a report.
 */
export const todayLabels = {
  transcript: "Transcript",
  carryMark: "I did it",
  carryMarked: "Marked",
  carryMarkHint: "Marks the visit done."
} as const;

export type WysTodayLabelKey = keyof typeof todayLabels;

/**
 * "About 10 minutes." — the second half of the `5b` lead line (dc.html:80).
 *
 * The artboard writes the lead as one sentence, "Task Before Prompt — about 10
 * minutes.", where the first half is the stop title. Titles A-H are draft
 * scaffold and are withheld while `RENDER_MARKED_DRAFT` is false (Q21), so
 * Today renders the title through the gate and this line beneath it. That the
 * one drawn sentence becomes two lines is a consequence of Q21's default, not a
 * copy change: no word is added, removed or reordered.
 *
 * The minutes come from the learner's own time budget, which is why this is a
 * function of `WysTimeBudget` and not a string. `20plus` renders `20+` because
 * the artboard's cadence card writes the budget that way.
 */
const TIME_BUDGET_MINUTES: Record<WysTimeBudget, string> = {
  "5": "5",
  "10": "10",
  "15": "15",
  "20plus": "20+"
};

export function aboutMinutesLabel(budget: WysTimeBudget): string {
  return `About ${TIME_BUDGET_MINUTES[budget]} minutes.`;
}

/* -------------------------------------------------------------------------- */
/* 4. Which exercise a stop puts in front of the learner                      */
/* -------------------------------------------------------------------------- */

/**
 * (WYS §35 decision 9), and a content edit by construction.
 *
 * A stop's `tryScenarioIds` is its whole bank; Today draws ONE of them. The
 * default is the first, and the pins below are the cases where an approved
 * artboard draws something else. Adding, removing or reordering a pin is an
 * edit to this object — never to a component.
 */
export const TODAY_CORE_SCENARIO_PINS: Readonly<Record<string, string>> = {
  /** Artboard 5b Today draws the group-chat exercise for stop A (dc.html:90). */
  "stop-a": "scn-group-chat"
};

/** The scenario Today draws for a stop, or null where the stop has no bank. */
export function todayCoreScenarioId(week: WysWeek): string | null {
  const pinned = TODAY_CORE_SCENARIO_PINS[week.id];
  if (pinned && week.tryScenarioIds.includes(pinned)) return pinned;
  return week.tryScenarioIds[0] ?? null;
}
