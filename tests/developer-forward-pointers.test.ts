import assert from "node:assert/strict";
import test from "node:test";

import {
  CASE_NUMBERS,
  DECISION_IDS,
  OPTION_IDS,
  caseOfDecision,
  type ActivePath,
  type CaseNumber,
  type DecisionId,
  type ExactAnswer,
  type LedgerEvent,
  type OptionId
} from "@/lib/developer-forward/types";
import {
  CASE_AXES,
  MISSING_EVIDENCE_FALLBACKS,
  type VariantAxisKey
} from "@/content/developer-forward/variants";
import { STAMP } from "@/content/developer-forward/stamp/v1-1-0";
import { decisionIndex, type SignalledAnswer } from "@/lib/developer-forward/aggregation";
import {
  ANSWER_EVENT_TYPES,
  APPROVED_MISSING_EVIDENCE_EXCEPTIONS,
  SIGNAL_LOOKUP,
  activeDecisionFor,
  answerKey,
  assertStampMatchesContent,
  caseEvidenceHorizon,
  casesWithChangedScenario,
  decisionsOfCase,
  hasAccumulatedEvidence,
  inactiveAnswers,
  isAnswerActive,
  isCaseNavigable,
  isCaseReached,
  isCaseTitleVisible,
  latestExactAnswers,
  resolveActivePath,
  resolveActivePathFromAnswers,
  resolveCaseVariant,
  restoreLatestAnswerFor,
  resultAndExportsPresent,
  scoringAnswers,
  variantIdString
} from "@/lib/developer-forward/pointers";

/**
 * Developer Forward Lite — the active-path pointer resolver (`lib/developer-forward/
 * pointers.ts`), which is the one module in the instrument that can be wrong
 * without anything breaking.
 *
 * WHY THIS FILE IS LARGER THAN ITS SUBJECT. Every other Lite module fails
 * loudly when it is wrong: a bad posture tag throws, a malformed event is
 * dropped, an incomplete path returns `null` instead of a SHIP result. The
 * pointer resolver has no such tell. Every failure mode it has produces a
 * perfectly valid `ActivePath` containing perfectly valid variants and
 * perfectly valid answers — just not the learner's. A world that survived an
 * upstream edit, an answer restored from a scenario that no longer stands, an
 * unevidenced axis quietly defaulted to its middle value: all four render
 * cleanly, export cleanly and score to a real SHIP code. Nothing downstream can
 * tell. So the assertions here are on VALUES, not on shapes.
 *
 * WHAT IT COVERS, and the rule each part implements:
 *
 *  1. The frozen `variantId` grammar — `types.ts` §4: "pointer restoration is
 *     EXACT MATCH on it, so its shape is frozen". A cosmetic change to the
 *     separator or the axis order is not a refactor; it silently unanswers
 *     every stored answer of every learner mid-run, with no error.
 *  2. The evidence horizon — Ben's transition ruling (layer 07,
 *     `variant-transition-rules.BEN_APPROVED.json`): a case's world is the
 *     posture accumulated IMMEDIATELY BEFORE it, so a decision must never help
 *     select the world it is asked in.
 *  3. `TEST_PLAN.md` "Pointer restoration", run end to end against a complete
 *     five-case ledger rather than a synthetic pair of events, because the
 *     interesting failures are in the CASCADE — an edit at C1D1 re-worlds Case
 *     2, which un-reaches Cases 3-5, which must then restore in one pass when
 *     the edit is undone.
 *  4. `TEST_PLAN.md` "Same-variant retention" — the other half of the same
 *     rule, and the half a naive "invalidate everything downstream of an edit"
 *     implementation gets wrong: an upstream edit that leaves the downstream
 *     tuple UNCHANGED must cost the learner nothing.
 *  5. `ARCHITECTURE.md` "Exact history vs active path" — inactive answers stay
 *     in the ledger for the export, and never score and never render.
 *  6. `TEST_PLAN.md` "Result completeness" — absent, not stale, not greyed out.
 *  7. `EXPERIENCE.futureCaseTitlesHiddenUntilReached` and "only reached cases
 *     are navigable", which are one predicate on purpose.
 *  8. The two approved missing-evidence neutrals, and the assertion that there
 *     is no third. This is the one property here that is checked EXHAUSTIVELY,
 *     over the complete prefix space of all five cases (9 + 81 + 729 + 6561
 *     prefixes), because "we did not add a third fallback" is not observable
 *     from any single path: a third neutral firing would produce a valid
 *     variant, a valid scenario sentence and a valid score, and would read to
 *     the learner as a fact about their world that they never established.
 *
 * PURE TYPESCRIPT, LIKE ITS SUBJECT. No component import and no `*.module.css`
 * specifier anywhere in the import graph: the suite runs as
 * `node --import tsx --test tests/*.test.ts` and Node cannot load a `.css`
 * specifier, so one stylesheet reached from here takes this whole file down
 * with `ERR_UNKNOWN_FILE_EXTENSION`. The imports above reach `lib/` and
 * `content/` only, which is the same discipline `tests/wys-local-state.test.ts`
 * and `tests/wys-telemetry.test.ts` work under.
 */

/* -------------------------------------------------------------------------- */
/* Fixtures — a ledger the way the learner writes one                         */
/* -------------------------------------------------------------------------- */

/**
 * A learner can only answer the question standing in front of them.
 *
 * The helper below therefore refuses to write an event for a decision that is
 * not on the ACTIVE path, and stamps every answer with the variant the resolver
 * currently reports rather than one the test chose. That is not convenience: a
 * fixture that picks its own `variantId` can hand the resolver a tuple no UI
 * could ever have produced, and would then be testing restoration against
 * evidence the product cannot generate. Every ledger in this file is a ledger a
 * real run could have written.
 */
const FIXED_LOCAL_TIMESTAMP = "2026-09-07T10:00:00+00:00";
const FIXED_SESSION_ID = "session-fixture";

interface Run {
  /** The append-only substrate. Never rewritten, only added to. */
  readonly ledger: readonly LedgerEvent[];
  path(): ActivePath;
  answers(): ReadonlyMap<string, ExactAnswer>;
  /** A first answer to a standing question. */
  select(decisionId: DecisionId, optionId: OptionId): ExactAnswer;
  /** An edit. A second event, never a rewrite of the first. */
  change(decisionId: DecisionId, optionId: OptionId): ExactAnswer;
}

function makeRun(): Run {
  const ledger: LedgerEvent[] = [];
  let sequence = 0;

  const path = (): ActivePath => resolveActivePath(STAMP, ledger);
  const answers = (): ReadonlyMap<string, ExactAnswer> => latestExactAnswers(ledger);

  function append(
    type: "decision_selected" | "decision_changed",
    decisionId: DecisionId,
    optionId: OptionId
  ): ExactAnswer {
    const active = activeDecisionFor(path(), decisionId);
    if (!active) {
      throw new Error(`"${decisionId}" is not on the active path; no learner could answer it.`);
    }
    sequence += 1;
    ledger.push({
      eventId: `evt-${sequence}`,
      sequence,
      type,
      localTimestamp: FIXED_LOCAL_TIMESTAMP,
      sessionId: FIXED_SESSION_ID,
      caseNumber: active.caseNumber,
      decisionId,
      variantId: active.variant.id,
      selectedOptionId: optionId
    });
    return {
      variantId: active.variant.id,
      decisionId,
      selectedOptionId: optionId,
      eventId: `evt-${sequence}`,
      sequence
    };
  }

  return {
    ledger,
    path,
    answers,
    select: (decisionId, optionId) => append("decision_selected", decisionId, optionId),
    change: (decisionId, optionId) => append("decision_changed", decisionId, optionId)
  };
}

type AnswerPlan = Record<DecisionId, OptionId>;

/**
 * Answer forward until nothing is open, taking each decision as the resolver
 * offers it. Deliberately NOT a loop over `DECISION_IDS`: a case that is not
 * reached has no decisions at all, so walking the resolver's own output is the
 * only way to answer a run the way the product presents it.
 */
function answerThrough(run: Run, plan: AnswerPlan): void {
  for (let guard = 0; guard <= DECISION_IDS.length; guard += 1) {
    const open = run.path().decisions.find((decision) => decision.selectedOptionId === null);
    if (!open) return;
    run.select(open.decisionId, plan[open.decisionId]);
  }
  throw new Error("The run did not close after one pass per decision.");
}

/**
 * The base run for the restoration sequence.
 *
 * `C1D2 = A` is load-bearing: with it, editing `C1D1` from A to C moves Case
 * 2's ambiguity axis from `AMB_UNRESOLVED` to `AMB_BOUNDED` and therefore
 * changes Case 2's variant tuple. The retention fixture below differs in
 * exactly that one answer and gets the opposite outcome, which is the point.
 */
const RESTORATION_PLAN: AnswerPlan = {
  C1D1: "A",
  C1D2: "A",
  C2D1: "B",
  C2D2: "B",
  C3D1: "B",
  C3D2: "B",
  C4D1: "B",
  C4D2: "B",
  C5D1: "B",
  C5D2: "B",
  C5D3: "B"
};

/**
 * The retention fixture. One answer apart from `RESTORATION_PLAN` — `C1D2 = B`
 * — and that one answer is what makes the SAME `C1D1` edit leave every
 * downstream variant tuple untouched: with `C1D2 = B`, ambiguity resolves to
 * `AMB_PARTIAL` whether `C1D1` is A, B or C.
 */
const RETENTION_PLAN: AnswerPlan = { ...RESTORATION_PLAN, C1D2: "B" };

/** The Case 2 world the restoration fixture starts in, and returns to. */
const C2_ORIGINAL = "c2:ambiguity=AMB_UNRESOLVED|reliance=RELIANCE_LOW";
/** The Case 2 world the C1D1 edit moves the learner into. */
const C2_AFTER_EDIT = "c2:ambiguity=AMB_BOUNDED|reliance=RELIANCE_LOW";

function signalled(pairs: readonly (readonly [DecisionId, OptionId])[]): SignalledAnswer[] {
  return pairs.map(([decisionId, optionId]) => ({
    decisionId,
    selectedOptionId: optionId,
    signals: SIGNAL_LOOKUP(decisionId, optionId) ?? {}
  }));
}

/** The decisions that can inform a case's world: every decision of an earlier case. */
function decisionsBefore(caseNumber: CaseNumber): readonly DecisionId[] {
  return DECISION_IDS.filter((decisionId) => caseOfDecision(decisionId) < caseNumber);
}

/** Every option sequence of a given length. 3^8 = 6561 at its largest, here. */
function optionSequences(length: number): readonly (readonly OptionId[])[] {
  let rows: OptionId[][] = [[]];
  for (let i = 0; i < length; i += 1) {
    rows = rows.flatMap((row) => OPTION_IDS.map((optionId) => [...row, optionId]));
  }
  return rows;
}

/* -------------------------------------------------------------------------- */
/* 1. The frozen variant id grammar                                           */
/* -------------------------------------------------------------------------- */

test("the variantId string shape is the exact documented form", () => {
  // `c<n>:<axis>=<fragmentId>|<axis>=<fragmentId>`, axes in declared order.
  assert.equal(
    variantIdString(2, [
      { axis: "ambiguity", fragmentId: "AMB_PARTIAL" },
      { axis: "reliance", fragmentId: "RELIANCE_LOW" }
    ]),
    "c2:ambiguity=AMB_PARTIAL|reliance=RELIANCE_LOW"
  );

  // Case 1 has no axes and composes to a bare `c1:`. The trailing colon is
  // deliberate: Case 1's one answerable world must still be keyed the same way
  // as every other case's, or its answers are stored under a different grammar.
  assert.equal(variantIdString(1, []), "c1:");
  assert.equal(resolveCaseVariant(1, []).id, "c1:");
});

test("every resolvable variant id matches the frozen grammar, axes in declared order", () => {
  const grammar = /^c[1-5]:(?:[a-z]+=[A-Z][A-Z0-9_]*(?:\|[a-z]+=[A-Z][A-Z0-9_]*)*)?$/;

  for (const caseNumber of CASE_NUMBERS) {
    const before = decisionsBefore(caseNumber);
    for (const options of optionSequences(before.length)) {
      const variant = resolveCaseVariant(
        caseNumber,
        signalled(before.map((decisionId, index) => [decisionId, options[index]] as const))
      );

      assert.match(variant.id, grammar, `case ${caseNumber} composed "${variant.id}"`);
      assert.equal(variant.caseNumber, caseNumber);

      // The id is the axes, in the order `CASE_AXES` declares them — not sorted,
      // not deduplicated. Reordering that table re-keys every stored answer.
      assert.deepEqual(
        variant.axes.map((axis) => axis.axis),
        CASE_AXES[caseNumber].map((axis) => axis.axis)
      );
      assert.equal(
        variant.id,
        `c${caseNumber}:${variant.axes
          .map((axis) => `${axis.axis}=${axis.fragmentId}`)
          .join("|")}`
      );
    }
  }
});

test("answerKey is the exact tuple, and restoration is exact match on it", () => {
  assert.equal(answerKey(C2_ORIGINAL, "C2D1"), `${C2_ORIGINAL}::C2D1`);

  const answers = new Map<string, ExactAnswer>([
    [
      answerKey(C2_ORIGINAL, "C2D1"),
      {
        variantId: C2_ORIGINAL,
        decisionId: "C2D1",
        selectedOptionId: "B",
        eventId: "evt-1",
        sequence: 1
      }
    ]
  ]);

  assert.equal(restoreLatestAnswerFor(answers, C2_ORIGINAL, "C2D1")?.selectedOptionId, "B");
  // A different world is a different question. Not a near miss — a miss.
  assert.equal(restoreLatestAnswerFor(answers, C2_AFTER_EDIT, "C2D1"), null);
  assert.equal(restoreLatestAnswerFor(answers, C2_ORIGINAL, "C2D2"), null);
});

test("latestExactAnswers takes the highest sequence, not the last array position", () => {
  // A merged or restored ledger's array order is not guaranteed to be causal
  // order; `sequence` is. Two tabs writing one dataset is the case that bites.
  const ledger: LedgerEvent[] = [
    {
      eventId: "evt-9",
      sequence: 9,
      type: "decision_changed",
      localTimestamp: FIXED_LOCAL_TIMESTAMP,
      sessionId: FIXED_SESSION_ID,
      decisionId: "C1D1",
      variantId: "c1:",
      selectedOptionId: "C"
    },
    {
      eventId: "evt-2",
      sequence: 2,
      type: "decision_selected",
      localTimestamp: FIXED_LOCAL_TIMESTAMP,
      sessionId: FIXED_SESSION_ID,
      decisionId: "C1D1",
      variantId: "c1:",
      selectedOptionId: "A"
    }
  ];

  const answer = latestExactAnswers(ledger).get(answerKey("c1:", "C1D1"));
  assert.equal(answer?.selectedOptionId, "C");
  assert.equal(answer?.sequence, 9);

  // Only the two answer event types record a choice.
  assert.deepEqual([...ANSWER_EVENT_TYPES], ["decision_selected", "decision_changed"]);
});

/* -------------------------------------------------------------------------- */
/* 2. The evidence horizon                                                    */
/* -------------------------------------------------------------------------- */

test("a case's world is the posture accumulated immediately before it", () => {
  assert.equal(caseEvidenceHorizon(1), -1);
  for (const caseNumber of CASE_NUMBERS) {
    if (caseNumber === 1) continue;
    const previous = decisionsOfCase((caseNumber - 1) as CaseNumber);
    assert.equal(caseEvidenceHorizon(caseNumber), decisionIndex(previous[previous.length - 1]));
  }

  // The behavioural half: a decision must never help select the world it is
  // asked in, even when a careless caller hands the resolver too much.
  const before = signalled([
    ["C1D1", "A"],
    ["C1D2", "C"],
    ["C2D1", "B"],
    ["C2D2", "B"]
  ]);
  const withCase3 = [...before, ...signalled([["C3D1", "A"], ["C3D2", "A"]])];
  assert.equal(resolveCaseVariant(3, withCase3).id, resolveCaseVariant(3, before).id);
});

test("the stamp's declared counts must match the content it pins", () => {
  assert.doesNotThrow(() => assertStampMatchesContent(STAMP));
  assert.throws(
    () => assertStampMatchesContent({ experience: { caseCount: 4, decisionCount: 11 } }),
    /4 cases/
  );
  assert.throws(
    () => assertStampMatchesContent({ experience: { caseCount: 5, decisionCount: 12 } }),
    /12 decisions/
  );
});

/* -------------------------------------------------------------------------- */
/* 3. TEST_PLAN.md "Pointer restoration", end to end                          */
/* -------------------------------------------------------------------------- */

test("pointer restoration: answer X, re-world it, answer Y, route back, X restores", () => {
  const run = makeRun();

  /* --- Step 0: a complete run. The baseline everything is compared against. */
  answerThrough(run, RESTORATION_PLAN);
  const completed = run.path();
  assert.equal(completed.complete, true);
  assert.deepEqual([...completed.unanswered], []);
  assert.deepEqual([...completed.reachedCases], [1, 2, 3, 4, 5]);
  assert.equal(resultAndExportsPresent(completed), true);

  const baselineScoring = scoringAnswers(completed);
  assert.ok(baselineScoring, "a complete path scores");
  assert.equal(baselineScoring.length, DECISION_IDS.length);

  /* --- Step 1: X is the downstream answer, stored against its exact world. */
  const x = run.answers().get(answerKey(C2_ORIGINAL, "C2D1"));
  assert.ok(x, "C2D1 was answered under the original Case 2 world");
  assert.equal(x.variantId, C2_ORIGINAL);
  assert.equal(x.selectedOptionId, "B");
  assert.equal(isAnswerActive(completed, x), true);
  const ledgerLengthAtBaseline = run.ledger.length;

  /* --- Step 2: edit UPSTREAM so a different downstream variant Y activates. */
  run.change("C1D1", "C");
  const edited = run.path();
  const yVariant = activeDecisionFor(edited, "C2D1");
  assert.ok(yVariant, "C2D1 still stands; it is a different question now");
  assert.equal(yVariant.variant.id, C2_AFTER_EDIT);
  assert.notEqual(yVariant.variant.id, x.variantId);

  /* --- Step 3: X is inactive, and with Y unanswered the result DISAPPEARS. */
  assert.equal(isAnswerActive(edited, x), false);
  assert.equal(yVariant.selectedOptionId, null);
  assert.equal(edited.complete, false);
  assert.deepEqual([...edited.unanswered], ["C2D1", "C2D2"]);
  assert.equal(resultAndExportsPresent(edited), false);
  // Absent, not stale: there is no partial input a caller could render from.
  assert.equal(scoringAnswers(edited), null);
  // The cascade: Case 2 is open, so Cases 3-5 are no longer reached at all.
  assert.deepEqual([...edited.reachedCases], [1, 2]);
  assert.equal(
    edited.decisions.some((decision) => decision.caseNumber > 2),
    false
  );
  // Case 2 is the case whose world moved under the learner.
  assert.deepEqual([...casesWithChangedScenario(edited, run.answers())], [2]);

  /* --- Step 4: answer Y. Different option, so restoration cannot be a no-op. */
  run.select("C2D1", "C");
  run.select("C2D2", "C");
  const answeredY = run.path();
  assert.equal(activeDecisionFor(answeredY, "C2D1")?.selectedOptionId, "C");
  // Case 3 is reached again, in a world its own answers were never given in.
  assert.deepEqual([...answeredY.reachedCases], [1, 2, 3]);
  assert.deepEqual([...answeredY.unanswered], ["C3D1", "C3D2"]);
  assert.equal(scoringAnswers(answeredY), null);

  /* --- Step 5: route back to X's variant by undoing the upstream edit. */
  run.change("C1D1", "A");
  const restored = run.path();

  const restoredDecision = activeDecisionFor(restored, "C2D1");
  assert.ok(restoredDecision);
  assert.equal(restoredDecision.variant.id, C2_ORIGINAL);
  // Silently restored: the learner is not asked again, and the answer comes
  // back at its ORIGINAL eventId. Nothing was rewritten, so nothing was
  // rewritten wrongly.
  assert.equal(restoredDecision.selectedOptionId, "B");
  const restoredAnswer = run.answers().get(answerKey(C2_ORIGINAL, "C2D1"));
  assert.deepEqual(restoredAnswer, x);
  assert.equal(isAnswerActive(restored, x), true);

  // And it scores again — the whole five-case chain restores in one pass,
  // identically to the baseline, because every tuple matches by exact string.
  assert.equal(restored.complete, true);
  assert.deepEqual([...restored.unanswered], []);
  assert.deepEqual([...restored.reachedCases], [1, 2, 3, 4, 5]);
  assert.equal(resultAndExportsPresent(restored), true);
  assert.deepEqual(scoringAnswers(restored), baselineScoring);
  assert.deepEqual(
    restored.decisions.map((decision) => `${decision.variant.id}::${decision.decisionId}`),
    completed.decisions.map((decision) => `${decision.variant.id}::${decision.decisionId}`)
  );

  /* --- Step 6: history only ever grew. The ledger is never rewritten. */
  assert.equal(run.ledger.length, ledgerLengthAtBaseline + 4);
  assert.equal(
    run.ledger.slice(0, ledgerLengthAtBaseline).every((event, index) => event.sequence === index + 1),
    true
  );
});

/* -------------------------------------------------------------------------- */
/* 4. TEST_PLAN.md "Same-variant retention"                                   */
/* -------------------------------------------------------------------------- */

test("an upstream edit that leaves the downstream tuple unchanged retains the answer", () => {
  const run = makeRun();
  answerThrough(run, RETENTION_PLAN);

  const before = run.path();
  assert.equal(before.complete, true);
  const beforeTuples = before.decisions.map(
    (decision) => `${decision.variant.id}::${decision.decisionId}=${decision.selectedOptionId}`
  );
  const beforeScoring = scoringAnswers(before);
  assert.ok(beforeScoring);

  // The SAME edit as the restoration fixture — C1D1 from A to C — against a run
  // that differs only at C1D2. Here ambiguity resolves to AMB_PARTIAL either
  // way, so no downstream variant tuple moves.
  run.change("C1D1", "C");
  const after = run.path();

  assert.equal(after.complete, true);
  assert.deepEqual([...after.unanswered], []);
  assert.deepEqual([...after.reachedCases], [1, 2, 3, 4, 5]);
  assert.equal(resultAndExportsPresent(after), true);

  // The edited decision itself changed; nothing downstream of it did.
  assert.equal(activeDecisionFor(after, "C1D1")?.selectedOptionId, "C");
  const afterTuples = after.decisions.map(
    (decision) => `${decision.variant.id}::${decision.decisionId}=${decision.selectedOptionId}`
  );
  assert.deepEqual(afterTuples.slice(1), beforeTuples.slice(1));

  // Nothing was orphaned and nobody is told their scenario changed, because it
  // did not: the world tuple is the same string it was.
  assert.deepEqual([...inactiveAnswers(after, run.answers())], []);
  assert.deepEqual([...casesWithChangedScenario(after, run.answers())], []);

  // Retention is not inertness. C1D1's own evidence changed, so the scoring
  // input changed with it — the answers were retained, not the result frozen.
  assert.notDeepEqual(scoringAnswers(after), beforeScoring);
});

/* -------------------------------------------------------------------------- */
/* 5. Inactive history: kept, never scored, never rendered                    */
/* -------------------------------------------------------------------------- */

test("inactive history stays in the ledger and never scores and never renders", () => {
  const run = makeRun();
  answerThrough(run, RESTORATION_PLAN);
  const ledgerAtBaseline = run.ledger.length;

  run.change("C1D1", "C");
  const edited = run.path();
  const orphaned = inactiveAnswers(edited, run.answers());

  // Every answer given under the old Case 2 world, and everything that followed
  // from it, is now inactive — nine of the eleven, since C1D1 and C1D2 are
  // themselves upstream of the edit's effect.
  assert.equal(orphaned.length, 9);
  assert.equal(
    orphaned.every((answer) => caseOfDecision(answer.decisionId) >= 2),
    true
  );

  // KEPT. The export carries the learner's record of what they actually did;
  // the score reads the active path. Conflating the two either loses their
  // history or corrupts their result.
  assert.equal(run.ledger.length, ledgerAtBaseline + 1);
  for (const answer of orphaned) {
    assert.ok(
      run.ledger.some(
        (event) => event.eventId === answer.eventId && event.variantId === answer.variantId
      ),
      `${answer.eventId} is still in the ledger`
    );
  }

  // NEVER SCORES. There is no scoring input at all while the path is open, and
  // once it closes again the inactive tuples are not among the scored ones.
  assert.equal(scoringAnswers(edited), null);
  run.select("C2D1", "C");
  run.select("C2D2", "C");
  const reopened = run.path();
  const stillInactive = inactiveAnswers(reopened, run.answers());
  assert.equal(stillInactive.length > 0, true);

  // NEVER RENDERS. `path.decisions` is the only surface a renderer reads, and
  // no inactive tuple appears on it.
  for (const answer of stillInactive) {
    assert.equal(isAnswerActive(reopened, answer), false);
    assert.equal(
      reopened.decisions.some(
        (decision) =>
          decision.decisionId === answer.decisionId && decision.variant.id === answer.variantId
      ),
      false
    );
  }

  // An answer is active on its exact tuple, not on its decision id: the same
  // decision is answered under two worlds here, and only one of them is on the
  // path.
  const underOldWorld = run.answers().get(answerKey(C2_ORIGINAL, "C2D1"));
  const underNewWorld = run.answers().get(answerKey(C2_AFTER_EDIT, "C2D1"));
  assert.ok(underOldWorld && underNewWorld);
  assert.equal(underOldWorld.decisionId, underNewWorld.decisionId);
  assert.equal(isAnswerActive(reopened, underOldWorld), false);
  assert.equal(isAnswerActive(reopened, underNewWorld), true);
});

/* -------------------------------------------------------------------------- */
/* 6. Completeness: absent, not stale                                         */
/* -------------------------------------------------------------------------- */

test("any unanswered active decision means no result and no export", () => {
  const run = makeRun();

  // A fresh run: Case 1 stands, nothing else exists yet.
  const fresh = run.path();
  assert.equal(fresh.complete, false);
  assert.deepEqual([...fresh.unanswered], ["C1D1", "C1D2"]);
  assert.deepEqual([...fresh.reachedCases], [1]);
  assert.equal(resultAndExportsPresent(fresh), false);
  assert.equal(scoringAnswers(fresh), null);

  // Every intermediate state of a full run is incomplete, with `unanswered`
  // non-empty and no scoring input — checked at every step rather than only at
  // the ends, because "no partial result" is a claim about the middle.
  for (let step = 0; step < DECISION_IDS.length; step += 1) {
    const open = run.path().decisions.find((decision) => decision.selectedOptionId === null);
    assert.ok(open, `step ${step} still has an open decision`);
    run.select(open.decisionId, RESTORATION_PLAN[open.decisionId]);

    const partial = run.path();
    const last = step === DECISION_IDS.length - 1;
    assert.equal(partial.complete, last);
    assert.equal(partial.unanswered.length === 0, last);
    assert.equal(resultAndExportsPresent(partial), last);
    assert.equal(scoringAnswers(partial) === null, !last);
  }

  // An unanswered ACTIVE decision, created by an edit, removes the result
  // immediately — no separate invalidation step, no stale result in between.
  run.change("C1D1", "C");
  const broken = run.path();
  assert.equal(broken.complete, false);
  assert.deepEqual([...broken.unanswered], ["C2D1", "C2D2"]);
  assert.equal(resultAndExportsPresent(broken), false);
  assert.equal(scoringAnswers(broken), null);

  // And answering restores both immediately, with no unlock step.
  run.change("C1D1", "A");
  const healed = run.path();
  assert.equal(healed.complete, true);
  assert.deepEqual([...healed.unanswered], []);
  assert.equal(resultAndExportsPresent(healed), true);
  assert.ok(scoringAnswers(healed));
});

test("resolveActivePathFromAnswers is the same function through a shared map", () => {
  const run = makeRun();
  answerThrough(run, RESTORATION_PLAN);
  assert.deepEqual(resolveActivePathFromAnswers(STAMP, run.answers()), run.path());
});

/* -------------------------------------------------------------------------- */
/* 7. Reachability is navigation is title visibility                          */
/* -------------------------------------------------------------------------- */

test("only reached cases are navigable and future case titles stay hidden", () => {
  const run = makeRun();

  // Nothing but Case 1 exists before the learner answers anything.
  for (const caseNumber of CASE_NUMBERS) {
    const path = run.path();
    const reached = caseNumber === 1;
    assert.equal(isCaseReached(path, caseNumber), reached);
    assert.equal(isCaseNavigable(path, caseNumber), reached);
    assert.equal(isCaseTitleVisible(path, caseNumber), reached);
  }

  // A case becomes reachable only when the case before it is complete on the
  // ACTIVE path — half-answering Case 1 does not open Case 2.
  run.select("C1D1", "A");
  assert.equal(isCaseTitleVisible(run.path(), 2), false);
  run.select("C1D2", "A");
  assert.equal(isCaseTitleVisible(run.path(), 2), true);
  assert.equal(isCaseTitleVisible(run.path(), 3), false);

  answerThrough(run, RESTORATION_PLAN);
  const complete = run.path();
  for (const caseNumber of CASE_NUMBERS) {
    assert.equal(isCaseReached(complete, caseNumber), true);
    assert.equal(isCaseNavigable(complete, caseNumber), true);
    assert.equal(isCaseTitleVisible(complete, caseNumber), true);
  }

  // An upstream edit UN-reaches the cases beyond it. `case_reached` telemetry
  // only ever accumulates and cannot express this, which is why reachability is
  // derived from the active path and never read from the ledger.
  run.change("C1D1", "C");
  const edited = run.path();
  for (const caseNumber of CASE_NUMBERS) {
    const reached = caseNumber <= 2;
    assert.equal(isCaseReached(edited, caseNumber), reached);
    assert.equal(isCaseNavigable(edited, caseNumber), reached);
    assert.equal(isCaseTitleVisible(edited, caseNumber), reached);
  }

  // Navigation, titles and reachability are one predicate, not three that agree.
  for (const caseNumber of CASE_NUMBERS) {
    assert.equal(isCaseNavigable(edited, caseNumber), isCaseReached(edited, caseNumber));
    assert.equal(isCaseTitleVisible(edited, caseNumber), isCaseReached(edited, caseNumber));
  }
});

/* -------------------------------------------------------------------------- */
/* 8. The two approved neutrals — and the absence of a third                  */
/* -------------------------------------------------------------------------- */

test("the approved missing-evidence exceptions are exactly two, and agree with the content", () => {
  assert.deepEqual([...APPROVED_MISSING_EVIDENCE_EXCEPTIONS], ["3:verification", "4:ownership"]);
  assert.deepEqual(
    MISSING_EVIDENCE_FALLBACKS.map((fallback) => `${fallback.caseNumber}:${fallback.axis}`),
    ["3:verification", "4:ownership"]
  );
  assert.deepEqual(
    MISSING_EVIDENCE_FALLBACKS.map((fallback) => fallback.fragmentId),
    ["VERIFY_TRUST", "OWN_SHARE"]
  );

  // The pin and the fallback table are two records of one ruling.
  const pinned = CASE_AXES[4].find((axis) => axis.axis === "ownership");
  assert.equal(pinned?.pinnedFragmentId, "OWN_SHARE");
  // Case 1 is the one fixed setup and has no axes; every later case has them.
  assert.equal(CASE_AXES[1].length, 0);
  for (const caseNumber of CASE_NUMBERS) {
    if (caseNumber === 1) continue;
    assert.equal(CASE_AXES[caseNumber].length > 0, true);
  }
});

/**
 * The exhaustive pass, and the reason it has to be exhaustive.
 *
 * A third missing-evidence fallback would not throw and would not look wrong.
 * It would compose a valid variant id, select a real authored fragment and put
 * a sentence in front of the learner asserting a condition of their world that
 * their answers never established — and then score it. The only way to know it
 * has not happened is to drive every prefix that can precede every case and
 * collect the complete set of axes that reach the absence branch at all.
 *
 * 9 + 81 + 729 + 6561 = 7,380 prefixes, which is the entire input space of the
 * variant resolver, not a sample.
 */
test("exactly two axes ever fall back, on exactly the documented prefixes", () => {
  const fellBack = new Set<string>();
  const case3Neutrals: string[] = [];
  const case4OwnershipFragments = new Set<string>();
  const variantsByCase = new Map<CaseNumber, Set<string>>();

  for (const caseNumber of CASE_NUMBERS) {
    const before = decisionsBefore(caseNumber);
    const ids = new Set<string>();

    for (const options of optionSequences(before.length)) {
      const pairs = before.map((decisionId, index) => [decisionId, options[index]] as const);
      const prefix = signalled(pairs);

      for (const axis of CASE_AXES[caseNumber]) {
        if (!hasAccumulatedEvidence(prefix, axis.source)) {
          fellBack.add(`${caseNumber}:${axis.axis as VariantAxisKey}`);
          if (caseNumber === 3 && axis.axis === "verification") {
            case3Neutrals.push(pairs.map(([id, option]) => `${id}=${option}`).join(","));
          }
        }
      }

      // Resolving throws on an unapproved absence, so this line is itself the
      // assertion for every axis that has no ruling behind it.
      const variant = resolveCaseVariant(caseNumber, prefix);
      ids.add(variant.id);

      if (caseNumber === 3) {
        const verification = variant.axes.find((axis) => axis.axis === "verification");
        if (!hasAccumulatedEvidence(prefix, "verification")) {
          assert.equal(verification?.fragmentId, "VERIFY_TRUST");
        } else {
          assert.notEqual(verification?.fragmentId, undefined);
        }
      }
      if (caseNumber === 4) {
        const ownership = variant.axes.find((axis) => axis.axis === "ownership");
        assert.ok(ownership);
        case4OwnershipFragments.add(ownership.fragmentId);
      }
    }

    variantsByCase.set(caseNumber, ids);
  }

  // THE RULING: two exceptions, and imputing a third would be a silent scoring
  // change. No other axis reaches the absence branch on any prefix.
  assert.deepEqual([...fellBack].sort(), ["3:verification", "4:ownership"]);

  // Case 3 falls back on exactly four of its 81 prefixes — the four on which no
  // decision through C2D2 carries a verification tag.
  assert.deepEqual(case3Neutrals.sort(), [
    "C1D1=A,C1D2=A,C2D1=A,C2D2=A",
    "C1D1=A,C1D2=B,C2D1=A,C2D2=A",
    "C1D1=B,C1D2=A,C2D1=A,C2D2=A",
    "C1D1=B,C1D2=B,C2D1=A,C2D2=A"
  ]);

  // Case 4's ownership axis is PINNED on every one of its 729 prefixes: it is
  // the only axis with no upstream evidence anywhere, because `ownership` is
  // carried only by C4D1, C4D2, C5D1 and C5D2 — all at or after Case 4.
  assert.deepEqual([...case4OwnershipFragments], ["OWN_SHARE"]);

  // The reachability figure `content/developer-forward/variants.ts` documents.
  // 1 + 5 + 7 + 3 + 27 = 43 of the 55 authored combinations. Case 3 is 7 rather
  // than 9 because the Q-D neutral creates combinations no evidence path
  // reaches; Case 4 is 3 rather than 9 because its ownership axis is pinned. If
  // this moves, the transition rules moved, and that is a restamp under
  // VERSIONING.md — not a number to update here.
  assert.deepEqual(
    CASE_NUMBERS.map((caseNumber) => variantsByCase.get(caseNumber)?.size),
    [1, 5, 7, 3, 27]
  );
  assert.equal(
    CASE_NUMBERS.reduce((total, caseNumber) => total + (variantsByCase.get(caseNumber)?.size ?? 0), 0),
    43
  );
});

test("an unevidenced axis with no ruling throws rather than defaulting", () => {
  // Every case with axes, driven with no evidence at all. Each names the FIRST
  // axis that has no approved neutral — the point being that none of them
  // quietly picks a middle fragment.
  assert.throws(() => resolveCaseVariant(2, []), /no approved neutral/);
  assert.throws(() => resolveCaseVariant(3, []), /axis "risk"[\s\S]*no approved neutral/);
  assert.throws(() => resolveCaseVariant(4, []), /axis "trust"[\s\S]*no approved neutral/);
  assert.throws(() => resolveCaseVariant(5, []), /axis "promise"[\s\S]*no approved neutral/);

  // Case 3 with verification absent but risk present resolves — that is the
  // approved neutral doing exactly and only its job.
  const riskOnly = signalled([
    ["C1D1", "A"],
    ["C1D2", "A"],
    ["C2D1", "A"],
    ["C2D2", "A"]
  ]);
  assert.equal(hasAccumulatedEvidence(riskOnly, "verification"), false);
  assert.equal(hasAccumulatedEvidence(riskOnly, "risk"), true);
  assert.equal(resolveCaseVariant(3, riskOnly).id, "c3:verification=VERIFY_TRUST|risk=RISK_MOVE");
});

test("casesWithChangedScenario names the cases whose world moved under the learner", () => {
  const run = makeRun();
  answerThrough(run, RESTORATION_PLAN);
  assert.deepEqual([...casesWithChangedScenario(run.path(), run.answers())], []);

  run.change("C1D1", "C");
  // Case 2's standing question is now a different question from the one the
  // ledger holds an answer to. That is the population that needs telling why.
  assert.deepEqual([...casesWithChangedScenario(run.path(), run.answers())], [2]);

  // The predicate is "the ledger holds an answer for this case under some OTHER
  // variantId", so a case that has ever been re-worlded stays flagged after the
  // edit is undone. That is the definition doing what it says, not drift: the
  // learner did see two different Case 2 worlds, and both answers are real
  // history that the export still carries.
  run.select("C2D1", "C");
  run.select("C2D2", "C");
  run.change("C1D1", "A");
  const restored = run.path();
  assert.equal(restored.complete, true);
  assert.deepEqual([...casesWithChangedScenario(restored, run.answers())], [2]);
});
