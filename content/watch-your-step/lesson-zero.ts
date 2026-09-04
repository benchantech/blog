/**
 * Lesson Zero's own content (plan Phase 7; WYS §9; mockup 5a).
 *
 * Onboarding is CURRICULUM, not administrative setup (WYS §9), so every
 * sentence it renders is a content record with a status, an origin and its
 * sources — the same treatment `today.ts`, `practice.ts` and `plan.ts` give
 * their screens. Nothing here is typed into a component.
 *
 * FIVE OF THE TEN STEPS ARE DRAWN AND FIVE ARE NOT. Artboard `5a` draws steps
 * 2, 5 and the 7-9 composite; steps 1, 3, 4, 6 and 10 exist only in (WYS §9.1)
 * as a line each. So this module carries two clearly separated kinds of record
 * and the difference is visible on screen, not only in a comment:
 *
 *   · DRAWN or SPEC-VERBATIM  -> `status: "published"`, `origin: "BEN_APPROVED"`.
 *     Ben approved the artboards and wrote the spec, so these resolve to
 *     `canon` and render as words with no mark. The same mapping
 *     `content/claims.ts` set in Phase 1 and every WYS module has used since.
 *   · AUTHORED BY THIS BUILD  -> `status: "published"`,
 *     `origin: "IMPLEMENTATION_PLACEHOLDER"`. These resolve to `marked`, so the
 *     screen renders the prose AND the §23 label "Implementation placeholder —
 *     not Ben's words" plus the mono draft mark. That is the same slot
 *     `content/ship/crew-manifest.ts` uses for factual build description, and
 *     it is the reason the five undesigned steps announce themselves as
 *     unapproved on the surface rather than only in
 *     `docs/facelift-unapproved.md`.
 *
 * VOICE (plan §2.1, R10). Every authored line is factual description of how the
 * course works. There is no first person, no Ben position, no outcome claim, no
 * diagnostic language and no request to justify anything — (WYS §9.1) item 1 is
 * explicit that the learner is never asked to justify fear or distrust, and
 * (WYS §9.2) closes the door on the rest.
 *
 * WHAT IS NOT HERE, AND WHY. The posture question, its four options and its
 * footnote live in `./config.ts` (a §35 content decision); the pace vocabulary
 * lives in `./plan.ts` (one node, two presentations — Lesson Zero selects it,
 * Plan renders it back as a badge); the JUDGE control names live in `./judge.ts`;
 * the §9.3 completion sentence lives in `content/canonical/judgment-framework.ts`;
 * the runtime-disclosure sentences live in `content/claims.ts` and are the same
 * strings the disclosure strip renders on every page footer. Retyping any of
 * them here would be the Standing Order 07 duplication this build is built to
 * refuse.
 */

import type { AnyCanonicalText } from "@/lib/canonical-text";
import type { WysBenSlot } from "./sources";

/* -------------------------------------------------------------------------- */
/* 1. The ten steps, as data (WYS §9.1)                                       */
/* -------------------------------------------------------------------------- */

export type LessonZeroStepId =
  | "lz-intent"
  | "lz-posture"
  | "lz-human-source"
  | "lz-first-habit"
  | "lz-exercise"
  | "lz-runtime"
  | "lz-cadence"
  | "lz-time"
  | "lz-data"
  | "lz-plan-preview";

export interface LessonZeroStep {
  id: LessonZeroStepId;
  /** 1-10, in (WYS §9.1)'s fixed order. The order is the requirement. */
  index: number;
  /** §9.1's own name for the step. Not rendered; it is what the test checks. */
  specName: string;
  /** True where artboard `5a` draws the step. False means NEW and unapproved. */
  designed: boolean;
}

/**
 * (WYS §9.1) "Required sequence" — ten steps, in order, none optional.
 *
 * It is data rather than a JSX switch so `tests/wys-lesson-zero.test.ts` can
 * assert the sequence, the count and which five are undesigned without a
 * renderer. A step removed or reordered fails a test instead of shipping.
 */
export const lessonZeroSteps = [
  { id: "lz-intent", index: 1, specName: "Constructive intent", designed: false },
  { id: "lz-posture", index: 2, specName: "Current posture", designed: true },
  { id: "lz-human-source", index: 3, specName: "Human source first", designed: false },
  { id: "lz-first-habit", index: 4, specName: "First durable privacy habit", designed: false },
  { id: "lz-exercise", index: 5, specName: "Fictional anonymization exercise", designed: true },
  { id: "lz-runtime", index: 6, specName: "Runtime disclosure", designed: false },
  { id: "lz-cadence", index: 7, specName: "Cadence", designed: true },
  { id: "lz-time", index: 8, specName: "Time", designed: true },
  { id: "lz-data", index: 9, specName: "Data", designed: true },
  { id: "lz-plan-preview", index: 10, specName: "Plan preview", designed: false }
] as const satisfies readonly LessonZeroStep[];

export const LESSON_ZERO_STEP_COUNT = lessonZeroSteps.length;

/**
 * SCREENS ARE NOT STEPS, and the artboard is why.
 *
 * `5a`'s third phone is a composite: one screen carrying cadence, time and the
 * BEFORE YOU START · DATA card, counted "7–9 of 10" with the rail at 90%. So
 * the ten-step sequence above is intact and the flow renders eight screens.
 * Splitting 7, 8 and 9 into three screens would contradict an approved artboard
 * (R1); collapsing them in the DATA above would contradict (WYS §9.1).
 *
 * `railStep` is the LAST step on the screen, which is what makes the artboard's
 * three drawn rail widths come out at 20%, 50% and 90% from `step / 10`.
 */
export interface LessonZeroScreen {
  id: string;
  stepIds: readonly LessonZeroStepId[];
  /** "2", "5", "7–9" — the numerator the counter renders. En dash, per `5a`. */
  counter: string;
  railStep: number;
}

export const lessonZeroScreens = [
  { id: "screen-intent", stepIds: ["lz-intent"], counter: "1", railStep: 1 },
  { id: "screen-posture", stepIds: ["lz-posture"], counter: "2", railStep: 2 },
  { id: "screen-human-source", stepIds: ["lz-human-source"], counter: "3", railStep: 3 },
  { id: "screen-first-habit", stepIds: ["lz-first-habit"], counter: "4", railStep: 4 },
  { id: "screen-exercise", stepIds: ["lz-exercise"], counter: "5", railStep: 5 },
  { id: "screen-runtime", stepIds: ["lz-runtime"], counter: "6", railStep: 6 },
  {
    id: "screen-pace-and-data",
    stepIds: ["lz-cadence", "lz-time", "lz-data"],
    counter: "7–9",
    railStep: 9
  },
  { id: "screen-plan-preview", stepIds: ["lz-plan-preview"], counter: "10", railStep: 10 }
] as const satisfies readonly LessonZeroScreen[];

/** "2 of 10" / "7–9 of 10" — artboard `5a`, the counter right of the pill. */
export function lessonZeroCounterLabel(screen: LessonZeroScreen): string {
  return `${screen.counter} of ${LESSON_ZERO_STEP_COUNT}`;
}

/* -------------------------------------------------------------------------- */
/* 2. Canonical records — the drawn and spec-verbatim half                    */
/* -------------------------------------------------------------------------- */

/**
 * (WYS §9.1) item 4, and artboard `5a`'s THE FIRST HABIT card (dc.html:38).
 * The same sentence in both, character for character, so it is one record.
 *
 * It is the durable thing Lesson Zero exists to leave behind, which is why it
 * renders TWICE — once as step 4's whole screen and once as the frame above
 * step 5's exercise, exactly as the artboard draws it. Two presentations of one
 * definition (§6.8), never two records.
 */
export const lessonZeroHabitText = {
  id: "lesson-zero-first-habit",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["wys-spec-9-1", "artboard-5a-first-habit"],
  variantSources: {
    short: ["wys-spec-9-1", "artboard-5a-first-habit"],
    full: ["wys-spec-9-1", "artboard-5a-first-habit"]
  },
  variants: {
    short: "Before you tell AI something, ask: what does it actually need to know?",
    full: "Before you tell AI something, ask: what does it actually need to know?"
  }
} as const satisfies AnyCanonicalText;

/**
 * Artboard `5a` steps 7-9, under the time options (dc.html:62), verbatim.
 *
 * It is also (WYS §9.1) item 10's whole requirement — "more available time
 * creates more depth, not faster consumption of Ben's human-source spine" — so
 * one record answers both, and step 10 renders it a second time rather than
 * paraphrasing it into a new sentence.
 */
export const lessonZeroTimeDepthText = {
  id: "lesson-zero-time-adds-depth",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["artboard-5a-cadence-and-time", "wys-spec-9-1"],
  variantSources: {
    short: ["artboard-5a-cadence-and-time"],
    full: ["artboard-5a-cadence-and-time"]
  },
  variants: {
    short: "More time adds depth to each source. It doesn't move you through Ben's recordings faster.",
    full: "More time adds depth to each source. It doesn't move you through Ben's recordings faster."
  }
} as const satisfies AnyCanonicalText;

/**
 * BEFORE YOU START · DATA, line 1 (artboard `5a`, dc.html:66), verbatim.
 *
 * Three lines, three records, because they are three different claims about
 * three different things — what stays, what leaves, what never exists. Storing
 * them as one paragraph would mean the Data page could not reuse one of them
 * without the other two, which is the whole failure §6.8 exists to stop.
 */
export const lessonZeroDataStaysText = {
  id: "lesson-zero-data-stays",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["artboard-5a-cadence-and-time", "wys-spec-18"],
  variantSources: {
    short: ["artboard-5a-cadence-and-time"],
    full: ["artboard-5a-cadence-and-time"]
  },
  variants: {
    short: "Stays here: your pace, progress and choices — this browser only.",
    full: "Stays here: your pace, progress and choices — this browser only."
  }
} as const satisfies AnyCanonicalText;

/**
 * BEFORE YOU START · DATA, line 2 (artboard `5a`, dc.html:67), verbatim — and
 * TRUE ONLY WHEN THE VISITOR HAS GRANTED ANALYTICS.
 *
 * Q7's ratified default is full suppression: `trackWys` refuses to send unless
 * `bct_analytics_consent === "granted"`, and it fails closed on an unreadable
 * or absent key. So for a visitor who declined — or who has not answered the
 * consent banner — this sentence is flatly false, and (plan R8, WYS §34) forbid
 * fixing that in copy. The screen therefore selects between this record and
 * `lessonZeroDataNotSentText` from the consent state itself. Stop condition
 * SC-2; Ben question Q7. The same discipline plan §8.8 requires of Data card 2.
 */
export const lessonZeroDataSentText = {
  id: "lesson-zero-data-sent",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["artboard-5a-cadence-and-time", "wys-spec-19"],
  variantSources: {
    short: ["artboard-5a-cadence-and-time"],
    full: ["artboard-5a-cadence-and-time"]
  },
  variants: {
    short: "Sent: coarse counts. That someone started, finished a stop, used replay.",
    full: "Sent: coarse counts. That someone started, finished a stop, used replay."
  }
} as const satisfies AnyCanonicalText;

/**
 * The same slot when nothing is being sent. AUTHORED by this build.
 *
 * It names the same three counts as the approved line, so the learner is told
 * what the counter would carry rather than left to guess, and it says plainly
 * that none of it is leaving. It is the state-bound half of an approved string,
 * which is why it is a record with its own id rather than a variant.
 */
export const lessonZeroDataNotSentText = {
  id: "lesson-zero-data-not-sent",
  surfaceKind: "general",
  status: "published",
  origin: "IMPLEMENTATION_PLACEHOLDER",
  sourceIds: ["wys-spec-19", "artboard-5a-cadence-and-time"],
  variantSources: {
    short: ["wys-spec-19"],
    full: ["wys-spec-19"]
  },
  variants: {
    short:
      "Sent: nothing. Coarse counts — someone started, finished a stop, used replay — only go anywhere if you allow analytics.",
    full: "Sent: nothing. Coarse counts — someone started, finished a stop, used replay — only go anywhere if you allow analytics."
  }
} as const satisfies AnyCanonicalText;

/** BEFORE YOU START · DATA, line 3 (artboard `5a`, dc.html:68), verbatim. */
export const lessonZeroDataNeverText = {
  id: "lesson-zero-data-never",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["artboard-5a-cadence-and-time", "wys-spec-18"],
  variantSources: {
    short: ["artboard-5a-cadence-and-time"],
    full: ["artboard-5a-cadence-and-time"]
  },
  variants: {
    short: "Never: your name, email, an account, anything you type.",
    full: "Never: your name, email, an account, anything you type."
  }
} as const satisfies AnyCanonicalText;

/* -------------------------------------------------------------------------- */
/* 3. Canonical records — the five undesigned steps                           */
/* -------------------------------------------------------------------------- */

/**
 * Step 1, constructive intent (WYS §9.1 item 1). NEW — no artboard draws it.
 *
 * §9.1's requirement is exact and narrow: establish that the learner wants to
 * get better at using AI, and "do not ask them to justify fear or distrust". So
 * the screen asks nothing at all. It states what the flow is, how long it is,
 * and what it will not ask for — and the last clause is the one that does the
 * work, because it is the difference between an admission ritual and an
 * interrogation.
 */
export const lessonZeroIntentText = {
  id: "lesson-zero-constructive-intent",
  surfaceKind: "general",
  status: "published",
  origin: "IMPLEMENTATION_PLACEHOLDER",
  sourceIds: ["wys-spec-9-1"],
  variantSources: {
    short: ["wys-spec-9-1"],
    full: ["wys-spec-9-1"]
  },
  variants: {
    short:
      "Ten short steps, once. They set up how the course runs, and they end on one habit you can use straight away.",
    full: "Ten short steps, once. They set up how the course runs, and they end on one habit you can use straight away. Nothing here asks you to explain how you feel about AI, or to justify being wary of it."
  }
} as const satisfies AnyCanonicalText;

/**
 * Step 3, human source first (WYS §9.1 item 3). NEW — no artboard draws it.
 *
 * "Never put 'what Ben learned' above Ben's own story." That is an ordering
 * rule about the architecture, so the screen states the ordering and then shows
 * the empty slot the recording will occupy. No recording is selected for any
 * stop yet (WYS §35 decision 4), and Lesson Zero has none of its own at all, so
 * there is nothing here to play and nothing stands in for it (§6.4).
 */
export const lessonZeroHumanSourceText = {
  id: "lesson-zero-human-source-first",
  surfaceKind: "general",
  status: "published",
  origin: "IMPLEMENTATION_PLACEHOLDER",
  sourceIds: ["wys-spec-9-1", "wys-spec-10"],
  variantSources: {
    short: ["wys-spec-9-1"],
    full: ["wys-spec-9-1", "wys-spec-10"]
  },
  variants: {
    short:
      "Every stop opens with a recording of Ben, watched whole, before anything explains it. No summary sits above his own words.",
    full: "Every stop opens with a recording of Ben, watched whole, before anything explains it. No summary sits above his own words. Ben has not chosen the recordings yet, so the slot below is empty and nothing has been written to fill it."
  }
} as const satisfies AnyCanonicalText;

/**
 * Step 4's gloss under the habit card (WYS §9.1 item 4). NEW.
 *
 * The habit itself is `lessonZeroHabitText` and is approved; this is the one
 * line that says why it is being handed over on its own. "Meant to work" rather
 * than "works": nothing has been observed yet, and a claim about what a habit
 * achieves would be an outcome claim without evidence (plan §2.1, Proposition K).
 */
export const lessonZeroHabitGlossText = {
  id: "lesson-zero-first-habit-gloss",
  surfaceKind: "general",
  status: "published",
  origin: "IMPLEMENTATION_PLACEHOLDER",
  sourceIds: ["wys-spec-9-1", "wys-spec-9-3"],
  variantSources: {
    short: ["wys-spec-9-3"],
    full: ["wys-spec-9-3"]
  },
  variants: {
    short: "That question is the whole habit. It is meant to work on its own, even if you never come back.",
    full: "That question is the whole habit. It is meant to work on its own, even if you never come back."
  }
} as const satisfies AnyCanonicalText;

/**
 * Step 6, runtime disclosure (WYS §9.1 item 6). NEW — the third sentence only.
 *
 * The first two sentences of this screen are NOT here: they are
 * `claims["zero-ai"].inline` and `claims["ai-assisted-ben-approved"].inline`,
 * the exact strings the disclosure strip renders on every page footer, and the
 * screen imports them. §9.1 asks for one further thing the strip does not say —
 * that the runtime curriculum stays deterministic "unless a surface explicitly
 * says otherwise" — and that sentence is this record.
 */
export const lessonZeroRuntimeText = {
  id: "lesson-zero-runtime-disclosure",
  surfaceKind: "general",
  status: "published",
  origin: "IMPLEMENTATION_PLACEHOLDER",
  sourceIds: ["wys-spec-9-1", "wys-spec-2-2"],
  variantSources: {
    short: ["wys-spec-9-1"],
    full: ["wys-spec-9-1", "wys-spec-2-2"]
  },
  variants: {
    short:
      "Every screen in the course is fixed text, written before you arrived and the same for everyone. If that ever changes on a surface, that surface will say so.",
    full: "Every screen in the course is fixed text, written before you arrived and the same for everyone. If that ever changes on a surface, that surface will say so."
  }
} as const satisfies AnyCanonicalText;

/**
 * Step 10, plan preview (WYS §9.1 item 10). NEW.
 *
 * "Show finite direction." The count itself is never typed — the screen renders
 * `planIntro()` from `./copy.ts`, which derives the number word from
 * `wysWeeks.length` (§6.9). This record is the part `planIntro()` does not say:
 * that the end of the list is the end, and that finishing unlocks nothing. It
 * is also the sentence that keeps (WYS §21)'s appetite filter honest — nothing
 * in the course is gated behind completing it.
 */
export const lessonZeroPlanPreviewText = {
  id: "lesson-zero-plan-preview",
  surfaceKind: "general",
  status: "published",
  origin: "IMPLEMENTATION_PLACEHOLDER",
  sourceIds: ["wys-spec-9-1", "wys-spec-12"],
  variantSources: {
    short: ["wys-spec-9-1"],
    full: ["wys-spec-9-1", "wys-spec-12"]
  },
  variants: {
    short: "That is the whole course. Nothing comes after it, and finishing it unlocks nothing.",
    full: "That is the whole course. Nothing comes after it, and finishing it unlocks nothing."
  }
} as const satisfies AnyCanonicalText;

export const lessonZeroCopyRecords: readonly AnyCanonicalText[] = [
  lessonZeroHabitText,
  lessonZeroTimeDepthText,
  lessonZeroDataStaysText,
  lessonZeroDataSentText,
  lessonZeroDataNotSentText,
  lessonZeroDataNeverText,
  lessonZeroIntentText,
  lessonZeroHumanSourceText,
  lessonZeroHabitGlossText,
  lessonZeroRuntimeText,
  lessonZeroPlanPreviewText
];

/* -------------------------------------------------------------------------- */
/* 4. The step 3 slot                                                         */
/* -------------------------------------------------------------------------- */

/**
 * The empty recording slot step 3 shows (plan §6.4; WYS §9.1 item 3).
 *
 * A `WysBenSlot`, so it takes a label and a description of what is awaited and
 * has no prose-bearing prop at all: a generated sentence physically cannot
 * occupy the place a recording of Ben will go. `kind: "dashed"` rather than
 * `"media"` on purpose — a striped media block with a play disc would imply
 * there is something to play, and there is not.
 *
 * It is its own record rather than a reuse of `slot-hear-ben-60s`, because that
 * slot declares three other surfaces and this one is Lesson Zero's; a slot that
 * claimed a surface it does not appear on would make the inventory wrong in the
 * one file that is supposed to make it right.
 */
export const lessonZeroBenSlots = [
  {
    id: "slot-lesson-zero-source",
    status: "draft",
    origin: "BEN_AUTHORED",
    label: "Ben source · every stop opens here",
    awaitedAsset: "Ben has not selected the recordings",
    kind: "dashed",
    medium: "video",
    surfaces: ["/watch-your-step/start"],
    emptyReferenceReason:
      "No recording is selected for any stop, and Lesson Zero has none of its own (WYS §35 decision 4, Q10)."
  }
] as const satisfies readonly WysBenSlot[];

export const lessonZeroSourceSlot: WysBenSlot = lessonZeroBenSlots[0];

/* -------------------------------------------------------------------------- */
/* 5. Pinned labels                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Short control and section names, pinned here rather than typed into a
 * component, on the rule `wysLabels`, `todayLabels` and `planLabels` follow: a
 * control name of four words or fewer is a label, not a claim, but it still
 * gets one definition.
 *
 * ARTBOARD `5a`, verbatim: `flowName`, `continueLabel`, `showPlan`,
 * `firstHabitEyebrow`, `cadenceHeading`, `timeHeading`, `dataEyebrow`,
 * `dataPageLink` and `dataPageArrow`.
 *
 * AUTHORED by this build, each recorded in `docs/facelift-unapproved.md`:
 *  - the four headings for the undesigned steps. They name the screen; none of
 *    them makes a claim.
 *  - `startCourse` — step 10's terminal control. The artboard's flow ends at
 *    "Show my plan", which plan Phase 7 resolves as an advance to step 10, so
 *    step 10 needs a way out and no artboard draws one.
 *  - `progressLabel` — the accessible name of the rail (WYS §27). The artboard
 *    draws an unnamed bar; an unnamed `progressbar` is a defect a screen-reader
 *    user meets first.
 *  - `postureSkipHint` — the posture step's Continue is enabled with nothing
 *    chosen, and this is the line that says so. Forcing an answer would be the
 *    "justify yourself" pressure (WYS §9.1 item 1) that the drawn footnote,
 *    "No wrong answer, nothing to justify", already promises is absent.
 *
 * `dataPageArrow` is split from its label and rendered `aria-hidden`, the same
 * treatment `planLabels.doneMark` gives "✓", so the link announces "See the
 * full data page" rather than "See the full data page right arrow". Nothing is
 * removed from the screen.
 */
export const lessonZeroLabels = {
  flowName: "Lesson Zero",
  continueLabel: "Continue",
  showPlan: "Show my plan",
  firstHabitEyebrow: "THE FIRST HABIT",
  cadenceHeading: "How often?",
  timeHeading: "How long each time?",
  dataEyebrow: "BEFORE YOU START · DATA",
  dataPageLink: "See the full data page",
  dataPageArrow: "→",
  dataPageHref: "/watch-your-step/data",

  intentHeading: "What this is",
  humanSourceHeading: "The source comes first",
  runtimeHeading: "How this course runs",
  planPreviewHeading: "Your plan",

  startCourse: "Start the first stop",
  startCourseHref: "/watch-your-step/today",
  progressLabel: "Lesson Zero progress",
  postureSkipHint: "You can move on without picking one."
} as const;

export type WysLessonZeroLabelKey = keyof typeof lessonZeroLabels;

/**
 * The scenario Lesson Zero practises on, pinned by id.
 *
 * Artboard `5a` step 5 draws the leaking-pipe repair request, and
 * `content/watch-your-step/scenarios.ts` already orders the bank so that it is
 * second ((WYS §35) decision 9, pre-answered by the artboards). Naming it here
 * rather than in the page keeps the pin with the rest of Lesson Zero's data.
 */
export const LESSON_ZERO_SCENARIO_ID = "scn-repair-request";
export const LESSON_ZERO_JUDGMENT_ID = "jdg-repair-request";
