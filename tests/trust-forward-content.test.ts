import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  TRUST_FORWARD_AUTHORITIES,
  TRUST_FORWARD_RECORD_FREE_MODULES,
  TRUST_FORWARD_UNSOURCED_SURFACES,
  trustForwardRegistry
} from "@/content/trust-forward/index";
import { approvalState } from "@/lib/approval-state";
import { AGGREGATION_POLICY_ID } from "@/lib/trust-forward/aggregation";
import { DECISION_IDS, OPTION_IDS } from "@/lib/trust-forward/types";

import * as casesModule from "@/content/trust-forward/cases";
import * as copyModule from "@/content/trust-forward/copy";
import * as digestsModule from "@/content/trust-forward/digests";
import * as indexModule from "@/content/trust-forward/index";
import * as narrativeModule from "@/content/trust-forward/narrative";
import * as profilesModule from "@/content/trust-forward/profiles";
import * as receiptsModule from "@/content/trust-forward/receipts";
import * as signalsModule from "@/content/trust-forward/signals";
import * as surfacesModule from "@/content/trust-forward/surfaces";
import * as variantsModule from "@/content/trust-forward/variants";
import * as stampModule from "@/content/trust-forward/stamp/v1-1-0";

/**
 * Trust Forward Lite — the content governance gate (plan §7; REV4 test table).
 *
 * WHY THIS FILE IMPORTS NOTHING BUT DATA. The suite runs as
 * `node --import tsx --test tests/*.test.ts`, and Node cannot resolve a `.css`
 * specifier: one component import anywhere in this file's transitive graph
 * takes the WHOLE FILE down with `ERR_UNKNOWN_FILE_EXTENSION`, and a test file
 * that cannot load is a test file that cannot fail. So this asserts over
 * `content/trust-forward/` and the pure modules under `lib/trust-forward/`, and
 * never over a renderer. Same discipline as `tests/wys-content.test.ts`.
 *
 * WHY IT ASSERTS OVER EXPORTED VALUES AND NOT OVER FILE TEXT. Every public-copy
 * guard below (`§5`) names a string that this repository is FORBIDDEN TO SHIP —
 * and each of those strings is also DISCUSSED, by name, in the header comments
 * of the very modules that struck it. `content/trust-forward/surfaces.ts` says
 * in prose that "729 possible profiles" is not shipped; a grep of the file for
 * "729 possible profiles" therefore hits the sentence explaining the ban and
 * fails. A grep would force those explanations to be deleted or spelled around,
 * which would leave the ban undocumented at exactly the place a future author
 * looks. So the guards walk the modules' EXPORTED VALUES — every string a
 * renderer could reach — which is the population the ruling actually governs.
 *
 * WHAT THIS FILE CANNOT DO. It proves nothing about what `app/` renders.
 * `tests/canonical-text.test.ts` bans learner prose from `app/` and
 * `components/`, and that is the check which forces every sentence through
 * these modules; without it, this file governs a directory a component could
 * simply bypass. The two are a pair.
 */

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(repoRoot, "content", "trust-forward");

/* -------------------------------------------------------------------------- */
/* 0. The harness                                                             */
/* -------------------------------------------------------------------------- */

/** Every `.ts` file under `content/trust-forward/`, repo-relative, POSIX-slashed. */
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
  "content/trust-forward/cases.ts": casesModule,
  "content/trust-forward/copy.ts": copyModule,
  "content/trust-forward/digests.ts": digestsModule,
  "content/trust-forward/index.ts": indexModule,
  "content/trust-forward/narrative.ts": narrativeModule,
  "content/trust-forward/profiles.ts": profilesModule,
  "content/trust-forward/receipts.ts": receiptsModule,
  "content/trust-forward/signals.ts": signalsModule,
  "content/trust-forward/surfaces.ts": surfacesModule,
  "content/trust-forward/variants.ts": variantsModule,
  "content/trust-forward/stamp/v1-1-0.ts": stampModule
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

const registryClaims = trustForwardRegistry.flatMap(authorityClaims);

/* -------------------------------------------------------------------------- */
/* 1. Registry completeness                                                   */
/* -------------------------------------------------------------------------- */

/**
 * `content/trust-forward/index.ts` is a governance mechanism, and a governance
 * mechanism that can be bypassed by adding a file is a convention. Every module
 * is registered or DECLARED record-free; a module in neither is invisible to
 * every check in this file and to `tests/canonical-text.test.ts`, and it fails
 * here rather than being noticed later.
 */
test("every content/trust-forward module is registered or declared record-free", () => {
  const onDisk = contentModulePaths(contentDir).sort();
  assert.ok(onDisk.length > 0, "no content modules found — the walk is looking in the wrong place");

  // Registry module labels carry a disambiguating suffix where one module
  // registers two groups ("…/cases.ts (authoring notes)"). The FILE is the key.
  const registered = new Set(
    trustForwardRegistry.map((group) => group.module.split(" (")[0])
  );
  const declaredFree = new Set(TRUST_FORWARD_RECORD_FREE_MODULES);

  const unaccounted = onDisk.filter((file) => !registered.has(file) && !declaredFree.has(file));
  assert.deepEqual(
    unaccounted,
    [],
    "add each module to trustForwardRegistry or TRUST_FORWARD_RECORD_FREE_MODULES in the same commit"
  );

  // And the reverse: a registry that names a file which no longer exists is
  // recording governance over nothing.
  const onDiskSet = new Set(onDisk);
  for (const file of [...registered, ...declaredFree]) {
    assert.ok(onDiskSet.has(file), `${file} is registered but does not exist on disk`);
  }

  // The stamp directory is inside the walk, not beside it. It was the module
  // most likely to be missed, being a subdirectory.
  assert.ok(onDiskSet.has("content/trust-forward/stamp/v1-1-0.ts"));

  // Every registered file must also be one this test file actually opened.
  for (const file of onDisk) {
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
  const declared = new Set<string>(TRUST_FORWARD_AUTHORITIES);
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
  const anchor = trustForwardRegistry.find((group) => Array.isArray(group.provenance));
  assert.ok(anchor, "the digest registry is no longer registered");
  assert.equal(anchor.module, "content/trust-forward/digests.ts");
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
    if (TRUST_FORWARD_RECORD_FREE_MODULES.includes(file)) continue;
    if (file === "content/trust-forward/digests.ts") continue;
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
 */
const BEN_AUTHORED_GROUPS: readonly string[] = [
  "content/trust-forward/copy.ts::INFO_MARKERS",
  "content/trust-forward/copy.ts::LITE_INTRO",
  "content/trust-forward/copy.ts::PROGRESS",
  "content/trust-forward/copy.ts::REFLECTION",
  "content/trust-forward/copy.ts::HANDLE",
  "content/trust-forward/copy.ts::RESULT",
  "content/trust-forward/copy.ts::FULL_OFFER",
  "content/trust-forward/copy.ts::LANDING_INCOMPLETE",
  "content/trust-forward/copy.ts::LANDING_COMPLETE",
  "content/trust-forward/variants.ts::caseAxes",
  "content/trust-forward/variants.ts::missingEvidenceFallbacks"
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
 *     `content/trust-forward/copy.ts` says so at its definition site.
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
test("no struck or superseded public claim is reachable from content/trust-forward", () => {
  const forbiddenSubstrings: readonly { text: string; why: string }[] = [
    {
      text: "729 possible profiles",
      why: "ruling Q-C struck it from the closing upsell; the profile count is not a public number"
    },
    {
      text: "39 real",
      why: "superseded by the approved Full bridge, which says '30+ real cases'"
    },
    {
      text: "42 cases",
      why: "42 is the INTERNAL corpus authority; the public bridge is '30+ real cases'"
    },
    {
      text: "42 real",
      why: "42 is the internal corpus authority and is not a learner-facing number"
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

  // The approved bridge itself, so the guards above cannot pass by deletion.
  assert.ok(
    copyModule.FULL_OFFER.bridge.includes("30+ real cases"),
    "the approved Full bridge sentence is gone; the guards above would then pass vacuously"
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
/* 6. The four unsourced surfaces                                             */
/* -------------------------------------------------------------------------- */

/**
 * A `TODO_` constant is a REFUSAL TO INVENT, and `null` is what makes it one.
 *
 * The four surfaces below have no approved wording anywhere in the handoff.
 * Holding `null` means a renderer that reaches for one gets nothing and must
 * show nothing — the mechanism `AwaitingCopy` uses elsewhere in this repo.
 * Holding a STRING means the constant is a sentence, and a sentence in a
 * content module is something a component can render: a developer note reaching
 * a learner's screen is a worse failure than a blank, and it is reachable by
 * ordinary code that does no wrong.
 *
 * `content/trust-forward/index.ts` states the invariant in its own words —
 * "Each is `null` at its definition site, so nothing can render an invented
 * sentence in its place" — so this test is the check that its claim is true.
 */
test("every unsourced surface is null, so nothing can render in their place", () => {
  const unsourced: readonly { name: string; value: unknown }[] = [
    { name: "cases.ts: TODO_C5_AI_EXPLANATION_BODY_UNSOURCED", value: casesModule.TODO_C5_AI_EXPLANATION_BODY_UNSOURCED },
    { name: "surfaces.ts: TODO_CASE_4_OPENING_CALLBACK_UNAUTHORED", value: surfacesModule.TODO_CASE_4_OPENING_CALLBACK_UNAUTHORED },
    { name: "copy.ts: TODO_LANDING_FAQ_ANSWERS", value: copyModule.TODO_LANDING_FAQ_ANSWERS },
    { name: "copy.ts: TODO_RESULT_PROFESSIONAL_SUMMARY", value: copyModule.TODO_RESULT_PROFESSIONAL_SUMMARY },
    /*
     * The fifth, found during the UI build rather than the content pass: the
     * SHIP bars are two-ended and no approved source says what the two ends
     * MEAN. `ROUTING_AND_SCORING.md` gives a reading per BIT, but captioning a
     * continuous lean with a threshold's reading would tell a learner at 50.4%
     * something their answers do not support. It is declared in `copy.ts` with
     * the other content gaps and re-exported by `ShipBars`, because a missing
     * learner-facing string is the content registry's business.
     */
    { name: "copy.ts: TODO_SHIP_AXIS_END_LABELS", value: copyModule.TODO_SHIP_AXIS_END_LABELS }
  ];

  for (const surface of unsourced) {
    assert.equal(
      surface.value,
      null,
      `${surface.name} holds a value. It must be null: a string here is a sentence a renderer can print, and no approved wording exists for this surface. Move the explanation into the doc-comment above the constant.`
    );
  }

  // The declared list and the constants are two records of one fact.
  assert.deepEqual(
    [...TRUST_FORWARD_UNSOURCED_SURFACES].sort(),
    unsourced.map((surface) => surface.name).sort(),
    "TRUST_FORWARD_UNSOURCED_SURFACES and the constants disagree about what is missing"
  );

  // And no further TODO_ export appeared without being declared.
  const declared = new Set(TRUST_FORWARD_UNSOURCED_SURFACES.map((entry) => entry.split(": ")[1]));
  for (const [module, namespace] of Object.entries(MODULE_NAMESPACES)) {
    for (const key of Object.keys(namespace)) {
      if (!key.startsWith("TODO_")) continue;
      assert.ok(
        declared.has(key),
        `${module} exports ${key}, which is not declared in TRUST_FORWARD_UNSOURCED_SURFACES`
      );
    }
  }
});

/* -------------------------------------------------------------------------- */
/* 7. The stamp                                                               */
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
