"use client";

import { useEffect } from "react";
import { WYS_DOMAINS } from "@/content/watch-your-step/domains";
import { CONTENT_VERSION } from "@/content/watch-your-step/version";
import { trackWys } from "@/lib/wys/telemetry";
import { visitPositionFor, type VisitCountableStop } from "@/lib/wys/visit";
import { useWysState } from "./useWysState";

/**
 * `wys_source_period_start` (plan Phase 7; WYS §19.4).
 *
 * `lib/wys/telemetry.ts`'s own decision table names the firing point: "First
 * render of a stop's first visit (stop/[stopId] or Today), once per
 * source_period_id." Both surfaces mount this, so the trigger has one
 * definition instead of two that drift.
 *
 * WHAT IS SENT: the event name, `source_period_id` (a closed-vocabulary stop id)
 * and `content_version`. Nothing else exists to send — `trackWys` validates the
 * shape against the §19.1A property allowlist, refuses anything else loudly in
 * development, and drops it in production. It also refuses to send at all
 * unless `bct_analytics_consent === "granted"` (Q7), so a visitor who declined
 * analytics produces no request from this component.
 *
 * ONCE PER SOURCE PERIOD, WITH NO NEW STORAGE KEY. The guard is a module-level
 * `Set`, so the event fires at most once per stop per page load and survives
 * client-side navigation between course screens. A `sessionStorage` flag would
 * be more precise across reloads and would ALSO be a third browser key — one
 * that `lib/wys/browser-keys.ts` would have to declare and the Data page would
 * have to list, to make a duplicate analytics event slightly less likely. That
 * trade is the wrong way round: a small overcount is a diagnostic imprecision;
 * an undeclared key is a broken promise about what this site stores.
 *
 * It renders nothing.
 */

const started = new Set<string>();

export function StopStartTelemetry({ stop }: { stop: VisitCountableStop }) {
  const { loaded, state } = useWysState(WYS_DOMAINS);
  const cadence = state.onboarding.cadence;

  useEffect(() => {
    if (!loaded) return;
    if (started.has(stop.id)) return;

    // "A stop's FIRST visit" — a learner returning to visit 2 is not starting
    // the source period, and counting it as a start would inflate the one
    // number "started but not completed" is read against.
    const position = visitPositionFor(stop, state.progress, cadence);
    if (position.visit !== 1 || position.complete) return;

    started.add(stop.id);
    trackWys("wys_source_period_start", {
      source_period_id: stop.id,
      content_version: CONTENT_VERSION
    });
    // `state.progress` is intentionally not a dependency: the effect must run on
    // the first loaded render for this stop and never again, and the Set is what
    // enforces that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, stop.id]);

  return null;
}
