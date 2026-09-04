"use client";

import { useState } from "react";
import type { OriginFor } from "@/lib/content-status";
import type { GatedContent } from "@/lib/wys/content-gate";
import { isShowable } from "@/lib/wys/content-gate";
import {
  type JudgeState,
  commitJudge,
  initialJudgeState,
  judgeReveal,
  resetJudge,
  selectChoice
} from "@/lib/wys/judge-machine";
import { sendAggregate } from "@/lib/wys/aggregate";
import { PERSIST_LOCAL_JUDGMENTS } from "@/content/watch-your-step/config";
import { CONTENT_VERSION } from "@/content/watch-your-step/version";
import { WYS_DOMAINS } from "@/content/watch-your-step/domains";
import { ActionPill } from "@/components/ui/ActionPill";
import { ChoiceList, ChoiceRow } from "@/components/ui/ChoiceRow";
import { DistributionBars, type DistributionSlice } from "./DistributionBars";
import { JudgmentCard } from "./JudgmentCard";
import { ProvenanceMono } from "@/components/provenance/ProvenanceMono";
import { useWysState } from "./useWysState";
import styles from "./wys-primitives.module.css";

/**
 * The JUDGE composite (plan Phase 7, §4.8; WYS §10 JUDGE; mockup 4a
 * `data-dc-script`, mockup 5b Today, mockup 5a step 5).
 *
 * ONE COMPONENT FOR FOUR SURFACES — the `4a` hero demo, Lesson Zero step 5,
 * Today and Practice's replay all draw the same machine, so it is built once
 * here and the screens pass content in. The transitions themselves are
 * `lib/wys/judge-machine.ts`, which is pure and unit-tested; this file is the
 * `useState` shell WYS §10 asks for and nothing more.
 *
 * THE INVARIANT, restated because it is the product: **the judgment is not
 * reachable before commit.** Not hidden with CSS, not collapsed behind a
 * `<details>`, not in the DOM: `judgeReveal(state).judgment` is `state.committed`
 * and the whole revealed block is a conditional render. The server HTML a
 * crawler, a no-JS visitor and the first paint receive contains the scenario,
 * the choices and the Commit pill — and no judgment.
 *
 * AFTER COMMIT: choices lock (they stay visible and legible — `ChoiceRow`'s
 * `locked` state), the judgment reveals, the distribution reveals, and the
 * actions reveal. Reset clears both the pick and the commit. The reveal is the
 * §4.6 200ms ease-out, and `prefers-reduced-motion` is honoured in the
 * stylesheet on both halves of the pair.
 *
 * WHAT LEAVES THE BROWSER: nothing. `wys_scenario_choice` is a first-party
 * AGGREGATE-only event (WYS §19.4) that `trackWys` refuses by name, so the
 * commit calls `sendAggregate`, which returns `{ sent: false, reason:
 * "disabled" }` in v0 — the counter is off (Q12) and there is no endpoint. The
 * call is wired anyway so the firing point is recorded rather than invented
 * later.
 *
 * WHAT IS KEPT LOCALLY: the pick, under `localJudgments[scenarioId]`, when
 * `PERSIST_LOCAL_JUDGMENTS` is true (Q20, ratified ON — Progress draws
 * "C → B · revised", which needs the earlier choice to still exist). A second
 * commit on the same scenario writes `revisedChoiceKey` and leaves the original
 * `choiceKey` alone; that is what makes the revision renderable. Everything
 * goes through the serializer, so an id outside the declared vocabulary is
 * dropped rather than stored.
 */

export interface JudgeChoice {
  key: string;
  /** The label at this breakpoint — the caller picks `label` or `shortLabel`. */
  label: string;
}

export interface JudgeDistribution {
  slices: readonly DistributionSlice[];
  /** Inseparable from the numbers (§6.5). No caption, no bars. */
  caption: string;
  heading: string;
  meta?: string;
}

export function JudgeCard({
  scenarioId,
  choices,
  commitLabel,
  resetLabel,
  judgment,
  note,
  distribution,
  continueHref,
  continueLabel,
  breakpoint = "desktop",
  persist = true,
  fill = "grey"
}: {
  /** A declared scenario id. Storage drops anything else (plan §7.2). */
  scenarioId: string;
  choices: readonly JudgeChoice[];
  /** `judgeLabels.commit`. Never typed at a call site. */
  commitLabel: string;
  /** `judgeLabels.reset`. Rendered on BOTH breakpoints (R9, ratified). */
  resetLabel: string;
  judgment: {
    /** Page chrome, e.g. "BEN'S JUDGMENT". Never a provenance claim. */
    surfaceTitle: string;
    /** The "· slot awaiting Ben" suffix. */
    slotState?: string;
    origin: OriginFor<"judgment">;
    content: GatedContent;
  };
  /** The line under the Commit pill. Pre-commit only, as both artboards draw it. */
  note?: GatedContent;
  distribution?: JudgeDistribution;
  continueHref?: string;
  continueLabel?: string;
  breakpoint?: "desktop" | "mobile";
  /** `4a`'s hero demo uses white rows with a 1.5px border; `5a`/`5b` use the grey fill. */
  fill?: "white" | "grey";
  /** Off for a replay that must not overwrite the kept judgment (WYS §14). */
  persist?: boolean;
}) {
  const [state, setState] = useState<JudgeState>(initialJudgeState);
  const { update } = useWysState(WYS_DOMAINS);
  const reveal = judgeReveal(state);
  const choiceKeys = choices.map((choice) => choice.key);

  function onSelect(key: string): void {
    setState((current) => selectChoice(current, key, choiceKeys));
  }

  function onCommit(): void {
    // The transition is the authority: if the machine refuses (no pick), the
    // state does not change and no side effect fires either. Computed OUTSIDE
    // the updater on purpose — a `setState` updater must stay pure, and React
    // calls it twice in development.
    const next = commitJudge(state);
    if (next === state || next.selected === null) return;
    setState(next);
    recordCommit(next.selected);
  }

  function recordCommit(choiceKey: string): void {
    // First-party aggregate only, and disabled in v0: no GA4 event exists for a
    // scenario choice and none may be added (WYS §19.4).
    sendAggregate({ event: "scenario_choice", scenarioId, choiceKey, contentVersion: CONTENT_VERSION });

    if (!persist || !PERSIST_LOCAL_JUDGMENTS) return;
    update((current) => {
      const existing = current.localJudgments?.[scenarioId];
      const updatedAt = new Date().toISOString();
      const entry =
        existing && existing.choiceKey !== choiceKey
          ? { choiceKey: existing.choiceKey, revisedChoiceKey: choiceKey, updatedAt }
          : { choiceKey, updatedAt };
      return {
        ...current,
        localJudgments: { ...(current.localJudgments ?? {}), [scenarioId]: entry }
      };
    });
  }

  function onReset(): void {
    setState(resetJudge());
  }

  const chose = state.selected ?? undefined;

  return (
    <div>
      <div className={styles.judgeChoices}>
        <ChoiceList>
          {choices.map((choice) => (
            <ChoiceRow
              key={choice.key}
              letter={choice.key}
              fill={fill}
              breakpoint={breakpoint}
              selected={state.selected === choice.key}
              locked={!reveal.choicesEnabled}
              onSelect={() => onSelect(choice.key)}
            >
              {choice.label}
            </ChoiceRow>
          ))}
        </ChoiceList>
      </div>

      {reveal.commitVisible ? (
        <div className={styles.judgeCommit}>
          <ActionPill variant="ink" full disabled={!reveal.commitEnabled} onClick={onCommit}>
            {commitLabel}
          </ActionPill>
          {note && isShowable(note) ? <p className={styles.judgeNote}>{note.text}</p> : null}
          {note && !isShowable(note) ? (
            <div className={styles.judgeNote}>
              <ProvenanceMono>{note.label}</ProvenanceMono>
            </div>
          ) : null}
        </div>
      ) : null}

      {reveal.judgment ? (
        <div className={styles.judgeReveal}>
          <JudgmentCard
            surfaceTitle={judgment.surfaceTitle}
            slotState={judgment.slotState}
            origin={judgment.origin}
            content={judgment.content}
            chose={chose}
            breakpoint={breakpoint}
          />

          {reveal.distribution && distribution ? (
            <div className={styles.distributionCard}>
              <DistributionBars
                slices={distribution.slices}
                caption={distribution.caption}
                heading={distribution.heading}
                meta={distribution.meta}
                layout={breakpoint === "mobile" ? "strip" : "bars"}
              />
            </div>
          ) : null}

          {reveal.actions ? (
            <div className={styles.judgeActions}>
              {continueHref && continueLabel ? (
                <span className={styles.judgeActionMain}>
                  <ActionPill variant="teal" full href={continueHref}>
                    {continueLabel}
                  </ActionPill>
                </span>
              ) : null}
              <ActionPill variant="outlined" onClick={onReset}>
                {resetLabel}
              </ActionPill>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
