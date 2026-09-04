"use client";

import { useState } from "react";
import type { GatedContent } from "@/lib/wys/content-gate";
import { gateProse, isShowable } from "@/lib/wys/content-gate";
import type { VisitCountableStop } from "@/lib/wys/visit";
import type { WysLocalStateV1 } from "@/lib/wys/local-state";
import { PERSIST_LOCAL_JUDGMENTS, SHIP_LEARNER_RULEBOOK } from "@/content/watch-your-step/config";
import { WYS_DOMAINS } from "@/content/watch-your-step/domains";
import {
  RULE_MAX_LENGTH,
  type RulebookEntry,
  judgmentRows,
  learnerRuleProvenance,
  normaliseRuleText,
  progressCounts,
  progressLabels,
  progressStatTiles,
  statValue,
  stopsDenominator
} from "@/content/watch-your-step/progress";
import { downloadRulebook } from "@/components/wys/RulebookExport";
import { useWysState } from "@/components/wys/useWysState";
import { ProvenanceMarks } from "@/components/wys/ProvenanceMarks";
import { ProvenanceMono } from "@/components/provenance/ProvenanceMono";
import { cx } from "@/components/provenance/cx";
import { ActionPill } from "@/components/ui/ActionPill";
import { LinkRow } from "@/components/ui/LinkRow";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { StatCard, StatGrid } from "@/components/ui/StatCard";
import styles from "./progress.module.css";

/**
 * The Progress view (plan Phase 7; mockup `5b` Progress, dc.html:121-145;
 * WYS §13).
 *
 * "What you've actually done. No score, no streak, no percentage." Everything
 * on the screen is a COUNT OF SOMETHING THE LEARNER DID, or something the
 * learner wrote. There is no ratio, no percentage, no ring, no bar, no streak,
 * no XP, no level, no badge, no ranking and no agreement-with-Ben score —
 * §13's do-not-show list, held as an absence in `content/watch-your-step/
 * progress.ts` (nothing there computes one) rather than as a rule a component
 * remembers.
 *
 * WHY THE WHOLE VIEW IS A CLIENT COMPONENT. Every number, every judgment row
 * and every rulebook row is read from `wys:v1`, and §7.3 forbids reading it
 * during render. So the screen mounts one client component, gates each numeral
 * on `loaded`, and renders an em dash until the read returns — the same rule
 * `VisitCounter` follows: a count with no numeral is true at every moment; a
 * numeral that is wrong for a returning learner and then corrects itself is
 * not. Storage that throws (iOS Safari private browsing) lands on the empty
 * state, which is a real answer, not a crash.
 *
 * WHAT ARRIVES AS PROPS AND WHY. The stops arrive as a MINIMAL PROJECTION —
 * id, cadence paths, off-site flag — and the scenario titles arrive already
 * gated, with a blocked record's prose REMOVED (see `page.tsx`). Props of a
 * client component are serialised into the RSC payload, which is public page
 * source, so passing the whole `WysWeek` records would publish the draft stop
 * titles and purposes that `RENDER_MARKED_DRAFT` exists to withhold.
 *
 * TELEMETRY: NONE. No allowlisted event has this screen as its firing point
 * (WYS §19.4), and (WYS §16) forbids sending the rulebook to analytics at all.
 * Nothing here calls `trackWys` or `sendAggregate`.
 */

export interface ProgressScenarioTitle {
  scenarioId: string;
  /** Gated; `text` is empty when the record is blocked. */
  content: GatedContent;
}

/**
 * Gated prose in this screen's typography.
 *
 * `GatedText` renders one fixed body style (16px ink) and the `5b` Progress
 * screen draws its gated strings at three other sizes — a 15px lead, a 13px
 * footnote and a 15px row title. So the same three states are composed here
 * from the shared pieces rather than restated: the prose in the caller's own
 * element, then `ProvenanceMarks` (which is exactly what it was split out of
 * `GatedText` for), and the label ALONE through `ProvenanceMono` when the
 * record is blocked. A request for a size variant on `GatedText` is recorded in
 * docs/facelift-build-notes.md; until it exists this is the composition, not a
 * second renderer — there is still no path from a content record to prose
 * without its policy.
 */
function GatedLine({
  content,
  className,
  as = "p"
}: {
  content: GatedContent;
  /** Omitted where the surrounding row already sets the type. */
  className?: string;
  as?: "p" | "span";
}) {
  if (!isShowable(content)) {
    return <ProvenanceMono>{content.label}</ProvenanceMono>;
  }
  const body =
    as === "span" ? (
      <span className={className}>{content.text}</span>
    ) : (
      <p className={className}>{content.text}</p>
    );
  return (
    <>
      {body}
      <ProvenanceMarks content={content} />
    </>
  );
}

/** A rulebook id is an id token, never a sentence — the serializer drops anything else. */
function newRuleId(): string {
  const unique =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `rule-${unique}`;
}

/*
 * The plain-text export used to be defined here. It now lives in
 * `components/wys/RulebookExport.tsx`, because the Stop H terminal surface
 * exports the same rulebook and two copies of one download is how two screens
 * end up producing two different files (§6.8, §5.1).
 */

/**
 * The "a new rule is being written" sentinel.
 *
 * Deliberately not a valid id token (`isIdToken` requires an alphanumeric first
 * character), so it can never equal a stored rule's id and open two forms at
 * once.
 */
const NEW_RULE = "+new";

export function ProgressView({
  stops,
  lead,
  storageNote,
  scenarioTitles
}: {
  /** Minimal projection of every stop, in order. `stops.length` is the derived count. */
  stops: readonly VisitCountableStop[];
  lead: GatedContent;
  storageNote: GatedContent;
  scenarioTitles: readonly ProgressScenarioTitle[];
}) {
  const { loaded, state, update } = useWysState(WYS_DOMAINS);
  const [openForm, setOpenForm] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [armedForDelete, setArmedForDelete] = useState<string | null>(null);

  const counts = progressCounts(stops, state);
  const titleFor = (scenarioId: string): GatedContent | undefined =>
    scenarioTitles.find((entry) => entry.scenarioId === scenarioId)?.content;

  // Rows exist only once local state has loaded. Before that the sections are
  // headings alone: rendering "Nothing committed yet." against an unread
  // browser would be a statement this screen cannot yet make.
  const rows = loaded ? judgmentRows(state) : [];
  const rulebook: readonly RulebookEntry[] = loaded ? state.rulebook : [];

  // The learner's own rules go through the SAME gate every other string on the
  // course does: there is no path from a stored value to the screen that skips
  // the policy. `learnerRuleProvenance` is `published` + `LEARNER_OWNED`, so
  // the policy is `marked` and Q21's default cannot empty the one list on the
  // site that is not Ben's to publish (plan §6.2, §6.3).
  const gatedRules = rulebook.map((entry) => ({
    entry,
    content: gateProse("general", learnerRuleProvenance, entry.text)
  }));
  const ruleLabels = [
    ...new Set(
      gatedRules.filter(({ content }) => isShowable(content)).map(({ content }) => String(content.label))
    )
  ];

  function closeForm(): void {
    setOpenForm(null);
    setDraft("");
  }

  function saveRule(): void {
    const text = normaliseRuleText(draft);
    if (!text) {
      closeForm();
      return;
    }
    const at = new Date().toISOString();
    const target = openForm;
    update((current: WysLocalStateV1) => {
      if (target === NEW_RULE) {
        return {
          ...current,
          rulebook: [...current.rulebook, { id: newRuleId(), text, createdAt: at, updatedAt: at }]
        };
      }
      return {
        ...current,
        rulebook: current.rulebook.map((entry) =>
          entry.id === target ? { ...entry, text, updatedAt: at } : entry
        )
      };
    });
    closeForm();
  }

  function deleteRule(id: string): void {
    update((current: WysLocalStateV1) => ({
      ...current,
      rulebook: current.rulebook.filter((entry) => entry.id !== id)
    }));
    setArmedForDelete(null);
    if (openForm === id) closeForm();
  }

  return (
    <>
      <GatedLine content={lead} className={styles.lead} />

      <div className={styles.stats}>
        <StatGrid>
          {progressStatTiles.map((tile) => (
            <StatCard
              key={tile.id}
              value={loaded ? statValue(tile.id, counts) : "—"}
              denominator={tile.id === "stops-completed" ? stopsDenominator(counts) : undefined}
              label={tile.label}
            />
          ))}
        </StatGrid>
      </div>

      {PERSIST_LOCAL_JUDGMENTS ? (
        <div className={styles.section}>
          <SectionEyebrow breakpoint="mobile">{progressLabels.judgmentsEyebrow}</SectionEyebrow>
          {loaded && rows.length === 0 ? (
            <p className={styles.empty}>{progressLabels.noJudgmentsYet}</p>
          ) : null}
          {rows.length > 0 ? (
            <ul className={styles.rows}>
              {rows.map((row) => {
                const title = titleFor(row.scenarioId);
                // A stored id outside the declared scenario vocabulary cannot
                // survive the serializer, so an unmatched row is not a case to
                // render around — it is a case that does not occur.
                if (!title) return null;
                return (
                  <li key={row.scenarioId} className={cx(styles.row, styles.rowFilled)}>
                    <div className={styles.rowTitle}>
                      <GatedLine content={title} as="span" />
                    </div>
                    <span className={styles.rowState}>{row.state}</span>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      ) : null}

      {SHIP_LEARNER_RULEBOOK ? (
        <>
          <div className={styles.sectionTight}>
            <SectionEyebrow breakpoint="mobile">{progressLabels.rulebookEyebrow}</SectionEyebrow>
            <ul className={styles.rows}>
              {gatedRules.map(({ entry, content }) =>
                openForm === entry.id ? (
                  <li key={entry.id}>
                    <RuleForm
                      draft={draft}
                      onDraft={setDraft}
                      onSave={saveRule}
                      onCancel={closeForm}
                    />
                  </li>
                ) : (
                  <li key={entry.id} className={cx(styles.row, styles.rowOutlined)}>
                    <div className={styles.rowTitle}>
                      <GatedLine content={content} as="span" />
                    </div>
                    <span className={styles.ruleControls}>
                      <button
                        type="button"
                        className={styles.ruleControl}
                        onClick={() => {
                          setArmedForDelete(null);
                          setOpenForm(entry.id);
                          setDraft(entry.text);
                        }}
                      >
                        {progressLabels.editRule}
                      </button>
                      {armedForDelete === entry.id ? (
                        <>
                          <button
                            type="button"
                            className={styles.ruleControl}
                            onClick={() => deleteRule(entry.id)}
                          >
                            {progressLabels.confirmDeleteRule}
                          </button>
                          <button
                            type="button"
                            className={styles.ruleControl}
                            onClick={() => setArmedForDelete(null)}
                          >
                            {progressLabels.cancelRule}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className={styles.ruleControl}
                          onClick={() => setArmedForDelete(entry.id)}
                        >
                          {progressLabels.deleteRule}
                        </button>
                      )}
                    </span>
                  </li>
                )
              )}
              <li>
                {openForm === NEW_RULE ? (
                  <RuleForm
                    draft={draft}
                    onDraft={setDraft}
                    onSave={saveRule}
                    onCancel={closeForm}
                  />
                ) : (
                  <button
                    type="button"
                    className={styles.addRule}
                    onClick={() => {
                      setArmedForDelete(null);
                      setOpenForm(NEW_RULE);
                      setDraft("");
                    }}
                  >
                    {progressLabels.addRule}
                  </button>
                )}
              </li>
            </ul>
          </div>

          {/* ONE provenance line for the list, not one per row. Every rule
              carries the same LEARNER_OWNED label and a label repeated under
              every row stops being read (WYS §23: provenance is not
              decorative). The set is computed rather than assumed, so a row
              whose provenance ever differed would bring its own line. */}
          {ruleLabels.map((label) => (
            <ProvenanceMono key={label}>{label}</ProvenanceMono>
          ))}

          <div className={styles.note}>
            <GatedLine content={storageNote} className={styles.noteText} />
          </div>

          {rulebook.length > 0 ? (
            <div className={styles.export}>
              <ActionPill variant="outlined" onClick={() => downloadRulebook(rulebook)}>
                {progressLabels.exportRulebook}
              </ActionPill>
            </div>
          ) : null}
        </>
      ) : null}

      <LinkRow href={progressLabels.dataPageHref}>{progressLabels.inspectLocalData}</LinkRow>
    </>
  );
}

function RuleForm({
  draft,
  onDraft,
  onSave,
  onCancel
}: {
  draft: string;
  onDraft: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className={styles.ruleForm}>
      <label className={styles.ruleFieldLabel} htmlFor="wys-rule-field">
        {progressLabels.ruleFieldLabel}
      </label>
      <textarea
        id="wys-rule-field"
        className={styles.ruleField}
        value={draft}
        maxLength={RULE_MAX_LENGTH}
        onChange={(event) => onDraft(event.target.value)}
      />
      <div className={styles.ruleFormActions}>
        <ActionPill variant="ink" onClick={onSave}>
          {progressLabels.saveRule}
        </ActionPill>
        <ActionPill variant="outlined" onClick={onCancel}>
          {progressLabels.cancelRule}
        </ActionPill>
      </div>
    </div>
  );
}
