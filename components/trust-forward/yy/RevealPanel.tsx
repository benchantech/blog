import { cx } from "@/components/provenance/cx";
import {
  benJudgmentChanged,
  isRevealUnlocked,
  isRevealUnlockedForCheckpoint,
  type FrozenJudgment,
  type YYLedger
} from "@/lib/trust-forward/yy/records";
import { closestAlternativeStatement } from "@/lib/trust-forward/yy/receipts";
import type { BenJudgment, ChoiceLabel, YYCheckpoint } from "@/lib/trust-forward/yy/types";
import styles from "./reveal.module.css";

/**
 * Trust Forward Lite — the TIMESTAMP surface for one committed checkpoint
 * (governing addendum `TRUST_FORWARD_LITE_YY_METHOD_ADDENDUM_2026-09-08.md`
 * §2 TIMESTAMP, §3 grammar, §7 no correctness score, §29 "must not").
 *
 * THIS COMPONENT IS THE REVEAL, SO IT IS ALSO THE LEAK SURFACE. Ben THEN, Ben
 * NOW and the conditions-around-alternatives are the three things §29 forbids
 * before COMMIT, and all three live in `checkpoint`, which the caller already
 * holds. Every guard in this file exists because the caller cannot be trusted
 * to have asked the question correctly — not out of suspicion, but because
 * "did this learner commit?" is asked in one place here and in several places
 * upstream, and a reveal that leaks backwards is invisible to the person it
 * damages: they cannot tell afterwards which of their judgments was their own.
 *
 * IT RETURNS `null`, IT DOES NOT HIDE. There is no `hidden` attribute, no
 * `display: none` branch and no `aria-hidden` reveal in this file, and that is
 * a product rule rather than a style preference. A rendered-then-hidden panel
 * is still in the served HTML, still in the DOM, still in View Source and
 * still read aloud by anything that ignores CSS. The only implementation of
 * "Ben is not visible" that is actually true is "Ben is not rendered".
 *
 * TWO INDEPENDENT GATES, NEITHER OPTIONAL:
 *
 *   1. `isRevealUnlocked(record)` — the record is a structurally valid frozen
 *      commit. It validates by VALUE, so a draft object assembled while the
 *      learner is still answering fails it even though it type-checks.
 *   2. `isRevealUnlockedForCheckpoint(ledger, runId, checkpointId)` — the
 *      append-only stream agrees that this pair carries a COMMIT.
 *
 * `ledger` is REQUIRED for exactly that reason. ADR 0003 ("a guard that can
 * skip is not a guard") is the local precedent: an optional ledger prop is a
 * gate that is disabled by forgetting a prop, which is the failure mode it
 * exists to prevent. Two gates that can both be satisfied by one caller
 * mistake are one gate.
 *
 * Plus two identity checks — the record's `checkpointId` and `caseId` must be
 * this checkpoint's. A record from a NEIGHBOURING checkpoint passes both gates
 * on its own terms and would reveal Ben's judgment on a situation the learner
 * has not answered yet. That is a leak with a valid commit attached to it,
 * which is the only kind the gates above cannot see.
 *
 * THEN AND NOW ARE PEERS, AND THE MARKUP SAYS SO. One shared `.judgment`
 * class, one shared internal order, no modifier on either, no checkmark, no
 * "updated"/"revised"/"corrected" vocabulary, and no ordering beyond
 * chronology. §29 forbids merging them and forbids portraying NOW as
 * automatically superior; §7 forbids any measure of agreement. The DIFFERENCE
 * between them is the evidence — judgment legitimately changes when tools,
 * economics, experience, information or responsibility change — so when they
 * agree, this panel says so as a fact and stops there. `benJudgmentChanged()`
 * decides which of the two neutral statements renders; it decides nothing
 * about weight, order or emphasis, because there is no weight, order or
 * emphasis to decide.
 *
 * NOTHING HERE IS SCORED, RANKED OR COMPARED. The learner's committed choice
 * is restated; Ben's two judgments are restated; the conditions are restated.
 * There is no branch anywhere in this file that reads the learner's choice
 * against Ben's, and there is deliberately no place to add one — the learner's
 * block is built before either judgment is touched and never sees them.
 *
 * FREE TEXT IS OUT OF SCOPE BY TYPE. The `record` prop is `FrozenJudgment`,
 * not `YYDecisionRecord`: a `YYDecisionRecord` is assignable to it, so callers
 * pass whole records, but `why.learnerText`, `whyNot.learnerText` and
 * `reflection` are not reachable from inside this function. §13 is absolute,
 * and the only enforcement worth having for an absolute rule is one where the
 * forbidden value is unreachable rather than merely unread.
 */

/**
 * The fixed labels this panel adds to Ben's content.
 *
 * ALL OF THEM ARE STRUCTURAL, and there are eight. Every learner-facing
 * SENTENCE on this surface — the captures, the choices, both reasonings, every
 * condition — comes from `content/trust-forward/yy/case-*.ts`, and the closest
 * alternative comes from `closestAlternativeStatement()`, which composes
 * content with the eleven-word frame in `lib/trust-forward/yy/receipts.ts`.
 * These eight are column headings, not copy.
 *
 * They live here rather than in `content/` because no YY copy module exists in
 * this build and this agent does not own `content/` (ADR 0007 — agent-owned
 * files are owned). The `labels` prop is the seam: when a YY copy module
 * lands, a caller threads it through and this default goes away without a
 * structural change. Recorded as a handoff, not smoothed over.
 *
 * CAPS ARE TYPED, NEVER APPLIED WITH `text-transform` — the same rule
 * `components/ui/SectionEyebrow.tsx` states: a screen reader announcing
 * "B E N" and a copy string that cannot be read back as it renders are both
 * avoidable.
 *
 * The two relation statements are deliberately the SAME SHAPE. "Ben THEN and
 * Ben NOW name the same option" / "name different options" — one verb, one
 * subject, no evaluation in either. A pair where the agreement line reads as
 * confirmation and the difference line reads as revision would smuggle in the
 * ranking §7 forbids, and it would do it in two words.
 */
export interface RevealLabels {
  /** The YY stage this panel is. */
  stage: string;
  /** Heading over the learner's own frozen judgment. */
  yours: string;
  /** Precedes the commit stamp. */
  committed: string;
  /** Ben's judgment at the time of the decision. */
  then: string;
  /** Ben's judgment now. */
  now: string;
  /** Rendered when THEN and NOW name the same option. */
  sameOption: string;
  /** Rendered when they name different options. */
  differentOption: string;
  /** Heading over the conditions-around-alternatives. */
  conditions: string;
}

export const REVEAL_LABELS: RevealLabels = {
  stage: "TIMESTAMP",
  yours: "YOUR COMMITTED JUDGMENT",
  committed: "Committed",
  then: "BEN THEN",
  now: "BEN NOW",
  sameOption: "Ben THEN and Ben NOW name the same option.",
  differentOption: "Ben THEN and Ben NOW name different options.",
  conditions: "WHERE ANOTHER OPTION MAKES SENSE"
};

export interface RevealPanelProps {
  /** The canonical checkpoint. Carries Ben THEN, Ben NOW and the conditions. */
  checkpoint: YYCheckpoint;
  /**
   * The learner's frozen judgment for this checkpoint, or `null` while they
   * are still answering. A `YYDecisionRecord` satisfies this type; its prose
   * fields do not exist on it.
   */
  record: FrozenJudgment | null | undefined;
  /**
   * The stream, for the second gate. Required — see the header: an optional
   * ledger is a gate disabled by forgetting a prop.
   */
  ledger: YYLedger;
  /** Override the eight structural labels. Defaults to `REVEAL_LABELS`. */
  labels?: RevealLabels;
  /** The run the learner is currently in. A record from another run is refused. */
  runId: string;
}

/** One choice's A-D label and text, or `null` when the id is not on this checkpoint. */
function optionFor(checkpoint: YYCheckpoint, choiceId: string): { label: ChoiceLabel; text: string } | null {
  for (const choice of checkpoint.choices) {
    if (choice.id === choiceId) return { label: choice.label, text: choice.text };
  }
  return null;
}

/** The option text Ben's judgment names, or `null` when the label is not on this checkpoint. */
function optionTextForLabel(checkpoint: YYCheckpoint, label: ChoiceLabel): string | null {
  for (const choice of checkpoint.choices) if (choice.label === label) return choice.text;
  return null;
}

/**
 * One of Ben's two judgments.
 *
 * Called twice with identical arguments apart from `when` and the judgment
 * itself, and that is the point: there is ONE renderer, so THEN and NOW cannot
 * drift into different treatments through an edit that only touches one of
 * them. The option text is included alongside the A-D label because a bare
 * "C" is unreadable once the option list has scrolled away — it is content,
 * quoted, and it is quoted identically in both blocks.
 */
function Judgment({
  when,
  judgment,
  optionText
}: {
  when: string;
  judgment: BenJudgment;
  optionText: string | null;
}) {
  return (
    <div className={styles.judgment}>
      <p className={styles.judgmentWhen}>{when}</p>
      <p className={styles.judgmentChoice}>
        <span className={styles.labelChip}>{judgment.choiceLabel}</span>
        {optionText === null ? null : <span className={styles.judgmentOption}>{optionText}</span>}
      </p>
      {judgment.reasoning.trim().length > 0 ? (
        <p className={styles.judgmentReason}>{judgment.reasoning}</p>
      ) : null}
    </div>
  );
}

/**
 * An absent reasoning is rendered as ABSENT, never as an empty paragraph.
 *
 * Two of the seventeen checkpoints — case 2 and case 3 — supply a Ben THEN
 * label with no reasoning paragraph, because Ben's source supplies none there.
 * Rendering the element unconditionally produced a heading, a chip and a blank
 * line beside a fully-written NOW: a visible asymmetry in the one panel whose
 * whole contract is that THEN and NOW are peers separated in time, not an old
 * answer and a corrected one.
 *
 * Nothing is invented to fill the gap. The panel simply says less where Ben
 * said less, which is the honest rendering of a source that is silent.
 */
export function RevealPanel({
  checkpoint,
  record,
  ledger,
  runId,
  labels = REVEAL_LABELS
}: RevealPanelProps) {
  /* Gate 1 — a structurally valid frozen commit, validated by value. */
  if (!record || !isRevealUnlocked(record)) return null;

  /* Identity — this record is about THIS checkpoint of THIS case. */
  if (record.checkpointId !== checkpoint.id) return null;
  if (record.caseId !== checkpoint.caseId) return null;

  /* Gate 2 — the append-only stream agrees the pair carries a COMMIT. */
  if (!isRevealUnlockedForCheckpoint(ledger, record.runId, checkpoint.id)) return null;

  /*
   * THIS RUN, not merely a committed run.
   *
   * Without this the panel could not tell a record of the CURRENT run from one
   * of an earlier run of the same checkpoint — both satisfy every gate above.
   * A replay would then show the learner the reveal they had already earned,
   * before they had committed the new run: the reveal boundary intact for run
   * one and quietly absent for run two.
   *
   * The caller happens to filter correctly today. That is exactly why this is
   * here — the panel's stated contract is that it does not trust its caller,
   * and a contract that depends on the caller being careful is not one.
   */
  if (record.runId !== runId) return null;

  /*
   * Fail closed on a choice this checkpoint does not carry, rather than
   * naming it by id or by position. A record written against an older content
   * stamp is a real state, and the honest response is to show nothing: the
   * whole value of the panel is that it quotes what the learner actually
   * chose. Same rule as `buildReceipt()`.
   */
  const chosen = optionFor(checkpoint, record.why.choiceId);
  if (chosen === null) return null;

  const alternative = closestAlternativeStatement(checkpoint, record);
  const changed = benJudgmentChanged(checkpoint);

  return (
    <section className={styles.panel}>
      <p className={styles.stage}>{labels.stage}</p>

      {/*
        The learner's own judgment, first and on its own. It is built from
        `record` and `checkpoint.choices` alone — Ben's two judgments are not
        read in this block, so there is no expression here that could compare
        them, and no place to add one later without it being obvious.
      */}
      <div className={styles.yours}>
        <h3 className={styles.yoursHeading}>{labels.yours}</h3>
        <p className={styles.yoursChoice}>
          <span className={styles.labelChip}>{chosen.label}</span>
          <span className={styles.yoursOption}>{chosen.text}</span>
        </p>
        {alternative === null ? null : <p className={styles.alternative}>{alternative}</p>}
        <p className={styles.committed}>
          <span className={styles.committedLead}>{labels.committed}</span>
          {/*
            The stored stamp, verbatim. NOT `toLocaleString()`: that formats
            against the runtime locale and timezone, which differ between the
            server render and the first client render and would hydrate
            mismatched. The stored form is already a local wall clock with a
            numeric UTC offset and no timezone name, which is the disclosure
            `config/trust-forward-lite.v1.json` pins.
          */}
          <time className={styles.committedStamp} dateTime={record.commit.committedAtLocal}>
            {record.commit.committedAtLocal}
          </time>
        </p>
      </div>

      {/*
        THEN and NOW. Chronological order, one shared renderer, one shared
        class, no modifier on either. The only thing that varies between the
        two calls is which judgment and which word of time.
      */}
      <div className={styles.judgments}>
        <Judgment
          when={labels.then}
          judgment={checkpoint.benThen}
          optionText={optionTextForLabel(checkpoint, checkpoint.benThen.choiceLabel)}
        />
        <Judgment
          when={labels.now}
          judgment={checkpoint.benNow}
          optionText={optionTextForLabel(checkpoint, checkpoint.benNow.choiceLabel)}
        />
      </div>

      {/*
        Stated either way, in the same register. Agreement is not confirmation
        and difference is not correction; both are facts about two judgments
        made at two times.
      */}
      <p className={styles.relation}>{changed ? labels.differentOption : labels.sameOption}</p>

      {checkpoint.conditions.length === 0 ? null : (
        <div className={styles.conditions}>
          <h3 className={styles.conditionsHeading}>{labels.conditions}</h3>
          <ul className={styles.conditionList}>
            {checkpoint.conditions.map((condition) => (
              <li key={condition.label} className={styles.conditionItem}>
                <span className={cx(styles.labelChip, styles.labelChipQuiet)}>{condition.label}</span>
                <span className={styles.conditionText}>{condition.condition}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
