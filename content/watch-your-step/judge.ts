/**
 * The JUDGE surface's own strings (plan Phase 7; mockup 4a dc.html:340-359,
 * mockup 5b dc.html:94-95).
 *
 * The state machine is `lib/wys/judge-machine.ts` and the card is
 * `components/wys/JudgeCard.tsx`; this is the copy those two render, defined
 * once because **four surfaces draw the same composite** — the `4a` hero demo,
 * Lesson Zero step 5, Today, and Practice's replay. Four builders typing
 * "Commit, then see Ben's take" into four components is exactly the drift
 * Standing Order 07 exists to stop.
 *
 * COLLAPSED COLLISION (plan §6.8; recorded as `collision-commit-label` in
 * `./copy.ts`). The Commit pill is drawn twice and punctuated two ways:
 * `4a` reads "Commit — then see Ben's take" and `5b` Today reads "Commit, then
 * see Ben's take". Both artboards are approved, so R1 gives no winner. The `5b`
 * form is pinned, on the same reasoning collision 2 used: where a course
 * surface and a marketing surface disagree about a course string, the course
 * artboard wins. The `4a` hero renders the pinned form, which is a Final-copy
 * amendment and is escalated.
 *
 * THE PRE-COMMIT NOTE IS NOT ONE STRING. `4a` puts "You commit before you see
 * anything. That's the whole method." under the pill; `5b` Today puts
 * "Disagreeing with Ben is fine. Agreement isn't the score." there instead.
 * They say different things — one is about the method, one is about
 * disagreement — so they are two records, not two variants of one, and the
 * second already lives in `./copy.ts` as `disagreementText`. `JudgeCard` takes
 * the note as a parameter and the surface chooses.
 */

import type { AnyCanonicalText } from "@/lib/canonical-text";

/**
 * Artboard 4a hero, under the Commit pill (dc.html:341), verbatim.
 *
 * Final copy: it is the sentence that states the method the whole course turns
 * on, so it is `BEN_APPROVED` (Ben approved the artboard) rather than
 * build-authored. Nothing is added to it.
 */
export const judgeCommitMethodText = {
  id: "judge-commit-before-reveal",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["artboard-4a-hero-demo", "wys-spec-10"],
  variantSources: {
    short: ["artboard-4a-hero-demo"],
    full: ["artboard-4a-hero-demo"]
  },
  variants: {
    short: "You commit before you see anything. That's the whole method.",
    full: "You commit before you see anything. That's the whole method."
  }
} as const satisfies AnyCanonicalText;

export const judgeCopyRecords: readonly AnyCanonicalText[] = [judgeCommitMethodText];

/**
 * The JUDGE controls, verbatim from the approved artboards.
 *
 * Labels rather than canonical records: each is a control name of four words or
 * fewer, the same treatment `wysLabels` gives the pinned node names. They are
 * still defined ONCE, and `components/wys/JudgeCard.tsx` takes them as
 * parameters so no component types one.
 */
export const judgeLabels = {
  /** Pinned from `5b` Today (dc.html:94). See the collision note above. */
  commit: "Commit, then see Ben's take",
  /** `4a` desktop (dc.html:359). Rendered on BOTH breakpoints — see below. */
  reset: "Reset",
  /** `4a` distribution card header, left (dc.html:351). */
  distributionHeading: "How others answered",
  /** `4a` distribution card header, right (dc.html:351). */
  distributionMeta: "totals only · no one is tracked"
} as const;

export type WysJudgeLabelKey = keyof typeof judgeLabels;

/**
 * R9 safe-direction override, ratified (plan §6.3, escalation 3 of 3).
 *
 * The `4a` phone draws no Reset control at all, so the state machine's spec'd
 * reset transition has no affordance on mobile — an unreachable transition is a
 * defect, not a design. `JudgeCard` renders Reset on both breakpoints. Recorded
 * in `docs/facelift-unapproved.md` as a mobile addition.
 */
export const RESET_RENDERS_ON_MOBILE = true;
