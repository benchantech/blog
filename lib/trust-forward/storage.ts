/**
 * Trust Forward Lite — the local storage substrate (plan §6.2;
 * `config/trust-forward-lite.v1.json` → `storage.key`).
 *
 * Pure TypeScript. No React, no JSX, no CSS import, no component import. That
 * is a hard requirement, not a style preference: `package.json` runs the suite
 * as `node --import tsx --test tests/*.test.ts`, and Node cannot load a `.css`
 * specifier, so a module that reaches a stylesheet takes its whole test file
 * down with `ERR_UNKNOWN_FILE_EXTENSION`. The consuming hook is
 * `components/trust-forward/LiteSandbox.tsx`; everything load-bearing lives
 * here so it can be unit-tested without a renderer.
 *
 * This module is `lib/wys/local-state.ts` applied to a second product, and it
 * keeps that module's two structural properties for the same two reasons.
 *
 *  1. **A learner dossier is impossible, because minimisation is enforced IN
 *     THE SERIALIZER.** Not at call sites, not by convention. A caller
 *     physically cannot persist an undeclared key, and — the half a naive
 *     version misses — cannot accrete free text under a *declared* key either,
 *     because every free-shaped declared field carries value-domain validation.
 *     `serializeLiteState()` is the only path to the string that reaches
 *     `localStorage`, and it sanitizes first, every time.
 *
 *     THE TWO DELIBERATE EXCEPTIONS are the reflection text (`drafts[].text`
 *     and a ledger event's `text`) and the local handle. Those are declared,
 *     learner-owned free text and they **round-trip intact** — not trimmed, not
 *     truncated, not normalised — because the learner's own words appearing
 *     back in their own export is the product. What keeps them off the wire is
 *     the telemetry property allowlist (plan §8), which has no property that
 *     could carry them, and not this module.
 *
 *  2. **A `localStorage` read cannot reach the server render, and cannot throw
 *     into a blank screen.** Every browser-touching function is guarded on
 *     `typeof window` AND wrapped in `try/catch`, and returns a valid empty
 *     dataset on failure. iOS Safari in private browsing *throws* on
 *     `localStorage` access — it does not return `null` — and iPhone Safari at
 *     ~390 CSS px is the primary QA target. `TEST_PLAN.md` requires "clear
 *     pre-start failure explanation", not a thrown error, which is what
 *     `storageAvailable()` exists for: the UI probes before Start and renders
 *     the approved explanation from `content/trust-forward/` instead of
 *     offering a course that cannot remember anything.
 *
 * WHAT THIS MODULE MAY NOT DO. It may not sweep any key it does not own.
 * `lib/wys/browser-keys.ts` registers this key with `clearedByWysClear: false`
 * and `wysOwnedKeys()` filters on the `wys:` prefix, which this key does not
 * carry — so a Watch Your Step clear cannot touch a Trust Forward ledger and
 * `clearLiteState()` here cannot touch Watch Your Step or the analytics consent
 * decision. Two products write local data on this origin and neither may erase
 * the other's.
 *
 * SCHEMA VERSION vs VERSION MANIFEST — two different things, deliberately.
 * `schemaVersion` is the version of the stored BLOB. `versionManifest` is the
 * content/logic stamp the learner is PINNED to (`VERSIONING.md`: "Existing
 * learners remain pinned to the exact stamp they started. Never silently
 * migrate."). This module refuses to guess at either: an unreadable
 * `schemaVersion` resolves to a clean empty dataset rather than a repaired one,
 * and the manifest is copied through untouched for the version module to
 * compare. Nothing here migrates a stamp.
 */

import {
  NO_SESSION_ID,
  highestSequence,
  isIdToken,
  isLocalTimestamp,
  ledgerInvariantViolations,
  makeLocalTimestamp,
  sanitizeLedgerEvent
} from "@/lib/trust-forward/ledger";
import { newSessionId } from "@/lib/trust-forward/session";
import { DECISION_IDS, type DecisionId, type LedgerEvent, type LiteDataset, type ReflectionDraft } from "@/lib/trust-forward/types";

/* -------------------------------------------------------------------------- */
/* 1. The key and the schema version                                           */
/* -------------------------------------------------------------------------- */

/**
 * Exactly `storage.key` from the stamped config, and exactly the literal
 * `lib/wys/browser-keys.ts` registers as `TRUST_FORWARD_STORAGE_KEY` so
 * `/privacy`, `/cookies` and the Data page name it without a hand edit.
 *
 * The literal is repeated in the registry rather than imported from here, the
 * same way `CONSENT_STORAGE_KEY` repeats `components/ConsentBanner.tsx`'s
 * literal: the registry must stay importable from surfaces that have no
 * business pulling in a product's storage module, and a test asserts the two
 * spellings agree. Do not change either without changing both — a renamed key
 * is a silently abandoned learner dataset.
 */
export const TRUST_FORWARD_LITE_STORAGE_KEY = "benchantech:trust-forward-lite:state";

/** The version of the stored blob. Not the content stamp. */
export const LITE_SCHEMA_VERSION = 1 as const;

/** The declared top-level fields of `LiteDataset`. The allowlist is total over this list. */
export type LiteTopLevelField = keyof LiteDataset;

export const LITE_TOP_LEVEL_FIELDS: readonly LiteTopLevelField[] = [
  "schemaVersion",
  "versionManifest",
  "createdAtLocal",
  "lastActivityAtLocal",
  "currentSessionId",
  "sequence",
  "ledger",
  "handle",
  "drafts",
  "reflectionsSuppressed"
];

/** Declared keys level by level. Anything not listed is dropped on write. */
export const LITE_DECLARED_KEYS = {
  root: LITE_TOP_LEVEL_FIELDS,
  draft: ["decisionId", "text"]
} as const;

/* -------------------------------------------------------------------------- */
/* 2. Value domains                                                            */
/* -------------------------------------------------------------------------- */

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * A manifest key names a versioned artefact (`appVersion`, `receiptsVersion`);
 * a manifest value is a version stamp that starts with a digit (`1.0.0`). Both
 * are identifier-shaped, so a sentence cannot ride into the export inside the
 * one field the Full importer reads to decide whether it recognises this
 * dataset at all.
 */
const MANIFEST_KEY = /^[A-Za-z][A-Za-z0-9]{0,63}$/;
const MANIFEST_VALUE = /^[0-9][0-9A-Za-z.-]{0,31}$/;

function isDecisionId(value: unknown): value is DecisionId {
  return typeof value === "string" && (DECISION_IDS as readonly string[]).includes(value);
}

/* -------------------------------------------------------------------------- */
/* 3. The empty dataset                                                        */
/* -------------------------------------------------------------------------- */

/**
 * A valid, always-renderable dataset. Also the blocked-storage answer, which is
 * why it must never throw: it mints no id and touches no browser API.
 *
 * `currentSessionId` is `NO_SESSION_ID` and `versionManifest` is empty, which
 * together mean "not started". Minting a session id here would call `crypto` on
 * a path that runs during a failed read — including on the server — and a read
 * that fails must degrade, never throw.
 */
export function emptyLiteDataset(now: Date = new Date()): LiteDataset {
  const stamp = makeLocalTimestamp(now);
  return {
    schemaVersion: LITE_SCHEMA_VERSION,
    versionManifest: {},
    createdAtLocal: stamp,
    lastActivityAtLocal: stamp,
    currentSessionId: NO_SESSION_ID,
    sequence: 0,
    ledger: [],
    handle: null,
    drafts: [],
    reflectionsSuppressed: false
  };
}

/** True for a dataset nobody has started: no pinned stamp, no session, no events. */
export function isUnstartedLiteDataset(dataset: LiteDataset): boolean {
  return (
    dataset.ledger.length === 0 &&
    dataset.currentSessionId === NO_SESSION_ID &&
    Object.keys(dataset.versionManifest).length === 0
  );
}

/**
 * First Start pins the exact stamp (`VERSIONING.md`) and mints the first local
 * session id. Separated from `emptyLiteDataset()` precisely because pinning is
 * an event in the learner's history and a fallback is not — a failed read must
 * never look like a start.
 */
export function startLiteDataset(
  versionManifest: Record<string, string>,
  options: { now?: Date; makeSessionId?: () => string } = {}
): LiteDataset {
  const now = options.now ?? new Date();
  const mint = options.makeSessionId ?? newSessionId;
  const { dataset } = sanitizeLiteDataset(
    { ...emptyLiteDataset(now), versionManifest, currentSessionId: mint() },
    now
  );
  return dataset;
}

/* -------------------------------------------------------------------------- */
/* 4. The serializer's write-side allowlist                                    */
/* -------------------------------------------------------------------------- */

export interface LiteSanitizeResult {
  dataset: LiteDataset;
  /** Dot-paths of everything the serializer refused to persist. Diagnostic only. */
  dropped: string[];
}

function undeclared(
  input: Record<string, unknown>,
  declared: readonly string[],
  dropped: string[],
  at: string
): void {
  for (const key of Object.keys(input)) {
    if (!declared.includes(key)) dropped.push(at ? `${at}.${key}` : key);
  }
}

function sanitizeManifest(input: unknown, dropped: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  if (!isPlainObject(input)) {
    if (input !== undefined) dropped.push("versionManifest");
    return out;
  }
  for (const [key, value] of Object.entries(input)) {
    if (!MANIFEST_KEY.test(key) || typeof value !== "string" || !MANIFEST_VALUE.test(value)) {
      dropped.push(`versionManifest.${key}`);
      continue;
    }
    out[key] = value;
  }
  return out;
}

/**
 * Drafts are keyed by decision, one per decision, last write wins.
 *
 * `text` is a declared free-text exception and round-trips intact. The
 * SURROUNDING field is still domain-checked: a draft whose `decisionId` is not
 * one of the eleven is dropped whole, so a sentence cannot be persisted under
 * an invented decision key and then re-read as a decision the learner made.
 */
function sanitizeDrafts(input: unknown, dropped: string[]): ReflectionDraft[] {
  if (!Array.isArray(input)) {
    if (input !== undefined) dropped.push("drafts");
    return [];
  }
  const byDecision = new Map<DecisionId, ReflectionDraft>();
  for (const [index, raw] of input.entries()) {
    if (!isPlainObject(raw)) {
      dropped.push(`drafts[${index}]`);
      continue;
    }
    undeclared(raw, LITE_DECLARED_KEYS.draft, dropped, `drafts[${index}]`);
    if (!isDecisionId(raw.decisionId) || typeof raw.text !== "string") {
      dropped.push(`drafts[${index}]`);
      continue;
    }
    byDecision.set(raw.decisionId, { decisionId: raw.decisionId, text: raw.text });
  }
  // Emitted in the contract's decision order, not in storage order, so two
  // datasets holding the same drafts serialize to the same bytes.
  return DECISION_IDS.filter((id) => byDecision.has(id)).map((id) => byDecision.get(id) as ReflectionDraft);
}

/**
 * Sanitize every event through `./ledger.ts`'s single gate, then ENFORCE THE
 * INVARIANTS the ledger promises: unique `eventId`, strictly increasing
 * sequence.
 *
 * A blob that violates them is not merely untidy — `appendEvent()` derives the
 * next sequence from the ledger, so a duplicate sequence read back from storage
 * would propagate into every event after it and corrupt the ordering the whole
 * active-path derivation depends on. A duplicate id or an out-of-order event is
 * therefore dropped and recorded, and the dataset that comes back is one the
 * ledger's own invariant check passes.
 */
function sanitizeLedger(input: unknown, dropped: string[]): LedgerEvent[] {
  if (!Array.isArray(input)) {
    if (input !== undefined) dropped.push("ledger");
    return [];
  }
  const out: LedgerEvent[] = [];
  const seenIds = new Set<string>();
  let previousSequence = -1;
  for (const [index, raw] of input.entries()) {
    const { event, dropped: eventDropped } = sanitizeLedgerEvent(raw, `ledger[${index}]`);
    dropped.push(...eventDropped);
    if (!event) continue;
    if (seenIds.has(event.eventId)) {
      dropped.push(`ledger[${index}].eventId`);
      continue;
    }
    if (event.sequence <= previousSequence) {
      dropped.push(`ledger[${index}].sequence`);
      continue;
    }
    seenIds.add(event.eventId);
    previousSequence = event.sequence;
    out.push(event);
  }
  return out;
}

/**
 * THE guard. Every write path in this module goes through here, so minimisation
 * is a property of the serializer rather than a rule call sites must remember.
 */
export function sanitizeLiteDataset(input: unknown, now: Date = new Date()): LiteSanitizeResult {
  const dropped: string[] = [];
  if (!isPlainObject(input)) {
    if (input !== undefined && input !== null) dropped.push("<root>");
    return { dataset: emptyLiteDataset(now), dropped };
  }

  undeclared(input, LITE_DECLARED_KEYS.root, dropped, "");

  const fallback = emptyLiteDataset(now);
  const ledger = sanitizeLedger(input.ledger, dropped);

  const dataset: LiteDataset = {
    schemaVersion: LITE_SCHEMA_VERSION,
    versionManifest: sanitizeManifest(input.versionManifest, dropped),
    createdAtLocal: fallback.createdAtLocal,
    lastActivityAtLocal: fallback.lastActivityAtLocal,
    currentSessionId: NO_SESSION_ID,
    sequence: 0,
    ledger,
    handle: null,
    drafts: sanitizeDrafts(input.drafts, dropped),
    reflectionsSuppressed: input.reflectionsSuppressed === true
  };

  if (input.reflectionsSuppressed !== undefined && typeof input.reflectionsSuppressed !== "boolean") {
    dropped.push("reflectionsSuppressed");
  }

  if (input.createdAtLocal !== undefined) {
    if (isLocalTimestamp(input.createdAtLocal)) dataset.createdAtLocal = input.createdAtLocal;
    else dropped.push("createdAtLocal");
  }
  if (input.lastActivityAtLocal !== undefined) {
    if (isLocalTimestamp(input.lastActivityAtLocal)) dataset.lastActivityAtLocal = input.lastActivityAtLocal;
    else dropped.push("lastActivityAtLocal");
  }
  if (input.currentSessionId !== undefined) {
    if (input.currentSessionId === NO_SESSION_ID || isIdToken(input.currentSessionId)) {
      dataset.currentSessionId = input.currentSessionId as string;
    } else {
      dropped.push("currentSessionId");
    }
  }

  // The second deliberate free-text exception. `null` is "stay incognito", a
  // string is the learner's own handle, and it round-trips exactly as typed.
  if (input.handle !== undefined && input.handle !== null) {
    if (typeof input.handle === "string") dataset.handle = input.handle;
    else dropped.push("handle");
  }

  // The counter can only ever be repaired UPWARD. Trusting a stored counter
  // that sits below its own ledger would hand the next event a sequence that
  // already exists; the invariant is "never reused", so the ledger wins.
  const ledgerHigh = highestSequence(ledger);
  if (input.sequence !== undefined) {
    if (typeof input.sequence === "number" && Number.isInteger(input.sequence) && input.sequence >= 0) {
      dataset.sequence = input.sequence;
    } else {
      dropped.push("sequence");
    }
  }
  if (dataset.sequence < ledgerHigh) {
    if (input.sequence !== undefined) dropped.push("sequence");
    dataset.sequence = ledgerHigh;
  }

  return { dataset, dropped };
}

/** True only when nothing had to be dropped. */
export function validateLiteDataset(input: unknown, now: Date = new Date()): { valid: boolean; dropped: string[] } {
  const { dropped } = sanitizeLiteDataset(input, now);
  return { valid: dropped.length === 0, dropped };
}

/** The ledger invariants, checked on a whole dataset. Empty means clean. */
export function liteDatasetInvariantViolations(dataset: LiteDataset): string[] {
  const violations = ledgerInvariantViolations(dataset.ledger);
  if (dataset.sequence < highestSequence(dataset.ledger)) {
    violations.push("dataset.sequence is behind the highest ledger sequence");
  }
  return violations;
}

/* -------------------------------------------------------------------------- */
/* 5. parse / migrate / serialize                                              */
/* -------------------------------------------------------------------------- */

/**
 * v1 is the only blob schema that exists. A payload this build cannot read is
 * not guessed at — it resolves to `null` and the caller falls back to a clean
 * empty dataset. Guessing is the one way a stale shape could smuggle undeclared
 * keys past the allowlist, and it is also how a learner pinned to an older
 * content stamp would get silently migrated, which `VERSIONING.md` forbids.
 */
export function migrateLiteState(input: unknown): Record<string, unknown> | null {
  if (!isPlainObject(input)) return null;
  const version = input.schemaVersion;
  if (version === undefined) return { ...input, schemaVersion: LITE_SCHEMA_VERSION };
  if (version === LITE_SCHEMA_VERSION) return { ...input };
  return null;
}

export function parseLiteState(raw: string | null | undefined, now: Date = new Date()): LiteSanitizeResult {
  if (typeof raw !== "string" || raw.length === 0) return { dataset: emptyLiteDataset(now), dropped: [] };
  let decoded: unknown;
  try {
    decoded = JSON.parse(raw);
  } catch {
    return { dataset: emptyLiteDataset(now), dropped: ["<unparseable>"] };
  }
  const migrated = migrateLiteState(decoded);
  if (migrated === null) return { dataset: emptyLiteDataset(now), dropped: ["<unmigratable>"] };
  return sanitizeLiteDataset(migrated, now);
}

/** Sanitize, then stringify. There is no path to storage that skips the guard. */
export function serializeLiteState(input: unknown, now: Date = new Date()): string {
  return JSON.stringify(sanitizeLiteDataset(input, now).dataset);
}

/* -------------------------------------------------------------------------- */
/* 6. Hydration-safe browser access                                            */
/* -------------------------------------------------------------------------- */

/**
 * Never call this during render. Server render and first client render must
 * produce byte-identical HTML, so every caller reads inside an effect behind a
 * `loaded: false` sentinel in `components/trust-forward/LiteSandbox.tsx`. The
 * `typeof window` guard here is a second line, not the contract.
 */
function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    // iOS Safari private browsing / "block all cookies" throws on ACCESS, not
    // on read. The guard has to wrap the property lookup itself.
    return null;
  }
}

/**
 * The probe the UI runs BEFORE offering Start.
 *
 * `TEST_PLAN.md`: "localStorage unavailable => clear pre-start failure
 * explanation." A learner whose browser cannot keep the ledger would otherwise
 * answer five cases and lose them at the first reload, so the honest surface is
 * an explanation before the first case rather than a blank screen after the
 * last one. Writes and removes a probe key because availability is not the same
 * question as readability: Safari can hand back a `Storage` object that throws
 * `QuotaExceededError` on every `setItem`.
 *
 * The probe key carries this product's namespace so it can never be mistaken
 * for, or swept with, another product's keys.
 */
export function storageAvailable(): boolean {
  const store = storage();
  if (!store) return false;
  try {
    const probe = `${TRUST_FORWARD_LITE_STORAGE_KEY}:probe`;
    store.setItem(probe, "1");
    store.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export interface LiteReadResult extends LiteSanitizeResult {
  /** True when storage threw or is unavailable — the empty dataset is a fallback, not the learner's. */
  storageBlocked: boolean;
}

export function readLiteState(now: Date = new Date()): LiteReadResult {
  const store = storage();
  if (!store) return { dataset: emptyLiteDataset(now), dropped: [], storageBlocked: true };
  try {
    const parsed = parseLiteState(store.getItem(TRUST_FORWARD_LITE_STORAGE_KEY), now);
    return { ...parsed, storageBlocked: false };
  } catch {
    return { dataset: emptyLiteDataset(now), dropped: [], storageBlocked: true };
  }
}

export interface LiteWriteResult extends LiteSanitizeResult {
  /** False when the browser refused the write. The course keeps working in memory. */
  persisted: boolean;
}

/**
 * Returns the dataset that was actually persisted, so a caller renders what is
 * stored rather than what it hoped to store.
 */
export function writeLiteState(input: unknown, now: Date = new Date()): LiteWriteResult {
  const { dataset, dropped } = sanitizeLiteDataset(input, now);
  const store = storage();
  if (!store) return { dataset, dropped, persisted: false };
  try {
    store.setItem(TRUST_FORWARD_LITE_STORAGE_KEY, JSON.stringify(dataset));
    return { dataset, dropped, persisted: true };
  } catch {
    // Quota exceeded, or a storage-restricted browser.
    return { dataset, dropped, persisted: false };
  }
}

/** Read, transform, write. The transform sees the sanitized dataset, never raw JSON. */
export function updateLiteState(
  change: (current: LiteDataset) => LiteDataset,
  now: Date = new Date()
): LiteWriteResult {
  const current = readLiteState(now).dataset;
  return writeLiteState(change(current), now);
}

/**
 * Removes THIS product's key and nothing else.
 *
 * Deliberately not a prefix sweep. `benchantech:` is a site-wide namespace, and
 * a sweep of it would erase whatever a future surface stores there; the Watch
 * Your Step clear is prefix-based only because `wys:` is that product's own
 * prefix. Also deliberately does not touch `bct_analytics_consent`: silently
 * wiping it would reset a legally-referenced decision and re-prompt the
 * visitor, which is not what "start over" means.
 *
 * Reset and version-switch are both two-step, learner-confirmed operations
 * (`VERSIONING.md`), and both are the CALLER's to confirm — this function is
 * the mechanism, never the decision.
 */
export function clearLiteState(now: Date = new Date()): { dataset: LiteDataset; cleared: boolean } {
  const store = storage();
  if (!store) return { dataset: emptyLiteDataset(now), cleared: false };
  try {
    store.removeItem(TRUST_FORWARD_LITE_STORAGE_KEY);
    return { dataset: emptyLiteDataset(now), cleared: true };
  } catch {
    return { dataset: emptyLiteDataset(now), cleared: false };
  }
}

/**
 * The single-dataset rule (`VERSIONING.md`: "switching version destroys current
 * dataset after confirmation"). One key, one dataset — there is no second slot
 * to keep the old stamp's data in, and this function makes that explicit rather
 * than leaving a caller to compose clear-then-start and get the order wrong.
 */
export function replaceLiteDataset(
  versionManifest: Record<string, string>,
  options: { now?: Date; makeSessionId?: () => string } = {}
): LiteWriteResult {
  const now = options.now ?? new Date();
  return writeLiteState(startLiteDataset(versionManifest, { now, makeSessionId: options.makeSessionId }), now);
}
