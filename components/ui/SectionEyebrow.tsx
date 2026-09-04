import { cx } from "@/components/provenance/cx";
import styles from "./primitives.module.css";

/**
 * SectionEyebrow (plan §4.8).
 *
 * Desktop 15px/500; mobile 12px/600. Caps are TYPED IN THE COPY, never applied
 * with `text-transform`: a screen reader announcing "W A T C H" and a copy
 * string that cannot be read back as it renders are both avoidable, and the
 * approved artboards type them in caps.
 */
export function SectionEyebrow({ children, breakpoint = "desktop" }: { children: string; breakpoint?: "desktop" | "mobile" }) {
  const classes = cx(breakpoint === "mobile" ? styles.eyebrowMobile : styles.eyebrowDesktop);
  return <p className={classes}>{children}</p>;
}
