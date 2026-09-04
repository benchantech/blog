/**
 * The nine path cells, derived (plan Phase 10, §6.9; mockup 4a dc.html:380-391
 * desktop, dc.html:466-471 phone).
 *
 * ONE DERIVATION, TWO SURFACES: the home page draws all nine in a grid and the
 * `/watch-your-step` landing peeks at the first three in a scrolling row. Both
 * read the same stops, in the same order, with the same meta line — so a stop
 * cannot be described one way on `/` and another way on the course's own front
 * door.
 *
 * NOTHING IS TYPED. The letter comes from `stopLetter`, the visit count from
 * `visitCount` (the cadence path's length), the off-site and terminal tags from
 * `wysLabels`, the display name from `stopDisplayName`, and the Lesson Zero
 * duration from `landingLabels`. The `4a` cells read "A · 3 visits" and
 * "F · off-site"; if a cadence path changes length, the cell changes with it
 * rather than going quietly stale.
 *
 * THE TITLE IS GATED, AND UNDER Q21's DEFAULT IT IS WITHHELD. Every stop title
 * is `draft` + `IMPLEMENTATION_PLACEHOLDER` — they are an implementation
 * scaffold (WYS §11), not Ben-approved doctrine — so the cell falls back to the
 * stop's DERIVED name ("Lesson 0", "Stop A"), which is structure rather than
 * prose, and the scaffold footnote both artboards draw explains why. The same
 * fallback `CurrentCard` uses on Plan.
 *
 * Pure TypeScript: no JSX and no CSS import, so it is importable from a test.
 */

import type { GatedContent } from "@/lib/wys/content-gate";
import { gateProse, isShowable } from "@/lib/wys/content-gate";
import { wysLabels } from "@/content/watch-your-step/copy";
import { landingLabels } from "@/content/watch-your-step/landing";
import { stopDisplayName } from "@/content/watch-your-step/tabs";
import type { WysWeek } from "@/content/watch-your-step/types";
import { stopLetter, visitCount, wysWeeks } from "@/content/watch-your-step/weeks";

/**
 * The cadence the marketing cells count in.
 *
 * `visitCount` needs one, and a public page has no learner to ask — it reads no
 * local state at all (§7.3), so it cannot use the visitor's own pace. The `4a`
 * cells read "A · 3 visits", which is the THREE-DAY path, so that is the path
 * the cells count (R1: the approved artboard settles the number on screen). The
 * count is still DERIVED — it is `cadencePaths.days3.length`, not the digit 3 —
 * so a curriculum change moves the cell instead of leaving it stale, and the
 * hero paragraph above says "2 to 5 short visits" for the full range.
 */
const MARKETING_CADENCE = "3" as const;

/** The four fills `StopCard` draws, in the artboard's assignment. */
export type LandingStopState = "lesson" | "current" | "future" | "terminal";

export interface LandingStopCell {
  id: string;
  /** "Lesson 0 · 5 min", "A · 3 visits", "F · off-site", "H · the end". */
  meta: string;
  /** The scaffold title if it may render; otherwise the derived stop name. */
  title: string;
  /** True while the title is withheld — the surface may want to say so. */
  titleWithheld: boolean;
  state: LandingStopState;
  href: string;
}

const weeks: readonly WysWeek[] = wysWeeks;

function metaFor(week: WysWeek): string {
  const letter = stopLetter(week);
  if (letter === null) return `${stopDisplayName(week)} · ${landingLabels.lessonZeroDuration}`;
  if (week.offSite) return `${letter} · ${wysLabels.offSiteTag}`;
  if (week.terminal) return `${letter} · ${wysLabels.terminalTag}`;
  const visits = visitCount(week, MARKETING_CADENCE);
  const noun = visits === 1 ? landingLabels.visitSuffix : landingLabels.visitsSuffix;
  return `${letter} · ${visits} ${noun}`;
}

/**
 * The fill, from the stop's own data.
 *
 * `4a` fills Lesson Zero ink, the FIRST lettered stop teal, the rest grey and
 * the terminal stop dashed. The teal one is "next", not "yours" — this is a
 * marketing surface with no local state and it must render identically for
 * every visitor, so the position is taken from the curriculum order and never
 * from `wys:v1` (§7.3: local state is not read during render).
 */
function stateFor(week: WysWeek, index: number): LandingStopState {
  if (stopLetter(week) === null) return "lesson";
  if (week.terminal) return "terminal";
  return index === 1 ? "current" : "future";
}

export function landingStopCells(): LandingStopCell[] {
  return weeks.map((week, index) => {
    const title: GatedContent = gateProse("general", week, week.title);
    const showable = isShowable(title);
    return {
      id: week.id,
      meta: metaFor(week),
      title: showable ? title.text : stopDisplayName(week),
      titleWithheld: !showable,
      state: stateFor(week, index),
      href: `/watch-your-step/stop/${week.id}`
    };
  });
}

/** The first three, for the phone's peek row (dc.html:466-471). */
export function landingStopPeek(): LandingStopCell[] {
  return landingStopCells().slice(0, 3);
}
