import type { Metadata } from "next";
import { CourseScreen } from "@/components/wys/CourseScreen";
import { GatedText } from "@/components/wys/GatedText";
import { LinkRow } from "@/components/ui/LinkRow";
import { ProvenanceMono } from "@/components/provenance/ProvenanceMono";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { planIntro, stopScaffoldFootnoteText } from "@/content/watch-your-step/copy";
import { planLabels } from "@/content/watch-your-step/plan";
import { gatedCanonicalText, isShowable } from "@/lib/wys/content-gate";
import { PlanPacePill, PlanStops } from "./PlanStops";
import {
  optionalPracticeNames,
  planDaySummaries,
  planStopViews,
  withheldLabels
} from "./plan-content";
import styles from "./plan.module.css";

/**
 * Plan — a finite horizon (WYS §12; mockup 5b, dc.html:101-118).
 *
 * WHAT (WYS §12) REQUIRES THIS SCREEN TO SHOW, and where each one is:
 *   current source period   — the ink card, with its position inside the stop.
 *   upcoming source periods — the rows below it.
 *   approximate direction   — "Next: an excerpt and one core decision", from the
 *                             day plan, plus the intro line's "It ends."
 *   completed periods       — the muted rows tagged "done".
 *   optional practices      — the block below the list. **No artboard draws it.**
 *
 * WHAT IT REFUSES TO SHOW, and the refusal is architectural rather than careful
 * wording (R8). There is no "behind", no "overdue", no "missed", no streak, no
 * percentage and no completion total — not because the copy avoids them but
 * because `plan-model.ts` has three row states, takes no clock and computes no
 * ratio, and `content/watch-your-step/plan.ts` holds no word one could be built
 * from. (WYS §12): "learner can use less frequently without punishment · no
 * guilt for missed days · no artificial 'behind' state."
 * `tests/wys-plan.test.ts` asserts that absence over every file of this route.
 *
 * THE OPTIONAL-PRACTICES BLOCK IS NEW AND UNAPPROVED. (WYS §12) lists optional
 * practices among the five things Plan must show and the approved `5b` artboard
 * draws no such row — a spec-vs-artboard gap. Plan Phase 7's ratified default is
 * to add the data shape and render the row, flagged NEW, because omitting it
 * silently drops a spec requirement. `WysWeek.optionalPracticeIds` already
 * carries the shape; this is the rendering half. Recorded in
 * `docs/facelift-unapproved.md`, and it is also where (WYS §12) says Replay and
 * From Memory surface outside Practice.
 *
 * THE WITHHELD TITLES ARE NAMED ONCE. Every stop title is `draft` +
 * `IMPLEMENTATION_PLACEHOLDER` (WYS §11: "an implementation scaffold derived
 * from the current architecture", not Ben doctrine), so under Q21's ratified
 * default all nine are blocked and the rows render their derived mark alone. The
 * provenance label is rendered ONCE beneath the list: the nine records share one
 * status and one origin, so they share one label, and nine identical mono lines
 * would make provenance decorative (WYS §23) in the one place it has to stay
 * readable. Nothing withheld reaches the DOM; the reader is told what is missing
 * and, in the scaffold footnote directly under it, why.
 *
 * SERVER COMPONENT. Everything above is content and derived structure, so it
 * prerenders. The two state-dependent slots — the pace pill and the row states
 * — are the only client components and the only readers of `wys:v1` (§7.3).
 *
 * NO TELEMETRY FIRES HERE. `lib/wys/telemetry.ts`'s decision table gives Plan no
 * event: `wys_view` is wired-but-unfired (the preserved GA4 config already sends
 * a `page_view` for every route) and every other allowlisted event belongs to an
 * action the learner takes, not to a screen they open.
 */

export const metadata: Metadata = {
  title: "Plan - BenChanTech",
  alternates: { canonical: "/watch-your-step/plan" }
};

export default function WatchYourStepPlanPage() {
  const stops = planStopViews();
  const practices = optionalPracticeNames();
  const footnote = gatedCanonicalText(stopScaffoldFootnoteText, "short");

  const withheldTitles = withheldLabels(stops.map((stop) => stop.title));
  const withheldPractices = withheldLabels(practices);
  const shownPractices = practices.filter(isShowable);

  return (
    <CourseScreen title="Plan" meta={<PlanPacePill />} lead={planIntro()}>
      <PlanStops stops={stops} daySummaries={planDaySummaries()} />

      {withheldTitles.map((label) => (
        <ProvenanceMono key={label}>{label}</ProvenanceMono>
      ))}

      {footnote ? (
        <div className={styles.footnote}>
          <GatedText content={footnote} />
        </div>
      ) : null}

      <section className={styles.practices}>
        <SectionEyebrow breakpoint="mobile">{planLabels.optionalPracticesHeading}</SectionEyebrow>
        {shownPractices.length > 0 ? (
          <ul className={styles.practiceList}>
            {shownPractices.map((practice) => (
              <li className={styles.practiceItem} key={practice.text}>
                {practice.text}
              </li>
            ))}
          </ul>
        ) : null}
        {withheldPractices.map((label) => (
          <ProvenanceMono key={label}>{label}</ProvenanceMono>
        ))}
        <LinkRow href={planLabels.optionalPracticesHref}>{planLabels.optionalPracticesLink}</LinkRow>
      </section>

      <div className={styles.changePace}>
        <LinkRow href={planLabels.changePaceHref}>{planLabels.changePace}</LinkRow>
      </div>
    </CourseScreen>
  );
}
