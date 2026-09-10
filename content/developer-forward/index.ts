/**
 * The Developer Forward content registry.
 *
 * THIS FILE IS A GOVERNANCE MECHANISM, NOT A CONVENIENCE RE-EXPORT — the same
 * role `content/watch-your-step/index.ts` plays, and for the same reason.
 * `tests/canonical-text.test.ts` only sees what it imports, so a content module
 * that is not reachable from a registry escapes every governance check
 * silently. Collecting the modules here means a new one is caught by the
 * "every module is registered" assertion rather than by somebody remembering.
 *
 * Add a content module, add it here, in the same commit.
 *
 * Pure data. No React, no CSS, no component import.
 */

import { CASES_PROVENANCE, AUTHORING_NOTES_PROVENANCE } from "./cases";
import { COPY_PROVENANCE } from "./copy";
import { NARRATIVE_PROVENANCE } from "./narrative";
import { SHIP_PROFILES_PROVENANCE } from "./profiles";
import { RECEIPT_PHRASES_PROVENANCE } from "./receipts";
import { SIGNALS_PROVENANCE, OPTION_LABELS_PROVENANCE } from "./signals";
import { SURFACE_PROVENANCE } from "./surfaces";
import { VARIANT_PROVENANCE } from "./variants";
import { DEVELOPER_FORWARD_DIGESTS } from "./digests";
import { ANSWER_SURFACES_PROVENANCE } from "./answer-surfaces";

/**
 * The six authority levels from `TRUST_FORWARD_PROVENANCE.md`.
 *
 * FINER THAN THE REPO'S `ContentOrigin` ENUM, DELIBERATELY. `ContentOrigin`
 * cannot distinguish material recovered from prior authoring from material
 * written during implementation — both would land on a non-Ben origin — and the
 * handoff makes that distinction an architectural invariant: "Never relabel
 * implementation-authored copy as Ben-authored merely because it was generated
 * to fill a package gap."
 *
 * The distinction is load-bearing in both directions. Calling the 27 recovered
 * fragments `implementation_authored` would understate their provenance;
 * calling the 33 receipts `recovered` would overstate theirs. Neither error is
 * visible on screen, which is exactly why it needs a type.
 */
export type DeveloperForwardAuthority =
  | "ben_canonical"
  | "recovered_prior_authoring"
  | "implementation_authored_under_ben_approved_rule"
  | "learner_authored_verbatim"
  | "deterministic_derived"
  | "full_coach_provisional";

export const DEVELOPER_FORWARD_AUTHORITIES: readonly DeveloperForwardAuthority[] = [
  "ben_canonical",
  "recovered_prior_authoring",
  "implementation_authored_under_ben_approved_rule",
  "learner_authored_verbatim",
  "deterministic_derived",
  "full_coach_provisional"
];

export interface DeveloperForwardRegistryGroup {
  /** The module, for failure messages that name the file. */
  module: string;
  /** What the module's records claim about who wrote them. */
  provenance: unknown;
}

/**
 * Every content module under `content/developer-forward/`.
 *
 * `digests.ts` is registered too. It carries no prose, but it is the record of
 * WHICH source artifacts the rest of this directory was derived from, and a
 * governance registry that omitted its own provenance anchor would be missing
 * the one entry that makes the others checkable.
 */
export const developerForwardRegistry: readonly DeveloperForwardRegistryGroup[] = [
  {
    module: "content/developer-forward/answer-surfaces.ts",
    provenance: ANSWER_SURFACES_PROVENANCE
  },
  { module: "content/developer-forward/cases.ts", provenance: CASES_PROVENANCE },
  { module: "content/developer-forward/cases.ts (authoring notes)", provenance: AUTHORING_NOTES_PROVENANCE },
  { module: "content/developer-forward/copy.ts", provenance: COPY_PROVENANCE },
  { module: "content/developer-forward/narrative.ts", provenance: NARRATIVE_PROVENANCE },
  { module: "content/developer-forward/profiles.ts", provenance: SHIP_PROFILES_PROVENANCE },
  { module: "content/developer-forward/receipts.ts", provenance: RECEIPT_PHRASES_PROVENANCE },
  { module: "content/developer-forward/signals.ts", provenance: SIGNALS_PROVENANCE },
  { module: "content/developer-forward/signals.ts (option labels)", provenance: OPTION_LABELS_PROVENANCE },
  { module: "content/developer-forward/surfaces.ts", provenance: SURFACE_PROVENANCE },
  { module: "content/developer-forward/variants.ts", provenance: VARIANT_PROVENANCE },
  { module: "content/developer-forward/digests.ts", provenance: DEVELOPER_FORWARD_DIGESTS }
];

/** Modules with no governed records of their own. Declared, never assumed. */
/**
 * The YY Method rewrite (2026-09-08). Registered so the governance checks reach
 * it — an unregistered content module escapes every one of them silently, which
 * is the whole reason this registry exists.
 *
 * These carry their own provenance vocabulary (`YYProvenance`, five values,
 * finer than `ContentOrigin`) and their own guard,
 * `tests/developer-forward-yy-content.test.ts`. They are listed here rather than in
 * `developerForwardRegistry` because that array's shape is the SHIP-era one; the
 * two architectures coexist until SHIP is retired.
 */
export const DEVELOPER_FORWARD_YY_MODULES: readonly string[] = [
  "content/developer-forward/yy/case-1.ts",
  "content/developer-forward/yy/case-2.ts",
  "content/developer-forward/yy/case-3.ts",
  "content/developer-forward/yy/case-4.ts",
  "content/developer-forward/yy/case-5.ts",
  "content/developer-forward/yy/evidence-tags.ts",
  "content/developer-forward/yy/approved-blurs.ts",
  /*
   * Added 2026-09-09 with the five opening illustrations. It belongs on the YY
   * list rather than in `developerForwardRegistry` for the reason above: it
   * carries `YYProvenance`, not `ContentOrigin`. The images are Ben's; the alt
   * text is this build's and is registered separately in
   * `DEVELOPER_FORWARD_IMPLEMENTATION_AUTHORED_LABELS`, because it is
   * learner-facing prose he has not read.
   */
  "content/developer-forward/yy/case-art.ts"
];

export const DEVELOPER_FORWARD_RECORD_FREE_MODULES: readonly string[] = [
  "content/developer-forward/index.ts",
  "content/developer-forward/stamp/v1-1-0.ts",
  /*
   * Added 2026-09-10 with the AI-native pivot. `current-status.ts` is the page
   * copy for what Developer Forward IS now — the full offering discontinued,
   * Lite still free and deterministic, no paid destination promised. It is
   * declared record-free rather than registered because it carries plain page
   * strings and no provenance records; the registry test refuses a module that
   * is in neither list, which is how this was caught.
   */
  "content/developer-forward/current-status.ts",
  ...DEVELOPER_FORWARD_YY_MODULES
];

/**
 * WHAT WAS MISSING, AND WHAT HAPPENED TO IT.
 *
 * Five surfaces had no approved wording at implementation time. Layer 09
 * (2026-09-07) closed all five — three by authoring the copy, two by ruling
 * that the surface should not exist. Both are answers; only one is content.
 *
 * The five `TODO_` constants all remain `null` and all remain exported. A
 * resolved one is a TOMBSTONE — it points a reader who searches the old name at
 * where the copy went — and a ruled one is a DECISION RECORD, which is the more
 * durable of the two: without it, the next person to notice that Case 4 has no
 * opening callback when cases 2, 3 and 5 do would reasonably "fix" it.
 */
export const DEVELOPER_FORWARD_RESOLVED_SURFACES: readonly string[] = [
  "cases.ts: TODO_C5_AI_EXPLANATION_BODY_UNSOURCED -> copy.ts C5_AI_EXPLANATION_BODY",
  "copy.ts: TODO_LANDING_FAQ_ANSWERS -> copy.ts LANDING_FAQ",
  "copy.ts: TODO_RESULT_PROFESSIONAL_SUMMARY -> copy.ts PROFESSIONAL_SUMMARY_CLAUSES"
];

/**
 * Ruled absent BY DESIGN, not awaiting copy. Neither may be filled in without a
 * superseding ruling, and each carries its reason at its definition site:
 *
 *  - Case 4's opening callback: its cross-case resurfacing belongs at the close.
 *    "Do not add an opening callback for symmetry."
 *  - The SHIP bars' end captions: the bars show a continuous lean while the
 *    available 0/1 language describes thresholded bit outcomes, so captions
 *    "would imply unsupported precision."
 */
export const DEVELOPER_FORWARD_ABSENT_BY_DESIGN: readonly string[] = [
  "surfaces.ts: TODO_CASE_4_OPENING_CALLBACK_UNAUTHORED",
  "copy.ts: TODO_SHIP_AXIS_END_LABELS"
];

/**
 * Still missing, with no wording and no ruling. Empty as of layer 09.
 *
 * Kept as an exported constant rather than deleted: it is the list the next gap
 * gets added to, and a name that exists is easier to find than one that has to
 * be reinvented.
 */
export const DEVELOPER_FORWARD_UNSOURCED_SURFACES: readonly string[] = [];

/**
 * Control labels this build authored because no approved artifact supplies one.
 *
 * Distinct from the five `TODO_` surfaces: those are absent and render nothing,
 * while these SHIP. Listing them is what keeps "every learner-facing string is
 * approved" from quietly becoming false — each one is a real string on a real
 * screen that Ben has not seen.
 */
export const DEVELOPER_FORWARD_IMPLEMENTATION_AUTHORED_LABELS: readonly string[] = [
  "copy.ts: RESUME_RESULT_CTA",
  /*
   * Added 2026-09-08 when the YY rewrite made the approved descriptor false.
   * "Five fictional cases … Six dimensions of judgment" was approved on
   * 2026-09-07 for a product that no longer exists — the cases are real and
   * SHIP is gone. Approval fixes a wording, not the world it described, so the
   * replacement ships and is tracked as unapproved rather than inheriting the
   * old string's authority.
   */
  "copy.ts: FULL_OFFER.descriptor (supersedes an approved string that became false)",
  "copy.ts: LANDING_INCOMPLETE.body (same supersession)",
  "copy.ts: LANDING_INCOMPLETE.timeEstimate (an estimate, not a measurement — time a real run)",
  /*
   * Added 2026-09-08 on Ben's instruction: the public Full bridge says "40+",
   * where layer 07 approved "30+". Ben set the number himself, so the CLAIM is
   * his; the sentence is still listed here because the string that ships is no
   * longer the approved artifact's string, and a registry that only tracked
   * strings nobody authorised would miss exactly this case — an approved
   * sentence edited afterwards. Both numbers are floors under the internal
   * count of 42 (copy.ts header, conflict 3): "40+" stops being true if that
   * count ever drops, which is the one thing worth re-checking here.
   */
  "copy.ts: FULL_OFFER.bridge (Ben raised the approved \"30+\" floor to \"40+\")",
  "copy.ts: TRUST_STRIP (every claim verified against the code; wording unapproved)",
  "components/developer-forward/LiteSandbox.tsx: REVEAL_ACTION_LABELS",
  /*
   * Added 2026-09-09 with the coupon link. The OFFER is Ben's and so is the
   * URL; the three strings the completion screen says around it are this
   * build's. They ship because a learner who has just finished five cases and
   * is owed a coupon should be handed it rather than told to go and ask.
   */
  "copy.ts: DEVELOPER_FORWARD_TEASER.coupon.earnedHeading / earnedBody / earnedCta",
  /*
   * Added 2026-09-09. The five illustrations are Ben's; their ALT TEXT is not.
   * It was written by reading the image files, and it is learner-facing — a
   * reader who cannot see the picture gets this instead of it, which is a
   * stronger reason to register it than most entries here have.
   */
  "yy/case-art.ts: CASE_ART[*].alt (five descriptions, written from the images)"
];
