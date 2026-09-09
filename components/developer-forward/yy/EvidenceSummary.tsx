import { receiptsByCheckpoint } from "@/lib/developer-forward/yy/receipts";
import { isRevealUnlocked } from "@/lib/developer-forward/yy/records";
import {
  RESONANCE_THRESHOLD,
  type YYCase,
  type YYDecisionRecord,
  type YYReceipt,
  type YYResonance
} from "@/lib/developer-forward/yy/types";
import { EVIDENCE_TAG_INDEX } from "@/content/developer-forward/yy/evidence-tags";
import { deterministicSummaryFraming, learnerWordsBlock } from "@/content/developer-forward/surfaces";
import styles from "./evidence.module.css";

/**
 * Developer Forward Lite — the end of the run (governing addendum
 * `TRUST_FORWARD_LITE_YY_METHOD_ADDENDUM_2026-09-08.md` §20 "Learner outcome",
 * §21 "Learner-facing final summary", §12 evidence-bounded language, §13 free
 * text is never interpreted, §24 conversion principle).
 *
 * Three blocks, in this order and no other: the receipts, the resonances that
 * cleared the two-checkpoint threshold, and the learner's own words replayed
 * verbatim.
 *
 * NOTHING IS COMPUTED HERE. Every sentence carrying a fact is assembled by
 * `lib/developer-forward/yy/receipts.ts` or `lib/developer-forward/yy/resonance.ts` and
 * arrives finished; the counts arrive finished too. This file is the
 * ARRANGEMENT of what those return, plus one set subtraction — the supporting
 * checkpoints removed from the denominator — which is how the contradictory
 * half of a resonance's evidence is found. That is the only arithmetic in the
 * file beyond `length`.
 *
 * ## There is no score on this screen, and there is no place to put one
 *
 * §7 forbids a grade, a percentage of agreement with Ben, a personality type, a
 * competence judgment, a moral ranking, a hidden punishment and a preferred
 * convergence target. Read the imports rather than trusting the paragraph:
 * there is no scoring module here, no aggregation module, no comparison against
 * `benThen` or `benNow`, and no ordering by frequency anywhere — receipts
 * arrive in reading order and resonances arrive sorted by tag, which carries no
 * meaning on purpose.
 *
 * The three numbers rendered are the three §21 asks for by name: decisions
 * committed, distinct checkpoints covered, and checkpoints whose committed
 * action changed on a later run ("You changed your committed action on 2
 * replayed checkpoints. Do not infer growth, improvement, indecision, or
 * learning from that fact"). All three sit in the small-print register,
 * deliberately, because a count set in a display size is a score whatever the
 * caption underneath says.
 *
 * The closing line is `deterministicSummaryFraming.closingLine` — imported, not
 * retyped. The source calls it the "Critical final sentence" and it is: without
 * it a page of receipts reads as a verdict about the person rather than as a
 * description of what they selected. One sentence, one definition.
 *
 * ## Ben is not on this screen at all
 *
 * Invariant 1 (CAPTURE protects the historical decision boundary) is satisfied
 * structurally rather than by a runtime gate: outside this comment, the
 * identifiers `benThen`, `benNow` and `conditions` appear nowhere in this file,
 * so no code path can render them and none can be added without the diff
 * showing it. The check a reviewer can run is: strip the block comments, then
 * grep for those three names — the result is empty. Stated as the mechanism
 * rather than as an outcome, because "no test enforces this" is the true and
 * useful half: none does, and the emptiness of that grep is the whole guard.
 *
 * The learner's prose is gated once, by the function that already owns the
 * definition: a record that fails `isRevealUnlocked()` contributes no note. The
 * receipts are gated by the same function upstream, inside `buildReceipts()`.
 * Two definitions of "committed" would eventually disagree, so there is one.
 *
 * ## Why `<details>` and not a `useState` toggle
 *
 * §21: "Every resonance must be expandable to its underlying evidence"; §24
 * forbids hiding the evidence underlying a pattern. A native disclosure keeps
 * that promise with no client JavaScript, no hydration boundary and no state
 * this component could get wrong — the evidence is in the served HTML whether
 * or not the bundle loads, which is the correct failure mode for the one
 * artefact a learner is meant to be able to audit. It is also why this file
 * carries no `"use client"` directive: it holds no state, reads no storage and
 * touches no browser API. Mounted inside a client island it is bundled anyway;
 * that is the island's decision, and this component does not need to make it.
 *
 * Note the asymmetry with invariant 1, which is deliberate. Ben's judgment must
 * NOT be in the served HTML before commit, so it is gated by data and never
 * rendered-then-hidden. The learner's own evidence must ALWAYS be reachable, so
 * it is rendered and collapsed. Same technique, opposite requirements, and
 * conflating the two is how a reveal leaks.
 *
 * ## Contradictory evidence is rendered, not smoothed
 *
 * `YYResonance.relevantCheckpointIds` is the §12 denominator: every committed
 * checkpoint where the tagged action was on the table. Subtracting the
 * supporting checkpoints from it leaves exactly the checkpoints where the
 * learner did something else, and those receipts are rendered under their own
 * label inside the same panel, in the same type as the supporting ones. The
 * resonance statement already says "in 2 of 3" — this is the other one, by
 * name, so the sentence can be checked rather than believed.
 *
 * ## The notes are replayed and nothing else
 *
 * §13 is absolute: free text is never parsed, never tagged, never sent to a
 * model, never sent to analytics. Block 3 is a `map` over strings into
 * `white-space: pre-wrap` paragraphs. There is no summarisation, no truncation,
 * no ellipsis, no sentiment, no ordering by length and no "highlights" subset —
 * a learner's blank line is part of what they wrote, and collapsing it is an
 * edit. `learnerWordsBlock.note` is the product saying so out loud, and it is
 * the honest limitation the addendum wants shown deliberately rather than
 * apologised for.
 *
 * ## Two things the reader should know about this file's edges
 *
 * 1. `records` AND `cases` ARE OPTIONAL, AND BLOCK 3 IS ABSENT WITHOUT THEM.
 *    Receipts deliberately cannot carry prose — `buildReceipts` takes
 *    `FrozenJudgment`, which has no `learnerText` field at any depth, which is
 *    how §13 is enforced by the type system rather than by care. So the only
 *    route to the learner's own words is the records themselves. A composition
 *    root that passes receipts and resonances but no records gets blocks 1 and
 *    2 and no block 3: correct behaviour for a caller with nothing to replay,
 *    and a silent gap for a caller that has prose and does not pass it.
 *
 * 2. LEARNER-FACING PROSE, AND ONE GAP THIS COMPONENT COULD NOT CLOSE. The long
 *    sentences here are imported from `content/` (`learnerWordsBlock`,
 *    `deterministicSummaryFraming`) and the factual ones are assembled in
 *    `lib/`. What remains inline is the block labels and the three
 *    WHY / WHY-NOT / REFLECT prompts from the canonical grammar (§3), each a
 *    short name rather than a claim. They belong in a
 *    `content/developer-forward/yy/` copy module registered in
 *    `DEVELOPER_FORWARD_YY_MODULES`; that module does not exist yet and creating it
 *    was outside this component's ownership. Until it does, these are the only
 *    strings on this screen that no registry can see.
 */

/* -------------------------------------------------------------------------- */
/* Labels                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Short names, not copy. Collected in one object so the gap described above is
 * one import away from closing rather than scattered through the markup.
 *
 * The three note labels are the canonical grammar's own prompts (§3) with the
 * question mark dropped, because here they name a thing the learner already
 * wrote rather than ask for it.
 */
const LABEL = {
  decisions: "Your decisions",
  noDecisions: "No decisions have been committed yet.",
  resonances: "Resonances",
  silenceLead: `No pattern reached ${RESONANCE_THRESHOLD} independent checkpoints.`,
  silenceEvidence: "One decision is evidence on its own.",
  silenceWhere: "Every decision you committed is listed above.",
  evidenceToggle: "The decisions behind this",
  supporting: "Supporting decisions",
  otherRelevant: "Other relevant decisions",
  why: "Why this choice",
  whyNot: "What kept you from choosing it",
  reflection: "What you would have done differently"
} as const;

/** `3 committed decisions across 3 checkpoints`. §21's factual count. */
function countLine(committedCount: number, checkpointCount: number): string {
  const decisions = committedCount === 1 ? "decision" : "decisions";
  const checkpoints = checkpointCount === 1 ? "checkpoint" : "checkpoints";
  return `${committedCount} committed ${decisions} across ${checkpointCount} ${checkpoints}`;
}

/**
 * §21's "Revisions over time", in the addendum's own wording.
 *
 * A fact with nothing attached to it. §21: "Do not infer growth, improvement,
 * indecision, or learning from that fact" — so the sentence stops at the count,
 * and it is absent rather than zeroed when nothing was revised, because "you
 * changed 0" is a sentence about the learner where silence is a sentence about
 * the record.
 */
function revisionLine(revisedCheckpointCount: number): string {
  const checkpoints = revisedCheckpointCount === 1 ? "checkpoint" : "checkpoints";
  return `You changed your committed action on ${revisedCheckpointCount} replayed ${checkpoints}.`;
}

/* -------------------------------------------------------------------------- */
/* Notes                                                                      */
/* -------------------------------------------------------------------------- */

interface NoteField {
  key: string;
  label: string;
  /** `learner_authored`. Verbatim, always — never trimmed, never normalised. */
  text: string;
}

interface Note {
  key: string;
  source: string;
  fields: NoteField[];
}

/** `runId` + `checkpointId` identifies exactly one committed decision. */
function recordKey(record: { runId: string; checkpointId: string }): string {
  return `${record.runId} ${record.checkpointId}`;
}

/**
 * The learner's prose for one record, in grammar order: WHY, then WHY-NOT, then
 * the post-reveal reflection.
 *
 * Absent and empty are the same thing HERE and only here — an empty string has
 * nothing to replay, so rendering a labelled blank would invent a note the
 * learner did not write. The ledger keeps the distinction (`records.ts` attaches
 * prose only when it is non-empty), which is where it matters for the export.
 */
function noteFields(record: YYDecisionRecord): NoteField[] {
  const fields: NoteField[] = [];
  const why = record.why.learnerText;
  const whyNot = record.whyNot.learnerText;
  const reflection = record.reflection?.learnerText;
  if (typeof why === "string" && why.length > 0) {
    fields.push({ key: "why", label: LABEL.why, text: why });
  }
  if (typeof whyNot === "string" && whyNot.length > 0) {
    fields.push({ key: "why-not", label: LABEL.whyNot, text: whyNot });
  }
  if (typeof reflection === "string" && reflection.length > 0) {
    fields.push({ key: "reflection", label: LABEL.reflection, text: reflection });
  }
  return fields;
}

/* -------------------------------------------------------------------------- */
/* The summary                                                                */
/* -------------------------------------------------------------------------- */

export function EvidenceSummary({
  receipts,
  resonances,
  committedCount,
  checkpointCount,
  revisedCheckpointCount,
  records,
  cases
}: {
  /**
   * The whole receipt trail, in reading order — case, then checkpoint, then
   * commit stamp. `buildReceipts()` produces exactly this order and it carries
   * no ranking.
   *
   * EVERY RECEIPT, NEVER A SUBSET. §24 forbids withholding the learner's own
   * receipts and §27 requires the COMPLETE set to stay reachable behind a
   * pattern. A replayed checkpoint therefore contributes one receipt per run
   * and both are rendered: the original judgment is not superseded, marked or
   * dimmed, because §15 makes run 1 historical evidence rather than a mistake.
   */
  receipts: readonly YYReceipt[];
  /**
   * The qualifying resonances. An empty array is the expected and frequent
   * answer, and it renders as silence rather than as a near-miss.
   */
  resonances: readonly YYResonance[];
  /** Committed decisions. Replays count, because each is a decision made. */
  committedCount: number;
  /**
   * Distinct canonical checkpoints covered. Replays do NOT count — this is the
   * number of tuning forks, and the two-checkpoint threshold is measured
   * against forks rather than strikes (§11).
   */
  checkpointCount: number;
  /**
   * Checkpoints whose committed action differs between the first run and the
   * most recent one (§21 "Revisions over time"). Zero renders nothing.
   */
  revisedCheckpointCount: number;
  /**
   * The committed records, for block 3 only.
   *
   * OPTIONAL, AND THE ONLY ROUTE TO THE LEARNER'S PROSE — see the header. Order
   * is the commit log's; the notes are re-ordered here to follow the receipt
   * trail so blocks 1 and 3 read in the same sequence.
   */
  records?: readonly YYDecisionRecord[];
  /**
   * The canonical cases, used for one thing: the case title and checkpoint
   * ordinal printed above a note. Without them a note is labelled by its
   * checkpoint id, which is still a true reference and still unique.
   */
  cases?: readonly YYCase[];
}) {
  const byCheckpoint = receiptsByCheckpoint(receipts);

  const receiptById = new Map<string, YYReceipt>();
  for (const receipt of receipts) {
    receiptById.set(receipt.id, receipt);
  }

  /* Case title and ordinal for the label above a note. Derived from the same
     canonical objects the receipts quote, so the two cannot disagree. */
  const placeById = new Map<string, string>();
  for (const kase of cases ?? []) {
    for (const checkpoint of kase.checkpoints) {
      placeById.set(checkpoint.id, `${kase.title} · checkpoint ${checkpoint.ordinal}`);
    }
  }

  /* Notes follow the receipt order. A committed record the receipt trail could
     not resolve — an unknown checkpoint, a stale content stamp — still
     contributes its prose, appended after the resolved ones. Withholding a
     learner's own words because this build could not place them would be the
     wrong failure. */
  const committed = (records ?? []).filter((record) => isRevealUnlocked(record));
  const recordByKey = new Map<string, YYDecisionRecord>();
  for (const record of committed) {
    recordByKey.set(recordKey(record), record);
  }

  const ordered: YYDecisionRecord[] = [];
  const placed = new Set<string>();
  for (const receipt of receipts) {
    const record = recordByKey.get(recordKey(receipt));
    if (!record) continue;
    ordered.push(record);
    placed.add(recordKey(record));
  }
  for (const record of committed) {
    if (!placed.has(recordKey(record))) ordered.push(record);
  }

  const notes: Note[] = [];
  for (const record of ordered) {
    const fields = noteFields(record);
    if (fields.length === 0) continue;
    notes.push({
      key: recordKey(record),
      source: placeById.get(record.checkpointId) ?? record.checkpointId,
      fields
    });
  }

  return (
    <section className={styles.summary}>
      {/* ---------------------------------------------------------------- */}
      {/* 1. Your decisions                                                */}
      {/* ---------------------------------------------------------------- */}
      <section className={styles.block}>
        <h2 className={styles.blockHeading}>{LABEL.decisions}</h2>
        {receipts.length === 0 ? (
          <p className={styles.empty}>{LABEL.noDecisions}</p>
        ) : (
          <>
            <p className={styles.meta}>{countLine(committedCount, checkpointCount)}</p>
            {revisedCheckpointCount > 0 ? (
              <p className={styles.meta}>{revisionLine(revisedCheckpointCount)}</p>
            ) : null}
            <ol className={styles.receiptList}>
              {receipts.map((receipt) => (
                <li className={styles.receiptItem} key={receipt.id}>
                  {receipt.statement}
                </li>
              ))}
            </ol>
          </>
        )}
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 2. Resonances — two independent checkpoints, or silence          */}
      {/* ---------------------------------------------------------------- */}
      <section className={styles.block}>
        <h2 className={styles.blockHeading}>{LABEL.resonances}</h2>
        {resonances.length === 0 ? (
          /* §21: "If no patterns qualify, do not manufacture a summary.
             Silence is valid." Stated as an outcome, in the same register as
             everything else on the page — no greyed panel, no "not yet", no
             adverb, and nothing that reads as a threshold the learner missed. */
          <div className={styles.silence}>
            <p className={styles.silenceLine}>{LABEL.silenceLead}</p>
            <p className={styles.silenceLine}>{LABEL.silenceEvidence}</p>
            <p className={styles.silenceLine}>{LABEL.silenceWhere}</p>
          </div>
        ) : (
          <ul className={styles.resonanceList}>
            {resonances.map((resonance) => {
                const supporting = resonance.supportingReceiptIds
    .map((id) => receiptById.get(id))
    .filter((receipt): receipt is YYReceipt => receipt !== undefined);

  /*
   * A RESONANCE THAT CANNOT SHOW ITS EVIDENCE IS NOT RENDERED.
   *
   * Unresolved receipt ids were being dropped silently, so a resonance could
   * reach the screen claiming two supporting checkpoints while displaying one
   * supporting receipt — or none. That is the exact shape of the claim this
   * product exists to refuse: a pattern asserted about a learner that they
   * cannot audit back to their own decisions.
   *
   * Failing closed here is belt-and-braces with the fix in `resonance.ts`,
   * deliberately. The engine now shares one definition of "committed" with the
   * receipt builder, so this should be unreachable — and it is checked anyway,
   * because the cost of being wrong is a fabricated-looking pattern and the
   * cost of the check is one comparison.
   */
  if (supporting.length < RESONANCE_THRESHOLD) return null;

              /* The denominator minus the numerator: committed checkpoints
                 where this action was available and the learner did something
                 else. Never dropped to make the sentence read cleaner. */
              const supportingCheckpoints = new Set(resonance.supportingCheckpointIds);
              const otherReceipts = (resonance.relevantCheckpointIds ?? [])
                .filter((checkpointId) => !supportingCheckpoints.has(checkpointId))
                .flatMap((checkpointId) => byCheckpoint.get(checkpointId) ?? []);

              const definition = EVIDENCE_TAG_INDEX[resonance.evidenceTag]?.definition;

              return (
                <li className={styles.resonanceItem} key={resonance.id}>
                  <p className={styles.resonanceStatement}>{resonance.statement}</p>
                  {/* The tag's own action definition, authored in `content/`.
                      It says what the observed action IS, in verb terms, so an
                      expanded resonance answers "why does it say that" with a
                      definition and a list of decisions rather than with an
                      assertion. */}
                  {definition ? <p className={styles.resonanceDefinition}>{definition}</p> : null}

                  <details className={styles.evidence}>
                    <summary className={styles.evidenceToggle}>{LABEL.evidenceToggle}</summary>
                    <div className={styles.evidencePanel}>
                      <div className={styles.evidenceGroup}>
                        <p className={styles.evidenceGroupLabel}>{LABEL.supporting}</p>
                        <ul className={styles.evidenceList}>
                          {supporting.map((receipt) => (
                            <li className={styles.evidenceItem} key={receipt.id}>
                              {receipt.statement}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {otherReceipts.length > 0 ? (
                        <div className={styles.evidenceGroup}>
                          <p className={styles.evidenceGroupLabel}>{LABEL.otherRelevant}</p>
                          <ul className={styles.evidenceList}>
                            {otherReceipts.map((receipt) => (
                              <li className={styles.evidenceItem} key={receipt.id}>
                                {receipt.statement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 3. The learner's own words, verbatim                             */}
      {/* ---------------------------------------------------------------- */}
      {notes.length > 0 ? (
        <section className={styles.block}>
          <h2 className={styles.blockHeading}>{learnerWordsBlock.heading}</h2>
          <p className={styles.notesNote}>{learnerWordsBlock.note}</p>
          <ul className={styles.noteList}>
            {notes.map((note) => (
              <li className={styles.noteItem} key={note.key}>
                <p className={styles.noteSource}>{note.source}</p>
                {note.fields.map((field) => (
                  <div className={styles.noteField} key={field.key}>
                    <p className={styles.noteLabel}>{field.label}</p>
                    {/* `.noteText` sets `white-space: pre-wrap`. That is how
                        "preserved exactly as you wrote them" survives contact
                        with HTML, and it is load-bearing for a promise rather
                        than for a look. */}
                    <p className={styles.noteText}>{field.text}</p>
                  </div>
                ))}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className={styles.closingLine}>{deterministicSummaryFraming.closingLine}</p>
    </section>
  );
}
