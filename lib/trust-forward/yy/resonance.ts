/**
 * Trust Forward Lite — the two-tuning-fork rule, implemented.
 *
 * This module carries the load-bearing epistemic commitment of the whole
 * product, and it is deliberately the dullest arithmetic in the build:
 *
 *     One point is evidence. Two independent points can become a pattern.
 *     One tuning fork sounds; two tuning forks resonate.
 *
 * It implements `TRUST_FORWARD_LITE_YY_METHOD_ADDENDUM_2026-09-08.md` §10 (the
 * two-tuning-fork rule, "now a hard invariant"), §11 (independence), §12
 * (evidence-bounded pattern language), §16 (`DETERMINISTIC DERIVATION` covers
 * "resonance qualification" and "observable pattern summaries"), §26 (the
 * `Resonance` shape, and "must fail closed when fewer than two distinct
 * canonical checkpoint IDs support it") and §29 (no invented replacement
 * weights). The types it fills in are the shared contract in
 * `@/lib/trust-forward/yy/types`; nothing is redefined here.
 *
 * WHAT THIS FILE REFUSES TO DO, AND WHY EACH REFUSAL IS THE POINT.
 *
 *  1. **One supporting checkpoint stays silent.** Not a hedged near-pattern,
 *     not a "possible tendency", not a greyed-out card. Nothing. §10 lets a
 *     single checkpoint produce a *signal* — that is the receipt, which already
 *     exists — and forbids it becoming a pattern. A near-resonance is the same
 *     claim with a softening adverb in front of it, and softening adverbs are
 *     exactly what §12 prohibits. Below `RESONANCE_THRESHOLD` this module
 *     returns nothing rather than something weaker.
 *
 *  2. **Replay does not create independence** (§11, §15, §27). A second run of
 *     the same checkpoint is one tuning fork struck twice. Independence is
 *     counted in DISTINCT CANONICAL CHECKPOINT IDS — never records, never runs,
 *     never tags. `new Set(supportingCheckpointIds).size >= 2` is literally the
 *     addendum's own minimum, and it is the only counter in this file.
 *
 *  3. **Two tags from one answer, or an answer plus its closest alternative,
 *     never make two points** (§11). Tags are collapsed into a per-checkpoint
 *     set before anything is counted, and WHY-NOT is not read at all: the
 *     closest alternative is an option the learner considered, not an action
 *     they committed, so it supports nothing.
 *
 *  4. **Free text is never read** (§13, §27). The inputs used here are choice
 *     ids, checkpoint ids, run ids and authored tags. `learnerText` and
 *     `reflection` are structurally unreachable — not filtered downstream,
 *     never touched. Change the prose and the output is byte-identical, because
 *     the prose is never loaded.
 *
 *  5. **No score, no weight, no rank** (§8, §29). No strength field, no
 *     confidence, no ordering by frequency. Output is sorted by tag, which
 *     carries no meaning — chosen precisely because any other order would be
 *     read as a ranking, and §12 forbids turning higher frequency into a
 *     stronger claim.
 *
 * HOW REPLAY IS RESOLVED, AND WHY BY ORDER AND NOT BY TIMESTAMP. A checkpoint
 * may carry several records. §15 is explicit that "Run 1 remains historical
 * learner evidence" and "Run 2 becomes new learner evidence", so the CURRENT
 * committed action for a checkpoint is its most recent run — reporting a
 * superseded run as the learner's action would attribute to them something they
 * revised. The most recent run is taken as the LAST record for that checkpoint
 * in `records`; that is, `records` is the append-only commit log, in commit
 * order. It is deliberately NOT taken from `commit.committedAtLocal`: that
 * field is a LOCAL wall-clock string whose format is not guaranteed to sort,
 * and a mis-parsed local timestamp would silently name the wrong action as the
 * learner's current one. An ordering contract the caller can see beats a
 * comparison that merely looks safe. Superseded runs are not erased — they keep
 * their own receipts, and their checkpoint keeps its place in
 * `relevantCheckpointIds`, so the history stays inspectable.
 *
 * CONTRADICTORY EVIDENCE IS NEVER HIDDEN (§12). Every resonance carries a
 * denominator: `relevantCheckpointIds` is every checkpoint where the learner
 * committed AND the tagged action was actually on the table (some choice in
 * that checkpoint carried the tag). A checkpoint where the action was available
 * and the learner did something else stays in that set and is stated in the
 * sentence — "in 2 of 3" — instead of being quietly dropped to make it read "in
 * 2 of 2". Suppressing the disagreeing checkpoint would be the single most
 * tempting and most dishonest line of code in this file.
 *
 * WHY THE STATEMENT IS ASSEMBLED HERE AND NOT AUTHORED IN `content/`. Learner-
 * facing prose lives in `content/`. A resonance statement is not authored
 * prose: it is a deterministic derivation (§16) with exactly three variable
 * parts — two counts and the authored tag's own words — poured into one fixed
 * frame taken from §12's allowed style. There is no per-tag wording anywhere in
 * this build, and there must not be: a hand-written sentence per tag is a place
 * for an interpretation to hide. If a resonance ever needs authored copy, that
 * copy moves to `content/` and this frame goes with it.
 *
 * Pure TypeScript. No React, no JSX, no CSS import — the suite runs as
 * `node --import tsx --test tests/*.test.ts` and cannot load a `.css`
 * specifier. Same discipline as `lib/wys/telemetry.ts`.
 */

import {
  RESONANCE_THRESHOLD,
  type EvidenceTag,
  type YYCheckpoint,
  type YYDecisionRecord,
  type YYReceipt,
  type YYResonance
} from "@/lib/trust-forward/yy/types";

/* -------------------------------------------------------------------------- */
/* 1. The language guard (§12)                                                */
/* -------------------------------------------------------------------------- */

/**
 * Phrases a resonance statement may never contain.
 *
 * The first four are §12's prohibited words, verbatim and complete: "strongly,"
 * "consistently," "deeply," or "characteristically" are forbidden "unless an
 * explicit future deterministic rule and denominator justify them" — no such
 * rule exists, so they are forbidden here without exception. The rest are the
 * openings of §12's own examples of identity language ("You are cautious.",
 * "You prefer control.", "You have strong ownership instincts.").
 *
 * The guard runs against the ONE variable span of the sentence — the evidence
 * tag's own words — because the frame around it is fixed and cannot drift. A
 * tag that would smuggle identity language into a pattern statement fails
 * closed: the resonance is not surfaced. That is a deliberately blunt outcome.
 * The alternative is rewriting an authored tag to make it printable, which
 * would mean this module editing the taxonomy it exists to report.
 */
export const RESONANCE_PROHIBITED_PHRASES: readonly string[] = [
  "strongly",
  "consistently",
  "deeply",
  "characteristically",
  "you are",
  "you're",
  "you prefer",
  "you have strong"
];

/* -------------------------------------------------------------------------- */
/* 2. Deterministic identity                                                  */
/* -------------------------------------------------------------------------- */

/**
 * The receipt id for a committed record, used only when the caller does not
 * hand `resonances()` the real receipts.
 *
 * §27 requires every surfaced resonance to link to "at least two exact
 * supporting receipts from distinct checkpoints", so a resonance must never
 * carry an id that resolves to nothing. When the receipt list is supplied its
 * ids are used and this function is not consulted — that is the auditable path,
 * and callers should prefer it. This fallback exists so a resonance computed
 * without the receipt list still names its evidence by a stable, reproducible
 * id rather than by nothing at all.
 *
 * A checkpoint plus a run identifies exactly one committed decision, which is
 * exactly what a receipt is derived from, so that pair is the whole key.
 */
export function yyFallbackReceiptId(record: YYDecisionRecord): string {
  return `receipt-${record.checkpointId}-${record.runId}`;
}

/** Lower-case, hyphen-joined id fragment. Never displayed. */
function idSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * The tag as words, for the one variable span of the statement.
 *
 * Underscores and hyphens become spaces and runs of whitespace collapse.
 * Nothing else happens: no capitalisation, no pluralisation, no re-phrasing.
 * The taxonomy (§9.1) describes the ACTION a choice takes, and this module
 * prints that description rather than interpreting it.
 */
function tagPhrase(tag: EvidenceTag): string {
  return tag.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

/* -------------------------------------------------------------------------- */
/* 3. Reading the evidence                                                    */
/* -------------------------------------------------------------------------- */

/** One committed checkpoint, with its action resolved back to canonical tags. */
interface ResolvedCommitment {
  checkpoint: YYCheckpoint;
  /** The record counted as current — the last run in the commit log (§15). */
  record: YYDecisionRecord;
  /** Every tag any choice here carries. The denominator's basis. */
  availableTags: ReadonlySet<EvidenceTag>;
  /** Every tag the COMMITTED choice carries. A set: two tags, still one point. */
  committedTags: ReadonlySet<EvidenceTag>;
}

function cleanTags(tags: readonly EvidenceTag[]): EvidenceTag[] {
  const cleaned: EvidenceTag[] = [];
  for (const tag of tags) {
    if (typeof tag !== "string") continue;
    const trimmed = tag.trim();
    if (trimmed.length === 0) continue;
    cleaned.push(trimmed);
  }
  return cleaned;
}

/**
 * One resolved commitment per distinct checkpoint id.
 *
 * Anything that cannot be audited back to a canonical checkpoint and a
 * canonical choice is dropped here rather than guessed at: an unknown
 * checkpoint id, a record whose `caseId` disagrees with its checkpoint's, an
 * empty commit timestamp, or a `why.choiceId` that is not one of that
 * checkpoint's choices. A dropped record counts as neither support NOR
 * denominator — an honest numerator over a guessed denominator would be worse
 * than silence.
 */
function resolveCommitments(
  records: readonly YYDecisionRecord[],
  checkpoints: readonly YYCheckpoint[]
): Map<string, ResolvedCommitment> {
  const checkpointById = new Map<string, YYCheckpoint>();
  for (const checkpoint of checkpoints) checkpointById.set(checkpoint.id, checkpoint);

  const resolved = new Map<string, ResolvedCommitment>();

  for (const record of records) {
    const checkpoint = checkpointById.get(record.checkpointId);
    if (!checkpoint) continue;
    if (record.caseId !== checkpoint.caseId) continue;
    if (!record.commit || record.commit.committedAtLocal.trim().length === 0) continue;

    const choice = checkpoint.choices.find((candidate) => candidate.id === record.why.choiceId);
    if (!choice) continue;

    const availableTags = new Set<EvidenceTag>();
    for (const candidate of checkpoint.choices) {
      for (const tag of cleanTags(candidate.evidenceTags)) availableTags.add(tag);
    }

    // Last write wins. `records` is the commit log in order, so the last record
    // for a checkpoint is the current run (§15). Earlier runs keep their own
    // receipts, and this checkpoint keeps its place in the denominator either
    // way — a replay revises the learner's current action, it does not add a
    // second independent one.
    resolved.set(checkpoint.id, {
      checkpoint,
      record,
      availableTags,
      committedTags: new Set<EvidenceTag>(cleanTags(choice.evidenceTags))
    });
  }

  return resolved;
}

/**
 * Case, then ordinal, then id — a stable reading order that does not depend on
 * how the caller happened to arrange its arrays, and that carries no ranking.
 * Frequency deliberately plays no part in any ordering here (§12).
 */
function compareCommitments(a: ResolvedCommitment, b: ResolvedCommitment): number {
  if (a.checkpoint.caseId !== b.checkpoint.caseId) {
    return a.checkpoint.caseId < b.checkpoint.caseId ? -1 : 1;
  }
  if (a.checkpoint.ordinal !== b.checkpoint.ordinal) {
    return a.checkpoint.ordinal - b.checkpoint.ordinal;
  }
  if (a.checkpoint.id === b.checkpoint.id) return 0;
  return a.checkpoint.id < b.checkpoint.id ? -1 : 1;
}

/* -------------------------------------------------------------------------- */
/* 4. The statement (§12)                                                     */
/* -------------------------------------------------------------------------- */

function decisionsWord(count: number): string {
  return count === 1 ? "decision" : "decisions";
}

/**
 * The fixed frame, in §12's allowed style, with the denominator §12 prefers.
 *
 * An observable action, a count, and a denominator. No adverb, no adjective, no
 * inference, no prediction, no profession, no competence claim, no comparison
 * to other learners, and no statement about what the learner would do next.
 * Where a comparable checkpoint went the other way, the sentence says so in its
 * own clause rather than leaving the reader to find it in the evidence list.
 */
function resonanceStatement(tag: EvidenceTag, supporting: number, relevant: number): string {
  const otherwise = relevant - supporting;
  const opening =
    `Observed in ${supporting} of ${relevant} relevant ${decisionsWord(relevant)}: ` +
    `you committed an action recorded as "${tagPhrase(tag)}".`;
  if (otherwise <= 0) return opening;
  return (
    `${opening} In ${otherwise} other relevant ${decisionsWord(otherwise)} ` +
    `you committed a different action.`
  );
}

function statementIsPermitted(tag: EvidenceTag): boolean {
  const haystack = ` ${tagPhrase(tag).toLowerCase()} `;
  return !RESONANCE_PROHIBITED_PHRASES.some((phrase) => haystack.includes(phrase.toLowerCase()));
}

/* -------------------------------------------------------------------------- */
/* 5. Resonance                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Every qualifying resonance across a learner's committed record. Possibly none.
 *
 * A tag qualifies when at least `RESONANCE_THRESHOLD` DISTINCT canonical
 * checkpoints carry it on their committed choice. Distinct checkpoints — not
 * records, not runs, not tags, not an answer plus its closest alternative.
 * Below the threshold a tag produces nothing at all: `[]` is a valid and
 * frequent answer, and §21 says so in as many words ("If no patterns qualify,
 * do not manufacture a summary. Silence is valid.").
 *
 * Pass `receipts` whenever they exist. `supportingReceiptIds` are then the real
 * receipt ids of the exact committed runs that support the pattern, which is
 * what makes a learner's "why does it say that?" answerable down to the
 * individual decision (§21, §27). Without them the ids fall back to
 * `yyFallbackReceiptId`.
 *
 * Pure and total: same inputs, byte-identical output. No clock, no randomness,
 * no storage, no learner prose.
 */
export function resonances(
  records: readonly YYDecisionRecord[],
  checkpoints: readonly YYCheckpoint[],
  receipts: readonly YYReceipt[] = []
): readonly YYResonance[] {
  const commitments = Array.from(resolveCommitments(records, checkpoints).values()).sort(
    compareCommitments
  );
  if (commitments.length < RESONANCE_THRESHOLD) return [];

  const receiptIdByRun = new Map<string, string>();
  for (const receipt of receipts) {
    receiptIdByRun.set(`${receipt.checkpointId} ${receipt.runId}`, receipt.id);
  }
  const receiptIdFor = (record: YYDecisionRecord): string => {
    const supplied = receiptIdByRun.get(`${record.checkpointId} ${record.runId}`);
    return supplied === undefined ? yyFallbackReceiptId(record) : supplied;
  };

  // Every tag any committed checkpoint could have produced, sorted — so output
  // order is a property of the evidence and not of the input's arrangement.
  const candidateTags = new Set<EvidenceTag>();
  for (const commitment of commitments) {
    for (const tag of commitment.availableTags) candidateTags.add(tag);
  }

  const surfaced: YYResonance[] = [];
  const usedIds = new Set<string>();

  for (const tag of Array.from(candidateTags).sort()) {
    const supporting = commitments.filter((commitment) => commitment.committedTags.has(tag));

    // The hard invariant, and the only counter in this module. Distinct
    // canonical checkpoint ids decide it; `commitments` already holds one entry
    // per checkpoint, so replay cannot inflate this even in principle.
    const distinctSupportingCheckpointIds = new Set(
      supporting.map((commitment) => commitment.checkpoint.id)
    );
    if (distinctSupportingCheckpointIds.size < RESONANCE_THRESHOLD) continue;

    // The denominator: every committed checkpoint where this action was on the
    // table. Supporting is a subset of it by construction, and the difference is
    // precisely the contradictory evidence §12 forbids hiding.
    const relevant = commitments.filter((commitment) => commitment.availableTags.has(tag));

    if (!statementIsPermitted(tag)) continue;

    const base = idSlug(tag);
    let id = base.length === 0 ? "resonance" : `resonance-${base}`;
    if (usedIds.has(id)) {
      // Two distinct tags can slug to one string. Disambiguate deterministically
      // rather than overwrite: an id must resolve to exactly one evidence set.
      let suffix = 2;
      while (usedIds.has(`${id}-${suffix}`)) suffix += 1;
      id = `${id}-${suffix}`;
    }
    usedIds.add(id);

    surfaced.push({
      id,
      evidenceTag: tag,
      supportingCheckpointIds: supporting.map((commitment) => commitment.checkpoint.id),
      supportingReceiptIds: supporting.map((commitment) => receiptIdFor(commitment.record)),
      relevantCheckpointIds: relevant.map((commitment) => commitment.checkpoint.id),
      statement: resonanceStatement(tag, supporting.length, relevant.length),
      provenance: "deterministic_derivation"
    });
  }

  return surfaced;
}
