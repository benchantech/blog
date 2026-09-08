import Link from "next/link";
import { claimById } from "@/content/claims";
import { currentSiteBehaviorText } from "@/content/legal";
import { disclosureApprovalLine } from "@/lib/approval-state";
import { type GatedContent, gatedCanonicalText } from "@/lib/wys/content-gate";
import { LegalProse } from "@/components/LegalProse";

/**
 * Refreshed in Phase 11 (plan §8b.2), IN PLACE, at the same URL, with the same
 * metadata title. Nothing that was here has been removed.
 *
 * "CURRENT SITE BEHAVIOR" WAS THE SECTION THE PLAN NAMED AS WRONG the moment
 * Watch Your Step shipped, and it is corrected by one word: "persistent user
 * memory" became "server-side persistent user memory". The rest of that
 * paragraph is still exactly true — routing is still deterministic and local
 * (`lib/route-resolver.ts` is untouched and every route prerenders), and there
 * is still no coaching service and no account. What changed is that the course
 * keeps state in the visitor's own browser, which `currentSiteBehaviorText`
 * states beneath it. Narrowed, not reworded around (R8); recorded in
 * docs/facelift-copy-diff.md.
 *
 * SC-1 — "this section's approval language must match the disclosure strip word
 * for word" — is satisfied by RENDERING THE SAME FUNCTION the strip renders,
 * not by retyping its sentence. `disclosureApprovalLine()` in
 * `lib/approval-state.ts` is the only definition of that sentence anywhere;
 * approval state is data, never copy (§6.6), so when Ben stamps, this page and
 * the strip change together from one typed value and neither is edited.
 * `tests/governance-strings.test.ts` keeps the literals out of this file.
 */

export const metadata = {
  title: "AI Disclosure - BenChanTech"
};

function lines(...values: readonly (GatedContent | null)[]): GatedContent[] {
  return values.filter((value): value is GatedContent => value !== null);
}

export default function AiDisclosurePage() {
  const behaviour = lines(gatedCanonicalText(currentSiteBehaviorText, "full"));
  const noRuntimeAi = lines(gatedCanonicalText(claimById("zero-ai"), "full"));
  const crew = lines(gatedCanonicalText(claimById("ai-assisted-ben-approved"), "full"));
  const boundaries = lines(gatedCanonicalText(claimById("ai-role-boundaries"), "full"));
  const provenance = lines(gatedCanonicalText(claimById("provenance"), "full"));
  const approval = disclosureApprovalLine();

  return (
    <article className="detail-page legal-page">
      <p className="eyebrow">AI Disclosure</p>
      <h1>AI and educational disclosure</h1>
      <p>
        BenChanTech.com describes AI-assisted systems, deterministic routing, retrieval infrastructure, and educational
        product ideas. The guiding principle is human judgment first, AI execution second.
      </p>
      <h2>Current site behavior</h2>
      <p>
        The public site currently uses deterministic local routing and static content. It does not currently provide a
        personalized AI coaching service, user account, or server-side persistent user memory.
      </p>
      <LegalProse lines={behaviour} />
      <h2>No AI while you use the site</h2>
      <LegalProse lines={noRuntimeAi} />
      <h2>AI-assisted work</h2>
      <p>
        Some internal preparation, writing, code, metadata, or future retrieval tools may be AI-assisted. AI systems can
        be incomplete, outdated, or wrong. Human review remains primary.
      </p>
      <LegalProse lines={crew} />
      {/*
        "Crew Manifest lists each one." was REMOVED 2026-09-08 with the link it
        carried. `/crew` is retired behind a redirect to `/`
        (content/canonical-surfaces.ts, CONSOLIDATED_SURFACES), so the sentence
        had become a disclosure page pointing at a document a reader cannot
        open — and on this page of all pages, since the whole point of it is to
        be checkable.

        The SENTENCE went with the LINK rather than the link alone: "Crew
        Manifest lists each one" with no way to reach the manifest is a claim
        about evidence that is not produced, which is a worse failure than the
        dead link. What survives is `crew` (the LegalProse above), which
        describes the AI crew in the copy itself rather than by reference.

        Restore both when `SHIP_NAV_CONSOLIDATED` is flipped back.
      */}
      <h2>What has been approved</h2>
      <LegalProse lines={boundaries} />
      <p>
        {approval.text}
        {approval.href && approval.linkLabel ? (
          <>
            {" "}
            <Link href={approval.href}>{approval.linkLabel}</Link>
          </>
        ) : null}
      </p>
      <h2>How claims on this site are labelled</h2>
      <LegalProse lines={provenance} />
      <h2>Educational purpose</h2>
      <p>
        Site content is intended to explain product direction and educational ideas. Users remain responsible for their
        own decisions, implementation choices, and professional review.
      </p>
      <h2>Future services</h2>
      <p>
        If Ben Chan Tech LLC later launches AI coaching, Studio integrations, subscriptions, or accounts, those services
        should include feature-specific disclosures and terms.
      </p>
    </article>
  );
}
