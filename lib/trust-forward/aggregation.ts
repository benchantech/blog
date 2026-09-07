/**
 * Trust Forward Lite — answer → dimension aggregation.
 *
 * Implements the locked policy
 * `TF-LITE-AGGREGATION-DOMINANT-POSTURE-LATER-TIEBREAK-v1`
 * (layer 05, `SHIP16_AGGREGATION_POLICY.v1.json` + `SC_TF2_TF3_RESOLUTION.md`,
 * resolved 2026-09-07), which closes escalations SC-TF2 and SC-TF3. Layer 05
 * supersedes every earlier candidate rule; nothing here may be re-derived.
 *
 * Pure TypeScript. No React, no JSX, no CSS import, no component import — the
 * suite runs as `node --import tsx --test tests/*.test.ts` and Node cannot load
 * a `.css` specifier, so a stylesheet reached from here would take the whole
 * test file down with `ERR_UNKNOWN_FILE_EXTENSION`.
 *
 * ## The rule, and why it is categorical
 *
 * The recovered metadata is 138 NAMED POSTURE TAGS — `ambiguity:clarify`,
 * `trust:stewardship` — not measurements on a continuous scale. So the reducer
 * is a plurality over present evidence, not an average:
 *
 *  1. For each dimension, collect only the PRESENT signal tags on the active
 *     path. An option with no tag for a dimension contributes NOTHING.
 *  2. Count the three postures. The greatest count is the terminal state.
 *  3. On a tie, scan active decisions LATEST → EARLIEST and take the most
 *     recent present signal whose posture is among the tied winners.
 *
 * Three things this module must never do, each of which would pass a casual
 * reading and be wrong:
 *
 *  - **Absence is never `0`.** Where a dimension is tagged on only one or two
 *    of a decision's options, the untagged options emit nothing — they are not
 *    a low reading. `ownership` is carried by only four decisions and is 0.65
 *    of the H axis; imputing `0` for the untagged ones would drag the whole
 *    population's H downward. Absence is never filled and never inferred.
 *  - **Posture is read from the TAG, never from the option's A/B/C position.**
 *    Nine of the 138 tags are deliberately non-monotonic: C2D1 is inverted on
 *    `promise` and `trust`, so option A carries `trust:stewardship` (1.0). A
 *    reducer that mapped position to level would be wrong on all nine without
 *    failing any obvious check. Levels come from `postureValue`, which reads
 *    the authored vocabulary order in `types.ts`.
 *  - **The tie-break never invents an unobserved posture.** It selects among
 *    postures that are already tied winners, and only ever picks one that was
 *    actually observed. Later evidence gets a voice only when the accumulated
 *    categorical evidence has produced no plurality.
 *
 * ## The rejected alternative, and the number that rejected it
 *
 * The earlier candidate was **"mean the present tags, then snap to the nearest
 * ternary state"**. It is rejected, not merely deprecated. Exhaustive
 * enumeration of all `3^11 = 177,147` complete fixed-choice sequences shows
 * that rule reaches only **11 of the 16** SHIP codes — five public profiles
 * would have been unreachable by any learner. The locked dominant-posture rule
 * reaches **16 of 16**, and **465 of the 729** theoretical terminal
 * six-dimension states; the rarest SHIP code still has **691** distinct answer
 * sequences behind it. Mean-and-snap also invents a middle posture whenever low
 * and high evidence average numerically, which is exactly the categorical
 * violation above. See layer 05 `SHIP16_REACHABILITY_PROOF.json` and
 * `verify_ship16_reachability.py`.
 *
 * C2D1 is preserved exactly as recovered (SC-TF3): option B alone contributes
 * ambiguity, and the non-monotonic promise/trust tags stand. Reachability
 * succeeds without touching them, so there is no reason to rewrite recovered
 * authoring evidence to simplify this reducer.
 *
 * ## Why the policy id is exported
 *
 * Aggregation is governed content under `VERSIONING.md`: changing it requires a
 * new production stamp and may not silently reuse a deployed one. The stamp
 * pins `AGGREGATION_POLICY_ID` by value so a learner's stored dataset records
 * which reducer produced their result.
 *
 * ## Why this module does not import `signals.ts`
 *
 * Every entry point takes the signal tags as data. The reducer is then testable
 * against synthetic evidence — including the layer-05 enumeration — without the
 * production tag table, and the tag table has exactly one owner.
 */

import {
  DECISION_IDS,
  DIMENSIONS,
  postureValue,
  type ActivePath,
  type DecisionId,
  type Dimension,
  type DimensionState,
  type OptionId,
  type SignalMap,
  type TernaryState
} from "@/lib/trust-forward/types";

/* -------------------------------------------------------------------------- */
/* 1. The stamped policy identity                                             */
/* -------------------------------------------------------------------------- */

/**
 * The locked policy id, exported so the stamp can pin it by value.
 *
 * A literal type, not `string`: a stamp that records a different id fails to
 * typecheck rather than silently claiming a reducer this file does not
 * implement.
 */
export const AGGREGATION_POLICY_ID =
  "TF-LITE-AGGREGATION-DOMINANT-POSTURE-LATER-TIEBREAK-v1" as const;

export type AggregationPolicyId = typeof AGGREGATION_POLICY_ID;

/* -------------------------------------------------------------------------- */
/* 2. The input the reducer consumes                                          */
/* -------------------------------------------------------------------------- */

/**
 * One answered decision on the active path, carrying its own recovered tags.
 *
 * The signals travel WITH the answer rather than being looked up inside the
 * reducer, so ordering, prefixing and the tie-break scan all operate on a
 * single ordered list and cannot disagree with a second lookup.
 */
export interface SignalledAnswer {
  decisionId: DecisionId;
  selectedOptionId: OptionId;
  /** The recovered tags for this exact (decision, option). May be empty. */
  signals: SignalMap;
}

/** Resolves the recovered tags for one (decision, option) pair. */
export type SignalLookup = (
  decisionId: DecisionId,
  optionId: OptionId
) => SignalMap | undefined;

/** One present tag, with the canonical position of the decision that carries it. */
export interface PresentSignal {
  decisionId: DecisionId;
  /** Index into `DECISION_IDS`. The tie-break scans on this, descending. */
  decisionIndex: number;
  /** The recovered posture name, e.g. `clarify`. Never derived from A/B/C. */
  posture: string;
  /** `postureValue(dimension, posture)`. Read from the tag, not the position. */
  value: TernaryState;
}

/* -------------------------------------------------------------------------- */
/* 3. Canonical decision order                                                */
/* -------------------------------------------------------------------------- */

const DECISION_INDEX: ReadonlyMap<DecisionId, number> = new Map(
  DECISION_IDS.map((decisionId, index) => [decisionId, index])
);

/** Index of a decision in the policy's `caseOrder` (`C1D1` = 0 … `C5D3` = 10). */
export function decisionIndex(decisionId: DecisionId): number {
  const index = DECISION_INDEX.get(decisionId);
  if (index === undefined) {
    throw new Error(`"${decisionId}" is not a declared decision.`);
  }
  return index;
}

/** The last position in the canonical order. The default aggregation horizon. */
export const LAST_DECISION_INDEX = DECISION_IDS.length - 1;

/* -------------------------------------------------------------------------- */
/* 4. Present evidence                                                        */
/* -------------------------------------------------------------------------- */

/**
 * The present signals for one dimension, in canonical decision order, up to and
 * including `throughDecisionIndex`.
 *
 * Answers arrive in whatever order the caller holds them; they are sorted here
 * on the canonical index so "latest" means latest in the experience, not latest
 * in an array. A duplicate decision throws: the active path holds exactly one
 * answer per decision, and a duplicate would double-count evidence and could
 * flip a plurality without any visible error.
 */
export function presentSignals(
  answers: readonly SignalledAnswer[],
  dimension: Dimension,
  throughDecisionIndex: number = LAST_DECISION_INDEX
): readonly PresentSignal[] {
  const seen = new Set<DecisionId>();
  const found: PresentSignal[] = [];

  for (const answer of answers) {
    if (seen.has(answer.decisionId)) {
      throw new Error(
        `"${answer.decisionId}" appears twice in one aggregation input; the active path holds one answer per decision.`
      );
    }
    seen.add(answer.decisionId);

    const index = decisionIndex(answer.decisionId);
    if (index > throughDecisionIndex) continue;

    // Absence is no evidence: no tag for this dimension contributes nothing.
    const posture = answer.signals[dimension];
    if (posture === undefined) continue;

    found.push({
      decisionId: answer.decisionId,
      decisionIndex: index,
      posture,
      // Throws on a tag outside the authored vocabulary — a bad tag must not
      // silently become a level.
      value: postureValue(dimension, posture)
    });
  }

  return found.sort((a, b) => a.decisionIndex - b.decisionIndex);
}

/* -------------------------------------------------------------------------- */
/* 5. The reducer                                                             */
/* -------------------------------------------------------------------------- */

/**
 * The dominant posture for one dimension over a prefix of the path.
 *
 * Returns `null` when the prefix carries NO present evidence for the dimension.
 * That is the absence rule surfacing in the type: the caller must decide what
 * an unevidenced axis means, and the only two imputations that exist are the
 * explicitly approved ones in the variant transition rules (Case 3
 * `verification = VERIFY_TRUST`, Case 4 `ownership = SHARE` neutral). This
 * function performs neither.
 */
export function dominantPosture(
  answers: readonly SignalledAnswer[],
  dimension: Dimension,
  throughDecisionIndex: number = LAST_DECISION_INDEX
): string | null {
  const signals = presentSignals(answers, dimension, throughDecisionIndex);
  if (signals.length === 0) return null;

  const counts = new Map<string, number>();
  for (const signal of signals) {
    counts.set(signal.posture, (counts.get(signal.posture) ?? 0) + 1);
  }

  let greatest = 0;
  for (const count of counts.values()) {
    if (count > greatest) greatest = count;
  }

  const tied = new Set<string>();
  for (const [posture, count] of counts) {
    if (count === greatest) tied.add(posture);
  }

  // Rule 2: a single plurality winner ends it. Recency is not consulted.
  if (tied.size === 1) return [...tied][0];

  // Rule 3: latest → earliest, first present signal among the tied winners.
  for (let i = signals.length - 1; i >= 0; i -= 1) {
    if (tied.has(signals[i].posture)) return signals[i].posture;
  }

  /* istanbul ignore next — the tied set is drawn from these same signals. */
  return null;
}

/**
 * The accumulated posture for one dimension THROUGH a given decision.
 *
 * This is the reducer the variant transition rules need: each new case's
 * world-state variant "represents accumulated posture immediately before that
 * case" (`variant-transition-rules.BEN_APPROVED.json`, 2026-09-07), so the
 * caller aggregates over the prefix that ends at the last decision of the
 * previous case — e.g. `decisionIndex("C1D2")` for the Case 2 variant.
 *
 * It is the same rule as the terminal reducer, applied to a prefix. It is NOT a
 * running approximation that a later full pass corrects: prefix and terminal
 * results are produced by one code path so a variant and a result can never
 * disagree about what the evidence said.
 *
 * `throughDecisionIndex` is inclusive and indexes `DECISION_IDS`, not the
 * caller's array, so a partially answered path prefixes correctly.
 */
export function accumulatedPosture(
  answers: readonly SignalledAnswer[],
  dimension: Dimension,
  throughDecisionIndex: number
): string | null {
  return dominantPosture(answers, dimension, throughDecisionIndex);
}

/** `accumulatedPosture` as its ternary level. `null` stays `null`. */
export function accumulatedValue(
  answers: readonly SignalledAnswer[],
  dimension: Dimension,
  throughDecisionIndex: number
): TernaryState | null {
  const posture = accumulatedPosture(answers, dimension, throughDecisionIndex);
  return posture === null ? null : postureValue(dimension, posture);
}

/* -------------------------------------------------------------------------- */
/* 6. The terminal six-dimension state                                        */
/* -------------------------------------------------------------------------- */

/** The six accumulated postures over a prefix. A dimension with no evidence is `null`. */
export function accumulatedPostures(
  answers: readonly SignalledAnswer[],
  throughDecisionIndex: number = LAST_DECISION_INDEX
): Record<Dimension, string | null> {
  const result = {} as Record<Dimension, string | null>;
  for (const dimension of DIMENSIONS) {
    result[dimension] = dominantPosture(answers, dimension, throughDecisionIndex);
  }
  return result;
}

/**
 * The terminal six-dimension state for a complete active path.
 *
 * Throws — loudly, naming the dimension — if any dimension carries no present
 * evidence at all. That is deliberate and it is not defensive padding: the
 * exhaustive enumeration of all 177,147 complete sequences established that
 * every complete path tags every dimension at least once, so reaching this
 * throw means the caller passed an incomplete path or a damaged tag table. The
 * only alternative would be to impute a level, which the policy forbids, so
 * failing closed is the sole correct behaviour. An incomplete path must be
 * caught upstream: an unanswered active decision means the SHIP result and both
 * exports are ABSENT, not defaulted.
 */
export function resolveDimensionState(
  answers: readonly SignalledAnswer[]
): DimensionState {
  const state = {} as DimensionState;
  for (const dimension of DIMENSIONS) {
    const posture = dominantPosture(answers, dimension, LAST_DECISION_INDEX);
    if (posture === null) {
      throw new Error(
        `No present signal evidence for "${dimension}"; ${AGGREGATION_POLICY_ID} never imputes an absent dimension.`
      );
    }
    state[dimension] = postureValue(dimension, posture);
  }
  return state;
}

/* -------------------------------------------------------------------------- */
/* 7. Adapting the active path                                                */
/* -------------------------------------------------------------------------- */

/**
 * The active path's answered decisions, paired with their recovered tags.
 *
 * Unanswered active decisions are skipped rather than represented, which is the
 * absence rule again: an unanswered decision is not evidence of anything. It is
 * also why this function alone can never make an incomplete path look complete
 * — `ActivePath.complete` is the only thing that says so.
 */
export function signalledAnswers(
  path: ActivePath,
  lookup: SignalLookup
): readonly SignalledAnswer[] {
  const answers: SignalledAnswer[] = [];
  for (const decision of path.decisions) {
    if (decision.selectedOptionId === null) continue;
    answers.push({
      decisionId: decision.decisionId,
      selectedOptionId: decision.selectedOptionId,
      signals: lookup(decision.decisionId, decision.selectedOptionId) ?? {}
    });
  }
  return answers;
}

/** `resolveDimensionState` over an active path. Same throw contract. */
export function dimensionStateFromActivePath(
  path: ActivePath,
  lookup: SignalLookup
): DimensionState {
  return resolveDimensionState(signalledAnswers(path, lookup));
}
