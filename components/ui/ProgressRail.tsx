import styles from "./primitives.module.css";

/**
 * ProgressRail (plan §4.8): 6px, `--tint-grey` track, `--accent` fill.
 *
 * The width is step/total. It reports position in a fixed sequence — it is not
 * a score, and nothing depends on filling it.
 */
export function ProgressRail({ step, total, label }: { step: number; total: number; label: string }) {
  const clamped = Math.max(0, Math.min(step, total));
  const percent = total > 0 ? Math.round((clamped / total) * 100) : 0;
  return (
    <div
      className={styles.rail}
      role="progressbar"
      aria-label={label}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={total}
    >
      <div className={styles.railFill} style={{ width: percent + "%" }} />
    </div>
  );
}
