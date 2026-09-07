/**
 * Trust Forward Lite — the 138 recovered fixed-answer signal tags, and the
 * option labels they belong to.
 *
 * Pure TypeScript. No React, no JSX, no CSS import, no component import — the
 * suite runs as `node --import tsx --test tests/*.test.ts` and Node cannot load
 * a `.css` specifier, so a stylesheet reached from here would take a whole test
 * file down with `ERR_UNKNOWN_FILE_EXTENSION`. The same discipline
 * `lib/wys/telemetry.ts` and `lib/wys/local-state.ts` already work under.
 *
 * WHAT THIS FILE IS. A verbatim port of
 * `03_codex-completion-handoff-2026-09-07/recovered/fixed-answer-signal-map.recovered.json`.
 * That file describes itself as "evidence_of_intended_option_signals", not as
 * an aggregation policy, and the two are kept apart here on purpose: this
 * module is data only. It exports no reducer, no ternary value and no SHIP
 * arithmetic. The dominant-posture reducer locked by
 * `05_ship16-reachability-resolution-2026-09-07/SC_TF2_TF3_RESOLUTION.md` reads
 * these records; it does not live in them.
 *
 * FOUR RULES THIS SHAPE ENFORCES, all from that resolution:
 *
 *  1. **Level is read from the TAG, never from the option's position.**
 *     (Resolution rule 5.) A `SignalMap` stores the authored posture NAME —
 *     `"stewardship"`, `"qualify"` — and `postureValue()` in
 *     `@/lib/trust-forward/types` converts it. Nothing here stores 0/0.5/1, so
 *     no consumer can accidentally infer a level from A/B/C.
 *  2. **An absent tag is no evidence.** (Resolution rule 4: never treated as
 *     `0`, never filled, never inferred.) `SignalMap` is
 *     `Partial<Record<Dimension, string>>` and the gaps below are real: C1D1/A
 *     carries no `verification` tag, and that is not the same as carrying
 *     `verification: "trust"`. Do not complete these records.
 *  3. **C2D1 is preserved exactly as recovered.** (Resolution, "C2D1".) Option
 *     B is the ONLY C2D1 option carrying an `ambiguity` tag — do not add
 *     ambiguity evidence to A or C to make the column look uniform. Its
 *     `promise` and `trust` tags are deliberately non-monotonic: they run
 *     DOWN the options, so "Tell them now" (A) carries `trust: "stewardship"`
 *     (1.0) while "Resolve the uncertainty first" (C) carries `trust: "task"`
 *     (0.0). Six tags across those two groups invert; exhaustive reachability
 *     succeeds without touching them, so normalising them would be an
 *     unnecessary rewrite of recovered authoring evidence.
 *  4. **The tags are not edited to balance coverage.** The dimensions are
 *     unevenly carried by design, and the reducer is a plurality over PRESENT
 *     tags, so an even spread is not required for correctness.
 *
 * COVERAGE, as recovered and as verified against the source file (these are the
 * facts a future editor is most likely to "fix" by mistake):
 *
 *   - 138 signal tags across 11 decisions x 3 options.
 *   - `trust` is the only dimension carried by ALL 11 decisions. C5D3 carries
 *     `trust` and nothing else — three tags for the whole decision.
 *   - `ownership` is carried by only 4 decisions: C4D1, C4D2, C5D1, C5D2. It is
 *     absent from Cases 1-3 entirely.
 *   - `verification` and `risk` are carried by 10 decisions each;
 *     `ambiguity` and `promise` by 8 each.
 *   - C2D1 carries `ambiguity` on option B alone.
 *   - Per decision: C1D1 11, C1D2 12, C2D1 12, C2D2 14, C3D1 12, C3D2 11,
 *     C4D1 11, C4D2 16, C5D1 18, C5D2 18, C5D3 3.
 *
 * PROVENANCE. Both groups are `recovered_prior_authoring`, approved by Ben on
 * 2026-09-07 (`06_full-five-case-authoring-extraction-2026-09-07/
 * SC_TF1_APPROVAL_RECORD_2026-09-07.md`). `OPTION_LABELS` is learner-facing
 * prose and therefore lives in `content/`, never in `app/` or `components/`.
 */

import {
  DECISION_IDS,
  OPTION_IDS,
  type DecisionId,
  type Dimension,
  type OptionId,
  type SignalMap
} from "@/lib/trust-forward/types";
import { optionById } from "@/content/trust-forward/cases";

/**
 * The governance vocabulary every Trust Forward content group is tagged with.
 * Deliberately not exported: the tag values are the shared contract, the alias
 * is a local convenience, and a second exported copy of this union is one more
 * place it could drift.
 */
type ProvenanceTag =
  | "ben_canonical"
  | "recovered_prior_authoring"
  | "implementation_authored_under_ben_approved_rule"
  | "learner_authored_verbatim"
  | "deterministic_derived";

/* -------------------------------------------------------------------------- */
/* 1. The 138 signal tags                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Decision -> option -> the postures that option is evidence of.
 *
 * Ported tag for tag from the recovered source, in the source's own order.
 * Every value is a posture NAME from `POSTURES` in
 * `@/lib/trust-forward/types`; pass it through `postureValue()` to get its
 * ternary level. Never add a tag to fill a gap, and never reorder a decision's
 * options — `SIGNALS.C2D1.A` is more stewardship-forward than `SIGNALS.C2D1.C`
 * and that inversion is the authoring, not a typo.
 */
export const SIGNALS: Record<DecisionId, Record<OptionId, SignalMap>> = {
  /* C1D1 — 11 tags */
  C1D1: {
    A: { ambiguity: "act", promise: "commit", risk: "move", trust: "task" },
    B: { ambiguity: "clarify", promise: "qualify", trust: "relationship" },
    C: { ambiguity: "investigate", verification: "sample", risk: "stage", trust: "stewardship" }
  },
  /* C1D2 — 12 tags */
  C1D2: {
    A: { promise: "commit", risk: "move", trust: "task" },
    B: { ambiguity: "clarify", promise: "qualify", risk: "stage", trust: "relationship" },
    C: {
      ambiguity: "investigate",
      verification: "prove",
      promise: "renegotiate",
      risk: "protect",
      trust: "stewardship"
    }
  },
  /* C2D1 — 12 tags */
  C2D1: {
    A: { promise: "qualify", risk: "stage", trust: "stewardship" },
    B: {
      ambiguity: "investigate",
      verification: "sample",
      promise: "qualify",
      risk: "stage",
      trust: "relationship"
    },
    C: { verification: "prove", promise: "commit", risk: "protect", trust: "task" }
  },
  /* C2D2 — 14 tags */
  C2D2: {
    A: { ambiguity: "act", promise: "commit", risk: "move", trust: "task" },
    B: {
      ambiguity: "clarify",
      verification: "sample",
      promise: "qualify",
      risk: "stage",
      trust: "relationship"
    },
    C: {
      ambiguity: "investigate",
      verification: "prove",
      promise: "renegotiate",
      risk: "protect",
      trust: "stewardship"
    }
  },
  /* C3D1 — 12 tags */
  C3D1: {
    A: { verification: "trust", promise: "commit", risk: "move", trust: "task" },
    B: { verification: "sample", promise: "qualify", risk: "stage", trust: "relationship" },
    C: { verification: "prove", promise: "renegotiate", risk: "protect", trust: "stewardship" }
  },
  /* C3D2 — 11 tags */
  C3D2: {
    A: { verification: "trust", risk: "move", trust: "task" },
    B: { ambiguity: "investigate", verification: "sample", risk: "stage", trust: "relationship" },
    C: { ambiguity: "investigate", verification: "prove", risk: "protect", trust: "stewardship" }
  },
  /* C4D1 — 11 tags */
  C4D1: {
    A: { risk: "move", ownership: "transfer", trust: "task" },
    B: { verification: "sample", risk: "stage", ownership: "share", trust: "relationship" },
    C: { verification: "prove", risk: "protect", ownership: "retain", trust: "stewardship" }
  },
  /* C4D2 — 16 tags */
  C4D2: {
    A: {
      verification: "trust",
      promise: "commit",
      risk: "move",
      ownership: "transfer",
      trust: "task"
    },
    B: {
      verification: "sample",
      promise: "qualify",
      risk: "stage",
      ownership: "share",
      trust: "relationship"
    },
    C: {
      ambiguity: "investigate",
      verification: "prove",
      promise: "renegotiate",
      risk: "protect",
      ownership: "retain",
      trust: "stewardship"
    }
  },
  /* C5D1 — 18 tags */
  C5D1: {
    A: {
      ambiguity: "act",
      verification: "trust",
      promise: "commit",
      risk: "move",
      ownership: "transfer",
      trust: "task"
    },
    B: {
      ambiguity: "clarify",
      verification: "sample",
      promise: "qualify",
      risk: "stage",
      ownership: "share",
      trust: "relationship"
    },
    C: {
      ambiguity: "investigate",
      verification: "prove",
      promise: "renegotiate",
      risk: "protect",
      ownership: "retain",
      trust: "stewardship"
    }
  },
  /* C5D2 — 18 tags */
  C5D2: {
    A: {
      ambiguity: "act",
      verification: "trust",
      promise: "commit",
      risk: "move",
      ownership: "transfer",
      trust: "task"
    },
    B: {
      ambiguity: "clarify",
      verification: "sample",
      promise: "qualify",
      risk: "stage",
      ownership: "share",
      trust: "relationship"
    },
    C: {
      ambiguity: "investigate",
      verification: "prove",
      promise: "renegotiate",
      risk: "protect",
      ownership: "retain",
      trust: "stewardship"
    }
  },
  /* C5D3 — 3 tags */
  C5D3: {
    A: { trust: "task" },
    B: { trust: "relationship" },
    C: { trust: "stewardship" }
  }
};

/** `SIGNALS` is a verbatim port of approved recovered authoring evidence. */
export const SIGNALS_PROVENANCE = "recovered_prior_authoring" as const satisfies ProvenanceTag;

/* -------------------------------------------------------------------------- */
/* 2. The 33 option labels                                                    */
/* -------------------------------------------------------------------------- */

/**
 * The learner-facing label of each fixed option, from the `label` field of the
 * same recovered source. Verbatim: the shorthand ("Stage it", "Hold it") and
 * the slash in "Explicitly reopen scope/promise" are the recovered authoring
 * and are not smoothed here.
 *
 * These are the option BUTTONS. They are not the receipts — a receipt restates
 * the situation and the observable action, and lives in `receipts.ts`.
 */
/**
 * The learner-facing option labels.
 *
 * DERIVED, NOT REDEFINED. `content/trust-forward/cases.ts` is the single
 * definition of every learner-facing case string, and Standing Order 07 — the
 * one this site publishes — says canonical text is defined once and every
 * repeated appearance references that source. An earlier draft of this module
 * carried its own copy of the eleven decisions' labels; two of them drifted
 * from `cases.ts` immediately, which is exactly the failure the rule names.
 *
 * The recovered signal map ships labels too, but they are the AUTHORING
 * shorthand ("Yes, I can get this done"), not the richer learner-facing label
 * plus sub-description the extraction guide requires. So the map's labels are
 * used to key the tags and nothing else; the words on screen come from
 * `cases.ts`.
 *
 * `null` where the source authored the option line itself with no label above
 * it — C2D2 and C5D3, whose options are the message rather than a name for it.
 */
export const OPTION_LABELS: Record<DecisionId, Record<OptionId, string | null>> = Object.fromEntries(
  DECISION_IDS.map((decisionId) => [
    decisionId,
    Object.fromEntries(
      OPTION_IDS.map((optionId) => [optionId, optionById(decisionId, optionId)?.label ?? null])
    ) as Record<OptionId, string | null>
  ])
) as Record<DecisionId, Record<OptionId, string | null>>;

/** The labels are the recovered authoring's own words, approved 2026-09-07. */
export const OPTION_LABELS_PROVENANCE =
  "recovered_prior_authoring" as const satisfies ProvenanceTag;

/* -------------------------------------------------------------------------- */
/* 3. Read helpers                                                            */
/* -------------------------------------------------------------------------- */

/**
 * The postures one option is evidence of, as tag pairs in authored order.
 *
 * Returns only the tags that are PRESENT. A caller that wants "no evidence" to
 * be distinguishable from "evidence of the lowest posture" gets that for free:
 * an unmentioned dimension is simply not in the returned list.
 */
export function signalsFor(
  decisionId: DecisionId,
  optionId: OptionId
): readonly { dimension: Dimension; posture: string }[] {
  const map = SIGNALS[decisionId][optionId];
  return (Object.keys(map) as Dimension[]).map((dimension) => ({
    dimension,
    posture: map[dimension] as string
  }));
}

/** True when this option carries any evidence for this dimension. */
export function carriesDimension(
  decisionId: DecisionId,
  optionId: OptionId,
  dimension: Dimension
): boolean {
  return SIGNALS[decisionId][optionId][dimension] !== undefined;
}
