import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  REPLAY_MODES,
  appetiteExplanationText,
  assertReplayInvariant,
  fromMemoryPromptText,
  fromMemoryScratchNoticeText,
  practiceCopyRecords,
  practiceLabels,
  practiceLeadText,
  replayOptionsFor
} from "@/content/watch-your-step/practice";
import { wysCanonicalRecords } from "@/content/watch-your-step";
import { wysScenarios } from "@/content/watch-your-step/scenarios";
import { wysVariants } from "@/content/watch-your-step/variants";
import { WYS_DOMAINS } from "@/content/watch-your-step/domains";
import type { WysCanonicalVariant, WysScenario } from "@/content/watch-your-step/types";
import { gateProse, gatedCanonicalText, isShowable } from "@/lib/wys/content-gate";
import { RENDER_MARKED_DRAFT } from "@/lib/content-status";
import {
  WYS_EVENT_NAMES,
  WYS_PROPERTY_KEYS,
  analyticsConsentGranted,
  trackWys,
  validateWysEvent
} from "@/lib/wys/telemetry";
import {
  WYS_ROUTES,
  emptyWysState,
  sanitizeWysState,
  serializeWysState
} from "@/lib/wys/local-state";
import { COURSE_TAB_HREFS } from "@/content/watch-your-step/tabs";

/**
 * Phase 7 — the Practice view (plan Phase 7; WYS §14, §15.1, §21; mockup 5c).
 *
 * Three promises are made on this one screen and each of them is the kind of
 * promise that is normally kept in a comment:
 *
 *   §14  replay is deterministic and authored — nothing is generated
 *   §15.1 the scratch box is never persisted, never transmitted, and clears
 *   §21  the appetite signal takes no email, opens no chat, unlocks nothing
 *
 * There is no DOM and no renderer in this suite (Q15, ratified), so the proofs
 * come in two forms and both are here on purpose. The RUNTIME half drives the
 * real serializer and the real telemetry validator with §29.2's canary, so
 * "cannot be stored" and "cannot be sent" are executed rather than asserted.
 * The STRUCTURAL half reads the component sources for the expressions that
 * would have to exist for a leak to be possible — an import, a call, an
 * argument — because the absence of a code path is the actual guarantee and a
 * unit test of a component that never leaks cannot observe one that does.
 */

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relative: string): string {
  return readFileSync(path.join(repoRoot, relative), "utf8");
}

const fromMemorySource = read("components/wys/FromMemory.tsx");
const appetiteSource = read("components/wys/AppetiteCard.tsx");
const replaySource = read("components/wys/ReplayList.tsx");
const pageSource = read("app/watch-your-step/(shell)/practice/page.tsx");

/** Comments are documentation, not behaviour; every source scan strips them. */
function code(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
}

const scenarios: readonly WysScenario[] = wysScenarios;
const variants: readonly WysCanonicalVariant[] = wysVariants;

/** (WYS §29.2) "No free text leak" — the distinctive string the spec supplies. */
const CANARY = "DO_NOT_SEND_WYS_TEST_9f31";

/* -------------------------------------------------------------------------- */
/* WYS §14 — two deterministic modes, and the invariant rule                  */
/* -------------------------------------------------------------------------- */

test("exactly two replay modes exist, and neither generates anything", () => {
  assert.deepEqual([...REPLAY_MODES], ["as-authored", "ben-variant"]);

  // §14's "do not generate new AI variations in website v0" is a property of
  // the product, so the scan is for the EXPRESSIONS that would generate one —
  // not for the word, which the artboard's own lead line contains ("authored,
  // not generated") and which a prose scan would therefore flag forever.
  for (const source of [replaySource, pageSource, read("content/watch-your-step/practice.ts")]) {
    for (const forbidden of [
      "Math.random",
      "randomUUID",
      "crypto.getRandomValues",
      "shuffle",
      "openai",
      "anthropic",
      "completions",
      "fetch("
    ]) {
      assert.ok(
        !code(source).toLowerCase().includes(forbidden.toLowerCase()),
        `Practice must not reach for "${forbidden}" — replay is authored, not generated (WYS §14)`
      );
    }
  }
});

test("every scenario offers 'as authored', and only a Ben variant may add a second mode", () => {
  for (const scenario of scenarios) {
    const options = replayOptionsFor(scenario);
    assert.ok(options.length >= 1, `${scenario.id} has no replay mode at all`);
    assert.equal(options[0].mode, "as-authored");
    assert.equal(options[0].tag, practiceLabels.asAuthoredTag);

    for (const option of options.slice(1)) {
      assert.equal(option.mode, "ben-variant");
      assert.equal(option.tag, practiceLabels.benVariantTag);
      assert.ok(option.variantId, "a Ben-variant mode must name the variant it replays");
    }
  }
});

test("an AI_ADAPTATION variant is never offered as a replay mode, and never tagged Ben", () => {
  // The shipped bank holds exactly one variant and it is `AI_ADAPTATION`
  // (WYS §35 decision 9 is open, so Ben has authored no variation). Tagging it
  // "Ben variant" would attribute machine-drafted prose to Ben — R9's
  // unsafe direction, and the reason this filter is by ORIGIN and not by
  // "a variant exists".
  const adaptation = variants.find((variant) => variant.origin === "AI_ADAPTATION");
  assert.ok(adaptation, "the AI_ADAPTATION fixture this test depends on is gone");

  const parent = scenarios.find((scenario) => scenario.id === adaptation.parentScenarioId);
  assert.ok(parent);
  assert.ok(
    parent.canonicalVariantIds.includes(adaptation.id),
    "the parent scenario must still reference the variant, or this test proves nothing"
  );

  const options = replayOptionsFor(parent);
  assert.deepEqual(
    options.map((option) => option.mode),
    ["as-authored"],
    "an AI adaptation was offered as a deterministic replay mode"
  );
});

test("v0 ships 'as authored' rows only — the Ben-variant tag binds to nothing yet", () => {
  const modes = scenarios.flatMap((scenario) => replayOptionsFor(scenario).map((option) => option.mode));
  assert.deepEqual([...new Set(modes)], ["as-authored"]);
});

test("the §14 invariant rule is enforced at the point of use, not just at authoring", () => {
  const scenario = scenarios.find((candidate) => candidate.canonicalVariantIds.length > 0);
  assert.ok(scenario);
  const variant = variants.find((candidate) => candidate.id === scenario.canonicalVariantIds[0]);
  assert.ok(variant);

  // The real pair passes.
  assert.doesNotThrow(() => assertReplayInvariant(scenario, variant));

  // A drifted invariant is refused: the construct has changed, so it is not a
  // replay of the same family however similar the surface looks.
  assert.throws(
    () => assertReplayInvariant(scenario, { ...variant, invariant: "something else entirely" }),
    /invariant/
  );

  // A judgment mapping that no longer covers every parent choice key is refused
  // for the same reason: one choice would resolve to no judgment at all.
  const { [scenario.choices[0].key]: _dropped, ...partial } = variant.judgmentMapping;
  assert.throws(() => assertReplayInvariant(scenario, { ...variant, judgmentMapping: partial }), /judgment/);
});

test("replay row ids are unique and stable across the whole bank", () => {
  const ids = scenarios.flatMap((scenario) => replayOptionsFor(scenario).map((option) => option.id));
  assert.equal(new Set(ids).size, ids.length, "two replay rows share an id");
  for (const id of ids) assert.match(id, /^[a-z0-9:-]+$/);
});

/* -------------------------------------------------------------------------- */
/* The server/client boundary — no withheld prose reaches the browser         */
/* -------------------------------------------------------------------------- */

test("under Q21's default no scenario is runnable, so no draft prose is serialized", () => {
  assert.equal(RENDER_MARKED_DRAFT, false, "Q21's ratified default changed — re-read this test");

  for (const scenario of scenarios) {
    const setting = gateProse("fictional-scenario", scenario, scenario.setting);
    assert.equal(
      isShowable(setting),
      false,
      `${scenario.id} became showable; the Practice page must now redact its exercise deliberately`
    );
  }
});

test("the page redacts a blocked record's words before the client boundary", () => {
  // The redaction itself is the GATE's job, not this page's — `gateProse`
  // empties `text` on a blocked policy, so every surface gets it and no screen
  // can forget. Asserted behaviourally, against the real gate and the real
  // content, rather than by grepping this file for a local helper.
  for (const scenario of scenarios) {
    const title = gateProse("fictional-scenario", scenario, scenario.title);
    if (isShowable(title)) continue;
    assert.equal(title.text, "", `${scenario.id}'s blocked title still carries its prose`);
    assert.ok(title.label.length > 0, "the label must survive — the row still says whose words are missing");
  }

  // What stays local here is the STRUCTURAL half: a withheld scenario ships
  // `exercise: null`, so its choice keys, labels and judgment never cross in
  // any form — not merely emptied, absent.
  const source = code(pageSource);
  assert.match(
    source,
    /const runnable = isShowable\(setting\)/,
    "the exercise is no longer gated on the scenario being showable"
  );
  assert.match(source, /runnable && judgment\s*\n?\s*\?/, "the exercise is built without checking runnable");
  assert.match(source, /:\s*null;/, "a withheld scenario must serialize with no exercise at all");
});

test("Practice renders no distribution — there are no illustrative numbers on it", () => {
  // The 18/61/21 split is fabricated data drawn on the 4a hero and shipped only
  // with its caption (§6.5, Q11). A practice surface has no counts to show, and
  // an uncaptioned bar here would be the §6.5 failure exactly.
  assert.ok(!code(replaySource).includes("distribution"));
  assert.ok(!code(pageSource).includes("distribution"));
});

test("a replay never overwrites the kept judgment (WYS §14)", () => {
  assert.match(
    code(replaySource),
    /persist=\{false\}/,
    "the replay's JudgeCard must not persist — a replay is practice, not a revision"
  );
});

test("wys_replay is fired bare, and the replay counter uses a declared field", () => {
  const source = code(replaySource);
  assert.match(source, /trackWys\("wys_replay"\)/, "wys_replay must be fired with no properties");
  assert.ok(
    !/trackWys\("wys_replay",/.test(source),
    "wys_replay carries the event name only — not the scenario, the choice or the revision"
  );
  assert.match(source, /replayCounts/, "the replay counter is not wired");
});

/* -------------------------------------------------------------------------- */
/* WYS §15.1 — From Memory, and the §29.2 leak canary                         */
/* -------------------------------------------------------------------------- */

test("the canary cannot be sent: every telemetry property refuses it", () => {
  for (const key of WYS_PROPERTY_KEYS) {
    const result = validateWysEvent("wys_replay", { [key]: CANARY });
    assert.equal(result.ok, false, `${key} accepted the canary`);
  }
  // And it cannot arrive under a name of its own.
  assert.equal(validateWysEvent("wys_replay", { scratch: CANARY }).ok, false);
  assert.equal(validateWysEvent("wys_replay", { from_memory_text: CANARY }).ok, false);
  // Nor as an event name.
  assert.equal(validateWysEvent(CANARY, {}).ok, false);
});

test("the canary cannot be stored: every vocabulary-checked path drops it", () => {
  const state = {
    ...emptyWysState(),
    onboarding: { completed: true, postureChoice: CANARY },
    progress: { ...emptyWysState().progress, replayCounts: { [CANARY]: 1 } },
    localJudgments: { [CANARY]: { choiceKey: CANARY, updatedAt: new Date().toISOString() } },
    ui: { lastRoute: `/watch-your-step/practice?scratch=${CANARY}`, dismissedNotices: [CANARY] },
    appetite: { deeperPracticeInterest: true }
  };

  const serialized = serializeWysState(state as never, WYS_DOMAINS);
  assert.ok(
    !serialized.includes(CANARY),
    "the canary survived a vocabulary-checked field — a free string could reach localStorage"
  );

  const { dropped } = sanitizeWysState(state, WYS_DOMAINS);
  for (const field of [
    "onboarding.postureChoice",
    `progress.replayCounts.${CANARY}`,
    `localJudgments.${CANARY}`,
    "ui.lastRoute",
    "ui.dismissedNotices[0]"
  ]) {
    assert.ok(dropped.includes(field), `${field} accepted the canary`);
  }
});

test("the four completed-id arrays are shape-checked only, which is why From Memory never writes", () => {
  // Stated rather than discovered later: `completedLessonIds`,
  // `completedScenarioIds`, `completedCarryIds` and `transferCheckIds` are
  // validated as ID TOKENS and against no vocabulary, so a caller COULD persist
  // a whitespace-free free string there. The §15.1 guarantee therefore does not
  // rest on the serializer at all — it rests on `FromMemory.tsx` having no
  // write path: no `useWysState`, no `update`, no storage import (asserted
  // below). Recorded for the gate in docs/facelift-build-notes.md.
  const survives = sanitizeWysState(
    { ...emptyWysState(), progress: { ...emptyWysState().progress, completedLessonIds: [CANARY] } },
    WYS_DOMAINS
  );
  assert.ok(survives.state.progress.completedLessonIds.includes(CANARY));

  // A sentence does not survive, which is the guard that IS there: no
  // whitespace means a scratch line cannot be persisted under an id-shaped key.
  const sentence = sanitizeWysState(
    {
      ...emptyWysState(),
      progress: { ...emptyWysState().progress, completedLessonIds: [`${CANARY} and a whole sentence`] }
    },
    WYS_DOMAINS
  );
  assert.deepEqual(sentence.state.progress.completedLessonIds, []);
});

test("the learner's rulebook is the one free-text field, and From Memory never touches it", () => {
  const withRule = {
    ...emptyWysState(),
    rulebook: [
      { id: "rule-1", text: CANARY, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ]
  };
  assert.ok(JSON.stringify(sanitizeWysState(withRule, WYS_DOMAINS).state).includes(CANARY));
  assert.ok(!code(fromMemorySource).includes("rulebook"));
});

test("FromMemory imports nothing that could persist or transmit", () => {
  const source = code(fromMemorySource);
  for (const forbidden of [
    "localStorage",
    "sessionStorage",
    "indexedDB",
    "document.cookie",
    "fetch(",
    "XMLHttpRequest",
    "sendBeacon",
    "trackWys",
    "sendAggregate",
    "useWysState",
    "gtag",
    "dataLayer",
    "action=",
    "<form"
  ]) {
    assert.ok(!source.includes(forbidden), `FromMemory.tsx reaches for "${forbidden}"`);
  }
});

test("the scratch value appears in exactly the two expressions that render it", () => {
  // Class names are stripped first: `styles.scratch` is a stylesheet key, not
  // the value, and leaving it in would make this count meaningless.
  const source = code(fromMemorySource).replace(/styles\.\w+/g, "S");
  const uses = [...source.matchAll(/\bscratch\b/g)].length;
  // Two, and only two: the `useState` binding and the textarea's `value`.
  // `setScratch` and `scratchAllowed` do not match the word boundary, and
  // nothing else in the file names the value at all.
  assert.equal(uses, 2, "the scratch value is referenced somewhere new — check what reads it");
  assert.match(source, /const \[scratch, setScratch\] = useState\(""\)/);
  assert.match(source, /value=\{scratch\}/);
  assert.ok(!/\(\s*scratch\s*[,)]/.test(source), "the scratch value is passed as a function argument");
  assert.ok(
    !/\}\s*,\s*\[[^\]]*scratch/.test(source),
    "the scratch value is in an effect dependency array"
  );
  // Nothing else interpolates it into JSX: strip the textarea's own `value` and
  // no `{scratch}` expression is left anywhere in the file.
  assert.ok(!/\{\s*scratch\s*\}/.test(source.replace(/value=\{scratch\}/g, "")));
});

test("the scratch box clears on route change, by effect and not only by unmount", () => {
  const source = code(fromMemorySource);
  assert.match(source, /usePathname/, "no route-change signal is read");
  assert.match(source, /setScratch\(""\)/, "nothing clears the scratch value");
  assert.match(source, /\}, \[pathname\]\)/, "the clear is not keyed to the route");
});

test("the scratch box cannot render without §15.1's label", () => {
  const source = code(fromMemorySource);
  assert.match(source, /const scratchAllowed = isShowable\(notice\)/);
  assert.match(source, /scratchAllowed \?/, "the textarea is not gated on the notice");

  const notice = gatedCanonicalText(fromMemoryScratchNoticeText, "short");
  assert.ok(notice, "the notice must resolve, or the box never renders at all");
  assert.equal(notice.policy.kind, "canon");
  assert.ok(
    notice.text.startsWith("This stays in this page and is not sent anywhere."),
    "WYS §15.1's mandated label is no longer the first sentence of the notice"
  );
  assert.ok(notice.text.includes("It clears when you leave."), "the artboard's second sentence was dropped");
});

test("From Memory offers all three of §15.1's routes and scores none of them", () => {
  assert.equal(practiceLabels.sayItAloud, "Say it aloud");
  assert.equal(practiceLabels.writeItOnPaper, "Write it on paper");
  assert.equal(practiceLabels.didIt, "I did it");

  const source = code(fromMemorySource);
  for (const forbidden of ["score", "correct", "streak", "percent", "%", "model answer", "compare"]) {
    assert.ok(!source.toLowerCase().includes(forbidden), `From Memory grades the learner: "${forbidden}"`);
  }
});

test("the aloud/paper offers are offers, not controls that promise a state change", () => {
  // Nothing on this site can know whether someone said something aloud, and a
  // button implies a record. They are list items.
  const source = code(fromMemorySource);
  assert.match(source, /<li className=\{styles\.offer\}>\{practiceLabels\.sayItAloud\}/);
  assert.match(source, /<li className=\{styles\.offer\}>\{practiceLabels\.writeItOnPaper\}/);
});

/* -------------------------------------------------------------------------- */
/* WYS §21 — the appetite filter                                              */
/* -------------------------------------------------------------------------- */

test("the appetite signal takes no email, opens no chat and unlocks nothing", () => {
  const source = code(appetiteSource);
  for (const forbidden of [
    "email",
    "<input",
    "<form",
    "mailto:",
    "subscribe",
    "newsletter",
    "chat",
    "unlock",
    "upgrade",
    "waitlist"
  ]) {
    assert.ok(!source.toLowerCase().includes(forbidden), `the appetite card reaches for "${forbidden}"`);
  }
});

test("wys_depth_interest is allowlisted and fired bare", () => {
  assert.ok((WYS_EVENT_NAMES as readonly string[]).includes("wys_depth_interest"));
  assert.equal(validateWysEvent("wys_depth_interest", {}).ok, true);

  const source = code(appetiteSource);
  assert.match(source, /trackWys\("wys_depth_interest"\)/);
  assert.ok(
    !/trackWys\("wys_depth_interest",/.test(source),
    "§19.4: send the event name, never the reason"
  );
});

test("nothing is sent without consent, and the local record does not depend on sending", () => {
  // `analyticsConsentGranted()` fails closed off a browser, and `trackWys` runs
  // the gate on every call — so the event cannot leave a declined browser.
  assert.equal(analyticsConsentGranted(), false);
  const result = trackWys("wys_depth_interest", {}, { onRefusal: () => {} });
  assert.equal(result.sent, false);

  // The local write happens FIRST, so a blocked or declined analytics setup
  // never costs the learner their own record.
  const source = code(appetiteSource);
  const updateAt = source.indexOf("update((current)");
  const trackAt = source.indexOf('trackWys("wys_depth_interest")');
  assert.ok(updateAt > -1 && trackAt > -1);
  assert.ok(updateAt < trackAt, "the analytics call runs before the local record is made");
});

test("the recorded state is not a reward, and the pill cannot be clicked twice", () => {
  const source = code(appetiteSource);
  assert.match(source, /disabled=\{recorded\}/, "a second click could inflate the one count Ben reads");
  assert.match(source, /ProvenanceMono/, "the recorded state should stay in the muted provenance voice");
  assert.equal(practiceLabels.appetiteNote, "One anonymous count. No email. Nothing unlocks.");
  assert.equal(practiceLabels.deeperPractice, "I'd want deeper practice");
});

test("nothing anywhere on Practice branches on the appetite flag to change what is offered", () => {
  // §21: no gamified feature catalog, nothing unlocks. The flag is read in
  // exactly one place, to stop asking twice.
  const reads = [pageSource, replaySource, fromMemorySource, appetiteSource].filter((source) =>
    code(source).includes("deeperPracticeInterest")
  );
  assert.equal(reads.length, 1, "the appetite flag is read on more than one surface");
});

/* -------------------------------------------------------------------------- */
/* Content, provenance and the route                                          */
/* -------------------------------------------------------------------------- */

test("every Practice record is registered, so the governance checks can see it", () => {
  const registered = new Set(wysCanonicalRecords.map((record) => record.id));
  for (const record of practiceCopyRecords) {
    assert.ok(registered.has(record.id), `${record.id} is not in wysCanonicalRecords`);
    assert.ok(record.sourceIds.length > 0, `${record.id} cites no source`);
  }
  assert.equal(practiceCopyRecords.length, 4);
});

test("the four Practice records are approved artboard copy and render as canon", () => {
  for (const record of [
    practiceLeadText,
    fromMemoryPromptText,
    fromMemoryScratchNoticeText,
    appetiteExplanationText
  ]) {
    const gated = gatedCanonicalText(record, "short");
    assert.ok(gated, `${record.id} did not resolve`);
    assert.equal(gated.policy.kind, "canon");
    assert.ok(
      record.sourceIds.includes("artboard-5c-practice"),
      `${record.id} renders as Ben-attributed without citing the artboard it came from`
    );
  }
});

test("no Practice copy scores, ranks, or makes the learner feel behind", () => {
  const forbidden = [
    "streak",
    "score",
    "xp",
    "level up",
    "badge",
    "rank",
    "behind",
    "overdue",
    "missed",
    "keep it up",
    "well done",
    "congratulations"
  ];
  const haystack = [
    JSON.stringify(practiceCopyRecords),
    JSON.stringify(practiceLabels),
    code(pageSource),
    code(replaySource),
    code(fromMemorySource),
    code(appetiteSource)
  ]
    .join(" ")
    .toLowerCase();

  for (const word of forbidden) {
    // Word boundaries, not substrings: "xp" lives inside "expression" and
    // "experienced", and a scan that flagged those would be turned off within a
    // week — which is how a real "XP" would get in.
    const pattern = new RegExp(`\\b${word.replace(/ /g, "\\s+")}\\b`);
    assert.ok(!pattern.test(haystack), `Practice carries "${word}" — WYS §13, §31`);
  }
});

test("Practice is a declared course route and the tab bar points at it", () => {
  assert.ok(WYS_ROUTES.includes("/watch-your-step/practice"));
  assert.ok(COURSE_TAB_HREFS.includes("/watch-your-step/practice"));
  assert.match(code(pageSource), /canonical: "\/watch-your-step\/practice"/);
});

test("no learner value reaches the URL or the page title from this route", () => {
  const source = code(pageSource);
  assert.match(source, /title: `\$\{practiceLabels\.pageTitle\} - BenChanTech`/);
  assert.ok(!source.includes("searchParams"), "Practice reads no query parameters");
  // A query string would reach GA4 as `page_location` (the preserved config
  // sets `send_page_view: true`), so no string literal on this route may carry
  // one. Ternaries are not query strings; a `?` inside a quoted string is.
  for (const literal of source.matchAll(/"([^"\n]*)"/g)) {
    assert.ok(!literal[1].includes("?"), `a string literal on Practice carries a query string: ${literal[1]}`);
  }
});
