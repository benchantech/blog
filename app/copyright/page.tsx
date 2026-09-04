import { copyrightCurriculumText, rulebookOwnershipText } from "@/content/legal";
import { type GatedContent, gatedCanonicalText } from "@/lib/wys/content-gate";
import { LegalProse } from "@/components/LegalProse";

/**
 * Refreshed in Phase 11 (plan §8b.2), IN PLACE, at the same URL, with the same
 * metadata title. Nothing was removed and nothing was corrected: the preserved
 * page already covers "text, design, routing logic, diagrams, project
 * descriptions, and original materials", and the additions say which of the new
 * material that reaches and which of it belongs to the learner instead.
 *
 * The recordings clause is deliberately in the negative-and-honest form: none
 * has been supplied, `content/watch-your-step/artifacts.ts` ships an empty bank
 * and `public/` gained no files in this build, so a clause written as though
 * media existed would be a claim ahead of the fact.
 */

export const metadata = {
  title: "Copyright - BenChanTech"
};

function lines(...values: readonly (GatedContent | null)[]): GatedContent[] {
  return values.filter((value): value is GatedContent => value !== null);
}

export default function CopyrightPage() {
  const curriculum = lines(gatedCanonicalText(copyrightCurriculumText, "full"));
  const rulebook = lines(gatedCanonicalText(rulebookOwnershipText, "full"));

  return (
    <article className="detail-page legal-page">
      <p className="eyebrow">Copyright</p>
      <h1>Copyright and permitted use</h1>
      <p>
        Unless otherwise noted, BenChanTech.com text, design, routing logic, diagrams, project descriptions, and original
        materials are owned by Ben Chan Tech LLC or their respective creators.
      </p>
      <h2>Course material</h2>
      <LegalProse lines={curriculum} />
      <h2>What belongs to the learner</h2>
      <LegalProse lines={rulebook} />
      <h2>Permitted use</h2>
      <p>You may link to public pages and quote short excerpts for ordinary reference with attribution.</p>
      <h2>Not permitted</h2>
      <p>
        Do not scrape, bulk copy, rehost, sell, redistribute, or package site content, routing logic, or project material
        without permission unless allowed by law.
      </p>
      <h2>Third-party material</h2>
      <p>Linked services, embedded media, and referenced products remain subject to their own rights and terms.</p>
    </article>
  );
}
