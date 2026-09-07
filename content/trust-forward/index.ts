/**
 * The Trust Forward content registry.
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
import { TRUST_FORWARD_DIGESTS } from "./digests";

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
export type TrustForwardAuthority =
  | "ben_canonical"
  | "recovered_prior_authoring"
  | "implementation_authored_under_ben_approved_rule"
  | "learner_authored_verbatim"
  | "deterministic_derived"
  | "full_coach_provisional";

export const TRUST_FORWARD_AUTHORITIES: readonly TrustForwardAuthority[] = [
  "ben_canonical",
  "recovered_prior_authoring",
  "implementation_authored_under_ben_approved_rule",
  "learner_authored_verbatim",
  "deterministic_derived",
  "full_coach_provisional"
];

export interface TrustForwardRegistryGroup {
  /** The module, for failure messages that name the file. */
  module: string;
  /** What the module's records claim about who wrote them. */
  provenance: unknown;
}

/**
 * Every content module under `content/trust-forward/`.
 *
 * `digests.ts` is registered too. It carries no prose, but it is the record of
 * WHICH source artifacts the rest of this directory was derived from, and a
 * governance registry that omitted its own provenance anchor would be missing
 * the one entry that makes the others checkable.
 */
export const trustForwardRegistry: readonly TrustForwardRegistryGroup[] = [
  { module: "content/trust-forward/cases.ts", provenance: CASES_PROVENANCE },
  { module: "content/trust-forward/cases.ts (authoring notes)", provenance: AUTHORING_NOTES_PROVENANCE },
  { module: "content/trust-forward/copy.ts", provenance: COPY_PROVENANCE },
  { module: "content/trust-forward/narrative.ts", provenance: NARRATIVE_PROVENANCE },
  { module: "content/trust-forward/profiles.ts", provenance: SHIP_PROFILES_PROVENANCE },
  { module: "content/trust-forward/receipts.ts", provenance: RECEIPT_PHRASES_PROVENANCE },
  { module: "content/trust-forward/signals.ts", provenance: SIGNALS_PROVENANCE },
  { module: "content/trust-forward/signals.ts (option labels)", provenance: OPTION_LABELS_PROVENANCE },
  { module: "content/trust-forward/surfaces.ts", provenance: SURFACE_PROVENANCE },
  { module: "content/trust-forward/variants.ts", provenance: VARIANT_PROVENANCE },
  { module: "content/trust-forward/digests.ts", provenance: TRUST_FORWARD_DIGESTS }
];

/** Modules with no governed records of their own. Declared, never assumed. */
export const TRUST_FORWARD_RECORD_FREE_MODULES: readonly string[] = [
  "content/trust-forward/index.ts",
  "content/trust-forward/stamp/v1-1-0.ts"
];

/**
 * The four surfaces the approved sources do not supply wording for.
 *
 * Recorded as a named list rather than left as scattered `TODO_` constants so
 * that "what is still missing" is answerable in one place. Each is `null` at
 * its definition site, so nothing can render an invented sentence in its place
 * — the same mechanism `AwaitingCopy` uses elsewhere in this repo.
 */
export const TRUST_FORWARD_UNSOURCED_SURFACES: readonly string[] = [
  "cases.ts: TODO_C5_AI_EXPLANATION_BODY_UNSOURCED",
  "surfaces.ts: TODO_CASE_4_OPENING_CALLBACK_UNAUTHORED",
  "copy.ts: TODO_LANDING_FAQ_ANSWERS",
  "copy.ts: TODO_RESULT_PROFESSIONAL_SUMMARY",
  /*
   * FIVE, not four. Found during the UI build: the four SHIP bars are
   * two-ended and no approved source names what the two ends MEAN, so they
   * ship unlabelled. `ROUTING_AND_SCORING.md` gives a reading per BIT, but a
   * bit's reading is not a lean's caption — see the constant's own note.
   */
  "copy.ts: TODO_SHIP_AXIS_END_LABELS"
];
