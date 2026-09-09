/**
 * The Developer Forward Lite production stamp, v1.1.0 (plan §6.1, gate SC-TF4).
 *
 * WHAT A STAMP IS FOR. `VERSIONING.md` requires that case text, variants,
 * transition logic, dimension semantics, the SHIP formula, profile copy,
 * receipt behaviour, the export schema and privacy-disclosure behaviour are all
 * PINNED — and that a learner who starts on one stamp keeps it. The v1.0.0
 * config shipped in the handoff pins the version numbers and the SHIP model and
 * nothing else: it contains no cases, no variants, no transitions, no option
 * metadata and no receipts. It could not do the job its own rules describe.
 *
 * So this module pins governed content BY VALUE — by referencing the content
 * modules that hold it — and additionally records the SHA-256 of each source
 * artifact it was derived from, in `content/developer-forward/digests.ts`. Both,
 * not either. The digests matter because these sources live in a versioned
 * bundle outside this repository, and between the 2026-09-07 handoffs two files
 * stamped `BEN_APPROVED` were edited in place rather than superseded. A
 * filename stopped being enough to say which ruling the build implements.
 *
 * WHY 1.1.0 AND NOT 1.0.0. Ben's ruling (layer 07,
 * production-version-1.1.0.BEN_APPROVED.json): "Developer Forward Lite production
 * version is v1.1.0. v1.0.0 remains immutable historical provenance." The
 * substantive reason is that the aggregation contract itself changed — layer 05
 * resolved how answers become dimension states, and `VERSIONING.md` lists
 * dimension contributions as a restamp trigger. Silently reusing 1.0.0 would
 * mean two different scoring systems sharing one version number.
 *
 * ADDITIVE, NEVER EDITED. Once a learner can have pinned this stamp it is
 * frozen; a change means a new file and a new manifest. Old stamps stay
 * deployable, and nothing is silently migrated.
 *
 * Pure TypeScript. No React, no CSS, no component import.
 */

import { DEVELOPER_FORWARD_DIGESTS } from "@/content/developer-forward/digests";

/**
 * The ten-field manifest from the handoff's own `versionManifest`, restamped.
 *
 * Each field is bumped only if the thing it names actually changed between
 * v1.0.0 and v1.1.0:
 *
 *   caseContentVersion      1.1.0 — the full five-case source replaced the
 *                                   synopsis; option sub-descriptions now ship
 *   variantSetVersion       1.1.0 — the 27 fragments are pinned by value
 *   transitionLogicVersion  1.1.0 — the transition rules did not exist in 1.0.0
 *   sixDimensionModelVersion 1.0.0 — unchanged; the six dimensions are as authored
 *   shipFormulaVersion      1.0.0 — unchanged; weights and threshold are locked
 *   shipAxisDefinitionVersion 1.0.0 — unchanged
 *   shipProfileCopyVersion  1.1.0 — the 3-value profile_headline was dropped
 *   receiptsVersion         1.1.0 — receipts did not exist in 1.0.0; no strength
 *   exportSchemaVersion     1.1.0 — `product` identity added for Full's importer
 *   aggregationPolicyVersion 1.1.0 — NEW FIELD. v1.0.0 had no aggregation rule
 *                                   at all, which is why it could not score.
 */
export const VERSION_MANIFEST = {
  appVersion: "1.1.0",
  caseContentVersion: "1.1.0",
  variantSetVersion: "1.1.0",
  transitionLogicVersion: "1.1.0",
  sixDimensionModelVersion: "1.0.0",
  shipFormulaVersion: "1.0.0",
  shipAxisDefinitionVersion: "1.0.0",
  shipProfileCopyVersion: "1.1.0",
  receiptsVersion: "1.1.0",
  exportSchemaVersion: "1.1.0",
  aggregationPolicyVersion: "1.1.0"
} as const;

/** The historical stamp, kept nameable so nothing has to guess what preceded this. */
export const HISTORICAL_VERSIONS: readonly string[] = ["1.0.0"];

/**
 * The aggregation policy this stamp pins.
 *
 * Stamped as an ID rather than described in prose so that a future change to
 * the reducer is a RESTAMP rather than a silent behaviour swap: the exported
 * constant and `lib/developer-forward/aggregation.ts` must agree, and a test
 * asserts they do.
 */
export const AGGREGATION_POLICY_ID = "TF-LITE-AGGREGATION-DOMINANT-POSTURE-LATER-TIEBREAK-v1";

/**
 * Experience settings, from the handoff config's `experience` block, unchanged.
 *
 * `perCaseTimeVisible: false` is a product rule, not a preference — the package
 * forbids a per-case time estimate, and only the 15-30 minute whole-run figure
 * may appear.
 */
export const EXPERIENCE = {
  estimatedMinutes: { min: 15, max: 30 },
  caseCount: 5,
  decisionCount: 11,
  reflectionCount: 5,
  artificialPauses: false,
  perCaseTimeVisible: false,
  mobileFirst: true,
  runtimeGenerativeAI: false,
  futureCaseTitlesHiddenUntilReached: true
} as const;

/** Storage settings, from the handoff config's `storage` block, unchanged. */
export const STORAGE = {
  key: "benchantech:developer-forward-lite:state",
  sessionInactivityHours: 6,
  timezoneNameStored: false,
  singleDatasetAcrossVersions: true
} as const;

/** The routes ruling (layer 07). `/tf` is a redirect, never a canonical node. */
export const ROUTES = {
  canonical: "/developer-forward",
  publicAlternate: "/developer-forward-lite",
  redirect: "/df",
  fullTarget: "https://studio.com/benchanviolin/trust-forward",
  learnerStateInUrl: false
} as const;

/**
 * The source artifacts this stamp was derived from, by digest.
 *
 * Re-exported from the digest registry rather than restated, so the stamp and
 * the declared-digest registry can never disagree about what was pinned.
 */
export const SOURCE_DIGESTS = DEVELOPER_FORWARD_DIGESTS;

export const STAMP = {
  versionManifest: VERSION_MANIFEST,
  aggregationPolicyId: AGGREGATION_POLICY_ID,
  experience: EXPERIENCE,
  storage: STORAGE,
  routes: ROUTES,
  sourceDigests: SOURCE_DIGESTS
} as const;
