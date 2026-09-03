"use client";

/**
 * Hydration-safe access to `wys:v1` (plan Phase 2, §7.3).
 *
 * Mirrors the pattern this repo already proves in `components/ConsentBanner.tsx`:
 * initialise to a `{ loaded: false }` sentinel, touch `window.localStorage`
 * only inside `useEffect`, and render a stable placeholder until hydrated.
 * Server HTML and first client HTML are therefore byte-identical, no
 * `suppressHydrationWarning` is needed, and every route stays prerendered.
 *
 * **No component may read `wys:v1` during render.** The static curriculum shell
 * is server-rendered from typed content modules; only state-dependent slots
 * (progress numerals, Plan's current row, Data card 1, kept/revised judgment
 * rows) mount a client component that calls this hook.
 *
 * Every storage call underneath is already wrapped in `try/catch` and returns a
 * valid empty state on failure, so a blocked-storage browser renders correctly
 * rather than crashing. That matters: iOS Safari private browsing throws on
 * `localStorage` access and iPhone Safari is the primary QA target.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_WYS_STATE_DOMAINS,
  type RestartCourseOptions,
  type WysLocalStateV1,
  type WysStateDomains,
  clearAllWysData,
  emptyWysState,
  readWysState,
  restartCourse,
  updateWysState,
  wysDomainsKey
} from "@/lib/wys/local-state";

export interface WysStateHandle {
  /** False on the server and on the first client render. Gate every numeral on it. */
  loaded: boolean;
  /** Always a valid state. The empty state until `loaded` is true. */
  state: WysLocalStateV1;
  /** True when storage is unavailable or threw — the empty state is a fallback, not the learner's. */
  storageBlocked: boolean;
  /** Sanitized on the way in; an undeclared key or out-of-domain value never lands. */
  update: (change: (current: WysLocalStateV1) => WysLocalStateV1) => void;
  /** Clears curriculum progress only. Explain it first — see `RESTART_COURSE_EXPLANATION`. */
  restart: (options?: RestartCourseOptions) => void;
  /** Removes every `wys:*` key. Explain it first — see `CLEAR_ALL_WYS_DATA_EXPLANATION`. */
  clearAll: () => void;
}

interface Snapshot {
  loaded: boolean;
  state: WysLocalStateV1;
  storageBlocked: boolean;
}

export function useWysState(domains: WysStateDomains = DEFAULT_WYS_STATE_DOMAINS): WysStateHandle {
  const [snapshot, setSnapshot] = useState<Snapshot>(() => ({
    loaded: false,
    state: emptyWysState(),
    storageBlocked: false
  }));

  // Depend on the CONTENT of `domains`, never on its object identity. Phase 6
  // passes a module constant, but a caller that passed an inline object literal
  // would otherwise re-run the effect on every render and loop forever, since
  // the effect sets a freshly-parsed state object each time.
  const domainsRef = useRef(domains);
  domainsRef.current = domains;
  const domainsKey = wysDomainsKey(domains);

  useEffect(() => {
    const read = readWysState(domainsRef.current);
    setSnapshot({ loaded: true, state: read.state, storageBlocked: read.storageBlocked });
  }, [domainsKey]);

  const update = useCallback(
    (change: (current: WysLocalStateV1) => WysLocalStateV1) => {
      const result = updateWysState(change, domainsRef.current);
      setSnapshot({ loaded: true, state: result.state, storageBlocked: !result.persisted });
    },
    [domainsKey]
  );

  const restart = useCallback(
    (options?: RestartCourseOptions) => {
      const result = restartCourse(options ?? {}, domainsRef.current);
      setSnapshot({ loaded: true, state: result.state, storageBlocked: !result.persisted });
    },
    [domainsKey]
  );

  const clearAll = useCallback(() => {
    const result = clearAllWysData();
    setSnapshot({ loaded: true, state: result.state, storageBlocked: !result.cleared });
  }, []);

  return { ...snapshot, update, restart, clearAll };
}
