/**
 * Trust Forward Lite — the ledger, the local sessions and the storage substrate
 * (`lib/trust-forward/ledger.ts`, `lib/trust-forward/session.ts`,
 * `lib/trust-forward/storage.ts`).
 *
 * Node's runner, pure modules, a fake `window.localStorage`. No renderer, no
 * component import, no `*.module.css` anywhere in this file's import graph:
 * `package.json` runs the suite as `node --import tsx --test tests/*.test.ts`
 * and Node cannot load a `.css` specifier, so a single component import here
 * would take the whole file down with `ERR_UNKNOWN_FILE_EXTENSION`. The three
 * modules under test are pure for exactly that reason and this file keeps the
 * property honest by never reaching past them.
 *
 * THE CLOCK IS INJECTED, ALWAYS. Every assertion below passes an explicit `now`
 * and never reads `Date.now()`. Two rules here are only observable in time — a
 * strictly increasing sequence and a six-hour session rollover — and a test
 * that waits six hours is a test nobody runs. `ledger.ts` and `session.ts` take
 * `now` as a parameter on every function precisely so this file can assert both
 * sides of the boundary in a millisecond.
 *
 * WHAT THIS FILE IS GUARDING, stated as consequences rather than as coverage:
 *
 *  1. **A sequence is never reused.** `appendEvent` derives the next sequence
 *     from `max(counter, highest ledger sequence)`, not from the counter alone.
 *     A second tab writing the key while this tab holds an older snapshot
 *     (plan §6.8) is a reachable state, and the counter-only form would hand
 *     out a duplicate that then propagates through every downstream derivation.
 *
 *  2. **Appending returns a NEW dataset.** The ledger is the immutable
 *     substrate the active-path derivation rests on (ARCHITECTURE.md "The
 *     ledger is never rewritten"). An in-place push would let a React render
 *     that ran twice record one decision twice, so the original object is
 *     asserted byte-identical after every append.
 *
 *  3. **`localTimestamp` carries a numeric UTC offset and no timezone name.**
 *     `Europe/Berlin` is a location signal and this value travels inside the
 *     learner's export (`config/trust-forward-lite.v1.json` →
 *     `storage.timezoneNameStored: false`). The assertions are not "the regex
 *     matches" alone — they also assert that no IANA-shaped name can appear in
 *     a serialized dataset at all, and that the emitting module never reaches
 *     for `Intl…resolvedOptions().timeZone` in the first place.
 *
 *  4. **A session id is never transmitted.** `PRIVACY_ANALYTICS.md` lists
 *     "local timestamps/session IDs" under **Never transmit**, and the thing
 *     that makes it true is the telemetry property allowlist having no property
 *     that could carry one. That is asserted here as a domain fact — a real
 *     minted session id is offered to every allowlisted key in turn and every
 *     one refuses it.
 *
 *  5. **The serializer refuses undeclared keys.** Minimisation is a property of
 *     `serializeLiteState()`, not a convention call sites remember. An
 *     undeclared field is attempted and asserted absent after a full round
 *     trip, while the two DECLARED free-text exceptions — a reflection draft
 *     and the local handle — are asserted to survive intact, because a
 *     serializer that ate the learner's own words would fail the product.
 *
 *  6. **Blocked storage degrades, never throws.** iOS Safari in private
 *     browsing throws on `localStorage` ACCESS, not on read, and iPhone Safari
 *     is the primary QA target. `TEST_PLAN.md` requires "clear pre-start
 *     failure explanation", so the module must return a valid empty dataset and
 *     `storageAvailable()` must report `false` — that boolean is what lets the
 *     UI render the approved pre-start explanation from
 *     `content/trust-forward/` instead of a blank screen.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  EVENT_ID_PREFIX,
  LEDGER_EVENT_KEYS,
  LEDGER_EVENT_TYPES,
  NO_SESSION_ID,
  type LedgerEventInput,
  appendEvent,
  appendEvents,
  highestSequence,
  isIdToken,
  isLocalTimestamp,
  ledgerInvariantViolations,
  makeLocalTimestamp,
  newId,
  randomIdSourceAvailable,
  sanitizeLedgerEvent
} from "@/lib/trust-forward/ledger";
import {
  LITE_SESSION_INACTIVITY_HOURS,
  LITE_SESSION_INACTIVITY_MS,
  SESSION_ID_PREFIX,
  appendEventInSession,
  newSessionId,
  resolveSession,
  rollSessionIfIdle,
  sessionCount,
  sessionIdsInLedger,
  shouldRollSession
} from "@/lib/trust-forward/session";
import {
  LITE_DECLARED_KEYS,
  LITE_SCHEMA_VERSION,
  LITE_TOP_LEVEL_FIELDS,
  TRUST_FORWARD_LITE_STORAGE_KEY,
  clearLiteState,
  emptyLiteDataset,
  isUnstartedLiteDataset,
  liteDatasetInvariantViolations,
  parseLiteState,
  readLiteState,
  replaceLiteDataset,
  sanitizeLiteDataset,
  serializeLiteState,
  startLiteDataset,
  storageAvailable,
  updateLiteState,
  validateLiteDataset,
  writeLiteState
} from "@/lib/trust-forward/storage";
import {
  TF_EVENT_NAMES,
  TF_NEVER_TRANSMITTED,
  TF_PROPERTY_KEYS,
  validateTrustForwardEvent
} from "@/lib/trust-forward/telemetry";
import type { LedgerEvent, LiteDataset } from "@/lib/trust-forward/types";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* -------------------------------------------------------------------------- */
/* Fixtures — injected clock, injected ids, no ambient Date                    */
/* -------------------------------------------------------------------------- */

/**
 * Whole-second instants on purpose. `makeLocalTimestamp()` emits seconds
 * precision, so a base carrying milliseconds would make the six-hour boundary
 * assertions off by up to 999ms for a reason that has nothing to do with the
 * rule under test.
 */
const T0 = new Date("2026-09-07T09:00:00.000Z");

const at = (msAfterT0: number): Date => new Date(T0.getTime() + msAfterT0);

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

/** A deterministic id source. Uniqueness is still enforced by the module. */
function ids(prefix: string): () => string {
  let n = 0;
  return () => {
    n += 1;
    return `${prefix}_${String(n).padStart(4, "0")}`;
  };
}

const manifest = { appVersion: "1.0.0", contentVersion: "1.1.0" };

function started(now: Date = T0, mint: () => string = ids(SESSION_ID_PREFIX)): LiteDataset {
  return startLiteDataset(manifest, { now, makeSessionId: mint });
}

const navigated: LedgerEventInput = { type: "navigated" };

/** A deep, order-sensitive snapshot. Compared before and after every append. */
const snapshot = (value: unknown): string => JSON.stringify(value);

/* -------------------------------------------------------------------------- */
/* A fake localStorage, and the two ways a real browser refuses one            */
/* -------------------------------------------------------------------------- */

interface FakeWindow {
  localStorage: Storage;
}

function fakeStorage(seed: Record<string, string> = {}): Storage {
  const map = new Map<string, string>(Object.entries(seed));
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(key) ? (map.get(key) as string) : null;
    },
    key(index: number) {
      return [...map.keys()][index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    }
  } as unknown as Storage;
}

const globalRef = globalThis as unknown as { window?: FakeWindow };

function withWindow<T>(store: Storage, body: (store: Storage) => T): T {
  const previous = globalRef.window;
  globalRef.window = { localStorage: store };
  try {
    return body(store);
  } finally {
    if (previous === undefined) delete globalRef.window;
    else globalRef.window = previous;
  }
}

/**
 * The iOS Safari private-browsing shape: the THROW IS ON ACCESS, not on read.
 * A guard that only wrapped `getItem` would still take the page down on the
 * property lookup itself, which is why this fixture throws from the getter.
 */
function withThrowingWindow<T>(body: () => T): T {
  const previous = globalRef.window;
  const hostile = {} as FakeWindow;
  Object.defineProperty(hostile, "localStorage", {
    get() {
      throw new Error("SecurityError: access to storage is not allowed from this context");
    }
  });
  globalRef.window = hostile;
  try {
    return body();
  } finally {
    if (previous === undefined) delete globalRef.window;
    else globalRef.window = previous;
  }
}

/* ========================================================================== */
/* 1. The ledger invariants                                                   */
/* ========================================================================== */

test("sequence starts at 1 and strictly increases across appends", () => {
  const mintEvent = ids(EVENT_ID_PREFIX);
  let dataset = started();
  assert.equal(dataset.sequence, 0, "a started-but-empty dataset has appended nothing yet");

  for (let index = 0; index < 5; index += 1) {
    dataset = appendEvent(dataset, navigated, { now: at(index * MINUTE), eventId: mintEvent() });
  }

  assert.deepEqual(
    dataset.ledger.map((event) => event.sequence),
    [1, 2, 3, 4, 5]
  );
  assert.equal(dataset.sequence, 5, "the dataset counter tracks the highest sequence");
  assert.equal(highestSequence(dataset.ledger), 5);
  assert.deepEqual(ledgerInvariantViolations(dataset.ledger), []);
});

test("a sequence is never reused, even when the counter has fallen behind its own ledger", () => {
  // The reachable multi-tab state (plan §6.8): a second tab wrote events while
  // this tab held an older snapshot, so `sequence` is stale relative to the
  // ledger it describes. `dataset.sequence + 1` would hand out 3 — a number
  // two events already carry — and every downstream ordering would be wrong.
  const base = started();
  const withEvents = appendEvents(base, [navigated, navigated, navigated, navigated], { now: T0 });
  const stale: LiteDataset = { ...withEvents, sequence: 2 };

  const next = appendEvent(stale, navigated, { now: at(MINUTE), eventId: `${EVENT_ID_PREFIX}_stale` });
  const last = next.ledger[next.ledger.length - 1];

  assert.equal(highestSequence(withEvents.ledger), 4);
  assert.equal(last.sequence, 5, "the next sequence is max(counter, ledger high) + 1, not counter + 1");
  assert.equal(
    new Set(next.ledger.map((event) => event.sequence)).size,
    next.ledger.length,
    "no sequence appears twice"
  );
  assert.deepEqual(ledgerInvariantViolations(next.ledger), []);
});

test("the sanitizer names a reused sequence and a reused eventId as violations", () => {
  const dataset = appendEvents(started(), [navigated, navigated], { now: T0 });
  const [first, second] = dataset.ledger;

  assert.deepEqual(ledgerInvariantViolations([first, { ...second, sequence: first.sequence }]), [
    "ledger[1].sequence does not strictly increase"
  ]);
  assert.deepEqual(ledgerInvariantViolations([first, { ...second, eventId: first.eventId }]), [
    "ledger[1].eventId is not unique"
  ]);
  // Equal is a violation too: "strictly increases" is not "does not decrease".
  assert.equal(ledgerInvariantViolations([first, second, second]).length, 2);
});

test("eventIds are unique, prefix-qualified, and an id already in the ledger is refused", () => {
  const dataset = appendEvents(started(), [navigated, navigated, navigated, navigated, navigated], { now: T0 });
  const eventIds = dataset.ledger.map((event) => event.eventId);

  assert.equal(new Set(eventIds).size, eventIds.length, "every eventId is distinct");
  for (const eventId of eventIds) {
    assert.ok(eventId.startsWith(`${EVENT_ID_PREFIX}_`), `${eventId} carries the evt prefix`);
    assert.ok(isIdToken(eventId), `${eventId} is an identifier, not a sentence`);
    assert.ok(!/\s/.test(eventId), "an id never contains whitespace");
  }

  assert.throws(
    () => appendEvent(dataset, navigated, { now: at(HOUR), eventId: eventIds[0] }),
    /already present/,
    "re-minting an id that is already in the ledger must not silently overwrite an event"
  );
});

test("the random id source is real, and its absence is reportable rather than fatal-by-surprise", () => {
  // `crypto.randomUUID` exists only in a secure context and is absent from
  // older mobile Safari. The module exports the probe so a caller can render an
  // explanation instead of discovering the gap at the learner's first event.
  assert.equal(randomIdSourceAvailable(), true, "the test runner has a crypto source");
  const a = newId(EVENT_ID_PREFIX);
  const b = newId(EVENT_ID_PREFIX);
  assert.notEqual(a, b);
  assert.match(a, /^evt_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test("appending returns a NEW dataset and leaves the original byte-identical", () => {
  const before = started();
  const beforeSnapshot = snapshot(before);
  const beforeLedger = before.ledger;
  const beforeLength = before.ledger.length;

  const after = appendEvent(before, { type: "case_reached", caseNumber: 1 }, { now: at(MINUTE) });

  assert.notEqual(after, before, "a new object, not the same one mutated");
  assert.notEqual(after.ledger, beforeLedger, "a new array, not a push into the old one");
  assert.equal(snapshot(before), beforeSnapshot, "the original dataset changed under an append");
  assert.equal(before.ledger, beforeLedger, "the original ledger reference was replaced in place");
  assert.equal(before.ledger.length, beforeLength, "an event was pushed into the caller's array");
  assert.equal(before.sequence, 0, "the caller's counter moved");
  assert.equal(after.ledger.length, beforeLength + 1);

  // The double-render case, stated directly: appending twice from the SAME
  // snapshot yields two independent datasets, each with exactly one event, and
  // never one dataset carrying the decision twice.
  const first = appendEvent(before, navigated, { now: at(MINUTE) });
  const second = appendEvent(before, navigated, { now: at(MINUTE) });
  assert.equal(first.ledger.length, 1);
  assert.equal(second.ledger.length, 1);
  assert.equal(before.ledger.length, 0);
});

test("a stored event is frozen, so a later edit throws instead of rewriting history", () => {
  const dataset = appendEvent(started(), navigated, { now: T0 });
  const event = dataset.ledger[0];
  assert.ok(Object.isFrozen(event), "events are immutable (ARCHITECTURE.md invariants)");
  assert.throws(() => {
    (event as { sequence: number }).sequence = 99;
  }, TypeError);
  assert.equal(dataset.ledger[0].sequence, 1);
});

test("appendEvents is indistinguishable from the same events appended one at a time", () => {
  const base = started();
  const batched = appendEvents(base, [navigated, navigated, navigated], { now: T0 });
  let stepwise = base;
  for (let index = 0; index < 3; index += 1) stepwise = appendEvent(stepwise, navigated, { now: T0 });

  assert.deepEqual(
    batched.ledger.map((event) => event.sequence),
    stepwise.ledger.map((event) => event.sequence)
  );
  assert.equal(base.ledger.length, 0, "the batch mutated its input");
  assert.deepEqual(ledgerInvariantViolations(batched.ledger), []);
});

/* ========================================================================== */
/* 2. The timestamp is a privacy decision                                     */
/* ========================================================================== */

/** Exactly the shape the module promises: local wall clock, numeric offset. */
const NUMERIC_OFFSET_STAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;

/** `Europe/Berlin`, `America/New_York`, `Asia/Kolkata` — a location signal. */
const IANA_SHAPED_NAME = /[A-Za-z]{2,}\/[A-Za-z_]{2,}/;

test("localTimestamp carries a numeric UTC offset and never a timezone name", () => {
  const stamp = makeLocalTimestamp(T0);
  assert.match(stamp, NUMERIC_OFFSET_STAMP);
  assert.doesNotMatch(stamp, IANA_SHAPED_NAME, "an IANA name in the stamp is a location signal");

  // Stronger than "no slash": the ONLY letter a legal stamp may contain is the
  // ISO date/time separator. Any other alphabetic character is a name.
  assert.doesNotMatch(stamp.replace("T", ""), /[A-Za-z]/, "the stamp carries no name of any kind");

  // The offset is information-preserving: wall clock + offset re-parses to the
  // exact instant, so nothing was traded away by dropping the name.
  assert.equal(Date.parse(stamp), Math.floor(T0.getTime() / 1000) * 1000);
});

test("every timestamp a dataset can hold matches the numeric-offset shape", () => {
  const dataset = appendEvents(started(T0), [navigated, navigated], { now: at(3 * MINUTE) });
  const stamps = [
    dataset.createdAtLocal,
    dataset.lastActivityAtLocal,
    ...dataset.ledger.map((event) => event.localTimestamp)
  ];
  for (const stamp of stamps) {
    assert.match(stamp, NUMERIC_OFFSET_STAMP);
    assert.ok(isLocalTimestamp(stamp));
    assert.doesNotMatch(stamp, IANA_SHAPED_NAME);
  }
});

test("no IANA-style name can appear anywhere in a serialized dataset", () => {
  // The export is the reason this matters: whatever survives serialization
  // travels in the learner's file. So the assertion is made against the exact
  // string that reaches storage, not against a field read one at a time.
  const dataset = appendEvents(started(T0), [navigated, { type: "case_reached", caseNumber: 2 }], {
    now: at(HOUR)
  });
  const serialized = serializeLiteState(dataset, T0);

  assert.doesNotMatch(serialized, IANA_SHAPED_NAME);
  for (const region of ["America/", "Europe/", "Asia/", "Africa/", "Australia/", "Pacific/", "Etc/"]) {
    assert.ok(!serialized.includes(region), `"${region}" reached the serialized dataset`);
  }
});

test("a foreign or name-bearing timestamp is refused rather than accepted on faith", () => {
  // `Z` is legal ISO-8601 but nothing in this product writes it, so a `Z` came
  // from a generator that is not ours and its provenance is unknown. The
  // bracketed suffix is refused for the stronger reason: it is the name.
  assert.equal(isLocalTimestamp("2026-09-07T14:32:05+02:00"), true);
  assert.equal(isLocalTimestamp("2026-09-07T14:32:05-05:00"), true);
  assert.equal(isLocalTimestamp("2026-09-07T14:32:05Z"), false);
  assert.equal(isLocalTimestamp("2026-09-07T14:32:05+02:00[Europe/Berlin]"), false);
  assert.equal(isLocalTimestamp("2026-09-07T14:32:05.123+02:00"), false);
  assert.equal(isLocalTimestamp(T0.toISOString()), false, "toISOString discards the local wall clock");
  assert.equal(isLocalTimestamp("Mon Sep 07 2026 11:00:00 GMT+0200 (Central European Summer Time)"), false);
  assert.equal(isLocalTimestamp(""), false);
  assert.equal(isLocalTimestamp(T0.getTime()), false);
  assert.equal(isLocalTimestamp(null), false);
});

test("the serializer drops a timestamp that smuggles a timezone name", () => {
  const poisoned = {
    ...emptyLiteDataset(T0),
    createdAtLocal: "2026-09-07T09:00:00+02:00[Europe/Berlin]",
    lastActivityAtLocal: "2026-09-07T09:00:00Z"
  };
  const { dataset, dropped } = sanitizeLiteDataset(poisoned, T0);

  assert.ok(dropped.includes("createdAtLocal"));
  assert.ok(dropped.includes("lastActivityAtLocal"));
  assert.match(dataset.createdAtLocal, NUMERIC_OFFSET_STAMP);
  assert.match(dataset.lastActivityAtLocal, NUMERIC_OFFSET_STAMP);
  assert.doesNotMatch(JSON.stringify(dataset), IANA_SHAPED_NAME);

  // Same refusal one level down, on the field that actually travels per event.
  const { event, dropped: eventDropped } = sanitizeLedgerEvent({
    eventId: "evt_1",
    sequence: 1,
    type: "navigated",
    localTimestamp: "2026-09-07T09:00:00+02:00[Europe/Berlin]",
    sessionId: "session_1"
  });
  assert.equal(event, null, "an event whose stamp carries a name is dropped whole");
  assert.ok(eventDropped.includes("event"));
});

test("the emitting module never reaches for the timezone NAME", () => {
  // Behavioural assertions above can only observe the timezone this runner
  // happens to be in. This one closes the gap the other way: the code that
  // mints the stamp has no path to `Intl…resolvedOptions().timeZone` at all,
  // so it cannot start emitting a name under a different host configuration.
  const source = readFileSync(path.join(repoRoot, "lib/trust-forward/ledger.ts"), "utf8");
  const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

  for (const forbidden of ["Intl.", "resolvedOptions", "timeZone", "toISOString", "toLocaleString"]) {
    assert.ok(!code.includes(forbidden), `lib/trust-forward/ledger.ts calls ${forbidden}`);
  }
});

test("the stamp keeps its shape when the host timezone is not UTC", () => {
  // Node re-reads `process.env.TZ` on the next Date construction, so this
  // exercises a real non-UTC offset where the platform supports it. The
  // assertions hold either way — that is the point: no host configuration can
  // make this module emit a name.
  const previous = process.env.TZ;
  try {
    for (const zone of ["America/New_York", "Asia/Kolkata", "Europe/Berlin", "UTC"]) {
      process.env.TZ = zone;
      const stamp = makeLocalTimestamp(new Date(T0.getTime()));
      assert.match(stamp, NUMERIC_OFFSET_STAMP, `TZ=${zone} produced ${stamp}`);
      assert.doesNotMatch(stamp, IANA_SHAPED_NAME, `TZ=${zone} leaked a name into ${stamp}`);
      assert.ok(!stamp.includes(zone), `TZ=${zone} wrote its own name into the stamp`);
      assert.equal(Date.parse(stamp), Math.floor(T0.getTime() / 1000) * 1000, `TZ=${zone} lost the instant`);
    }
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
    // Re-arm the platform's timezone cache before any later test reads a clock.
    void new Date().getTimezoneOffset();
  }
});

/* ========================================================================== */
/* 3. Sessions: the six-hour rule, and the id that never leaves the device     */
/* ========================================================================== */

test("the stamped inactivity window is six hours, not a rounded approximation", () => {
  assert.equal(LITE_SESSION_INACTIVITY_HOURS, 6, "storage.sessionInactivityHours in the stamped config");
  assert.equal(LITE_SESSION_INACTIVITY_MS, 6 * 60 * 60 * 1000);
});

test("the session rolls at six hours of inactivity and not one millisecond before", () => {
  const last = makeLocalTimestamp(T0);

  assert.equal(shouldRollSession(last, at(0)), false, "no time has passed");
  assert.equal(shouldRollSession(last, at(5 * HOUR)), false);
  assert.equal(shouldRollSession(last, at(LITE_SESSION_INACTIVITY_MS - 1)), false, "one ms short must not roll");
  assert.equal(shouldRollSession(last, at(LITE_SESSION_INACTIVITY_MS)), true, "the boundary is >=, exactly six hours");
  assert.equal(shouldRollSession(last, at(LITE_SESSION_INACTIVITY_MS + 1)), true);
  assert.equal(shouldRollSession(last, at(48 * HOUR)), true);
});

test("an unreadable last-activity stamp fails toward a NEW session", () => {
  // Rolling unnecessarily costs a fresh local id in a local export. Not rolling
  // pins a learner to one id forever, which is the more identifying outcome.
  assert.equal(shouldRollSession("", at(MINUTE)), true);
  assert.equal(shouldRollSession(null, at(MINUTE)), true);
  assert.equal(shouldRollSession(undefined, at(MINUTE)), true);
  assert.equal(shouldRollSession("not a timestamp", at(MINUTE)), true);
});

test("resolveSession keeps the sitting inside six hours and mints a new one at six", () => {
  const mint = ids(SESSION_ID_PREFIX);
  const dataset = appendEvent(started(T0, mint), navigated, { now: T0 });
  const original = dataset.currentSessionId;
  assert.ok(isIdToken(original));

  const inside = resolveSession(dataset, { now: at(LITE_SESSION_INACTIVITY_MS - 1), makeSessionId: mint });
  assert.equal(inside.rolled, false);
  assert.equal(inside.sessionId, original, "an id was minted inside the window");

  const outside = resolveSession(dataset, { now: at(LITE_SESSION_INACTIVITY_MS), makeSessionId: mint });
  assert.equal(outside.rolled, true);
  assert.notEqual(outside.sessionId, original);
});

test("a dataset that was never started always mints a session on its first event", () => {
  const empty = emptyLiteDataset(T0);
  assert.equal(empty.currentSessionId, NO_SESSION_ID);
  const resolution = resolveSession(empty, { now: T0, makeSessionId: ids(SESSION_ID_PREFIX) });
  assert.equal(resolution.rolled, true, "no session is the same branch as an expired one, not a special case");
  assert.ok(isIdToken(resolution.sessionId));
});

test("rollSessionIfIdle returns a new dataset and never mutates the old one", () => {
  const mint = ids(SESSION_ID_PREFIX);
  const dataset = appendEvent(started(T0, mint), navigated, { now: T0 });
  const before = snapshot(dataset);

  const held = rollSessionIfIdle(dataset, { now: at(3 * HOUR), makeSessionId: mint });
  assert.equal(held.rolled, false);
  assert.equal(held.dataset, dataset, "an unrolled session returns the same object untouched");

  const rolled = rollSessionIfIdle(dataset, { now: at(7 * HOUR), makeSessionId: mint });
  assert.equal(rolled.rolled, true);
  assert.notEqual(rolled.dataset, dataset);
  assert.notEqual(rolled.dataset.currentSessionId, dataset.currentSessionId);
  assert.equal(snapshot(dataset), before, "rolling mutated the caller's dataset");
  // Opening the tab IS activity: without advancing the stamp, a learner who
  // reads a case for seven hours would roll again mid-decision.
  assert.equal(rolled.dataset.lastActivityAtLocal, makeLocalTimestamp(at(7 * HOUR)));
});

test("appendEventInSession records under one session inside the window and two across it", () => {
  const mint = ids(SESSION_ID_PREFIX);
  const first = appendEventInSession(started(T0, mint), navigated, { now: T0, makeSessionId: mint });
  const second = appendEventInSession(first.dataset, navigated, {
    now: at(LITE_SESSION_INACTIVITY_MS - MINUTE),
    makeSessionId: mint
  });
  const third = appendEventInSession(second.dataset, navigated, {
    now: at(LITE_SESSION_INACTIVITY_MS - MINUTE + LITE_SESSION_INACTIVITY_MS),
    makeSessionId: mint
  });

  assert.equal(second.rolled, false);
  assert.equal(second.sessionId, first.sessionId);
  assert.equal(third.rolled, true);
  assert.notEqual(third.sessionId, second.sessionId);

  assert.equal(sessionCount(third.dataset), 2, "two sittings, derived from the ledger not stored beside it");
  assert.deepEqual(sessionIdsInLedger(third.dataset), [first.sessionId, third.sessionId]);
  assert.deepEqual(
    third.dataset.ledger.map((event) => event.sequence),
    [1, 2, 3],
    "a rollover does not disturb the sequence"
  );
  assert.deepEqual(ledgerInvariantViolations(third.dataset.ledger), []);
});

test("a session id is never transmitted: no telemetry property would accept one", () => {
  // PRIVACY_ANALYTICS.md lists "local timestamps/session IDs" under Never
  // transmit. Nothing polices a payload it never sees, so what makes the rule
  // true is that the allowlist has no property a session id could ride in.
  const sessionId = newSessionId();
  assert.ok(sessionId.startsWith(`${SESSION_ID_PREFIX}_`));

  const eventName = TF_EVENT_NAMES[0];
  const shapes: unknown[] = [sessionId, sessionId.slice(SESSION_ID_PREFIX.length + 1), newId("x")];

  for (const key of TF_PROPERTY_KEYS) {
    for (const value of shapes) {
      const result = validateTrustForwardEvent(eventName, { [key]: value });
      assert.equal(result.ok, false, `${key} accepted a session id`);
      if (!result.ok) assert.equal(result.refusal, "invalid-property-value");
    }
  }

  // And it cannot arrive under a name of its own, either.
  for (const key of ["session_id", "sessionId", "local_session", "handle", "timestamp"]) {
    const result = validateTrustForwardEvent(eventName, { [key]: sessionId });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.refusal, "unknown-property");
  }

  for (const key of TF_PROPERTY_KEYS) {
    assert.doesNotMatch(key, /session|handle|timestamp|option|variant|ship|text/);
  }
  assert.ok(TF_NEVER_TRANSMITTED.includes("session IDs"));
  assert.ok(TF_NEVER_TRANSMITTED.includes("local timestamps"));
});

/* ========================================================================== */
/* 4. The serializer refuses undeclared keys                                  */
/* ========================================================================== */

test("an undeclared top-level field does not survive a round trip", () => {
  const contraband = {
    ...started(T0),
    // The three shapes a careless caller would actually reach for.
    employer: "Acme Logistics",
    notes: "the learner mentioned their daughter is in hospital",
    timezone: "Europe/Berlin"
  };

  const { dropped } = sanitizeLiteDataset(contraband, T0);
  assert.ok(dropped.includes("employer"));
  assert.ok(dropped.includes("notes"));
  assert.ok(dropped.includes("timezone"));

  const serialized = serializeLiteState(contraband, T0);
  assert.ok(!serialized.includes("Acme"), "an undeclared field reached the stored string");
  assert.ok(!serialized.includes("daughter"));
  assert.ok(!serialized.includes("Europe/Berlin"));

  const { dataset } = parseLiteState(serialized, T0);
  assert.deepEqual(Object.keys(dataset).sort(), [...LITE_TOP_LEVEL_FIELDS].sort());
  assert.ok(!("employer" in dataset));
  assert.ok(!("notes" in dataset));
  assert.ok(!("timezone" in dataset));
  assert.equal(dataset.schemaVersion, LITE_SCHEMA_VERSION);
});

test("an undeclared draft field is dropped and the declared free text survives intact", () => {
  const words = "  I said yes because the client sounded panicked, and I still think that was right.  ";
  const input = {
    ...emptyLiteDataset(T0),
    drafts: [{ decisionId: "C2D1", text: words, sentiment: "anxious", authorEmail: "learner@example.com" }],
    handle: "  Sam (nights)  "
  };

  const { dataset, dropped } = sanitizeLiteDataset(input, T0);
  assert.ok(dropped.includes("drafts[0].sentiment"));
  assert.ok(dropped.includes("drafts[0].authorEmail"));
  assert.deepEqual(Object.keys(dataset.drafts[0]).sort(), [...LITE_DECLARED_KEYS.draft].sort());

  // The two deliberate exceptions. Not trimmed, not truncated, not normalised —
  // the learner's own words coming back in their own export is the product.
  assert.equal(dataset.drafts[0].text, words);
  assert.equal(dataset.handle, "  Sam (nights)  ");

  const roundTripped = parseLiteState(serializeLiteState(input, T0), T0).dataset;
  assert.equal(roundTripped.drafts[0].text, words);
  assert.equal(roundTripped.handle, "  Sam (nights)  ");
  assert.ok(!JSON.stringify(roundTripped).includes("learner@example.com"));
});

test("a draft under an invented decision key is dropped whole", () => {
  const { dataset, dropped } = sanitizeLiteDataset(
    { ...emptyLiteDataset(T0), drafts: [{ decisionId: "C9D9", text: "a whole paragraph about my employer" }] },
    T0
  );
  assert.deepEqual(dataset.drafts, []);
  assert.ok(dropped.includes("drafts[0]"));
  assert.ok(!JSON.stringify(dataset).includes("employer"));
});

test("an undeclared key on a ledger event does not survive, and cannot be appended", () => {
  const raw: Record<string, unknown> = {
    eventId: "evt_0001",
    sequence: 1,
    type: "decision_selected",
    localTimestamp: makeLocalTimestamp(T0),
    sessionId: "session_0001",
    decisionId: "C1D1",
    selectedOptionId: "A",
    promptText: "here is the prompt I pasted at work",
    userAgent: "Mozilla/5.0"
  };

  const { event, dropped } = sanitizeLedgerEvent(raw, "event");
  assert.ok(event);
  assert.deepEqual(dropped.sort(), ["event.promptText", "event.userAgent"]);
  if (event) {
    for (const key of Object.keys(event)) {
      assert.ok((LEDGER_EVENT_KEYS as readonly string[]).includes(key), `${key} is not a declared event key`);
    }
  }

  // The same refusal on the way in from a caller, not only on the way in from
  // storage: `appendEvent` rebuilds the event key by key rather than spreading.
  const input = { type: "navigated", promptText: "still trying" } as unknown as LedgerEventInput;
  const appended = appendEvent(started(T0), input, { now: T0, eventId: "evt_0002" });
  assert.ok(!("promptText" in appended.ledger[0]));
  assert.ok(!serializeLiteState(appended, T0).includes("still trying"));
});

test("a sentence cannot hide under a declared token key", () => {
  // `value` is a flag or a short token and `variantId` is a bounded pointer.
  // Without value domains they would be free-text fields wearing permitted
  // names, and free text there would travel in the export unreviewed.
  const base = {
    eventId: "evt_0001",
    sequence: 1,
    type: "navigated",
    localTimestamp: makeLocalTimestamp(T0),
    sessionId: "session_0001"
  };

  const sentence = sanitizeLedgerEvent({ ...base, value: "I work at Acme and I am worried" });
  assert.ok(sentence.event);
  assert.equal(sentence.event?.value, undefined);
  assert.ok(sentence.dropped.includes("event.value"));

  const variant = sanitizeLedgerEvent({ ...base, variantId: "c1:ambiguity=AMB BOUNDED with a note" });
  assert.ok(variant.event);
  assert.equal(variant.event?.variantId, undefined);
  assert.ok(variant.dropped.includes("event.variantId"));

  // The legitimate shapes still pass — the domain is a filter, not a wall.
  const clean = sanitizeLedgerEvent({ ...base, value: true, variantId: "c1:ambiguity=AMB_BOUNDED|risk=RISK_STAGE" });
  assert.equal(clean.event?.value, true);
  assert.equal(clean.event?.variantId, "c1:ambiguity=AMB_BOUNDED|risk=RISK_STAGE");
  assert.deepEqual(clean.dropped, []);
});

test("the version manifest cannot carry a sentence, and an unknown blob schema is not guessed at", () => {
  const { dataset, dropped } = sanitizeLiteDataset(
    { ...emptyLiteDataset(T0), versionManifest: { appVersion: "1.0.0", "note to self": "call the client back" } },
    T0
  );
  assert.deepEqual(dataset.versionManifest, { appVersion: "1.0.0" });
  assert.ok(dropped.includes("versionManifest.note to self"));

  // VERSIONING.md forbids a silent migration, so an unreadable schema resolves
  // to a clean empty dataset rather than a repaired one.
  const future = parseLiteState(JSON.stringify({ schemaVersion: 2, handle: "Sam" }), T0);
  assert.deepEqual(future.dropped, ["<unmigratable>"]);
  assert.equal(future.dataset.handle, null);
  assert.ok(isUnstartedLiteDataset(future.dataset));
});

test("a stored counter behind its own ledger is repaired upward, never downward", () => {
  const dataset = appendEvents(started(T0), [navigated, navigated, navigated], { now: T0 });
  const { dataset: repaired, dropped } = sanitizeLiteDataset({ ...dataset, sequence: 1 }, T0);

  assert.equal(repaired.sequence, 3, "trusting a low counter would hand out a sequence that already exists");
  assert.ok(dropped.includes("sequence"));
  assert.deepEqual(liteDatasetInvariantViolations(repaired), []);
});

test("a corrupted ledger is repaired into one the invariants pass", () => {
  const dataset = appendEvents(started(T0), [navigated, navigated], { now: T0 });
  const [first, second] = dataset.ledger;
  const corrupted = {
    ...dataset,
    ledger: [first, { ...second, eventId: first.eventId }, { ...second, sequence: first.sequence }, second]
  };

  const { dataset: repaired, dropped } = sanitizeLiteDataset(corrupted, T0);
  assert.ok(dropped.includes("ledger[1].eventId"));
  assert.ok(dropped.includes("ledger[2].sequence"));
  assert.deepEqual(repaired.ledger.map((event: LedgerEvent) => event.sequence), [1, 2]);
  assert.deepEqual(liteDatasetInvariantViolations(repaired), []);
});

test("the declared key lists are total over the contract", () => {
  const dataset = started(T0);
  assert.deepEqual(Object.keys(dataset).sort(), [...LITE_TOP_LEVEL_FIELDS].sort());
  assert.equal(new Set(LEDGER_EVENT_KEYS).size, LEDGER_EVENT_KEYS.length);
  assert.equal(new Set(LEDGER_EVENT_TYPES).size, LEDGER_EVENT_TYPES.length);
  assert.equal(validateLiteDataset(dataset, T0).valid, true, "a freshly started dataset drops nothing");
});

/* ========================================================================== */
/* 5. Blocked storage degrades — it never throws and never blanks the screen   */
/* ========================================================================== */

test("a browser that throws on localStorage ACCESS returns a valid empty state", () => {
  withThrowingWindow(() => {
    const read = readLiteState(T0);

    assert.equal(read.storageBlocked, true, "the empty dataset is a fallback, not the learner's data");
    assert.deepEqual(read.dataset, emptyLiteDataset(T0));
    assert.equal(validateLiteDataset(read.dataset, T0).valid, true, "the fallback must be renderable, not a stub");
    assert.deepEqual(liteDatasetInvariantViolations(read.dataset), []);
    assert.ok(isUnstartedLiteDataset(read.dataset));
    assert.equal(read.dataset.currentSessionId, NO_SESSION_ID, "a failed read must never look like a start");

    // This boolean is the whole point: the UI probes BEFORE offering Start and
    // renders the approved pre-start explanation from `content/trust-forward/`
    // instead of letting a learner answer five cases and lose them on reload.
    assert.equal(storageAvailable(), false);

    // Every other browser-touching entry point degrades the same way.
    const write = writeLiteState(started(T0), T0);
    assert.equal(write.persisted, false);
    assert.equal(write.dataset.versionManifest.appVersion, "1.0.0", "the caller still gets the sanitized dataset");
    assert.equal(clearLiteState(T0).cleared, false);
    assert.equal(replaceLiteDataset(manifest, { now: T0, makeSessionId: ids(SESSION_ID_PREFIX) }).persisted, false);
    assert.equal(updateLiteState((current) => current, T0).persisted, false);
  });
});

test("a storage object whose setItem throws is survivable, and the probe reports it", () => {
  // Safari can hand back a `Storage` that reads fine and refuses every write,
  // so availability is not the same question as readability. The probe writes.
  const quotaBound = {
    length: 0,
    clear() {},
    getItem: () => null,
    key: () => null,
    removeItem() {},
    setItem() {
      throw new Error("QuotaExceededError");
    }
  } as unknown as Storage;

  withWindow(quotaBound, () => {
    assert.equal(storageAvailable(), false, "a store that cannot be written to is not available");
    const read = readLiteState(T0);
    assert.equal(read.storageBlocked, false, "reading worked; only the write is refused");
    assert.deepEqual(read.dataset, emptyLiteDataset(T0));

    const write = writeLiteState(appendEvent(started(T0), navigated, { now: T0 }), T0);
    assert.equal(write.persisted, false, "the course keeps working in memory");
    assert.equal(write.dataset.ledger.length, 1, "the caller renders what it holds, not nothing");
  });
});

test("a getItem that throws mid-read falls back rather than propagating", () => {
  const hostile = {
    length: 0,
    clear() {},
    getItem() {
      throw new Error("SecurityError");
    },
    key: () => null,
    removeItem() {},
    setItem() {}
  } as unknown as Storage;

  withWindow(hostile, () => {
    const read = readLiteState(T0);
    assert.equal(read.storageBlocked, true);
    assert.deepEqual(read.dataset, emptyLiteDataset(T0));
  });
});

test("there is no window at all on the server, and nothing throws", () => {
  assert.equal(typeof globalRef.window, "undefined", "the runner must start with no window");
  assert.equal(storageAvailable(), false);
  const read = readLiteState(T0);
  assert.equal(read.storageBlocked, true);
  assert.deepEqual(read.dataset, emptyLiteDataset(T0));
  assert.equal(writeLiteState(started(T0), T0).persisted, false);
  assert.equal(clearLiteState(T0).cleared, false);
});

test("an unparseable blob resolves to a clean empty dataset, not a repaired one", () => {
  withWindow(fakeStorage({ [TRUST_FORWARD_LITE_STORAGE_KEY]: "{ this is not json" }), () => {
    const read = readLiteState(T0);
    assert.equal(read.storageBlocked, false, "the browser worked; the CONTENT was bad");
    assert.deepEqual(read.dropped, ["<unparseable>"]);
    assert.deepEqual(read.dataset, emptyLiteDataset(T0));
    assert.ok(isUnstartedLiteDataset(read.dataset));
  });
});

test("a working browser round-trips the ledger through the one storage key", () => {
  const store = fakeStorage();
  withWindow(store, () => {
    const mint = ids(SESSION_ID_PREFIX);
    const dataset = appendEvents(started(T0, mint), [navigated, { type: "case_reached", caseNumber: 1 }], {
      now: T0
    });

    assert.equal(storageAvailable(), true);
    assert.equal(writeLiteState(dataset, T0).persisted, true);

    const read = readLiteState(T0);
    assert.equal(read.storageBlocked, false);
    assert.deepEqual(read.dropped, []);
    assert.deepEqual(
      read.dataset.ledger.map((event: LedgerEvent) => [event.sequence, event.type]),
      [
        [1, "navigated"],
        [2, "case_reached"]
      ]
    );
    assert.equal(read.dataset.currentSessionId, dataset.currentSessionId);
    assert.deepEqual(liteDatasetInvariantViolations(read.dataset), []);

    // Exactly one key, and the probe key it writes is cleaned up after itself.
    assert.deepEqual(
      Object.keys(JSON.parse(store.getItem(TRUST_FORWARD_LITE_STORAGE_KEY) as string)).sort(),
      [...LITE_TOP_LEVEL_FIELDS].sort()
    );
    assert.equal(store.length, 1, "storageAvailable left its probe key behind");

    // And a clear takes this product's key and nothing else.
    store.setItem("wys:progress", "not ours");
    assert.equal(clearLiteState(T0).cleared, true);
    assert.equal(store.getItem(TRUST_FORWARD_LITE_STORAGE_KEY), null);
    assert.equal(store.getItem("wys:progress"), "not ours", "a Trust Forward clear touched another product's key");
  });
});
