import { cx } from "@/components/provenance/cx";
import styles from "./wys-primitives.module.css";

/** The four moves (plan §4.8). Active ink, inactive tint-grey. */
export const WYS_PHASES = ["Watch", "Try", "Judge", "Carry"] as const;
export type WysPhase = (typeof WYS_PHASES)[number];

export function PhasePills({ active, label = "Visit phase" }: { active: WysPhase; label?: string }) {
  return (
    <ol className={styles.phaseRow} aria-label={label}>
      {WYS_PHASES.map((phase) => (
        <li
          className={cx(styles.phase, phase === active && styles.phaseActive)}
          key={phase}
          aria-current={phase === active ? "step" : undefined}
        >
          {phase}
        </li>
      ))}
    </ol>
  );
}
