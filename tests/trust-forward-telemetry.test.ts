import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync, type Dirent } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CONSENT_STORAGE_KEY } from "@/lib/wys/browser-keys";
import { VERSION_MANIFEST } from "@/content/trust-forward/stamp/v1-1-0";
import {
  TF_AGGREGATE_ENABLED,
  TF_AGGREGATE_EVENT_NAMES,
  TF_AGGREGATE_NEVER_STORED,
  TF_AGGREGATE_TRANSPORT,
  type AggregateIncrement,
  type AggregateTransport,
  type TrustForwardAggregateEvent,
  aggregateCounterKey,
  foldAggregateCounters,
  sendTrustForwardAggregate,
  toAggregateIncrement,
  validateTrustForwardAggregateEvent
} from "@/lib/trust-forward/aggregate";
import {
  GA4_CONFIG_COMMAND,
  TF_EVENT_NAMES,
  TF_EVENT_PREFIX,
  TF_EVENT_USE,
  TF_NEVER_TRANSMITTED,
  TF_PROPERTY_KEYS,
  TF_TELEMETRY_ENABLED,
  TF_VENDOR_SIDE_SETTINGS_NOT_ENFORCEABLE_HERE,
  type TrustForwardEventName,
  type TrustForwardEventProperties,
  type TrustForwardRefusal,
  analyticsConsentGranted,
  bufferedTrustForwardEventCount,
  flushTrustForwardTelemetry,
  ga4ConfigMarkerPresent,
  measurementIdIsSet,
  resetTrustForwardTelemetryForTests,
  trackLite,
  trackTrustForward,
  validateTrustForwardEvent
} from "@/lib/trust-forward/telemetry";

/**
 * The Trust Forward Lite telemetry substrate (plan §8, §14; PRIVACY_ANALYTICS.md;
 * gate Q-E `Q_E_AGGREGATE_TELEMETRY_SCOPE.BEN_APPROVED.json`).
 *
 * WHY THIS FILE IS MOSTLY NEGATIVE ASSERTIONS. `lib/trust-forward/telemetry.ts`
 * is a refusal before it is a sender, so the thing worth proving is that events
 * do NOT happen: an unlisted name is dropped, a learner's sentence has nowhere
 * to ride, and nothing reaches `dataLayer` ahead of `ga4-init`. A suite that
 * only proved the happy path would be green on an adapter that had quietly
 * become a passthrough.
 *
 * WHY THE VALUE DOMAINS ARE HAMMERED AS HARD AS THE KEY LIST. A key allowlist
 * alone is satisfied by `{ app_version: "<a learner's whole reflection>" }`. The
 * canary `DO_NOT_SEND_TF_TEST_9f31` is therefore driven through all four
 * domains, not just through the key check, and the forbidden-payload table below
 * drives every category PRIVACY_ANALYTICS.md names as never-transmitted through
 * the same four domains. Those are the assertions that make "never accept free
 * text" true rather than aspirational.
 *
 * WHY LOUDNESS IS ASSERTED THROUGH `onRefusal`. The adapter is loud in
 * development and silent in production, and both DROP. Supplying an `onRefusal`
 * hook replaces the console report, so this file can assert that a refusal was
 * reported without printing a wall of warnings into the test output. The
 * console path is asserted once, with `console.warn` captured and restored, so
 * "loud in development" is proved rather than assumed — and so is the fact that
 * the warning text never echoes the refused VALUE.
 *
 * WHY `aggregate.ts` IS TESTED FOR AN ABSENCE. Q-E's ruling is that the
 * anonymous A/B/C counter is implemented, disabled, and that no persistence or
 * backend is added merely to activate it. So the assertions are: the flag is
 * `false`; with the flag FORCED TRUE the module still sends nothing, because
 * `TF_AGGREGATE_TRANSPORT` is `null`; and the module's source references no
 * request-issuing API at all. The second reason is the load-bearing one — a test
 * that only exercised the flag would pass for the wrong reason.
 *
 * Everything here runs against pure modules plus a fake `window` carrying a
 * fake `localStorage` and a fake `dataLayer`. No renderer, no network, no new
 * dependency, and — critically — no component and no `*.module.css` import: the
 * suite runs as `node --import tsx --test tests/*.test.ts`, and Node cannot load
 * a `.css` specifier, so one component import would take this whole file down.
 *
 * `components/GoogleAnalytics.tsx` is byte-frozen and covered by
 * `tests/analytics-frozen.test.ts`; nothing here may require an edit to it.
 * The chokepoint assertions — that nothing outside a declared adapter reaches
 * `window.dataLayer` at all — live in `tests/wys-telemetry.test.ts`, which
 * already names `lib/trust-forward/telemetry.ts` as the second adapter; they are
 * not duplicated here.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");

/**
 * The canary. It is not a credential and it is not secret — its whole job is to
 * be recognisable in a serialized `dataLayer` dump, so that "the canary never
 * reached the wire" is a substring search rather than an inference.
 */
const CANARY = "DO_NOT_SEND_TF_TEST_9f31";

/* -------------------------------------------------------------------------- */
/* Fakes                                                                      */
/* -------------------------------------------------------------------------- */

interface FakeWindow {
  localStorage: Storage;
  dataLayer?: IArguments[];
}

const globalRef = globalThis as unknown as { window?: FakeWindow };
const envRef = process.env as Record<string, string | undefined>;

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
  const previousId = envRef.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  const seed: Record<string, string> = {};
  // The consent key is IMPORTED, not re-spelled. There is exactly one consent
  // store on this origin and the Trust Forward adapter inherits it rather than
  // deriving a second, looser one (layer-07 `inheritExistingBenChanTechBoundary`).
  if (options.consent) seed[CONSENT_STORAGE_KEY] = options.consent;
  const win: FakeWindow = { localStorage: fakeStorage(seed) };
  globalRef.window = win;

  if (options.measurementId === null) delete envRef.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  else envRef.NEXT_PUBLIC_GA_MEASUREMENT_ID = options.measurementId ?? "G-TEST0000";

  resetTrustForwardTelemetryForTests();

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
      push(GA4_CONFIG_COMMAND, "G-TEST0000", { anonymize_ip: true });
    },
    queue() {
      return (win.dataLayer ?? []).map((entry) => Array.from(entry) as unknown[]);
    }
  };

  try {
    return body(harness);
  } finally {
    resetTrustForwardTelemetryForTests();
    if (previousWindow === undefined) delete globalRef.window;
    else globalRef.window = previousWindow;
    if (previousId === undefined) delete envRef.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    else envRef.NEXT_PUBLIC_GA_MEASUREMENT_ID = previousId;
  }
}

/** Source with `//` and block comments removed, so a doc comment cannot satisfy a code assertion. */
function codeOnly(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

/** Collect refusals instead of letting them reach the console. */
function collector(): {
  refusals: TrustForwardRefusal[];
  details: string[];
  onRefusal: (refusal: TrustForwardRefusal, detail: string) => void;
} {
  const refusals: TrustForwardRefusal[] = [];
  const details: string[] = [];
  return {
    refusals,
    details,
    onRefusal: (refusal: TrustForwardRefusal, detail: string) => {
      refusals.push(refusal);
      details.push(detail);
    }
  };
}

/** Only the `event` commands — the ga4-init preamble is not ours. */
function trustForwardEvents(harness: Harness): unknown[][] {
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

/** Pass an arbitrary value where a props object is expected, without lying to the compiler twice. */
function asProps(value: unknown): TrustForwardEventProperties {
  return value as TrustForwardEventProperties;
}

/* -------------------------------------------------------------------------- */
/* 1. The event allowlist is seventeen closed, prefixed names (plan §8)        */
/* -------------------------------------------------------------------------- */

test("the event allowlist is exactly the seventeen reference names, prefixed, in union order", () => {
  assert.deepEqual(TF_EVENT_NAMES, [
    "tf_lite_started",
    "tf_case_reached",
    "tf_decision_completed",
    "tf_reflection_shown",
    "tf_reflection_skipped",
    "tf_reflection_always_skip",
    "tf_reflection_reenabled",
    "tf_navigation_back",
    "tf_answer_changed",
    "tf_downstream_scenario_invalidated",
    "tf_downstream_scenario_resolved",
    "tf_case5_completed",
    "tf_ship_result_viewed",
    "tf_markdown_export_clicked",
    "tf_json_export_clicked",
    "tf_copy_summary_clicked",
    "tf_full_trust_forward_clicked"
  ]);
  assert.equal(TF_EVENT_NAMES.length, 17);
  assert.equal(new Set(TF_EVENT_NAMES).size, 17, "a duplicated name is a count that silently doubles");
});

test("every allowlisted name carries the tf_ prefix — two products, one GA4 stream", () => {
  assert.equal(TF_EVENT_PREFIX, "tf_");
  for (const name of TF_EVENT_NAMES) {
    assert.ok(name.startsWith(TF_EVENT_PREFIX), `${name} would merge with another surface's counts`);
  }
});

test("an unlisted event name is refused, including the reference's own unprefixed spellings", () => {
  const unlisted = [
    "tf_totally_made_up",
    // reference-ts/analytics.ts names these without a prefix; accepting them is
    // exactly the collision the prefix exists to prevent.
    "case_reached",
    "decision_completed",
    "ship_result_viewed",
    // another product's vocabulary must not resolve through this adapter.
    "wys_start",
    "page_view",
    ""
  ];
  for (const name of unlisted) {
    const result = validateTrustForwardEvent(name, {});
    assert.equal(result.ok, false, `${name || "<empty>"} must not be accepted`);
    assert.equal(result.ok === false && result.refusal, "unknown-event");
  }
});

test("a non-string event name is refused rather than coerced", () => {
  for (const name of [null, undefined, 42, {}, ["tf_lite_started"]]) {
    const result = validateTrustForwardEvent(name, {});
    assert.equal(result.ok, false);
    assert.equal(result.ok === false && result.refusal, "unknown-event");
  }
});

/* -------------------------------------------------------------------------- */
/* 2. The property allowlist — keys AND value domains (plan §8)                */
/* -------------------------------------------------------------------------- */

test("the property allowlist is the four ordinal/version keys", () => {
  assert.deepEqual(TF_PROPERTY_KEYS, ["case_number", "decision_number", "from_case_number", "app_version"]);
});

test("case_number and from_case_number accept 1-5 and nothing else", () => {
  for (const key of ["case_number", "from_case_number"] as const) {
    for (const value of [1, 2, 3, 4, 5]) {
      assert.equal(validateTrustForwardEvent("tf_case_reached", { [key]: value }).ok, true, `${key}=${value}`);
    }
    for (const value of [0, 6, -1, 2.5, 100, Number.NaN, Number.POSITIVE_INFINITY, "3", null]) {
      const result = validateTrustForwardEvent("tf_case_reached", { [key]: value });
      assert.equal(result.ok, false, `${key}=${String(value)} must be refused`);
      assert.equal(result.ok === false && result.refusal, "invalid-property-value");
    }
  }
});

test("decision_number accepts 1-3 — Case 5 is the only case with three decisions", () => {
  for (const value of [1, 2, 3]) {
    assert.equal(validateTrustForwardEvent("tf_decision_completed", { decision_number: value }).ok, true);
  }
  for (const value of [0, 4, 11, 1.5, "1", true]) {
    const result = validateTrustForwardEvent("tf_decision_completed", { decision_number: value });
    assert.equal(result.ok, false, `decision_number=${String(value)} must be refused`);
  }
});

test("app_version accepts the shipped stamp and refuses free text", () => {
  assert.equal(VERSION_MANIFEST.appVersion, "1.1.0");
  for (const value of [VERSION_MANIFEST.appVersion, "1.0.0", "2026-09-07", "3"]) {
    assert.equal(validateTrustForwardEvent("tf_lite_started", { app_version: value }).ok, true, value);
  }
  for (const value of ["v1.1.0", "I decided not to tell the client", "", 1.1, null, {}]) {
    const result = validateTrustForwardEvent("tf_lite_started", { app_version: value });
    assert.equal(result.ok, false, `app_version=${String(value)} must be refused`);
  }
});

test("an unlisted property key is refused, whatever its value", () => {
  for (const key of ["option_id", "variant_id", "ship_code", "handle", "session_id", "reflection", "user_id"]) {
    const result = validateTrustForwardEvent("tf_decision_completed", { [key]: 1 });
    assert.equal(result.ok, false, `${key} must not be accepted`);
    assert.equal(result.ok === false && result.refusal, "unknown-property");
    assert.equal(result.ok === false && result.detail, key);
  }
});

test("a camelCase spelling of an allowlisted key is refused — snake_case is the wire format, no shim", () => {
  // reference-ts/analytics.ts declares `caseNumber` / `appVersion`; the repo's
  // GA4 wire format is snake_case. Plan §8 settles it with no mapping shim,
  // because a shim is a second place a property name can be spelled and an
  // allowlist can only police one.
  for (const key of ["caseNumber", "decisionNumber", "fromCaseNumber", "appVersion"]) {
    const result = validateTrustForwardEvent("tf_case_reached", { [key]: 2 });
    assert.equal(result.ok, false, `${key} must not be accepted`);
    assert.equal(result.ok === false && result.refusal, "unknown-property");
  }
});

test("a reference-shaped call — trackLite({ name, caseNumber }) — is refused at runtime too", () => {
  // The alias exists so a call site written against the reference package
  // resolves to THIS adapter. The SIGNATURE is deliberately not the
  // reference's, and the runtime agrees with the compiler.
  assert.equal(trackLite, trackTrustForward);
  const result = validateTrustForwardEvent("case_reached", { caseNumber: 2, appVersion: "1.1.0" });
  assert.equal(result.ok, false);
  assert.equal(result.ok === false && result.refusal, "unknown-event");
});

test("props that are not a plain object are refused before any key is read", () => {
  for (const props of [null, "a string", 7, [{ case_number: 1 }], true]) {
    const result = validateTrustForwardEvent("tf_case_reached", props);
    assert.equal(result.ok, false, `${String(props)} must not be accepted as props`);
    assert.equal(result.ok === false && result.refusal, "props-not-a-plain-object");
  }
});

/* -------------------------------------------------------------------------- */
/* 3. Props are REBUILT from the allowlist, never spread                       */
/* -------------------------------------------------------------------------- */

test("an extra string key cannot survive validation", () => {
  const result = validateTrustForwardEvent("tf_decision_completed", {
    case_number: 3,
    decision_number: 1,
    app_version: "1.1.0",
    session_id: "s-9f31c2a8"
  });
  assert.equal(result.ok, false);
  assert.equal(result.ok === false && result.refusal, "unknown-property");
  assert.equal(result.ok === false && result.detail, "session_id");
});

test("a SYMBOL-keyed extra cannot survive — the rebuild is real, not a spread", () => {
  // This is the assertion that actually distinguishes a rebuild from `{...props}`.
  // `Object.keys` does not see symbol keys, so the unknown-key loop passes; a
  // spread WOULD copy the symbol into the emitted payload, and a key-by-key
  // rebuild cannot. A learner's reflection smuggled under a symbol is still a
  // learner's reflection on the wire.
  const smuggled = Symbol("reflection");
  const props: Record<string | symbol, unknown> = { case_number: 2, app_version: "1.1.0" };
  props[smuggled] = "I did not tell them, because I was worried about the contract.";

  const result = validateTrustForwardEvent("tf_case_reached", props);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(Object.keys(result.props).sort(), ["app_version", "case_number"]);
    assert.equal(
      Object.getOwnPropertySymbols(result.props).length,
      0,
      "a symbol-keyed property survived, so the props object is being spread"
    );
    assert.ok(!JSON.stringify(result.props).includes("worried"));
  }
});

test("an explicitly undefined allowlisted key is dropped rather than emitted", () => {
  const result = validateTrustForwardEvent("tf_case_reached", { case_number: 4, decision_number: undefined });
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(Object.keys(result.props), ["case_number"]);
});

test("the adapter source contains no spread of caller-supplied props", () => {
  // The runtime assertions above prove the current code rebuilds. This one is
  // what keeps a later edit from turning the allowlist advisory again.
  const adapter = codeOnly(readFileSync(path.join(repoRoot, "lib/trust-forward/telemetry.ts"), "utf8"));
  assert.equal(/\.\.\.(props|incoming|event|payload)\b/.test(adapter), false, "caller props are spread somewhere");
  assert.equal(/\bas any\b/.test(adapter), false, "no as any in the adapter");
  assert.equal(/GoogleAnalytics/.test(adapter), false, "the adapter must layer on top, not reach into the frozen file");
});

/* -------------------------------------------------------------------------- */
/* 4. The canary, driven through every domain (plan §8)                        */
/* -------------------------------------------------------------------------- */

test("the canary is refused as an event name, as a key, as every value, and as the whole props object", () => {
  // A key allowlist alone would carry a learner's sentence under a permitted
  // key, so the canary is driven through all FOUR value domains and not only
  // through the key check.
  const positions: { label: string; run: (onRefusal: (r: TrustForwardRefusal, d: string) => void) => void }[] = [
    {
      label: "event name",
      run: (onRefusal) => trackTrustForward(CANARY as TrustForwardEventName, {}, { onRefusal })
    },
    {
      label: "property key",
      run: (onRefusal) => trackTrustForward("tf_lite_started", asProps({ [CANARY]: "x" }), { onRefusal })
    },
    {
      label: "whole props object",
      run: (onRefusal) => trackTrustForward("tf_lite_started", asProps(CANARY), { onRefusal })
    }
  ];
  for (const key of TF_PROPERTY_KEYS) {
    positions.push({
      label: `value under ${key}`,
      run: (onRefusal) => trackTrustForward("tf_lite_started", asProps({ [key]: CANARY }), { onRefusal })
    });
  }

  withHarness({ consent: "granted" }, (harness) => {
    harness.runGa4Init();
    const { refusals, onRefusal } = collector();
    for (const position of positions) position.run(onRefusal);

    // 3 positions + one per allowlisted key. All four domains must refuse it.
    assert.equal(refusals.length, 3 + TF_PROPERTY_KEYS.length);
    assert.equal(refusals.filter((refusal) => refusal === "invalid-property-value").length, TF_PROPERTY_KEYS.length);
    assert.equal(bufferedTrustForwardEventCount(), 0);
    assert.equal(trustForwardEvents(harness).length, 0);

    const serialized = JSON.stringify(harness.queue());
    assert.ok(!serialized.includes(CANARY), "the canary reached the dataLayer");
  });
});

test("a refused VALUE is never echoed back in the refusal detail", () => {
  // The detail travels into a console warning in development. If it carried the
  // refused value, a learner's reflection would survive as a log line — the
  // refusal would have moved the exposure rather than removed it.
  for (const key of TF_PROPERTY_KEYS) {
    const result = validateTrustForwardEvent("tf_lite_started", { [key]: CANARY });
    assert.equal(result.ok, false);
    assert.equal(result.ok === false && result.refusal, "invalid-property-value");
    assert.equal(result.ok === false && result.detail, key, "the detail must be the key name, not the value");
  }
});

/* -------------------------------------------------------------------------- */
/* 5. FORBIDDEN PAYLOADS (PRIVACY_ANALYTICS.md "Never transmit")               */
/* -------------------------------------------------------------------------- */

/**
 * Every category PRIVACY_ANALYTICS.md forbids, as a concrete value of the shape
 * the product actually produces, plus a `needle` that must never appear in a
 * serialized `dataLayer`.
 *
 * These are driven THROUGH THE VALIDATOR rather than checked by reading source.
 * A source grep proves the current file has no field for a SHIP code; driving
 * the value proves that no arrangement of the arguments a caller controls can
 * get one onto the wire, which is the claim the disclosure surfaces make.
 */
const FORBIDDEN: readonly { label: string; value: unknown; needle: string }[] = [
  { label: "selected option id", value: "A", needle: '"A"' },
  {
    label: "selected option text",
    value: "Tell the client the model wrote the first draft, before they ask.",
    needle: "first draft"
  },
  {
    label: "variant id",
    value: "c3:ambiguity=AMB_BOUNDED|risk=RISK_PROTECT",
    needle: "AMB_BOUNDED"
  },
  { label: "axis state", value: { axis: "risk", fragmentId: "RISK_PROTECT" }, needle: "RISK_PROTECT" },
  {
    label: "terminal six-dimensional state",
    value: { trust: 0.5, disclosure: 1, verification: 0, ownership: 1, escalation: 0.5, boundaries: 1 },
    needle: "escalation"
  },
  { label: "SHIP code", value: "SHIP-0111", needle: "SHIP-0111" },
  { label: "SHIP percentage", value: 72.4, needle: "72.4" },
  { label: "SHIP lean as an integer percentage", value: 70, needle: "70" },
  {
    label: "reflection text",
    value: "I did not tell them, because I was worried about losing the contract.",
    needle: "losing the contract"
  },
  { label: "handle", value: "@benchan", needle: "@benchan" },
  {
    label: "ledger",
    value: [
      {
        eventId: "e-0003",
        sequence: 3,
        type: "decision_selected",
        localTimestamp: "2026-09-07T10:04:11-04:00",
        sessionId: "s-9f31c2a8",
        decisionId: "C3D1",
        selectedOptionId: "B"
      }
    ],
    needle: "decision_selected"
  },
  { label: "local timestamp", value: "2026-09-07T10:04:11-04:00", needle: "10:04:11" },
  { label: "session id", value: "s-9f31c2a8", needle: "s-9f31c2a8" }
];

test("no forbidden payload can pass the validator under ANY allowlisted key", () => {
  for (const forbidden of FORBIDDEN) {
    for (const key of TF_PROPERTY_KEYS) {
      const result = validateTrustForwardEvent("tf_decision_completed", { [key]: forbidden.value });
      assert.equal(result.ok, false, `${forbidden.label} was accepted as ${key}`);
      assert.equal(result.ok === false && result.refusal, "invalid-property-value");
    }
  }
});

test("no forbidden payload can pass the validator under its own natural key", () => {
  const naturalKeys = [
    "option_id",
    "selected_option_id",
    "option_text",
    "variant_id",
    "axis_state",
    "dimension_state",
    "ship_code",
    "ship_percent",
    "reflection",
    "reflection_text",
    "handle",
    "ledger",
    "local_timestamp",
    "session_id"
  ];
  for (const forbidden of FORBIDDEN) {
    for (const key of naturalKeys) {
      const result = validateTrustForwardEvent("tf_decision_completed", { [key]: forbidden.value });
      assert.equal(result.ok, false, `${forbidden.label} was accepted as ${key}`);
      assert.equal(result.ok === false && result.refusal, "unknown-property");
    }
  }
});

test("no forbidden payload reaches the dataLayer through any event, key or position", () => {
  withHarness({ consent: "granted" }, (harness) => {
    harness.runGa4Init();
    const { refusals, onRefusal } = collector();

    for (const forbidden of FORBIDDEN) {
      for (const name of TF_EVENT_NAMES) {
        // As the whole props object.
        trackTrustForward(name, asProps(forbidden.value), { onRefusal });
        // Under each allowlisted key, and under a key named after the fact itself.
        for (const key of TF_PROPERTY_KEYS) {
          trackTrustForward(name, asProps({ [key]: forbidden.value }), { onRefusal });
        }
        trackTrustForward(name, asProps({ payload: forbidden.value }), { onRefusal });
      }
    }

    assert.ok(refusals.length > 0, "the drive loop refused nothing, so it proved nothing");
    assert.equal(bufferedTrustForwardEventCount(), 0, "a forbidden payload was buffered for a later flush");
    assert.equal(trustForwardEvents(harness).length, 0);

    const serialized = JSON.stringify(harness.queue());
    for (const forbidden of FORBIDDEN) {
      assert.ok(!serialized.includes(forbidden.needle), `${forbidden.label} reached the dataLayer`);
    }
  });
});

test("a whole LiteDataset, and a whole LiteResult, are refused as props", () => {
  const dataset = {
    schemaVersion: 1,
    versionManifest: { appVersion: "1.1.0" },
    createdAtLocal: "2026-09-07T09:00:00-04:00",
    lastActivityAtLocal: "2026-09-07T10:04:11-04:00",
    currentSessionId: "s-9f31c2a8",
    sequence: 3,
    ledger: [],
    handle: "@benchan",
    drafts: [{ decisionId: "C3D1", text: "I did not tell them." }],
    reflectionsSuppressed: false
  };
  const asWhole = validateTrustForwardEvent("tf_ship_result_viewed", dataset);
  assert.equal(asWhole.ok, false);
  assert.equal(asWhole.ok === false && asWhole.refusal, "unknown-property");

  const nested = validateTrustForwardEvent("tf_ship_result_viewed", { app_version: dataset });
  assert.equal(nested.ok, false);
  assert.equal(nested.ok === false && nested.refusal, "invalid-property-value");

  const result = { code: "SHIP-0111", profileKey: "0111", displayPercents: { S: 62.5, H: 40, I: 70, P: 55 } };
  const asResult = validateTrustForwardEvent("tf_ship_result_viewed", result);
  assert.equal(asResult.ok, false);
  assert.equal(asResult.ok === false && asResult.refusal, "unknown-property");
});

test("the never-transmitted list names every category the validator refuses", () => {
  // The list is the disclosure; the assertions above are the enforcement. This
  // ties them together so a category cannot be quietly dropped from the copy.
  for (const fragment of [
    "selected answer",
    "variant IDs",
    "axis states",
    "SHIP code",
    "reflections",
    "handle",
    "ledger",
    "local timestamps",
    "session IDs",
    "clickstream"
  ]) {
    assert.ok(
      TF_NEVER_TRANSMITTED.some((entry) => entry.includes(fragment)),
      `the never-transmitted list no longer names "${fragment}"`
    );
  }
  assert.ok(TF_VENDOR_SIDE_SETTINGS_NOT_ENFORCEABLE_HERE.includes("session replay"));
});

/* -------------------------------------------------------------------------- */
/* 6. The gates all fail closed                                                */
/* -------------------------------------------------------------------------- */

test("the kill switch ships on, and flipping it silences every event", () => {
  assert.equal(TF_TELEMETRY_ENABLED, true, "Lite ships with its own telemetry on");
  withHarness({ consent: "granted" }, (harness) => {
    harness.runGa4Init();
    const result = trackTrustForward("tf_lite_started", { app_version: "1.1.0" }, { enabled: false });
    assert.equal(result.sent === false && result.buffered === false && result.refusal, "telemetry-disabled");
    assert.equal(trustForwardEvents(harness).length, 0);
    assert.equal(bufferedTrustForwardEventCount(), 0);
  });
});

test("with the measurement ID unset, nothing is sent even for a consenting visitor", () => {
  withHarness({ consent: "granted", measurementId: null }, (harness) => {
    harness.runGa4Init();
    assert.equal(measurementIdIsSet(), false);
    const result = trackTrustForward("tf_lite_started", { app_version: "1.1.0" });
    assert.equal(result.sent === false && result.buffered === false && result.refusal, "no-measurement-id");
    assert.equal(trustForwardEvents(harness).length, 0);
    assert.equal(bufferedTrustForwardEventCount(), 0);
  });
});

test("with consent denied, nothing is sent and nothing is buffered", () => {
  withHarness({ consent: "denied" }, (harness) => {
    harness.runGa4Init();
    const result = trackTrustForward("tf_case_reached", { case_number: 1, app_version: "1.1.0" });
    assert.equal(result.sent === false && result.buffered === false && result.refusal, "consent-not-granted");
    assert.equal(trustForwardEvents(harness).length, 0);
    assert.equal(bufferedTrustForwardEventCount(), 0);
  });
});

test("with no consent choice recorded at all, the gate fails closed", () => {
  withHarness({}, (harness) => {
    harness.runGa4Init();
    assert.equal(analyticsConsentGranted(), false);
    trackTrustForward("tf_case_reached", { case_number: 1 });
    assert.equal(trustForwardEvents(harness).length, 0);
  });
});

test("when localStorage throws, the consent gate fails closed", () => {
  // iOS Safari private browsing throws on access. An exception must read as DO
  // NOT SEND, never as "unknown, so proceed".
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

test("the adapter reads the same consent key the site's own banner writes", () => {
  assert.equal(CONSENT_STORAGE_KEY, "bct_analytics_consent");
  const adapter = codeOnly(readFileSync(path.join(repoRoot, "lib/trust-forward/telemetry.ts"), "utf8"));
  assert.match(adapter, /CONSENT_STORAGE_KEY/, "the adapter must import the one consent key, not re-spell it");
  assert.equal(
    /"bct_analytics_consent"|'bct_analytics_consent'/.test(adapter),
    false,
    "a second spelling of the consent key is a second consent store"
  );
});

test("on the server, with no window, nothing is sent", () => {
  const previousWindow = globalRef.window;
  const previousId = envRef.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  delete globalRef.window;
  envRef.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST0000";
  try {
    resetTrustForwardTelemetryForTests();
    const result = trackTrustForward("tf_lite_started", { app_version: "1.1.0" });
    assert.equal(result.sent === false && result.buffered === false && result.refusal, "no-window");
    assert.equal(ga4ConfigMarkerPresent(), false);
    assert.equal(analyticsConsentGranted(), false);
  } finally {
    resetTrustForwardTelemetryForTests();
    if (previousWindow !== undefined) globalRef.window = previousWindow;
    if (previousId === undefined) delete envRef.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    else envRef.NEXT_PUBLIC_GA_MEASUREMENT_ID = previousId;
  }
});

/* -------------------------------------------------------------------------- */
/* 7. Loud in development, silent in production — DROPPED in both              */
/* -------------------------------------------------------------------------- */

test("a refusal reaches the onRefusal hook with its reason, its detail and the event", () => {
  withHarness({ consent: "granted" }, (harness) => {
    harness.runGa4Init();
    const seen: { refusal: TrustForwardRefusal; detail: string; event: unknown }[] = [];
    trackTrustForward("tf_case_reached", asProps({ case_number: 99 }), {
      onRefusal: (refusal, detail, event) => seen.push({ refusal, detail, event })
    });
    assert.equal(seen.length, 1);
    assert.equal(seen[0].refusal, "invalid-property-value");
    assert.equal(seen[0].detail, "case_number");
    assert.equal(seen[0].event, "tf_case_reached");
  });
});

test("without a hook the refusal is LOUD in development, and the warning carries no refused value", () => {
  // Captured and restored, so the assertion proves loudness without printing a
  // wall of warnings into the test output.
  const previousEnv = envRef.NODE_ENV;
  const previousWarn = console.warn;
  const lines: string[] = [];
  envRef.NODE_ENV = "development";
  console.warn = (...args: unknown[]) => {
    lines.push(args.map(String).join(" "));
  };
  try {
    withHarness({ consent: "granted" }, (harness) => {
      harness.runGa4Init();
      const result = trackTrustForward("tf_lite_started", asProps({ app_version: CANARY }));
      assert.equal(result.sent, false);
      assert.equal(result.sent === false && result.buffered === false && result.refusal, "invalid-property-value");
    });
    assert.equal(lines.length, 1, "a refusal was silent in development");
    assert.match(lines[0], /trust-forward-telemetry/);
    assert.match(lines[0], /invalid-property-value/);
    assert.ok(!lines[0].includes(CANARY), "the refused value was echoed into a console warning");
  } finally {
    console.warn = previousWarn;
    if (previousEnv === undefined) delete envRef.NODE_ENV;
    else envRef.NODE_ENV = previousEnv;
  }
});

test("in production the refusal is silent — but it is still a refusal", () => {
  // Read the other way round, a production-silent adapter that ALSO let the
  // event through would defeat the point of having an allowlist at all.
  const previousEnv = envRef.NODE_ENV;
  const previousWarn = console.warn;
  const lines: string[] = [];
  envRef.NODE_ENV = "production";
  console.warn = (...args: unknown[]) => {
    lines.push(args.map(String).join(" "));
  };
  try {
    withHarness({ consent: "granted" }, (harness) => {
      harness.runGa4Init();
      const result = trackTrustForward("tf_lite_started", asProps({ app_version: CANARY }));
      assert.equal(result.sent, false);
      assert.equal(trustForwardEvents(harness).length, 0);
    });
    assert.deepEqual(lines, []);
  } finally {
    console.warn = previousWarn;
    if (previousEnv === undefined) delete envRef.NODE_ENV;
    else envRef.NODE_ENV = previousEnv;
  }
});

test("supplying onRefusal REPLACES the console report rather than adding to it", () => {
  const previousEnv = envRef.NODE_ENV;
  const previousWarn = console.warn;
  const lines: string[] = [];
  envRef.NODE_ENV = "development";
  console.warn = (...args: unknown[]) => {
    lines.push(args.map(String).join(" "));
  };
  try {
    withHarness({ consent: "granted" }, (harness) => {
      harness.runGa4Init();
      const { refusals, onRefusal } = collector();
      trackTrustForward("tf_lite_started", asProps({ app_version: CANARY }), { onRefusal });
      assert.deepEqual(refusals, ["invalid-property-value"]);
    });
    assert.deepEqual(lines, [], "the hook must replace the console report, or every test prints warnings");
  } finally {
    console.warn = previousWarn;
    if (previousEnv === undefined) delete envRef.NODE_ENV;
    else envRef.NODE_ENV = previousEnv;
  }
});

/* -------------------------------------------------------------------------- */
/* 8. The ga4-init flush rule and the bounded buffer                           */
/* -------------------------------------------------------------------------- */

test("nothing is pushed to dataLayer before ga4-init's config marker exists", () => {
  // gtag.js processes a queued `event` with NO configured destination if it
  // precedes the `config` command, so the first event of a returning consenting
  // visitor's session would otherwise be lost — and would land ahead of
  // gtag('consent','default',{…denied}) besides.
  withHarness({ consent: "granted" }, (harness) => {
    assert.equal(ga4ConfigMarkerPresent(), false);
    const result = trackTrustForward("tf_lite_started", { app_version: "1.1.0" });
    assert.equal(result.sent, false);
    assert.equal(result.sent === false && result.buffered, true);
    assert.equal(bufferedTrustForwardEventCount(), 1);
    assert.equal(harness.queue().length, 0, "an event landed ahead of ga4-init");
  });
});

test("a partially-run ga4-init (js/consent/set, no config yet) is not a flush signal", () => {
  withHarness({ consent: "granted" }, (harness) => {
    harness.window.dataLayer = [];
    const push: (...args: unknown[]) => void = function () {
      harness.window.dataLayer?.push(arguments);
    };
    push("js", new Date());
    push("consent", "default", { analytics_storage: "denied" });
    push("set", "ads_data_redaction", true);

    trackTrustForward("tf_lite_started", { app_version: "1.1.0" });
    assert.equal(ga4ConfigMarkerPresent(), false);
    assert.equal(bufferedTrustForwardEventCount(), 1);
    assert.equal(trustForwardEvents(harness).length, 0);
  });
});

test("the buffer drains in order once the marker exists, and lands after the consent default", () => {
  withHarness({ consent: "granted" }, (harness) => {
    trackTrustForward("tf_lite_started", { app_version: "1.1.0" });
    trackTrustForward("tf_case_reached", { case_number: 1, app_version: "1.1.0" });
    trackTrustForward("tf_decision_completed", { case_number: 1, decision_number: 2, app_version: "1.1.0" });
    assert.equal(bufferedTrustForwardEventCount(), 3);

    harness.runGa4Init();
    assert.equal(flushTrustForwardTelemetry(), 3);
    assert.equal(bufferedTrustForwardEventCount(), 0);

    assert.deepEqual(
      trustForwardEvents(harness).map((entry) => entry[1]),
      ["tf_lite_started", "tf_case_reached", "tf_decision_completed"]
    );

    const queue = harness.queue();
    const consentIndex = queue.findIndex((entry) => entry[0] === "consent");
    const configIndex = queue.findIndex((entry) => entry[0] === GA4_CONFIG_COMMAND);
    const firstEventIndex = queue.findIndex((entry) => entry[0] === "event");
    assert.ok(consentIndex >= 0 && configIndex > consentIndex);
    assert.ok(firstEventIndex > configIndex, "an event was processed before gtag('config', …)");
  });
});

test("once ga4-init has run, a later event is pushed immediately with only its allowlisted props", () => {
  withHarness({ consent: "granted" }, (harness) => {
    harness.runGa4Init();
    const result = trackTrustForward("tf_navigation_back", { from_case_number: 4, app_version: "1.1.0" });
    assert.equal(result.sent, true);

    const events = trustForwardEvents(harness);
    assert.equal(events.length, 1);
    assert.equal(events[0][0], "event");
    assert.equal(events[0][1], "tf_navigation_back");
    assert.deepEqual(events[0][2], { from_case_number: 4, app_version: "1.1.0" });
  });
});

test("the queued entry is arguments-shaped, exactly as gtag() would have pushed it", () => {
  withHarness({ consent: "granted" }, (harness) => {
    harness.runGa4Init();
    trackTrustForward("tf_case5_completed", { app_version: "1.1.0" });
    const raw = (harness.window.dataLayer ?? []).filter((entry) => entry[0] === "event");
    assert.equal(raw.length, 1);
    assert.ok(!Array.isArray(raw[0]), "the entry is a plain array, not an arguments object");
    assert.equal(Object.prototype.toString.call(raw[0]), "[object Arguments]");
  });
});

test("the buffer is bounded at 32 — a page that never loads GA must not accrete a queue", () => {
  withHarness({ consent: "granted" }, (harness) => {
    // No ga4-init, so nothing can drain and every accepted event buffers.
    for (let index = 0; index < 32; index += 1) {
      const result = trackTrustForward("tf_case_reached", { case_number: 1, app_version: "1.1.0" });
      assert.equal(result.sent === false && result.buffered, true, `event ${index} was not buffered`);
    }
    assert.equal(bufferedTrustForwardEventCount(), 32);

    const overflow = trackTrustForward("tf_case_reached", { case_number: 2, app_version: "1.1.0" });
    assert.equal(overflow.sent, false);
    assert.equal(overflow.sent === false && overflow.buffered, false);
    assert.equal(overflow.sent === false && overflow.buffered === false && overflow.detail, "buffer-full");
    assert.equal(bufferedTrustForwardEventCount(), 32, "the buffer grew past its bound");

    harness.runGa4Init();
    assert.equal(flushTrustForwardTelemetry(), 32);
    assert.equal(bufferedTrustForwardEventCount(), 0);
    assert.equal(trustForwardEvents(harness).length, 32, "the 33rd event must be dropped, not deferred");
  });
});

test("the adapter holds exactly one dataLayer push, and it is the arguments-shaped shim", () => {
  const adapter = codeOnly(readFileSync(path.join(repoRoot, "lib/trust-forward/telemetry.ts"), "utf8"));
  const pushes = adapter.match(/dataLayer\s*(\?\.)?\s*\.?push\s*\(/g) ?? [];
  assert.equal(pushes.length, 1, "more than one push site is more than one place the allowlist can be skipped");
  assert.ok(/window\.dataLayer\.push\(arguments\)/.test(adapter), "the single push must be the arguments-shaped shim");
});

/* -------------------------------------------------------------------------- */
/* 9. The event-use table (PRIVACY_ANALYTICS.md "Allowed server analytics")    */
/* -------------------------------------------------------------------------- */

test("the event-use table is total: one row per allowlisted event, in order, no extras", () => {
  assert.deepEqual(
    TF_EVENT_USE.map((row) => row.event),
    [...TF_EVENT_NAMES]
  );
});

test("every row names a firing point, a funnel question, and only allowlisted properties", () => {
  for (const row of TF_EVENT_USE) {
    assert.ok(row.firesWhen.trim().length > 20, `${row.event}.firesWhen is empty or a stub`);
    assert.ok(row.question.trim().length > 8, `${row.event}.question is empty`);
    assert.ok(row.carries.includes("app_version"), `${row.event} must stamp the content version`);
    for (const key of row.carries) {
      assert.ok((TF_PROPERTY_KEYS as readonly string[]).includes(key), `${row.event} carries unlisted ${key}`);
    }
  }
});

test("every row's declared properties actually validate for that event", () => {
  // A row that disagreed with the domains would be a disclosure describing a
  // payload the adapter refuses to build.
  const sample: Record<string, unknown> = {
    case_number: 3,
    decision_number: 2,
    from_case_number: 4,
    app_version: VERSION_MANIFEST.appVersion
  };
  for (const row of TF_EVENT_USE) {
    const props: Record<string, unknown> = {};
    for (const key of row.carries) props[key] = sample[key];
    const result = validateTrustForwardEvent(row.event, props);
    assert.equal(result.ok, true, `${row.event} cannot carry its own declared properties`);
    if (result.ok) assert.deepEqual(Object.keys(result.props).sort(), [...row.carries].sort());
  }
});

/* -------------------------------------------------------------------------- */
/* 10. The aggregate counter: implemented, disabled, and unable to send        */
/* -------------------------------------------------------------------------- */

const VALID_AGGREGATE: TrustForwardAggregateEvent = {
  event: "decision_choice",
  decisionId: "C3D1",
  optionId: "B",
  appVersion: "1.1.0"
};

/** A transport that records rather than sends. If it is ever called, the ruling was broken. */
function spyTransport(): { calls: AggregateIncrement[]; transport: AggregateTransport } {
  const calls: AggregateIncrement[] = [];
  return { calls, transport: (increment) => calls.push(increment) };
}

test("TF_AGGREGATE_ENABLED ships false, as a build-time constant and not an env var", () => {
  // An env var would make the honest answer to "is choice telemetry on?" be
  // "look at the deployment", and every disclosure surface would have to hedge.
  assert.equal(TF_AGGREGATE_ENABLED, false);
  const source = codeOnly(readFileSync(path.join(repoRoot, "lib/trust-forward/aggregate.ts"), "utf8"));
  assert.equal(/process\.env/.test(source), false, "the aggregate flag must not read process.env");
  assert.match(source, /export const TF_AGGREGATE_ENABLED = false/);
});

test("with the flag off, sendTrustForwardAggregate returns immediately and calls nothing", () => {
  const spy = spyTransport();
  const outcome = sendTrustForwardAggregate(VALID_AGGREGATE, { enabled: false, transport: spy.transport });
  assert.equal(outcome.sent, false);
  assert.equal(outcome.sent === false && outcome.reason, "disabled");
  assert.equal(spy.calls.length, 0);
});

test("with the flag FORCED ON, it STILL sends nothing — there is no transport", () => {
  // The second, independent reason. A test that only exercised the flag would
  // pass for the wrong reason, and would keep passing if someone flipped it.
  assert.equal(TF_AGGREGATE_TRANSPORT, null);
  const outcome = sendTrustForwardAggregate(VALID_AGGREGATE, { enabled: true });
  assert.equal(outcome.sent, false);
  assert.equal(outcome.sent === false && outcome.reason, "no-transport");
});

test("with the SHIPPED defaults — no options at all — nothing is sent", () => {
  const outcome = sendTrustForwardAggregate(VALID_AGGREGATE);
  assert.equal(outcome.sent, false);
  assert.equal(outcome.sent === false && outcome.reason, "disabled");
});

test("Q-E's loophole stays closed: no endpoint, no route, no persistence layer", () => {
  // "Do not add the repository's first persistence/backend infrastructure merely
  // to activate Trust Forward aggregate telemetry."
  assert.throws(() => readFileSync(path.join(repoRoot, "app/api/trust-forward/aggregate/route.ts"), "utf8"));
  assert.throws(() => readFileSync(path.join(repoRoot, "app/api/trust-forward/route.ts"), "utf8"));
  const db = readFileSync(path.join(repoRoot, "lib/db/client.ts"), "utf8");
  assert.match(db, /throw new Error/, "the db client is a stub; anything else is a persistence layer");
});

test("the aggregate module references no request-issuing API at all", () => {
  // Plan §14. This repo has no browser test harness, so a request spy is not
  // available; the STATIC ABSENCE of every request-issuing primitive is the
  // guarantee that can actually be enforced here, and it is why the send path
  // takes an injected transport rather than reaching for a global.
  const source = codeOnly(readFileSync(path.join(repoRoot, "lib/trust-forward/aggregate.ts"), "utf8"));
  for (const primitive of [
    /\bfetch\b/,
    /\bXMLHttpRequest\b/,
    /\bsendBeacon\b/,
    /\bWebSocket\b/,
    /\bEventSource\b/,
    /\bnavigator\b/,
    /\bimport\s*\(\s*["']node:/,
    /["']https?:\/\//
  ]) {
    assert.equal(primitive.test(source), false, `aggregate.ts references ${primitive} — it can originate a request`);
  }
});

test("no module in lib/trust-forward can originate a request", () => {
  // The same check widened to the product, because the adapter being clean is
  // worth nothing if a sibling module posts the ledger somewhere.
  const primitives = /\bfetch\s*\(|\bXMLHttpRequest\b|\bsendBeacon\b|\bWebSocket\b|\bEventSource\b/;
  const offenders: string[] = [];
  for (const file of sourceFiles(["lib/trust-forward"])) {
    if (primitives.test(codeOnly(readFileSync(file, "utf8")))) {
      offenders.push(path.relative(repoRoot, file).split(path.sep).join("/"));
    }
  }
  assert.deepEqual(offenders, [], "a Trust Forward module can issue a network request");
});

test("the static-absence assertion has teeth", () => {
  // Positive controls, so an empty offenders list is proof rather than an
  // accident of the regexes being wrong.
  const primitives = /\bfetch\s*\(|\bXMLHttpRequest\b|\bsendBeacon\b|\bWebSocket\b|\bEventSource\b/;
  assert.ok(primitives.test(codeOnly('await fetch("/api/x", { method: "POST" });')));
  assert.ok(primitives.test(codeOnly("navigator.sendBeacon(url, body);")));
  assert.ok(primitives.test(codeOnly("new WebSocket(url);")));
  // And a doc comment describing the rule must NOT fire, or a file could not
  // document the constraint it obeys.
  assert.ok(!primitives.test(codeOnly("/* No fetch, no sendBeacon, no WebSocket anywhere here. */\n")));
});

/* -------------------------------------------------------------------------- */
/* 11. The aggregate payload is a counter, not a history                       */
/* -------------------------------------------------------------------------- */

test("the aggregate vocabulary is one event name", () => {
  assert.deepEqual([...TF_AGGREGATE_EVENT_NAMES], ["decision_choice"]);
  const unknown = validateTrustForwardAggregateEvent({ ...VALID_AGGREGATE, event: "decision_reflected" });
  assert.equal(unknown.ok, false);
  assert.equal(unknown.ok === false && unknown.refusal, "unknown-event");
});

test("aggregate validation refuses extra keys — a spread ledger event cannot ride along", () => {
  for (const extra of ["sessionId", "variantId", "handle", "localTimestamp", "sequence", "text"]) {
    const result = validateTrustForwardAggregateEvent({ ...VALID_AGGREGATE, [extra]: "x" });
    assert.equal(result.ok, false, `${extra} was accepted`);
    assert.equal(result.ok === false && result.refusal, "extra-key");
    assert.equal(result.ok === false && result.detail, extra);
  }
});

test("aggregate validation refuses missing fields, free text and invented ids", () => {
  assert.equal(validateTrustForwardAggregateEvent(VALID_AGGREGATE).ok, true);

  const missing = validateTrustForwardAggregateEvent({ event: "decision_choice", decisionId: "C3D1" });
  assert.equal(missing.ok === false && missing.refusal, "missing-field");

  for (const field of ["decisionId", "optionId", "appVersion"] as const) {
    const result = validateTrustForwardAggregateEvent({ ...VALID_AGGREGATE, [field]: CANARY });
    assert.equal(result.ok, false, `${field} accepted the canary`);
    assert.equal(result.ok === false && result.refusal, "invalid-field");
    assert.equal(result.ok === false && result.detail, field);
  }

  // A typo'd decision id is refused by the closed vocabulary, not by a regex.
  assert.equal(validateTrustForwardAggregateEvent({ ...VALID_AGGREGATE, decisionId: "C6D1" }).ok, false);
  assert.equal(validateTrustForwardAggregateEvent({ ...VALID_AGGREGATE, optionId: "D" }).ok, false);

  for (const input of [null, "a string", 7, [VALID_AGGREGATE]]) {
    const result = validateTrustForwardAggregateEvent(input);
    assert.equal(result.ok === false && result.refusal, "not-an-object");
  }
});

test("the counter key is exactly (app_version, decision_id, option_id) — no fourth column", () => {
  // The uniqueness constraint any future store must use. A fourth part is where
  // a session, a person or an ordering would hide.
  assert.equal(aggregateCounterKey(VALID_AGGREGATE), "1.1.0|C3D1|B");
  assert.equal(aggregateCounterKey(VALID_AGGREGATE).split("|").length, 3);

  const increment = toAggregateIncrement(VALID_AGGREGATE);
  assert.deepEqual(Object.keys(increment).sort(), ["appVersion", "count", "decisionId", "key", "optionId"]);
  assert.equal(increment.count, 1);
});

test("folding loses order, adjacency and sender cardinality — it is a tally, not a log", () => {
  const events: TrustForwardAggregateEvent[] = [
    { event: "decision_choice", decisionId: "C1D1", optionId: "A", appVersion: "1.1.0" },
    { event: "decision_choice", decisionId: "C1D1", optionId: "B", appVersion: "1.1.0" },
    { event: "decision_choice", decisionId: "C1D1", optionId: "A", appVersion: "1.1.0" }
  ];
  const forward = foldAggregateCounters(events);
  const reversed = foldAggregateCounters([...events].reverse());
  assert.deepEqual(forward, { "1.1.0|C1D1|A": 2, "1.1.0|C1D1|B": 1 });
  assert.deepEqual(forward, reversed, "the fold must be order-insensitive, or a sequence survives");

  // Counts from different content versions never merge.
  const mixed = foldAggregateCounters([{ ...events[0], appVersion: "1.0.0" }], forward);
  assert.deepEqual(mixed, { "1.1.0|C1D1|A": 2, "1.1.0|C1D1|B": 1, "1.0.0|C1D1|A": 1 });

  // An invalid event is dropped, not counted and not thrown on.
  const withJunk = foldAggregateCounters([
    ...events,
    { ...VALID_AGGREGATE, sessionId: "s-9f31c2a8" } as unknown as TrustForwardAggregateEvent
  ]);
  assert.deepEqual(withJunk, forward);
  assert.ok(!JSON.stringify(withJunk).includes("s-9f31c2a8"));
});

test("the never-stored list carries the constraint forward to whoever enables it", () => {
  for (const fragment of [
    "raw learner event rows",
    "choice histories or sequences",
    "any identifier on a choice counter",
    "session ids",
    "learner handles",
    "reflection text",
    "variant ids"
  ]) {
    assert.ok(TF_AGGREGATE_NEVER_STORED.includes(fragment), `the never-stored list no longer names "${fragment}"`);
  }
});
