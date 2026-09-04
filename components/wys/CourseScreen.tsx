import type { ReactNode } from "react";
import styles from "./wys-primitives.module.css";

/**
 * The container every course screen sits in (plan Phase 7; mockup 5b/5c).
 *
 * One page shell for Today, Plan, Progress, Practice, Data and the per-stop
 * route, so the five builders who own those screens do not each invent a
 * gutter. The artboard's header row is `justify-between` with a baseline
 * alignment: a 30px/600 title on the left and a 14px muted meta line on the
 * right ("Stop A · visit 1 of 3" on Today, "replay · from memory" on Practice).
 *
 * `meta` is a NODE, not a string, because on Today it is a client component:
 * the visit position is derived from local state and may not be read during
 * render (§7.3). The screen stays a server component either way.
 *
 * There is no prose-bearing prop beyond `lead`, and `lead` takes a node for the
 * same reason every other surface does — the caller passes gated content, never
 * a sentence typed into a page file (§6.2).
 */
export function CourseScreen({
  title,
  meta,
  lead,
  children
}: {
  /** The screen's own name — "Today", "Plan", "Stop A". Never a claim. */
  title: string;
  /** The right-hand meta line. A node so a client counter can live here. */
  meta?: ReactNode;
  /** The one-line intro under the title, where the artboard draws one. */
  lead?: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className={styles.screen}>
      <header className={styles.screenHead}>
        <h1 className={styles.screenTitle}>{title}</h1>
        {meta ? <p className={styles.screenMeta}>{meta}</p> : null}
      </header>
      {lead ? <div className={styles.screenLead}>{lead}</div> : null}
      {children}
    </article>
  );
}
