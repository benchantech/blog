import type { ReactNode } from "react";
import { cx } from "@/components/provenance/cx";
import styles from "./primitives.module.css";

/**
 * ChoiceRow (plan §4.8), normalised per §4.7.1 / Q18.
 *
 * `5a`'s rows have no base border and gain `2px solid #16202B` on select, which
 * shifts every row below by 4px. `4a`'s rows carry a 1.5px border in both
 * states. Both are approved artboards, so R1 gives no winner; the `4a` pattern
 * is normalised on because SELECTION MUST NOT REFLOW. Rest and selected states
 * still read as the artboards draw them; only the movement disappears. The 2px
 * visual delta on Lesson Zero is reported.
 *
 * The letter is always a `<span>` at `--accent` 600 (`--accent-text-on-tint`
 * here, per Q23 — it is text on a tint whenever the row is selected).
 */
export function ChoiceRow({
  letter,
  children,
  selected = false,
  fill = "white",
  live = true,
  locked = false,
  breakpoint = "desktop",
  onSelect
}: {
  letter?: string;
  children: ReactNode;
  selected?: boolean;
  /** `grey` is the `5a`/`5b` resting fill; `white` is the `4a` demo fill. */
  fill?: "white" | "grey";
  /** `false` renders a static row (no button, no cursor) for read-only recaps. */
  live?: boolean;
  /** Choices lock on commit; they stay visible and stay legible. */
  locked?: boolean;
  breakpoint?: "desktop" | "mobile";
  onSelect?: () => void;
}) {
  const className = cx(
    styles.choice,
    fill === "grey" && styles.choiceFilled,
    selected && styles.choiceSelected,
    !live && styles.choiceStatic,
    locked && styles.choiceLocked,
    breakpoint === "mobile" && styles.choiceMobile
  );
  const body = (
    <>
      {letter ? <span className={styles.choiceLetter}>{letter}</span> : null}
      <span>{children}</span>
    </>
  );

  if (!live) {
    return <div className={className}>{body}</div>;
  }

  return (
    <button className={className} type="button" aria-pressed={selected} disabled={locked} onClick={onSelect}>
      {body}
    </button>
  );
}

/** Rows stack at gap 8. Kept as a component so that spacing lives in one place. */
export function ChoiceList({ children }: { children: ReactNode }) {
  return <div className={styles.choiceList}>{children}</div>;
}
