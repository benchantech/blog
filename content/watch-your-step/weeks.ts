/**
 * The provisional curriculum skeleton (WYS §11) — Lesson Zero plus source
 * periods A-H, as `WysWeek` records.
 *
 * (WYS §11) is explicit about what these titles are: "Do not treat the
 * following week titles as Ben-authored doctrine. They are an implementation
 * scaffold derived from the current architecture." handoff README bucket 3 says
 * the same thing in provenance terms — stop titles A-H are draft placeholders.
 * So every record is `status: "draft"` with `origin:
 * "IMPLEMENTATION_PLACEHOLDER"`, and the scaffold footnote the artboards draw
 * ("Stop titles are a working scaffold; Ben is choosing the recordings.") is
 * the on-screen form of the same fact. Its single definition is in `copy.ts`.
 *
 * THE COUNT IS DERIVED, NEVER TYPED (plan §6.9; WYS §11 "approximately 8-12
 * source periods without hardcoding a fixed number"). `stopCount()` is
 * `wysWeeks.length`. Nothing in this build may ship the literal 9.
 *
 * TWO RENDERING MODES, DECLARED. The approved copy spells the count out in
 * prose ("Nine short stops. Then it's over."; "Nine stops, one Ben recording
 * each.") and uses the numeral in the stat tile ("1 of 9"). Interpolating the
 * integer everywhere would silently rewrite approved Final copy to
 * "9 short stops." So `stopCountWord()` supplies prose surfaces,
 * sentence-capitalised, and `stopCount()` supplies the stat tile and any
 * "n of m". Both derive from the same array; neither is typed.
 *
 * COLLAPSED TITLE COLLISIONS (plan §6.8 collapse 2). Three stop titles differ
 * between `4a` and `5b`. The `5b` long forms win, because they match (WYS §11):
 * "Minimum Necessary Is Not Minimum Possible", "Delegation and Verification",
 * "Memory, State, and Correction". `shortTitle` carries the 15px desktop-cell
 * form of the SAME record — one node, two presentations. Stop H is the fourth
 * case: `5b` Progress reads "Learner-Owned Rules and Exit" and `5b` Plan reads
 * "Your Rules. Exit.", so those are its title and its short title.
 *
 * CADENCE. `days2`, `days3` and `days5` are declared per stop from (WYS §12)'s
 * working paths. `mostDays` is deliberately left undefined and falls back to
 * `days5` in `lib/wys/local-state.ts` — "most days" changes how often a learner
 * comes back, not how many visits a stop takes, because (WYS §12) forbids
 * accelerating "through multiple Ben source periods in one sitting".
 *
 * TIME BUDGET. `timeBudgetPaths` hold `WysPathSegment` values: depth inside one
 * session, per the approved note "More time adds depth to each source. It
 * doesn't move you through Ben's recordings faster."
 */

import { cadencePathFor, type WysCadence } from "@/lib/wys/local-state";
import type { WysWeek } from "./types";

export type WysWeekOrder = number;

const SCAFFOLD_TITLE_REASON =
  "Titles are an implementation scaffold (WYS §11); Ben has not approved a wording.";

const NO_RECORDING_YET = "Ben has not selected the recording that anchors this stop (WYS §35 decision 4).";

export const wysWeeks = [
  {
    id: "stop-zero",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    order: 0,
    title: "Start With Distrust",
    purpose: "Onboarding is curriculum: leave one durable habit behind even for someone who never returns.",
    principleIds: ["prn-first-habit"],
    watch: [],
    tryScenarioIds: ["scn-repair-request"],
    judgeIds: ["jdg-repair-request"],
    boundaryIds: ["bnd-repair-request-address"],
    variantIds: [],
    artifactIds: [],
    carryIds: ["car-zero-first-habit"],
    transferCheckIds: [],
    timeBudgetPaths: {
      min5: ["core-decision"],
      min10: ["core-decision", "carry"],
      min15: ["core-decision", "carry"],
      min20plus: ["core-decision", "carry"]
    },
    cadencePaths: {
      days2: ["day-lesson-zero"],
      days3: ["day-lesson-zero"],
      days5: ["day-lesson-zero"]
    },
    emptyReferenceReason:
      "Lesson Zero has no Ben recording at all, which is one half of open question Q10."
  },
  {
    id: "stop-a",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    order: 1,
    title: "Task Before Prompt",
    primarySourceId: "src-stop-a-recording",
    purpose: "Define the job, then tell task-bearing detail apart from biography.",
    principleIds: ["prn-task-before-prompt"],
    watch: ["src-stop-a-recording"],
    tryScenarioIds: ["scn-client-meeting", "scn-group-chat"],
    judgeIds: ["jdg-client-meeting", "jdg-group-chat"],
    boundaryIds: ["bnd-client-meeting-reason"],
    variantIds: ["var-group-chat-school"],
    artifactIds: [],
    carryIds: ["car-a-remove-one-detail"],
    transferCheckIds: ["rit-transfer-check"],
    optionalPracticeIds: ["rit-from-memory"],
    timeBudgetPaths: {
      min5: ["human-source"],
      min10: ["human-source", "core-decision"],
      min15: ["human-source", "core-decision", "boundary"],
      min20plus: ["human-source", "core-decision", "boundary", "changed-scenario"]
    },
    cadencePaths: {
      days2: ["day-source-and-core", "day-excerpt-changed-carry"],
      days3: ["day-human-source", "day-excerpt-and-core", "day-changed-and-carry"],
      days5: [
        "day-human-source",
        "day-excerpt-and-core",
        "day-other-medium",
        "day-boundary",
        "day-carry-only"
      ]
    }
  },
  {
    id: "stop-b",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    order: 2,
    title: "Minimum Necessary Is Not Minimum Possible",
    shortTitle: "Minimum Necessary ≠ Minimum Possible",
    primarySourceId: "src-stop-b-recording",
    purpose: "Teach the cases where a specific detail is the thing the task turns on.",
    principleIds: ["prn-minimum-necessary"],
    watch: ["src-stop-b-recording"],
    tryScenarioIds: [
      "scn-ow-jurisdiction",
      "scn-ow-age-range",
      "scn-ow-error-code",
      "scn-ow-deadline",
      "scn-ow-over-trimmed"
    ],
    judgeIds: [
      "jdg-ow-jurisdiction",
      "jdg-ow-age-range",
      "jdg-ow-error-code",
      "jdg-ow-deadline",
      "jdg-ow-over-trimmed"
    ],
    boundaryIds: ["bnd-over-withholding", "bnd-jurisdiction-detail"],
    variantIds: [],
    artifactIds: [],
    carryIds: ["car-b-notice-the-necessary"],
    transferCheckIds: ["rit-transfer-check"],
    optionalPracticeIds: ["rit-from-memory"],
    timeBudgetPaths: {
      min5: ["human-source"],
      min10: ["human-source", "core-decision"],
      min15: ["human-source", "core-decision", "boundary"],
      min20plus: ["human-source", "core-decision", "boundary", "changed-scenario"]
    },
    cadencePaths: {
      days2: ["day-source-and-core", "day-excerpt-changed-carry"],
      days3: ["day-human-source", "day-excerpt-and-core", "day-changed-and-carry"],
      days5: [
        "day-human-source",
        "day-excerpt-and-core",
        "day-other-medium",
        "day-boundary",
        "day-carry-only"
      ]
    }
  },
  {
    id: "stop-c",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    order: 3,
    title: "Hidden Exposure",
    primarySourceId: "src-stop-c-recording",
    purpose: "Distinctive combinations, inference, and what a container carries besides its content.",
    principleIds: ["prn-hidden-exposure"],
    watch: ["src-stop-c-recording"],
    tryScenarioIds: ["scn-ow-medium"],
    judgeIds: ["jdg-ow-medium"],
    boundaryIds: ["bnd-container-trim"],
    variantIds: [],
    /** Empty on purpose — the artifact bank has no records yet. See artifacts.ts. */
    artifactIds: [],
    carryIds: ["car-c-inspect-the-container"],
    transferCheckIds: ["rit-transfer-check"],
    optionalPracticeIds: ["rit-from-memory"],
    timeBudgetPaths: {
      min5: ["human-source"],
      min10: ["human-source", "core-decision"],
      min15: ["human-source", "core-decision", "other-medium"],
      min20plus: ["human-source", "core-decision", "other-medium", "boundary"]
    },
    cadencePaths: {
      days2: ["day-source-and-core", "day-excerpt-changed-carry"],
      days3: ["day-human-source", "day-excerpt-and-core", "day-changed-and-carry"],
      days5: [
        "day-human-source",
        "day-excerpt-and-core",
        "day-other-medium",
        "day-boundary",
        "day-carry-only"
      ]
    },
    emptyReferenceReason:
      "Fictional artifacts for this stop need image production; the stop says so rather than inventing one."
  },
  {
    id: "stop-d",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    order: 4,
    title: "Source, Synthesis, Authority",
    primarySourceId: "src-stop-d-recording",
    purpose: "Separate what a system can produce from what it is entitled to decide.",
    principleIds: ["prn-source-before-synthesis"],
    watch: ["src-stop-d-recording"],
    tryScenarioIds: ["scn-ow-error-code"],
    judgeIds: ["jdg-ow-error-code"],
    boundaryIds: ["bnd-synthesis-authority"],
    variantIds: [],
    artifactIds: [],
    carryIds: ["car-d-ask-for-the-source"],
    transferCheckIds: ["rit-transfer-check"],
    optionalPracticeIds: ["rit-from-memory"],
    timeBudgetPaths: {
      min5: ["human-source"],
      min10: ["human-source", "core-decision"],
      min15: ["human-source", "core-decision", "boundary"],
      min20plus: ["human-source", "core-decision", "boundary", "changed-scenario"]
    },
    cadencePaths: {
      days2: ["day-source-and-core", "day-excerpt-changed-carry"],
      days3: ["day-human-source", "day-excerpt-and-core", "day-changed-and-carry"],
      days5: [
        "day-human-source",
        "day-excerpt-and-core",
        "day-other-medium",
        "day-boundary",
        "day-carry-only"
      ]
    }
  },
  {
    id: "stop-e",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    order: 5,
    title: "Delegation and Verification",
    shortTitle: "Delegation & Verification",
    primarySourceId: "src-stop-e-recording",
    purpose: "What can be handed over, what the handover costs, and which rule already governs it.",
    principleIds: ["prn-delegate-then-verify"],
    watch: ["src-stop-e-recording"],
    tryScenarioIds: ["scn-employer-policy", "scn-ow-sequence"],
    judgeIds: ["jdg-employer-policy", "jdg-ow-sequence"],
    boundaryIds: ["bnd-external-authority"],
    variantIds: [],
    artifactIds: [],
    carryIds: ["car-e-name-the-rule"],
    transferCheckIds: ["rit-transfer-check"],
    optionalPracticeIds: ["rit-from-memory"],
    timeBudgetPaths: {
      min5: ["human-source"],
      min10: ["human-source", "core-decision"],
      min15: ["human-source", "core-decision", "boundary"],
      min20plus: ["human-source", "core-decision", "boundary", "changed-scenario"]
    },
    cadencePaths: {
      days2: ["day-source-and-core", "day-excerpt-changed-carry"],
      days3: ["day-human-source", "day-excerpt-and-core", "day-changed-and-carry"],
      days5: [
        "day-human-source",
        "day-excerpt-and-core",
        "day-other-medium",
        "day-boundary",
        "day-carry-only"
      ]
    }
  },
  {
    /**
     * Off-site. (WYS §15.2): a single visit that sets a return cue and completes
     * only on an explicit mark. The Plan row reads "off-site" and shows no
     * visit counter, which is why `offSite` is data rather than a component
     * branch.
     */
    id: "stop-f",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    order: 6,
    title: "Independence",
    primarySourceId: "src-stop-f-recording",
    purpose: "Stop assisted success from passing for learned judgment.",
    principleIds: ["prn-retrieve-before-checking"],
    watch: ["src-stop-f-recording"],
    tryScenarioIds: [],
    judgeIds: [],
    boundaryIds: ["bnd-detox-proof"],
    variantIds: [],
    artifactIds: [],
    carryIds: ["car-f-return-cue"],
    transferCheckIds: [],
    optionalPracticeIds: ["rit-from-memory"],
    offSite: true,
    timeBudgetPaths: {
      min5: ["detox"],
      min10: ["detox"],
      min15: ["detox"],
      min20plus: ["detox"]
    },
    cadencePaths: {
      days2: ["day-detox"],
      days3: ["day-detox"],
      days5: ["day-detox"]
    },
    emptyReferenceReason:
      "The stop happens away from the site, so it carries a ritual rather than a scenario bank."
  },
  {
    id: "stop-g",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    order: 7,
    title: "Memory, State, and Correction",
    shortTitle: "Memory, State, Correction",
    primarySourceId: "src-stop-g-recording",
    purpose: "What systems retain, what can be inspected, and what reset actually means.",
    principleIds: ["prn-correction-outranks-inference"],
    watch: ["src-stop-g-recording"],
    tryScenarioIds: ["scn-ow-sequence"],
    judgeIds: ["jdg-ow-sequence"],
    boundaryIds: ["bnd-reset-meaning"],
    variantIds: [],
    artifactIds: [],
    carryIds: ["car-g-inspect-and-correct"],
    transferCheckIds: ["rit-transfer-check"],
    optionalPracticeIds: ["rit-from-memory"],
    timeBudgetPaths: {
      min5: ["human-source"],
      min10: ["human-source", "core-decision"],
      min15: ["human-source", "core-decision", "boundary"],
      min20plus: ["human-source", "core-decision", "boundary", "changed-scenario"]
    },
    cadencePaths: {
      days2: ["day-source-and-core", "day-excerpt-changed-carry"],
      days3: ["day-human-source", "day-excerpt-and-core", "day-changed-and-carry"],
      days5: [
        "day-human-source",
        "day-excerpt-and-core",
        "day-other-medium",
        "day-boundary",
        "day-carry-only"
      ]
    }
  },
  {
    /** The terminal row: white, dashed, "the end" (artboard 5b Plan). */
    id: "stop-h",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    order: 8,
    title: "Learner-Owned Rules and Exit",
    shortTitle: "Your Rules. Exit.",
    primarySourceId: "src-stop-h-recording",
    purpose: "Finish with rules the learner owns, and make coming back optional.",
    principleIds: ["prn-learner-rules-outrank"],
    watch: ["src-stop-h-recording"],
    tryScenarioIds: ["scn-ow-relationship"],
    judgeIds: ["jdg-ow-relationship"],
    boundaryIds: ["bnd-rule-with-exception"],
    variantIds: [],
    artifactIds: [],
    carryIds: ["car-h-write-one-rule"],
    transferCheckIds: [],
    optionalPracticeIds: ["rit-rulebook-review"],
    terminal: true,
    timeBudgetPaths: {
      min5: ["rulebook"],
      min10: ["human-source", "rulebook"],
      min15: ["human-source", "rulebook", "core-decision"],
      min20plus: ["human-source", "rulebook", "core-decision", "boundary"]
    },
    cadencePaths: {
      days2: ["day-source-and-core", "day-rulebook-and-exit"],
      days3: ["day-human-source", "day-excerpt-and-core", "day-rulebook-and-exit"],
      days5: [
        "day-human-source",
        "day-excerpt-and-core",
        "day-boundary",
        "day-rulebook-and-exit",
        "day-carry-only"
      ]
    }
  }
] as const satisfies readonly WysWeek[];

/** Why the scaffold titles carry no Ben approval. For the preview dump. */
export const WEEK_TITLE_SCAFFOLD_REASON = SCAFFOLD_TITLE_REASON;

/** Why Lesson Zero has no `primarySourceId`. */
export const LESSON_ZERO_NO_RECORDING_REASON = NO_RECORDING_YET;

/* -------------------------------------------------------------------------- */
/* The derived count (plan §6.9)                                              */
/* -------------------------------------------------------------------------- */

/** The number of stops. NEVER type this value anywhere else. */
export function stopCount(): number {
  return wysWeeks.length;
}

const NUMBER_WORDS: readonly string[] = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen"
];

/**
 * The number word, sentence-capitalised, for PROSE surfaces only.
 *
 * Falls back to the numeral above the declared range rather than inventing a
 * word — a count outside 0-15 would mean the course grew past anything (WYS §11)
 * contemplates, and a wrong word in approved copy is worse than a digit.
 */
export function countWord(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}

/** The prose form of the stop count. Sentence-initial. */
export function stopCountWord(): string {
  return countWord(stopCount());
}

/** The lettered stops only — Lesson Zero is order 0 and carries no letter. */
export function letteredStops(): readonly WysWeek[] {
  return wysWeeks.filter((week) => week.order > 0);
}

/** "A", "B", ... for a lettered stop; null for Lesson Zero. */
export function stopLetter(week: WysWeek): string | null {
  if (week.order <= 0) return null;
  return String.fromCharCode(64 + week.order);
}

/** How many visits a stop takes at a cadence. Derived, never typed. */
export function visitCount(week: WysWeek, cadence?: WysCadence): number {
  if (week.offSite) return 1;
  return cadencePathFor(week, cadence).length;
}

export function wysWeekById(id: string): WysWeek {
  const record = wysWeeks.find((week) => week.id === id);
  if (!record) throw new Error(`No WYS week with id "${id}".`);
  return record;
}

/**
 * Every stop id, in order — the serializer's `stopIds` domain (plan §7.2).
 *
 * WRITTEN OUT RATHER THAN DERIVED, AND THAT IS A PROVENANCE FIX, NOT A STYLE
 * CHOICE. `content/watch-your-step/domains.ts` is imported by every course
 * CLIENT component (it is the vocabulary `useWysState` hands the serializer),
 * so anything this list touches is pulled into a client JavaScript chunk and
 * served to every visitor. While it read `wysWeeks.map(...)` it referenced the
 * whole week bank, and webpack could not drop it: the Phase 12 audit found all
 * nine stop titles, aims and scaffold notes — `draft` +
 * `IMPLEMENTATION_PLACEHOLDER`, and therefore BLOCKED under Q21's ratified
 * default — sitting in `static/chunks/*.js` in plain text, unlabelled, on the
 * same pages that honestly drew "Implementation placeholder — not Ben's words"
 * in the DOM. That is exactly the leak `withoutBlockedProse` in
 * `lib/wys/content-gate.ts` exists to prevent, one layer down: the label was
 * true of the pixels and false of the page's asset graph.
 *
 * A vocabulary of ids is not prose and carries no provenance, so listing it is
 * safe where quoting a title would not be. It is also the idiom already used
 * beside the scenario bank (`WYS_SCENARIO_IDS` in `./scenarios.ts`), and it is
 * NOT the hardcoded count §6.9 forbids — `stopCount()` is still
 * `wysWeeks.length` and nothing here types a 9.
 *
 * `tests/wys-content.test.ts` asserts this list equals `wysWeeks.map(w => w.id)`
 * exactly, so the two cannot drift: adding a stop without adding its id fails
 * the suite rather than silently shrinking a domain.
 */
export const WYS_STOP_IDS: readonly string[] = [
  "stop-zero",
  "stop-a",
  "stop-b",
  "stop-c",
  "stop-d",
  "stop-e",
  "stop-f",
  "stop-g",
  "stop-h"
];
