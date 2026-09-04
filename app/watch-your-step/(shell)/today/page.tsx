import type { Metadata } from "next";
import { courseTabs } from "@/content/watch-your-step/tabs";
import { judgeLabels } from "@/content/watch-your-step/judge";
import { CourseScreen } from "@/components/wys/CourseScreen";
import { GatedText } from "@/components/wys/GatedText";
import { JudgeCard } from "@/components/wys/JudgeCard";
import { PhasePills } from "@/components/wys/PhasePills";
import { ScenarioCard } from "@/components/wys/ScenarioCard";
import { StopStartTelemetry } from "@/components/wys/StopStartTelemetry";
import { VisitCounter } from "@/components/wys/VisitCounter";
import { CarryCard } from "./CarryCard";
import { CurrentStopGate } from "./CurrentStopGate";
import { OnboardingRedirect } from "./OnboardingRedirect";
import { TimeBudgetNote } from "./TimeBudgetNote";
import { WatchCard } from "./WatchCard";
import { todayStopViews } from "./view";
import styles from "./today.module.css";

/**
 * Today — the daily loop (plan Phase 7; WYS §10; mockup 5b, dc.html:78-96).
 *
 * WATCH → TRY → JUDGE → CARRY, for the stop the learner is actually on. The
 * artboard's four blocks in the artboard's order: the header with its derived
 * "Stop A · visit 1 of 3", the phase pills, the grey WATCH card, the white
 * 1.5px card that is **the only bordered container on the screen** because a
 * border here means a live decision surface (§4.8), and the teal CARRY card.
 *
 * ONE URL, MANY LEARNERS, NO SERVER STATE. Today is a single static route that
 * has to show a different stop to different people, and the stop is derived
 * from `wys:v1`, which §7.3 forbids reading during render. So the loop is
 * SERVER-RENDERED once per stop and `CurrentStopGate` — a client component that
 * receives `children` and never content — emits exactly one of them. That keeps
 * the route prerendered (`○`, zero `ƒ`, §5.3), keeps the curriculum out of the
 * client bundle, and keeps every learner's server HTML identical, which is the
 * only version of "no server-side learner state" that a static host can hold.
 *
 * WHICH STOP: `./current-stop.ts`, derived from the same completed ids the
 * visit counter reads. Before local state loads, and for a learner who has just
 * finished Lesson Zero, that is the first lettered stop — which is what the
 * artboard draws.
 *
 * THE COMMIT IS INK, NOT TEAL (Q17, ratified). `5b` fills Today's Commit pill
 * teal; every other primary pill in the approved set is ink, and `ActionPill`
 * standardises on ink enabled / `rgba(22,32,43,.25)` disabled. Reported as a
 * deliberate deviation from `5b`.
 *
 * WHAT IS DELIBERATELY ABSENT:
 *
 *  - **No distribution card.** `4a`'s hero draws the 18/61/21 split with its
 *    "Example numbers" caption; Today's artboard draws none, the first-party
 *    counter is off (Q12), and inventing a second set of illustrative numbers
 *    for a second scenario is exactly the claim (packet: Proposition K) forbids.
 *  - **No continue pill after commit.** The CARRY card is already the next move
 *    and it is on the screen; a second route out would be a second answer to one
 *    question.
 *  - **No streak, no score, no percentage, no "behind", no guilt.** Nothing on
 *    this screen can compute a deficit: the derivation returns a stop and a
 *    clamped position, never a number of missed days (WYS §12, §13).
 *  - **No chat, no microphone, no free text, no upload, no account.** The only
 *    inputs on the screen are three choice buttons, a Commit and a mark.
 */

export const metadata: Metadata = {
  title: "Today - BenChanTech",
  alternates: { canonical: "/watch-your-step/today" }
};

const TODAY_HREF = "/watch-your-step/today";

/**
 * The screen's name, from the tab inventory rather than typed here.
 *
 * "Today" is the tab label and the screen title — one node, two presentations
 * (§6.8), so the page reads it off `courseTabs` instead of becoming a third
 * place the word is written.
 */
function todayTitle(): string {
  const tab = courseTabs.find((entry) => entry.href === TODAY_HREF);
  if (!tab) throw new Error(`No course tab for "${TODAY_HREF}".`);
  return tab.label;
}

export default function TodayPage() {
  const views = todayStopViews();
  const fallbackId = views[0]?.id;

  return (
    <>
      <OnboardingRedirect />
      <CourseScreen
        title={todayTitle()}
        meta={views.map((view) => (
          <CurrentStopGate key={view.id} stopId={view.id} fallback={view.id === fallbackId}>
            <VisitCounter stop={view.visitStop} prefix={view.name} />
          </CurrentStopGate>
        ))}
        lead={
          <>
            {views.map((view) => (
              <CurrentStopGate key={view.id} stopId={view.id} fallback={view.id === fallbackId}>
                <GatedText content={view.title} />
              </CurrentStopGate>
            ))}
            <TimeBudgetNote />
          </>
        }
      >
        <PhasePills active="Watch" />
        {views.map((view) => (
          <CurrentStopGate key={view.id} stopId={view.id} fallback={view.id === fallbackId}>
            <StopStartTelemetry stop={view.visitStop} />
            <div className={styles.stack}>
              <WatchCard lead={view.watchLead} />
              {view.judge ? (
                <ScenarioCard
                  pill={view.judge.pill}
                  setting={view.judge.setting}
                  decisionMoment={view.judge.decisionMoment}
                >
                  {/*
                    The TRY card renders either way. Only the interactive half
                    is conditional: a scenario whose prose is withheld has no
                    readable options to choose between, and drawing four bare
                    draft labels under a line that says the words are missing
                    would be the §6.2 failure exactly. `view.judge.exercise` is
                    null under Q21's default, and the card shows the label.
                  */}
                  {view.judge.exercise ? (
                    <JudgeCard
                      scenarioId={view.judge.scenarioId}
                      choices={view.judge.exercise.choices}
                      commitLabel={judgeLabels.commit}
                      resetLabel={judgeLabels.reset}
                      judgment={view.judge.exercise.judgment}
                      note={view.judge.exercise.note}
                      breakpoint="mobile"
                    />
                  ) : null}
                </ScenarioCard>
              ) : null}
              {view.carry ? (
                <CarryCard
                  behavior={view.carry.behavior}
                  leave={view.carry.leave}
                  stop={view.visitStop}
                  carryId={view.carry.carryId}
                />
              ) : null}
            </div>
          </CurrentStopGate>
        ))}
      </CourseScreen>
    </>
  );
}
