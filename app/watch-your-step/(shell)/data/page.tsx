import type { Metadata } from "next";
import { claimById } from "@/content/claims";
import { aggregateCounterSentence } from "@/content/watch-your-step/config";
import {
  analyticsConditionsText,
  analyticsDeclinedText,
  analyticsUnavailableText,
  analyticsUndecidedText,
  benDoesNotNeedText,
  clearedDemonstrationText,
  clearingFootnoteText,
  clearingSurvivesText,
  confirmationProvenance,
  dataLabels,
  dataManifestIntroText,
  storageBlockedText
} from "@/content/watch-your-step/data";
import {
  CLEAR_ALL_WYS_DATA_EXPLANATION,
  RESTART_COURSE_EXPLANATION
} from "@/lib/wys/local-state";
import { WYS_DECISION_USE, measurementIdIsSet } from "@/lib/wys/telemetry";
import { type GatedContent, gateProse, gatedCanonicalText } from "@/lib/wys/content-gate";
import { CardShell } from "@/components/ui/CardShell";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { CourseScreen } from "@/components/wys/CourseScreen";
import { GatedText } from "@/components/wys/GatedText";
import { cx } from "@/components/provenance/cx";
import { AnalyticsReceipt } from "./AnalyticsReceipt";
import { DataManifest } from "./DataManifest";
import { DataManifestTelemetry } from "./DataManifestTelemetry";
import { DataText } from "./DataText";
import styles from "./data.module.css";

/**
 * `/watch-your-step/data` (plan Phase 8, §5.2; WYS §18, §20; mockup `5c` Data,
 * dc.html:179-207).
 *
 * (WYS §18): "Create a first-class `/watch-your-step/data` page. Do not bury it
 * as generic legal copy." (WYS §20): "This is a curriculum feature, not merely a
 * settings page." So the page is a course screen with a tab of its own, it is
 * never behind onboarding, and it renders the visitor's ACTUAL browser state
 * rather than a description of what a browser might hold.
 *
 * THE ONE RULE THIS SCREEN IS BUILT AGAINST: every sentence on it has to be
 * true of the shipped code, checked against the implementation and not against
 * the artboard. Three sentences are therefore state-bound rather than typed:
 *
 *   1. The approved "coarse counts" sentence (`claims.analytics.short`,
 *      dc.html:195) renders ONLY for a browser that granted analytics, because
 *      `trackWys` sends nothing otherwise (Q7's ratified full suppression,
 *      SC-2). `AnalyticsReceipt` picks the true sentence from the consent key.
 *   2. The first-party-counter sentence renders ONLY while
 *      `WYS_AGGREGATE_ENABLED` is true (Q22, SC-12). It is `null` today, so it
 *      is absent from the DOM — not greyed out, not hidden with CSS, absent.
 *      The flag and the string live in the same module as the adapter, so the
 *      copy cannot outrun the code.
 *   3. Card 2's opening depends on whether this BUILD has a measurement id at
 *      all: without `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `GoogleAnalytics.tsx`
 *      returns null and no analytics exist to describe. Decided at build time,
 *      so a deployment's prerendered HTML matches that deployment.
 *
 * THE EVENT REGISTER IS AN ADDITION, and it is the same class of fix. The
 * approved sentence names five things; the closed §19.4 allowlist can fire
 * eleven, including `wys_data_manifest_view` for opening this very page. A page
 * whose subject is what gets sent cannot list half of it, and (WYS §37)
 * requires the manifest to describe "what is actually deployed" — so the list
 * is rendered from `WYS_DECISION_USE`, the adapter's own decision table, and
 * cannot fall behind the allowlist.
 *
 * STATIC. No dynamic segment, no learner value in the URL or the page title
 * (§8.5), no `localStorage` read during render (§7.3): the route builds `○`
 * with the rest of the course. The card stack, both grey cards' fixed prose,
 * the ink card and the infrastructure paragraph are server-rendered, so the
 * page says something true with no JavaScript at all; only the rows, the key
 * values, the consent line and the three controls are client.
 */

export const metadata: Metadata = {
  title: `${dataLabels.pageTitle} - BenChanTech`,
  alternates: { canonical: "/watch-your-step/data" }
};

const inkBodyClass = cx(styles.cardBody, styles.cardBodyOnInk);
const stackedBodyClass = cx(styles.cardBody, styles.cardBodyStacked);

/** Every allowlisted event this build can actually fire, from the adapter. */
const firedEvents = WYS_DECISION_USE.filter((row) => row.firedInV0);

function gatedLines(lines: readonly string[]): GatedContent[] {
  return lines.map((line) => gateProse("general", confirmationProvenance, line));
}

export default function WatchYourStepDataPage() {
  const intro = gatedCanonicalText(dataManifestIntroText, "short");
  const doesNotNeed = gatedCanonicalText(benDoesNotNeedText, "short");
  const infrastructure = gatedCanonicalText(claimById("minimal-trust"), "short");
  const footnote = gatedCanonicalText(clearingFootnoteText, "short");
  const survives = gatedCanonicalText(clearingSurvivesText, "short");
  const cleared = gatedCanonicalText(clearedDemonstrationText, "short");
  const blocked = gatedCanonicalText(storageBlockedText, "short");

  const analyticsConfigured = measurementIdIsSet();
  const conditions = gatedCanonicalText(
    analyticsConfigured ? analyticsConditionsText : analyticsUnavailableText,
    "short"
  );
  const granted = gatedCanonicalText(claimById("analytics"), "short");
  const declined = gatedCanonicalText(analyticsDeclinedText, "short");
  const undecided = gatedCanonicalText(analyticsUndecidedText, "short");

  // The counter sentence exists only while the counter does (Q22). `null` here
  // means the string is never constructed, so it cannot reach the DOM.
  const aggregate = aggregateCounterSentence();

  // Every record above is `published`, so every one of these resolves. The
  // throw is a build-time failure if a status ever changes underneath this
  // screen, rather than a page that quietly loses a privacy claim.
  if (
    !intro ||
    !doesNotNeed ||
    !infrastructure ||
    !footnote ||
    !survives ||
    !cleared ||
    !blocked ||
    !conditions ||
    !granted ||
    !declined ||
    !undecided
  ) {
    throw new Error("Data page copy is not renderable — check status and origin.");
  }

  return (
    <CourseScreen title={dataLabels.pageTitle} lead={<GatedText content={intro} />}>
      <DataManifestTelemetry />

      <DataManifest
        clearingFootnote={footnote}
        clearingSurvives={survives}
        clearedDemonstration={cleared}
        storageBlockedNotice={blocked}
        restartExplanation={gatedLines(RESTART_COURSE_EXPLANATION)}
        clearExplanation={gatedLines(CLEAR_ALL_WYS_DATA_EXPLANATION)}
        infrastructure={
          <div className={styles.infrastructure}>
            <DataText content={infrastructure} className={styles.infrastructureText} />
          </div>
        }
      >
        {/* Cards 2 and 3 are passed as `children` and re-rendered by
          * DataManifest inside its own `.cards` div. Crossing that boundary
          * makes React re-validate them as a list, so they carry explicit
          * keys — without them the page logs a "unique key" warning. */}
        <CardShell key="card-2-ben-may-receive" fill="grey">
          <SectionEyebrow breakpoint="mobile">{dataLabels.card2Eyebrow}</SectionEyebrow>
          <DataText content={conditions} className={styles.cardBody} />

          {analyticsConfigured ? (
            <AnalyticsReceipt granted={granted} declined={declined} undecided={undecided} />
          ) : null}

          {aggregate ? <p className={stackedBodyClass}>{aggregate}</p> : null}

          {analyticsConfigured ? (
            <details className={styles.disclosure}>
              <summary className={styles.summary}>{dataLabels.eventsSummary}</summary>
              <ul className={styles.events}>
                {firedEvents.map((row) => (
                  <li key={row.event} className={styles.event}>
                    <span className={styles.eventName}>{row.event}</span>
                    <span className={styles.eventWhen}>{row.firesWhen}</span>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </CardShell>

        <CardShell key="card-3-ben-does-not-need" fill="ink">
          <p className={styles.eyebrowOnInk}>{dataLabels.card3Eyebrow}</p>
          <DataText content={doesNotNeed} className={inkBodyClass} tone="dark" />
        </CardShell>
      </DataManifest>
    </CourseScreen>
  );
}
