/**
 * The Watch Your Step content registry.
 *
 * THIS FILE IS A GOVERNANCE MECHANISM, NOT A CONVENIENCE RE-EXPORT.
 * `tests/canonical-text.test.ts` only sees what it imports: all eight of the
 * packet's build checks run over the arrays that test declares, so a content
 * module added in a later phase and NOT added there escapes every check
 * silently (docs/facelift-build-notes.md §7.5). Collecting every WYS record
 * here means the test imports one thing and a new module is caught by the
 * "every registered module appears in the registry" assertion rather than by
 * somebody remembering.
 *
 * Add a content module, add it here, in the same commit.
 */

import type { AnyCanonicalText } from "@/lib/canonical-text";
import { artifactCanonicalRecords, wysFictionalArtifacts } from "./artifacts";
import { wysBoundaries } from "./boundaries";
import { wysCarries } from "./carries";
import { wysCopyRecords } from "./copy";
import { dataCopyRecords } from "./data";
import { endBenSlots } from "./end";
import { judgeCopyRecords } from "./judge";
import { landingCopyRecords, landingGovernedObjects } from "./landing";
import { wysJudgments } from "./judgments";
import { lessonZeroBenSlots, lessonZeroCopyRecords } from "./lesson-zero";
import { practiceCopyRecords } from "./practice";
import { wysPrinciples } from "./principles";
import { progressCopyRecords } from "./progress";
import { wysRituals } from "./rituals";
import { wysScenarios } from "./scenarios";
import { wysBenSlots, wysSources } from "./sources";
import { todayBenSlots, todayCopyRecords } from "./today";
import { wysVariants } from "./variants";
import { wysWeeks } from "./weeks";

/**
 * The minimum every WYS content object carries. Deliberately structural rather
 * than a union of the ten interfaces: the governance checks care about status,
 * origin and identity, and a union would have to be widened every time a type
 * gains a field.
 */
export interface WysGovernedObject {
  id: string;
  status: string;
  origin: string;
  canonical?: boolean;
  supersededBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  standingOrdersVersion?: string;
  emptyReferenceReason?: string;
}

/** Which module a record came from, for failure messages that name the file. */
export interface WysRegistryGroup {
  module: string;
  records: readonly WysGovernedObject[];
}

export const wysRegistry: readonly WysRegistryGroup[] = [
  { module: "content/watch-your-step/sources.ts", records: wysSources },
  { module: "content/watch-your-step/sources.ts (Ben slots)", records: wysBenSlots },
  { module: "content/watch-your-step/principles.ts", records: wysPrinciples },
  { module: "content/watch-your-step/scenarios.ts", records: wysScenarios },
  { module: "content/watch-your-step/judgments.ts", records: wysJudgments },
  { module: "content/watch-your-step/boundaries.ts", records: wysBoundaries },
  { module: "content/watch-your-step/variants.ts", records: wysVariants },
  { module: "content/watch-your-step/artifacts.ts", records: wysFictionalArtifacts },
  { module: "content/watch-your-step/rituals.ts", records: wysRituals },
  { module: "content/watch-your-step/carries.ts", records: wysCarries },
  { module: "content/watch-your-step/today.ts (Ben slot)", records: todayBenSlots },
  { module: "content/watch-your-step/end.ts (Ben slot)", records: endBenSlots },
  { module: "content/watch-your-step/lesson-zero.ts (Ben slot)", records: lessonZeroBenSlots },
  { module: "content/watch-your-step/weeks.ts", records: wysWeeks },
  // Phase 10. One governed object: the fabricated 18/61/21 split the `4a` hero
  // draws, which is `draft` + `IMPLEMENTATION_PLACEHOLDER` and carries its
  // caption as a field so the two cannot be separated (plan §6.5, Q11).
  { module: "content/watch-your-step/landing.ts", records: landingGovernedObjects }
];

/** Every WYS content object carrying provenance fields. */
export const wysContentObjects: readonly WysGovernedObject[] = wysRegistry.flatMap(
  (group) => group.records
);

/** Every canonical text record the WYS content modules define. */
export const wysCanonicalRecords: readonly AnyCanonicalText[] = [
  ...wysCopyRecords,
  ...dataCopyRecords,
  ...judgeCopyRecords,
  ...landingCopyRecords,
  ...lessonZeroCopyRecords,
  ...practiceCopyRecords,
  ...progressCopyRecords,
  ...todayCopyRecords,
  ...artifactCanonicalRecords
];

/**
 * The content modules that must appear in the registry above.
 *
 * `tests/wys-content.test.ts` reads the directory and fails if a `.ts` file
 * exists here that no group names and that is not on the exemption list. That
 * is the check that catches the failure mode §7.5 describes: a module nothing
 * imports is a module nothing governs.
 */
export const WYS_NON_RECORD_MODULES: readonly string[] = [
  "config.ts",
  "copy.ts",
  // Phase 8 (Data page). `data.ts` carries ten canonical records — registered
  // in `wysCanonicalRecords` above — plus the page labels and the
  // `(status, origin)` pair the two lib-defined confirmation explanations
  // render under. No governed object of its own, so it takes the same route
  // `judge.ts`, `practice.ts` and `progress.ts` take.
  "data.ts",
  "day-plans.ts",
  "domains.ts",
  "index.ts",
  // Phase 7 (shell). `judge.ts` carries a canonical record and no governed
  // object, so it is registered in `wysCanonicalRecords` above rather than in
  // `wysRegistry`; `tabs.ts` carries route labels, like `content/nav.ts`, and
  // no records at all.
  "judge.ts",
  // Phase 7 (Plan view). `plan.ts` carries the pace vocabulary and the Plan
  // row labels — no records, on the same reasoning `tabs.ts` and `judge.ts`'s
  // `judgeLabels` use: a control name of four words or fewer is a label, not a
  // claim. Its two presentations of one node are what stop Lesson Zero and Plan
  // describing the same pace two ways (§6.8).
  "plan.ts",
  // Phase 7 (Practice view). `practice.ts` carries four canonical records —
  // registered in `wysCanonicalRecords` above — plus the Practice labels and
  // `replayOptionsFor()`, which derives (WYS §14)'s two deterministic modes
  // from the scenario bank and enforces the invariant rule at the point of
  // use. No governed object of its own, so it takes `judge.ts`'s route.
  "practice.ts",
  // Phase 7 (Progress view). `progress.ts` carries two canonical records —
  // registered in `wysCanonicalRecords` above — plus the tile labels and the
  // pure count derivations, and no governed object, so it takes the same route
  // `judge.ts` does rather than a `wysRegistry` group.
  "progress.ts",
  "tabs.ts",
  "types.ts",
  "version.ts"
];
