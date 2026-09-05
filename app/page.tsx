import Link from "next/link";
import { IntentRouter } from "@/components/IntentRouter";
import { destinations, stakeholderRoutes } from "@/content/site-config";
import { claimById } from "@/content/claims";
import { gatedCanonicalText } from "@/lib/wys/content-gate";
import {
  stopScaffoldFootnoteText,
  stopsHeadline,
  wysLabels
} from "@/content/watch-your-step/copy";
import {
  landingAntiFeatures,
  landingBadgeText,
  landingDataHref,
  landingDataLinkLabel,
  landingFourMoves,
  landingFourMovesLeadText,
  landingHeadlineText,
  landingHowRunBodyText,
  landingInstructorBodyText,
  landingInstructorEyebrowText,
  landingInstructorHeadlineText,
  landingLabels,
  landingLeadText,
  landingPathLeadText,
  landingShipChips
} from "@/content/watch-your-step/landing";
import { wysBenSlotById } from "@/content/watch-your-step/sources";
import { ActionPill } from "@/components/ui/ActionPill";
import { Pill } from "@/components/ui/Pill";
import { StruckPill } from "@/components/ui/StruckPill";
import { MediaSlot } from "@/components/provenance/MediaSlot";
import { cx } from "@/components/provenance/cx";
import { AudioSlotPill } from "@/components/wys/AudioSlotPill";
import { StopCard, StopStrip } from "@/components/wys/StopCard";
import { landingStopCells } from "@/components/wys/landing-stops";
import styles from "./home.module.css";

/**
 * `/` — the `4a` composition, and the whole of the previous home page beneath it.
 *
 * Q2 IS RATIFIED AT ITS BUILD-NOW DEFAULT: the preserved blocks are APPENDED
 * BELOW the new composition, restyled, on the same URL. Nothing is removed and
 * nothing is relocated. Everything from `.hero-foyer` down is the page as it
 * shipped — the foyer copy, both audience buttons with their live `#router`
 * anchors, the sr-only destinations heading, the four-door grid, `IntentRouter`
 * and the stakeholder section — with its class names, its hrefs, its ids and
 * its words untouched.
 *
 * (The three `aria-hidden` blueprint-scaffolding blocks — `.dimension-line`,
 * `.plan-foyer` and `.scale-line`/`.scale-bar` — were retired in Phase 4 under
 * plan §4.4's explicit resolution, markup and rules together in one commit.
 * They carried no copy a screen reader reached, no href and no metadata. That
 * decision is recorded in docs/facelift-unapproved.md and is not reopened here.)
 *
 * Q3 IS ALSO RATIFIED: `/watch-your-step` owns the pitch, and the hero demo
 * below is `HeroDemo` — the SAME component bound to the SAME scenario record
 * that the landing mounts. There is no second copy of the text on this page,
 * and there is no way to give this page a different scenario without changing
 * the content object both surfaces read.
 *
 * TWO `<h1>`s NOW EXIST ON THIS URL. The `4a` hero is the page's primary
 * heading and the preserved foyer keeps the one it shipped with, because
 * demoting it would be a semantic edit to preserved markup. That is a visible
 * consequence of Q2's stacking default rather than a decision of its own, and
 * it is recorded for Ben.
 *
 * NO DISCLOSURE STRIP IS COMPOSED HERE. `4a` draws one between "How the site is
 * run" and the footer; `components/DisclosureStrip.tsx` already renders it on
 * every route from `app/layout.tsx` (§5.5), directly below `<main>`. Adding a
 * second one on this page would be two nodes for one claim.
 */

const portrait = wysBenSlotById("slot-portrait-desktop");

/** The one dark tile of the four (dc.html:403). Named, not compared inline. */
const CARRY_TILE = "CARRY";

export default function Home() {
  const badge = gatedCanonicalText(landingBadgeText, "full");
  const headline = gatedCanonicalText(landingHeadlineText, "full");
  const lead = gatedCanonicalText(landingLeadText, "full");
  const instructorEyebrow = gatedCanonicalText(landingInstructorEyebrowText, "full");
  const instructorHeadline = gatedCanonicalText(landingInstructorHeadlineText, "full");
  const instructorBody = gatedCanonicalText(landingInstructorBodyText, "full");
  const pathLead = gatedCanonicalText(landingPathLeadText, "full");
  const movesLead = gatedCanonicalText(landingFourMovesLeadText, "full");
  const howRunHeadline = gatedCanonicalText(claimById("ai-role-boundaries"), "short");
  const howRunBody = gatedCanonicalText(landingHowRunBodyText, "full");
  const footnote = gatedCanonicalText(stopScaffoldFootnoteText, "short");

  const cells = landingStopCells();
  const withheldTitles = cells.some((cell) => cell.titleWithheld);

  return (
    <>
      <section className={cx(styles.section, styles.hero)} aria-labelledby="course-heading">
        <div>
          {badge ? (
            <p className={styles.heroBadge}>
              <Pill variant="status">{badge.text}</Pill>
            </p>
          ) : null}
          {headline ? (
            <h1 className={styles.heroHeadline} id="course-heading">
              {headline.text}
            </h1>
          ) : null}
          {lead ? <p className={styles.heroLead}>{lead.text}</p> : null}
          <div className={styles.heroActions}>
            <ActionPill variant="ink" href={landingLabels.startCtaHref}>
              {landingLabels.startCta}
            </ActionPill>
            <p className={styles.heroTryOne}>{landingLabels.tryOneDesktop}</p>
          </div>
        </div>
        <section className={styles.upworkFeature} aria-labelledby="upwork-feature-title">
          <div className={styles.screenshotSlot} aria-label="Screenshot placeholder" />
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

      <section className={cx(styles.section, styles.path)} aria-labelledby="path-heading">
        <p className={styles.pathEyebrow}>{landingLabels.pathEyebrow}</p>
        <h2 className={styles.pathHeadline} id="path-heading">
          {stopsHeadline()}
        </h2>
        {pathLead ? <p className={styles.pathLead}>{pathLead.text}</p> : null}
        <StopStrip>
          {cells.map((cell) => (
            <StopCard key={cell.id} meta={cell.meta} title={cell.title} state={cell.state} href={cell.href} />
          ))}
        </StopStrip>
        {withheldTitles && footnote ? <p className={styles.pathFootnote}>{footnote.text}</p> : null}
      </section>

      <div className={styles.section}>
        <section className={styles.moves} aria-labelledby="moves-heading">
          <div>
            <p className={styles.movesEyebrow}>{landingLabels.fourMovesEyebrow}</p>
            <h2 className={styles.movesHeadline} id="moves-heading">
              {landingLabels.fourMovesHeadline}
            </h2>
            {movesLead ? <p className={styles.movesLead}>{movesLead.text}</p> : null}
          </div>
          <ul className={styles.moveGrid}>
            {landingFourMoves.map((move) => {
              const body = gatedCanonicalText(move.record, "full");
              // Composed BEFORE the JSX: `tests/class-contract.test.ts` mode 1
              // reads every string literal inside a `className={...}` expression
              // as a class token, so the comparison is hoisted rather than the
              // guard loosened — the same shape every primitive uses.
              const inkTile = move.key === CARRY_TILE;
              return (
                <li className={cx(styles.move, inkTile && styles.moveInk)} key={move.key}>
                  <p className={styles.moveLabel}>{move.key}</p>
                  {body ? <p className={styles.moveBody}>{body.text}</p> : null}
                </li>
              );
            })}
          </ul>
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
