import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CANONICAL_TEXT_VARIANT_KEYS,
  type AnyCanonicalText,
  type CanonicalTextVariantKey,
  canonicalTextIndex,
  isAwaitingCopy,
  policyForCanonicalText,
  renderCanonicalText,
  resolveVariant,
  validateCanonicalText
} from "@/lib/canonical-text";
import { CLAIM_IDS, claimById, claims } from "@/content/claims";
import { legalCopyRecords } from "@/content/legal";
import { anyHashPublished, authorityChain, authorityChainInOrder } from "@/content/authority-chain";
import { approvalState } from "@/lib/approval-state";
import { judgmentFrameworkRecords } from "@/content/canonical/judgment-framework";
import { wysCanonicalRecords, wysContentObjects } from "@/content/watch-your-step";
import { CONTENT_INTEGRITY_DIGESTS, wysSourceById } from "@/content/watch-your-step/sources";
import { shipContentObjects } from "@/content/ship";

/**
 * One definition, many presentations (plan §6.8; packet: governance validation).
 *
 * This file implements ALL EIGHT required build checks — unresolved component
 * references, duplicate canonical definitions, missing source metadata, invalid
 * current/historical states, more than one current canonical node, missing
 * approval, stale governance hash, broken internal provenance links — plus the
 * `no-raw-curriculum-prose` check, which is the one that stops a developer
 * bypassing the entire provenance spine by typing prose straight into JSX with
 * no compile error and no test failure.
 *
 * The eighth check is not optional and was the one at risk of being dropped:
 * "stale governance hash" fires the moment Ben publishes the v2.3 SHA-256 on
 * yymethod.com and the site's recorded hash falls behind.
 */

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skipDirs = new Set(["node_modules", ".next", ".git"]);

function walk(dir: string, extensions: string[], out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (skipDirs.has(entry)) continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, extensions, out);
    else if (extensions.some((extension) => full.endsWith(extension))) out.push(full);
  }
  return out;
}

const contentFiles = walk(path.join(repoRoot, "content"), [".ts"]);
/**
 * `.ts` under `app/` is included, not only `.tsx`.
 *
 * Phase 9 added four surfaces that are route files rather than components —
 * `app/sitemap.ts`, `app/robots.ts`, `app/llms.txt/route.ts` and
 * `app/author-ship/state.json/route.ts`. They publish text to the open web with
 * no visual review at all, so exempting them from the no-raw-prose and
 * no-undeclared-digest scans purely because of a file extension would leave the
 * least-reviewed surfaces the least governed.
 */
const surfaceFiles = [
  ...walk(path.join(repoRoot, "app"), [".tsx", ".ts"]),
  ...walk(path.join(repoRoot, "components"), [".tsx"])
];

/**
 * Every canonical record the build knows about.
 *
 * THESE TWO ARRAYS ARE THE CHECK. All eight of the packet's build checks run
 * over them and over nothing else, so a content module that is not reachable
 * from here escapes every one of them silently
 * (docs/facelift-build-notes.md §7.5). Phase 6 wired the WYS and ship
 * registries in — `content/watch-your-step/index.ts` and `content/ship/index.ts`
 * collect their own modules and `tests/wys-content.test.ts` fails if a module in
 * either directory is missing from its registry, so adding a module to the
 * registry is enough; forgetting to is a test failure rather than a silent gap.
 *
 * Phase 11 added `content/legal.ts` — the page-specific legal prose — to both
 * arrays. It is registered HERE rather than folded into `claims` because
 * packet: one-definition fixes the claim vocabulary at nine components and
 * `CLAIM_IDS.length` is asserted below; a correction that belongs to one legal
 * page is prose about that page, not a tenth canonical component.
 * `tests/legal-claims.test.ts` fails if a record in that module is missing from
 * its own `legalCopyRecords` array, which is what keeps this registration
 * total.
 */
const canonicalRecords: readonly AnyCanonicalText[] = [
  ...claims,
  ...legalCopyRecords,
  ...judgmentFrameworkRecords,
  ...wysCanonicalRecords
];

/** Every content object carrying provenance fields, canonical or not. */
const contentObjects: readonly { id: string; status: string; origin: string; canonical?: boolean; supersededBy?: string; approvedBy?: string; approvedAt?: string; standingOrdersVersion?: string }[] = [
  ...claims,
  ...legalCopyRecords,
  ...authorityChain,
  ...wysContentObjects,
  ...shipContentObjects
];

function words(value: string): string[] {
  return value.trim().split(/\s+/).filter(Boolean);
}

/** Normalise whitespace, case and punctuation, then hash. §6.8's duplicate rule. */
function proseHash(value: string): string {
  const normalised = value
    .toLowerCase()
    .replace(/[‘’“”]/g, "'")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return createHash("sha256").update(normalised).digest("hex");
}

/* -------------------------------------------------------------------------- */
/* Check 2 — duplicate canonical definitions                                  */
/* -------------------------------------------------------------------------- */

test("no duplicate canonical definitions", () => {
  const index = canonicalTextIndex(canonicalRecords);
  assert.equal(index.size, canonicalRecords.length);
  assert.throws(() => canonicalTextIndex([...canonicalRecords, canonicalRecords[0]]), /Duplicate canonical/);
});

test("the nine named canonical components from packet: one-definition all exist", () => {
  const ids = new Set(canonicalRecords.map((record) => record.id));
  for (const id of CLAIM_IDS) assert.ok(ids.has(id), `missing claim record: ${id}`);
  assert.equal(CLAIM_IDS.length, 9);
  assert.equal(claims.length, 9);
  assert.equal(claimById("minimal-trust").id, "minimal-trust");
});

/* -------------------------------------------------------------------------- */
/* Check 3 — missing source metadata                                          */
/* -------------------------------------------------------------------------- */

test("every canonical record carries source metadata", () => {
  for (const record of canonicalRecords) {
    assert.ok(record.sourceIds.length > 0, `${record.id} is missing source metadata`);
    for (const sourceId of record.sourceIds) {
      assert.notEqual(sourceId.trim(), "", `${record.id} has an empty source id`);
    }
  }
});

test("every content object carries a status and an origin", () => {
  for (const object of contentObjects) {
    assert.ok(object.status, `${object.id} has no status`);
    assert.ok(object.origin, `${object.id} has no origin`);
  }
});

/* -------------------------------------------------------------------------- */
/* Check 1 — unresolved component references                                  */
/* -------------------------------------------------------------------------- */

test("every variantSources key is a declared variant and resolves into sourceIds", () => {
  for (const record of canonicalRecords) {
    if (!record.variantSources) continue;
    for (const [variant, sources] of Object.entries(record.variantSources)) {
      assert.ok(
        (CANONICAL_TEXT_VARIANT_KEYS as readonly string[]).includes(variant),
        `${record.id} declares sources for an unknown variant "${variant}"`
      );
      assert.ok(
        record.variants[variant as CanonicalTextVariantKey] !== undefined,
        `${record.id} declares sources for a variant it does not carry: ${variant}`
      );
      for (const source of sources ?? []) {
        assert.ok(
          record.sourceIds.includes(source),
          `${record.id}'s ${variant} cites "${source}", which is not in sourceIds`
        );
      }
    }
  }
});

/**
 * Added at the Phase 6 gate.
 *
 * `renderPolicyFor` returns `canon` for a `published` record at a Ben origin,
 * and `canon` means "may render as Ben-attributed". Phase 6 shipped four such
 * records whose longer variants extended an approved sentence with prose that
 * appears in no source — sentences Ben has never seen, carrying the label
 * "Approved by Ben". `sourceIds` did not catch it, because a record-level
 * citation is satisfied by ONE sourced variant however many unsourced ones sit
 * beside it.
 *
 * So the citation is required per rendered string: every string variant on a
 * record that resolves to `canon` must name, in `variantSources`, which spec
 * section or artboard region it was taken from. That does not prove the words
 * are in the source, but it makes an invented string impossible to add without
 * writing down a source that can be checked — which is the difference between
 * provenance and a habit of writing plausible ids (content/source-refs.ts).
 *
 * Non-canon records are exempt: draft/placeholder copy is build-authored by
 * definition, carries its own provenance mark, and does not render publicly
 * while RENDER_MARKED_DRAFT is false.
 */
test("every string variant that may render as Ben-attributed names its own source", () => {
  const unsourced: string[] = [];

  for (const record of canonicalRecords) {
    if (policyForCanonicalText(record).kind !== "canon") continue;
    for (const key of CANONICAL_TEXT_VARIANT_KEYS) {
      const value = record.variants[key];
      if (typeof value !== "string") continue;
      const sources = record.variantSources?.[key];
      if (!sources || sources.length === 0) {
        unsourced.push(`${record.id}.${key} renders as Ben-attributed with no variantSources entry`);
      }
    }
  }

  assert.deepEqual(unsourced, []);
});

test("every canonical component reference in content/ resolves to a real record", () => {
  const known = new Set<string>(CLAIM_IDS);
  const unresolved: string[] = [];

  for (const file of contentFiles) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g)) {
      if (!known.has(match[1])) unresolved.push(`${path.relative(repoRoot, file)}: {{${match[1]}}}`);
    }
  }

  assert.deepEqual(unresolved, []);
});

/* -------------------------------------------------------------------------- */
/* Check 4 — invalid current/historical states                                */
/* -------------------------------------------------------------------------- */

test("no content object is in an invalid current/historical state", () => {
  const issues: string[] = [];
  for (const record of canonicalRecords) {
    for (const issue of validateCanonicalText(record)) issues.push(issue);
  }
  for (const object of contentObjects) {
    if (object.status !== "historical" && object.status !== "superseded") continue;
    if (!object.supersededBy) issues.push(`${object.id} is ${object.status} without supersededBy`);
    if (object.canonical !== false) issues.push(`${object.id} is ${object.status} without canonical: false`);
  }
  assert.deepEqual(issues, []);
});

test("validateCanonicalText catches an empty variant rather than letting it render blank", () => {
  const broken = {
    id: "broken",
    surfaceKind: "general",
    status: "published",
    origin: "BEN_APPROVED",
    sourceIds: [],
    variants: { full: "   " }
  } as const satisfies AnyCanonicalText;

  const issues = validateCanonicalText(broken);
  assert.ok(issues.some((issue) => issue.includes("missing source metadata")));
  assert.ok(issues.some((issue) => issue.includes("empty full variant")));
});

/* -------------------------------------------------------------------------- */
/* Check 5 — more than one current canonical node                             */
/* -------------------------------------------------------------------------- */

test("no concept has more than one current canonical node", () => {
  const currentById = new Map<string, number>();
  for (const record of canonicalRecords) {
    if (record.status === "historical" || record.status === "superseded") continue;
    if (record.canonical === false) continue;
    currentById.set(record.id, (currentById.get(record.id) ?? 0) + 1);
  }
  for (const [id, count] of currentById) {
    assert.equal(count, 1, `${id} has ${count} current canonical nodes`);
  }
});

test("the same prose is never defined in two different records (>= 12 words)", () => {
  const seen = new Map<string, string>();
  const duplicates: string[] = [];

  for (const record of canonicalRecords) {
    for (const key of CANONICAL_TEXT_VARIANT_KEYS) {
      const value = record.variants[key];
      if (typeof value !== "string") continue;
      if (words(value).length < 12) continue;
      const hash = proseHash(value);
      const owner = seen.get(hash);
      if (owner && owner !== record.id) duplicates.push(`"${owner}" and "${record.id}" define the same prose`);
      else seen.set(hash, record.id);
    }
  }

  assert.deepEqual(duplicates, []);
});

test("no >= 12-word string literal is defined twice across content/", () => {
  const seen = new Map<string, string>();
  const duplicates: string[] = [];

  for (const file of contentFiles) {
    const source = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, " ");
    for (const match of source.matchAll(/"((?:[^"\\\n]|\\.){20,})"/g)) {
      const literal = match[1];
      if (words(literal).length < 12) continue;
      const hash = proseHash(literal);
      const owner = seen.get(hash);
      const here = path.relative(repoRoot, file);
      if (owner && owner !== here) duplicates.push(`${owner} and ${here} carry the same prose`);
      else seen.set(hash, here);
    }
  }

  assert.deepEqual(duplicates, []);
});

/* -------------------------------------------------------------------------- */
/* Check 6 — missing approval                                                 */
/* -------------------------------------------------------------------------- */

test("per-object approval is complete or absent, never half-claimed", () => {
  for (const object of contentObjects) {
    const claimsApproval = Boolean(object.approvedBy || object.approvedAt || object.standingOrdersVersion);
    if (!claimsApproval) continue;
    assert.equal(object.approvedBy, "Ben Chan", `${object.id} names a non-Ben approver`);
    assert.ok(object.approvedAt, `${object.id} claims approval with no timestamp`);
    assert.ok(object.standingOrdersVersion, `${object.id} claims approval with no Standing Orders version`);
  }
});

test("nothing claims per-object approval while the site is unstamped", () => {
  // Not a permanent rule: it is the current, honest state. When Ben stamps a
  // record, `approvalState.stamp` stops being null and this check relaxes with
  // it — one typed value, exactly as §6.6 requires.
  if (approvalState.stamp !== null) return;
  for (const object of contentObjects) {
    assert.equal(object.approvedBy, undefined, `${object.id} claims approval that nothing evidences`);
  }
});

/* -------------------------------------------------------------------------- */
/* Check 7 — stale governance hash                                            */
/* -------------------------------------------------------------------------- */

/**
 * TWO KINDS OF DIGEST, separated at the Phase 6 gate.
 *
 * A GOVERNANCE digest is the SHA-256 of the frozen YY Method v2.3 Markdown.
 * (packet: hashing) requires freeze -> digest -> publish on yymethod.com/work
 * -> THEN cite, and Ben has published none, so `approvalState.keel.sha256` is
 * null and no such digest may exist anywhere.
 *
 * A CONTENT-INTEGRITY digest identifies the file a provenance record stands
 * for. Plan §6.12 requires exactly one — the raw voice corpus — and the first
 * Phase 6 pass dropped it because this check treated every 64-hex string as a
 * governance digest. Scanning source text for a digest was always a proxy for
 * §6.8's actual requirement, "no hash string RENDERS anywhere on the site", so
 * the check now enforces that requirement directly: nothing under `app/`,
 * `components/` or `lib/` may carry a digest at all, and `content/` may carry
 * only the digests declared in `CONTENT_INTEGRITY_DIGESTS`, in the one file
 * that declares them.
 */
test("the keel hash is null and no digest renders anywhere", () => {
  assert.equal(approvalState.keel.sha256, null);
  assert.equal(anyHashPublished(), false);

  const declaredDigests = new Set<string>(CONTENT_INTEGRITY_DIGESTS.map((entry) => entry.digest));
  const digestHome = path.join("content", "watch-your-step", "sources.ts");
  const offences: string[] = [];
  const scanned = [
    ...surfaceFiles,
    ...contentFiles,
    ...walk(path.join(repoRoot, "lib"), [".ts"])
  ];
  for (const file of scanned) {
    const relative = path.relative(repoRoot, file);
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(/\b[0-9a-f]{64}\b/g)) {
      if (relative === digestHome && declaredDigests.has(match[0])) continue;
      offences.push(`${relative}: ${match[0].slice(0, 12)}...`);
    }
  }

  assert.deepEqual(
    offences,
    [],
    `An undeclared 64-hex digest is present while approvalState.keel.sha256 is null. packet: hashing requires freeze -> SHA-256 -> publish on yymethod.com/work -> THEN cite.\n${offences.join("\n")}`
  );
});

test("every declared content digest belongs to a record that renders on no surface", () => {
  assert.ok(CONTENT_INTEGRITY_DIGESTS.length > 0, "plan §6.12 requires the corpus digest to be recorded");

  for (const entry of CONTENT_INTEGRITY_DIGESTS) {
    assert.match(entry.digest, /^[0-9a-f]{64}$/, `${entry.ownerId}'s digest is not a SHA-256`);
    assert.notEqual(entry.digest, approvalState.keel.sha256 as string | null);
    assert.ok(entry.reason.trim().length > 0, `${entry.ownerId}'s digest has no recorded reason`);

    const owner = wysSourceById(entry.ownerId);
    assert.deepEqual(
      owner.allowedSurfaces,
      [],
      `${entry.ownerId} carries a digest and is allowed on a surface; a digest must never reach one`
    );
    assert.equal(owner.hash, entry.digest, `${entry.ownerId} does not carry the digest declared for it`);
  }
});

test("no content object cites a keel version other than the recorded one", () => {
  const allowed = new Set([approvalState.keel.name, approvalState.keel.shortName]);
  const offences: string[] = [];

  for (const file of contentFiles) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(/YY Method[A-Za-z ]*v\d+(?:\.\d+)*/g)) {
      if (!allowed.has(match[0])) offences.push(`${path.relative(repoRoot, file)}: ${match[0]}`);
    }
  }

  assert.deepEqual(offences, []);
});

/* -------------------------------------------------------------------------- */
/* Check 8 — broken internal provenance links                                 */
/* -------------------------------------------------------------------------- */

test("the authority chain is four links and every derivesFrom resolves", () => {
  const ordered = authorityChainInOrder();
  assert.equal(ordered.length, 4);
  assert.deepEqual(
    ordered.map((link) => link.id),
    ["keel", "standing-orders", "current-state", "log-and-snapshots"]
  );

  const ids = new Set(authorityChain.map((link) => link.id));
  assert.equal(ordered[0].derivesFrom, null, "the keel derives from nothing");
  for (const link of ordered.slice(1)) {
    assert.ok(link.derivesFrom, `${link.id} must derive from something`);
    assert.ok(ids.has(link.derivesFrom as never), `${link.id} derives from a link that does not exist`);
  }

  assert.equal(ordered[0].href, "https://yymethod.com/work");
  for (const link of ordered) {
    assert.equal(link.hash.algorithm, "sha256");
    assert.equal(link.hash.value, null);
  }
});

test("every supersededBy points at a record that exists", () => {
  const ids = new Set(contentObjects.map((object) => object.id));
  for (const object of contentObjects) {
    if (!object.supersededBy) continue;
    assert.ok(ids.has(object.supersededBy), `${object.id} is superseded by an unknown record`);
  }
});

/**
 * Ship's Log order tags are references to Standing Orders records, not free
 * labels (§6.8). content/ship/standing-orders.ts lands in Phase 9; until it
 * does, the honest assertion is that nothing references an order tag yet.
 */
test("every Ship's Log order tag resolves to a real Standing Order", () => {
  const ordersModule = path.join(repoRoot, "content", "ship", "standing-orders.ts");
  const referenced = new Set<string>();

  for (const file of contentFiles) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(/"(order-\d{2})"/g)) referenced.add(match[1]);
  }

  if (!existsSync(ordersModule)) {
    assert.deepEqual(
      [...referenced],
      [],
      "order tags are referenced but content/ship/standing-orders.ts does not exist yet"
    );
    return;
  }

  const orders = readFileSync(ordersModule, "utf8");
  for (const id of referenced) {
    assert.ok(orders.includes(`"${id}"`), `order tag ${id} resolves to no Standing Order`);
  }
});

/* -------------------------------------------------------------------------- */
/* Resolution behaviour                                                       */
/* -------------------------------------------------------------------------- */

test("the infrastructure paragraph keeps its two authoritative wordings apart", () => {
  const record = claimById("minimal-trust");

  const short = resolveVariant(record, "short");
  assert.equal(short.kind, "text");
  if (short.kind !== "text") return;
  assert.equal(
    short.text,
    "Watch Your Step still runs on a website. Hosting, security and limited analytics may receive ordinary technical information. Not zero trust — the minimum trust required, and named."
  );

  const full = resolveVariant(record, "full");
  assert.equal(full.kind, "text");
  if (full.kind !== "text") return;
  assert.ok(full.text.includes("The point is to ask for the minimum trust required and disclose it."));
  assert.notEqual(short.text, full.text);
});

test("an unwritten variant resolves to awaiting, never to text and never to blank", () => {
  // `privacy-disclosure` and `provenance` were the examples until Phase 11
  // wrote them, which is what their `writtenBy: "phase-11"` descriptors said
  // would happen. `captain-stamp` is the remaining unwritten variant and is
  // the right one to hold this check permanently: its `writtenBy` is "ben",
  // so no phase of this build can write it and the branch cannot be retired
  // by implementation.
  const record = claimById("captain-stamp");
  const full = resolveVariant(record, "full");
  assert.equal(full.kind, "awaiting");
  if (full.kind !== "awaiting") return;
  assert.equal(full.awaiting.writtenBy, "ben");
  assert.ok(full.awaiting.awaiting.length > 0);
  assert.ok(isAwaitingCopy(record.variants.full));
});

test("inline falls back only to longer forms, never to a shorter one", () => {
  const record = claimById("minimal-trust");
  const inline = resolveVariant(record, "inline");
  assert.equal(inline.kind, "text");
  if (inline.kind !== "text") return;
  assert.equal(inline.variant, "short", "inline should fall back to short, not invent a sentence");

  const missing = resolveVariant(claimById("captain-stamp"), "short");
  assert.equal(missing.kind, "awaiting");
});

test("renderCanonicalText hands back the policy with the text, never text alone", () => {
  const published = renderCanonicalText(claimById("zero-ai"), "inline", "public");
  assert.equal(published.kind, "text");
  if (published.kind !== "text") return;
  assert.equal(published.policy.kind, "canon");
  assert.equal(
    published.text,
    "You're not talking to AI anywhere on this site. No chatbot, no coach, no generated answers."
  );

  // Phase 8 wrote `analytics.short` — the approved card-2 sentence — so the
  // record is `published` + `BEN_APPROVED` and its `short` resolves as canon.
  // Its `full` is still unwritten and still resolves to `awaiting`, which is
  // the branch this test was really covering.
  const written = renderCanonicalText(claimById("analytics"), "short", "public");
  assert.equal(written.kind, "text");
  if (written.kind !== "text") return;
  assert.equal(written.policy.kind, "canon");

  // Phase 11 wrote `provenance.full` and moved the record to
  // `published` + AI_SYNTHESIS, so it now renders `marked` — the words WITH
  // their label — rather than being withheld. `captain-stamp` keeps the
  // awaiting branch covered.
  const marked = renderCanonicalText(claimById("provenance"), "full", "public");
  assert.equal(marked.kind, "text");
  if (marked.kind !== "text") return;
  assert.equal(marked.policy.kind, "marked");

  const awaiting = renderCanonicalText(claimById("captain-stamp"), "full", "public");
  assert.equal(awaiting.kind, "awaiting");
});

test("the disclosure strip's approval sentence is not stored as renderable copy (SC-1, Q1)", () => {
  // Nothing is stamped, so "Every published word was approved by Ben" cannot be
  // made true by copy (plan R8). Q1's default renders the first three sentences
  // plus a truthful unstamped line from lib/approval-state.ts.
  for (const record of canonicalRecords) {
    for (const key of CANONICAL_TEXT_VARIANT_KEYS) {
      const value = record.variants[key];
      if (typeof value !== "string") continue;
      assert.equal(
        /every published word was approved by ben/i.test(value),
        false,
        `${record.id}.${key} stores the unstamped approval sentence as renderable copy`
      );
    }
  }
});

/* -------------------------------------------------------------------------- */
/* no-raw-curriculum-prose                                                    */
/* -------------------------------------------------------------------------- */

/**
 * The preserved surfaces, frozen at Phase 0. Their prose is pinned verbatim by
 * user constraint 2 and is not curriculum content, so it is exempt — and that
 * is the ONLY exemption. This list may shrink as Phase 4-11 move copy into
 * content/; it may never grow. A new file with inline prose fails.
 *
 * Scope is all of `app/` and all of `components/` deliberately: narrowing it to
 * `components/wys/` would exempt components/ui/*, components/ship/*,
 * components/provenance/* and components/DisclosureStrip.tsx, which is exactly
 * where the ship strings, the provenance strings and the disclosure copy live.
 */
const PRESERVED_SURFACES: readonly string[] = [
  "app/page.tsx",
  "app/layout.tsx",
  "app/accessibility/page.tsx",
  "app/ai-disclosure/page.tsx",
  "app/contact/page.tsx",
  "app/cookies/page.tsx",
  "app/copyright/page.tsx",
  "app/neon/page.tsx",
  "app/privacy/page.tsx",
  "app/studio/page.tsx",
  "app/system/page.tsx",
  "app/terms/page.tsx",
  "components/ConsentBanner.tsx",
  "components/GoogleAnalytics.tsx",
  "components/IntentRouter.tsx",
  "components/SiteFooter.tsx"
];

/** Long text a `.tsx` types out for itself, whether quoted or as a JSX text node. */
function inlineProse(source: string): string[] {
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
  const found: string[] = [];

  for (const match of withoutComments.matchAll(/"((?:[^"\\\n]|\\.){20,})"|'((?:[^'\\\n]|\\.){20,})'/g)) {
    const literal = match[1] ?? match[2];
    if (words(literal).length >= 12) found.push(literal);
  }

  for (const match of withoutComments.matchAll(/>([^<>{}]{20,})</g)) {
    const text = match[1];
    if (words(text).length >= 12) found.push(text.trim());
  }

  return found;
}

test("no raw curriculum prose in app/ or components/", () => {
  const offences: string[] = [];

  for (const file of surfaceFiles) {
    const relative = path.relative(repoRoot, file).split(path.sep).join("/");
    if (PRESERVED_SURFACES.includes(relative)) continue;
    for (const prose of inlineProse(readFileSync(file, "utf8"))) {
      offences.push(`${relative}: ${prose.slice(0, 70)}...`);
    }
  }

  assert.deepEqual(
    offences,
    [],
    `Prose >= 12 words must be imported from content/, not typed into JSX — that is the provenance spine.\n${offences.join("\n")}`
  );
});

test("the exemption list names only preserved surfaces that still exist", () => {
  for (const relative of PRESERVED_SURFACES) {
    assert.ok(existsSync(path.join(repoRoot, relative)), `exempt file no longer exists: ${relative}`);
  }
  assert.equal(PRESERVED_SURFACES.length, 16);
});
