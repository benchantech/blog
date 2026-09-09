import Link from "next/link";
import { stakeholderRoutes } from "@/content/site-config";
import {
  LANDING_INCOMPLETE,
  TRUST_STRIP
} from "@/content/developer-forward/copy";
import { ROUTES } from "@/content/developer-forward/stamp/v1-1-0";
import {
  landingAntiFeatures,
  landingLabels
} from "@/content/watch-your-step/landing";
import { ActionPill } from "@/components/ui/ActionPill";
import { Pill } from "@/components/ui/Pill";
import { StruckPill } from "@/components/ui/StruckPill";
import { cx } from "@/components/provenance/cx";
import styles from "./home.module.css";

/**
 * `/` — Developer Forward at the top, and the whole of the previous home page
 * beneath it.
 *
 * THE PRODUCT ENTRY IS DEVELOPER FORWARD, AND THAT IS A CONSEQUENCE OF A RULING
 * ALREADY IN FORCE RATHER THAN A NEW ONE. `WYS_NAV_RETIRED` is `true`,
 * `content/canonical-surfaces.ts` moves the course into `RETIRED_SURFACES`, and
 * `next.config.ts` points the course routes at `/` with non-permanent
 * redirects. A hero that still sold the course, a Lesson Zero start pill and a
 * nine-cell preview of its stops were therefore advertising a redirect: every
 * one of those controls landed the visitor back on this page. They are removed from the RENDER — not from `content/`, where
 * the records stay published and where `/watch-your-step` still reads them, so
 * the retirement remains reversible by flipping one flag rather than by
 * recovering deleted copy.
 *
 * WHAT WENT, AND WHY EACH ONE COUNTS AS "WATCH YOUR STEP AS THE PRODUCT ENTRY":
 *
 *  - The hero badge, headline and lead. `landingLeadText.full` opens "Watch
 *    Your Step teaches one skill first"; it is the course's pitch, by name.
 *  - The start CTA — the Lesson Zero pill, whose href came from `landingLabels`
 *    — and the "or try one question →" label that pointed at it.
 *  - The whole path section: `stopsHeadline()`, the nine `StopCard`s from
 *    `landingStopCells()` and the scaffold footnote that explained their
 *    withheld titles. That is the stop preview.
 *  - The four-moves slab, "Every visit, the same four moves · Watch. Try.
 *    Judge. Carry." It describes the visit loop of a course with no visits
 *    left, which is the same claim as the hero in a different tile.
 *
 * WHAT STAYED, deliberately, because none of it is course-entry: the instructor
 * band (it is about Ben, and `/ben` is live), the anti-feature pills — "AI you
 * can trust" has exactly one approved use and this struck pill is it — and "How
 * the site is run", whose four chips point at `/standing-orders`, `/bridge`,
 * `/ships-log` and `/crew`, all of which serve pages.
 *
 * ONE LIVE LINK STILL POINTS INTO THE RETIRED TREE and this file cannot fix it:
 * `landingDataHref` is the course's Data page, which the wildcard redirect
 * sends to `/`. The label is the site's one route to "what this site knows about
 * you", so dropping the link would cost more than it saves; the href is defined
 * in `content/watch-your-step/landing.ts` and belongs to whoever owns the Data
 * page's new home.
 *
 * EVERY SENTENCE IN THE NEW HERO COMES FROM `content/developer-forward/copy.ts`,
 * through `LANDING_INCOMPLETE` — the same object `/developer-forward` renders, in
 * the same order (heading, lede, body, descriptor, time estimate), so the two
 * surfaces cannot make the offer with different words. `FULL_OFFER.bridge` and
 * its confidentiality sentence are NOT rendered here: copy.ts requires them as
 * one unit, and the home page has no room for the pair, so it shows neither.
 * `descriptor` is the half that is safe alone — it describes Lite's fictional
 * cases and makes no claim about real clients.
 *
 * THE CTA POINTS AT `ROUTES.publicAlternate`, the RUN, changed 2026-09-09 on
 * Ben's instruction: the button says "Start Developer Forward Lite" and it now
 * starts it. It pointed at `ROUTES.canonical` — the door — on the reasoning
 * that `/developer-forward` carries the answer-first material and the
 * completion split, so skipping it would skip the one surface that knows
 * whether this browser has already finished.
 *
 * That reasoning was already stale when it was written. The completion split
 * has been dead since the YY rewrite (`LandingCompletion` gates on the SHIP-era
 * storage key), and the answer-first material exists for CRAWLERS, which reach
 * `/developer-forward` from the sitemap and the header rather than through this
 * button. What the old target actually cost was a click: a visitor who pressed
 * "Start" landed on a page asking them to press Start again. A label that does
 * not do what it says is the defect; the SEO surface loses nothing.
 *
 * PRESERVED, UNCHANGED. Everything from `.hero-foyer` down is the page as it
 * shipped — the foyer copy, both audience buttons with their live `#router`
 * anchors, the sr-only destinations heading, the four-door grid, `IntentRouter`
 * and the stakeholder section — with its class names, its hrefs, its ids and
 * its words untouched. `tests/preserved-surfaces.test.ts` and
 * `tests/home-landing.test.ts` execute that promise.
 *
 * TWO `<h1>`s STILL EXIST ON THIS URL. The Developer Forward hero is the page's
 * primary heading and the preserved foyer keeps the one it shipped with,
 * because demoting it would be a semantic edit to preserved markup.
 *
 * NO DISCLOSURE STRIP IS COMPOSED HERE. `components/DisclosureStrip.tsx`
 * already renders it on every route from `app/layout.tsx`, directly below
 * `<main>`. Adding a second one on this page would be two nodes for one claim.
 */

export default function Home() {
  return (
    <>
      <section className={cx(styles.section, styles.hero)} aria-labelledby="developer-forward-heading">
        <div>
          <h1 className={styles.heroHeadline} id="developer-forward-heading">
            {LANDING_INCOMPLETE.heading}
          </h1>
          <p className={styles.heroLead}>{LANDING_INCOMPLETE.lede}</p>
          {/*
            `body` is empty as of 2026-09-09 — Ben struck the paragraph — and
            the guard is here rather than in the copy so the field can be
            refilled without touching a renderer. An empty string would
            otherwise ship an empty <p> carrying the hero's bottom margin.
          */}
          {LANDING_INCOMPLETE.body ? (
            <p className={styles.heroBody}>{LANDING_INCOMPLETE.body}</p>
          ) : null}
          <p className={styles.heroDescriptor}>{LANDING_INCOMPLETE.fullOffer.descriptor}</p>
          <p className={styles.heroBadge}>
            <Pill variant="status">{LANDING_INCOMPLETE.timeEstimate}</Pill>
          </p>
          <div className={styles.heroActions}>
            <ActionPill variant="ink" href={ROUTES.publicAlternate}>
              {LANDING_INCOMPLETE.primaryCta}
            </ActionPill>
          </div>
          {/*
            The four things a visitor wants settled before they start, directly
            under the CTA rather than further down the page — free, no account,
            no AI, nothing leaves the browser. Every one was verified against
            the code before it was written (see TRUST_STRIP's header); they read
            as marketing because the honest version of these facts is the pitch.
          */}
          <ul className={styles.trustStrip} aria-label="What this costs and what it collects">
            {TRUST_STRIP.items.map((item) => (
              <li className={styles.trustItem} key={item}>
                {item}
              </li>
            ))}
          </ul>
          <p className={styles.trustLine}>{TRUST_STRIP.line}</p>
        </div>
        <section className={styles.upworkFeature} aria-labelledby="upwork-feature-title">
          <div className={styles.screenshotSlot}>
            <picture className={styles.screenshotMedia}>
              <source media="(max-width: 700px)" srcSet="/upwork-cto-mobile.webp" />
              {/*
                THE ALT CARRIES THE EVIDENCE, because the image IS the evidence.
                It said "Upwork profile screenshot for the From Freelancer to CTO
                feature" — which describes the file, not the claim. Everything
                that makes this section worth putting on a home page is inside
                the picture: the headline, the rating, the review count and the
                two totals. A visitor who cannot see it was being handed the
                caption of a proof rather than the proof. Read from the image
                itself; if the screenshot is ever replaced, this text is part of
                the replacement.
              */}
              <img
                src="/upwork-cto-desktop.webp"
                alt="Upwork profile for Ben C., verified: Freelance Developer to CTO, 800K+ Earned, 10+ Years on Upwork. Rated 5.0 from 26 reviews. Schenectady, NY, USA. 58 total jobs, 9K total hours."
                width={1448}
                height={1086}
              />
            </picture>
            <picture className={styles.graduationBadge}>
              <source media="(max-width: 700px)" srcSet="/leveled-up-badge-mobile.webp" />
              <img src="/leveled-up-badge-desktop.webp" alt="Leveled Up!" width={360} height={312} />
            </picture>
          </div>
          <div className={styles.upworkCopy}>
            <h2 id="upwork-feature-title">From Freelancer to CTO</h2>
            <Link className={styles.upworkLink} href="/upwork" target="_blank" rel="noreferrer">
              <span>benchantech.com/upwork</span>
              <span aria-hidden="true">↗</span>
            </Link>
            <Link
              className={styles.upworkLink}
              href="https://www.linkedin.com/in/benchantech/"
              target="_blank"
              rel="noreferrer"
            >
              <span>linkedin.com/in/benchantech</span>
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>
      </section>

      {/*
        THE INSTRUCTOR SLAB WAS REMOVED 2026-09-08, on Ben's instruction, and
        what it carried moved rather than vanished. The ink treatment — the one
        dark block on an otherwise white page — is now on the anti-features
        section below, which is the section that earns it: "What you won't find
        here" is the page's sharpest claim and it was set on white like
        everything around it. `/who-is-ben` still exists and is still reachable
        from the footer, so removing the block removed a homepage panel, not a
        route. `.instructor*` stays in `home.module.css` unreferenced rather
        than deleted, so restoring the panel is an edit here and not a
        reconstruction; `MediaSlot` and `AudioSlotPill` are still rendered by
        the Watch Your Step landing, so the /accessibility sentence about where
        a recording will sit is still true.
      */}
      <div className={styles.section}>
        <section className={styles.antiFeatures} aria-labelledby="anti-features-heading">
          <h2 className={styles.antiFeaturesHeadline} id="anti-features-heading">
            {landingLabels.antiFeaturesHeadline}
          </h2>
          <div className={styles.antiFeaturesList}>
            {/*
              `tone="onInk"` is required here, not decorative: the default pill
              colour measures 3.01:1 against this slab. See StruckPill.
            */}
            <StruckPill labels={landingAntiFeatures} tone="onInk" />
          </div>
          {/*
            "What you will find: See what this site knows about you →" was
            REMOVED 2026-09-08. It pointed at `landingDataHref` —
            /watch-your-step/data — which the course's wildcard redirect has
            been sending to `/` since the retirement. A link on the home page
            promising to show a visitor what the site knows about them, that
            lands them back on the home page, is a broken promise about privacy
            specifically, which is the worst subject to be wrong about.

            The label and the href stay exported from
            `content/watch-your-step/landing.ts`; this is a link removed, not a
            name deleted. `.willFind` and `.willFindLink` stay in
            `home.module.css` for the same reason.

            NOT THE WHOLE STORY: /privacy and /cookies still link the same
            retired Data page, and there the sentence is load-bearing — it is
            where those documents tell a reader how to download or clear what
            this browser holds. That is a pre-existing defect and its fix is
            either to un-retire the Data page or to rewrite two legal
            paragraphs; both are Ben's call, so neither is made here. Reported
            rather than silently patched.
          */}
        </section>
      </div>

      {/* ====================================================================
          "HOW THE SITE IS RUN" WAS REMOVED 2026-09-08, on Ben's instruction,
          in the same consolidation that took the foyer and the floor plan.

          It carried an eyebrow, the `ai-role-boundaries` claim as its heading,
          a body paragraph, and four chips linking to /standing-orders,
          /bridge, /ships-log and /crew — which, after the menu consolidation
          the commit before this one, were the last in-page links to those four
          pages. They are NOT now unreachable: all five ship routes stay in
          `canonicalSurfaces`, so they remain in the sitemap and in /llms.txt,
          and each still serves its own page. What they lost is a link from the
          home page, which is what "consolidating" means here.

          NOTHING WAS DELETED. `claimById("ai-role-boundaries")` still renders
          on /ai-disclosure, which is the page that exists to carry it, so the
          claim keeps a surface. `landingShipChips` and `landingHowRunBodyText`
          stay exported from `content/watch-your-step/landing.ts`, and the
          `.howRun*` rules stay in `home.module.css` — a module stylesheet, so
          no orphan scan is owed an entry for them.
          ==================================================================== */}

      {/* ====================================================================
          PRESERVED — the home page as it shipped, restyled by the token
          re-point and by the two rules Phase 10 added for `.hero-foyer` and
          `.audience-button.secondary`. No copy, href, id or anchor below this
          line has changed.
          ==================================================================== */}
      <div className={styles.seam} />

      {/* ====================================================================
          WITHDRAWN 2026-09-08, on Ben's instruction: *"from routing foyer down
          to just above review routes remove all of these sections … we're
          consolidating until i can build it out more."*

          THREE BLOCKS LEFT THIS PAGE: the routing foyer ("Come on in - even if
          you're AI", the two audience buttons), the four-door floor plan, and
          the <IntentRouter/> the audience buttons anchored to. Review routes
          below stays; everything above the seam stays.

          NOTHING WAS DELETED TO ACHIEVE IT. `components/IntentRouter.tsx` is
          untouched and still exported. `content/site-config.ts` still holds all
          four `destinations[]`, which the footer's DOORS group still renders,
          so the four URLs remain reachable from every page — this removed a
          panel, not a set of doors. The globals.css rules that styled the
          withdrawn markup are kept and registered in `ORPHAN_RULES` in
          `tests/class-contract.test.ts`, which is self-expiring: the day this
          markup returns, that register fails until the entries come out.

          Restoring it is `git show` on this commit, not a reconstruction.
          ==================================================================== */}
      <section className="stakeholder-section" aria-labelledby="stakeholder-heading">
        <div className="section-heading compact">
          <p className="eyebrow">Review routes</p>
          <h2 id="stakeholder-heading">Two rooms are built for current reviewers.</h2>
        </div>
        <div className="stakeholder-grid">
          {stakeholderRoutes.map((item) => (
            <Link className="stakeholder-card" href={item.url} key={item.id}>
              <span>
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </span>
              <span aria-hidden="true">-&gt;</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
