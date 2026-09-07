import type { Metadata } from "next";
import { INFO_MARKERS, LITE_INTRO } from "@/content/trust-forward/copy";
import { InfoMarker } from "@/components/trust-forward/InfoMarker";
import { LiteSandbox } from "@/components/trust-forward/LiteSandbox";
import styles from "@/components/trust-forward/lite.module.css";

/**
 * `/trust-forward-lite` — the public alternate route for the five-case run
 * (plan §5.3 and Phase 8; SC-TF8 resolved: `/trust-forward` is canonical, this
 * URL is retained as a public alternate, `/tf` is a redirect and never a node).
 *
 * A THIN SERVER COMPONENT ON PURPOSE. Everything that reads or writes the
 * learner's dataset lives in one `"use client"` island, `LiteSandbox`. That
 * keeps this route prerendered, keeps the server render byte-identical for a
 * first visitor and for a crawler, and keeps learner state out of the RSC
 * payload — three separate properties that all collapse the moment a page-level
 * component touches `localStorage`.
 *
 * THE INTRO IS COMPOSED HERE AND PASSED IN, NOT RENDERED BESIDE THE ISLAND.
 * `UX_COPY.md` wants a very short intro that GIVES WAY to Case 1 immediately
 * after Start. If this file rendered the intro as a sibling of `<LiteSandbox/>`
 * it would still be sitting above Case 3 an hour later, because a server
 * component cannot unmount itself. So the intro is handed to the island as
 * `children` — a server-rendered slot the island shows on the intro screen and
 * drops afterwards. The words are still in the initial HTML, which is what a
 * crawler and a first paint need; they are simply not permanent.
 *
 * NO DESCRIPTION IN THE METADATA. The route's own description would be a public
 * claim about a product whose landing copy is the crawlable surface
 * (`LANDING_INCOMPLETE`, on `/trust-forward`); `PRIVACY_ANALYTICS.md` and the
 * layer-07 SEO ruling both put the answer-first material on the landing rather
 * than on the run. `alternates.canonical` points at this URL and not at
 * `/trust-forward`, because the two pages are different documents — one sells
 * the run and one is the run.
 *
 * NO LEARNER STATE IN THE URL, AND THEREFORE NO `searchParams` HERE. GA4 ships
 * with `send_page_view: true` (`components/GoogleAnalytics.tsx`, byte-frozen),
 * so the URL IS telemetry: a case number in a path segment, a query or a hash
 * would transmit the learner's position on every page view. SC-TF8's standing
 * instruction — "never place learner state in path, query or hash" — is kept
 * structurally, by this route having no dynamic segment and this file reading
 * no request state at all.
 *
 * EVERY SENTENCE COMES FROM `content/trust-forward/copy.ts`. Nothing on this
 * page is typed out here; `tests/canonical-text.test.ts` enforces the floor and
 * the provenance spine is the reason for it.
 */

export const metadata: Metadata = {
  title: "Trust Forward Lite - BenChanTech",
  alternates: { canonical: "/trust-forward-lite" }
};

export default function TrustForwardLitePage() {
  return (
    <article className={styles.page}>
      <LiteSandbox>
        <header className={styles.intro}>
          <h1>{LITE_INTRO.heading}</h1>
          <p className={styles.lede}>{LITE_INTRO.lede}</p>
          <p className={styles.promiseLead}>{LITE_INTRO.promiseLead}</p>
          <ul className={styles.promiseList}>
            {LITE_INTRO.promiseItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className={styles.time}>{LITE_INTRO.timeEstimate}</p>
          <div className={styles.markers}>
            {LITE_INTRO.infoMarkerKeys.map((key) => (
              <InfoMarker key={key} marker={INFO_MARKERS[key]} />
            ))}
          </div>
        </header>
      </LiteSandbox>
    </article>
  );
}
