"use client";

import type { ReactNode } from "react";
import { WYS_DOMAINS } from "@/content/watch-your-step/domains";
import { useWysState } from "@/components/wys/useWysState";
import { currentTodayStopId } from "./current-stop";

/**
 * Renders its children only for the stop the learner is actually on
 * (plan §5.3, §5.4, §7.3).
 *
 * WHY A GATE AND NOT A LOOKUP. Today is one static URL that has to show a
 * different stop to different learners, and the stop is derived from `wys:v1`,
 * which §7.3 forbids reading during render. The alternative shapes both fail:
 * a server component cannot know the stop, and a client component that BUILT
 * the loop would have to receive every stop's prose as props — which would put
 * withheld draft text into the flight payload, the one place `GatedText`'s
 * blocked branch exists to keep it out of.
 *
 * So the loop stays SERVER-RENDERED, once per stop, and this client component
 * decides which of those server-rendered trees is emitted. It receives
 * `children`, never content.
 *
 * HYDRATION. Until `loaded` is true the gate shows `fallback` — the first
 * lettered stop, which is where a learner who has just finished Lesson Zero
 * actually is. Server HTML and first client HTML are therefore identical and no
 * numeral or title flickers into a different one; a returning learner's screen
 * settles on their own stop on the first effect, in the same tick the visit
 * counter settles.
 *
 * A blocked-storage browser (iOS Safari private mode throws on `localStorage`)
 * lands on the empty state, so it sees the first stop — a real answer, not a
 * crash.
 */
export function CurrentStopGate({
  stopId,
  fallback = false,
  children
}: {
  stopId: string;
  /** True on exactly one stop: the one shown before local state has loaded. */
  fallback?: boolean;
  children: ReactNode;
}) {
  const { loaded, state } = useWysState(WYS_DOMAINS);
  const current = loaded ? currentTodayStopId(state.progress, state.onboarding.cadence) : null;
  const show = current === null ? fallback : current === stopId;
  return show ? <>{children}</> : null;
}
