import type { DashedSlotProps } from "./types";
import { cx } from "./cx";
import styles from "./provenance.module.css";

/**
 * A dashed outline standing in for material that is empty, optional, terminal,
 * or deliberately not persisted (plan §4.8).
 *
 * Three inks, and they are NEVER mixed:
 *   · `variant="ben"`     teal dash    — awaiting Ben. Prefer `BenSlot`.
 *   · `variant="empty"`   grey dash    — empty / optional / terminal.
 *   · `variant="scratch"` white dash on ink — a scratch box that is never
 *                          persisted and never transmitted (WYS §15.1).
 *
 * No prose-bearing prop, same as every other slot.
 */
export function DashedSlot({ label, awaitedAsset, variant = "empty" }: DashedSlotProps & { variant?: "ben" | "empty" | "scratch" }) {
  const classes = cx(
    styles.slot,
    variant === "empty" && styles.dashedGrey,
    variant === "scratch" && styles.dashedScratch
  );
  return (
    <div className={classes}>
      <p className={styles.slotLabel}>{label}</p>
      <p className={styles.slotAwaited}>{awaitedAsset}</p>
    </div>
  );
}
