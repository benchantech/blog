import type { ReactNode } from "react";
import type { GatedContent } from "@/lib/wys/content-gate";
import { isShowable } from "@/lib/wys/content-gate";
import { Pill } from "@/components/ui/Pill";
import { ProvenanceMono } from "@/components/provenance/ProvenanceMono";
import { ProvenanceMarks } from "./ProvenanceMarks";
import styles from "./wys-primitives.module.css";

/**
 * The fictional practice scenario (plan §4.8; mockup 5b dc.html:87-89, mockup
 * 4a dc.html:333-338).
 *
 * White, 1.5px hairline, radius 22 — **the only bordered container on the
 * screen**, because a border here means "a live decision surface" (§4.8
 * CardShell). It is a `<section>` rather than a `CardShell` because the JUDGE
 * choices and the Commit pill sit inside the same border, and `CardShell`'s
 * `live` fill exists for exactly this shape; the difference is that this card
 * owns a scenario's provenance and `CardShell` owns none.
 *
 * TWO STRINGS, ONE RECORD, ONE PROVENANCE LINE. `setting` and `decisionMoment`
 * are two fields of one `WysScenario` (or of its `shortForm` at 390px — one
 * record, two presentations, §6.8 collapse 1), so the label and the draft mark
 * render ONCE at the foot of the card rather than once per paragraph.
 *
 * WHILE Q21's DEFAULT HOLDS, this renders its withheld state: every scenario in
 * `content/watch-your-step/scenarios.ts` is `draft` +
 * `IMPLEMENTATION_PLACEHOLDER`, so `policy.kind` is `blocked` and the card shows
 * the provenance label where the artboard draws prose. The pill still renders —
 * "Fictional · nothing about you" is a true statement about the exercise, not a
 * quotation of it.
 */
export function ScenarioCard({
  pill,
  setting,
  decisionMoment,
  children
}: {
  /** `wysLabels.fictionalPill`. A claim about the exercise, not its content. */
  pill: string;
  setting: GatedContent;
  /** The bolded question the artboard ends the paragraph with. */
  decisionMoment?: GatedContent;
  /** The choices, the Commit pill and everything the JUDGE composite adds. */
  children?: ReactNode;
}) {
  const showSetting = isShowable(setting);
  const showDecision = decisionMoment !== undefined && isShowable(decisionMoment);

  return (
    <section className={styles.scenario}>
      <p className={styles.scenarioPillRow}>
        <Pill variant="status" size="sm">
          {pill}
        </Pill>
      </p>

      {showSetting ? <p className={styles.scenarioBody}>{setting.text}</p> : null}
      {showDecision ? <p className={styles.scenarioDecision}>{decisionMoment.text}</p> : null}

      <div className={styles.scenarioMarks}>
        {showSetting ? (
          <ProvenanceMarks content={setting} />
        ) : (
          <ProvenanceMono>{setting.label}</ProvenanceMono>
        )}
      </div>

      {children}
    </section>
  );
}
