import type { GatedContent } from "@/lib/wys/content-gate";
import { isShowable } from "@/lib/wys/content-gate";
import { ProvenanceMono } from "@/components/provenance/ProvenanceMono";
import { ProvenanceMarks } from "@/components/wys/ProvenanceMarks";

/**
 * Gated prose in this screen's typography.
 *
 * `GatedText` renders one fixed body style (16px ink) and artboard `5c` draws
 * every string on this screen at another size — 15px card bodies, a 14px
 * infrastructure paragraph, a 13px footnote. So the same three states are
 * composed here from the shared pieces rather than restated, exactly as
 * `app/watch-your-step/(shell)/progress/ProgressView.tsx` composes its own
 * `GatedLine`: the prose in the caller's element, then `ProvenanceMarks` —
 * which is what that component was split out of `GatedText` for — and the label
 * ALONE through `ProvenanceMono` when a record is blocked.
 *
 * There is still no path from a content record to prose without its policy, and
 * no `text` prop: the argument is a `GatedContent`, built only by
 * `lib/wys/content-gate.ts`.
 *
 * NOT a client component. It holds no state and is rendered from both halves of
 * this route — the server page and the two client views — so it stays plain and
 * is pulled into whichever tree imports it.
 *
 * The standing request for a size variant on `GatedText` is recorded for the
 * gate in docs/facelift-build-notes.md; until it exists this is a composition,
 * not a second renderer.
 */
export function DataText({
  content,
  className,
  tone = "light"
}: {
  content: GatedContent;
  /** The caller's own type scale. Omitted where the surrounding element sets it. */
  className?: string;
  tone?: "light" | "dark";
}) {
  if (!isShowable(content)) {
    return <ProvenanceMono tone={tone}>{content.label}</ProvenanceMono>;
  }
  return (
    <>
      <p className={className}>{content.text}</p>
      <ProvenanceMarks content={content} tone={tone} />
    </>
  );
}

/**
 * A SET of strings that share one record's provenance.
 *
 * The two confirmation explanations are `readonly string[]` in
 * `lib/wys/local-state.ts` — one sentence per line, beside the functions they
 * describe — and they all carry the same `(status, origin)` pair. So they get
 * ONE provenance line, not one per sentence:
 * `components/wys/ProvenanceMarks.tsx` was split out of `GatedText` for exactly
 * this, and a label repeated under every sentence of a four-sentence panel
 * stops being read (WYS §23: provenance is not decorative).
 *
 * Every line still arrives as a `GatedContent`, so no sentence reaches this
 * component without the policy that governs it, and a blocked line is dropped
 * rather than printed.
 */
export function DataLines({
  lines,
  className,
  tone = "light"
}: {
  lines: readonly GatedContent[];
  className?: string;
  tone?: "light" | "dark";
}) {
  const showable = lines.filter(isShowable);
  if (showable.length === 0) {
    return lines.length > 0 ? <ProvenanceMono tone={tone}>{lines[0].label}</ProvenanceMono> : null;
  }
  return (
    <>
      {showable.map((line) => (
        <p key={line.text} className={className}>
          {line.text}
        </p>
      ))}
      <ProvenanceMarks content={showable[0]} tone={tone} />
    </>
  );
}
