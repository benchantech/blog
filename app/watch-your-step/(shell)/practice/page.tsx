import type { Metadata } from "next";
import {
  appetiteExplanationText,
  fromMemoryPromptText,
  fromMemoryScratchNoticeText,
  practiceLabels,
  practiceLeadText,
  replayOptionsFor
} from "@/content/watch-your-step/practice";
import { wysLabels } from "@/content/watch-your-step/copy";
import { judgeLabels } from "@/content/watch-your-step/judge";
import { wysJudgmentById, type WysJudgmentId } from "@/content/watch-your-step/judgments";
import { wysScenarios } from "@/content/watch-your-step/scenarios";
import type { WysScenario } from "@/content/watch-your-step/types";
import {
  type GatedContent,
  gateProse,
  gatedCanonicalText,
  isShowable
} from "@/lib/wys/content-gate";
import { CourseScreen } from "@/components/wys/CourseScreen";
import { GatedText } from "@/components/wys/GatedText";
import { AppetiteCard } from "@/components/wys/AppetiteCard";
import { FromMemory } from "@/components/wys/FromMemory";
import { PracticeSection } from "@/components/wys/PracticeSection";
import { ReplayList, type ReplayCard } from "@/components/wys/ReplayList";

/**
 * Practice (plan Phase 7; WYS §14, §15.1, §21; mockup 5c, dc.html:152-176).
 *
 * Three sections, in the artboard's order: REPLAY, FROM MEMORY, and the
 * appetite card. One is deterministic re-practice, one is retrieval that never
 * leaves the page, and one is a single neutral signal. Nothing on this screen
 * generates anything, scores anything, or asks for anything about the learner.
 *
 * THE SERVER RENDERS THE MATERIAL; THE CLIENT RENDERS THE LEARNER. Every string
 * here comes out of `content/watch-your-step/` through the gate, at build time.
 * The three client components below hold exactly the state that cannot be
 * server-rendered: which scenarios this browser has judged, an ephemeral
 * scratch value, and one boolean. No `wys:v1` read happens during render
 * (§7.3), so this route prerenders as `○` with the rest of the course.
 *
 * WHAT CROSSES INTO THE CLIENT BUNDLE, and the one rule that governs it: a
 * scenario whose prose may not render is serialized with **no exercise at all**
 * (`exercise: null`) and with its title's `text` emptied. `GatedContent` carries
 * its `text` field even when `policy.kind === "blocked"` — harmless in a server
 * component, which simply does not print it, but a blocked string handed to a
 * client component would travel in the RSC payload and land in the document.
 * "The words are not in the DOM" has to mean the payload too, so the redaction
 * happens here, before the boundary. (Recorded as a substrate note in
 * docs/facelift-build-notes.md for the gate.)
 *
 * CONSEQUENCE UNDER Q21's RATIFIED DEFAULT, stated rather than discovered:
 * every scenario in the bank is `draft` + `IMPLEMENTATION_PLACEHOLDER`, so
 * `runnable` is false for all of them and REPLAY ships as labelled withheld
 * rows. The two deterministic modes, the invariant check, the telemetry point
 * and the replay counter are all built and wired; one constant flips them on.
 * FROM MEMORY and the appetite card are unaffected — their copy is approved
 * artboard text at `published`, so they render as canon today.
 */

export const metadata: Metadata = {
  title: `${practiceLabels.pageTitle} - BenChanTech`,
  alternates: { canonical: "/watch-your-step/practice" }
};

/**
 * A blocked record's words never cross the server/client boundary — and that
 * rule is enforced one layer down, in `gateProse` itself
 * (`lib/wys/content-gate.ts`, `withoutBlockedProse`), so every surface gets it
 * and no screen can forget it. What stays local here is the STRUCTURAL half:
 * a withheld scenario is serialised with `exercise: null`, so its choice keys,
 * its labels and its judgment never reach the payload in any form.
 */

/**
 * The replay rows for one scenario: one per mode `replayOptionsFor` declares.
 *
 * The exercise is attached only when the scenario's own setting may render.
 * That single condition is what keeps a withheld scenario's choice labels and
 * judgment body out of the browser entirely, rather than relying on each
 * component downstream to refuse to print them.
 */
function replayCardsFor(scenario: WysScenario): ReplayCard[] {
  const setting = gateProse("fictional-scenario", scenario, scenario.setting);
  const decisionMoment = gateProse("fictional-scenario", scenario, scenario.decisionMoment);
  const title = gateProse("fictional-scenario", scenario, scenario.title);
  const runnable = isShowable(setting);

  const judgmentId = scenario.judgmentIds[0] as WysJudgmentId | undefined;
  const judgment = judgmentId ? wysJudgmentById(judgmentId) : undefined;

  const exercise =
    runnable && judgment
      ? {
          pill: wysLabels.fictionalPill,
          setting,
          decisionMoment,
          choices: scenario.choices.map((choice) => ({ key: choice.key, label: choice.label })),
          commitLabel: judgeLabels.commit,
          resetLabel: judgeLabels.reset,
          judgment: {
            surfaceTitle: wysLabels.judgmentSurfaceTitle,
            slotState: wysLabels.judgmentSlotState,
            origin: judgment.origin,
            content: gateProse("judgment", judgment, judgment.call)
          }
        }
      : null;

  return replayOptionsFor(scenario).map((option) => ({
    id: option.id,
    scenarioId: option.scenarioId,
    mode: option.mode,
    tag: option.tag,
    title,
    exercise
  }));
}

export default function PracticePage() {
  const lead = gatedCanonicalText(practiceLeadText, "short");
  const prompt = gatedCanonicalText(fromMemoryPromptText, "short");
  const notice = gatedCanonicalText(fromMemoryScratchNoticeText, "short");
  const appetite = gatedCanonicalText(appetiteExplanationText, "short");

  const replayCards = wysScenarios.flatMap((scenario) => replayCardsFor(scenario));

  return (
    <CourseScreen
      title={practiceLabels.pageTitle}
      lead={lead ? <GatedText content={lead} /> : null}
    >
      <PracticeSection
        name={practiceLabels.replaySectionName}
        eyebrow={practiceLabels.replayEyebrow}
      >
        <ReplayList cards={replayCards} />
      </PracticeSection>

      <PracticeSection
        name={practiceLabels.fromMemorySectionName}
        eyebrow={practiceLabels.fromMemoryEyebrow}
      >
        {prompt && notice ? <FromMemory prompt={prompt} notice={notice} /> : null}
      </PracticeSection>

      <PracticeSection name={practiceLabels.appetiteSectionName} last>
        {appetite ? <AppetiteCard explanation={appetite} /> : null}
      </PracticeSection>
    </CourseScreen>
  );
}
