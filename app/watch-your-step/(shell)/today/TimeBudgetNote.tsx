"use client";

import { WYS_DOMAINS } from "@/content/watch-your-step/domains";
import { aboutMinutesLabel } from "@/content/watch-your-step/today";
import { useWysState } from "@/components/wys/useWysState";
import styles from "./today.module.css";

/**
 * "About 10 minutes." — the second half of artboard 5b's lead line
 * (dc.html:80).
 *
 * The artboard writes one sentence, "Task Before Prompt — about 10 minutes.",
 * whose first half is the stop title. Titles A-H are draft scaffold and are
 * withheld while `RENDER_MARKED_DRAFT` is false (Q21), so the page renders the
 * title through the gate and this line beneath it. No word is added, removed or
 * reordered; the sentence is split because half of it is not public yet.
 *
 * The minutes are the learner's own time budget, which lives in `wys:v1` and
 * may not be read during render (§7.3), so this is a client component that
 * renders NOTHING until `loaded` — a guessed "about 10 minutes" would be wrong
 * for a learner who chose 5 or 20+, and would then visibly correct itself.
 *
 * More time adds DEPTH, never speed: the budget changes what a visit contains
 * (`WysWeek.timeBudgetPaths`), never how many of Ben's recordings a learner gets
 * through (WYS §12). Nothing on this line implies otherwise.
 */
export function TimeBudgetNote() {
  const { loaded, state } = useWysState(WYS_DOMAINS);
  const budget = state.onboarding.timeBudget;
  if (!loaded || !budget) return null;
  return <p className={styles.leadNote}>{aboutMinutesLabel(budget)}</p>;
}
