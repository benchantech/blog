import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  DECISION_IDS,
  DIMENSIONS,
  OPTION_IDS,
  POSTURES,
  TERNARY_STATES,
  postureValue,
  type Dimension,
  type DimensionState,
  type OptionId,
  type ShipAxis,
  type TernaryState
} from "@/lib/trust-forward/types";
import {
  SHIP_WEIGHTS,
  axisBit,
  axisLean,
  barPercent,
  calculateShip,
  displayPercent
} from "@/lib/trust-forward/scoring";
import {
  AGGREGATION_POLICY_ID,
  resolveDimensionState,
  type SignalledAnswer
} from "@/lib/trust-forward/aggregation";
import {
  TERMINAL_STATE_COUNT,
  composeNarrative,
  enumerateDimensionStates,
  narrativeClausesFor
} from "@/lib/trust-forward/narrative";
import { SHIP_PROFILE_KEYS, profileForKey } from "@/lib/trust-forward/profiles";
import { SIGNALS } from "@/content/trust-forward/signals";
import {
  NARRATIVE_CLAUSES,
  NARRATIVE_CLAUSE_SEPARATOR,
  NARRATIVE_PREFIX,
  NARRATIVE_SUFFIX
} from "@/content/trust-forward/narrative";
import { SHIP_PROFILES } from "@/content/trust-forward/profiles";

/**
 * Trust Forward Lite — the deterministic core, checked against the shipped
 * fixtures rather than against itself.
 *
 * WHY THIS FILE EXISTS IN THIS SHAPE. Every other kind of check available here
 * — a snapshot, a spot value, a hand-written expectation — would be this
 * codebase testing its own arithmetic against a transcription of its own
 * arithmetic. The four things below are the only claims Trust Forward Lite
 * makes that a learner cannot verify and that a plausible-looking refactor can
 * break without any visible symptom, so each is asserted against the approved
 * handoff's own data files, exhaustively, with zero tolerated mismatches:
 *
 *  1. ALL 729 terminal states reproduce their `ship_code` and all four `*_pct`
 *     from `01_.../data/ship_729_states.csv`, and the 16 per-code counts match
 *     `ship_16_profiles.csv`'s `count_729` column.
 *  2. The threshold is STRICTLY `> 0.5`. `TEST_PLAN.md` pins 49.9 -> 0,
 *     50.0 -> 0, 50.1 -> 1, 100 -> 1, and the boundary is populated: 85 of the
 *     729 rows sit on exactly 50.0 on at least one axis, so `>=` is not a
 *     tidier spelling of the same rule — it is a different product.
 *  3. The composed narrative equals the RECOVERED `deterministic_narrative`
 *     for all 729 rows, byte for byte. This is what turns "uses the recovered
 *     narratives, does not regenerate them" (Ben, layer 07) from a claim in a
 *     header comment into a fact a test holds down.
 *  4. All `3^11 = 177,147` complete answer sequences run through the locked
 *     dominant-posture reducer reach 16/16 SHIP codes and 465 distinct
 *     terminal states — and the REJECTED mean-and-snap rule reaches only
 *     11/16. Layer 05 rejected that rule on exactly this number, and the whole
 *     point of enumerating it here is that a future "simplification" back to
 *     averaging fails loudly instead of silently making five public profiles
 *     unreachable by any learner.
 *
 * Plus the standing promise from `TEST_PLAN.md` §Determinism — reflections and
 * the handle never affect the result — asserted structurally rather than
 * observationally: text is fed through every entry point and the outputs are
 * diffed.
 *
 * NO COMPONENT IMPORT, NO `.css` REACHED. The suite runs as
 * `node --import tsx --test tests/*.test.ts`; a module that reaches a `.css`
 * specifier takes this whole file down with `ERR_UNKNOWN_FILE_EXTENSION`.
 * Everything imported above is pure TypeScript by construction, which is the
 * reason `lib/trust-forward/*` and `content/trust-forward/*` are shaped the way
 * they are.
 *
 * THE FIXTURES LIVE OUTSIDE THE REPO. They are the approved handoff, which is
 * not vendored here, so this file resolves them next to the repo (or from
 * `TRUST_FORWARD_HANDOFF_DIR`) and FAILS — never skips — when they are absent.
 * A skip would leave four green checks standing over nothing verified, which is
 * the precise failure mode Phase 12 of this repo was written to end.
 */

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** The approved handoff root. Overridable, because it is not vendored. */
const HANDOFF_DIR =
  process.env.TRUST_FORWARD_HANDOFF_DIR ??
  path.resolve(
    repoRoot,
    "..",
    "bct-facelift",
    "TRUST_FORWARD_LITE_CODEX_FINAL_LITE_GATES_RESOLVED_2026-09-07"
  );

const SHIP_729_STATES_CSV = path.join(
  HANDOFF_DIR,
  "01_trust-forward-lite-codex-package",
  "data",
  "ship_729_states.csv"
);

const SHIP_16_PROFILES_CSV = path.join(
  HANDOFF_DIR,
  "01_trust-forward-lite-codex-package",
  "data",
  "ship_16_profiles.csv"
);

const RECOVERED_729_NARRATIVES_CSV = path.join(
  HANDOFF_DIR,
  "04_reviewed-implementation-plan-2026-09-07",
  "recovered",
  "trust_forward_lite_729_profiles_SHIP_recalculated.csv"
);

/**
 * Reads a fixture, or fails naming the file and the override.
 *
 * Deliberately not `test.skip`. These four assertions are the only evidence
 * that the deterministic core matches the approved data, and a suite that goes
 * green because it could not find the evidence is worse than one that goes red.
 */
function readFixture(file: string): string {
  if (!existsSync(file)) {
    assert.fail(
      `Trust Forward fixture missing: ${file}\n` +
        "The approved handoff is not vendored into this repo. Point " +
        "TRUST_FORWARD_HANDOFF_DIR at TRUST_FORWARD_LITE_CODEX_FINAL_LITE_GATES_RESOLVED_2026-09-07."
    );
  }
  return readFileSync(file, "utf8");
}

/**
 * A minimal RFC-4180 reader: quoted fields, doubled quotes, CRLF.
 *
 * Hand-rolled rather than split on commas because the recovered narrative CSV
 * carries prose with commas inside quotes, and rather than pulled from a
 * dependency because this suite has none and a byte-exact test may not depend
 * on a parser's idea of what a byte is.
 */
function parseCsv(text: string): readonly Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (quoted) {
      if (char !== '"') {
        field += char;
      } else if (text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else {
        quoted = false;
      }
      continue;
    }

    if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const header = rows[0];
  return rows.slice(1).map((cells) =>
    Object.fromEntries(header.map((name, index) => [name, cells[index] ?? ""]))
  );
}

const SHIP_AXIS_KEYS: readonly ShipAxis[] = ["S", "H", "I", "P"];

/** The six-dimension state a fixture row describes, from its six numeric columns. */
function stateFromNumericColumns(row: Record<string, string>): DimensionState {
  const state = {} as DimensionState;
  for (const dimension of DIMENSIONS) {
    const value = Number(row[dimension]);
    assert.ok(
      (TERNARY_STATES as readonly number[]).includes(value),
      `"${row[dimension]}" is not a ternary state.`
    );
    state[dimension] = value as TernaryState;
  }
  return state;
}

/** The six-dimension state a fixture row describes, from its six POSTURE columns. */
function stateFromPostureColumns(row: Record<string, string>): DimensionState {
  const state = {} as DimensionState;
  for (const dimension of DIMENSIONS) {
    state[dimension] = postureValue(dimension, row[dimension]);
  }
  return state;
}

/** A stable key for a terminal state, for set membership and diff messages. */
function stateKey(state: DimensionState): string {
  return DIMENSIONS.map((dimension) => `${dimension}=${state[dimension]}`).join(",");
}

/* -------------------------------------------------------------------------- */
/* 1. All 729 rows                                                            */
/* -------------------------------------------------------------------------- */

test("the 729-state fixture is what this build enumerates: 729 rows, in odometer order", () => {
  const rows = parseCsv(readFixture(SHIP_729_STATES_CSV));
  const states = enumerateDimensionStates();

  assert.equal(rows.length, 729);
  assert.equal(states.length, 729);
  assert.equal(TERMINAL_STATE_COUNT, 729);
  assert.equal(TERNARY_STATES.length ** DIMENSIONS.length, 729);

  // The row order is asserted, not assumed: every downstream check walks the
  // CSV and the generator in lockstep by index, so if the odometer were ever
  // reordered (last dimension varies fastest) every later comparison would be
  // comparing the wrong pair of rows and still might not fail.
  rows.forEach((row, index) => {
    assert.deepEqual(
      stateFromNumericColumns(row),
      states[index],
      `Row ${index + 1} is not the ${index + 1}th enumerated state.`
    );
  });
});

test("all 729 ship codes and all 2916 percentages reproduce exactly — zero mismatches", () => {
  const rows = parseCsv(readFixture(SHIP_729_STATES_CSV));
  const states = enumerateDimensionStates();
  const mismatches: string[] = [];

  rows.forEach((row, index) => {
    const state = states[index];
    const ship = calculateShip(state);

    if (ship.code !== row.ship_code) {
      mismatches.push(
        `row ${index + 1} (${stateKey(state)}): code ${ship.code} != ${row.ship_code}`
      );
    }

    for (const axis of SHIP_AXIS_KEYS) {
      // The fixture's percentages are already at 0.1 precision; `Number` on
      // "7.5" and `displayPercent`'s Math.round(lean * 1000) / 10 must agree
      // as numbers, not as strings, so a "50" vs "50.0" formatting difference
      // is not reported as an arithmetic failure.
      const expected = Number(row[`${axis}_pct`]);
      const actual = ship.displayPercents[axis];
      if (actual !== expected) {
        mismatches.push(
          `row ${index + 1} (${stateKey(state)}): ${axis}_pct ${actual} != ${expected}`
        );
      }
    }
  });

  assert.deepEqual(mismatches, [], `${mismatches.length} fixture mismatches.`);
});

test("the fixture's own profile_name column matches the 16 shipped profile bodies", () => {
  const rows = parseCsv(readFixture(SHIP_729_STATES_CSV));
  const states = enumerateDimensionStates();

  rows.forEach((row, index) => {
    const ship = calculateShip(states[index]);
    const profile = profileForKey(ship.profileKey);
    assert.equal(profile.code, row.ship_code);
    assert.equal(profile.name, row.profile_name);
  });
});

test("exactly 16 distinct codes, and the per-code counts match ship_16_profiles.csv count_729", () => {
  const stateRows = parseCsv(readFixture(SHIP_729_STATES_CSV));
  const profileRows = parseCsv(readFixture(SHIP_16_PROFILES_CSV));
  const states = enumerateDimensionStates();

  const counts = new Map<string, number>();
  for (const state of states) {
    const { code } = calculateShip(state);
    counts.set(code, (counts.get(code) ?? 0) + 1);
  }

  assert.equal(counts.size, 16);
  assert.equal(profileRows.length, 16);
  assert.equal(SHIP_PROFILE_KEYS.length, 16);
  assert.equal(Object.keys(SHIP_PROFILES).length, 16);

  // Every one of the 16 four-bit keys is produced by at least one state: the
  // 16 profile bodies are not a superset with dead entries.
  for (const key of SHIP_PROFILE_KEYS) {
    assert.ok(counts.has(`SHIP-${key}`), `No terminal state produces SHIP-${key}.`);
  }

  let total = 0;
  for (const row of profileRows) {
    const computed = counts.get(row.ship_code);
    assert.equal(
      computed,
      Number(row.count_729),
      `${row.ship_code}: computed ${computed} states, fixture says ${row.count_729}.`
    );
    total += Number(row.count_729);
  }
  assert.equal(total, 729);

  // Cross-check against the states fixture's own code column rather than only
  // against this build, so the count agreement cannot come from one shared
  // mistake in `calculateShip`.
  const fixtureCounts = new Map<string, number>();
  for (const row of stateRows) {
    fixtureCounts.set(row.ship_code, (fixtureCounts.get(row.ship_code) ?? 0) + 1);
  }
  assert.deepEqual([...fixtureCounts].sort(), [...counts].sort());
});

test("the locked axis weights are the config's weights, unreordered", () => {
  // Key ORDER is load-bearing: `axisLean` folds left to right and
  // floating-point addition is not associative, so a reordered weight object
  // can move a lean across the > 0.5 boundary that the 729 rows pin.
  assert.deepEqual(Object.keys(SHIP_WEIGHTS), ["S", "H", "I", "P"]);
  assert.deepEqual(Object.keys(SHIP_WEIGHTS.S), ["ambiguity", "promise", "risk"]);
  assert.deepEqual(Object.keys(SHIP_WEIGHTS.H), ["ownership", "risk", "trust"]);
  assert.deepEqual(Object.keys(SHIP_WEIGHTS.I), ["verification", "risk", "ownership"]);
  assert.deepEqual(Object.keys(SHIP_WEIGHTS.P), ["trust", "promise", "ownership"]);

  for (const axis of SHIP_AXIS_KEYS) {
    const weights = Object.values(SHIP_WEIGHTS[axis]);
    assert.deepEqual(weights, [0.65, 0.2, 0.15], `${axis} is not 0.65/0.20/0.15.`);
  }

  // No axis is a private readout of one dimension: `risk` and `ownership` each
  // feed three axes, which is why one answer cannot swing a code on its own.
  const feeds = new Map<Dimension, number>();
  for (const axis of SHIP_AXIS_KEYS) {
    for (const dimension of Object.keys(SHIP_WEIGHTS[axis]) as Dimension[]) {
      feeds.set(dimension, (feeds.get(dimension) ?? 0) + 1);
    }
  }
  assert.equal(feeds.get("risk"), 3);
  assert.equal(feeds.get("ownership"), 3);
  assert.equal(feeds.size, DIMENSIONS.length);
});

/* -------------------------------------------------------------------------- */
/* 2. The threshold: strictly `> 0.5`                                         */
/* -------------------------------------------------------------------------- */

test("TEST_PLAN's four threshold cases: 49.9 -> 0, 50.0 -> 0, 50.1 -> 1, 100 -> 1", () => {
  assert.equal(axisBit(0.499), "0");
  assert.equal(axisBit(0.5), "0");
  assert.equal(axisBit(0.501), "1");
  assert.equal(axisBit(1), "1");

  assert.equal(displayPercent(0.499), 49.9);
  assert.equal(displayPercent(0.5), 50);
  assert.equal(displayPercent(0.501), 50.1);
  assert.equal(displayPercent(1), 100);

  // And 0, for completeness of the closed interval.
  assert.equal(axisBit(0), "0");
  assert.equal(displayPercent(0), 0);
});

test("50.0 is a 0 in the shipped table, on all four axes, in the state that produces it", () => {
  // The all-0.5 state lands on exactly 50.0 on every axis. If the threshold
  // were `>=` this single state would read SHIP-1111 instead of SHIP-0000 —
  // the two ends of the entire code space, from one character.
  const midpoint: DimensionState = {
    ambiguity: 0.5,
    verification: 0.5,
    promise: 0.5,
    risk: 0.5,
    ownership: 0.5,
    trust: 0.5
  };
  const ship = calculateShip(midpoint);

  assert.deepEqual(ship.displayPercents, { S: 50, H: 50, I: 50, P: 50 });
  assert.equal(ship.code, "SHIP-0000");
  assert.equal(ship.profileKey, "0000");

  const rows = parseCsv(readFixture(SHIP_729_STATES_CSV));
  const index = enumerateDimensionStates().findIndex(
    (state) => stateKey(state) === stateKey(midpoint)
  );
  assert.ok(index >= 0);
  assert.equal(rows[index].ship_code, "SHIP-0000");
  for (const axis of SHIP_AXIS_KEYS) assert.equal(Number(rows[index][`${axis}_pct`]), 50);
});

test("the boundary is populated: 85 fixture rows sit on exactly 50.0, and every one of those bits is 0", () => {
  const rows = parseCsv(readFixture(SHIP_729_STATES_CSV));

  let rowsTouchingFifty = 0;
  let axesAtFifty = 0;

  rows.forEach((row) => {
    let touched = false;
    SHIP_AXIS_KEYS.forEach((axis, position) => {
      if (Number(row[`${axis}_pct`]) !== 50) return;
      touched = true;
      axesAtFifty += 1;
      // `ship_code` is "SHIP-" + four bits, so the axis bit is at 5 + position.
      assert.equal(
        row.ship_code[5 + position],
        "0",
        `${row.ship_code} reads 1 on ${axis} at exactly 50.0%.`
      );
    });
    if (touched) rowsTouchingFifty += 1;
  });

  assert.equal(rowsTouchingFifty, 85);
  assert.ok(axesAtFifty > 85);
});

test("`>=` is not a tidier spelling of `>`: it disagrees with the shipped table", () => {
  // The mutation, run against the fixture. This is the assertion that makes
  // the comment in scoring.ts enforceable: a `>=` build does not merely differ
  // in theory, it produces a different code for a counted set of real states.
  const rows = parseCsv(readFixture(SHIP_729_STATES_CSV));
  const states = enumerateDimensionStates();
  const inclusiveBit = (lean: number): "0" | "1" => (lean >= 0.5 ? "1" : "0");

  let disagreements = 0;
  rows.forEach((row, index) => {
    const { leans } = calculateShip(states[index]);
    const inclusiveCode = `SHIP-${SHIP_AXIS_KEYS.map((axis) => inclusiveBit(leans[axis])).join("")}`;
    if (inclusiveCode !== row.ship_code) disagreements += 1;
  });

  assert.equal(disagreements, 85);
});

test("`axisLean` and the two roundings are separate concerns, and neither can move a bit", () => {
  // Two different roundings, deliberately: 0.1 for the readout, 10 for the
  // bar. Both derive from `leans`, and so does the bit, so a rounding can
  // never move a code — asserted here across the whole state space rather
  // than argued in a comment.
  for (const state of enumerateDimensionStates()) {
    const ship = calculateShip(state);
    for (const axis of SHIP_AXIS_KEYS) {
      const lean = axisLean(state, SHIP_WEIGHTS[axis]);
      assert.equal(ship.leans[axis], lean);
      assert.equal(ship.displayPercents[axis], displayPercent(lean));
      assert.equal(ship.barPercents[axis], barPercent(lean));
      assert.equal(ship.barPercents[axis] % 10, 0);
      assert.ok(lean >= 0 && lean <= 1);
      assert.equal(ship.code[5 + SHIP_AXIS_KEYS.indexOf(axis)], axisBit(lean));
    }
  }
});

/* -------------------------------------------------------------------------- */
/* 3. The recovered narratives, byte for byte                                 */
/* -------------------------------------------------------------------------- */

test("all 729 composed narratives equal the recovered deterministic_narrative, byte-exact", () => {
  const rows = parseCsv(readFixture(RECOVERED_729_NARRATIVES_CSV));
  const states = enumerateDimensionStates();

  assert.equal(rows.length, 729);

  const mismatches: string[] = [];

  rows.forEach((row, index) => {
    // The recovered file names its state in POSTURE columns; the states
    // fixture names the same state in NUMERIC columns. Reading both and
    // asserting they describe the same state is what proves this build's
    // posture-to-value mapping is the recovered authoring's own mapping and
    // not a coincidence of ordering.
    assert.deepEqual(
      stateFromPostureColumns(row),
      states[index],
      `Recovered row ${row.profile_id} is not the ${index + 1}th enumerated state.`
    );
    assert.equal(row.profile_id, `TF-LITE-${String(index + 1).padStart(3, "0")}`);

    const composed = composeNarrative(states[index]);
    if (composed !== row.deterministic_narrative) {
      mismatches.push(
        `${row.profile_id}\n  composed: ${JSON.stringify(composed)}\n  recovered: ${JSON.stringify(row.deterministic_narrative)}`
      );
    }
  });

  assert.deepEqual(
    mismatches,
    [],
    `${mismatches.length} of 729 narratives were regenerated rather than recovered.`
  );
});

test("the recovered file's own SHIP columns agree with this build's scoring, including the bars", () => {
  const rows = parseCsv(readFixture(RECOVERED_729_NARRATIVES_CSV));
  const states = enumerateDimensionStates();

  rows.forEach((row, index) => {
    const ship = calculateShip(states[index]);
    assert.equal(ship.code, row.SHIP_code, `${row.profile_id} code.`);
    for (const axis of SHIP_AXIS_KEYS) {
      assert.equal(
        ship.displayPercents[axis],
        Number(row[`${axis}_lean_to_1_pct`]),
        `${row.profile_id} ${axis} readout.`
      );
      assert.equal(
        ship.barPercents[axis],
        Number(row[`${axis}_bar_10pct`]),
        `${row.profile_id} ${axis} bar.`
      );
      assert.equal(
        ship.code[5 + SHIP_AXIS_KEYS.indexOf(axis)],
        row[`${axis}_bit`],
        `${row.profile_id} ${axis} bit.`
      );
    }
  });
});

test("the narrative is prefix + six DIMENSIONS-ordered clauses + suffix, and nothing else", () => {
  // The join order is `DIMENSIONS`, not an object's key order. The three
  // `trust` clauses each begin "and you " because trust is last; a composer
  // iterating `Object.keys(NARRATIVE_CLAUSES)` would agree today and would
  // strand "and you" mid-list the moment that object were reordered —
  // producing a grammatical sentence that fails nothing but the byte test.
  assert.equal(DIMENSIONS[DIMENSIONS.length - 1], "trust");
  for (const clause of Object.values(NARRATIVE_CLAUSES.trust)) {
    assert.ok(clause.startsWith("and you "), `"${clause}" does not close the list.`);
  }

  const clauseCount = DIMENSIONS.reduce(
    (total, dimension) => total + Object.keys(NARRATIVE_CLAUSES[dimension]).length,
    0
  );
  assert.equal(clauseCount, 18);

  // Every clause is keyed by an authored POSTURE NAME, never by A/B/C. Nine of
  // the 138 recovered tags are non-monotonic, so a position-keyed lookup would
  // return a wrong-but-plausible sentence on exactly those nine.
  for (const dimension of DIMENSIONS) {
    assert.deepEqual(
      Object.keys(NARRATIVE_CLAUSES[dimension]),
      [...POSTURES[dimension]],
      `${dimension} clauses are not keyed by its three authored postures.`
    );
  }

  for (const state of enumerateDimensionStates()) {
    const clauses = narrativeClausesFor(state);
    assert.equal(clauses.length, 6);
    assert.equal(
      composeNarrative(state),
      NARRATIVE_PREFIX + clauses.join(NARRATIVE_CLAUSE_SEPARATOR) + NARRATIVE_SUFFIX
    );
  }

  // The suffix's second sentence — reflections preserved verbatim, never
  // interpreted — is part of the recovered narrative, not a disclaimer this
  // build appends, so it is asserted present in every one of the 729 strings
  // by the byte-exact test above and named here so a trim is a red test.
  assert.ok(
    NARRATIVE_SUFFIX.includes(
      "Written reflections are preserved verbatim but are not interpreted."
    )
  );
});

/* -------------------------------------------------------------------------- */
/* 4. Reachability: 3^11 sequences through the locked reducer                 */
/* -------------------------------------------------------------------------- */

/**
 * The rejected rule, implemented once, here, and nowhere in `lib/`.
 *
 * Mean the PRESENT tags for a dimension, then snap the mean to the nearest
 * ternary state. This is the earlier candidate that layer 05 rejected. It lives
 * in the test file because the only reason to have it at all is to keep proving
 * it is worse; a copy in `lib/` would be an invitation.
 */
function meanAndSnapDimensionState(answers: readonly SignalledAnswer[]): DimensionState {
  const state = {} as DimensionState;
  for (const dimension of DIMENSIONS) {
    let sum = 0;
    let count = 0;
    for (const answer of answers) {
      const posture = answer.signals[dimension];
      if (posture === undefined) continue;
      sum += postureValue(dimension, posture);
      count += 1;
    }
    if (count === 0) {
      throw new Error(`No present evidence for "${dimension}".`);
    }
    const mean = sum / count;
    let nearest: TernaryState = TERNARY_STATES[0];
    let nearestDistance = Infinity;
    for (const candidate of TERNARY_STATES) {
      const distance = Math.abs(mean - candidate);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = candidate;
      }
    }
    state[dimension] = nearest;
  }
  return state;
}

/**
 * Walks all `3^11` complete answer sequences once, calling back with the
 * reusable answer array.
 *
 * ONE array of eleven objects is allocated and mutated in place across the
 * whole walk. 177,147 iterations is cheap work; 177,147 * 11 fresh objects is
 * not, and the reducer only ever reads the array, so reuse is safe and the
 * whole enumeration stays inside a couple of seconds.
 */
function forEachCompleteSequence(
  visit: (answers: readonly SignalledAnswer[], sequenceIndex: number) => void
): number {
  const total = OPTION_IDS.length ** DECISION_IDS.length;
  const answers: SignalledAnswer[] = DECISION_IDS.map((decisionId) => ({
    decisionId,
    selectedOptionId: "A",
    signals: SIGNALS[decisionId].A
  }));

  for (let sequenceIndex = 0; sequenceIndex < total; sequenceIndex += 1) {
    let remainder = sequenceIndex;
    for (let position = DECISION_IDS.length - 1; position >= 0; position -= 1) {
      const optionId: OptionId = OPTION_IDS[remainder % OPTION_IDS.length];
      remainder = Math.floor(remainder / OPTION_IDS.length);
      answers[position].selectedOptionId = optionId;
      answers[position].signals = SIGNALS[DECISION_IDS[position]][optionId];
    }
    visit(answers, sequenceIndex);
  }
  return total;
}

test("the locked reducer reaches 16/16 codes and 465 terminal states across all 177,147 sequences", () => {
  assert.equal(
    AGGREGATION_POLICY_ID,
    "TF-LITE-AGGREGATION-DOMINANT-POSTURE-LATER-TIEBREAK-v1"
  );

  const codeCounts = new Map<string, number>();
  const terminalStates = new Set<string>();

  const total = forEachCompleteSequence((answers) => {
    const state = resolveDimensionState(answers);
    terminalStates.add(stateKey(state));
    const { code } = calculateShip(state);
    codeCounts.set(code, (codeCounts.get(code) ?? 0) + 1);
  });

  assert.equal(total, 177147);
  assert.equal(total, 3 ** 11);

  // 16/16. Every public profile is reachable by some learner.
  assert.equal(codeCounts.size, 16);
  for (const key of SHIP_PROFILE_KEYS) {
    assert.ok(codeCounts.has(`SHIP-${key}`), `SHIP-${key} is unreachable.`);
  }

  // 465 of the 729 theoretical states. The other 264 are theory: the reducer
  // is a plurality over the recovered tags, and the tags do not span them.
  assert.equal(terminalStates.size, 465);
  assert.ok(terminalStates.size < TERMINAL_STATE_COUNT);

  // The rarest and the most common, by exact count. These two numbers are the
  // layer-05 proof's own (`SHIP16_REACHABILITY_PROOF.json`): the rarest code
  // still has 691 distinct sequences behind it, so no profile is a curiosity
  // reachable only in principle.
  const counts = [...codeCounts.values()].sort((a, b) => a - b);
  assert.equal(counts[0], 691);
  assert.equal(counts[counts.length - 1], 49785);
  assert.equal(codeCounts.get("SHIP-0100"), 691);
  assert.equal(codeCounts.get("SHIP-0000"), 49785);
  assert.equal(
    counts.reduce((sum, count) => sum + count, 0),
    177147
  );
});

test("the REJECTED mean-and-snap rule reaches only 11/16 — five profiles would be unreachable", () => {
  const lockedCodes = new Set<string>();
  const rejectedCodes = new Set<string>();

  forEachCompleteSequence((answers) => {
    lockedCodes.add(calculateShip(resolveDimensionState(answers)).code);
    rejectedCodes.add(calculateShip(meanAndSnapDimensionState(answers)).code);
  });

  assert.equal(lockedCodes.size, 16);
  assert.equal(rejectedCodes.size, 11);

  const unreachable = SHIP_PROFILE_KEYS.map((key) => `SHIP-${key}`).filter(
    (code) => !rejectedCodes.has(code)
  );
  assert.deepEqual(unreachable, [
    "SHIP-0001",
    "SHIP-0011",
    "SHIP-0100",
    "SHIP-0110",
    "SHIP-1100"
  ]);
  assert.equal(unreachable.length, 5);

  // Named, so the failure message says what was lost rather than "11 !== 16".
  for (const code of unreachable) {
    assert.ok(
      SHIP_PROFILES[code.slice(5)],
      `${code} is a shipped public profile that mean-and-snap cannot reach.`
    );
  }
});

test("mean-and-snap also invents a posture nobody chose — the categorical violation, shown", () => {
  // Two answers, one low and one high, average to the middle. The locked rule
  // never does this: it selects among OBSERVED postures and breaks a tie on
  // recency, so a posture that no answer carried can never become the result.
  const answers: SignalledAnswer[] = [
    { decisionId: "C5D2", selectedOptionId: "A", signals: SIGNALS.C5D2.A },
    { decisionId: "C5D3", selectedOptionId: "C", signals: SIGNALS.C5D3.C }
  ];

  assert.equal(postureValue("trust", SIGNALS.C5D2.A.trust as string), 0);
  assert.equal(postureValue("trust", SIGNALS.C5D3.C.trust as string), 1);

  // Mean-and-snap: (0 + 1) / 2 = 0.5 -> "relationship", which neither answer
  // is evidence of.
  assert.equal(meanAndSnapDimensionState(answers).trust, 0.5);

  // The locked rule: 1 vs 1 is a tie, so the LATEST present signal wins, and
  // it is one of the two that were actually observed.
  assert.equal(resolveDimensionState(answers).trust, 1);
});

test("absence is never zero, and a complete path always evidences all six dimensions", () => {
  // `ownership` is carried by only four decisions and is 0.65 of the H axis.
  // If the reducer imputed 0 for the seven decisions that do not tag it, the
  // whole population's H would be dragged down — so the four are named here.
  const carriers = DECISION_IDS.filter((decisionId) =>
    OPTION_IDS.some((optionId) => SIGNALS[decisionId][optionId].ownership !== undefined)
  );
  assert.deepEqual(carriers, ["C4D1", "C4D2", "C5D1", "C5D2"]);

  // C2D1 carries `ambiguity` on option B alone: preserved exactly as recovered.
  assert.equal(SIGNALS.C2D1.A.ambiguity, undefined);
  assert.equal(SIGNALS.C2D1.B.ambiguity, "investigate");
  assert.equal(SIGNALS.C2D1.C.ambiguity, undefined);

  // And C2D1's non-monotonic trust tags: option A is the stewardship one.
  assert.equal(SIGNALS.C2D1.A.trust, "stewardship");
  assert.equal(SIGNALS.C2D1.C.trust, "task");

  // A prefix CAN be unevidenced — `resolveDimensionState` refuses rather than
  // imputing. C1D2/C tags all five other dimensions and no `ownership`, so the
  // refusal names the one dimension Cases 1-3 cannot evidence.
  assert.throws(
    () =>
      resolveDimensionState([
        { decisionId: "C1D2", selectedOptionId: "C", signals: SIGNALS.C1D2.C }
      ]),
    /No present signal evidence for "ownership"/
  );

  // A COMPLETE path never can: every one of the 177,147 sequences resolves.
  // That is what makes the throw above a real guard rather than a live branch.
  let resolved = 0;
  forEachCompleteSequence((answers) => {
    resolveDimensionState(answers);
    resolved += 1;
  });
  assert.equal(resolved, 177147);
});

/* -------------------------------------------------------------------------- */
/* 5. Reflections and the handle never affect the result                      */
/* -------------------------------------------------------------------------- */

/** Text a learner might plausibly write, including text that names a posture. */
const REFLECTION_TEXTS: readonly string[] = [
  "",
  "I would investigate first, then prove it.",
  "stewardship",
  "SHIP-1111",
  "ownership: retain, risk: protect, verification: prove",
  "  ".repeat(200),
  "Reflection with a newline\nand an emoji and a \"quote\" and a ; semicolon."
];

/** Handles a learner might plausibly set, including one that names a code. */
const HANDLES: readonly (string | null)[] = [
  null,
  "",
  "ben",
  "SHIP-0000",
  "investigate-prove-retain",
  "A very long handle ".repeat(20)
];

test("feeding reflection text and a handle through the reducer changes nothing", () => {
  // Structurally, `SignalledAnswer` has no text field and `calculateShip` takes
  // a `DimensionState` — the promise is meant to be true by shape. This test
  // attacks the shape anyway: it attaches text to every object the pipeline
  // touches and diffs the whole result, so a future field that DID read text
  // fails here rather than in front of a learner.
  const baseline: SignalledAnswer[] = DECISION_IDS.map((decisionId, position) => ({
    decisionId,
    selectedOptionId: OPTION_IDS[position % OPTION_IDS.length],
    signals: SIGNALS[decisionId][OPTION_IDS[position % OPTION_IDS.length]]
  }));

  const cleanState = resolveDimensionState(baseline);
  const cleanShip = calculateShip(cleanState);
  const cleanNarrative = composeNarrative(cleanState);
  const cleanProfile = profileForKey(cleanShip.profileKey);

  REFLECTION_TEXTS.forEach((text, textIndex) => {
    HANDLES.forEach((handle) => {
      const contaminated = baseline.map((answer) => ({
        ...answer,
        // Fields no declared type carries, attached anyway.
        text,
        reflection: text,
        handle,
        localTimestamp: "2026-09-07T10:00:00-04:00",
        sessionId: `session-${textIndex}`
      })) as unknown as SignalledAnswer[];

      const state = resolveDimensionState(contaminated);
      assert.deepEqual(state, cleanState);
      assert.deepEqual(calculateShip(state), cleanShip);
      assert.equal(composeNarrative(state), cleanNarrative);
      assert.deepEqual(profileForKey(calculateShip(state).profileKey), cleanProfile);

      // The same, one level lower: text attached to the STATE object itself.
      const contaminatedState = {
        ...cleanState,
        text,
        handle,
        note: text
      } as unknown as DimensionState;
      assert.deepEqual(calculateShip(contaminatedState), cleanShip);
      assert.equal(composeNarrative(contaminatedState), cleanNarrative);
      for (const axis of SHIP_AXIS_KEYS) {
        assert.equal(
          axisLean(contaminatedState, SHIP_WEIGHTS[axis]),
          cleanShip.leans[axis]
        );
      }
    });
  });
});

test("the deterministic core reads six numbers and nothing else — same state, same everything", () => {
  // `TEST_PLAN.md` §Determinism: same stamp + same active fixed answers => same
  // result. Asserted over the whole state space, twice per state, so a hidden
  // cache, a Date, a Math.random or a mutated module-level object shows up.
  for (const state of enumerateDimensionStates()) {
    const first = calculateShip(state);
    const second = calculateShip({ ...state });
    assert.deepEqual(second, first);
    assert.equal(composeNarrative({ ...state }), composeNarrative(state));

    // The result is a function of the six values, not of key insertion order.
    const reordered = {} as DimensionState;
    for (const dimension of [...DIMENSIONS].reverse()) reordered[dimension] = state[dimension];
    assert.deepEqual(calculateShip(reordered), first);
    assert.equal(composeNarrative(reordered), composeNarrative(state));
  }
});
