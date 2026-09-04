/**
 * The Plan view's content half (plan Phase 7, §12; mockup 5b).
 *
 * SERVER ONLY, and split from `plan-model.ts` for that reason: this module
 * imports `content/watch-your-step/*` and gates every string through
 * `lib/wys/content-gate.ts`, which is work that must happen exactly once, at
 * build time, on the side of the boundary where the provenance rules cannot be
 * skipped. `plan-model.ts` stays pure so the client component can import the
 * derivation without importing the curriculum.
 *
 * It is also what makes the screen testable without a renderer (Q15: no
 * Playwright). Everything here is a plain function over content, so
 * `tests/wys-plan.test.ts` can assert the marks, the hrefs and the gating
 * directly — `page.tsx` imports a `.module.css` and therefore cannot be
 * imported by the node test runner at all.
 */

import { wysDayPlans } from "@/content/watch-your-step/day-plans";
import { wysRitualById, type WysRitualId } from "@/content/watch-your-step/rituals";
import { stopDisplayName } from "@/content/watch-your-step/tabs";
import type { WysWeek } from "@/content/watch-your-step/types";
import { stopLetter, wysWeeks as wysWeeksConst } from "@/content/watch-your-step/weeks";
import { gateProse, isShowable, type GatedContent } from "@/lib/wys/content-gate";
import type { PlanStopView } from "./plan-model";

/** Widened from the `as const` array so optional fields are readable (repo idiom). */
const wysWeeks: readonly WysWeek[] = wysWeeksConst;

/**
 * The artboard's leading cell: "0" for Lesson Zero, then "A"-"H"
 * (dc.html:106, :108-114).
 *
 * Derived from `order` through `stopLetter`, never typed: (WYS §11) requires
 * the engine to support 8-12 source periods "without hardcoding a fixed
 * number", so a tenth stop takes its letter from the same place the ninth does
 * (§6.9). Lesson Zero has no letter and the artboard gives it its order.
 */
export function stopMark(week: WysWeek): string {
  return stopLetter(week) ?? String(week.order);
}

/**
 * The stops, gated, as plain serializable data for the client component.
 *
 * `title` is a `GatedContent`, never a string, so nothing downstream can hold
 * a stop title without the policy and label that govern it (§6.2). Under Q21's
 * ratified default every one of them is blocked — the titles are draft
 * implementation scaffold (WYS §11) — and the rows render their derived mark
 * alone.
 */
export function planStopViews(): PlanStopView[] {
  return wysWeeks.map((week) => ({
    id: week.id,
    mark: stopMark(week),
    name: stopDisplayName(week),
    href: `/watch-your-step/stop/${week.id}`,
    title: gateProse("general", week, week.title),
    offSite: week.offSite,
    terminal: week.terminal,
    cadencePaths: week.cadencePaths
  }));
}

/**
 * The day-plan summaries, by id (`content/watch-your-step/day-plans.ts`).
 *
 * One map for the whole screen rather than a summary copied onto each stop: the
 * current row needs exactly one of them, and WHICH one depends on the learner's
 * cadence — which the server may not know (§7.3). Two presentations of one
 * definition: Today renders the same fragment after "Next: " and Plan renders
 * it here.
 */
export function planDaySummaries(): Record<string, string> {
  return Object.fromEntries(wysDayPlans.map((plan) => [plan.id, plan.summary]));
}

/**
 * Every optional practice the course offers, in first-appearance order, gated.
 *
 * (WYS §12) requires Plan to show optional practices; the approved `5b` artboard
 * draws no such row. Plan Phase 7's ratified default is to render it and flag it
 * NEW rather than silently drop a spec requirement. The data shape already
 * exists — `WysWeek.optionalPracticeIds` — so this is the rendering half.
 *
 * Deduplicated across stops on purpose: From Memory is optional at seven stops
 * and is ONE practice, not seven. A list that repeated it would be a longer
 * list, not a truer one.
 */
export function optionalPracticeNames(): GatedContent[] {
  const seen = new Set<string>();
  const gated: GatedContent[] = [];
  for (const week of wysWeeks) {
    for (const id of week.optionalPracticeIds ?? []) {
      if (seen.has(id)) continue;
      seen.add(id);
      const ritual = wysRitualById(id as WysRitualId);
      gated.push(gateProse("general", ritual, ritual.name));
    }
  }
  return gated;
}

/**
 * The distinct provenance labels of whatever is withheld in a group.
 *
 * The nine stop titles share one status, one origin and therefore one label, so
 * the withheld state is reported ONCE beneath the list instead of nine times
 * inside it. `ProvenanceMarks` splits itself out of `GatedText` for the same
 * reason at the level of one record: repeating a provenance line until it stops
 * being read is not more honest than rendering it once (WYS §23).
 *
 * Returned as a LIST rather than a single string because the grouping holds
 * only while the records agree: the day one stop title is Ben-approved and the
 * rest are not, this renders both labels instead of quietly picking one.
 */
export function withheldLabels(items: readonly GatedContent[]): string[] {
  const labels: string[] = [];
  for (const item of items) {
    if (isShowable(item)) continue;
    if (!labels.includes(item.label)) labels.push(item.label);
  }
  return labels;
}
