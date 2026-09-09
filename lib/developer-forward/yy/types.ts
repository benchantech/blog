/**
 * Developer Forward Lite — the YY Method™ type contract.
 *
 * `CAPTURE → WHY → WHY-NOT → COMMIT → TIMESTAMP` is not a metaphor here and not
 * a naming convention: it is the literal shape of every checkpoint, the stored
 * record, the export, and the tests. The governing addendum
 * (`TRUST_FORWARD_LITE_YY_METHOD_ADDENDUM_2026-09-08.md` §6) is explicit that
 * these must not be reduced to `question` / `answer` / `feedback` — "the
 * epistemic structure is intentional", and a generic quiz shape would erase the
 * one thing that makes the record worth exporting.
 *
 * WHAT REPLACED SHIP, AND WHY IT IS NOT A NUMBER. The previous architecture
 * reduced eleven answers to six ternary dimensions and four bits. The addendum
 * removes that from the required path entirely (§8) and forbids inventing
 * replacement weights (§29). What takes its place is not a smaller score — it
 * is *evidence*: a receipt per committed choice, and a resonance only where two
 * INDEPENDENT checkpoints carry the same observable pattern.
 *
 *   One point is evidence. Two independent points can become a pattern.
 *   One tuning fork sounds; two tuning forks resonate.
 *
 * Pure TypeScript. No React, no JSX, no CSS import — the suite runs as
 * `node --import tsx --test tests/*.test.ts` and cannot load a `.css` specifier.
 */

/* -------------------------------------------------------------------------- */
/* 1. Provenance                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Every substantive object carries one of these. Five, not four: the addendum
 * declares `BEN AUTHORED` as covering "lived/**composite** facts supplied by
 * Ben", and this build splits that into two values rather than one.
 *
 * The split is the whole enforcement mechanism for the compositing policy
 * (`docs/developer-forward-compositing-policy.md`). Narrative may be composited to
 * protect real clients; decision logic may not, because Ben THEN and Ben NOW are
 * facts about his judgment rather than about anyone else, and compositing them
 * would make the product's central claim untrue. With one shared value that
 * distinction would live in a comment. With two it is data, and
 * `tests/developer-forward-yy-content.test.ts` fails the build if a choice, a THEN,
 * a NOW or a condition is ever marked composite.
 */
export type YYProvenance =
  | "ben_authored"
  | "ben_authored_composite"
  | "ai_synthesis_from_ben_reasoning"
  | "learner_authored"
  | "deterministic_derivation";

export const YY_PROVENANCES: readonly YYProvenance[] = [
  "ben_authored",
  "ben_authored_composite",
  "ai_synthesis_from_ben_reasoning",
  "learner_authored",
  "deterministic_derivation"
];

/** The provenances the DECISION layer may carry. Never composite, never AI. */
export const DECISION_LAYER_PROVENANCES: readonly YYProvenance[] = ["ben_authored"];

/* -------------------------------------------------------------------------- */
/* 2. The method declaration (§6)                                             */
/* -------------------------------------------------------------------------- */

export type YYStage = "capture" | "why" | "why_not" | "commit" | "timestamp";

export const YY_STAGES: readonly YYStage[] = ["capture", "why", "why_not", "commit", "timestamp"];

export interface YYMethodDeclaration {
  id: "yy-method";
  name: "YY Method™";
  canonicalDoctrine: string;
  implementation: "developer-forward-case-grammar";
  canonicalImplementation: string;
  stages: readonly YYStage[];
}

/* -------------------------------------------------------------------------- */
/* 3. Cases and checkpoints                                                   */
/* -------------------------------------------------------------------------- */

/** Four options per checkpoint, not three. */
export type ChoiceLabel = "A" | "B" | "C" | "D";

export const CHOICE_LABELS: readonly ChoiceLabel[] = ["A", "B", "C", "D"];

/**
 * A deterministic tag describing the ACTION a choice takes.
 *
 * Describes the selected action, never the learner's identity or motive
 * (§9.1). The taxonomy is compiled from the actual Ben-authored choices rather
 * than invented up front, because a taxonomy invented first would quietly
 * reshape the cases to fit it.
 */
export type EvidenceTag = string;

export interface YYChoice {
  id: string;
  label: ChoiceLabel;
  text: string;
  provenance: YYProvenance;
  evidenceTags: readonly EvidenceTag[];
}

/**
 * Ben's judgment at a point in time.
 *
 * THEN and NOW are separate records and never merged. NOW does not erase THEN,
 * and NOW is not automatically superior — the DIFFERENCE between them is the
 * evidence that judgment legitimately changes when tools, economics,
 * experience, information or responsibility change.
 */
export interface BenJudgment {
  choiceLabel: ChoiceLabel;
  reasoning: string;
  provenance: YYProvenance;
}

/** Why an unchosen option would have been reasonable. Conditional, never ranked. */
export interface AlternativeCondition {
  label: ChoiceLabel;
  condition: string;
  provenance: YYProvenance;
}

export interface YYCheckpoint {
  id: string;
  caseId: string;
  ordinal: number;
  /**
   * The situation as it existed AT THE DECISION POINT.
   *
   * Composited under the recorded policy; carries `ben_authored_composite`.
   * It must never contain a later fact, an outcome, Ben THEN, Ben NOW, or
   * framing that telegraphs a preferred answer — CAPTURE's whole job is to
   * protect the historical decision boundary, and a leak here silently turns
   * the learner's judgment into a reading-comprehension answer.
   */
  capture: string;
  captureProvenance: YYProvenance;
  /** The prompt is fixed across every checkpoint: "What would you do in my shoes?" */
  choices: readonly YYChoice[];
  benThen: BenJudgment;
  benNow: BenJudgment;
  conditions: readonly AlternativeCondition[];
}

export interface YYCase {
  id: string;
  ordinal: number;
  title: string;
  role: string;
  emphasis: string;
  checkpoints: readonly YYCheckpoint[];
  /** Ben-authored closing narrative. Shown after the last checkpoint commits. */
  ending: string;
  endingProvenance: YYProvenance;
}

/* -------------------------------------------------------------------------- */
/* 4. The learner's record                                                    */
/* -------------------------------------------------------------------------- */

/**
 * One committed checkpoint, in YY stage order (§26).
 *
 * `runId` is what keeps replay honest. A replay produces a NEW record with a new
 * `runId`; it never overwrites the original, and it never counts as a second
 * independent tuning fork (§11) — replaying the same checkpoint is the same
 * fork struck twice, not two forks.
 */
export interface YYDecisionRecord {
  caseId: string;
  checkpointId: string;
  runId: string;
  capture: { canonicalSituationId: string };
  why: { choiceId: string; learnerText?: string };
  whyNot: { closestAlternativeChoiceId: string; learnerText?: string };
  commit: { committedAtLocal: string };
  timestamp: { benThenChoiceId: string; benNowChoiceId?: string };
  reflection?: { learnerText: string };
}

/* -------------------------------------------------------------------------- */
/* 5. Derived evidence                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Situation → observable choice/action. Nothing else.
 *
 * A receipt may not infer intention, virtue, competence, confidence,
 * personality, doctrine or psychological state (§9.2). It is a factual
 * restatement of what the learner selected, and its value is precisely that it
 * claims nothing beyond it.
 */
export interface YYReceipt {
  id: string;
  caseId: string;
  checkpointId: string;
  runId: string;
  statement: string;
  provenance: "deterministic_derivation";
}

/**
 * A pattern across INDEPENDENT checkpoints.
 *
 * Fails closed below two distinct canonical checkpoint ids (§26). That
 * threshold is the product's central epistemic commitment, not a tuning
 * parameter: a single data point that looks like a pattern is how a judgment
 * tool starts telling people who they are.
 */
export interface YYResonance {
  id: string;
  evidenceTag: EvidenceTag;
  supportingCheckpointIds: readonly string[];
  supportingReceiptIds: readonly string[];
  relevantCheckpointIds?: readonly string[];
  statement: string;
  provenance: "deterministic_derivation";
}

/** The minimum independent checkpoints a resonance requires. Two forks. */
export const RESONANCE_THRESHOLD = 2;
