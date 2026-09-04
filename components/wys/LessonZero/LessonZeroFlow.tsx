"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { OriginFor } from "@/lib/content-status";
import type { GatedContent } from "@/lib/wys/content-gate";
import { isShowable } from "@/lib/wys/content-gate";
import { analyticsConsentGranted, trackWys } from "@/lib/wys/telemetry";
import type { WysCadence, WysTimeBudget } from "@/lib/wys/local-state";
import { WYS_DOMAINS } from "@/content/watch-your-step/domains";
import {
  type LessonZeroScreen,
  LESSON_ZERO_STEP_COUNT,
  lessonZeroCounterLabel,
  lessonZeroLabels,
  lessonZeroScreens
} from "@/content/watch-your-step/lesson-zero";
import { ActionPill } from "@/components/ui/ActionPill";
import { ChoiceList, ChoiceRow } from "@/components/ui/ChoiceRow";
import { Pill } from "@/components/ui/Pill";
import { ProgressRail } from "@/components/ui/ProgressRail";
import { BenSlot } from "@/components/provenance/BenSlot";
import { DraftMark } from "@/components/provenance/DraftMark";
import { ProvenanceMono } from "@/components/provenance/ProvenanceMono";
import { cx } from "@/components/provenance/cx";
import { JudgeCard } from "@/components/wys/JudgeCard";
import { ProvenanceMarks } from "@/components/wys/ProvenanceMarks";
import { useWysState } from "@/components/wys/useWysState";
import styles from "./lesson-zero.module.css";

/**
 * Lesson Zero — the fixed ten-step onboarding flow (plan Phase 7; WYS §9;
 * mockup 5a).
 *
 * ONE CLIENT COMPONENT FOR THE WHOLE FLOW, and the reason is the flow itself:
 * the step index, the three selections and the JUDGE machine are one piece of
 * state, and splitting them across a route per step would put the learner's
 * posture, cadence and time budget in `page_location` — which the preserved
 * GA4 config sends to GA4 on every navigation, outside `trackWys` and outside
 * its allowlist (§8.5). **Lesson Zero step state is a step INDEX and it never
 * leaves this component.**
 *
 * EIGHT SCREENS, TEN STEPS. `5a`'s third phone is a composite carrying cadence,
 * time and the data card, counted "7–9 of 10". The sequence in
 * `content/watch-your-step/lesson-zero.ts` is the spec's ten; the screens are
 * the artboard's eight. Neither is derived from the other by guesswork — both
 * are declared, and `tests/wys-lesson-zero.test.ts` checks that the screens
 * cover every step exactly once, in order.
 *
 * WHAT THIS COMPONENT NEVER RENDERS (WYS §9.2, enforced by test over this file
 * and its content module): a chat box, a microphone, a "tell me your
 * situation", an "ask anything", a free-text biography, company, job title,
 * family details, an email requirement, a full name, an exact age, a reason for
 * distrust, a psychological label, the superseded "I hate it" option, or any
 * diagnostic language. **There is no `<input>`, no `<textarea>` and no
 * `contentEditable` anywhere in the flow.** The only things a learner can do
 * here are pick from a closed vocabulary and move forward.
 *
 * WHAT IT WRITES: `onboarding.postureChoice`, `onboarding.cadence`,
 * `onboarding.timeBudget`, `onboarding.completed`, `startedAt` and
 * `lastOpenedAt` — every one of them a declared field with a declared value
 * domain, all of it through the serializer, none of it a sentence.
 *
 * WHAT IT SENDS: `wys_start` once when the flow mounts and
 * `wys_onboarding_complete` once when step 10 is reached. Both carry the event
 * name and nothing about the learner — not the posture, not the pace, not the
 * exercise answer. `trackWys` refuses anything else by construction, and it
 * refuses to send at all unless analytics consent was granted (Q7).
 *
 * NO RESUME, DELIBERATELY. The flow always opens at step 1. Remembering the
 * step would mean a new field in `wys:v1`, and §7.1 is explicit that the shape
 * does not grow — the visit counter is derived for the same reason. Ten short
 * steps is the whole cost of starting again.
 */

/* -------------------------------------------------------------------------- */
/* Props — everything is gated on the server and arrives already labelled      */
/* -------------------------------------------------------------------------- */

export interface LessonZeroOption {
  id: string;
  label: string;
}

export interface LessonZeroExercise {
  /** A declared scenario id; storage drops anything else (§7.2). */
  scenarioId: string;
  fictionalPill: string;
  setting: GatedContent;
  decisionMoment: GatedContent;
  choices: readonly { key: string; label: GatedContent }[];
  commitLabel: string;
  resetLabel: string;
  judgment: {
    surfaceTitle: string;
    slotState: string;
    origin: OriginFor<"judgment">;
    content: GatedContent;
  };
}

export interface LessonZeroStopRow {
  id: string;
  /** "Lesson 0", "Stop A" — derived structure, never the draft stop title. */
  name: string;
  /** "off-site" / "the end". Absent on the rest. */
  tag?: string;
  terminal: boolean;
}

export interface LessonZeroContent {
  intent: GatedContent;

  postureQuestion: string;
  postureNote: string;
  postureOptions: readonly LessonZeroOption[];
  /** `claims["localStorage"].inline` — "Stays in this browser. Never sent." */
  postureFootnote: GatedContent | null;

  humanSource: GatedContent;
  sourceSlot: { label: string; awaitedAsset: string };

  habit: GatedContent;
  habitGloss: GatedContent;

  exercise: LessonZeroExercise;

  /** The two disclosure-strip sentences, verbatim, from `content/claims.ts`. */
  runtimeSentences: readonly GatedContent[];
  runtimeNote: GatedContent;

  cadenceOptions: readonly LessonZeroOption[];
  timeOptions: readonly LessonZeroOption[];
  timeDepth: GatedContent;
  dataStays: GatedContent;
  dataSent: GatedContent;
  dataNotSent: GatedContent;
  dataNever: GatedContent;

  /** `planIntro()` — the count is derived from the data, never typed (§6.9). */
  planIntro: string;
  planPreview: GatedContent;
  stops: readonly LessonZeroStopRow[];
  /** (WYS §9.3) — the one thing someone who leaves must still have. */
  completion: GatedContent;
}

/* -------------------------------------------------------------------------- */
/* Local rendering helpers                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Prose that cannot appear without its provenance, at this flow's typography.
 *
 * `components/wys/GatedText.tsx` is the shared version and does exactly this at
 * 16px/1.45. Lesson Zero needs the same three states at four different sizes —
 * a 20px habit line on ink, a 16px lead, a 15px data line, a 14px note — so the
 * class comes in as a prop and the three states stay identical to the shared
 * component's: the words for `canon`, the words plus the label for `marked`,
 * and the label ALONE for `blocked`.
 */
function GatedLine({
  content,
  className,
  markClassName,
  tone = "light"
}: {
  content: GatedContent;
  className: string;
  markClassName?: string;
  tone?: "light" | "dark";
}) {
  if (!isShowable(content)) {
    return (
      <div className={className}>
        <ProvenanceMono tone={tone}>{content.label}</ProvenanceMono>
      </div>
    );
  }
  return (
    <>
      <p className={className}>{content.text}</p>
      <div className={markClassName ?? styles.marks}>
        <ProvenanceMarks content={content} tone={tone} />
      </div>
    </>
  );
}

/**
 * The BEFORE YOU START · DATA lines, whose approved form bolds the lead-in.
 *
 * The artboard writes "**Stays here:** your pace…" as one sentence with a bold
 * opening, so the record stores one sentence and the split happens at render —
 * the same treatment `components/DisclosureStrip.tsx` gives its first sentence.
 * Storing "Stays here:" separately would be two definitions of one line.
 */
function splitAtColon(text: string): { lead: string; rest: string } {
  const boundary = text.indexOf(":");
  if (boundary === -1) return { lead: "", rest: text };
  return { lead: text.slice(0, boundary + 1), rest: text.slice(boundary + 1).trim() };
}

function DataLine({ content }: { content: GatedContent }) {
  if (!isShowable(content)) {
    return (
      <div className={styles.dataLine}>
        <ProvenanceMono>{content.label}</ProvenanceMono>
      </div>
    );
  }
  const { lead, rest } = splitAtColon(content.text);
  return (
    <p className={styles.dataLine}>
      {lead ? <b>{lead}</b> : null} {rest}
    </p>
  );
}

/* -------------------------------------------------------------------------- */
/* Session guards — a module Set, never a third browser key                    */
/* -------------------------------------------------------------------------- */

/**
 * `wys_start` fires once per session and `wys_onboarding_complete` once per
 * completion. The guards are module-level booleans for the reason
 * `components/wys/StopStartTelemetry.tsx` gives at length: a `sessionStorage`
 * flag would be more precise across reloads and would ALSO be a third browser
 * key that `lib/wys/browser-keys.ts` would have to declare and the Data page
 * would have to list. A small overcount is a diagnostic imprecision; an
 * undeclared key is a broken promise about what this site stores.
 */
let startFired = false;
let completeFired = false;

/* -------------------------------------------------------------------------- */

export function LessonZeroFlow({ content }: { content: LessonZeroContent }) {
  const router = useRouter();
  const { loaded, state, update } = useWysState(WYS_DOMAINS);
  const [screenIndex, setScreenIndex] = useState(0);
  const [consentGranted, setConsentGranted] = useState(false);

  const screen: LessonZeroScreen = lessonZeroScreens[screenIndex];
  const isLast = screenIndex === lessonZeroScreens.length - 1;

  // (WYS §19.4) "The learner opens /watch-your-step/start step 1, once per
  // session." The event name and route_type; nothing about the learner.
  useEffect(() => {
    if (startFired) return;
    startFired = true;
    trackWys("wys_start", { route_type: "course" });
  }, []);

  // Q7's gate read once, after mount, never during render (§7.3). It starts
  // false so the first paint claims nothing is sent — the honest default, and
  // the one that matches the code for every visitor who has not opted in.
  useEffect(() => {
    setConsentGranted(analyticsConsentGranted());
  }, []);

  // Reaching step 10 is the completion condition: every step that asks the
  // learner anything is behind them, and step 10 is a preview with nothing to
  // answer. Flipping the flag on arrival rather than on departure also means a
  // learner who closes the tab on the last screen is counted as onboarded,
  // which is what (WYS §9.3) describes.
  useEffect(() => {
    if (!isLast || !loaded) return;
    if (!state.onboarding.completed) {
      update((current) => ({
        ...current,
        onboarding: { ...current.onboarding, completed: true },
        lastOpenedAt: new Date().toISOString()
      }));
    }
    if (!completeFired) {
      completeFired = true;
      trackWys("wys_onboarding_complete");
    }
    // `state.onboarding.completed` is deliberately not a dependency: the effect
    // must run when the last screen is reached and never loop on its own write.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLast, loaded]);

  function advance(): void {
    const now = new Date().toISOString();
    update((current) => ({
      ...current,
      startedAt: current.startedAt ?? now,
      lastOpenedAt: now
    }));
    setScreenIndex((index) => Math.min(index + 1, lessonZeroScreens.length - 1));
  }

  function choosePosture(id: string): void {
    update((current) => ({
      ...current,
      onboarding: { ...current.onboarding, postureChoice: id }
    }));
  }

  function chooseCadence(id: string): void {
    update((current) => ({
      ...current,
      onboarding: { ...current.onboarding, cadence: id as WysCadence }
    }));
  }

  function chooseTimeBudget(id: string): void {
    update((current) => ({
      ...current,
      onboarding: { ...current.onboarding, timeBudget: id as WysTimeBudget }
    }));
  }

  function finish(): void {
    router.push(lessonZeroLabels.startCourseHref);
  }

  return (
    <div className={styles.flow}>
      <div className={styles.head}>
        <Pill variant="status" size="sm">
          {lessonZeroLabels.flowName}
        </Pill>
        <p className={styles.counter}>{lessonZeroCounterLabel(screen)}</p>
      </div>
      <div className={styles.railWrap}>
        <ProgressRail
          step={screen.railStep}
          total={LESSON_ZERO_STEP_COUNT}
          label={lessonZeroLabels.progressLabel}
        />
      </div>

      {screen.id === "screen-intent" ? (
        <>
          <h1 className={styles.title}>{lessonZeroLabels.intentHeading}</h1>
          <GatedLine content={content.intent} className={styles.lead} />
          <div className={styles.actions}>
            <ActionPill variant="ink" full onClick={advance}>
              {lessonZeroLabels.continueLabel}
            </ActionPill>
          </div>
        </>
      ) : null}

      {screen.id === "screen-posture" ? (
        <>
          <h1 className={styles.title}>{content.postureQuestion}</h1>
          <p className={styles.lead}>{content.postureNote}</p>
          <div className={styles.postureList}>
            {content.postureOptions.map((option) => (
              <ChoiceRow
                key={option.id}
                fill="grey"
                selected={state.onboarding.postureChoice === option.id}
                onSelect={() => choosePosture(option.id)}
              >
                {option.label}
              </ChoiceRow>
            ))}
          </div>
          {content.postureFootnote ? (
            <p className={cx(styles.footnote, styles.footnoteTight)}>{content.postureFootnote.text}</p>
          ) : null}
          <p className={styles.footnote}>{lessonZeroLabels.postureSkipHint}</p>
          <div className={styles.actions}>
            <ActionPill variant="ink" full onClick={advance}>
              {lessonZeroLabels.continueLabel}
            </ActionPill>
          </div>
        </>
      ) : null}

      {screen.id === "screen-human-source" ? (
        <>
          <h1 className={styles.title}>{lessonZeroLabels.humanSourceHeading}</h1>
          <GatedLine content={content.humanSource} className={styles.lead} />
          <div className={styles.section}>
            <BenSlot
              label={content.sourceSlot.label}
              awaitedAsset={content.sourceSlot.awaitedAsset}
            />
          </div>
          <div className={styles.actions}>
            <ActionPill variant="ink" full onClick={advance}>
              {lessonZeroLabels.continueLabel}
            </ActionPill>
          </div>
        </>
      ) : null}

      {screen.id === "screen-first-habit" ? (
        <>
          <div className={styles.habitCard}>
            <p className={styles.habitEyebrow}>{lessonZeroLabels.firstHabitEyebrow}</p>
            <GatedLine content={content.habit} className={styles.habitLine} tone="dark" />
          </div>
          <GatedLine content={content.habitGloss} className={styles.lead} />
          <div className={styles.actions}>
            <ActionPill variant="ink" full onClick={advance}>
              {lessonZeroLabels.continueLabel}
            </ActionPill>
          </div>
        </>
      ) : null}

      {screen.id === "screen-exercise" ? (
        <>
          <div className={styles.habitCard}>
            <p className={styles.habitEyebrow}>{lessonZeroLabels.firstHabitEyebrow}</p>
            <GatedLine content={content.habit} className={styles.habitLine} tone="dark" />
          </div>
          <p className={styles.exercisePill}>
            <Pill variant="status" size="sm">
              {content.exercise.fictionalPill}
            </Pill>
          </p>
          <ExerciseBody exercise={content.exercise} />
          <div className={styles.actions}>
            <ActionPill variant="teal" full onClick={advance}>
              {lessonZeroLabels.continueLabel}
            </ActionPill>
          </div>
        </>
      ) : null}

      {screen.id === "screen-runtime" ? (
        <>
          <h1 className={styles.title}>{lessonZeroLabels.runtimeHeading}</h1>
          {content.runtimeSentences.map((sentence, index) => (
            <GatedLine key={index} content={sentence} className={styles.lead} />
          ))}
          <GatedLine content={content.runtimeNote} className={styles.lead} />
          <div className={styles.actions}>
            <ActionPill variant="ink" full onClick={advance}>
              {lessonZeroLabels.continueLabel}
            </ActionPill>
          </div>
        </>
      ) : null}

      {screen.id === "screen-pace-and-data" ? (
        <>
          <h2 className={styles.sectionHeading}>{lessonZeroLabels.cadenceHeading}</h2>
          <div className={styles.paceGrid}>
            {content.cadenceOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={state.onboarding.cadence === option.id}
                className={cx(
                  styles.paceOption,
                  state.onboarding.cadence === option.id && styles.paceOptionSelected
                )}
                onClick={() => chooseCadence(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <h2 className={styles.sectionHeading}>{lessonZeroLabels.timeHeading}</h2>
          <div className={cx(styles.paceGrid, styles.paceGridTight)}>
            {content.timeOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={state.onboarding.timeBudget === option.id}
                className={cx(
                  styles.paceOption,
                  state.onboarding.timeBudget === option.id && styles.paceOptionSelected
                )}
                onClick={() => chooseTimeBudget(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <GatedLine content={content.timeDepth} className={styles.paceNote} />

          <div className={styles.dataCard}>
            <p className={styles.dataEyebrow}>{lessonZeroLabels.dataEyebrow}</p>
            <div className={styles.dataLines}>
              <DataLine content={content.dataStays} />
              <DataLine content={consentGranted ? content.dataSent : content.dataNotSent} />
              <DataLine content={content.dataNever} />
            </div>
            <a className={styles.dataLink} href={lessonZeroLabels.dataPageHref}>
              <span>{lessonZeroLabels.dataPageLink}</span>
              <span aria-hidden="true">{lessonZeroLabels.dataPageArrow}</span>
            </a>
          </div>

          <div className={styles.actions}>
            <ActionPill variant="ink" full onClick={advance}>
              {lessonZeroLabels.showPlan}
            </ActionPill>
          </div>
        </>
      ) : null}

      {screen.id === "screen-plan-preview" ? (
        <>
          <h1 className={styles.title}>{lessonZeroLabels.planPreviewHeading}</h1>
          <p className={styles.lead}>{content.planIntro}</p>
          <ul className={styles.stopList}>
            {content.stops.map((stop) => (
              <li
                key={stop.id}
                className={cx(styles.stopRow, stop.terminal && styles.stopRowTerminal)}
              >
                <span>{stop.name}</span>
                {stop.tag ? <span className={styles.stopTag}>{stop.tag}</span> : null}
              </li>
            ))}
          </ul>
          <GatedLine content={content.planPreview} className={styles.lead} />
          <GatedLine content={content.timeDepth} className={styles.paceNote} />

          <div className={styles.takeaway}>
            <p className={styles.takeawayEyebrow}>{lessonZeroLabels.firstHabitEyebrow}</p>
            <GatedLine content={content.completion} className={styles.takeawayLine} tone="dark" />
          </div>

          <div className={styles.actions}>
            <ActionPill variant="ink" full onClick={finish}>
              {lessonZeroLabels.startCourse}
            </ActionPill>
          </div>
        </>
      ) : null}
    </div>
  );
}

/**
 * Step 5's exercise (mockup 5a, dc.html:39-49).
 *
 * NO BORDER, which is what the artboard draws: `5b` Today wraps its TRY/JUDGE
 * in the one bordered card on that screen because the screen has other content;
 * on `5a` the exercise IS the screen. R1.
 *
 * THE WITHHELD BRANCH IS THE SHIPPED ONE TODAY. Every scenario, choice label
 * and judgment in `content/watch-your-step/` is `draft` +
 * `IMPLEMENTATION_PLACEHOLDER`, and `RENDER_MARKED_DRAFT` is false (Q21,
 * ratified), so the gate resolves the setting to `blocked` and the exercise
 * renders its provenance label and its draft mark instead of prose. The JUDGE
 * machine is not rendered at all in that state, and that is deliberate: four
 * lettered options with no text is not a decision surface, and committing to
 * one would record an answer to a question nobody was shown. One constant flips
 * the whole thing back to the artboard.
 */
function ExerciseBody({ exercise }: { exercise: LessonZeroExercise }) {
  const showSetting = isShowable(exercise.setting);
  const showDecision = isShowable(exercise.decisionMoment);

  if (!showSetting) {
    return (
      <div className={styles.withheld}>
        <ProvenanceMono>{exercise.setting.label}</ProvenanceMono>
        <DraftMark variant="scenario" />
      </div>
    );
  }

  return (
    <>
      <p className={styles.scenarioBody}>{exercise.setting.text}</p>
      {showDecision ? (
        <p className={styles.scenarioDecision}>{exercise.decisionMoment.text}</p>
      ) : null}
      <div className={styles.exerciseChoices}>
        <JudgeCard
          scenarioId={exercise.scenarioId}
          choices={exercise.choices.map((choice) => ({
            key: choice.key,
            label: choice.label.text
          }))}
          commitLabel={exercise.commitLabel}
          resetLabel={exercise.resetLabel}
          judgment={exercise.judgment}
          breakpoint="mobile"
        />
      </div>
      <ProvenanceMarks content={exercise.setting} />
    </>
  );
}
