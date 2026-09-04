import {
  accessibilityContrastText,
  accessibilityMediaText,
  accessibilityShippedText
} from "@/content/legal";
import { type GatedContent, gatedCanonicalText } from "@/lib/wys/content-gate";
import { LegalProse } from "@/components/LegalProse";

/**
 * Refreshed in Phase 11 (plan §8b.2), IN PLACE, at the same URL, with the same
 * metadata title. Nothing was removed and nothing was corrected.
 *
 * THE PRESERVED CLAIM CONSTRAINED THE WHOLE RESTYLE and it survived it. "The
 * site uses semantic HTML, keyboard-focusable links and controls, visible focus
 * styles, skip navigation, and responsive layouts" is still true of
 * `app/globals.css`: `:focus-visible` kept its 3px/3px geometry through Phase 4
 * and only its colour moved, `.skip-link` is still the first focusable element
 * in `app/layout.tsx`, and the reduced-motion block at the foot of the
 * stylesheet is still paired with `scroll-behavior: smooth`.
 *
 * THE Q23 DEVIATION IS PUBLISHED, not buried. Two approved colour pairs missed
 * 4.5:1 for normal text, so `--accent-text-on-tint` ships for text on a tint
 * and the disabled button label ships in muted grey. That is a departure from
 * an approved artboard, and a page that publishes a contrast claim is the one
 * page that cannot leave it unsaid. The measured table is in
 * docs/facelift-unapproved.md §B1.
 *
 * WHAT IS NOT CLAIMED. §8b.2 asks this page to describe "transcripts alongside
 * Ben audio" and "text alternatives for fictional artifacts". No audio and no
 * artifact has shipped — the bank in `content/watch-your-step/artifacts.ts` is
 * empty and `public/` gained no files — so the page states the rule that is
 * enforced in the type system instead of claiming an alternative that does not
 * exist. No claim exceeds implemented fact (WYS §37, plan R8).
 */

export const metadata = {
  title: "Accessibility Statement - BenChanTech"
};

function lines(...values: readonly (GatedContent | null)[]): GatedContent[] {
  return values.filter((value): value is GatedContent => value !== null);
}

export default function AccessibilityPage() {
  const shipped = lines(gatedCanonicalText(accessibilityShippedText, "full"));
  const contrast = lines(gatedCanonicalText(accessibilityContrastText, "full"));
  const media = lines(gatedCanonicalText(accessibilityMediaText, "full"));

  return (
    <article className="detail-page legal-page">
      <p className="eyebrow">Accessibility</p>
      <h1>Accessibility Statement</h1>
      <p>
        Ben Chan Tech LLC aims for BenChanTech.com to be usable by visitors with different devices, input methods, and
        accessibility needs.
      </p>
      <h2>Current approach</h2>
      <p>
        The site uses semantic HTML, keyboard-focusable links and controls, visible focus styles, skip navigation, and
        responsive layouts.
      </p>
      <LegalProse lines={shipped} />
      <h2>Colour and contrast</h2>
      <LegalProse lines={contrast} />
      <h2>Images, recordings and text alternatives</h2>
      <LegalProse lines={media} />
      <h2>Ongoing work</h2>
      <p>
        Accessibility is an ongoing process. Some linked third-party properties or older materials may have limitations
        outside this site.
      </p>
      <h2>Contact</h2>
      <p>
        To report an accessibility issue, email ben@benchantech.com with the page URL, device/browser, and a short
        description of the problem.
      </p>
    </article>
  );
}
