/**
 * The Practice surface's own content (plan Phase 7; WYS §14, §15.1, §21;
 * mockup 5c, dc.html:152-175).
 *
 * Three things live on Practice and they are three different objects, so they
 * are defined apart rather than as one blob of "page copy":
 *
 *  1. REPLAY — the two deterministic modes (WYS §14). The MODES are structure,
 *     not copy: which ones exist for a scenario is derived from the content
 *     bank by `replayOptionsFor()` below, and the §14 invariant rule is checked
 *     there rather than trusted.
 *  2. FROM MEMORY — the dark card whose scratch box is never persisted and
 *     never transmitted (WYS §15.1). Its notice is the one string the spec
 *     mandates word for word, so it is a canonical record and the component
 *     will not draw the box without it.
 *  3. The appetite filter (WYS §21) — a neutral signal, no email, no chat, no
 *     unlock.
 *
 * WHAT IS NOT HERE, deliberately: any sentence that scores the learner, any
 * "you're doing well", any streak, any count of replays presented as an
 * achievement. (WYS §14) makes replay a deterministic re-run, and §31 makes
 * engagement numbers a diagnostic rather than a target.
 *
 * ONE SPEC-VS-ARTBOARD COLLISION, resolved by R1 and recorded rather than
 * silently taken: (WYS §21) writes the appetite signal as "I want deeper
 * practice"; approved artboard `5c` writes "I'd want deeper practice", and plan
 * Phase 7 quotes the artboard's form. R1 resolves on-screen copy to the
 * artboard, so the artboard's wording ships. The §37 acceptance box ("'I want
 * deeper practice' exists as a neutral signal") is satisfied by the signal
 * existing, not by the contraction. Recorded in docs/facelift-unapproved.md.
 *
 * A SECOND ONE, same treatment: §15.1's mandated label is one sentence ("This
 * stays in this page and is not sent anywhere."); artboard `5c` adds a second
 * ("It clears when you leave."). Both are true of the shipped component — the
 * box is React state that no code path writes anywhere, and it is cleared on
 * route change — so the artboard's two-sentence form ships as ONE record citing
 * both sources. Adding the second sentence is a safe-direction addition (R9):
 * it promises more, and the implementation delivers it.
 */

import type { AnyCanonicalText } from "@/lib/canonical-text";
import type { WysCanonicalVariant, WysScenario } from "./types";
import { wysVariantById, type WysVariantId } from "./variants";

/* -------------------------------------------------------------------------- */
/* 1. Canonical records                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Artboard `5c` Practice, the lead line under the title (dc.html:155), verbatim.
 *
 * It is a CLAIM about the whole surface — "authored, not generated" — which is
 * exactly the kind of sentence §34 forbids fixing in copy if the code stops
 * making it true. It stays true by construction: `replayOptionsFor()` reads
 * authored records and there is no generation path anywhere in this build.
 */
export const practiceLeadText = {
  id: "practice-authored-not-generated",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["artboard-5c-practice", "wys-spec-14"],
  variantSources: {
    short: ["artboard-5c-practice"],
    full: ["artboard-5c-practice"]
  },
  variants: {
    short: "Everything here is authored, not generated. Replay is the same scenario, or Ben's own variant of it.",
    full: "Everything here is authored, not generated. Replay is the same scenario, or Ben's own variant of it."
  }
} as const satisfies AnyCanonicalText;

/**
 * Artboard `5c`, the FROM MEMORY card's prompt (dc.html:164), verbatim.
 *
 * It names "the first habit", which is Lesson Zero's object (`prn-first-habit`,
 * artboard `5a` step 5's THE FIRST HABIT card). The prompt does not restate the
 * habit — that would be a second definition of it — it asks the learner to
 * produce it, which is the whole point of retrieval practice.
 */
export const fromMemoryPromptText = {
  id: "from-memory-prompt",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["artboard-5c-practice", "wys-spec-15-1"],
  variantSources: {
    short: ["artboard-5c-practice"],
    full: ["artboard-5c-practice"]
  },
  variants: {
    short: "Before checking anything: say the first habit in your own words.",
    full: "Before checking anything: say the first habit in your own words."
  }
} as const satisfies AnyCanonicalText;

/**
 * The scratch box's promise (WYS §15.1 label + artboard `5c` dc.html:167).
 *
 * THIS RECORD IS A GUARANTEE ABOUT CODE, NOT A REASSURANCE. `components/wys/
 * FromMemory.tsx` renders no scratch box unless this string may render beside
 * it, and `tests/wys-practice.test.ts` proves the promise structurally with the
 * §29.2 canary rather than by reading the component and hoping.
 */
export const fromMemoryScratchNoticeText = {
  id: "from-memory-scratch-notice",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["wys-spec-15-1", "artboard-5c-practice"],
  variantSources: {
    short: ["artboard-5c-practice"],
    full: ["artboard-5c-practice"]
  },
  variants: {
    short: "This stays in this page and is not sent anywhere. It clears when you leave.",
    full: "This stays in this page and is not sent anywhere. It clears when you leave."
  }
} as const satisfies AnyCanonicalText;

/**
 * Artboard `5c`, the appetite card's body (dc.html:171), verbatim.
 *
 * (WYS §21) supplies its own "optional follow-up copy" with a different
 * wording; R1 resolves an on-screen string to the approved artboard, and the
 * two say the same thing. The artboard's is shorter and is the one drawn.
 */
export const appetiteExplanationText = {
  id: "appetite-no-coach-yet",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["artboard-5c-practice", "wys-spec-21"],
  variantSources: {
    short: ["artboard-5c-practice"],
    full: ["artboard-5c-practice"]
  },
  variants: {
    short:
      "This course works without an AI coach. Ben is testing whether people want deeper replay, pressure-testing or source-checking before building that.",
    full: "This course works without an AI coach. Ben is testing whether people want deeper replay, pressure-testing or source-checking before building that."
  }
} as const satisfies AnyCanonicalText;

/** Registered in `./index.ts` — an unregistered module escapes every check. */
export const practiceCopyRecords: readonly AnyCanonicalText[] = [
  practiceLeadText,
  fromMemoryPromptText,
  fromMemoryScratchNoticeText,
  appetiteExplanationText
];

/* -------------------------------------------------------------------------- */
/* 2. Pinned labels                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Short UI strings, pinned here rather than typed into a component — the same
 * treatment `wysLabels` gives node names in `./copy.ts`, and for the same
 * reason: a control that is named in two files is a control that gets renamed
 * in one of them.
 *
 * Provenance, stated per group because it differs:
 *
 *  - ARTBOARD-VERBATIM (`5c`, dc.html:156-175): the two eyebrows, both replay
 *    tags, both From Memory offers, the scratch placeholder, "I did it", the
 *    appetite pill and its note. Ben approved the artboard.
 *  - SPEC-VERBATIM (WYS §15.1): the two offers appear there too, without the
 *    artboard's dropped full stops. The artboard's punctuation ships (R1).
 *  - AUTHORED BY THIS BUILD, and on the Final-copy list for Ben's stamp: every
 *    string marked NEW below. Each is an affordance or a state the artboard
 *    does not draw, because the artboard draws one populated state of a surface
 *    that also has an empty state, a withheld state and a recorded state.
 *    None of them is a claim, and none is in Ben's voice (R10).
 */
export const practiceLabels = {
  /**
   * The H1. Pinned here rather than read off `courseTabs`: the tab and the page
   * are two nodes that happen to share a word here and deliberately do not on
   * Data ("Data" the tab, "What this site knows about you" the page).
   */
  pageTitle: "Practice",

  /** Section eyebrows, in the artboard's caps (never `text-transform`). */
  replayEyebrow: "REPLAY",
  fromMemoryEyebrow: "FROM MEMORY",

  /**
   * NEW — accessible names for the three landmarks the eyebrows head.
   *
   * The eyebrow is typed in caps because the artboard draws caps, and a screen
   * reader announcing "R E P L A Y" from an `aria-label` is the §27 defect the
   * SectionEyebrow primitive already warns about. So the visible eyebrow and
   * the accessible name are the same node in two presentations, not two names.
   */
  replaySectionName: "Replay",
  fromMemorySectionName: "From Memory",
  appetiteSectionName: "Deeper practice",

  /** The two §14 modes, as the artboard tags them (dc.html:158-160). */
  asAuthoredTag: "as authored",
  benVariantTag: "Ben variant",

  /** NEW — the control that starts a replay. The artboard draws the row, not its verb. */
  replayStart: "Replay this",
  /** NEW — closes an open replay without committing anything. */
  replayClose: "Close this replay",
  /** NEW — the empty state. No artboard draws a Practice screen with nothing to replay. */
  replayEmptyLabel: "Nothing to replay yet",
  replayEmptyAwaited: "a scenario you have already judged",
  /**
   * NEW — the withheld state. While `RENDER_MARKED_DRAFT` is false every
   * scenario resolves to `blocked`, so the row can name the mode but cannot
   * run the exercise. Saying so is better than a control that does nothing.
   */
  replayWithheldLabel: "Replay opens when this scenario is published",
  replayWithheldAwaited: "Ben's ruling on draft curriculum text",

  /** From Memory, the two offers (artboard dc.html:166; WYS §15.1). */
  sayItAloud: "Say it aloud",
  writeItOnPaper: "Write it on paper",
  /** The scratch box placeholder (artboard dc.html:167). */
  scratchPlaceholder: "Or type here.",
  /** NEW — the box's accessible name. The artboard labels it with a placeholder alone. */
  scratchFieldLabel: "Optional scratch space",
  /** The card's only control (artboard dc.html:169). */
  didIt: "I did it",
  /**
   * NEW — what "I did it" says afterwards.
   *
   * It is deliberately not a reward and deliberately not a lie: nothing is
   * recorded, because no declared `wys:v1` field holds a ritual completion and
   * §7.1's shape may not gain one. See docs/facelift-unapproved.md R4.
   */
  didItAcknowledged: "Marked. Nothing was recorded.",

  /** The appetite pill and its note (artboard dc.html:172-173). */
  deeperPractice: "I'd want deeper practice",
  appetiteNote: "One anonymous count. No email. Nothing unlocks.",
  /** NEW — the recorded state. Muted, mono, not a celebration (WYS §37 "not visually rewarded"). */
  appetiteRecorded: "Recorded in this browser."
} as const;

export type WysPracticeLabelKey = keyof typeof practiceLabels;

/* -------------------------------------------------------------------------- */
/* 3. The two deterministic replay modes (WYS §14)                            */
/* -------------------------------------------------------------------------- */

/**
 * Exactly two, closed, and named after what they replay rather than after a
 * feature: "as authored" is the scenario as written, "ben-variant" is a
 * Ben-authored canonical variation of it. There is no third mode and no
 * runtime generation (WYS §14: "Do not generate new AI variations in website
 * v0").
 */
export type ReplayMode = "as-authored" | "ben-variant";

export const REPLAY_MODES: readonly ReplayMode[] = ["as-authored", "ben-variant"];

export interface ReplayOption {
  /** `scenarioId` plus the mode. Stable, and legal as a React key. */
  id: string;
  scenarioId: string;
  mode: ReplayMode;
  /** The artboard's tag for this mode. Never typed at a call site. */
  tag: string;
  /** Present only on `ben-variant`. */
  variantId?: string;
}

/**
 * THE §14 INVARIANT RULE, ENFORCED RATHER THAN DOCUMENTED.
 *
 * "Every scenario family has an invariant. Surface details can vary. The
 * judgment construct must not drift." `tests/wys-content.test.ts` already
 * checks that every authored variant satisfies both halves. This is the second
 * gate, at the point of USE: a variant whose invariant has drifted from its
 * parent's, or whose `judgmentMapping` no longer covers every parent choice
 * key, is not a replay of the same construct and therefore is not one of §14's
 * two modes. It throws.
 *
 * A throw is the correct failure. `replayOptionsFor` is called from a server
 * component at build time, so drift fails `next build` loudly instead of
 * shipping a "replay" that quietly asks a different question.
 *
 * Exported so `tests/wys-practice.test.ts` can drive it with a deliberately
 * drifted pair. A guard that is only ever called with valid data is a guard
 * nobody has checked.
 */
export function assertReplayInvariant(scenario: WysScenario, variant: WysCanonicalVariant): void {
  if (variant.invariant !== scenario.invariant) {
    throw new Error(
      `Replay refused: variant "${variant.id}" no longer shares scenario "${scenario.id}"'s invariant (WYS §14).`
    );
  }
  for (const choice of scenario.choices) {
    if (!variant.judgmentMapping[choice.key]) {
      throw new Error(
        `Replay refused: variant "${variant.id}" maps no judgment for choice "${choice.key}" of "${scenario.id}" (WYS §14).`
      );
    }
  }
}

/**
 * The replay modes available for one scenario.
 *
 * "As authored" always exists — it is the scenario itself. A Ben variant exists
 * only where Ben has authored one, which is what `origin` records:
 * `BEN_AUTHORED_VARIATION` is the only origin the teal "Ben variant" tag may
 * bind to. `AI_ADAPTATION` is deliberately NOT a replay mode — it is neither of
 * §14's two, and tagging it "Ben variant" would attribute machine-drafted prose
 * to Ben, which R9 forbids in the strongest terms.
 *
 * IN V0 THAT MEANS ONE MODE PER SCENARIO. Ben has authored no variation
 * (WYS §35 decision 9 is open), so `wysVariants` holds a single `AI_ADAPTATION`
 * record and Practice ships "as authored" rows only — exactly what plan Phase 7
 * allows ("'Ben variant' where one exists") and what
 * `tests/wys-content.test.ts` already asserts about the bank. The second mode
 * is built, checked and unreachable until a Ben variant lands.
 */
export function replayOptionsFor(scenario: WysScenario): ReplayOption[] {
  const options: ReplayOption[] = [
    {
      id: `${scenario.id}:as-authored`,
      scenarioId: scenario.id,
      mode: "as-authored",
      tag: practiceLabels.asAuthoredTag
    }
  ];

  for (const variantId of scenario.canonicalVariantIds ?? []) {
    const variant = wysVariantById(variantId as WysVariantId);
    if (variant.origin !== "BEN_AUTHORED_VARIATION") continue;
    assertReplayInvariant(scenario, variant);
    options.push({
      id: `${scenario.id}:ben-variant:${variant.id}`,
      scenarioId: scenario.id,
      mode: "ben-variant",
      tag: practiceLabels.benVariantTag,
      variantId: variant.id
    });
  }

  return options;
}
