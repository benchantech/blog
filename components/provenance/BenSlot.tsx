import type { BenSlotProps } from "./types";
import { cx } from "./cx";
import styles from "./provenance.module.css";

/**
 * A named slot awaiting Ben (plan §6.4, §13.1) — the Bridge position, the
 * judgment header, Captain's Quarters "Selected history".
 *
 * Teal dash, by rule: this is the "awaiting Ben" ink. It takes a label and a
 * description of the awaited asset and nothing else — `children`, `text` and
 * `body` are typed `never`, so filling a Ben slot with generated prose is a
 * compile error rather than a review catch. That is what makes the Bridge's own
 * on-screen sentence true: "Awaiting Ben. No draft AI text is shown here, by
 * rule."
 */
export function BenSlot({ label, awaitedAsset, tone = "light" }: BenSlotProps) {
  const classes = cx(styles.slot, tone === "dark" && styles.slotOnDark);
  return (
    <div className={classes}>
      <p className={styles.slotLabel}>{label}</p>
      <p className={styles.slotAwaited}>{awaitedAsset}</p>
    </div>
  );
}
