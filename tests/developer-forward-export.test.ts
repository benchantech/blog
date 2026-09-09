import assert from "node:assert/strict";
import test from "node:test";

import {
  EXPORT_SECTION_LABELS,
  LITE_EXPORT_PRODUCT,
  LITE_EXPORT_SCHEMA_VERSION,
  LITE_IMPORT_CONDITION_IDS,
  MARKDOWN_PART_KEYS,
  OPTIONAL_MARKDOWN_PART_KEYS,
  SUPPORTED_EXPORT_SCHEMA_VERSIONS,
  buildLiteExportJson,
  buildLiteExportJsonText,
  buildLiteExportMarkdown,
  buildLiteExportMarkdownParts,
  exportAvailability,
  isExportUnlocked,
  validateLiteExport,
  type LiteExportInput,
  type LiteImportConditionId
} from "@/lib/developer-forward/exports";
import { appendEvent } from "@/lib/developer-forward/ledger";
import {
  SIGNAL_LOOKUP,
  inactiveAnswers,
  latestExactAnswers,
  resolveActivePath
} from "@/lib/developer-forward/pointers";
import { allReceipts, highlightReceipts } from "@/lib/developer-forward/receipts";
import { calculateShip } from "@/lib/developer-forward/scoring";
import { composeNarrative } from "@/lib/developer-forward/narrative";
import { dimensionStateFromActivePath } from "@/lib/developer-forward/aggregation";
import { startLiteDataset } from "@/lib/developer-forward/storage";
import { DECISION_IDS, caseOfDecision } from "@/lib/developer-forward/types";
import type {
  ActivePath,
  DecisionId,
  LiteDataset,
  LiteResult,
  OptionId
} from "@/lib/developer-forward/types";
import { RECEIPT_PHRASES } from "@/content/developer-forward/receipts";
import { REFLECTION_PLACEMENTS } from "@/content/developer-forward/copy";
import { EXPERIENCE, VERSION_MANIFEST } from "@/content/developer-forward/stamp/v1-1-0";

/**
 * Developer Forward Lite — the export artifacts and the local import mirror
 * (plan §6.9; `EXPORT_SPEC.md`; `LITE_TO_FULL_IMPORT_SUPERSESSION.json`).
 *
 * ⚠ THIS FILE IS A LOCAL MIRROR OF FULL'S IMPORT CONTRACT. IT CANNOT PROVE THE
 * REAL STUDIO IMPORTER ACCEPTS THIS SHAPE.
 *
 * `validateLiteExport` re-implements the five fail-closed conditions the
 * supersession names, and everything below shows that the artifact THIS
 * repository generates satisfies the contract AS WRITTEN IN THE HANDOFF. The
 * actual importer lives at `studio.com/benchanviolin/trust-forward`; its field
 * matching is not in this repository, and layer 04 records the top-level
 * `product` identity as an interface PROPOSAL rather than a ratified field.
 * End-to-end acceptance is a RELEASE SMOKE TEST under SC-TF6 / interface QA —
 * a real export carried to a real import — and NO ASSERTION IN THIS FILE MAY BE
 * CITED AS EVIDENCE FOR IT. A green suite here means our artifact is
 * self-consistent and contract-shaped; it does not mean the handoff succeeds.
 *
 * WHY IT IMPORTS NO COMPONENT. The suite runs as
 * `node --import tsx --test tests/*.test.ts` and Node cannot resolve a `.css`
 * specifier: one component import in this file's transitive graph takes the
 * whole file down with `ERR_UNKNOWN_FILE_EXTENSION`, and a test file that
 * cannot load is a test file that cannot fail.
 *
 * WHY THE FIXTURE PLAYS THE RUN RATHER THAN HAND-WRITING A LEDGER. A variant id
 * is computed from the answers that precede it, so a hand-written ledger would
 * encode ids this build's own resolver might not produce — and then the export
 * would be asserted against a world no learner can reach. `completeRun()`
 * therefore answers whatever the resolver says is open, using the resolver's
 * own variant id, until nothing is open. The same loop is what makes the
 * superseded-answer fixture honest: it replays a real edit.
 */

/** The two counts the path resolver checks its content against. */
const STAMP = { experience: EXPERIENCE } as const;

const EXPORTED_AT = "2026-09-07T09:41:00-07:00";

/* -------------------------------------------------------------------------- */
/* 0. The fixture                                                             */
/* -------------------------------------------------------------------------- */

/** Answer every currently-open active decision with `option`, in path order. */
function answerAll(
  dataset: LiteDataset,
  option: OptionId,
  type: "decision_selected" | "decision_changed" = "decision_selected"
): LiteDataset {
  let next = dataset;
  // Bounded rather than `while (true)`: a resolver bug that never closes the
  // path must fail this test, not hang the suite.
  for (let guard = 0; guard <= DECISION_IDS.length * 4; guard += 1) {
    const path = resolveActivePath(STAMP, next.ledger);
    const open = path.decisions.find((decision) => decision.selectedOptionId === null);
    if (!open) return next;
    next = appendEvent(next, {
      type,
      caseNumber: open.caseNumber,
      decisionId: open.decisionId,
      variantId: open.variant.id,
      selectedOptionId: option
    });
  }
  throw new Error("the active path never closed; the fixture loop is bounded on purpose");
}

/**
 * The five reflections, written to be hostile to a formatter.
 *
 * Leading and trailing spaces, an interior blank line, tabs, a trailing
 * newline, and a run of backticks long enough to close an ordinary Markdown
 * fence. `EXPORT_SPEC.md` calls the reflections VERBATIM, and Ben's import
 * contract accepts them as evidence Full may quote exactly — so "verbatim" has
 * to survive JSON, a Markdown fence, and the round trip back, character for
 * character. Text a formatter cannot damage proves nothing.
 */
const REFLECTION_TEXTS: readonly string[] = [
  "  Leading and trailing spaces are part of what I wrote.  ",
  "First line.\n\nThird line, after a deliberately blank one.\n",
  "Tabbed\tin\tthe\tmiddle, and ending on a newline.\n",
  "A ``` fence run inside the text, and a longer ```` one after it.",
  "\n  Opens on a newline and two spaces.\n\tCloses on a tab.\t"
];

interface Fixture {
  dataset: LiteDataset;
  activePath: ActivePath;
  result: LiteResult;
  input: LiteExportInput;
}

/**
 * The `LiteResult` the surfaces compute, assembled here from the same
 * primitives rather than imported from a result module.
 *
 * Deliberate: the export is asserted against the reducer, the scorer, the
 * narrative composer and the receipt trail themselves. A helper that produced
 * results some other way would let the export and its fixture drift together
 * and stay green.
 */
function resultFor(activePath: ActivePath): LiteResult {
  const dimensionState = dimensionStateFromActivePath(activePath, SIGNAL_LOOKUP);
  const ship = calculateShip(dimensionState);
  return {
    dimensionState,
    ship,
    profileKey: ship.profileKey,
    narrative: composeNarrative(dimensionState),
    receipts: allReceipts(activePath)
  };
}

/**
 * A finished run that also carries history: eleven answers given, one Case 1
 * answer later changed, and the downstream re-answered under the new world.
 *
 * The edit is not decoration. It is what puts SUPERSEDED and INACTIVE events in
 * the ledger — the earlier Case 1 answer, and every later answer keyed to the
 * variant tuple that answer used to select — which is the population
 * `EXPORT_SPEC.md` requires the export to carry in full.
 */
function completeRun(): Fixture {
  let dataset = startLiteDataset({ ...VERSION_MANIFEST });

  // Pass one: the whole run on option A.
  dataset = answerAll(dataset, "A");

  // The edit. C1D2 moves to C, which changes Case 2's world and un-answers it,
  // which un-reaches Cases 3 to 5.
  const beforeEdit = resolveActivePath(STAMP, dataset.ledger);
  const c1d2 = beforeEdit.decisions.find((decision) => decision.decisionId === "C1D2");
  assert.ok(c1d2, "C1D2 is not on the active path; the fixture cannot replay an edit");
  dataset = appendEvent(dataset, {
    type: "decision_changed",
    caseNumber: 1,
    decisionId: "C1D2",
    variantId: c1d2.variant.id,
    selectedOptionId: "C"
  });

  // Pass two: re-answer everything the edit opened, on option B.
  dataset = answerAll(dataset, "B");

  // The handle, which is local-only, never scored, and dropped by Full on
  // import — present so the optional Markdown part 3 is exercised.
  dataset = appendEvent(dataset, { type: "handle_set" });
  dataset = { ...dataset, handle: "riverbend" };

  // The five reflections, one per approved placement.
  REFLECTION_PLACEMENTS.forEach((placement, index) => {
    dataset = appendEvent(dataset, {
      type: "reflection_committed",
      caseNumber: caseOfDecision(placement.afterDecisionId),
      decisionId: placement.afterDecisionId,
      text: REFLECTION_TEXTS[index]
    });
  });

  const activePath = resolveActivePath(STAMP, dataset.ledger);
  assert.equal(activePath.complete, true, "the fixture run is not complete");
  const result = resultFor(activePath);
  return {
    dataset,
    activePath,
    result,
    input: { dataset, activePath, result, exportedAtLocal: EXPORTED_AT }
  };
}

/** The JSON artifact as a FOREIGN reader sees it: parsed back from text. */
function readBackJson(input: LiteExportInput): Record<string, unknown> {
  const text = buildLiteExportJsonText(input);
  assert.ok(text !== null);
  return JSON.parse(text) as Record<string, unknown>;
}

/** A structural clone, so a mutation test cannot leak into the next one. */
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/* -------------------------------------------------------------------------- */
/* 1. The Markdown document                                                   */
/* -------------------------------------------------------------------------- */

/**
 * `EXPORT_SPEC.md` gives thirteen parts in one order and puts the machine-
 * readable manifest LAST. The order is the contract: a reader — human or
 * importer — that scans for the manifest at the end must find it there, and a
 * part that moves has changed the document's shape without changing its
 * content, which is the kind of drift no other check would see.
 */
test("the Markdown export carries all thirteen parts, in EXPORT_SPEC order", () => {
  const { input } = completeRun();
  const parts = buildLiteExportMarkdownParts(input);
  assert.ok(parts !== null);

  assert.equal(MARKDOWN_PART_KEYS.length, 13);

  // With a handle and five reflections present, both optional parts appear, so
  // this run must emit all thirteen.
  assert.deepEqual(
    parts.map((part) => part.key),
    [...MARKDOWN_PART_KEYS],
    "the emitted parts are not EXPORT_SPEC.md's thirteen in order"
  );

  // `part` is the 1-based position in the spec's list, not the position in this
  // document — the two differ whenever an optional part is absent, and the
  // number a reader cites is the spec's.
  parts.forEach((part) => {
    assert.equal(part.part, MARKDOWN_PART_KEYS.indexOf(part.key) + 1);
  });

  // Whatever the emitted set, it is always a strictly increasing subsequence.
  const positions = parts.map((part) => MARKDOWN_PART_KEYS.indexOf(part.key));
  for (let i = 1; i < positions.length; i += 1) {
    assert.ok(positions[i] > positions[i - 1], "the parts are out of specification order");
  }

  // Only the title is its own heading; every other part is labelled with the
  // specification's own name for it.
  assert.equal(parts[0].key, "title");
  assert.equal(parts[0].heading, null);
  for (const part of parts.slice(1)) {
    assert.equal(part.heading, EXPORT_SECTION_LABELS[part.key as Exclude<typeof part.key, "title">]);
  }

  // Rendered, the headings appear in the same order in the document text.
  const markdown = buildLiteExportMarkdown(input);
  assert.ok(markdown !== null);
  let cursor = 0;
  for (const part of parts.slice(1)) {
    const at = markdown.indexOf(`## ${part.heading}`, cursor);
    assert.ok(at >= cursor, `heading "${part.heading}" is missing or out of order`);
    cursor = at;
  }
});

/**
 * The manifest is the LAST block, and it is machine-readable where it sits.
 *
 * A Markdown document that ends in prose is not identifiable to a fail-closed
 * reader, so the final fence carries `product` and `schemaVersion` alongside
 * the eleven version fields: a bare manifest would name its versions without
 * naming what they version.
 */
test("the Markdown export ends with the machine-readable JSON version manifest", () => {
  const { input } = completeRun();
  const markdown = buildLiteExportMarkdown(input);
  assert.ok(markdown !== null);

  const parts = buildLiteExportMarkdownParts(input);
  assert.ok(parts !== null);
  assert.equal(parts[parts.length - 1].key, "versionManifest");

  assert.ok(markdown.trimEnd().endsWith("```"), "the document does not end on a closed fence");

  // Parse the final fenced block the way a reader would: last fence back.
  const fences = [...markdown.matchAll(/```json\n([\s\S]*?)\n```/g)];
  assert.ok(fences.length > 0);
  const tail = fences[fences.length - 1];
  const manifestBlock = JSON.parse(tail[1]) as Record<string, unknown>;

  assert.equal(manifestBlock.product, LITE_EXPORT_PRODUCT);
  assert.equal(manifestBlock.schemaVersion, LITE_EXPORT_SCHEMA_VERSION);
  assert.deepEqual(manifestBlock.versionManifest, { ...VERSION_MANIFEST });

  // Nothing follows it.
  assert.equal(markdown.slice(tail.index + tail[0].length).trim(), "");
});

/* -------------------------------------------------------------------------- */
/* 2. The JSON artifact                                                       */
/* -------------------------------------------------------------------------- */

/**
 * `product` is REQUIRED, not decorative: Full's `requireRecognizedLiteProduct`
 * is fail-closed and `"rejectArbitraryJsonInterpretation": true`, so an
 * artifact without it is refused rather than best-guessed. The top level is
 * asserted as an EXACT key set — an extra field is a field Full was never told
 * about, and a missing one is an import that fails at the far end.
 */
test("the JSON export has the declared top-level shape", () => {
  const { input } = completeRun();
  const json = readBackJson(input);

  assert.deepEqual(
    Object.keys(json).sort(),
    ["current", "exportedAtLocal", "ledger", "product", "schemaVersion", "versionManifest"],
    "the export's top level gained or lost a field"
  );

  assert.equal(json.product, "developer-forward-lite");
  assert.equal(json.product, LITE_EXPORT_PRODUCT);
  assert.equal(json.schemaVersion, LITE_EXPORT_SCHEMA_VERSION);
  assert.ok(SUPPORTED_EXPORT_SCHEMA_VERSIONS.includes(json.schemaVersion as number));
  assert.equal(json.exportedAtLocal, EXPORTED_AT);
  assert.deepEqual(json.versionManifest, { ...VERSION_MANIFEST });

  // The local timestamp travels in the file, so it carries a NUMERIC offset and
  // no timezone name — a name is a location signal.
  assert.match(json.exportedAtLocal as string, /[+-]\d{2}:\d{2}$/);
  assert.ok(!/[A-Za-z]/.test((json.exportedAtLocal as string).slice(11)));

  const current = json.current as Record<string, unknown>;
  assert.deepEqual(
    Object.keys(current).sort(),
    ["activePath", "dimensionState", "handle", "profile", "receipts", "reflections", "ship"].sort()
  );

  // Hidden numeric scoring internals are NOT exported
  // (`"hiddenNumericScoringInternalsAllowed": false`).
  const ship = current.ship as Record<string, unknown>;
  assert.ok(!Object.hasOwn(ship, "leans"), "the raw reducer leans must not leave the browser");
  for (const receipt of current.receipts as Record<string, unknown>[]) {
    assert.ok(!Object.hasOwn(receipt, "shipContribution"), "receipt magnitude is internal ordering state");
  }

  // The terminal six-dimension state is CATEGORICAL — postures, never 0/0.5/1.
  for (const posture of Object.values(current.dimensionState as Record<string, unknown>)) {
    assert.equal(typeof posture, "string");
  }
});

/**
 * *"Inactive/superseded events remain in full ledger."* `current` is the active
 * view; `ledger` is the record, and it is the only place the learner's own
 * history of changing their mind survives. An export that shipped only the
 * active answers would quietly delete the part of the run that shows a person
 * reconsidering — which is the behaviour this whole product is about.
 */
test("the exported ledger keeps every superseded and inactive event", () => {
  const { dataset, activePath, input } = completeRun();
  const json = readBackJson(input);
  const ledger = json.ledger as Record<string, unknown>[];

  // Nothing is filtered: the export ledger is the stored ledger, sequence-sorted.
  assert.equal(ledger.length, dataset.ledger.length);
  assert.deepEqual(
    ledger.map((event) => event.eventId),
    [...dataset.ledger].sort((a, b) => a.sequence - b.sequence).map((event) => event.eventId)
  );

  const answerEvents = ledger.filter(
    (event) => event.type === "decision_selected" || event.type === "decision_changed"
  );
  assert.ok(
    answerEvents.length > DECISION_IDS.length,
    "the fixture recorded no superseded answers, so this test would prove nothing"
  );

  // The specific population: answers keyed to a variant tuple the edit moved
  // off the active path. They score nothing and render nowhere, and they are
  // all still in the file.
  const answers = latestExactAnswers(dataset.ledger);
  const inactive = inactiveAnswers(activePath, answers);
  assert.ok(inactive.length > 0, "the fixture edit produced no inactive answers");
  const exportedIds = new Set(ledger.map((event) => event.eventId));
  for (const answer of inactive) {
    assert.ok(exportedIds.has(answer.eventId), `inactive answer ${answer.eventId} was dropped from the export`);
  }

  // And the superseded Case 1 answer itself.
  const c1d2Answers = answerEvents.filter((event) => event.decisionId === "C1D2");
  assert.equal(c1d2Answers.length, 2, "the replayed edit is not in the exported ledger");
  assert.equal(c1d2Answers[0].selectedOptionId, "A");
  assert.equal(c1d2Answers[1].selectedOptionId, "C");
});

/* -------------------------------------------------------------------------- */
/* 3. The receipt trail                                                       */
/* -------------------------------------------------------------------------- */

/**
 * ALL ELEVEN, IN EXPORT ORDER. `receipt-authoring-and-export.BEN_APPROVED.json`
 * sets `allDecisionReceipts: true`, `count: 11`, `order: "case_then_decision"`.
 *
 * The reveal's highlight list sorts by SHIP contribution and shows a subset;
 * the export is a TRAIL, and a trail is read in the order it happened. Sorting
 * the file by contribution would rank the learner's own decisions by a number
 * the file is not allowed to contain, and shipping only the highlighted ones
 * would let a profile edit the evidence it was derived from.
 */
test("all eleven receipts are exported, in case-then-decision order", () => {
  const { activePath, input } = completeRun();
  const json = readBackJson(input);
  const receipts = (json.current as Record<string, unknown>).receipts as Record<string, unknown>[];

  assert.equal(receipts.length, 11);
  assert.equal(receipts.length, DECISION_IDS.length);

  // `DECISION_IDS` is already case-then-decision order, so the trail is it.
  assert.deepEqual(receipts.map((receipt) => receipt.decisionId), [...DECISION_IDS]);
  const caseNumbers = receipts.map((receipt) => receipt.caseNumber as number);
  assert.deepEqual(caseNumbers, [...caseNumbers].sort((a, b) => a - b));
  assert.deepEqual([...new Set(caseNumbers)], [1, 2, 3, 4, 5]);

  // Every phrase is the stamped phrase for the choice actually made — no
  // substitution, no rewording, no blank.
  const chosen = new Map(
    activePath.decisions.map((decision) => [decision.decisionId, decision.selectedOptionId])
  );
  for (const receipt of receipts) {
    const decisionId = receipt.decisionId as DecisionId;
    const optionId = chosen.get(decisionId);
    assert.ok(optionId !== null && optionId !== undefined);
    assert.equal(receipt.optionId, optionId);
    assert.equal(receipt.phrase, RECEIPT_PHRASES[decisionId][optionId]);
    assert.deepEqual(Object.keys(receipt).sort(), ["caseNumber", "decisionId", "optionId", "phrase"]);
  }

  // The highlight view is a VIEW. It may show fewer; it may not show others,
  // and it may not change what the trail contains.
  const trail = allReceipts(activePath);
  const highlighted = highlightReceipts(activePath, 3);
  assert.equal(highlighted.length, 3);
  const trailKeys = new Set(trail.map((receipt) => `${receipt.decisionId}:${receipt.optionId}`));
  for (const receipt of highlighted) {
    assert.ok(trailKeys.has(`${receipt.decisionId}:${receipt.optionId}`));
  }
  // Whatever the highlight sort did, the export is untouched by it.
  assert.deepEqual(receipts.map((receipt) => receipt.decisionId), trail.map((receipt) => receipt.decisionId));
});

/* -------------------------------------------------------------------------- */
/* 4. Reflections, verbatim                                                   */
/* -------------------------------------------------------------------------- */

/**
 * *"Preserved exactly as you wrote them."* That sentence is on the reflection
 * surface, so it is a promise the learner has read — and Ben's import contract
 * accepts the five reflections as evidence Full may QUOTE EXACTLY. Trimming,
 * normalising or collapsing whitespace would falsify both at once, silently,
 * in a file the learner may hand to someone.
 */
test("all five reflections round-trip verbatim, whitespace and newlines included", () => {
  const { input } = completeRun();
  const json = readBackJson(input);
  const reflections = (json.current as Record<string, unknown>).reflections as Record<string, unknown>[];

  assert.equal(reflections.length, 5);
  assert.equal(reflections.length, REFLECTION_PLACEMENTS.length);

  // One per approved placement, in decision order.
  assert.deepEqual(
    reflections.map((reflection) => reflection.decisionId),
    REFLECTION_PLACEMENTS.map((placement) => placement.afterDecisionId)
  );
  assert.deepEqual(reflections.map((reflection) => reflection.caseNumber), [1, 2, 3, 4, 5]);

  // Character for character, through JSON and back.
  reflections.forEach((reflection, index) => {
    assert.equal(
      reflection.text,
      REFLECTION_TEXTS[index],
      `reflection ${index + 1} was altered on the JSON round trip`
    );
  });

  // And through the Markdown fence, which is the harder half: a reflection
  // containing three backticks would close an ordinary fence and spill the rest
  // of the document into prose, so the fence has to grow past the payload.
  const markdown = buildLiteExportMarkdown(input);
  assert.ok(markdown !== null);
  for (const text of REFLECTION_TEXTS) {
    assert.ok(
      markdown.includes(`\n${text}\n`),
      `a reflection did not survive the Markdown fence verbatim: ${JSON.stringify(text)}`
    );
  }
  // The backtick-bearing reflection specifically: the fence grew.
  assert.ok(markdown.includes("`````"), "the code fence did not grow past the learner's backticks");

  // The learner's words are never scored. Two runs whose only difference is the
  // reflection text produce the same SHIP result — asserted, not assumed.
  const bare = completeRunWithoutReflections();
  assert.deepEqual(bare.result.ship, completeRun().result.ship);
  assert.equal(buildLiteExportJson(bare.input)?.current.reflections.length, 0);
});

/** The same run with no reflections committed. Used to prove they never score. */
function completeRunWithoutReflections(): Fixture {
  let dataset = startLiteDataset({ ...VERSION_MANIFEST });
  dataset = answerAll(dataset, "A");
  const beforeEdit = resolveActivePath(STAMP, dataset.ledger);
  const c1d2 = beforeEdit.decisions.find((decision) => decision.decisionId === "C1D2");
  assert.ok(c1d2);
  dataset = appendEvent(dataset, {
    type: "decision_changed",
    caseNumber: 1,
    decisionId: "C1D2",
    variantId: c1d2.variant.id,
    selectedOptionId: "C"
  });
  dataset = answerAll(dataset, "B");
  dataset = { ...dataset, handle: "riverbend" };
  const activePath = resolveActivePath(STAMP, dataset.ledger);
  const result = resultFor(activePath);
  return {
    dataset,
    activePath,
    result,
    input: { dataset, activePath, result, exportedAtLocal: EXPORTED_AT }
  };
}

/* -------------------------------------------------------------------------- */
/* 5. The local mirror of Full's five import conditions                       */
/* -------------------------------------------------------------------------- */

/**
 * A validator that shares an implementation with the thing it validates proves
 * only that the code agrees with itself, so every case here hands
 * `validateLiteExport` a PARSED artifact — `unknown` to it, exactly as a
 * foreign reader would receive one.
 *
 * Again: this is a mirror. It shows our artifact satisfies the five conditions
 * as the supersession WRITES them. It cannot show Studio's importer agrees.
 */
test("validateLiteExport passes a good artifact on all five conditions", () => {
  const { input } = completeRun();
  const artifact = readBackJson(input);

  const validation = validateLiteExport(artifact);
  assert.deepEqual(validation.failures, []);
  assert.equal(validation.valid, true);
  assert.deepEqual([...validation.passed], [...LITE_IMPORT_CONDITION_IDS]);
  assert.equal(LITE_IMPORT_CONDITION_IDS.length, 5);
});

/**
 * FAIL CLOSED, ONE CONDITION AT A TIME.
 *
 * Each case breaks exactly one thing and asserts that exactly one condition
 * refuses it, because "the artifact was rejected" is not the property under
 * test — a validator that failed everything on every input would pass a
 * looser version of this test while telling an importer nothing. The other four
 * conditions must still be reported as PASSED, which is what makes the failure
 * diagnostic rather than merely negative.
 */
test("validateLiteExport fails closed on each of the five conditions individually", () => {
  const { input } = completeRun();
  const good = readBackJson(input);

  const breakages: readonly {
    condition: LiteImportConditionId;
    why: string;
    break: (artifact: Record<string, unknown>) => void;
  }[] = [
    {
      condition: "requireRecognizedLiteProduct",
      why: "an unrecognized product is refused, never best-guessed",
      break: (artifact) => {
        artifact.product = "developer-forward-full";
      }
    },
    {
      condition: "requireSupportedExportVersion",
      why: "a file from a schema this build cannot read is not read approximately",
      break: (artifact) => {
        artifact.schemaVersion = 99;
      }
    },
    {
      condition: "requireCase5Completion",
      why: "an unfinished run is not a partial result; it is not a result",
      break: (artifact) => {
        const current = artifact.current as Record<string, unknown>;
        (current.activePath as Record<string, unknown>).complete = false;
      }
    },
    {
      condition: "requireValidFixedChoiceState",
      why: "an option id outside the declared three did not come from Lite",
      break: (artifact) => {
        const current = artifact.current as Record<string, unknown>;
        const decisions = (current.activePath as Record<string, unknown>)
          .decisions as Record<string, unknown>[];
        decisions[4].selectedOptionId = "Z";
      }
    },
    {
      condition: "requireDeterministicProfileConsistency",
      why: "a profile body that is not the stamped body for its key has been edited",
      break: (artifact) => {
        const current = artifact.current as Record<string, unknown>;
        (current.profile as Record<string, unknown>).name = "Something Else Entirely";
      }
    }
  ];

  for (const breakage of breakages) {
    const artifact = clone(good);
    breakage.break(artifact);
    const validation = validateLiteExport(artifact);

    assert.equal(validation.valid, false, `${breakage.condition} was accepted: ${breakage.why}`);
    assert.ok(
      validation.failures.some((failure) => failure.condition === breakage.condition),
      `${breakage.condition} did not refuse its own breakage`
    );
    // Isolation: the other four still pass, so the report names the real fault.
    const expectedPassed = LITE_IMPORT_CONDITION_IDS.filter((id) => id !== breakage.condition);
    assert.deepEqual(
      [...validation.passed],
      [...expectedPassed],
      `breaking ${breakage.condition} also tripped an unrelated condition; the report would misdirect`
    );
    // Every failure carries a machine-readable detail key, never learner copy.
    for (const failure of validation.failures) {
      assert.ok(failure.detail.length > 0);
      assert.ok(!/\s/.test(failure.detail), `a failure detail is prose, not a key: ${failure.detail}`);
    }
  }

  // Fail-closed means a missing field FAILS its condition rather than skipping
  // it: nothing at all must fail all five, not pass by absence.
  for (const candidate of [null, undefined, "developer-forward-lite", 1, [], {}]) {
    const validation = validateLiteExport(candidate);
    assert.equal(validation.valid, false);
  }
  const empty = validateLiteExport(null);
  assert.deepEqual([...empty.passed], []);
  assert.equal(empty.failures.length, LITE_IMPORT_CONDITION_IDS.length);

  // The manifest's own export-schema string is checked as well as the
  // artifact's number: a file can carry a schema this build reads while being
  // stamped by a product version it does not.
  const staleManifest = clone(good);
  (staleManifest.versionManifest as Record<string, unknown>).exportSchemaVersion = "9.9.9";
  const staleValidation = validateLiteExport(staleManifest);
  assert.equal(staleValidation.valid, false);
  assert.ok(
    staleValidation.failures.some((failure) => failure.condition === "requireSupportedExportVersion")
  );
});

/* -------------------------------------------------------------------------- */
/* 6. Absence                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * *"If any active required decision is unanswered, the result and both exports
 * are ABSENT"*, and *"if an edit makes the active path incomplete, hide exports
 * until complete again."*
 *
 * ABSENT, not greyed out. Every builder returns `null` rather than a partial
 * document, because a partial export is a file a learner can send to someone,
 * and a disabled button is still a button. `null` is what makes the absence
 * unignorable to the caller: there is no half-document to render by accident.
 */
test("both exports are absent while the active path is incomplete", () => {
  // (a) A run that has not finished.
  let partial = startLiteDataset({ ...VERSION_MANIFEST });
  for (let i = 0; i < 4; i += 1) {
    const path = resolveActivePath(STAMP, partial.ledger);
    const open = path.decisions.find((decision) => decision.selectedOptionId === null);
    assert.ok(open);
    partial = appendEvent(partial, {
      type: "decision_selected",
      caseNumber: open.caseNumber,
      decisionId: open.decisionId,
      variantId: open.variant.id,
      selectedOptionId: "B"
    });
  }
  const partialPath = resolveActivePath(STAMP, partial.ledger);
  assert.equal(partialPath.complete, false);
  const partialInput: LiteExportInput = {
    dataset: partial,
    activePath: partialPath,
    result: null,
    exportedAtLocal: EXPORTED_AT
  };

  const availability = exportAvailability(partialPath, null);
  assert.equal(availability.available, false);
  assert.ok(availability.available === false && availability.reasons.length > 0);
  assert.ok(availability.available === false && availability.reasons.includes("case_five_not_reached"));
  assert.equal(isExportUnlocked(partialPath, null), false);

  assert.equal(buildLiteExportJson(partialInput), null);
  assert.equal(buildLiteExportJsonText(partialInput), null);
  assert.equal(buildLiteExportMarkdown(partialInput), null);
  assert.equal(buildLiteExportMarkdownParts(partialInput), null);

  // (b) A finished run whose result is missing. The gate is three independent
  // facts, and "no result" is one of them on its own.
  const { dataset, activePath } = completeRun();
  const resultless: LiteExportInput = {
    dataset,
    activePath,
    result: null,
    exportedAtLocal: EXPORTED_AT
  };
  const resultlessAvailability = exportAvailability(activePath, null);
  assert.equal(resultlessAvailability.available, false);
  assert.ok(
    resultlessAvailability.available === false &&
      resultlessAvailability.reasons.includes("no_result")
  );
  assert.equal(buildLiteExportJson(resultless), null);
  assert.equal(buildLiteExportMarkdown(resultless), null);

  // (c) THE EDIT CASE. A complete run, then one upstream answer changed: the
  // downstream world moves, its answers stop being found, and the exports go
  // away again until the learner re-answers. This is the sentence about hiding
  // exports after an edit, played out rather than asserted about.
  //
  //     Built from a fresh, never-edited run rather than from `completeRun()`:
  //     that fixture has already answered under two different worlds, so an
  //     upstream change there can land on a tuple it happens to hold an answer
  //     for — restoration would succeed, the path would stay complete, and the
  //     test would pass while asserting nothing. History has to be absent for
  //     the reopening to be observable.
  let finishedDataset = startLiteDataset({ ...VERSION_MANIFEST });
  finishedDataset = answerAll(finishedDataset, "A");
  const finishedPath = resolveActivePath(STAMP, finishedDataset.ledger);
  assert.equal(finishedPath.complete, true);
  const finishedResult = resultFor(finishedPath);
  const c1d1 = finishedPath.decisions.find((decision) => decision.decisionId === "C1D1");
  assert.ok(c1d1);
  assert.notEqual(c1d1.selectedOptionId, "C");
  const edited = appendEvent(finishedDataset, {
    type: "decision_changed",
    caseNumber: 1,
    decisionId: "C1D1",
    variantId: c1d1.variant.id,
    selectedOptionId: "C"
  });
  const editedPath = resolveActivePath(STAMP, edited.ledger);
  assert.equal(editedPath.complete, false, "the upstream edit did not reopen the path");
  assert.ok(editedPath.unanswered.length > 0);
  const editedInput: LiteExportInput = {
    dataset: edited,
    activePath: editedPath,
    result: finishedResult,
    exportedAtLocal: EXPORTED_AT
  };
  assert.equal(isExportUnlocked(editedPath, finishedResult), false);
  assert.equal(buildLiteExportJson(editedInput), null, "a stale result kept the export open after an edit");
  assert.equal(buildLiteExportMarkdown(editedInput), null);

  // The optional parts are optional, and only those two. A run with no handle
  // and no reflections still emits eleven required parts.
  assert.deepEqual([...OPTIONAL_MARKDOWN_PART_KEYS], ["localHandle", "reflections"]);
  let bare = startLiteDataset({ ...VERSION_MANIFEST });
  bare = answerAll(bare, "B");
  const barePath = resolveActivePath(STAMP, bare.ledger);
  const bareParts = buildLiteExportMarkdownParts({
    dataset: bare,
    activePath: barePath,
    result: resultFor(barePath),
    exportedAtLocal: EXPORTED_AT
  });
  assert.ok(bareParts !== null);
  assert.deepEqual(
    bareParts.map((part) => part.key),
    MARKDOWN_PART_KEYS.filter((key) => !OPTIONAL_MARKDOWN_PART_KEYS.includes(key))
  );
  assert.equal(bareParts.length, 11);
});
