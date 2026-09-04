import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  RENDER_MARKED_DRAFT,
  hasProvenanceLabel,
  isBenOrigin,
  renderPolicyFor,
  type LabelOrigin,
  type SurfaceKind
} from "@/lib/content-status";
import { cadencePathFor } from "@/lib/wys/local-state";
import { isExternalSourceRef } from "@/content/source-refs";

import {
  WYS_ARTIFACT_TYPES,
  WYS_OVER_WITHHOLDING_CLASSES,
  type WysBoundary,
  type WysCanonicalVariant,
  type WysCarry,
  type WysFictionalArtifact,
  type WysJudgment,
  type WysOverWithholdingClass,
  type WysPrinciple,
  type WysRitual,
  type WysScenario,
  type WysSourceAsset,
  type WysWeek
} from "@/content/watch-your-step/types";
import { CONTENT_VERSION } from "@/content/watch-your-step/version";
import {
  POSTURE_OPTIONS,
  POSTURE_OPTION_IDS,
  POSTURE_QUESTION,
  POSTURE_QUESTION_NOTE,
  PERSIST_LOCAL_JUDGMENTS,
  SHIP_LEARNER_RULEBOOK
} from "@/content/watch-your-step/config";
import { WYS_DOMAINS } from "@/content/watch-your-step/domains";
import {
  RAW_VOICE_CORPUS_SHA256,
  wysSources as wysSourcesConst,
  wysBenSlots
} from "@/content/watch-your-step/sources";
import { wysPrinciples as wysPrinciplesConst } from "@/content/watch-your-step/principles";
import { wysScenarios as wysScenariosConst, WYS_CHOICE_KEYS } from "@/content/watch-your-step/scenarios";
import { wysJudgments as wysJudgmentsConst } from "@/content/watch-your-step/judgments";
import { wysBoundaries as wysBoundariesConst } from "@/content/watch-your-step/boundaries";
import { wysVariants as wysVariantsConst } from "@/content/watch-your-step/variants";
import { wysFictionalArtifacts as wysFictionalArtifactsConst } from "@/content/watch-your-step/artifacts";
import { wysRituals as wysRitualsConst } from "@/content/watch-your-step/rituals";
import { wysCarries as wysCarriesConst } from "@/content/watch-your-step/carries";
import { wysDayPlans, WYS_DAY_PLAN_IDS } from "@/content/watch-your-step/day-plans";
import {
  countWord,
  letteredStops,
  stopCount,
  stopCountWord,
  stopLetter,
  visitCount,
  WYS_STOP_IDS,
  wysWeeks as wysWeeksConst
} from "@/content/watch-your-step/weeks";
import {
  canonicalCollisions,
  externalAuthorityText,
  overWithholdingFeedbackText,
  planIntro,
  stopsCompletedLabel,
  stopsHeadline,
  stopsPeekHeading,
  wysLabels
} from "@/content/watch-your-step/copy";
import {
  WYS_NON_RECORD_MODULES,
  wysContentObjects,
  wysRegistry
} from "@/content/watch-your-step";
import { SHIP_NON_RECORD_MODULES, shipContentObjects, shipRegistry } from "@/content/ship";
import { standingOrders, standingOrderTag, STANDING_ORDER_IDS } from "@/content/ship/standing-orders";
import {
  captainsRoundNote,
  shipsLogEntries as shipsLogEntriesConst,
  type ShipsLogEntry
} from "@/content/ship/ships-log";
import { bridgePositions, supersedePosition } from "@/content/ship/bridge";
import { crewManifest, CREW_FIELD_LABELS } from "@/content/ship/crew-manifest";
import { quartersTiles } from "@/content/ship/quarters";
import { judgmentBeats, JUDGMENT_BEAT_IDS } from "@/content/canonical/judgment-framework";

/**
 * Phase 6 content-model checks (plan §11.1, §6.7-§6.10; WYS §14, §25, §26, §36).
 *
 * The governance checks that need to see EVERY content record live in
 * tests/canonical-text.test.ts, which owns the eight packet build checks. This
 * file owns the curriculum-specific ones: invariant equality, judgment mapping
 * coverage, source-reference resolution, §25 class coverage, §26 population,
 * and the rule that the stop count is derived rather than typed.
 */

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * The content modules close their arrays with `as const satisfies` (the repo
 * idiom, content/site-config.ts:1-77), which narrows every record to its own
 * literal shape — so a field that only some records carry does not exist on the
 * union. These aliases widen each array back to its declared interface, which is
 * how the tests read OPTIONAL fields (`primarySourceId`, `optionalPracticeIds`,
 * `emptyReferenceReason`) without weakening the const assertions the id unions
 * and the label totality depend on.
 */
const wysSources: readonly WysSourceAsset[] = wysSourcesConst;
const wysPrinciples: readonly WysPrinciple[] = wysPrinciplesConst;
const wysScenarios: readonly WysScenario[] = wysScenariosConst;
const wysJudgments: readonly WysJudgment[] = wysJudgmentsConst;
const wysBoundaries: readonly WysBoundary[] = wysBoundariesConst;
const wysVariants: readonly WysCanonicalVariant[] = wysVariantsConst;
const wysFictionalArtifacts: readonly WysFictionalArtifact[] = wysFictionalArtifactsConst;
const wysRituals: readonly WysRitual[] = wysRitualsConst;
const wysCarries: readonly WysCarry[] = wysCarriesConst;
const wysWeeks: readonly WysWeek[] = wysWeeksConst;
const shipsLogEntries: readonly ShipsLogEntry[] = shipsLogEntriesConst;

function tsFilesIn(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((entry) => !statSync(path.join(dir, entry)).isDirectory())
    .filter((entry) => entry.endsWith(".ts"));
}

const knownSourceIds = new Set<string>(wysSources.map((source) => source.id));
const knownPrincipleIds = new Set<string>(wysPrinciples.map((principle) => principle.id));
const knownScenarioIds = new Set<string>(wysScenarios.map((scenario) => scenario.id));
const knownJudgmentIds = new Set<string>(wysJudgments.map((judgment) => judgment.id));
const knownBoundaryIds = new Set<string>(wysBoundaries.map((boundary) => boundary.id));
const knownVariantIds = new Set<string>(wysVariants.map((variant) => variant.id));
const knownRitualIds = new Set<string>(wysRituals.map((ritual) => ritual.id));
const knownCarryIds = new Set<string>(wysCarries.map((carry) => carry.id));
const knownArtifactIds = new Set<string>(wysFictionalArtifacts.map((artifact) => artifact.id));

/** A citation resolves if it names a repo record or a registered external source. */
function resolvesAsSource(id: string): boolean {
  return knownSourceIds.has(id) || isExternalSourceRef(id);
}

/* -------------------------------------------------------------------------- */
/* Registration — the check that stops a module escaping governance silently   */
/* -------------------------------------------------------------------------- */

test("every module under content/watch-your-step is registered or declared record-free", () => {
  const registered = new Set(
    wysRegistry.map((group) => path.basename(group.module.split(" ")[0]))
  );
  const unregistered = tsFilesIn(path.join(repoRoot, "content", "watch-your-step")).filter(
    (file) => !registered.has(file) && !WYS_NON_RECORD_MODULES.includes(file)
  );
  assert.deepEqual(
    unregistered,
    [],
    "An unregistered content module escapes every governance check silently (docs/facelift-build-notes.md §7.5)."
  );
});

test("every module under content/ship is registered or declared record-free", () => {
  const registered = new Set(shipRegistry.map((group) => path.basename(group.module)));
  const unregistered = tsFilesIn(path.join(repoRoot, "content", "ship")).filter(
    (file) => !registered.has(file) && !SHIP_NON_RECORD_MODULES.includes(file)
  );
  assert.deepEqual(unregistered, []);
});

test("every content object carries a status and an origin", () => {
  const objects = [...wysContentObjects, ...shipContentObjects];
  assert.ok(objects.length > 60, `expected the full registry, found ${objects.length}`);
  for (const object of objects) {
    assert.ok(object.id, "a content object has no id");
    assert.ok(object.status, `${object.id} has no status`);
    assert.ok(object.origin, `${object.id} has no origin`);
  }
});

test("no content object id is used twice", () => {
  const seen = new Set<string>();
  for (const object of [...wysContentObjects, ...shipContentObjects]) {
    assert.equal(seen.has(object.id), false, `duplicate content id: ${object.id}`);
    seen.add(object.id);
  }
});

/* -------------------------------------------------------------------------- */
/* Source references resolve, or say why they are empty (Phase 6 exit)         */
/* -------------------------------------------------------------------------- */

test("every sourceIds citation resolves to a record or a registered external source", () => {
  const unresolved: string[] = [];
  const cite = (owner: string, ids: readonly string[]) => {
    for (const id of ids) if (!resolvesAsSource(id)) unresolved.push(`${owner} cites "${id}"`);
  };

  for (const principle of wysPrinciples) cite(principle.id, principle.sourceIds);
  for (const judgment of wysJudgments) cite(judgment.id, judgment.sourceIds);
  for (const ritual of wysRituals) cite(ritual.id, ritual.sourceIds);
  for (const order of standingOrders) cite(order.id, order.sourceIds);
  for (const entry of shipsLogEntries) cite(entry.id, entry.sourceIds);
  cite(captainsRoundNote.id, captainsRoundNote.sourceIds);
  for (const member of crewManifest) cite(member.id, member.sourceIds);
  for (const tile of quartersTiles) cite(tile.id, tile.sourceIds);

  assert.deepEqual(unresolved, []);
});

test("an empty source, principle or primary-source reference carries a recorded reason", () => {
  const offences: string[] = [];

  for (const source of wysSources) {
    if (source.principleIds.length === 0 && !source.emptyReferenceReason) {
      offences.push(`${source.id} has no principleIds and no emptyReferenceReason`);
    }
    for (const id of source.principleIds) {
      if (!knownPrincipleIds.has(id)) offences.push(`${source.id} cites unknown principle ${id}`);
    }
  }

  for (const principle of wysPrinciples) {
    if (principle.sourceIds.length === 0 && !principle.emptyReferenceReason) {
      offences.push(`${principle.id} has no sourceIds and no emptyReferenceReason`);
    }
  }

  for (const week of wysWeeks) {
    if (!week.primarySourceId && !week.emptyReferenceReason) {
      offences.push(`${week.id} has no primarySourceId and no emptyReferenceReason`);
    }
    if (week.primarySourceId && !knownSourceIds.has(week.primarySourceId)) {
      offences.push(`${week.id} cites unknown source ${week.primarySourceId}`);
    }
  }

  assert.deepEqual(offences, []);
});

test("every cross-reference between curriculum records resolves", () => {
  const broken: string[] = [];
  const check = (owner: string, field: string, ids: readonly string[], known: Set<string>) => {
    for (const id of ids) if (!known.has(id)) broken.push(`${owner}.${field} -> ${id}`);
  };

  for (const scenario of wysScenarios) {
    check(scenario.id, "principleIds", scenario.principleIds, knownPrincipleIds);
    check(scenario.id, "judgmentIds", scenario.judgmentIds, knownJudgmentIds);
    check(scenario.id, "boundaryIds", scenario.boundaryIds, knownBoundaryIds);
    check(scenario.id, "canonicalVariantIds", scenario.canonicalVariantIds, knownVariantIds);
    check(scenario.id, "artifactIds", scenario.artifactIds ?? [], knownArtifactIds);
  }
  for (const judgment of wysJudgments) {
    check(judgment.id, "scenarioIds", judgment.scenarioIds, knownScenarioIds);
  }
  for (const boundary of wysBoundaries) {
    check(boundary.id, "principleId", [boundary.principleId], knownPrincipleIds);
    check(boundary.id, "relatedScenarioIds", boundary.relatedScenarioIds, knownScenarioIds);
    check(boundary.id, "relatedJudgmentIds", boundary.relatedJudgmentIds, knownJudgmentIds);
  }
  for (const carry of wysCarries) {
    check(carry.id, "principleIds", carry.principleIds, knownPrincipleIds);
  }
  for (const ritual of wysRituals) {
    check(ritual.id, "principleIds", ritual.principleIds, knownPrincipleIds);
  }
  for (const week of wysWeeks) {
    check(week.id, "principleIds", week.principleIds, knownPrincipleIds);
    check(week.id, "watch", week.watch, knownSourceIds);
    check(week.id, "tryScenarioIds", week.tryScenarioIds, knownScenarioIds);
    check(week.id, "judgeIds", week.judgeIds, knownJudgmentIds);
    check(week.id, "boundaryIds", week.boundaryIds, knownBoundaryIds);
    check(week.id, "variantIds", week.variantIds, knownVariantIds);
    check(week.id, "artifactIds", week.artifactIds, knownArtifactIds);
    check(week.id, "carryIds", week.carryIds, knownCarryIds);
    check(week.id, "transferCheckIds", week.transferCheckIds, knownRitualIds);
    check(week.id, "optionalPracticeIds", week.optionalPracticeIds ?? [], knownRitualIds);
  }

  assert.deepEqual(broken, []);
});

/* -------------------------------------------------------------------------- */
/* WYS §14 — the invariant rule                                               */
/* -------------------------------------------------------------------------- */

test("every variant's invariant equals its parent scenario's, character for character", () => {
  assert.ok(wysVariants.length > 0, "there must be at least one variant to check");
  for (const variant of wysVariants) {
    const parent = wysScenarios.find((scenario) => scenario.id === variant.parentScenarioId);
    assert.ok(parent, `${variant.id} has no parent scenario`);
    assert.equal(
      variant.invariant,
      parent!.invariant,
      `${variant.id} drifts from ${variant.parentScenarioId}'s invariant (WYS §14)`
    );
  }
});

test("every variant's judgmentMapping covers every parent choice key", () => {
  for (const variant of wysVariants) {
    const parent = wysScenarios.find((scenario) => scenario.id === variant.parentScenarioId)!;
    const mapped = Object.keys(variant.judgmentMapping);
    for (const choice of parent.choices) {
      assert.ok(
        mapped.includes(choice.key),
        `${variant.id} does not map parent choice ${choice.key}`
      );
    }
    for (const judgmentId of Object.values(variant.judgmentMapping)) {
      assert.ok(knownJudgmentIds.has(judgmentId), `${variant.id} maps to unknown judgment ${judgmentId}`);
    }
  }
});

test("no BEN_AUTHORED_VARIATION exists in v0, so no Ben-variant pill can bind to one", () => {
  // Artboard 5c draws a teal "Ben variant" pill. Ben has authored no variation
  // (WYS §35 decision 9), so Practice ships "as authored" rows only.
  assert.equal(
    wysVariants.some((variant) => variant.origin === "BEN_AUTHORED_VARIATION"),
    false
  );
});

/* -------------------------------------------------------------------------- */
/* WYS §25 — over-withholding                                                 */
/* -------------------------------------------------------------------------- */

test("every named over-withholding class has at least one scenario", () => {
  const covered = new Set<WysOverWithholdingClass>();
  for (const scenario of wysScenarios) {
    if (scenario.overWithholdingClass) covered.add(scenario.overWithholdingClass);
  }
  const missing = WYS_OVER_WITHHOLDING_CLASSES.filter((klass) => !covered.has(klass));
  assert.deepEqual(missing, [], "WYS §25 names eight classes and §37 makes coverage an acceptance box");
});

test("the over-withholding feedback line is verbatim and defined exactly once", () => {
  assert.equal(
    overWithholdingFeedbackText.variants.short,
    "Caution is allowed. The question is whether the missing detail changes the task."
  );
  assert.equal(overWithholdingFeedbackText.status, "published");
  assert.ok(overWithholdingFeedbackText.sourceIds.includes("wys-spec-25"));
});

test("no over-withholding scenario or judgment shames the learner", () => {
  const shaming = /\b(should have known|careless|sloppy|foolish|naive|you failed|wrong of you)\b/i;
  const offences: string[] = [];
  const scan = (owner: string, values: readonly string[]) => {
    for (const value of values) if (shaming.test(value)) offences.push(`${owner}: ${value}`);
  };
  for (const scenario of wysScenarios) {
    scan(scenario.id, [scenario.setting, scenario.decisionMoment, ...scenario.choices.map((c) => c.label)]);
  }
  for (const judgment of wysJudgments) {
    scan(judgment.id, [judgment.call, ...judgment.reasoning, ...judgment.reasonableDisagreement]);
  }
  assert.deepEqual(offences, []);
});

test("every boundary carries both risk directions", () => {
  for (const boundary of wysBoundaries) {
    assert.ok(boundary.overDisclosureRisk.trim().length > 0, `${boundary.id} has no overDisclosureRisk`);
    assert.ok(boundary.overWithholdingRisk.trim().length > 0, `${boundary.id} has no overWithholdingRisk`);
  }
});

/* -------------------------------------------------------------------------- */
/* WYS §26 — external authority                                               */
/* -------------------------------------------------------------------------- */

test("the external-authority line is verbatim and anonymization is not a loophole", () => {
  assert.equal(
    externalAuthorityText.variants.short,
    "External authority outranks WYS's abstraction exercise."
  );
  const full = externalAuthorityText.variants.full;
  assert.equal(typeof full, "string");
  for (const authority of [
    "employer policy",
    "client confidentiality",
    "school policy",
    "law",
    "professional duties",
    "platform terms"
  ]) {
    assert.ok((full as string).includes(authority), `§26 omits ${authority}`);
  }
});

test("every scenario that implicates an outside rule has an authority note on its judgment", () => {
  const offences: string[] = [];
  for (const scenario of wysScenarios) {
    if (!scenario.implicatesExternalAuthority) continue;
    for (const judgmentId of scenario.judgmentIds) {
      const judgment = wysJudgments.find((record) => record.id === judgmentId)!;
      if (!judgment.externalAuthorityNotes || judgment.externalAuthorityNotes.length === 0) {
        offences.push(`${judgment.id} governs ${scenario.id} with no externalAuthorityNotes`);
      }
    }
  }
  assert.deepEqual(offences, []);
});

test("the §26 fields are populated rather than dead", () => {
  assert.ok(
    wysBoundaries.some((boundary) => Boolean(boundary.externalAuthorityCaveat)),
    "no boundary carries an externalAuthorityCaveat"
  );
  assert.ok(
    wysJudgments.some((judgment) => (judgment.externalAuthorityNotes ?? []).length > 0),
    "no judgment carries externalAuthorityNotes"
  );
  for (const carry of wysCarries) {
    assert.ok(carry.authorityBoundary, `${carry.id} has no authorityBoundary`);
  }
});

/* -------------------------------------------------------------------------- */
/* WYS §10 CARRY and §8.8 rituals                                             */
/* -------------------------------------------------------------------------- */

test("no carry requires reporting", () => {
  for (const carry of wysCarries) {
    assert.equal(carry.reportingRequired, false, `${carry.id} requires reporting`);
    assert.ok(carry.doNotSendBack.length > 0, `${carry.id} names nothing it does not want back`);
  }
});

test("every ritual names what the app must not do", () => {
  for (const ritual of wysRituals) {
    assert.ok(ritual.appMustNotDo.length > 0, `${ritual.id} has an empty appMustNotDo`);
    assert.ok(["none", "optional", "future"].includes(ritual.aiPresence));
  }
  const fromMemory = wysRituals.find((ritual) => ritual.id === "rit-from-memory")!;
  assert.equal(fromMemory.aiPresence, "none");
  assert.ok(
    fromMemory.appMustNotDo.some((rule) => /persist the scratch text/i.test(rule)),
    "From Memory must forbid persisting the scratch text (WYS §15.1)"
  );
});

/* -------------------------------------------------------------------------- */
/* WYS §11 / plan §6.9 — the stop count is derived, never typed               */
/* -------------------------------------------------------------------------- */

/**
 * `WYS_STOP_IDS` is written out rather than derived, because deriving it made
 * `content/watch-your-step/domains.ts` reference the whole week bank and put
 * every draft stop title into a client JavaScript chunk (Phase 12 audit; see
 * `scripts/check-bundle-provenance.mjs`). A vocabulary of ids carries no
 * provenance, so listing it is safe — but only while it cannot drift from the
 * records it names. This is the check that makes that true: add a stop without
 * adding its id and the suite fails rather than a serializer domain silently
 * shrinking.
 */
test("the stop id vocabulary is exactly the stops, in order", () => {
  assert.deepEqual(
    [...WYS_STOP_IDS],
    wysWeeks.map((week) => week.id),
    "WYS_STOP_IDS has drifted from wysWeeks"
  );
});

test("the stop count comes from the data", () => {
  assert.equal(stopCount(), wysWeeks.length);
  assert.equal(letteredStops().length, wysWeeks.length - 1);
  assert.equal(stopLetter(wysWeeks[0]), null);
  assert.equal(stopLetter(wysWeeks[1]), "A");
  assert.equal(stopLetter(wysWeeks[8]), "H");
});

test("prose surfaces get the number word and stat surfaces get the numeral", () => {
  assert.equal(stopCountWord(), countWord(stopCount()));
  assert.equal(stopsHeadline(), `${stopCountWord()} short stops. Then it's over.`);
  assert.equal(stopsPeekHeading(), `${stopCountWord()} short stops, then it's over`);
  assert.ok(planIntro().startsWith(stopCountWord()));
  assert.equal(stopsCompletedLabel(1), `1 of ${stopCount()}`);
  // The count today is nine, and the approved copy reads "Nine". If the data
  // changes the word changes with it, which is a Final-copy change (Q10).
  assert.equal(stopCountWord(), "Nine");
});

test("no module types the stop count as a literal in approved copy", () => {
  const scanned = [
    ...tsFilesIn(path.join(repoRoot, "content", "watch-your-step")).map((file) =>
      path.join(repoRoot, "content", "watch-your-step", file)
    ),
    ...tsFilesIn(path.join(repoRoot, "content", "ship")).map((file) =>
      path.join(repoRoot, "content", "ship", file)
    )
  ];
  const offences: string[] = [];
  for (const file of scanned) {
    const source = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
    if (/"[^"\n]*\bNine (short )?stops/i.test(source)) offences.push(path.relative(repoRoot, file));
    if (/"\d+ of 9"/.test(source)) offences.push(path.relative(repoRoot, file));
  }
  assert.deepEqual(offences, [], "the count must be derived from wysWeeks.length (plan §6.9)");
});

test("cadence paths resolve to declared day plans and give the visit counter its m", () => {
  for (const week of wysWeeks) {
    for (const cadence of ["2", "3", "5", "most"] as const) {
      const resolved = cadencePathFor(week, cadence);
      assert.ok(resolved.length > 0, `${week.id} has an empty path at cadence ${cadence}`);
      for (const dayPlanId of resolved) {
        assert.ok(
          WYS_DAY_PLAN_IDS.includes(dayPlanId as (typeof WYS_DAY_PLAN_IDS)[number]),
          `${week.id} references unknown day plan ${dayPlanId}`
        );
      }
    }
    assert.equal(cadencePathFor(week, "most").length, cadencePathFor(week, "5").length);
  }
  const stopA = wysWeeks[1];
  assert.equal(visitCount(stopA, "3"), 3, "artboard 5b draws 'visit 2 of 3' at the three-day cadence");
  const stopF = wysWeeks.find((week) => week.id === "stop-f")!;
  assert.equal(visitCount(stopF, "5"), 1, "stop F is a single off-site visit (WYS §15.2)");
});

test("the 5-day path ends CARRY-only, the ratified Q24 narrowing", () => {
  const stopA = wysWeeks[1];
  const days5 = cadencePathFor(stopA, "5");
  assert.equal(days5.length, 5);
  const lastDay = wysDayPlans.find((plan) => plan.id === days5[days5.length - 1])!;
  assert.deepEqual([...lastDay.segments], ["carry"]);
  const segments: readonly string[] = wysDayPlans.flatMap((plan) => [...plan.segments]);
  assert.equal(
    segments.includes("delayed-retrieval"),
    false,
    "the transfer-check surface is deferred in v0, so no day plan may route to it"
  );
});

/* -------------------------------------------------------------------------- */
/* Provenance                                                                 */
/* -------------------------------------------------------------------------- */

const SURFACE_BY_MODULE: Record<string, SurfaceKind> = {
  "content/watch-your-step/sources.ts": "human-source",
  "content/watch-your-step/sources.ts (Ben slots)": "human-source",
  "content/watch-your-step/scenarios.ts": "fictional-scenario",
  "content/watch-your-step/variants.ts": "fictional-scenario",
  "content/watch-your-step/judgments.ts": "judgment"
};

test("every content object's (surfaceKind, origin) pair has a declared provenance label", () => {
  const missing: string[] = [];
  for (const group of wysRegistry) {
    const surfaceKind = SURFACE_BY_MODULE[group.module] ?? "general";
    for (const record of group.records) {
      if (!hasProvenanceLabel(surfaceKind, record.origin as LabelOrigin)) {
        missing.push(`${record.id}: (${surfaceKind}, ${record.origin})`);
      }
    }
  }
  for (const record of shipContentObjects) {
    if (!hasProvenanceLabel("general", record.origin as LabelOrigin)) {
      missing.push(`${record.id}: (general, ${record.origin})`);
    }
  }
  assert.deepEqual(missing, []);
});

test("nothing draft resolves to canon, and no Ben-origin draft renders at all", () => {
  assert.equal(RENDER_MARKED_DRAFT, false, "Q21's ratified default");
  for (const group of wysRegistry) {
    const surfaceKind = SURFACE_BY_MODULE[group.module] ?? "general";
    for (const record of group.records) {
      if (record.status !== "draft") continue;
      const policy = renderPolicyFor(
        { surfaceKind, origin: record.origin, status: "draft" } as never,
        "public"
      );
      assert.notEqual(policy.kind, "canon", `${record.id} would render as canon`);
      assert.equal(policy.kind, "blocked", `${record.id} is public draft under RENDER_MARKED_DRAFT=false`);
    }
  }
});

test("no Ben slot can be filled, and no source claims an approved excerpt yet", () => {
  for (const slot of wysBenSlots) {
    assert.equal(slot.origin, "BEN_AUTHORED");
    assert.equal(slot.status, "draft");
    assert.ok(slot.label.length > 0);
    assert.ok(slot.awaitedAsset.length > 0);
    assert.equal("body" in slot, false, `${slot.id} carries a body`);
    assert.equal("text" in slot, false, `${slot.id} carries text`);
  }
  for (const source of wysSources) {
    assert.ok(isBenOrigin(source.origin), `${source.id} is not a Ben source`);
    assert.deepEqual([...(source.approvedExcerpts ?? [])], [], `${source.id} claims an approved excerpt`);
    assert.deepEqual([...source.allowedSurfaces], [], `${source.id} claims an allowed surface`);
  }
});

test("no principle attributes a statement to Ben", () => {
  for (const principle of wysPrinciples) {
    assert.equal(principle.exactBenStatement, undefined, `${principle.id} quotes Ben`);
    assert.equal(principle.approvedFormulation, undefined, `${principle.id} claims Ben approved a formulation`);
  }
});

test("the raw voice corpus enters as one record that forbids paraphrase and carries its digest", () => {
  const corpus = wysSources.find((source) => source.id === "src-raw-voice-corpus")!;
  assert.equal(corpus.medium, "transcript");
  assert.equal(corpus.status, "draft");
  assert.equal(corpus.origin, "BEN_AUTHORED");
  assert.deepEqual([...corpus.allowedSurfaces], []);
  assert.match(corpus.coachParaphrasePolicy ?? "", /forbidden/i);
  /**
   * Plan §6.12 names the digest this record must carry. It is a
   * content-integrity digest, not the governance digest of the keel, and
   * `tests/canonical-text.test.ts` holds both halves of that separation: this
   * one is declared in CONTENT_INTEGRITY_DIGESTS and permitted only here, and
   * every other 64-hex string in the repo still fails the build.
   */
  assert.equal(corpus.hash, RAW_VOICE_CORPUS_SHA256);
  assert.deepEqual([...corpus.approvedExcerpts!], [], "nothing in the corpus is approved to quote");
  assert.equal(
    wysSources.filter((source) => source.medium === "transcript").length,
    1,
    "the corpus enters as exactly one source asset (plan §6.12)"
  );
});

/* -------------------------------------------------------------------------- */
/* WYS §8.7 / §24 — the widened container union and the empty bank            */
/* -------------------------------------------------------------------------- */

test("the artifact type carries all twelve disclosure containers plus other", () => {
  assert.equal(WYS_ARTIFACT_TYPES.length, 13);
  assert.equal(WYS_ARTIFACT_TYPES[WYS_ARTIFACT_TYPES.length - 1], "other");
  for (const added of ["text-prompt", "voice-recording", "pasted-logs", "mixed-file-bundle"]) {
    assert.ok(WYS_ARTIFACT_TYPES.includes(added as never), `§24 container missing: ${added}`);
  }
});

test("the artifact bank is empty and nothing references a record that does not exist", () => {
  assert.equal(wysFictionalArtifacts.length, 0);
  for (const week of wysWeeks) assert.deepEqual([...week.artifactIds], []);
});

/* -------------------------------------------------------------------------- */
/* WYS §3.4 — the judgment framework                                          */
/* -------------------------------------------------------------------------- */

test("the judgment framework is six beats in order", () => {
  assert.deepEqual(
    judgmentBeats.map((beat) => beat.id),
    JUDGMENT_BEAT_IDS
  );
  assert.deepEqual(
    judgmentBeats.map((beat) => beat.order),
    [1, 2, 3, 4, 5, 6]
  );
  for (const beat of judgmentBeats) assert.ok(beat.question.endsWith("?") || beat.id === "JUDGMENT");
});

/* -------------------------------------------------------------------------- */
/* WYS §35 — the pre-answered content decisions                               */
/* -------------------------------------------------------------------------- */

test("the posture question and its four options are the artboard's, verbatim", () => {
  assert.equal(POSTURE_QUESTION, "Where are you with AI right now?");
  assert.equal(
    POSTURE_QUESTION_NOTE,
    "No wrong answer, nothing to justify. It only sets the pace of your first week."
  );
  assert.deepEqual(
    POSTURE_OPTIONS.map((option) => option.label),
    [
      "I've never really used it",
      "I've tried it and stopped",
      "I use it but I don't trust it",
      "I use it a lot and want better judgment"
    ]
  );
  assert.equal(
    POSTURE_OPTIONS.some((option) => /i hate it/i.test(option.label)),
    false,
    "the superseded option must not return (WYS §9.2)"
  );
});

test("Q20's two flags default on, matching the approved artboards", () => {
  assert.equal(PERSIST_LOCAL_JUDGMENTS, true);
  assert.equal(SHIP_LEARNER_RULEBOOK, true);
});

test("the serializer's domains are wired from content and every id resolves", () => {
  assert.deepEqual([...WYS_DOMAINS.postureChoiceIds], [...POSTURE_OPTION_IDS]);
  assert.deepEqual([...WYS_DOMAINS.choiceKeys], [...WYS_CHOICE_KEYS]);
  for (const id of WYS_DOMAINS.scenarioIds) assert.ok(knownScenarioIds.has(id), `unknown scenario ${id}`);
  for (const id of WYS_DOMAINS.stopIds) {
    assert.ok(wysWeeks.some((week) => week.id === id), `unknown stop ${id}`);
  }
  assert.deepEqual([...WYS_DOMAINS.noticeIds], [], "no artboard draws a dismissable notice yet");
  const declared = new Set(WYS_CHOICE_KEYS);
  for (const scenario of wysScenarios) {
    for (const choice of scenario.choices) {
      assert.ok(declared.has(choice.key), `${scenario.id} uses undeclared choice key ${choice.key}`);
    }
  }
});

/* -------------------------------------------------------------------------- */
/* Version                                                                    */
/* -------------------------------------------------------------------------- */

test("CONTENT_VERSION satisfies both validators that have to accept it", () => {
  assert.match(CONTENT_VERSION, /^[0-9][0-9a-z.-]{0,31}$/, "telemetry content_version pattern");
  assert.match(CONTENT_VERSION, /^[A-Za-z0-9_.:-]{1,64}$/, "aggregate field token pattern");
});

/* -------------------------------------------------------------------------- */
/* Ship content                                                               */
/* -------------------------------------------------------------------------- */

test("nine Standing Orders ship, 01 carries the gloss, 08 and 09 are present", () => {
  assert.equal(standingOrders.length, 9);
  assert.deepEqual(
    standingOrders.map((order) => order.id),
    [...STANDING_ORDER_IDS]
  );
  assert.equal(standingOrders[0].gloss, "AI may execute; only Ben signs.");
  assert.equal(standingOrders[0].emphasis, "ink");
  assert.equal(standingOrderById08(), "History is preserved, never rewritten.");
  assert.equal(standingOrders[8].title, "Mobile first.");
  for (const order of standingOrders.slice(1)) assert.equal(order.emphasis, "grey");
  assert.equal(standingOrderTag("order-03"), "Order 03");
});

function standingOrderById08(): string {
  return standingOrders.find((order) => order.id === "order-08")!.title;
}

test("every Ship's Log order tag resolves, and the Captain's Round note is not an entry", () => {
  const ids = new Set<string>(STANDING_ORDER_IDS);
  for (const entry of shipsLogEntries) {
    assert.ok(entry.orderTags.length > 0, `${entry.id} has no order tags`);
    for (const tag of entry.orderTags) assert.ok(ids.has(tag), `${entry.id} tags unknown ${tag}`);
    assert.match(entry.date, /^\d{4}-\d{2}-\d{2}$/, "the date is data, not a rendered string");
    assert.equal(entry.approvedBy, undefined, "nothing is stamped yet");
  }
  const entryIds: readonly string[] = shipsLogEntries.map((entry) => entry.id);
  assert.equal(
    entryIds.includes(captainsRoundNote.id),
    false,
    "the Captain's Round note is a distinct object, not a log entry"
  );
  assert.equal("date" in captainsRoundNote, false, "a forward-looking note has no date");
});

test("the Bridge carries the supersession machinery its intro claims (Q25)", () => {
  assert.equal(bridgePositions.length, 0, "Ben has written no position, so the page renders the slot");
  const [old, next] = supersedePosition(
    {
      id: "position-one",
      status: "published",
      origin: "BEN_AUTHORED",
      takenAt: "2026-09-03",
      statement: "…",
      sourceIds: []
    },
    {
      id: "position-two",
      status: "published",
      origin: "BEN_AUTHORED",
      takenAt: "2026-10-01",
      statement: "…",
      sourceIds: []
    }
  );
  assert.equal(old.status, "historical");
  assert.equal(old.supersededBy, "position-two");
  assert.equal(old.canonical, false);
  assert.equal(next.status, "published");
  const policy = renderPolicyFor(
    { surfaceKind: "general", origin: "BEN_AUTHORED", status: "historical", supersededBy: old.supersededBy, canonical: false },
    "archive"
  );
  assert.equal(policy.kind, "marked", "a superseded position renders marked on the Log, never as canon");
});

test("every crew member answers all five packet fields", () => {
  assert.equal(CREW_FIELD_LABELS.length, 5);
  assert.ok(crewManifest.length >= 4);
  for (const member of crewManifest) {
    assert.ok(member.does.trim().length > 0, `${member.id} does not say what it does`);
    assert.ok(member.canAccess.length > 0, `${member.id} names nothing it can access`);
    assert.ok(member.cannotAccess.length > 0, `${member.id} names nothing it cannot access`);
    assert.ok(member.hasAuthorityTo.length > 0, `${member.id} names no authority`);
    assert.ok(member.hasNoAuthorityTo.length > 0, `${member.id} names no absent authority`);
  }
  const claude = crewManifest.find((member) => member.id === "crew-claude-build-session")!;
  assert.equal(claude.role, "build");
  assert.ok(claude.hasNoAuthorityTo.some((rule) => /sign/i.test(rule)), "only Ben signs (Standing Order 01)");
});

test("the Captain's Quarters grid is six tiles and the Studio tile is unlinked", () => {
  assert.equal(quartersTiles.length, 6);
  const studio = quartersTiles.find((tile) => tile.id === "tile-studio")!;
  assert.equal(studio.href, null, "Q5 is open; the tile carries its label and no target");
  assert.equal(
    quartersTiles.some((tile) => tile.href === "/studio"),
    false,
    "/studio is the preserved Violin for Parents page and is not relabelled"
  );
  assert.equal(quartersTiles.find((tile) => tile.id === "tile-watch-your-step")!.current, true);
  assert.match(
    quartersTiles.find((tile) => tile.id === "tile-yy-method")!.subLabel,
    /^v2\.3 · the keel$/,
    "the version half reads from lib/approval-state.ts"
  );
});

/* -------------------------------------------------------------------------- */
/* The collapsed-collision register (plan §6.8)                               */
/* -------------------------------------------------------------------------- */

test("the canonical collisions are recorded and the labels are pinned", () => {
  // 6 -> 7 in Phase 7 (shell): the Commit pill is punctuated two ways across
  // 4a and 5b, and the JUDGE composite renders on four surfaces, so the string
  // had to be pinned in content/watch-your-step/judge.ts rather than typed per
  // screen. Update this number deliberately; that is what the assertion is for.
  assert.equal(canonicalCollisions.length, 7);
  for (const collision of canonicalCollisions) {
    assert.ok(collision.conflict.length > 0);
    assert.ok(collision.resolution.length > 0);
  }
  assert.equal(wysLabels.shipsLogLabel, "Ship's Log");
  assert.equal(wysLabels.dataPageTitle, "What this site knows about you");
  assert.equal(wysLabels.dataPageLinkLabel, "See what this site knows about you");
  assert.notEqual(wysLabels.yyMethodPropertyLabel, wysLabels.yyMethodDocumentLabel);
});

test("the three stop titles that collided keep the 5b long forms", () => {
  const byId = (id: string) => wysWeeks.find((week) => week.id === id)!;
  assert.equal(byId("stop-b").title, "Minimum Necessary Is Not Minimum Possible");
  assert.equal(byId("stop-e").title, "Delegation and Verification");
  assert.equal(byId("stop-g").title, "Memory, State, and Correction");
  assert.equal(byId("stop-b").shortTitle, "Minimum Necessary ≠ Minimum Possible");
  assert.equal(byId("stop-h").title, "Learner-Owned Rules and Exit");
  assert.equal(byId("stop-h").shortTitle, "Your Rules. Exit.");
});

/* -------------------------------------------------------------------------- */
/* WYS §36 — the twelve authoring templates                                   */
/* -------------------------------------------------------------------------- */

test("all twelve authoring templates exist and each ends in a status field", () => {
  const dir = path.join(repoRoot, "content", "watch-your-step", "_templates");
  const expected = [
    "artifact-template.md",
    "boundary-template.md",
    "carry-template.md",
    "judgment-template.md",
    "principle-template.md",
    "ritual-template.md",
    "scenario-template.md",
    "source-template.md",
    "story-template.md",
    "transcript-template.md",
    "variant-template.md",
    "week-template.md"
  ];
  assert.deepEqual(readdirSync(dir).sort(), expected);
  for (const file of expected) {
    const body = readFileSync(path.join(dir, file), "utf8").trimEnd();
    assert.ok(body.endsWith("## status"), `${file} does not end in a status field`);
  }
});
