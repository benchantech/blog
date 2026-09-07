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
    /*
     * `onClick` RIDES ALONG WITH `href`, and dropping it was a real defect.
     *
     * An earlier version rendered the anchor without the handler, so a caller
     * that passed BOTH silently got navigation and no callback — no type error,
     * no test failure, nothing on screen. Trust Forward's four gated cards hit
     * exactly that: they are links to /tf that also need to fire
     * `tf_full_trust_forward_clicked`, and the event simply never fired.
     *
     * The handler must not preventDefault or return false — navigation is the
     * point, and the callback is measurement layered on top of it. Fire-and-go
     * is also why the telemetry adapter buffers rather than awaiting: the page
     * may be unloading by the time gtag would flush.
     */
    return (
      <a className={className} href={href} onClick={onClick}>
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
