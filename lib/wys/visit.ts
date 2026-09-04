/**
 * The visit counter (plan §5.3).
 *
 * Today renders "Stop A · visit 1 of 3" (mockup 5b) and Plan renders a row per
 * stop, but `WysLocalStateV1.progress` has no `visits` field and §7.1 forbids
 * adding one — the shape is verbatim (WYS §17). So the position is **derived
 * from content data plus completed IDs and rendered, never stored**:
 *
 *   of m  = the length of the learner's resolved cadence path for that stop
 *           (`cadencePathFor`, which never returns undefined — §5.3);
 *   visit = (that stop's path steps already marked complete) + 1.
 *
 * **THIS DERIVATION IS AUTHORED, NOT SPECIFIED, AND IS REPORTED AS SUCH**
 * (plan §5.3; docs/facelift-unapproved.md).
 *
 * ONE REFINEMENT ON §5.3'S WORDING, and it is a correction rather than a
 * liberty. §5.3 says "steps whose IDs appear in `progress.*`". A cadence path
 * element is a **day-plan id** (`day-human-source`, `day-boundary` — see
 * `content/watch-your-step/day-plans.ts`) and those ids REPEAT across stops:
 * `day-human-source` is day 1 of stop A and day 1 of stop B. Storing the bare
 * id would make finishing stop A's first visit advance stop B's counter too. So
 * a completed visit is recorded under `visitId(stopId, dayPlanId)` —
 * `"stop-a:day-human-source"` — which is a legal `wys:v1` id token (colons are
 * in the serializer's `ID_TOKEN` set), needs no new field, and cannot collide.
 * Reported with the derivation.
 *
 * Pure TypeScript. No React, no CSS, no content import — the week and the state
 * arrive as arguments, exactly as `cadencePathFor` takes its week, so `lib/`
 * never imports `content/` (which imports back).
 */

import {
  cadencePathFor,
  type WysCadence,
  type WysCadenceWeek,
  type WysLocalStateV1
} from "./local-state";

/** The minimum a stop must carry to have a position. */
export interface VisitCountableStop extends WysCadenceWeek {
  id: string;
  /** Stop F is off-site: a single visit, whatever the cadence (WYS §15.2). */
  offSite?: boolean;
}

/**
 * The stop, reduced to exactly the fields a visit position is derived from.
 *
 * `VisitCounter` and `StopStartTelemetry` are client components, and React
 * serialises every client prop into the RSC flight payload that Next.js inlines
 * into the prerendered HTML. A `WysStop` handed over whole therefore publishes
 * its `title` and `purpose` — draft scaffold (WYS §11) that
 * `RENDER_MARKED_DRAFT` exists to withhold — in the page source of every stop
 * route. Structural typing makes that mistake invisible: the wide object
 * satisfies `VisitCountableStop` and the compiler is content.
 *
 * So the projection is explicit and named, and every server surface that hands
 * a stop to a client component goes through it. Three fields cross: an id, the
 * cadence paths, and the off-site flag. All three are structure, none is prose.
 */
export function visitCountableStop(stop: VisitCountableStop): VisitCountableStop {
  return { id: stop.id, cadencePaths: stop.cadencePaths, offSite: stop.offSite };
}

/**
 * The id a completed visit is recorded under, in
 * `progress.completedLessonIds`. One place, so a reader and a writer cannot
 * disagree about the format.
 */
export function visitId(stopId: string, dayPlanId: string): string {
  return `${stopId}:${dayPlanId}`;
}

export interface VisitPosition {
  /** 1-based, clamped into 1..total. Never 0, never total + 1. */
  visit: number;
  /** `of m`. The resolved cadence path length; 1 for an off-site stop. */
  total: number;
  /** The day plan this visit renders, or null when the stop is finished. */
  dayPlanId: string | null;
  /** True once every step of the path is marked complete. */
  complete: boolean;
  /** The resolved path itself, for callers that render the whole week. */
  path: readonly string[];
}

/** Every id the learner has marked complete, across the four declared arrays. */
function completedIds(progress: WysLocalStateV1["progress"]): Set<string> {
  return new Set([
    ...progress.completedLessonIds,
    ...progress.completedScenarioIds,
    ...progress.completedCarryIds,
    ...progress.transferCheckIds
  ]);
}

/**
 * "visit n of m" for one stop, derived.
 *
 * Off-site stops (WYS §15.2 detox) are a single visit by rule: the learner is
 * away from the screen, so a multi-day path would be a count of days nobody is
 * meant to spend here.
 *
 * Counting is by MEMBERSHIP, not by prefix: a path that repeats a day plan
 * would otherwise double-count one completion. Repeats do not occur in the
 * shipped content and this does not depend on that staying true.
 */
export function visitPositionFor(
  stop: VisitCountableStop,
  progress: WysLocalStateV1["progress"],
  cadence?: WysCadence
): VisitPosition {
  const path = stop.offSite ? cadencePathFor(stop, cadence).slice(0, 1) : cadencePathFor(stop, cadence);
  const total = Math.max(path.length, 1);
  const done = completedIds(progress);

  let completed = 0;
  for (const dayPlanId of path) {
    if (done.has(visitId(stop.id, dayPlanId))) completed += 1;
  }

  const complete = completed >= total;
  const visit = Math.min(completed + 1, total);
  const dayPlanId = complete ? null : (path[completed] ?? null);

  return { visit, total, dayPlanId, complete, path };
}

/**
 * The rendered form, "visit 1 of 3".
 *
 * A separate function because the numerals and the word are one string on
 * screen and the caller must not build it a second way. Completion renders as
 * `visit 3 of 3` rather than `4 of 3` — the position is clamped in
 * `visitPositionFor`, so there is no "over" state and nothing to feel behind.
 */
export function visitLabel(position: VisitPosition): string {
  return `visit ${position.visit} of ${position.total}`;
}

/**
 * The current stop, derived from PROJECTED stops rather than from the content
 * model (plan §5.3, §5.4).
 *
 * Same rule `app/watch-your-step/(shell)/today/current-stop.ts` states: the
 * current stop is the first stop whose derived position is not complete, and
 * the last one when they are all complete. It lives HERE, taking
 * `VisitCountableStop[]`, because the one component that has to evaluate it in
 * the browser — `CurrentStopGate` — must not reach the week records to do so.
 *
 * WHY THAT MATTERS, and it is the module-graph half of the leak
 * `visitCountableStop()` above already closes for props. A client component
 * that IMPORTS a content module pulls that module into a client JavaScript
 * chunk, whatever it goes on to read from it: `CurrentStopGate` imported
 * `letteredStops()`, and the Phase 12 audit found every stop title, short
 * title, aim and scaffold note — `draft` + `IMPLEMENTATION_PLACEHOLDER`, and
 * therefore BLOCKED under Q21's ratified default — sitting in plain text in
 * `static/chunks/*.js`, served to every visitor of the page that had just
 * honestly drawn "Implementation placeholder — not Ben's words" in its DOM.
 * Emptying `text` at the gate does nothing about that; only keeping the import
 * out of the client graph does.
 *
 * So the derivation is content-free and the projection crosses the boundary:
 * an id, the cadence paths, an off-site flag. All three are structure, none is
 * prose. `lib/` importing no content module is what makes that checkable.
 */
export function currentStopIdFrom(
  stops: readonly VisitCountableStop[],
  progress: WysLocalStateV1["progress"],
  cadence?: WysCadence
): string | null {
  for (const stop of stops) {
    if (!visitPositionFor(stop, progress, cadence).complete) return stop.id;
  }
  return stops[stops.length - 1]?.id ?? null;
}
