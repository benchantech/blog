/**
 * The Watch Your Step telemetry adapter (plan Phase 3, §8.2-§8.8; WYS §19.1A,
 * §19.3, §19.4, §19.5, §31).
 *
 * One central adapter so measurement can be audited or replaced. It is a
 * REFUSAL first and a sender second: the allowlists below are closed, and every
 * path that is not explicitly permitted drops the event.
 *
 * What is preserved and NOT touched here (user constraint 4, plan §8.1):
 * `components/GoogleAnalytics.tsx` is byte-frozen — the GA4 measurement ID, the
 * Consent Mode v2 defaults, the hardcoded `ad_*` denials, `ads_data_redaction`,
 * `anonymize_ip`, `send_page_view: true`, the stream and the property. This
 * module layers ON TOP of that bootstrap. There is no second consent store, no
 * second gtag bootstrap, and `@next/third-parties` is deliberately not
 * installed (it ships a competing bootstrap that would clobber the defaults).
 *
 * Four structural guarantees:
 *
 *  1. **Closed event allowlist** (§8.2, verbatim from WYS §19.4). Thirteen
 *     coarse GA4 names. The two first-party aggregate-only names are refused by
 *     this module by design — they belong to `lib/wys/aggregate.ts`, which is
 *     disabled, so they send nothing at all.
 *  2. **Closed property allowlist** with VALUE domains, not just key names. A
 *     key allowlist alone would happily carry a learner's sentence under
 *     `content_version`; the value domains are what actually make "never accept
 *     free-text properties" true. The canary `DO_NOT_SEND_WYS_TEST_9f31` fails
 *     every one of the four domains.
 *  3. **snake_case is the wire format** (§8.2). (WYS §19.1A) names the
 *     properties in snake_case; §19.5's example call is camelCase; the two are
 *     reproduced in the spec without reconciliation. This adapter accepts and
 *     emits snake_case ONLY and ships no mapping shim — a shim is a second
 *     place a property name can be spelled, which is one more than an allowlist
 *     can police. A camelCase key is refused.
 *  4. **Fails closed in production, loud in development** (§8.3). §19.5's
 *     "reject … in development" says where the LOUD failure goes, not where the
 *     refusal goes. Read the other way it would let an unlisted property
 *     through in production, which defeats the allowlist.
 *
 * Pure TypeScript. No React, no JSX, no CSS import, no component import — the
 * suite runs as `node --import tsx --test tests/*.test.ts` and cannot load a
 * `.css` specifier.
 */

import { CONSENT_STORAGE_KEY } from "./browser-keys";

/* -------------------------------------------------------------------------- */
/* 1. The event allowlist (§8.2, verbatim from WYS §19.4)                      */
/* -------------------------------------------------------------------------- */

/**
 * Coarse GA4 events — the closed list. Verbatim and in spec order. Do not add
 * a name; do not remove one. `wys_view` and `wys_transfer_check_complete` stay
 * on the list and are deliberately unfired in v0 (see `WYS_DECISION_USE`).
 */
export const WYS_EVENT_NAMES = [
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
] as const;

export type WysEventName = (typeof WYS_EVENT_NAMES)[number];

/**
 * First-party aggregate-only events (WYS §19.4). **Never GA4.** `trackWys`
 * refuses them by name with their own refusal reason so a mis-wired call is
 * distinguishable from a typo. They route to `lib/wys/aggregate.ts`, which is
 * disabled and has no endpoint, so in v0 they send nothing at all.
 */
export const WYS_AGGREGATE_ONLY_EVENT_NAMES = ["wys_scenario_choice", "wys_scenario_skip"] as const;

/** Potential future aggregate events (WYS §19.4). Not wired, not sent. */
export const WYS_FUTURE_AGGREGATE_EVENT_NAMES = ["wys_scenario_revision", "wys_overwithholding_case"] as const;

/* -------------------------------------------------------------------------- */
/* 2. The property allowlist (§8.2, WYS §19.1A) — keys AND value domains       */
/* -------------------------------------------------------------------------- */

/** The closed property key list. "Do not include semantic learner answers." */
export const WYS_PROPERTY_KEYS = ["lesson_index", "source_period_id", "content_version", "route_type"] as const;

export type WysPropertyKey = (typeof WYS_PROPERTY_KEYS)[number];

/**
 * `route_type` is a closed vocabulary, taken from the Kind column of the plan's
 * §5.2 route table. **Authored, not specified** — (WYS §19.1A) names the
 * property and not its values — and reported as such. A closed set is the
 * point: an open string here is a free-text field wearing a permitted name.
 */
export const WYS_ROUTE_TYPES = [
  "marketing",
  "preserved",
  "legal",
  "course-landing",
  "course",
  "stop",
  "ship",
  "machine"
] as const;

export type WysRouteType = (typeof WYS_ROUTE_TYPES)[number];

/**
 * The typed call-site shape. An object literal with any other key is a COMPILE
 * error (excess property checking), so passing a whole `WysLocalStateV1`, a
 * rulebook array or a scratch string never reaches the runtime refusal in the
 * first place. The runtime refusal exists anyway, for values arriving as
 * `unknown`.
 */
export interface WysEventProperties {
  lesson_index?: number;
  source_period_id?: string;
  content_version?: string;
  route_type?: WysRouteType;
}

/** Lowercase closed-vocabulary id token. Rejects spaces, prose and mixed case. */
const SOURCE_PERIOD_ID = /^[a-z0-9][a-z0-9-]{0,31}$/;
/** A version stamp: starts with a digit ("2026-09-03", "3", "2.3"). */
const CONTENT_VERSION = /^[0-9][0-9a-z.-]{0,31}$/;

/**
 * Value-domain validation, one entry per allowlisted key. Total by
 * construction: `Record<WysPropertyKey, …>` means adding a key to the allowlist
 * without a domain is a compile error.
 */
const PROPERTY_DOMAINS: Record<WysPropertyKey, (value: unknown) => boolean> = {
  lesson_index: (value) => typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 99,
  source_period_id: (value) => typeof value === "string" && SOURCE_PERIOD_ID.test(value),
  content_version: (value) => typeof value === "string" && CONTENT_VERSION.test(value),
  route_type: (value) => typeof value === "string" && (WYS_ROUTE_TYPES as readonly string[]).includes(value)
};

/* -------------------------------------------------------------------------- */
/* 3. Validation — pure, exported, and the thing the tests hammer              */
/* -------------------------------------------------------------------------- */

export type WysRefusal =
  | "telemetry-disabled"
  | "unknown-event"
  | "aggregate-only-event"
  | "props-not-a-plain-object"
  | "unknown-property"
  | "invalid-property-value"
  | "no-measurement-id"
  | "consent-not-granted"
  | "no-window";

export type WysValidation =
  | { ok: true; name: WysEventName; props: WysEventProperties }
  | { ok: false; refusal: WysRefusal; detail: string };

function isEventName(name: unknown): name is WysEventName {
  return typeof name === "string" && (WYS_EVENT_NAMES as readonly string[]).includes(name);
}

/**
 * Reject the event name, reject every unlisted key, reject every out-of-domain
 * value, and never spread the incoming object — the returned `props` is rebuilt
 * key by key from the allowlist, so nothing unlisted can survive even if a
 * later edit forgets a check.
 */
export function validateWysEvent(name: unknown, props: unknown = {}): WysValidation {
  if ((WYS_AGGREGATE_ONLY_EVENT_NAMES as readonly string[]).includes(String(name))) {
    return { ok: false, refusal: "aggregate-only-event", detail: String(name) };
  }
  if (!isEventName(name)) {
    return { ok: false, refusal: "unknown-event", detail: String(name) };
  }

  if (props === null || typeof props !== "object" || Array.isArray(props)) {
    return { ok: false, refusal: "props-not-a-plain-object", detail: Array.isArray(props) ? "array" : typeof props };
  }

  const incoming = props as Record<string, unknown>;
  for (const key of Object.keys(incoming)) {
    if (!(WYS_PROPERTY_KEYS as readonly string[]).includes(key)) {
      return { ok: false, refusal: "unknown-property", detail: key };
    }
  }

  const clean: WysEventProperties = {};
  for (const key of WYS_PROPERTY_KEYS) {
    if (!(key in incoming)) continue;
    const value = incoming[key];
    if (value === undefined) continue;
    if (!PROPERTY_DOMAINS[key](value)) {
      return { ok: false, refusal: "invalid-property-value", detail: key };
    }
    if (key === "lesson_index") clean.lesson_index = value as number;
    else if (key === "source_period_id") clean.source_period_id = value as string;
    else if (key === "content_version") clean.content_version = value as string;
    else clean.route_type = value as WysRouteType;
  }

  return { ok: true, name, props: clean };
}

/* -------------------------------------------------------------------------- */
/* 4. The gates (§8.3) — all fail closed                                      */
/* -------------------------------------------------------------------------- */

/**
 * "Be easy to disable globally" (WYS §19.5). One constant. Flipping it to
 * `false` silences every WYS event everywhere without touching a component.
 */
export const WYS_TELEMETRY_ENABLED = true;

/** The measurement ID is the sole GA gate, exactly as the preserved code has it. */
export function measurementIdIsSet(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
}

/**
 * Q7's build-now default: **full suppression** unless the visitor explicitly
 * granted analytics. Unreadable, absent, or thrown all mean DO NOT SEND — the
 * gate fails closed on a `localStorage` exception (iOS Safari private browsing
 * throws on access).
 *
 * This is stricter than the site behaves today for its own page views, and it
 * is what makes the on-screen "Sent: coarse counts" copy conditionally true
 * rather than flatly false. Stop condition **SC-2**, Ben question **Q7**; it is
 * not resolved in copy.
 */
export function analyticsConsentGranted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY) === "granted";
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/* 5. Emit shape and the flush rule (§8.3)                                    */
/* -------------------------------------------------------------------------- */

/**
 * Push to `window.dataLayer` rather than calling `window.gtag?.()`.
 *
 * Both GA scripts load `strategy="afterInteractive"`, so an event fired from a
 * first-paint effect can run before `ga4-init` defines `window.gtag`, and
 * `window.gtag?.(…)` would silently drop the first event of every session.
 * `ga4-init` itself does `window.dataLayer = window.dataLayer || []`, so
 * earlier pushes survive.
 *
 * The shim is **arguments-shaped** so the queued entry is byte-identical to
 * what `gtag()` would have pushed: gtag.js consumes `arguments` objects, and a
 * plain array is not documented as equivalent. Plan §8.3 asks for one GA4
 * DebugView check of that claim before committing to the shape; **no live
 * stream was available in this build, so the claim is UNVERIFIED and the plan's
 * default shape ships.** Recorded in `docs/facelift-build-notes.md`. If the
 * check later shows a tuple is equivalent, this becomes `push(args)` with a
 * typed rest parameter and `types/gtag.d.ts` widens to `IArguments[] | unknown[]`.
 *
 * Written with no parameter list at all (the body IS `arguments`) and no
 * `as any`: a declared-but-unread rest parameter would fail `no-unused-vars` if
 * Q14 ever adds a lint config. The variable's annotation supplies the call
 * signature; a zero-parameter function is assignable to it.
 */
type WysGtagEventArgs = ["event", WysEventName, WysEventProperties];

const pushGtagArguments: (...args: WysGtagEventArgs) => void = function () {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(arguments);
};

/**
 * The sentinel plan §8.3 allows in place of an `onReady` callback: `ga4-init`'s
 * own `gtag('config', …)` command, already sitting in `dataLayer`.
 *
 * The `onReady` route was rejected because it would edit
 * `components/GoogleAnalytics.tsx`, which is byte-frozen (user constraint 4).
 * Polling for the marker requires no edit to that file at all.
 *
 * Why this matters: gtag.js processes queued `event` commands with **no
 * configured destination** if they precede the `config` command. A returning
 * visitor with `bct_analytics_consent === "granted"` passes the consent gate
 * immediately and would otherwise lose exactly the first event the buffer
 * exists to save. The consent gate does not cover that case; it only covers
 * undecided visitors.
 *
 * It also closes the consent-ordering hazard by construction: nothing is pushed
 * before `ga4-init` at all, so nothing can land ahead of
 * `gtag('consent','default',{…denied})`.
 */
export const GA4_CONFIG_COMMAND = "config";

export function ga4ConfigMarkerPresent(): boolean {
  if (typeof window === "undefined") return false;
  const layer = window.dataLayer;
  if (!layer || typeof layer.length !== "number") return false;
  for (let index = 0; index < layer.length; index += 1) {
    const entry = layer[index];
    if (entry && typeof entry === "object" && entry[0] === GA4_CONFIG_COMMAND) return true;
  }
  return false;
}

/** Bounded: a page that never loads GA must not accrete a queue. */
const MAX_BUFFERED_EVENTS = 32;
/** ~10s of retries at 250ms. GA loads `afterInteractive`; this is generous. */
const FLUSH_POLL_INTERVAL_MS = 250;
const FLUSH_POLL_MAX_ATTEMPTS = 40;

interface BufferedWysEvent {
  name: WysEventName;
  props: WysEventProperties;
}

let buffer: BufferedWysEvent[] = [];
let pollAttempts = 0;
let pollScheduled = false;

/**
 * Drain the buffer, in order, ONLY once `ga4-init`'s config marker exists.
 * Returns how many events were pushed. Safe to call at any time.
 */
export function flushWysTelemetry(): number {
  if (buffer.length === 0) return 0;
  if (!ga4ConfigMarkerPresent()) return 0;

  const draining = buffer;
  buffer = [];
  for (const event of draining) {
    pushGtagArguments("event", event.name, event.props);
  }
  return draining.length;
}

function schedulePoll(): void {
  if (pollScheduled) return;
  if (typeof window === "undefined" || typeof setTimeout !== "function") return;
  if (pollAttempts >= FLUSH_POLL_MAX_ATTEMPTS) return;

  pollScheduled = true;
  const handle = setTimeout(() => {
    pollScheduled = false;
    pollAttempts += 1;
    if (flushWysTelemetry() === 0 && buffer.length > 0) schedulePoll();
  }, FLUSH_POLL_INTERVAL_MS) as unknown as { unref?: () => void };
  // Node's timer keeps the test process alive; the browser's number has no unref.
  handle.unref?.();
}

/* -------------------------------------------------------------------------- */
/* 6. trackWys                                                                */
/* -------------------------------------------------------------------------- */

export type WysTrackResult =
  | { sent: true }
  | { sent: false; buffered: true }
  | { sent: false; buffered: false; refusal: WysRefusal; detail: string };

export interface TrackWysOptions {
  /** Test/preview override for the global kill switch. Components pass nothing. */
  enabled?: boolean;
  /**
   * Where the LOUD development failure goes. Supplying one REPLACES the console
   * report, which is how the tests stay quiet while still asserting loudness.
   */
  onRefusal?: (refusal: WysRefusal, detail: string, event: unknown) => void;
}

function reportRefusal(refusal: WysRefusal, detail: string, event: unknown, options: TrackWysOptions): void {
  if (options.onRefusal) {
    options.onRefusal(refusal, detail, event);
    return;
  }
  // Loud in development, silent in production — but DROPPED in both (§8.3).
  // The detail is an allowlisted key name, an event name or a type name; it is
  // never the refused value, so a refused free-text value is not echoed into a
  // console or a log either.
  if (process.env.NODE_ENV !== "production" && typeof console !== "undefined") {
    console.warn(`[wys-telemetry] refused: ${refusal} (${detail})`);
  }
}

/**
 * The one call site every component uses.
 *
 * ```ts
 * trackWys("wys_source_period_complete", { source_period_id, content_version });
 * ```
 *
 * Order of refusal is deliberate: shape first (so a mis-wired call is loud in
 * development even for a visitor who declined analytics), then the gates.
 */
export function trackWys(
  name: WysEventName,
  props: WysEventProperties = {},
  options: TrackWysOptions = {}
): WysTrackResult {
  const enabled = options.enabled ?? WYS_TELEMETRY_ENABLED;

  const validation = validateWysEvent(name, props);
  if (!validation.ok) {
    reportRefusal(validation.refusal, validation.detail, name, options);
    return { sent: false, buffered: false, refusal: validation.refusal, detail: validation.detail };
  }

  if (!enabled) return { sent: false, buffered: false, refusal: "telemetry-disabled", detail: String(name) };
  if (!measurementIdIsSet()) {
    return { sent: false, buffered: false, refusal: "no-measurement-id", detail: String(name) };
  }
  if (typeof window === "undefined") {
    return { sent: false, buffered: false, refusal: "no-window", detail: String(name) };
  }
  if (!analyticsConsentGranted()) {
    return { sent: false, buffered: false, refusal: "consent-not-granted", detail: String(name) };
  }

  if (buffer.length >= MAX_BUFFERED_EVENTS) {
    return { sent: false, buffered: false, refusal: "telemetry-disabled", detail: "buffer-full" };
  }

  buffer.push({ name: validation.name, props: validation.props });
  const drained = flushWysTelemetry();
  if (drained > 0) return { sent: true };

  schedulePoll();
  return { sent: false, buffered: true };
}

/** How many events are waiting on `ga4-init`. Inspectable by test. */
export function bufferedWysEventCount(): number {
  return buffer.length;
}

/**
 * Test-only reset. Nothing in `app/` or `components/` calls it; it exists so a
 * test file can start from a known buffer state without reaching into module
 * internals.
 */
export function resetWysTelemetryForTests(): void {
  buffer = [];
  pollAttempts = 0;
  pollScheduled = false;
}

/* -------------------------------------------------------------------------- */
/* 7. The decision-use table (§8.7; WYS §31, §19)                             */
/* -------------------------------------------------------------------------- */

/**
 * (WYS §31) — metrics are DIAGNOSTIC, not targets. Do not claim learning
 * efficacy merely because people stay longer, click more, use more features,
 * agree with Ben, like the site, or complete assisted questions.
 *
 * This table lives beside the allowlist on purpose. It carries three things
 * that exist nowhere else:
 *
 *  - the **firing point** for all thirteen names. §19.4 lists event NAMES and
 *    §19.1A lists CATEGORIES; neither names a trigger, so "wire the events at
 *    the points §19.4 names" names nothing, and `wys_view`, `wys_start` and
 *    `wys_carry_reached` would simply never be wired.
 *  - the **decision use** — what the number would change — via the §19
 *    justification chain TASK → NECESSITY → EXPOSURE → WHY → WHY-NOT →
 *    JUDGMENT.
 *  - the **upstream question** each row answers, from (WYS §2.1)'s experiment
 *    questions, which are the stated justification for the allowlist existing
 *    at all.
 *
 * Reproduced in the §38 report, whose item 5 requires "exact analytics events
 * now sent" — including the two deliberately unfired rows.
 */
export interface WysDecisionUse {
  event: WysEventName;
  /** Whether anything in v0 fires it. Two rows are deliberately `false`. */
  firedInV0: boolean;
  /** The trigger. Authored where the spec names none — reported as authored. */
  firesWhen: string;
  /** The (WYS §2.1) experiment question this row answers. */
  question: string;
  /** TASK — what is being decided. */
  task: string;
  /** NECESSITY — why a signal is needed at all. */
  necessity: string;
  /** EXPOSURE — what leaves the device. */
  exposure: string;
  /** WHY — the case for collecting it. */
  why: string;
  /** WHY-NOT — the case against, kept at source strength. */
  whyNot: string;
  /** JUDGMENT — what was decided, and its limit. */
  judgment: string;
}

export const WYS_DECISION_USE: readonly WysDecisionUse[] = [
  {
    event: "wys_view",
    firedInV0: false,
    firesWhen:
      "Nothing fires it. The preserved GA4 config sets send_page_view: true, so every WYS route already produces a page_view; a second event on the same trigger double-counts one fact and adds no decision.",
    question: "Do people start?",
    task: "Decide whether WYS route views need a separate counter from site route views.",
    necessity: "Not necessary in v0 - the page_view already exists and carries the route.",
    exposure: "Nothing. The event is wired-but-unfired and asserted unfired by test.",
    why: "It is on the closed §19.4 list, and the list is reproduced verbatim rather than trimmed.",
    whyNot: "Double-counting one fact makes both numbers harder to read, and the extra event buys no decision.",
    judgment:
      "Keep the name, fire nothing. If WYS route views ever need separating from site route views, that is a route_type dimension question, not a second event."
  },
  {
    event: "wys_start",
    firedInV0: true,
    firesWhen: "The learner opens /watch-your-step/start step 1, once per session.",
    question: "Do people start?",
    task: "Decide whether the landing page converts to an actual start.",
    necessity: "Landing-to-start is the first experiment question and cannot be derived from page views alone.",
    exposure: "The event name plus route_type. No learner input.",
    why: "If people read the landing and never start, the problem is the landing, not the curriculum.",
    whyNot: "A start count invites treating starts as a target rather than a diagnostic.",
    judgment: "Fire it. Read it only against the landing, never as a success metric."
  },
  {
    event: "wys_onboarding_complete",
    firedInV0: true,
    firesWhen: "Lesson Zero step 10 completes and onboarding.completed flips true.",
    question: "Do they get through Lesson Zero?",
    task: "Decide whether Lesson Zero's ten steps are too long or too demanding.",
    necessity: "Start-minus-complete is the only way to see the drop without asking anyone anything.",
    exposure: "The event name. Not the posture choice, not the cadence, not the time budget.",
    why: "Lesson Zero is the whole admission ritual; if it loses people, nothing downstream matters.",
    whyNot: "Completion could be inflated by trimming the ritual, which would defeat its purpose.",
    judgment: "Fire it. A fall in completion is a prompt to look at the steps, never a licence to remove them."
  },
  {
    event: "wys_source_period_start",
    firedInV0: true,
    firesWhen: "First render of a stop's first visit (stop/[stopId] or Today), once per source_period_id.",
    question: "Which lessons lose them?",
    task: "Decide which source period to revise first.",
    necessity: "Per-stop start counts are the only per-stop signal that does not require a learner answer.",
    exposure: "source_period_id (a closed-vocabulary id) and content_version. No learner input.",
    why: "Started-not-completed localises a problem to one stop instead of to the course.",
    whyNot: "A per-stop id is one step closer to a per-learner sequence if it were ever joined to an identifier.",
    judgment: "Fire it with no identifier of any kind, so no sequence can be reconstructed vendor-side."
  },
  {
    event: "wys_source_period_complete",
    firedInV0: true,
    firesWhen: "The stop's cadence path is fully marked complete.",
    question: "Which lessons lose them?",
    task: "Decide whether a stop's cadence path is achievable at the chosen cadence.",
    necessity: "Completion is the other half of the start count; neither is readable alone.",
    exposure: "source_period_id and content_version.",
    why: "A stop that starts well and completes badly is a length or difficulty problem, and it is fixable.",
    whyNot: "Completion rate is the easiest number on this list to optimise dishonestly.",
    judgment: "Fire it. It is diagnostic. Do not tune the curriculum to it."
  },
  {
    event: "wys_course_complete",
    firedInV0: true,
    firesWhen: "Stop H terminal surface reaches its completed state.",
    question: "Do they complete the finite path?",
    task: "Decide whether a finite, human-authored path is something people finish.",
    necessity: "It is the headline experiment question and has no proxy.",
    exposure: "The event name and content_version.",
    why: "The whole v0 bet is that a finite path beats an endless one.",
    whyNot: "Completion is not learning. Treating it as evidence of judgment would be the §31 error exactly.",
    judgment: "Fire it. It answers 'do they finish', and nothing about whether it worked."
  },
  {
    event: "wys_replay",
    firedInV0: true,
    firesWhen: "Practice starts a replay in either deterministic mode.",
    question: "Do they use replay?",
    task: "Decide whether deterministic replay earns its build cost.",
    necessity: "Replay is a distinct feature with its own maintenance cost and no other signal.",
    exposure: "The event name. Not which scenario, not the choice, not the revision.",
    why: "If nobody replays, the feature is a cost with no return.",
    whyNot: "Replay counts could be read as engagement and then chased.",
    judgment: "Fire it. Read it as a build-cost question only."
  },
  {
    event: "wys_carry_reached",
    firedInV0: true,
    firesWhen: "The CARRY card renders in its actionable state (reached, NOT marked).",
    question: "Do they reach CARRY / off-site practice?",
    task: "Decide whether the course reaches the point where it asks for off-site practice.",
    necessity: "CARRY is where the curriculum leaves the screen; reaching it is the last on-site fact available.",
    exposure: "The event name and source_period_id.",
    why: "Reaching CARRY is the closest on-site proxy for the course doing its job.",
    whyNot: "It is a proxy. Reaching a card is not carrying anything into a real decision.",
    judgment:
      "Fire on RENDER, not on 'marked done' - a self-marked completion would be a weaker fact dressed as a stronger one. No efficacy claim rests on it."
  },
  {
    event: "wys_transfer_check_complete",
    firedInV0: false,
    firesWhen: "A transfer check is marked complete. No transfer-check UI ships in v0, so this is wired and unfired.",
    question: "Do they demonstrate interest in additional depth?",
    task: "Decide, later, whether delayed unaided transfer is measurable at all.",
    necessity: "Not necessary in v0 - the surface it would measure is deferred (Q24).",
    exposure: "Nothing. Asserted unfired by test alongside wys_view.",
    why: "It is on the closed §19.4 list and the deferral should not quietly drop the name.",
    whyNot: "Wiring a firing point for a UI that does not exist would fabricate a number.",
    judgment: "Keep the name, fire nothing, and record the deferral rather than the number."
  },
  {
    event: "wys_data_manifest_view",
    firedInV0: true,
    firesWhen: "/watch-your-step/data first render per session.",
    question: "Will people engage with a privacy-minimizing curriculum they do not have to trust?",
    task: "Decide whether inspectability is a feature people actually use.",
    necessity: "The Data page is a curriculum feature, not a settings page; nothing else shows whether it is read.",
    exposure: "The event name and route_type. Never the contents of the page, which are the learner's own state.",
    why: "If nobody opens it, the transparency argument is being made to nobody.",
    whyNot: "Counting views of the privacy page is itself a thing a sceptical reader would want disclosed.",
    judgment: "Fire it, and disclose it on that same page. Nothing about what it displayed is sent."
  },
  {
    event: "wys_local_state_clear",
    firedInV0: true,
    firesWhen: "clearAllWysData() completes.",
    question: "Will people engage without having to trust an AI Coach?",
    task: "Decide whether the clear control is discoverable and trusted enough to use.",
    necessity: "A control nobody can find is indistinguishable from a control that does not exist.",
    exposure: "The event name. Not what was cleared.",
    why: "Use of the erase control is direct evidence that the inspect-and-erase promise is legible.",
    whyNot: "It fires at the moment a learner asked to be forgotten, which deserves the narrowest possible payload.",
    judgment: "Fire the bare name only, and never claim it erased hosting or GA4 logs."
  },
  {
    event: "wys_restart_course",
    firedInV0: true,
    firesWhen: "restartCourse() completes.",
    question: "Do they return?",
    task: "Decide whether restart and clear are distinguishable to a learner in practice.",
    necessity: "Restart and clear are deliberately different operations; only usage shows whether that lands.",
    exposure: "The event name, and nothing about what was restarted or what survived it.",
    why: "Restarts chosen instead of clears suggest the two explanations are working.",
    whyNot: "Restart could also be a symptom of confusion, and the event cannot tell the two apart.",
    judgment: "Fire it, and read it beside wys_local_state_clear rather than alone."
  },
  {
    event: "wys_depth_interest",
    firedInV0: true,
    firesWhen: "The appetite pill is committed.",
    question:
      "Do they ask for individualized challenge, replay variation, source checking or pressure testing strongly enough to justify a Studio experiment?",
    task: "Decide whether a deeper layer is worth building at all.",
    necessity: "It is the one signal (WYS §2.1) names as gating a Studio experiment.",
    exposure: "The event name. Not the free-text reason - (WYS §19.4): do not send the user's textual reason.",
    why: "The v0 site is an evidence surface for whether a deeper AI layer is worth building.",
    whyNot: "An appetite pill is a cheap click, and the threshold that would justify a Studio experiment is itself an open Ben decision (§35 item 13).",
    judgment: "Fire the bare name. It contributes to a decision Ben makes, and it does not make it."
  }
];

/** The two rows §8.7 marks deliberately unfired in v0. Asserted by test. */
export const WYS_UNFIRED_IN_V0: readonly WysEventName[] = WYS_DECISION_USE.filter(
  (row) => !row.firedInV0
).map((row) => row.event);

/* -------------------------------------------------------------------------- */
/* 8. What is never collected (§8.5; WYS §19.3)                               */
/* -------------------------------------------------------------------------- */

/**
 * Never added, with GA4 present: user_id, custom persistent visitor IDs,
 * advertising personalization, remarketing, Google Signals solely for WYS,
 * cross-domain identity linking solely for WYS, raw learner choices, personal
 * text, rulebook content, detailed private state.
 *
 * Also never collected: from-memory scratch text, personal situations, raw
 * prompts, names, employer, emails, screenshots, uploads, microphone data, a
 * server-side copy of the rulebook, a transcript of the learner's course.
 *
 * And - load-bearing, because the preserved config sets `send_page_view: true`
 * so `page_location` (query string included) and `page_title` reach GA4 on every
 * route, OUTSIDE this adapter and outside its allowlist:
 *
 * > **No posture choice, cadence, time budget, scenario answer, judgment,
 * > rulebook value or any other learner input may ever appear in a path
 * > segment, a query parameter, or a page title. Lesson Zero step state is a
 * > step INDEX only.**
 *
 * That rule is enforced statically by `tests/no-private-state-in-urls.test.ts`,
 * not by this module - no adapter can police a URL it never sees.
 */
export const WYS_NEVER_COLLECTED: readonly string[] = [
  "user_id",
  "custom persistent visitor IDs",
  "advertising personalization",
  "remarketing",
  "Google Signals solely for WYS",
  "cross-domain identity linking solely for WYS",
  "raw learner choices",
  "personal text",
  "rulebook content",
  "detailed private state",
  "from-memory scratch text",
  "personal situations",
  "raw prompts",
  "names",
  "employer",
  "emails",
  "screenshots",
  "uploads",
  "microphone data",
  "a server-side copy of the rulebook",
  "a transcript of the learner's course"
];
