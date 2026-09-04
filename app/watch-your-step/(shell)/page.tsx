import type { Metadata } from "next";
import { gatedCanonicalText } from "@/lib/wys/content-gate";
import { stopScaffoldFootnoteText, stopsPeekHeading, wysLabels } from "@/content/watch-your-step/copy";
import { wysBenSlotById } from "@/content/watch-your-step/sources";
import {
  landingAntiFeaturesMobile,
  landingBadgeText,
  landingDataHref,
  landingDataLinkLabel,
  landingHeadlineText,
  landingInstructorEyebrowText,
  landingLabels,
  landingLeadText
} from "@/content/watch-your-step/landing";
import { CardShell } from "@/components/ui/CardShell";
import { LinkRow } from "@/components/ui/LinkRow";
import { Pill } from "@/components/ui/Pill";
import { StruckPill } from "@/components/ui/StruckPill";
import { MediaSlot } from "@/components/provenance/MediaSlot";
import { AudioSlotPill } from "@/components/wys/AudioSlotPill";
import { HeroDemo } from "@/components/wys/HeroDemo";
import { StopCard, StopStrip } from "@/components/wys/StopCard";
import { landingStopPeek } from "@/components/wys/landing-stops";
import styles from "./landing.module.css";

/**
 * `/watch-your-step` — the course's front door (plan Phase 10; mockup `4a`
 * phone, dc.html:433-475).
 *
 * IT IS THE CANONICAL NODE FOR THE PITCH (Q3, ratified). `/` mounts the same
 * `HeroDemo` bound to the same scenario record as an explicit reference; the
 * words live in `content/watch-your-step/landing.ts` and neither page owns a
 * copy of them. Four Phase 9 surfaces already name this URL as canonical — the
 * ship nav, the sitemap, `llms.txt` and `state.json`'s mission key — so this
 * page replaces the Phase 5 stub that those four were pointing at
 * (docs/facelift-unapproved.md GT7).
 *
 * THE TAB BAR HAS NO ACTIVE ITEM HERE. `activeCourseTab()` returns undefined
 * for any path that is not one of the five tab URLs, and this is not one of
 * them — the landing is the door, not a section of the course.
 *
 * NO ONBOARDING REDIRECT. Today redirects a learner who has not finished
 * Lesson Zero, because Today is a course screen with a stop in it. This page is
 * the public description of the course and must render the same for a first
 * visitor, a crawler and a learner mid-course: it reads no local state at all,
 * which is also what keeps the route prerendered (§5.3, §7.3).
 *
 * WHAT THE ARTBOARD DRAWS THAT IS NOT HERE, and why: the phone mock's iOS
 * status bar, notch and home indicator are prototype chrome (plan §1.2) and are
 * never reproduced.
 */

export const metadata: Metadata = {
  title: "Watch Your Step - BenChanTech",
  alternates: { canonical: "/watch-your-step" }
};

export default function WatchYourStepPage() {
  const badge = gatedCanonicalText(landingBadgeText, "short");
  const headline = gatedCanonicalText(landingHeadlineText, "short");
  const lead = gatedCanonicalText(landingLeadText, "short");
  const instructor = gatedCanonicalText(landingInstructorEyebrowText, "short");
  const footnote = gatedCanonicalText(stopScaffoldFootnoteText, "short");
  const portrait = wysBenSlotById("slot-portrait-mobile-disc");
  const peek = landingStopPeek();
  const withheldTitles = peek.some((cell) => cell.titleWithheld);

  return (
    <article className={styles.landing}>
      <header className={styles.hero}>
        {badge ? (
          <p className={styles.badge}>
            <Pill variant="status">{badge.text}</Pill>
          </p>
        ) : null}
        {headline ? <h1 className={styles.headline}>{headline.text}</h1> : null}
        {lead ? <p className={styles.lead}>{lead.text}</p> : null}
        <p className={styles.tryOne}>{landingLabels.tryOneMobile}</p>
      </header>

      <HeroDemo breakpoint="mobile" />

      <div className={styles.block}>
        <CardShell fill="ink">
          <div className={styles.instructor}>
            {/*
              A Ben slot, and it cannot be filled (§6.4): `MediaSlot` takes a
              label and an awaited-asset descriptor and has no `children`, so no
              generated image or string can occupy the portrait.
            */}
            <MediaSlot
              label={portrait.label}
              awaitedAsset={portrait.awaitedAsset}
              medium={portrait.medium ?? "image"}
              width={portrait.width}
              height={portrait.height}
              shape="disc"
            />
            <div>
              {instructor ? <p className={styles.instructorName}>{instructor.text}</p> : null}
              {/*
                R9 safe direction: the phone artboard writes the audio slot as a
                plain text line, "▶ Hear Ben, 60 seconds · Ben source". It is
                rendered with the shared `AudioSlotPill` instead, which carries
                the FULLER slot descriptor ("slot awaiting selection") that the
                desktop band draws. More provenance than the artboard, never
                less. Recorded in docs/facelift-unapproved.md.
              */}
              <AudioSlotPill title={wysLabels.hearBenLabel} sub={wysLabels.hearBenSubLabel} />
            </div>
          </div>
        </CardShell>
      </div>

      <div className={styles.block}>
        <p className={styles.peekHeading}>{stopsPeekHeading()}</p>
        <StopStrip layout="peek">
          {peek.map((cell) => (
            <StopCard key={cell.id} meta={cell.meta} title={cell.title} state={cell.state} href={cell.href} />
          ))}
        </StopStrip>
        {withheldTitles && footnote ? <p className={styles.footnote}>{footnote.text}</p> : null}
      </div>

      <div className={styles.antiFeatures}>
        <StruckPill labels={landingAntiFeaturesMobile} breakpoint="mobile" />
      </div>

      <div className={styles.dataLink}>
        <LinkRow href={landingDataHref} size="lg">
          {landingDataLinkLabel}
        </LinkRow>
      </div>
    </article>
  );
}
