"use client";

import { WYS_DOMAINS } from "@/content/watch-your-step/domains";
import { pacePillLabel, planLabels } from "@/content/watch-your-step/plan";
import { ProvenanceMarks } from "@/components/wys/ProvenanceMarks";
import { Pill } from "@/components/ui/Pill";
import { cx } from "@/components/provenance/cx";
import { isShowable } from "@/lib/wys/content-gate";
import { useWysState } from "@/components/wys/useWysState";
import { planRows, type PlanRow, type PlanStopView } from "./plan-model";
import styles from "./plan.module.css";

/**
 * The state-dependent half of the Plan view (mockup 5b, dc.html:105-117).
 *
 * WHY THIS IS A CLIENT COMPONENT AND THE PAGE IS NOT. §7.3 forbids reading
 * `wys:v1` during render, so the three row states cannot be computed on the
 * server. Everything that does NOT depend on the learner — the stop order, the
 * derived marks and names, the gated titles, the hrefs — is computed in
 * `page.tsx` and arrives here as plain data, so the gating happens once, on the
 * side of the boundary where it cannot be skipped, and this component never
 * holds an ungated string. (`content/watch-your-step/domains.ts` still reaches
 * the client through `useWysState`; that is the shell's declared path for every
 * state-reading component, not something this screen adds.)
 *
 * THE PROSE IS ALREADY GATED WHEN IT ARRIVES. `stop.title` is a `GatedContent`,
 * not a string: this component cannot hold a stop title without the policy and
 * the label that govern it (§6.2). While `RENDER_MARKED_DRAFT` is false (Q21,
 * ratified) every stop title is blocked, so the rows carry their derived mark
 * alone and the withheld titles are named ONCE, under the list, by `page.tsx` —
 * not nine times inside it. Nine identical provenance lines would be honest and
 * unreadable, and unreadable provenance stops being read (WYS §23).
 *
 * NOTHING HERE COUNTS ANYTHING. No completed total, no remaining total, no
 * percentage, no streak, no clock, no "behind". The only numeral on the screen
 * is "visit 2 of 3" on the current row, which is a position inside one stop.
 */
export function PlanStops({
  stops,
  daySummaries
}: {
  stops: readonly PlanStopView[];
  daySummaries: Readonly<Record<string, string>>;
}) {
  const { loaded, state } = useWysState(WYS_DOMAINS);
  const rows = planRows(stops, state, loaded, daySummaries);

  return (
    <ol className={styles.rowList}>
      {rows.map((row) => (
        <li key={row.stop.id} className={styles.rowItem}>
          {row.state === "current" ? <CurrentCard row={row} /> : <PlanRowLink row={row} />}
        </li>
      ))}
    </ol>
  );
}

/**
 * The status pill beside the title: "3 days · ~10 min" (dc.html:103).
 *
 * Absent until the learner has chosen a pace, and absent while state is
 * unread. A default pill would describe a decision nobody made, and this
 * screen exists to show the learner their own plan.
 */
export function PlanPacePill() {
  const { loaded, state } = useWysState(WYS_DOMAINS);
  if (!loaded) return null;
  const label = pacePillLabel(state.onboarding.cadence, state.onboarding.timeBudget);
  if (!label) return null;
  return <Pill variant="status">{label}</Pill>;
}

/* -------------------------------------------------------------------------- */

const TAG_LABELS = {
  done: planLabels.doneTag,
  offSite: planLabels.offSiteTag,
  terminal: planLabels.terminalTag
} as const;

/**
 * A done, future or terminal row (dc.html:106, :108-114).
 *
 * Every row is a link to the per-stop route (§5.3) — including the done ones.
 * A finished stop is not a spent one: (WYS §14)'s replay and (WYS §15.1)'s from-
 * memory both depend on going back, and a plan whose completed rows were inert
 * would be a progress bar with extra steps.
 */
function PlanRowLink({ row }: { row: PlanRow }) {
  const { stop, state, tag } = row;
  const className = cx(
    styles.row,
    state === "done" && styles.rowDone,
    stop.terminal && state !== "done" && styles.rowTerminal
  );

  return (
    <a className={className} href={stop.href}>
      <span className={styles.rowLabel}>
        <span className={styles.rowMark}>{stop.mark}</span>
        {isShowable(stop.title) ? <span className={styles.rowTitle}>{stop.title.text}</span> : null}
      </span>
      {tag ? (
        <span className={styles.rowTag}>
          {TAG_LABELS[tag]}
          {tag === "done" ? (
            <span aria-hidden="true" className={styles.rowTagGlyph}>
              {planLabels.doneMark}
            </span>
          ) : null}
        </span>
      ) : null}
    </a>
  );
}

/**
 * The current stop, as the ink card the artboard draws (dc.html:107).
 *
 * The eyebrow's caps are CSS, not the string. "Stop A" is DERIVED structure
 * (`stopDisplayName`), so typing an upper-case second form of it would be
 * typing a name the build computes; `NOW` is typed as the artboard draws it.
 * A screen reader is handed "Stop A · NOW", which reads back as it renders.
 *
 * When the title is withheld the card falls back to the stop's derived name,
 * which is true whatever Ben decides about the scaffold titles, and the
 * provenance line under the list says whose words are missing.
 */
function CurrentCard({ row }: { row: PlanRow }) {
  const { stop, visit, tag } = row;
  const rightMeta = visit ?? (tag ? TAG_LABELS[tag] : null);
  const showTitle = isShowable(stop.title);

  return (
    <a className={styles.current} href={stop.href}>
      <span className={styles.currentHead}>
        <span className={styles.currentEyebrow}>
          {stop.name} · {planLabels.nowTag}
        </span>
        {rightMeta ? <span className={styles.currentMeta}>{rightMeta}</span> : null}
      </span>
      <span className={styles.currentTitle}>{showTitle ? stop.title.text : stop.name}</span>
      {/* `currentMarks` is a `div`, not a `span`: `ProvenanceMarks` renders
          paragraphs, and a paragraph inside a span is invalid nesting. The
          `<a>` takes flow content because its parent `<li>` does. */}
      {showTitle ? (
        <div className={styles.currentMarks}>
          <ProvenanceMarks content={stop.title} tone="dark" />
        </div>
      ) : null}
      {row.next ? (
        <span className={styles.currentNext}>
          {planLabels.nextPrefix} {row.next}
        </span>
      ) : null}
    </a>
  );
}
