import type { ReactNode } from "react";
import { cx } from "@/components/provenance/cx";
import styles from "./primitives.module.css";

/**
 * KvRow (plan §4.8).
 *
 *   filled   — a system-recorded fact
 *   outlined — learner-authored
 *   bare     — Data page card 1, where the card itself is the container
 */
export function KvRow({
  label,
  value,
  variant = "filled"
}: {
  label: ReactNode;
  value: ReactNode;
  variant?: "filled" | "outlined" | "bare";
}) {
  const classes = cx(
    styles.kv,
    variant === "filled" && styles.kvFilled,
    variant === "outlined" && styles.kvOutlined
  );
  return (
    <div className={classes}>
      <span>{label}</span>
      <span className={styles.kvValue}>{value}</span>
    </div>
  );
}

export function KvList({ children, bare = false }: { children: ReactNode; bare?: boolean }) {
  return <div className={cx(styles.kvList, bare && styles.kvListBare)}>{children}</div>;
}
