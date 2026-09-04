/**
 * The Plan view's derivation, as a pure module (plan Phase 7, §12; mockup 5b).
 *
 * Two halves, split by what they are allowed to touch:
 *
 *  - `planStopViews()` and `planDaySummaries()` read `content/` and gate every
 *    string through `lib/wys/content-gate.ts`. They run on the SERVER, once, at
 *    build time, and hand the client component plain serializable data. That is
 *    what keeps the curriculum out of the client bundle and keeps provenance
 *    gating on the one side of the boundary that cannot be skipped.
 *
 *  - `planRows()` is pure: stops in, local state in, row states out. No React,
 *    no storage, no content import. It is the whole of Plan's behaviour, so the
 *    rules (WYS §12) states as prohibitions — no "behind", no percentage, no
 *    guilt — are checked by `tests/wys-plan.test.ts` over every reachable
 *    state instead of being promised about a component.
 *
 * THE ROW STATES ARE THE THREE THE ARTBOARD DRAWS, AND NO FOURTH.
 * `done` · `current` · `future`. A learner who has not opened the site for a
 * month gets exactly the same three states as one who was here this morning:
 * the model has no clock, takes no timestamp and computes nothing from
 * `lastOpenedAt`, so there is no state a lapse could move a row into. That is
 * the architecture half of (WYS §12)'s "no artificial 'behind' state" and "no
 * guilt for missed days" — it is not enforced by carefully-worded copy (R8).
 *
 * CURRENT IS THE FIRST INCOMPLETE STOP, not "the furthest one reached". A
 * learner who jumps ahead and finishes stop D leaves A-C incomplete; the plan
 * puts them back at A and marks D done, rather than declaring three stops
 * skipped. Nothing is ever marked missed.
 *
 * A COMPLETED COURSE HAS NO CURRENT ROW. Every row reads `done`, the dark card
 * is absent, and nothing invites another lap: (WYS §12)'s "Plan should show a
 * finite horizon" and (WYS §13)'s "the product should regularly tell the
 * learner to leave" both point the same way. Stop H's own surface is the exit.
 */

import { visitLabel, visitPositionFor, type VisitCountableStop } from "@/lib/wys/visit";
import type { WysCadence, WysLocalStateV1 } from "@/lib/wys/local-state";
import type { GatedContent } from "@/lib/wys/content-gate";

/* -------------------------------------------------------------------------- */
/* The view model                                                             */
/* -------------------------------------------------------------------------- */

/**
 * One stop, as the Plan row needs it. Everything is either derived structure
 * (the mark, the name, the href) or a gated content object (the title) — there
 * is no bare curriculum string on this interface, so the client component
 * cannot render prose the gate has not seen.
 */
export interface PlanStopView extends VisitCountableStop {
  id: string;
  /** The artboard's leading cell: "0" for Lesson Zero, then "A"-"H". Derived. */
  mark: string;
  /** "Lesson 0" / "Stop A" — `stopDisplayName`, never the draft stop title. */
  name: string;
  /** The deep-linkable per-stop route (§5.3). */
  href: string;
  /** The stop's own scaffold title, gated. Blocked while Q21's default holds. */
  title: GatedContent;
  offSite?: boolean;
  terminal?: boolean;
}

export type PlanRowState = "done" | "current" | "future";

export interface PlanRow {
  stop: PlanStopView;
  state: PlanRowState;
  /** "visit 2 of 3" — only on the current row, and never on an off-site stop. */
  visit: string | null;
  /** The day-plan summary for the visit in front of the learner. */
  next: string | null;
  /** The single right-hand tag: "done" / "off-site" / "the end", or none. */
  tag: PlanRowTag | null;
}

export type PlanRowTag = "done" | "offSite" | "terminal";

/* -------------------------------------------------------------------------- */
/* The derivation                                                             */
/* -------------------------------------------------------------------------- */

/**
 * ONE TAG PER ROW, and the order is the decision.
 *
 * A stop can be several things at once — stop F is off-site AND, once marked,
 * done; stop H is terminal AND, once marked, done. The artboard draws one tag
 * per row, so the state the learner just changed wins over the structure that
 * was always true: `done` first, then `off-site`, then `the end`. The current
 * row takes no tag on its left-hand side at all — its dark card carries the
 * position on the right instead, which is what the artboard draws.
 */
function tagFor(stop: PlanStopView, state: PlanRowState): PlanRowTag | null {
  if (state === "done") return "done";
  if (stop.offSite) return "offSite";
  if (stop.terminal) return "terminal";
  return null;
}

/**
 * The rows, in curriculum order.
 *
 * `loaded` is not a convenience flag — it is §7.3's hydration rule made
 * explicit. `wys:v1` may not be read during render, so the server HTML, the
 * first client render and a no-JS visitor all get the SAME thing: the whole
 * plan with nothing marked, every row a link, no dark card and no numerals.
 * §5.4 names that as Plan's honest zero state ("a full plan with nothing
 * marked"), and it is true at every moment — including for the returning
 * learner whose progress simply has not been read yet. A guessed current row
 * would be wrong for exactly the people who have the most state, and would then
 * visibly correct itself.
 */
export function planRows(
  stops: readonly PlanStopView[],
  state: WysLocalStateV1,
  loaded: boolean,
  daySummaries: Readonly<Record<string, string>>
): PlanRow[] {
  if (!loaded) {
    return stops.map((stop) => ({ stop, state: "future" as const, visit: null, next: null, tag: tagFor(stop, "future") }));
  }

  const cadence: WysCadence | undefined = state.onboarding.cadence;
  let currentTaken = false;

  return stops.map((stop) => {
    const position = visitPositionFor(stop, state.progress, cadence);

    if (position.complete) {
      return { stop, state: "done" as const, visit: null, next: null, tag: tagFor(stop, "done") };
    }

    if (!currentTaken) {
      currentTaken = true;
      const next = position.dayPlanId ? (daySummaries[position.dayPlanId] ?? null) : null;
      return {
        stop,
        state: "current" as const,
        // An off-site stop is a single visit by rule (WYS §15.2), so "visit 1
        // of 1" would be a counter of a thing that is not counted. The row says
        // "off-site" instead, which is what the artboard draws.
        visit: stop.offSite ? null : visitLabel(position),
        next,
        tag: stop.offSite ? "offSite" : null
      };
    }

    return { stop, state: "future" as const, visit: null, next: null, tag: tagFor(stop, "future") };
  });
}

/** The current row, or null when the course is finished or state is unread. */
export function currentPlanRow(rows: readonly PlanRow[]): PlanRow | null {
  return rows.find((row) => row.state === "current") ?? null;
}
