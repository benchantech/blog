/**
 * The judgment framework (WYS §3.4), defined once (plan §6.10, Standing Order 07).
 *
 * TASK -> NECESSITY -> EXPOSURE -> WHY -> WHY-NOT -> JUDGMENT is the spec's
 * central pedagogical construct. Plan §6.10 requires its rendered form to exist
 * as a canonical content component surfaced in the curriculum, and every
 * principle, scenario and judgment in `content/watch-your-step/` points here
 * rather than restating it.
 *
 * Note the convergence the plan flags: the preserved `components/IntentRouter.tsx`
 * already implements Capture / Why / Why-Not / Commit — the same shape — so the
 * doctrine and the machinery already on the site agree. That is why
 * `repo-intent-router` is one of the cited sources.
 *
 * PROVENANCE. `status: "published"`, `origin: "BEN_APPROVED"`, following the
 * mapping `content/claims.ts` set in Phase 1: strings taken verbatim from the
 * governing spec or the approved artboards are copy Ben approved, not copy this
 * build authored, and the Captain's Stamp is a separate axis carried by
 * `lib/approval-state.ts`. So the framework renders as canon; the draft
 * curriculum hung off it does not.
 *
 * The prohibition is part of the definition, not a footnote to it: "Do not
 * teach 'remove everything specific.'" It travels with the framework wherever
 * the framework renders, which is why it is a field on this record and not a
 * comment.
 */

import type { AnyCanonicalText } from "@/lib/canonical-text";

export type JudgmentBeatId = "TASK" | "NECESSITY" | "EXPOSURE" | "WHY" | "WHY-NOT" | "JUDGMENT";

export interface JudgmentBeat {
  id: JudgmentBeatId;
  order: number;
  /** WYS §3.4, verbatim. */
  question: string;
}

export const JUDGMENT_BEAT_IDS: readonly JudgmentBeatId[] = [
  "TASK",
  "NECESSITY",
  "EXPOSURE",
  "WHY",
  "WHY-NOT",
  "JUDGMENT"
];

/** The six beats, verbatim (WYS §3.4). The learner asks these repeatedly. */
export const judgmentBeats = [
  { id: "TASK", order: 1, question: "What am I actually asking AI to do?" },
  { id: "NECESSITY", order: 2, question: "Which details materially change that task?" },
  { id: "EXPOSURE", order: 3, question: "What else do those details reveal directly or by inference?" },
  { id: "WHY", order: 4, question: "Why might this detail be worth including?" },
  {
    id: "WHY-NOT",
    order: 5,
    question:
      "What is the strongest case for withholding, generalizing, cropping, redacting, using a fictional proxy, or not using AI?"
  },
  { id: "JUDGMENT", order: 6, question: "Make the call." }
] as const satisfies readonly JudgmentBeat[];

/** The framework's own name, for the chain and the stat surfaces. */
export const JUDGMENT_FRAMEWORK_SEQUENCE = "TASK → NECESSITY → EXPOSURE → WHY → WHY-NOT → JUDGMENT";

/**
 * What the framework is NOT, verbatim (WYS §3.4). Rendered with the framework,
 * never separately: the teaching fails in exactly the direction this sentence
 * blocks, and (WYS §25) makes the failure an acceptance box.
 */
export const JUDGMENT_FRAMEWORK_PROHIBITION = "Do not teach “remove everything specific.”";

/** The one-line statement of what anonymization means here, verbatim (WYS §3.4). */
export const ANONYMIZATION_RULE =
  "Preserve what the task needs. Remove what the task does not need.";

export const judgmentFrameworkText = {
  id: "judgment-framework",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["wys-spec-3-4", "repo-intent-router"],
  variantSources: {
    short: ["wys-spec-3-4"],
    medium: ["wys-spec-3-4"],
    full: ["wys-spec-3-4"],
    machine: ["wys-spec-3-4"]
  },
  variants: {
    short: ANONYMIZATION_RULE,
    medium: `${ANONYMIZATION_RULE} Ask, in order: ${JUDGMENT_FRAMEWORK_SEQUENCE}. This is a judgment framework, not a blacklist.`,
    full: [
      ANONYMIZATION_RULE,
      "",
      "The learner should repeatedly ask:",
      JUDGMENT_FRAMEWORK_SEQUENCE,
      "",
      ...judgmentBeats.map((beat) => `${beat.id} — ${beat.question}`),
      "",
      "This is a judgment framework, not a blacklist."
    ].join("\n"),
    machine: JUDGMENT_FRAMEWORK_SEQUENCE
  }
} as const satisfies AnyCanonicalText;

/**
 * (WYS §9.3) The one thing someone who leaves straight after onboarding must
 * still have learned. It is an acceptance condition on the Lesson Zero flow,
 * not a nice-to-have, so it is content rather than a screen string.
 */
export const lessonZeroCompletionText = {
  id: "lesson-zero-completion-condition",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["wys-spec-9-3"],
  variantSources: {
    short: ["wys-spec-9-3"],
    full: ["wys-spec-9-3"]
  },
  variants: {
    short: "Define the task first. Then remove what the task doesn't need.",
    full: "Define the task first. Then remove what the task doesn't need."
  }
} as const satisfies AnyCanonicalText;

/** Both canonical records this module defines, for the governance arrays. */
export const judgmentFrameworkRecords: readonly AnyCanonicalText[] = [
  judgmentFrameworkText,
  lessonZeroCompletionText
];
