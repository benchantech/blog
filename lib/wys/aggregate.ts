/**
 * First-party aggregate adapter — DISABLED AND DOCUMENTED (plan §8.6; WYS
 * §19.1B, §19.2, §30).
 *
 * (WYS §19.2): "If there is no existing persistence layer: do not add a new
 * analytics/database vendor solely to collect scenario distributions in v0;
 * ship with GA4/coarse engagement only; leave the aggregate adapter disabled
 * and documented." (WYS §30): "Only build if the repo already has a suitable
 * database/persistence layer."
 *
 * The precondition is unmet in this repo — `lib/db/client.ts` is a two-line
 * stub whose only function throws and which nothing imports — so this file is
 * the "disabled and documented" half and **no `app/api/wys/aggregate/route.ts`
 * exists**. Creating one would also introduce the first `ƒ (Dynamic)` route
 * into a fully prerendered build.
 *
 * Two independent reasons nothing is ever sent, and the order matters:
 *
 *   1. `WYS_AGGREGATE_ENABLED` is `false` (a build-time content constant, not
 *      an env var — see `content/watch-your-step/config.ts`).
 *   2. `AGGREGATE_ENDPOINT` is `null`. Even with the flag forced true there is
 *      no endpoint to post to, so `sendAggregate()` still makes no call.
 *
 * `tests/wys-telemetry.test.ts` asserts BOTH, flag on and flag off, because a
 * test that only exercised (1) would pass for the wrong reason.
 *
 * Pure TypeScript. No React, no CSS, no component import.
 */

import { WYS_AGGREGATE_ENABLED } from "@/content/watch-your-step/config";

/* -------------------------------------------------------------------------- */
/* The event union (plan §8.6, verbatim)                                      */
/* -------------------------------------------------------------------------- */

/**
 * The two first-party aggregate-only events from the (WYS §19.4) allowlist,
 * carried here rather than in `lib/wys/telemetry.ts` because they must never
 * reach GA4. `trackWys` refuses both by name.
 *
 * Field names are camelCase because this is a JSON request body shape quoted
 * verbatim from (WYS §19.1B)'s example, not a GA4 wire property. The
 * snake_case rule in plan §8.2 governs `trackWys` properties only; keeping the
 * two shapes visibly different is deliberate.
 */
export type AggregateEvent =
  | { event: "scenario_choice"; scenarioId: string; choiceKey: string; contentVersion: string }
  | { event: "scenario_skip"; scenarioId: string; contentVersion: string };

export const AGGREGATE_EVENT_NAMES: readonly AggregateEvent["event"][] = ["scenario_choice", "scenario_skip"];

/**
 * There is no endpoint. This is a value rather than a hardcoded string inside
 * `sendAggregate()` so the "no endpoint exists" half of the refusal is
 * inspectable by test instead of implied.
 *
 * If Ben enables the counter (Q12) the shape is already fixed by plan §8.6:
 * `POST /api/wys/aggregate` with `runtime = "nodejs"`; validate exact fields
 * and reject extra keys, over-long strings, unknown scenario IDs, unknown
 * choice keys, arbitrary JSON and user IDs; one atomic
 * `INSERT … ON CONFLICT … DO UPDATE SET count = count + 1` on
 * `unique(event_type, scenario_id, choice_key, content_version)`; store COUNTS,
 * not event rows — "Do not create a raw-event table 'for later analysis.'"
 * No timestamp history per person, no IP / user-agent / referer column, no
 * session cookie, no fingerprint, no request-body logging. Never use rate
 * limiting as an excuse to create a persistent learner identifier.
 */
export const AGGREGATE_ENDPOINT: string | null = null;

/* -------------------------------------------------------------------------- */
/* Validation — written now, so enabling the flag cannot skip it              */
/* -------------------------------------------------------------------------- */

/** Ids and versions are short closed-vocabulary tokens. Free text cannot pass. */
const AGGREGATE_TOKEN = /^[a-z0-9][a-z0-9_.:-]{0,39}$/;
/** A choice key is a single letter or a very short token ("A", "B", "C"). */
const AGGREGATE_CHOICE_KEY = /^[A-Za-z0-9][A-Za-z0-9_-]{0,7}$/;

export type AggregateRefusal =
  | "not-an-object"
  | "unknown-event"
  | "extra-key"
  | "missing-field"
  | "invalid-field";

export type AggregateValidation =
  | { ok: true; event: AggregateEvent }
  | { ok: false; refusal: AggregateRefusal; detail: string };

const ALLOWED_KEYS: Record<AggregateEvent["event"], readonly string[]> = {
  scenario_choice: ["event", "scenarioId", "choiceKey", "contentVersion"],
  scenario_skip: ["event", "scenarioId", "contentVersion"]
};

/**
 * Exact-field validation, rejecting extra keys. Written and tested while the
 * adapter is off so that turning it on is a one-line change rather than a
 * one-line change plus an unwritten validator.
 */
export function validateAggregateEvent(input: unknown): AggregateValidation {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { ok: false, refusal: "not-an-object", detail: typeof input };
  }

  const record = input as Record<string, unknown>;
  const name = record.event;
  if (typeof name !== "string" || !AGGREGATE_EVENT_NAMES.includes(name as AggregateEvent["event"])) {
    return { ok: false, refusal: "unknown-event", detail: String(name) };
  }

  const allowed = ALLOWED_KEYS[name as AggregateEvent["event"]];
  for (const key of Object.keys(record)) {
    if (!allowed.includes(key)) return { ok: false, refusal: "extra-key", detail: key };
  }
  for (const key of allowed) {
    if (!(key in record)) return { ok: false, refusal: "missing-field", detail: key };
  }

  const scenarioId = record.scenarioId;
  const contentVersion = record.contentVersion;
  if (typeof scenarioId !== "string" || !AGGREGATE_TOKEN.test(scenarioId)) {
    return { ok: false, refusal: "invalid-field", detail: "scenarioId" };
  }
  if (typeof contentVersion !== "string" || !AGGREGATE_TOKEN.test(contentVersion)) {
    return { ok: false, refusal: "invalid-field", detail: "contentVersion" };
  }

  if (name === "scenario_choice") {
    const choiceKey = record.choiceKey;
    if (typeof choiceKey !== "string" || !AGGREGATE_CHOICE_KEY.test(choiceKey)) {
      return { ok: false, refusal: "invalid-field", detail: "choiceKey" };
    }
    return {
      ok: true,
      event: { event: "scenario_choice", scenarioId, choiceKey, contentVersion }
    };
  }

  return { ok: true, event: { event: "scenario_skip", scenarioId, contentVersion } };
}

/* -------------------------------------------------------------------------- */
/* The send path — returns immediately                                        */
/* -------------------------------------------------------------------------- */

export type AggregateOutcome =
  | { sent: false; reason: "disabled" }
  | { sent: false; reason: "no-endpoint" }
  | { sent: false; reason: "invalid"; refusal: AggregateRefusal; detail: string }
  | { sent: true };

export interface SendAggregateOptions {
  /** Test/preview override for the build-time constant. Callers in `app/` pass nothing. */
  enabled?: boolean;
  /** Test seam. There is no endpoint, so this is never reached in v0. */
  fetchImpl?: typeof fetch;
  /** Test/preview override for the (absent) endpoint. */
  endpoint?: string | null;
}

/**
 * Fire-and-forget by construction: synchronous, never awaited, never throws.
 *
 * v0 returns `{ sent: false }` on every path. The `post` branch is written so
 * the discipline is recorded — `.catch(() => {})`, no await, no response read —
 * but it is unreachable while `AGGREGATE_ENDPOINT` is `null`.
 */
export function sendAggregate(event: AggregateEvent, options: SendAggregateOptions = {}): AggregateOutcome {
  const enabled = options.enabled ?? WYS_AGGREGATE_ENABLED;
  if (!enabled) return { sent: false, reason: "disabled" };

  const endpoint = options.endpoint === undefined ? AGGREGATE_ENDPOINT : options.endpoint;
  if (!endpoint) return { sent: false, reason: "no-endpoint" };

  const validation = validateAggregateEvent(event);
  if (!validation.ok) {
    return { sent: false, reason: "invalid", refusal: validation.refusal, detail: validation.detail };
  }

  const post = options.fetchImpl ?? (typeof fetch === "function" ? fetch : undefined);
  if (!post) return { sent: false, reason: "no-endpoint" };

  // Never awaited: a blocked POST must not delay the commit-then-reveal
  // interaction (plan §8.6).
  void post(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(validation.event),
    keepalive: true
  }).catch(() => {});

  return { sent: true };
}
