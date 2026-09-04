/**
 * Which stop Today is showing (plan §5.3, §5.4).
 *
 * `WysLocalStateV1` carries no `currentStopId` and §7.1 forbids adding a field
 * to the verbatim `wys:v1` shape, so the current stop is DERIVED from the same
 * completed ids the visit counter reads:
 *
 *   the current stop is the first LETTERED stop whose derived visit position is
 *   not complete; when every one of them is complete it is the last.
 *
 * **AUTHORED, NOT SPECIFIED, AND REPORTED AS SUCH** (docs/facelift-unapproved.md),
 * on the same footing as §5.3's visit derivation, which the plan also authored
 * and required reporting. Two things follow from it and both are deliberate:
 *
 *  - **Lesson Zero is not a Today stop.** It is the ten-step flow at
 *    `/watch-your-step/start`, it has no Ben recording (`weeks.ts`
 *    `LESSON_ZERO_NO_RECORDING_REASON`) and it draws no WATCH card, so
 *    `stop-zero` is excluded rather than being a stop Today could sit on
 *    forever if the Lesson Zero flow never wrote its completion id.
 *  - **There is no "behind" and no "overdue".** The derivation returns a stop,
 *    never a deficit: nothing here can compute a number of missed days, which
 *    is what (WYS §12)'s "no behind state, no overdue, no missed, no streak"
 *    requires of the data model rather than of the copy.
 *
 * Pure TypeScript — no React, no CSS. `tests/wys-today.test.ts` runs it over a
 * learner at each position, which is the whole reason it is not a hook.
 */

import type { WysCadence, WysLocalStateV1 } from "@/lib/wys/local-state";
import { visitPositionFor } from "@/lib/wys/visit";
import type { WysWeek } from "@/content/watch-your-step/types";
import { letteredStops } from "@/content/watch-your-step/weeks";

/**
 * The stops Today can render, in course order.
 *
 * Every one of them is rendered into the page and exactly one is shown, so this
 * is also the list the server builds markup for. It is a function rather than a
 * constant so the count stays derived (§6.9) — nothing here may assume eight.
 */
export function todayStops(): readonly WysWeek[] {
  return letteredStops();
}

/** The stop Today shows before local state has loaded, and for a fresh learner. */
export function defaultTodayStop(): WysWeek | null {
  return todayStops()[0] ?? null;
}

/**
 * The learner's current stop.
 *
 * Returns `null` only when the course declares no lettered stop at all, which
 * is a content state rather than a learner state — Today renders nothing for
 * it rather than inventing a stop.
 */
export function currentTodayStop(
  progress: WysLocalStateV1["progress"],
  cadence?: WysCadence
): WysWeek | null {
  const stops = todayStops();
  for (const stop of stops) {
    if (!visitPositionFor(stop, progress, cadence).complete) return stop;
  }
  return stops[stops.length - 1] ?? null;
}

/** The id form, for the one client component that has to compare ids. */
export function currentTodayStopId(
  progress: WysLocalStateV1["progress"],
  cadence?: WysCadence
): string | null {
  return currentTodayStop(progress, cadence)?.id ?? null;
}
