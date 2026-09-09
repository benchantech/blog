import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  DEVELOPER_FORWARD_AUTHORITIES,
  DEVELOPER_FORWARD_RECORD_FREE_MODULES,
  DEVELOPER_FORWARD_YY_MODULES,
  developerForwardRegistry
} from "@/content/developer-forward/index";
import { approvalState } from "@/lib/approval-state";
import { AGGREGATION_POLICY_ID } from "@/lib/developer-forward/aggregation";
import { calculateShip } from "@/lib/developer-forward/scoring";
import { professionalSummary, professionalSummaryClauses } from "@/lib/developer-forward/summary";
import {
  DECISION_IDS,
  DIMENSIONS,
  OPTION_IDS,
  POSTURES,
  TERNARY_STATES,
  type Dimension,
  type DimensionState
} from "@/lib/developer-forward/types";

import * as casesModule from "@/content/developer-forward/cases";
import * as copyModule from "@/content/developer-forward/copy";
import * as digestsModule from "@/content/developer-forward/digests";
import * as indexModule from "@/content/developer-forward/index";
import * as narrativeModule from "@/content/developer-forward/narrative";
import * as profilesModule from "@/content/developer-forward/profiles";
import * as receiptsModule from "@/content/developer-forward/receipts";
import * as signalsModule from "@/content/developer-forward/signals";
import * as surfacesModule from "@/content/developer-forward/surfaces";
import * as variantsModule from "@/content/developer-forward/variants";
import * as stampModule from "@/content/developer-forward/stamp/v1-1-0";

/**
 * Developer Forward Lite — the content governance gate (plan §7; REV4 test table).
 *
 * WHY THIS FILE IMPORTS NOTHING BUT DATA. The suite runs as
 * `node --import tsx --test tests/*.test.ts`, and Node cannot resolve a `.css`
 * specifier: one component import anywhere in this file's transitive graph
 * takes the WHOLE FILE down with `ERR_UNKNOWN_FILE_EXTENSION`, and a test file
 * that cannot load is a test file that cannot fail. So this asserts over
 * `content/developer-forward/` and the pure modules under `lib/developer-forward/`, and
 * never over a renderer. Same discipline as `tests/wys-content.test.ts`.
 *
 * WHY IT ASSERTS OVER EXPORTED VALUES AND NOT OVER FILE TEXT. Every public-copy
 * guard below (`§5`) names a string that this repository is FORBIDDEN TO SHIP —
 * and each of those strings is also DISCUSSED, by name, in the header comments
 * of the very modules that struck it. `content/developer-forward/surfaces.ts` says
 * in prose that "729 possible profiles" is not shipped; a grep of the file for
 * "729 possible profiles" therefore hits the sentence explaining the ban and
 * fails. A grep would force those explanations to be deleted or spelled around,
 * which would leave the ban undocumented at exactly the place a future author
 * looks. So the guards walk the modules' EXPORTED VALUES — every string a
 * renderer could reach — which is the population the ruling actually governs.
 *
 * WHY §7 READS FILES FROM OUTSIDE THE REPOSITORY. Everything through §6 asks
 * whether the shipped copy is FORBIDDEN. Nothing there asks whether it is what
 * Ben APPROVED, and that question cannot be answered from inside `content/`: a
 * transcription slip, a straightened quote, a dropped clause — each leaves the
 * module self-consistent and every other check green. So §7 compares the layer
 * 09 copy against the approved artifacts themselves
 * (`09_final-copy-completion-2026-09-07`, BEN_APPROVED 2026-09-07), which are
 * not vendored here, and FAILS rather than skips when they are absent — the
 * same rule `tests/developer-forward-scoring.test.ts` follows, for the same reason.
 *
 * WHAT THIS FILE CANNOT DO. It proves nothing about what `app/` renders.
 * `tests/canonical-text.test.ts` bans learner prose from `app/` and
 * `components/`, and that is the check which forces every sentence through
 * these modules; without it, this file governs a directory a component could
 * simply bypass. The two are a pair.
 */

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(repoRoot, "content", "developer-forward");

/* -------------------------------------------------------------------------- */
/* 0. The harness                                                             */
/* -------------------------------------------------------------------------- */

/** Every `.ts` file under `content/developer-forward/`, repo-relative, POSIX-slashed. */
function contentModulePaths(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) contentModulePaths(full, out);
    else if (full.endsWith(".ts")) out.push(path.relative(repoRoot, full).split(path.sep).join("/"));
  }
  return out;
}

/**
 * The module namespaces, keyed by the repo path the registry names them by.
 *
 * Listed explicitly rather than loaded dynamically: a dynamic import loop would
 * make the "every module is registered" check pass for a module this file never
 * actually looked inside, which is the failure mode the check exists to catch.
 * A new content module therefore needs a line HERE as well as in the registry,
 * and §1 fails until it has one.
 */
const MODULE_NAMESPACES: Readonly<Record<string, Record<string, unknown>>> = {
  "content/developer-forward/cases.ts": casesModule,
  "content/developer-forward/copy.ts": copyModule,
  "content/developer-forward/digests.ts": digestsModule,
  "content/developer-forward/index.ts": indexModule,
  "content/developer-forward/narrative.ts": narrativeModule,
  "content/developer-forward/profiles.ts": profilesModule,
  "content/developer-forward/receipts.ts": receiptsModule,
  "content/developer-forward/signals.ts": signalsModule,
  "content/developer-forward/surfaces.ts": surfacesModule,
  "content/developer-forward/variants.ts": variantsModule,
  "content/developer-forward/stamp/v1-1-0.ts": stampModule
};

interface ContentString {
  module: string;
  /** Dotted access path from the export, so a failure names the record. */
  at: string;
  text: string;
}

/**
 * Every string reachable from every export of every content module.
 *
 * Functions are skipped — a function body is source, not a shipped value, and
 * the strings it composes at call time come from the data it reads, which IS
 * walked. Cycles are guarded because the registry re-exports the digest table
 * that `digests.ts` and the stamp also export; the same array is reached three
 * ways and must not be walked three times.
 */
function collectContentStrings(): readonly ContentString[] {
  const found: ContentString[] = [];
  for (const [module, namespace] of Object.entries(MODULE_NAMESPACES)) {
    const seen = new Set<object>();
    const walk = (at: string, value: unknown): void => {
      if (typeof value === "string") {
        found.push({ module, at, text: value });
        return;
      }
      if (typeof value !== "object" || value === null || seen.has(value)) return;
      seen.add(value);
      if (Array.isArray(value)) {
        value.forEach((entry, i) => walk(`${at}[${i}]`, entry));
        return;
      }
      for (const [key, entry] of Object.entries(value)) walk(`${at}.${key}`, entry);
    };
    for (const [key, value] of Object.entries(namespace)) {
      if (typeof value === "function") continue;
      walk(key, value);
    }
  }
  return found;
}

const contentStrings = collectContentStrings();

/** `module::group` for a per-group tag, `module::<module>` for a whole-module tag. */
interface AuthorityClaim {
  key: string;
  value: string;
}

/**
 * The authority claims a registry entry makes.
 *
 * Three shapes, because the registry holds three honest shapes: a bare tag for
 * a module whose records share one provenance, a `{ group: tag }` record for a
 * module whose groups do not, and — for `digests.ts` alone — an ARRAY, which
 * makes no authorship claim at all. The digest registry records which SOURCE
 * ARTIFACT the other modules were derived from; it is the provenance ANCHOR,
 * not a provenance value, which is why it is registered (nothing may escape the
 * registry) and why it claims no authority level. §2 asserts that shape
 * directly rather than letting it fall through a permissive default.
 */
function authorityClaims(entry: { module: string; provenance: unknown }): readonly AuthorityClaim[] {
  const { module, provenance } = entry;
  if (typeof provenance === "string") return [{ key: `${module}::<module>`, value: provenance }];
  if (Array.isArray(provenance)) return [];
  if (provenance && typeof provenance === "object") {
    return Object.entries(provenance).map(([group, value]) => ({
      key: `${module}::${group}`,
      value: String(value)
    }));
  }
  return [{ key: `${module}::<module>`, value: String(provenance) }];
}

const registryClaims = developerForwardRegistry.flatMap(authorityClaims);

/* -------------------------------------------------------------------------- */
/* 1. Registry completeness                                                   */
/* -------------------------------------------------------------------------- */

/**
 * `content/developer-forward/index.ts` is a governance mechanism, and a governance
 * mechanism that can be bypassed by adding a file is a convention. Every module
 * is registered or DECLARED record-free; a module in neither is invisible to
 * every check in this file and to `tests/canonical-text.test.ts`, and it fails
 * here rather than being noticed later.
 */
test("every content/developer-forward module is registered or declared record-free", () => {
  const onDisk = contentModulePaths(contentDir).sort();
  assert.ok(onDisk.length > 0, "no content modules found — the walk is looking in the wrong place");

  // Registry module labels carry a disambiguating suffix where one module
  // registers two groups ("…/cases.ts (authoring notes)"). The FILE is the key.
  const registered = new Set(
    developerForwardRegistry.map((group) => group.module.split(" (")[0])
  );
  const declaredFree = new Set(DEVELOPER_FORWARD_RECORD_FREE_MODULES);

  const unaccounted = onDisk.filter((file) => !registered.has(file) && !declaredFree.has(file));
  assert.deepEqual(
    unaccounted,
    [],
    "add each module to developerForwardRegistry or DEVELOPER_FORWARD_RECORD_FREE_MODULES in the same commit"
  );

  // And the reverse: a registry that names a file which no longer exists is
  // recording governance over nothing.
  const onDiskSet = new Set(onDisk);
  for (const file of [...registered, ...declaredFree]) {
    assert.ok(onDiskSet.has(file), `${file} is registered but does not exist on disk`);
  }

  // The stamp directory is inside the walk, not beside it. It was the module
  // most likely to be missed, being a subdirectory.
  assert.ok(onDiskSet.has("content/developer-forward/stamp/v1-1-0.ts"));

  /*
   * The YY subtree is governed by its OWN test file, not by this one.
   *
   * `MODULE_NAMESPACES` exists so every module gets a value-level guard here.
   * The YY rewrite carries a different provenance vocabulary (`YYProvenance`,
   * five values) and a different content shape, so this file's guards cannot
   * meaningfully read it — forcing them to would mean weakening them until they
   * accepted both shapes, which is how a guard stops guarding.
   *
   * So the coverage claim is DELEGATED, not dropped, and the delegation is
   * checked: the file it delegates to must exist and must actually import each
   * module. That check is the whole point — a comment saying "covered
   * elsewhere" is exactly the kind of claim this session found to be false
   * three times over.
   */
  const yyGuard = "tests/developer-forward-yy-content.test.ts";
  const yyGuardSource = readFileSync(path.join(repoRoot, yyGuard), "utf8");
  for (const file of DEVELOPER_FORWARD_YY_MODULES) {
    const specifier = file.replace(/^content\//, "@/content/").replace(/\.ts$/, "");
    assert.ok(
      yyGuardSource.includes(specifier) || yyGuardSource.includes(path.basename(file, ".ts")),
      `${file} claims to be governed by ${yyGuard}, which does not reference it`
    );
  }

  // Every other registered file must be one this test file actually opened.
  for (const file of onDisk) {
    if (DEVELOPER_FORWARD_YY_MODULES.includes(file)) continue;
    assert.ok(
      Object.hasOwn(MODULE_NAMESPACES, file),
      `${file} is not in MODULE_NAMESPACES, so no value-level guard in this file can see it`
    );
  }
});

/* -------------------------------------------------------------------------- */
/* 2. The six authority levels                                                */
/* -------------------------------------------------------------------------- */

/**
 * The six-way distinction is finer than the repo's `ContentOrigin` enum on
 * purpose (`TRUST_FORWARD_PROVENANCE.md`), and a seventh value invented at a
 * call site would be a new authorship claim that no ruling authorises.
 */
test("every provenance value is one of the six declared authority levels", () => {
  const declared = new Set<string>(DEVELOPER_FORWARD_AUTHORITIES);
  assert.equal(declared.size, 6, "the authority vocabulary is six-way; it was not widened here");

  assert.ok(registryClaims.length > 0);
  for (const claim of registryClaims) {
    assert.ok(
      declared.has(claim.value),
      `${claim.key} claims "${claim.value}", which is not one of the six declared authority levels`
    );
  }

  // Record-level tags too. `CASES[n].provenance` and the surface records carry
  // their own field, and a record is exactly where an undeclared value would
  // hide from a module-level check.
  const recordTags = contentStrings.filter(
    (found) => found.at.endsWith(".provenance") || found.at.endsWith(".authority")
  );
  assert.ok(recordTags.length > 0, "no record-level provenance fields found — the walk missed them");
  for (const tag of recordTags) {
    assert.ok(
      declared.has(tag.text),
      `${tag.module} ${tag.at} claims "${tag.text}", which is not one of the six declared authority levels`
    );
  }

  // The one registry entry that makes no authorship claim must be the digest
  // anchor, and must be a real digest table rather than an empty escape hatch.
  const anchor = developerForwardRegistry.find((group) => Array.isArray(group.provenance));
  assert.ok(anchor, "the digest registry is no longer registered");
  assert.equal(anchor.module, "content/developer-forward/digests.ts");
  const entries = anchor.provenance as readonly Record<string, unknown>[];
  assert.ok(entries.length > 0);
  for (const entry of entries) {
    assert.equal(typeof entry.digest, "string");
    assert.match(entry.digest as string, /^[0-9a-f]{64}$/);
    assert.equal(typeof entry.artifact, "string");
    assert.ok((entry.reason as string).length > 0, "a declared digest must say why it is a content digest");
  }

  // Every module that carries records is covered by at least one claim.
  const covered = new Set(registryClaims.map((claim) => claim.key.split("::")[0]));
  for (const file of Object.keys(MODULE_NAMESPACES)) {
    if (DEVELOPER_FORWARD_RECORD_FREE_MODULES.includes(file)) continue;
    if (file === "content/developer-forward/digests.ts") continue;
    assert.ok(covered.has(file), `${file} carries records but declares no provenance`);
  }
});

/* -------------------------------------------------------------------------- */
/* 3. The `ben_canonical` gate                                                */
/* -------------------------------------------------------------------------- */

/**
 * THE FROZEN LIST OF BEN-AUTHORED GROUPS. Every entry is a group whose strings
 * come verbatim from a Ben-supplied document: layer 01's `UX_COPY.md`, which
 * `FINAL_READ_ORDER_AND_AUTHORITY.md` names the base authority, or a layer-07
 * file carrying `"authority": "ben_approved_governing_rule"`.
 *
 * The list is frozen because the rule it enforces is about ADDITION:
 * *"Never relabel implementation-authored copy as Ben-authored merely because
 * it was generated to fill a package gap."* A group that acquires
 * `ben_canonical` without a ruling is the exact failure named, and it fails
 * here whether it was relabelled or newly written.
 *
 * ONE ENTRY WAS ADDED ON 2026-09-08 AND IT IS THE FIRST WITHOUT A FILE BEHIND
 * IT. `DEVELOPER_FORWARD_TEASER` carries sentences Ben wrote directly in the
 * session of 2026-09-08 as the brief for `/developer-forward`, not sentences
 * extracted from a document under `bct-facelift/`. The gate did what it exists
 * to do: the group was written first, this test went red, and the entry was
 * added together with the ruling recorded at the constant's definition site —
 * including the one edit made to his words (third person to second) and why
 * labelling it anything but `ben_canonical` would have been the same
 * mislabelling pointing the other way. Frozen still means frozen: the next
 * addition needs its own recorded ruling, and "there was one last time" is not
 * one.
 */
const BEN_AUTHORED_GROUPS: readonly string[] = [
  "content/developer-forward/copy.ts::INFO_MARKERS",
  "content/developer-forward/copy.ts::LITE_INTRO",
  "content/developer-forward/copy.ts::PROGRESS",
  "content/developer-forward/copy.ts::REFLECTION",
  "content/developer-forward/copy.ts::HANDLE",
  "content/developer-forward/copy.ts::RESULT",
  "content/developer-forward/copy.ts::FULL_OFFER",
  "content/developer-forward/copy.ts::LANDING_INCOMPLETE",
  "content/developer-forward/copy.ts::LANDING_COMPLETE",
  "content/developer-forward/copy.ts::DEVELOPER_FORWARD_TEASER",
  "content/developer-forward/variants.ts::caseAxes",
  "content/developer-forward/variants.ts::missingEvidenceFallbacks"
];

/**
 * The plan's sentence is *"a test asserts no record carries `ben_canonical`
 * while `approvalState.stamp` is null"*, and it needs stating precisely,
 * because `ben_canonical` and the Captain's Stamp are TWO DIFFERENT AXES and
 * the site currently sits at opposite ends of them.
 *
 *   - `ben_canonical` answers WHO WROTE THE SENTENCE. Layer 01 and layer 07 are
 *     Ben's own documents, so the eleven groups above are honestly his words —
 *     `content/claims.ts` records the artboard copy the same way, and
 *     `content/developer-forward/copy.ts` says so at its definition site.
 *   - `approvalState.stamp` answers WHETHER BEN HAS STAMPED THIS BUILD. It is
 *     null. Nothing on this site is stamped.
 *
 * A test that read the plan's sentence as "the tag may not appear at all" would
 * be unsatisfiable against Ben's own approved copy, and the only way to make it
 * green would be to MISLABEL that copy as recovered or implementation-authored
 * — a provenance lie in the opposite direction, and one
 * `CURRENT_IMPLEMENTATION_STATUS_2026-09-07.md` forbids in both directions.
 *
 * So the gate is the one that is both enforceable and load-bearing, in three
 * parts: while nothing is stamped, (a) NO NEW group may claim `ben_canonical`;
 * (b) the two groups the handoff explicitly excluded from approval — the 33
 * receipts and the export section labels — may never claim it; and (c) no
 * shipped string may assert that Ben approved or stamped anything.
 */
test("nothing claims Ben's authorship or approval beyond the frozen approved set", () => {
  assert.equal(
    approvalState.stamp,
    null,
    "approvalState.stamp is no longer null; this gate and its allowlist need re-ruling, not deleting"
  );

  // (a) No new ben_canonical group.
  const claimed = registryClaims
    .filter((claim) => claim.value === "ben_canonical")
    .map((claim) => claim.key)
    .sort();
  assert.deepEqual(
    claimed,
    [...BEN_AUTHORED_GROUPS].sort(),
    "a group gained or lost `ben_canonical`. Adding one is a new claim that Ben wrote those words; it needs a ruling, not a content edit."
  );

  // (b) The two groups the approval records explicitly exclude.
  //     SC_TF1_APPROVAL_RECORD_2026-09-07.md on the 33 receipts: "They were not
  //     included in this approval." The export section labels are the
  //     specification's own part names, authored here under a rule.
  assert.equal(
    receiptsModule.RECEIPT_PHRASES_PROVENANCE,
    "implementation_authored_under_ben_approved_rule"
  );

  // (c) No shipped string may assert approval or a stamp while there is none.
  //     `lib/approval-state.ts` owns every governance sentence on the site, and
  //     "Every published word was approved by Ben." is a VARIANT it selects —
  //     a copy of that claim living in content/ would render it unconditionally.
  const approvalClaims = [
    /approved by ben/i,
    /ben (has )?approved/i,
    /stamped by ben/i,
    /captain'?s stamp/i,
    /ben'?s approval/i
  ];
  for (const found of contentStrings) {
    for (const pattern of approvalClaims) {
      assert.ok(
        !pattern.test(found.text),
        `${found.module} ${found.at} asserts approval (${pattern}) while approvalState.stamp is null: ${found.text}`
      );
    }
  }
});

/* -------------------------------------------------------------------------- */
/* 4. The receipt invariant                                                   */
/* -------------------------------------------------------------------------- */

/**
 * A FORBIDDEN VOCABULARY, and why these words and not others.
 *
 * Ben's approved rule (`receipt-authoring-and-export.BEN_APPROVED.json`) is
 * `"Situation -> observable choice/action. Nothing else."` with a six-item
 * `forbidden` list: inferred intention, praise, judgment label, doctrine,
 * because-explanation, receipt strength. Four of those six are vocabulary and
 * can be checked; the other two are structure and are checked below.
 *
 * The list here is deliberately SMALL and deliberately made of words that
 * cannot occur factually in a sentence of the form "You <did> <thing>". That
 * boundary is the whole design:
 *
 *   - "stronger evidence", "targeted checks", "delivery risk", "reversible
 *     release path" are all FACTS about the option and must stay legal, so
 *     "strong", "risk", "safe" and their relatives are NOT banned. Banning them
 *     would force the authored phrases to be reworded to satisfy a test, which
 *     is the tail wagging the ruling.
 *   - What is banned is the vocabulary that can only be a VERDICT on the
 *     person: an adverb of correctness ("appropriately", "wisely"), a character
 *     label ("careless", "disciplined"), or a counterfactual ("should have",
 *     "failed to"). None of these can describe an observable action; each of
 *     them scores one.
 *
 * "You were appropriately cautious." is the sentence this list exists to keep
 * off the result page: it has a receipt's grammar and a verdict's content.
 */
const JUDGMENT_VOCABULARY: readonly string[] = [
  // Adverbs and adjectives of correctness — a grade, never an observation.
  "appropriately",
  "inappropriately",
  "correctly",
  "incorrectly",
  "wisely",
  "unwisely",
  "rightly",
  "wrongly",
  "prudent",
  "prudently",
  "sensible",
  "sensibly",
  "optimal",
  "suboptimal",
  // Character labels — a property of the learner, not of the choice.
  "careless",
  "carelessly",
  "reckless",
  "recklessly",
  "disciplined",
  "undisciplined",
  "sloppy",
  "hasty",
  "rash",
  "naive",
  "lazy",
  "diligent",
  "mature",
  "immature",
  "unprofessional",
  // Praise.
  "excellent",
  "admirable",
  "impressive",
  "commendable",
  "well done",
  "good work",
  // Counterfactuals — a receipt records what happened, never what should have.
  "should have",
  "could have",
  "ought to",
  "failed to",
  "mistake",
  "best practice"
];

/**
 * A because-clause is forbidden when it explains THE LEARNER.
 *
 * The ruling's "because-explanation" bans reasons attributed to the person —
 * "because you wanted to protect the relationship" infers a motive the fixed
 * answer cannot evidence. It does NOT ban a because-clause that belongs to the
 * option's own content: two authored phrases end "…because the new evidence
 * changed the prior assumption" and "…because the completion claim was
 * unsupported", and both are ported verbatim from the approved draft. In each,
 * the clause names a fact about the SITUATION that the move itself is defined
 * against, not a state of mind read off the learner. The regexes therefore
 * anchor on a person-subject, which is the difference the rule turns on.
 */
const INFERRED_INTENTION_PATTERNS: readonly RegExp[] = [
  /\b(because|since|as)\s+you\b/i,
  /\bso\s+that\s+you\b/i,
  /\bin\s+order\s+to\b/i,
  /\byou\s+(felt|believed|wanted|knew|thought|assumed|preferred|trusted|feared|hoped|intended|were\s+trying)\b/i,
  /\byour\s+(instinct|intuition|preference|tendency|style|nature|reasoning|motive)\b/i,
  /\bthis\s+(shows|means|suggests|indicates|reveals|tells)\b/i,
  /\bwhich\s+(shows|means|suggests|indicates|reveals)\b/i
];

test("the 33 receipts are situation -> observable choice/action, and nothing else", () => {
  const table = receiptsModule.RECEIPT_PHRASES;
  const phrases: { id: string; text: string }[] = [];

  // Total by construction: 11 decisions x 3 options. The export rule is
  // `allDecisionReceipts: true`, which is only possible against a total table.
  assert.equal(DECISION_IDS.length, 11);
  for (const decisionId of DECISION_IDS) {
    for (const optionId of OPTION_IDS) {
      const phrase = table[decisionId][optionId];
      assert.equal(typeof phrase, "string", `${decisionId}/${optionId} has no receipt phrase`);
      assert.ok(phrase.trim().length > 0, `${decisionId}/${optionId} is blank; the table may not be holed`);
      phrases.push({ id: `${decisionId}/${optionId}`, text: phrase });
    }
  }
  assert.equal(phrases.length, 33);

  for (const { id, text } of phrases) {
    const lowered = text.toLowerCase();

    for (const word of JUDGMENT_VOCABULARY) {
      const pattern = new RegExp(`\\b${word.replace(/ /g, "\\s+")}\\b`);
      assert.ok(
        !pattern.test(lowered),
        `${id} contains the judgment word "${word}" — a receipt hands back an action, not a verdict: ${text}`
      );
    }

    for (const pattern of INFERRED_INTENTION_PATTERNS) {
      assert.ok(
        !pattern.test(text),
        `${id} infers intention or explains the learner (${pattern}): ${text}`
      );
    }

    // The structure the invariant names: a second-person observable action,
    // one sentence, ending. Not decoration — a phrase that does not begin with
    // the learner's own action has stopped being a receipt of one.
    assert.ok(text.startsWith("You "), `${id} does not state the learner's own observable action: ${text}`);
    assert.ok(text.endsWith("."), `${id} is not a complete sentence: ${text}`);
  }

  // NO RECEIPT-STRENGTH FIELD. "receipt strength" is on the forbidden list, so
  // the table is a bare string per option and there is nowhere to put a weight.
  // Checked as a shape, because a `{ phrase, strength }` object would satisfy
  // every check above and quietly reintroduce ordering into the content layer.
  for (const decisionId of DECISION_IDS) {
    for (const optionId of OPTION_IDS) {
      const cell: unknown = table[decisionId][optionId];
      assert.equal(
        typeof cell,
        "string",
        `${decisionId}/${optionId} is not a bare string; a receipt carries no strength, weight, rank or salience`
      );
    }
  }

  // The rule is machine-readable, and this test quotes it rather than a
  // retyping of it.
  assert.equal(receiptsModule.RECEIPT_INVARIANT, "Situation -> observable choice/action. Nothing else.");
  for (const forbidden of [
    "inferred intention",
    "praise",
    "judgment label",
    "doctrine",
    "because-explanation",
    "receipt strength"
  ]) {
    assert.ok(
      receiptsModule.RECEIPT_FORBIDDEN.includes(forbidden),
      `RECEIPT_FORBIDDEN dropped "${forbidden}" from Ben's approved list`
    );
  }
});

/* -------------------------------------------------------------------------- */
/* 5. Public copy guards                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Each of these is a SHIPPED CLAIM, not a style preference. A number on a
 * public page is a promise about the product, and every one below was either
 * struck by a ruling or superseded by an approved sentence. They are grouped in
 * one test because they share one failure mode: a superseded string coming back
 * because someone copied a recovered source without reading the supersession.
 */
test("no struck or superseded public claim is reachable from content/developer-forward", () => {
  const forbiddenSubstrings: readonly { text: string; why: string }[] = [
    {
      text: "729 possible profiles",
      why: "ruling Q-C struck it from the closing upsell; the profile count is not a public number"
    },
    {
      text: "39 real",
      why: "superseded by the Full bridge, which says '40+ real cases'"
    },
    /*
     * THESE TWO BANS SURVIVED A SUPERSESSION THAT KILLED THEIR ORIGINAL REASON,
     * and they are kept on a narrower one. Layer 07 ruled 42 internal-only;
     * Ben overturned that on 2026-09-08 by writing "42 canonical case families"
     * into `DEVELOPER_FORWARD_TEASER` himself, and that string is asserted below.
     * So the number is now sayable — in the ONE form he wrote. What stays
     * banned is 42 attached to the word `bridge` uses: "42 cases" / "42 real"
     * would make the public floor "40+ real cases" read as a coy understatement
     * of a number the same page states outright, which is the only way these
     * two sentences can embarrass each other.
     */
    {
      text: "42 cases",
      why: "the public count is '42 canonical case families'; the bridge's unit stays '40+ real cases'"
    },
    {
      text: "42 real",
      why: "same — 42 may not borrow the bridge's wording"
    },
    {
      text: "New Game Plus",
      why: "an internal metaphor; it is not the product's language for a second run"
    }
  ];

  for (const found of contentStrings) {
    for (const forbidden of forbiddenSubstrings) {
      assert.ok(
        !found.text.includes(forbidden.text),
        `${found.module} ${found.at} ships "${forbidden.text}" — ${forbidden.why}: ${found.text}`
      );
    }
  }

  // The identity predicate. "You are SHIP-0111." asserts that the learner IS a
  // code; "Your observed developer pattern:" reports what the run observed.
  // The difference is the product's whole claim about itself, so the banned
  // form is a PATTERN (every one of the sixteen codes) and the permitted form
  // is asserted to still exist rather than merely assumed.
  for (const found of contentStrings) {
    assert.ok(
      !/You are SHIP-/.test(found.text),
      `${found.module} ${found.at} renders an identity predicate: ${found.text}`
    );
  }
  assert.equal(copyModule.RESULT.label, "Your observed developer pattern");

  // The bridge itself, so the guards above cannot pass by deletion. The number
  // is asserted exactly: "40+" (Ben, 2026-09-08) replaced layer 07's approved
  // "30+", and a bans-only test would have gone on passing if the sentence had
  // silently drifted back — every forbidden string above is a number that is
  // NOT there, so nothing else in this test looks at the number that is.
  assert.ok(
    copyModule.FULL_OFFER.bridge.includes("40+ real cases"),
    "the Full bridge sentence is gone or no longer says 40+; the guards above would then pass vacuously"
  );

  // The other public statement of the same corpus (Ben, 2026-09-08). Pinned by
  // name for the reason copy.ts's header gives: 40+ and 42 describe one corpus
  // from two sides, so a change to it has to break BOTH assertions, not one.
  assert.ok(
    copyModule.DEVELOPER_FORWARD_TEASER.full.body.includes("42 canonical case families"),
    "the teaser no longer states the corpus count; it and FULL_OFFER.bridge must move together"
  );

  // "729" survives ONLY as the artifact filename and reason in the digest
  // registry, which identifies a source outside this repo and renders nowhere.
  // Asserted explicitly so the guard cannot be widened into a ban that would
  // force the provenance anchor to be deleted.
  const sevenTwentyNine = contentStrings.filter((found) => found.text.includes("729"));
  for (const found of sevenTwentyNine) {
    assert.ok(
      /digest|SOURCE_DIGESTS|provenance/i.test(found.at),
      `${found.module} ${found.at} mentions 729 outside the digest registry: ${found.text}`
    );
  }
});

/* -------------------------------------------------------------------------- */
/* 6. The five TODO_ surfaces and the three-way partition                     */
/* -------------------------------------------------------------------------- */

/**
 * A `TODO_` constant is a REFUSAL TO INVENT, and `null` is what makes it one.
 *
 * Layer 09 (2026-09-07) closed all five: three by authoring the copy, two by
 * ruling that the surface should not exist. Neither answer turns a `TODO_`
 * constant back into a place a sentence may live.
 *
 *  - A RESOLVED one is a TOMBSTONE. Someone searching for
 *    `TODO_LANDING_FAQ_ANSWERS` should find the name and be pointed at
 *    `LANDING_FAQ`, not find nothing and re-open a settled question.
 *  - A RULED one is a DECISION RECORD, and the more durable of the two:
 *    delete `TODO_CASE_4_OPENING_CALLBACK_UNAUTHORED` and the next person to
 *    notice that Case 4 opens without a callback when 2, 3 and 5 have one will
 *    reasonably "fix" it, against the ruling's own words — "Do not add an
 *    opening callback for symmetry."
 *
 * Both must stay `null`, and for one reason that is unchanged by the rulings:
 * a string in a content module is something a component can render. A tombstone
 * holding "resolved — see LANDING_FAQ" is a developer note one `??` away from a
 * learner's screen, reachable by ordinary code that does nothing wrong.
 *
 * WHY THE REGISTRY IS THREE LISTS AND WHY THIS TEST CHECKS THE PARTITION.
 * "Authored" and "ruled absent" are different facts with different futures —
 * one may be revised by an editor, the other only by a superseding ruling — so
 * collapsing them into one list would lose the distinction that decides who is
 * allowed to change what. Three lists buy that at the cost of a new failure
 * mode: a constant in two lists, or a constant in none, is a governance record
 * that disagrees with itself, and nothing about reading the file makes that
 * visible. So the partition is asserted, in both directions: every declared
 * entry names a constant that exists, and every constant that exists is
 * declared exactly once.
 */

/** One parsed registry entry. `destination` is set only for a resolved one. */
interface SurfaceEntry {
  list: string;
  entry: string;
  /** The module basename the entry names, e.g. `copy.ts`. */
  moduleFile: string;
  /** The `TODO_` export the entry names. */
  constant: string;
  /** For a resolved entry, the right-hand side: `copy.ts LANDING_FAQ`. */
  destination: string | null;
}

const SURFACE_LISTS: Readonly<Record<string, readonly string[]>> = {
  DEVELOPER_FORWARD_RESOLVED_SURFACES: indexModule.DEVELOPER_FORWARD_RESOLVED_SURFACES,
  DEVELOPER_FORWARD_ABSENT_BY_DESIGN: indexModule.DEVELOPER_FORWARD_ABSENT_BY_DESIGN,
  DEVELOPER_FORWARD_UNSOURCED_SURFACES: indexModule.DEVELOPER_FORWARD_UNSOURCED_SURFACES
};

/** `"copy.ts: TODO_X"` or `"copy.ts: TODO_X -> copy.ts Y"`, or the test fails. */
function parseSurfaceEntry(list: string, entry: string): SurfaceEntry {
  const arrow = entry.indexOf(" -> ");
  const left = arrow === -1 ? entry : entry.slice(0, arrow);
  const destination = arrow === -1 ? null : entry.slice(arrow + 4).trim();
  const match = /^([A-Za-z0-9_./-]+\.ts): (TODO_[A-Za-z0-9_]+)$/.exec(left.trim());
  if (match === null) {
    assert.fail(
      `${list} entry ${JSON.stringify(entry)} is not readable. An entry must be ` +
        '"<module>.ts: TODO_NAME", optionally followed by " -> <module>.ts EXPORT". ' +
        "A registry nobody can parse is a registry nothing can check."
    );
  }
  return { list, entry, moduleFile: match[1], constant: match[2], destination };
}

/** The namespace the entry's module basename resolves to, or the test fails. */
function namespaceForModuleFile(context: string, moduleFile: string): Record<string, unknown> {
  const modulePath = `content/developer-forward/${moduleFile}`;
  const namespace = MODULE_NAMESPACES[modulePath];
  if (namespace === undefined) {
    assert.fail(`${context} names ${modulePath}, which is not a content module of this build.`);
  }
  return namespace;
}

/** Every `TODO_`-prefixed export across `content/developer-forward/`, as `file.ts: NAME`. */
function actualTodoExports(): string[] {
  const found: string[] = [];
  for (const [modulePath, namespace] of Object.entries(MODULE_NAMESPACES)) {
    const moduleFile = modulePath.slice("content/developer-forward/".length);
    for (const key of Object.keys(namespace)) {
      if (key.startsWith("TODO_")) found.push(`${moduleFile}: ${key}`);
    }
  }
  return found.sort();
}

/**
 * The five, named. Written out rather than derived from the registry, because a
 * check that reads its expectations from the thing it is checking would pass on
 * an empty registry.
 */
const TODO_SURFACES: readonly { name: string; value: unknown }[] = [
  { name: "cases.ts: TODO_C5_AI_EXPLANATION_BODY_UNSOURCED", value: casesModule.TODO_C5_AI_EXPLANATION_BODY_UNSOURCED },
  { name: "copy.ts: TODO_LANDING_FAQ_ANSWERS", value: copyModule.TODO_LANDING_FAQ_ANSWERS },
  { name: "copy.ts: TODO_RESULT_PROFESSIONAL_SUMMARY", value: copyModule.TODO_RESULT_PROFESSIONAL_SUMMARY },
  { name: "surfaces.ts: TODO_CASE_4_OPENING_CALLBACK_UNAUTHORED", value: surfacesModule.TODO_CASE_4_OPENING_CALLBACK_UNAUTHORED },
  /*
   * The fifth, found during the UI build rather than the content pass: the SHIP
   * bars are two-ended and no approved source says what the two ends MEAN.
   * `ROUTING_AND_SCORING.md` gives a reading per BIT, but captioning a
   * continuous lean with a threshold's reading would tell a learner at 50.4%
   * something their answers do not support. Layer 09 ruled it absent by design
   * for exactly that reason: captions "would imply unsupported precision."
   */
  { name: "copy.ts: TODO_SHIP_AXIS_END_LABELS", value: copyModule.TODO_SHIP_AXIS_END_LABELS }
];

test("all five TODO_ constants are still exported and still null", () => {
  for (const surface of TODO_SURFACES) {
    const [moduleFile, constant] = surface.name.split(": ");
    const namespace = namespaceForModuleFile("TODO_SURFACES", moduleFile);

    // Exported, not merely absent-and-therefore-undefined. Deleting the export
    // would otherwise read as `undefined`, which is not `null` — but a reader
    // skimming a green suite would never learn the tombstone had been removed.
    assert.ok(
      Object.prototype.hasOwnProperty.call(namespace, constant),
      `${surface.name} is no longer exported. A resolved surface keeps its tombstone so the old name stays findable, and a ruled one keeps its decision record so the ruling stays discoverable at the place someone would undo it.`
    );

    assert.equal(
      surface.value,
      null,
      `${surface.name} holds a value. It must be null: a string here is a sentence a renderer can print. A resolved surface's copy lives in its own export, and a ruled one has no copy by design — neither is a reason to fill this in. Put the explanation in the doc-comment above the constant.`
    );
  }
});

test("the three surface lists partition every TODO_ constant exactly once", () => {
  const parsed: SurfaceEntry[] = [];
  for (const [list, entries] of Object.entries(SURFACE_LISTS)) {
    for (const entry of entries) parsed.push(parseSurfaceEntry(list, entry));
  }

  // (a) No constant declared twice — the failure that makes two lists disagree.
  const seen = new Map<string, SurfaceEntry>();
  for (const entry of parsed) {
    const key = `${entry.moduleFile}: ${entry.constant}`;
    const first = seen.get(key);
    assert.equal(
      first,
      undefined,
      `${key} is declared in both ${first?.list} and ${entry.list}. "Authored" and "ruled absent" are different facts with different futures; a constant that claims both leaves no answer to who may change it.`
    );
    seen.set(key, entry);
  }

  // (b) No entry names a constant that does not exist, and every one is null.
  for (const entry of parsed) {
    const namespace = namespaceForModuleFile(entry.list, entry.moduleFile);
    assert.ok(
      Object.prototype.hasOwnProperty.call(namespace, entry.constant),
      `${entry.list} declares ${entry.entry}, but ${entry.moduleFile} exports no ${entry.constant}. A registry pointing at a deleted constant is a record of a decision nobody can find.`
    );
    assert.equal(
      namespace[entry.constant],
      null,
      `${entry.entry} is declared in ${entry.list} but ${entry.constant} is not null.`
    );
  }

  // (c) A resolved entry must point somewhere real. A tombstone whose arrow
  //     names a missing export sends the reader nowhere, which is worse than
  //     the bare name it replaced.
  for (const entry of parsed.filter((candidate) => candidate.destination !== null)) {
    assert.equal(
      entry.list,
      "DEVELOPER_FORWARD_RESOLVED_SURFACES",
      `${entry.entry} carries a "->" destination but sits in ${entry.list}. Only a resolved surface has somewhere to point.`
    );
    const destination = /^([A-Za-z0-9_./-]+\.ts) ([A-Za-z0-9_]+)$/.exec(entry.destination ?? "");
    if (destination === null) {
      assert.fail(`${entry.entry}: the destination must read "<module>.ts EXPORT".`);
    }
    const namespace = namespaceForModuleFile(entry.entry, destination[1]);
    assert.ok(
      Object.prototype.hasOwnProperty.call(namespace, destination[2]),
      `${entry.entry} points at ${destination[1]} ${destination[2]}, which does not exist.`
    );
    assert.notEqual(
      namespace[destination[2]],
      null,
      `${entry.entry} points at ${destination[2]}, which is itself null. A surface is not resolved by moving the hole.`
    );
  }

  // (d) The partition, both directions at once: the declared set and the set of
  //     `TODO_` exports that actually exist must be the same set. This is what
  //     catches a SIXTH gap added to `copy.ts` tomorrow and declared in none of
  //     the three lists — an undeclared gap is a gap nobody is tracking.
  assert.deepEqual(
    [...seen.keys()].sort(),
    actualTodoExports(),
    "The three surface lists and the TODO_ exports in content/developer-forward/ disagree. Every TODO_ constant must be declared in exactly one of DEVELOPER_FORWARD_RESOLVED_SURFACES, DEVELOPER_FORWARD_ABSENT_BY_DESIGN or DEVELOPER_FORWARD_UNSOURCED_SURFACES, and every declared entry must name a constant that exists."
  );

  // (e) And the five are the five. Pinned separately so that deleting a
  //     constant AND its registry entry — which keeps (d) perfectly balanced —
  //     still fails.
  assert.deepEqual(
    actualTodoExports(),
    TODO_SURFACES.map((surface) => surface.name).sort(),
    "The TODO_ constants in content/developer-forward/ are no longer the five layer 09 closed. Adding one is allowed, but it must be added to TODO_SURFACES above with the reason it exists; removing one is not."
  );
});

/**
 * Empty, and asserted to be empty.
 *
 * The list is kept exported rather than deleted because it is the list the next
 * gap gets added to. Asserting it is empty is what makes that addition
 * DELIBERATE: without this, a future gap could appear in the registry and the
 * suite would stay green, which is the shape of every governance record that
 * quietly stopped being true.
 */
test("no surface is unsourced, so a future gap has to be declared on purpose", () => {
  assert.deepEqual(
    [...indexModule.DEVELOPER_FORWARD_UNSOURCED_SURFACES],
    [],
    "DEVELOPER_FORWARD_UNSOURCED_SURFACES is no longer empty. If a surface genuinely has no wording and no ruling, that is a real finding and this assertion is the place to record it — update this test with the reason, do not delete it."
  );
});

/* -------------------------------------------------------------------------- */
/* 7. Layer 09 against the approved artifacts, byte for byte                  */
/* -------------------------------------------------------------------------- */

/**
 * WHY COMPARE AGAINST FILES OUTSIDE THIS REPOSITORY AT ALL.
 *
 * Everything in §5 checks that the shipped copy is not something forbidden.
 * Nothing there checks that it is what Ben approved. Those are different
 * questions, and the second one cannot be answered from inside `content/`: a
 * transcription error, a "tidied" comma, a smart quote from a paste — each
 * leaves the module self-consistent and every other test green. The only
 * witness is the approved artifact itself.
 *
 * THE ARTIFACTS ARE NOT VENDORED, AND THIS FAILS RATHER THAN SKIPS. Same rule
 * as `tests/developer-forward-scoring.test.ts`: a skip would leave green checks
 * standing over nothing verified. Point `DEVELOPER_FORWARD_LAYER09_DIR` at the
 * bundle if it lives somewhere else on this machine.
 *
 * THE DIGESTS ARE CHECKED FIRST. The bundle ships its own inventory manifest,
 * and two `BEN_APPROVED` files in an earlier handoff were EDITED IN PLACE
 * rather than superseded — so a filename alone cannot identify a ruling. If the
 * file on disk is not the file the manifest published, "matches the approved
 * artifact" is a sentence about the wrong artifact.
 */
const LAYER09_DIR =
  process.env.DEVELOPER_FORWARD_LAYER09_DIR ??
  path.resolve(repoRoot, "..", "bct-facelift", "09_final-copy-completion-2026-09-07");

const LAYER09_INVENTORY = "LAYER09_INVENTORY_SHA256.json";

/** Reads an approved artifact, or fails naming the file and the override. */
function readApproved(file: string): string {
  const full = path.join(LAYER09_DIR, file);
  if (!existsSync(full)) {
    assert.fail(
      `Approved layer 09 artifact missing: ${full}\n` +
        "The 2026-09-07 handoff is not vendored into this repo. Point " +
        "DEVELOPER_FORWARD_LAYER09_DIR at 09_final-copy-completion-2026-09-07."
    );
  }
  return readFileSync(full, "utf8");
}

function readApprovedJson<T>(file: string): T {
  return JSON.parse(readApproved(file)) as T;
}

interface Layer09Inventory {
  file_count_excluding_inventory: number;
  files: readonly { file: string; bytes: number; sha256: string }[];
}

interface ApprovedFaq {
  items: readonly { question: string; answer: string }[];
}

interface ApprovedSummaryTemplate {
  surface_title: string;
  generation_mode: string;
  dimensions_in_order: readonly string[];
  clauses: Readonly<Record<string, Readonly<Record<string, string>>>>;
  fixed_closing_sentence: string;
  do_not_use: readonly string[];
}

test("every layer 09 artifact on disk is the one its own manifest published", () => {
  const inventory = readApprovedJson<Layer09Inventory>(LAYER09_INVENTORY);

  assert.equal(
    inventory.files.length,
    inventory.file_count_excluding_inventory,
    "The layer 09 manifest disagrees with itself about how many files it covers."
  );

  for (const entry of inventory.files) {
    const raw = Buffer.from(readApproved(entry.file), "utf8");
    assert.equal(
      raw.byteLength,
      entry.bytes,
      `${entry.file} is ${raw.byteLength} bytes; the manifest published ${entry.bytes}.`
    );
    assert.equal(
      createHash("sha256").update(raw).digest("hex"),
      entry.sha256,
      `${entry.file} does not match the SHA-256 its manifest published. An approved artifact is superseded, never edited in place — so this is either a different ruling wearing the same filename, or a corrupted copy. Either way the comparisons below would be checking the shipped copy against the wrong source.`
    );
  }
});

/**
 * All six questions AND all six answers, in the approved order.
 *
 * The order is asserted because these are SEO answer-first content for six
 * distinct intent clusters — layer 07's rule — and a reordering would silently
 * re-pair a question with a neighbouring answer, producing six entries that
 * each look fine and are each wrong.
 */
test("LANDING_FAQ is the approved six questions and answers, in order", () => {
  const approved = readApprovedJson<ApprovedFaq>("landing-faq-answers.BEN_APPROVED.json");

  assert.equal(approved.items.length, 6, "The approved FAQ artifact no longer holds six items.");
  assert.equal(
    copyModule.LANDING_FAQ.length,
    approved.items.length,
    "LANDING_FAQ and the approved artifact hold different numbers of entries."
  );

  approved.items.forEach((item, index) => {
    const shipped = copyModule.LANDING_FAQ[index];
    assert.equal(
      shipped.question,
      item.question,
      `LANDING_FAQ[${index}].question does not match the approved artifact.`
    );
    assert.equal(
      shipped.answer,
      item.answer,
      `LANDING_FAQ[${index}].answer does not match the approved artifact byte for byte.`
    );
  });
});

/**
 * THE THREE RENAMES ARE THE WHOLE POINT OF THIS TEST.
 *
 * The approved template names three postures differently from the canonical
 * six-dimension vocabulary: `bound` for `investigate`, `target` for `sample`,
 * `verify` for `prove`. The orderings agree (low, middle, high) and the
 * meanings agree, so `copy.ts` is written in CANONICAL terms and the mapping is
 * POSITIONAL — index i of the template's keys for a dimension is the canonical
 * posture at index i.
 *
 * A key-name comparison would report three of eighteen clauses missing. Worse,
 * a key LOOKUP in the renderer — the mistake this mapping invites — would
 * return `undefined` for those three and drop them from the paragraph with no
 * error at all: a learner whose verification posture is `prove` would get a
 * five-sentence summary and no way to know a sentence was missing.
 * `lib/developer-forward/summary.ts` throws rather than returning "" for that
 * reason, and this test is the check that keeps the translation honest by
 * naming the three renames out loud, so a fourth cannot appear silently.
 */
const APPROVED_POSTURE_RENAMES: readonly {
  dimension: Dimension;
  templateKey: string;
  canonicalKey: string;
}[] = [
  { dimension: "ambiguity", templateKey: "bound", canonicalKey: "investigate" },
  { dimension: "verification", templateKey: "target", canonicalKey: "sample" },
  { dimension: "verification", templateKey: "verify", canonicalKey: "prove" }
];

test("PROFESSIONAL_SUMMARY_CLAUSES is the approved 18 clauses, mapped by position", () => {
  const approved = readApprovedJson<ApprovedSummaryTemplate>(
    "professional-summary-template.BEN_APPROVED.json"
  );
  const shipped = copyModule.PROFESSIONAL_SUMMARY_CLAUSES as unknown as Readonly<
    Record<string, Readonly<Record<string, string>>>
  >;

  // The dimension order is the ruling's, and it is the order the composer emits.
  assert.deepEqual([...approved.dimensions_in_order], [...DIMENSIONS]);
  assert.deepEqual(Object.keys(shipped), [...DIMENSIONS]);

  // Not generated. Asserted because the surface's whole defence is that every
  // sentence in it was approved before a learner ever saw it.
  assert.equal(approved.generation_mode, "deterministic_template_not_AI_generated");

  const renamed = new Set<string>();
  let clauseCount = 0;

  for (const dimension of DIMENSIONS) {
    const approvedKeys = Object.keys(approved.clauses[dimension]);
    const canonicalKeys = POSTURES[dimension];

    assert.equal(
      approvedKeys.length,
      canonicalKeys.length,
      `The approved template gives ${approvedKeys.length} clauses for ${dimension}; the vocabulary has ${canonicalKeys.length} postures.`
    );

    approvedKeys.forEach((approvedKey, index) => {
      const canonicalKey = canonicalKeys[index];
      const expected = approved.clauses[dimension][approvedKey];

      assert.equal(
        shipped[dimension][canonicalKey],
        expected,
        `PROFESSIONAL_SUMMARY_CLAUSES.${dimension}.${canonicalKey} does not match the approved template's ${dimension}.${approvedKey} (position ${index}) byte for byte.`
      );
      clauseCount += 1;

      if (approvedKey !== canonicalKey) {
        renamed.add(`${dimension}.${approvedKey}->${canonicalKey}`);

        // The template's own key must NOT survive in `copy.ts`, or a renderer
        // could look it up and appear to work for one posture in three.
        assert.ok(
          !Object.prototype.hasOwnProperty.call(shipped[dimension], approvedKey),
          `PROFESSIONAL_SUMMARY_CLAUSES.${dimension} carries the approved template's key "${approvedKey}" as well as the canonical "${canonicalKey}". One posture, two keys, is how a lookup starts silently returning the wrong clause.`
        );
      }
    });
  }

  assert.equal(clauseCount, 18, "The approved template no longer holds 18 clauses.");

  // Exactly three renames, named. A fourth would mean the vocabularies have
  // drifted somewhere nobody declared, and positional mapping would still pass.
  assert.deepEqual(
    [...renamed].sort(),
    APPROVED_POSTURE_RENAMES.map(
      (rename) => `${rename.dimension}.${rename.templateKey}->${rename.canonicalKey}`
    ).sort(),
    "The set of posture renames between the approved template and the canonical vocabulary has changed. The three known ones are bound->investigate, target->sample and verify->prove; a new one must be added here deliberately, with the reason."
  );

  // Each rename asserted by name as well as by set, so a failure says which.
  for (const rename of APPROVED_POSTURE_RENAMES) {
    const canonicalIndex = POSTURES[rename.dimension].indexOf(rename.canonicalKey as never);
    const templateIndex = Object.keys(approved.clauses[rename.dimension]).indexOf(rename.templateKey);
    assert.notEqual(
      canonicalIndex,
      -1,
      `"${rename.canonicalKey}" is no longer a posture of ${rename.dimension}.`
    );
    assert.equal(
      templateIndex,
      canonicalIndex,
      `The approved template's ${rename.dimension}.${rename.templateKey} sits at position ${templateIndex}, but the canonical "${rename.canonicalKey}" sits at ${canonicalIndex}. The positional mapping only holds while the two orderings agree; if they no longer do, three clauses are now wrong rather than missing, and nothing else in this suite would notice.`
    );
    assert.equal(
      approved.clauses[rename.dimension][rename.templateKey],
      shipped[rename.dimension][rename.canonicalKey],
      `${rename.dimension}.${rename.templateKey} (approved) and ${rename.dimension}.${rename.canonicalKey} (shipped) are not the same sentence.`
    );
  }

  // All 18 distinct: if two clauses were the same string, the positional map
  // could be wrong in a way the comparisons above happened to tolerate.
  const distinct = new Set(DIMENSIONS.flatMap((dimension) => Object.values(shipped[dimension])));
  assert.equal(distinct.size, 18, "Two professional-summary clauses are the same sentence.");

  assert.equal(
    copyModule.PROFESSIONAL_SUMMARY_CLOSING,
    approved.fixed_closing_sentence,
    "PROFESSIONAL_SUMMARY_CLOSING does not match the approved fixed closing sentence."
  );
  assert.equal(
    copyModule.PROFESSIONAL_SUMMARY_TITLE,
    approved.surface_title,
    "PROFESSIONAL_SUMMARY_TITLE does not match the approved surface title."
  );
});

/**
 * One body for all 27 Case 5 variants, and the Export-first offer.
 *
 * The Case 5 ruling's second sentence is the load-bearing one: "Do not add
 * framework, library, file, or variant-specific implementation details." A
 * report that named real files would be a report a learner could check. This
 * one cannot be checked, which is the entire point of the case — so a
 * well-meaning edit that made it more specific would destroy the case while
 * looking like an improvement.
 */
test("C5_AI_EXPLANATION_BODY and EXPORT_FIRST match their approved rulings", () => {
  const case5 = readApprovedJson<{ body: string; scope: string }>(
    "case5-ai-explanation-body.BEN_APPROVED.json"
  );
  assert.equal(case5.scope, "all_case5_variants");
  assert.equal(
    copyModule.C5_AI_EXPLANATION_BODY,
    case5.body,
    "C5_AI_EXPLANATION_BODY does not match the approved body byte for byte."
  );

  /*
   * EXPORT_FIRST is ruled in CONFIRMATIONS.md §6.3 rather than in a JSON, and
   * both strings are given there in bold. Parsed rather than retyped, for the
   * same reason as everything else in this section: a retyped string is a
   * string that agrees with itself.
   */
  const confirmations = readApproved("CONFIRMATIONS.md");
  const primary = /^Primary action: \*\*(.+?)\*\*\s*$/m.exec(confirmations);
  const explanation = /^Supporting explanation: \*\*(.+?)\*\*\s*$/m.exec(confirmations);
  if (primary === null || explanation === null) {
    assert.fail(
      "CONFIRMATIONS.md no longer states the Export-first primary action and supporting explanation in the expected form."
    );
  }

  assert.equal(copyModule.EXPORT_FIRST.primaryAction, primary[1]);
  assert.equal(copyModule.EXPORT_FIRST.explanation, explanation[1]);

  // JSON, not Markdown. The ruling is explicit that Markdown "does not
  // substitute for the JSON backup", and the reset is what destroys the ledger.
  assert.ok(
    copyModule.EXPORT_FIRST.primaryAction.includes("JSON"),
    "The Export-first primary action no longer names JSON, which is the only artifact carrying the whole ledger."
  );
});

/**
 * THE FORBIDDEN INPUTS, ASSERTED STRUCTURALLY.
 *
 * The ruling's `do_not_use` list names five things the summary may not read,
 * and the first two are the ones an implementer would actually reach for: the
 * SHIP code, because it is already computed and sitting right there, and the
 * learner's reflections, because they are the most personal thing in the
 * ledger. Both would be catastrophic in the same quiet way — the summary is the
 * one artifact a learner might paste into a proposal.
 *
 * A grep for "SHIP" in `summary.ts` proves nothing: its header DISCUSSES the
 * ban at length, and a grep would force that explanation to be deleted. So this
 * checks the two facts that are actually structural:
 *
 *  1. WHAT THE MODULE CAN REACH. `summary.ts` may import the clause table and
 *     the type contract, and nothing else. It cannot read a SHIP code it has no
 *     way to obtain, and `scoring.ts` is not on the list.
 *  2. WHAT THE OUTPUT DEPENDS ON. Two states that share a SHIP code but differ
 *     in one dimension must produce DIFFERENT summaries — and, exhaustively,
 *     all 729 terminal states must produce 729 distinct summaries while
 *     collapsing to only 16 codes. A composer keyed off the code could not do
 *     that; one keyed off the six postures cannot do otherwise.
 *
 * Reflections need no third check: they never enter the function, because a
 * `DimensionState` is six numbers and there is nowhere to put one.
 */
test("the summary composer reads the six dimensions and nothing else", () => {
  const source = readFileSync(path.join(repoRoot, "lib", "developer-forward", "summary.ts"), "utf8");
  const imports = [...source.matchAll(/^import\s[\s\S]*?\bfrom\s+"([^"]+)";/gm)].map(
    (match) => match[1]
  );
  assert.deepEqual(
    [...imports].sort(),
    ["@/content/developer-forward/copy", "@/lib/developer-forward/types"],
    "lib/developer-forward/summary.ts imports something new. It may reach the approved clause table and the type contract, and nothing else: the ruling forbids it from reading the SHIP code, learner reflections, the recovered market_copy and strongest_upsell columns, or profile_headline, and an import it cannot make is a dependency it cannot acquire by accident."
  );

  /*
   * Both SHIP-0000. They differ only on `verification` — deliberately, because
   * verification is one of the dimensions the approved template renames
   * (`target`, `verify`), so this pair also exercises the positional mapping.
   */
  const sampling: DimensionState = {
    ambiguity: 0.5,
    verification: 0,
    promise: 0.5,
    risk: 0.5,
    ownership: 0.5,
    trust: 0.5
  };
  const checking: DimensionState = { ...sampling, verification: 0.5 };

  assert.equal(
    calculateShip(sampling).code,
    calculateShip(checking).code,
    "The two fixture states no longer share a SHIP code, so this test would prove nothing. Pick another pair from the same code group."
  );
  assert.notDeepEqual(
    sampling,
    checking,
    "The two fixture states are identical, so of course their summaries match."
  );

  assert.notEqual(
    professionalSummary(sampling),
    professionalSummary(checking),
    "Two states with the same SHIP code and different verification postures produced the same professional summary. The summary must read the six continuous postures, not the four thresholded bits — the ruling lists the SHIP code first among the inputs it may not use."
  );

  // Sharper: exactly one clause moved, and it is verification's.
  const sampled = professionalSummaryClauses(sampling);
  const checked = professionalSummaryClauses(checking);
  DIMENSIONS.forEach((dimension, index) => {
    if (dimension === "verification") {
      assert.notEqual(sampled[index], checked[index]);
    } else {
      assert.equal(sampled[index], checked[index], `The ${dimension} clause changed when only verification did.`);
    }
  });

  // Exhaustive: 729 states, 729 summaries, 16 codes.
  const states: DimensionState[] = DIMENSIONS.reduce<DimensionState[]>(
    (accumulated, dimension) =>
      accumulated.flatMap((state) =>
        TERNARY_STATES.map((value) => ({ ...state, [dimension]: value }) as DimensionState)
      ),
    [{} as DimensionState]
  );
  assert.equal(states.length, 729);

  const summaries = new Set(states.map((state) => professionalSummary(state)));
  const codes = new Set(states.map((state) => calculateShip(state).code));
  assert.equal(
    summaries.size,
    729,
    "Two distinct terminal states produce the same professional summary. The summary is meant to be a readout of all six postures; if it is not injective, some dimension is not reaching the paragraph."
  );
  assert.equal(codes.size, 16, "The 729 states no longer collapse to 16 SHIP codes.");
  assert.ok(
    summaries.size > codes.size,
    "There are no more summaries than SHIP codes, which is only possible if the summary is a function of the code."
  );

  // Determinism, which is what makes "no reflections" observable rather than
  // merely undeclared: the same six numbers always give the same paragraph.
  assert.equal(professionalSummary(sampling), professionalSummary({ ...sampling }));
});

/* -------------------------------------------------------------------------- */
/* 8. The stamp                                                               */
/* -------------------------------------------------------------------------- */

/**
 * A stamp that names a reducer it does not implement is worse than no stamp:
 * it makes a false pin look like a checked one. The id is stamped rather than
 * described so that a change to `aggregation.ts` is a RESTAMP and not a silent
 * behaviour swap, and this is the assertion that makes that true.
 */
test("the stamp pins the aggregation policy this build actually implements", () => {
  assert.equal(stampModule.AGGREGATION_POLICY_ID, AGGREGATION_POLICY_ID);
  assert.equal(stampModule.STAMP.aggregationPolicyId, AGGREGATION_POLICY_ID);
});

/**
 * 1.1.0, NOT 1.0.0 — and the reason is behavioural, not clerical.
 *
 * `VERSIONING.md` lists dimension contributions as a restamp trigger, and the
 * aggregation contract itself changed: v1.0.0 shipped no aggregation rule at
 * all, which is why it could not score. Reusing 1.0.0 would mean two different
 * scoring systems sharing one version number, and a learner pinned to a stamp
 * could not tell which one produced their result.
 */
test("the production stamp is 1.1.0 because the aggregation contract changed", () => {
  assert.equal(stampModule.VERSION_MANIFEST.appVersion, "1.1.0");
  assert.notEqual(stampModule.VERSION_MANIFEST.appVersion, "1.0.0");

  // The field that did not exist in 1.0.0 at all. Its presence is the change.
  assert.equal(stampModule.VERSION_MANIFEST.aggregationPolicyVersion, "1.1.0");

  // 1.0.0 stays nameable: immutable historical provenance, never deleted.
  assert.ok(stampModule.HISTORICAL_VERSIONS.includes("1.0.0"));

  // The three fields the restamp deliberately did NOT bump. A blanket bump
  // would claim the SHIP model changed when it did not.
  assert.equal(stampModule.VERSION_MANIFEST.sixDimensionModelVersion, "1.0.0");
  assert.equal(stampModule.VERSION_MANIFEST.shipFormulaVersion, "1.0.0");
  assert.equal(stampModule.VERSION_MANIFEST.shipAxisDefinitionVersion, "1.0.0");
});

/* -------------------------------------------------------------------------- */
/* The two BY-DESIGN rulings, guarded at the surface each one governs          */
/* -------------------------------------------------------------------------- */

/**
 * A DECISION RECORD THAT NOTHING ENFORCES IS A COMMENT.
 *
 * Layer 09 ruled two surfaces absent by design: Case 4 has no opening callback,
 * and the SHIP bars carry no endpoint captions. Both constants are `null` and
 * both carry their reasoning — and an adversarial review found that neither
 * ruling was actually guarded anywhere. Two edits would have restored the
 * surfaces with the whole suite still green:
 *
 *   1. adding a `caseNumber: 4` record to `openingCallbacks` — the TODO stays
 *      `null`, the registry entry stays valid, and the renderer starts drawing
 *      a Case 4 opening callback;
 *   2. passing `axisEndLabels` from the composition root — captions render on
 *      all four bars while `TODO_SHIP_AXIS_END_LABELS` is still `null`.
 *
 * Both are exactly the "fix" a well-meaning reader reaches for, because the
 * asymmetry looks like an oversight. That is what these two tests exist to stop.
 */

test("Case 4 has no opening callback, and nothing may add one for symmetry", () => {
  const caseNumbers = surfacesModule.openingCallbacks.map((callback) => callback.caseNumber);
  assert.deepEqual(
    [...caseNumbers].sort(),
    [2, 3, 5],
    'Case 4 gained an opening callback. Ruled 2026-09-07: "Case 4 opens directly on its ' +
      'variant/scenario. Its cross-case resurfacing belongs at the Case 4 close. Do not add an ' +
      'opening callback for symmetry." Reversing this needs a superseding ruling, not a test edit.'
  );
  // The resolver must not synthesise one either.
  assert.equal(surfacesModule.openingCallbackForCase(4), null);
  for (const reached of [2, 3, 5] as const) {
    assert.notEqual(surfacesModule.openingCallbackForCase(reached), null);
  }
});

test("no composition root supplies SHIP axis end captions", () => {
  /*
   * A source scan, because a test cannot import a component (it would reach a
   * `.css` specifier and take this whole file down). The repo already settles
   * rules of this shape statically — see tests/no-private-state-in-urls.test.ts
   * and tests/governance-strings.test.ts.
   *
   * `ShipBars` keeps an optional `endLabels` prop for the ruling's own future
   * rule ("add captions only if Ben later authors language for continuous
   * tendencies rather than bit meanings"). The prop surviving is fine; a value
   * flowing into it is not.
   */
  const roots: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (full.endsWith(".tsx")) roots.push(full);
    }
  };
  for (const dir of ["app", "components"]) walk(path.join(repoRoot, dir));

  const offenders: string[] = [];
  for (const file of roots) {
    const relative = path.relative(repoRoot, file).split(path.sep).join("/");
    const source = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, " ");
    /*
     * The ONE permitted occurrence is ShipBars' own pass-through of a prop it
     * was handed. Anything else — a literal, an imported table, a composed
     * object — is a caption reaching the bars.
     */
    for (const match of source.matchAll(/\b(?:endLabels|axisEndLabels)\s*=\s*\{([^}]*)\}/g)) {
      const value = match[1].trim();
      const isPassThrough =
        relative === "components/developer-forward/Reveal.tsx" && value === "axisEndLabels";
      if (!isPassThrough) offenders.push(`${relative}: endLabels={${value}}`);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    'A SHIP axis end caption is being supplied. Ruled 2026-09-07: none by design — "the bars ' +
      "show continuous lean while the existing 0/1 language describes thresholded bit outcomes\", " +
      "so captions would imply unsupported precision. Reversing this needs a superseding ruling."
  );

  // And the constant that records the ruling stays empty.
  assert.equal(copyModule.TODO_SHIP_AXIS_END_LABELS, null);
});
