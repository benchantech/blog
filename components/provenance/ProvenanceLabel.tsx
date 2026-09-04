import type { SurfaceKind } from "@/lib/content-status";
import type { ProvenanceLabelProps } from "./types";
import { ProvenanceMono } from "./ProvenanceMono";

/**
 * Renders the computed `(surfaceKind, origin)` label (plan §6.3, WYS §23).
 *
 * `label` is a required, branded `ProvenanceLabel` that only
 * `provenanceLabelFor()` can produce, so a hand-typed "BEN'S JUDGMENT" does not
 * type-check. `surfaceKind` and `origin` are required alongside it, so the pair
 * that produced the label is visible at every call site.
 *
 * There is no `children`, `text` or `body` prop: a label cannot be substituted
 * for prose, and prose cannot be smuggled in beside it.
 */
export function ProvenanceLabel<K extends SurfaceKind>({
  label,
  tone = "light"
}: ProvenanceLabelProps<K> & { tone?: "light" | "dark" }) {
  return <ProvenanceMono tone={tone}>{label}</ProvenanceMono>;
}
