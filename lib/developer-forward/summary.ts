/**
 * The professional summary — "A professional version you can keep".
 *
 * Deterministic template, not generation. One clause per dimension, selected by
 * the learner's terminal posture, in the approved dimension order, closed by a
 * fixed sentence. Approved 2026-09-07
 * (`09_final-copy-completion/professional-summary-template.BEN_APPROVED.json`).
 *
 * WHY THIS IS A TEMPLATE AND NOT A SYNTHESIS. It is the one artifact Lite
 * produces that a learner might paste into a profile or a proposal — that is
 * the surface's whole purpose. So it must be something the product can stand
 * behind sentence by sentence, and the way to guarantee that is to select from
 * approved sentences rather than compose new ones. `generation_mode` in the
 * ruling says it outright: `deterministic_template_not_AI_generated`.
 *
 * FORBIDDEN INPUTS, enumerated by the ruling and worth naming here because each
 * is a plausible thing an implementer might reach for:
 *   - the SHIP code — it is four thresholded bits; the summary reads the six
 *     continuous postures underneath them, which carry more than the bits do;
 *   - learner reflections — never interpreted, anywhere, by anything;
 *   - the recovered `market_copy` and `strongest_upsell` columns — older
 *     adjacent artifacts superseded by this template;
 *   - `profile_headline` — dropped from v1.1 entirely.
 *
 * Pure TypeScript. No React, no CSS, no component import.
 */

import {
  PROFESSIONAL_SUMMARY_CLAUSES,
  PROFESSIONAL_SUMMARY_CLOSING,
  PROFESSIONAL_SUMMARY_TITLE
} from "@/content/developer-forward/copy";
import { DIMENSIONS, valuePosture, type DimensionState } from "@/lib/developer-forward/types";

export { PROFESSIONAL_SUMMARY_TITLE };

/**
 * The six clauses for one terminal state, in the approved dimension order.
 *
 * Order is `DIMENSIONS` — ambiguity, verification, promise, risk, ownership,
 * trust — which is the order the ruling gives and the same order the recovered
 * 729 narrative uses. Two artifacts agreeing on the order is not a coincidence
 * to preserve casually: the summary and the narrative sit on the same screen,
 * and a reader comparing them would notice a reordering immediately.
 */
export function professionalSummaryClauses(state: DimensionState): readonly string[] {
  return DIMENSIONS.map((dimension) => {
    const posture = valuePosture(dimension, state[dimension]);
    const clause = (PROFESSIONAL_SUMMARY_CLAUSES[dimension] as Record<string, string>)[posture];
    if (clause === undefined) {
      /*
       * Unreachable through `valuePosture`, which can only return a declared
       * posture — but it throws rather than returning "" because the failure it
       * guards is silent by nature. The approved template names three postures
       * differently from the canonical vocabulary (`bound` for `investigate`,
       * `target` for `sample`, `verify` for `prove`); the table in `copy.ts` is
       * written in canonical terms precisely so this lookup cannot miss, and if
       * a future edit reintroduces the template's own keys, three of the six
       * clauses would vanish from the paragraph with nothing to show for it.
       */
      throw new Error(
        `No professional-summary clause for ${dimension}="${posture}". The clause table must be ` +
          "keyed by the canonical posture vocabulary, not by the approved template's own key names."
      );
    }
    return clause;
  });
}

/**
 * The full paragraph: six clauses then the fixed closing sentence.
 *
 * Joined with a single space, because the clauses are authored as complete
 * sentences with their own terminal punctuation — unlike the 729-narrative
 * clauses, which are fragments joined by "; ". Two templates, two join rules;
 * conflating them produces run-on prose in one and a sentence fragment salad in
 * the other.
 */
export function professionalSummary(state: DimensionState): string {
  return [...professionalSummaryClauses(state), PROFESSIONAL_SUMMARY_CLOSING].join(" ");
}
