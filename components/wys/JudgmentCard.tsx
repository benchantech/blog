import type { OriginFor, ProvenanceLabel as ProvenanceLabelType, RenderPolicy } from "@/lib/content-status";
import { DraftMark } from "@/components/provenance/DraftMark";
import { ProvenanceLabel } from "@/components/provenance/ProvenanceLabel";
import { cx } from "@/components/provenance/cx";
import styles from "./wys-primitives.module.css";

/**
 * JudgmentCard (plan §4.8, §6.3) — the JUDGE composite.
 *
 * Ink, radius 20 desktop / 18 mobile.
 *
 * THE HEADER IS TWO STRINGS, NOT ONE LABEL. The artboard reads
 * "BEN'S JUDGMENT · slot awaiting Ben", which is a SURFACE TITLE (the name of
 * the slot on the page — static chrome, supplied by the caller) plus a
 * SLOT-STATE SUFFIX rendered while the object's origin is not Ben's.
 * `ProvenanceLabel` supplies neither: it renders the (WYS §23) judgment string
 * BENEATH the body. That is how the approved header and a computed label
 * coexist without the header ever asserting that Ben wrote the prose above it.
 *
 * The prose and its policy arrive as ONE OBJECT (§6.2). There is no way to pass
 * the text without the policy, so there is no code path that renders a judgment
 * body without the label that says who wrote it — and while
 * `RENDER_MARKED_DRAFT` is false (Q21) a draft body does not render at all.
 */
export function JudgmentCard({
  surfaceTitle,
  origin,
  content,
  chose,
  slotState,
  breakpoint = "desktop"
}: {
  /** Static page chrome, e.g. "BEN'S JUDGMENT". Never a provenance claim. */
  surfaceTitle: string;
  origin: OriginFor<"judgment">;
  /** The body and what may be done with it, inseparably. */
  content: { policy: RenderPolicy; text: string; label: ProvenanceLabelType };
  /** The learner's committed pick. Falls back to an em dash. */
  chose?: string;
  /** The "· slot awaiting Ben" suffix, rendered while origin is not Ben's. */
  slotState?: string;
  breakpoint?: "desktop" | "mobile";
}) {
  const { policy } = content;
  const classes = cx(styles.judgment, breakpoint === "mobile" && styles.judgmentMobile);
  return (
    <div className={classes}>
      <div className={styles.judgmentHeader}>
        <span>
          {surfaceTitle}
          {slotState ? " · " + slotState : ""}
        </span>
        <span>you chose {chose ?? "—"}</span>
      </div>
      {policy.kind === "blocked" ? (
        <p className={styles.judgmentBlocked}>{content.label}</p>
      ) : (
        <>
          <p className={styles.judgmentBody}>{content.text}</p>
          {policy.kind === "marked" ? (
            <ProvenanceLabel surfaceKind="judgment" origin={origin} label={policy.label} tone="dark" />
          ) : null}
          {policy.kind === "marked" && policy.draftMark ? (
            <DraftMark variant={policy.draftMark} tone="dark" />
          ) : null}
        </>
      )}
    </div>
  );
}
