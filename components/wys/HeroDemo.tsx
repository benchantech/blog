import { allShowable, gateProse, gatedCanonicalText } from "@/lib/wys/content-gate";
import { judgeCommitMethodText, judgeLabels } from "@/content/watch-your-step/judge";
import { wysLabels } from "@/content/watch-your-step/copy";
import { heroDemoDistribution, landingLabels } from "@/content/watch-your-step/landing";
import { wysJudgments } from "@/content/watch-your-step/judgments";
import { wysScenarios } from "@/content/watch-your-step/scenarios";
import type { WysJudgment, WysScenario } from "@/content/watch-your-step/types";
import { CardHeader, CardShell } from "@/components/ui/CardShell";
import { Pill } from "@/components/ui/Pill";
import { ProvenanceMono } from "@/components/provenance/ProvenanceMono";
import { cx } from "@/components/provenance/cx";
import { JudgeCard } from "./JudgeCard";
import { ProvenanceMarks } from "./ProvenanceMarks";
import styles from "./wys-primitives.module.css";

/**
 * The `4a` live hero demo (plan Phase 10, Q3; mockup 4a dc.html:333-359 desktop,
 * dc.html:441-459 phone).
 *
 * ONE COMPONENT, ONE CONTENT OBJECT, TWO URLS. Q3 is ratified: `/watch-your-step`
 * is the canonical owner of the pitch and `/` mounts **this same component bound
 * to the same content object** as an explicit reference — not a second copy of
 * the text. So the scenario, the judgment, the labels and the illustrative split
 * are looked up HERE, once, from `content/watch-your-step/*`, and neither page
 * passes prose in. A page can choose the breakpoint and nothing else.
 *
 * WHAT IT IS BOUND TO: `scn-client-meeting`, the scenario (WYS §35 decision 9)
 * and the artboards put first, and its `jdg-client-meeting` judgment. Both are
 * `draft` + `IMPLEMENTATION_PLACEHOLDER` (handoff README bucket 3), so under
 * Q21's ratified default (`RENDER_MARKED_DRAFT === false`) the gate blocks their
 * prose and the card renders its withheld state: the pill, the provenance label
 * saying whose words are missing, and no exercise. That is the ratified state,
 * not a defect — one constant flips it and no component changes.
 *
 * THE EXERCISE RUNS ONLY WHEN THE SCENARIO'S OWN PROSE MAY RENDER. Choice
 * labels are bare strings on their way to `ChoiceRow`, so drawing them under a
 * line that says the words are withheld would publish exactly what the label
 * says is missing (`allShowable`, and the reason it exists).
 *
 * THE DISTRIBUTION IS INSEPARABLE FROM ITS CAPTION (§6.5, Q11). The numbers and
 * the "Example numbers" sentence are one content object, they are gated
 * together, and `DistributionBars` takes the caption as a required prop — so
 * there is no code path anywhere that renders 18/61/21 bare.
 *
 * TWO BREAKPOINTS, ONE RECORD (§6.8 collapse 1). `shortForm` and `shortLabel`
 * are the phone's presentations of the same scenario, and `shortCall` is the
 * phone's presentation of the same judgment. Never a second record.
 *
 * R9 SAFE-DIRECTION OVERRIDES, all three ratified and carried by the shared
 * primitives rather than by this file: the `DraftMark` renders on both
 * breakpoints, the distribution caption and its "totals only" label render on
 * both, and Reset renders on both. The `4a` phone omits all three; an omitted
 * provenance mark and an unreachable state transition are defects, not designs.
 */

const scenarios: readonly WysScenario[] = wysScenarios;
const judgments: readonly WysJudgment[] = wysJudgments;

/** Origins that may be attributed to Ben. Everything else keeps the slot state. */
const BEN_ORIGINS: readonly string[] = ["BEN_AUTHORED", "BEN_APPROVED", "BEN_AUTHORED_VARIATION"];

const HERO_SCENARIO_ID = heroDemoDistribution.scenarioId;

function heroScenario(): WysScenario {
  const record = scenarios.find((entry) => entry.id === HERO_SCENARIO_ID);
  if (!record) throw new Error(`The hero demo is bound to "${HERO_SCENARIO_ID}", which no longer exists.`);
  return record;
}

function heroJudgment(scenario: WysScenario): WysJudgment {
  const judgmentId = scenario.judgmentIds[0];
  const record = judgments.find((entry) => entry.id === judgmentId);
  if (!record) throw new Error(`Scenario "${scenario.id}" names judgment "${judgmentId}", which does not exist.`);
  return record;
}

export function HeroDemo({ breakpoint = "desktop" }: { breakpoint?: "desktop" | "mobile" }) {
  const mobile = breakpoint === "mobile";
  const scenario = heroScenario();
  const judgment = heroJudgment(scenario);

  const settingText = mobile ? (scenario.shortForm?.setting ?? scenario.setting) : scenario.setting;
  const decisionText = mobile
    ? (scenario.shortForm?.decisionMoment ?? scenario.decisionMoment)
    : scenario.decisionMoment;

  const setting = gateProse("fictional-scenario", scenario, settingText);
  const decisionMoment = gateProse("fictional-scenario", scenario, decisionText);
  const call = gateProse("judgment", judgment, mobile ? (judgment.shortCall ?? judgment.call) : judgment.call);
  const caption = gateProse("general", heroDemoDistribution, heroDemoDistribution.caption);

  const runnable = allShowable(setting, decisionMoment);
  const showSplit = allShowable(caption);

  /**
   * The pre-commit note is the DESKTOP artboard's, and only the desktop's.
   *
   * `4a` puts "You commit before you see anything. That's the whole method."
   * under the Commit pill at 1280 (dc.html:341) and draws nothing there at 390
   * (dc.html:452). That omission is not one of the three R9 safe-direction
   * overrides — it removes no provenance mark and makes no state transition
   * unreachable — so R1 governs and the artboards are followed as drawn.
   */
  const note = mobile ? null : gatedCanonicalText(judgeCommitMethodText, "short");

  return (
    <CardShell fill="live" size={mobile ? "default" : "demo"}>
      {mobile ? (
        <p className={styles.scenarioPillRow}>
          <Pill variant="status" size="sm">
            {wysLabels.fictionalPill}
          </Pill>
        </p>
      ) : (
        <CardHeader
          left={
            <Pill variant="status" size="sm">
              {landingLabels.demoPill}
            </Pill>
          }
          right={landingLabels.demoMeta}
        />
      )}

      {runnable ? (
        <p className={cx(styles.demoBody, mobile && styles.demoBodyMobile)}>
          {setting.text} <b>{decisionMoment.text}</b>
        </p>
      ) : (
        <div className={styles.demoMarks}>
          <ProvenanceMono>{setting.label}</ProvenanceMono>
        </div>
      )}

      {runnable ? (
        <div className={styles.demoMarks}>
          <ProvenanceMarks content={setting} />
        </div>
      ) : null}

      {runnable ? (
        <JudgeCard
          /* `4a` draws the hero demo's rows white with a 1.5px border, not the
           * grey `5a`/`5b` resting fill (handoff README, Home > hero). */
          fill="white"
          scenarioId={scenario.id}
          choices={scenario.choices.map((choice) => ({
            key: choice.key,
            label: mobile ? (choice.shortLabel ?? choice.label) : choice.label
          }))}
          commitLabel={judgeLabels.commit}
          resetLabel={judgeLabels.reset}
          judgment={{
            surfaceTitle: wysLabels.judgmentSurfaceTitle,
            slotState: BEN_ORIGINS.includes(judgment.origin) ? undefined : wysLabels.judgmentSlotState,
            origin: judgment.origin,
            content: call
          }}
          note={note ?? undefined}
          distribution={
            showSplit
              ? {
                  slices: heroDemoDistribution.slices,
                  caption: caption.text,
                  heading: judgeLabels.distributionHeading,
                  meta: judgeLabels.distributionMeta
                }
              : undefined
          }
          continueHref={landingLabels.startCtaHref}
          continueLabel={landingLabels.continueLabel}
          breakpoint={breakpoint}
        />
      ) : null}
    </CardShell>
  );
}
