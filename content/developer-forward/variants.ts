/**
 * Developer Forward Lite — the 27 world-state axis fragments and the approved
 * composition rules that select them (plan GAP-3, GAP-7; layer 07
 * `variant-transition-rules.BEN_APPROVED.json`; layer 08 gate Q-D).
 *
 * Carried verbatim into this doc comment because it is the whole reason the
 * composition is safe to ship: **"Variant composition describes fictional
 * world conditions only; it must never infer learner traits."** Every string
 * below is a fact about the SCENARIO the learner is about to read. None of it
 * is a statement about the learner. The learner-facing claim layer is the
 * receipts and the terminal narrative, not this file.
 *
 * Pure TypeScript. No React, no JSX, no CSS import, no component import — the
 * suite runs as `node --import tsx --test tests/*.test.ts` and Node cannot load
 * a `.css` specifier, so a stylesheet reached from here would take a whole test
 * file down with `ERR_UNKNOWN_FILE_EXTENSION`. The shared contract is imported
 * from `@/lib/developer-forward/types` and nothing here redefines any part of it.
 *
 * ## Why fragments and not 55 scenarios
 *
 * The recovered composition spec (`55-variant-composition-spec.recovered.json`)
 * and the reviewed plan independently arrive at the same architecture: **5 base
 * setups + 27 axis fragments, deterministically composed**, not 55
 * independently authored scenarios. 1 + 9 + 9 + 9 + 27 = 55. Authoring 55 whole
 * scenarios would put the same sentence in up to nine places and let them drift.
 *
 * ## LEVELS COME FROM THE POSTURE, NEVER FROM A/B/C
 *
 * `fragmentIds` on every axis is a THREE-TUPLE ORDERED BY `POSTURES[source]`:
 * index 0 -> ternary 0.0, index 1 -> 0.5, index 2 -> 1.0. It is never "option A
 * -> index 0". Nine of the 138 recovered signal tags are deliberately
 * non-monotonic — C2D1 is inverted on promise and trust, so its option A
 * carries `trust:stewardship` (1.0) — and a selector that read the level from
 * an option's position would be wrong on all nine while failing no obvious
 * check. Resolve the posture first (`postureValue`), then index this tuple.
 *
 * ## THE TWO AXES OF A CASE ARE CORRELATED, NOT INDEPENDENT
 *
 * This is the correctness fact most likely to be lost. Both axes of a case are
 * derived from the SAME upstream answers by the locked dominant-posture /
 * later-tiebreak reducer, so they cannot vary freely against each other. Only
 * **43 of the 55 authored combinations are reachable** through the Lite
 * instrument:
 *
 *   - Case 1 — 1/1   (one fixed setup, no axes at all)
 *   - Case 2 — 5/9   (ambiguity x reliance, both from C1's two decisions)
 *   - Case 3 — 7/9   (5 reached by real evidence, plus 2 that exist ONLY
 *                     because gate Q-D's `VERIFY_TRUST` neutral fires)
 *   - Case 4 — 3/9   (ownership is pinned to `OWN_SHARE`, so only trust varies)
 *   - Case 5 — 27/27 (three axes, all three fed by accumulated evidence)
 *
 * Layer 08's `LAYER08_RULINGS.md` records **41/55** with Case 3 at 5/9: that
 * count was taken before the two combinations that the same layer's own Q-D
 * neutral creates were added back in. Both numbers describe the same system;
 * 43 is the one that includes the Q-D-created pair, and it is the number
 * launch verification should render.
 *
 * The 12 unreachable combinations are **valid composition-space content and
 * must never be deleted**. This is the same distinction the product already
 * holds between 729 theoretical terminal states and 465 reachable ones: dead
 * under the locked transition rules is not the same as wrong.
 *
 * ## SIX IDS ARE AUTHORED TWICE, WITH DIFFERENT SENTENCES
 *
 * `RISK_MOVE|RISK_STAGE|RISK_PROTECT` appear on Case 3 AND Case 5;
 * `OWN_TRANSFER|OWN_SHARE|OWN_RETAIN` appear on Case 4 AND Case 5. The ids are
 * shared on purpose — they are stable `variantId` tuple components (GAP-3) and
 * renaming one invalidates every stored learner answer — but the AUTHORED
 * SENTENCES DIFFER, and the difference is real content, not a duplication
 * artifact: Case 3's `RISK_MOVE` is "The feature is reversible, internal…"
 * while Case 5's is "The change is reversible…", and both appear that way in
 * the verbatim layer-06 extraction.
 *
 * So `FRAGMENTS` is the 21 distinct ids at their FIRST-AUTHORED text, and
 * `CASE_FRAGMENT_OVERRIDES` holds the six Case 5 re-authorings. All 27 authored
 * sentences are preserved and none is silently dropped.
 *
 * **Callers must resolve text with `fragmentText(caseNumber, fragmentId)`.**
 * Reading `FRAGMENTS[fragmentId]` directly renders Case 3's risk sentence on
 * Case 5 — no crash, no failing type, just the wrong world.
 *
 * ## Governance
 *
 * The 27 fragments are `recovered_prior_authoring`, approved by Ben on
 * 2026-09-07 (`06_full-five-case-authoring-extraction-2026-09-07/
 * SC_TF1_APPROVAL_RECORD_2026-09-07.md`). The axis selection and the two
 * missing-evidence neutrals are `ben_canonical`: they are transcribed from
 * `variant-transition-rules.BEN_APPROVED.json` and
 * `Q_D_CASE3_VERIFICATION_NEUTRAL.BEN_APPROVED.json`, both carrying
 * `"authority": "ben_approved_governing_rule"`. See `VARIANT_PROVENANCE`.
 */

import type { AxisKey, CaseNumber, Dimension } from "@/lib/developer-forward/types";

/**
 * A CONTRACT GAP, recorded rather than papered over. `AxisKey` in
 * `@/lib/developer-forward/types` declares six keys — `ambiguity`, `reliance`,
 * `verification`, `risk`, `ownership`, `trust` — and Case 5's authored first
 * axis is `promise`, which is not among them. The shared contract is owned
 * elsewhere and is not edited from here, so this alias widens it locally
 * instead of redefining it. If `promise` is later added to `AxisKey`, this
 * union collapses to `AxisKey` and every use of it keeps compiling unchanged.
 * Until then, DO NOT drop the `promise` axis to satisfy the narrower type: it
 * is one third of Case 5's variant id and all 27 of its combinations are
 * reachable.
 */
export type VariantAxisKey = AxisKey | "promise";

/* -------------------------------------------------------------------------- */
/* 1. Provenance                                                              */
/* -------------------------------------------------------------------------- */

export type VariantProvenance =
  | "ben_canonical"
  | "recovered_prior_authoring"
  | "implementation_authored_under_ben_approved_rule"
  | "learner_authored_verbatim"
  | "deterministic_derived";

/**
 * One tag per exported group. The prose and the rules have different origins
 * and must not be reported under one blanket label: the sentences were
 * recovered and then approved; the selection rules were ruled on directly.
 */
export const VARIANT_PROVENANCE = {
  /** The 27 authored scenario sentences — `FRAGMENTS` + `CASE_FRAGMENT_OVERRIDES`. */
  fragments: "recovered_prior_authoring",
  /** Axis order, source dimension and posture ordering — layer 07 approved rules. */
  caseAxes: "ben_canonical",
  /** The two approved neutrals — layer 07 notes and layer 08 gate Q-D. */
  missingEvidenceFallbacks: "ben_canonical"
} as const satisfies Record<string, VariantProvenance>;

/* -------------------------------------------------------------------------- */
/* 2. The base setups                                                         */
/* -------------------------------------------------------------------------- */

/**
 * The five base scenario ids from the recovered composition spec. These are
 * identifiers, not prose; the base scenario BODIES live with the case text.
 * `C1_FIXED` is the one case with no axes and exactly one variant.
 */
export const CASE_BASE_IDS = {
  1: "C1_FIXED",
  2: "C2_TELL_THEM_YET",
  3: "C3_GOOD_ENOUGH_TO_SHIP",
  4: "C4_WHO_OWNS_NEXT_MOVE",
  5: "C5_AI_SAYS_DONE"
} as const satisfies Record<CaseNumber, string>;

/* -------------------------------------------------------------------------- */
/* 3. The 27 axis fragments                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Fragment id -> the authored scenario sentence, verbatim from
 * `55-variant-composition-spec.recovered.json`. Twenty-one distinct ids; the
 * six ids Case 5 re-authors carry their FIRST-AUTHORED text here (Case 3 for
 * `RISK_*`, Case 4 for `OWN_*`) and their Case 5 text in
 * `CASE_FRAGMENT_OVERRIDES`.
 *
 * DO NOT READ THIS MAP DIRECTLY TO RENDER. Use `fragmentText(caseNumber, id)`.
 *
 * Every value is a fact about the fictional situation. None is a claim about
 * the learner.
 */
export const FRAGMENTS: Record<string, string> = {
  /* Case 2 — ambiguity, ordered act -> clarify -> investigate. */
  AMB_UNRESOLVED:
    "You started from the most obvious interpretation and discovered the problem while implementing.",
  AMB_PARTIAL:
    "You clarified one important point first, but another assumption only became visible during implementation.",
  AMB_BOUNDED:
    "You inspected the surrounding system before committing and discovered a deeper dependency that was not visible in the original request.",

  /* Case 2 — reliance, ordered by the TRUST postures task -> relationship -> stewardship. */
  RELIANCE_LOW:
    "Nobody is blocked yet. The stakeholder mainly expects delivery by tomorrow.",
  RELIANCE_CONDITIONAL:
    "The stakeholder is preparing another team’s work around your expected delivery.",
  RELIANCE_HIGH:
    "The stakeholder is about to make a customer-facing commitment based partly on your expected delivery.",

  /* Case 3 — verification, ordered trust -> sample -> prove. */
  VERIFY_TRUST:
    "The work passed the happy path, behaved correctly in a normal browser, and produced the expected output once.",
  VERIFY_SAMPLE:
    "The work passed the normal path, several targeted edge checks, and review against the main requirement.",
  VERIFY_PROVE:
    "The work passed a structured test set, explicit key-invariant checks, and evidence covering known critical paths.",

  /* Case 3 — risk, ordered move -> stage -> protect. Case 5 re-authors all three. */
  RISK_MOVE: "The feature is reversible, internal, and can be disabled quickly.",
  RISK_STAGE:
    "Customers will see it, but rollout can be limited to a small group and rolled back.",
  RISK_PROTECT:
    "Once run, the operation can materially change customer data and recovery would be expensive.",

  /* Case 4 — ownership, ordered transfer -> share -> retain. Case 5 re-authors all three. */
  OWN_TRANSFER:
    "The next unit of work has a clean boundary and the other person will own it after handoff.",
  OWN_SHARE:
    "You will remain involved, but another developer can carry most execution.",
  OWN_RETAIN:
    "You still own the result presented to the stakeholder even though someone else can do most implementation.",

  /* Case 4 — trust, ordered task -> relationship -> stewardship. */
  TRUST_TASK: "The person is competent and has completed similar isolated tasks.",
  TRUST_RELATIONSHIP:
    "You have worked together successfully, but this area includes context they do not yet have.",
  TRUST_STEWARDSHIP:
    "They are highly capable, but the work touches a promise or risk that ultimately still lands on you.",

  /* Case 5 — promise, ordered commit -> qualify -> renegotiate. */
  PROMISE_COMMIT: "You have already told the stakeholder the work is ready.",
  PROMISE_QUALIFY:
    "You told the stakeholder the implementation is ready pending final verification.",
  PROMISE_RENEGOTIATE:
    "Earlier evidence already forced you to revise the original expectation once, and the stakeholder wants confidence that the new plan is finally settled."
};

/**
 * The six Case 5 re-authorings, verbatim from the same spec. Case 5's world is
 * an AI-delegated release, so its risk and ownership sentences are written
 * about the change and the agent rather than about a feature and a colleague.
 * Keyed by case number, then fragment id; a case with no re-authoring has no
 * entry, and that absence is meaningful — Cases 2 to 4 use `FRAGMENTS` as
 * authored.
 */
export const CASE_FRAGMENT_OVERRIDES: Partial<Record<CaseNumber, Record<string, string>>> = {
  5: {
    RISK_MOVE: "The change is reversible and can be rolled back quickly.",
    RISK_STAGE:
      "The change affects real customers, but rollout can be limited and monitored.",
    RISK_PROTECT:
      "The change affects consequential customer data or a workflow where silent failure would be expensive.",
    OWN_TRANSFER: "You asked the AI agent to implement, test, and report completion.",
    OWN_SHARE: "You directed the AI implementation and reviewed intermediate checkpoints.",
    OWN_RETAIN:
      "You explicitly kept final approval authority while delegating substantial implementation and testing to AI."
  }
};

/**
 * The ONLY correct way to get a fragment's sentence: the case-specific
 * re-authoring if one exists, otherwise the first-authored text. Throws on an
 * unknown id rather than rendering an empty scenario line, because a variant
 * that composes to a blank world condition is a silent content failure.
 */
export function fragmentText(caseNumber: CaseNumber, fragmentId: string): string {
  const override = CASE_FRAGMENT_OVERRIDES[caseNumber]?.[fragmentId];
  if (override !== undefined) {
    return override;
  }
  const base = FRAGMENTS[fragmentId];
  if (base === undefined) {
    throw new Error(`"${fragmentId}" is not an authored variant fragment.`);
  }
  return base;
}

/* -------------------------------------------------------------------------- */
/* 4. The axes of each case                                                   */
/* -------------------------------------------------------------------------- */

/** One world-state axis of one case, as the approved transition rules define it. */
export interface CaseAxis {
  /** The stored axis key. `reliance` is Case 2's approved key (GAP-7). */
  axis: VariantAxisKey;
  /**
   * The six-dimension construct whose ACCUMULATED value selects this axis's
   * fragment. Case 2's `reliance` axis derives from the `trust` dimension —
   * the axis was deliberately not named `trust` so an axis key and a dimension
   * key can never be confused inside a stored `variantId`.
   */
  source: Dimension;
  /**
   * Ordered by `POSTURES[source]`: index 0 -> 0.0, 1 -> 0.5, 2 -> 1.0. Never
   * indexed by an option's A/B/C position.
   */
  fragmentIds: readonly [string, string, string];
  /**
   * Present only on Case 4 `ownership`. The approved rule sets Case 4 ownership
   * to the SHARE neutral, and no decision before Case 4 carries ownership
   * evidence, so this fires on every path — which is exactly why Case 4 reaches
   * 3 of its 9 authored combinations. Precedence is still evidence-first: if
   * upstream ownership evidence ever existed, it would win.
   */
  pinnedFragmentId?: string;
}

/**
 * The ordered axes of each case. ORDER IS LOAD-BEARING: `VariantId.id` is
 * `c<n>:<axis>=<fragmentId>|…` with axes in this declared order and pointer
 * restoration is exact string match, so reordering an axis after a learner has
 * stored a variantId silently invalidates every downstream answer.
 *
 * Case 1 is `[]` — one fixed setup, one variant, no world state to vary.
 */
export const CASE_AXES = {
  1: [],
  2: [
    {
      axis: "ambiguity",
      source: "ambiguity",
      fragmentIds: ["AMB_UNRESOLVED", "AMB_PARTIAL", "AMB_BOUNDED"]
    },
    {
      axis: "reliance",
      source: "trust",
      fragmentIds: ["RELIANCE_LOW", "RELIANCE_CONDITIONAL", "RELIANCE_HIGH"]
    }
  ],
  3: [
    {
      axis: "verification",
      source: "verification",
      fragmentIds: ["VERIFY_TRUST", "VERIFY_SAMPLE", "VERIFY_PROVE"]
    },
    {
      axis: "risk",
      source: "risk",
      fragmentIds: ["RISK_MOVE", "RISK_STAGE", "RISK_PROTECT"]
    }
  ],
  4: [
    {
      axis: "ownership",
      source: "ownership",
      fragmentIds: ["OWN_TRANSFER", "OWN_SHARE", "OWN_RETAIN"],
      pinnedFragmentId: "OWN_SHARE"
    },
    {
      axis: "trust",
      source: "trust",
      fragmentIds: ["TRUST_TASK", "TRUST_RELATIONSHIP", "TRUST_STEWARDSHIP"]
    }
  ],
  5: [
    {
      axis: "promise",
      source: "promise",
      fragmentIds: ["PROMISE_COMMIT", "PROMISE_QUALIFY", "PROMISE_RENEGOTIATE"]
    },
    {
      axis: "risk",
      source: "risk",
      fragmentIds: ["RISK_MOVE", "RISK_STAGE", "RISK_PROTECT"]
    },
    {
      axis: "ownership",
      source: "ownership",
      fragmentIds: ["OWN_TRANSFER", "OWN_SHARE", "OWN_RETAIN"]
    }
  ]
} as const satisfies Record<CaseNumber, readonly CaseAxis[]>;

/* -------------------------------------------------------------------------- */
/* 5. The two approved missing-evidence neutrals                              */
/* -------------------------------------------------------------------------- */

/** A named neutral starting condition. NOT an inferred learner posture. */
export interface MissingEvidenceFallback {
  caseNumber: CaseNumber;
  axis: VariantAxisKey;
  /** The fragment used when, and only when, the axis has no accumulated evidence. */
  fragmentId: string;
  /** The ruling that authorises it, for the audit trail. */
  ruling: string;
}

/**
 * THE COMPLETE LIST. Two entries, and there will never be a third without a new
 * Ben ruling: *"Missing signal is never imputed except the explicitly approved
 * Case3 verification=VERIFY_TRUST and Case4 ownership=SHARE neutral starting
 * conditions."*
 *
 * Everywhere else, absence stays absence. The temptation these two entries
 * exist to contain is the reasonable-looking habit of defaulting an unseen axis
 * to its middle value, which would manufacture a world condition — and, one
 * layer downstream, a learner-facing fact — out of nothing.
 *
 * Precedence, from gate Q-D: any present accumulated evidence wins; the neutral
 * applies only to genuine absence.
 */
export const MISSING_EVIDENCE_FALLBACKS: readonly MissingEvidenceFallback[] = [
  {
    caseNumber: 3,
    axis: "verification",
    fragmentId: "VERIFY_TRUST",
    ruling:
      "Layer 08 gate Q-D (Q_D_CASE3_VERIFICATION_NEUTRAL.BEN_APPROVED.json, 2026-09-07): explicit neutral/default starting condition, never an inferred learner posture."
  },
  {
    caseNumber: 4,
    axis: "ownership",
    fragmentId: "OWN_SHARE",
    ruling:
      "Layer 07 variant-transition-rules.BEN_APPROVED.json: case4 ownership = share_neutral. The second and last approved exception."
  }
];

/**
 * The neutral for one case+axis, or `null` when absence must stay absence.
 * A selector that cannot find evidence and gets `null` back has found a bug in
 * its own reducer, not a missing default.
 */
export function missingEvidenceFallback(
  caseNumber: CaseNumber,
  axis: VariantAxisKey
): string | null {
  const match = MISSING_EVIDENCE_FALLBACKS.find(
    (fallback) => fallback.caseNumber === caseNumber && fallback.axis === axis
  );
  return match ? match.fragmentId : null;
}
