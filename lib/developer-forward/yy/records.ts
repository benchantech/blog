/**
 * Developer Forward Lite — the YY decision ledger and the frozen `YYDecisionRecord`
 * (governing addendum `TRUST_FORWARD_LITE_YY_METHOD_ADDENDUM_2026-09-08.md`
 * §3 grammar, §14 closest alternative, §15 replay, §26 data model).
 *
 * Pure TypeScript. No React, no JSX, no CSS import, no component import — the
 * suite runs as `node --import tsx --test tests/*.test.ts` and Node cannot load
 * a `.css` specifier, so a module that reaches a stylesheet takes its whole
 * test file down with `ERR_UNKNOWN_FILE_EXTENSION`. Same discipline as
 * `lib/developer-forward/ledger.ts` and `lib/wys/telemetry.ts`.
 *
 * WHY THIS IS A SECOND STREAM AND NOT A FEW MORE `LedgerEventType` VALUES.
 * The Lite v1 ledger in `@/lib/developer-forward/ledger` is not extensible to YY
 * without changing the shared contract, and the mismatch is in the value
 * domains rather than in the event names: `LedgerEvent.decisionId` is validated
 * against `DECISION_IDS` (`C1D1`…`C5D3`), `selectedOptionId` against
 * `OPTION_IDS` (`A`|`B`|`C`), and `caseNumber` against `1..5`. The YY cases
 * carry `case-1-checkpoint-2`, four labels including `D`, and per-choice ids —
 * none of which that sanitizer will accept. Widening those domains would
 * loosen the guard that protects the v1 dataset for the benefit of a stream
 * that does not need it, so the v1 ledger keeps its exact domains and the YY
 * stream gets its own, stricter ones.
 *
 * What is REUSED rather than rewritten, and it is the load-bearing half:
 *
 *   - `makeLocalTimestamp()` / `isLocalTimestamp()` — the local wall-clock with
 *     a NUMERIC UTC offset and never a timezone name. That is a privacy
 *     decision (`config/developer-forward-lite.v1.json` → `timezoneNameStored:
 *     false`), and this stream travels in the same export, so it must not
 *     invent a second timestamp format with different disclosure.
 *   - `newId()` / `isIdToken()` — the hardened id generator that falls back to
 *     `crypto.getRandomValues` and never to `Math.random`, and THROWS rather
 *     than degrade when neither source exists. A `runId` minted from a
 *     predictable generator would let two replays collide by construction.
 *   - `shouldRollSession()` / `newSessionId()` — the stamped six-hour rule.
 *     One rule, one implementation; a second copy would drift.
 *   - `storageAvailable()` — the pre-Start probe that answers "can this origin
 *     store anything at all", which is an origin-level fact and not a per-key
 *     one. iOS Safari in private browsing THROWS on `localStorage` access, and
 *     iPhone Safari is the primary QA target.
 *
 * The `typeof window` + `try/catch` guard is re-stated below rather than
 * imported because `storage()` in `./storage.ts` is module-private and this
 * file may not edit that module. It is the same guard for the same reason: a
 * read that fails must degrade to a valid empty ledger, never throw into a
 * blank screen, and never run during render.
 *
 * COMMIT FREEZES THE RUN. This is the invariant the whole file exists to hold.
 * §3's grammar puts COMMIT before TIMESTAMP precisely so the learner's judgment
 * is fixed BEFORE Ben is revealed, and §29 forbids revealing Ben before COMMIT.
 * It is enforced twice, on purpose:
 *
 *   1. On the WRITE side, `appendYYEvent()` refuses a `yy_why_selected`,
 *      `yy_why_not_selected` or second `yy_committed` for a (run, checkpoint)
 *      pair that already carries a commit.
 *   2. On the READ side, `buildDecisionRecords()` ignores any such event even
 *      if it is present — because a ledger written by an older build, or
 *      merged from a second tab, is exactly the case the write guard cannot
 *      have caught.
 *
 * A guard that exists only at the write site is a guard that protects the code
 * you already wrote and nothing else.
 *
 * THE ONE THING THAT MAY LAND AFTER COMMIT IS REFLECTION. REFLECT is
 * post-reveal by the grammar (§3: it follows TIMESTAMP, and it "is not a sixth
 * YY Method stage"). It is therefore the only field a committed record may
 * still gain, and it can never alter `why`, `whyNot` or `timestamp`. The
 * asymmetry is the point: the learner may say anything they like about a
 * judgment afterwards without that judgment moving.
 *
 * REPLAY NEVER OVERWRITES (§15). `beginRun()` mints a NEW `runId` and appends
 * `yy_replay_started` carrying the run it follows. Nothing is rewritten,
 * because nothing here rewrites anything: the stream is append-only and
 * `Object.freeze` makes a stray mutation throw in module strict mode rather
 * than succeed silently. Run 1 remains historical learner evidence and Run 2
 * becomes new learner evidence, which is what lets replay show judgment
 * changing over time without pretending the first judgment never happened.
 *
 * AND REPLAY IS NOT A SECOND TUNING FORK (§11). This module never dedupes runs
 * into "the learner's answer" for a checkpoint, and it never presents a replay
 * as an additional observation. Independence counting belongs to the resonance
 * layer and it counts DISTINCT CANONICAL CHECKPOINT IDS — which is why
 * `capture.canonicalSituationId` below is the checkpoint id itself and not a
 * per-run value. The canonical situation is the same situation no matter how
 * many times it is answered.
 *
 * FREE TEXT IS CARRIED, NEVER INTERPRETED (§13, absolute). WHY prose, WHY-NOT
 * prose and reflection prose round-trip INTACT — not trimmed, not truncated,
 * not normalised — because the learner's own words coming back in their own
 * export is the product. Nothing in this module reads them: no branch, no tag,
 * no derivation depends on `text`, and `./receipts.ts` takes a parameter type
 * that has no `learnerText` field at all, so the receipt layer cannot see them
 * even by accident. What keeps them off the wire is the telemetry allowlist,
 * which has no property that could carry them.
 */

import {
  NO_SESSION_ID,
  isIdToken,
  isLocalTimestamp,
  makeLocalTimestamp,
  newId
} from "@/lib/developer-forward/ledger";
import { newSessionId, shouldRollSession } from "@/lib/developer-forward/session";
import { storageAvailable } from "@/lib/developer-forward/storage";
import {
  CHOICE_LABELS,
  type ChoiceLabel,
  type YYCheckpoint,
  type YYDecisionRecord
} from "@/lib/developer-forward/yy/types";

/* -------------------------------------------------------------------------- */
/* 1. Identifiers                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Prefixes are distinct from the v1 ledger's `evt_` and from `session_`.
 *
 * Both streams are serialised into one export, and a reader who finds a bare
 * id in a merged document has to be able to say which stream it came from
 * without a lookup. It also makes an accidental cross-stream reference — a YY
 * event id used as a v1 `relatedEventId` — visible on sight instead of
 * plausible.
 */
export const YY_EVENT_ID_PREFIX = "yyevt";
export const YY_RUN_ID_PREFIX = "run";

export function newYYEventId(): string {
  return newId(YY_EVENT_ID_PREFIX);
}

/** A fresh run. Local-only; it is the key that keeps a replay from overwriting. */
export function newRunId(): string {
  return newId(YY_RUN_ID_PREFIX);
}

function isChoiceLabel(value: unknown): value is ChoiceLabel {
  return typeof value === "string" && (CHOICE_LABELS as readonly string[]).includes(value);
}

/* -------------------------------------------------------------------------- */
/* 2. The six YY event families                                               */
/* -------------------------------------------------------------------------- */

/**
 * Six families, one per observable moment in the grammar, plus the replay
 * boundary. `yy_` prefixed so a YY event can never be mistaken for a v1
 * `LedgerEventType` in a merged export or a log line.
 *
 * There is deliberately NO `yy_run_started`. Run 1 needs no start event: its
 * `runId` is minted by `beginRun()` and stamped on its first
 * `yy_capture_reached`, and an event whose only content is "a thing began" is
 * a row that can disagree with the rows that follow it. A REPLAY does need one,
 * because "this run follows that run" is a fact no other event carries.
 */
export type YYEventType =
  | "yy_capture_reached"
  | "yy_why_selected"
  | "yy_why_not_selected"
  | "yy_committed"
  | "yy_reflected"
  | "yy_replay_started";

/** Total by construction: a family added to the union without a row here fails to compile. */
const YY_EVENT_TYPE_SET: Record<YYEventType, true> = {
  yy_capture_reached: true,
  yy_why_selected: true,
  yy_why_not_selected: true,
  yy_committed: true,
  yy_reflected: true,
  yy_replay_started: true
};

export const YY_EVENT_TYPES = Object.keys(YY_EVENT_TYPE_SET) as readonly YYEventType[];

export function isYYEventType(value: unknown): value is YYEventType {
  return typeof value === "string" && value in YY_EVENT_TYPE_SET;
}

/**
 * One append-only row.
 *
 * `text` is the ONE free-shaped field, and it is the deliberate exception
 * described in the header. Every other field is a bounded token with a
 * validated domain, so a sentence cannot ride into the learner's stored record
 * under a declared id key — the same hole `lib/wys/local-state.ts` §7.2 closes
 * on its own bare-string keys.
 */
export interface YYEvent {
  eventId: string;
  /** Strictly increasing across the whole stream. Never reused. */
  sequence: number;
  type: YYEventType;
  /** Local wall-clock with a numeric UTC offset. Never a timezone name. */
  localTimestamp: string;
  sessionId: string;
  runId: string;
  caseId: string;
  /** Absent only on `yy_replay_started`, which is about a run rather than a checkpoint. */
  checkpointId?: string;
  /** The choice selected, on `yy_why_selected` and `yy_why_not_selected`. */
  choiceId?: string;
  /** The A–D label of that choice. Stored alongside the id so a row is readable unaided. */
  choiceLabel?: ChoiceLabel;
  /** The run this replay follows. Only on `yy_replay_started`. */
  previousRunId?: string;
  /** Learner-authored free text. Declared, local-only, never scored, never interpreted, never sent. */
  text?: string;
}

/** The closed key list. Anything not on it is dropped, on the way in and on the way out. */
export const YY_EVENT_KEYS: readonly (keyof YYEvent)[] = [
  "eventId",
  "sequence",
  "type",
  "localTimestamp",
  "sessionId",
  "runId",
  "caseId",
  "checkpointId",
  "choiceId",
  "choiceLabel",
  "previousRunId",
  "text"
];

/* -------------------------------------------------------------------------- */
/* 3. sanitizeYYEvent — the single gate                                       */
/* -------------------------------------------------------------------------- */

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSessionId(value: unknown): value is string {
  return value === NO_SESSION_ID || isIdToken(value);
}

export interface YYEventSanitizeResult {
  /** `null` when a required field is missing or out of domain; the event is dropped whole. */
  event: YYEvent | null;
  /** Dot-paths of everything refused. Diagnostic only. */
  dropped: string[];
}

/**
 * Rebuild an event key by key, never by spread.
 *
 * A spread lets a future careless caller accrete an undeclared field on a
 * learner record, and the field would then travel in the export — which is the
 * same reason `lib/developer-forward/ledger.ts` rebuilds from `LEDGER_EVENT_KEYS`
 * and `lib/wys/telemetry.ts` rebuilds from its allowlist.
 *
 * The seven identity fields are REQUIRED and a row missing one is dropped
 * whole, because it cannot participate in the invariants and repairing it
 * would invent a decision the learner never made. Optional fields are dropped
 * INDIVIDUALLY: a malformed `choiceLabel` must not cost the learner the record
 * that they answered at all.
 *
 * The result is frozen. Events are immutable, and in an ES module — always
 * strict mode — a write to a frozen object throws instead of silently
 * succeeding.
 */
export function sanitizeYYEvent(input: unknown, at = "event"): YYEventSanitizeResult {
  const dropped: string[] = [];
  if (!isPlainObject(input)) return { event: null, dropped: [at] };

  for (const key of Object.keys(input)) {
    if (!(YY_EVENT_KEYS as readonly string[]).includes(key)) dropped.push(`${at}.${key}`);
  }

  const { eventId, sequence, type, localTimestamp, sessionId, runId, caseId } = input;
  if (
    !isIdToken(eventId) ||
    typeof sequence !== "number" ||
    !Number.isInteger(sequence) ||
    sequence < 0 ||
    !isYYEventType(type) ||
    !isLocalTimestamp(localTimestamp) ||
    !isSessionId(sessionId) ||
    !isIdToken(runId) ||
    !isIdToken(caseId)
  ) {
    return { event: null, dropped: [...dropped, at] };
  }

  const event: YYEvent = { eventId, sequence, type, localTimestamp, sessionId, runId, caseId };

  if (input.checkpointId !== undefined) {
    if (isIdToken(input.checkpointId)) event.checkpointId = input.checkpointId;
    else dropped.push(`${at}.checkpointId`);
  }
  if (input.choiceId !== undefined) {
    if (isIdToken(input.choiceId)) event.choiceId = input.choiceId;
    else dropped.push(`${at}.choiceId`);
  }
  if (input.choiceLabel !== undefined) {
    if (isChoiceLabel(input.choiceLabel)) event.choiceLabel = input.choiceLabel;
    else dropped.push(`${at}.choiceLabel`);
  }
  if (input.previousRunId !== undefined) {
    if (isIdToken(input.previousRunId)) event.previousRunId = input.previousRunId;
    else dropped.push(`${at}.previousRunId`);
  }
  // The deliberate exception. Round-trips INTACT — not trimmed, not truncated,
  // not normalised. Nothing in this module reads it.
  if (input.text !== undefined) {
    if (typeof input.text === "string") event.text = input.text;
    else dropped.push(`${at}.text`);
  }

  return { event: Object.freeze(event), dropped };
}

/* -------------------------------------------------------------------------- */
/* 4. The stream                                                              */
/* -------------------------------------------------------------------------- */

/** The version of the stored YY blob. Not the content stamp the learner is pinned to. */
export const YY_SCHEMA_VERSION = 1 as const;

/**
 * Its own key, carrying this product's namespace.
 *
 * It is NOT nested inside `LiteDataset`: that dataset's serializer drops every
 * undeclared top-level key by design, so a nested YY stream would be silently
 * deleted on the first v1 write. Two keys, two sanitizers, one origin.
 *
 * A key this product stores must also be declared in `lib/wys/browser-keys.ts`
 * so `/privacy`, `/cookies` and the Data page can name it without a hand edit.
 * That registry is not this file's to write; see the handoff note in the
 * implementation report.
 */
export const DEVELOPER_FORWARD_YY_STORAGE_KEY = "benchantech:developer-forward-lite:yy";

/**
 * The key this ledger used before the 2026-09-09 rebrand.
 *
 * READ ONLY, AND NEVER WRITTEN. The rename from Trust Forward to Developer
 * Forward moved the storage key with everything else, which would have
 * orphaned every run already in a learner's browser — and this ledger is the
 * one dataset in the product that must not be lost to housekeeping. Its whole
 * epistemic claim is that a judgment committed before the reveal is never
 * overwritten by anything that happens afterward; silently dropping the record
 * because the product changed its name would be that claim failing in the most
 * literal way available.
 *
 * So `readYYLedger` falls back to this key when the new one is absent, and the
 * next write lands under the new name. Nothing deletes the old entry: a browser
 * that has both keeps both, the old one simply stops being read, and a learner
 * who somehow reverts loses nothing either. The fallback is self-limiting —
 * once a run has been written under the new key the old one is never consulted
 * again — and it can be removed once enough time has passed that no unmigrated
 * browser plausibly remains.
 */
export const DEVELOPER_FORWARD_YY_LEGACY_STORAGE_KEY = "benchantech:trust-forward-lite:yy";

export interface YYLedger {
  schemaVersion: 1;
  createdAtLocal: string;
  lastActivityAtLocal: string;
  currentSessionId: string;
  /** Monotonic; the next event takes `sequence + 1`. */
  sequence: number;
  events: YYEvent[];
}

/**
 * A valid, always-renderable stream. Also the blocked-storage answer, which is
 * why it mints no id and touches no browser API: minting a session id here
 * would call `crypto` on a path that runs during a FAILED read, including on
 * the server, and a read that fails must degrade rather than throw.
 */
export function emptyYYLedger(now: Date = new Date()): YYLedger {
  const stamp = makeLocalTimestamp(now);
  return {
    schemaVersion: YY_SCHEMA_VERSION,
    createdAtLocal: stamp,
    lastActivityAtLocal: stamp,
    currentSessionId: NO_SESSION_ID,
    sequence: 0,
    events: []
  };
}

/** The highest sequence any event carries, or 0 for an empty stream. */
export function highestYYSequence(events: readonly YYEvent[]): number {
  let highest = 0;
  for (const event of events) if (event.sequence > highest) highest = event.sequence;
  return highest;
}

/**
 * Sequence strictly increases, `eventId` is unique, events are immutable.
 *
 * Returns the violations rather than throwing, so a corrupted blob can be
 * repaired on load and a test can assert an exact list.
 */
export function yyLedgerInvariantViolations(ledger: YYLedger): string[] {
  const violations: string[] = [];
  const seen = new Set<string>();
  let previous = -1;
  for (const [index, event] of ledger.events.entries()) {
    if (seen.has(event.eventId)) violations.push(`events[${index}].eventId is not unique`);
    seen.add(event.eventId);
    if (event.sequence <= previous) violations.push(`events[${index}].sequence does not strictly increase`);
    previous = event.sequence;
  }
  return violations;
}

export interface YYLedgerSanitizeResult {
  ledger: YYLedger;
  dropped: string[];
}

/**
 * Read-side repair. Every event passes `sanitizeYYEvent`; anything that fails
 * is dropped rather than guessed at, and the surviving events are re-checked
 * against the invariants so a duplicated or out-of-order row from a second tab
 * cannot poison the fold.
 */
export function sanitizeYYLedger(input: unknown, now: Date = new Date()): YYLedgerSanitizeResult {
  const dropped: string[] = [];
  if (!isPlainObject(input)) return { ledger: emptyYYLedger(now), dropped: ["<root>"] };
  if (input.schemaVersion !== undefined && input.schemaVersion !== YY_SCHEMA_VERSION) {
    // Nothing here migrates a stamp. An unreadable version resolves to a clean
    // empty stream rather than a repaired one (`VERSIONING.md`: never silently
    // migrate).
    return { ledger: emptyYYLedger(now), dropped: ["<unmigratable>"] };
  }

  const base = emptyYYLedger(now);
  const ledger: YYLedger = {
    schemaVersion: YY_SCHEMA_VERSION,
    createdAtLocal: isLocalTimestamp(input.createdAtLocal) ? input.createdAtLocal : base.createdAtLocal,
    lastActivityAtLocal: isLocalTimestamp(input.lastActivityAtLocal)
      ? input.lastActivityAtLocal
      : base.lastActivityAtLocal,
    currentSessionId: isSessionId(input.currentSessionId) ? input.currentSessionId : NO_SESSION_ID,
    sequence: 0,
    events: []
  };

  const raw = Array.isArray(input.events) ? input.events : [];
  if (!Array.isArray(input.events) && input.events !== undefined) dropped.push("events");

  let previous = -1;
  const seen = new Set<string>();
  for (const [index, candidate] of raw.entries()) {
    const result = sanitizeYYEvent(candidate, `events[${index}]`);
    dropped.push(...result.dropped);
    if (!result.event) continue;
    if (seen.has(result.event.eventId) || result.event.sequence <= previous) {
      dropped.push(`events[${index}]`);
      continue;
    }
    seen.add(result.event.eventId);
    previous = result.event.sequence;
    ledger.events.push(result.event);
  }

  const declared = typeof input.sequence === "number" && Number.isInteger(input.sequence) ? input.sequence : 0;
  // Take the maximum, never the declared counter alone: a counter that has
  // fallen behind its own stream is reachable when a second tab writes the key
  // while this tab holds an older snapshot, and reusing a sequence would break
  // the ordering the learner's history rests on.
  ledger.sequence = Math.max(declared, highestYYSequence(ledger.events));

  return { ledger, dropped };
}

/* -------------------------------------------------------------------------- */
/* 5. appendYYEvent — where COMMIT freezes the run                            */
/* -------------------------------------------------------------------------- */

/** The caller supplies the meaning; this module supplies the identity. */
export type YYEventInput = Omit<YYEvent, "eventId" | "sequence" | "localTimestamp" | "sessionId">;

export interface AppendYYEventOptions {
  /**
   * Injected so behaviour is unit-testable. Nothing here reads the clock
   * directly: a six-hour rollover whose only observable behaviour needs six
   * hours of real waiting is a rule no test can assert.
   */
  now?: Date;
  /** Injected only by tests that need a deterministic stream. Uniqueness is still enforced. */
  eventId?: string;
  /** Injected only by tests that need a deterministic session id. */
  makeSessionId?: () => string;
}

/** The freeze key. A run and a checkpoint together identify one frozen judgment. */
function pairKey(runId: string, checkpointId: string): string {
  return `${runId}\u0000${checkpointId}`;
}

/** True when this (run, checkpoint) pair already carries a COMMIT. */
export function isCheckpointCommitted(ledger: YYLedger, runId: string, checkpointId: string): boolean {
  return ledger.events.some(
    (event) => event.type === "yy_committed" && event.runId === runId && event.checkpointId === checkpointId
  );
}

/** The local timestamp a pair was committed at, or `null` if it never was. */
export function committedAtLocal(ledger: YYLedger, runId: string, checkpointId: string): string | null {
  for (const event of ledger.events) {
    if (event.type === "yy_committed" && event.runId === runId && event.checkpointId === checkpointId) {
      return event.localTimestamp;
    }
  }
  return null;
}

/** The last event of a type for a pair, or `null`. Later events win; the stream is ordered. */
function lastFor(
  ledger: YYLedger,
  type: YYEventType,
  runId: string,
  checkpointId: string,
  beforeSequence = Number.POSITIVE_INFINITY
): YYEvent | null {
  let found: YYEvent | null = null;
  for (const event of ledger.events) {
    if (event.sequence >= beforeSequence) break;
    if (event.type === type && event.runId === runId && event.checkpointId === checkpointId) found = event;
  }
  return found;
}

/**
 * Append one event and return a NEW ledger. Never mutates its argument.
 *
 * The stream is the immutable substrate every derived record rests on, and an
 * in-place push would let a React render that ran twice record the learner's
 * decision twice.
 *
 * THE GRAMMAR IS ENFORCED HERE, not left to call sites:
 *
 *   - a `yy_why_selected`, `yy_why_not_selected` or second `yy_committed`
 *     against a committed pair is REFUSED — COMMIT freezes the run;
 *   - a `yy_committed` without both a WHY and a WHY-NOT for that pair is
 *     REFUSED — §14 makes the closest alternative required by default, and a
 *     commit without one is a record that cannot be completed later, because
 *     later is after the freeze;
 *   - a WHY-NOT naming the SAME choice as the WHY is REFUSED — §11 already
 *     says the two do not count as independent evidence, and if they were also
 *     allowed to be equal the closest alternative would carry no information
 *     at all;
 *   - a `yy_reflected` BEFORE the commit is REFUSED — REFLECT follows
 *     TIMESTAMP in the grammar (§3), and prose about a judgment that is not yet
 *     frozen is a different artefact than the one the record declares.
 *
 * These throw rather than return an error union. Each is a programming error
 * in a surface, not a learner-reachable state, and the grammar is the product.
 */
export function appendYYEvent(
  ledger: YYLedger,
  event: YYEventInput,
  options: AppendYYEventOptions = {}
): YYLedger {
  const now = options.now ?? new Date();
  const localTimestamp = makeLocalTimestamp(now);
  const mintSession = options.makeSessionId ?? newSessionId;

  const sessionId =
    ledger.currentSessionId === NO_SESSION_ID || shouldRollSession(ledger.lastActivityAtLocal, now)
      ? mintSession()
      : ledger.currentSessionId;

  const sequence = Math.max(ledger.sequence, highestYYSequence(ledger.events)) + 1;
  const eventId = options.eventId ?? newYYEventId();

  for (const existing of ledger.events) {
    if (existing.eventId === eventId) {
      throw new Error(`YY eventId "${eventId}" is already present; ids are unique and events are never rewritten.`);
    }
  }

  const checkpointId = event.checkpointId;

  if (event.type === "yy_why_selected" || event.type === "yy_why_not_selected" || event.type === "yy_committed") {
    if (!checkpointId) {
      throw new Error(`A ${event.type} event must name a checkpoint.`);
    }
    if (isCheckpointCommitted(ledger, event.runId, checkpointId)) {
      throw new Error(
        `Checkpoint "${checkpointId}" is committed in run "${event.runId}"; COMMIT freezes the run. Replay it under a new runId instead.`
      );
    }
  }

  if (event.type === "yy_committed" && checkpointId) {
    const why = lastFor(ledger, "yy_why_selected", event.runId, checkpointId);
    const whyNot = lastFor(ledger, "yy_why_not_selected", event.runId, checkpointId);
    if (!why) {
      throw new Error(`Cannot commit "${checkpointId}": no WHY choice was selected in run "${event.runId}".`);
    }
    if (!whyNot) {
      throw new Error(
        `Cannot commit "${checkpointId}": no WHY-NOT closest alternative was selected in run "${event.runId}".`
      );
    }
    if (why.choiceId && whyNot.choiceId && why.choiceId === whyNot.choiceId) {
      throw new Error(
        `Cannot commit "${checkpointId}": the closest alternative is the same choice as the selection.`
      );
    }
  }

  if (event.type === "yy_why_not_selected" && checkpointId && event.choiceId) {
    const why = lastFor(ledger, "yy_why_selected", event.runId, checkpointId);
    if (why?.choiceId === event.choiceId) {
      throw new Error(
        `The closest alternative for "${checkpointId}" must differ from the selected choice.`
      );
    }
  }

  if (event.type === "yy_reflected") {
    if (!checkpointId || !isCheckpointCommitted(ledger, event.runId, checkpointId)) {
      throw new Error(
        `REFLECT follows COMMIT and TIMESTAMP; "${checkpointId ?? "(no checkpoint)"}" is not committed in run "${event.runId}".`
      );
    }
  }

  const { event: full, dropped } = sanitizeYYEvent(
    { ...event, eventId, sequence, localTimestamp, sessionId },
    "event"
  );
  if (!full) {
    throw new Error(`Refused to append a malformed YY event (${dropped.join(", ") || "unknown"}).`);
  }

  return {
    ...ledger,
    sequence,
    currentSessionId: sessionId,
    lastActivityAtLocal: localTimestamp,
    events: [...ledger.events, full]
  };
}

/* -------------------------------------------------------------------------- */
/* 6. The six recorders                                                       */
/* -------------------------------------------------------------------------- */

/**
 * The run ids present for a case, in first-appearance order.
 *
 * Derived from the stream rather than stored, because the stream is the source
 * of truth and a stored list would be a second place the same fact could be
 * wrong.
 */
export function runIdsForCase(ledger: YYLedger, caseId: string): string[] {
  const seen: string[] = [];
  for (const event of ledger.events) {
    if (event.caseId === caseId && !seen.includes(event.runId)) seen.push(event.runId);
  }
  return seen;
}

/** The most recent run for a case, or `null` when the case has never been opened. */
export function currentRunIdForCase(ledger: YYLedger, caseId: string): string | null {
  const runs = runIdsForCase(ledger, caseId);
  return runs.length === 0 ? null : runs[runs.length - 1];
}

export interface BeginRunResult {
  ledger: YYLedger;
  runId: string;
  /** True when this run follows an earlier run of the same case. */
  isReplay: boolean;
}

/**
 * Open a run of a case.
 *
 * A first run appends nothing: its `runId` is minted here and stamped on its
 * first `yy_capture_reached`, and an event whose only content is "a thing
 * began" is a row that can disagree with the rows that follow it. A REPLAY
 * appends `yy_replay_started` carrying `previousRunId`, because "this run
 * follows that run" is a fact no other event records — and it is what makes
 * the longitudinal reading in §15 possible without ever touching run 1.
 *
 * The earlier run is not modified, superseded or marked. Append-only means the
 * original judgment stays exactly where the learner left it.
 */
export function beginRun(
  ledger: YYLedger,
  caseId: string,
  options: AppendYYEventOptions & { runId?: string } = {}
): BeginRunResult {
  const previousRunId = currentRunIdForCase(ledger, caseId);
  const runId = options.runId ?? newRunId();
  if (previousRunId === null) return { ledger, runId, isReplay: false };
  return {
    ledger: appendYYEvent(ledger, { type: "yy_replay_started", runId, caseId, previousRunId }, options),
    runId,
    isReplay: true
  };
}

/** CAPTURE: the learner reached the situation as it existed at the decision point. */
export function recordCaptureReached(
  ledger: YYLedger,
  input: { runId: string; caseId: string; checkpointId: string },
  options: AppendYYEventOptions = {}
): YYLedger {
  return appendYYEvent(ledger, { type: "yy_capture_reached", ...input }, options);
}

/**
 * WHY: the structured choice, plus optional prose.
 *
 * May be called repeatedly before COMMIT — a learner changing their mind is
 * not an error, and every attempt stays in the stream. The fold takes the last
 * one before the commit, so the frozen record holds the judgment the learner
 * actually committed rather than the first one they tried.
 */
export function recordWhySelected(
  ledger: YYLedger,
  input: { runId: string; caseId: string; checkpointId: string; choiceId: string; choiceLabel?: ChoiceLabel; text?: string },
  options: AppendYYEventOptions = {}
): YYLedger {
  return appendYYEvent(ledger, { type: "yy_why_selected", ...input }, options);
}

/** WHY-NOT: the structured closest alternative (§14), plus optional prose. */
export function recordWhyNotSelected(
  ledger: YYLedger,
  input: { runId: string; caseId: string; checkpointId: string; choiceId: string; choiceLabel?: ChoiceLabel; text?: string },
  options: AppendYYEventOptions = {}
): YYLedger {
  return appendYYEvent(ledger, { type: "yy_why_not_selected", ...input }, options);
}

/**
 * COMMIT: freeze the judgment BEFORE Ben is revealed.
 *
 * This is the event `isRevealUnlocked()` is asking about. Everything the
 * learner said about this checkpoint up to now becomes historical evidence at
 * this instant, and nothing after it can move — which is the only reason the
 * record is worth anything as evidence at all.
 */
export function recordCommitted(
  ledger: YYLedger,
  input: { runId: string; caseId: string; checkpointId: string },
  options: AppendYYEventOptions = {}
): YYLedger {
  return appendYYEvent(ledger, { type: "yy_committed", ...input }, options);
}

/**
 * REFLECT: post-reveal prose. The one thing a committed record may still gain.
 *
 * It never alters `why`, `whyNot` or `timestamp`, and §13 forbids it from
 * altering a tag, a receipt or a resonance either. It is carried verbatim and
 * read by nothing.
 */
export function recordReflected(
  ledger: YYLedger,
  input: { runId: string; caseId: string; checkpointId: string; text: string },
  options: AppendYYEventOptions = {}
): YYLedger {
  return appendYYEvent(ledger, { type: "yy_reflected", ...input }, options);
}

/* -------------------------------------------------------------------------- */
/* 7. The fold: building YYDecisionRecords                                    */
/* -------------------------------------------------------------------------- */

/**
 * The canonical checkpoints, by id.
 *
 * Passed in rather than imported so this module has no dependency on
 * `content/developer-forward/yy/*`, and — the reason that matters — so Ben's THEN
 * and NOW are read from the CONTENT at fold time rather than copied into the
 * learner's stored stream at commit time. A copy would be a second place the
 * same fact lives, it would go stale the moment the content is restamped, and
 * it would put Ben's answer inside the learner's local record where a surface
 * could read it before COMMIT. Ben's judgment is not the learner's data.
 */
export type YYCheckpointIndex = ReadonlyMap<string, YYCheckpoint>;

export function checkpointIndex(checkpoints: readonly YYCheckpoint[]): YYCheckpointIndex {
  return new Map(checkpoints.map((checkpoint) => [checkpoint.id, checkpoint]));
}

function choiceIdForLabel(checkpoint: YYCheckpoint, label: ChoiceLabel): string | null {
  for (const choice of checkpoint.choices) if (choice.label === label) return choice.id;
  return null;
}

/**
 * True when Ben's NOW names a different action than his THEN.
 *
 * Exposed so a SURFACE can decide whether to show NOW — §3 reveals it "when
 * materially different" — while the record itself always carries both. This
 * module will not make that editorial call inside the stored evidence: §29
 * forbids merging THEN and NOW, and a record that silently omits NOW whenever
 * it agrees with THEN is a record where "no NOW" means two different things.
 */
export function benJudgmentChanged(checkpoint: YYCheckpoint): boolean {
  return checkpoint.benNow.choiceLabel !== checkpoint.benThen.choiceLabel;
}

export interface BuildRecordsResult {
  /** One record per committed (run, checkpoint), in stream order of the commit. */
  records: YYDecisionRecord[];
  /**
   * Pairs that committed but could not produce a record, with the reason.
   * Diagnostic only, and never silently repaired — a record assembled from a
   * broken stream would be evidence of something that did not happen.
   */
  skipped: string[];
}

/**
 * Fold the append-only stream into frozen records.
 *
 * ONLY COMMITTED PAIRS PRODUCE RECORDS. A `YYDecisionRecord` carries a required
 * `commit.committedAtLocal`, and that is not an accident of the type: an
 * uncommitted checkpoint has no frozen judgment, so there is nothing to hand
 * to a receipt, an export or a reveal. In-progress state is a question for
 * `runStage()` below, which is a different question with a different answer.
 *
 * THE READ-SIDE FREEZE. `why` and `whyNot` are taken from the last matching
 * event STRICTLY BEFORE the commit's sequence. A later selection in the stream
 * — written by an older build, or merged in from a second tab — is ignored
 * rather than trusted. `reflection` is taken from the last matching event
 * AFTER the commit, because that is the only field the grammar lets land
 * there.
 *
 * `capture.canonicalSituationId` is the checkpoint id itself. The canonical
 * situation is the same situation however many times it is answered, and that
 * identity is exactly what §11's independence rule counts — a per-run value
 * here would let three replays of one checkpoint look like three tuning forks.
 */
export function buildDecisionRecords(ledger: YYLedger, checkpoints: YYCheckpointIndex): BuildRecordsResult {
  const records: YYDecisionRecord[] = [];
  const skipped: string[] = [];
  const seen = new Set<string>();

  for (const commit of ledger.events) {
    if (commit.type !== "yy_committed" || !commit.checkpointId) continue;

    const key = pairKey(commit.runId, commit.checkpointId);
    if (seen.has(key)) {
      // The write guard refuses a second commit; a stream that carries one
      // anyway came from somewhere else, and the FIRST commit is the one that
      // froze the judgment.
      skipped.push(`${key}: duplicate commit ignored`);
      continue;
    }
    seen.add(key);

    const checkpoint = checkpoints.get(commit.checkpointId);
    if (!checkpoint) {
      skipped.push(`${key}: no canonical checkpoint "${commit.checkpointId}"`);
      continue;
    }

    const why = lastFor(ledger, "yy_why_selected", commit.runId, commit.checkpointId, commit.sequence);
    const whyNot = lastFor(ledger, "yy_why_not_selected", commit.runId, commit.checkpointId, commit.sequence);
    if (!why?.choiceId) {
      skipped.push(`${key}: committed without a WHY selection`);
      continue;
    }
    if (!whyNot?.choiceId) {
      skipped.push(`${key}: committed without a WHY-NOT closest alternative`);
      continue;
    }

    const benThenChoiceId = choiceIdForLabel(checkpoint, checkpoint.benThen.choiceLabel);
    const benNowChoiceId = choiceIdForLabel(checkpoint, checkpoint.benNow.choiceLabel);
    if (!benThenChoiceId) {
      skipped.push(`${key}: checkpoint has no choice labelled "${checkpoint.benThen.choiceLabel}" for Ben THEN`);
      continue;
    }

    const reflection = ledger.events.reduce<YYEvent | null>((found, event) => {
      if (
        event.type === "yy_reflected" &&
        event.runId === commit.runId &&
        event.checkpointId === commit.checkpointId &&
        event.sequence > commit.sequence
      ) {
        return event;
      }
      return found;
    }, null);

    const record: YYDecisionRecord = {
      caseId: commit.caseId,
      checkpointId: commit.checkpointId,
      runId: commit.runId,
      capture: { canonicalSituationId: commit.checkpointId },
      why: { choiceId: why.choiceId },
      whyNot: { closestAlternativeChoiceId: whyNot.choiceId },
      commit: { committedAtLocal: commit.localTimestamp },
      timestamp: benNowChoiceId ? { benThenChoiceId, benNowChoiceId } : { benThenChoiceId }
    };

    // Free text is attached, never inspected. It is absent rather than empty
    // when the learner supplied nothing, so "they wrote nothing" and "they
    // wrote an empty string" do not become the same fact in the export.
    if (typeof why.text === "string" && why.text.length > 0) record.why.learnerText = why.text;
    if (typeof whyNot.text === "string" && whyNot.text.length > 0) record.whyNot.learnerText = whyNot.text;
    if (reflection && typeof reflection.text === "string" && reflection.text.length > 0) {
      record.reflection = { learnerText: reflection.text };
    }

    records.push(Object.freeze(record));
  }

  return { records, skipped };
}

/**
 * Every committed record for one canonical checkpoint, oldest run first.
 *
 * This is the longitudinal view §15 describes: run 1 and run 2 side by side,
 * neither erasing the other. It is emphatically NOT a way to count evidence —
 * every record here shares one `checkpointId`, so the whole list is one tuning
 * fork struck repeatedly (§11).
 */
export function recordsForCheckpoint(records: readonly YYDecisionRecord[], checkpointId: string): YYDecisionRecord[] {
  return records.filter((record) => record.checkpointId === checkpointId);
}

/** Every committed record for one run, in commit order. */
export function recordsForRun(records: readonly YYDecisionRecord[], runId: string): YYDecisionRecord[] {
  return records.filter((record) => record.runId === runId);
}

/**
 * The distinct canonical checkpoints a set of records covers.
 *
 * The count the two-tuning-fork threshold is measured against, exposed here so
 * the resonance layer never has to re-derive it from raw events and get the
 * replay rule subtly wrong.
 */
export function distinctCheckpointIds(records: readonly YYDecisionRecord[]): string[] {
  const seen: string[] = [];
  for (const record of records) if (!seen.includes(record.checkpointId)) seen.push(record.checkpointId);
  return seen;
}

/* -------------------------------------------------------------------------- */
/* 8. The reveal gate                                                         */
/* -------------------------------------------------------------------------- */

/**
 * The structured half of a frozen record: the ids, the closest alternative, the
 * commit stamp. No `learnerText` anywhere in it, at any depth.
 *
 * A `YYDecisionRecord` is assignable to this, so callers pass whole records —
 * but a function that declares THIS as its parameter type cannot reach the
 * learner's prose even by accident, because the prose is not in scope. §13
 * ("free text is never used for Lite inference") is absolute, and the only
 * enforcement worth having for an absolute rule is one where the forbidden
 * value is unreachable rather than merely unread. `./receipts.ts` takes this
 * type for exactly that reason, and `isRevealUnlocked()` takes it so both
 * gates agree on what "committed" means without a second definition.
 */
export interface FrozenJudgment {
  readonly caseId: string;
  readonly checkpointId: string;
  readonly runId: string;
  readonly why: { readonly choiceId: string };
  readonly whyNot: { readonly closestAlternativeChoiceId: string };
  readonly commit: { readonly committedAtLocal: string };
}

/**
 * The one function every surface must pass through before it renders Ben THEN,
 * Ben NOW, or a condition.
 *
 * §29: "reveal Ben before learner COMMIT" is on the list of things this build
 * must not do, and §4's epistemic invariant is that the learner's judgment is
 * fixed before later information can contaminate it. A reveal that leaks
 * backward does not just spoil an answer — it converts the whole exercise into
 * reading comprehension, and it does so invisibly, because the learner cannot
 * tell which of their judgments was their own.
 *
 * FAILS CLOSED, AND VALIDATES STRUCTURALLY RATHER THAN TRUSTING THE TYPE. A
 * `YYDecisionRecord` produced by `buildDecisionRecords()` is committed by
 * construction, so a check of `record !== null` would be true by definition and
 * would protect nothing. The records this guard actually exists for are the
 * ones that did NOT come from the fold: a draft object assembled in a
 * component while the learner is still answering, a record parsed from an
 * imported JSON file, a partially-populated stub in a test. Each of those can
 * be shaped like a record and be missing the commit, so every field the freeze
 * depends on is checked here by value.
 *
 * The closest alternative must differ from the selection for the same reason
 * `appendYYEvent()` refuses to write them equal: if they may be equal, WHY-NOT
 * carries no evidence, and a record that carries no evidence should not be
 * unlocking anything.
 */
export function isRevealUnlocked(record: FrozenJudgment | null | undefined): boolean {
  if (!isPlainObject(record)) return false;
  const candidate = record as unknown as Record<string, unknown>;

  if (!isIdToken(candidate.caseId) || !isIdToken(candidate.checkpointId) || !isIdToken(candidate.runId)) return false;

  const why = candidate.why;
  const whyNot = candidate.whyNot;
  const commit = candidate.commit;
  if (!isPlainObject(why) || !isPlainObject(whyNot) || !isPlainObject(commit)) return false;

  if (!isIdToken(why.choiceId)) return false;
  if (!isIdToken(whyNot.closestAlternativeChoiceId)) return false;
  if (why.choiceId === whyNot.closestAlternativeChoiceId) return false;

  return isLocalTimestamp(commit.committedAtLocal);
}

/**
 * The same gate for a checkpoint the learner is still working through, where no
 * record exists yet.
 *
 * A surface asks this one BEFORE the reveal panel is rendered and
 * `isRevealUnlocked()` AFTER it holds a record. Two questions, two functions;
 * collapsing them would force the reveal panel to build a record just to ask
 * whether it is allowed to exist.
 */
export function isRevealUnlockedForCheckpoint(ledger: YYLedger, runId: string, checkpointId: string): boolean {
  return isCheckpointCommitted(ledger, runId, checkpointId);
}

/**
 * Where a (run, checkpoint) currently stands in the grammar.
 *
 * `"reflect"` is returned once a reflection exists. It is NOT a sixth YY stage
 * (§3 says so explicitly) — it is a Developer Forward learning step that happens to
 * be the last thing a surface renders, and naming it here keeps a component
 * from inferring it from the absence of everything else.
 */
export type YYRunStage = "capture" | "why" | "why_not" | "commit" | "timestamp" | "reflect";

export function runStage(ledger: YYLedger, runId: string, checkpointId: string): YYRunStage {
  const has = (type: YYEventType): boolean =>
    ledger.events.some((event) => event.type === type && event.runId === runId && event.checkpointId === checkpointId);

  if (has("yy_reflected")) return "reflect";
  if (has("yy_committed")) return "timestamp";
  if (has("yy_why_not_selected")) return "commit";
  if (has("yy_why_selected")) return "why_not";
  if (has("yy_capture_reached")) return "why";
  return "capture";
}

/* -------------------------------------------------------------------------- */
/* 9. Hydration-safe browser access                                           */
/* -------------------------------------------------------------------------- */

/**
 * Never call this during render. The server render and the first client render
 * must produce byte-identical HTML, so every caller reads inside an effect
 * behind a `loaded: false` sentinel. The `typeof window` guard is a second
 * line, not the contract.
 */
function store(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    // iOS Safari private browsing and "block all cookies" throw on ACCESS, not
    // on read, so the guard has to wrap the property lookup itself.
    return null;
  }
}

/**
 * The pre-Start probe, re-exported rather than reimplemented.
 *
 * "Can this origin store anything at all" is an origin-level fact, and asking
 * it twice with two probes would let the two answers disagree.
 */
export { storageAvailable as yyStorageAvailable };

export interface YYReadResult extends YYLedgerSanitizeResult {
  /** True when storage threw or is unavailable — the empty stream is a fallback, not the learner's. */
  storageBlocked: boolean;
}

export function readYYLedger(now: Date = new Date()): YYReadResult {
  const storage = store();
  if (!storage) return { ledger: emptyYYLedger(now), dropped: [], storageBlocked: true };
  try {
    /*
     * The new key first, ALWAYS, and the pre-rebrand key only when there is
     * nothing under it. That order is what makes the fallback self-limiting: a
     * browser that has written once since the rename never reads the old entry
     * again, so a stale ledger cannot resurrect over a current one.
     */
    const raw =
      storage.getItem(DEVELOPER_FORWARD_YY_STORAGE_KEY) ??
      storage.getItem(DEVELOPER_FORWARD_YY_LEGACY_STORAGE_KEY);
    if (typeof raw !== "string" || raw.length === 0) {
      return { ledger: emptyYYLedger(now), dropped: [], storageBlocked: false };
    }
    return { ...sanitizeYYLedger(JSON.parse(raw), now), storageBlocked: false };
  } catch {
    // Unparseable JSON, or a browser that refuses the read. Either way the
    // honest answer is an empty stream, not a guessed one.
    return { ledger: emptyYYLedger(now), dropped: ["<unreadable>"], storageBlocked: true };
  }
}

export interface YYWriteResult extends YYLedgerSanitizeResult {
  /** False when the browser refused the write. The course keeps working in memory. */
  persisted: boolean;
}

/**
 * Sanitize, then stringify. There is no path to storage that skips the gate.
 *
 * Returns the ledger that was actually persisted, so a caller renders what is
 * stored rather than what it hoped to store.
 */
export function writeYYLedger(input: unknown, now: Date = new Date()): YYWriteResult {
  const { ledger, dropped } = sanitizeYYLedger(input, now);
  const storage = store();
  if (!storage) return { ledger, dropped, persisted: false };
  try {
    storage.setItem(DEVELOPER_FORWARD_YY_STORAGE_KEY, JSON.stringify(ledger));
    return { ledger, dropped, persisted: true };
  } catch {
    // Quota exceeded, or a storage-restricted browser.
    return { ledger, dropped, persisted: false };
  }
}

/** Read, transform, write. The transform sees the sanitized stream, never raw JSON. */
export function updateYYLedger(change: (current: YYLedger) => YYLedger, now: Date = new Date()): YYWriteResult {
  return writeYYLedger(change(readYYLedger(now).ledger), now);
}

/**
 * Removes THIS stream's key and nothing else.
 *
 * Deliberately not a prefix sweep: `benchantech:` is a site-wide namespace and
 * a sweep of it would erase whatever another surface stores there — including
 * the v1 Developer Forward dataset and the analytics consent decision, which is a
 * legally-referenced choice that "start over" has no business resetting.
 * Clearing is a two-step, learner-confirmed operation and the confirmation is
 * the CALLER's; this function is the mechanism, never the decision.
 */
export function clearYYLedger(now: Date = new Date()): { ledger: YYLedger; cleared: boolean } {
  const storage = store();
  if (!storage) return { ledger: emptyYYLedger(now), cleared: false };
  try {
    storage.removeItem(DEVELOPER_FORWARD_YY_STORAGE_KEY);
    return { ledger: emptyYYLedger(now), cleared: true };
  } catch {
    return { ledger: emptyYYLedger(now), cleared: false };
  }
}
