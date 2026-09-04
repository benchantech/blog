import { draftMarkFor } from "@/lib/content-status";
import type { DraftMarkProps } from "./types";
import { cx } from "./cx";
import { ProvenanceMono } from "./ProvenanceMono";
import styles from "./provenance.module.css";

/**
 * The 11px mono draft line (plan §4.8, §6.4).
 *
 * The string is NOT a prop — it is resolved from `draftMarkFor(variant)`, so no
 * caller can soften the wording at the point of use.
 *
 * Required on BOTH breakpoints. The `4a` phone omits the mark the desktop
 * carries; R9 makes that omission a defect rather than a design, because
 * removing a provenance marker is an unsafe-direction override of an artboard.
 */
export function DraftMark({
  variant,
  tone = "light",
  align = "start"
}: DraftMarkProps & { tone?: "light" | "dark"; align?: "start" | "center" }) {
  const classes = cx(styles.draftMark, align === "center" && styles.draftMarkCentred);
  return (
    <ProvenanceMono tone={tone} className={classes}>
      {draftMarkFor(variant)}
    </ProvenanceMono>
  );
}
