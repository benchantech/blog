/**
 * Developer Forward Lite — the 33 factual receipt phrases, one per fixed option.
 *
 * Pure TypeScript. No React, no JSX, no CSS import, no component import — the
 * suite runs as `node --import tsx --test tests/*.test.ts` and Node cannot load
 * a `.css` specifier. Same discipline as `lib/wys/telemetry.ts`.
 *
 * THE RULE THESE PHRASES MUST SATISFY. Ben's approved receipt invariant
 * (`07_transition-copy-import-telemetry-resolution-2026-09-07/
 * receipt-authoring-and-export.BEN_APPROVED.json`, approved 2026-09-07) is one
 * sentence:
 *
 *     "Situation -> observable choice/action. Nothing else."
 *
 * The same ruling names what is FORBIDDEN, and the list is the reason this file
 * reads flatly: no inferred intention, no praise, no judgment label, no
 * doctrine, and no because-explanation. A receipt is the learner's own action
 * handed back to them, not a verdict on it. "You chose a limited, reversible
 * release path." is a receipt; "You were appropriately cautious." is a verdict
 * wearing a receipt's grammar, and it is exactly the sentence this rule exists
 * to keep off the result page.
 *
 * NO RECEIPT-STRENGTH FIELD. The same ruling lists "receipt strength" among the
 * forbidden items — it was explicitly dropped, so `RECEIPT_PHRASES` is a bare
 * `string` per option and there is nowhere to put a weight. Ordering is not a
 * property of the phrase: `Receipt.shipContribution` in
 * `@/lib/developer-forward/types` is computed from the SHIP axes at result time,
 * and the ruling's `highlightSort` is SHIP contribution, then later case, then
 * stable authored order. Do not reintroduce a strength, salience or rank field
 * here to influence that.
 *
 * ONE PHRASE PER FIXED OPTION, ALWAYS. The ruling's export block is
 * `allDecisionReceipts: true`, `count: 11`, ordered case then decision: every
 * answered decision on the active path produces a receipt, not just the
 * flattering ones. That is only possible if the table is total, so all 33 cells
 * are filled and none may be blanked.
 *
 * RECEIPTS NEVER COME FROM REFLECTIONS. Learner reflection text is declared,
 * local-only and never scored (`LiteDataset.drafts`); a receipt is derived from
 * the FIXED answer alone. Nothing in this module reads learner text, and
 * nothing may be added that does.
 *
 * PROVENANCE. These 33 phrases are `implementation_authored_under_ben_approved_rule`.
 * They are deliberately NOT `recovered_prior_authoring` and NOT `ben_canonical`:
 * the SC-TF1 approval of 2026-09-07 covers the recovered five-case authoring and
 * explicitly excludes these, which remain governed by SC-TF5
 * (`06_full-five-case-authoring-extraction-2026-09-07/
 * SC_TF1_APPROVAL_RECORD_2026-09-07.md`, "They were not included in this
 * approval."). What authorises them is the invariant above, not Ben's pen. The
 * source records also carry `status: "MARKED_DRAFT"` and `renderGate: "SC-TF1"`;
 * those two fields are the public-render gate, not text, and are not stored here
 * — the gate belongs to whatever decides to render, not to the strings.
 *
 * Ported verbatim from
 * `03_codex-completion-handoff-2026-09-07/drafts/33-receipt-phrases.MARKED_DRAFT.json`.
 * Do not rewrite a phrase to sound warmer.
 */

import type { DecisionId, OptionId } from "@/lib/developer-forward/types";

/**
 * The governance vocabulary every Developer Forward content group is tagged with.
 * Deliberately not exported — see the note in `signals.ts`.
 */
type ProvenanceTag =
  | "ben_canonical"
  | "recovered_prior_authoring"
  | "implementation_authored_under_ben_approved_rule"
  | "learner_authored_verbatim"
  | "deterministic_derived";

/* -------------------------------------------------------------------------- */
/* 1. The 33 phrases                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Decision -> option -> the factual receipt for having chosen it.
 *
 * Total by construction: 11 decisions x 3 options, no gaps. Each phrase names
 * the situation and the observable action and stops there.
 */
export const RECEIPT_PHRASES: Record<DecisionId, Record<OptionId, string>> = {
  C1D1: {
    A: "You started the obvious implementation before checking the surrounding export context.",
    B: "You asked which records the export should include before starting.",
    C:
      "You inspected the table, data source, permissions, and nearby behavior before defining the implementation."
  },
  C1D2: {
    A:
      "You kept the delivery commitment after the hidden data and permission constraints appeared.",
    B: "You conditioned the commitment on confirming what the export should include.",
    C:
      "You reopened the size and commitment after the data and permission decisions became visible."
  },
  C2D1: {
    A: "You surfaced the delivery risk before you could quantify its size.",
    B: "You chose a bounded investigation before updating the stakeholder.",
    C: "You chose to resolve the uncertainty before raising the delivery risk."
  },
  C2D2: {
    A: "You would state the problem and next action without a fixed update time.",
    B: "You would state the evidence, remaining uncertainty, and a specific update time.",
    C:
      "You would explicitly reopen the scope or promise because the new evidence changed the prior assumption."
  },
  C3D1: {
    A: "You chose to ship with the evidence already available.",
    B: "You chose a limited, reversible release path.",
    C: "You chose to hold release until the consequential assumptions had stronger evidence."
  },
  C3D2: {
    A: "You chose another primary-flow smoke check.",
    B:
      "You chose targeted checks against the failure modes that could change the shipping decision.",
    C: "You chose to establish stronger evidence for the critical invariants."
  },
  C4D1: {
    A:
      "You handed the objective to the other developer and let responsibility travel with the work.",
    B: "You delegated execution with agreed checkpoints or evidence returning to you.",
    C: "You delegated substantial execution while retaining final decision authority."
  },
  C4D2: {
    A: "You accepted the other developer’s completion report as sufficient.",
    B: "You reviewed the evidence that had been agreed at delegation time.",
    C: "You independently validated the consequential result after the completion report."
  },
  C5D1: {
    A: "You accepted the AI completion report and proceeded.",
    B: "You independently inspected the AI claims that mattered most before proceeding.",
    C: "You treated the AI report as a claim and independently established the critical evidence."
  },
  C5D2: {
    A: "You returned the uncovered gap to the AI for repair.",
    B: "You bounded the AI repair and required independent verification of the correction.",
    C:
      "You paused delegated execution to diagnose why the AI claim and its cited evidence diverged."
  },
  C5D3: {
    A: "You chose to repair the issue and then report successful completion.",
    B:
      "You chose to disclose the discrepancy, the correction, and the confidence you currently had.",
    C:
      "You chose to reopen the affected promise or approval boundary because the completion claim was unsupported."
  }
};

/**
 * Not Ben's words and not recovered authoring — implementation-authored text
 * written to satisfy Ben's approved receipt invariant. Any surface that cites
 * authorship must cite the rule, not Ben.
 */
export const RECEIPT_PHRASES_PROVENANCE =
  "implementation_authored_under_ben_approved_rule" as const satisfies ProvenanceTag;

/**
 * The invariant itself, as a citable string. Defined once here so a governance
 * surface, an export footer and a test all quote the same sentence rather than
 * three retypings of it.
 */
export const RECEIPT_INVARIANT = "Situation -> observable choice/action. Nothing else.";

/**
 * What a receipt may never contain, verbatim from the approved ruling's
 * `forbidden` list. Present so the rule is machine-readable, not only prose.
 */
export const RECEIPT_FORBIDDEN: readonly string[] = [
  "inferred intention",
  "praise",
  "judgment label",
  "doctrine",
  "because-explanation",
  "receipt strength"
];

/** The receipt for one fixed answer. Throws rather than returning undefined. */
export function receiptPhraseFor(decisionId: DecisionId, optionId: OptionId): string {
  const phrase = RECEIPT_PHRASES[decisionId][optionId];
  if (!phrase) {
    throw new Error(`No receipt phrase for ${decisionId}/${optionId}.`);
  }
  return phrase;
}
