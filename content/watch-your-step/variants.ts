/**
 * Canonical variants (WYS §8.6, §14).
 *
 * THE INVARIANT RULE IS THE WHOLE POINT. (WYS §14): surface details may vary,
 * the judgment construct must not drift, and "do not equate visual similarity
 * with conceptual equivalence." So `invariant` on a variant must equal its
 * parent scenario's `invariant` STRING FOR STRING, and `judgmentMapping` must
 * cover every one of the parent's choice keys. Both are asserted in
 * `tests/wys-content.test.ts` rather than left to review.
 *
 * `judgmentMapping` maps a PARENT CHOICE KEY to the judgment record that
 * governs that choice in the variant. Mapping all three keys of the group-chat
 * scenario to the same judgment is not laziness — it is the invariant holding:
 * a variant that needed a different judgment for the same construct would be a
 * different scenario, which is the drift §14 forbids.
 *
 * WHAT DOES NOT SHIP HERE, and why it matters for Phase 7. §8.6 narrows
 * `origin` to `BEN_AUTHORED_VARIATION | AI_ADAPTATION`, and the `5c` Practice
 * artboard draws a teal "Ben variant" pill. Ben has authored no variation
 * (WYS §35 decision 9 is open), so there is no `BEN_AUTHORED_VARIATION` record
 * in v0 and the teal pill has nothing to bind to: Practice ships with
 * "as authored" rows only, exactly as Phase 7's "Ben variant where one exists"
 * allows. The single record below is `AI_ADAPTATION` at `status: "draft"` —
 * authored at build time so the §14 machinery has something real to check, not
 * generated at runtime, and not public under the Q21 default. Recorded in
 * docs/facelift-unapproved.md.
 */

import type { WysCanonicalVariant } from "./types";
import { wysScenarioById } from "./scenarios";

export type WysVariantId = "var-group-chat-school";

export const WYS_VARIANT_IDS: readonly WysVariantId[] = ["var-group-chat-school"];

export const wysVariants = [
  {
    id: "var-group-chat-school",
    status: "draft",
    origin: "AI_ADAPTATION",
    parentScenarioId: "scn-group-chat",
    /**
     * NOT a copy of the parent's sentence — a REFERENCE to it. (WYS §14)
     * requires the invariant to be identical, and Standing Order 07 forbids
     * defining the same text twice, so the single definition stays in
     * `scenarios.ts` and this reads it. `tests/wys-content.test.ts` still
     * asserts the equality, because a later editor could type a literal here.
     */
    invariant: wysScenarioById("scn-group-chat").invariant,
    changedDimensions: ["setting", "relationship category", "who else is in the thread"],
    setting:
      "The same decision, moved to a school parents' thread where one message asks about a trip payment.",
    medium: "message-thread",
    pressure: "Everyone in the thread is a neighbour, so leaving people out feels rude rather than careful.",
    equivalentFacts: [
      "One message is the thing being answered.",
      "The relationship to the sender is what shapes the reply."
    ],
    mutableFacts: ["The setting.", "The number of participants.", "What the message is about."],
    judgmentMapping: {
      A: "jdg-group-chat",
      B: "jdg-group-chat",
      C: "jdg-group-chat"
    },
    boundaryIds: ["bnd-container-trim"]
  }
] as const satisfies readonly WysCanonicalVariant[];

export function wysVariantById(id: WysVariantId): WysCanonicalVariant {
  const record = wysVariants.find((variant) => variant.id === id);
  if (!record) throw new Error(`No WYS canonical variant with id "${id}".`);
  return record;
}

/** The parent scenario of a variant. Throws rather than returning undefined. */
export function parentScenarioOf(variant: WysCanonicalVariant) {
  return wysScenarioById(variant.parentScenarioId as Parameters<typeof wysScenarioById>[0]);
}
