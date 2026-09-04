import type { Metadata } from "next";
import type { GatedContent } from "@/lib/wys/content-gate";
import { gateProse, gatedCanonicalText, isShowable } from "@/lib/wys/content-gate";
import { type VisitCountableStop, visitCountableStop } from "@/lib/wys/visit";
import {
  progressEvidenceText,
  progressLabels,
  rulebookStorageText
} from "@/content/watch-your-step/progress";
import { wysScenarios } from "@/content/watch-your-step/scenarios";
import type { WysWeek } from "@/content/watch-your-step/types";
import { wysWeeks } from "@/content/watch-your-step/weeks";
import { CourseScreen } from "@/components/wys/CourseScreen";
import { ProgressView, type ProgressScenarioTitle } from "./ProgressView";

/**
 * `/watch-your-step/progress` (plan Phase 7, §5.2; mockup `5b` Progress;
 * WYS §13).
 *
 * The server half is deliberately thin. It resolves content — the two claims
 * the screen makes, the stop projection the counts derive from, and one gated
 * title per scenario — and hands them to one client component, because every
 * number on the screen comes from `wys:v1` and §7.3 forbids reading that during
 * render.
 *
 * STATIC. No `generateStaticParams`, no dynamic segment, no learner value in
 * the URL or the title (§8.5): the route builds `○`.
 *
 * NO REDIRECT. §5.4 puts the course's ONE state-dependent redirect on
 * `/watch-your-step/today` and requires Plan and Progress to prefer honest
 * empty states — four tiles reading 0 and a rulebook with nothing in it is a
 * true rendering of a browser that has done nothing, and it is reachable in one
 * tap with no local state.
 *
 * WHY THE PROPS ARE PROJECTIONS AND NOT RECORDS. Props of a client component
 * are serialised into the RSC payload, which ships inside the HTML and is
 * public page source. Passing `wysWeeks` whole would publish every draft stop
 * title and purpose; passing a blocked `GatedContent` whole would publish the
 * draft scenario title that `RENDER_MARKED_DRAFT` exists to withhold. So the
 * stops are projected to the three structural fields the visit derivation
 * needs, and `gateProse` itself empties the prose of anything the policy blocks
 * (`lib/wys/content-gate.ts`, `withoutBlockedProse`) — the label travels, the
 * words do not. That rule used to live here as a local `withheldTextRemoved`;
 * the gate is the one place it can be true for every surface at once.
 */

export const metadata: Metadata = {
  title: "Progress - BenChanTech",
  alternates: { canonical: "/watch-your-step/progress" }
};

export default function WatchYourStepProgressPage() {
  // Widened through the declared type so the projection is checked against
  // `WysWeek` rather than against the const literal.
  const weeks: readonly WysWeek[] = wysWeeks;

  // `stops.length` is `weeks.length` — the derived stop count (plan §6.9), which
  // is what the first tile's "of 9" renders. The number is never typed.
  const stops: VisitCountableStop[] = weeks.map(visitCountableStop);

  // One gated title per scenario. Under Q21's default every scenario is
  // `draft` + `IMPLEMENTATION_PLACEHOLDER`, so each of these resolves to
  // `blocked` and the judgment row renders "Implementation placeholder — not
  // Ben's words" where the artboard draws "Declining a client meeting". That is
  // the ratified state, not a defect: one constant flips it.
  const scenarioTitles: ProgressScenarioTitle[] = wysScenarios.map((scenario) => ({
    scenarioId: scenario.id,
    content: gateProse("fictional-scenario", scenario, scenario.title)
  }));

  const lead = gatedCanonicalText(progressEvidenceText, "short");
  const storageNote = gatedCanonicalText(rulebookStorageText, "short");

  // Both records are `published` + `BEN_APPROVED`, so both resolve; the throw is
  // a build-time failure if a status ever changes underneath this screen rather
  // than a silently empty heading.
  if (!lead || !storageNote) {
    throw new Error("Progress copy is not renderable — check status and origin.");
  }

  return (
    <CourseScreen title={progressLabels.screenTitle}>
      <ProgressView
        stops={stops}
        lead={lead}
        storageNote={storageNote}
        scenarioTitles={scenarioTitles}
      />
    </CourseScreen>
  );
}
