/**
 * The Stop H terminal surface (plan Phase 7, §5.2; WYS §11 Period H, §19.4).
 *
 * REQUIRED AND UNDESIGNED. `/watch-your-step/end` is a declared route in §5.2
 * and in `WYS_ROUTES`, and `lib/wys/telemetry.ts`'s own decision table says
 * `wys_course_complete` "fires when the Stop H terminal surface reaches its
 * completed state" — a claim the code did not honour until this surface
 * existed, which is an R8 problem rather than a missing nicety. No artboard
 * draws it: `5b`'s Plan screen ends at a dashed "the end" row and nothing draws
 * what is behind it.
 *
 * SO THIS MODULE AUTHORS NO PROSE. What the end of a finite course says to the
 * learner is Ben's to write (R10, WYS §11 "do not invent Ben stories or
 * quotes"), so it renders as a labelled empty slot and stays empty. What is
 * here instead is: one Ben slot, and control/section names of four words or
 * fewer, on the same rule `tabs.ts` and `judgeLabels` follow.
 *
 * AND IT MAKES NO OUTCOME CLAIM. (packet: Proposition K) forbids promising an
 * outcome this build has not observed, so nothing here says the learner has
 * learned anything, improved anything or is now safe. Reaching the end of a
 * path is a fact about the path.
 */

import type { WysBenSlot } from "./sources";
import { wysLabels } from "./copy";

/* -------------------------------------------------------------------------- */
/* 1. Ben's exit copy — a slot, never a sentence (R10, §6.4)                   */
/* -------------------------------------------------------------------------- */

/**
 * The one thing on this screen that is Ben's, and it is empty.
 *
 * `kind: "dashed"` because there is no recording here — Period H's close is
 * writing, not a source. The label is authored, like every other new slot
 * label, and is on the Final-copy list.
 */
export const endBenSlots = [
  {
    id: "slot-course-end",
    status: "draft",
    origin: "BEN_AUTHORED",
    label: "Ben's closing words",
    awaitedAsset: "slot: Ben's exit copy for Period H",
    kind: "dashed",
    surfaces: ["/watch-your-step/end"],
    emptyReferenceReason:
      "What the end of a finite course says is a Ben position, and this build may not write one (R10; WYS §11)."
  }
] as const satisfies readonly WysBenSlot[];

export const endExitSlot: WysBenSlot = endBenSlots[0];

/* -------------------------------------------------------------------------- */
/* 2. Pinned names — authored, and recorded as additions                      */
/* -------------------------------------------------------------------------- */

/**
 * `pageTitle` is the SECOND PRESENTATION of one node (§6.8): `wysLabels`
 * already pins "the end" for Plan's terminal row, and a page whose `<h1>` said
 * something else would be a second name for one concept. Sentence case is the
 * presentation a heading takes; the word is not retyped.
 *
 * The rest are section and control names this build authored because the screen
 * has no artboard at all. Every one is recorded in docs/facelift-unapproved.md.
 */
export const endLabels = {
  /** "The end" — `wysLabels.terminalTag` as a heading. */
  pageTitle: `${wysLabels.terminalTag.charAt(0).toUpperCase()}${wysLabels.terminalTag.slice(1)}`,

  /** The one thing the learner leaves with (WYS §16). */
  rulebookEyebrow: "WHAT YOU TAKE WITH YOU",

  /** The empty rulebook state. A fact, not a nudge to go and write rules. */
  noRulesYet: "No rules written.",

  /** Where the learner goes from here. Both are existing canonical nodes. */
  backToProgress: "See your progress",
  backToPlan: "Back to the plan",

  /**
   * The one link INTO this surface, rendered on the terminal stop's own page.
   *
   * Without it `/watch-your-step/end` ships unreachable: `5b` draws a dashed
   * "the end" row on Plan and nothing behind it, and the bottom nav has no
   * sixth tab. The terminal stop pointing at the terminal surface is the one
   * placement that needs no new row and no new artboard claim. The label is the
   * pinned `terminalTag` again, so the path and its destination share a word.
   */
  openTheEnd: `Open ${wysLabels.terminalTag}`
} as const;

export type EndLabelKey = keyof typeof endLabels;
