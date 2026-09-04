"use client";

import { useEffect, useState } from "react";
import { WYS_DOMAINS } from "@/content/watch-your-step/domains";
import { todayLabels } from "@/content/watch-your-step/today";
import { CONTENT_VERSION } from "@/content/watch-your-step/version";
import { trackWys } from "@/lib/wys/telemetry";
import { type VisitCountableStop, visitId, visitPositionFor } from "@/lib/wys/visit";
import { ActionPill } from "@/components/ui/ActionPill";
import { useWysState } from "@/components/wys/useWysState";
import styles from "./today.module.css";

/**
 * "I did it" — the only thing on Today that counts as completion
 * (plan Phase 7 CARRY and completion semantics; WYS §10 CARRY, §13).
 *
 * COMPLETION SEMANTICS, restated because they are the product's honesty:
 * **opening is not completion, scrolling is not completion, time on page is not
 * completion.** (WYS §13) A CARRY counts on an INTENTIONAL MARK and on nothing
 * else, so this is a button the learner presses and there is no timer, no
 * scroll depth and no auto-advance anywhere on the screen.
 *
 * NO REPORTING REQUIREMENT. (WYS §10): "CARRY should often have no reporting
 * requirement", and every record in `content/watch-your-step/carries.ts` carries
 * `reportingRequired: false`. So the mark asks nothing: no "how did it go", no
 * note field, no free text, no follow-up prompt, and nothing about what the
 * learner actually did leaves the browser — the carry's own `doNotSendBack`
 * list is the promise, and the only thing recorded is that a mark happened.
 *
 * WHAT IT WRITES, and why the visit id is the interesting half:
 *
 *  - `progress.completedCarryIds` gains the carry id — the fact the mark is
 *    about.
 *  - `progress.completedLessonIds` gains `visitId(stopId, dayPlanId)` — the
 *    visit the learner has just finished. That id is the one the derived
 *    counter reads (§5.3, `lib/wys/visit.ts`), so the mark is what advances
 *    "visit 1 of 3" to "visit 2 of 3". It is qualified by its stop because a
 *    day-plan id repeats across stops.
 *
 * **THE VISIT-ADVANCING RULE IS AUTHORED, NOT SPECIFIED** (reported in
 * docs/facelift-unapproved.md). (WYS §10) makes CARRY the last move of the loop
 * and artboard 5b ends Today on the carry card, so the carry mark is the one
 * intentional signal a visit is over. Nothing else on Today could carry it: the
 * JUDGE commit is a scenario fact, not a visit fact.
 *
 * TELEMETRY, at exactly the two points §19.4 names and no others:
 *
 *  - `wys_carry_reached` fires when the card RENDERS in its actionable state —
 *    reached, NOT marked. `lib/wys/telemetry.ts`'s decision table is explicit
 *    about why: "a self-marked completion would be a weaker fact dressed as a
 *    stronger one", and no efficacy claim rests on it.
 *  - `wys_source_period_complete` fires when the mark completes the stop's
 *    whole cadence path.
 *
 * Both carry the stop id and the content version and nothing else; `trackWys`
 * refuses anything else and sends nothing at all unless analytics consent is
 * granted (Q7). The guard against a duplicate `wys_carry_reached` is a
 * module-level `Set`, not a session key — the same trade `StopStartTelemetry`
 * documents: a small overcount is a diagnostic imprecision, an undeclared
 * browser key is a broken promise about what this site stores.
 */

const reached = new Set<string>();

export function CarryMark({ stop, carryId }: { stop: VisitCountableStop; carryId: string }) {
  const { loaded, state, update } = useWysState(WYS_DOMAINS);
  const [justMarked, setJustMarked] = useState(false);

  const position = loaded ? visitPositionFor(stop, state.progress, state.onboarding.cadence) : null;
  const marked = justMarked || (position?.complete ?? false);

  useEffect(() => {
    if (!loaded || marked) return;
    if (reached.has(stop.id)) return;
    reached.add(stop.id);
    trackWys("wys_carry_reached", { source_period_id: stop.id, content_version: CONTENT_VERSION });
    // `marked` is intentionally not a dependency: the event is about reaching
    // the card, so a later mark must not re-open the question.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, stop.id]);

  function onMark(): void {
    if (!position || marked) return;
    const dayPlanId = position.dayPlanId;
    const lastVisit = dayPlanId !== null && position.visit >= position.total;

    update((current) => {
      const carries = current.progress.completedCarryIds.includes(carryId)
        ? current.progress.completedCarryIds
        : [...current.progress.completedCarryIds, carryId];
      const lessonId = dayPlanId === null ? null : visitId(stop.id, dayPlanId);
      const lessons =
        lessonId === null || current.progress.completedLessonIds.includes(lessonId)
          ? current.progress.completedLessonIds
          : [...current.progress.completedLessonIds, lessonId];
      return {
        ...current,
        progress: { ...current.progress, completedCarryIds: carries, completedLessonIds: lessons }
      };
    });

    setJustMarked(true);

    if (lastVisit) {
      trackWys("wys_source_period_complete", {
        source_period_id: stop.id,
        content_version: CONTENT_VERSION
      });
    }
  }

  if (marked) {
    return (
      <p className={styles.carryMarked} role="status">
        {todayLabels.carryMarked}
      </p>
    );
  }

  return (
    <div className={styles.carryMark}>
      <ActionPill variant="ink" full onClick={onMark}>
        {todayLabels.carryMark}
      </ActionPill>
      <p className={styles.carryHint}>{todayLabels.carryMarkHint}</p>
    </div>
  );
}
