import type { GatedContent } from "@/lib/wys/content-gate";
import { isShowable } from "@/lib/wys/content-gate";
import { ProvenanceMono } from "@/components/provenance/ProvenanceMono";
import { ProvenanceMarks } from "@/components/wys/ProvenanceMarks";

/**
 * Gated prose in the legal-page register (plan Phase 11, §6.2).
 *
 * The six legal pages are preserved surfaces, so their existing copy is typed
 * into the page files and pinned there. Everything Phase 11 ADDED comes from
 * `content/claims.ts`, `content/legal.ts` or
 * `content/watch-your-step/data.ts` instead, and arrives here as a
 * `GatedContent` — policy, text and computed label as one value. There is no
 * `text` prop and no `children`, so a legal page cannot hold the words without
 * also holding what it is allowed to do with them.
 *
 * Three states, the same three as everywhere else:
 *
 *   canon   — the words alone. Spec-verbatim and artboard-approved claims.
 *   marked  — the words, then the §23 label, then the draft mark. Everything
 *             this build authored is AI_SYNTHESIS and lands here.
 *   blocked — the label alone; the words are not in the DOM.
 *
 * ONE MARK PER SECTION, NOT PER PARAGRAPH. A legal section is usually two or
 * three sentences from one record, or two records with identical provenance,
 * and "Drafted during implementation — not Ben's words" repeated under each
 * paragraph would be honest and unreadable — and unreadable provenance stops
 * being read (WYS §23: provenance is not decorative). So the marks render once
 * per distinct label, after the prose they govern. This is the same composition
 * `app/watch-your-step/(shell)/data/DataText.tsx` uses, for the same reason.
 *
 * It is NOT a client component and holds no state.
 */
export function LegalProse({ lines }: { lines: readonly GatedContent[] }) {
  const showable = lines.filter(isShowable);

  if (showable.length === 0) {
    return lines.length > 0 ? <ProvenanceMono>{lines[0].label}</ProvenanceMono> : null;
  }

  const marked: GatedContent[] = [];
  for (const line of showable) {
    if (line.policy.kind !== "marked") continue;
    if (marked.some((seen) => seen.label === line.label)) continue;
    marked.push(line);
  }

  return (
    <>
      {showable.map((line) => (
        <p key={line.text}>{line.text}</p>
      ))}
      {marked.map((line) => (
        <ProvenanceMarks key={line.label} content={line} />
      ))}
    </>
  );
}
