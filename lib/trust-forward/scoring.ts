/**
 * Trust Forward Lite — terminal dimension state → SHIP.
 *
 * A behaviour-verbatim port of the handoff's
 * `01_trust-forward-lite-codex-package/reference-ts/scoring.ts`, verified
 * against all 729 rows of `data/ship_729_states.csv`. The reference is one
 * minified line; the shape here is expanded for auditability, and the
 * arithmetic — operand order included — is unchanged.
 *
 * Pure TypeScript. No React, no JSX, no CSS import, no component import — the
 * suite runs as `node --import tsx --test tests/*.test.ts` and Node cannot load
 * a `.css` specifier.
 *
 * This module is the SECOND half of the seam that layer 05 closed. Everything
 * upstream of it — combining recovered signal tags into the six terminal
 * dimension states — belongs to `aggregation.ts` under
 * `TF-LITE-AGGREGATION-DOMINANT-POSTURE-LATER-TIEBREAK-v1`. Layer 05 states
 * that scoring is unchanged by that resolution: "Use the locked SHIP axis
 * weights and >0.5 bit threshold unchanged." So this file is a port, not a
 * design, and a change to a weight or the threshold is a restamp trigger under
 * `VERSIONING.md`, not a refactor.
 *
 * ## The threshold is strictly `>`, never `>=`
 *
 * `lean > 0.5 ? 1 : 0`. This is the single most load-bearing character in the
 * module, because `>=` would pass most tests and be wrong at the boundary — and
 * the boundary is populated: the all-`0.5` state lands on exactly 50.0 on all
 * four axes and is `SHIP-0000` in the shipped 729-row table. `TEST_PLAN.md`
 * pins the four cases: 49.9% → 0, **50.0% → 0**, 50.1% → 1, 100% → 1.
 *
 * ## Two different roundings, deliberately
 *
 * `displayPercents` rounds to the nearest 0.1 for the numeric readout;
 * `barPercents` rounds to the nearest 10 for the graphical bar. They are
 * separate fields rather than one value formatted twice because a bar rounded
 * to 10 must never be the number a learner reads, and a readout at 0.1 must
 * never imply the bar's precision. Neither is the bit: both are derived from
 * `leans`, and the bit is computed from `leans` too, so a rounding can never
 * move a code.
 *
 * ## The bars are neutral and two-ended
 *
 * Neither end is "better". The authored vocabulary is a progression of kind,
 * not of quality — `task → relationship → stewardship`, NOT
 * `bad → okay → good`. A high `P` is not a better learner than a low `P`. This
 * module returns numbers only and takes no position on direction; anything that
 * renders them inherits the constraint, and nothing here may be used to imply a
 * ranking. Nor may the code be rendered as an identity claim: `SHIP-0111` is an
 * observed pattern, never "You are SHIP-0111."
 */

import type {
  Dimension,
  DimensionState,
  ShipAxis,
  ShipResult
} from "@/lib/trust-forward/types";

/* -------------------------------------------------------------------------- */
/* 1. The locked axis weights                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Verbatim from `config/trust-forward-lite.v1.json` → `ship.axes[*].weights`,
 * key order included.
 *
 * The key order is not cosmetic: `lean` folds the terms left to right, and
 * floating-point addition is not associative, so reordering these keys can
 * move a value across the `> 0.5` boundary that the 729-row fixture pins.
 *
 * Each axis draws on three of the six dimensions at 0.65 / 0.20 / 0.15. Note
 * that `risk` and `ownership` each feed three axes: no axis is a private
 * readout of one dimension, which is why a single answer cannot swing a code on
 * its own.
 */
export const SHIP_WEIGHTS: Readonly<
  Record<ShipAxis, Readonly<Partial<Record<Dimension, number>>>>
> = {
  S: { ambiguity: 0.65, promise: 0.2, risk: 0.15 },
  H: { ownership: 0.65, risk: 0.2, trust: 0.15 },
  I: { verification: 0.65, risk: 0.2, ownership: 0.15 },
  P: { trust: 0.65, promise: 0.2, ownership: 0.15 }
};

/* -------------------------------------------------------------------------- */
/* 2. The three primitives                                                    */
/* -------------------------------------------------------------------------- */

/** One axis lean, 0..1. Folded in declared weight order — see `SHIP_WEIGHTS`. */
export function axisLean(
  state: DimensionState,
  weights: Readonly<Partial<Record<Dimension, number>>>
): number {
  return Object.entries(weights).reduce(
    (total, [dimension, weight]) =>
      total + state[dimension as Dimension] * (weight ?? 0),
    0
  );
}

/**
 * The bit for one axis. STRICTLY greater than 0.5.
 *
 * 50.0 is a `0`. Do not "tidy" this to `>=`.
 */
export function axisBit(lean: number): "0" | "1" {
  return lean > 0.5 ? "1" : "0";
}

/** Lean → percentage, to the nearest 0.1. The numeric readout. */
export function displayPercent(lean: number): number {
  return Math.round(lean * 1000) / 10;
}

/** Lean → percentage, to the nearest 10. The graphical bar only. */
export function barPercent(lean: number): number {
  return Math.round((lean * 100) / 10) * 10;
}

/* -------------------------------------------------------------------------- */
/* 3. SHIP                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * The complete SHIP reading for one terminal six-dimension state.
 *
 * Deterministic and total: the same state always yields the same code, and
 * every one of the 729 states yields one. It reads nothing but the state — no
 * reflection text, no handle, no ledger — which is what makes the promise that
 * reflections never affect the result structurally true rather than merely
 * observed.
 */
export function calculateShip(state: DimensionState): ShipResult {
  const leans: Record<ShipAxis, number> = {
    S: axisLean(state, SHIP_WEIGHTS.S),
    H: axisLean(state, SHIP_WEIGHTS.H),
    I: axisLean(state, SHIP_WEIGHTS.I),
    P: axisLean(state, SHIP_WEIGHTS.P)
  };

  const bits = `${axisBit(leans.S)}${axisBit(leans.H)}${axisBit(leans.I)}${axisBit(leans.P)}`;

  return {
    code: `SHIP-${bits}`,
    leans,
    displayPercents: {
      S: displayPercent(leans.S),
      H: displayPercent(leans.H),
      I: displayPercent(leans.I),
      P: displayPercent(leans.P)
    },
    barPercents: {
      S: barPercent(leans.S),
      H: barPercent(leans.H),
      I: barPercent(leans.I),
      P: barPercent(leans.P)
    },
    profileKey: bits
  };
}
