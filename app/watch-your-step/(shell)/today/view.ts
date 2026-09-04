/**
 * What Today renders for one stop (plan Phase 7; mockup 5b dc.html:78-96).
 *
 * A view MODEL, built on the server from typed content records, so `page.tsx`
 * stays a layout and every content decision — which scenario, which judgment,
 * which carry — is made in one readable place.
 *
 * EVERY STRING ARRIVES GATED. Nothing here returns a bare sentence: prose
 * leaves this module as `GatedContent` from `lib/wys/content-gate.ts`, which is
 * the only sanctioned way to get text out of a content record (§6.2), so no
 * screen can render a scenario, a judgment or a carry without the label that
 * says who wrote it. Under Q21's ratified default almost every one of them is
 * `blocked` and the screen shows the label in place of the prose. That is the
 * ratified state, not a defect: one constant in `lib/content-status.ts` flips
 * the whole course when Ben rules, and no `status` field is edited here.
 *
 * WITHHELD PROSE IS ALSO STRIPPED, not merely unrendered. `JudgeCard` is a
 * client component, so anything handed to it is serialized into the page's
 * flight payload — where "the words are not in the DOM" would quietly stop
 * being true for blocked material. That stripping happens inside `gateProse`
 * itself (`lib/wys/content-gate.ts`, `withoutBlockedProse`), so every gated
 * value in this file arrives already redacted and no screen has to remember.
 * It is a redaction, never a construction: the policy and the branded label
 * come through untouched, and nothing in this file can mint a `GatedContent`.
 */

import type { GatedContent } from "@/lib/wys/content-gate";
import { allShowable, gateProse, gatedCanonicalText } from "@/lib/wys/content-gate";
import type { OriginFor } from "@/lib/content-status";
import { type VisitCountableStop, visitCountableStop } from "@/lib/wys/visit";
import type { WysCarry, WysJudgment, WysScenario, WysWeek } from "@/content/watch-your-step/types";
import { carryThenLeaveText, disagreementText, wysLabels } from "@/content/watch-your-step/copy";
import { todayCoreScenarioId, todayWatchLeadText } from "@/content/watch-your-step/today";
import { wysCarries } from "@/content/watch-your-step/carries";
import { wysJudgments } from "@/content/watch-your-step/judgments";
import { wysScenarios } from "@/content/watch-your-step/scenarios";
import { stopDisplayName } from "@/content/watch-your-step/tabs";
import { todayStops } from "./current-stop";

/** Widened from the `as const` literals to the interfaces, as the tests do. */
const scenarios: readonly WysScenario[] = wysScenarios;
const judgments: readonly WysJudgment[] = wysJudgments;
const carries: readonly WysCarry[] = wysCarries;

/** Origins that may be attributed to Ben. Everything else keeps the slot state. */
const BEN_ORIGINS: readonly string[] = ["BEN_AUTHORED", "BEN_APPROVED", "BEN_AUTHORED_VARIATION"];

export interface TodayJudgeView {
  scenarioId: string;
  pill: string;
  setting: GatedContent;
  decisionMoment: GatedContent;
  /**
   * The interactive half — choices, judgment and the disagreement note.
   *
   * `null` when the scenario's own prose may not render. `choices[].label` is a
   * BARE STRING (`ChoiceRow` renders it directly), so it cannot be withheld the
   * way `setting` is: the only honest states are the whole exercise or none of
   * it. The same shape Practice serialises, for the same reason.
   */
  exercise: {
    choices: { key: string; label: string }[];
    judgment: {
      surfaceTitle: string;
      slotState?: string;
      origin: OriginFor<"judgment">;
      content: GatedContent;
    };
    note?: GatedContent;
  } | null;
}

export interface TodayCarryView {
  carryId: string;
  behavior: GatedContent;
  leave: GatedContent | null;
}

export interface TodayStopView {
  id: string;
  /** "Stop A" — derived structure, never the draft title (§6.9, WYS §11). */
  name: string;
  /** Id and cadence paths only: what the derivation needs, and no prose. */
  visitStop: VisitCountableStop;
  /** The stop's own scaffold title, gated. Withheld while Q21's default holds. */
  title: GatedContent;
  /** The WATCH caption. Approved artboard copy, so it renders. */
  watchLead: GatedContent | null;
  /** Absent for a stop with no scenario bank — stop F is off-site (WYS §15.2). */
  judge: TodayJudgeView | null;
  /** Absent only if a stop declares no carry, which none does today. */
  carry: TodayCarryView | null;
}

function judgeViewFor(week: WysWeek): TodayJudgeView | null {
  const scenarioId = todayCoreScenarioId(week);
  if (scenarioId === null) return null;
  const scenario = scenarios.find((record) => record.id === scenarioId);
  if (!scenario) return null;

  const judgmentId = scenario.judgmentIds[0];
  const judgment = judgments.find((record) => record.id === judgmentId);
  if (!judgment) return null;

  const call = gateProse("judgment", judgment, judgment.call);
  const note = gatedCanonicalText(disagreementText, "short");
  const setting = gateProse("fictional-scenario", scenario, scenario.setting);
  const decisionMoment = gateProse("fictional-scenario", scenario, scenario.decisionMoment);

  // The exercise runs only when the scenario's own prose may render. Choice
  // labels are bare strings on their way to `ChoiceRow`, so a withheld scenario
  // that still drew its four options would publish the exact words the
  // provenance line above them says are missing (`allShowable`, and the reason
  // it exists). Under Q21's ratified default this is `null` for every scenario;
  // the TRY card still renders, saying whose words it is waiting for.
  const runnable = allShowable(setting, decisionMoment);

  return {
    scenarioId: scenario.id,
    pill: wysLabels.fictionalPill,
    setting,
    decisionMoment,
    exercise: runnable
      ? {
          // The artboard draws the full labels on Today; `shortLabel` is the 4a
          // phone hero's presentation of the same choice, not this screen's.
          choices: scenario.choices.map((choice) => ({ key: choice.key, label: choice.label })),
          judgment: {
            surfaceTitle: wysLabels.judgmentSurfaceTitle,
            slotState: BEN_ORIGINS.includes(judgment.origin) ? undefined : wysLabels.judgmentSlotState,
            origin: judgment.origin,
            content: call
          },
          note: note === null ? undefined : note
        }
      : null
  };
}

function carryViewFor(week: WysWeek): TodayCarryView | null {
  const carryId = week.carryIds[0];
  const carry = carries.find((record) => record.id === carryId);
  if (!carry) return null;
  return {
    carryId: carry.id,
    behavior: gateProse("general", carry, carry.behavior),
    leave: gatedCanonicalText(carryThenLeaveText, "short")
  };
}

export function todayStopViews(): TodayStopView[] {
  return todayStops().map((week) => ({
    id: week.id,
    name: stopDisplayName(week),
    visitStop: visitCountableStop(week),
    title: gateProse("general", week, week.title),
    watchLead: gatedCanonicalText(todayWatchLeadText, "short"),
    judge: judgeViewFor(week),
    carry: carryViewFor(week)
  }));
}
