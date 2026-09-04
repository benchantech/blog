import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { policyForCanonicalText, resolveVariant } from "@/lib/canonical-text";
import { WYS_CADENCES, WYS_TIME_BUDGETS } from "@/lib/wys/local-state";
import { WYS_EVENT_NAMES } from "@/lib/wys/telemetry";
import { lessonZeroCompletionText } from "@/content/canonical/judgment-framework";
import { POSTURE_OPTIONS } from "@/content/watch-your-step/config";
import { wysCadenceOptions, wysTimeBudgetOptions } from "@/content/watch-your-step/plan";
import {
  LESSON_ZERO_JUDGMENT_ID,
  LESSON_ZERO_SCENARIO_ID,
  LESSON_ZERO_STEP_COUNT,
  lessonZeroBenSlots,
  lessonZeroCopyRecords,
  lessonZeroCounterLabel,
  lessonZeroDataNotSentText,
  lessonZeroDataSentText,
  lessonZeroHabitText,
  lessonZeroLabels,
  lessonZeroScreens,
  lessonZeroSteps,
  lessonZeroTimeDepthText
} from "@/content/watch-your-step/lesson-zero";
import { wysCanonicalRecords, wysContentObjects } from "@/content/watch-your-step";
import { wysJudgmentById } from "@/content/watch-your-step/judgments";
import { wysScenarioById } from "@/content/watch-your-step/scenarios";

/**
 * Lesson Zero (plan Phase 7; WYS §9; mockup 5a).
 *
 * The flow is a client component and this suite has no DOM and no renderer
 * (Q15, ratified at manual QA), so the assertions below are of two kinds and
 * both are decidable without one:
 *
 *   1. THE SEQUENCE AND ITS COPY ARE DATA. (WYS §9.1)'s ten steps, the eight
 *      screens the artboard draws them on, and every sentence they render are
 *      declared in `content/watch-your-step/lesson-zero.ts`, so the order, the
 *      count, the provenance and the verbatim strings are all checkable here.
 *   2. (WYS §9.2) IS A PROHIBITION ON THE SOURCE. "Do not show a chat box, a
 *      microphone, 'tell me your situation'…" is a claim about what the flow
 *      can render, and the flow is three files. So the §9.2 list is checked by
 *      reading them — which also catches the thing a props-level check would
 *      miss: an `<input>` typed straight into the JSX.
 */

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Every file that can put something on a Lesson Zero screen. */
const FLOW_FILES = [
  "app/watch-your-step/(flow)/start/page.tsx",
  "components/wys/LessonZero/LessonZeroFlow.tsx",
  "content/watch-your-step/lesson-zero.ts"
];

function read(relative: string): string {
  return readFileSync(path.join(repoRoot, relative), "utf8");
}

/** Source with block and line comments removed — the prohibitions are about what RENDERS. */
function code(relative: string): string {
  return read(relative)
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^\s*\/\/.*$/gm, " ");
}

/* -------------------------------------------------------------------------- */
/* §9.1 — the required sequence                                               */
/* -------------------------------------------------------------------------- */

test("the ten steps are WYS §9.1's sequence, in order, with none added or dropped", () => {
  assert.equal(LESSON_ZERO_STEP_COUNT, 10);
  assert.deepEqual(
    lessonZeroSteps.map((step) => step.index),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  );
  assert.deepEqual(
    lessonZeroSteps.map((step) => step.specName),
    [
      "Constructive intent",
      "Current posture",
      "Human source first",
      "First durable privacy habit",
      "Fictional anonymization exercise",
      "Runtime disclosure",
      "Cadence",
      "Time",
      "Data",
      "Plan preview"
    ]
  );
});

test("five steps are drawn and five are not, and the five undesigned ones are the flagged ones", () => {
  const undesigned = lessonZeroSteps.filter((step) => !step.designed).map((step) => step.index);
  assert.deepEqual(undesigned, [1, 3, 4, 6, 10]);
  const designed = lessonZeroSteps.filter((step) => step.designed).map((step) => step.index);
  assert.deepEqual(designed, [2, 5, 7, 8, 9]);
});

test("the eight screens cover every step exactly once, in order", () => {
  const covered = lessonZeroScreens.flatMap((screen) => [...screen.stepIds]);
  assert.deepEqual(covered, lessonZeroSteps.map((step) => step.id));
  assert.equal(lessonZeroScreens.length, 8);
});

test("the composite screen is 7-9 and the rail widths are the artboard's", () => {
  const composite = lessonZeroScreens.find((screen) => screen.stepIds.length > 1);
  assert.ok(composite, "5a's third phone carries cadence, time and data on one screen");
  assert.deepEqual([...composite.stepIds], ["lz-cadence", "lz-time", "lz-data"]);

  // The three rail widths `5a` draws, from step / 10: 20%, 50%, 90%.
  const widthFor = (id: string): number => {
    const screen = lessonZeroScreens.find((candidate) => candidate.id === id);
    assert.ok(screen, id);
    return Math.round((screen.railStep / LESSON_ZERO_STEP_COUNT) * 100);
  };
  assert.equal(widthFor("screen-posture"), 20);
  assert.equal(widthFor("screen-exercise"), 50);
  assert.equal(widthFor("screen-pace-and-data"), 90);
});

test("the counter reads the way the artboard writes it", () => {
  const label = (id: string): string => {
    const screen = lessonZeroScreens.find((candidate) => candidate.id === id);
    assert.ok(screen, id);
    return lessonZeroCounterLabel(screen);
  };
  assert.equal(label("screen-posture"), "2 of 10");
  assert.equal(label("screen-exercise"), "5 of 10");
  // En dash, exactly as `5a` sets it — not a hyphen.
  assert.equal(label("screen-pace-and-data"), "7–9 of 10");
});

/* -------------------------------------------------------------------------- */
/* §9.2 — what onboarding must never show                                     */
/* -------------------------------------------------------------------------- */

/**
 * (WYS §9.2), verbatim, as thirteen things plus the superseded posture option
 * §9.2 names separately. Each entry is a regular expression over the flow's own
 * source, so a screen cannot acquire one of them without failing here.
 */
const FORBIDDEN_IN_ONBOARDING: readonly { name: string; pattern: RegExp }[] = [
  { name: "chat box", pattern: /\bchat\s?box\b|\bchatbox\b/i },
  { name: "microphone", pattern: /\bmicrophone\b|getUserMedia|MediaRecorder|\bmic\b/i },
  { name: "tell me your situation", pattern: /tell (me|us) (your|about your) situation/i },
  { name: "ask anything", pattern: /ask anything/i },
  { name: "free-text biography", pattern: /\bbiograph|\babout yourself\b/i },
  { name: "company", pattern: /\b(your )?(company|employer) name\b|placeholder="Company"/i },
  { name: "job title", pattern: /\bjob title\b/i },
  { name: "family details", pattern: /\bfamily details\b/i },
  { name: "email requirement", pattern: /type="email"|\byour email\b|enter your email/i },
  { name: "full name", pattern: /\bfull name\b|\byour name\b(?!, email)/i },
  { name: "exact age", pattern: /\bexact age\b|\byour age\b/i },
  { name: "reason for distrust", pattern: /why (do|don't) you (trust|distrust)|reason for distrust/i },
  { name: "psychological label", pattern: /\banxious\b|\bavoidant\b|\bparanoid\b|\bphobi|\bdiagnos/i },
  { name: "the superseded posture option", pattern: /I hate it/i }
];

test("nothing WYS §9.2 forbids appears anywhere in the flow", () => {
  const offences: string[] = [];
  for (const relative of FLOW_FILES) {
    const source = code(relative);
    for (const forbidden of FORBIDDEN_IN_ONBOARDING) {
      if (forbidden.pattern.test(source)) offences.push(`${relative}: ${forbidden.name}`);
    }
  }
  assert.deepEqual(offences, [], "WYS §9.2 lists what onboarding may not show");
});

test("the flow collects no free text at all — no input, no textarea, no editable region", () => {
  const offences: string[] = [];
  for (const relative of FLOW_FILES) {
    const source = code(relative);
    for (const pattern of [/<input\b/i, /<textarea\b/i, /contentEditable/i, /<form\b/i]) {
      if (pattern.test(source)) offences.push(`${relative}: ${pattern}`);
    }
  }
  assert.deepEqual(offences, [], "onboarding is deterministic — a closed vocabulary and nothing typed");
});

test("the posture options are the four approved ones and the superseded one is gone", () => {
  assert.equal(POSTURE_OPTIONS.length, 4);
  for (const option of POSTURE_OPTIONS) {
    assert.doesNotMatch(option.label, /hate/i);
  }
});

/* -------------------------------------------------------------------------- */
/* §9.3 — the completion condition                                            */
/* -------------------------------------------------------------------------- */

test("the §9.3 takeaway is renderable and the flow renders it", () => {
  const resolved = resolveVariant(lessonZeroCompletionText, "short");
  assert.equal(resolved.kind, "text");
  if (resolved.kind !== "text") return;
  assert.equal(resolved.text, "Define the task first. Then remove what the task doesn't need.");

  // It must not be withheld: the one thing someone who leaves must still have
  // cannot be the one thing Q21 blocks.
  assert.equal(policyForCanonicalText(lessonZeroCompletionText).kind, "canon");
  assert.match(code(FLOW_FILES[0]), /lessonZeroCompletionText/);
  assert.match(code(FLOW_FILES[1]), /content\.completion/);
});

test("the first habit is WYS §9.1 item 4 and artboard 5a, character for character", () => {
  const resolved = resolveVariant(lessonZeroHabitText, "short");
  assert.equal(resolved.kind, "text");
  if (resolved.kind !== "text") return;
  assert.equal(
    resolved.text,
    "Before you tell AI something, ask: what does it actually need to know?"
  );
  assert.equal(policyForCanonicalText(lessonZeroHabitText).kind, "canon");
});

/* -------------------------------------------------------------------------- */
/* Provenance                                                                 */
/* -------------------------------------------------------------------------- */

test("every Lesson Zero record is registered, sourced, and never silently unattributed", () => {
  const registered = new Set(wysCanonicalRecords.map((record) => record.id));
  for (const record of lessonZeroCopyRecords) {
    assert.ok(registered.has(record.id), `${record.id} escapes the governance checks`);
    assert.ok(record.sourceIds.length > 0, `${record.id} cites no source`);
    assert.ok(record.status, `${record.id} has no status`);
    assert.ok(record.origin, `${record.id} has no origin`);
  }
});

test("the five undesigned steps render with a provenance mark, not as approved copy", () => {
  // `marked` is the honest slot for build-authored factual description: the
  // words render AND the §23 label renders with them. `canon` would attribute
  // them to Ben, and `blocked` would leave five empty screens.
  for (const id of [
    "lesson-zero-constructive-intent",
    "lesson-zero-human-source-first",
    "lesson-zero-first-habit-gloss",
    "lesson-zero-runtime-disclosure",
    "lesson-zero-plan-preview"
  ]) {
    const record = lessonZeroCopyRecords.find((candidate) => candidate.id === id);
    assert.ok(record, id);
    assert.equal(record.origin, "IMPLEMENTATION_PLACEHOLDER", `${id} claims a Ben origin`);
    assert.equal(policyForCanonicalText(record).kind, "marked", `${id} does not carry its label`);
  }
});

test("nothing in Lesson Zero is written in Ben's first person (R10)", () => {
  for (const record of lessonZeroCopyRecords) {
    for (const value of Object.values(record.variants)) {
      if (typeof value !== "string") continue;
      assert.doesNotMatch(value, /\bI\b|\bmy\b|\bI'(m|ve|ll|d)\b/i, `${record.id} speaks as Ben`);
    }
  }
});

test("the step 3 slot cannot be filled", () => {
  assert.equal(lessonZeroBenSlots.length, 1);
  const slot = lessonZeroBenSlots[0];
  assert.equal(slot.origin, "BEN_AUTHORED");
  assert.equal(slot.status, "draft");
  assert.equal("body" in slot, false);
  assert.equal("text" in slot, false);
  assert.ok(slot.emptyReferenceReason.length > 0);
  assert.deepEqual([...slot.surfaces], ["/watch-your-step/start"]);

  const registered = new Set(wysContentObjects.map((object) => object.id));
  assert.ok(registered.has(slot.id), "the slot escapes the governance checks");
});

/* -------------------------------------------------------------------------- */
/* One definition, many presentations (§6.8)                                  */
/* -------------------------------------------------------------------------- */

test("the pace vocabulary is imported from plan.ts, never retyped here", () => {
  const source = code("content/watch-your-step/lesson-zero.ts") + code(FLOW_FILES[1]);
  assert.doesNotMatch(source, /days a week/i, "the cadence labels have one home: ./plan.ts");
  assert.doesNotMatch(source, /About \d+ min/i, "the time labels have one home: ./plan.ts");

  assert.deepEqual(wysCadenceOptions.map((option) => option.id), [...WYS_CADENCES]);
  assert.deepEqual(wysTimeBudgetOptions.map((option) => option.id), [...WYS_TIME_BUDGETS]);
});

test("the runtime disclosure reuses the disclosure strip's own sentences", () => {
  // (plan Phase 7) "Step 6 runtime disclosure, worded identically to the
  // disclosure strip." Identical means the same record, not the same words
  // typed twice — so the page reads them from content/claims.ts.
  const page = code(FLOW_FILES[0]);
  assert.match(page, /claimById\("zero-ai"\)/);
  assert.match(page, /claimById\("ai-assisted-ben-approved"\)/);
  const module = code("content/watch-your-step/lesson-zero.ts");
  assert.doesNotMatch(module, /No chatbot, no coach/);
});

test("the exercise is the artboard's leaking-pipe scenario and its judgment", () => {
  const scenario = wysScenarioById(LESSON_ZERO_SCENARIO_ID);
  const judgment = wysJudgmentById(LESSON_ZERO_JUDGMENT_ID);
  assert.equal(scenario.id, "scn-repair-request");
  assert.ok(scenario.judgmentIds.includes(judgment.id));
  assert.equal(scenario.choices.length, 4);
  assert.deepEqual(scenario.choices.map((choice) => choice.key), ["A", "B", "C", "D"]);
});

/* -------------------------------------------------------------------------- */
/* Honesty of the data step, and of the telemetry                             */
/* -------------------------------------------------------------------------- */

test("the coarse-counts claim is state-bound, not asserted flatly (SC-2, Q7)", () => {
  // Q7's ratified default is full suppression: trackWys sends nothing unless
  // `bct_analytics_consent === "granted"`. The approved line is therefore false
  // for a visitor who declined, and plan R8 forbids fixing that in copy — so
  // the flow selects between two records from the consent state itself.
  const sent = resolveVariant(lessonZeroDataSentText, "short");
  const notSent = resolveVariant(lessonZeroDataNotSentText, "short");
  assert.equal(sent.kind, "text");
  assert.equal(notSent.kind, "text");
  if (sent.kind !== "text" || notSent.kind !== "text") return;
  assert.notEqual(sent.text, notSent.text);

  const flow = code(FLOW_FILES[1]);
  assert.match(flow, /analyticsConsentGranted/);
  assert.match(flow, /consentGranted \? content\.dataSent : content\.dataNotSent/);
});

test("the flow fires only allowlisted events, and only the two that belong to it", () => {
  const flow = code(FLOW_FILES[1]);
  const fired = [...flow.matchAll(/trackWys\(\s*"([a-z_]+)"/g)].map((match) => match[1]);
  assert.deepEqual(fired.sort(), ["wys_onboarding_complete", "wys_start"]);
  for (const name of fired) {
    assert.ok((WYS_EVENT_NAMES as readonly string[]).includes(name), `${name} is not allowlisted`);
  }
  // The exposure the §19.4 decision table records: the event name, and for
  // wys_start a route_type. Never the posture, the pace or the answer.
  assert.doesNotMatch(flow, /trackWys\([^)]*posture/i);
  assert.doesNotMatch(flow, /trackWys\([^)]*cadence/i);
  assert.doesNotMatch(flow, /trackWys\([^)]*timeBudget/i);
});

test("the flow writes only declared onboarding fields, and no step index", () => {
  const flow = code(FLOW_FILES[1]);
  for (const field of ["postureChoice", "cadence", "timeBudget", "completed"]) {
    assert.match(flow, new RegExp(field), `${field} is a declared onboarding field and is written`);
  }
  // §7.1: the shape does not grow. A remembered step would be a new field.
  assert.doesNotMatch(flow, /onboarding:\s*{[^}]*\bstep\b/);
  assert.doesNotMatch(flow, /screenIndex\s*[:,]\s*screenIndex/);
});

/* -------------------------------------------------------------------------- */
/* Nothing that scores, ranks or nags (WYS §13, §37)                          */
/* -------------------------------------------------------------------------- */

test("no streak, score, percentage, badge or guilt copy reaches the flow", () => {
  const offences: string[] = [];
  const forbidden = /\bstreak\b|\bXP\b|\bbadge\b|\blevel \d|\branking\b|\bbehind\b|\boverdue\b|\bmissed\b|\bkeep it up\b/i;
  for (const relative of FLOW_FILES) {
    if (forbidden.test(code(relative))) offences.push(relative);
  }
  assert.deepEqual(offences, []);
});

test("the labels the artboard draws are its own words", () => {
  assert.equal(lessonZeroLabels.flowName, "Lesson Zero");
  assert.equal(lessonZeroLabels.continueLabel, "Continue");
  assert.equal(lessonZeroLabels.showPlan, "Show my plan");
  assert.equal(lessonZeroLabels.firstHabitEyebrow, "THE FIRST HABIT");
  assert.equal(lessonZeroLabels.cadenceHeading, "How often?");
  assert.equal(lessonZeroLabels.timeHeading, "How long each time?");
  assert.equal(lessonZeroLabels.dataEyebrow, "BEFORE YOU START · DATA");
  assert.equal(lessonZeroLabels.dataPageLink, "See the full data page");
  assert.equal(lessonZeroLabels.dataPageHref, "/watch-your-step/data");
});

test("the time-depth line is the artboard's, and step 10 renders it rather than a paraphrase", () => {
  const resolved = resolveVariant(lessonZeroTimeDepthText, "short");
  assert.equal(resolved.kind, "text");
  if (resolved.kind !== "text") return;
  assert.equal(
    resolved.text,
    "More time adds depth to each source. It doesn't move you through Ben's recordings faster."
  );
  const flow = code(FLOW_FILES[1]);
  assert.equal((flow.match(/content\.timeDepth/g) ?? []).length, 2, "steps 7-9 and 10 both render it");
});
