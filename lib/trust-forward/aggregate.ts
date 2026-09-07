/**
 * The Trust Forward Lite first-party aggregate adapter — IMPLEMENTED, DISABLED
 * AND DOCUMENTED (gate Q-E, `Q_E_AGGREGATE_TELEMETRY_SCOPE.BEN_APPROVED.json`;
 * layer-07 `routes-telemetry-wys.BEN_APPROVED.json`).
 *
 * WITH `TF_AGGREGATE_ENABLED` SET TO `false`, THIS MODULE TRANSMITS NOTHING.
 * Not a count, not an empty request, not a preflight. That is the plain
 * statement the ruling asks for, and it is true for two independent reasons
 * checked in this order: the flag is `false`, and `TF_AGGREGATE_TRANSPORT` is
 * `null`, so even with the flag forced true there is nothing to hand a payload
 * to. A test that only exercised the flag would pass for the wrong reason.
 *
 * WHAT THE RULING ACTUALLY SAYS, and why the adapter exists at all while being
 * off. Q-E asks for the anonymous per-decision A/B/C counter to be
 * IMPLEMENTED, with `productionDefault` `TF_AGGREGATE_ENABLED: false` and
 * `networkBehaviorWhenDisabled` "No choice telemetry is transmitted", and then
 * closes the obvious loophole: **"Do not add the repository first
 * persistence/backend infrastructure merely to activate Trust Forward aggregate
 * telemetry."** So the shape is settled now, in code that can be read and
 * tested, and turning it on later is a scoped piece of backend work rather than
 * an unwritten design.
 *
 * THE PRECONDITION IS GENUINELY UNMET IN THIS REPO. `lib/db/client.ts` is a
 * two-line stub whose only function throws, and there is no database driver in
 * `node_modules`. There is no `app/api/trust-forward/aggregate/route.ts` and
 * this module does not want one — creating it would also introduce the first
 * dynamic route into a fully prerendered build. This is `lib/wys/aggregate.ts`'s
 * situation exactly, one product later, and it is resolved the same way.
 *
 * WHY THIS MODULE MAY CARRY A CHOICE WHEN `telemetry.ts` MAY NOT.
 * `PRIVACY_ANALYTICS.md` forbids sending selected answers, and
 * `lib/trust-forward/telemetry.ts` has nowhere to put one. The layer-07 ruling
 * separately permits `aggregateABCPerDecision: true` through an
 * `existing_first_party_counter` with `persistRawLearnerEvents: false` and
 * `identifiersOnChoiceCounters: false`. The two rules are consistent because
 * they describe different objects: a per-learner event carrying an option is a
 * clickstream, and a per-decision tally of A, B and C is a number attached to
 * nobody. Which is why this file is a COUNTER and not an event log — see
 * `foldAggregateCounters`, which is the whole discipline in one pure function.
 *
 * NO NETWORK PRIMITIVE IS REFERENCED ANYWHERE IN THIS MODULE. Plan §14 makes a
 * static absence of every request-issuing API over `lib/trust-forward/` one of
 * the three privacy checks this repo can actually enforce (it has no browser
 * test harness, so a request spy is not available). That is why the send path
 * takes an injected `AggregateTransport` rather than reaching for a global: the
 * adapter can be complete and still contain no way to originate a request on
 * its own.
 *
 * Pure TypeScript. No React, no JSX, no CSS import, no component import.
 */

import { DECISION_IDS, OPTION_IDS, type DecisionId, type OptionId } from "@/lib/trust-forward/types";

/* -------------------------------------------------------------------------- */
/* 1. The switch                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Gate Q-E's `productionDefault`, verbatim: the constant is named
 * `TF_AGGREGATE_ENABLED` and its value is `false`.
 *
 * It is a build-time constant and deliberately NOT an environment variable. An
 * env var would mean the honest answer to "is choice telemetry on?" is "look at
 * the deployment", and the disclosure surfaces would have to hedge. This way
 * the answer is in the repository, and flipping it is a reviewable diff.
 */
export const TF_AGGREGATE_ENABLED = false;

/* -------------------------------------------------------------------------- */
/* 2. The event — one decision, one option, one increment                     */
/* -------------------------------------------------------------------------- */

/**
 * The single aggregate event: this decision was answered with this option, on
 * this content version, once.
 *
 * Note what the shape makes impossible rather than merely discouraged. There is
 * no session id, no learner handle, no timestamp, no sequence number, no
 * `variantId` and no array — so a receiver cannot order two increments, cannot
 * group them, and cannot tell whether two arrivals came from one person or two.
 * The layer-07 `forbidden` list (reflection text, complete choice sequence,
 * terminal six-dimensional state, SHIP/profile result, local state) is
 * satisfied structurally: none of those has a field to travel in.
 *
 * `variantId` is the interesting omission. It is the honest way to know WHICH
 * world state a choice was made in, and it is exactly what
 * `PRIVACY_ANALYTICS.md` names as forbidden — "variant IDs that reconstruct
 * path". A per-decision A/B/C tally that also carried the variant would be a
 * path reconstruction wearing a counter's name.
 *
 * Field names are camelCase because this is a first-party payload shape, not a
 * GA4 wire property. The snake_case rule governs `trackTrustForward` properties
 * only; keeping the two shapes visibly different is deliberate, so that a
 * payload from this file cannot be pasted into that one by accident.
 */
export interface TrustForwardAggregateEvent {
  event: "decision_choice";
  decisionId: DecisionId;
  optionId: OptionId;
  /** The stamped Lite version, so counts from different content never merge. */
  appVersion: string;
}

export const TF_AGGREGATE_EVENT_NAMES: readonly TrustForwardAggregateEvent["event"][] = ["decision_choice"];

/**
 * The transport seam. There is none.
 *
 * This is a value rather than a hardcoded branch inside
 * `sendTrustForwardAggregate` so the "there is nowhere to send" half of the
 * refusal is inspectable by test instead of implied, and so that the type of
 * the thing that is missing is written down: a function taking one validated
 * increment and returning nothing. Not a URL — a URL would invite the next
 * reader to supply one and call a global.
 */
export type AggregateTransport = (increment: AggregateIncrement) => void;

export const TF_AGGREGATE_TRANSPORT: AggregateTransport | null = null;

/* -------------------------------------------------------------------------- */
/* 3. Validation — written now, so enabling the flag cannot skip it           */
/* -------------------------------------------------------------------------- */

/** A version stamp: starts with a digit ("1.0.0", "2026-09-07"). Free text cannot pass. */
const APP_VERSION = /^[0-9][0-9a-z.-]{0,31}$/;

export type AggregateRefusal =
  | "not-an-object"
  | "unknown-event"
  | "extra-key"
  | "missing-field"
  | "invalid-field";

export type AggregateValidation =
  | { ok: true; event: TrustForwardAggregateEvent }
  | { ok: false; refusal: AggregateRefusal; detail: string };

/**
 * The exact key set. Rejecting EXTRA keys is the load-bearing half: a caller
 * that spread a ledger event, an `ActiveDecision` or a whole `LiteDataset` into
 * this payload would otherwise ship a session id and a variant id inside a
 * shape that is documented as carrying neither.
 */
const ALLOWED_KEYS: readonly string[] = ["event", "decisionId", "optionId", "appVersion"];

export function validateTrustForwardAggregateEvent(input: unknown): AggregateValidation {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { ok: false, refusal: "not-an-object", detail: typeof input };
  }

  const record = input as Record<string, unknown>;
  const name = record.event;
  if (typeof name !== "string" || !TF_AGGREGATE_EVENT_NAMES.includes(name as TrustForwardAggregateEvent["event"])) {
    return { ok: false, refusal: "unknown-event", detail: String(name) };
  }

  for (const key of Object.keys(record)) {
    if (!ALLOWED_KEYS.includes(key)) return { ok: false, refusal: "extra-key", detail: key };
  }
  for (const key of ALLOWED_KEYS) {
    if (!(key in record)) return { ok: false, refusal: "missing-field", detail: key };
  }

  const decisionId = record.decisionId;
  const optionId = record.optionId;
  const appVersion = record.appVersion;

  // Closed vocabularies from the shared contract, not regexes: the eleven
  // decision ids and the three option ids are enumerable, so anything else —
  // including a decision id invented by a typo — is refused by construction.
  if (typeof decisionId !== "string" || !(DECISION_IDS as readonly string[]).includes(decisionId)) {
    return { ok: false, refusal: "invalid-field", detail: "decisionId" };
  }
  if (typeof optionId !== "string" || !(OPTION_IDS as readonly string[]).includes(optionId)) {
    return { ok: false, refusal: "invalid-field", detail: "optionId" };
  }
  if (typeof appVersion !== "string" || !APP_VERSION.test(appVersion)) {
    return { ok: false, refusal: "invalid-field", detail: "appVersion" };
  }

  return {
    ok: true,
    event: {
      event: "decision_choice",
      decisionId: decisionId as DecisionId,
      optionId: optionId as OptionId,
      appVersion
    }
  };
}

/* -------------------------------------------------------------------------- */
/* 4. Counters, not histories                                                 */
/* -------------------------------------------------------------------------- */

/**
 * One increment. `count` is always 1 on the wire; the field exists because the
 * thing being described is a tally, and a receiver that stored increments
 * without adding them would be storing an event log again.
 */
export interface AggregateIncrement {
  key: string;
  decisionId: DecisionId;
  optionId: OptionId;
  appVersion: string;
  count: 1;
}

/**
 * The counter key, and therefore the uniqueness constraint any future store
 * must use: `unique(app_version, decision_id, option_id)`. Q-E's
 * `futureEnablement` requires that enabling this "preserve aggregate counts
 * only, no histories and no identifiers", and a key with exactly these three
 * parts is the enforcement — there is no fourth column a session, a person or
 * an ordering could hide in.
 */
export function aggregateCounterKey(event: TrustForwardAggregateEvent): string {
  return `${event.appVersion}|${event.decisionId}|${event.optionId}`;
}

export function toAggregateIncrement(event: TrustForwardAggregateEvent): AggregateIncrement {
  return {
    key: aggregateCounterKey(event),
    decisionId: event.decisionId,
    optionId: event.optionId,
    appVersion: event.appVersion,
    count: 1
  };
}

/**
 * Fold a list of events into counts. THE POINT IS WHAT IS LOST: order,
 * adjacency and cardinality of senders all disappear, and the result is a flat
 * `key -> number` map from which no sequence can be reconstructed even in
 * principle.
 *
 * It is exported because it is the readable statement of the ruling. If a
 * future backend is ever scoped, the correct server-side shape is this function
 * expressed as one atomic
 * `INSERT … ON CONFLICT (app_version, decision_id, option_id) DO UPDATE SET
 * count = count + 1` — store COUNTS, never raw event rows "for later analysis".
 * No per-person timestamp history, no IP, user-agent or referer column, no
 * session cookie, no fingerprint, no request-body logging. And never use rate
 * limiting as an excuse to create a persistent learner identifier.
 */
export function foldAggregateCounters(
  events: readonly TrustForwardAggregateEvent[],
  into: Readonly<Record<string, number>> = {}
): Record<string, number> {
  const counters: Record<string, number> = { ...into };
  for (const event of events) {
    const validation = validateTrustForwardAggregateEvent(event);
    if (!validation.ok) continue;
    const key = aggregateCounterKey(validation.event);
    counters[key] = (counters[key] ?? 0) + 1;
  }
  return counters;
}

/* -------------------------------------------------------------------------- */
/* 5. The send path — returns immediately, always                             */
/* -------------------------------------------------------------------------- */

export type AggregateOutcome =
  | { sent: false; reason: "disabled" }
  | { sent: false; reason: "no-transport" }
  | { sent: false; reason: "invalid"; refusal: AggregateRefusal; detail: string }
  | { sent: true };

export interface SendAggregateOptions {
  /** Test/preview override for the build-time constant. Callers in `app/` pass nothing. */
  enabled?: boolean;
  /** Test seam. There is no transport, so this is never reached in the shipped build. */
  transport?: AggregateTransport | null;
}

/**
 * Fire-and-forget by construction: synchronous, never awaited, never throws.
 *
 * Every path returns `{ sent: false }` in the shipped build, and the FIRST
 * check is the flag, so a disabled adapter does not even validate — nothing is
 * read, nothing is derived, nothing is held. The transport branch is written so
 * the discipline survives to whoever enables it (one validated increment, no
 * return value inspected, no error surfaced to the learner), and it is
 * unreachable while `TF_AGGREGATE_TRANSPORT` is `null`.
 */
export function sendTrustForwardAggregate(
  event: TrustForwardAggregateEvent,
  options: SendAggregateOptions = {}
): AggregateOutcome {
  const enabled = options.enabled ?? TF_AGGREGATE_ENABLED;
  if (!enabled) return { sent: false, reason: "disabled" };

  const transport = options.transport === undefined ? TF_AGGREGATE_TRANSPORT : options.transport;
  if (!transport) return { sent: false, reason: "no-transport" };

  const validation = validateTrustForwardAggregateEvent(event);
  if (!validation.ok) {
    return { sent: false, reason: "invalid", refusal: validation.refusal, detail: validation.detail };
  }

  // Never awaited and never inspected: a slow or blocked counter must not delay
  // the commit-then-reveal interaction, and a failed count is not a learner's
  // problem to see.
  try {
    transport(toAggregateIncrement(validation.event));
  } catch {
    return { sent: false, reason: "no-transport" };
  }

  return { sent: true };
}

/* -------------------------------------------------------------------------- */
/* 6. What a future store may never hold                                      */
/* -------------------------------------------------------------------------- */

/**
 * The refusal list for the enablement that has not happened, reproduced from
 * Q-E's `futureEnablement` and the layer-07 `forbidden` list so that the scoped
 * backend work, whenever it is picked up, inherits the constraint rather than
 * rediscovering it.
 */
export const TF_AGGREGATE_NEVER_STORED: readonly string[] = [
  "raw learner event rows",
  "choice histories or sequences",
  "any identifier on a choice counter",
  "session ids",
  "learner handles",
  "reflection text",
  "the complete choice sequence",
  "the terminal six-dimensional state",
  "the SHIP code or profile result",
  "local state",
  "variant ids",
  "IP, user-agent or referer columns",
  "per-person timestamp histories"
];
