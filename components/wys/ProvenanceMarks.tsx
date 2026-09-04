import type { GatedContent } from "@/lib/wys/content-gate";
import { DraftMark } from "@/components/provenance/DraftMark";
import { ProvenanceMono } from "@/components/provenance/ProvenanceMono";

/**
 * The label-and-draft-mark pair that follows any non-canon body (plan §6.2
 * rule 2, §6.3).
 *
 * Split out of `GatedText` because a card often renders SEVERAL strings from
 * ONE record — a scenario's setting and its decision moment, a judgment's call
 * and its short call — and one record's provenance is one line, not one line
 * per paragraph. Repeating "Implementation placeholder — not Ben's words" under
 * every sentence would be honest and unreadable, and unreadable provenance
 * stops being read (WYS §23: do not make provenance decorative).
 *
 * It renders NOTHING for `canon` (Ben-attributable material needs no mark) and
 * nothing for `blocked` (there is no body to mark — the caller renders the
 * label in place of the prose).
 */
export function ProvenanceMarks({
  content,
  tone = "light"
}: {
  content: GatedContent;
  tone?: "light" | "dark";
}) {
  const { policy } = content;
  if (policy.kind !== "marked") return null;
  return (
    <>
      <ProvenanceMono tone={tone}>{policy.label}</ProvenanceMono>
      {policy.draftMark ? <DraftMark variant={policy.draftMark} tone={tone} /> : null}
    </>
  );
}
