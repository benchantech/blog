import type { ReactNode } from "react";
import { cx } from "@/components/provenance/cx";
import styles from "./primitives.module.css";

/** LinkRow (plan §4.8): full-width teal row, justify-between, a literal arrow. */
export function LinkRow({
  children,
  href,
  size = "default"
}: {
  children: ReactNode;
  href: string;
  size?: "default" | "lg";
}) {
  const classes = cx(styles.linkRow, size === "lg" && styles.linkRowLg);
  return (
    <a className={classes} href={href}>
      <span>{children}</span>
      <span aria-hidden="true">→</span>
    </a>
  );
}
