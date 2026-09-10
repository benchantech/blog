/**
 * Developer Forward Lite production stamp, v1.1.0.
 *
 * The historical content/version manifest remains frozen. Public destination
 * fields below reflect the 2026-09-10 operating change: full Developer Forward
 * is not currently offered and Lite has no coupon or paid-upgrade destination.
 */

import { DEVELOPER_FORWARD_DIGESTS } from "@/content/developer-forward/digests";

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

export const HISTORICAL_VERSIONS: readonly string[] = ["1.0.0"];

export const AGGREGATION_POLICY_ID = "TF-LITE-AGGREGATION-DOMINANT-POSTURE-LATER-TIEBREAK-v1";

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

export const STORAGE = {
  key: "benchantech:developer-forward-lite:state",
  sessionInactivityHours: 6,
  timezoneNameStored: false,
  singleDatasetAcrossVersions: true
} as const;

/**
 * Public routing after the full Studio offer was discontinued.
 *
 * `/developer-forward` remains the canonical indexed evidence hub.
 * `/developer-forward-lite` remains the standalone working experience.
 * `/df` is retained as a Benchantech-controlled shortcut and now resolves to
 * the evidence hub. There is deliberately no external full-course target and
 * no coupon target until a future course destination is actually chosen.
 */
export const ROUTES = {
  canonical: "/developer-forward",
  publicAlternate: "/developer-forward-lite",
  redirect: "/df",
  fullTarget: null,
  couponTarget: null,
  learnerStateInUrl: false
} as const;

export const SOURCE_DIGESTS = DEVELOPER_FORWARD_DIGESTS;

export const STAMP = {
  versionManifest: VERSION_MANIFEST,
  aggregationPolicyId: AGGREGATION_POLICY_ID,
  experience: EXPERIENCE,
  storage: STORAGE,
  routes: ROUTES,
  sourceDigests: SOURCE_DIGESTS
} as const;
