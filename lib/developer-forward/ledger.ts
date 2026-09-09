/**
 * Developer Forward Lite — the append-only local ledger (plan §6.3; ARCHITECTURE.md
 * "Runtime layers" layer 2, "Invariants").
 *
 * Pure TypeScript. No React, no JSX, no CSS import, no component import. That is
 * a hard requirement rather than a style preference: `package.json` runs the
 * suite as `node --import tsx --test tests/*.test.ts`, and Node cannot load a
 * `.css` specifier, so a module that reaches a stylesheet takes its whole test
 * file down with `ERR_UNKNOWN_FILE_EXTENSION`. Same discipline as
 * `lib/wys/local-state.ts` and `lib/wys/telemetry.ts`.
 *
 * This module ports `reference-ts/ledger.ts` from the 2026-09-07 handoff and
 * changes four things on purpose. Each change is a correction, not a preference:
 *
 *  1. **The id generator is hardened.** The reference calls
 *     `crypto.randomUUID()` unconditionally. That method exists only in a
 *     SECURE CONTEXT and is absent from older mobile Safari — which is the
 *     primary QA target — so the reference throws `randomUUID is not a
 *     function` at the first event of the first session on exactly the device
 *     this product is built for. The fallback is `crypto.getRandomValues`,
 *     **never `Math.random()`**: an `eventId` is the tie-break key for
 *     multi-tab conflict resolution (plan §6.8) and a predictable generator
 *     would make two tabs collide by construction rather than by accident. When
 *     neither source exists this module THROWS rather than degrade, and exports
 *     `randomIdSourceAvailable()` so a caller can render the approved pre-start
 *     failure explanation instead of a blank screen — the same shape
 *     `storageAvailable()` gives the storage failure in `./storage.ts`.
 *
 *  2. **Session rolling moved out of `appendEvent`.** The reference rolls the
 *     6-hour session inside the append. Here `./session.ts` owns that rule and
 *     imports this module, so the dependency runs one way and `appendEvent`
 *     holds exactly the three ledger invariants and nothing else. Callers that
 *     want the reference's combined behaviour use
 *     `appendEventInSession()` from `./session.ts`.
 *
 *  3. **The event is rebuilt key-by-key, never spread.** Same reason
 *     `lib/wys/telemetry.ts` rebuilds its props from the allowlist: a spread
 *     lets a future careless caller accrete an undeclared field on a learner
 *     record, and the field would then travel in the export. `LEDGER_EVENT_KEYS`
 *     is the closed list and `sanitizeLedgerEvent()` is the single gate both
 *     this module and the storage serializer pass through.
 *
 *  4. **The dataset field is `lastActivityAtLocal`.** The reference calls it
 *     `lastActivityAt` and declares its own local `LiteDataset`. The shared
 *     contract in `@/lib/developer-forward/types` is authoritative and is not
 *     redefined here.
 *
 * THE TIMESTAMP IS A PRIVACY DECISION. `makeLocalTimestamp()` emits a NUMERIC
 * UTC OFFSET and never a timezone name (ARCHITECTURE.md "Sessions";
 * `config/developer-forward-lite.v1.json` → `storage.timezoneNameStored: false`).
 * A name such as `Europe/Berlin` is a location signal, and this value travels
 * inside the learner's export. An offset is coarser and carries the same
 * ordering information, which is all the ledger needs.
 */

import {
  CASE_NUMBERS,
  DECISION_IDS,
  type CaseNumber,
  type DecisionId,
  type LedgerEvent,
  type LedgerEventType,
  type LiteDataset,
  type OptionId,
  OPTION_IDS
} from "@/lib/developer-forward/types";

/* -------------------------------------------------------------------------- */
/* 1. Local time with a numeric offset only                                    */
/* -------------------------------------------------------------------------- */

const pad = (value: number): string => String(value).padStart(2, "0");

/**
 * `2026-09-07T14:32:05+02:00`. Local wall-clock plus a numeric offset.
 *
 * Deliberately NOT `toISOString()`: that normalises to UTC and discards the
 * learner's local wall-clock, which is the half of this value the export is
 * actually for ("local export date", `EXPORT_SPEC.md` item 2). Deliberately not
 * `Intl.DateTimeFormat().resolvedOptions().timeZone` either — that is the
 * timezone NAME the stamp forbids storing.
 */
export function makeLocalTimestamp(now: Date = new Date()): string {
  const offsetMinutes = -now.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absolute = Math.abs(offsetMinutes);
  const offset = `${sign}${pad(Math.floor(absolute / 60))}:${pad(absolute % 60)}`;
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
    `T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}${offset}`
  );
}

/**
 * Accepts ONLY the shape `makeLocalTimestamp()` emits.
 *
 * `Z` is rejected even though it is a legal ISO-8601 offset designator: nothing
 * in this product writes it, so a `Z` in a stored blob came from a generator
 * that is not this one, and the honest response to a foreign timestamp is to
 * drop the field rather than to accept a value whose provenance is unknown. A
 * bracketed IANA suffix (`…+02:00[Europe/Berlin]`) is rejected for the stronger
 * reason: it is the location signal the stamp forbids.
 */
const LOCAL_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;

export function isLocalTimestamp(value: unknown): value is string {
  return typeof value === "string" && LOCAL_TIMESTAMP.test(value) && !Number.isNaN(Date.parse(value));
}

/* -------------------------------------------------------------------------- */
/* 2. Identifiers                                                              */
/* -------------------------------------------------------------------------- */

export const EVENT_ID_PREFIX = "evt";

/** An identifier, not a sentence: no whitespace, bounded, prefix-qualified. */
const ID_TOKEN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$/;

export function isIdToken(value: unknown): value is string {
  return typeof value === "string" && ID_TOKEN.test(value);
}

/** True when a cryptographic random source this module will actually use exists. */
export function randomIdSourceAvailable(): boolean {
  const source: Crypto | undefined = globalThis.crypto;
  if (!source) return false;
  return typeof source.randomUUID === "function" || typeof source.getRandomValues === "function";
}

/**
 * The message a caller sees if it ignores `randomIdSourceAvailable()` and
 * appends anyway. Not learner-facing copy — a developer diagnostic; the
 * learner-facing explanation lives in `content/developer-forward/`.
 */
const NO_RANDOM_SOURCE =
  "Developer Forward Lite needs crypto.randomUUID or crypto.getRandomValues to mint a local id; Math.random is not an acceptable substitute.";

function randomUuidV4(): string {
  const source: Crypto | undefined = globalThis.crypto;

  if (source && typeof source.randomUUID === "function") {
    try {
      return source.randomUUID();
    } catch {
      // Some polyfills define the method and throw outside a secure context.
      // Fall through to the byte path rather than take the whole session down.
    }
  }

  if (source && typeof source.getRandomValues === "function") {
    const bytes = source.getRandomValues(new Uint8Array(16));
    // RFC 4122 §4.4: version 4 in the high nibble of byte 6, variant 10x in
    // byte 8. Shaping the bytes keeps the ids indistinguishable from the
    // `randomUUID()` ones already stored by a learner who upgraded browsers.
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex: string[] = [];
    for (let index = 0; index < bytes.length; index += 1) hex.push(bytes[index].toString(16).padStart(2, "0"));
    const joined = hex.join("");
    return `${joined.slice(0, 8)}-${joined.slice(8, 12)}-${joined.slice(12, 16)}-${joined.slice(16, 20)}-${joined.slice(20)}`;
  }

  throw new Error(NO_RANDOM_SOURCE);
}

/** `evt_2f1c…`. The prefix makes a stray id in a log readable without a lookup. */
export function newId(prefix: string): string {
  return `${prefix}_${randomUuidV4()}`;
}

/* -------------------------------------------------------------------------- */
/* 3. The declared event shape                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Total by construction. A `LedgerEventType` added to the contract without a
 * row here is a compile error, and a row here that is not in the contract is a
 * compile error too — which is the only way this runtime list and the type can
 * be kept from drifting apart silently.
 */
const LEDGER_EVENT_TYPE_SET: Record<LedgerEventType, true> = {
  lite_started: true,
  case_reached: true,
  decision_selected: true,
  decision_changed: true,
  reflection_draft: true,
  reflection_committed: true,
  reflection_skipped: true,
  reflection_preference_changed: true,
  handle_set: true,
  handle_changed: true,
  handle_removed: true,
  navigated: true,
  downstream_invalidated: true,
  downstream_restored: true,
  result_viewed: true,
  result_detail_viewed: true,
  export_markdown: true,
  export_json: true,
  copy_summary: true,
  reset: true,
  newer_version_detected: true,
  version_switched: true
};

export const LEDGER_EVENT_TYPES = Object.keys(LEDGER_EVENT_TYPE_SET) as readonly LedgerEventType[];

export function isLedgerEventType(value: unknown): value is LedgerEventType {
  return typeof value === "string" && value in LEDGER_EVENT_TYPE_SET;
}

/**
 * The closed key list, in contract order. Anything not on it is dropped —
 * by `sanitizeLedgerEvent()` on the way in from storage, and by
 * `appendEvent()` on the way in from a caller.
 */
export const LEDGER_EVENT_KEYS: readonly (keyof LedgerEvent)[] = [
  "eventId",
  "sequence",
  "type",
  "localTimestamp",
  "sessionId",
  "caseNumber",
  "decisionId",
  "variantId",
  "selectedOptionId",
  "text",
  "value",
  "relatedEventId",
  "supersedesEventId"
];

/**
 * `variantId` is validated as a bounded token with no whitespace, and
 * DELIBERATELY not against the `c<n>:<axis>=<fragmentId>` grammar.
 *
 * The grammar belongs to the stamp, and pointer restoration is EXACT MATCH on
 * this string (`types.ts` §4). A regex here that is one character stricter than
 * the stamp's real fragment ids would silently drop a learner's answers on
 * load and present it as a fresh start. The minimisation goal — no sentence can
 * hide under a declared id key — is fully served by "no whitespace, bounded".
 */
const VARIANT_ID_TOKEN = /^[A-Za-z0-9:=|._-]{1,200}$/;

/**
 * A `value` is a flag or a short token; free text belongs in `text`, which is
 * the ONE declared free-text field on an event (`types.ts`: "Learner-authored
 * free text. Declared, local-only, never scored, never sent."). Without this
 * domain, `value` is a second free-text field wearing a permitted name — the
 * exact hole `lib/wys/local-state.ts` §7.2 closes on its own bare-string keys.
 */
const VALUE_TOKEN = /^[A-Za-z0-9._:@+-]{0,64}$/;

function isCaseNumber(value: unknown): value is CaseNumber {
  return typeof value === "number" && (CASE_NUMBERS as readonly number[]).includes(value);
}

function isDecisionId(value: unknown): value is DecisionId {
  return typeof value === "string" && (DECISION_IDS as readonly string[]).includes(value);
}

function isOptionId(value: unknown): value is OptionId {
  return typeof value === "string" && (OPTION_IDS as readonly string[]).includes(value);
}

/**
 * A session id is local-only, so a dataset that has not been started yet
 * carries the empty string rather than a minted id. See `./storage.ts`.
 */
export const NO_SESSION_ID = "";

function isSessionId(value: unknown): value is string {
  return value === NO_SESSION_ID || isIdToken(value);
}

/* -------------------------------------------------------------------------- */
/* 4. sanitizeLedgerEvent — the single gate                                    */
/* -------------------------------------------------------------------------- */

export interface LedgerEventSanitizeResult {
  /** `null` when a required field is missing or out of domain; the event is dropped whole. */
  event: LedgerEvent | null;
  /** Dot-paths of everything refused. Diagnostic only. */
  dropped: string[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Rebuild an event key by key from `LEDGER_EVENT_KEYS`, validating each value
 * against its domain. The five identity fields are REQUIRED — an event missing
 * one cannot participate in the invariants, so it is dropped whole rather than
 * repaired into something the learner never did. Every optional field is
 * dropped INDIVIDUALLY: a malformed `variantId` must not cost the learner the
 * record that they answered at all.
 *
 * The returned event is frozen. "Events immutable" is a stated invariant
 * (ARCHITECTURE.md), and in an ES module — which is always strict mode — a
 * write to a frozen object throws rather than silently succeeding.
 */
export function sanitizeLedgerEvent(input: unknown, at = "event"): LedgerEventSanitizeResult {
  const dropped: string[] = [];
  if (!isPlainObject(input)) return { event: null, dropped: [at] };

  for (const key of Object.keys(input)) {
    if (!(LEDGER_EVENT_KEYS as readonly string[]).includes(key)) dropped.push(`${at}.${key}`);
  }

  const { eventId, sequence, type, localTimestamp, sessionId } = input;
  if (
    !isIdToken(eventId) ||
    typeof sequence !== "number" ||
    !Number.isInteger(sequence) ||
    sequence < 0 ||
    !isLedgerEventType(type) ||
    !isLocalTimestamp(localTimestamp) ||
    !isSessionId(sessionId)
  ) {
    return { event: null, dropped: [...dropped, at] };
  }

  const event: LedgerEvent = { eventId, sequence, type, localTimestamp, sessionId };

  if (input.caseNumber !== undefined) {
    if (isCaseNumber(input.caseNumber)) event.caseNumber = input.caseNumber;
    else dropped.push(`${at}.caseNumber`);
  }
  if (input.decisionId !== undefined) {
    if (isDecisionId(input.decisionId)) event.decisionId = input.decisionId;
    else dropped.push(`${at}.decisionId`);
  }
  if (input.variantId !== undefined) {
    if (typeof input.variantId === "string" && VARIANT_ID_TOKEN.test(input.variantId)) {
      event.variantId = input.variantId;
    } else {
      dropped.push(`${at}.variantId`);
    }
  }
  if (input.selectedOptionId !== undefined) {
    if (isOptionId(input.selectedOptionId)) event.selectedOptionId = input.selectedOptionId;
    else dropped.push(`${at}.selectedOptionId`);
  }
  // The deliberate free-text exception. It round-trips INTACT: not trimmed, not
  // truncated, not normalised. What keeps it off the wire is the telemetry
  // allowlist, not this function.
  if (input.text !== undefined) {
    if (typeof input.text === "string") event.text = input.text;
    else dropped.push(`${at}.text`);
  }
  if (input.value !== undefined) {
    const value = input.value;
    if (typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value))) {
      event.value = value;
    } else if (typeof value === "string" && VALUE_TOKEN.test(value)) {
      event.value = value;
    } else {
      dropped.push(`${at}.value`);
    }
  }
  if (input.relatedEventId !== undefined) {
    if (isIdToken(input.relatedEventId)) event.relatedEventId = input.relatedEventId;
    else dropped.push(`${at}.relatedEventId`);
  }
  if (input.supersedesEventId !== undefined) {
    if (isIdToken(input.supersedesEventId)) event.supersedesEventId = input.supersedesEventId;
    else dropped.push(`${at}.supersedesEventId`);
  }

  return { event: Object.freeze(event), dropped };
}

/* -------------------------------------------------------------------------- */
/* 5. The invariants                                                           */
/* -------------------------------------------------------------------------- */

/** The highest sequence any event carries, or 0 for an empty ledger. */
export function highestSequence(ledger: readonly LedgerEvent[]): number {
  let highest = 0;
  for (const event of ledger) if (event.sequence > highest) highest = event.sequence;
  return highest;
}

/**
 * ARCHITECTURE.md "Invariants": sequence strictly increases, `eventId` unique,
 * events immutable. Returns the violations rather than throwing, so
 * `./storage.ts` can repair a corrupted blob on load and a test can assert an
 * exact list.
 */
export function ledgerInvariantViolations(ledger: readonly LedgerEvent[]): string[] {
  const violations: string[] = [];
  const seenIds = new Set<string>();
  let previous = -1;
  for (const [index, event] of ledger.entries()) {
    if (seenIds.has(event.eventId)) violations.push(`ledger[${index}].eventId is not unique`);
    seenIds.add(event.eventId);
    if (event.sequence <= previous) violations.push(`ledger[${index}].sequence does not strictly increase`);
    previous = event.sequence;
  }
  return violations;
}

/* -------------------------------------------------------------------------- */
/* 6. appendEvent                                                              */
/* -------------------------------------------------------------------------- */

/** The caller supplies the meaning; this module supplies the identity. */
export type LedgerEventInput = Omit<LedgerEvent, "eventId" | "sequence" | "localTimestamp" | "sessionId">;

export interface AppendEventOptions {
  /**
   * Injected so the behaviour is unit-testable. Every function in this module
   * and in `./session.ts` takes `now` rather than reading the clock, because a
   * 6-hour rollover rule that can only be observed by waiting six hours is a
   * rule nothing can test.
   */
  now?: Date;
  /** Supplied by `./session.ts` when the 6-hour rule rolls the session. */
  sessionId?: string;
  /** Injected only by tests that need a deterministic ledger. Uniqueness is still enforced. */
  eventId?: string;
}

/**
 * Append one event and return a NEW dataset. Never mutates its argument: the
 * ledger is the immutable substrate the whole active-path derivation rests on
 * (ARCHITECTURE.md "Exact history vs active path" — "The ledger is never
 * rewritten"), and an in-place push would let a React render that ran twice
 * record the learner's decision twice.
 *
 * The next sequence is `max(dataset.sequence, highest ledger sequence) + 1`,
 * not `dataset.sequence + 1` as in the reference. A dataset whose counter has
 * fallen behind its own ledger is reachable — a second tab writes the key while
 * this tab holds an older snapshot in memory (plan §6.8) — and taking the
 * maximum is the only choice that cannot REUSE a sequence. The reference's
 * form would hand out a duplicate and break the invariant that orders the
 * learner's history.
 */
export function appendEvent(
  dataset: LiteDataset,
  event: LedgerEventInput,
  options: AppendEventOptions = {}
): LiteDataset {
  const now = options.now ?? new Date();
  const localTimestamp = makeLocalTimestamp(now);
  const sessionId = options.sessionId ?? dataset.currentSessionId;
  const sequence = Math.max(dataset.sequence, highestSequence(dataset.ledger)) + 1;
  const eventId = options.eventId ?? newId(EVENT_ID_PREFIX);

  for (const existing of dataset.ledger) {
    if (existing.eventId === eventId) {
      throw new Error(`Ledger eventId "${eventId}" is already present; ids are unique and events are never rewritten.`);
    }
  }

  const { event: full, dropped } = sanitizeLedgerEvent(
    { ...event, eventId, sequence, localTimestamp, sessionId },
    "event"
  );
  if (!full) {
    throw new Error(`Refused to append a malformed ledger event (${dropped.join(", ") || "unknown"}).`);
  }

  return {
    ...dataset,
    sequence,
    currentSessionId: sessionId,
    lastActivityAtLocal: localTimestamp,
    ledger: [...dataset.ledger, full]
  };
}

/**
 * Append several events under one clock reading, in order. Each append sees the
 * dataset the previous one returned, so sequences stay strictly increasing and
 * a batch is indistinguishable from the same events appended one at a time.
 */
export function appendEvents(
  dataset: LiteDataset,
  events: readonly LedgerEventInput[],
  options: AppendEventOptions = {}
): LiteDataset {
  let next = dataset;
  for (const event of events) {
    // `eventId` is deliberately not forwarded: a batch cannot share one id.
    next = appendEvent(next, event, { now: options.now, sessionId: options.sessionId });
  }
  return next;
}
