/**
 * Trust Forward Lite — the active-path pointer resolver (plan §6.4).
 *
 * This is the module the whole instrument turns on. Everything the learner
 * sees downstream of a decision — the next case's world, the callbacks, the
 * closes, the receipts, the SHIP result, both exports — is a function of ONE
 * question: which exact `variantId + decisionId` pairs are on the active path
 * right now. Get that wrong and nothing else fails; it just quietly scores the
 * wrong answers.
 *
 * ## The rule that shapes every line below
 *
 * Ben's approved transition ruling (layer 07,
 * `BEN_APPROVED_RULINGS_2026-09-07.md`): *"Each new case's world-state variant
 * represents the learner's accumulated posture immediately before that case."*
 * So a case's variant is not a property of the last answer, and not a running
 * mutation — it is a pure function of the prefix of active answers before that
 * case, recomputed from scratch every time. That is why this file holds no
 * mutable path state: state that can be edited upstream and only patched
 * downstream is how a stale world survives an edit.
 *
 * ## Why an answer is stored against a variant, not just a decision
 *
 * A learner who goes back and changes C1D1 can change Case 2's world. The
 * question the learner already answered no longer exists — a different question
 * stands in its place. Storing the answer under `variantId::decisionId` makes
 * that structural rather than a judgement call: an answer is on the active path
 * if and only if its exact tuple is, and no reconciliation pass is needed.
 * `restoreLatestAnswerFor` therefore RESTORES rather than migrates. If the
 * learner edits C1D1 and then edits it back, the Case 2 answers they gave under
 * the original world are found again by exact match, untouched, at their
 * original `eventId`. Nothing was rewritten, so nothing could be rewritten
 * wrongly.
 *
 * ## Absence, and the two exceptions that exist to contain it
 *
 * Layer 08 gate Q-D and the layer 07 transition rules approve exactly two
 * missing-evidence neutrals: Case 3 `verification` -> `VERIFY_TRUST`, and Case
 * 4 `ownership` -> the pinned `OWN_SHARE`. Everywhere else, an absent axis is a
 * BUG and this module throws.
 *
 * That is not defensive decoration — it is checkable, and it was checked
 * against the authored signal map before this file was written. Across every
 * complete prefix:
 *
 *   - Case 2 `ambiguity` / `trust`      — evidence on every path
 *   - Case 3 `verification`             — CAN be absent  -> the Q-D neutral
 *   - Case 3 `risk`                     — evidence on every path
 *   - Case 4 `ownership`                — ALWAYS absent   -> the pinned neutral
 *   - Case 4 `trust`                    — evidence on every path
 *   - Case 5 `promise` / `risk` / `ownership` — evidence on every path
 *
 * So the only two axes that can legitimately reach the fallback are the only
 * two that have a ruling, and a third fallback firing means the reducer, the
 * signal map or the axis table has changed underneath this file. Throwing is
 * the correct response: the alternative is to manufacture a world condition —
 * and one layer downstream, a learner-facing fact — out of nothing.
 *
 * ## The reachability this resolver produces
 *
 * Driving `resolveCaseVariant` across all 3^11 = 177,147 fixed-answer sequences
 * yields 1 + 5 + 7 + 3 + 27 = **43 of the 55 authored variant combinations**,
 * which is the figure `content/trust-forward/variants.ts` documents — Case 3 at
 * 7 because the Q-D neutral creates two combinations no evidence path reaches,
 * and Case 4 at 3 because its ownership axis is pinned on every path. The 12
 * unreachable combinations are valid composition-space content and must never
 * be deleted. If this count moves, the transition rules moved with it, and that
 * is a restamp under `VERSIONING.md` rather than a test to update.
 *
 * ## Absence is asserted, not just trusted
 *
 * `accumulatedValue` returns `null` for a dimension the prefix carries no tag
 * for, and that `null` is what routes an axis to its neutral. This module does
 * not re-derive that answer — one reducer, one determination — but it does
 * CHECK it against the recovered signal map before acting on it
 * (`assertEvidenceAgreement`). The check is not redundancy: a reducer that
 * imputed a value for an unevidenced dimension would otherwise slip a
 * manufactured world condition past every downstream test, because the
 * resulting variant is a perfectly valid variant. It is simply the wrong one,
 * and nothing further downstream can tell.
 *
 * ## Levels come from the posture, never from A/B/C
 *
 * Fragment selection indexes `CASE_AXES[n][i].fragmentIds` by the ternary value
 * the reducer resolved, which the reducer read from the recovered posture TAG.
 * Nine of the 138 tags are deliberately non-monotonic — C2D1 is inverted on
 * `promise` and `trust` — so a shortcut that read the level from an option's
 * A/B/C position would be wrong on all nine and fail no obvious check.
 *
 * ## Pure TypeScript
 *
 * No React, no JSX, no CSS import, no component import. `package.json` runs the
 * suite as `node --import tsx --test tests/*.test.ts` and Node cannot load a
 * `.css` specifier, so a stylesheet reached from here would take a whole test
 * file down with `ERR_UNKNOWN_FILE_EXTENSION`. Same discipline as
 * `lib/wys/telemetry.ts` and `lib/wys/local-state.ts`.
 *
 * Nothing here is learner-facing prose. The one string this module's behaviour
 * implies — the changed-scenario notice — lives in `content/trust-forward/
 * copy.ts` as `changedScenarioNotice`; `casesWithChangedScenario` returns the
 * case numbers that string applies to and never the string itself.
 */

import {
  CASE_NUMBERS,
  DECISION_IDS,
  TERNARY_STATES,
  caseOfDecision,
  type AxisState,
  type CaseNumber,
  type ActiveDecision,
  type ActivePath,
  type DecisionId,
  type Dimension,
  type ExactAnswer,
  type LedgerEvent,
  type TernaryState,
  type VariantId
} from "@/lib/trust-forward/types";
import {
  CASE_AXES,
  MISSING_EVIDENCE_FALLBACKS,
  type CaseAxis,
  type VariantAxisKey
} from "@/content/trust-forward/variants";
import { SIGNALS, carriesDimension } from "@/content/trust-forward/signals";
import {
  accumulatedValue,
  decisionIndex,
  signalledAnswers,
  type SignalLookup,
  type SignalledAnswer
} from "@/lib/trust-forward/aggregation";

/* -------------------------------------------------------------------------- */
/* 0. The seams this module sits between                                      */
/* -------------------------------------------------------------------------- */

/**
 * The one signal lookup this module hands the reducer.
 *
 * `lib/trust-forward/aggregation.ts` takes the recovered tags as a parameter so
 * the reducer itself holds no content. Exported here so that the variant
 * resolution and the scoring input are demonstrably fed by the SAME tag table:
 * a variant selected from one signal map and a result scored from another would
 * be two different instruments wearing one name.
 */
export const SIGNAL_LOOKUP: SignalLookup = (decisionId, optionId) => SIGNALS[decisionId][optionId];

/**
 * The last decision position that may inform a case's world, inclusive.
 *
 * Ben's transition ruling is *"accumulated posture IMMEDIATELY BEFORE that
 * case"*, so the horizon is the last decision of the previous case —
 * `decisionIndex("C1D2")` for Case 2, and `-1` for Case 1, which has no axes
 * and no prior evidence. Passing this explicitly rather than relying on the
 * prefix array to be short enough is the second guard on the rule that most
 * matters: a decision must never help select the world it is asked in.
 */
export function caseEvidenceHorizon(caseNumber: CaseNumber): number {
  if (caseNumber === 1) return -1;
  const previous = decisionsOfCase((caseNumber - 1) as CaseNumber);
  return decisionIndex(previous[previous.length - 1]);
}

/**
 * The slice of the production stamp this module reads.
 *
 * Deliberately two numbers and nothing else. Everything else the resolver needs
 * — the axis tables, the fragments, the signal tags — is pinned BY VALUE by the
 * stamp through the content modules it references, so restating any of it here
 * would create a second place the same pin is expressed and a second place it
 * can drift. These two counts are the one thing the stamp asserts that this
 * module can independently check, which is why they are the one thing it takes.
 */
export interface ActivePathStamp {
  readonly experience: {
    readonly caseCount: number;
    readonly decisionCount: number;
  };
}

/**
 * A resolved axis widened to `VariantAxisKey`.
 *
 * A CONTRACT GAP, recorded rather than papered over, and the same one
 * `content/trust-forward/variants.ts` records: `AxisKey` in the shared contract
 * declares six keys and Case 5's authored first axis is `promise`, which is not
 * among them. The shared contract is owned elsewhere and is not edited from
 * here. If `promise` is later added to `AxisKey`, this alias collapses to
 * `AxisState` and the single assertion in `buildVariantId` becomes a no-op.
 * Until then, DO NOT drop the `promise` axis to satisfy the narrower type: it
 * is one third of Case 5's variant id and all 27 of its combinations are
 * reachable.
 */
export interface VariantAxisState {
  readonly axis: VariantAxisKey;
  readonly fragmentId: string;
}

/* -------------------------------------------------------------------------- */
/* 1. Latest exact answers                                                    */
/* -------------------------------------------------------------------------- */

/**
 * The two ledger event types that record a choice.
 *
 * `decision_changed` is not a correction of `decision_selected` and does not
 * supersede it in place — both are appended, both stay, and the later
 * `sequence` simply wins the lookup. That is what makes the ledger replayable
 * and what makes an edit reversible without rewriting history.
 */
export const ANSWER_EVENT_TYPES = ["decision_selected", "decision_changed"] as const;

/** The map key. Exact-match on this pair is the whole pointer mechanism. */
export function answerKey(variantId: string, decisionId: DecisionId): string {
  return `${variantId}::${decisionId}`;
}

/**
 * Every exact `variantId::decisionId` pair the learner has ever answered, at
 * its LATEST answer. Ported from `reference-ts/pointers.ts`.
 *
 * Highest `sequence` wins rather than last-in-array, because the array order of
 * a merged or restored ledger is not guaranteed to be the causal order —
 * `sequence` is (`LedgerEvent.sequence`: "strictly increasing across the whole
 * dataset; never reused"). Two tabs writing the same dataset is the case that
 * makes this matter.
 *
 * This map is HISTORY, not the active path. Most of it may be inactive at any
 * moment. Nothing here has been filtered for relevance yet.
 */
export function latestExactAnswers(ledger: readonly LedgerEvent[]): Map<string, ExactAnswer> {
  const answers = new Map<string, ExactAnswer>();
  for (const event of ledger) {
    if (!(ANSWER_EVENT_TYPES as readonly string[]).includes(event.type)) continue;
    if (!event.variantId || !event.decisionId || !event.selectedOptionId) continue;
    const key = answerKey(event.variantId, event.decisionId);
    const previous = answers.get(key);
    if (previous && previous.sequence >= event.sequence) continue;
    answers.set(key, {
      variantId: event.variantId,
      decisionId: event.decisionId,
      selectedOptionId: event.selectedOptionId,
      eventId: event.eventId,
      sequence: event.sequence
    });
  }
  return answers;
}

/**
 * The restoration rule, named so it cannot be mistaken for a migration.
 *
 * *"When an upstream edit changes a downstream variant tuple, restore the
 * latest prior answer for the NEW tuple if one exists; otherwise that decision
 * becomes unanswered."* Both halves of that are this one lookup. There is no
 * carry-over, no nearest-variant match and no re-keying pass: an answer given
 * under a world that no longer stands is not evidence about the world that does.
 */
export function restoreLatestAnswerFor(
  answers: ReadonlyMap<string, ExactAnswer>,
  variantId: string,
  decisionId: DecisionId
): ExactAnswer | null {
  return answers.get(answerKey(variantId, decisionId)) ?? null;
}

/* -------------------------------------------------------------------------- */
/* 2. The frozen variant id shape                                             */
/* -------------------------------------------------------------------------- */

/**
 * `c<n>:<axis>=<fragmentId>|<axis>=<fragmentId>`, axes in the stamp's declared
 * order.
 *
 * THIS SHAPE IS FROZEN. Pointer restoration is exact string match on it, so a
 * cosmetic change — a different separator, sorted axis keys, a trimmed `c` —
 * silently invalidates every answer every learner has already stored, with no
 * error and no crash: their answers simply stop being found and their path
 * resets to unanswered. Renaming an axis does the same thing. Reordering the
 * axes of a case in `CASE_AXES` does the same thing.
 *
 * Case 1 has no axes and composes to `c1:` — a trailing colon and nothing else.
 * That is correct and deliberate: it is one fixed setup with exactly one
 * variant, and it still needs an id so that Case 1's answers are keyed the same
 * way as every other case's. Do not "tidy" it to `c1`.
 */
export function variantIdString(
  caseNumber: CaseNumber,
  axisStates: readonly VariantAxisState[]
): string {
  return `c${caseNumber}:${axisStates
    .map((state) => `${state.axis}=${state.fragmentId}`)
    .join("|")}`;
}

/** Assemble the contract's `VariantId` from a case number and its resolved axes. */
function buildVariantId(
  caseNumber: CaseNumber,
  axisStates: readonly VariantAxisState[]
): VariantId {
  return {
    caseNumber,
    // The single documented widening for the `promise` axis contract gap above.
    axes: axisStates as readonly AxisState[],
    id: variantIdString(caseNumber, axisStates)
  };
}

/* -------------------------------------------------------------------------- */
/* 3. The two approved missing-evidence exceptions                            */
/* -------------------------------------------------------------------------- */

/**
 * The complete list, as this module will honour it: `3:verification` and
 * `4:ownership`. Ben's ruling is that these are the only two, and that *"there
 * will never be a third without a new Ben ruling"*.
 *
 * Held here as a literal rather than derived from the imported table, and then
 * checked against it at module load, so that a third entry appearing in
 * `content/trust-forward/variants.ts` fails the build instead of quietly
 * becoming policy. A content module can be edited; a ruling cannot be edited by
 * editing a content module.
 */
export const APPROVED_MISSING_EVIDENCE_EXCEPTIONS: readonly string[] = [
  "3:verification",
  "4:ownership"
];

const exceptionKey = (caseNumber: CaseNumber, axis: VariantAxisKey) => `${caseNumber}:${axis}`;

const FALLBACK_FRAGMENTS: ReadonlyMap<string, string> = (() => {
  const map = new Map<string, string>();
  for (const fallback of MISSING_EVIDENCE_FALLBACKS) {
    const key = exceptionKey(fallback.caseNumber, fallback.axis);
    if (!APPROVED_MISSING_EVIDENCE_EXCEPTIONS.includes(key)) {
      throw new Error(
        `"${key}" is not one of the two approved missing-evidence exceptions. ` +
          "A third neutral requires a new ruling, not a content edit."
      );
    }
    map.set(key, fallback.fragmentId);
  }
  for (const key of APPROVED_MISSING_EVIDENCE_EXCEPTIONS) {
    if (!map.has(key)) {
      throw new Error(`The approved missing-evidence exception "${key}" is no longer declared.`);
    }
  }
  return map;
})();

/* -------------------------------------------------------------------------- */
/* 4. Resolving one case's variant from accumulated evidence                  */
/* -------------------------------------------------------------------------- */

/**
 * True when any answer in the prefix carries an authored tag for this dimension.
 *
 * Read straight from the recovered signal map. This is the assertion side of
 * the absence rule, not the decision side: `accumulatedValue` decides, and this
 * says whether that decision is consistent with the tags.
 */
export function hasAccumulatedEvidence(
  prefix: readonly SignalledAnswer[],
  dimension: Dimension
): boolean {
  return prefix.some((answer) =>
    carriesDimension(answer.decisionId, answer.selectedOptionId, dimension)
  );
}

/**
 * The reducer's absence verdict must match the authored tags.
 *
 * Two failures, and they fail in opposite directions. A reducer that returns a
 * value where no tag exists has IMPUTED a posture — the one thing the locked
 * policy forbids — and would put a manufactured world condition in front of the
 * learner. A reducer that returns `null` where tags exist has DROPPED evidence,
 * and would route a fully evidenced axis to a neutral that was never meant to
 * fire. Neither is visible in the output: both produce a valid-looking variant.
 */
function assertEvidenceAgreement(
  caseNumber: CaseNumber,
  axis: CaseAxis,
  prefix: readonly SignalledAnswer[],
  value: TernaryState | null
): void {
  const evidenced = hasAccumulatedEvidence(prefix, axis.source);
  if (evidenced && value === null) {
    throw new Error(
      `Case ${caseNumber} axis "${axis.axis}": the prefix carries "${axis.source}" evidence but ` +
        "the aggregation reducer resolved no posture for it."
    );
  }
  if (!evidenced && value !== null) {
    throw new Error(
      `Case ${caseNumber} axis "${axis.axis}": the prefix carries no "${axis.source}" evidence but ` +
        "the aggregation reducer resolved a posture for it. Absence is never imputed."
    );
  }
}

/**
 * The fragment one axis resolves to, given the evidence accumulated before its
 * case.
 *
 * Precedence is evidence-first, from gate Q-D: *"Any present accumulated
 * evidence wins; the neutral applies only to genuine absence."* So the pinned
 * `OWN_SHARE` on Case 4 is checked AFTER the evidence test even though no
 * decision before Case 4 carries ownership evidence and it therefore fires on
 * every path today. Encoding the pin as an unconditional constant would be
 * correct output and wrong logic, and would stop being correct output the day a
 * Case 1-3 option gained an ownership tag.
 *
 * The index into `fragmentIds` is the ternary value the reducer read from the
 * recovered posture TAG. It is never an option's A/B/C position: nine of the
 * 138 tags are non-monotonic and a positional index would be wrong on all nine.
 */
function resolveAxisFragment(
  caseNumber: CaseNumber,
  axis: CaseAxis,
  prefix: readonly SignalledAnswer[],
  horizon: number
): string {
  const value = accumulatedValue(prefix, axis.source, horizon);
  assertEvidenceAgreement(caseNumber, axis, prefix, value);

  if (value !== null) {
    return axis.fragmentIds[TERNARY_STATES.indexOf(value)];
  }

  const fallback = FALLBACK_FRAGMENTS.get(exceptionKey(caseNumber, axis.axis));
  if (fallback === undefined) {
    throw new Error(
      `Case ${caseNumber} axis "${axis.axis}" has no accumulated "${axis.source}" evidence and ` +
        "no approved neutral. Absence is never imputed; this is a bug in the reducer, the " +
        "signal map or the axis table, not a missing default."
    );
  }

  // The pin and the fallback table are two records of the same ruling. If they
  // ever disagree, one of them has been edited and neither can be trusted.
  if (axis.pinnedFragmentId !== undefined && axis.pinnedFragmentId !== fallback) {
    throw new Error(
      `Case ${caseNumber} axis "${axis.axis}" pins "${axis.pinnedFragmentId}" but the approved ` +
        `neutral is "${fallback}".`
    );
  }
  return fallback;
}

/**
 * One case's world-state variant, computed from the accumulated posture
 * IMMEDIATELY BEFORE that case.
 *
 * `prefix` must be the active answers of every earlier case, in experience
 * order. The `caseEvidenceHorizon` passed to the reducer enforces the same
 * boundary a second time, so a caller that hands in too much cannot let a
 * decision help select the world it is asked in.
 */
export function resolveCaseVariant(
  caseNumber: CaseNumber,
  prefix: readonly SignalledAnswer[]
): VariantId {
  const axes: readonly CaseAxis[] = CASE_AXES[caseNumber];
  const horizon = caseEvidenceHorizon(caseNumber);
  const axisStates = axes.map((axis) => ({
    axis: axis.axis,
    fragmentId: resolveAxisFragment(caseNumber, axis, prefix, horizon)
  }));
  return buildVariantId(caseNumber, axisStates);
}

/* -------------------------------------------------------------------------- */
/* 5. The active path                                                         */
/* -------------------------------------------------------------------------- */

/** The decisions of one case, in experience order. */
export function decisionsOfCase(caseNumber: CaseNumber): readonly DecisionId[] {
  return DECISION_IDS.filter((decisionId) => caseOfDecision(decisionId) === caseNumber);
}

/**
 * The stamp's declared shape must match the content it pins.
 *
 * Cheap, and it catches the one failure the type system cannot: a content
 * module gaining or losing a case or a decision without a restamp. Under
 * `VERSIONING.md` that is a restamp trigger, so a mismatch means the build is
 * scoring content its stamp does not describe.
 */
export function assertStampMatchesContent(stamp: ActivePathStamp): void {
  if (stamp.experience.caseCount !== CASE_NUMBERS.length) {
    throw new Error(
      `The stamp declares ${stamp.experience.caseCount} cases; the content has ${CASE_NUMBERS.length}.`
    );
  }
  if (stamp.experience.decisionCount !== DECISION_IDS.length) {
    throw new Error(
      `The stamp declares ${stamp.experience.decisionCount} decisions; the content has ${DECISION_IDS.length}.`
    );
  }
}

/**
 * The active path: which exact questions stand right now, and which of them are
 * answered.
 *
 * Walks cases 1..5 in order. A case is REACHED when every decision of the case
 * before it is answered on the active path — derived, never read from the
 * ledger's `case_reached` events. Those events are telemetry and they only ever
 * accumulate; an upstream edit that unanswers Case 2 must un-reach Case 3, and
 * a monotonic event log cannot express that.
 *
 * Unreached cases contribute NO decisions. A decision in an unreached case has
 * no resolved world — the evidence that selects its variant has not been
 * produced yet — and listing it with a placeholder variant would be exactly the
 * imputation the two approved neutrals exist to contain. This is also the whole
 * mechanism behind *"only reached cases are navigable; future case titles stay
 * hidden until reached"*: there is nothing to navigate to and nothing to title.
 */
export function resolveActivePath(
  stamp: ActivePathStamp,
  ledger: readonly LedgerEvent[]
): ActivePath {
  return resolveActivePathFromAnswers(stamp, latestExactAnswers(ledger));
}

/**
 * `resolveActivePath` for a caller that already holds the answer map.
 *
 * Exposed so the result, receipt, export and cross-case-surface selectors can
 * share one map across a render instead of rebuilding it per consumer. It is
 * the same function; `resolveActivePath` is the one-argument door onto it.
 */
export function resolveActivePathFromAnswers(
  stamp: ActivePathStamp,
  answers: ReadonlyMap<string, ExactAnswer>
): ActivePath {
  assertStampMatchesContent(stamp);

  const decisions: ActiveDecision[] = [];
  const reachedCases: CaseNumber[] = [];
  const unanswered: DecisionId[] = [];
  const prefix: SignalledAnswer[] = [];

  for (const caseNumber of CASE_NUMBERS) {
    // Reachability. Case 1 is always reached; every later case is reached only
    // when the case before it is complete on the ACTIVE path.
    if (unanswered.length > 0) break;
    reachedCases.push(caseNumber);

    const variant = resolveCaseVariant(caseNumber, prefix);

    for (const decisionId of decisionsOfCase(caseNumber)) {
      // Restoration, not migration: an answer counts if and only if this exact
      // tuple was answered before. See `restoreLatestAnswerFor`.
      const restored = restoreLatestAnswerFor(answers, variant.id, decisionId);
      const selectedOptionId = restored ? restored.selectedOptionId : null;
      decisions.push({ caseNumber, decisionId, variant, selectedOptionId });
      if (selectedOptionId === null) {
        unanswered.push(decisionId);
      } else {
        prefix.push({
          decisionId,
          selectedOptionId,
          signals: SIGNAL_LOOKUP(decisionId, selectedOptionId) ?? {}
        });
      }
    }
  }

  const reachedFinalCase = reachedCases.includes(CASE_NUMBERS[CASE_NUMBERS.length - 1]);

  return {
    decisions,
    reachedCases,
    complete: reachedFinalCase && unanswered.length === 0,
    unanswered
  };
}

/* -------------------------------------------------------------------------- */
/* 6. Selectors over a resolved path                                          */
/* -------------------------------------------------------------------------- */

/** The active decision for one decision id, or `null` if it is not on the path. */
export function activeDecisionFor(
  path: ActivePath,
  decisionId: DecisionId
): ActiveDecision | null {
  return path.decisions.find((decision) => decision.decisionId === decisionId) ?? null;
}

/**
 * True when an exact stored answer is on the active path.
 *
 * *"An answer scores ONLY if its exact variantId+decisionId is on the active
 * path."* This is the predicate that sentence names, and it compares the stored
 * `variantId` string, not the decision id and not the case.
 */
export function isAnswerActive(path: ActivePath, answer: ExactAnswer): boolean {
  return path.decisions.some(
    (decision) =>
      decision.decisionId === answer.decisionId && decision.variant.id === answer.variantId
  );
}

/**
 * Every stored answer that is NOT on the active path.
 *
 * *"Inactive history stays in the ledger and the export, and never scores and
 * never renders."* It is returned rather than discarded because the JSON export
 * carries the full ledger including superseded events — the learner's record of
 * what they actually did is not the same object as the input to the score, and
 * conflating them would either lose their history or corrupt their result.
 * Nothing that renders and nothing that scores may read this.
 */
export function inactiveAnswers(
  path: ActivePath,
  answers: ReadonlyMap<string, ExactAnswer>
): readonly ExactAnswer[] {
  return [...answers.values()].filter((answer) => !isAnswerActive(path, answer));
}

/**
 * The ordered answers that score — or `null` when the path is incomplete.
 *
 * ABSENT, NOT GREYED OUT. *"If any active required decision is unanswered, the
 * result and both exports are ABSENT."* `null` is that absence made
 * unignorable: a caller cannot render a partial SHIP result by accident,
 * because there is no partial input to render one from. Restored the instant
 * the path completes, with no separate unlock step.
 */
export function scoringAnswers(path: ActivePath): readonly SignalledAnswer[] | null {
  if (!resultAndExportsPresent(path)) return null;
  return signalledAnswers(path, SIGNAL_LOOKUP);
}

/**
 * The single gate on the SHIP result, the profile, the receipts, the terminal
 * narrative, the Markdown export and the JSON export.
 *
 * Both conditions are checked even though `complete` already implies the
 * second, because these are two different claims — "the learner reached the
 * end" and "nothing on the path is open" — and a future change to either one
 * should not be able to open this gate on its own.
 */
export function resultAndExportsPresent(path: ActivePath): boolean {
  return path.complete && path.unanswered.length === 0;
}

/**
 * True when a case has been reached on the active path.
 *
 * Navigation and case-title visibility are the SAME predicate, deliberately.
 * `EXPERIENCE.futureCaseTitlesHiddenUntilReached` and "only reached cases are
 * navigable" are two statements of one rule, and giving them one implementation
 * is what stops a future edit from making a case linkable whose title is still
 * hidden — or worse, naming a case the learner has not reached in the nav.
 */
export function isCaseReached(path: ActivePath, caseNumber: CaseNumber): boolean {
  return path.reachedCases.includes(caseNumber);
}

/** Navigation is reachability. See `isCaseReached`. */
export function isCaseNavigable(path: ActivePath, caseNumber: CaseNumber): boolean {
  return isCaseReached(path, caseNumber);
}

/** Case-title visibility is reachability. See `isCaseReached`. */
export function isCaseTitleVisible(path: ActivePath, caseNumber: CaseNumber): boolean {
  return isCaseReached(path, caseNumber);
}

/**
 * The reached cases whose world is not the world the learner last answered in.
 *
 * Drives `changedScenarioNotice` in `content/trust-forward/copy.ts` — this
 * function returns case numbers and never the sentence, because learner-facing
 * prose does not live in `lib/`. A case qualifies when the ledger holds an
 * answer for one of its decisions under some OTHER `variantId`: that is the
 * observable trace of an upstream edit having moved this case's world, and it
 * is exactly the population that needs telling why the question in front of
 * them is not the question they remember.
 */
export function casesWithChangedScenario(
  path: ActivePath,
  answers: ReadonlyMap<string, ExactAnswer>
): readonly CaseNumber[] {
  const changed = new Set<CaseNumber>();
  for (const answer of answers.values()) {
    const decision = activeDecisionFor(path, answer.decisionId);
    if (!decision) continue;
    if (decision.variant.id !== answer.variantId) {
      changed.add(decision.caseNumber);
    }
  }
  return CASE_NUMBERS.filter((caseNumber) => changed.has(caseNumber));
}
