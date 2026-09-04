import type { Metadata } from "next";
import type { AnyCanonicalText, CanonicalTextVariantKey } from "@/lib/canonical-text";
import { type GatedContent, gateCanonical, gateProse, gatedCanonicalText } from "@/lib/wys/content-gate";
import { claimById } from "@/content/claims";
import { lessonZeroCompletionText } from "@/content/canonical/judgment-framework";
import { POSTURE_OPTIONS, POSTURE_QUESTION, POSTURE_QUESTION_NOTE } from "@/content/watch-your-step/config";
import { planIntro, wysLabels } from "@/content/watch-your-step/copy";
import { judgeLabels } from "@/content/watch-your-step/judge";
import { wysCadenceOptions, wysTimeBudgetOptions } from "@/content/watch-your-step/plan";
import {
  LESSON_ZERO_JUDGMENT_ID,
  LESSON_ZERO_SCENARIO_ID,
  lessonZeroDataNeverText,
  lessonZeroDataNotSentText,
  lessonZeroDataSentText,
  lessonZeroDataStaysText,
  lessonZeroHabitGlossText,
  lessonZeroHabitText,
  lessonZeroHumanSourceText,
  lessonZeroIntentText,
  lessonZeroPlanPreviewText,
  lessonZeroRuntimeText,
  lessonZeroSourceSlot,
  lessonZeroTimeDepthText
} from "@/content/watch-your-step/lesson-zero";
import { wysJudgmentById } from "@/content/watch-your-step/judgments";
import { wysScenarioById } from "@/content/watch-your-step/scenarios";
import { stopDisplayName } from "@/content/watch-your-step/tabs";
import type { WysWeek } from "@/content/watch-your-step/types";
import { wysWeeks } from "@/content/watch-your-step/weeks";
import {
  type LessonZeroContent,
  type LessonZeroStopRow,
  LessonZeroFlow
} from "@/components/wys/LessonZero/LessonZeroFlow";

/**
 * Lesson Zero (plan Phase 7, §5.4; WYS §9; mockup 5a).
 *
 * A SERVER COMPONENT THAT GATES, AND A CLIENT COMPONENT THAT STEPS. Every
 * string the flow can render is resolved here, at build time, through
 * `lib/wys/content-gate.ts` — so an unlabelled `(surfaceKind, origin)` pair or
 * an unwritten variant fails `next build` loudly instead of rendering a blank
 * label into a static page (§6.3). What crosses into the client is
 * `GatedContent`: the prose, its policy and its computed label as one object,
 * which is the §6.2 guarantee carried across the boundary rather than dropped
 * at it.
 *
 * The route is `○ (Static)`. There is no dynamic segment, no `searchParams`,
 * no reading of `wys:v1` during render, and the step index lives in React state
 * inside `LessonZeroFlow` — which is what keeps a posture choice, a cadence or
 * an exercise answer out of `page_location` and therefore out of GA4 (§8.5).
 *
 * NOTHING HERE FILLS A SLOT. Step 3 renders `lessonZeroSourceSlot`, a
 * `WysBenSlot` whose props accept a label and a description of the awaited
 * asset and no body at all (§6.4).
 */

export const metadata: Metadata = {
  title: "Lesson Zero - BenChanTech",
  alternates: { canonical: "/watch-your-step/start" }
};

/**
 * The canonical record a screen cannot do without.
 *
 * `gatedCanonicalText` returns null for anything blocked, awaiting or missing,
 * which is the right answer for an optional line. These are not optional: a
 * missing variant here means Lesson Zero would render a screen with a hole in
 * it, so it throws at build time and the build fails with the record's id.
 * A BLOCKED record still comes back — blocked is a rendering state, not an
 * error, and `GatedLine` renders its provenance label in place of the prose.
 */
function requireText(record: AnyCanonicalText, variant: CanonicalTextVariantKey): GatedContent {
  const gate = gateCanonical(record, variant);
  if (gate.kind !== "text") {
    throw new Error(`Lesson Zero requires the ${variant} variant of "${record.id}" (it is ${gate.kind}).`);
  }
  return gate.content;
}

export default function LessonZeroPage() {
  const scenario = wysScenarioById(LESSON_ZERO_SCENARIO_ID);
  const judgment = wysJudgmentById(LESSON_ZERO_JUDGMENT_ID);

  // Structure, never the draft stop title (§6.9, and the same rule the per-stop
  // route follows): "Lesson 0", "Stop A"… plus the two tags the `5b` Plan
  // artboard draws, which are states rather than titles.
  const weeks: readonly WysWeek[] = wysWeeks;
  const stops: LessonZeroStopRow[] = weeks.map((week, index) => {
    const terminal = index === weeks.length - 1;
    return {
      id: week.id,
      name: stopDisplayName(week),
      tag: week.offSite ? wysLabels.offSiteTag : terminal ? wysLabels.terminalTag : undefined,
      terminal
    };
  });

  const runtimeSentences = [
    gatedCanonicalText(claimById("zero-ai"), "inline"),
    gatedCanonicalText(claimById("ai-assisted-ben-approved"), "inline")
  ].filter((sentence): sentence is GatedContent => sentence !== null);

  const content: LessonZeroContent = {
    intent: requireText(lessonZeroIntentText, "short"),

    postureQuestion: POSTURE_QUESTION,
    postureNote: POSTURE_QUESTION_NOTE,
    postureOptions: POSTURE_OPTIONS.map((option) => ({ id: option.id, label: option.label })),
    postureFootnote: gatedCanonicalText(claimById("localStorage"), "inline"),

    humanSource: requireText(lessonZeroHumanSourceText, "short"),
    sourceSlot: {
      label: lessonZeroSourceSlot.label,
      awaitedAsset: lessonZeroSourceSlot.awaitedAsset
    },

    habit: requireText(lessonZeroHabitText, "short"),
    habitGloss: requireText(lessonZeroHabitGlossText, "short"),

    exercise: {
      scenarioId: scenario.id,
      fictionalPill: wysLabels.fictionalPill,
      setting: gateProse("fictional-scenario", scenario, scenario.setting),
      decisionMoment: gateProse("fictional-scenario", scenario, scenario.decisionMoment),
      choices: scenario.choices.map((choice) => ({
        key: choice.key,
        label: gateProse("fictional-scenario", scenario, choice.label)
      })),
      commitLabel: judgeLabels.commit,
      resetLabel: judgeLabels.reset,
      judgment: {
        surfaceTitle: wysLabels.judgmentSurfaceTitle,
        slotState: wysLabels.judgmentSlotState,
        origin: judgment.origin,
        content: gateProse("judgment", judgment, judgment.call)
      }
    },

    runtimeSentences,
    runtimeNote: requireText(lessonZeroRuntimeText, "short"),

    cadenceOptions: wysCadenceOptions.map((option) => ({ id: option.id, label: option.optionLabel })),
    timeOptions: wysTimeBudgetOptions.map((option) => ({ id: option.id, label: option.optionLabel })),
    timeDepth: requireText(lessonZeroTimeDepthText, "short"),
    dataStays: requireText(lessonZeroDataStaysText, "short"),
    dataSent: requireText(lessonZeroDataSentText, "short"),
    dataNotSent: requireText(lessonZeroDataNotSentText, "short"),
    dataNever: requireText(lessonZeroDataNeverText, "short"),

    planIntro: planIntro(),
    planPreview: requireText(lessonZeroPlanPreviewText, "short"),
    stops,
    completion: requireText(lessonZeroCompletionText, "short")
  };

  return <LessonZeroFlow content={content} />;
}
