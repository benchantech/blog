import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  currentPlanRow,
  planRows,
  type PlanStopView
} from "@/app/watch-your-step/(shell)/plan/plan-model";
import {
  optionalPracticeNames,
  planDaySummaries,
  planStopViews,
  stopMark,
  withheldLabels
} from "@/app/watch-your-step/(shell)/plan/plan-content";
import {
  cadenceOption,
  pacePillLabel,
  planLabels,
  timeBudgetOption,
  wysCadenceOptions,
  wysTimeBudgetOptions
} from "@/content/watch-your-step/plan";
import { wysLabels } from "@/content/watch-your-step/copy";
import { WYS_CADENCES, WYS_TIME_BUDGETS, emptyWysState, type WysLocalStateV1 } from "@/lib/wys/local-state";
import { WYS_STOP_IDS, wysWeeks } from "@/content/watch-your-step/weeks";
import type { WysWeek } from "@/content/watch-your-step/types";
import { visitId } from "@/lib/wys/visit";
import { isShowable } from "@/lib/wys/content-gate";
import { RENDER_MARKED_DRAFT } from "@/lib/content-status";

/**
 * The Plan view (plan Phase 7; WYS §12; mockup 5b Plan).
 *
 * The screen's promises are all NEGATIVE — no "behind", no guilt, no
 * percentage, no streak — and a negative promise is exactly the kind that
 * survives review and dies in the next commit. So they are asserted two ways:
 * over the pure model (there is no state a lapse can move a row into, because
 * the model has no clock) and over the route's source files (there is no
 * vocabulary to build one out of).
 *
 * `page.tsx` imports a `.module.css` and therefore cannot be imported by the
 * node runner; it is asserted by reading it. Everything else is a real import.
 */

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const routeDir = path.join(repoRoot, "app", "watch-your-step", "(shell)", "plan");

function routeFile(name: string): string {
  return readFileSync(path.join(routeDir, name), "utf8");
}

/* -------------------------------------------------------------------------- */
/* The route exists, with the repo's metadata convention                      */
/* -------------------------------------------------------------------------- */

test("the route serves /watch-your-step/plan from the (shell) group", () => {
  assert.ok(existsSync(path.join(routeDir, "page.tsx")), "no page.tsx at app/watch-your-step/(shell)/plan");
  assert.ok(existsSync(path.join(routeDir, "plan.module.css")), "the Plan view has no scoped stylesheet");
});

test("metadata is title-only plus a canonical URL (plan §5.2)", () => {
  const source = routeFile("page.tsx");
  assert.match(source, /title: "Plan - BenChanTech"/);
  assert.match(source, /alternates: \{ canonical: "\/watch-your-step\/plan" \}/);
  assert.ok(
    !/description:/.test(source),
    "adding `description` to a new route changes the repo's metadata convention (plan §5.2)"
  );
});

/* -------------------------------------------------------------------------- */
/* The three row states, and no fourth                                        */
/* -------------------------------------------------------------------------- */

const stops = planStopViews();
const summaries = planDaySummaries();

function stateWith(completed: string[]): WysLocalStateV1 {
  const state = emptyWysState();
  state.progress.completedLessonIds = completed;
  return state;
}

/** Every visit id of one stop at one cadence — i.e. "this stop is finished". */
function finish(stopId: string, dayPlanIds: readonly string[]): string[] {
  return dayPlanIds.map((dayPlanId) => visitId(stopId, dayPlanId));
}

test("the stops are the curriculum, in order, with derived marks", () => {
  assert.deepEqual(
    stops.map((stop) => stop.id),
    [...WYS_STOP_IDS],
    "Plan renders every stop the content model declares, in curriculum order"
  );
  assert.deepEqual(
    stops.map((stop) => stop.mark),
    ["0", "A", "B", "C", "D", "E", "F", "G", "H"],
    "the leading cell is derived from `order`, never typed"
  );
  for (const stop of stops) {
    assert.equal(stop.href, `/watch-your-step/stop/${stop.id}`, "every row deep-links to the per-stop route");
  }
});

test("unread state renders the whole plan with nothing marked (§5.4, §7.3)", () => {
  const rows = planRows(stops, emptyWysState(), false, summaries);
  assert.equal(rows.length, stops.length);
  assert.ok(
    rows.every((row) => row.state === "future"),
    "the server HTML and the first client render must not guess a current stop"
  );
  assert.ok(rows.every((row) => row.visit === null && row.next === null), "no numerals before state is read");
  assert.equal(currentPlanRow(rows), null, "no dark card until local state has loaded");
});

test("a learner with no progress is at Lesson Zero, and nothing is marked done", () => {
  const rows = planRows(stops, emptyWysState(), true, summaries);
  const current = currentPlanRow(rows);
  assert.ok(current, "an empty state still has a current stop — the first one");
  assert.equal(current.stop.id, "stop-zero");
  assert.equal(current.visit, "visit 1 of 1");
  assert.equal(current.next, summaries["day-lesson-zero"]);
  assert.equal(rows.filter((row) => row.state === "done").length, 0);
});

test("current is the FIRST INCOMPLETE stop, and a skipped stop is never marked missed", () => {
  // Finish stop D only. A "furthest reached" model would put the learner at E
  // and would have to call zero..C something — skipped, behind, missed.
  const stopD = stops.find((stop) => stop.id === "stop-d");
  assert.ok(stopD);
  const rows = planRows(stops, stateWith(finish("stop-d", stopD.cadencePaths.days2)), true, summaries);

  const current = currentPlanRow(rows);
  assert.equal(current?.stop.id, "stop-zero", "the plan puts the learner back at the first unfinished stop");
  assert.equal(
    rows.find((row) => row.stop.id === "stop-d")?.state,
    "done",
    "a stop finished out of order is still done"
  );
  assert.deepEqual(
    [...new Set(rows.map((row) => row.state))].sort(),
    ["current", "done", "future"],
    "three row states, and no fourth"
  );
});

test("the visit position on the current row follows the learner's cadence", () => {
  const stopA = stops.find((stop) => stop.id === "stop-a");
  const stopZero = stops.find((stop) => stop.id === "stop-zero");
  assert.ok(stopA && stopZero);

  const done = finish("stop-zero", stopZero.cadencePaths.days2);

  const twoDay = stateWith(done);
  twoDay.onboarding.cadence = "2";
  assert.equal(currentPlanRow(planRows(stops, twoDay, true, summaries))?.visit, "visit 1 of 2");

  const fiveDay = stateWith(done);
  fiveDay.onboarding.cadence = "5";
  const fiveRow = currentPlanRow(planRows(stops, fiveDay, true, summaries));
  assert.equal(fiveRow?.stop.id, "stop-a");
  assert.equal(fiveRow?.visit, "visit 1 of 5");
  assert.equal(fiveRow?.next, summaries[stopA.cadencePaths.days5[0]]);

  // "Most days" is undeclared on every week and falls back to days5 (§5.3), so
  // the counter renders rather than throwing.
  const mostDays = stateWith(done);
  mostDays.onboarding.cadence = "most";
  assert.equal(currentPlanRow(planRows(stops, mostDays, true, summaries))?.visit, "visit 1 of 5");
});

test("the current row advances a visit at a time and never overruns", () => {
  const stopZero = stops.find((stop) => stop.id === "stop-zero");
  const stopA = stops.find((stop) => stop.id === "stop-a");
  assert.ok(stopZero && stopA);

  const partial = stateWith([
    ...finish("stop-zero", stopZero.cadencePaths.days2),
    visitId("stop-a", stopA.cadencePaths.days2[0])
  ]);
  partial.onboarding.cadence = "2";
  const row = currentPlanRow(planRows(stops, partial, true, summaries));
  assert.equal(row?.visit, "visit 2 of 2");
  assert.equal(row?.next, summaries[stopA.cadencePaths.days2[1]]);
});

test("stop F is off-site: no visit counter, and the tag the artboard draws", () => {
  const stopF = stops.find((stop) => stop.id === "stop-f");
  assert.ok(stopF?.offSite, "stop F carries `offSite` as data, not as a component branch");

  const future = planRows(stops, emptyWysState(), true, summaries).find((row) => row.stop.id === "stop-f");
  assert.equal(future?.tag, "offSite");

  // Make F current by finishing everything before it.
  const completed = stops
    .slice(0, stops.findIndex((stop) => stop.id === "stop-f"))
    .flatMap((stop) => finish(stop.id, stop.cadencePaths.days2));
  const current = currentPlanRow(planRows(stops, stateWith(completed), true, summaries));
  assert.equal(current?.stop.id, "stop-f");
  assert.equal(current.visit, null, "an off-site stop is one visit by rule (WYS §15.2) — nothing to count");
  assert.equal(current.tag, "offSite");
});

test("stop H is the terminal row until it is done, and then it is done", () => {
  const stopH = stops.find((stop) => stop.id === "stop-h");
  assert.ok(stopH?.terminal);
  assert.equal(planLabels.terminalTag, wysLabels.terminalTag, "'the end' has one definition");

  const future = planRows(stops, emptyWysState(), true, summaries).find((row) => row.stop.id === "stop-h");
  assert.equal(future?.tag, "terminal");

  const everything = stops.flatMap((stop) => finish(stop.id, stop.cadencePaths.days2));
  const rows = planRows(stops, stateWith(everything), true, summaries);
  assert.equal(rows.find((row) => row.stop.id === "stop-h")?.tag, "done", "state beats structure on one tag");
});

test("a finished course has no current row and invites no second lap", () => {
  const everything = stops.flatMap((stop) => finish(stop.id, stop.cadencePaths.days2));
  const rows = planRows(stops, stateWith(everything), true, summaries);
  assert.ok(rows.every((row) => row.state === "done"));
  assert.equal(currentPlanRow(rows), null);
});

/* -------------------------------------------------------------------------- */
/* (WYS §12)'s prohibitions, asserted as absence                              */
/* -------------------------------------------------------------------------- */

/**
 * The vocabulary (WYS §12) forbids.
 *
 * Checked over the CODE of every file on the route, comments stripped first.
 * The comments necessarily quote the prohibitions — they are the reason the
 * files are shaped the way they are — and a scan that could not tell a rule
 * from its use would be answered by deleting the explanation, which is the
 * wrong repair.
 */
const FORBIDDEN = [
  "behind",
  "overdue",
  "missed",
  "streak",
  "percent",
  "%",
  "xp",
  "badge",
  "score",
  "keep it up",
  "well done"
];

/** Source with `/* *\/` and `//` comments removed, lower-cased. */
function code(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^\s*\/\/.*$/gm, " ")
    .toLowerCase();
}

function offencesIn(source: string, words: readonly string[]): string[] {
  const body = code(source);
  return words.filter((word) => (word === "%" ? body.includes("%") : new RegExp(`\\b${word}`).test(body)));
}

test("no behind state, no streak, no percentage, no guilt vocabulary", () => {
  const files = ["page.tsx", "PlanStops.tsx", "plan-model.ts", "plan-content.ts", "plan.module.css"];
  const offences = files.flatMap((name) =>
    offencesIn(routeFile(name), FORBIDDEN).map((word) => `${name}: ${word}`)
  );

  assert.deepEqual(
    offences,
    [],
    "(WYS §12): no artificial 'behind' state, no guilt for missed days, no score"
  );
});

test("the Plan content module holds no word a guilt state could be built from", () => {
  const source = readFileSync(path.join(repoRoot, "content", "watch-your-step", "plan.ts"), "utf8");
  assert.deepEqual(offencesIn(source, FORBIDDEN), [], "the vocabulary is not there to be rendered");
});

test("the model has no clock: two learners with the same progress get the same plan", () => {
  const stopZero = stops.find((stop) => stop.id === "stop-zero");
  assert.ok(stopZero);
  const progress = finish("stop-zero", stopZero.cadencePaths.days2);

  const today = stateWith(progress);
  today.lastOpenedAt = new Date().toISOString();
  today.startedAt = new Date().toISOString();

  const lapsed = stateWith(progress);
  lapsed.lastOpenedAt = "2024-01-01T00:00:00.000Z";
  lapsed.startedAt = "2023-01-01T00:00:00.000Z";

  assert.deepEqual(
    planRows(stops, lapsed, true, summaries).map((row) => [row.state, row.tag, row.visit]),
    planRows(stops, today, true, summaries).map((row) => [row.state, row.tag, row.visit]),
    "a lapse of a year changes nothing — there is no state for it to move a row into"
  );
});

/* -------------------------------------------------------------------------- */
/* Provenance                                                                 */
/* -------------------------------------------------------------------------- */

test("every stop title arrives gated, and is withheld while Q21's default holds", () => {
  for (const stop of stops) {
    assert.equal(stop.title.surfaceKind, "general");
    assert.ok(stop.title.label.length > 0, "a gated string always carries its computed label");
  }

  if (!RENDER_MARKED_DRAFT) {
    assert.ok(
      stops.every((stop) => !isShowable(stop.title)),
      "stop titles are draft implementation scaffold (WYS §11) and do not render publicly"
    );
    assert.deepEqual(
      withheldLabels(stops.map((stop) => stop.title)),
      ["Implementation placeholder — not Ben's words"],
      "nine records, one status, one origin — therefore one label, rendered once"
    );
  }
});

test("the page renders no stop title of its own", () => {
  const rendered = routeFile("page.tsx") + routeFile("PlanStops.tsx") + routeFile("plan-content.ts");
  for (const title of ["Task Before Prompt", "Hidden Exposure", "Start With Distrust"]) {
    assert.ok(!rendered.includes(title), `the Plan view types the stop title "${title}" instead of gating it`);
  }
});

test("the withheld-label grouping keeps distinct labels distinct", () => {
  const one = stops[0].title;
  const other = { ...one, label: "Approved by Ben" as typeof one.label };
  assert.deepEqual(withheldLabels([one, one]), [one.label], "one label for a group that agrees");
  if (!isShowable(one)) {
    assert.equal(withheldLabels([one, other]).length, 2, "two labels the day the records disagree");
  }
});

/* -------------------------------------------------------------------------- */
/* The optional-practices block (WYS §12's fifth row, NEW)                    */
/* -------------------------------------------------------------------------- */

test("Plan shows optional practices, deduplicated across stops", () => {
  const practices = optionalPracticeNames();
  assert.ok(practices.length > 0, "(WYS §12) requires Plan to show optional practices");

  // Deduplication is by ritual ID, checked against the content data — not by
  // rendered text. Under Q21's default every ritual name is blocked and the
  // gate empties the prose, so comparing strings would compare seven empty
  // strings and report a collision that is not one. The count the content
  // declares is the fact this test is about.
  // Widened through the declared interface: `wysWeeks` is an `as const`
  // literal, and an optional field absent from every literal member does not
  // exist on the inferred type at all (the trap Phase 6 recorded).
  const weeks: readonly WysWeek[] = wysWeeks;
  const declared = new Set<string>();
  for (const week of weeks) for (const id of week.optionalPracticeIds ?? []) declared.add(id);
  assert.equal(practices.length, declared.size, "From Memory is one practice, not seven");

  assert.ok(
    routeFile("page.tsx").includes("optionalPracticesHeading"),
    "the optional-practices block is rendered, not merely derived"
  );
});

/* -------------------------------------------------------------------------- */
/* The pace vocabulary — one node, two presentations                          */
/* -------------------------------------------------------------------------- */

test("the pace vocabulary is total over the declared cadences and time budgets", () => {
  assert.deepEqual(
    wysCadenceOptions.map((option) => option.id),
    [...WYS_CADENCES],
    "every cadence `wys:v1` accepts has a label"
  );
  assert.deepEqual(
    wysTimeBudgetOptions.map((option) => option.id),
    [...WYS_TIME_BUDGETS],
    "every time budget `wys:v1` accepts has a label"
  );
  for (const cadence of WYS_CADENCES) assert.ok(cadenceOption(cadence).optionLabel.length > 0);
  for (const budget of WYS_TIME_BUDGETS) assert.ok(timeBudgetOption(budget).optionLabel.length > 0);
});

test("the pace pill reads as the artboard draws it, and is absent when unchosen", () => {
  assert.equal(pacePillLabel("3", "10"), "3 days · ~10 min", "artboard 5b, dc.html:103");
  assert.equal(pacePillLabel(undefined, undefined), null, "no pace chosen renders no pill");
  assert.equal(pacePillLabel("2", undefined), "2 days", "half a choice renders half a pill");
  assert.equal(pacePillLabel(undefined, "20plus"), "20+ min", "the qualifier is not hedged twice");
});

test("the pace labels have one home, so Lesson Zero cannot drift from Plan", () => {
  const lessonZeroForms = wysCadenceOptions.map((option) => option.optionLabel);
  const pillForms = wysCadenceOptions.map((option) => option.pillLabel);
  assert.notDeepEqual(lessonZeroForms, pillForms, "two presentations, as the artboards draw them");
  assert.ok(
    lessonZeroForms.includes("Most days") && pillForms.includes("Most days"),
    "'Most days' has no shorter approved form, so it keeps its word"
  );
});

/* -------------------------------------------------------------------------- */
/* The controls the artboard draws                                            */
/* -------------------------------------------------------------------------- */

test("'Change pace or time' is wired to the one place a pace is chosen", () => {
  assert.equal(planLabels.changePace, "Change pace or time", "artboard 5b, verbatim");
  assert.equal(planLabels.changePaceHref, "/watch-your-step/start");
  assert.ok(
    existsSync(path.join(repoRoot, "app", "watch-your-step", "(flow)", "start", "page.tsx")),
    "the pace control points at a route with no page file — it would ship dead"
  );
});

test("the off-site and terminal tags are the copy module's, not the view's", () => {
  assert.equal(planLabels.offSiteTag, wysLabels.offSiteTag);
  assert.equal(planLabels.terminalTag, wysLabels.terminalTag);
  assert.equal(planLabels.doneTag, "done");
  assert.equal(planLabels.doneMark, "✓", "the glyph is split out and rendered aria-hidden");
});

test("stopMark is derived for every stop, including a hypothetical tenth", () => {
  assert.equal(stopMark({ order: 0 } as never), "0");
  assert.equal(stopMark({ order: 1 } as never), "A");
  assert.equal(stopMark({ order: 9 } as never), "I", "a tenth stop takes its letter from the same place");
});

/* -------------------------------------------------------------------------- */
/* The screen is prerenderable and reads no state during render               */
/* -------------------------------------------------------------------------- */

test("the page is a server component; only the two state slots are clients", () => {
  assert.ok(!routeFile("page.tsx").includes('"use client"'), "the Plan page must prerender");
  assert.ok(routeFile("PlanStops.tsx").startsWith('"use client"'), "the row states read wys:v1");
  assert.ok(
    !routeFile("plan-model.ts").includes("localStorage") && !routeFile("plan-model.ts").includes("window"),
    "the model is pure — it takes state as an argument"
  );
  assert.ok(
    !routeFile("page.tsx").includes("useWysState") && !routeFile("page.tsx").includes("localStorage"),
    "§7.3: no component may read wys:v1 during render"
  );
});

test("nothing on this route fires telemetry", () => {
  for (const name of ["page.tsx", "PlanStops.tsx", "plan-model.ts", "plan-content.ts"]) {
    assert.ok(!routeFile(name).includes("trackWys("), `${name} fires an event; Plan has none (WYS §19.4)`);
  }
});

test("the view model carries no learner identity into its props", () => {
  const stopKeys = new Set(Object.keys(stops[0] as PlanStopView));
  assert.deepEqual(
    [...stopKeys].sort(),
    ["cadencePaths", "href", "id", "mark", "name", "offSite", "terminal", "title"],
    "the server hands the client content and structure — never progress, never a timestamp"
  );
});
