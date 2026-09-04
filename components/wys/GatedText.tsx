import type { GatedContent } from "@/lib/wys/content-gate";
import { ProvenanceMono } from "@/components/provenance/ProvenanceMono";
import { ProvenanceMarks } from "./ProvenanceMarks";
import { cx } from "@/components/provenance/cx";
import styles from "./wys-primitives.module.css";

/**
 * Prose that cannot be rendered without its provenance (plan §6.2).
 *
 * The prop is a `GatedContent` — policy, text and computed label as one object
 * from `lib/wys/content-gate.ts`. There is no `children`, no `text` and no
 * `body` prop, so the three states are the only three states:
 *
 *   canon   — the words, alone. Ben-attributable material at published status.
 *   marked  — the words, then the §23 label, then (for AI_* and
 *             IMPLEMENTATION_PLACEHOLDER) the mono draft mark. Never one
 *             without the other; the artboards' `4a` phone omits the draft mark
 *             the desktop carries and R9 makes that a defect, so both
 *             breakpoints render it.
 *   blocked — the label ALONE. The words are not in the DOM.
 *
 * The blocked branch is the shape of the whole course today: `RENDER_MARKED_DRAFT`
 * ships `false` (Q21, ratified) and every scenario, judgment and stop title is
 * `draft`, so this renders "Implementation placeholder — not Ben's words" where
 * the artboard draws prose. That is the ratified state, not a defect, and it
 * flips with one constant.
 *
 * The label renders through `ProvenanceMono` rather than `ProvenanceLabel`
 * because the (surfaceKind, origin) pair is visible at the GATE call site
 * instead: `label` is a branded `ProvenanceLabel` that only
 * `provenanceLabelFor()` can produce, so no caller can hand-type one here.
 */
export function GatedText({
  content,
  tone = "light",
  as = "p"
}: {
  content: GatedContent;
  tone?: "light" | "dark";
  /** `div` where the caller needs to nest the prose inside a card body. */
  as?: "p" | "div";
}) {
  const { policy } = content;

  if (policy.kind === "blocked") {
    return (
      <div className={styles.gatedBlocked}>
        <ProvenanceMono tone={tone}>{content.label}</ProvenanceMono>
      </div>
    );
  }

  const bodyClass = cx(styles.gatedBody, tone === "dark" && styles.gatedBodyOnDark);
  const body = as === "div" ? <div className={bodyClass}>{content.text}</div> : <p className={bodyClass}>{content.text}</p>;

  return (
    <>
      {body}
      <ProvenanceMarks content={content} tone={tone} />
    </>
  );
}
