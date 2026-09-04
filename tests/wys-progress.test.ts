import assert from "node:assert/strict";
import test from "node:test";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { RENDER_MARKED_DRAFT, provenanceLabelFor } from "@/lib/content-status";
import { gateProse, isShowable } from "@/lib/wys/content-gate";
import {
  WYS_ROUTES,
  emptyWysState,
  isIdToken,
  sanitizeWysState,
  type WysLocalStateV1
} from "@/lib/wys/local-state";
import { type VisitCountableStop, visitId } from "@/lib/wys/visit";
import { WYS_DOMAINS } from "@/content/watch-your-step/domains";
import { wysCanonicalRecords } from "@/content/watch-your-step";
import { wysLabels } from "@/content/watch-your-step/copy";
import {
  RULE_MAX_LENGTH,
  judgmentRowFor,
  judgmentRows,
  learnerRuleProvenance,
  normaliseRuleText,
  progressCopyRecords,
  progressCounts,
  progressLabels,
  progressStatTiles,
  rulebookAsText,
  statValue,
  stopsDenominator
} from "@/content/watch-your-step/progress";
import { wysScenarios } from "@/content/watch-your-step/scenarios";
import type { WysWeek } from "@/content/watch-your-step/types";
import { stopCount, wysWeeks } from "@/content/watch-your-step/weeks";

/**
 * The Progress view (plan Phase 7, the Progress row; mockup `5b`; WYS §13).
 *
 * "Progress is evidence, not a score." The tests below are mostly about what is
 * ABSENT: §13's do-not-show list is enforced as a property of the module (no
 * function computes a ratio) and of the view source (no percentage, no streak,
 * no rank), because a rule that lives only in a review comment is a rule that
 * comes back.
 */

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Comments are documentation, not rendering. Every source scan below runs over
 * the code with its comments removed — otherwise the note explaining that this
 * screen fires no `trackWys` would itself fail the check that it fires none.
 */
function code(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
}
const viewDir = path.join(repoRoot, "app", "watch-your-step", "(shell)", "progress");
const viewFile = readFileSync(path.join(viewDir, "ProgressView.tsx"), "utf8");
const pageFile = readFileSync(path.join(viewDir, "page.tsx"), "utf8");
const cssFile = readFileSync(path.join(viewDir, "progress.module.css"), "utf8");
const contentFile = readFileSync(
  path.join(repoRoot, "content", "watch-your-step", "progress.ts"),
  "utf8"
);
const viewSource = code(viewFile);
const pageSource = code(pageFile);
const cssSource = code(cssFile);
const contentSource = code(contentFile);

const weeks: readonly WysWeek[] = wysWeeks;
const stops: VisitCountableStop[] = weeks.map((week) => ({
  id: week.id,
  cadencePaths: week.cadencePaths,
  offSite: week.offSite
}));

function stateWith(change: (state: WysLocalStateV1) => void): WysLocalStateV1 {
  const state = emptyWysState();
  change(state);
  return state;
}

/* -------------------------------------------------------------------------- */
/* WYS §13 — what Progress must never show                                    */
/* -------------------------------------------------------------------------- */

test("no score, streak, percentage, XP, level, badge or ranking anywhere on the screen", () => {
  const forbidden = [
    /\bpercent\b/i,
    /\bstreak\b/i,
    /\bXP\b/,
    /\bbadge\b/i,
    /\branking\b/i,
    /\bleaderboard\b/i,
    /\bbehind\b/i,
    /\boverdue\b/i,
    /\bmissed\b/i,
    /\bon track\b/i
  ];
  // The content module is deliberately NOT scanned: its two claims quote §13's
  // own do-not-show wording ("No score, no streak, no percentage"), which is
  // the sentence the artboard draws. The view and the stylesheet are what
  // actually put marks on the screen.
  for (const pattern of forbidden) {
    assert.ok(!pattern.test(viewSource), `ProgressView renders ${pattern}`);
    assert.ok(!pattern.test(cssSource), `progress.module.css styles ${pattern}`);
  }
  assert.ok(!viewSource.includes("%"), "a percent sign on a screen that promises no percentage");
  // The stylesheet's only percentages are `width: 100%` on a field and a
  // button — an input filling its row, never a meter filling a track.
  assert.deepEqual(cssSource.match(/[\d.]+%/g), ["100%", "100%"]);
});

test("nothing in the Progress module divides one count by another", () => {
  // A ratio is the shape a score arrives in. `stopsDenominator` renders "of 9";
  // nothing computes 1/9. With comments, import paths and string literals
  // removed there is no division operator left in the module at all — which is
  // a stronger statement than "no percentage is rendered", and the one §13
  // actually asks for.
  const executable = contentSource
    .replace(/`(?:[^`\\]|\\.)*`/g, " ")
    .replace(/"(?:[^"\\]|\\.)*"/g, " ")
    .replace(/'(?:[^'\\]|\\.)*'/g, " ");
  assert.ok(!executable.includes("/"), "a division in the Progress derivations");
});

test("Progress fires no telemetry and sends nothing", () => {
  for (const forbidden of ["trackWys", "sendAggregate", "fetch(", "navigator.sendBeacon"]) {
    assert.ok(!viewSource.includes(forbidden), `ProgressView calls ${forbidden}`);
    assert.ok(!pageSource.includes(forbidden), `the Progress page calls ${forbidden}`);
  }
});

/* -------------------------------------------------------------------------- */
/* The derived counts                                                         */
/* -------------------------------------------------------------------------- */

test("a browser with no state renders four zeros and the derived denominator", () => {
  const counts = progressCounts(stops, emptyWysState());
  assert.equal(counts.stopsCompleted, 0);
  assert.equal(counts.judgmentsCommitted, 0);
  assert.equal(counts.carriesTaken, 0);
  assert.equal(counts.replayUsed, 0);
  assert.equal(counts.stopTotal, stopCount());
  assert.equal(stopsDenominator(counts), `of ${stopCount()}`);
});

test("a stop counts only when every step of its resolved cadence path is complete", () => {
  const stop = stops[1];
  const path2 = stop.cadencePaths.days2;
  assert.ok(path2.length >= 2, "the fixture needs a multi-visit stop");

  const halfway = stateWith((state) => {
    state.onboarding.cadence = "2";
    state.progress.completedLessonIds = [visitId(stop.id, path2[0])];
  });
  assert.equal(progressCounts(stops, halfway).stopsCompleted, 0, "half a stop is not a stop");

  const finished = stateWith((state) => {
    state.onboarding.cadence = "2";
    state.progress.completedLessonIds = path2.map((dayPlanId) => visitId(stop.id, dayPlanId));
  });
  assert.equal(progressCounts(stops, finished).stopsCompleted, 1);
});

test("a completed visit advances only its own stop", () => {
  // The qualified visit id is what makes this true: `day-human-source` is day 1
  // of more than one stop, so a bare day-plan id would complete two counters.
  const first = stops[1];
  const second = stops[2];
  const shared = first.cadencePaths.days2[0];
  assert.equal(second.cadencePaths.days2[0], shared, "the fixture needs a shared day plan");

  const state = stateWith((current) => {
    current.onboarding.cadence = "2";
    current.progress.completedLessonIds = first.cadencePaths.days2.map((id) => visitId(first.id, id));
  });
  assert.equal(progressCounts(stops, state).stopsCompleted, 1);
});

test("judgments committed is the union of completed scenarios and kept local judgments", () => {
  const [first, second] = wysScenarios;
  const state = stateWith((current) => {
    current.progress.completedScenarioIds = [first.id];
    current.localJudgments = {
      [first.id]: { choiceKey: "A", updatedAt: "2026-09-01T10:00:00.000Z" },
      [second.id]: { choiceKey: "B", updatedAt: "2026-09-02T10:00:00.000Z" }
    };
  });
  // Two scenarios, not three: the scenario present in both sets counts once.
  assert.equal(progressCounts(stops, state).judgmentsCommitted, 2);
});

test("carries and replays count marks and uses, never opens", () => {
  const state = stateWith((current) => {
    current.progress.completedCarryIds = ["carry-a", "carry-b"];
    current.progress.replayCounts = { "scn-repair-request": 2, "scn-group-chat": 1 };
  });
  const counts = progressCounts(stops, state);
  assert.equal(counts.carriesTaken, 2);
  assert.equal(counts.replayUsed, 3);
});

test("every tile id has a count, and the four tiles are the artboard's four", () => {
  const counts = progressCounts(stops, emptyWysState());
  for (const tile of progressStatTiles) assert.equal(statValue(tile.id, counts), 0);
  assert.deepEqual(
    progressStatTiles.map((tile) => tile.label),
    ["stops completed", "judgments committed", "carries taken", "replay used"]
  );
});

/* -------------------------------------------------------------------------- */
/* Kept or revised (WYS §13, "judgments revised or retained")                  */
/* -------------------------------------------------------------------------- */

test("a judgment row reads kept, or reads the revision as a state and not a correction", () => {
  const kept = judgmentRowFor("scn-repair-request", {
    choiceKey: "A",
    updatedAt: "2026-09-01T10:00:00.000Z"
  });
  assert.equal(kept.state, "A · kept");
  assert.equal(kept.revised, false);

  const revised = judgmentRowFor("scn-client-meeting", {
    choiceKey: "C",
    revisedChoiceKey: "B",
    updatedAt: "2026-09-02T10:00:00.000Z"
  });
  assert.equal(revised.state, "C → B · revised");
  assert.equal(revised.revised, true);
});

test("rows are ordered by when they were last touched, and nothing ranks them", () => {
  const state = stateWith((current) => {
    current.localJudgments = {
      "scn-group-chat": { choiceKey: "B", updatedAt: "2026-09-03T10:00:00.000Z" },
      "scn-repair-request": { choiceKey: "A", updatedAt: "2026-09-01T10:00:00.000Z" }
    };
  });
  assert.deepEqual(
    judgmentRows(state).map((row) => row.scenarioId),
    ["scn-repair-request", "scn-group-chat"]
  );
});

test("no agreement-with-Ben state is computed, because nothing records Ben's choice", () => {
  // The artboard's third row form ("B · differs from Ben") is a narrowing, not
  // an omission: `WysJudgment` carries no choice key, so the comparison could
  // only be produced by this build deciding Ben's answer (R10, WYS §35 item 6).
  assert.ok(!/differs from Ben/i.test(contentSource), "a Ben position asserted by this build");
  assert.ok(!/differs from Ben/i.test(viewSource), "a Ben position asserted by this build");
});

/* -------------------------------------------------------------------------- */
/* The learner-owned rulebook (WYS §16, Q20)                                  */
/* -------------------------------------------------------------------------- */

test("a learner's rule renders under its own provenance and is never blocked by Q21", () => {
  const gated = gateProse("general", learnerRuleProvenance, "I crop screenshots before I upload them.");
  assert.equal(gated.policy.kind, "marked", "the learner's own rulebook must not depend on Q21");
  assert.equal(gated.label, provenanceLabelFor("general", "LEARNER_OWNED"));
  assert.equal(gated.label, "Yours. Stored in this browser only.");
  if (gated.policy.kind === "marked") assert.equal(gated.policy.draftMark, null);
});

test("a draft scenario title follows the ratified render policy, whichever way it is set", () => {
  const scenario = wysScenarios[0];
  const gated = gateProse("fictional-scenario", scenario, scenario.title);
  assert.equal(scenario.status, "draft");
  assert.equal(gated.policy.kind, RENDER_MARKED_DRAFT ? "marked" : "blocked");
});

test("a blocked title's prose does not cross the client boundary", () => {
  // Props of a client component are serialised into the RSC payload, which IS
  // public page source. The strip happens at the gate (`withoutBlockedProse`
  // in lib/wys/content-gate.ts), so it is true of every surface at once rather
  // than of whichever page remembered to write a local helper. Asserted
  // against the real gate and the real content.
  for (const scenario of wysScenarios) {
    const gated = gateProse("fictional-scenario", scenario, scenario.title);
    if (isShowable(gated)) continue;
    assert.equal(gated.text, "", `${scenario.id}'s blocked title still carries its prose`);
    assert.notEqual(gated.label, "", "the label survives; only the words go");
  }

  // And the stops reach the client as a named projection, not as records: a
  // `WysWeek` passed whole would publish its draft title and purpose the same
  // way, and structural typing would not complain.
  assert.ok(pageSource.includes("weeks.map(visitCountableStop)"));
});

test("the export is the learner's lines and nothing else", () => {
  const text = rulebookAsText([
    { id: "rule-1", text: "I remove names unless the name changes the task.", createdAt: "2026-09-01T10:00:00.000Z", updatedAt: "2026-09-01T10:00:00.000Z" },
    { id: "rule-2", text: "I crop screenshots before I upload them.", createdAt: "2026-09-01T10:00:00.000Z", updatedAt: "2026-09-01T10:00:00.000Z" }
  ]);
  assert.equal(
    text,
    "I remove names unless the name changes the task.\nI crop screenshots before I upload them."
  );
  assert.equal(rulebookAsText([]), "");
});

test("a rule is trimmed, capped, and empty input is not a rule", () => {
  assert.equal(normaliseRuleText("   I crop screenshots.   "), "I crop screenshots.");
  assert.equal(normaliseRuleText("   "), "");
  assert.equal(normaliseRuleText("x".repeat(RULE_MAX_LENGTH + 50)).length, RULE_MAX_LENGTH);
});

test("a rule the view writes survives the serializer intact", () => {
  const at = "2026-09-03T10:00:00.000Z";
  const id = `rule-${randomUUID()}`;
  assert.ok(isIdToken(id), "the generated rule id must be an id token, not a sentence");

  const result = sanitizeWysState(
    {
      ...emptyWysState(),
      rulebook: [{ id, text: "For employer information, policy outranks anonymization.", createdAt: at, updatedAt: at }]
    },
    WYS_DOMAINS
  );
  assert.deepEqual(result.dropped, []);
  assert.equal(result.state.rulebook.length, 1);
  assert.equal(result.state.rulebook[0].text, "For employer information, policy outranks anonymization.");
});

test("the rulebook is editable, deletable and exportable — all three, or the footnote is false", () => {
  for (const label of [
    progressLabels.editRule,
    progressLabels.deleteRule,
    progressLabels.exportRulebook,
    progressLabels.addRule
  ]) {
    assert.ok(viewSource.includes(label) || contentSource.includes(label), `${label} has no control`);
  }
  assert.ok(viewSource.includes("progressLabels.exportRulebook"));
  assert.ok(viewSource.includes("downloadRulebook"));
});

/* -------------------------------------------------------------------------- */
/* Wiring, routes and registration                                            */
/* -------------------------------------------------------------------------- */

test("the screen is registered, sourced and reachable", () => {
  for (const record of progressCopyRecords) {
    assert.ok(
      wysCanonicalRecords.some((entry) => entry.id === record.id),
      `${record.id} is not in the registry, so no governance check sees it`
    );
    assert.ok(record.sourceIds.length > 0);
  }
  assert.ok(WYS_ROUTES.includes("/watch-your-step/progress"));
  assert.ok(WYS_ROUTES.includes(progressLabels.dataPageHref));
});

test("the Data page keeps one link label sitewide (Q6, plan §6.8 collapse 4)", () => {
  assert.equal(progressLabels.inspectLocalData, wysLabels.dataPageLinkLabel);
  assert.ok(!viewSource.includes("Inspect local data"));
});

test("the page never reads local state during render (§7.3)", () => {
  assert.ok(!pageSource.includes("useWysState"));
  assert.ok(!pageSource.includes("localStorage"));
  assert.ok(viewSource.startsWith('"use client"'));
});
