import type { Metadata } from "next";
import { INFO_MARKERS, LITE_INTRO } from "@/content/developer-forward/copy";
import { YYSandbox } from "@/components/developer-forward/yy/YYSandbox";
import styles from "@/components/developer-forward/yy/yy.module.css";

/**
 * `/developer-forward-lite` — the public alternate route for the five-case run
 * (plan §5.3 and Phase 8; SC-TF8 resolved: `/developer-forward` is canonical, this
 * URL is retained as a public alternate, `/tf` is a redirect and never a node).
 *
 * REWIRED TO THE YY ISLAND. The mount is now `YYSandbox` — the YY Method state
 * machine for five cases, seventeen checkpoints and one URL — rather than
 * `LiteSandbox`. `components/developer-forward/LiteSandbox.tsx` STAYS ON DISK
 * untouched: the deletion contract forbids removing it, and it is the archived
 * SHIP-era UI, kept the way ADR 0001 keeps the rest of the SHIP layer ("archived
 * in place, never deleted"). It is simply no longer mounted by a route.
 *
 * A THIN SERVER COMPONENT ON PURPOSE. Everything that reads or writes the
 * learner's ledger lives in one `"use client"` island. That keeps this route
 * prerendered, keeps the server render byte-identical for a first visitor and
 * for a crawler, and keeps learner state out of the RSC payload — three
 * separate properties that all collapse the moment a page-level component
 * touches `localStorage`.
 *
 * THE INTRO IS COMPOSED HERE AND PASSED IN, NOT RENDERED BESIDE THE ISLAND.
 * If this file rendered the intro as a sibling of `<YYSandbox/>` it would still
 * be sitting above Case 3 an hour later, because a server component cannot
 * unmount itself. So the intro is handed to the island as `children` — a
 * server-rendered slot the island shows on the intro screen and drops
 * afterwards. The words are still in the initial HTML, which is what a crawler
 * and a first paint need; they are simply not permanent.
 *
 * WHAT THE INTRO NO LONGER SAYS, AND WHY THAT IS THE REWIRE AND NOT AN EDIT.
 * `LITE_INTRO.promiseLead` and `LITE_INTRO.promiseItems` promise the learner
 * "your SHIP profile" at the end of the run. This build does not produce one:
 * ADR 0001 removed numeric scoring from Lite's required path, and the governing
 * addendum forbids inventing a replacement. A promise of a score on the first
 * screen would break the no-score invariant before the learner had answered
 * anything, so those two fields are not rendered. Nothing in `content/` was
 * changed to achieve that — the records stand, unrendered, and Ben-approved YY
 * intro copy replaces this composition when it exists.
 *
 * Only `INFO_MARKERS.localOnly.label` is used, not its expansion: the expansion
 * tells the learner their "SHIP result" is stored in this browser, and a
 * storage disclosure is the one sentence that may not be wrong about storage.
 * The label — five words about where the data lives — is true in both builds.
 *
 * NO DESCRIPTION IN THE METADATA. The route's own description would be a public
 * claim about a product whose landing copy is the crawlable surface
 * (`LANDING_INCOMPLETE`, on `/developer-forward`); `PRIVACY_ANALYTICS.md` and the
 * layer-07 SEO ruling both put the answer-first material on the landing rather
 * than on the run. `alternates.canonical` points at this URL and not at
 * `/developer-forward`, because the two pages are different documents — one sells
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
 * EVERY SENTENCE COMES FROM `content/developer-forward/copy.ts`. Nothing on this
 * page is typed out here; `tests/canonical-text.test.ts` enforces the floor and
 * the provenance spine is the reason for it.
 */

export const metadata: Metadata = {
  title: "Developer Forward Lite - BenChanTech",
  alternates: { canonical: "/developer-forward-lite" }
};

export default function DeveloperForwardLitePage() {
  return (
    <article className={styles.page}>
      <YYSandbox>
        <header className={styles.intro}>
          <h1>{LITE_INTRO.heading}</h1>
          <p className={styles.lede}>{LITE_INTRO.lede}</p>
          <p className={styles.time}>{LITE_INTRO.timeEstimate}</p>
          <p className={styles.localOnly}>{INFO_MARKERS.localOnly.label}</p>
        </header>
      </YYSandbox>
    </article>
  );
}
