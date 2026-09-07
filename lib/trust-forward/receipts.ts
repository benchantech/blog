/**
 * Trust Forward Lite — the receipt trail for the active path (plan §6.7).
 *
 * Pure TypeScript. No React, no JSX, no CSS import, no component import — the
 * suite runs as `node --import tsx --test tests/*.test.ts` and Node cannot load
 * a `.css` specifier, so a stylesheet reached from here would take a whole test
 * file down with `ERR_UNKNOWN_FILE_EXTENSION`. The same discipline
 * `lib/wys/telemetry.ts` and `lib/wys/local-state.ts` already work under. No
 * prose is authored here either: every learner-facing string comes from
 * `@/content/trust-forward/receipts`.
 *
 * WHAT A RECEIPT IS. One answered decision on the ACTIVE path, handed back as
 * the situation and the observable action, plus the number that orders it. The
 * invariant the phrases satisfy — "Situation -> observable choice/action.
 * Nothing else." — is enforced in the content module; this module must not
 * decorate, concatenate, prefix or summarise those strings, because every one
 * of those operations is a way to smuggle a judgment label back in.
 *
 * RECEIPTS ARE NEVER DERIVED FROM REFLECTIONS (ROUTING_AND_SCORING.md,
 * "Receipts"). A receipt reads the FIXED answer and nothing else. Nothing in
 * this module touches `LiteDataset.drafts`, `LedgerEvent.text` or `handle`, and
 * `allReceipts`/`highlightReceipts` deliberately take an `ActivePath` rather
 * than a `LiteDataset` so learner free text is not even in scope. A test feeds
 * reflection text through the pipeline and diffs the output; that test can only
 * stay honest if this module has no way to see the text at all.
 *
 * THE SORT HAS EXACTLY THREE TERMS, AND THAT IS A SUPERSESSION.
 * `ROUTING_AND_SCORING.md` (layer 01) writes four: "absolute contribution to
 * public SHIP axes, then consequence relevance, later case, stable config
 * order", and adds "receipt strength" to every option's metadata. Ben's later
 * approved ruling (`07_transition-copy-import-telemetry-resolution-2026-09-07/
 * receipt-authoring-and-export.BEN_APPROVED.json`, 2026-09-07) replaces that
 * with `highlightSort: ["SHIP_contribution", "later_case",
 * "stable_authored_order"]` and lists "receipt strength" among the FORBIDDEN
 * fields. Two things were dropped, not one: the strength key, and the
 * "consequence relevance" term — which had no defined scale anywhere in the
 * package and would have been an authored judgment about which of the learner's
 * own decisions mattered more. `RECEIPT_HIGHLIGHT_SORT_KEYS` below is the
 * machine-readable form of the three that survive, and adding a fourth is a
 * restamp, not a refactor.
 *
 * THE THREE TERMS ARE ALREADY A TOTAL ORDER. Exactly one active answer exists
 * per decision, so `stable_authored_order` — the index of the decision in
 * `DECISION_IDS` — is unique across the list. No tie can reach a fourth term,
 * which is why there is no fourth term to reach. Identical datasets therefore
 * produce byte-identical receipt lists on every platform.
 *
 * ALL ELEVEN RECEIPTS SURVIVE THE EXPORT. The same ruling's export block is
 * `{allDecisionReceipts: true, count: 11, order: "case_then_decision"}`, and
 * `BEN_APPROVED_RULINGS_2026-09-07.md` allows the profile to HIGHLIGHT a subset
 * but never to delete or substitute the underlying trail. That is why there are
 * two functions and not one with an optional limit: `allReceipts` is the trail
 * and is the only thing an export may serialise, `highlightReceipts` is a view
 * of it. A caller that renders only the highlights must also offer the whole
 * list — `RESULT.receiptsSeeAll` in `@/content/trust-forward/copy` exists for
 * exactly that reason.
 *
 * WHAT `shipContribution` MEASURES, AND THE ZERO THAT IS NOT AN IMPUTED ZERO.
 * It is the magnitude of what this one option contributes to the four PUBLIC
 * SHIP axes: the option's recovered posture tags, converted to levels by
 * `postureValue`, run through the stamped SHIP weights, summed in absolute
 * value across S, H, I and P. Levels come from the TAG, never from the option's
 * A/B/C position — nine of the 138 tags are deliberately non-monotonic (C2D1 is
 * inverted on promise and trust), and a position-derived level would be wrong
 * on all nine without failing anything obvious.
 *
 * An untagged dimension contributes nothing to that sum. This is NOT the
 * forbidden imputation of a `0` level (SC-TF2/TF3 resolution rule 4: an absent
 * tag is never treated as `0`, never filled, never inferred). Aggregation asks
 * "what level did the learner show on this dimension?" and must refuse to
 * answer from an absent tag; this function asks "how much did this option move
 * the public axes?", and an absent tag moved them by nothing. The two are
 * different questions with the same numeral, and only the second one is being
 * answered here — which is also why the arithmetic is deliberately routed
 * through `axisLean` and the stamped `SHIP_WEIGHTS` rather than through a second
 * copy of the weight table living in this file. It stops at `axisLean` and does
 * not call `calculateShip`: a contribution vector is not a learner's state, and
 * running it through the full reducer would mint a `code`, a `profileKey` and
 * four display percentages that describe nobody.
 *
 * WHY THE ROUNDING. Every product of a stamped weight and a ternary level is a
 * multiple of 0.025, but IEEE-754 sums of 0.65 + 0.2 + 0.15 are not exact, and
 * two receipts that should tie can differ in the last bit. `CONTRIBUTION_PRECISION`
 * normalises the sum before it is stored, so the comparator's first term is a
 * real equality test and the second term actually gets to run.
 */

import {
  DECISION_IDS,
  DIMENSIONS,
  SHIP_AXES,
  TERNARY_STATES,
  caseOfDecision,
  postureValue,
  type ActiveDecision,
  type ActivePath,
  type DecisionId,
  type DimensionState,
  type OptionId,
  type Receipt
} from "@/lib/trust-forward/types";
import { SHIP_WEIGHTS, axisLean } from "@/lib/trust-forward/scoring";
import { signalsFor } from "@/content/trust-forward/signals";
import { receiptPhraseFor } from "@/content/trust-forward/receipts";

/* -------------------------------------------------------------------------- */
/* 1. The approved ruling, in machine-readable form                           */
/* -------------------------------------------------------------------------- */

/**
 * `highlightSort`, verbatim from the approved ruling. Three terms, in order.
 *
 * Exported so a governance test can assert the length is 3 and the members are
 * these — a regression that reintroduces "receipt strength" or "consequence
 * relevance" then fails on the constant rather than on a subtle ordering diff
 * that nobody notices until two receipts swap places on the result page.
 */
export const RECEIPT_HIGHLIGHT_SORT_KEYS = [
  "SHIP_contribution",
  "later_case",
  "stable_authored_order"
] as const;

/**
 * The export block of the same ruling, verbatim. `count` is 11 because there
 * are eleven decisions and every answered one produces a receipt; a complete
 * active path therefore always yields exactly eleven.
 */
export const RECEIPT_EXPORT_RULE = {
  allDecisionReceipts: true,
  count: 11,
  order: "case_then_decision"
} as const;

/**
 * The decimal places a contribution is normalised to before it is compared.
 * Six is far finer than any real difference (the smallest is 0.025) and far
 * coarser than float noise, so it separates real ties from apparent ones.
 */
export const CONTRIBUTION_PRECISION = 6;

/* -------------------------------------------------------------------------- */
/* 2. Contribution                                                            */
/* -------------------------------------------------------------------------- */

/** Round to `CONTRIBUTION_PRECISION` places. See the header on why. */
function normalise(value: number): number {
  const factor = 10 ** CONTRIBUTION_PRECISION;
  return Math.round(value * factor) / factor;
}

/**
 * The dimension state that represents ONE option's own evidence.
 *
 * Untagged dimensions sit at the bottom of the ternary scale so they weigh
 * nothing in the axis sums. Read the header before reusing this anywhere near
 * aggregation: this object is a contribution vector, not a claim about the
 * learner's level on any dimension, and it must never be fed to the reducer.
 */
function contributionVector(decisionId: DecisionId, optionId: OptionId): DimensionState {
  const state = Object.fromEntries(
    DIMENSIONS.map((dimension) => [dimension, TERNARY_STATES[0]])
  ) as DimensionState;

  for (const { dimension, posture } of signalsFor(decisionId, optionId)) {
    state[dimension] = postureValue(dimension, posture);
  }
  return state;
}

/**
 * Absolute contribution of one fixed option to the four public SHIP axes.
 *
 * Deterministic, dependent only on the recovered tags and the stamped weights,
 * and identical for the same option in every dataset — the receipt's position
 * in the highlight list is a property of the option the learner picked, not of
 * anything else in their run.
 */
export function shipContributionOf(decisionId: DecisionId, optionId: OptionId): number {
  const vector = contributionVector(decisionId, optionId);
  const total = SHIP_AXES.reduce(
    (sum, axis) => sum + Math.abs(axisLean(vector, SHIP_WEIGHTS[axis])),
    0
  );
  return normalise(total);
}

/* -------------------------------------------------------------------------- */
/* 3. Building receipts                                                       */
/* -------------------------------------------------------------------------- */

/** Position of a decision in the authored order. The sort's third term. */
export function authoredOrderIndex(decisionId: DecisionId): number {
  const index = DECISION_IDS.indexOf(decisionId);
  if (index === -1) {
    throw new Error(`"${decisionId}" is not a declared decision id.`);
  }
  return index;
}

/**
 * One receipt for one answered active decision.
 *
 * Throws on an unanswered decision rather than returning a placeholder: an
 * incomplete active path means no result and no export at all (plan §6.4), so a
 * caller reaching here with a `null` option has already skipped the
 * completeness gate, and a blank receipt would hide that.
 */
export function receiptFor(decision: ActiveDecision): Receipt {
  const { decisionId, selectedOptionId } = decision;
  if (selectedOptionId === null) {
    throw new Error(
      `${decisionId} is unanswered on the active path; there is no receipt for it.`
    );
  }
  return {
    decisionId,
    caseNumber: caseOfDecision(decisionId),
    optionId: selectedOptionId,
    phrase: receiptPhraseFor(decisionId, selectedOptionId),
    shipContribution: shipContributionOf(decisionId, selectedOptionId)
  };
}

/**
 * THE TRAIL. Every answered decision on the active path, in case-then-decision
 * order, which is the ruling's `order: "case_then_decision"` and is exactly the
 * order of `DECISION_IDS`.
 *
 * Sorted by authored index rather than trusting the caller's array order, so a
 * selector that ever returns decisions in resolution order instead of
 * experience order cannot silently reorder an export.
 *
 * Inactive history is not here and must never be added: an answer that is not
 * on the active path never scores and never renders (plan §6.4). It stays in
 * the ledger, and the JSON export carries the ledger whole, which is where a
 * learner's superseded answers remain visible.
 */
export function allReceipts(activePath: ActivePath): readonly Receipt[] {
  return activePath.decisions
    .filter((decision) => decision.selectedOptionId !== null)
    .slice()
    .sort((a, b) => authoredOrderIndex(a.decisionId) - authoredOrderIndex(b.decisionId))
    .map(receiptFor);
}

/** True when the trail is the complete eleven the export rule requires. */
export function isCompleteReceiptTrail(receipts: readonly Receipt[]): boolean {
  return receipts.length === RECEIPT_EXPORT_RULE.count;
}

/* -------------------------------------------------------------------------- */
/* 4. The highlight view                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The three-term comparator, in the ruling's order.
 *
 *  1. `SHIP_contribution` — larger first. The receipt that moved the public
 *     axes most is the one the result page leads with.
 *  2. `later_case` — larger case number first. Later cases carry the harder
 *     situations, so a tie breaks toward the more recent judgment.
 *  3. `stable_authored_order` — smaller index first, and unique per receipt, so
 *     the order is total.
 */
export function compareReceiptsForHighlight(a: Receipt, b: Receipt): number {
  if (a.shipContribution !== b.shipContribution) {
    return b.shipContribution - a.shipContribution;
  }
  if (a.caseNumber !== b.caseNumber) {
    return b.caseNumber - a.caseNumber;
  }
  return authoredOrderIndex(a.decisionId) - authoredOrderIndex(b.decisionId);
}

/**
 * A VIEW of the trail, never a replacement for it.
 *
 * Returns at most `limit` receipts in highlight order. It cannot substitute a
 * phrase, cannot reorder the underlying trail, and cannot be the input to an
 * export — `allReceipts` is. A surface that shows this must also expose the
 * full list.
 *
 * `limit` is required and validated rather than defaulted: there is no authored
 * default highlight count anywhere in the handoff, and inventing one here would
 * quietly become the product's answer to "how many receipts does a learner
 * see?" — a decision that belongs to the surface, or to Ben.
 */
export function highlightReceipts(activePath: ActivePath, limit: number): readonly Receipt[] {
  if (!Number.isInteger(limit) || limit < 0) {
    throw new Error(`Receipt highlight limit must be a non-negative integer; got ${limit}.`);
  }
  return allReceipts(activePath).slice().sort(compareReceiptsForHighlight).slice(0, limit);
}
