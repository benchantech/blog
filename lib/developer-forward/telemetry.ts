/**
 * The Developer Forward Lite telemetry adapter (plan §8; PRIVACY_ANALYTICS.md;
 * layer-07 `routes-telemetry-wys.BEN_APPROVED.json`).
 *
 * Structurally identical to `lib/wys/telemetry.ts`, and for the same reason: it
 * is a REFUSAL first and a sender second. The allowlists below are closed, and
 * every path that is not explicitly permitted drops the event.
 *
 * The governing sentence is PRIVACY_ANALYTICS.md's: **"Measure the funnel, not
 * the learner."** Everything here follows from it. The funnel is where somebody
 * stopped; the learner is what they chose, wrote, scored and kept, and none of
 * that appears in any payload this module can construct.
 *
 * WHY A SECOND ADAPTER RATHER THAN A SHARED ONE. The layer-07 ruling sets
 * `inheritExistingBenChanTechBoundary: true` and `changeSitewideGA4Config:
 * false`, so Developer Forward layers ON TOP of the same frozen bootstrap that
 * Watch Your Step layers on. It does not share WYS's adapter. Two products with
 * one adapter means one product's allowlist edit silently changes the other's
 * exposure, and neither can be disabled without disabling both. What IS shared
 * is imported rather than copied: `CONSENT_STORAGE_KEY` comes from the browser
 * key registry, so there is still exactly one consent store on this origin.
 *
 * WHY EVERY NAME IS `df_`-PREFIXED (plan §8). Both products report into one GA4
 * stream. `reference-ts/analytics.ts` names the seventeen events without a
 * prefix — `case_reached`, `answer_changed` — which are exactly the names a
 * third surface would also reach for. The prefix is what keeps two products'
 * counts from being added together by accident in a property nobody can
 * partition after the fact.
 *
 * WHAT DELIBERATELY HAS NO EVENT HERE. PRIVACY_ANALYTICS.md permits "route
 * viewed". It gets no adapter event: `components/GoogleAnalytics.tsx` is
 * byte-frozen with `send_page_view: true`, so every Lite route already produces
 * a `page_view`, and a second event on the same trigger double-counts one fact
 * and buys no decision. The same file's Consent Mode v2 defaults, hardcoded
 * `ad_*` denials, `ads_data_redaction`, `anonymize_ip`, measurement ID and
 * stream are untouched by this module and are asserted byte-frozen by
 * `tests/analytics-frozen.test.ts`.
 *
 * Four structural guarantees, mirrored from the WYS adapter because they are
 * what made that one auditable:
 *
 *  1. **Closed event allowlist** — seventeen names, one per member of
 *     `reference-ts/analytics.ts`'s `LiteAnalyticsEvent` union, in that union's
 *     order. Do not add a name; do not remove one.
 *  2. **Closed property allowlist with VALUE domains, not just key names.** A
 *     key allowlist alone would happily carry a learner's sentence under
 *     `app_version`. The four domains are what actually make "never accept
 *     free-text properties" true rather than aspirational. The canary
 *     `DO_NOT_SEND_TF_TEST` fails every one of them.
 *  3. **snake_case is the wire format.** `reference-ts/analytics.ts` declares
 *     its fields camelCase (`caseNumber`, `appVersion`); the repo's GA4 wire
 *     format is snake_case. This adapter accepts and emits snake_case ONLY and
 *     ships no mapping shim — a shim is a second place a property name can be
 *     spelled, which is one more than an allowlist can police. A camelCase key
 *     is refused as an unknown property.
 *  4. **Fails closed in production, loud in development.** The refusal happens
 *     in both; only the noise is conditional. Read the other way round it would
 *     let an unlisted property through in production, which defeats the point
 *     of having an allowlist at all.
 *
 * NO NETWORK PRIMITIVE IS REFERENCED ANYWHERE IN THIS MODULE. It pushes onto
 * `window.dataLayer` and needs nothing else, which is what lets plan §14's
 * static check over `lib/developer-forward/` be a check rather than a promise —
 * this repo has no browser test harness, so a request spy is not available and
 * the static absence of every request-issuing API is the guarantee that can
 * actually be enforced here.
 *
 * Pure TypeScript. No React, no JSX, no CSS import, no component import — the
 * suite runs as `node --import tsx --test tests/*.test.ts` and Node cannot load
 * a `.css` specifier, so any module that reaches a stylesheet takes its whole
 * test file down.
 */

import { CONSENT_STORAGE_KEY } from "@/lib/wys/browser-keys";

/* -------------------------------------------------------------------------- */
/* 1. The event allowlist (plan §8; reference-ts/analytics.ts)                 */
/* -------------------------------------------------------------------------- */

/**
 * The wire prefix. Exported so a test can assert the property rather than
 * re-spell it, and so the "two products, one stream" rule is inspectable.
 */
export const TF_EVENT_PREFIX = "df_";

/**
 * The closed list — seventeen names, each the reference union's member name
 * with `TF_EVENT_PREFIX` applied, in union order.
 *
 * `df_case5_completed` keeps the reference's `case5` spelling rather than being
 * normalised to `case_5`: the union member is the authority for the name, and a
 * tidier spelling here would be a second name for one event.
 */
export const TF_EVENT_NAMES = [
  "df_lite_started",
  "df_case_reached",
  "df_decision_completed",
  "df_reflection_shown",
  "df_reflection_skipped",
  "df_reflection_always_skip",
  "df_reflection_reenabled",
  "df_navigation_back",
  "df_answer_changed",
  "df_downstream_scenario_invalidated",
  "df_downstream_scenario_resolved",
  "df_case5_completed",
  "df_ship_result_viewed",
  "df_markdown_export_clicked",
  "df_json_export_clicked",
  "df_copy_summary_clicked",
  "df_full_developer_forward_clicked"
] as const;

export type DeveloperForwardEventName = (typeof TF_EVENT_NAMES)[number];

/* -------------------------------------------------------------------------- */
/* 2. The property allowlist (plan §8) — keys AND value domains                */
/* -------------------------------------------------------------------------- */

/**
 * The closed property key list. Four keys, all ordinals or a version stamp.
 *
 * Note what is NOT here and cannot be added by a call site: there is no
 * `option_id`, no `variant_id`, no `ship_code`, no `handle`, no `session_id`
 * and no free-text key of any kind. PRIVACY_ANALYTICS.md permits "decision
 * ordinal allowed, selected option forbidden", and the way that is made true is
 * that the selected option has nowhere to go.
 */
export const TF_PROPERTY_KEYS = ["case_number", "decision_number", "from_case_number", "app_version"] as const;

export type DeveloperForwardPropertyKey = (typeof TF_PROPERTY_KEYS)[number];

/**
 * The typed call-site shape. An object literal with any other key is a COMPILE
 * error (excess property checking), so passing a whole `LiteDataset`, a
 * `LiteResult`, a `Receipt` or a reflection draft never reaches the runtime
 * refusal in the first place. The runtime refusal exists anyway, for values
 * arriving as `unknown` from a boundary the compiler does not see.
 */
export interface DeveloperForwardEventProperties {
  case_number?: number;
  decision_number?: number;
  from_case_number?: number;
  app_version?: string;
}

/** A version stamp: starts with a digit ("1.0.0", "2026-09-07", "3"). */
const APP_VERSION = /^[0-9][0-9a-z.-]{0,31}$/;

/**
 * Value-domain validation, one entry per allowlisted key. Total by
 * construction: `Record<DeveloperForwardPropertyKey, …>` means adding a key to the
 * allowlist without giving it a domain is a compile error, not an oversight.
 *
 * The two case bounds are 1–5 because Lite is five cases, and the decision
 * bound is 1–3 because Case 5 is the only case with three decisions. They are
 * ordinals within a case, never a `DecisionId` — `C2D1` as a string would be a
 * finer-grained fact than the funnel needs.
 */
const PROPERTY_DOMAINS: Record<DeveloperForwardPropertyKey, (value: unknown) => boolean> = {
  case_number: (value) => typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5,
  decision_number: (value) => typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 3,
  from_case_number: (value) => typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5,
  app_version: (value) => typeof value === "string" && APP_VERSION.test(value)
};

/* -------------------------------------------------------------------------- */
/* 3. Validation — pure, exported, and the thing the tests hammer              */
/* -------------------------------------------------------------------------- */

export type DeveloperForwardRefusal =
  | "telemetry-disabled"
  | "unknown-event"
  | "props-not-a-plain-object"
  | "unknown-property"
  | "invalid-property-value"
  | "no-measurement-id"
  | "consent-not-granted"
  | "no-window";

export type DeveloperForwardValidation =
  | { ok: true; name: DeveloperForwardEventName; props: DeveloperForwardEventProperties }
  | { ok: false; refusal: DeveloperForwardRefusal; detail: string };

function isEventName(name: unknown): name is DeveloperForwardEventName {
  return typeof name === "string" && (TF_EVENT_NAMES as readonly string[]).includes(name);
}

/**
 * Reject the event name, reject every unlisted key, reject every out-of-domain
 * value, and NEVER spread the incoming object — the returned `props` is rebuilt
 * key by key from the allowlist, so nothing unlisted can survive even if a
 * later edit forgets a check. A spread would make the allowlist advisory.
 */
export function validateDeveloperForwardEvent(name: unknown, props: unknown = {}): DeveloperForwardValidation {
  if (!isEventName(name)) {
    return { ok: false, refusal: "unknown-event", detail: String(name) };
  }

  if (props === null || typeof props !== "object" || Array.isArray(props)) {
    return { ok: false, refusal: "props-not-a-plain-object", detail: Array.isArray(props) ? "array" : typeof props };
  }

  const incoming = props as Record<string, unknown>;
  for (const key of Object.keys(incoming)) {
    if (!(TF_PROPERTY_KEYS as readonly string[]).includes(key)) {
      return { ok: false, refusal: "unknown-property", detail: key };
    }
  }

  const clean: DeveloperForwardEventProperties = {};
  for (const key of TF_PROPERTY_KEYS) {
    if (!(key in incoming)) continue;
    const value = incoming[key];
    if (value === undefined) continue;
    if (!PROPERTY_DOMAINS[key](value)) {
      return { ok: false, refusal: "invalid-property-value", detail: key };
    }
    if (key === "case_number") clean.case_number = value as number;
    else if (key === "decision_number") clean.decision_number = value as number;
    else if (key === "from_case_number") clean.from_case_number = value as number;
    else clean.app_version = value as string;
  }

  return { ok: true, name, props: clean };
}

/* -------------------------------------------------------------------------- */
/* 4. The gates — all fail closed                                             */
/* -------------------------------------------------------------------------- */

/**
 * One constant. Flipping it to `false` silences every Developer Forward event
 * everywhere without touching a component, and without touching Watch Your
 * Step's separate switch — which is the practical reason the two adapters are
 * separate files.
 */
export const TF_TELEMETRY_ENABLED = true;

/** The measurement ID is the sole GA gate, exactly as the preserved code has it. */
export function measurementIdIsSet(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
}

/**
 * Full suppression unless the visitor explicitly granted analytics.
 * Unreadable, absent, or thrown all mean DO NOT SEND — the gate fails closed on
 * a `localStorage` exception (iOS Safari private browsing throws on access).
 *
 * This reads the SAME key the site's own consent banner writes
 * (`bct_analytics_consent`, imported from the browser key registry so there is
 * one spelling of it in the repo). "Inherit the existing benchantech boundary"
 * is the layer-07 ruling, and inheriting a boundary means adopting the stricter
 * behaviour the first product already established, not re-deriving a looser one
 * for the second.
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
/* 5. Emit shape and the flush rule                                            */
/* -------------------------------------------------------------------------- */

/**
 * Push to `window.dataLayer` rather than calling `window.gtag?.()`.
 *
 * Both GA scripts load `strategy="afterInteractive"`, so an event fired from a
 * first-paint effect — `df_lite_started` is exactly that — can run before
 * `ga4-init` defines `window.gtag`, and `window.gtag?.(…)` would silently drop
 * the first event of every session. `ga4-init` itself does
 * `window.dataLayer = window.dataLayer || []`, so earlier pushes survive.
 *
 * The shim is **arguments-shaped** so the queued entry is byte-identical to
 * what `gtag()` would have pushed: gtag.js consumes `arguments` objects, and a
 * plain array is not documented as equivalent. The claim is UNVERIFIED against
 * a live GA4 DebugView stream — the same open check `types/gtag.d.ts` and
 * `lib/wys/telemetry.ts` already record, and plan §8's Q-B. If the check ever
 * shows a tuple is equivalent, both adapters change together.
 *
 * Written with no parameter list at all (the body IS `arguments`) and no
 * `as any`: a declared-but-unread rest parameter would fail `no-unused-vars`.
 */
type DeveloperForwardGtagEventArgs = ["event", DeveloperForwardEventName, DeveloperForwardEventProperties];

const pushGtagArguments: (...args: DeveloperForwardGtagEventArgs) => void = function () {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(arguments);
};

/**
 * The sentinel: `ga4-init`'s own `gtag('config', …)` command, already sitting
 * in `dataLayer`.
 *
 * An `onReady` callback was rejected because it would edit
 * `components/GoogleAnalytics.tsx`, which is byte-frozen. Polling for the
 * marker requires no edit to that file at all.
 *
 * Why it matters: gtag.js processes queued `event` commands with **no
 * configured destination** if they precede the `config` command. A returning
 * visitor with `bct_analytics_consent === "granted"` passes the consent gate
 * immediately and would otherwise lose exactly the first event the buffer
 * exists to save. It also closes the consent-ordering hazard by construction:
 * nothing is pushed before `ga4-init` at all, so nothing can land ahead of
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

interface BufferedDeveloperForwardEvent {
  name: DeveloperForwardEventName;
  props: DeveloperForwardEventProperties;
}

let buffer: BufferedDeveloperForwardEvent[] = [];
let pollAttempts = 0;
let pollScheduled = false;

/**
 * Drain the buffer, in order, ONLY once `ga4-init`'s config marker exists.
 * Returns how many events were pushed. Safe to call at any time.
 */
export function flushDeveloperForwardTelemetry(): number {
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
    if (flushDeveloperForwardTelemetry() === 0 && buffer.length > 0) schedulePoll();
  }, FLUSH_POLL_INTERVAL_MS) as unknown as { unref?: () => void };
  // Node's timer keeps the test process alive; the browser's number has no unref.
  handle.unref?.();
}

/* -------------------------------------------------------------------------- */
/* 6. trackDeveloperForward                                                       */
/* -------------------------------------------------------------------------- */

export type DeveloperForwardTrackResult =
  | { sent: true }
  | { sent: false; buffered: true }
  | { sent: false; buffered: false; refusal: DeveloperForwardRefusal; detail: string };

export interface TrackDeveloperForwardOptions {
  /** Test/preview override for the global kill switch. Components pass nothing. */
  enabled?: boolean;
  /**
   * Where the LOUD development failure goes. Supplying one REPLACES the console
   * report, which is how the tests stay quiet while still asserting loudness.
   */
  onRefusal?: (refusal: DeveloperForwardRefusal, detail: string, event: unknown) => void;
}

function reportRefusal(
  refusal: DeveloperForwardRefusal,
  detail: string,
  event: unknown,
  options: TrackDeveloperForwardOptions
): void {
  if (options.onRefusal) {
    options.onRefusal(refusal, detail, event);
    return;
  }
  // Loud in development, silent in production — but DROPPED in both. The detail
  // is an allowlisted key name, an event name or a type name; it is never the
  // refused value, so a refused free-text value is not echoed into a console or
  // a log either. A learner's reflection must not survive as a warning string.
  if (process.env.NODE_ENV !== "production" && typeof console !== "undefined") {
    console.warn(`[developer-forward-telemetry] refused: ${refusal} (${detail})`);
  }
}

/**
 * The one call site every component uses.
 *
 * ```ts
 * trackDeveloperForward("df_decision_completed", { case_number, decision_number, app_version });
 * ```
 *
 * Order of refusal is deliberate: shape first (so a mis-wired call is loud in
 * development even for a visitor who declined analytics), then the gates.
 */
export function trackDeveloperForward(
  name: DeveloperForwardEventName,
  props: DeveloperForwardEventProperties = {},
  options: TrackDeveloperForwardOptions = {}
): DeveloperForwardTrackResult {
  const enabled = options.enabled ?? TF_TELEMETRY_ENABLED;

  const validation = validateDeveloperForwardEvent(name, props);
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
  const drained = flushDeveloperForwardTelemetry();
  if (drained > 0) return { sent: true };

  schedulePoll();
  return { sent: false, buffered: true };
}

/**
 * The name `reference-ts/analytics.ts` gives this function, kept as an alias so
 * a call site written against the reference package resolves to THIS adapter
 * rather than to a second, unpoliced one. It is an alias for the function only;
 * there is deliberately no alias for any event or property name, because those
 * are the wire format and a second spelling of a wire name is exactly what the
 * "no mapping shim" rule forbids.
 *
 * So the SIGNATURE is this module's, not the reference's: a `df_`-prefixed name
 * and snake_case props. A reference-shaped call — `trackLite({ name:
 * "case_reached", caseNumber, appVersion })` — is a compile error, which is the
 * intended outcome. A shim that quietly accepted it would put the camelCase
 * spelling back in play.
 */
export const trackLite = trackDeveloperForward;

/** How many events are waiting on `ga4-init`. Inspectable by test. */
export function bufferedDeveloperForwardEventCount(): number {
  return buffer.length;
}

/**
 * Test-only reset. Nothing in `app/` or `components/` calls it; it exists so a
 * test file can start from a known buffer state without reaching into module
 * internals.
 */
export function resetDeveloperForwardTelemetryForTests(): void {
  buffer = [];
  pollAttempts = 0;
  pollScheduled = false;
}

/* -------------------------------------------------------------------------- */
/* 7. The event-use table (PRIVACY_ANALYTICS.md "Allowed server analytics")    */
/* -------------------------------------------------------------------------- */

/**
 * What each event is for, when it fires, and what it carries.
 *
 * This table exists because `reference-ts/analytics.ts` declares seventeen
 * payload SHAPES and PRIVACY_ANALYTICS.md lists seventeen permitted FACTS, and
 * neither names a trigger. "Wire the events the reference names" therefore
 * names no firing point at all, and the four events that fire on a state the
 * learner never clicks — `df_reflection_shown`, `df_downstream_scenario_*`,
 * `df_ship_result_viewed` — would each be wired to a different guess.
 *
 * `firesWhen` is IMPLEMENTATION-AUTHORED under the approved rule, derived from
 * the permitted-facts list; it is reported as authored rather than sourced.
 * `carries` is not authored — it restates the reference union member, and a row
 * that disagrees with `TF_PROPERTY_KEYS` is a bug in this table.
 *
 * `docs/legal-analytics.md` reproduces the seventeen names and four properties;
 * this table is the machine-readable side of the same disclosure.
 */
export interface DeveloperForwardEventUse {
  event: DeveloperForwardEventName;
  /** The trigger. Authored where the package names none — reported as authored. */
  firesWhen: string;
  /** The allowlisted properties this event carries, per the reference union. */
  carries: readonly DeveloperForwardPropertyKey[];
  /** The funnel question the count answers. Never a question about a person. */
  question: string;
}

export const TF_EVENT_USE: readonly DeveloperForwardEventUse[] = [
  {
    event: "df_lite_started",
    firesWhen: "The learner commits to starting Lite and the first case surface is entered.",
    carries: ["app_version"],
    question: "Does the landing convert into an actual start?"
  },
  {
    event: "df_case_reached",
    firesWhen: "A case surface is reached for the first time in this session.",
    carries: ["case_number", "app_version"],
    question: "Which case is the one people stop at?"
  },
  {
    event: "df_decision_completed",
    firesWhen: "A decision is committed. The ordinal is sent; the chosen option is not.",
    carries: ["case_number", "decision_number", "app_version"],
    question: "How far into a case do people get before they leave?"
  },
  {
    event: "df_reflection_shown",
    firesWhen: "A reflection prompt is rendered after a committed decision.",
    carries: ["case_number", "app_version"],
    question: "How often is the optional reflection actually offered?"
  },
  {
    event: "df_reflection_skipped",
    firesWhen: "A rendered reflection prompt is dismissed without a commit.",
    carries: ["case_number", "app_version"],
    question: "Is the reflection prompt earning its interruption?"
  },
  {
    event: "df_reflection_always_skip",
    firesWhen: "The learner turns reflection prompts off for the rest of the run.",
    carries: ["app_version"],
    question: "Do people opt out of reflection entirely rather than case by case?"
  },
  {
    event: "df_reflection_reenabled",
    firesWhen: "The learner turns reflection prompts back on.",
    carries: ["app_version"],
    question: "Is the opt-out reversible in practice, not just in principle?"
  },
  {
    event: "df_navigation_back",
    firesWhen: "The learner navigates backwards from a case. Only the case left is sent.",
    carries: ["from_case_number", "app_version"],
    question: "Where do people go back to reread?"
  },
  {
    event: "df_answer_changed",
    firesWhen: "An already-committed decision is answered again. Neither the old nor the new option is sent.",
    carries: ["case_number", "decision_number", "app_version"],
    question: "Which decisions do people revise?"
  },
  {
    event: "df_downstream_scenario_invalidated",
    firesWhen: "A change upstream invalidates a downstream variant. No variant id is sent.",
    carries: ["case_number", "app_version"],
    question: "How often does revising cost a learner work they had already done?"
  },
  {
    event: "df_downstream_scenario_resolved",
    firesWhen: "An invalidated downstream decision is answered again on its new variant.",
    carries: ["case_number", "app_version"],
    question: "Do people recover from an invalidation, or stop there?"
  },
  {
    event: "df_case5_completed",
    firesWhen: "The last decision of Case 5 is committed.",
    carries: ["app_version"],
    question: "Do people finish the finite path?"
  },
  {
    event: "df_ship_result_viewed",
    firesWhen: "The result surface renders. No code and no percentage is sent.",
    carries: ["app_version"],
    question: "Does completing and seeing the result come apart?"
  },
  {
    event: "df_markdown_export_clicked",
    firesWhen: "The Markdown export control is activated. Nothing about the file is sent.",
    carries: ["app_version"],
    question: "Do people take their record with them?"
  },
  {
    event: "df_json_export_clicked",
    firesWhen: "The JSON export control is activated. Nothing about the file is sent.",
    carries: ["app_version"],
    question: "Is the machine-readable export used at all?"
  },
  {
    event: "df_copy_summary_clicked",
    firesWhen: "The copy-summary control is activated. The summary itself is never read by this module.",
    carries: ["app_version"],
    question: "Is copying preferred to downloading?"
  },
  {
    event: "df_full_developer_forward_clicked",
    firesWhen: "The onward CTA to the full Developer Forward is activated.",
    carries: ["app_version"],
    question: "Does Lite lead anywhere?"
  }
];

/* -------------------------------------------------------------------------- */
/* 8. What is never transmitted (PRIVACY_ANALYTICS.md "Never transmit")        */
/* -------------------------------------------------------------------------- */

/**
 * The refusal list, reproduced so it can be asserted rather than remembered.
 *
 * Two entries deserve their own sentence:
 *
 *  - **"detailed clickstream sufficient to reconstruct answers".** This is why
 *    `df_decision_completed` carries an ordinal and not a `DecisionId` plus an
 *    option: a long enough sequence of fine-grained events reconstructs the
 *    path even when no single event contains an answer.
 *  - **"completion as a learner identity attribute".** `/developer-forward` may
 *    read local completion to change its own UI — the layer-07 ruling permits
 *    that explicitly — but completion must never leave the device as a property
 *    of a person. The only completion fact that leaves is the count
 *    `df_case5_completed`, which is attached to nobody.
 *
 * And, load-bearing because the frozen config sets `send_page_view: true` so
 * `page_location` (query string included) and `page_title` reach GA4 on every
 * route, OUTSIDE this adapter and outside its allowlist:
 *
 * > **No selected option, variant id, axis state, SHIP code, percentage,
 * > reflection, handle, draft or session id may ever appear in a path segment,
 * > a query parameter, a hash or a page title. Lite is one static route with
 * > zero learner state in the URL.**
 *
 * That rule is enforced statically by `tests/no-private-state-in-urls.test.ts`,
 * not by this module — no adapter can police a URL it never sees.
 */
export const TF_NEVER_TRANSMITTED: readonly string[] = [
  "selected answer IDs or text",
  "variant IDs that reconstruct path",
  "axis states",
  "SHIP code or percentages",
  "reflections",
  "handle",
  "ledger or localStorage contents",
  "drafts",
  "local timestamps",
  "session IDs",
  "detailed clickstream sufficient to reconstruct answers",
  "cross-site advertising IDs",
  "intentional fingerprinting",
  "completion as a learner identity attribute"
];

/**
 * The other half of PRIVACY_ANALYTICS.md's instruction, which no allowlist in
 * this file can enforce because it is a property-level setting in the analytics
 * vendor's own UI, not a call this repo makes: **disable session replay,
 * automatic form/input/text capture, keystroke capture, and any URL/DOM
 * auto-capture that could leak learner state.**
 *
 * GA4's Enhanced Measurement (form-interaction and site-search sub-events) is
 * ON by default in the property UI and is invisible from this repo. It is the
 * launch-gate item Q-B — a console check on a staging deploy, not a unit test.
 * Exported so the disclosure surface can name it instead of implying that the
 * allowlist covers it.
 */
export const TF_VENDOR_SIDE_SETTINGS_NOT_ENFORCEABLE_HERE: readonly string[] = [
  "session replay",
  "automatic form, input and text capture",
  "keystroke capture",
  "URL or DOM auto-capture",
  "GA4 Enhanced Measurement sub-events"
];
