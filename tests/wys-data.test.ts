import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { claimById } from "@/content/claims";
import {
  AGGREGATE_COUNTER_SENTENCE,
  WYS_AGGREGATE_ENABLED,
  aggregateCounterSentence
} from "@/content/watch-your-step/config";
import {
  addedDataPageRows,
  analyticsConditionsText,
  analyticsDeclinedText,
  analyticsUnavailableText,
  analyticsUndecidedText,
  approvedDataPageRows,
  benDoesNotNeedText,
  browserKeyValueSummary,
  clearedDemonstrationText,
  clearingFootnoteText,
  clearingSurvivesText,
  confirmationProvenance,
  consentReadingFor,
  dataCopyRecords,
  dataLabels,
  dataManifestIntroText,
  dataPageRowsInRenderOrder,
  localDataFile,
  rawJsonPreview,
  storageBlockedText
} from "@/content/watch-your-step/data";
import { wysCanonicalRecords } from "@/content/watch-your-step";
import { wysLabels } from "@/content/watch-your-step/copy";
import {
  BROWSER_KEYS,
  CONSENT_STORAGE_KEY,
  keysSurvivingWysClear
} from "@/lib/wys/browser-keys";
import {
  CLEAR_ALL_WYS_DATA_EXPLANATION,
  RESTART_COURSE_EXPLANATION,
  WYS_KEY_PREFIX,
  WYS_STORAGE_KEY,
  WYS_TOP_LEVEL_FIELDS,
  clearAllWysData,
  emptyWysState
} from "@/lib/wys/local-state";
import { WYS_DECISION_USE, analyticsConsentGranted } from "@/lib/wys/telemetry";
import { gateProse } from "@/lib/wys/content-gate";
import { renderPolicyFor } from "@/lib/content-status";
import { resolveVariant } from "@/lib/canonical-text";

/**
 * The Data page (plan Phase 8; WYS §18, §20, §37; mockup `5c` Data).
 *
 * The page's whole claim is that every sentence on it is true of the shipped
 * code, so these tests check sentences AGAINST CODE rather than against the
 * artboard: the rows against the declared schema, the key list against the
 * registry, the consent-conditioned sentence against the adapter's own gate,
 * the aggregate sentence against the flag it is bound to, and the clearing
 * footnote against what `clearAllWysData()` actually removes.
 *
 * Rendering-free by necessity (docs/facelift-build-notes.md §4.1): Node cannot
 * load a `.module.css` specifier, so a `.tsx` that imports one cannot be
 * imported here. Everything load-bearing therefore lives in pure modules that
 * CAN be imported, and the component-level rules are asserted against source
 * text — which is also the only way to check "this file fires exactly these
 * three events and no others".
 */

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROUTE_DIR = path.join(repoRoot, "app", "watch-your-step", "(shell)", "data");

function read(relative: string): string {
  return readFileSync(path.join(repoRoot, relative), "utf8");
}

function routeFile(name: string): string {
  return readFileSync(path.join(ROUTE_DIR, name), "utf8");
}

function routeSources(): { name: string; source: string }[] {
  return readdirSync(ROUTE_DIR)
    .filter((entry) => entry.endsWith(".tsx"))
    .map((entry) => ({ name: entry, source: routeFile(entry) }));
}

/** Comments carry event names and key literals in prose; strip them first. */
function withoutComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
}

/* -------------------------------------------------------------------------- */
/* The route exists and is static                                             */
/* -------------------------------------------------------------------------- */

test("/watch-your-step/data has a page file behind its tab", () => {
  // The five-tab bottom nav shipped in Phase 5 and the Data tab 404'd until
  // this phase (docs/facelift-build-notes.md, Phase 7 gate hazard 3).
  assert.ok(existsSync(path.join(ROUTE_DIR, "page.tsx")));
});

test("the Data route adds no dynamic rendering", () => {
  for (const { name, source } of routeSources()) {
    assert.equal(/export const dynamic\b/.test(source), false, `${name} opts out of static`);
    assert.equal(/force-dynamic|revalidate\s*=/.test(source), false, `${name} opts out of static`);
    assert.equal(/generateStaticParams/.test(source), false, `${name} declares params`);
  }
});

test("the page title and canonical are the pinned Q6 node, not a fifth name", () => {
  const page = routeFile("page.tsx");
  assert.equal(dataLabels.pageTitle, wysLabels.dataPageTitle);
  assert.match(page, /title: `\$\{dataLabels\.pageTitle\} - BenChanTech`/);
  assert.match(page, /alternates: \{ canonical: "\/watch-your-step\/data" \}/);
  // A learner value must never reach a page title or a path segment (§8.5).
  const metadata = page.slice(page.indexOf("export const metadata"), page.indexOf("const inkBodyClass"));
  assert.equal(/state|localStorage|useWysState/.test(metadata), false, "the title reads learner state");
});

/* -------------------------------------------------------------------------- */
/* Card 1 — rows generated from the declared field set (§7.5)                 */
/* -------------------------------------------------------------------------- */

test("card 1's rows are total over the declared wys:v1 field set, both ways", () => {
  const rowFields = dataPageRowsInRenderOrder.map((row) => row.field);
  assert.deepEqual([...rowFields].sort(), [...WYS_TOP_LEVEL_FIELDS].sort());
  assert.equal(new Set(rowFields).size, rowFields.length, "a field is rendered twice");
  assert.equal(
    dataPageRowsInRenderOrder.length,
    approvedDataPageRows.length + addedDataPageRows.length
  );
});

test("the artboard's five lines render first, verbatim and in their drawn order", () => {
  // dc.html:184-188. R1: the approved rows keep their copy and their order, and
  // the additions follow rather than displacing them.
  const approvedLines = approvedDataPageRows.flatMap((row) => row.lines.map((line) => line.label));
  assert.deepEqual(approvedLines, [
    "Onboarding",
    "Pace · time",
    "Stops · scenarios · carries",
    "Rulebook",
    "Deeper-practice interest"
  ]);

  const rendered = dataPageRowsInRenderOrder.flatMap((row) => row.lines.map((line) => line.label));
  assert.deepEqual(rendered.slice(0, approvedLines.length), approvedLines);
});

test("the two rows WYS §20 requires and the artboard omits are present", () => {
  const labels = dataPageRowsInRenderOrder.flatMap((row) => row.lines.map((line) => line.label));
  assert.ok(labels.includes("Local judgments"), "WYS §20 requires local judgments");
  assert.ok(labels.includes("Last route"), "WYS §20 requires last route");
  for (const row of addedDataPageRows) {
    assert.equal(row.source, "new-unapproved", "an addition must be marked in the data");
  }
});

test("an empty browser renders no invented value anywhere in card 1", () => {
  const empty = emptyWysState();
  for (const row of dataPageRowsInRenderOrder) {
    for (const line of row.lines) {
      const value = line.value(empty);
      assert.equal(typeof value, "string");
      assert.notEqual(value.trim(), "", `${line.label} renders blank rather than a value`);
    }
  }
});

test("the row values are read from state, never typed into the view", () => {
  const view = withoutComments(routeFile("DataManifest.tsx"));
  assert.match(view, /dataPageRowsInRenderOrder/);
  assert.match(view, /line\.value\(state\)/);
  // The five artboard labels are in content, not in the component.
  assert.equal(/"Deeper-practice interest"|"Stops · scenarios · carries"/.test(view), false);
});

/* -------------------------------------------------------------------------- */
/* Card 1 — the key register, and the sitewide title (Q6)                     */
/* -------------------------------------------------------------------------- */

test("the key list is generated from BROWSER_KEYS, not written out", () => {
  const view = withoutComments(routeFile("DataManifest.tsx"));
  assert.match(view, /BROWSER_KEYS\.map/);
  assert.equal(
    /"bct_analytics_consent"|'bct_analytics_consent'/.test(view),
    false,
    "a key literal in the view is a key list that can fall out of date"
  );
  assert.equal(/"wys:v1"|'wys:v1'/.test(view), false, "the storage key is imported, never typed");
});

test("both browser keys are in the registry, so the sitewide title stays honest (Q6)", () => {
  const keys = BROWSER_KEYS.map((record) => record.key);
  assert.ok(keys.includes(WYS_STORAGE_KEY));
  assert.ok(keys.includes(CONSENT_STORAGE_KEY));
  // Q6's ratified default keeps "What this site knows about you" — a claim
  // about the SITE — and makes it true by listing the consent key too.
  assert.equal(dataLabels.pageTitle, "What this site knows about you");
});

test("the mono key line is composed from the implementation, not typed beside it", () => {
  // Plan §7.1: this string "is user-visible copy on the Data page and must
  // match the implementation exactly".
  assert.equal(dataLabels.rawJsonSummary, "key: wys:v1 · raw JSON ↓");
  assert.match(read("content/watch-your-step/data.ts"), /rawJsonSummary: `key: \$\{WYS_STORAGE_KEY\}/);
});

test("'not read yet' and 'not set' are different statements", () => {
  // The server render cannot read localStorage (§7.3), so it must not claim a
  // key is empty. A visitor with JavaScript disabled keeps the pending value.
  assert.notEqual(dataLabels.pendingValue, dataLabels.keyNotSet);
  assert.notEqual(dataLabels.pendingValue, dataLabels.emptyValue);
  assert.equal(browserKeyValueSummary(null), dataLabels.keyNotSet);
  assert.equal(browserKeyValueSummary("granted"), "granted");
  assert.equal(browserKeyValueSummary("x".repeat(400)), "400 characters");

  const view = withoutComments(routeFile("DataManifest.tsx"));
  assert.match(view, /useState<readonly BrowserKeyReading\[\] \| null>\(null\)/);
  assert.match(view, /readings === null \? dataLabels\.pendingValue/);
});

test("the raw JSON disclosure shows the stored bytes, or says the key is unset", () => {
  assert.equal(rawJsonPreview(null), dataLabels.keyNotSet);
  assert.equal(rawJsonPreview('{"schemaVersion":1}'), '{\n  "schemaVersion": 1\n}');
  assert.equal(rawJsonPreview("{not json"), "{not json");
});

/* -------------------------------------------------------------------------- */
/* Card 2 — the two assertions conditioned on state, not on copy              */
/* -------------------------------------------------------------------------- */

test("the aggregate sentence cannot render while the counter is disabled (Q22, SC-12)", () => {
  assert.equal(WYS_AGGREGATE_ENABLED, false);
  assert.equal(aggregateCounterSentence(), null, "the string is constructed while the flag is off");
  // The binding is real: flip the flag and the same module produces it.
  assert.equal(aggregateCounterSentence(true), AGGREGATE_COUNTER_SENTENCE);

  const page = withoutComments(routeFile("page.tsx"));
  assert.match(page, /aggregateCounterSentence\(\)/);
  assert.equal(
    /AGGREGATE_COUNTER_SENTENCE/.test(page),
    false,
    "rendering the constant would put the sentence in the DOM with the counter off"
  );
  assert.equal(/first-party counter/.test(page), false);
});

test("the approved coarse-counts sentence renders only where it is true (Q7, SC-2)", () => {
  const record = claimById("analytics");
  const short = resolveVariant(record, "short");
  assert.equal(short.kind, "text");
  if (short.kind !== "text") return;
  assert.equal(
    short.text,
    "Page analytics, and coarse counts: someone started, finished a stop, used replay, reached a carry, asked for depth."
  );

  const receipt = withoutComments(routeFile("AnalyticsReceipt.tsx"));
  // One ternary, and "granted" is the only branch that reaches the claim.
  assert.match(receipt, /reading === "granted" \? granted : reading === "denied" \? declined : undecided/);
  assert.match(receipt, /if \(reading === "pending"\) return null;/);
});

test("the consent read fails closed, and agrees with the adapter's own gate", () => {
  assert.equal(consentReadingFor("granted"), "granted");
  assert.equal(consentReadingFor("denied"), "denied");
  assert.equal(consentReadingFor(null), "unset");
  assert.equal(consentReadingFor(undefined), "unset");
  assert.equal(consentReadingFor(""), "unset");
  assert.equal(consentReadingFor("GRANTED"), "unset");
  assert.equal(consentReadingFor("yes"), "unset");

  // `analyticsConsentGranted()` is the adapter's rule. The page's rule must not
  // be more permissive, or the page would promise a send the adapter refuses.
  const original = Reflect.getOwnPropertyDescriptor(globalThis, "window");
  for (const stored of ["granted", "denied", "", "GRANTED", null]) {
    const store = { getItem: (key: string) => (key === CONSENT_STORAGE_KEY ? stored : null) };
    Object.defineProperty(globalThis, "window", {
      value: { localStorage: store },
      configurable: true,
      writable: true
    });
    assert.equal(
      analyticsConsentGranted(),
      consentReadingFor(stored) === "granted",
      `the two gates disagree for ${JSON.stringify(stored)}`
    );
  }
  if (original) Object.defineProperty(globalThis, "window", original);
  else Reflect.deleteProperty(globalThis, "window");
});

test("a thrown consent read means 'do not send', on both sides", () => {
  const original = Reflect.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", {
    value: {
      get localStorage(): Storage {
        throw new Error("iOS Safari private browsing");
      }
    },
    configurable: true,
    writable: true
  });
  assert.equal(analyticsConsentGranted(), false);
  if (original) Object.defineProperty(globalThis, "window", original);
  else Reflect.deleteProperty(globalThis, "window");

  // The page's read reuses the pure mapping rather than restating it, and its
  // catch resolves through the same function — so a throw lands on "unset".
  const receipt = withoutComments(routeFile("AnalyticsReceipt.tsx"));
  assert.match(receipt, /\} catch \{\s*return consentReadingFor\(null\);/);
  assert.equal(consentReadingFor(null), "unset");
});

test("the event register is derived from the adapter, never listed by hand", () => {
  const page = withoutComments(routeFile("page.tsx"));
  assert.match(page, /WYS_DECISION_USE\.filter\(\(row\) => row\.firedInV0\)/);
  assert.equal(/"wys_[a-z_]+"/.test(page), false, "an event name literal in the page can go stale");

  const fired = WYS_DECISION_USE.filter((row) => row.firedInV0).map((row) => row.event);
  // The two deliberately-unfired events must not be advertised as sent.
  assert.equal(fired.includes("wys_view"), false);
  assert.equal(fired.includes("wys_transfer_check_complete"), false);
  assert.ok(fired.includes("wys_data_manifest_view"), "the page must disclose the event it fires");
  assert.ok(fired.length > 5, "the approved sentence names five; the allowlist fires more");
});

/* -------------------------------------------------------------------------- */
/* Clearing removes only wys:* — and the footnote says exactly that           */
/* -------------------------------------------------------------------------- */

function fakeStorage(seed: Record<string, string>): Storage {
  const map = new Map(Object.entries(seed));
  return {
    get length() {
      return map.size;
    },
    key: (index: number) => [...map.keys()][index] ?? null,
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
    clear: () => map.clear()
  } as Storage;
}

test("a clear removes every wys: key and nothing else", () => {
  const original = Reflect.getOwnPropertyDescriptor(globalThis, "window");
  const store = fakeStorage({
    [WYS_STORAGE_KEY]: '{"schemaVersion":1}',
    "wys:later": "added in month three",
    [CONSENT_STORAGE_KEY]: "granted",
    unrelated_key: "left alone"
  });
  Object.defineProperty(globalThis, "window", {
    value: { localStorage: store },
    configurable: true,
    writable: true
  });

  const result = clearAllWysData();
  assert.equal(result.cleared, true);
  assert.deepEqual([...result.removedKeys].sort(), ["wys:later", WYS_STORAGE_KEY].sort());
  assert.equal(store.getItem(CONSENT_STORAGE_KEY), "granted", "the consent choice must survive");
  assert.equal(store.getItem("unrelated_key"), "left alone");
  for (const key of result.removedKeys) assert.ok(key.startsWith(WYS_KEY_PREFIX));

  if (original) Object.defineProperty(globalThis, "window", original);
  else Reflect.deleteProperty(globalThis, "window");
});

test("the footnote's approved half is unchanged and its addition is separate", () => {
  const approved = resolveVariant(clearingFootnoteText, "short");
  assert.equal(approved.kind, "text");
  if (approved.kind !== "text") return;
  assert.equal(
    approved.text,
    "Clearing removes this browser's copy. It can't erase hosting or analytics logs — and this page won't pretend it did."
  );
  // Approved artboard copy renders as canon; the amendment carries its own
  // label so Ben can see which half is his.
  assert.equal(renderPolicyFor(clearingFootnoteText).kind, "canon");
  assert.equal(renderPolicyFor(clearingSurvivesText).kind, "marked");
});

test("what survives a clear is what the registry says survives", () => {
  assert.deepEqual(keysSurvivingWysClear(), [CONSENT_STORAGE_KEY]);
  const survives = resolveVariant(clearingSurvivesText, "short");
  assert.equal(survives.kind, "text");
  if (survives.kind !== "text") return;
  assert.match(survives.text, /analytics choice/);
  assert.match(survives.text, /clearing does not touch/);
  // It links to the page that explains the key in full.
  assert.equal(dataLabels.cookiesHref, "/cookies");
  assert.ok(existsSync(path.join(repoRoot, "app", "cookies", "page.tsx")));
});

test("nothing on the page claims a clear reached hosting or analytics logs", () => {
  for (const record of dataCopyRecords) {
    for (const variant of Object.values(record.variants)) {
      if (typeof variant !== "string") continue;
      assert.equal(
        /erases? (?:the )?(?:hosting|analytics|server) log/i.test(variant),
        false,
        `${record.id} claims a clear reached a log it cannot reach`
      );
    }
  }
});

/* -------------------------------------------------------------------------- */
/* The three actions                                                          */
/* -------------------------------------------------------------------------- */

test("restart and clear are distinct, and each explains itself before it runs", () => {
  const view = withoutComments(routeFile("DataManifest.tsx"));

  // Two operations, two handlers, two panels.
  assert.match(view, /function confirmRestart\(\): void \{\s*restart\(\);/);
  assert.match(view, /function confirmClear\(\): void \{\s*clearAll\(\);/);
  assert.equal((view.match(/restart\(\);/g) ?? []).length, 1, "restart runs from one place");
  assert.equal((view.match(/clearAll\(\);/g) ?? []).length, 1, "clearAll runs from one place");

  // Neither pill acts. Each opens the panel that carries the acting control.
  assert.match(view, /onClick=\{\(\) => setPanel\("restart"\)\}/);
  assert.match(view, /onClick=\{\(\) => setPanel\("clear"\)\}/);
  assert.equal(
    /onClick=\{\(\) => (?:restart|clearAll)\(/.test(view),
    false,
    "a pill that acts directly would skip the explanation WYS §17 requires"
  );
  assert.match(view, /onClick=\{confirmRestart\}/);
  assert.match(view, /onClick=\{confirmClear\}/);

  // The explanations are the ones written beside the two functions.
  assert.ok(RESTART_COURSE_EXPLANATION.length > 0);
  assert.ok(CLEAR_ALL_WYS_DATA_EXPLANATION.length > 0);
  const page = withoutComments(routeFile("page.tsx"));
  assert.match(page, /restartExplanation=\{gatedLines\(RESTART_COURSE_EXPLANATION\)\}/);
  assert.match(page, /clearExplanation=\{gatedLines\(CLEAR_ALL_WYS_DATA_EXPLANATION\)\}/);
});

test("the two explanations say what each operation keeps, truthfully", () => {
  const restart = RESTART_COURSE_EXPLANATION.join(" ");
  assert.match(restart, /rulebook stays/i);
  const clear = CLEAR_ALL_WYS_DATA_EXPLANATION.join(" ");
  assert.match(clear, /does not erase hosting logs/i);
  assert.match(clear, /analytics choice is stored under a different key/i);
  // The artboard's own promise on the restart pill.
  assert.equal(dataLabels.restartCourseMeta, "· keeps rulebook");
});

/* -------------------------------------------------------------------------- */
/* The Phase 8 gate's corrections — three sentences that were not true         */
/* -------------------------------------------------------------------------- */

test("no sentence claims an absolute absence of collection, anywhere on the screen", () => {
  // Three wordings shipped to the gate and were removed, each false in a state
  // this build can reach. They are asserted absent rather than described,
  // because the failure mode is a later phase reintroducing the comfortable
  // sentence (WYS §34, plan R8 — narrow the claim, never soften the wording).
  const sentences = [
    ...dataCopyRecords.flatMap((record) =>
      Object.values(record.variants).filter((variant): variant is string => typeof variant === "string")
    ),
    ...RESTART_COURSE_EXPLANATION,
    ...CLEAR_ALL_WYS_DATA_EXPLANATION
  ];
  for (const sentence of sentences) {
    // A page load reaches a host, which the infrastructure paragraph discloses.
    assert.equal(/counted anywhere/i.test(sentence), false, sentence);
    // Both destructive controls fire an allowlisted GA4 event.
    assert.equal(/nothing is sent anywhere/i.test(sentence), false, sentence);
    // ConsentBanner renders whenever NO choice is stored, so a visitor whose
    // key row reads "not set" would be asked again.
    assert.equal(/(?:won't|will not) (?:ask|be asked)[^.]*cookies again/i.test(sentence), false, sentence);
  }
});

test("each destructive explanation names the event its own button fires", () => {
  // `confirmRestart` and `confirmClear` call `trackWys` immediately after the
  // local operation, so a panel that went quiet about it would be false for
  // every browser that granted analytics — on the one screen whose subject is
  // exactly what gets sent.
  const cases = [
    { lines: RESTART_COURSE_EXPLANATION, event: "wys_restart_course", verb: "restart" },
    { lines: CLEAR_ALL_WYS_DATA_EXPLANATION, event: "wys_local_state_clear", verb: "clear" }
  ] as const;
  for (const { lines, event, verb } of cases) {
    const joined = lines.join(" ");
    // Hedged to the two conditions `trackWys` actually checks, in order.
    assert.match(joined, /analytics are running and allowed on this device/i);
    assert.match(joined, new RegExp(`counts that a ${verb} happened`, "i"));
    assert.match(joined, /the count only, with nothing about you in it/i);
    // And the event is real, allowlisted and actually fired in v0.
    const row = WYS_DECISION_USE.find((candidate) => candidate.event === event);
    assert.ok(row, `${event} is not in the decision table`);
    assert.equal(row?.firedInV0, true);
  }
});

test("the surviving-key addition claims only what a clear actually does", () => {
  const survives = clearingSurvivesText.variants.short;
  assert.match(survives, /clearing does not change whether this site asks you about cookies/);
  // It must not promise the banner is gone: `ConsentBanner` renders on an
  // ABSENT choice, and card 1 can show `bct_analytics_consent · not set` at the
  // same moment. One screen cannot carry both statements.
  assert.equal(/again/.test(survives), false, survives);
  assert.match(clearingSurvivesText.origin, /AI_SYNTHESIS/);
});

test("the no-measurement-id branch is scoped to analytics, not to the whole page", () => {
  const unavailable = analyticsUnavailableText.variants.short;
  // The two things this build can check, and nothing wider.
  assert.match(unavailable, /no analytics script loads/);
  assert.match(unavailable, /sends none of its counts from any browser/);
  // `GoogleAnalytics.tsx` returns null without the id, and `trackWys` refuses
  // on `measurementIdIsSet()` before it ever reaches the consent gate.
  const ga = read("components/GoogleAnalytics.tsx");
  assert.match(ga, /if \(!measurementId\) return null;/);
  const adapter = read("lib/wys/telemetry.ts");
  assert.match(adapter, /if \(!measurementIdIsSet\(\)\) \{\s*\n\s*return \{ sent: false, buffered: false, refusal: "no-measurement-id"/);
});

test("the download is built in the browser, from the browser's own bytes", () => {
  const file = localDataFile([
    { key: WYS_STORAGE_KEY, raw: '{"schemaVersion":1,"rulebook":[]}' },
    { key: CONSENT_STORAGE_KEY, raw: "denied" },
    { key: "wys:absent", raw: null }
  ]);
  const parsed = JSON.parse(file) as Record<string, unknown>;
  assert.deepEqual(Object.keys(parsed), [WYS_STORAGE_KEY, CONSENT_STORAGE_KEY, "wys:absent"]);
  assert.deepEqual(parsed[WYS_STORAGE_KEY], { schemaVersion: 1, rulebook: [] });
  assert.equal(parsed[CONSENT_STORAGE_KEY], "denied");
  assert.equal(parsed["wys:absent"], null);

  // Nothing this build added: no timestamp, no build id, no fingerprint.
  assert.equal(Object.keys(parsed).length, 3);

  const view = withoutComments(routeFile("DataManifest.tsx"));
  assert.match(view, /new Blob\(\[localDataFile\(readings\)\]/);
  assert.equal(/fetch\(|XMLHttpRequest|sendBeacon/.test(view), false, "the download makes no request");
});

test("the post-clear panel is the WYS §20 teaching interaction, and it can be reloaded", () => {
  const view = withoutComments(routeFile("DataManifest.tsx"));
  assert.match(view, /setPanel\("cleared"\)/);
  assert.match(view, /panel === "cleared"/);
  assert.match(view, /window\.location\.reload\(\)/);

  const teaching = resolveVariant(clearedDemonstrationText, "short");
  assert.equal(teaching.kind, "text");
  if (teaching.kind !== "text") return;
  assert.match(teaching.text, /no server copy/i);
  assert.match(teaching.text, /Restarting the course/i);
  // It must NOT claim nothing was sent: clearing fires wys_local_state_clear.
  assert.equal(/nothing (?:was |is )?sent/i.test(teaching.text), false);
});

test("a browser that blocks storage gets its own answer, and no dead controls", () => {
  const view = withoutComments(routeFile("DataManifest.tsx"));
  assert.match(view, /storageBlocked \? \(/);
  assert.match(view, /storageBlockedNotice/);
  assert.equal(
    (view.match(/disabled=\{storageBlocked/g) ?? []).length,
    3,
    "all three actions must be inert when there is nothing to act on"
  );
});

/* -------------------------------------------------------------------------- */
/* Telemetry — exactly three events                                           */
/* -------------------------------------------------------------------------- */

test("the Data route fires only the three events WYS §19.4 gives it", () => {
  const fired = new Set<string>();
  for (const { source } of routeSources()) {
    for (const match of withoutComments(source).matchAll(/trackWys\(\s*"([a-z_]+)"/g)) {
      fired.add(match[1]);
    }
  }
  assert.deepEqual(
    [...fired].sort(),
    ["wys_data_manifest_view", "wys_local_state_clear", "wys_restart_course"]
  );
});

test("the manifest view fires once per session, and adds no browser key", () => {
  const telemetry = withoutComments(routeFile("DataManifestTelemetry.tsx"));
  assert.match(telemetry, /let viewed = false;/);
  assert.match(telemetry, /if \(viewed\) return;/);
  assert.match(telemetry, /useEffect\(/);
  assert.equal(
    /sessionStorage|localStorage/.test(telemetry),
    false,
    "a session flag would be a third browser key this very page would have to list"
  );
});

test("clearing and restarting fire AFTER the local operation, never instead of it", () => {
  const view = withoutComments(routeFile("DataManifest.tsx"));
  const restartBody = view.slice(view.indexOf("function confirmRestart"), view.indexOf("function confirmClear"));
  assert.ok(restartBody.indexOf("restart();") < restartBody.indexOf("trackWys("));
  const clearBody = view.slice(view.indexOf("function confirmClear"), view.indexOf("function reload"));
  assert.ok(clearBody.indexOf("clearAll();") < clearBody.indexOf("trackWys("));
});

test("nothing about what the page displayed is sent", () => {
  const telemetry = withoutComments(routeFile("DataManifestTelemetry.tsx"));
  // route_type is an allowlisted closed-vocabulary property; nothing else.
  assert.match(telemetry, /trackWys\("wys_data_manifest_view", \{ route_type: "course" \}\)/);
  const view = withoutComments(routeFile("DataManifest.tsx"));
  assert.match(view, /trackWys\("wys_restart_course"\)/);
  assert.match(view, /trackWys\("wys_local_state_clear"\)/);
});

/* -------------------------------------------------------------------------- */
/* Provenance and voice                                                       */
/* -------------------------------------------------------------------------- */

test("every Data page record is registered, so the governance checks see it", () => {
  const registered = new Set(wysCanonicalRecords.map((record) => record.id));
  for (const record of dataCopyRecords) {
    assert.ok(registered.has(record.id), `${record.id} escapes every governance check`);
  }
  assert.equal(dataCopyRecords.length, 10);
});

test("approved artboard copy is canon; everything this build wrote is marked", () => {
  const approved = [dataManifestIntroText, benDoesNotNeedText, clearingFootnoteText];
  for (const record of approved) {
    assert.equal(record.origin, "BEN_APPROVED");
    assert.equal(renderPolicyFor(record).kind, "canon", `${record.id} should render as approved`);
  }

  const authored = [
    clearingSurvivesText,
    analyticsConditionsText,
    analyticsUnavailableText,
    analyticsDeclinedText,
    analyticsUndecidedText,
    clearedDemonstrationText,
    storageBlockedText
  ];
  for (const record of authored) {
    assert.equal(record.origin, "AI_SYNTHESIS", `${record.id} must not read as Ben's`);
    const policy = renderPolicyFor(record);
    assert.equal(policy.kind, "marked", `${record.id} must carry its label`);
    if (policy.kind !== "marked") continue;
    assert.equal(policy.label, "Drafted during implementation — not Ben's words");
    assert.equal(policy.draftMark, "default", "AI-drafted prose carries its draft mark (§6.2)");
  }
});

test("the confirmation explanations reach the screen through the gate", () => {
  const gated = gateProse("general", confirmationProvenance, RESTART_COURSE_EXPLANATION[0]);
  assert.equal(gated.policy.kind, "marked");
  assert.equal(gated.label, "Drafted during implementation — not Ben's words");
  assert.equal(gated.text, RESTART_COURSE_EXPLANATION[0]);
});

test("no sentence on this page is written in Ben's first person (R10)", () => {
  for (const record of dataCopyRecords) {
    for (const variant of Object.values(record.variants)) {
      if (typeof variant !== "string") continue;
      assert.equal(/\b(?:I|I'm|I've|my|me)\b/.test(variant), false, `${record.id} speaks as Ben`);
    }
  }
});

test("no forbidden privacy claim appears in the Data page's own copy (§8b.3)", () => {
  const forbidden = [
    "no tracking",
    "no data collection",
    "zero trust",
    "total privacy",
    "100% private",
    "100% anonymous",
    "impossible re-identification",
    "ai-proof",
    "hallucination-proof",
    "privacy guaranteed",
    "ai you can trust",
    "the correct way to use ai",
    "become ai literate",
    "expert-certified"
  ];
  const surfaces = [
    ...dataCopyRecords,
    claimById("minimal-trust"),
    claimById("analytics")
  ];
  // The two confirmation panels render on this screen too, and their single
  // definition is in `lib/`, so the sweep has to reach them as well.
  const libSentences = [...RESTART_COURSE_EXPLANATION, ...CLEAR_ALL_WYS_DATA_EXPLANATION];
  for (const sentence of libSentences) {
    const text = sentence.toLowerCase();
    for (const phrase of forbidden) {
      assert.equal(text.includes(phrase), false, `a confirmation line claims "${phrase}"`);
    }
  }
  for (const record of surfaces) {
    for (const [key, variant] of Object.entries(record.variants)) {
      if (typeof variant !== "string") continue;
      const text = variant.toLowerCase();
      for (const phrase of forbidden) {
        // "Not zero trust" is the approved infrastructure paragraph's DENIAL of
        // the claim, which is the one sanctioned appearance of the phrase.
        if (phrase === "zero trust" && /not (?:“)?zero trust/.test(text)) continue;
        if (phrase === "zero trust" && /not ["“]zero trust/.test(text)) continue;
        assert.equal(
          text.includes(phrase),
          false,
          `${record.id}.${key} makes the forbidden claim "${phrase}"`
        );
      }
    }
  }
});

test("the infrastructure paragraph is the artboard's short form, not WYS §18's full one", () => {
  const page = withoutComments(routeFile("page.tsx"));
  assert.match(page, /gatedCanonicalText\(claimById\("minimal-trust"\), "short"\)/);
  const short = resolveVariant(claimById("minimal-trust"), "short");
  assert.equal(short.kind, "text");
  if (short.kind !== "text") return;
  assert.match(short.text, /Not zero trust — the minimum trust required, and named\./);
  assert.equal(/needed to deliver or understand use of the site/.test(short.text), false);
});

/* -------------------------------------------------------------------------- */
/* Hydration (§7.3)                                                           */
/* -------------------------------------------------------------------------- */

test("no component on this route reads storage during render", () => {
  for (const { name, source } of routeSources()) {
    const body = withoutComments(source);
    if (!/localStorage/.test(body)) continue;
    // Every read sits inside a named function that only an effect or a handler
    // calls; none of them is invoked at module scope or in a state initialiser.
    assert.match(body, /function read(?:RawKey|ConsentChoice)\(/, `${name} reads storage inline`);
    assert.equal(
      /useState\([^)]*localStorage/.test(body),
      false,
      `${name} reads storage in a state initialiser`
    );
  }
});

test("the page is server-rendered and hands the client only what needs state", () => {
  assert.equal(/"use client"/.test(routeFile("page.tsx")), false, "the page must stay a server component");
  for (const name of ["DataManifest.tsx", "AnalyticsReceipt.tsx", "DataManifestTelemetry.tsx"]) {
    assert.match(routeFile(name), /^"use client";/);
  }
  // DataText is shared by both halves, so it must claim neither.
  assert.equal(/"use client"/.test(routeFile("DataText.tsx")), false);
});
