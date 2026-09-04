import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { RENDER_MARKED_DRAFT } from "@/lib/content-status";
import { WYS_EVENT_NAMES } from "@/lib/wys/telemetry";
import { emptyWysState, type WysLocalStateV1 } from "@/lib/wys/local-state";
import { visitId, visitPositionFor } from "@/lib/wys/visit";
import { gatedCanonicalText, isShowable } from "@/lib/wys/content-gate";
import { disagreementText, wysLabels } from "@/content/watch-your-step/copy";
import {
  aboutMinutesLabel,
  todayCoreScenarioId,
  todayLabels,
  todayTranscriptSlot,
  todayWatchLeadText
} from "@/content/watch-your-step/today";
import { wysCarries } from "@/content/watch-your-step/carries";
import { stopCount } from "@/content/watch-your-step/weeks";
import {
  currentTodayStop,
  currentTodayStopId,
  defaultTodayStop,
  todayStops
} from "@/app/watch-your-step/(shell)/today/current-stop";
import { todayStopViews } from "@/app/watch-your-step/(shell)/today/view";

/**
 * Phase 7 — Today, the WATCH → TRY → JUDGE → CARRY loop (plan Phase 7;
 * WYS §10; mockup 5b).
 *
 * There is no DOM and no renderer in this suite (Q15, ratified at manual QA),
 * so every assertion is about something that CAN be checked without one: the
 * pure derivation behind "which stop", the gate that decides whether a word may
 * render at all, the completion rule the CARRY mark implements, and the closed
 * vocabularies the screen is forbidden to grow — no streak, no score, no free
 * text, no event off the §19.4 allowlist.
 */

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const todayDir = path.join(repoRoot, "app", "watch-your-step", "(shell)", "today");

function read(relative: string): string {
  return readFileSync(path.join(todayDir, relative), "utf8");
}

/** Source with its comments removed — a doc block explaining a rule is not a breach of it. */
function code(relative: string): string {
  return read(relative)
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^\s*\/\/.*$/gm, " ");
}

function todaySources(): { name: string; source: string }[] {
  return readdirSync(todayDir)
    .filter((name) => name.endsWith(".tsx") || name.endsWith(".ts") || name.endsWith(".css"))
    .map((name) => ({ name, source: read(name) }));
}

function progressWith(completedLessonIds: string[]): WysLocalStateV1["progress"] {
  return { ...emptyWysState().progress, completedLessonIds };
}

/* -------------------------------------------------------------------------- */
/* The route exists, is static, and carries no learner state                  */
/* -------------------------------------------------------------------------- */

test("the Today route ships at /watch-your-step/today with the metadata convention", () => {
  assert.ok(existsSync(path.join(todayDir, "page.tsx")), "Today has no page file");
  const page = read("page.tsx");
  assert.match(page, /title: "Today - BenChanTech"/);
  assert.match(page, /alternates: \{ canonical: "\/watch-your-step\/today" \}/);
  assert.equal(/description:/.test(page), false, "a description would be a new convention");
});

test("Today reads no route parameter and no search parameter (§8.5)", () => {
  // The only dynamic course segment is /stop/[stopId], which is content data.
  // A learner's position on Today is derived in the browser and never routed on,
  // so nothing private can reach a URL, a referrer or GA4's page_location.
  for (const { name, source } of todaySources()) {
    assert.equal(/searchParams/.test(source), false, `${name} reads a search parameter`);
    assert.equal(/useSearchParams/.test(source), false, `${name} reads a search parameter`);
  }
});

/* -------------------------------------------------------------------------- */
/* Which stop — the derivation (plan §5.3, §5.4)                              */
/* -------------------------------------------------------------------------- */

test("Lesson Zero is not a Today stop, and the count stays derived", () => {
  const ids = todayStops().map((stop) => stop.id);
  assert.equal(ids.includes("stop-zero"), false, "Lesson Zero is the /start flow, not a Today visit");
  assert.equal(todayStops().length, stopCount() - 1);
  assert.ok(todayStops().length > 0);
});

test("a learner with no progress is on the first lettered stop", () => {
  const empty = emptyWysState().progress;
  assert.equal(currentTodayStopId(empty), defaultTodayStop()?.id);
  assert.equal(currentTodayStopId(empty), "stop-a");
});

test("finishing every visit of a stop moves Today to the next stop", () => {
  const first = todayStops()[0];
  const path2 = visitPositionFor(first, emptyWysState().progress).path;
  const done = progressWith(path2.map((dayPlanId) => visitId(first.id, dayPlanId)));

  assert.equal(visitPositionFor(first, done).complete, true);
  assert.equal(currentTodayStopId(done), todayStops()[1].id);
});

test("one finished visit advances the counter without advancing the stop", () => {
  const first = todayStops()[0];
  const [firstDay] = visitPositionFor(first, emptyWysState().progress).path;
  const done = progressWith([visitId(first.id, firstDay)]);

  const position = visitPositionFor(first, done);
  assert.equal(position.visit, 2, "the mark did not advance the visit");
  assert.equal(position.complete, false);
  assert.equal(currentTodayStopId(done), first.id, "the stop advanced a visit too early");
});

test("a learner who has finished everything stays on the last stop, never past it", () => {
  const ids: string[] = [];
  for (const stop of todayStops()) {
    for (const dayPlanId of visitPositionFor(stop, emptyWysState().progress).path) {
      ids.push(visitId(stop.id, dayPlanId));
    }
  }
  const done = progressWith(ids);
  const last = todayStops()[todayStops().length - 1];
  assert.equal(currentTodayStop(done)?.id, last.id);
});

test("the visit id is qualified by its stop, so one stop's mark cannot advance another", () => {
  const [first, second] = todayStops();
  const [firstDay] = visitPositionFor(first, emptyWysState().progress).path;
  const done = progressWith([visitId(first.id, firstDay)]);
  assert.equal(visitPositionFor(second, done).visit, 1, "a bare day-plan id leaked across stops");
});

/* -------------------------------------------------------------------------- */
/* WATCH (WYS §10)                                                            */
/* -------------------------------------------------------------------------- */

test("the WATCH caption is the approved artboard sentence and it renders", () => {
  assert.equal(
    todayWatchLeadText.variants.short,
    "Watch the whole thing first. Ben's own words come before any explanation."
  );
  const view = todayStopViews()[0];
  assert.ok(view.watchLead, "the WATCH caption is withheld — it is approved copy and must render");
  assert.equal(isShowable(view.watchLead), true);
});

test("the WATCH slot and the transcript are labelled empty slots that cannot be filled", () => {
  // §6.4: MediaSlot / BenSlot take a label and an awaited-asset descriptor and
  // declare children/text/body as `never`. The card must therefore pass neither.
  const watch = read("WatchCard.tsx");
  assert.ok(watch.includes("wysLabels.watchSlotOverlay"), "the overlay pill is not read from the slot record");
  assert.ok(watch.includes("wysLabels.watchSlotMono"), "the mono caption is not read from the slot record");
  assert.equal(wysLabels.watchSlotOverlay, "Ben source · video · 6:40");
  assert.equal(wysLabels.watchSlotMono, "slot: Ben-selected recording");

  assert.equal(todayTranscriptSlot.status, "draft");
  assert.equal(todayTranscriptSlot.origin, "BEN_AUTHORED");
  assert.ok(todayTranscriptSlot.emptyReferenceReason.length > 0);
  assert.ok(watch.includes("<BenSlot"), "the transcript does not open onto a Ben slot");
  assert.ok(watch.includes("<details"), "the transcript is not an inline expandable block");
});

test("the play disc is decoration, never a control for a recording that does not exist", () => {
  const watch = read("WatchCard.tsx");
  assert.ok(watch.includes("<PlayDisc"), "artboard 5b draws a 56px disc inside the slot");
  assert.equal(/<button/.test(watch), false, "the WATCH card offers a control with nothing behind it");
  assert.ok(read("today.module.css").includes("pointer-events: none"));
});

/* -------------------------------------------------------------------------- */
/* TRY / JUDGE (WYS §10)                                                      */
/* -------------------------------------------------------------------------- */

test("the exercise a stop shows is a content decision, and stop A matches artboard 5b", () => {
  // (WYS §35 decision 9) is Ben's, and §35 requires that changing it be a
  // content edit. The pin is data; every other stop falls through to its own list.
  for (const stop of todayStops()) {
    const id = todayCoreScenarioId(stop);
    if (id === null) {
      assert.equal(stop.tryScenarioIds.length, 0, `${stop.id} has a bank but shows nothing`);
      continue;
    }
    assert.ok(stop.tryScenarioIds.includes(id), `${stop.id} shows a scenario outside its own bank`);
  }
  assert.equal(todayCoreScenarioId(todayStops()[0]), "scn-group-chat");
});

test("Commit is never typed, and the pinned label is the 5b form (Q17 ink, not teal)", () => {
  const page = code("page.tsx");
  assert.ok(page.includes("judgeLabels.commit"), "the Commit label is not read from content");
  assert.ok(page.includes("judgeLabels.reset"), "Reset renders on this breakpoint too (R9)");
  assert.equal(/Commit/.test(page.replace(/judgeLabels\.commit/g, "")), false, "a Commit label is typed here");
  // The fill itself is ActionPill's: `variant="ink"` inside JudgeCard. Today may
  // not reach past it to recolour the pill teal the way artboard 5b draws it.
  assert.equal(/variant="teal"/.test(page), false, "Today recoloured a pill against Q17");
});

test("the disagreement note is attached to the exercise, verbatim", () => {
  assert.equal(
    disagreementText.variants.short,
    "Disagreeing with Ben is fine. Agreement isn't the score."
  );
  // The note is `published` canon and renders whenever the exercise does. Under
  // Q21's ratified default the exercise is withheld, so the assertion is on the
  // wiring, not on the pixels — and it flips with the constant, not with an
  // edit here.
  const note = gatedCanonicalText(disagreementText, "short");
  assert.ok(note, "the disagreement note stopped resolving");
  assert.equal(isShowable(note), true);

  const view = todayStopViews()[0];
  assert.ok(view.judge, "the first stop draws no exercise");
  if (view.judge.exercise) {
    assert.ok(view.judge.exercise.note, "the note under Commit is missing");
    assert.equal(isShowable(view.judge.exercise.note), true);
  }
});

test("a withheld scenario draws no choices at all — not four bare draft labels", () => {
  // Found at the Phase 7 gate, in the rendered HTML: Today gated the setting,
  // drew "Implementation placeholder — not Ben's words", and then rendered the
  // four choice labels underneath in full. `choices[].label` is a bare string
  // on its way to `ChoiceRow`, so it cannot be half-withheld: the honest states
  // are the whole exercise or none of it (`allShowable`).
  for (const view of todayStopViews()) {
    if (!view.judge) continue;
    if (isShowable(view.judge.setting)) continue;
    assert.equal(
      view.judge.exercise,
      null,
      `${view.id} serialises an exercise for a scenario whose prose is withheld`
    );
  }

  // And the TRY card itself still renders — the slot says what it is waiting
  // for rather than vanishing.
  assert.ok(
    code("page.tsx").includes("<ScenarioCard"),
    "the TRY card must render even when its exercise does not"
  );
});

test("Today ships no distribution card — there are no numbers to show (§6.5, Q11/Q12)", () => {
  const page = code("page.tsx");
  assert.equal(/distribution/i.test(page), false);
  for (const view of todayStopViews()) {
    assert.equal("distribution" in (view.judge?.exercise ?? {}), false);
  }
});

/* -------------------------------------------------------------------------- */
/* CARRY and completion (WYS §10 CARRY, §13)                                  */
/* -------------------------------------------------------------------------- */

test("no carry Today can render requires reporting", () => {
  const byId = new Map<string, (typeof wysCarries)[number]>(wysCarries.map((carry) => [carry.id, carry]));
  for (const view of todayStopViews()) {
    if (!view.carry) continue;
    const carry = byId.get(view.carry.carryId);
    assert.ok(carry, `${view.id} names a carry that does not exist`);
    assert.equal(carry.reportingRequired, false, `${carry.id} asks for a report`);
    assert.ok(carry.doNotSendBack.length > 0);
  }
});

test("the CARRY mark is intentional, and asks for nothing back", () => {
  const mark = code("CarryMark.tsx");
  assert.ok(mark.includes("todayLabels.carryMark"));
  assert.equal(todayLabels.carryMark, "I did it");
  // Completion is a press. Nothing on this screen may count a scroll, a timer
  // or a page view as having done anything (WYS §13).
  for (const forbidden of ["setTimeout", "setInterval", "IntersectionObserver", "scroll"]) {
    assert.equal(mark.includes(forbidden), false, `the mark counts "${forbidden}" as completion`);
  }
  // No reporting surface of any kind.
  for (const { name, source } of todaySources()) {
    for (const forbidden of ["<textarea", "<input", "contentEditable", "MediaRecorder", "getUserMedia"]) {
      assert.equal(source.includes(forbidden), false, `${name} collects free input`);
    }
  }
});

test("the mark writes only declared progress fields", () => {
  const mark = code("CarryMark.tsx");
  assert.ok(mark.includes("completedCarryIds"), "the carry is not recorded");
  assert.ok(mark.includes("completedLessonIds"), "the visit is not recorded");
  assert.ok(mark.includes("visitId("), "the visit id is built some other way");
  for (const undeclared of ["localStorage.setItem", "sessionStorage", "document.cookie", "fetch("]) {
    assert.equal(mark.includes(undeclared), false, `the mark reaches for ${undeclared}`);
  }
});

/* -------------------------------------------------------------------------- */
/* Telemetry (WYS §19.4)                                                      */
/* -------------------------------------------------------------------------- */

test("Today fires only allowlisted events, at the points §19.4 names", () => {
  const fired = new Set<string>();
  for (const { source } of todaySources()) {
    for (const match of source.matchAll(/trackWys\(\s*"([a-z_]+)"/g)) fired.add(match[1]);
  }
  assert.deepEqual([...fired].sort(), ["wys_carry_reached", "wys_source_period_complete"]);
  for (const name of fired) {
    assert.ok((WYS_EVENT_NAMES as readonly string[]).includes(name), `${name} is off the allowlist`);
  }
  // wys_source_period_start is fired by the shared StopStartTelemetry, which
  // Today mounts rather than reimplementing.
  assert.ok(read("page.tsx").includes("<StopStartTelemetry"));
});

test("wys_carry_reached fires on reaching the card, never on marking it", () => {
  const mark = read("CarryMark.tsx");
  const reached = mark.indexOf("wys_carry_reached");
  const onMark = mark.indexOf("function onMark");
  assert.ok(reached > 0 && onMark > 0);
  assert.ok(reached < onMark, "the reached event moved into the click handler");
});

/* -------------------------------------------------------------------------- */
/* No streak, no score, no guilt (WYS §12, §13)                               */
/* -------------------------------------------------------------------------- */

test("Today holds no word a guilt state could be built from", () => {
  const forbidden = [
    "streak",
    "badge",
    "percent",
    "behind",
    "overdue",
    "missed",
    "xp",
    "level up",
    "score"
  ];
  const offences: string[] = [];
  for (const { name, source } of todaySources()) {
    const code = source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
    for (const word of forbidden) {
      if (new RegExp(`\\b${word}`, "i").test(code)) offences.push(`${name}: ${word}`);
    }
  }
  assert.deepEqual(offences, []);
});

/* -------------------------------------------------------------------------- */
/* Provenance — the Q21 consequence, asserted rather than assumed             */
/* -------------------------------------------------------------------------- */

test("under Q21's default every draft record on Today renders as its label, not its prose", () => {
  assert.equal(RENDER_MARKED_DRAFT, false, "Q21's ratified default changed — re-read this test");

  for (const view of todayStopViews()) {
    assert.equal(view.title.policy.kind, "blocked", `${view.id}'s scaffold title is public`);
    assert.ok(view.title.label.length > 0, "a blocked record renders no label");
    if (view.judge) {
      assert.equal(view.judge.setting.policy.kind, "blocked");
      assert.equal(view.judge.decisionMoment.policy.kind, "blocked");
      // Blocked prose means no runnable exercise, so there is no judgment to
      // check the policy of — that IS the check.
      assert.equal(view.judge.exercise, null);
    }
    if (view.carry) assert.equal(view.carry.behavior.policy.kind, "blocked");
  }
});

test("withheld prose does not cross the client boundary", () => {
  // JudgeCard is a client component, so anything handed to it is serialized into
  // the page's flight payload, which ships inside the static HTML. "The words
  // are not in the DOM" has to survive that, so `gateProse` empties the text of
  // a blocked record at the gate (`withoutBlockedProse`) and the withheld
  // exercise is not serialized at all.
  for (const view of todayStopViews()) {
    assert.equal(view.title.text, "", "a blocked stop title reached a client prop");
    if (!view.judge) continue;
    assert.equal(view.judge.setting.text, "", "blocked scenario prose reached a client prop");
    assert.ok(view.judge.setting.label.length > 0, "the label was redacted with the prose");
    if (view.judge.exercise) {
      assert.equal(view.judge.exercise.judgment.content.text, "", "blocked judgment prose reached a client prop");
    }
  }
});

test("the judgment header never asserts Ben wrote the body beneath it", () => {
  for (const view of todayStopViews()) {
    if (!view.judge?.exercise) continue;
    assert.equal(view.judge.exercise.judgment.surfaceTitle, wysLabels.judgmentSurfaceTitle);
    assert.equal(view.judge.exercise.judgment.slotState, wysLabels.judgmentSlotState);
  }
});

/* -------------------------------------------------------------------------- */
/* The lead line and the one redirect                                         */
/* -------------------------------------------------------------------------- */

test("the time budget renders as depth, in the learner's own units", () => {
  assert.equal(aboutMinutesLabel("5"), "About 5 minutes.");
  assert.equal(aboutMinutesLabel("10"), "About 10 minutes.");
  assert.equal(aboutMinutesLabel("15"), "About 15 minutes.");
  assert.equal(aboutMinutesLabel("20plus"), "About 20+ minutes.");
});

test("Today owns the one state-dependent redirect, and it points at Lesson Zero", () => {
  const redirect = code("OnboardingRedirect.tsx");
  assert.ok(redirect.includes('router.replace("/watch-your-step/start")'));
  const others = todaySources().filter((file) => file.name !== "OnboardingRedirect.tsx");
  for (const { name, source } of others) {
    assert.equal(/router\.(replace|push)\(/.test(source), false, `${name} adds a second redirect`);
  }
});
