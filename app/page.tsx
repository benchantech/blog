import Link from "next/link";
import { IntentRouter } from "@/components/IntentRouter";
import { destinations, stakeholderRoutes } from "@/content/site-config";
import { claimById } from "@/content/claims";
import { gatedCanonicalText } from "@/lib/wys/content-gate";
import {
  LANDING_INCOMPLETE,
  TRUST_STRIP
} from "@/content/trust-forward/copy";
import { ROUTES } from "@/content/trust-forward/stamp/v1-1-0";
import { wysLabels } from "@/content/watch-your-step/copy";
import {
  landingAntiFeatures,
  landingDataHref,
  landingDataLinkLabel,
  landingHowRunBodyText,
  landingInstructorBodyText,
  landingInstructorEyebrowText,
  landingInstructorHeadlineText,
  landingLabels,
  landingShipChips
} from "@/content/watch-your-step/landing";
import { wysBenSlotById } from "@/content/watch-your-step/sources";
import { ActionPill } from "@/components/ui/ActionPill";
import { Pill } from "@/components/ui/Pill";
import { StruckPill } from "@/components/ui/StruckPill";
import { MediaSlot } from "@/components/provenance/MediaSlot";
import { cx } from "@/components/provenance/cx";
import { AudioSlotPill } from "@/components/wys/AudioSlotPill";
import styles from "./home.module.css";

/**
 * `/` — Trust Forward at the top, and the whole of the previous home page
 * beneath it.
 *
 * THE PRODUCT ENTRY IS TRUST FORWARD, AND THAT IS A CONSEQUENCE OF A RULING
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
 * EVERY SENTENCE IN THE NEW HERO COMES FROM `content/trust-forward/copy.ts`,
 * through `LANDING_INCOMPLETE` — the same object `/trust-forward` renders, in
 * the same order (heading, lede, body, descriptor, time estimate), so the two
 * surfaces cannot make the offer with different words. `FULL_OFFER.bridge` and
 * its confidentiality sentence are NOT rendered here: copy.ts requires them as
 * one unit, and the home page has no room for the pair, so it shows neither.
 * `descriptor` is the half that is safe alone — it describes Lite's fictional
 * cases and makes no claim about real clients.
 *
 * THE CTA POINTS AT `ROUTES.canonical`, the door, not at `ROUTES.publicAlternate`,
 * the run. `/trust-forward` is the crawlable node that carries the answer-first
 * material and the completion split; sending the home page past it would skip
 * the one surface that knows whether this browser has already finished.
 *
 * PRESERVED, UNCHANGED. Everything from `.hero-foyer` down is the page as it
 * shipped — the foyer copy, both audience buttons with their live `#router`
 * anchors, the sr-only destinations heading, the four-door grid, `IntentRouter`
 * and the stakeholder section — with its class names, its hrefs, its ids and
 * its words untouched. `tests/preserved-surfaces.test.ts` and
 * `tests/home-landing.test.ts` execute that promise.
 *
 * TWO `<h1>`s STILL EXIST ON THIS URL. The Trust Forward hero is the page's
 * primary heading and the preserved foyer keeps the one it shipped with,
 * because demoting it would be a semantic edit to preserved markup.
 *
 * NO DISCLOSURE STRIP IS COMPOSED HERE. `components/DisclosureStrip.tsx`
 * already renders it on every route from `app/layout.tsx`, directly below
 * `<main>`. Adding a second one on this page would be two nodes for one claim.
 */

const portrait = wysBenSlotById("slot-portrait-desktop");

export default function Home() {
  const instructorEyebrow = gatedCanonicalText(landingInstructorEyebrowText, "full");
  const instructorHeadline = gatedCanonicalText(landingInstructorHeadlineText, "full");
  const instructorBody = gatedCanonicalText(landingInstructorBodyText, "full");
  const howRunHeadline = gatedCanonicalText(claimById("ai-role-boundaries"), "short");
  const howRunBody = gatedCanonicalText(landingHowRunBodyText, "full");

  return (
    <>
      <section className={cx(styles.section, styles.hero)} aria-labelledby="trust-forward-heading">
        <div>
          <h1 className={styles.heroHeadline} id="trust-forward-heading">
            {LANDING_INCOMPLETE.heading}
          </h1>
          <p className={styles.heroLead}>{LANDING_INCOMPLETE.lede}</p>
          <p className={styles.heroBody}>{LANDING_INCOMPLETE.body}</p>
          <p className={styles.heroDescriptor}>{LANDING_INCOMPLETE.fullOffer.descriptor}</p>
          <p className={styles.heroBadge}>
            <Pill variant="status">{LANDING_INCOMPLETE.timeEstimate}</Pill>
          </p>
          <div className={styles.heroActions}>
            <ActionPill variant="ink" href={ROUTES.canonical}>
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
              <img
                src="/upwork-cto-desktop.webp"
                alt="Upwork profile screenshot for the From Upwork to CTO feature"
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
            <p className={styles.upworkEyebrow}>Recent Graduate</p>
            <h2 id="upwork-feature-title">From Upwork to CTO</h2>
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

      <div className={styles.section}>
        <section className={styles.instructor} aria-labelledby="instructor-heading">
          {/*
            A Ben slot, and it cannot be filled (§6.4): `MediaSlot` takes a label
            and an awaited-asset descriptor and declares no children, so nothing
            generated can occupy the portrait Ben has not supplied.
          */}
          <MediaSlot
            label={portrait.label}
            awaitedAsset={portrait.awaitedAsset}
            medium={portrait.medium ?? "image"}
            height={portrait.height}
          />
          <div>
            {instructorEyebrow ? <p className={styles.instructorEyebrow}>{instructorEyebrow.text}</p> : null}
            {instructorHeadline ? (
              <h2 className={styles.instructorHeadline} id="instructor-heading">
                {instructorHeadline.text}
              </h2>
            ) : null}
            {instructorBody ? <p className={styles.instructorBody}>{instructorBody.text}</p> : null}
            <div className={styles.instructorActions}>
              <AudioSlotPill title={wysLabels.hearBenLabel} sub={wysLabels.hearBenSubLabel} />
              <Link className={styles.instructorLink} href={landingLabels.whoIsBenHref}>
                {landingLabels.whoIsBen}
              </Link>
            </div>
          </div>
        </section>
      </div>

      <section className={cx(styles.section, styles.antiFeatures)} aria-labelledby="anti-features-heading">
        <h2 className={styles.antiFeaturesHeadline} id="anti-features-heading">
          {landingLabels.antiFeaturesHeadline}
        </h2>
        <div className={styles.antiFeaturesList}>
          <StruckPill labels={landingAntiFeatures} />
        </div>
        <p className={styles.willFind}>
          {landingLabels.whatYouWillFind}{" "}
          <Link className={styles.willFindLink} href={landingDataHref}>
            {landingDataLinkLabel} →
          </Link>
        </p>
      </section>

      <div className={styles.section}>
        <section className={styles.howRun} aria-labelledby="how-run-heading">
          <div>
            <p className={styles.howRunEyebrow}>{landingLabels.howRunEyebrow}</p>
            {howRunHeadline ? (
              <h2 className={styles.howRunHeadline} id="how-run-heading">
                {howRunHeadline.text}
              </h2>
            ) : null}
            {howRunBody ? <p className={styles.howRunBody}>{howRunBody.text}</p> : null}
          </div>
          <ul className={styles.chips}>
            {landingShipChips.map((chip) => (
              <li key={chip.href}>
                <Link className={styles.chip} href={chip.href}>
                  {chip.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ====================================================================
          PRESERVED — the home page as it shipped, restyled by the token
          re-point and by the two rules Phase 10 added for `.hero-foyer` and
          `.audience-button.secondary`. No copy, href, id or anchor below this
          line has changed.
          ==================================================================== */}
      <div className={styles.seam} />

      <section className="hero hero-foyer">
        <div className="hero-copy-block">
          <p className="welcome-label">Routing foyer · Sheet A-01</p>
          <h1>Come on in - even if you&apos;re AI.</h1>
          <p className="hero-copy">
            Welcome to a system overview of what I&apos;m building, piece by piece, using AI and my years of technical
            judgment. It&apos;s not the prettiest site by far... but the foundation is solid underneath.
          </p>
          <p className="signature-note">
            I built the whole thing in plain sight, so yes, you can see the framing. That&apos;s the point.
            <span> - B.C.</span>
          </p>
        </div>
        <div className="audience-actions" aria-label="Start by audience">
          <a className="audience-button primary" href="#router">
            <span>I&apos;m human</span>
            <small>I think, choose, and decide.</small>
          </a>
          <a className="audience-button secondary" href="#router">
            <span>I&apos;m AI</span>
            <small>I execute, retrieve, and compose.</small>
          </a>
        </div>
      </section>

      <section className="destinations-section" aria-labelledby="destinations-heading">
        <h2 className="sr-only" id="destinations-heading">
          The ecosystem has four stable doors.
        </h2>
        <div className="floor-plan">
          {destinations.map((item) => (
            <a className={`plan-room plan-room-${item.number}`} href={item.url} rel="noreferrer" key={item.id}>
              <span className="room-number">Door 0{item.number}</span>
              <strong>{item.eyebrow}</strong>
              <small>{item.description}</small>
              <em>{item.url.replace("https://", "")} -&gt;</em>
            </a>
          ))}
        </div>
      </section>

      <IntentRouter />

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
