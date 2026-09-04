/**
 * The Plan view's own vocabulary (plan Phase 7, §12; mockup 5b Plan,
 * dc.html:102-118).
 *
 * Two things live here, and they are kept apart on purpose:
 *
 *  1. THE PACE VOCABULARY — the four cadences and the four time budgets, each
 *     with BOTH of its approved presentations. Lesson Zero draws them as
 *     selectable options ("3 days a week", "About 10 min"; artboard `5a`,
 *     dc.html:57-60) and Plan draws the learner's choice back as one status
 *     status pill ("3 days · ~10 min"; artboard `5b`, dc.html:103). One node, two
 *     presentations — plan §6.8 / Standing Order 07. **Lesson Zero must import
 *     these labels rather than retype them**; the day the two files disagree,
 *     the pill on Plan stops describing the choice the learner actually made.
 *
 *  2. THE PLAN ROW LABELS — the short tags the `5b` artboard draws on the rows
 *     themselves. Labels, not canonical records, on the same reasoning
 *     `wysLabels` and `judgeLabels` use: a two-word tag has no `full` form and
 *     no source to cite beyond the artboard it is drawn on. `offSiteTag` and
 *     `terminalTag` are NOT redefined here — they already exist in `./copy.ts`
 *     and are re-exported through `planLabels` so the Plan view has one import
 *     and the strings still have one home.
 *
 * NO RECORDS, so this module is declared record-free in `./index.ts`. Nothing
 * here is a claim about Ben or about the world: it is the name of a pace, the
 * name of a state, and the name of a control.
 *
 * WHAT IS DELIBERATELY ABSENT (WYS §12, and it is the whole point of the
 * screen): there is no "behind", no "overdue", no "missed", no streak, no
 * percentage and no encouragement copy, because there is no vocabulary here to
 * build one out of. `tests/wys-plan.test.ts` asserts that absence over this
 * module and over the Plan route, so it cannot be reintroduced quietly.
 */

import type { WysCadence, WysTimeBudget } from "@/lib/wys/local-state";
import { wysLabels } from "./copy";

/* -------------------------------------------------------------------------- */
/* 1. The pace vocabulary — one node, two presentations                       */
/* -------------------------------------------------------------------------- */

export interface WysPaceOption<Id extends string> {
  id: Id;
  /** Lesson Zero's selectable form (artboard `5a`, "How often?" / "How long each time?"). */
  optionLabel: string;
  /** Plan's status-pill form (artboard `5b`, the teal pill beside the title). */
  pillLabel: string;
}

/**
 * (WYS §17) `cadence`, and artboard `5a`'s four options in the drawn order.
 *
 * "Most days" carries the same word in both presentations because the artboard
 * gives it no shorter form and inventing one ("~daily") would be a new claim
 * about frequency. (WYS §12): cadence changes how many angles are practised, it
 * does not accelerate through Ben's source periods — which is why
 * `mostDays` falls back to `days5` in `lib/wys/local-state.ts` rather than to
 * something longer.
 */
export const wysCadenceOptions = [
  { id: "2", optionLabel: "2 days a week", pillLabel: "2 days" },
  { id: "3", optionLabel: "3 days a week", pillLabel: "3 days" },
  { id: "5", optionLabel: "5 days a week", pillLabel: "5 days" },
  { id: "most", optionLabel: "Most days", pillLabel: "Most days" }
] as const satisfies readonly WysPaceOption<WysCadence>[];

/**
 * (WYS §17) `timeBudget`, and artboard `5a`'s four options in the drawn order.
 *
 * The pill form keeps the tilde the `5b` artboard draws ("~10 min") because
 * the number is an estimate of a session, not a promise about one. "20+ min"
 * already carries its own qualifier, so it takes no tilde — "~20+ min" would
 * hedge a hedge.
 */
export const wysTimeBudgetOptions = [
  { id: "5", optionLabel: "About 5 min", pillLabel: "~5 min" },
  { id: "10", optionLabel: "About 10 min", pillLabel: "~10 min" },
  { id: "15", optionLabel: "About 15 min", pillLabel: "~15 min" },
  { id: "20plus", optionLabel: "20+ min", pillLabel: "20+ min" }
] as const satisfies readonly WysPaceOption<WysTimeBudget>[];

export function cadenceOption(id: WysCadence): WysPaceOption<WysCadence> {
  const option = wysCadenceOptions.find((candidate) => candidate.id === id);
  if (!option) throw new Error(`No WYS cadence option with id "${id}".`);
  return option;
}

export function timeBudgetOption(id: WysTimeBudget): WysPaceOption<WysTimeBudget> {
  const option = wysTimeBudgetOptions.find((candidate) => candidate.id === id);
  if (!option) throw new Error(`No WYS time-budget option with id "${id}".`);
  return option;
}

/**
 * "3 days · ~10 min" — artboard `5b`, the status pill beside the Plan title.
 *
 * Returns `null` when the learner has chosen neither, and the pill is then not
 * rendered at all rather than rendered with a guessed default. A learner who
 * has not been through Lesson Zero has no pace, and a screen that showed one
 * would be describing a choice nobody made. Half a choice renders as half a
 * pill, for the same reason.
 */
export function pacePillLabel(cadence?: WysCadence, timeBudget?: WysTimeBudget): string | null {
  const parts: string[] = [];
  if (cadence) parts.push(cadenceOption(cadence).pillLabel);
  if (timeBudget) parts.push(timeBudgetOption(timeBudget).pillLabel);
  return parts.length > 0 ? parts.join(" · ") : null;
}

/* -------------------------------------------------------------------------- */
/* 2. The Plan row labels                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Every short string the `5b` Plan artboard draws, plus the four this build
 * authored and reports.
 *
 * AUTHORED, and each is recorded in `docs/facelift-unapproved.md`:
 *  - `optionalPracticesHeading` and `optionalPracticesLink` — (WYS §12) requires
 *    Plan to show optional practices and the artboard draws no such row
 *    (plan Phase 7, ratified: add the row, flag it NEW).
 *  - `changePaceHref` — the artboard draws the control with an arrow and no
 *    destination. Lesson Zero's pace step is the only place a pace is chosen,
 *    so that is where it points; a second pace control would be a second
 *    canonical node for one decision (§5.1).
 *  - `doneMark` — the artboard's tag is the single string "done ✓". The glyph
 *    is split out and rendered `aria-hidden`, so the row announces "done"
 *    rather than "done check mark". Nothing is removed from the screen.
 */
export const planLabels = {
  /** The dark card's eyebrow, right of the stop name. Artboard: "STOP A · NOW". */
  nowTag: "NOW",
  /** The dark card's third line. Artboard: "Next: an excerpt and one core decision". */
  nextPrefix: "Next:",
  /** The completed row's tag. Artboard: "done ✓". */
  doneTag: "done",
  doneMark: "✓",
  /** Defined in ./copy.ts; re-exported so the Plan view has one import. */
  offSiteTag: wysLabels.offSiteTag,
  terminalTag: wysLabels.terminalTag,
  /** The teal control at the foot of the screen. Artboard, verbatim. */
  changePace: "Change pace or time",
  changePaceHref: "/watch-your-step/start",
  /** NEW — the (WYS §12) row no artboard draws. */
  optionalPracticesHeading: "OPTIONAL PRACTICES",
  optionalPracticesLink: "Open Practice",
  optionalPracticesHref: "/watch-your-step/practice"
} as const;

export type WysPlanLabelKey = keyof typeof planLabels;
