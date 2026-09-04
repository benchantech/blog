/**
 * The Watch Your Step authoring object model (plan §6.7; WYS §8.1-§8.10).
 *
 * Ten interfaces, copied from the spec, importing the enums from
 * `lib/content-status.ts`. Pure types plus a few string-literal unions: no JSX,
 * no CSS import, no React (plan Phase 0's test-runner decision — `npm test`
 * runs `node --import tsx`, which cannot load a `.css` specifier).
 *
 * WHAT THIS FILE CHANGES FROM THE SPEC'S LITERAL LISTINGS, and why. Every one
 * is reported in docs/facelift-build-notes.md and, where it is a departure from
 * an approved artboard or from the spec, in docs/facelift-unapproved.md.
 *
 *  1. `origin: ContentOrigin` is added to `WysRitual` and `WysCarry` (plan
 *     §6.1). The spec gives them `status` but no `origin`, yet their text
 *     renders publicly on Today and Practice as draft placeholder copy and must
 *     be distinguishable from Ben-authored material.
 *  2. `origin` is added to `WysWeek` as well. §6.1 names only Ritual and Carry,
 *     but handoff README bucket 3 puts "stop titles A-H" in the draft-placeholder
 *     bucket and the Phase 6 exit criterion is "every object carries status,
 *     origin AND its source references". A week with no origin cannot be labelled,
 *     so it could not satisfy either. Safe-direction addition (plan R9).
 *  3. `WysFictionalArtifact.type` is WIDENED from §8.7's nine members to §24's
 *     twelve (plan §6.10). NOT a parallel `containerType` field, which would be
 *     two fields for one concept — exactly what Standing Order 07 forbids.
 *  4. `WysJudgment.origin` admits `IMPLEMENTATION_PLACEHOLDER` in addition to
 *     §8.4's four. §23's judgment string for `AI_SYNTHESIS` is "Coach synthesis
 *     based on Ben sources", which is FALSE of a body drafted during
 *     implementation from no Ben source — and the approved `4a` card draws
 *     "draft · implementation placeholder · not Ben's words" over exactly such a
 *     body. Plan §6.3 already authored the label for the pair and Phase 1
 *     already declared it in the label table; this makes the type match the
 *     table, so `OriginFor<"judgment">` is the union and totality is structural.
 *  5. Short-form sibling fields for the ONE record that the approved artboards
 *     draw at two lengths (plan §6.8 collapse 1): `WysScenario.shortForm`,
 *     `choices[].shortLabel`, `WysJudgment.shortCall`. One record, two
 *     presentations selected by breakpoint — not two records.
 *  6. `WysWeek.shortTitle` (plan §6.8 collapse 2) for the 15px `repeat(9,1fr)`
 *     desktop cells, rendered from the same record as the long title.
 *  7. `WysWeek.optionalPracticeIds` — (WYS §12) requires Plan to show optional
 *     practices and no approved artboard draws the row. Plan Phase 7's ratified
 *     default is to add the data shape and render the row, flagged NEW.
 *  8. `emptyReferenceReason` on the shared provenance block. The Phase 6 exit
 *     criterion allows an empty `sourceIds` / `principleIds` / `primarySourceId`
 *     only where the record "carries an explicit recorded reason for being empty
 *     while Ben's recordings are unselected". A comment is not machine-readable;
 *     this field is, and `tests/wys-content.test.ts` requires it.
 *  9. `WysScenario.overWithholdingClass` and `implicatesExternalAuthority` — the
 *     (WYS §25) and (WYS §26) coverage is an ACCEPTANCE requirement, so it has
 *     to be checkable by a test rather than by reading the prose. They also
 *     select the §25 feedback line and the §26 outranking line, each of which is
 *     defined exactly once (Standing Order 07) in `copy.ts`.
 * 10. Per-object approval (`approvedBy` / `approvedAt` / `standingOrdersVersion`)
 *     per plan §6.6, so the packet's "missing approval" check is answerable per
 *     record rather than only site-wide.
 *
 * Nothing here is deleted from the spec's listings.
 */

import type { ContentOrigin, ContentStatus, OriginFor } from "@/lib/content-status";

/* -------------------------------------------------------------------------- */
/* 0. The shared provenance block                                             */
/* -------------------------------------------------------------------------- */

/**
 * Fields every WYS content object carries beyond the spec's own listings.
 *
 * `supersededBy` / `canonical` are plan §6.2 rule 4; the three approval fields
 * are plan §6.6; `emptyReferenceReason` is the Phase 6 exit criterion.
 */
export interface WysProvenanceExtras {
  /** Required on `historical` / `superseded` objects. */
  supersededBy?: string;
  /** Must be `false` on `historical` / `superseded` objects. */
  canonical?: boolean;
  approvedBy?: string;
  approvedAt?: string;
  standingOrdersVersion?: string;
  /**
   * Why this record's source references are empty. Required by
   * `tests/wys-content.test.ts` whenever `sourceIds`, `principleIds` or
   * `primarySourceId` is empty or absent. Build language, never Ben's voice.
   */
  emptyReferenceReason?: string;
}

/* -------------------------------------------------------------------------- */
/* 1. Identity unions (repo idiom: content/site-config.ts:1-77)               */
/* -------------------------------------------------------------------------- */

/** The nine stops. Lesson Zero plus the eight lettered source periods (WYS §11). */
export type WysWeekId =
  | "stop-zero"
  | "stop-a"
  | "stop-b"
  | "stop-c"
  | "stop-d"
  | "stop-e"
  | "stop-f"
  | "stop-g"
  | "stop-h";

/**
 * A single day/visit inside a cadence path, or a depth segment inside a time
 * budget. (WYS §8.10) types both path families as `string[]` and says nothing
 * about what the strings are; these are the declared vocabulary so the Plan and
 * Today screens can route from data instead of from a component branch.
 */
export type WysPathSegment =
  | "human-source"
  | "source-excerpt"
  | "core-decision"
  | "changed-scenario"
  | "other-medium"
  | "boundary"
  | "delayed-retrieval"
  | "carry"
  | "from-memory"
  | "detox"
  | "rulebook";

/** The eight named over-withholding classes (WYS §25). All eight must be covered. */
export type WysOverWithholdingClass =
  | "exact-jurisdiction"
  | "rough-age-range"
  | "technical-error-code"
  | "medium"
  | "sequence"
  | "deadline"
  | "relationship-category"
  | "context-removed-task-ambiguous";

export const WYS_OVER_WITHHOLDING_CLASSES: readonly WysOverWithholdingClass[] = [
  "exact-jurisdiction",
  "rough-age-range",
  "technical-error-code",
  "medium",
  "sequence",
  "deadline",
  "relationship-category",
  "context-removed-task-ambiguous"
];

/* -------------------------------------------------------------------------- */
/* 2. §8.1 Source Asset                                                       */
/* -------------------------------------------------------------------------- */

export interface WysSourceAsset extends WysProvenanceExtras {
  id: string;
  status: ContentStatus;
  origin: ContentOrigin;
  title: string;
  medium: "video" | "audio" | "essay" | "story" | "transcript" | "demo";
  recordedOrPublishedAt?: string;
  canonicalUrl?: string;
  localAssetPath?: string;
  version?: string;
  hash?: string;
  intendedAudience?: string;
  purpose: string;
  principleIds: string[];
  approvedExcerpts?: Array<{
    text?: string;
    startSeconds?: number;
    endSeconds?: number;
    page?: number;
    contextRequired?: string;
  }>;
  doesNotClaim: string[];
  allowedSurfaces: string[];
  coachParaphrasePolicy?: string;
  historicalStatus?: string;
}

/* -------------------------------------------------------------------------- */
/* 3. §8.2 Principle                                                          */
/* -------------------------------------------------------------------------- */

export interface WysPrinciple extends WysProvenanceExtras {
  id: string;
  status: ContentStatus;
  origin: ContentOrigin;
  shortName: string;
  /**
   * Ben's own words, verbatim. ABSENT until Ben selects a recording and an
   * excerpt (WYS §35 decision 6; plan R10). Never filled with a generated line.
   */
  exactBenStatement?: string;
  /** A formulation Ben approved but did not necessarily author. */
  approvedFormulation?: string;
  rationale: string;
  appliesWhen: string[];
  strongestWhy: string[];
  strongestWhyNot: string[];
  knownExceptions: string[];
  commonMisreadings: string[];
  prohibitedSimplifications: string[];
  sourceIds: string[];
  relatedScenarioIds: string[];
  relatedBoundaryIds: string[];
}

/* -------------------------------------------------------------------------- */
/* 4. §8.3 Scenario                                                           */
/* -------------------------------------------------------------------------- */

export interface WysScenarioChoice {
  key: string;
  label: string;
  /** The 390px presentation of the SAME choice (plan §6.8 collapse 1). */
  shortLabel?: string;
}

export interface WysScenario extends WysProvenanceExtras {
  id: string;
  status: ContentStatus;
  origin: ContentOrigin;
  title: string;
  principleIds: string[];
  invariant: string;
  setting: string;
  artifactIds?: string[];
  decisionMoment: string;
  necessaryFacts: string[];
  unnecessaryFacts: string[];
  inferenceClues: string[];
  pressures: string[];
  choices: WysScenarioChoice[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  canonicalVariantIds: string[];
  judgmentIds: string[];
  boundaryIds: string[];
  prohibitedAdaptations: string[];
  /** The 390px presentation of `setting` / `decisionMoment`, same record. */
  shortForm?: {
    setting: string;
    decisionMoment: string;
  };
  /** (WYS §25) class this scenario teaches, if any. Selects the feedback line. */
  overWithholdingClass?: WysOverWithholdingClass;
  /** (WYS §26). Selects the outranking line and requires an authority note. */
  implicatesExternalAuthority?: boolean;
}

/* -------------------------------------------------------------------------- */
/* 5. §8.4 Judgment                                                           */
/* -------------------------------------------------------------------------- */

export interface WysJudgment extends WysProvenanceExtras {
  id: string;
  status: ContentStatus;
  /** `OriginFor<"judgment">` — §8.4's four, plus IMPLEMENTATION_PLACEHOLDER (note 4). */
  origin: OriginFor<"judgment">;
  scenarioIds: string[];
  call: string;
  /** The 390px presentation of `call`, same record (plan §6.8 collapse 1). */
  shortCall?: string;
  alternateDefensibleCalls?: string[];
  reasoning: string[];
  strongestWhy: string[];
  strongestWhyNot: string[];
  conditionsThatChangeCall: string[];
  reasonableDisagreement: string[];
  externalAuthorityNotes?: string[];
  sourceIds: string[];
  insufficientSignalBoundary?: string;
}

/* -------------------------------------------------------------------------- */
/* 6. §8.5 Boundary / Counterexample                                          */
/* -------------------------------------------------------------------------- */

export interface WysBoundary extends WysProvenanceExtras {
  id: string;
  status: ContentStatus;
  origin: ContentOrigin;
  principleId: string;
  temptingRule: string;
  counterexample: string;
  changedFact: string;
  whyRuleFails: string;
  revisedNarrowerRule: string;
  /** Both risks are required. Over-withholding is a first-class failure mode. */
  overDisclosureRisk: string;
  overWithholdingRisk: string;
  externalAuthorityCaveat?: string;
  relatedScenarioIds: string[];
  relatedJudgmentIds: string[];
  prohibitedExtrapolations: string[];
}

/* -------------------------------------------------------------------------- */
/* 7. §8.6 Canonical Variant                                                  */
/* -------------------------------------------------------------------------- */

export interface WysCanonicalVariant extends WysProvenanceExtras {
  id: string;
  status: ContentStatus;
  origin: "BEN_AUTHORED_VARIATION" | "AI_ADAPTATION";
  parentScenarioId: string;
  /** MUST equal the parent scenario's invariant (WYS §14). Tested. */
  invariant: string;
  changedDimensions: string[];
  setting?: string;
  medium?: string;
  pressure?: string;
  equivalentFacts: string[];
  mutableFacts: string[];
  /** MUST cover every parent choice key (WYS §14). Tested. */
  judgmentMapping: Record<string, string>;
  boundaryIds: string[];
}

/* -------------------------------------------------------------------------- */
/* 8. §8.7 Fictional Artifact                                                 */
/* -------------------------------------------------------------------------- */

/**
 * §8.7's nine, widened to §24's twelve disclosure containers (plan §6.10).
 * `other` stays last.
 */
export type WysArtifactType =
  | "screenshot"
  | "pdf"
  | "email"
  | "photo"
  | "audio"
  | "spreadsheet"
  | "message-thread"
  | "document"
  | "text-prompt"
  | "voice-recording"
  | "pasted-logs"
  | "mixed-file-bundle"
  | "other";

export const WYS_ARTIFACT_TYPES: readonly WysArtifactType[] = [
  "screenshot",
  "pdf",
  "email",
  "photo",
  "audio",
  "spreadsheet",
  "message-thread",
  "document",
  "text-prompt",
  "voice-recording",
  "pasted-logs",
  "mixed-file-bundle",
  "other"
];

export interface WysFictionalArtifact extends WysProvenanceExtras {
  id: string;
  status: ContentStatus;
  origin: ContentOrigin;
  type: WysArtifactType;
  scenarioId: string;
  fictionalLabel: string;
  intentionallyIncluded: string[];
  intentionallyIrrelevant: string[];
  sensitiveLookingFields: string[];
  canBeRemoved: string[];
  mustRemain: string[];
  hiddenMetadataOrInferenceClues: string[];
  /** Non-optional (WYS §27). Must not leak the answer. */
  accessibilityText: string;
  /** Non-optional. How the asset was produced. */
  generationProvenance: string;
}

/* -------------------------------------------------------------------------- */
/* 9. §8.8 Designed Ritual                                                    */
/* -------------------------------------------------------------------------- */

export interface WysRitual extends WysProvenanceExtras {
  id: string;
  status: ContentStatus;
  /** ADDED (plan §6.1). §8.8 gives status but no origin; the text renders. */
  origin: ContentOrigin;
  name: string;
  purpose: string;
  aiPresence: "none" | "optional" | "future";
  prerequisites: string[];
  learnerTask: string;
  cadence?: string;
  appMustNotDo: string[];
  records: string[];
  remainsLocalOrOffline: string[];
  returnTiming?: string;
  revealSequence?: string[];
  successEvidence: string[];
  failureModes: string[];
  /** Not in §8.8; the ritual's own sources, so provenance resolves. */
  principleIds: string[];
  sourceIds: string[];
}

/* -------------------------------------------------------------------------- */
/* 10. §8.9 Offline Carry                                                     */
/* -------------------------------------------------------------------------- */

export interface WysCarry extends WysProvenanceExtras {
  id: string;
  status: ContentStatus;
  /** ADDED (plan §6.1). */
  origin: ContentOrigin;
  principleIds: string[];
  behavior: string;
  where: string;
  duration: string;
  aiAllowed: boolean;
  doNotSendBack: string[];
  noticePrompts: string[];
  /** (WYS §10 CARRY) "CARRY should often have no reporting requirement." */
  reportingRequired: boolean;
  nextRetrievalCue?: string;
  /** (WYS §26). Populated, not left dead. */
  authorityBoundary?: string;
}

/* -------------------------------------------------------------------------- */
/* 11. §8.10 Weekly Source Bundle                                             */
/* -------------------------------------------------------------------------- */

export interface WysTimeBudgetPaths {
  min5: string[];
  min10: string[];
  min15: string[];
  min20plus: string[];
}

export interface WysCadencePathsShape {
  days2: string[];
  days3?: string[];
  days5: string[];
  mostDays?: string[];
}

export interface WysWeek extends WysProvenanceExtras {
  id: string;
  status: ContentStatus;
  /** ADDED (see note 2). Stop titles A-H are handoff README bucket 3. */
  origin: ContentOrigin;
  order: number;
  title: string;
  /** The 15px desktop cell form of the same title (plan §6.8 collapse 2). */
  shortTitle?: string;
  primarySourceId?: string;
  purpose: string;
  principleIds: string[];
  watch: string[];
  tryScenarioIds: string[];
  judgeIds: string[];
  boundaryIds: string[];
  variantIds: string[];
  artifactIds: string[];
  carryIds: string[];
  transferCheckIds: string[];
  /** Depth within one session. Elements are `WysPathSegment` values. */
  timeBudgetPaths: WysTimeBudgetPaths;
  /** One element per visit. Elements are day-plan ids (see `day-plans.ts`). */
  cadencePaths: WysCadencePathsShape;
  /** ADDED (see note 7): (WYS §12)'s fifth Plan row. */
  optionalPracticeIds?: string[];
  /** Stop F is done away from the site and shows no visit counter. */
  offSite?: boolean;
  /** Stop H is the terminal row ("the end"). */
  terminal?: boolean;
}
