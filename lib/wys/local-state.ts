/**
 * Local state substrate (plan Phase 2, §7.1-§7.5).
 *
 * Pure TypeScript. No React, no JSX, no CSS import, no component import — the
 * same constraint Phase 1 works under, for the same reason: `package.json` runs
 * the suite as `node --import tsx --test tests/*.test.ts`, and Node cannot load
 * a `.css` specifier. The hook that consumes this module lives in
 * `components/wys/useWysState.ts`; everything load-bearing lives here so it can
 * be unit-tested without a renderer.
 *
 * Two goals, both structural rather than procedural:
 *
 *  1. **A learner dossier is impossible.** Minimization is enforced in the
 *     serializer, not at call sites (§7.2). A caller physically cannot persist
 *     an undeclared key, and — the half a naive version misses — cannot accrete
 *     free text under a *declared* key either, because every free-shaped
 *     declared field carries value-domain validation.
 *  2. **A `localStorage` read cannot reach the server render** (§7.3). Every
 *     browser-touching function here is guarded on `typeof window` and wrapped
 *     in `try/catch`, and returns a valid empty state on failure. iOS Safari in
 *     private browsing *throws* on `localStorage` access, and iPhone Safari at
 *     ~390 CSS px is the primary QA target.
 *
 * The one deliberate exception to (1): `rulebook[].text` IS learner-authored
 * free text and MUST round-trip intact. It is a declared, learner-owned local
 * field (WYS §16). What keeps it off the wire is the telemetry property
 * allowlist (§8.5, Phase 3), not this guard.
 */

/* -------------------------------------------------------------------------- */
/* 1. The shape (§7.1, verbatim from WYS §17)                                 */
/* -------------------------------------------------------------------------- */

/**
 * Verbatim from (WYS §17). Do not add a field to this interface — §5.3's visit
 * counter is DERIVED from content data plus completed IDs precisely so that
 * `progress` never grows a `visits` field.
 */
export interface WysLocalStateV1 {
  schemaVersion: 1;
  startedAt?: string;
  lastOpenedAt?: string;

  onboarding: {
    completed: boolean;
    postureChoice?: string;
    cadence?: "2" | "3" | "5" | "most";
    timeBudget?: "5" | "10" | "15" | "20plus";
  };

  progress: {
    completedLessonIds: string[];
    completedScenarioIds: string[];
    completedCarryIds: string[];
    replayCounts: Record<string, number>;
    transferCheckIds: string[];
  };

  localJudgments?: Record<
    string,
    {
      choiceKey: string;
      revisedChoiceKey?: string;
      updatedAt: string;
    }
  >;

  rulebook: Array<{
    id: string;
    text: string;
    createdAt: string;
    updatedAt: string;
  }>;

  ui: {
    lastRoute?: string;
    dismissedNotices?: string[];
  };

  appetite?: {
    deeperPracticeInterest?: boolean;
    recordedAt?: string;
  };
}

/**
 * Exactly the string the Data page prints as user-visible copy
 * (`key: wys:v1 · raw JSON ↓`, artboard `5c` card 1). The copy and the
 * implementation cannot be allowed to drift, so both read this constant.
 */
export const WYS_STORAGE_KEY = "wys:v1";

/** Every browser key this course owns starts here; `clearAllWysData()` sweeps the prefix. */
export const WYS_KEY_PREFIX = "wys:";

export const WYS_SCHEMA_VERSION = 1 as const;

export type WysCadence = NonNullable<WysLocalStateV1["onboarding"]["cadence"]>;
export type WysTimeBudget = NonNullable<WysLocalStateV1["onboarding"]["timeBudget"]>;

/** Closed union in the type; enforced at runtime too, because JSON is not typed. */
export const WYS_CADENCES: readonly WysCadence[] = ["2", "3", "5", "most"];
export const WYS_TIME_BUDGETS: readonly WysTimeBudget[] = ["5", "10", "15", "20plus"];

/** The nine declared top-level fields. §7.5's Data page mapping is total over this list. */
export type WysTopLevelField = keyof WysLocalStateV1;

export const WYS_TOP_LEVEL_FIELDS: readonly WysTopLevelField[] = [
  "schemaVersion",
  "startedAt",
  "lastOpenedAt",
  "onboarding",
  "progress",
  "localJudgments",
  "rulebook",
  "ui",
  "appetite"
];

/* -------------------------------------------------------------------------- */
/* 2. Value domains (§7.2)                                                    */
/* -------------------------------------------------------------------------- */

/**
 * The declared vocabularies the serializer validates free-shaped fields against.
 *
 * §7.2 sources these from `content/watch-your-step/config.ts`, which does not
 * exist until Phase 6. Rather than invent that module early (it carries Ben
 * content decisions §35.1/§35.2), the domains are a PARAMETER with a
 * **fail-closed** default: with no content wired, every ID domain is empty, so
 * a posture choice or a scenario ID is DROPPED rather than let through. Wiring
 * the real vocabularies in Phase 6 loosens the guard; forgetting to wire them
 * loses a preference, which is visible, instead of accreting a dossier, which
 * is not.
 *
 * Passing domains as an argument also avoids the import cycle a content-module
 * import would create (`content/*` imports these types back).
 */
export interface WysStateDomains {
  /** Declared posture option IDs (WYS §9.2 / artboard `5a` step 2). */
  postureChoiceIds: readonly string[];
  /** Declared scenario IDs — the domain for `replayCounts` keys and `localJudgments` keys. */
  scenarioIds: readonly string[];
  /** Declared choice keys — the domain for `choiceKey` / `revisedChoiceKey`. */
  choiceKeys: readonly string[];
  /** Declared dismissable notice IDs. */
  noticeIds: readonly string[];
  /** Declared stop IDs, which expand the `/watch-your-step/stop/<id>` route domain. */
  stopIds: readonly string[];
}

export const DEFAULT_WYS_STATE_DOMAINS: WysStateDomains = {
  postureChoiceIds: [],
  scenarioIds: [],
  choiceKeys: [],
  noticeIds: [],
  stopIds: []
};

/**
 * The static WYS routes. Same list `tests/no-private-state-in-urls.test.ts`
 * (Phase 3) uses, and the same set §5.4's route groups produce — route groups
 * do not affect URLs, so `(shell)` and `(flow)` never appear here.
 */
export const WYS_ROUTES: readonly string[] = [
  "/watch-your-step",
  "/watch-your-step/start",
  "/watch-your-step/end",
  "/watch-your-step/today",
  "/watch-your-step/plan",
  "/watch-your-step/progress",
  "/watch-your-step/practice",
  "/watch-your-step/data"
];

/**
 * A stable, content-derived identity for a domain set.
 *
 * `components/wys/useWysState.ts` depends on this rather than on the object
 * identity of `domains`. A caller that passes an inline object literal would
 * otherwise hand the effect a new dependency on every render, and the effect
 * calls `setSnapshot` with a freshly-parsed state object every time — an
 * infinite render loop in the one place a course screen cannot survive one.
 */
export function wysDomainsKey(domains: WysStateDomains): string {
  return [
    domains.postureChoiceIds,
    domains.scenarioIds,
    domains.choiceKeys,
    domains.noticeIds,
    domains.stopIds
  ]
    .map((list) => list.join(","))
    .join("|");
}

/** `/watch-your-step/stop/<stopId>` is the one dynamic segment (§5.3, §8.5). */
export function knownWysRoutes(domains: WysStateDomains = DEFAULT_WYS_STATE_DOMAINS): string[] {
  return [...WYS_ROUTES, ...domains.stopIds.map((id) => `/watch-your-step/stop/${id}`)];
}

/* -------------------------------------------------------------------------- */
/* 3. Shape predicates                                                        */
/* -------------------------------------------------------------------------- */

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * An identifier, not a sentence. No whitespace, so a From Memory scratch line
 * or a personal situation cannot be persisted under an ID-shaped declared key
 * (`completedLessonIds`, `rulebook[].id`, …) even before Phase 6 supplies the
 * real vocabularies. This is stricter than §7.2 requires and is recorded as an
 * addition in docs/facelift-build-notes.md.
 */
const ID_TOKEN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/;

export function isIdToken(value: unknown): value is string {
  return typeof value === "string" && ID_TOKEN.test(value);
}

/**
 * `startedAt`, `lastOpenedAt`, `createdAt`, `updatedAt` and `recordedAt` are
 * declared as bare `string` too, so they get a domain as well: an ISO-8601
 * instant and nothing else.
 */
const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/;

export function isIsoTimestamp(value: unknown): value is string {
  return typeof value === "string" && ISO_TIMESTAMP.test(value) && !Number.isNaN(Date.parse(value));
}

function uniqueIds(value: unknown, dropped: string[], at: string): string[] {
  if (!Array.isArray(value)) {
    if (value !== undefined) dropped.push(at);
    return [];
  }
  const out: string[] = [];
  for (const [index, entry] of value.entries()) {
    if (!isIdToken(entry)) {
      dropped.push(`${at}[${index}]`);
      continue;
    }
    if (!out.includes(entry)) out.push(entry);
  }
  return out;
}

function inDomain(value: unknown, domain: readonly string[]): value is string {
  return typeof value === "string" && domain.includes(value);
}

/* -------------------------------------------------------------------------- */
/* 4. The serializer's write-side allowlist (§7.2)                            */
/* -------------------------------------------------------------------------- */

/**
 * Declared keys, level by level. Anything not listed here is dropped on write —
 * that is the whole point: a future careless caller cannot accrete a learner
 * dossier by inventing a key.
 */
export const WYS_DECLARED_KEYS = {
  root: WYS_TOP_LEVEL_FIELDS,
  onboarding: ["completed", "postureChoice", "cadence", "timeBudget"],
  progress: [
    "completedLessonIds",
    "completedScenarioIds",
    "completedCarryIds",
    "replayCounts",
    "transferCheckIds"
  ],
  localJudgment: ["choiceKey", "revisedChoiceKey", "updatedAt"],
  rulebookEntry: ["id", "text", "createdAt", "updatedAt"],
  ui: ["lastRoute", "dismissedNotices"],
  appetite: ["deeperPracticeInterest", "recordedAt"]
} as const;

export interface SanitizeResult {
  state: WysLocalStateV1;
  /** Dot-paths of everything the serializer refused to persist. Diagnostic only. */
  dropped: string[];
}

/** A valid, empty, always-renderable state. The blocked-storage answer too (§7.3). */
export function emptyWysState(): WysLocalStateV1 {
  return {
    schemaVersion: WYS_SCHEMA_VERSION,
    onboarding: { completed: false },
    progress: {
      completedLessonIds: [],
      completedScenarioIds: [],
      completedCarryIds: [],
      replayCounts: {},
      transferCheckIds: []
    },
    rulebook: [],
    ui: {}
  };
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

function sanitizeOnboarding(
  input: unknown,
  domains: WysStateDomains,
  dropped: string[]
): WysLocalStateV1["onboarding"] {
  const out: WysLocalStateV1["onboarding"] = { completed: false };
  if (!isPlainObject(input)) {
    if (input !== undefined) dropped.push("onboarding");
    return out;
  }
  undeclared(input, WYS_DECLARED_KEYS.onboarding, dropped, "onboarding");

  out.completed = input.completed === true;

  // Declared, but typed as a bare `string` in the verbatim schema — the exact
  // hole §7.2 names. Only a declared posture option ID survives.
  if (input.postureChoice !== undefined) {
    if (inDomain(input.postureChoice, domains.postureChoiceIds)) out.postureChoice = input.postureChoice;
    else dropped.push("onboarding.postureChoice");
  }
  if (input.cadence !== undefined) {
    if (inDomain(input.cadence, WYS_CADENCES)) out.cadence = input.cadence as WysCadence;
    else dropped.push("onboarding.cadence");
  }
  if (input.timeBudget !== undefined) {
    if (inDomain(input.timeBudget, WYS_TIME_BUDGETS)) out.timeBudget = input.timeBudget as WysTimeBudget;
    else dropped.push("onboarding.timeBudget");
  }
  return out;
}

function sanitizeProgress(
  input: unknown,
  domains: WysStateDomains,
  dropped: string[]
): WysLocalStateV1["progress"] {
  const out = emptyWysState().progress;
  if (!isPlainObject(input)) {
    if (input !== undefined) dropped.push("progress");
    return out;
  }
  undeclared(input, WYS_DECLARED_KEYS.progress, dropped, "progress");

  out.completedLessonIds = uniqueIds(input.completedLessonIds, dropped, "progress.completedLessonIds");
  out.completedScenarioIds = uniqueIds(input.completedScenarioIds, dropped, "progress.completedScenarioIds");
  out.completedCarryIds = uniqueIds(input.completedCarryIds, dropped, "progress.completedCarryIds");
  out.transferCheckIds = uniqueIds(input.transferCheckIds, dropped, "progress.transferCheckIds");

  if (isPlainObject(input.replayCounts)) {
    for (const [key, value] of Object.entries(input.replayCounts)) {
      // KEYS are the domain-checked half; values are plain counts.
      if (!inDomain(key, domains.scenarioIds)) {
        dropped.push(`progress.replayCounts.${key}`);
        continue;
      }
      if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
        dropped.push(`progress.replayCounts.${key}`);
        continue;
      }
      out.replayCounts[key] = Math.floor(value);
    }
  } else if (input.replayCounts !== undefined) {
    dropped.push("progress.replayCounts");
  }

  return out;
}

function sanitizeLocalJudgments(
  input: unknown,
  domains: WysStateDomains,
  dropped: string[]
): WysLocalStateV1["localJudgments"] | undefined {
  if (input === undefined) return undefined;
  if (!isPlainObject(input)) {
    dropped.push("localJudgments");
    return undefined;
  }
  const out: NonNullable<WysLocalStateV1["localJudgments"]> = {};
  for (const [scenarioId, raw] of Object.entries(input)) {
    if (!inDomain(scenarioId, domains.scenarioIds)) {
      dropped.push(`localJudgments.${scenarioId}`);
      continue;
    }
    if (!isPlainObject(raw)) {
      dropped.push(`localJudgments.${scenarioId}`);
      continue;
    }
    undeclared(raw, WYS_DECLARED_KEYS.localJudgment, dropped, `localJudgments.${scenarioId}`);
    if (!inDomain(raw.choiceKey, domains.choiceKeys) || !isIsoTimestamp(raw.updatedAt)) {
      dropped.push(`localJudgments.${scenarioId}`);
      continue;
    }
    const entry: NonNullable<WysLocalStateV1["localJudgments"]>[string] = {
      choiceKey: raw.choiceKey,
      updatedAt: raw.updatedAt
    };
    if (raw.revisedChoiceKey !== undefined) {
      if (inDomain(raw.revisedChoiceKey, domains.choiceKeys)) entry.revisedChoiceKey = raw.revisedChoiceKey;
      else dropped.push(`localJudgments.${scenarioId}.revisedChoiceKey`);
    }
    out[scenarioId] = entry;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function sanitizeRulebook(input: unknown, dropped: string[]): WysLocalStateV1["rulebook"] {
  if (!Array.isArray(input)) {
    if (input !== undefined) dropped.push("rulebook");
    return [];
  }
  const out: WysLocalStateV1["rulebook"] = [];
  for (const [index, raw] of input.entries()) {
    if (!isPlainObject(raw)) {
      dropped.push(`rulebook[${index}]`);
      continue;
    }
    undeclared(raw, WYS_DECLARED_KEYS.rulebookEntry, dropped, `rulebook[${index}]`);
    // `text` is the ONE deliberate free-text exception (§7.2, WYS §16): a
    // declared, learner-owned local field that must round-trip intact. The
    // surrounding fields still have to be well-formed.
    if (
      !isIdToken(raw.id) ||
      typeof raw.text !== "string" ||
      !isIsoTimestamp(raw.createdAt) ||
      !isIsoTimestamp(raw.updatedAt)
    ) {
      dropped.push(`rulebook[${index}]`);
      continue;
    }
    out.push({ id: raw.id, text: raw.text, createdAt: raw.createdAt, updatedAt: raw.updatedAt });
  }
  return out;
}

function sanitizeUi(input: unknown, domains: WysStateDomains, dropped: string[]): WysLocalStateV1["ui"] {
  const out: WysLocalStateV1["ui"] = {};
  if (!isPlainObject(input)) {
    if (input !== undefined) dropped.push("ui");
    return out;
  }
  undeclared(input, WYS_DECLARED_KEYS.ui, dropped, "ui");

  // The second bare-`string` declared field (§7.2). Only a known WYS route.
  if (input.lastRoute !== undefined) {
    if (inDomain(input.lastRoute, knownWysRoutes(domains))) out.lastRoute = input.lastRoute;
    else dropped.push("ui.lastRoute");
  }
  if (input.dismissedNotices !== undefined) {
    if (Array.isArray(input.dismissedNotices)) {
      const notices: string[] = [];
      for (const [index, notice] of input.dismissedNotices.entries()) {
        if (inDomain(notice, domains.noticeIds)) {
          if (!notices.includes(notice)) notices.push(notice);
        } else {
          dropped.push(`ui.dismissedNotices[${index}]`);
        }
      }
      if (notices.length > 0) out.dismissedNotices = notices;
    } else {
      dropped.push("ui.dismissedNotices");
    }
  }
  return out;
}

function sanitizeAppetite(input: unknown, dropped: string[]): WysLocalStateV1["appetite"] | undefined {
  if (input === undefined) return undefined;
  if (!isPlainObject(input)) {
    dropped.push("appetite");
    return undefined;
  }
  undeclared(input, WYS_DECLARED_KEYS.appetite, dropped, "appetite");
  const out: NonNullable<WysLocalStateV1["appetite"]> = {};
  if (input.deeperPracticeInterest !== undefined) {
    if (typeof input.deeperPracticeInterest === "boolean") {
      out.deeperPracticeInterest = input.deeperPracticeInterest;
    } else {
      dropped.push("appetite.deeperPracticeInterest");
    }
  }
  if (input.recordedAt !== undefined) {
    if (isIsoTimestamp(input.recordedAt)) out.recordedAt = input.recordedAt;
    else dropped.push("appetite.recordedAt");
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * THE guard. Every write path in this module goes through here, so minimization
 * is a property of the serializer rather than a rule call sites must remember.
 */
export function sanitizeWysState(
  input: unknown,
  domains: WysStateDomains = DEFAULT_WYS_STATE_DOMAINS
): SanitizeResult {
  const dropped: string[] = [];
  if (!isPlainObject(input)) {
    if (input !== undefined && input !== null) dropped.push("<root>");
    return { state: emptyWysState(), dropped };
  }

  undeclared(input, WYS_DECLARED_KEYS.root, dropped, "");

  const state: WysLocalStateV1 = {
    schemaVersion: WYS_SCHEMA_VERSION,
    onboarding: sanitizeOnboarding(input.onboarding, domains, dropped),
    progress: sanitizeProgress(input.progress, domains, dropped),
    rulebook: sanitizeRulebook(input.rulebook, dropped),
    ui: sanitizeUi(input.ui, domains, dropped)
  };

  if (input.startedAt !== undefined) {
    if (isIsoTimestamp(input.startedAt)) state.startedAt = input.startedAt;
    else dropped.push("startedAt");
  }
  if (input.lastOpenedAt !== undefined) {
    if (isIsoTimestamp(input.lastOpenedAt)) state.lastOpenedAt = input.lastOpenedAt;
    else dropped.push("lastOpenedAt");
  }

  const judgments = sanitizeLocalJudgments(input.localJudgments, domains, dropped);
  if (judgments) state.localJudgments = judgments;

  const appetite = sanitizeAppetite(input.appetite, dropped);
  if (appetite) state.appetite = appetite;

  return { state, dropped };
}

/** True only when nothing had to be dropped. */
export function validateWysState(
  input: unknown,
  domains: WysStateDomains = DEFAULT_WYS_STATE_DOMAINS
): { valid: boolean; dropped: string[] } {
  const { dropped } = sanitizeWysState(input, domains);
  return { valid: dropped.length === 0, dropped };
}

/* -------------------------------------------------------------------------- */
/* 5. parse / migrate / serialize                                             */
/* -------------------------------------------------------------------------- */

/**
 * v1 is the only schema version that exists. A payload with a version this
 * build cannot read is not guessed at — it resolves to `null`, and the caller
 * falls back to a clean empty state. Guessing would be the one way a stale
 * shape could smuggle undeclared keys past the allowlist.
 */
export function migrateWysState(input: unknown): Record<string, unknown> | null {
  if (!isPlainObject(input)) return null;
  const version = input.schemaVersion;
  if (version === undefined) return { ...input, schemaVersion: WYS_SCHEMA_VERSION };
  if (version === WYS_SCHEMA_VERSION) return { ...input };
  return null;
}

export function parseWysState(
  raw: string | null | undefined,
  domains: WysStateDomains = DEFAULT_WYS_STATE_DOMAINS
): SanitizeResult {
  if (typeof raw !== "string" || raw.length === 0) return { state: emptyWysState(), dropped: [] };
  let decoded: unknown;
  try {
    decoded = JSON.parse(raw);
  } catch {
    return { state: emptyWysState(), dropped: ["<unparseable>"] };
  }
  const migrated = migrateWysState(decoded);
  if (migrated === null) return { state: emptyWysState(), dropped: ["<unmigratable>"] };
  return sanitizeWysState(migrated, domains);
}

/** Sanitize, then stringify. There is no path to storage that skips the guard. */
export function serializeWysState(
  input: unknown,
  domains: WysStateDomains = DEFAULT_WYS_STATE_DOMAINS
): string {
  return JSON.stringify(sanitizeWysState(input, domains).state);
}

/* -------------------------------------------------------------------------- */
/* 6. Hydration-safe browser access (§7.3)                                    */
/* -------------------------------------------------------------------------- */

/**
 * Never call this during render. Server render and first client render must
 * produce byte-identical HTML, so every caller reads inside `useEffect` behind
 * the `{ loaded: false }` sentinel in `components/wys/useWysState.ts`. The
 * `typeof window` guard here is a second line, not the contract.
 */
function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    // iOS Safari private browsing / "block all cookies" throws on ACCESS.
    return null;
  }
}

export function isWysStorageAvailable(): boolean {
  const store = storage();
  if (!store) return false;
  try {
    const probe = `${WYS_KEY_PREFIX}probe`;
    store.setItem(probe, "1");
    store.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export interface WysReadResult extends SanitizeResult {
  /** True when storage threw or is unavailable — the empty state is a fallback, not the learner's. */
  storageBlocked: boolean;
}

export function readWysState(domains: WysStateDomains = DEFAULT_WYS_STATE_DOMAINS): WysReadResult {
  const store = storage();
  if (!store) return { state: emptyWysState(), dropped: [], storageBlocked: true };
  try {
    const parsed = parseWysState(store.getItem(WYS_STORAGE_KEY), domains);
    return { ...parsed, storageBlocked: false };
  } catch {
    return { state: emptyWysState(), dropped: [], storageBlocked: true };
  }
}

/** Returns the state that was actually persisted, so a caller renders what is stored. */
export function writeWysState(
  input: unknown,
  domains: WysStateDomains = DEFAULT_WYS_STATE_DOMAINS
): { state: WysLocalStateV1; dropped: string[]; persisted: boolean } {
  const { state, dropped } = sanitizeWysState(input, domains);
  const store = storage();
  if (!store) return { state, dropped, persisted: false };
  try {
    store.setItem(WYS_STORAGE_KEY, JSON.stringify(state));
    return { state, dropped, persisted: true };
  } catch {
    // Quota exceeded, or a storage-restricted browser. The course keeps working.
    return { state, dropped, persisted: false };
  }
}

export function updateWysState(
  change: (current: WysLocalStateV1) => WysLocalStateV1,
  domains: WysStateDomains = DEFAULT_WYS_STATE_DOMAINS
): { state: WysLocalStateV1; dropped: string[]; persisted: boolean } {
  const current = readWysState(domains).state;
  return writeWysState(change(current), domains);
}

/* -------------------------------------------------------------------------- */
/* 7. Restart vs Clear — two operations, not one (§7.4, WYS §17)              */
/* -------------------------------------------------------------------------- */

/**
 * Shown BEFORE the operation runs, never after. (WYS §17): "explain exactly
 * what happens before executing". Factual build description only — no first
 * person, no claim about anything outside this browser.
 */
export const RESTART_COURSE_EXPLANATION: readonly string[] = [
  "Restart clears your curriculum progress in this browser: completed stops, scenarios and carries, replay counts, and the judgments you kept.",
  "Your pace, time and posture preferences stay, unless you choose to clear them here too.",
  "Your rulebook stays, unless you choose to clear it here too.",
  "Nothing is sent anywhere, and nothing outside this browser changes."
];

export const CLEAR_ALL_WYS_DATA_EXPLANATION: readonly string[] = [
  "Clearing removes every wys: key this course stored in this browser, including your rulebook, and returns you to a clean onboarding state.",
  "Your analytics choice is stored under a different key and is not touched, so you will not be asked about cookies again.",
  "This clears this browser only. It does not erase hosting logs, and it does not erase anything already recorded in Google Analytics."
];

export interface RestartCourseOptions {
  /** Data preferences are retained unless explicitly chosen otherwise (WYS §17). */
  clearDataPreferences?: boolean;
  /** The rulebook is retained by default (WYS §17). */
  clearRulebook?: boolean;
}

/**
 * Clears curriculum progress. Keeps onboarding preferences and the rulebook
 * unless the caller explicitly asks otherwise. Distinct from
 * `clearAllWysData()` — merging them is exactly what (WYS §17) forbids.
 */
export function restartCourse(
  options: RestartCourseOptions = {},
  domains: WysStateDomains = DEFAULT_WYS_STATE_DOMAINS
): { state: WysLocalStateV1; dropped: string[]; persisted: boolean } {
  const current = readWysState(domains).state;
  const next = emptyWysState();

  next.startedAt = current.startedAt;
  next.lastOpenedAt = current.lastOpenedAt;

  if (!options.clearDataPreferences) {
    next.onboarding = { ...current.onboarding };
    if (current.appetite) next.appetite = { ...current.appetite };
  }
  if (!options.clearRulebook) {
    next.rulebook = current.rulebook.map((entry) => ({ ...entry }));
  }
  // `progress`, `localJudgments` and `ui` are curriculum progress; they go.
  return writeWysState(next, domains);
}

/**
 * Removes every `wys:*` key, not just `wys:v1` — §7.5's registry exists so a
 * third key added in month three is swept too. Deliberately does NOT touch
 * `bct_analytics_consent`: silently wiping it would reset a legally-referenced
 * decision and re-prompt the visitor.
 */
export function clearAllWysData(): { removedKeys: string[]; state: WysLocalStateV1; cleared: boolean } {
  const store = storage();
  if (!store) return { removedKeys: [], state: emptyWysState(), cleared: false };
  try {
    const doomed: string[] = [];
    for (let index = 0; index < store.length; index += 1) {
      const key = store.key(index);
      if (key && key.startsWith(WYS_KEY_PREFIX)) doomed.push(key);
    }
    for (const key of doomed) store.removeItem(key);
    return { removedKeys: doomed, state: emptyWysState(), cleared: true };
  } catch {
    return { removedKeys: [], state: emptyWysState(), cleared: false };
  }
}

/* -------------------------------------------------------------------------- */
/* 8. Cadence path resolution (§5.3, WYS §8.10)                               */
/* -------------------------------------------------------------------------- */

/**
 * (WYS §8.10) types `days3` and `mostDays` as OPTIONAL while (WYS §17) and
 * artboard `5a` both let a learner choose them. Without a fallback, a learner
 * on "Most days" against a week that omits `mostDays` takes `undefined.length`
 * and the whole visit counter throws.
 */
export interface WysCadencePaths {
  days2: string[];
  days3?: string[];
  days5: string[];
  mostDays?: string[];
}

export interface WysCadenceWeek {
  cadencePaths: WysCadencePaths;
}

/**
 * `mostDays` falls back to `days5`; `days3` falls back to `days2`; an unset
 * cadence takes the shortest declared path. Never returns `undefined`.
 */
export function cadencePathFor(week: WysCadenceWeek, cadence?: WysCadence): string[] {
  const paths = week.cadencePaths;
  switch (cadence) {
    case "5":
      return paths.days5;
    case "most":
      return paths.mostDays ?? paths.days5;
    case "3":
      return paths.days3 ?? paths.days2;
    case "2":
    default:
      return paths.days2;
  }
}

/* -------------------------------------------------------------------------- */
/* 9. The Data page row mapping (§7.5)                                        */
/* -------------------------------------------------------------------------- */

/**
 * `BROWSER_KEYS` enumerates storage KEYS, not the fields inside `wys:v1`, so it
 * cannot reach card 1's rows. The rows therefore derive from the declared field
 * set: every top-level field maps to exactly one row and back, so a field added
 * later surfaces automatically instead of quietly making
 * "Generated from what's actually stored right now" false.
 *
 * A row may render more than one LINE — artboard `5c` draws "Onboarding" and
 * "Pace · time" as two lines of the same `onboarding` field, and preserving
 * that is R1. The bijection is field-to-row; lines are presentation.
 */
export interface WysDataPageLine {
  label: string;
  value: (state: WysLocalStateV1) => string;
}

export interface WysDataPageRow {
  field: WysTopLevelField;
  /** `artboard-5c` rows are approved copy; `new-unapproved` rows are escalated to Ben (§8b.4). */
  source: "artboard-5c" | "new-unapproved";
  lines: readonly WysDataPageLine[];
}

const EM_DASH = "—";

function isoDate(value: string | undefined): string {
  return value ? value.slice(0, 10) : EM_DASH;
}

const CADENCE_LABELS: Record<WysCadence, string> = {
  "2": "2 days",
  "3": "3 days",
  "5": "5 days",
  most: "most days"
};

const TIME_BUDGET_LABELS: Record<WysTimeBudget, string> = {
  "5": "5 min",
  "10": "10 min",
  "15": "15 min",
  "20plus": "20+ min"
};

export const WYS_DATA_PAGE_ROWS: readonly WysDataPageRow[] = [
  {
    field: "schemaVersion",
    source: "new-unapproved",
    lines: [{ label: "Schema version", value: (state) => String(state.schemaVersion) }]
  },
  {
    field: "startedAt",
    source: "new-unapproved",
    lines: [{ label: "Started", value: (state) => isoDate(state.startedAt) }]
  },
  {
    field: "lastOpenedAt",
    source: "new-unapproved",
    lines: [{ label: "Last opened", value: (state) => isoDate(state.lastOpenedAt) }]
  },
  {
    field: "onboarding",
    source: "artboard-5c",
    lines: [
      { label: "Onboarding", value: (state) => (state.onboarding.completed ? "done" : EM_DASH) },
      {
        label: "Pace · time",
        value: (state) => {
          const cadence = state.onboarding.cadence ? CADENCE_LABELS[state.onboarding.cadence] : EM_DASH;
          const budget = state.onboarding.timeBudget ? TIME_BUDGET_LABELS[state.onboarding.timeBudget] : EM_DASH;
          return `${cadence} · ${budget}`;
        }
      }
    ]
  },
  {
    field: "progress",
    source: "artboard-5c",
    lines: [
      {
        label: "Stops · scenarios · carries",
        value: (state) =>
          [
            state.progress.completedLessonIds.length,
            state.progress.completedScenarioIds.length,
            state.progress.completedCarryIds.length
          ].join(" · ")
      }
    ]
  },
  {
    field: "localJudgments",
    source: "new-unapproved",
    lines: [
      {
        label: "Local judgments",
        value: (state) => {
          const entries = Object.values(state.localJudgments ?? {});
          if (entries.length === 0) return EM_DASH;
          const revised = entries.filter((entry) => entry.revisedChoiceKey !== undefined).length;
          return `${entries.length} kept · ${revised} revised`;
        }
      }
    ]
  },
  {
    field: "rulebook",
    source: "artboard-5c",
    lines: [
      {
        label: "Rulebook",
        value: (state) => (state.rulebook.length === 0 ? EM_DASH : `${state.rulebook.length} rules`)
      }
    ]
  },
  {
    field: "ui",
    source: "new-unapproved",
    lines: [
      { label: "Last route", value: (state) => state.ui.lastRoute ?? EM_DASH },
      {
        label: "Dismissed notices",
        value: (state) => {
          const notices = state.ui.dismissedNotices ?? [];
          return notices.length === 0 ? EM_DASH : String(notices.length);
        }
      }
    ]
  },
  {
    field: "appetite",
    source: "artboard-5c",
    lines: [
      {
        label: "Deeper-practice interest",
        value: (state) => {
          const interest = state.appetite?.deeperPracticeInterest;
          if (interest === undefined) return EM_DASH;
          return interest ? "yes" : "no";
        }
      }
    ]
  }
];

/** The row for a declared field. Total by construction; asserted in the test. */
export function dataPageRowFor(field: WysTopLevelField): WysDataPageRow {
  const row = WYS_DATA_PAGE_ROWS.find((candidate) => candidate.field === field);
  if (!row) throw new Error(`No Data page row declared for wys:v1 field "${field}".`);
  return row;
}
