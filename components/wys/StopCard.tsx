import type { ReactNode } from "react";
import { cx } from "@/components/provenance/cx";
import styles from "./wys-primitives.module.css";

/**
 * StopCard (plan §4.8). Four state fills, and the state is DATA:
 *
 *   lesson   — Lesson 0, ink
 *   current  — tint-teal
 *   future   — tint-grey
 *   terminal — white with a 1.5px dashed border (stop H, "the end")
 *
 * The meta line ("A · 3 visits") is passed in, never computed here: the stop
 * count is derived from the content model, never typed (§6.9).
 */
export type StopState = "lesson" | "current" | "future" | "terminal";

const STATES: Record<StopState, string> = {
  lesson: styles.stopLesson,
  current: styles.stopCurrent,
  future: "",
  terminal: styles.stopTerminal
};

export function StopCard({
  meta,
  title,
  state = "future",
  href
}: {
  meta: string;
  title: string;
  state?: StopState;
  href?: string;
}) {
  const className = cx(styles.stop, STATES[state]);
  const body = (
    <>
      <span className={styles.stopMeta}>{meta}</span>
      <span className={styles.stopTitle}>{title}</span>
    </>
  );
  if (!href) return <div className={className}>{body}</div>;
  return (
    <a className={className} href={href}>
      {body}
    </a>
  );
}

/**
 * `strip` is the desktop `repeat(9,1fr)` gap 8 row; `peek` is the mobile
 * horizontal peek row of 140px cards.
 */
export function StopStrip({ children, layout = "strip" }: { children: ReactNode; layout?: "strip" | "peek" }) {
  const classes = cx(styles.stopStrip, layout === "peek" && styles.stopPeek);
  return <div className={classes}>{children}</div>;
}
