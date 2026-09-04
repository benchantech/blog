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
import { wysJudgments } from "./judgments";
import { wysPrinciples } from "./principles";
import { wysRituals } from "./rituals";
import { wysScenarios } from "./scenarios";
import { wysBenSlots, wysSources } from "./sources";
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
  { module: "content/watch-your-step/weeks.ts", records: wysWeeks }
];

/** Every WYS content object carrying provenance fields. */
export const wysContentObjects: readonly WysGovernedObject[] = wysRegistry.flatMap(
  (group) => group.records
);

/** Every canonical text record the WYS content modules define. */
export const wysCanonicalRecords: readonly AnyCanonicalText[] = [
  ...wysCopyRecords,
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
  "day-plans.ts",
  "domains.ts",
  "index.ts",
  "types.ts",
  "version.ts"
];
