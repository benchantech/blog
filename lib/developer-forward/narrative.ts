/**
 * Developer Forward Lite — the composer for the recovered 729-state terminal
 * narratives (plan §6.6).
 *
 * Pure TypeScript. No React, no JSX, no CSS import, no component import — the
 * suite runs as `node --import tsx --test tests/*.test.ts` and Node cannot load
 * a `.css` specifier. Not one character of prose is authored here: the prefix,
 * the suffix, the separator and all 18 clauses live in
 * `@/content/developer-forward/narrative`, and this module joins them.
 *
 * THIS COMPOSER *USES* THE RECOVERED NARRATIVES. IT DOES NOT REGENERATE THEM.
 * Ben's layer-07 ruling is explicit — "Use the recovered 729 deterministic
 * terminal narratives; do not regenerate them"
 * (`07_transition-copy-import-telemetry-resolution-2026-09-07/
 * BEN_APPROVED_RULINGS_2026-09-07.md`, "Final profile"). The content module
 * ships the recovered table decomposed into the 18 clauses it is demonstrably
 * built from, and this module reassembles it. A test asserts byte-exact
 * reproduction of all 729 rows of
 * `04_reviewed-implementation-plan-2026-09-07/recovered/
 * developer_forward_lite_729_profiles_SHIP_recalculated.csv`, column
 * `deterministic_narrative`. If that test fails, this file is wrong and the CSV
 * is right — the fix is never to edit a clause until the diff goes away.
 *
 * THE JOIN ORDER IS `DIMENSIONS`, NOT AN OBJECT'S KEY ORDER. The composer walks
 * `DIMENSIONS` from the shared contract. This is load-bearing rather than
 * tidy: the three `trust` clauses each begin "and you ", because trust is last
 * in that order and the recovered sentence closes on it. A composer that
 * iterated `Object.keys(NARRATIVE_CLAUSES)` would happen to agree today and
 * would silently strand "and you" mid-list the moment that object were
 * reordered — producing a grammatical sentence that fails nothing except the
 * byte-exact test.
 *
 * CLAUSES ARE LOOKED UP BY POSTURE, NEVER BY AN OPTION'S A/B/C POSITION. The
 * lookup goes `TernaryState -> posture name -> clause` through `valuePosture`,
 * which reads the authored vocabulary order in `POSTURES` (index 0 -> 0.0,
 * 1 -> 0.5, 2 -> 1.0). Nine of the 138 recovered signal tags are deliberately
 * non-monotonic — C2D1 is inverted on promise and trust — so a path that
 * reached a clause through an option's position would return the wrong sentence
 * on those nine while looking entirely correct.
 *
 * THE SIX-CLAUSE SHAPE IS TOTAL. Every one of the 3^6 = 729 states composes; a
 * missing clause is not a fallback case but a corrupted clause table, so the
 * lookup throws rather than emitting "undefined" into a learner's result.
 */

import {
  DIMENSIONS,
  POSTURES,
  TERNARY_STATES,
  valuePosture,
  type Dimension,
  type DimensionState,
  type TernaryState
} from "@/lib/developer-forward/types";
import {
  NARRATIVE_CLAUSES,
  NARRATIVE_CLAUSE_SEPARATOR,
  NARRATIVE_PREFIX,
  NARRATIVE_SUFFIX
} from "@/content/developer-forward/narrative";

/* -------------------------------------------------------------------------- */
/* 1. Facts about the state space                                             */
/* -------------------------------------------------------------------------- */

/** 3^6. Six dimensions, three postures each, one narrative per state. */
export const TERMINAL_STATE_COUNT = DIMENSIONS.reduce(
  (total) => total * TERNARY_STATES.length,
  1
);

/* -------------------------------------------------------------------------- */
/* 2. Composition                                                             */
/* -------------------------------------------------------------------------- */

/** The clause for one dimension at one level. Throws on an absent clause. */
export function narrativeClauseFor(dimension: Dimension, value: TernaryState): string {
  const posture = valuePosture(dimension, value);
  const clause = NARRATIVE_CLAUSES[dimension][posture];
  if (!clause) {
    throw new Error(`No narrative clause for ${dimension}/${posture}.`);
  }
  return clause;
}

/**
 * The six clauses for a state, in `DIMENSIONS` order. Exported separately from
 * the joined sentence so a surface that wants to show the dimensions as a list
 * does not have to split the composed string back apart.
 */
export function narrativeClausesFor(state: DimensionState): readonly string[] {
  return DIMENSIONS.map((dimension) => narrativeClauseFor(dimension, state[dimension]));
}

/**
 * The recovered terminal narrative for one six-dimension state:
 * prefix + six clauses joined by "; " + suffix.
 *
 * The suffix's second sentence — that written reflections are preserved
 * verbatim but not interpreted — is part of the recovered narrative, not a
 * disclaimer this build appends. It is never trimmed, and never moved behind a
 * disclosure control.
 */
export function composeNarrative(state: DimensionState): string {
  return (
    NARRATIVE_PREFIX +
    narrativeClausesFor(state).join(NARRATIVE_CLAUSE_SEPARATOR) +
    NARRATIVE_SUFFIX
  );
}

/* -------------------------------------------------------------------------- */
/* 3. The whole state space, in recovered row order                           */
/* -------------------------------------------------------------------------- */

/**
 * All 729 states, in the order the recovered CSV lists them (TF-LITE-001 is
 * every dimension at its lowest posture; the LAST dimension varies fastest).
 *
 * This is an odometer over `DIMENSIONS` with `TERNARY_STATES` as digits, and it
 * exists so the byte-exact test can walk the CSV and this generator in lockstep
 * rather than parsing a state out of each row and hoping the parse is right.
 * The generated order is asserted against the CSV, not assumed from it.
 */
export function enumerateDimensionStates(): readonly DimensionState[] {
  const radix = TERNARY_STATES.length;
  const states: DimensionState[] = [];

  for (let index = 0; index < TERMINAL_STATE_COUNT; index += 1) {
    const state = {} as DimensionState;
    DIMENSIONS.forEach((dimension, position) => {
      const place = radix ** (DIMENSIONS.length - 1 - position);
      const digit = Math.floor(index / place) % radix;
      state[dimension] = TERNARY_STATES[digit];
    });
    states.push(state);
  }
  return states;
}

/**
 * The posture triple for a dimension, ascending — re-exposed as a read helper
 * so a caller enumerating clauses does not reach into `POSTURES` and index it
 * by an option's position out of habit.
 */
export function posturesOf(dimension: Dimension): readonly string[] {
  return POSTURES[dimension];
}
