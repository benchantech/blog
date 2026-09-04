"use client";

import type { ReactNode } from "react";
import { type VisitCountableStop, currentStopIdFrom } from "@/lib/wys/visit";
import { WYS_DOMAINS } from "@/content/watch-your-step/domains";
import { useWysState } from "@/components/wys/useWysState";

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
 *
 * THE STOPS ARRIVE AS A PROJECTION, NOT AS AN IMPORT (Phase 12 audit). This
 * component used to call `currentTodayStopId()` from `./current-stop`, which
 * imports `content/watch-your-step/weeks.ts` — and a client component that
 * imports a content module pulls that module into a client JavaScript chunk
 * whatever it reads from it. Every stop title, short title, aim and scaffold
 * note is `draft` + `IMPLEMENTATION_PLACEHOLDER`, and therefore BLOCKED under
 * Q21's ratified default, yet all of them were being served in plain text in
 * `static/chunks/*.js` by the very page that had drawn "Implementation
 * placeholder — not Ben's words" in its DOM. Emptying `text` at the gate does
 * nothing about a module edge; only removing the edge does. So the server hands
 * down `visitCountableStop()` projections — an id, the cadence paths, an
 * off-site flag — and the derivation runs in `lib/wys/visit.ts`, which imports
 * no content at all.
 */
export function CurrentStopGate({
  stopId,
  stops,
  fallback = false,
  children
}: {
  stopId: string;
  /**
   * Every stop Today can show, in course order, as `visitCountableStop()`
   * projections. Structure only — no title, no aim, no prose.
   */
  stops: readonly VisitCountableStop[];
  /** True on exactly one stop: the one shown before local state has loaded. */
  fallback?: boolean;
  children: ReactNode;
}) {
  const { loaded, state } = useWysState(WYS_DOMAINS);
  const current = loaded ? currentStopIdFrom(stops, state.progress, state.onboarding.cadence) : null;
  const show = current === null ? fallback : current === stopId;
  return show ? <>{children}</> : null;
}
