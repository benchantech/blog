import type { ReactNode } from "react";
import { cx } from "@/components/provenance/cx";
import styles from "./primitives.module.css";

/**
 * ActionPill (plan §4.8, §4.7.2).
 *
 * ONE PRIMARY FILL: ink enabled, `rgba(22,32,43,.25)` disabled. Commit appears
 * in three colours across the approved set — ink on `5a`, teal on `5b` Today,
 * state-bound in `4a` — and R1 gives no winner between artboards. Q17 is
 * ratified at ink, which matches two of the three Commit instances and every
 * other primary pill in the set (Continue, Show my plan, Download my local
 * data). Teal is reserved for the nav CTA and continue/secondary pills. The
 * Today Commit recolour is reported as a deliberate deviation from `5b`.
 */
export type ActionVariant = "ink" | "teal" | "outlined" | "onInk";

const VARIANTS: Record<ActionVariant, string> = {
  ink: styles.actionInk,
  teal: styles.actionTeal,
  outlined: styles.actionOutlined,
  onInk: styles.actionOnInk
};

export function ActionPill({
  children,
  meta,
  variant = "ink",
  full = false,
  disabled = false,
  href,
  onClick,
  type = "button"
}: {
  children: ReactNode;
  /** A muted trailing clause, e.g. "· keeps rulebook". Never a second control. */
  meta?: string;
  variant?: ActionVariant;
  full?: boolean;
  disabled?: boolean;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const className = cx(
    styles.action,
    disabled ? styles.actionDisabled : VARIANTS[variant],
    full && styles.actionFull
  );
  const content = (
    <>
      {children}
      {meta ? <span className={styles.actionMeta}>{meta}</span> : null}
    </>
  );

  if (href && !disabled) {
    return (
      <a className={className} href={href}>
        {content}
      </a>
    );
  }

  return (
    <button className={className} type={type} onClick={onClick} disabled={disabled}>
      {content}
    </button>
  );
}
