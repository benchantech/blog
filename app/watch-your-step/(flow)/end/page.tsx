import type { Metadata } from "next";
import { endExitSlot, endLabels } from "@/content/watch-your-step/end";
import { wysWeeks } from "@/content/watch-your-step/weeks";
import type { WysWeek } from "@/content/watch-your-step/types";
import { learnerRuleProvenance } from "@/content/watch-your-step/progress";
import { provenanceLabelFor } from "@/lib/content-status";
import { visitCountableStop, type VisitCountableStop } from "@/lib/wys/visit";
import { CourseScreen } from "@/components/wys/CourseScreen";
import { BenSlot } from "@/components/provenance/BenSlot";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { LinkRow } from "@/components/ui/LinkRow";
import { CourseCompleteMark } from "./CourseCompleteMark";

/**
 * The Stop H terminal surface (plan Phase 7; §5.2; WYS §11 Period H).
 *
 * WHY IT EXISTS AT ALL. `/watch-your-step/end` is a declared route in §5.2 and
 * in `WYS_ROUTES`, Plan's dashed terminal row is drawn as the end of the path,
 * and `lib/wys/telemetry.ts` declares `wys_course_complete` as `firedInV0`
 * with "Stop H terminal surface reaches its completed state" as its firing
 * point. Shipping the table without the surface would leave the build claiming
 * a measurement it cannot take — a claim to fix in architecture, not in copy
 * (R8). This is the architecture.
 *
 * IT IS IN `(flow)`, NOT `(shell)` (§5.4). No bottom tab bar: an ending is not
 * a tab, and a five-item nav under it would invite the learner straight back
 * into a course they have just finished. The two ways onward are links, drawn
 * as links.
 *
 * IT HAS NO ARTBOARD AND IT AUTHORS NO PROSE. Ben's closing words are a
 * labelled empty slot that this build may not fill (R10, §6.4), and everything
 * else on the screen is either a control name of four words or fewer or the
 * learner's own rulebook. Nothing here says the learner has learned anything:
 * (packet: Proposition K) forbids an outcome claim this build has not observed,
 * and reaching the end of a finite path is a fact about the path.
 *
 * STATIC. Which stop is terminal is content data, and whether the learner has
 * finished it is local state read in a client component (§7.3), so the route
 * prerenders with no learner in it.
 */

export const metadata: Metadata = {
  title: `${endLabels.pageTitle} - BenChanTech`,
  alternates: { canonical: "/watch-your-step/end" }
};

/**
 * The terminal stop, derived from the content rather than named here.
 *
 * `terminal` is a field on `WysWeek`, so if the curriculum ever ends somewhere
 * else this surface follows without an edit. Null rather than a throw when
 * nothing is terminal: the screen still renders Ben's slot and the rulebook,
 * and the only thing that stops is the event — which is the honest failure.
 */
function terminalStop(): VisitCountableStop | null {
  // Widened through the declared interface: `wysWeeks` is an `as const`
  // literal, so an optional field absent from every member does not exist on
  // the inferred type at all (the Phase 6 trap).
  const weeks: readonly WysWeek[] = wysWeeks;
  const week = weeks.find((candidate) => candidate.terminal === true);
  return week ? visitCountableStop(week) : null;
}

export default function WatchYourStepEndPage() {
  return (
    <CourseScreen title={endLabels.pageTitle}>
      {/* Ben's exit copy. Empty by rule, labelled so the emptiness is legible. */}
      <BenSlot label={endExitSlot.label} awaitedAsset={endExitSlot.awaitedAsset} />

      <SectionEyebrow breakpoint="mobile">{endLabels.rulebookEyebrow}</SectionEyebrow>
      <CourseCompleteMark
        terminalStop={terminalStop()}
        rulebookLabel={provenanceLabelFor("general", learnerRuleProvenance.origin as "LEARNER_OWNED")}
      />

      <LinkRow href="/watch-your-step/progress">{endLabels.backToProgress}</LinkRow>
      <LinkRow href="/watch-your-step/plan">{endLabels.backToPlan}</LinkRow>
    </CourseScreen>
  );
}
