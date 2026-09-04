import type { ReactNode } from "react";
import { cx } from "@/components/provenance/cx";
import styles from "./primitives.module.css";

/**
 * CardShell (plan §4.8). Five fills that ENCODE MEANING:
 *
 *   ink    — dark punctuation
 *   teal   — current / next / carry
 *   grey   — neutral
 *   live   — white with a hairline border. A LIVE DECISION SURFACE, and the
 *            only bordered container on Today and in the `4a` hero.
 *   dashed — empty / awaiting
 *
 * The encoding rule "filled = system-recorded fact, outlined = learner-authored,
 * dashed = empty" is authored guidance for the learner-content surfaces only
 * (Progress's rulebook rows vs its judgment rows). It is NOT design authority:
 * the approved set contradicts it in at least three places — `5d` Bridge OPEN
 * QUESTIONS rows are outlined and are Ben's questions, and `5c` Data's
 * "Restart the course" / "Clear this browser's data" and Practice's "I'd want
 * deeper practice" are outlined ACTION pills. Where an artboard disagrees, the
 * artboard wins (R1).
 */
export type CardFill = "ink" | "teal" | "grey" | "live" | "dashed";

const FILLS: Record<CardFill, string> = {
  ink: styles.cardInk,
  teal: styles.cardTeal,
  grey: styles.cardGrey,
  live: styles.cardLive,
  dashed: styles.cardDashed
};

export function CardShell({
  children,
  fill = "grey",
  size = "default",
  flat = false
}: {
  children: ReactNode;
  fill?: CardFill;
  /** `demo` is the `4a` hero card: radius 28, padding 28, the 80px shadow. */
  size?: "default" | "demo";
  flat?: boolean;
}) {
  const classes = cx(styles.card, FILLS[fill], size === "demo" && styles.cardDemo, flat && styles.cardFlat);
  return <div className={classes}>{children}</div>;
}

/** The `justify-between` header row: a pill on the left, meta on the right. */
export function CardHeader({ left, right }: { left: ReactNode; right?: ReactNode }) {
  return (
    <div className={styles.cardHeader}>
      <span>{left}</span>
      {right ? <span className={styles.cardMeta}>{right}</span> : null}
    </div>
  );
}
