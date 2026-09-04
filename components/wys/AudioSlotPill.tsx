import { PlayDisc } from "@/components/ui/PlayDisc";
import { cx } from "@/components/provenance/cx";
import styles from "./wys-primitives.module.css";

/**
 * AudioSlotPill (plan §4.8, §13.1) — "Hear Ben, 60 seconds".
 *
 * Two lines, asymmetric padding `10px 20px 10px 10px`, a 40px white play disc.
 *
 * This is a BEN SLOT: both instances in the approved set are labelled
 * "Ben source · slot awaiting selection", and there is no prose-bearing prop, so
 * it cannot be filled with a generated clip description. It renders as an inert
 * labelled slot until Ben selects a recording; `href` is only accepted so the
 * same component works on the day one exists.
 */
export function AudioSlotPill({
  title,
  sub,
  href,
  tone = "onDark"
}: {
  title: string;
  sub: string;
  href?: string;
  tone?: "onDark" | "onLight";
}) {
  const classes = cx(styles.audioPill, tone === "onLight" && styles.audioPillOnLight);
  const body = (
    <>
      <PlayDisc size="sm" />
      <span>
        <span className={styles.audioTitle}>{title}</span>
        <span className={styles.audioSub}>{sub}</span>
      </span>
    </>
  );
  if (!href) {
    return (
      <span className={classes} role="group" aria-label={title + " — " + sub}>
        {body}
      </span>
    );
  }
  return (
    <a className={classes} href={href}>
      {body}
    </a>
  );
}
