/**
 * Developer Forward Lite — local sessions and the 6-hour rollover (plan §6.8;
 * ARCHITECTURE.md "Sessions"; `config/developer-forward-lite.v1.json` →
 * `storage.sessionInactivityHours: 6`).
 *
 * Pure TypeScript. No React, no JSX, no CSS import, no component import — the
 * suite runs as `node --import tsx --test tests/*.test.ts` and cannot load a
 * `.css` specifier.
 *
 * WHAT A SESSION IS HERE, AND WHAT IT IS NOT. A session id groups the events a
 * learner produced in one sitting so the export reads as a history rather than
 * a flat list. It is **generated locally, stored locally, and never
 * transmitted** (ARCHITECTURE.md "Sessions"; `PRIVACY_ANALYTICS.md` lists
 * "local timestamps/session IDs" under **Never transmit**). It is not an
 * analytics session, not a visitor id, and nothing joins it to one. The
 * enforcement of "never transmitted" is the telemetry property allowlist, which
 * has no property that can carry it — a module cannot police a payload it never
 * sees, so this file states the rule and the allowlist keeps it.
 *
 * WHY THE CLOCK IS INJECTED EVERYWHERE. Every function here takes `now` as a
 * parameter instead of reading `Date.now()`. A rollover rule whose only
 * observable behaviour needs six hours of real waiting is a rule no test can
 * assert, and `TEST_PLAN.md` requires both sides asserted: "<6h same session;
 * >=6h new session". The boundary is `>=`, matching the reference
 * implementation, so exactly six hours starts a new session.
 *
 * WHY ROLLING LIVES HERE AND NOT IN `appendEvent`. The reference implementation
 * rolls the session inside the append. Splitting them gives `./ledger.ts` the
 * three ledger invariants and nothing else, and gives this module the one time
 * rule — and it keeps the dependency running one way, `session -> ledger`, with
 * no cycle. `appendEventInSession()` below composes the two and is what UI code
 * should call.
 */

import {
  type AppendEventOptions,
  type LedgerEventInput,
  NO_SESSION_ID,
  appendEvent,
  makeLocalTimestamp,
  newId
} from "@/lib/developer-forward/ledger";
import type { LiteDataset } from "@/lib/developer-forward/types";

/* -------------------------------------------------------------------------- */
/* 1. The stamped rule                                                         */
/* -------------------------------------------------------------------------- */

/** `storage.sessionInactivityHours` in the stamped config. Six, not "about a day". */
export const LITE_SESSION_INACTIVITY_HOURS = 6;

export const LITE_SESSION_INACTIVITY_MS = LITE_SESSION_INACTIVITY_HOURS * 60 * 60 * 1000;

export const SESSION_ID_PREFIX = "session";

/** A fresh local session id. Never leaves the device. */
export function newSessionId(): string {
  return newId(SESSION_ID_PREFIX);
}

/* -------------------------------------------------------------------------- */
/* 2. shouldRollSession                                                        */
/* -------------------------------------------------------------------------- */

/**
 * True when `now` is at least six hours after the last recorded activity.
 *
 * `lastActivityLocal` is the local-with-numeric-offset stamp `./ledger.ts`
 * writes, so `Date.parse` reads it as an absolute instant and the comparison is
 * correct across a timezone change mid-course — a learner who answers Case 1 in
 * one offset and Case 3 in another gets a session boundary based on elapsed
 * time, not on the offset arithmetic.
 *
 * FAILS TOWARD A NEW SESSION. An unparseable or empty value returns `true`.
 * The cost of rolling unnecessarily is a new local id in a local export; the
 * cost of not rolling is that a corrupted stamp pins a learner to one session
 * id forever, which is the more identifying of the two outcomes.
 */
export function shouldRollSession(lastActivityLocal: string | null | undefined, now: Date = new Date()): boolean {
  if (typeof lastActivityLocal !== "string" || lastActivityLocal.length === 0) return true;
  const last = Date.parse(lastActivityLocal);
  if (Number.isNaN(last)) return true;
  return now.getTime() - last >= LITE_SESSION_INACTIVITY_MS;
}

/* -------------------------------------------------------------------------- */
/* 3. Applying the rule to a dataset                                           */
/* -------------------------------------------------------------------------- */

export interface SessionResolution {
  /** The session id the next event belongs to. */
  sessionId: string;
  /** True when the six-hour rule minted a new one. */
  rolled: boolean;
}

export interface ResolveSessionOptions {
  now?: Date;
  /** Injected only by tests that need a deterministic session id. */
  makeSessionId?: () => string;
}

/**
 * Decide which session the next event belongs to, without touching the dataset.
 *
 * A dataset that has never been started carries `NO_SESSION_ID`, so its first
 * event always mints one — that is the same branch as a six-hour rollover and
 * is deliberately not a special case.
 */
export function resolveSession(dataset: LiteDataset, options: ResolveSessionOptions = {}): SessionResolution {
  const now = options.now ?? new Date();
  const mint = options.makeSessionId ?? newSessionId;
  if (dataset.currentSessionId === NO_SESSION_ID || shouldRollSession(dataset.lastActivityAtLocal, now)) {
    return { sessionId: mint(), rolled: true };
  }
  return { sessionId: dataset.currentSessionId, rolled: false };
}

/**
 * Apply the rule and return a NEW dataset. Never mutates.
 *
 * `lastActivityAtLocal` is advanced here even though no event was appended,
 * because opening the tab IS activity for the purpose of the rule: without it,
 * a learner who reads a case for seven hours and then answers would be dropped
 * into a second session mid-decision.
 */
export function rollSessionIfIdle(
  dataset: LiteDataset,
  options: ResolveSessionOptions = {}
): { dataset: LiteDataset; rolled: boolean } {
  const now = options.now ?? new Date();
  const { sessionId, rolled } = resolveSession(dataset, { ...options, now });
  if (!rolled) return { dataset, rolled: false };
  return {
    dataset: { ...dataset, currentSessionId: sessionId, lastActivityAtLocal: makeLocalTimestamp(now) },
    rolled: true
  };
}

/* -------------------------------------------------------------------------- */
/* 4. The composed append                                                      */
/* -------------------------------------------------------------------------- */

export interface AppendInSessionResult {
  dataset: LiteDataset;
  /** True when this event opened a new local session. */
  rolled: boolean;
  /** The session the event was recorded under. */
  sessionId: string;
}

/**
 * The reference implementation's combined behaviour, reassembled from the two
 * modules that each own half of it: resolve the session under the six-hour
 * rule, then append the event under that session.
 *
 * This is the call UI code should make. `appendEvent()` remains exported for
 * the cases that already hold a resolved session id — a batch replay, or the
 * multi-tab reconciler (plan §6.8), which must not roll a session as a side
 * effect of merging another tab's events.
 */
export function appendEventInSession(
  dataset: LiteDataset,
  event: LedgerEventInput,
  options: ResolveSessionOptions & Pick<AppendEventOptions, "eventId"> = {}
): AppendInSessionResult {
  const now = options.now ?? new Date();
  const { sessionId, rolled } = resolveSession(dataset, { ...options, now });
  return {
    dataset: appendEvent(dataset, event, { now, sessionId, eventId: options.eventId }),
    rolled,
    sessionId
  };
}

/* -------------------------------------------------------------------------- */
/* 5. Reading sessions back out                                                */
/* -------------------------------------------------------------------------- */

/**
 * The distinct session ids in the ledger, in first-appearance order.
 *
 * Used by the Markdown export to group the "complete immutable local ledger"
 * (`EXPORT_SPEC.md` item 12) into sittings. Derived from the ledger rather than
 * stored, because the ledger is the source of truth (ARCHITECTURE.md) and a
 * stored list would be a second place the same fact could be wrong.
 */
export function sessionIdsInLedger(dataset: LiteDataset): string[] {
  const seen: string[] = [];
  for (const event of dataset.ledger) {
    if (event.sessionId !== NO_SESSION_ID && !seen.includes(event.sessionId)) seen.push(event.sessionId);
  }
  return seen;
}

/** How many distinct sittings the ledger records. */
export function sessionCount(dataset: LiteDataset): number {
  return sessionIdsInLedger(dataset).length;
}
