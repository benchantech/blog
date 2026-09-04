import type { ReactNode } from "react";
import styles from "./primitives.module.css";

/**
 * StatCard (plan §4.8). A 34px numeral and an inline 17px muted denominator.
 *
 * NO RING, NO BAR, NO PERCENTAGE. (WYS): no scores, no streaks, no
 * gamification — a progress ring around "1 of 9" would turn a count into a
 * completion target, which is the thing the course refuses to be.
 */
export function StatCard({ value, denominator, label }: { value: ReactNode; denominator?: string; label: string }) {
  return (
    <div className={styles.stat}>
      <div className={styles.statNumber}>
        {value}
        {denominator ? <span className={styles.statDenominator}> {denominator}</span> : null}
      </div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className={styles.statGrid}>{children}</div>;
}
