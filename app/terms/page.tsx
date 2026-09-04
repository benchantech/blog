import { rulebookOwnershipText, termsCourseText, termsNonGoalsText } from "@/content/legal";
import { type GatedContent, gatedCanonicalText } from "@/lib/wys/content-gate";
import { LegalProse } from "@/components/LegalProse";

/**
 * Refreshed in Phase 11 (plan §8b.2), IN PLACE, at the same URL, with the same
 * metadata title. NOTHING WAS CORRECTED HERE — every sentence on the preserved
 * page is still true of the enlarged site — so the whole refresh is addition:
 * the course, its fictional material, the learner-owned rulebook, and (WYS
 * §3.5)'s non-goals, which are a disclaimer whether or not they are printed on
 * a terms page.
 *
 * The three additions come from `content/legal.ts`. The rulebook record is
 * shared with /copyright, defined once and presented twice (§6.8).
 */

export const metadata = {
  title: "Terms of Use - BenChanTech"
};

function lines(...values: readonly (GatedContent | null)[]): GatedContent[] {
  return values.filter((value): value is GatedContent => value !== null);
}

export default function TermsPage() {
  const course = lines(gatedCanonicalText(termsCourseText, "full"));
  const nonGoals = lines(gatedCanonicalText(termsNonGoalsText, "full"));
  const rulebook = lines(gatedCanonicalText(rulebookOwnershipText, "full"));

  return (
    <article className="detail-page legal-page">
      <p className="eyebrow">Terms of Use</p>
      <h1>Terms of Use</h1>
      <p>
        BenChanTech.com is operated by Ben Chan Tech LLC. By using the site, you agree to use it as a public
        informational and educational resource within the limits below.
      </p>
      <h2>Educational and informational purpose</h2>
      <p>
        The site describes company work, product direction, AI-assisted infrastructure, and related educational material.
        It does not guarantee business, technical, financial, learning, or professional outcomes.
      </p>
      <h2>The course</h2>
      <LegalProse lines={course} />
      <h2>What the course is not</h2>
      <LegalProse lines={nonGoals} />
      <h2>Your rulebook</h2>
      <LegalProse lines={rulebook} />
      <h2>No professional advice</h2>
      <p>
        Site content is not legal, medical, financial, investment, compliance, security, or professional consulting
        advice. Use qualified professionals for decisions that require individualized review.
      </p>
      <h2>Acceptable use</h2>
      <p>
        Do not attack, scrape, bulk copy, interfere with, or misuse the site or its infrastructure. Do not submit or
        transmit unlawful, infringing, harmful, or deceptive material.
      </p>
      <h2>Intellectual property</h2>
      <p>
        Site text, design, routing logic, project descriptions, diagrams, and original materials are owned by Ben Chan
        Tech LLC or their respective creators. Public links are welcome; redistribution or commercial reuse requires
        permission unless allowed by law.
      </p>
      <h2>Third-party services</h2>
      <p>
        Links to third-party platforms and affiliated properties are provided for context. Those services may change,
        break, or apply their own terms.
      </p>
      <h2>No warranty</h2>
      <p>The site is provided as is and as available. Content may be incomplete, outdated, unavailable, or incorrect.</p>
      <h2>Limitation of liability</h2>
      <p>
        To the extent allowed by law, Ben Chan Tech LLC is not liable for indirect, incidental, consequential, special,
        or punitive damages arising from use of the site or reliance on its materials.
      </p>
      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of the State of New York, without regard to conflict-of-law principles,
        except where local law requires otherwise.
      </p>
      <h2>Changes</h2>
      <p>Ben Chan Tech LLC may modify the site or these terms as the company and services evolve.</p>
    </article>
  );
}
