import type { MediaSlotProps } from "./types";
import { cx } from "./cx";
import { ProvenanceMono } from "./ProvenanceMono";
import styles from "./provenance.module.css";

/**
 * A media placeholder (plan §4.8). NEVER AN IMAGE.
 *
 * Every media surface in the approved set is a 135deg stripe: no photography
 * ships in this build, and `public/` gains no files. The stripe carries an
 * optional overlay pill ("Ben source · video · 6:40") and a mono caption
 * describing what is being waited for.
 *
 * `width`/`height` reserve the geometry so the page does not reflow on the day
 * Ben's asset lands. No prose-bearing prop (§6.4).
 */
export function MediaSlot({
  label,
  awaitedAsset,
  medium,
  width,
  height,
  tone = "dark",
  shape = "block"
}: MediaSlotProps & { tone?: "light" | "dark"; shape?: "block" | "disc" }) {
  const classes = cx(styles.media, tone === "dark" && styles.mediaDark, shape === "disc" && styles.mediaDisc);
  const block = shape === "block";
  return (
    <div
      className={classes}
      style={{ width, height, minHeight: height ?? (block ? 196 : 72) }}
      role="img"
      aria-label={label + " — " + awaitedAsset + " (" + medium + ")"}
    >
      {block ? <span className={styles.mediaOverlay}>{label}</span> : null}
      {block ? <ProvenanceMono tone={tone}>{awaitedAsset}</ProvenanceMono> : null}
    </div>
  );
}
