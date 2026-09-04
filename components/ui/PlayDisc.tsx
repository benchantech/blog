import { cx } from "@/components/provenance/cx";
import styles from "./primitives.module.css";

/**
 * PlayDisc (plan §4.8). The literal text character in a circle.
 *
 * No SVG, no icon font, no image. (handoff README Assets): "No icons; the only
 * glyphs are ▶, →, ✓ as text." It is decorative — the accessible name lives on
 * the control that wraps it, so the glyph is hidden from assistive technology.
 */
export function PlayDisc({ size = "lg" }: { size?: "sm" | "lg" }) {
  const classes = cx(styles.disc, size === "sm" && styles.discSm);
  return (
    <span className={classes} aria-hidden="true">
      ▶
    </span>
  );
}
