import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";

import {
  CASE_NUMBERS,
  DECISION_IDS,
  DIMENSIONS,
  OPTION_IDS,
  POSTURES,
  caseOfDecision,
  type CaseNumber,
  type DecisionId,
  type Dimension,
  type OptionId
} from "@/lib/developer-forward/types";
import { SIGNALS, carriesDimension, signalsFor } from "@/content/developer-forward/signals";
import { CASE_AXES, fragmentText } from "@/content/developer-forward/variants";
import {
  SIGNAL_LOOKUP,
  resolveCaseVariant,
  variantIdString,
  type VariantAxisState
} from "@/lib/developer-forward/pointers";
import type { SignalledAnswer } from "@/lib/developer-forward/aggregation";

/**
 * Developer Forward Lite — the recovered signal map and the variant space it opens.
 *
 * Pure TypeScript. No component import, no `*.module.css` import, not even
 * transitively: `package.json` runs the suite as
 * `node --import tsx --test tests/*.test.ts` and Node cannot load a `.css`
 * specifier, so one stylesheet reached from here takes this whole file down
 * with `ERR_UNKNOWN_FILE_EXTENSION`. Everything below reaches `content/` and
 * `lib/` only — the same discipline `tests/wys-data.test.ts` works under.
 *
 * ## What this file is for
 *
 * The 138 fixed-answer signal tags are `recovered_prior_authoring` (layer 03,
 * `recovered/fixed-answer-signal-map.recovered.json`, approved by Ben on
 * 2026-09-07). They are evidence of what the prior instrument MEANT by each
 * option. They are not derivable from anything in this repo, they cannot be
 * re-derived if lost, and every downstream number the product publishes — the
 * six-dimension terminal state, the SHIP code, the 16 profiles, the receipts,
 * the world-state variants — is a function of them.
 *
 * So this file exists to make the tags UNEDITABLE IN PRACTICE. Not "covered by
 * tests": every plausible tidy-up of them fails here by name.
 *
 * ## The three edits this catches, in the order they are likely
 *
 *  1. **Deriving the level from the option's A/B/C position.** This is the
 *     dangerous one and section 2 is written for it alone. Nine of the 138 tags
 *     are non-monotonic — C2D1 runs DOWN on `promise` and `trust`, so "Tell
 *     them now" (option A) carries `trust:stewardship` (1.0) and "Resolve the
 *     uncertainty first" (option C) carries `trust:task` (0.0). A reducer
 *     rewritten to read `POSTURES[dimension][optionIndex]` looks like a
 *     simplification, reads correctly, produces a valid SHIP code for every
 *     learner, and is wrong on those nine tags with no visible symptom. Section
 *     2 pins all nine by name AND pins the count at exactly nine, so neither
 *     flattening them nor inventing a tenth passes.
 *  2. **Filling a gap to make a column look uniform.** `SignalMap` is
 *     `Partial<Record<Dimension, string>>` and the gaps are real authoring:
 *     absence is no evidence, never `0`, never imputed (layer 05
 *     `SC_TF2_TF3_RESOLUTION.md`, rule 4). C2D1 carries `ambiguity` on option B
 *     alone; `ownership` is absent from Cases 1-3 entirely. Section 1's exact
 *     match and section 3's coverage facts both fail on a filled gap.
 *  3. **Deleting an unreachable variant.** 55 combinations are authored and
 *     only 43 are reachable through the locked transition rules. The 12 that
 *     are not are valid composition-space content and must never be deleted —
 *     the same distinction the product already holds between 729 theoretical
 *     terminal states and 465 reachable ones. Section 4 asserts both halves:
 *     exactly 43 reachable, and all 12 unreachable still resolving to authored
 *     text.
 *
 * ## Why the expected tag table is transcribed here rather than read from disk
 *
 * `RECOVERED_TAGS` below is a second, independent copy of the recovered map,
 * and that duplication is the point: a test that read `SIGNALS` and checked
 * `SIGNALS` against itself would pass on any edit made to both sides at once.
 * The handoff bundle lives outside this repository and will not be present on
 * every machine that runs `npm test`, so it cannot be the only source. Section
 * 1 therefore asserts against the transcription always, and additionally
 * against the recovered JSON itself whenever that file is reachable — so the
 * transcription is checked against its own origin wherever the origin exists,
 * and the repo stays runnable where it does not.
 *
 * ## The numbers this file pins, and what moving one means
 *
 * 138 tags, 9 non-monotonic, 11/10/10/8/8/4 dimension carriage, 55 authored
 * variants, 43 reachable. None of these is a preference. Each is either
 * recovered authoring or a consequence of
 * `TF-LITE-AGGREGATION-DOMINANT-POSTURE-LATER-TIEBREAK-v1` and the layer 07
 * transition rules. If one of them moves, the governed content or the locked
 * policy moved with it, and that is a restamp under `VERSIONING.md` — not a
 * test to update.
 */

/* -------------------------------------------------------------------------- */
/* 0. The recovered map, transcribed                                          */
/* -------------------------------------------------------------------------- */

/**
 * The recovered source's own `dimension:posture` strings, decision by decision,
 * option by option, IN THE SOURCE'S OWN ORDER.
 *
 * Order is asserted, not just membership. `signalsFor()` returns tags in
 * insertion order and the receipts and result surfaces read that order, so a
 * reordered `SignalMap` is a reordered learner-facing list even though every
 * tag survives. Checking the flat `dimension:posture` string rather than a
 * parsed object also means a mistyped posture cannot be masked by a lenient
 * comparison.
 */
const RECOVERED_TAGS: Record<DecisionId, Record<OptionId, readonly string[]>> = {
  /* C1D1 — 11 tags */
  C1D1: {
    A: ["ambiguity:act", "promise:commit", "risk:move", "trust:task"],
    B: ["ambiguity:clarify", "promise:qualify", "trust:relationship"],
    C: ["ambiguity:investigate", "verification:sample", "risk:stage", "trust:stewardship"]
  },
  /* C1D2 — 12 tags */
  C1D2: {
    A: ["promise:commit", "risk:move", "trust:task"],
    B: ["ambiguity:clarify", "promise:qualify", "risk:stage", "trust:relationship"],
    C: [
      "ambiguity:investigate",
      "verification:prove",
      "promise:renegotiate",
      "risk:protect",
      "trust:stewardship"
    ]
  },
  /* C2D1 — 12 tags. Non-monotonic on promise and trust; preserved as recovered. */
  C2D1: {
    A: ["promise:qualify", "risk:stage", "trust:stewardship"],
    B: [
      "ambiguity:investigate",
      "verification:sample",
      "promise:qualify",
      "risk:stage",
      "trust:relationship"
    ],
    C: ["verification:prove", "promise:commit", "risk:protect", "trust:task"]
  },
  /* C2D2 — 14 tags */
  C2D2: {
    A: ["ambiguity:act", "promise:commit", "risk:move", "trust:task"],
    B: [
      "ambiguity:clarify",
      "verification:sample",
      "promise:qualify",
      "risk:stage",
      "trust:relationship"
    ],
    C: [
      "ambiguity:investigate",
      "verification:prove",
      "promise:renegotiate",
      "risk:protect",
      "trust:stewardship"
    ]
  },
  /* C3D1 — 12 tags */
  C3D1: {
    A: ["verification:trust", "promise:commit", "risk:move", "trust:task"],
    B: ["verification:sample", "promise:qualify", "risk:stage", "trust:relationship"],
    C: ["verification:prove", "promise:renegotiate", "risk:protect", "trust:stewardship"]
  },
  /* C3D2 — 11 tags */
  C3D2: {
    A: ["verification:trust", "risk:move", "trust:task"],
    B: ["ambiguity:investigate", "verification:sample", "risk:stage", "trust:relationship"],
    C: ["ambiguity:investigate", "verification:prove", "risk:protect", "trust:stewardship"]
  },
  /* C4D1 — 11 tags */
  C4D1: {
    A: ["risk:move", "ownership:transfer", "trust:task"],
    B: ["verification:sample", "risk:stage", "ownership:share", "trust:relationship"],
    C: ["verification:prove", "risk:protect", "ownership:retain", "trust:stewardship"]
  },
  /* C4D2 — 16 tags */
  C4D2: {
    A: [
      "verification:trust",
      "promise:commit",
      "risk:move",
      "ownership:transfer",
      "trust:task"
    ],
    B: [
      "verification:sample",
      "promise:qualify",
      "risk:stage",
      "ownership:share",
      "trust:relationship"
    ],
    C: [
      "ambiguity:investigate",
      "verification:prove",
      "promise:renegotiate",
      "risk:protect",
      "ownership:retain",
      "trust:stewardship"
    ]
  },
  /* C5D1 — 18 tags */
  C5D1: {
    A: [
      "ambiguity:act",
      "verification:trust",
      "promise:commit",
      "risk:move",
      "ownership:transfer",
      "trust:task"
    ],
    B: [
      "ambiguity:clarify",
      "verification:sample",
      "promise:qualify",
      "risk:stage",
      "ownership:share",
      "trust:relationship"
    ],
    C: [
      "ambiguity:investigate",
      "verification:prove",
      "promise:renegotiate",
      "risk:protect",
      "ownership:retain",
      "trust:stewardship"
    ]
  },
  /* C5D2 — 18 tags */
  C5D2: {
    A: [
      "ambiguity:act",
      "verification:trust",
      "promise:commit",
      "risk:move",
      "ownership:transfer",
      "trust:task"
    ],
    B: [
      "ambiguity:clarify",
      "verification:sample",
      "promise:qualify",
      "risk:stage",
      "ownership:share",
      "trust:relationship"
    ],
    C: [
      "ambiguity:investigate",
      "verification:prove",
      "promise:renegotiate",
      "risk:protect",
      "ownership:retain",
      "trust:stewardship"
    ]
  },
  /* C5D3 — 3 tags. Trust and nothing else, for the whole decision. */
  C5D3: {
    A: ["trust:task"],
    B: ["trust:relationship"],
    C: ["trust:stewardship"]
  }
};

/** The total the recovered source, its own header and `signals.ts` all state. */
const TOTAL_RECOVERED_TAGS = 138;

/** Per-decision totals, from the recovered source. Pinned so a lost tag names itself. */
const TAGS_PER_DECISION: Record<DecisionId, number> = {
  C1D1: 11,
  C1D2: 12,
  C2D1: 12,
  C2D2: 14,
  C3D1: 12,
  C3D2: 11,
  C4D1: 11,
  C4D2: 16,
  C5D1: 18,
  C5D2: 18,
  C5D3: 3
};

/**
 * The handoff bundle, if this machine has it.
 *
 * Absolute and outside the repository on purpose: the recovered JSON is
 * evidence, not source, and it is not vendored in. `content/source-refs.ts`
 * already carries a governing spec by absolute path for the same reason. When
 * the path is absent the transcription above still carries the whole assertion.
 */
const RECOVERED_JSON_PATH =
  "/Users/benchan/yy/bct-facelift/TRUST_FORWARD_LITE_CODEX_FINAL_LITE_GATES_RESOLVED_2026-09-07/" +
  "03_codex-completion-handoff-2026-09-07/recovered/fixed-answer-signal-map.recovered.json";

/** The flat `dimension:posture` strings `SIGNALS` holds for one option, in order. */
function shippedTags(decisionId: DecisionId, optionId: OptionId): string[] {
  return signalsFor(decisionId, optionId).map(
    (signal) => `${signal.dimension}:${signal.posture}`
  );
}

/* -------------------------------------------------------------------------- */
/* 1. All 138 tags, exactly, and every posture inside its own vocabulary       */
/* -------------------------------------------------------------------------- */

test("SIGNALS is the recovered map exactly: 138 tags, none added, none dropped", () => {
  let total = 0;

  for (const decisionId of DECISION_IDS) {
    let perDecision = 0;

    for (const optionId of OPTION_IDS) {
      const expected = RECOVERED_TAGS[decisionId][optionId];
      const actual = shippedTags(decisionId, optionId);

      // Deep-equal on the ordered flat strings: this fails on an added tag, a
      // dropped tag, a changed posture AND a reordering, each of which is a
      // different way to lose recovered authoring.
      assert.deepEqual(
        actual,
        [...expected],
        `SIGNALS.${decisionId}.${optionId} does not match the recovered signal map.`
      );

      perDecision += actual.length;
      total += actual.length;
    }

    assert.equal(
      perDecision,
      TAGS_PER_DECISION[decisionId],
      `${decisionId} carries ${perDecision} tags; the recovered source carries ${TAGS_PER_DECISION[decisionId]}.`
    );
  }

  assert.equal(
    total,
    TOTAL_RECOVERED_TAGS,
    `The signal map carries ${total} tags; the recovered source carries ${TOTAL_RECOVERED_TAGS}.`
  );
});

test("SIGNALS declares no decision, option or dimension the contract does not", () => {
  assert.deepEqual(Object.keys(SIGNALS), [...DECISION_IDS]);

  for (const decisionId of DECISION_IDS) {
    assert.deepEqual(
      Object.keys(SIGNALS[decisionId]),
      [...OPTION_IDS],
      `${decisionId} does not declare exactly the three authored options.`
    );

    for (const optionId of OPTION_IDS) {
      for (const key of Object.keys(SIGNALS[decisionId][optionId])) {
        assert.ok(
          (DIMENSIONS as readonly string[]).includes(key),
          `${decisionId}/${optionId} tags "${key}", which is not one of the six dimensions.`
        );
      }
    }
  }
});

test("every posture belongs to its own dimension's declared triple", () => {
  for (const decisionId of DECISION_IDS) {
    for (const optionId of OPTION_IDS) {
      for (const { dimension, posture } of signalsFor(decisionId, optionId)) {
        const vocabulary = POSTURES[dimension] as readonly string[];

        // A posture borrowed from another dimension is the failure this catches:
        // `verification` and `trust` both own a posture spelled "trust", and
        // `risk:move` next to `ambiguity:act` is easy to transpose by hand.
        assert.ok(
          vocabulary.includes(posture),
          `${decisionId}/${optionId} tags ${dimension}:${posture}, but "${dimension}" declares ` +
            `only [${vocabulary.join(", ")}].`
        );
      }
    }
  }
});

test("the transcription above matches the recovered JSON where the handoff is present", (t) => {
  if (!existsSync(RECOVERED_JSON_PATH)) {
    // Not a silent pass: the transcription is still fully asserted by the tests
    // above. This one only re-checks it against its origin.
    t.skip("The 2026-09-07 handoff bundle is not present on this machine.");
    return;
  }

  const recovered = JSON.parse(readFileSync(RECOVERED_JSON_PATH, "utf8")) as {
    decisions: Record<string, Record<string, { signals: string[] }>>;
  };

  assert.deepEqual(
    Object.keys(recovered.decisions).sort(),
    [...DECISION_IDS].sort(),
    "The recovered source names a different set of decisions than the shared contract."
  );

  for (const decisionId of DECISION_IDS) {
    for (const optionId of OPTION_IDS) {
      assert.deepEqual(
        [...RECOVERED_TAGS[decisionId][optionId]],
        recovered.decisions[decisionId][optionId].signals,
        `The transcription of ${decisionId}/${optionId} has drifted from the recovered JSON.`
      );
    }
  }
});

/* -------------------------------------------------------------------------- */
/* 2. The non-monotonic guard                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Every tag whose posture index is NOT the option's A/B/C position.
 *
 * Nine, and the list is exhaustive. Each entry is `decision/option
 * dimension:posture`, with the posture index the authored vocabulary gives it
 * and the position the option holds. Read the two numbers together: C2D1/A
 * `trust:stewardship` sits at vocabulary index 2 (ternary 1.0) while its option
 * sits at position 0, which is the inversion in one line.
 *
 * These nine are the entire reason `postureValue()` exists and the entire
 * reason `resolveAxisFragment` indexes `fragmentIds` by a resolved ternary
 * value instead of by an option index. A refactor that "tidies" the reducer to
 * derive levels from option position passes casual review, produces plausible
 * output for every learner, and is wrong here and nowhere else visible.
 */
const NON_MONOTONIC_TAGS: readonly {
  decisionId: DecisionId;
  optionId: OptionId;
  dimension: Dimension;
  posture: string;
  postureIndex: number;
  optionIndex: number;
}[] = [
  /* C1D1/C — the option is third, but two of its tags sit at the middle level. */
  {
    decisionId: "C1D1",
    optionId: "C",
    dimension: "verification",
    posture: "sample",
    postureIndex: 1,
    optionIndex: 2
  },
  {
    decisionId: "C1D1",
    optionId: "C",
    dimension: "risk",
    posture: "stage",
    postureIndex: 1,
    optionIndex: 2
  },

  /* C2D1 — the deliberate inversion. Six tags, running DOWN the options. */
  {
    decisionId: "C2D1",
    optionId: "A",
    dimension: "promise",
    posture: "qualify",
    postureIndex: 1,
    optionIndex: 0
  },
  {
    decisionId: "C2D1",
    optionId: "A",
    dimension: "risk",
    posture: "stage",
    postureIndex: 1,
    optionIndex: 0
  },
  {
    decisionId: "C2D1",
    optionId: "A",
    dimension: "trust",
    posture: "stewardship",
    postureIndex: 2,
    optionIndex: 0
  },
  {
    decisionId: "C2D1",
    optionId: "B",
    dimension: "ambiguity",
    posture: "investigate",
    postureIndex: 2,
    optionIndex: 1
  },
  {
    decisionId: "C2D1",
    optionId: "C",
    dimension: "promise",
    posture: "commit",
    postureIndex: 0,
    optionIndex: 2
  },
  {
    decisionId: "C2D1",
    optionId: "C",
    dimension: "trust",
    posture: "task",
    postureIndex: 0,
    optionIndex: 2
  },

  /* C3D2/B — the middle option carries the highest ambiguity posture. */
  {
    decisionId: "C3D2",
    optionId: "B",
    dimension: "ambiguity",
    posture: "investigate",
    postureIndex: 2,
    optionIndex: 1
  }
];

/** Every tag in `SIGNALS` whose posture index differs from its option's position. */
function observedNonMonotonicTags(): string[] {
  const found: string[] = [];
  for (const decisionId of DECISION_IDS) {
    for (const optionId of OPTION_IDS) {
      const optionIndex = OPTION_IDS.indexOf(optionId);
      for (const { dimension, posture } of signalsFor(decisionId, optionId)) {
        const postureIndex = (POSTURES[dimension] as readonly string[]).indexOf(posture);
        if (postureIndex !== optionIndex) {
          found.push(`${decisionId}/${optionId} ${dimension}:${posture}`);
        }
      }
    }
  }
  return found;
}

test("all nine non-monotonic tags are still there, exactly as recovered", () => {
  for (const tag of NON_MONOTONIC_TAGS) {
    const actual = SIGNALS[tag.decisionId][tag.optionId][tag.dimension];
    assert.equal(
      actual,
      tag.posture,
      `${tag.decisionId}/${tag.optionId} must carry ${tag.dimension}:${tag.posture}; it carries ` +
        `${tag.dimension}:${String(actual)}.`
    );

    assert.equal(
      (POSTURES[tag.dimension] as readonly string[]).indexOf(tag.posture),
      tag.postureIndex,
      `The authored vocabulary order of "${tag.dimension}" moved under ${tag.posture}.`
    );

    // The point of the whole section, stated once per tag: the level this tag
    // carries is NOT the level its option's position would imply.
    assert.notEqual(
      tag.postureIndex,
      tag.optionIndex,
      `${tag.decisionId}/${tag.optionId} ${tag.dimension}:${tag.posture} is listed as ` +
        "non-monotonic but its posture index now equals its option position."
    );
  }
});

test("the non-monotonic tags number exactly nine — no tenth, no flattening", () => {
  const observed = observedNonMonotonicTags();
  const expected = NON_MONOTONIC_TAGS.map(
    (tag) => `${tag.decisionId}/${tag.optionId} ${tag.dimension}:${tag.posture}`
  );

  // Set equality, reported as sorted lists so a failure names the exact tag that
  // was flattened (missing from `observed`) or invented (missing from `expected`).
  assert.deepEqual(
    [...observed].sort(),
    [...expected].sort(),
    "The set of non-monotonic tags has changed. Recovered authoring is not a style choice."
  );

  assert.equal(
    observed.length,
    9,
    `${observed.length} tags are non-monotonic; the recovered map carries exactly 9.`
  );
});

test("C2D1 inverts on trust: option A is stewardship and option C is task", () => {
  // The single clearest statement of the inversion, kept as its own test so the
  // failure message says what broke rather than which array index differed.
  assert.equal(SIGNALS.C2D1.A.trust, "stewardship");
  assert.equal(SIGNALS.C2D1.B.trust, "relationship");
  assert.equal(SIGNALS.C2D1.C.trust, "task");

  assert.equal(SIGNALS.C2D1.A.promise, "qualify");
  assert.equal(SIGNALS.C2D1.C.promise, "commit");
});

/* -------------------------------------------------------------------------- */
/* 3. Coverage facts                                                          */
/* -------------------------------------------------------------------------- */

/** Decisions carrying at least one tag for this dimension, in experience order. */
function decisionsCarrying(dimension: Dimension): DecisionId[] {
  return DECISION_IDS.filter((decisionId) =>
    OPTION_IDS.some((optionId) => carriesDimension(decisionId, optionId, dimension))
  );
}

/** Decisions carrying this dimension on ALL THREE options. */
function decisionsCarryingOnEveryOption(dimension: Dimension): DecisionId[] {
  return DECISION_IDS.filter((decisionId) =>
    OPTION_IDS.every((optionId) => carriesDimension(decisionId, optionId, dimension))
  );
}

test("trust is the one dimension carried by all eleven decisions", () => {
  assert.deepEqual(
    decisionsCarrying("trust"),
    [...DECISION_IDS],
    "Every decision must carry trust evidence; it is the only dimension that spans the run."
  );

  // C5D3 is trust and nothing else — three tags for the whole decision.
  assert.deepEqual(Object.keys(SIGNALS.C5D3.A), ["trust"]);
  assert.deepEqual(Object.keys(SIGNALS.C5D3.B), ["trust"]);
  assert.deepEqual(Object.keys(SIGNALS.C5D3.C), ["trust"]);
});

test("ownership is carried by exactly four decisions and is absent from Cases 1-3", () => {
  const carrying = decisionsCarrying("ownership");

  assert.deepEqual(
    carrying,
    ["C4D1", "C4D2", "C5D1", "C5D2"],
    "Ownership evidence must appear on exactly these four decisions."
  );

  // Stated the second way round, because this absence is load-bearing: it is
  // why Case 4's ownership axis reaches the approved OWN_SHARE neutral on every
  // path, and therefore why Case 4 reaches 3 of its 9 authored combinations.
  for (const decisionId of DECISION_IDS) {
    if (caseOfDecision(decisionId) <= 3) {
      assert.ok(
        !carrying.includes(decisionId),
        `${decisionId} carries ownership evidence; no decision before Case 4 may.`
      );
    }
  }
});

test("ambiguity is carried by eight decisions, only four of them on all three options", () => {
  assert.deepEqual(decisionsCarrying("ambiguity"), [
    "C1D1",
    "C1D2",
    "C2D1",
    "C2D2",
    "C3D2",
    "C4D2",
    "C5D1",
    "C5D2"
  ]);

  assert.equal(decisionsCarrying("ambiguity").length, 8);

  // The other four carry it on a subset of options, and those gaps are evidence
  // of nothing — never a low reading, never filled to square the column.
  assert.deepEqual(decisionsCarryingOnEveryOption("ambiguity"), [
    "C1D1",
    "C2D2",
    "C5D1",
    "C5D2"
  ]);
  assert.equal(decisionsCarryingOnEveryOption("ambiguity").length, 4);
});

test("C2D1 carries ambiguity on option B alone", () => {
  assert.equal(carriesDimension("C2D1", "A", "ambiguity"), false);
  assert.equal(SIGNALS.C2D1.B.ambiguity, "investigate");
  assert.equal(carriesDimension("C2D1", "C", "ambiguity"), false);
});

test("the remaining dimension carriage is as recovered", () => {
  // Pinned so that a gap filled anywhere in the map fails with a dimension name
  // rather than only as a shifted total.
  assert.equal(decisionsCarrying("verification").length, 10);
  assert.equal(decisionsCarrying("risk").length, 10);
  assert.equal(decisionsCarrying("promise").length, 8);
});

/* -------------------------------------------------------------------------- */
/* 4. Variant reachability                                                    */
/* -------------------------------------------------------------------------- */

/**
 * The authored combination space: the cross product of each case's axes.
 *
 * 1 + 9 + 9 + 9 + 27 = 55, which is the composition spec's own number. This is
 * COMPOSITION SPACE, not reachable space, and the two must never be conflated —
 * conflating them is precisely how the 12 unreachable combinations would get
 * deleted as dead content.
 */
function authoredCombinations(caseNumber: CaseNumber): VariantAxisState[][] {
  const axes = CASE_AXES[caseNumber] as readonly {
    axis: VariantAxisState["axis"];
    fragmentIds: readonly string[];
  }[];

  return axes.reduce<VariantAxisState[][]>(
    (combinations, axis) =>
      combinations.flatMap((combination) =>
        axis.fragmentIds.map((fragmentId) => [...combination, { axis: axis.axis, fragmentId }])
      ),
    [[]]
  );
}

/** Every A/B/C sequence of a given length, in lexical order. */
function optionSequences(length: number): string[] {
  let sequences = [""];
  for (let i = 0; i < length; i += 1) {
    sequences = sequences.flatMap((sequence) => OPTION_IDS.map((option) => sequence + option));
  }
  return sequences;
}

/** The decisions that precede a case, in experience order. */
function decisionsBefore(caseNumber: CaseNumber): DecisionId[] {
  return DECISION_IDS.filter((decisionId) => caseOfDecision(decisionId) < caseNumber);
}

/** One A/B/C sequence as the answers the resolver consumes. */
function answersFrom(decisions: readonly DecisionId[], sequence: string): SignalledAnswer[] {
  return decisions.map((decisionId, index) => {
    const selectedOptionId = sequence[index] as OptionId;
    return {
      decisionId,
      selectedOptionId,
      signals: SIGNAL_LOOKUP(decisionId, selectedOptionId) ?? {}
    };
  });
}

/**
 * Every variant id one case actually reaches, mapped to the prefixes that reach
 * it.
 *
 * Exhaustive over the prefix, not sampled: Case 5 has eight upstream decisions,
 * so 3^8 = 6,561 sequences, and the whole enumeration across all five cases is
 * 1 + 9 + 81 + 729 + 6,561 = 7,381 resolutions. Cheap enough to run on every
 * `npm test`, which is the only way this number stays true.
 */
function reachedVariants(caseNumber: CaseNumber): Map<string, string[]> {
  const decisions = decisionsBefore(caseNumber);
  const reached = new Map<string, string[]>();

  for (const sequence of optionSequences(decisions.length)) {
    const variant = resolveCaseVariant(caseNumber, answersFrom(decisions, sequence));
    const prefixes = reached.get(variant.id);
    if (prefixes) {
      prefixes.push(sequence);
    } else {
      reached.set(variant.id, [sequence]);
    }
  }

  return reached;
}

/** Reachable variants per case, as the transition rules produce them. */
const REACHABLE_PER_CASE: Record<CaseNumber, number> = { 1: 1, 2: 5, 3: 7, 4: 3, 5: 27 };

/** 55 authored, 43 reachable, 12 dead-but-present. */
const AUTHORED_PER_CASE: Record<CaseNumber, number> = { 1: 1, 2: 9, 3: 9, 4: 9, 5: 27 };

/**
 * The 12 unreachable combinations, by id.
 *
 * Listed rather than merely counted so that a change swapping one dead
 * combination for another — which keeps the count at 12 and is a different
 * instrument — cannot pass. Case 2's four are the correlation between its two
 * axes; Case 3's two are the pair the Q-D neutral cannot reach; Case 4's six
 * are every combination whose ownership is not the pinned `OWN_SHARE`.
 */
const UNREACHABLE_VARIANT_IDS: readonly string[] = [
  "c2:ambiguity=AMB_UNRESOLVED|reliance=RELIANCE_CONDITIONAL",
  "c2:ambiguity=AMB_UNRESOLVED|reliance=RELIANCE_HIGH",
  "c2:ambiguity=AMB_PARTIAL|reliance=RELIANCE_HIGH",
  "c2:ambiguity=AMB_BOUNDED|reliance=RELIANCE_CONDITIONAL",
  "c3:verification=VERIFY_TRUST|risk=RISK_PROTECT",
  "c3:verification=VERIFY_SAMPLE|risk=RISK_PROTECT",
  "c4:ownership=OWN_TRANSFER|trust=TRUST_TASK",
  "c4:ownership=OWN_TRANSFER|trust=TRUST_RELATIONSHIP",
  "c4:ownership=OWN_TRANSFER|trust=TRUST_STEWARDSHIP",
  "c4:ownership=OWN_RETAIN|trust=TRUST_TASK",
  "c4:ownership=OWN_RETAIN|trust=TRUST_RELATIONSHIP",
  "c4:ownership=OWN_RETAIN|trust=TRUST_STEWARDSHIP"
];

test("55 combinations are authored: 1 + 9 + 9 + 9 + 27", () => {
  let total = 0;
  for (const caseNumber of CASE_NUMBERS) {
    const authored = authoredCombinations(caseNumber);
    assert.equal(
      authored.length,
      AUTHORED_PER_CASE[caseNumber],
      `Case ${caseNumber} authors ${authored.length} combinations, not ${AUTHORED_PER_CASE[caseNumber]}.`
    );
    total += authored.length;
  }
  assert.equal(total, 55);
});

test("exactly 43 of the 55 authored variants are reachable: 1, 5, 7, 3, 27", () => {
  let total = 0;

  for (const caseNumber of CASE_NUMBERS) {
    const reached = reachedVariants(caseNumber);
    const authored = new Set(
      authoredCombinations(caseNumber).map((axes) => variantIdString(caseNumber, axes))
    );

    assert.equal(
      reached.size,
      REACHABLE_PER_CASE[caseNumber],
      `Case ${caseNumber} reaches ${reached.size} variants, not ${REACHABLE_PER_CASE[caseNumber]}. ` +
        "If the transition rules moved, this is a restamp, not a test update."
    );

    // Nothing may be reachable that was never authored: a resolver that composed
    // an id outside the authored space would be rendering an unwritten world.
    for (const id of reached.keys()) {
      assert.ok(
        authored.has(id),
        `Case ${caseNumber} reaches "${id}", which is not an authored combination.`
      );
    }

    total += reached.size;
  }

  assert.equal(
    total,
    43,
    `${total} of 55 authored variants are reachable; the locked rules reach 43.`
  );
});

test("the 12 unreachable combinations are still authored content and were not deleted", () => {
  const unreachable: string[] = [];

  for (const caseNumber of CASE_NUMBERS) {
    const reached = reachedVariants(caseNumber);

    for (const axes of authoredCombinations(caseNumber)) {
      const id = variantIdString(caseNumber, axes);
      if (reached.has(id)) continue;

      unreachable.push(id);

      // PRESENT, not merely absent from the reachable set. `fragmentText` throws
      // on an unknown id, so this is the assertion that the sentences behind a
      // dead combination still exist — the whole point of keeping them.
      for (const axis of axes) {
        const text = fragmentText(caseNumber, axis.fragmentId);
        assert.equal(
          typeof text,
          "string",
          `Case ${caseNumber} fragment "${axis.fragmentId}" no longer resolves to authored text.`
        );
        assert.ok(
          text.length > 0,
          `Case ${caseNumber} fragment "${axis.fragmentId}" resolves to an empty scenario line.`
        );
      }
    }
  }

  assert.deepEqual(
    [...unreachable].sort(),
    [...UNREACHABLE_VARIANT_IDS].sort(),
    "The set of unreachable combinations has changed. Dead under the locked rules is not wrong; " +
      "these are valid composition-space content and must never be deleted."
  );
  assert.equal(unreachable.length, 12);
});

/* -------------------------------------------------------------------------- */
/* 4b. The two variants that exist only because of the Q-D neutral            */
/* -------------------------------------------------------------------------- */

/**
 * The two Case 3 variants no accumulated evidence reaches.
 *
 * Layer 08's `LAYER08_RULINGS.md` records 41/55 with Case 3 at 5/9. That count
 * was taken before the same layer's gate Q-D neutral — Case 3 `verification` ->
 * `VERIFY_TRUST` on genuine absence — was added back in. These are the two
 * combinations that neutral creates, and they are the difference between 41 and
 * the 43 launch verification renders.
 *
 * They are also the newest and least-exercised paths in the instrument, which
 * is why they are asserted by prefix and not only by count.
 */
const Q_D_CREATED_VARIANT_IDS: readonly string[] = [
  "c3:verification=VERIFY_TRUST|risk=RISK_MOVE",
  "c3:verification=VERIFY_TRUST|risk=RISK_STAGE"
];

/**
 * The only four upstream prefixes that leave `verification` unevidenced.
 *
 * In C1D1,C1D2,C2D1,C2D2 order. Every other one of the 81 prefixes carries at
 * least one verification tag and resolves its Case 3 verification axis from
 * evidence; these four reach the neutral. Pinned by name because a single tag
 * added anywhere upstream would empty this set and silently retire the neutral.
 */
const Q_D_FALLBACK_PREFIXES: readonly string[] = ["AAAA", "ABAA", "BAAA", "BBAA"];

test("the two Q-D-created Case 3 variants are among the reachable 43", () => {
  const reached = reachedVariants(3);

  for (const id of Q_D_CREATED_VARIANT_IDS) {
    assert.ok(
      reached.has(id),
      `"${id}" is no longer reachable. It exists only through the gate Q-D verification neutral; ` +
        "losing it takes the reachable count from 43 back to 41."
    );
  }

  // And they are genuinely authored world conditions, not composed ids.
  assert.ok(fragmentText(3, "VERIFY_TRUST").length > 0);
  assert.ok(fragmentText(3, "RISK_MOVE").length > 0);
  assert.ok(fragmentText(3, "RISK_STAGE").length > 0);
});

test("exactly four upstream prefixes trigger the Q-D verification neutral", () => {
  const reached = reachedVariants(3);

  const viaNeutral = Q_D_CREATED_VARIANT_IDS.flatMap((id) => reached.get(id) ?? []);

  assert.deepEqual(
    [...viaNeutral].sort(),
    [...Q_D_FALLBACK_PREFIXES].sort(),
    "The prefixes that reach the Case 3 verification neutral have changed, which means an upstream " +
      "verification tag was added or removed."
  );

  // Stated independently of the resolver: these four prefixes, and only these,
  // carry no verification tag at all through C2D2. If this and the assertion
  // above ever disagree, the resolver is imputing rather than falling back.
  const upstream = decisionsBefore(3);
  const unevidenced = optionSequences(upstream.length).filter(
    (sequence) =>
      !answersFrom(upstream, sequence).some((answer) => answer.signals.verification !== undefined)
  );

  assert.deepEqual([...unevidenced].sort(), [...Q_D_FALLBACK_PREFIXES].sort());
  assert.equal(unevidenced.length, 4);
});
