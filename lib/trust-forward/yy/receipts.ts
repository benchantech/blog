/**
 * Trust Forward Lite — deterministic YY receipts (governing addendum
 * `TRUST_FORWARD_LITE_YY_METHOD_ADDENDUM_2026-09-08.md` §9.2, §13, §14, §29).
 *
 * Pure TypeScript. No React, no JSX, no CSS import, no component import — the
 * suite runs as `node --import tsx --test tests/*.test.ts` and Node cannot load
 * a `.css` specifier. Same discipline as `lib/trust-forward/receipts.ts`, which
 * this module is the YY-grammar sibling of.
 *
 * THE WHOLE RULE, AND IT IS ONE LINE:
 *
 *     Situation -> observable choice/action. Nothing else.
 *
 * §9.2 then names the seven things a receipt may not infer — intention, virtue,
 * competence, confidence, personality, doctrine, psychological state — and
 * every one of them is a thing a statement acquires by ADDING A CLAUSE. So this
 * module composes a receipt out of exactly two spans and joins them with fixed
 * connective text: a situation reference, and the learner's own selected
 * action, quoted from the Ben-authored choice. There is no adjective, no
 * summary verb, no "you tend to", no ranking against Ben, and no adverb of
 * degree — because the fastest way to smuggle a judgment label back into a
 * receipt is to describe the choice instead of restating it.
 *
 * WHY THE ACTION IS QUOTED AND NOT PARAPHRASED. A paraphrase of "ask for an
 * internal meeting to hammer out the details before committing to the deadline"
 * is a summary, and a summary is a judgment about what mattered in it. Quoting
 * the choice keeps the receipt auditable back to the exact option the learner
 * clicked, which is also what §27's "pattern evidence is auditable" needs
 * downstream — a resonance links to receipts, and a receipt has to link to
 * something real.
 *
 * RECEIPTS ARE NEVER DERIVED FROM LEARNER FREE TEXT (§13, absolute; §29 "use
 * free text for deterministic tagging" is on the forbidden list). That is
 * enforced by the TYPE, not by care: every function here takes
 * `FrozenJudgment` from `./records.ts`, which carries the ids, the closest
 * alternative and the commit stamp and has no `learnerText` field at any
 * depth. A whole `YYDecisionRecord` is assignable to it, so callers pass
 * records around normally — but the prose is not in scope inside this file,
 * so no future edit can reach it, and the required test ("changing WHY,
 * WHY-NOT or reflection prose must never change a receipt") can only stay
 * honest because there is nothing here for the prose to change.
 *
 * DETERMINISTIC MEANS DETERMINISTIC. Same record plus same content produces a
 * byte-identical statement on every platform and every run: the id is derived
 * from `runId` and `checkpointId` rather than minted, nothing consults a clock,
 * a locale, a collator or a random source, and the sort has a total order so
 * two receipts can never swap places between runs.
 *
 * ONE RECEIPT PER COMMITTED CHOICE, AND REPLAY GETS ITS OWN. Two runs of the
 * same checkpoint produce two receipts with two ids, because §15 keeps run 1 as
 * historical learner evidence rather than replacing it. They are still ONE
 * tuning fork: they share a `checkpointId`, and §11's independence rule counts
 * distinct canonical checkpoints, not receipts. Nothing in this module dedupes
 * them and nothing here counts them — the counting lives in the resonance
 * layer, and it must read `checkpointId`, never the length of a receipt list.
 *
 * WHERE THE SITUATION CLAUSE COMES FROM, AND WHAT HAPPENS WHEN IT IS ABSENT.
 * The addendum's worked example opens "When a legacy SaaS export deadline was
 * requested before the permission behavior was fully understood, …" — a short
 * situation summary, not the whole CAPTURE paragraph. The shared contract
 * (`./types.ts`) has no field for one: `YYCheckpoint` carries the full
 * composited `capture` narrative and nothing shorter. So a summary is supplied
 * from `content/`, through `YYReceiptOptions.situationSummaries`, and this
 * module authors none of them.
 *
 * When a checkpoint has no summary, the receipt does NOT invent one and does
 * NOT excerpt the capture. Truncating Ben's narrative to its first sentence
 * would be a paraphrase chosen by a regular expression, and it would change
 * what the situation was. Instead the receipt NAMES the situation — the case
 * title and the checkpoint ordinal, both canonical — and states the action.
 * That is still "situation -> observable choice/action": the situation is
 * identified rather than described, which is weaker prose and exactly as true.
 * Dropping the receipt instead was the other option and it is worse: §21's
 * final summary is a factual count of the learner's committed decisions, and a
 * missing receipt would make that count wrong about something the learner
 * actually did.
 *
 * THE PROVENANCE SAYS HOW THE STATEMENT WAS PRODUCED, NOT WHERE ITS WORDS CAME
 * FROM. A receipt is `deterministic_derivation` even though its action clause
 * is Ben-authored verbatim and its situation clause may be Ben-composited
 * (§16). The claim being made is that this sentence was assembled by a rule
 * with no interpretation in it — which is precisely the claim a learner needs
 * to be able to check.
 */

import type { FrozenJudgment } from "@/lib/trust-forward/yy/records";
import { isRevealUnlocked } from "@/lib/trust-forward/yy/records";
import type {
  YYCase,
  YYCheckpoint,
  YYProvenance,
  YYReceipt
} from "@/lib/trust-forward/yy/types";

/* -------------------------------------------------------------------------- */
/* 1. The connective frame                                                    */
/* -------------------------------------------------------------------------- */

/**
 * The fixed joining text. Exported so a test can assert the exact strings and
 * so a reader can see the entire vocabulary this module is allowed to add to a
 * learner's record in one place — it is eleven words, and it is all of them.
 *
 * Every fragment is structural: a subordinator, a verb of selection, a
 * possessive. None of them characterises the choice, and none can be made to
 * by a different choice being plugged in. "you chose to" is the strongest
 * phrasing available that stays observable; "you decided to", "you opted to"
 * and "you preferred to" all import a claim about deliberation.
 *
 * These live here rather than in `content/` because they are not content: they
 * are the composition rule, they are asserted by tests, and a receipt whose
 * grammar could be re-authored per stamp would stop being deterministic across
 * stamps. The learner-facing MATERIAL — the situation summaries and the choice
 * text — comes from `content/` in both branches below.
 */
export const YY_RECEIPT_FRAME = {
  /** Precedes a content-supplied situation summary. */
  summaryLead: "When ",
  /** Precedes a canonical situation reference when no summary was supplied. */
  namedLead: "In ",
  /** Joins either situation form to the action. */
  actionJoin: ", you chose to ",
  /** Opens the closest-alternative sentence (§9.2's second example, §14). */
  alternativeLead: "Your closest alternative was to "
} as const;

/* -------------------------------------------------------------------------- */
/* 2. Situation summaries — authored in content/, never here                   */
/* -------------------------------------------------------------------------- */

/**
 * A short situation clause for one checkpoint, written to sit after "When ".
 *
 * The authoring contract, because a summary that breaks it produces a
 * malformed sentence rather than a wrong one, and a malformed sentence is the
 * kind of defect that ships:
 *
 *   - it completes "When ___, you chose to …", so it is a clause and not a
 *     sentence: no leading capital, no trailing punctuation;
 *   - it describes the situation AS IT EXISTED AT THE DECISION POINT and
 *     carries no outcome, no Ben THEN, no Ben NOW and no framing that
 *     telegraphs an answer — the same boundary `capture` holds, for the same
 *     reason: a later fact leaking in turns judgment into recall;
 *   - it is composited under `docs/trust-forward-compositing-policy.md` and
 *     may be NO MORE SPECIFIC than the capture it summarises. It introduces no
 *     number, name, place or date the capture does not already carry.
 *
 * `provenance` is `ben_authored_composite` for a summary of composited
 * narrative and `ben_authored` for one that is verbatim. It is recorded
 * per-summary rather than assumed, because assuming it is how a composite
 * quietly becomes an attribution to Ben.
 */
export interface YYSituationSummary {
  checkpointId: string;
  /** The clause that completes "When ___, you chose to …". */
  text: string;
  provenance: Extract<YYProvenance, "ben_authored" | "ben_authored_composite">;
}

export type YYSituationSummaryIndex = ReadonlyMap<string, YYSituationSummary>;

export function situationSummaryIndex(summaries: readonly YYSituationSummary[]): YYSituationSummaryIndex {
  return new Map(summaries.map((summary) => [summary.checkpointId, summary]));
}

/**
 * True for a summary that satisfies the authoring contract above.
 *
 * Checked rather than trusted: a summary with a trailing full stop produces
 * "When the deadline was set., you chose to …", which reads as a bug in the
 * product to the one person whose record it is.
 */
export function isSituationSummary(value: YYSituationSummary | null | undefined): boolean {
  if (!value || typeof value.text !== "string") return false;
  const text = value.text.trim();
  if (text.length === 0 || text !== value.text) return false;
  if (/[.!?]$/.test(text)) return false;
  return text[0] === text[0].toLowerCase();
}

/* -------------------------------------------------------------------------- */
/* 3. Composition                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Lower the first letter of a choice so it can follow "you chose to".
 *
 * The source choices are inconsistent about their opening capital — Case 1
 * checkpoint 1 begins "accept and move immediately…", checkpoint 2 begins
 * "Trust the permissions model…" — because they were authored to sit under a
 * label, not inside a sentence. Rendering "you chose to Trust the permissions
 * model" would be sloppy in the one artefact the learner is meant to keep.
 *
 * This is a rendering normalisation of a DERIVED sentence, not an edit to
 * Ben's choice: the choice text in `content/` is untouched, and §29's "rewrite
 * Ben's learner-facing choices" is about the options the learner is shown.
 *
 * THE GUARD IS THE POINT. The first word is lowered ONLY when it is longer
 * than one character and its remaining letters are already lowercase. So
 * "Trust" -> "trust", while "AI", "I", "PHP" and "SQL" are left exactly as
 * written. A blanket `toLowerCase()` on the first character would quietly
 * damage an acronym in a choice this file has never seen.
 */
export function lowerLeadingWord(text: string): string {
  const match = /^([A-Za-z]+)/.exec(text);
  if (!match) return text;
  const word = match[1];
  if (word.length < 2) return text;
  if (word.slice(1) !== word.slice(1).toLowerCase()) return text;
  return word[0].toLowerCase() + text.slice(1);
}

/** Terminate a composed sentence without doubling punctuation the source already carries. */
function terminate(text: string): string {
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function choiceText(checkpoint: YYCheckpoint, choiceId: string): string | null {
  for (const choice of checkpoint.choices) if (choice.id === choiceId) return choice.text;
  return null;
}

/**
 * The canonical situation reference used when no summary was supplied.
 *
 * `In "IT'S JUST A SMALL CHANGE" (checkpoint 2)`. Both halves are canonical
 * content, so this names a real situation the learner can go back and read; it
 * makes no claim about what the situation contained.
 */
function namedSituation(caseTitle: string, checkpoint: YYCheckpoint): string {
  return `${YY_RECEIPT_FRAME.namedLead}"${caseTitle}" (checkpoint ${checkpoint.ordinal})`;
}

export interface YYReceiptOptions {
  /** Content-supplied situation clauses, by checkpoint id. Absent is a supported state. */
  situationSummaries?: YYSituationSummaryIndex;
  /**
   * Append the closest-alternative sentence. Default true.
   *
   * §14 makes the WHY-NOT required by default because it "materially
   * strengthens the YY record while remaining deterministic and
   * low-disclosure", and §9.2 explicitly permits stating it factually. The
   * flag exists so a surface with a hard space constraint can render the
   * primary sentence alone — never so the alternative can be discarded from
   * the record, which is the ledger's business and not this module's.
   */
  includeClosestAlternative?: boolean;
}

/** `rcp:run_…:case-1-checkpoint-2`. Derived, never minted — the same commit yields the same id. */
export function receiptId(runId: string, checkpointId: string): string {
  return `rcp:${runId}:${checkpointId}`;
}

/**
 * The closest-alternative sentence, on its own.
 *
 * Exposed separately so a surface can place it apart from the primary
 * statement without re-deriving it, and so a test can assert it in isolation.
 * It states WHICH option was second and nothing about why — §14 is explicit
 * that Lite "must not infer why the second choice was close", and any clause
 * after the option text would be exactly that inference.
 */
export function closestAlternativeStatement(checkpoint: YYCheckpoint, source: FrozenJudgment): string | null {
  const text = choiceText(checkpoint, source.whyNot.closestAlternativeChoiceId);
  if (text === null) return null;
  return terminate(`${YY_RECEIPT_FRAME.alternativeLead}${lowerLeadingWord(text)}`);
}

/**
 * One receipt for one committed choice.
 *
 * Returns `null` rather than a partial receipt in the three cases where an
 * honest one cannot be built, and every one of them is a fail-closed:
 *
 *   - the record is not a valid frozen commit (`isRevealUnlocked`). The same
 *     gate that guards Ben's reveal guards the receipt, deliberately: both are
 *     things that may only exist after COMMIT, and two definitions of
 *     "committed" would eventually disagree;
 *   - the checkpoint does not match the record. A receipt built against the
 *     wrong checkpoint would attribute a real choice to a situation that was
 *     never presented;
 *   - the selected `choiceId` is not one of that checkpoint's options — a
 *     stream written against an older content stamp. Rather than name the
 *     option by id, or by its position, the receipt is withheld: the whole
 *     value of the artefact is that it quotes what the learner actually chose.
 */
export function buildReceipt(
  kase: YYCase,
  checkpoint: YYCheckpoint,
  source: FrozenJudgment,
  options: YYReceiptOptions = {}
): YYReceipt | null {
  if (!isRevealUnlocked(source)) return null;
  if (checkpoint.id !== source.checkpointId || checkpoint.caseId !== source.caseId) return null;
  if (kase.id !== source.caseId) return null;

  const chosen = choiceText(checkpoint, source.why.choiceId);
  if (chosen === null) return null;

  const summary = options.situationSummaries?.get(checkpoint.id);
  const situation =
    summary && isSituationSummary(summary)
      ? `${YY_RECEIPT_FRAME.summaryLead}${summary.text}`
      : namedSituation(kase.title, checkpoint);

  let statement = terminate(`${situation}${YY_RECEIPT_FRAME.actionJoin}${lowerLeadingWord(chosen)}`);

  if (options.includeClosestAlternative !== false) {
    const alternative = closestAlternativeStatement(checkpoint, source);
    if (alternative) statement = `${statement} ${alternative}`;
  }

  return Object.freeze({
    id: receiptId(source.runId, source.checkpointId),
    caseId: source.caseId,
    checkpointId: source.checkpointId,
    runId: source.runId,
    statement,
    provenance: "deterministic_derivation"
  });
}

/* -------------------------------------------------------------------------- */
/* 4. The trail                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Every receipt the learner's committed records support, in a stable order.
 *
 * THE ORDER IS A TOTAL ORDER, on purpose. Case ordinal, then checkpoint
 * ordinal, then commit stamp, then `runId` as the final tie-break. The first
 * three are the reading order of the course and of the export; the fourth
 * exists because two runs of one checkpoint committed inside the same second
 * would otherwise be ordered by whatever `Array.prototype.sort` happened to do
 * on that engine, and a receipt trail that reorders itself between two renders
 * of the same data is not evidence of anything.
 *
 * Compared with `<` on the raw strings rather than `localeCompare`: the stamps
 * are fixed-width and the ids are ASCII tokens, and a collator would make the
 * order depend on the learner's locale.
 *
 * NO RECEIPT IS EVER DROPPED FROM THIS LIST TO MAKE A POINT. §29 forbids
 * hiding contradictory evidence, and §27 requires that where comparable
 * checkpoints contain different actions the learner can inspect the COMPLETE
 * receipt set behind a pattern. A surface may highlight a subset; it must
 * always be able to reach this.
 */
export function buildReceipts(
  cases: readonly YYCase[],
  sources: readonly FrozenJudgment[],
  options: YYReceiptOptions = {}
): YYReceipt[] {
  const caseById = new Map(cases.map((kase) => [kase.id, kase]));
  const checkpointById = new Map<string, YYCheckpoint>();
  const caseOrdinal = new Map<string, number>();
  const checkpointOrdinal = new Map<string, number>();

  for (const kase of cases) {
    caseOrdinal.set(kase.id, kase.ordinal);
    for (const checkpoint of kase.checkpoints) {
      checkpointById.set(checkpoint.id, checkpoint);
      checkpointOrdinal.set(checkpoint.id, checkpoint.ordinal);
    }
  }

  const rows: { receipt: YYReceipt; source: FrozenJudgment }[] = [];
  for (const source of sources) {
    const kase = caseById.get(source.caseId);
    const checkpoint = checkpointById.get(source.checkpointId);
    if (!kase || !checkpoint) continue;
    const receipt = buildReceipt(kase, checkpoint, source, options);
    if (receipt) rows.push({ receipt, source });
  }

  rows.sort((left, right) => {
    const byCase = (caseOrdinal.get(left.source.caseId) ?? 0) - (caseOrdinal.get(right.source.caseId) ?? 0);
    if (byCase !== 0) return byCase;
    const byCheckpoint =
      (checkpointOrdinal.get(left.source.checkpointId) ?? 0) - (checkpointOrdinal.get(right.source.checkpointId) ?? 0);
    if (byCheckpoint !== 0) return byCheckpoint;
    const leftAt = left.source.commit.committedAtLocal;
    const rightAt = right.source.commit.committedAtLocal;
    if (leftAt !== rightAt) return leftAt < rightAt ? -1 : 1;
    if (left.source.runId !== right.source.runId) return left.source.runId < right.source.runId ? -1 : 1;
    return 0;
  });

  return rows.map((row) => row.receipt);
}

/**
 * Receipts grouped by canonical checkpoint, insertion-ordered.
 *
 * The shape the resonance layer needs, and it is shaped this way to make the
 * independence rule hard to get wrong: the KEY is the canonical checkpoint id,
 * so `map.size` is the number of distinct tuning forks and the length of any
 * one value is the number of times a single fork was struck. §11 says replays
 * of one checkpoint are not a second independent point, and a caller that
 * counts keys cannot accidentally count strikes.
 */
export function receiptsByCheckpoint(receipts: readonly YYReceipt[]): Map<string, YYReceipt[]> {
  const grouped = new Map<string, YYReceipt[]>();
  for (const receipt of receipts) {
    const existing = grouped.get(receipt.checkpointId);
    if (existing) existing.push(receipt);
    else grouped.set(receipt.checkpointId, [receipt]);
  }
  return grouped;
}

/** Every receipt from one run, in the order `buildReceipts` produced them. */
export function receiptsForRun(receipts: readonly YYReceipt[], runId: string): YYReceipt[] {
  return receipts.filter((receipt) => receipt.runId === runId);
}
