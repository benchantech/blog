"use client";

import { useState } from "react";
import type { OriginFor } from "@/lib/content-status";
import type { GatedContent } from "@/lib/wys/content-gate";
import type { ReplayMode } from "@/content/watch-your-step/practice";
import { practiceLabels } from "@/content/watch-your-step/practice";
import { WYS_DOMAINS } from "@/content/watch-your-step/domains";
import { trackWys } from "@/lib/wys/telemetry";
import { ActionPill } from "@/components/ui/ActionPill";
import { DashedSlot } from "@/components/provenance/DashedSlot";
import { ProvenanceMono } from "@/components/provenance/ProvenanceMono";
import { cx } from "@/components/provenance/cx";
import { JudgeCard, type JudgeChoice } from "./JudgeCard";
import { ScenarioCard } from "./ScenarioCard";
import { useWysState } from "./useWysState";
import styles from "./practice.module.css";

/**
 * REPLAY (plan Phase 7; WYS §14; mockup 5c dc.html:156-161).
 *
 * "Website v0 replay is deterministic and canonical-first." Two modes, both
 * authored: the scenario as written, and a Ben-authored canonical variant of it
 * where one exists. **No AI variation is generated anywhere in this component,
 * this route or this build** — the rows are built at BUILD TIME from
 * `replayOptionsFor()` and handed here as data.
 *
 * WHICH ROWS EXIST IS LEARNER STATE, SO IT IS CLIENT STATE. A replay is a
 * re-run of an exercise the learner has already judged; listing the whole
 * scenario bank would turn Practice into a browsable answer key and would show
 * a stateless visitor material they have not reached. The filter is therefore
 * `localJudgments` ∪ `progress.completedScenarioIds`, read through
 * `useWysState` — which means the server HTML and the first client render show
 * the EMPTY state (§7.3), and the rows appear on hydration. That is the same
 * bargain every state-dependent slot in this course makes, and it is why the
 * empty state below is a designed state rather than a fallback.
 *
 * WHAT A REPLAY DOES NOT DO:
 *  · It does not overwrite the kept judgment. `persist={false}` on `JudgeCard`
 *    is (WYS §14)'s requirement made structural — a replay is practice, not a
 *    revision, and Progress's "C → B · revised" row belongs to the real commit.
 *  · It sends no scenario id, no choice and no revision. `wys_replay`'s own
 *    decision row in `lib/wys/telemetry.ts` limits the exposure to "the event
 *    name", so it is fired bare. `JudgeCard`'s commit calls the aggregate
 *    adapter, which is disabled and has no endpoint in v0.
 *  · It shows no distribution. The 18/61/21 split is illustrative data drawn on
 *    the `4a` hero; there is nothing to show here and a fabricated number on a
 *    practice surface would be the §6.5 failure exactly.
 *
 * WHAT IT DOES RECORD: `progress.replayCounts[scenarioId] += 1`, a declared
 * `wys:v1` field whose keys the serializer checks against the scenario
 * vocabulary. That count is what Progress's "replay used" tile reads. It is a
 * count of a feature being used, not a score — nothing on any surface presents
 * it as an achievement, and §31 says to read it as a build-cost question.
 */

export interface ReplayExercise {
  /** `wysLabels.fictionalPill`. A claim about the exercise, not its content. */
  pill: string;
  setting: GatedContent;
  decisionMoment: GatedContent;
  choices: readonly JudgeChoice[];
  commitLabel: string;
  resetLabel: string;
  judgment: {
    surfaceTitle: string;
    slotState?: string;
    origin: OriginFor<"judgment">;
    content: GatedContent;
  };
}

export interface ReplayCard {
  /** `scenarioId:mode`. Stable across renders and legal as a React key. */
  id: string;
  scenarioId: string;
  mode: ReplayMode;
  /** "as authored" / "Ben variant", chosen by mode in the content module. */
  tag: string;
  /**
   * The row's own label — the scenario title, gated.
   *
   * When the record is blocked (every scenario, while `RENDER_MARKED_DRAFT` is
   * false) the page hands this over with `text: ""`, so the withheld words are
   * not in the RSC payload at all, and the row renders the provenance label.
   */
  title: GatedContent;
  /**
   * The exercise, or `null` when the scenario's prose may not render.
   *
   * `null` is the whole safety property: a withheld scenario's setting, choice
   * labels and judgment are never serialized into this client component, so
   * there is no path by which draft curriculum text reaches the browser.
   */
  exercise: ReplayExercise | null;
}

export function ReplayList({ cards }: { cards: readonly ReplayCard[] }) {
  const { loaded, state, update } = useWysState(WYS_DOMAINS);
  const [openId, setOpenId] = useState<string | null>(null);

  // Every scenario this learner has already judged, from the two places a
  // completion can land. `localJudgments` covers a commit (Q20 is ON);
  // `completedScenarioIds` covers the completion semantics (WYS §13).
  const met = new Set<string>([
    ...Object.keys(state.localJudgments ?? {}),
    ...state.progress.completedScenarioIds
  ]);
  const available = loaded ? cards.filter((card) => met.has(card.scenarioId)) : [];

  function toggle(card: ReplayCard): void {
    if (openId === card.id) {
      setOpenId(null);
      return;
    }
    setOpenId(card.id);
    // Fired bare: "The event name. Not which scenario, not the choice, not the
    // revision." (lib/wys/telemetry.ts, the wys_replay decision row.) `trackWys`
    // refuses to send at all unless analytics consent was granted.
    trackWys("wys_replay");
    update((current) => ({
      ...current,
      progress: {
        ...current.progress,
        replayCounts: {
          ...current.progress.replayCounts,
          [card.scenarioId]: (current.progress.replayCounts[card.scenarioId] ?? 0) + 1
        }
      }
    }));
  }

  if (available.length === 0) {
    return (
      <DashedSlot
        label={practiceLabels.replayEmptyLabel}
        awaitedAsset={practiceLabels.replayEmptyAwaited}
      />
    );
  }

  return (
    <div className={styles.replayRows}>
      {available.map((card) => {
        const open = openId === card.id;
        const tag = <span className={styles.replayTag}>{card.tag}</span>;

        if (!card.exercise) {
          // Withheld: the mode is nameable, the exercise is not runnable, and a
          // control that did nothing would be worse than saying so.
          //
          // The row is a `div` rather than a `button` here, which is also what
          // lets the provenance label render in its own voice: `ProvenanceMono`
          // is a `<p>`, and a paragraph inside a button is invalid markup that
          // React re-parents at hydration.
          return (
            <div key={card.id}>
              <div className={styles.replayRow}>
                <div className={styles.replayLabel}>
                  <ProvenanceMono>{card.title.label}</ProvenanceMono>
                </div>
                {tag}
              </div>
              <div className={styles.replayBody}>
                <DashedSlot
                  label={practiceLabels.replayWithheldLabel}
                  awaitedAsset={practiceLabels.replayWithheldAwaited}
                />
              </div>
            </div>
          );
        }

        return (
          <div key={card.id}>
            <button
              type="button"
              className={cx(styles.replayRow, styles.replayRowLive, open && styles.replayRowOpen)}
              aria-expanded={open}
              onClick={() => toggle(card)}
            >
              <span className={styles.replayLabel}>{card.title.text || card.title.label}</span>
              {tag}
            </button>

            {open ? (
              <div className={styles.replayBody}>
                <ScenarioCard
                  pill={card.exercise.pill}
                  setting={card.exercise.setting}
                  decisionMoment={card.exercise.decisionMoment}
                >
                  <JudgeCard
                    scenarioId={card.scenarioId}
                    choices={card.exercise.choices}
                    commitLabel={card.exercise.commitLabel}
                    resetLabel={card.exercise.resetLabel}
                    judgment={card.exercise.judgment}
                    persist={false}
                  />
                </ScenarioCard>
                <div className={styles.replayClose}>
                  <ActionPill variant="outlined" onClick={() => setOpenId(null)}>
                    {practiceLabels.replayClose}
                  </ActionPill>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
