import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  type JudgeState,
  canCommit,
  commitJudge,
  initialJudgeState,
  judgeReveal,
  resetJudge,
  selectChoice
} from "@/lib/wys/judge-machine";
import { visitCountableStop, visitId, visitLabel, visitPositionFor } from "@/lib/wys/visit";
import { gateProse, gatedCanonicalText, isShowable } from "@/lib/wys/content-gate";
import { emptyWysState, WYS_ROUTES } from "@/lib/wys/local-state";
import { RENDER_MARKED_DRAFT } from "@/lib/content-status";
import {
  COURSE_TAB_HREFS,
  activeCourseTab,
  courseTabs,
  stopDisplayName,
  stopRouteLabels
} from "@/content/watch-your-step/tabs";
import {
  RESET_RENDERS_ON_MOBILE,
  judgeCommitMethodText,
  judgeLabels
} from "@/content/watch-your-step/judge";
import { stopScaffoldFootnoteText } from "@/content/watch-your-step/copy";
import { wysWeekById, wysWeeks } from "@/content/watch-your-step/weeks";
import { endExitSlot } from "@/content/watch-your-step/end";
import type { WysWeek } from "@/content/watch-your-step/types";

/** The shipped weeks, widened from the `as const` literal to the interface. */
const weeks: readonly WysWeek[] = wysWeeks;

/**
 * Phase 7 (shell) — the tab shell, the per-stop route and the shared course
 * primitives (plan §5.3, §5.4, Phase 7).
 *
 * The five course views are built by five other builders on top of what this
 * file checks, so every assertion here is about a CONTRACT they depend on: the
 * JUDGE machine's reveal invariant, the derived visit position, the gate that
 * decides whether prose may render at all, and the tab inventory.
 *
 * There is no DOM and no renderer in this suite (Q15, ratified at manual QA),
 * which is exactly why the state machine and the derivation are pure modules:
 * the invariant "nothing is revealed before commit" is checkable here rather
 * than by reading a component and hoping.
 */

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relative: string): string {
  return readFileSync(path.join(repoRoot, relative), "utf8");
}

/* -------------------------------------------------------------------------- */
/* The JUDGE state machine (WYS §10)                                          */
/* -------------------------------------------------------------------------- */

const KEYS = ["A", "B", "C"];

test("nothing is revealed before commit — the invariant, over every reachable state", () => {
  const uncommitted: JudgeState[] = [
    initialJudgeState,
    selectChoice(initialJudgeState, "A", KEYS),
    selectChoice(selectChoice(initialJudgeState, "A", KEYS), "C", KEYS),
    resetJudge()
  ];

  for (const state of uncommitted) {
    const reveal = judgeReveal(state);
    assert.equal(state.committed, false);
    assert.equal(reveal.judgment, false, "the judgment was reachable before commit");
    assert.equal(reveal.distribution, false, "the distribution was reachable before commit");
    assert.equal(reveal.actions, false, "the post-commit actions were reachable before commit");
    assert.equal(reveal.choicesEnabled, true);
    assert.equal(reveal.commitVisible, true);
  }
});

test("Commit is disabled until a pick exists, and a bare commit is a no-op", () => {
  assert.equal(canCommit(initialJudgeState), false);
  assert.equal(judgeReveal(initialJudgeState).commitEnabled, false);
  assert.deepEqual(commitJudge(initialJudgeState), initialJudgeState);

  const picked = selectChoice(initialJudgeState, "B", KEYS);
  assert.equal(canCommit(picked), true);
  assert.equal(judgeReveal(picked).commitEnabled, true);
});

test("single-select, re-selectable only while uncommitted", () => {
  const first = selectChoice(initialJudgeState, "A", KEYS);
  assert.equal(first.selected, "A");

  const second = selectChoice(first, "C", KEYS);
  assert.equal(second.selected, "C", "a pick must be changeable before commit");

  const committed = commitJudge(second);
  assert.equal(committed.committed, true);
  assert.equal(committed.selected, "C");

  const afterCommit = selectChoice(committed, "A", KEYS);
  assert.deepEqual(afterCommit, committed, "choices must lock on commit");
  assert.equal(judgeReveal(committed).choicesEnabled, false);
});

test("an undeclared choice key is refused rather than stored", () => {
  const state = selectChoice(initialJudgeState, "Z", KEYS);
  assert.equal(state.selected, null);
});

test("commit reveals judgment, distribution and actions together", () => {
  const reveal = judgeReveal(commitJudge(selectChoice(initialJudgeState, "B", KEYS)));
  assert.deepEqual(reveal, {
    choicesEnabled: false,
    commitVisible: false,
    commitEnabled: false,
    judgment: true,
    distribution: true,
    actions: true
  });
});

test("Reset clears BOTH the pick and the commit", () => {
  const committed = commitJudge(selectChoice(initialJudgeState, "A", KEYS));
  assert.deepEqual(resetJudge(), { selected: null, committed: false });
  assert.notDeepEqual(resetJudge(), committed);
});

test("JudgeCard is a shell over the machine, not a second implementation", () => {
  const source = read("components/wys/JudgeCard.tsx");
  assert.ok(source.startsWith('"use client"'), "the JUDGE composite must be a client component");
  assert.ok(source.includes('from "@/lib/wys/judge-machine"'), "JudgeCard does not use the state machine");
  assert.ok(source.includes("judgeReveal(state)"), "JudgeCard computes its own reveal flags");
  // The judgment element is rendered inside the `reveal.judgment` branch and
  // nowhere else. A second render site would be a second way to reach it.
  assert.equal(
    source.split("<JudgmentCard").length - 1,
    1,
    "JudgmentCard is rendered from more than one place in JudgeCard"
  );
  assert.ok(source.includes("{reveal.judgment ? ("), "the reveal is not guarded by the machine");
  // Aggregate-only, never GA4 (WYS §19.4).
  assert.ok(source.includes("sendAggregate("), "the commit does not reach the aggregate adapter");
  // A CALL, not a mention: the doc comment explains why `trackWys` refuses this
  // event, and that sentence is the reason the rule is legible.
  assert.equal(/trackWys\(/.test(source), false, "a scenario choice must never become a GA4 event");
});

test("Reset is reachable on both breakpoints (R9, ratified)", () => {
  // The 4a phone draws no Reset at all, which leaves the machine's reset
  // transition unreachable on mobile — a defect, not a design.
  assert.equal(RESET_RENDERS_ON_MOBILE, true);
  const source = read("components/wys/JudgeCard.tsx");
  const actions = source.slice(source.indexOf("reveal.actions ? ("));
  assert.ok(actions.includes("{resetLabel}"), "the actions row does not render Reset");
  assert.equal(
    /breakpoint === "mobile"[^\n]*resetLabel/.test(actions),
    false,
    "Reset is conditioned on the breakpoint"
  );
});

test("the tab bar clears the iOS home indicator", () => {
  // Phase 7's own task row: env(safe-area-inset-bottom), with the artboard's
  // 30px as the fallback. Without it the fifth tab sits under the indicator on
  // the primary QA device.
  const css = read("components/ui/primitives.module.css");
  const bar = css.slice(css.indexOf(".bottomNav {"));
  assert.ok(bar.includes("env(safe-area-inset-bottom, 30px)"));
});

test("the reveal animation honours prefers-reduced-motion in the stylesheet", () => {
  const css = read("components/wys/wys-primitives.module.css");
  const guard = css.slice(css.indexOf(".judgeReveal"));
  assert.ok(guard.includes("@media (prefers-reduced-motion: reduce)"), "the §4.6 pair is missing its second half");
  assert.ok(guard.includes("animation: none"));
});

/* -------------------------------------------------------------------------- */
/* The visit counter (plan §5.3)                                              */
/* -------------------------------------------------------------------------- */

test("a visit id is a legal wys:v1 id token and is qualified by its stop", () => {
  const id = visitId("stop-a", "day-human-source");
  assert.equal(id, "stop-a:day-human-source");
  // The serializer's ID_TOKEN domain — colons are legal, spaces and prose are not.
  assert.match(id, /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/);
  assert.notEqual(visitId("stop-a", "day-human-source"), visitId("stop-b", "day-human-source"));
});

test("visit position is derived from completed ids, and starts at 1 of m", () => {
  const stopA = wysWeekById("stop-a");
  const state = emptyWysState();

  const twoDay = visitPositionFor(stopA, state.progress, "2");
  assert.equal(twoDay.visit, 1);
  assert.equal(twoDay.total, 2);
  assert.equal(twoDay.complete, false);
  assert.equal(visitLabel(twoDay), "visit 1 of 2");

  const fiveDay = visitPositionFor(stopA, state.progress, "5");
  assert.equal(fiveDay.total, 5, "the cadence path length is the denominator");
});

test("marking one visit complete advances the counter by exactly one", () => {
  const stopA = wysWeekById("stop-a");
  const state = emptyWysState();
  state.progress.completedLessonIds = [visitId(stopA.id, stopA.cadencePaths.days2[0])];

  const position = visitPositionFor(stopA, state.progress, "2");
  assert.equal(position.visit, 2);
  assert.equal(position.dayPlanId, stopA.cadencePaths.days2[1]);
  assert.equal(position.complete, false);
});

test("a finished stop clamps to 'visit m of m' — there is no over state", () => {
  const stopA = wysWeekById("stop-a");
  const state = emptyWysState();
  state.progress.completedLessonIds = stopA.cadencePaths.days2.map((day) => visitId(stopA.id, day));

  const position = visitPositionFor(stopA, state.progress, "2");
  assert.equal(position.visit, 2);
  assert.equal(position.total, 2);
  assert.equal(position.complete, true);
  assert.equal(position.dayPlanId, null);
});

test("another stop's completions never advance this stop's counter", () => {
  // The qualified visit id is what makes this true: `day-human-source` is day 1
  // of several stops, and the bare day-plan id would be ambiguous.
  const stopA = wysWeekById("stop-a");
  const stopB = wysWeekById("stop-b");
  const state = emptyWysState();
  state.progress.completedLessonIds = stopA.cadencePaths.days2.map((day) => visitId(stopA.id, day));

  assert.equal(visitPositionFor(stopB, state.progress, "2").visit, 1);
});

test("an off-site stop is a single visit at every cadence", () => {
  const offSite = weeks.find((week) => week.offSite === true);
  assert.ok(offSite, "no off-site stop exists — WYS §15.2 detox is unrepresented");
  for (const cadence of ["2", "3", "5", "most"] as const) {
    const position = visitPositionFor(offSite, emptyWysState().progress, cadence);
    assert.equal(position.total, 1, `off-site stop reported ${position.total} visits at cadence ${cadence}`);
  }
});

test("the counter never throws on a cadence the week does not declare", () => {
  // `mostDays` is undefined on every shipped week and falls back to days5;
  // `days3` falls back to days2. A learner on "Most days" must not take
  // `undefined.length` (plan §5.3).
  for (const week of weeks) {
    for (const cadence of ["2", "3", "5", "most", undefined] as const) {
      const position = visitPositionFor(week, emptyWysState().progress, cadence);
      assert.ok(position.total >= 1, `${week.id} produced no visits at cadence ${String(cadence)}`);
      assert.ok(position.visit >= 1 && position.visit <= position.total);
    }
  }
});

/* -------------------------------------------------------------------------- */
/* The content gate (plan §6.2)                                               */
/* -------------------------------------------------------------------------- */

test("draft placeholder prose is blocked in public and marked in preview (Q21)", () => {
  assert.equal(RENDER_MARKED_DRAFT, false, "Q21's ratified default changed — this test states it, not sets it");

  const record = { status: "draft", origin: "IMPLEMENTATION_PLACEHOLDER" } as const;
  const publicGate = gateProse("fictional-scenario", record, "a fictional setting");
  assert.equal(publicGate.policy.kind, "blocked");
  assert.equal(isShowable(publicGate), false);
  assert.equal(publicGate.label, "Implementation placeholder — not Ben's words");

  const previewGate = gateProse("fictional-scenario", record, "a fictional setting", "preview");
  assert.equal(previewGate.policy.kind, "marked");
  if (previewGate.policy.kind === "marked") {
    assert.equal(previewGate.policy.draftMark, "scenario");
  }
});

test("published Ben-approved copy resolves to canon and renders", () => {
  const gate = gateProse("general", { status: "published", origin: "BEN_APPROVED" }, "approved wording");
  assert.equal(gate.policy.kind, "canon");
  assert.equal(isShowable(gate), true);
});

test("an unlabelled (surface, origin) pair is a build failure, not a blank label", () => {
  assert.throws(
    () => gateProse("judgment", { status: "published", origin: "LEARNER_OWNED" }, "not a judgment"),
    /No provenance label/
  );
});

test("every shipped stop title can be gated on the surface the stop route renders it on", () => {
  for (const week of weeks) {
    const gate = gateProse("general", week, week.title);
    assert.ok(gate.label.length > 0, `${week.id} produced an empty provenance label`);
  }
});

test("the scaffold footnote and the commit-method note are renderable canon", () => {
  const footnote = gatedCanonicalText(stopScaffoldFootnoteText, "short");
  assert.ok(footnote, "the scaffold footnote does not render — the stop route depends on it");
  assert.equal(footnote.policy.kind, "canon");

  const method = gatedCanonicalText(judgeCommitMethodText, "short");
  assert.ok(method, "the 4a pre-commit note does not render");
  assert.equal(method.policy.kind, "canon");
  assert.equal(method.text, "You commit before you see anything. That's the whole method.");
});

/* -------------------------------------------------------------------------- */
/* The tab shell (plan §5.4)                                                  */
/* -------------------------------------------------------------------------- */

test("five tabs, in the artboard's order, and no Chat", () => {
  assert.deepEqual(
    courseTabs.map((tab) => tab.label),
    ["Today", "Plan", "Progress", "Practice", "Data"]
  );
  assert.equal(courseTabs.length, 5, "the artboards draw five tabs; a sixth is a new inventory");
  for (const tab of courseTabs) {
    assert.equal(/chat/i.test(tab.label), false, "WYS ships no chat interface, and no tab may imply one");
  }
});

test("every tab href is a declared course route", () => {
  // WYS_ROUTES is the single list of the course's own URLs, shared with
  // tests/no-private-state-in-urls.test.ts and with the serializer's
  // `ui.lastRoute` domain. A tab pointing outside it is either a typo or a new
  // route nothing else knows about.
  for (const href of COURSE_TAB_HREFS) {
    assert.ok(WYS_ROUTES.includes(href), `tab ${href} is not a declared WYS route`);
  }
});

test("the landing and the per-stop route have NO active tab (plan §5.4)", () => {
  assert.equal(activeCourseTab("/watch-your-step"), undefined);
  assert.equal(activeCourseTab("/watch-your-step/stop/stop-a"), undefined);
  assert.equal(activeCourseTab("/watch-your-step/start"), undefined);
  assert.equal(activeCourseTab(null), undefined);
  assert.equal(activeCourseTab("/watch-your-step/today"), "/watch-your-step/today");
  assert.equal(activeCourseTab("/watch-your-step/data"), "/watch-your-step/data");
});

test("the bar is mounted on the (shell) group and on nothing else", () => {
  const shell = read("app/watch-your-step/(shell)/layout.tsx");
  const flow = read("app/watch-your-step/(flow)/layout.tsx");
  assert.ok(shell.includes("<WysBottomNav />"), "the course shell does not mount the tab bar");
  assert.equal(/BottomNav/.test(flow), false, "Lesson Zero must have no bottom nav (mockup 5a)");
});

test("the tab hrefs are constant server HTML, never state-dependent", () => {
  // §5.4: the tabs cannot compute a state-dependent href at first paint, so the
  // ONE state-dependent branch lives at /today. Reading local state here would
  // put it in five places.
  const nav = read("components/wys/BottomNav.tsx");
  assert.equal(/useWysState|local-state/.test(nav), false, "the tab bar reads learner state");
  const tabs = read("content/watch-your-step/tabs.ts");
  assert.equal(/useWysState|localStorage/.test(tabs), false);
});

/* -------------------------------------------------------------------------- */
/* The per-stop route (plan §5.3)                                             */
/* -------------------------------------------------------------------------- */

const STOP_PAGE = "app/watch-your-step/(shell)/stop/[stopId]/page.tsx";

test("the per-stop route is prerendered over the declared stop ids", () => {
  assert.ok(existsSync(path.join(repoRoot, STOP_PAGE)), "the per-stop route Plan and the path strip link to is missing");
  const source = read(STOP_PAGE);
  assert.ok(source.includes("export const dynamicParams = false"), "an unknown stopId must 404, not render on demand");
  assert.ok(source.includes("generateStaticParams"), "the stop route is not prerendered");
  assert.ok(source.includes("WYS_STOP_IDS"), "the params are not derived from the content model");
});

test("the stop route's page title is derived structure, never a draft stop title", () => {
  const source = read(STOP_PAGE);
  const metadata = source.slice(source.indexOf("generateMetadata"), source.indexOf("export default"));
  assert.ok(metadata.includes("stopDisplayName"), "the title is not the derived stop name");
  assert.equal(/week\.title/.test(metadata), false, "a draft scaffold title would be published as page_title");
  assert.match(metadata, /title: `\$\{name\} - BenChanTech`/, "the title convention is 'X - BenChanTech'");
  assert.match(metadata, /alternates: \{ canonical: /, "the stop route declares no canonical URL");
});

test("stop names are derived, and Lesson Zero is not called a stop", () => {
  assert.equal(stopDisplayName(wysWeekById("stop-a")), "Stop A");
  assert.equal(stopDisplayName(wysWeekById("stop-b")), "Stop B");
  assert.equal(stopDisplayName(wysWeekById("stop-zero")), stopRouteLabels.lessonZeroName);
  // §6.9: the count and the letters are derived from the content array. A typed
  // "Stop I" would survive a stop being removed; this does not.
  const names = weeks.map(stopDisplayName);
  assert.equal(new Set(names).size, names.length, "two stops render the same name");
});

/* -------------------------------------------------------------------------- */
/* The JUDGE surface copy (plan §6.8)                                         */
/* -------------------------------------------------------------------------- */

test("the Commit label has one definition, pinned to the 5b form", () => {
  assert.equal(judgeLabels.commit, "Commit, then see Ben's take");
  // The composite renders on four surfaces; none of them may type the label.
  for (const file of [
    "components/wys/JudgeCard.tsx",
    "app/watch-your-step/(shell)/stop/[stopId]/page.tsx"
  ]) {
    assert.equal(/Commit,? (—|then)/.test(read(file)), false, `${file} types the Commit label`);
  }
});

test("the distribution header is data, not a literal in the bars component", () => {
  const bars = read("components/wys/DistributionBars.tsx");
  assert.equal(bars.includes("<span>How others answered</span>"), false, "the heading is hardcoded again");
  assert.ok(bars.includes("heading: string"), "the heading is not a required prop");
  assert.equal(judgeLabels.distributionHeading, "How others answered");
});

/* -------------------------------------------------------------------------- */
/* The client boundary: withheld prose is stripped, not merely unrendered      */
/* -------------------------------------------------------------------------- */

/**
 * Found at the Phase 7 gate, in the built HTML, not in review.
 *
 * Every course screen is a server component that hands `GatedContent` to a
 * client component, and React serialises every client prop into the RSC flight
 * payload that Next.js inlines into the prerendered `.html`. So a blocked
 * record that still carried its `text` was PUBLISHED in the document — readable
 * in view-source, in the `.rsc` file and by anything that reads the page
 * without running it — while the screen honestly drew "Implementation
 * placeholder — not Ben's words". Three of the six Phase 7 surfaces wrote a
 * local `redactIfBlocked`; the three that did not shipped the leak (Plan's nine
 * stop titles, Lesson Zero's scenario and choice labels, and the per-stop route
 * passing a whole `WysStop`).
 *
 * The rule now lives in the two constructors and nowhere else.
 */
test("a blocked record carries no prose out of the gate, and keeps its label", () => {
  for (const week of wysWeeks) {
    const gated = gateProse("general", week, week.title);
    if (isShowable(gated)) continue;
    assert.equal(gated.text, "", `${week.id}'s blocked title still carries its prose`);
    assert.ok(gated.label.length > 0, "the withheld state still says whose words are missing");
    assert.equal(gated.policy.kind, "blocked", "the policy is untouched — only the words go");
  }
});

test("the preview surface still sees the prose — this is a serving rule, not a deletion", () => {
  const week = wysWeeks[0];
  const preview = gateProse("general", week, week.title, "preview");
  assert.equal(preview.policy.kind, "marked", "§6.11's preview surface must still resolve marked");
  assert.equal(preview.text, week.title, "the draft preview tooling reads the real words");
});

test("no course surface reintroduces its own redaction helper", () => {
  // One canonical definition (§5.1, applied to code). A local copy is how the
  // rule drifts: the page that forgets to write one is the page that leaks.
  const files = [
    "app/watch-your-step/(shell)/today/view.ts",
    "app/watch-your-step/(shell)/practice/page.tsx",
    "app/watch-your-step/(shell)/progress/page.tsx",
    "app/watch-your-step/(shell)/plan/plan-content.ts",
    "app/watch-your-step/(flow)/start/page.tsx"
  ];
  for (const file of files) {
    const source = read(file);
    assert.equal(
      /function (redactIfBlocked|withheldTextRemoved|withheld)\b/.test(source),
      false,
      `${file} keeps a second definition of the gate's redaction rule`
    );
  }
  assert.ok(
    read("lib/wys/content-gate.ts").includes("function withoutBlockedProse"),
    "the one definition is gone"
  );
});

test("a stop crosses the client boundary as a projection, never as a record", () => {
  // `VisitCountableStop` is structural, so a whole `WysStop` satisfies it and
  // the compiler says nothing while the draft title and purpose ship in the
  // payload. The named projection is the thing that makes it visible.
  const projected = visitCountableStop(wysWeeks[0]);
  assert.deepEqual(Object.keys(projected).sort(), ["cadencePaths", "id", "offSite"]);
  assert.equal("title" in projected, false);
  assert.equal("purpose" in projected, false);

  for (const file of [
    "app/watch-your-step/(shell)/stop/[stopId]/page.tsx",
    "app/watch-your-step/(shell)/today/view.ts",
    "app/watch-your-step/(shell)/progress/page.tsx"
  ]) {
    assert.ok(read(file).includes("visitCountableStop"), `${file} does not project its stops`);
  }
});

/* -------------------------------------------------------------------------- */
/* The Stop H terminal surface (WYS §11 Period H; §19.4)                      */
/* -------------------------------------------------------------------------- */

/**
 * Found at the Phase 7 gate: `/watch-your-step/end` is a declared route in
 * §5.2 and in `WYS_ROUTES`, and `lib/wys/telemetry.ts` declares
 * `wys_course_complete` as `firedInV0` with "Stop H terminal surface reaches
 * its completed state" as its firing point — and no such surface existed. A
 * decision table that names a firing point no code can reach is a claim to fix
 * in architecture, not in copy (R8).
 */
test("the declared terminal route exists, in the flow group, with no bottom nav", () => {
  const page = path.join(repoRoot, "app", "watch-your-step", "(flow)", "end", "page.tsx");
  assert.ok(existsSync(page), "/watch-your-step/end is declared in WYS_ROUTES and has no page file");
  assert.ok(WYS_ROUTES.includes("/watch-your-step/end"));

  // `(shell)` mounts the tab bar; `(flow)` does not. An ending is not a tab.
  const shellLayout = read("app/watch-your-step/(shell)/layout.tsx");
  const flowLayout = read("app/watch-your-step/(flow)/layout.tsx");
  assert.ok(shellLayout.includes("WysBottomNav"));
  assert.equal(flowLayout.includes("WysBottomNav"), false);
});

test("wys_course_complete has exactly one firing point, and it is the completed state", () => {
  const mark = read("app/watch-your-step/(flow)/end/CourseCompleteMark.tsx");
  assert.ok(mark.includes('trackWys("wys_course_complete"'), "the declared event still cannot fire");

  // Not on arrival: completion semantics are explicit that opening is not
  // completion. The guard is the terminal stop's derived position.
  assert.ok(mark.includes("visitPositionFor"), "the event fires without checking the course is done");
  assert.match(mark, /if \(!complete/, "the effect does not gate on completion");

  // And nowhere else fires it.
  const firing: string[] = [];
  const roots = ["app", "components", "lib", "content"];
  const stack = roots.map((dir) => path.join(repoRoot, dir));
  while (stack.length > 0) {
    const dir = stack.pop() as string;
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) stack.push(full);
      else if (/\.tsx?$/.test(entry) && !full.endsWith("telemetry.ts")) {
        if (readFileSync(full, "utf8").includes('trackWys("wys_course_complete"')) {
          firing.push(path.relative(repoRoot, full));
        }
      }
    }
  }
  assert.deepEqual(firing, ["app/watch-your-step/(flow)/end/CourseCompleteMark.tsx"]);
});

test("the terminal surface renders a labelled empty slot and never Ben's words", () => {
  assert.equal(endExitSlot.origin, "BEN_AUTHORED");
  assert.equal(endExitSlot.status, "draft");
  assert.ok(endExitSlot.emptyReferenceReason.length > 0, "§6.4 requires a stated reason");

  // §6.4: the slot props accept no body, so there is nothing to fill it with.
  const page = read("app/watch-your-step/(flow)/end/page.tsx");
  assert.match(page, /<BenSlot[^>]*\/>/, "the slot must be self-closing — §6.4 gives it no body");
  assert.equal(page.includes("</BenSlot>"), false, "a slot was given a body");

  // No outcome claim (Proposition K): the end of a path is a fact about the
  // path, not about the learner.
  const source = `${page}\n${read("content/watch-your-step/end.ts")}`;
  for (const forbidden of ["you have learned", "you now", "congratulat", "well done", "you're ready", "you are ready", "mastered", "certified"]) {
    assert.equal(
      source.toLowerCase().includes(forbidden),
      false,
      `the terminal surface claims an outcome: "${forbidden}"`
    );
  }
});

test("the terminal route is reachable — nothing declared may ship dead", () => {
  const stopPage = read("app/watch-your-step/(shell)/stop/[stopId]/page.tsx");
  assert.ok(stopPage.includes('href="/watch-your-step/end"'), "/watch-your-step/end has no door");
  assert.ok(stopPage.includes("week.terminal"), "every stop offers the ending, not just the last one");
  const terminal = (wysWeeks as readonly WysWeek[]).filter((week) => week.terminal === true);
  assert.equal(terminal.length, 1, "exactly one stop may be terminal");
});

test("the rulebook export has one definition, used by both surfaces", () => {
  const shared = read("components/wys/RulebookExport.tsx");
  assert.ok(shared.includes("export function downloadRulebook"));
  assert.ok(shared.includes("rulebookAsText"), "the export invented its own file shape");
  for (const file of [
    "app/watch-your-step/(shell)/progress/ProgressView.tsx",
    "app/watch-your-step/(flow)/end/CourseCompleteMark.tsx"
  ]) {
    const source = read(file);
    assert.ok(/RulebookExport/.test(source), `${file} does not use the shared export`);
    assert.equal(
      /function downloadRulebook/.test(source),
      false,
      `${file} keeps a second definition of the export`
    );
  }
});
