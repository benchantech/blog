import Link from "next/link";
import { claimById } from "@/content/claims";
import {
  aggregateNotBuiltText,
  privacyCurrentServicesText,
  privacyNoServerStateText,
  thirteenPlusText
} from "@/content/legal";
import { analyticsConditionsText } from "@/content/watch-your-step/data";
import { landingDataHref, landingDataLinkLabel } from "@/content/watch-your-step/landing";
import { type GatedContent, gatedCanonicalText } from "@/lib/wys/content-gate";
import { BrowserKeyList } from "@/components/BrowserKeyList";
import { LegalProse } from "@/components/LegalProse";

/**
 * Refreshed in Phase 11 (plan §8b.2), IN PLACE, at the same URL, with the same
 * metadata title. Nothing that was here has been removed.
 *
 * ONE SENTENCE WAS CORRECTED rather than added to, and it is the only one on
 * this page: "It does not currently provide user accounts, subscriptions,
 * uploads, or personalized user memory" gained the word "server-side" before
 * "personalized user memory". Everything else in that sentence is still exactly
 * true; that clause stopped being true the moment `lib/wys/local-state.ts`
 * shipped, because the course does remember a learner — in that learner's own
 * browser. Narrowed, not reworded around (R8), and recorded in
 * docs/facelift-copy-diff.md.
 *
 * Everything added comes from a content record, never from this file:
 * `content/claims.ts` for the shared claims, `content/legal.ts` for what
 * belongs to this page alone, and `content/watch-your-step/data.ts` for the
 * analytics conditions the Data page already defines. Records this build
 * authored render through `LegalProse` with their provenance label attached.
 *
 * The key list is GENERATED from `lib/wys/browser-keys.ts` (§7.5), so both keys
 * are named here by construction and a third one would appear without an edit.
 */

export const metadata = {
  title: "Privacy Policy - BenChanTech"
};

function lines(...values: readonly (GatedContent | null)[]): GatedContent[] {
  return values.filter((value): value is GatedContent => value !== null);
}

export default function PrivacyPage() {
  const scope = lines(gatedCanonicalText(claimById("privacy-disclosure"), "full"));
  const analytics = lines(
    gatedCanonicalText(claimById("analytics"), "full"),
    gatedCanonicalText(analyticsConditionsText, "full"),
    gatedCanonicalText(aggregateNotBuiltText, "full")
  );
  const services = lines(gatedCanonicalText(privacyCurrentServicesText, "full"));
  const browser = lines(
    gatedCanonicalText(claimById("localStorage"), "full"),
    gatedCanonicalText(privacyNoServerStateText, "full")
  );
  const infrastructure = lines(gatedCanonicalText(claimById("minimal-trust"), "full"));
  const children = lines(gatedCanonicalText(thirteenPlusText, "full"));

  return (
    <article className="detail-page legal-page">
      <p className="eyebrow">Privacy Policy</p>
      <h1>Privacy Policy</h1>
      <p>
        BenChanTech.com is operated by Ben Chan Tech LLC. This policy describes how the site handles information for the
        current public website and how that handling may change as services grow.
      </p>
      <LegalProse lines={scope} />
      <h2>Information collected</h2>
      <p>
        The site may collect ordinary technical information through hosting logs, such as IP address, browser, device,
        pages requested, timestamps, and error diagnostics. If Google Analytics is enabled, aggregate analytics may
        include page views, approximate location, device/browser information, and interaction events.
      </p>
      <h2>Analytics and cookies</h2>
      <p>
        BenChanTech may use GA4 through direct gtag.js collection. Analytics storage is denied by default unless a
        visitor allows analytics through the cookie notice. The site stores that consent choice in the browser.
      </p>
      <LegalProse lines={analytics} />
      <h2>Current services</h2>
      <p>
        The current site is a public routing foyer and company information site. It does not currently provide user
        accounts, subscriptions, uploads, or server-side personalized user memory.
      </p>
      <LegalProse lines={services} />
      <h2>Watch Your Step and this browser</h2>
      <LegalProse lines={browser} />
      <BrowserKeyList />
      <p>
        The course&rsquo;s own Data page shows what this browser is holding right now, and lets you download or clear it:{" "}
        <Link href={landingDataHref}>{landingDataLinkLabel}</Link>.
      </p>
      <h2>Third-party services</h2>
      <p>
        The site may link to or use Vercel, Google Analytics, YouTube, Substack, yyandme.benchantech.com,
        yymethod.com, benchanviolin.com, and other public Ben Chan Tech LLC properties. Those services may process data
        under their own terms and privacy practices.
      </p>
      <h2>Technical infrastructure</h2>
      <LegalProse lines={infrastructure} />
      <h2>Legal basis and retention</h2>
      <p>
        Where privacy laws require a legal basis, analytics may rely on consent and operational logs may be used to run
        and protect the site. Retention follows the settings and operational needs of the relevant hosting and analytics
        providers.
      </p>
      <h2>International transfers</h2>
      <p>
        Third-party providers may process information in the United States and other countries. Their own transfer
        mechanisms and terms apply.
      </p>
      <h2>Your rights</h2>
      <p>
        Depending on your location, you may have rights to request access, correction, deletion, objection, restriction,
        portability, or withdrawal of consent. Contact Ben Chan Tech LLC to make a privacy request.
      </p>
      <h2>Children</h2>
      <p>
        This site is intended for a general professional and educational audience and is not directed to children under
        13.
      </p>
      <LegalProse lines={children} />
      <h2>Future services</h2>
      <p>
        If Ben Chan Tech LLC later adds accounts, subscriptions, newsletters, AI coaching, Studio integrations, or other
        interactive services, this policy should be updated before those features launch.
      </p>
      <h2>Contact</h2>
      <p>Contact: ben@benchantech.com. Governing location: New York, United States.</p>
    </article>
  );
}
