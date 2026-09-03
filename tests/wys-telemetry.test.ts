import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync, type Dirent } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  AGGREGATE_COUNTER_SENTENCE,
  WYS_AGGREGATE_ENABLED,
  aggregateCounterSentence
} from "@/content/watch-your-step/config";
import {
  AGGREGATE_ENDPOINT,
  AGGREGATE_EVENT_NAMES,
  type AggregateEvent,
  sendAggregate,
  validateAggregateEvent
} from "@/lib/wys/aggregate";
import {
  GA4_CONFIG_COMMAND,
  WYS_AGGREGATE_ONLY_EVENT_NAMES,
  WYS_DECISION_USE,
  WYS_EVENT_NAMES,
  WYS_FUTURE_AGGREGATE_EVENT_NAMES,
  WYS_PROPERTY_KEYS,
  WYS_ROUTE_TYPES,
  WYS_TELEMETRY_ENABLED,
  WYS_UNFIRED_IN_V0,
  type WysEventName,
  type WysEventProperties,
  type WysRefusal,
  analyticsConsentGranted,
  bufferedWysEventCount,
  flushWysTelemetry,
  ga4ConfigMarkerPresent,
  measurementIdIsSet,
  resetWysTelemetryForTests,
  trackWys,
  validateWysEvent
} from "@/lib/wys/telemetry";

/**
 * Telemetry substrate (plan Phase 3, §8.2-§8.8).
 *
 * The adapter is a refusal before it is a sender, so most of this file asserts
 * that things do NOT happen. Everything runs against pure modules plus a fake
 * `window` carrying a fake `localStorage` and a fake `dataLayer`. No renderer,
 * no network, no new dependency.
 *
 * `components/GoogleAnalytics.tsx` is byte-frozen and is covered separately by
 * `tests/analytics-frozen.test.ts`; nothing here may require an edit to it.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");

/** (WYS §29.2 flow 2). Kept under 24 characters is not required - it is not a credential. */
const CANARY = "DO_NOT_SEND_WYS_TEST_9f31";

/* -------------------------------------------------------------------------- */
/* Fakes                                                                      */
/* -------------------------------------------------------------------------- */

interface FakeWindow {
  localStorage: Storage;
  dataLayer?: IArguments[];
}

const globalRef = globalThis as unknown as { window?: FakeWindow };

function fakeStorage(seed: Record<string, string> = {}): Storage {
  const map = new Map<string, string>(Object.entries(seed));
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    key(index: number) {
      return Array.from(map.keys())[index] ?? null;
    },
    getItem(key: string) {
      return map.has(key) ? (map.get(key) as string) : null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    }
  } as unknown as Storage;
}

interface Harness {
  window: FakeWindow;
  /** Push the `gtag('config', id, {...})` marker `ga4-init` emits. */
  runGa4Init: () => void;
  /** Everything currently queued, as plain arrays. */
  queue: () => unknown[][];
}

function withHarness<T>(
  options: { consent?: string | null; measurementId?: string | null },
  body: (harness: Harness) => T
): T {
  const previousWindow = globalRef.window;
  const previousId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  const seed: Record<string, string> = {};
  if (options.consent) seed.bct_analytics_consent = options.consent;
  const win: FakeWindow = { localStorage: fakeStorage(seed) };
  globalRef.window = win;

  if (options.measurementId === null) delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  else process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = options.measurementId ?? "G-TEST0000";

  resetWysTelemetryForTests();

  const harness: Harness = {
    window: win,
    runGa4Init() {
      // Byte-shaped like components/GoogleAnalytics.tsx's inline body: the
      // dataLayer is created, then js / consent / set / config are queued.
      win.dataLayer = win.dataLayer ?? [];
      // The annotation supplies the call signature; the body IS `arguments`,
      // exactly like the adapter's shim. Spreading into a bare `function () {}`
      // is a TS2556 ("a spread argument must have a tuple type") because the
      // literal's own type is `() => void`.
      const push: (...args: unknown[]) => void = function () {
        win.dataLayer?.push(arguments);
      };
      push("js", new Date());
      push("consent", "default", { analytics_storage: "denied" });
      push("set", "ads_data_redaction", true);
      push("config", "G-TEST0000", { anonymize_ip: true });
    },
    queue() {
      return (win.dataLayer ?? []).map((entry) => Array.from(entry) as unknown[]);
    }
  };

  try {
    return body(harness);
  } finally {
    resetWysTelemetryForTests();
    if (previousWindow === undefined) delete globalRef.window;
    else globalRef.window = previousWindow;
    if (previousId === undefined) delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    else process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = previousId;
  }
}

/** Source with `//` and block comments removed, so a doc comment cannot satisfy a code assertion. */
function codeOnly(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

/** Collect refusals instead of letting them reach the console. */
function collector(): { refusals: WysRefusal[]; onRefusal: (refusal: WysRefusal) => void } {
  const refusals: WysRefusal[] = [];
  return { refusals, onRefusal: (refusal: WysRefusal) => refusals.push(refusal) };
}

/** Only the `event` commands - the ga4-init preamble is not ours. */
function wysEvents(harness: Harness): unknown[][] {
  return harness.queue().filter((entry) => entry[0] === "event");
}

/** Every .ts/.tsx file under the given repo-relative roots that exist. */
function sourceFiles(roots: string[]): string[] {
  const found: string[] = [];
  const walk = (dir: string) => {
    let entries: Dirent[];
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.tsx?$/.test(entry.name)) found.push(full);
    }
  };
  for (const root of roots) walk(path.join(repoRoot, root));
  return found;
}

/* -------------------------------------------------------------------------- */
/* The allowlists are verbatim and closed (§8.2, WYS §19.4, §19.1A)           */
/* -------------------------------------------------------------------------- */

test("the coarse GA4 event allowlist is the thirteen §19.4 names, in order", () => {
  assert.deepEqual(WYS_EVENT_NAMES, [
    "wys_view",
    "wys_start",
    "wys_onboarding_complete",
    "wys_source_period_start",
    "wys_source_period_complete",
    "wys_course_complete",
    "wys_replay",
    "wys_carry_reached",
    "wys_transfer_check_complete",
    "wys_data_manifest_view",
    "wys_local_state_clear",
    "wys_restart_course",
    "wys_depth_interest"
  ]);
});

test("the aggregate-only and future-aggregate names are recorded and are not GA4 events", () => {
  assert.deepEqual(WYS_AGGREGATE_ONLY_EVENT_NAMES, ["wys_scenario_choice", "wys_scenario_skip"]);
  assert.deepEqual(WYS_FUTURE_AGGREGATE_EVENT_NAMES, ["wys_scenario_revision", "wys_overwithholding_case"]);
  for (const name of [...WYS_AGGREGATE_ONLY_EVENT_NAMES, ...WYS_FUTURE_AGGREGATE_EVENT_NAMES]) {
    assert.ok(!(WYS_EVENT_NAMES as readonly string[]).includes(name), `${name} must never be a GA4 event`);
  }
});

test("the property allowlist is the four §19.1A keys", () => {
  assert.deepEqual(WYS_PROPERTY_KEYS, ["lesson_index", "source_period_id", "content_version", "route_type"]);
});

/* -------------------------------------------------------------------------- */
/* Refusals (§8.3)                                                            */
/* -------------------------------------------------------------------------- */

test("an unknown event name is rejected", () => {
  const result = validateWysEvent("wys_totally_made_up", {});
  assert.equal(result.ok, false);
  assert.equal(result.ok === false && result.refusal, "unknown-event");
});

test("an aggregate-only event name is refused by the GA4 adapter with its own reason", () => {
  for (const name of WYS_AGGREGATE_ONLY_EVENT_NAMES) {
    const result = validateWysEvent(name, {});
    assert.equal(result.ok, false);
    assert.equal(result.ok === false && result.refusal, "aggregate-only-event");
  }
});

test("an unknown property key is rejected", () => {
  const result = validateWysEvent("wys_start", { posture_choice: "curious" });
  assert.equal(result.ok, false);
  assert.equal(result.ok === false && result.refusal, "unknown-property");
  assert.equal(result.ok === false && result.detail, "posture_choice");
});

test("a camelCase spelling of an allowlisted property is rejected - snake_case is the wire format", () => {
  // §19.1A names the properties in snake_case; §19.5's example call is written
  // camelCase. Plan §8.2 settles it: no mapping shim, snake_case only.
  for (const key of ["lessonIndex", "sourcePeriodId", "contentVersion", "routeType"]) {
    const result = validateWysEvent("wys_source_period_complete", { [key]: "a" });
    assert.equal(result.ok, false, `${key} must not be accepted`);
    assert.equal(result.ok === false && result.refusal, "unknown-property");
  }
});

test("free text under an allowlisted key is rejected by the value domain", () => {
  const prose = "I was worried about sending the client contract to a model";
  for (const key of ["source_period_id", "content_version", "route_type"]) {
    const result = validateWysEvent("wys_source_period_complete", { [key]: prose });
    assert.equal(result.ok, false, `${key} accepted free text`);
    assert.equal(result.ok === false && result.refusal, "invalid-property-value");
  }
  const numeric = validateWysEvent("wys_source_period_start", { lesson_index: "three" });
  assert.equal(numeric.ok, false);
});

test("route_type is a closed vocabulary", () => {
  for (const value of WYS_ROUTE_TYPES) {
    assert.equal(validateWysEvent("wys_start", { route_type: value }).ok, true);
  }
  assert.equal(validateWysEvent("wys_start", { route_type: "whatever" }).ok, false);
});

test("a whole WysLocalStateV1 object passed as a property is rejected (SC-4)", () => {
  const state = {
    schemaVersion: 1,
    onboarding: { completed: true, postureChoice: "uses-it-a-lot" },
    progress: { completedLessonIds: ["l0"], completedScenarioIds: [], completedCarryIds: [], replayCounts: {}, transferCheckIds: [] }
  };
  const asProps = validateWysEvent("wys_course_complete", state);
  assert.equal(asProps.ok, false);
  assert.equal(asProps.ok === false && asProps.refusal, "unknown-property");

  const nested = validateWysEvent("wys_course_complete", { content_version: state });
  assert.equal(nested.ok, false);
  assert.equal(nested.ok === false && nested.refusal, "invalid-property-value");
});

test("a rulebook array passed as a property, or as the whole props object, is rejected", () => {
  const rulebook = [{ id: "r1", text: "Never paste a client name into a model I do not control." }];
  const asProps = validateWysEvent("wys_course_complete", rulebook);
  assert.equal(asProps.ok, false);
  assert.equal(asProps.ok === false && asProps.refusal, "props-not-a-plain-object");

  const nested = validateWysEvent("wys_course_complete", { source_period_id: rulebook });
  assert.equal(nested.ok, false);
  assert.equal(nested.ok === false && nested.refusal, "invalid-property-value");
});

test("the validated props object is rebuilt, never spread - nothing unlisted can survive", () => {
  const result = validateWysEvent("wys_source_period_complete", {
    source_period_id: "stop-a",
    content_version: "2026-09-03"
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(Object.keys(result.props).sort(), ["content_version", "source_period_id"]);
  }
});

/* -------------------------------------------------------------------------- */
/* The canary (WYS §29.2 flow 2, §34)                                         */
/* -------------------------------------------------------------------------- */

test("the canary is rejected wherever it is passed, and never reaches the dataLayer", () => {
  withHarness({ consent: "granted" }, (harness) => {
    harness.runGa4Init();
    const { refusals, onRefusal } = collector();

    // As an event name.
    trackWys(CANARY as unknown as WysEventName, {}, { onRefusal });
    // As a property key.
    trackWys("wys_start", { [CANARY]: "x" } as unknown as WysEventProperties, { onRefusal });
    // As a value under each allowlisted key.
    for (const key of WYS_PROPERTY_KEYS) {
      trackWys("wys_start", { [key]: CANARY } as unknown as WysEventProperties, { onRefusal });
    }
    // As the whole props object.
    trackWys("wys_start", CANARY as unknown as WysEventProperties, { onRefusal });

    assert.equal(refusals.length, 7);
    assert.equal(bufferedWysEventCount(), 0);

    const serialized = JSON.stringify(harness.queue());
    assert.ok(!serialized.includes(CANARY), "the canary reached the dataLayer");
  });
});

/* -------------------------------------------------------------------------- */
/* The gates (§8.3, Q7 / SC-2)                                                */
/* -------------------------------------------------------------------------- */

test("with consent denied, nothing is sent and nothing is buffered", () => {
  withHarness({ consent: "denied" }, (harness) => {
    harness.runGa4Init();
    const result = trackWys("wys_start", { route_type: "course" });
    assert.equal(result.sent, false);
    assert.equal(result.sent === false && result.buffered === false && result.refusal, "consent-not-granted");
    assert.equal(wysEvents(harness).length, 0);
    assert.equal(bufferedWysEventCount(), 0);
  });
});

test("with no consent choice recorded at all, nothing is sent - the gate fails closed", () => {
  withHarness({}, (harness) => {
    harness.runGa4Init();
    assert.equal(analyticsConsentGranted(), false);
    trackWys("wys_start");
    assert.equal(wysEvents(harness).length, 0);
  });
});

test("when localStorage throws, the consent gate fails closed", () => {
  const previous = globalRef.window;
  const hostile = {} as FakeWindow;
  Object.defineProperty(hostile, "localStorage", {
    get() {
      throw new Error("SecurityError: access to storage is not allowed from this context");
    }
  });
  globalRef.window = hostile;
  try {
    assert.equal(analyticsConsentGranted(), false);
  } finally {
    if (previous === undefined) delete globalRef.window;
    else globalRef.window = previous;
  }
});

test("with the measurement ID unset, nothing is sent even for a consenting visitor", () => {
  withHarness({ consent: "granted", measurementId: null }, (harness) => {
    harness.runGa4Init();
    assert.equal(measurementIdIsSet(), false);
    const result = trackWys("wys_start");
    assert.equal(result.sent === false && result.buffered === false && result.refusal, "no-measurement-id");
    assert.equal(wysEvents(harness).length, 0);
  });
});

test("the global kill switch silences every event", () => {
  assert.equal(WYS_TELEMETRY_ENABLED, true, "v0 ships with WYS telemetry on");
  withHarness({ consent: "granted" }, (harness) => {
    harness.runGa4Init();
    const result = trackWys("wys_start", {}, { enabled: false });
    assert.equal(result.sent === false && result.buffered === false && result.refusal, "telemetry-disabled");
    assert.equal(wysEvents(harness).length, 0);
  });
});

test("on the server, with no window, nothing is sent", () => {
  const previous = globalRef.window;
  const previousId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  delete globalRef.window;
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST0000";
  try {
    resetWysTelemetryForTests();
    const result = trackWys("wys_start");
    assert.equal(result.sent === false && result.buffered === false && result.refusal, "no-window");
    assert.equal(ga4ConfigMarkerPresent(), false);
  } finally {
    resetWysTelemetryForTests();
    if (previous !== undefined) globalRef.window = previous;
    if (previousId === undefined) delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    else process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = previousId;
  }
});

/* -------------------------------------------------------------------------- */
/* The flush rule (§8.3) - the returning-consenting-visitor hazard            */
/* -------------------------------------------------------------------------- */

test("nothing is pushed to dataLayer before ga4-init's config marker exists", () => {
  withHarness({ consent: "granted" }, (harness) => {
    assert.equal(ga4ConfigMarkerPresent(), false);

    const first = trackWys("wys_start", { route_type: "course" });
    assert.equal(first.sent, false);
    assert.equal(first.sent === false && first.buffered, true);
    assert.equal(bufferedWysEventCount(), 1);
    assert.equal(harness.queue().length, 0, "an event landed ahead of ga4-init");
  });
});

test("a partially-run ga4-init (js/consent/set, no config yet) is still not a flush signal", () => {
  withHarness({ consent: "granted" }, (harness) => {
    harness.window.dataLayer = [];
    const push: (...args: unknown[]) => void = function () {
      harness.window.dataLayer?.push(arguments);
    };
    push("consent", "default", { analytics_storage: "denied" });

    trackWys("wys_start");
    assert.equal(ga4ConfigMarkerPresent(), false);
    assert.equal(bufferedWysEventCount(), 1);
    assert.equal(wysEvents(harness).length, 0);
  });
});

test("the buffer drains in order once the config marker exists, and lands after the consent default", () => {
  withHarness({ consent: "granted" }, (harness) => {
    trackWys("wys_start", { route_type: "course" });
    trackWys("wys_source_period_start", { source_period_id: "stop-a", content_version: "2026-09-03" });
    trackWys("wys_carry_reached", { source_period_id: "stop-a" });
    assert.equal(bufferedWysEventCount(), 3);

    harness.runGa4Init();
    assert.equal(flushWysTelemetry(), 3);
    assert.equal(bufferedWysEventCount(), 0);

    const events = wysEvents(harness);
    assert.deepEqual(
      events.map((entry) => entry[1]),
      ["wys_start", "wys_source_period_start", "wys_carry_reached"]
    );

    const queue = harness.queue();
    const consentIndex = queue.findIndex((entry) => entry[0] === "consent");
    const configIndex = queue.findIndex((entry) => entry[0] === GA4_CONFIG_COMMAND);
    const firstEventIndex = queue.findIndex((entry) => entry[0] === "event");
    assert.ok(consentIndex >= 0 && configIndex > consentIndex);
    assert.ok(firstEventIndex > configIndex, "an event was processed before gtag('config', ...)");
  });
});

test("once ga4-init has run, a later event is pushed immediately with its allowlisted props", () => {
  withHarness({ consent: "granted" }, (harness) => {
    harness.runGa4Init();
    const result = trackWys("wys_source_period_complete", {
      source_period_id: "stop-b",
      content_version: "2026-09-03"
    });
    assert.equal(result.sent, true);

    const events = wysEvents(harness);
    assert.equal(events.length, 1);
    assert.equal(events[0][0], "event");
    assert.equal(events[0][1], "wys_source_period_complete");
    assert.deepEqual(events[0][2], { source_period_id: "stop-b", content_version: "2026-09-03" });
  });
});

test("the queued entry is arguments-shaped, exactly as gtag() would have pushed it", () => {
  withHarness({ consent: "granted" }, (harness) => {
    harness.runGa4Init();
    trackWys("wys_replay");
    const raw = (harness.window.dataLayer ?? []).filter((entry) => entry[0] === "event");
    assert.equal(raw.length, 1);
    assert.ok(!Array.isArray(raw[0]), "the entry is a plain array, not an arguments object");
    assert.equal(Object.prototype.toString.call(raw[0]), "[object Arguments]");
  });
});

/* -------------------------------------------------------------------------- */
/* Wired-but-unfired (§8.7)                                                   */
/* -------------------------------------------------------------------------- */

test("wys_view and wys_transfer_check_complete are wired but unfired in v0", () => {
  assert.deepEqual([...WYS_UNFIRED_IN_V0].sort(), ["wys_transfer_check_complete", "wys_view"]);

  // Nothing in the shipped tree may call them. This holds trivially today and
  // is the assertion that keeps holding once the course lands.
  const offenders: string[] = [];
  for (const file of sourceFiles(["app", "components", "lib", "content"])) {
    const source = readFileSync(file, "utf8");
    for (const name of WYS_UNFIRED_IN_V0) {
      if (source.includes(`trackWys("${name}"`)) offenders.push(`${path.relative(repoRoot, file)} -> ${name}`);
    }
  }
  assert.deepEqual(offenders, [], "a deliberately unfired event acquired a firing point");
});

/* -------------------------------------------------------------------------- */
/* The decision-use table (§8.7)                                              */
/* -------------------------------------------------------------------------- */

test("the decision-use table is total: one row per allowlisted event, no extras", () => {
  assert.deepEqual(
    WYS_DECISION_USE.map((row) => row.event),
    [...WYS_EVENT_NAMES]
  );
});

test("every decision-use row carries a firing point, an upstream question and the full justification chain", () => {
  for (const row of WYS_DECISION_USE) {
    assert.ok(row.question.trim().length > 8, `${row.event}.question is empty`);
    for (const field of ["firesWhen", "task", "necessity", "exposure", "why", "whyNot", "judgment"] as const) {
      assert.ok(row[field].trim().length > 20, `${row.event}.${field} is empty or stub`);
    }
  }
});

/* -------------------------------------------------------------------------- */
/* The aggregate adapter (§8.6, Q12 / SC-8)                                   */
/* -------------------------------------------------------------------------- */

test("the aggregate flag ships false and is a build-time constant, not an env var", () => {
  assert.equal(WYS_AGGREGATE_ENABLED, false);
  const source = readFileSync(path.join(repoRoot, "content/watch-your-step/config.ts"), "utf8");
  assert.ok(!codeOnly(source).includes("process.env"), "the aggregate flag must not read process.env");
});

test("no app/api route exists for the aggregate counter", () => {
  assert.throws(() => readFileSync(path.join(repoRoot, "app/api/wys/aggregate/route.ts"), "utf8"));
});

test("with the flag off, sendAggregate returns immediately and makes no call", () => {
  let calls = 0;
  const fetchImpl = (async () => {
    calls += 1;
    return new Response(null);
  }) as unknown as typeof fetch;

  const event: AggregateEvent = {
    event: "scenario_choice",
    scenarioId: "scn-003",
    choiceKey: "B",
    contentVersion: "2026-09-03"
  };
  const outcome = sendAggregate(event, { enabled: false, fetchImpl });
  assert.equal(outcome.sent, false);
  assert.equal(outcome.sent === false && outcome.reason, "disabled");
  assert.equal(calls, 0);
});

test("with the flag FORCED ON, sendAggregate still makes no call - there is no endpoint", () => {
  // Plan §8.6: the disabled test must assert the flag is the reason, and the
  // absent endpoint is the second, independent reason. A test that only
  // exercised the flag would pass for the wrong reason.
  let calls = 0;
  const fetchImpl = (async () => {
    calls += 1;
    return new Response(null);
  }) as unknown as typeof fetch;

  const outcome = sendAggregate(
    { event: "scenario_skip", scenarioId: "scn-003", contentVersion: "2026-09-03" },
    { enabled: true, fetchImpl }
  );
  assert.equal(AGGREGATE_ENDPOINT, null);
  assert.equal(outcome.sent, false);
  assert.equal(outcome.sent === false && outcome.reason, "no-endpoint");
  assert.equal(calls, 0);
});

test("aggregate payload validation rejects extra keys, missing fields and free text", () => {
  assert.deepEqual([...AGGREGATE_EVENT_NAMES], ["scenario_choice", "scenario_skip"]);

  assert.equal(
    validateAggregateEvent({ event: "scenario_choice", scenarioId: "scn-003", choiceKey: "B", contentVersion: "2026-09-03" }).ok,
    true
  );

  const extra = validateAggregateEvent({
    event: "scenario_choice",
    scenarioId: "scn-003",
    choiceKey: "B",
    contentVersion: "2026-09-03",
    userId: "u-1"
  });
  assert.equal(extra.ok, false);
  assert.equal(extra.ok === false && extra.refusal, "extra-key");

  const missing = validateAggregateEvent({ event: "scenario_skip", scenarioId: "scn-003" });
  assert.equal(missing.ok === false && missing.refusal, "missing-field");

  const freeText = validateAggregateEvent({
    event: "scenario_choice",
    scenarioId: "scn-003",
    choiceKey: CANARY,
    contentVersion: "2026-09-03"
  });
  assert.equal(freeText.ok === false && freeText.refusal, "invalid-field");

  const unknown = validateAggregateEvent({ event: "scenario_revision", scenarioId: "scn-003", contentVersion: "1" });
  assert.equal(unknown.ok === false && unknown.refusal, "unknown-event");
});

/* -------------------------------------------------------------------------- */
/* The Data page aggregate sentence (§8.6, SC-12 / Q22)                       */
/* -------------------------------------------------------------------------- */

test("the Data page aggregate sentence cannot render while sendAggregate() is disabled", () => {
  // The string and the flag are read from the same module, so copy cannot
  // outrun code. Flipped both ways.
  assert.equal(aggregateCounterSentence(), null);
  assert.equal(aggregateCounterSentence(false), null);
  assert.equal(aggregateCounterSentence(true), AGGREGATE_COUNTER_SENTENCE);
  assert.ok(AGGREGATE_COUNTER_SENTENCE.includes("first-party counter"));

  const disabled = sendAggregate(
    { event: "scenario_skip", scenarioId: "scn-003", contentVersion: "2026-09-03" },
    { enabled: WYS_AGGREGATE_ENABLED }
  );
  assert.equal(disabled.sent, false);
  assert.equal(aggregateCounterSentence(WYS_AGGREGATE_ENABLED), null);
});

/* -------------------------------------------------------------------------- */
/* The type-location change (§8.4) and the frozen file                        */
/* -------------------------------------------------------------------------- */

test("the Window.gtag augmentation lives in types/gtag.d.ts and no longer in ConsentBanner", () => {
  const ambient = readFileSync(path.join(repoRoot, "types/gtag.d.ts"), "utf8");
  assert.ok(ambient.includes("declare global"));
  assert.ok(ambient.includes('(command: "consent", action: "update", params: Record<string, string>): void;'));
  assert.ok(ambient.includes("dataLayer?: IArguments[];"));
  assert.ok(!/:\s*any\b/.test(ambient), "the ambient type must not be weakened to any");

  const banner = readFileSync(path.join(repoRoot, "components/ConsentBanner.tsx"), "utf8");
  assert.ok(!/^declare global/m.test(codeOnly(banner)), "the declare global block must have moved out");
  assert.ok(banner.includes('const storageKey = "bct_analytics_consent";'));
  assert.ok(banner.includes('window.gtag?.("consent", "update", {'));
});

test("components/GoogleAnalytics.tsx is not imported by the telemetry adapter", () => {
  const adapter = codeOnly(readFileSync(path.join(repoRoot, "lib/wys/telemetry.ts"), "utf8"));
  assert.ok(!/GoogleAnalytics/.test(adapter), "the adapter must layer on top, not reach into the frozen file");
  assert.ok(!/@next\/third-parties/.test(adapter));
  assert.ok(!/\bas any\b/.test(adapter), "no as any in the dataLayer shim");
});

/* -------------------------------------------------------------------------- */
/* The emission chokepoint (Phase 3 Exit: "no component CAN emit an unlisted   */
/* event or property")                                                        */
/* -------------------------------------------------------------------------- */

/**
 * The refusal tests above prove that an unlisted event or property cannot get
 * through `trackWys`. On their own they prove nothing about a component that
 * never calls `trackWys` at all: `types/gtag.d.ts` overload 2 types
 * `window.gtag("event", name: string, props)` with an OPEN event name, and
 * `window.dataLayer.push(...)` is open to anything. Either would emit an
 * unlisted event past the allowlist, past the consent gate and past the
 * ga4-init flush rule, and every refusal test would still be green.
 *
 * So the criterion needs a second half: `lib/wys/telemetry.ts` is the ONLY
 * emission site in the shipped tree. That is statically decidable — a grep over
 * source, comments stripped so a doc comment quoting the shim cannot satisfy or
 * violate it.
 *
 * The three exemptions are exactly the preserved surfaces, and each is named
 * with its reason rather than pattern-matched:
 *   - `components/GoogleAnalytics.tsx` — the byte-frozen Consent Mode v2
 *     bootstrap (user constraint 4, plan §8.1). It is the thing being layered
 *     on top of.
 *   - `components/ConsentBanner.tsx` — the preserved `gtag("consent","update")`
 *     call. It issues a CONSENT command, never an `event` command.
 *   - `lib/wys/telemetry.ts` — the adapter itself.
 */
const EMISSION_EXEMPT = [
  "components/GoogleAnalytics.tsx",
  "components/ConsentBanner.tsx",
  "lib/wys/telemetry.ts"
];

/**
 * Both predicates are CODE-shaped on purpose, not bare identifier greps.
 *
 * `app/privacy/page.tsx:22` is preserved published prose that names the
 * transport — "BenChanTech may use GA4 through direct gtag.js collection" — and
 * a bare `/\bgtag\b/` flags it. That copy is preserved verbatim under user
 * constraint 2, so a test that fires on it is a test that would eventually be
 * satisfied by editing preserved copy, which is exactly backwards (R8). These
 * match a member access or a call, which is what an emission actually is.
 */
const GTAG_CODE_REFERENCE = /\bwindow\s*\.\s*gtag\b|\bgtag\s*(\?\.)?\s*\(/;
const DATALAYER_CODE_REFERENCE = /\bwindow\s*\.\s*dataLayer\b|\bdataLayer\s*(\?\.)?\s*[.[=]/;

test("lib/wys/telemetry.ts is the only dataLayer emission site in the shipped tree", () => {
  const offenders: string[] = [];
  for (const file of sourceFiles(["app", "components", "lib", "content"])) {
    const relative = path.relative(repoRoot, file).split(path.sep).join("/");
    if (EMISSION_EXEMPT.includes(relative)) continue;
    if (DATALAYER_CODE_REFERENCE.test(codeOnly(readFileSync(file, "utf8")))) offenders.push(relative);
  }
  assert.deepEqual(
    offenders,
    [],
    "a dataLayer push outside the adapter bypasses the allowlist, the consent gate and the ga4-init flush rule"
  );
});

test("no file outside the adapter and the two preserved surfaces touches window.gtag", () => {
  const offenders: string[] = [];
  for (const file of sourceFiles(["app", "components", "lib", "content"])) {
    const relative = path.relative(repoRoot, file).split(path.sep).join("/");
    if (EMISSION_EXEMPT.includes(relative)) continue;
    if (GTAG_CODE_REFERENCE.test(codeOnly(readFileSync(file, "utf8")))) offenders.push(relative);
  }
  assert.deepEqual(offenders, [], "gtag must be reached through trackWys, never directly");
});

test("no gtag('event', …) command is issued anywhere, including by the exempt files", () => {
  // The adapter pushes to dataLayer rather than calling gtag() (§8.3), the
  // banner issues only a consent command, and GoogleAnalytics.tsx issues js /
  // consent / set / config. So the `event` command appears in NO source file.
  // If one ever does, it is an emission path the allowlist never sees.
  const offenders: string[] = [];
  const eventCommand = /gtag\s*(\?\.)?\s*\(\s*["']event["']/;
  for (const file of sourceFiles(["app", "components", "lib", "content"])) {
    if (eventCommand.test(codeOnly(readFileSync(file, "utf8")))) {
      offenders.push(path.relative(repoRoot, file).split(path.sep).join("/"));
    }
  }
  assert.deepEqual(offenders, [], "an untyped gtag('event', …) call bypasses the closed thirteen-name allowlist");
});

test("the adapter holds exactly one dataLayer push, and it is the arguments-shaped shim", () => {
  const adapter = codeOnly(readFileSync(path.join(repoRoot, "lib/wys/telemetry.ts"), "utf8"));
  const pushes = adapter.match(/dataLayer\s*(\?\.)?\s*\.?push\s*\(/g) ?? [];
  assert.equal(pushes.length, 1, "more than one push site is more than one place the allowlist can be skipped");
  assert.ok(/window\.dataLayer\.push\(arguments\)/.test(adapter), "the single push must be the arguments-shaped shim");
});

test("the chokepoint assertions have teeth", () => {
  // Positive controls: the same predicates applied to synthetic bypasses must
  // fire, so an empty offenders list is proof rather than an accident of the
  // tree being small.
  const bypassA = 'window.dataLayer.push(["event", "wys_made_up", { anything: "at all" }]);';
  const bypassB = 'window.gtag?.("event", "wys_made_up", { free_text: "a learner sentence" });';

  assert.ok(DATALAYER_CODE_REFERENCE.test(codeOnly(bypassA)));
  assert.ok(GTAG_CODE_REFERENCE.test(codeOnly(bypassB)));
  assert.ok(/gtag\s*(\?\.)?\s*\(\s*["']event["']/.test(codeOnly(bypassB)));

  // A comment mentioning either must NOT fire, or the assertions would be
  // unmaintainable the moment a file documents the rule it obeys.
  assert.ok(!DATALAYER_CODE_REFERENCE.test(codeOnly("// pushes to window.dataLayer\n")));
  assert.ok(!GTAG_CODE_REFERENCE.test(codeOnly("/* the gtag shim lives in the adapter */\n")));

  // And PRESERVED PROSE must not fire. This is the live string from
  // app/privacy/page.tsx:22; if a future edit to these predicates flags it, the
  // fix is the predicate, never the published copy.
  const preservedProse = "BenChanTech may use GA4 through direct gtag.js collection.";
  assert.ok(!GTAG_CODE_REFERENCE.test(preservedProse), "a preserved legal sentence must never fail a code assertion");
  assert.ok(readFileSync(path.join(repoRoot, "app/privacy/page.tsx"), "utf8").includes(preservedProse));
});
