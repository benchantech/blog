import type { ReactNode } from "react";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { cx } from "@/components/provenance/cx";
import styles from "./practice.module.css";

/**
 * One of Practice's three blocks (mockup 5c dc.html:156, :163, :170).
 *
 * The artboard heads REPLAY and FROM MEMORY with a 12px teal eyebrow and gives
 * the appetite card no heading at all. Three blocks, three landmarks, one
 * component — so the eyebrow-and-landmark pairing has a single definition
 * rather than being retyped per section in the page.
 *
 * WHY THE ACCESSIBLE NAME IS A SEPARATE PROP. The eyebrow is typed in caps
 * because the artboard draws caps and `SectionEyebrow` forbids
 * `text-transform`; an `aria-labelledby` pointing at it would have a screen
 * reader announce "R E P L A Y". `name` is the same node's spoken presentation
 * — "Replay", "From Memory" — not a second name for it. (WYS §27; plan §4.8.)
 *
 * The appetite block passes no `eyebrow`: the artboard draws none, and
 * inventing a heading to satisfy a symmetry would add a claim the design does
 * not make.
 */
export function PracticeSection({
  name,
  eyebrow,
  last = false,
  children
}: {
  /** The landmark's accessible name. Sentence case, spoken. */
  name: string;
  /** The artboard's caps eyebrow, where it draws one. */
  eyebrow?: string;
  /** The last block carries no bottom margin — the screen's padding closes it. */
  last?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={cx(!last && styles.section)} aria-label={name}>
      {eyebrow ? <SectionEyebrow breakpoint="mobile">{eyebrow}</SectionEyebrow> : null}
      {children}
    </section>
  );
}
