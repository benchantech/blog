"use client";

import { WYS_DOMAINS } from "@/content/watch-your-step/domains";
import { type VisitCountableStop, visitLabel, visitPositionFor } from "@/lib/wys/visit";
import { useWysState } from "./useWysState";

/**
 * "Stop A · visit 1 of 3" (plan §5.3; mockup 5b Today, dc.html:79).
 *
 * The position is DERIVED from content data plus completed ids and rendered —
 * never stored. `WysLocalStateV1.progress` has no `visits` field and §7.1
 * forbids adding one, so `lib/wys/visit.ts` computes it from the learner's
 * resolved cadence path. The derivation is authored, not specified, and is
 * reported (docs/facelift-unapproved.md).
 *
 * HYDRATION (§7.3). The count depends on `wys:v1` and on the chosen cadence, so
 * it cannot be computed during a server render. Until `loaded` is true this
 * renders `prefix` ALONE — "Stop A" — rather than a guessed "visit 1 of 3" that
 * would be wrong for a returning learner and would then visibly correct itself.
 * A stop label with no numeral is true at every moment; a wrong numeral is not.
 *
 * A blocked-storage browser (iOS Safari private mode throws on
 * `localStorage`) lands on the empty state, which is a real answer — visit 1 —
 * not a crash.
 */
export function VisitCounter({
  stop,
  prefix
}: {
  /** The stop's id, cadence paths and off-site flag. Content data only. */
  stop: VisitCountableStop;
  /** "Stop A". Rendered alone until local state has loaded. */
  prefix?: string;
}) {
  const { loaded, state } = useWysState(WYS_DOMAINS);
  const position = loaded ? visitPositionFor(stop, state.progress, state.onboarding.cadence) : null;

  if (!position) return <>{prefix ?? null}</>;

  const label = visitLabel(position);
  return <>{prefix ? `${prefix} · ${label}` : label}</>;
}
