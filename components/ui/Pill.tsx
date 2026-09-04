import type { ReactNode } from "react";
import { cx } from "@/components/provenance/cx";
import styles from "./primitives.module.css";

/**
 * Pill (plan §4.8). Radius 999, one component, seven approved variants.
 *
 * `status` text is set in `--accent-text-on-tint`, not `--accent`: the approved
 * pairing measures 4.45:1 on `--tint-teal` and misses WCAG AA for normal text
 * (Q23). Fills, bars and the focus ring keep `--accent`.
 */
export type PillVariant =
  | "status"
  | "draft"
  | "white"
  | "onMedia"
  | "outlined"
  | "onDark"
  | "translucent";

const VARIANTS: Record<PillVariant, string> = {
  status: styles.pillStatus,
  draft: styles.pillDraft,
  white: styles.pillWhite,
  onMedia: styles.pillOnMedia,
  outlined: styles.pillOutlined,
  onDark: styles.pillOnDark,
  translucent: styles.pillTranslucent
};

export function Pill({
  children,
  variant = "status",
  size = "md"
}: {
  children: ReactNode;
  variant?: PillVariant;
  size?: "sm" | "md" | "lg";
}) {
  const classes = cx(
    styles.pill,
    VARIANTS[variant],
    size === "lg" && styles.pillLg,
    size === "sm" && styles.pillSm
  );
  return <span className={classes}>{children}</span>;
}
