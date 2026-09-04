import type { GatedContent } from "@/lib/wys/content-gate";
import { isShowable } from "@/lib/wys/content-gate";
import type { VisitCountableStop } from "@/lib/wys/visit";
import { wysLabels } from "@/content/watch-your-step/copy";
import { GatedText } from "@/components/wys/GatedText";
import { CarryMark } from "./CarryMark";
import styles from "./today.module.css";

/**
 * CARRY (plan Phase 7; WYS §10 CARRY, §13; mockup 5b dc.html:95).
 *
 * The teal card the artboard ends Today on: `--tint-teal`, radius 22, padding
 * 18, a teal 600 heading and the bounded off-site behaviour beneath it. Teal
 * because §4.8's CardShell fills encode meaning and teal is "current / next /
 * carry"; it is a `<section>` rather than a `CardShell` because it owns the
 * carry's provenance and `CardShell` owns none.
 *
 * "THEN LEAVE" IS THE POINT. (WYS §10): "The product should regularly tell the
 * learner to leave." The heading says so, the behaviour is one bounded move,
 * and the mark beneath it asks for nothing back.
 *
 * THE SECOND HALF, RENDERED ONCE. Artboard 5b writes the carry as one paragraph
 * ending "No need to report back."; `content/watch-your-step/copy.ts` also
 * carries that sentence as its own canonical record, `carryThenLeaveText`,
 * "the teal CARRY card's second half". Two definitions of one sentence would be
 * exactly what Standing Order 07 forbids, so this card renders the record ONLY
 * while the carry's own prose is withheld — under Q21's default the behaviour
 * is blocked and the promise still needs saying; if Ben rules the other way the
 * behaviour renders and already ends in those words. One sentence on screen,
 * either way.
 */
export function CarryCard({
  behavior,
  leave,
  stop,
  carryId
}: {
  /** The carry's `behavior` line, gated. */
  behavior: GatedContent;
  /** `carryThenLeaveText`, rendered only while the behaviour is withheld. */
  leave: GatedContent | null;
  /** Id and cadence paths only — never the whole week (§8.5, and no draft titles). */
  stop: VisitCountableStop;
  carryId: string;
}) {
  const showLeave = leave !== null && !isShowable(behavior);

  return (
    <section className={styles.carryCard}>
      <span className={styles.carryHeading}>{wysLabels.carryHeading}</span>
      <GatedText content={behavior} />
      {showLeave ? (
        <div className={styles.carryLeave}>
          <GatedText content={leave} />
        </div>
      ) : null}
      <CarryMark stop={stop} carryId={carryId} />
    </section>
  );
}
