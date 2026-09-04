import Link from "next/link";
import { claimById } from "@/content/claims";
import { aggregateNotBuiltText, cookiesBrowserStorageText } from "@/content/legal";
import {
  analyticsConditionsText,
  clearingFootnoteText,
  clearingSurvivesText
} from "@/content/watch-your-step/data";
import { landingDataHref, landingDataLinkLabel } from "@/content/watch-your-step/landing";
import { type GatedContent, gatedCanonicalText } from "@/lib/wys/content-gate";
import { BrowserKeyList } from "@/components/BrowserKeyList";
import { LegalProse } from "@/components/LegalProse";

/**
 * Refreshed in Phase 11 (plan §8b.2), IN PLACE, at the same URL, with the same
 * metadata title. Nothing that was here has been removed and no sentence was
 * corrected — every claim on the preserved page is still exactly true, the
 * denied-by-default claim included.
 *
 * WHAT A CLEAR DOES AND DOES NOT REMOVE is required here "word-for-word
 * identical to the Data page footnote". It is not retyped to achieve that: the
 * two records ARE the Data page's, imported from
 * `content/watch-your-step/data.ts`, so the two surfaces cannot drift. One
 * definition, two presentations (§6.8).
 *
 * The key names come from `lib/wys/browser-keys.ts` (§7.5), which is also what
 * decides which of them a clear reaches — so the page cannot claim a key
 * survives while the code removes it.
 */

export const metadata = {
  title: "Cookie Notice - BenChanTech"
};

function lines(...values: readonly (GatedContent | null)[]): GatedContent[] {
  return values.filter((value): value is GatedContent => value !== null);
}

export default function CookieNoticePage() {
  const storage = lines(
    gatedCanonicalText(cookiesBrowserStorageText, "full"),
    gatedCanonicalText(claimById("localStorage"), "full")
  );
  const analytics = lines(
    gatedCanonicalText(analyticsConditionsText, "full"),
    gatedCanonicalText(aggregateNotBuiltText, "full")
  );
  const clearing = lines(
    gatedCanonicalText(clearingFootnoteText, "full"),
    gatedCanonicalText(clearingSurvivesText, "full")
  );
  const infrastructure = lines(gatedCanonicalText(claimById("minimal-trust"), "full"));

  return (
    <article className="detail-page legal-page">
      <p className="eyebrow">Cookie Notice</p>
      <h1>Cookie Notice</h1>
      <p>
        BenChanTech may use cookies and similar technologies for Google Analytics measurement when analytics is enabled.
      </p>
      <h2>Analytics cookies</h2>
      <p>
        GA4 helps Ben Chan Tech LLC understand aggregate use of the site, including page views and broad engagement
        patterns. Analytics cookies are optional.
      </p>
      <LegalProse lines={analytics} />
      <h2>Consent</h2>
      <p>
        Analytics storage is denied by default unless a visitor allows analytics through the site notice. The site stores
        that choice in the browser so the banner does not need to appear on every page.
      </p>
      <h2>Browser storage that is not a cookie</h2>
      <LegalProse lines={storage} />
      <BrowserKeyList />
      <h2>Clearing this browser&rsquo;s data</h2>
      <LegalProse lines={clearing} />
      <p>
        The control that does it lives on <Link href={landingDataHref}>{landingDataLinkLabel}</Link>, next to the list of
        what is currently stored.
      </p>
      <h2>Technical infrastructure</h2>
      <LegalProse lines={infrastructure} />
      <h2>Retention</h2>
      <p>
        Google controls the exact cookie names and expiration periods. GA4 property data retention should be reviewed in
        the Google Analytics console.
      </p>
    </article>
  );
}
