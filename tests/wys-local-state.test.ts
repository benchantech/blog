import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  BROWSER_KEYS,
  BROWSER_KEY_NAMES,
  CONSENT_STORAGE_KEY,
  DEVELOPER_FORWARD_YY_STORAGE_KEY,
  keysSurvivingWysClear,
  wysOwnedKeys
} from "@/lib/wys/browser-keys";
import {
  CLEAR_ALL_WYS_DATA_EXPLANATION,
  DEFAULT_WYS_STATE_DOMAINS,
  RESTART_COURSE_EXPLANATION,
  WYS_CADENCES,
  WYS_DATA_PAGE_ROWS,
  WYS_SCHEMA_VERSION,
  WYS_STORAGE_KEY,
  WYS_TOP_LEVEL_FIELDS,
  type WysCadence,
  type WysLocalStateV1,
  type WysStateDomains,
  type WysTopLevelField,
  cadencePathFor,
  clearAllWysData,
  dataPageRowFor,
  emptyWysState,
  migrateWysState,
  parseWysState,
  readWysState,
  restartCourse,
  sanitizeWysState,
  serializeWysState,
  updateWysState,
  validateWysState,
  writeWysState
} from "@/lib/wys/local-state";

/**
 * Local state substrate (plan Phase 2, §7.1-§7.5).
 *
 * Two guarantees, both structural:
 *  - a learner dossier cannot be persisted, because minimization lives in the
 *    serializer rather than at call sites;
 *  - a `localStorage` read cannot reach the server or the first client render.
 *
 * Everything here runs against pure modules plus a fake `window.localStorage`.
 * No renderer, no CSS, no new dependency.
 */

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* -------------------------------------------------------------------------- */
/* Fixtures                                                                   */
/* -------------------------------------------------------------------------- */

/** What Phase 6's `content/watch-your-step/config.ts` will supply. */
const domains: WysStateDomains = {
  postureChoiceIds: ["never-used", "tried-and-stopped", "use-but-distrust", "use-a-lot"],
  scenarioIds: ["scn-client-meeting", "scn-leaking-pipe"],
  choiceKeys: ["a", "b", "c", "d"],
  noticeIds: ["notice-draft-preview"],
  stopIds: ["stop-a", "stop-b"]
};

const TS = "2026-09-03T10:00:00.000Z";

/**
 * Free text a caller might try to accrete. Deliberately contains spaces, an
 * employer and a personal situation - the three things (WYS §17) and (WYS §9.2)
 * name explicitly.
 */
const SCRATCH = "I work at Acme and my daughter is sick, here is the prompt I pasted";

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

function withThrowingWindow<T>(body: () => T): T {
  const previous = globalRef.window;
  const hostile = {} as FakeWindow;
  Object.defineProperty(hostile, "localStorage", {
    get() {
      // iOS Safari private browsing / block-all-cookies.
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

/* -------------------------------------------------------------------------- */
/* The shape (§7.1)                                                           */
/* -------------------------------------------------------------------------- */

test("the storage key is exactly the string the Data page prints", () => {
  // Artboard 5c card 1: `key: wys:v1 · raw JSON ↓`. Copy and implementation
  // read the same constant so they cannot drift.
  assert.equal(WYS_STORAGE_KEY, "wys:v1");
  assert.equal(WYS_SCHEMA_VERSION, 1);
});

test("the empty state is valid, renderable and drops nothing", () => {
  const empty = emptyWysState();
  assert.equal(empty.schemaVersion, 1);
  assert.equal(empty.onboarding.completed, false);
  assert.deepEqual(empty.progress.completedLessonIds, []);
  assert.deepEqual(empty.progress.replayCounts, {});
  assert.deepEqual(empty.rulebook, []);
  assert.deepEqual(empty.ui, {});
  assert.equal(empty.localJudgments, undefined);
  assert.equal(empty.appetite, undefined);
  assert.deepEqual(validateWysState(empty, domains), { valid: true, dropped: [] });
});

test("the declared top-level field list matches the verbatim WYS §17 shape", () => {
  assert.deepEqual([...WYS_TOP_LEVEL_FIELDS], [
    "schemaVersion",
    "startedAt",
    "lastOpenedAt",
    "onboarding",
    "progress",
    "localJudgments",
    "rulebook",
    "ui",
    "appetite"
  ]);
});

/* -------------------------------------------------------------------------- */
/* parse / migrate                                                            */
/* -------------------------------------------------------------------------- */

test("a well-formed v1 payload round-trips through parse", () => {
  const state: WysLocalStateV1 = {
    schemaVersion: 1,
    startedAt: TS,
    lastOpenedAt: TS,
    onboarding: { completed: true, postureChoice: "use-but-distrust", cadence: "3", timeBudget: "10" },
    progress: {
      completedLessonIds: ["stop-a"],
      completedScenarioIds: ["scn-client-meeting"],
      completedCarryIds: ["carry-1"],
      replayCounts: { "scn-client-meeting": 2 },
      transferCheckIds: []
    },
    localJudgments: { "scn-client-meeting": { choiceKey: "c", revisedChoiceKey: "b", updatedAt: TS } },
    rulebook: [{ id: "rule-1", text: "Check the date before I trust a number.", createdAt: TS, updatedAt: TS }],
    ui: { lastRoute: "/watch-your-step/today", dismissedNotices: ["notice-draft-preview"] },
    appetite: { deeperPracticeInterest: true, recordedAt: TS }
  };
  const parsed = parseWysState(JSON.stringify(state), domains);
  assert.deepEqual(parsed.dropped, []);
  assert.deepEqual(parsed.state, state);
});

test("a missing schemaVersion is stamped; an unreadable version is not guessed at", () => {
  assert.deepEqual(migrateWysState({ onboarding: { completed: true } }), {
    onboarding: { completed: true },
    schemaVersion: 1
  });
  assert.equal(migrateWysState({ schemaVersion: 2 }), null);
  assert.equal(migrateWysState("nonsense"), null);
  assert.equal(migrateWysState(null), null);

  const future = parseWysState(JSON.stringify({ schemaVersion: 2, dossier: SCRATCH }), domains);
  assert.deepEqual(future.state, emptyWysState());
  assert.deepEqual(future.dropped, ["<unmigratable>"]);
});

test("unparseable and absent payloads return a valid empty state", () => {
  assert.deepEqual(parseWysState("{not json", domains).state, emptyWysState());
  assert.deepEqual(parseWysState(null, domains).state, emptyWysState());
  assert.deepEqual(parseWysState("", domains).state, emptyWysState());
});

/* -------------------------------------------------------------------------- */
/* Minimization is enforced in the serializer, not at call sites (§7.2)       */
/* -------------------------------------------------------------------------- */

test("an undeclared key is dropped at every level", () => {
  const { state, dropped } = sanitizeWysState(
    {
      schemaVersion: 1,
      email: "someone@example.com",
      scratch: SCRATCH,
      onboarding: { completed: true, employer: "Acme" },
      progress: { completedLessonIds: [], transcript: SCRATCH },
      ui: { lastRoute: "/watch-your-step/today", pastedPrompt: SCRATCH },
      rulebook: [{ id: "rule-1", text: "Keep it.", createdAt: TS, updatedAt: TS, screenshot: "data:image/png" }],
      appetite: { deeperPracticeInterest: true, microphone: "blob" }
    },
    domains
  );

  const serialized = JSON.stringify(state);
  for (const undeclaredKey of ["email", "scratch", "employer", "transcript", "pastedPrompt", "screenshot", "microphone"]) {
    assert.ok(!serialized.includes(undeclaredKey), `${undeclaredKey} reached storage`);
  }
  assert.ok(dropped.includes("email"));
  assert.ok(dropped.includes("scratch"));
  assert.ok(dropped.includes("onboarding.employer"));
  assert.ok(dropped.includes("progress.transcript"));
  assert.ok(dropped.includes("ui.pastedPrompt"));
  assert.ok(dropped.includes("rulebook[0].screenshot"));
  assert.ok(dropped.includes("appetite.microphone"));
});

test("an out-of-domain value under a DECLARED key is dropped", () => {
  // The half a key-shape allowlist misses: postureChoice and lastRoute are
  // declared, and typed as bare `string` in the verbatim schema.
  const { state, dropped } = sanitizeWysState(
    {
      schemaVersion: 1,
      startedAt: SCRATCH,
      onboarding: { completed: true, postureChoice: SCRATCH, cadence: "7", timeBudget: "forever" },
      progress: {
        completedLessonIds: [SCRATCH],
        replayCounts: { [SCRATCH]: 3, "scn-client-meeting": 1 }
      },
      localJudgments: {
        [SCRATCH]: { choiceKey: "c", updatedAt: TS },
        "scn-client-meeting": { choiceKey: SCRATCH, updatedAt: TS }
      },
      ui: { lastRoute: `/watch-your-step/today?posture=${SCRATCH}`, dismissedNotices: [SCRATCH] },
      appetite: { deeperPracticeInterest: "maybe", recordedAt: "yesterday" }
    },
    domains
  );

  assert.equal(state.onboarding.postureChoice, undefined);
  assert.equal(state.onboarding.cadence, undefined);
  assert.equal(state.onboarding.timeBudget, undefined);
  assert.equal(state.startedAt, undefined);
  assert.deepEqual(state.progress.completedLessonIds, []);
  assert.deepEqual(state.progress.replayCounts, { "scn-client-meeting": 1 });
  assert.equal(state.localJudgments, undefined);
  assert.equal(state.ui.lastRoute, undefined);
  assert.equal(state.ui.dismissedNotices, undefined);
  assert.equal(state.appetite, undefined);

  assert.ok(dropped.includes("onboarding.postureChoice"));
  assert.ok(dropped.includes("onboarding.cadence"));
  assert.ok(dropped.includes("ui.lastRoute"));
  assert.ok(!JSON.stringify(state).includes("Acme"));
});

test("scratch text is never persisted under any key, declared or not", () => {
  const hostile = {
    schemaVersion: 1,
    fromMemoryScratch: SCRATCH,
    onboarding: { completed: true, postureChoice: SCRATCH, situation: SCRATCH },
    progress: {
      completedLessonIds: [SCRATCH],
      completedScenarioIds: [SCRATCH],
      completedCarryIds: [SCRATCH],
      transferCheckIds: [SCRATCH],
      replayCounts: { [SCRATCH]: 1 }
    },
    ui: { lastRoute: SCRATCH, dismissedNotices: [SCRATCH] },
    localJudgments: { [SCRATCH]: { choiceKey: SCRATCH, updatedAt: TS } },
    appetite: { recordedAt: SCRATCH },
    rulebook: [{ id: SCRATCH, text: SCRATCH, createdAt: TS, updatedAt: TS }]
  };
  // rulebook[0] is rejected here because its `id` is a sentence, not an ID —
  // the entry is malformed, not because `text` is free text (see next test).
  assert.ok(!serializeWysState(hostile, domains).includes("Acme"));
  assert.ok(!serializeWysState(hostile, domains).includes("daughter"));
  assert.deepEqual(sanitizeWysState(hostile, domains).state, {
    ...emptyWysState(),
    onboarding: { completed: true }
  });
});

test("rulebook[].text is the one deliberate free-text exception and round-trips intact", () => {
  const text = `${SCRATCH} - and this is a rule the learner wrote, in their own words.`;
  const { state, dropped } = sanitizeWysState(
    {
      schemaVersion: 1,
      rulebook: [{ id: "rule-1", text, createdAt: TS, updatedAt: TS }]
    },
    domains
  );
  assert.equal(state.rulebook.length, 1);
  assert.equal(state.rulebook[0].text, text);
  assert.deepEqual(dropped, []);
  assert.ok(serializeWysState(state, domains).includes(text));
  // What keeps it off the wire is the telemetry property allowlist (Phase 3),
  // not this guard.
});

test("the default domains fail closed - no content wired means no ID survives", () => {
  const { state } = sanitizeWysState(
    {
      schemaVersion: 1,
      onboarding: { completed: true, postureChoice: "use-a-lot" },
      ui: { lastRoute: "/watch-your-step/stop/stop-a" }
    },
    DEFAULT_WYS_STATE_DOMAINS
  );
  assert.equal(state.onboarding.postureChoice, undefined);
  assert.equal(state.ui.lastRoute, undefined);
  // A static WYS route needs no content vocabulary and still resolves.
  const withRoute = sanitizeWysState(
    { schemaVersion: 1, ui: { lastRoute: "/watch-your-step/data" } },
    DEFAULT_WYS_STATE_DOMAINS
  );
  assert.equal(withRoute.state.ui.lastRoute, "/watch-your-step/data");
});

/**
 * The tests above prove the SERIALIZER refuses a dossier. That is only half the
 * exit criterion: "no code path can persist an undeclared field or scratch
 * text" is a claim about every write path, not about one function. These two
 * tests inspect the bytes that actually land in storage, and pin the single
 * write chokepoint that makes the claim checkable rather than aspirational.
 */

const EMPLOYER = "SENTINEL-EMPLOYER-Acme";
const RULE_TEXT = "RULEBOOK-SENTINEL - a rule the learner wrote in their own words";

function hostilePayload(): Record<string, unknown> {
  return {
    schemaVersion: 1,
    fromMemoryScratch: SCRATCH,
    employer: EMPLOYER,
    onboarding: { completed: true, postureChoice: SCRATCH, cadence: "9", timeBudget: "x", employer: EMPLOYER },
    progress: {
      completedLessonIds: [SCRATCH, "stop-a"],
      completedScenarioIds: ["scn-client-meeting"],
      completedCarryIds: [],
      transferCheckIds: [],
      replayCounts: { [SCRATCH]: 3, "scn-client-meeting": 2, "scn-not-declared": 5 },
      secretDossier: SCRATCH
    },
    localJudgments: {
      [SCRATCH]: { choiceKey: "a", updatedAt: TS },
      "scn-client-meeting": { choiceKey: "a", updatedAt: TS, note: SCRATCH }
    },
    rulebook: [{ id: "rule-1", text: RULE_TEXT, createdAt: TS, updatedAt: TS, author: EMPLOYER }],
    ui: { lastRoute: `/watch-your-step/data?note=${SCRATCH}`, dismissedNotices: [SCRATCH, "notice-draft-preview"], scratchpad: SCRATCH },
    appetite: { deeperPracticeInterest: true, recordedAt: TS, why: SCRATCH }
  };
}

function assertPersistedBytesAreClean(raw: string | null, label: string): Record<string, unknown> {
  assert.ok(raw, `${label}: nothing was written`);
  const bytes = raw as string;
  assert.equal(bytes.includes(SCRATCH), false, `${label}: scratch text reached storage - ${bytes}`);
  assert.equal(bytes.includes(EMPLOYER), false, `${label}: an employer reached storage - ${bytes}`);
  const back = JSON.parse(bytes) as Record<string, unknown>;
  const { valid, dropped } = validateWysState(back, domains);
  assert.equal(valid, true, `${label}: persisted bytes are not themselves valid - ${dropped.join(", ")}`);
  return back;
}

test("every exported write path persists sanitized bytes and nothing else", () => {
  const paths: Array<[string, (store: Storage) => void]> = [
    ["writeWysState", () => writeWysState(hostilePayload(), domains)],
    ["updateWysState", () => updateWysState(() => hostilePayload() as unknown as WysLocalStateV1, domains)],
    [
      "restartCourse",
      () => {
        writeWysState(hostilePayload(), domains);
        restartCourse({}, domains);
      }
    ]
  ];

  for (const [label, run] of paths) {
    withWindow(fakeStorage(), (store) => {
      run(store);
      const back = assertPersistedBytesAreClean(store.getItem(WYS_STORAGE_KEY), label);
      assert.equal((back as { employer?: unknown }).employer, undefined, `${label}: undeclared root key persisted`);
      assert.equal((back as { fromMemoryScratch?: unknown }).fromMemoryScratch, undefined, label);
      const rulebook = back.rulebook as Array<Record<string, unknown>>;
      // The one deliberate exception survives every path, its undeclared sibling does not.
      assert.equal(rulebook[0].text, RULE_TEXT, `${label}: rulebook text must round-trip`);
      assert.equal(rulebook[0].author, undefined, `${label}: undeclared rulebook key persisted`);
    });
  }
});

test("there is exactly one place that writes wys:v1, and it sanitizes first", () => {
  // The structural half of "no code path can persist an undeclared field": a
  // second setItem call site would be a way around sanitizeWysState, and no
  // value-level test would ever see it.
  const source = readFileSync(path.join(repoRoot, "lib/wys/local-state.ts"), "utf8");
  const writes = source.match(/\.setItem\(/g) ?? [];
  // One in writeWysState; one in the isWysStorageAvailable probe, which writes
  // a transient `wys:` probe key and removes it in the same call.
  assert.equal(writes.length, 2, "a new localStorage write appeared - route it through sanitizeWysState");
  assert.match(source, /store\.setItem\(WYS_STORAGE_KEY, JSON\.stringify\(state\)\)/);
  assert.match(
    source,
    /const \{ state, dropped \} = sanitizeWysState\(input, domains\);[\s\S]{0,400}?store\.setItem\(WYS_STORAGE_KEY/,
    "writeWysState must sanitize before it writes"
  );
});

test("a __proto__ payload neither pollutes the prototype nor survives the write", () => {
  const payload = JSON.parse('{"schemaVersion":1,"__proto__":{"polluted":true},"onboarding":{"completed":true}}');
  withWindow(fakeStorage(), (store) => {
    writeWysState(payload, domains);
    assert.equal(({} as Record<string, unknown>).polluted, undefined);
    const back = JSON.parse(store.getItem(WYS_STORAGE_KEY) as string) as Record<string, unknown>;
    assert.equal(Object.prototype.hasOwnProperty.call(back, "__proto__"), false);
    assert.equal((back.onboarding as { completed: boolean }).completed, true);
  });
});

test("a hostile or corrupt stored payload never crashes a read", () => {
  for (const bad of ["", "null", "[]", "{", '"a string"', "12", '{"schemaVersion":99,"employer":"x"}']) {
    withWindow(fakeStorage({ [WYS_STORAGE_KEY]: bad }), () => {
      const read = readWysState(domains);
      assert.equal(read.state.schemaVersion, WYS_SCHEMA_VERSION);
      assert.ok(Array.isArray(read.state.rulebook));
      assert.equal(read.storageBlocked, false);
    });
  }
});

/* -------------------------------------------------------------------------- */
/* Hydration-safe access and the storage-throws path (§7.3)                   */
/* -------------------------------------------------------------------------- */

test("with no window at all, reads and writes return a valid empty state", () => {
  const previous = globalRef.window;
  delete globalRef.window;
  try {
    const read = readWysState(domains);
    assert.deepEqual(read.state, emptyWysState());
    assert.equal(read.storageBlocked, true);
    const write = writeWysState({ schemaVersion: 1, onboarding: { completed: true } }, domains);
    assert.equal(write.persisted, false);
    assert.equal(write.state.onboarding.completed, true);
  } finally {
    if (previous !== undefined) globalRef.window = previous;
  }
});

test("a browser that throws on localStorage access does not crash the course", () => {
  withThrowingWindow(() => {
    const read = readWysState(domains);
    assert.deepEqual(read.state, emptyWysState());
    assert.equal(read.storageBlocked, true);
    assert.equal(writeWysState(emptyWysState(), domains).persisted, false);
    assert.equal(clearAllWysData().cleared, false);
    assert.equal(restartCourse({}, domains).persisted, false);
  });
});

test("a setItem that throws is survivable and still reports the sanitized state", () => {
  const hostile = {
    length: 0,
    clear() {},
    getItem: () => null,
    key: () => null,
    removeItem() {},
    setItem() {
      throw new Error("QuotaExceededError");
    }
  } as unknown as Storage;
  withWindow(hostile, () => {
    const result = writeWysState({ schemaVersion: 1, onboarding: { completed: true } }, domains);
    assert.equal(result.persisted, false);
    assert.equal(result.state.onboarding.completed, true);
  });
});

test("the hook never touches localStorage itself and reads only inside useEffect", () => {
  const source = readFileSync(path.join(repoRoot, "components", "wys", "useWysState.ts"), "utf8");
  assert.ok(source.startsWith('"use client";'));
  const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  assert.ok(!code.includes("localStorage"), "the hook must delegate storage access to lib/wys/local-state.ts");
  assert.ok(code.includes("loaded: false"), "the { loaded: false } sentinel is the hydration contract");
  const effectIndex = code.indexOf("useEffect(");
  const readIndex = code.indexOf("readWysState(");
  assert.ok(effectIndex > -1 && readIndex > effectIndex, "the read must happen inside useEffect");
  // The effect must depend on the CONTENT of `domains`, never on its identity:
  // an inline object literal from a caller would otherwise loop forever.
  assert.ok(!/\}, \[domains\]\)/.test(code), "depend on wysDomainsKey(domains), not on the object identity");
});

test("a server render of the hook reads no storage at all and emits the empty state", async () => {
  // The behavioural half of "no localStorage access during server or first
  // client render". `renderToStaticMarkup` runs exactly what the server runs:
  // the useState initialiser, and no effect. `useWysState.ts` imports no CSS,
  // so it loads under `node --import tsx` without a stub.
  const { createElement } = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { useWysState } = await import("@/components/wys/useWysState");

  let touches = 0;
  const previous = globalRef.window;
  const hostile = {} as FakeWindow;
  Object.defineProperty(hostile, "localStorage", {
    get() {
      touches += 1;
      throw new Error("SecurityError");
    }
  });
  globalRef.window = hostile;
  try {
    function Probe() {
      const handle = useWysState(domains);
      return createElement(
        "output",
        null,
        JSON.stringify({ loaded: handle.loaded, blocked: handle.storageBlocked, state: handle.state })
      );
    }
    const markup = renderToStaticMarkup(createElement(Probe));
    assert.equal(touches, 0, "the server render touched window.localStorage");
    const payload = JSON.parse(
      markup.replace(/^<output>/, "").replace(/<\/output>$/, "").replace(/&quot;/g, '"')
    ) as { loaded: boolean; blocked: boolean; state: WysLocalStateV1 };
    assert.equal(payload.loaded, false, "the first render must report the { loaded: false } sentinel");
    assert.equal(payload.blocked, false);
    assert.deepEqual(payload.state, emptyWysState(), "the first render must emit the empty state, byte for byte");
  } finally {
    if (previous === undefined) delete globalRef.window;
    else globalRef.window = previous;
  }
});

/* -------------------------------------------------------------------------- */
/* Restart vs Clear (§7.4)                                                    */
/* -------------------------------------------------------------------------- */

function seededState(): WysLocalStateV1 {
  return {
    schemaVersion: 1,
    startedAt: TS,
    lastOpenedAt: TS,
    onboarding: { completed: true, postureChoice: "use-a-lot", cadence: "5", timeBudget: "15" },
    progress: {
      completedLessonIds: ["stop-a"],
      completedScenarioIds: ["scn-client-meeting"],
      completedCarryIds: ["carry-1"],
      replayCounts: { "scn-client-meeting": 2 },
      transferCheckIds: []
    },
    localJudgments: { "scn-client-meeting": { choiceKey: "c", revisedChoiceKey: "b", updatedAt: TS } },
    rulebook: [{ id: "rule-1", text: "Ask what would have to be true.", createdAt: TS, updatedAt: TS }],
    ui: { lastRoute: "/watch-your-step/practice" },
    appetite: { deeperPracticeInterest: true, recordedAt: TS }
  };
}

test("restart clears curriculum progress and keeps preferences and the rulebook", () => {
  const store = fakeStorage({
    [WYS_STORAGE_KEY]: JSON.stringify(seededState()),
    [CONSENT_STORAGE_KEY]: "granted"
  });
  withWindow(store, () => {
    const { state, persisted } = restartCourse({}, domains);
    assert.equal(persisted, true);
    assert.deepEqual(state.progress, emptyWysState().progress);
    assert.equal(state.localJudgments, undefined);
    assert.equal(state.ui.lastRoute, undefined);
    assert.equal(state.onboarding.cadence, "5");
    assert.equal(state.onboarding.postureChoice, "use-a-lot");
    assert.equal(state.appetite?.deeperPracticeInterest, true);
    assert.equal(state.rulebook.length, 1);
    assert.equal(state.startedAt, TS);
    // Restart is not a clear: the key survives, and so does the consent choice.
    assert.ok(store.getItem(WYS_STORAGE_KEY));
    assert.equal(store.getItem(CONSENT_STORAGE_KEY), "granted");
  });
});

test("restart clears preferences and the rulebook only when explicitly chosen", () => {
  const store = fakeStorage({ [WYS_STORAGE_KEY]: JSON.stringify(seededState()) });
  withWindow(store, () => {
    const { state } = restartCourse({ clearDataPreferences: true, clearRulebook: true }, domains);
    assert.equal(state.onboarding.completed, false);
    assert.equal(state.onboarding.cadence, undefined);
    assert.equal(state.appetite, undefined);
    assert.deepEqual(state.rulebook, []);
  });
});

test("clear removes every wys: key, returns a clean onboarding state, and leaves consent alone", () => {
  const store = fakeStorage({
    [WYS_STORAGE_KEY]: JSON.stringify(seededState()),
    "wys:future-key": "whatever a later phase adds",
    [CONSENT_STORAGE_KEY]: "denied",
    "unrelated-key": "kept"
  });
  withWindow(store, () => {
    const { removedKeys, state, cleared } = clearAllWysData();
    assert.equal(cleared, true);
    assert.deepEqual(removedKeys.sort(), ["wys:future-key", WYS_STORAGE_KEY].sort());
    assert.deepEqual(state, emptyWysState());
    assert.equal(store.getItem(WYS_STORAGE_KEY), null);
    assert.equal(store.getItem("wys:future-key"), null);
    // Wiping this would reset a legally-referenced decision and re-prompt.
    assert.equal(store.getItem(CONSENT_STORAGE_KEY), "denied");
    assert.equal(store.getItem("unrelated-key"), "kept");
  });
});

test("both operations explain themselves and neither claims to erase hosting or GA4 logs", () => {
  assert.ok(RESTART_COURSE_EXPLANATION.length >= 3);
  assert.ok(CLEAR_ALL_WYS_DATA_EXPLANATION.length >= 3);
  const clearing = CLEAR_ALL_WYS_DATA_EXPLANATION.join(" ");
  assert.ok(/does not erase hosting logs/.test(clearing));
  assert.ok(/Google Analytics/.test(clearing));
  assert.ok(!/erases everything/i.test(clearing));
  assert.ok(/analytics choice/i.test(clearing));
  const restarting = RESTART_COURSE_EXPLANATION.join(" ");
  assert.ok(/rulebook stays/i.test(restarting));
  for (const sentence of [...RESTART_COURSE_EXPLANATION, ...CLEAR_ALL_WYS_DATA_EXPLANATION]) {
    // R10: no prose in Ben's first person anywhere.
    assert.ok(!/\bI\b|\bmy\b|\bI'm\b/.test(sentence), sentence);
  }
});

/* -------------------------------------------------------------------------- */
/* The browser-key registry (§7.5)                                            */
/* -------------------------------------------------------------------------- */

test("BROWSER_KEYS registers every key this build writes, with their writers", () => {
  // FOUR keys. The fourth is the YY judgment ledger, which is its own key and
  // not a field inside the v1 dataset — that dataset's serializer drops every
  // undeclared top-level key, so a nested YY stream would be erased on the
  // first v1 write. Updated deliberately when the row was added.
  assert.deepEqual(
    [...BROWSER_KEY_NAMES].sort(),
    [
      "bct_analytics_consent",
      "benchantech:developer-forward-lite:state",
      "benchantech:developer-forward-lite:yy",
      "wys:v1"
    ]
  );
  // Still exactly one WYS-owned key: adding a fourth registry row must not
  // widen what a Watch Your Step clear sweeps.
  assert.deepEqual(wysOwnedKeys(), [WYS_STORAGE_KEY]);
  assert.deepEqual(keysSurvivingWysClear(), [
    "benchantech:developer-forward-lite:state",
    "benchantech:developer-forward-lite:yy",
    CONSENT_STORAGE_KEY
  ]);
  for (const record of BROWSER_KEYS) {
    assert.ok(record.writtenBy.endsWith(".ts") || record.writtenBy.endsWith(".tsx"));
    assert.ok(record.holds.length > 0);
  }
});

test("the registered consent key is byte-identical to the frozen ConsentBanner literal", () => {
  const source = readFileSync(path.join(repoRoot, "components", "ConsentBanner.tsx"), "utf8");
  assert.ok(source.includes(`const storageKey = "${CONSENT_STORAGE_KEY}";`));
});

test("the registered YY key is byte-identical to the literal records.ts writes", () => {
  // The registry restates the literal rather than importing it, because
  // `lib/developer-forward/yy/records.ts` reaches the ledger, the session and the
  // storage probe, and `/privacy`, `/cookies` and the Data page need the NAME
  // and nothing else. A restated literal is only safe while something asserts
  // the two agree — this is that something, and it is the same mechanism the
  // frozen ConsentBanner literal is held to above.
  const source = readFileSync(
    path.join(repoRoot, "lib", "developer-forward", "yy", "records.ts"),
    "utf8"
  );
  assert.ok(
    source.includes(`export const DEVELOPER_FORWARD_YY_STORAGE_KEY = "${DEVELOPER_FORWARD_YY_STORAGE_KEY}";`),
    "the YY ledger writes a key the registry does not name — the Data page key list is now false"
  );
});

test("every wys: key literal in lib/ and components/ is in the registry", () => {
  function walk(dir: string, out: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) walk(full, out);
      else if (full.endsWith(".ts") || full.endsWith(".tsx")) out.push(full);
    }
    return out;
  }
  const files = [...walk(path.join(repoRoot, "lib")), ...walk(path.join(repoRoot, "components"))];
  const offences: string[] = [];
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(/["'`](wys:[A-Za-z0-9_.:-]+)["'`]/g)) {
      if (!BROWSER_KEY_NAMES.includes(match[1])) {
        offences.push(`${path.relative(repoRoot, file)}: ${match[1]}`);
      }
    }
  }
  assert.deepEqual(
    offences,
    [],
    `A browser key is written but not registered, which makes the Data page key list false.\n${offences.join("\n")}`
  );
});

test("ConsentBanner's two localStorage calls are guarded and nothing else changed", () => {
  const source = readFileSync(path.join(repoRoot, "components", "ConsentBanner.tsx"), "utf8");
  assert.ok(/try \{\s*stored = window\.localStorage\.getItem\(storageKey\);\s*\} catch/.test(source));
  assert.ok(/try \{\s*window\.localStorage\.setItem\(storageKey, nextChoice\);\s*\} catch/.test(source));
  // The three-state machine, the render guard and the labels are untouched.
  assert.ok(source.includes('useState<ConsentChoice | null | "unknown">("unknown")'));
  assert.ok(source.includes("if (choice !== null || !process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return null;"));
  assert.ok(source.includes("ad_user_data: \"denied\""));
});

/* -------------------------------------------------------------------------- */
/* The Data page row mapping is total in both directions (§7.5)               */
/* -------------------------------------------------------------------------- */

test("every declared top-level field maps to exactly one Data page row, and back", () => {
  const rowFields = WYS_DATA_PAGE_ROWS.map((row) => row.field);
  assert.equal(new Set(rowFields).size, rowFields.length, "a field claims more than one row");
  assert.deepEqual([...rowFields].sort(), [...WYS_TOP_LEVEL_FIELDS].sort());
  for (const field of WYS_TOP_LEVEL_FIELDS) {
    assert.equal(dataPageRowFor(field).field, field);
  }
  for (const row of WYS_DATA_PAGE_ROWS) {
    assert.ok((WYS_TOP_LEVEL_FIELDS as readonly string[]).includes(row.field));
    assert.ok(row.lines.length > 0);
  }
});

test("the rows (WYS §20) requires are present, including the two the artboard omits", () => {
  const required: WysTopLevelField[] = ["onboarding", "progress", "localJudgments", "rulebook", "appetite", "ui"];
  for (const field of required) assert.ok(dataPageRowFor(field));
  // These two are NEW against artboard 5c and are escalated as a Final-copy
  // amendment (§7.5, §8b.4) rather than shipped as approved wording.
  assert.equal(dataPageRowFor("localJudgments").source, "new-unapproved");
  assert.equal(dataPageRowFor("ui").source, "new-unapproved");
  assert.equal(dataPageRowFor("rulebook").source, "artboard-5c");
});

test("every row renders from the empty state and from a seeded state without throwing", () => {
  for (const state of [emptyWysState(), seededState()]) {
    for (const row of WYS_DATA_PAGE_ROWS) {
      for (const line of row.lines) {
        const value = line.value(state);
        assert.equal(typeof value, "string");
        assert.ok(value.length > 0);
      }
    }
  }
  const seeded = seededState();
  assert.equal(dataPageRowFor("progress").lines[0].value(seeded), "1 · 1 · 1");
  assert.equal(dataPageRowFor("rulebook").lines[0].value(seeded), "1 rules");
  assert.equal(dataPageRowFor("onboarding").lines[1].value(seeded), "5 days · 15 min");
  assert.equal(dataPageRowFor("localJudgments").lines[0].value(seeded), "1 kept · 1 revised");
});

/* -------------------------------------------------------------------------- */
/* The cadence fallback (§5.3, WYS §8.10)                                     */
/* -------------------------------------------------------------------------- */

test("cadencePathFor never returns undefined for any of the four cadences", () => {
  // A week declaring ONLY the two required paths - the case (WYS §8.10)'s
  // optional `days3` / `mostDays` create and artboard 5a lets a learner pick.
  const week = { cadencePaths: { days2: ["a", "b"], days5: ["a", "b", "c", "d", "e"] } };
  const expected: Record<WysCadence, string[]> = {
    "2": week.cadencePaths.days2,
    "3": week.cadencePaths.days2,
    "5": week.cadencePaths.days5,
    most: week.cadencePaths.days5
  };
  for (const cadence of WYS_CADENCES) {
    const resolved = cadencePathFor(week, cadence);
    assert.notEqual(resolved, undefined);
    assert.deepEqual(resolved, expected[cadence]);
    assert.ok(resolved.length > 0);
  }
  assert.deepEqual(cadencePathFor(week, undefined), week.cadencePaths.days2);
});

test("cadencePathFor prefers a declared path over its fallback", () => {
  const week = {
    cadencePaths: { days2: ["a"], days3: ["a", "b", "c"], days5: ["a", "b"], mostDays: ["a", "b", "c", "d"] }
  };
  assert.deepEqual(cadencePathFor(week, "3"), week.cadencePaths.days3);
  assert.deepEqual(cadencePathFor(week, "most"), week.cadencePaths.mostDays);
});
