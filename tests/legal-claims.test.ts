import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CANONICAL_TEXT_VARIANT_KEYS, type AnyCanonicalText, resolveVariant } from "@/lib/canonical-text";
import { policyForCanonicalText } from "@/lib/canonical-text";
import { CLAIM_IDS, claimById, claims } from "@/content/claims";
import { legalCopyRecords } from "@/content/legal";
import { judgmentFrameworkRecords } from "@/content/canonical/judgment-framework";
import { wysCanonicalRecords } from "@/content/watch-your-step";
import { dataCopyRecords } from "@/content/watch-your-step/data";
import { externalSourceRefs, isExternalSourceRef } from "@/content/source-refs";
import { BROWSER_KEYS, BROWSER_KEY_NAMES } from "@/lib/wys/browser-keys";
import { WYS_STORAGE_KEY } from "@/lib/wys/local-state";
import { WYS_EVENT_NAMES, WYS_PROPERTY_KEYS } from "@/lib/wys/telemetry";
import { AGGREGATE_ENDPOINT } from "@/lib/wys/aggregate";
import { WYS_AGGREGATE_ENABLED } from "@/content/watch-your-step/config";
import { disclosureApprovalLine } from "@/lib/approval-state";

/**
 * Phase 11 — the legal / disclosure refresh (plan §8b).
 *
 * Four things this file proves, because §8b's exit criteria are all
 * checkable and none of them is checkable by reading:
 *
 *  1. All six pages keep their URL and their metadata title.
 *  2. Every claim traces to ONE definition and ONE line of shipped code — the
 *     pages import records, the records cite registered sources, and no claim
 *     is written twice.
 *  3. Zero forbidden claims (§8b.3), swept over every rendered string on the
 *     site rather than over one page.
 *  4. No claim exceeds implemented fact: what the pages say about the
 *     aggregate endpoint, the event allowlist, the browser keys and the
 *     shipped CSS is asserted against those modules, not against the prose.
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

function read(relative: string): string {
  return readFileSync(path.join(repoRoot, relative), "utf8");
}

/** Comments are not published. The sweeps below read what ships, not what is annotated. */
function withoutComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
}

/* -------------------------------------------------------------------------- */
/* 1. The six pages keep their URLs and their metadata titles                 */
/* -------------------------------------------------------------------------- */

/**
 * The six refreshed pages and the titles they had before Phase 11 touched
 * them, captured from the preserved files at Phase 0. §3.1's normalised count:
 * SIX legal/disclosure pages, and `/contact` is a footer legal link but not one
 * of them — it must never be counted twice.
 */
const REFRESHED_PAGES: readonly { route: string; file: string; title: string }[] = [
  { route: "/privacy", file: "app/privacy/page.tsx", title: "Privacy Policy - BenChanTech" },
  { route: "/terms", file: "app/terms/page.tsx", title: "Terms of Use - BenChanTech" },
  { route: "/cookies", file: "app/cookies/page.tsx", title: "Cookie Notice - BenChanTech" },
  { route: "/copyright", file: "app/copyright/page.tsx", title: "Copyright - BenChanTech" },
  { route: "/accessibility", file: "app/accessibility/page.tsx", title: "Accessibility Statement - BenChanTech" },
  { route: "/ai-disclosure", file: "app/ai-disclosure/page.tsx", title: "AI Disclosure - BenChanTech" }
];

test("all six refreshed pages still exist at their URLs with their metadata titles", () => {
  assert.equal(REFRESHED_PAGES.length, 6);
  for (const page of REFRESHED_PAGES) {
    assert.ok(existsSync(path.join(repoRoot, page.file)), `${page.route} lost its route file`);
    assert.ok(
      read(page.file).includes(`title: "${page.title}"`),
      `${page.route} changed its metadata title; §8b.1 pins all six`
    );
  }
  assert.ok(existsSync(path.join(repoRoot, "app/contact/page.tsx")), "/contact is preserved and not refreshed");
});

test("every preserved heading on the six pages survives the refresh", () => {
  // Nothing is deleted (plan §3.0), preserved copy included. These are the
  // section headings the pages carried before Phase 11; additions sit between
  // them and none of them was renamed.
  const preserved: Record<string, readonly string[]> = {
    "app/privacy/page.tsx": [
      "Information collected",
      "Analytics and cookies",
      "Current services",
      "Third-party services",
      "Legal basis and retention",
      "International transfers",
      "Your rights",
      "Children",
      "Future services",
      "Contact"
    ],
    "app/terms/page.tsx": [
      "Educational and informational purpose",
      "No professional advice",
      "Acceptable use",
      "Intellectual property",
      "Third-party services",
      "No warranty",
      "Limitation of liability",
      "Governing law",
      "Changes"
    ],
    "app/cookies/page.tsx": ["Analytics cookies", "Consent", "Retention"],
    "app/copyright/page.tsx": ["Permitted use", "Not permitted", "Third-party material"],
    "app/accessibility/page.tsx": ["Current approach", "Ongoing work", "Contact"],
    "app/ai-disclosure/page.tsx": ["Current site behavior", "AI-assisted work", "Educational purpose", "Future services"]
  };

  for (const [file, headings] of Object.entries(preserved)) {
    const source = read(file);
    for (const heading of headings) {
      assert.ok(source.includes(`<h2>${heading}</h2>`), `${file} lost the preserved heading "${heading}"`);
    }
  }
});

test("the two sentences Phase 11 corrected were narrowed, not replaced", () => {
  // Exactly two clauses on the whole site stopped being true when `wys:v1`
  // shipped, and both were fixed by ADDING a word rather than by rewriting the
  // sentence around them (R8, §3.0). Every other word of both paragraphs
  // survives. docs/facelift-copy-diff.md records both.
  const privacy = withoutComments(read("app/privacy/page.tsx"));
  assert.ok(privacy.includes("The current site is a public routing foyer and company information site."));
  assert.ok(privacy.includes("accounts, subscriptions, uploads, or server-side personalized user memory"));

  const disclosure = withoutComments(read("app/ai-disclosure/page.tsx"));
  assert.ok(disclosure.includes("The public site currently uses deterministic local routing and static content."));
  assert.ok(disclosure.includes("user account, or server-side persistent user memory"));

  // The unqualified clauses are gone from both, because leaving a false
  // sentence and adding a true one beneath it leaves the false one on the page.
  assert.equal(/uploads, or personalized user memory/.test(privacy), false);
  assert.equal(/user account, or persistent user memory/.test(disclosure), false);
});

/* -------------------------------------------------------------------------- */
/* 2. One definition, one shipped code line                                   */
/* -------------------------------------------------------------------------- */

const allRecords: readonly AnyCanonicalText[] = [
  ...claims,
  ...legalCopyRecords,
  ...judgmentFrameworkRecords,
  ...wysCanonicalRecords
];

test("every record declared in content/legal.ts is registered in legalCopyRecords", () => {
  // An unregistered content module escapes every governance check silently
  // (docs/facelift-build-notes.md §7.5). This module has one array and this is
  // the check that keeps it total.
  const source = read("content/legal.ts");
  const declared = [...source.matchAll(/^  id: "([a-z0-9-]+)",$/gm)].map((match) => match[1]);
  const registered = legalCopyRecords.map((record) => record.id);
  assert.ok(declared.length >= 12, `expected the Phase 11 records, found ${declared.length}`);
  assert.deepEqual([...declared].sort(), [...registered].sort());
});

test("every source a claim or legal record cites resolves to a registered reference", () => {
  const unresolved: string[] = [];
  const records: readonly AnyCanonicalText[] = [...claims, ...legalCopyRecords];
  for (const record of records) {
    for (const sourceId of record.sourceIds) {
      if (!isExternalSourceRef(sourceId)) unresolved.push(`${record.id} cites "${sourceId}"`);
    }
    for (const [variant, sources] of Object.entries(record.variantSources ?? {})) {
      for (const sourceId of sources ?? []) {
        if (!record.sourceIds.includes(sourceId)) {
          unresolved.push(`${record.id}.${variant} cites "${sourceId}", which is not in sourceIds`);
        }
      }
    }
  }
  assert.deepEqual(unresolved, []);
});

test("every legal record cites at least one shipped module, and the module exists", () => {
  // §8b.1's exit criterion is "every claim traces to one definition AND one
  // line of shipped code". A spec section states an intention and a preserved
  // page states history; only a `repo-code` reference states a fact that can be
  // checked, so a `code-` citation is REQUIRED rather than one of three
  // acceptable kinds. The gate tightened this: two records reached the gate
  // sourced only to `app-terms-page` and a spec section, which satisfied the
  // looser check while tracing to no code at all.
  for (const record of legalCopyRecords) {
    const codeRefs = record.sourceIds.filter((id) => id.startsWith("code-"));
    assert.ok(codeRefs.length > 0, `${record.id} cites no shipped module`);

    // And the module it names has to be on disk. A locator is a path plus a
    // note; the path is the part that can rot.
    for (const id of codeRefs) {
      const ref = externalSourceRefs.find((candidate) => candidate.id === id);
      assert.ok(ref, `${record.id} cites the unregistered source "${id}"`);
      if (!ref) continue;
      assert.equal(ref.kind, "repo-code", `${id} is cited as code but registered as ${ref.kind}`);
      // Repo-relative paths only — a locator may also name a bare export or a
      // sibling file in prose, and a bare filename is not resolvable.
      const paths = ref.locator.match(/[\w.-]+(?:\/[\w.-]+)+\.(?:ts|tsx|css)/g) ?? [];
      assert.ok(paths.length > 0, `${id} names no file in its locator`);
      for (const relative of paths) {
        assert.ok(existsSync(path.join(repoRoot, relative)), `${id} cites ${relative}, which does not exist`);
      }
    }
  }
});

test("no claim written for Phase 11 is still awaiting copy", () => {
  // The seven records whose `awaiting` descriptors said `writtenBy: "phase-11"`
  // are written. `captain-stamp` is Ben's and stays awaiting; `provenance` and
  // `privacy-disclosure` moved to a non-Ben origin when they were written.
  const stillAwaiting: string[] = [];
  for (const id of CLAIM_IDS) {
    const record = claimById(id);
    for (const key of CANONICAL_TEXT_VARIANT_KEYS) {
      const value = record.variants[key];
      if (typeof value === "object" && value !== null && "writtenBy" in value && value.writtenBy === "phase-11") {
        stillAwaiting.push(`${id}.${key}`);
      }
    }
  }
  assert.deepEqual(stillAwaiting, []);

  const stamp = claimById("captain-stamp").variants.full;
  assert.equal(typeof stamp === "object" && stamp !== null && stamp.writtenBy, "ben");
});

test("build-authored legal prose never renders as Ben-attributed", () => {
  // `canon` means "may render as Ben-attributed". Only spec-verbatim and
  // artboard-approved records may reach it; everything this build wrote is
  // AI_SYNTHESIS and renders `marked`, with its label and its draft mark.
  for (const record of legalCopyRecords) {
    const policy = policyForCanonicalText(record);
    if (record.origin === "BEN_APPROVED") {
      assert.equal(policy.kind, "canon", `${record.id} is Ben-approved but would not render`);
      continue;
    }
    assert.equal(record.origin, "AI_SYNTHESIS", `${record.id} uses an unexpected origin`);
    assert.equal(policy.kind, "marked", `${record.id} would render without its provenance`);
    if (policy.kind !== "marked") return;
    assert.equal(policy.label, "Drafted during implementation — not Ben's words");
    assert.equal(policy.draftMark, "default");
  }
});

test("each legal page renders its claims from a record, never from a literal", () => {
  const required: Record<string, readonly string[]> = {
    "app/privacy/page.tsx": [
      'claimById("privacy-disclosure")',
      'claimById("analytics")',
      'claimById("localStorage")',
      'claimById("minimal-trust")',
      "aggregateNotBuiltText",
      "analyticsConditionsText",
      "privacyCurrentServicesText",
      "privacyNoServerStateText",
      "thirteenPlusText",
      "BrowserKeyList"
    ],
    "app/cookies/page.tsx": [
      "cookiesBrowserStorageText",
      'claimById("localStorage")',
      'claimById("minimal-trust")',
      "clearingFootnoteText",
      "clearingSurvivesText",
      "aggregateNotBuiltText",
      "BrowserKeyList"
    ],
    "app/ai-disclosure/page.tsx": [
      'claimById("zero-ai")',
      'claimById("ai-assisted-ben-approved")',
      'claimById("ai-role-boundaries")',
      'claimById("provenance")',
      "currentSiteBehaviorText",
      "disclosureApprovalLine"
    ],
    "app/terms/page.tsx": ["termsCourseText", "termsNonGoalsText", "rulebookOwnershipText"],
    "app/copyright/page.tsx": ["copyrightCurriculumText", "rulebookOwnershipText"],
    "app/accessibility/page.tsx": [
      "accessibilityShippedText",
      "accessibilityContrastText",
      "accessibilityMediaText"
    ]
  };

  for (const [file, references] of Object.entries(required)) {
    const source = read(file);
    for (const reference of references) {
      assert.ok(source.includes(reference), `${file} does not render ${reference}`);
    }
  }
});

test("/cookies renders the Data page's clearing sentences, it does not restate them", () => {
  // §8b.2: "word-for-word identical to the Data page footnote." The only way
  // that stays true is for both surfaces to render the same record.
  const source = read("app/cookies/page.tsx");
  assert.match(source, /from "@\/content\/watch-your-step\/data"/);
  const footnote = resolveVariant(
    dataCopyRecords.find((record) => record.id === "data-clearing-footnote") as AnyCanonicalText,
    "full"
  );
  assert.equal(footnote.kind, "text");
  if (footnote.kind !== "text") return;
  assert.ok(footnote.text.includes("It can't erase hosting or analytics logs"));
  // And it is not additionally typed into the page.
  assert.equal(source.includes("erase hosting or analytics logs"), false);
});

test("SC-1 — /ai-disclosure's approval language is the disclosure strip's, from one function", () => {
  const source = read("app/ai-disclosure/page.tsx");
  const strip = read("components/DisclosureStrip.tsx");
  assert.ok(source.includes("disclosureApprovalLine"), "/ai-disclosure states approval in its own words");
  assert.ok(strip.includes("disclosureApprovalLine"), "the strip no longer renders the shared line");

  const line = disclosureApprovalLine();
  assert.ok(line.text.length > 0);
  // Neither surface may carry the sentence as a literal — that is what makes
  // "word for word" a mechanism rather than a promise.
  for (const [name, text] of [["/ai-disclosure", source], ["the strip", strip]] as const) {
    assert.equal(text.includes(line.text), false, `${name} hard-codes the approval sentence`);
  }
});

test("no >= 12-word legal string is defined twice across content/", () => {
  const seen = new Map<string, string>();
  const duplicates: string[] = [];
  for (const record of allRecords) {
    for (const key of CANONICAL_TEXT_VARIANT_KEYS) {
      const value = record.variants[key];
      if (typeof value !== "string") continue;
      if (value.trim().split(/\s+/).length < 12) continue;
      const normalised = value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
      const owner = seen.get(normalised);
      if (owner && owner !== record.id) duplicates.push(`${owner} and ${record.id} carry the same prose`);
      else seen.set(normalised, record.id);
    }
  }
  assert.deepEqual(duplicates, []);
});

/* -------------------------------------------------------------------------- */
/* 3. The forbidden-claims audit (§8b.3), site-wide                           */
/* -------------------------------------------------------------------------- */

/**
 * (WYS §18, §32; packet: forbidden-privacy-claims). Matched case-insensitively.
 *
 * TWO SANCTIONED APPEARANCES, and only two:
 *  - "zero trust" inside the approved infrastructure paragraph's DENIAL of it
 *    ("Not zero trust…", "The point is not 'zero trust.'");
 *  - "AI you can trust" as the struck-through anti-feature pill on the home
 *    page, which plan §2.1 names as its one approved use.
 */
const FORBIDDEN_CLAIMS: readonly string[] = [
  "no tracking",
  "no data collection",
  "zero trust",
  "total privacy",
  "100% private",
  "100% anonymous",
  "impossible re-identification",
  "ai-proof",
  "hallucination-proof",
  "privacy guaranteed",
  "ai you can trust",
  "the correct way to use ai",
  "definitive system for safe ai",
  "become ai literate",
  "expert-certified",
  "most trustworthy",
  "best-in-class governance"
];

function sanctioned(phrase: string, haystack: string): boolean {
  if (phrase === "zero trust") return /not\s+["“]?zero trust/.test(haystack);
  return false;
}

test("no forbidden claim appears in any rendered string on the site", () => {
  const offences: string[] = [];
  for (const record of [...allRecords, ...dataCopyRecords]) {
    for (const key of CANONICAL_TEXT_VARIANT_KEYS) {
      const value = record.variants[key];
      if (typeof value !== "string") continue;
      const text = value.toLowerCase();
      for (const phrase of FORBIDDEN_CLAIMS) {
        if (!text.includes(phrase)) continue;
        if (sanctioned(phrase, text)) continue;
        offences.push(`${record.id}.${key} claims "${phrase}"`);
      }
    }
  }
  assert.deepEqual(offences, []);
});

test("no forbidden claim is typed into a surface file either", () => {
  // Records are the main route onto a page, but a heading, a link label or a
  // button is a literal in a `.tsx`. Comments are stripped first: an annotation
  // that NAMES the forbidden list (content/legal.ts does) is not a claim.
  const offences: string[] = [];
  const surfaces = [
    ...walk(path.join(repoRoot, "app"), [".tsx", ".ts"]),
    ...walk(path.join(repoRoot, "components"), [".tsx"])
  ];

  for (const file of surfaces) {
    const relative = path.relative(repoRoot, file).split(path.sep).join("/");
    const source = withoutComments(readFileSync(file, "utf8")).toLowerCase();
    for (const phrase of FORBIDDEN_CLAIMS) {
      if (!source.includes(phrase)) continue;
      if (sanctioned(phrase, source)) continue;
      offences.push(`${relative} claims "${phrase}"`);
    }
  }
  assert.deepEqual(offences, []);
});

test("the one sanctioned use of \"AI you can trust\" is still struck through, and is the only one", () => {
  const owners: string[] = [];
  for (const file of walk(path.join(repoRoot, "content"), [".ts"])) {
    const source = withoutComments(readFileSync(file, "utf8"));
    if (source.includes("AI you can trust")) owners.push(path.relative(repoRoot, file).split(path.sep).join("/"));
  }
  assert.deepEqual(owners, ["content/watch-your-step/landing.ts"]);
  assert.ok(read("app/page.tsx").includes("StruckPill"), "the anti-feature pills are no longer struck through");
});

test("no legal record speaks in Ben's first person (R10)", () => {
  for (const record of legalCopyRecords) {
    for (const key of CANONICAL_TEXT_VARIANT_KEYS) {
      const value = record.variants[key];
      if (typeof value !== "string") continue;
      assert.equal(/\b(?:I|I'm|I've|my|me)\b/.test(value), false, `${record.id}.${key} speaks as Ben`);
    }
  }
});

/* -------------------------------------------------------------------------- */
/* 4. No claim exceeds implemented fact                                       */
/* -------------------------------------------------------------------------- */

test("the aggregate endpoint the pages call not built is, in fact, not built", () => {
  assert.equal(WYS_AGGREGATE_ENABLED, false);
  assert.equal(AGGREGATE_ENDPOINT, null);
  assert.equal(existsSync(path.join(repoRoot, "app/api")), false, "an API route exists; the claim is now false");
  const text = resolveVariant(legalCopyRecords.find((r) => r.id === "legal-aggregate-not-built") as AnyCanonicalText, "full");
  assert.equal(text.kind, "text");
  if (text.kind !== "text") return;
  assert.ok(text.text.includes("is not built"));
});

test("every browser key is named on /privacy and /cookies, generated from the registry", () => {
  // FOUR keys now. The fourth arrived when the YY judgment ledger got its own
  // key rather than a field inside the v1 dataset, and the point of this
  // assertion is that neither legal page needed editing for it to appear:
  // both render `BrowserKeyList`, which reads the registry. Updating this list
  // is the whole cost of adding a key, and it is deliberate — the count is
  // pinned so a fifth key cannot arrive silently.
  assert.deepEqual(
    [...BROWSER_KEY_NAMES],
    [
      WYS_STORAGE_KEY,
      "benchantech:trust-forward-lite:state",
      "benchantech:trust-forward-lite:yy",
      "bct_analytics_consent"
    ]
  );
  const list = read("components/BrowserKeyList.tsx");
  assert.ok(list.includes("BROWSER_KEYS"), "the key list is hand-maintained again");
  for (const record of BROWSER_KEYS) {
    assert.equal(list.includes(`"${record.key}"`), false, `${record.key} is typed into the component`);
  }
  for (const file of ["app/privacy/page.tsx", "app/cookies/page.tsx"]) {
    assert.ok(read(file).includes("<BrowserKeyList />"), `${file} does not name the browser keys`);
  }
});

test("the wys:v1 key on /privacy is composed from the implementation, never typed", () => {
  const record = claimById("localStorage");
  const full = resolveVariant(record, "full");
  assert.equal(full.kind, "text");
  if (full.kind !== "text") return;
  assert.ok(full.text.includes(WYS_STORAGE_KEY), "the claim no longer names the storage key");
  const source = withoutComments(read("content/claims.ts"));
  assert.ok(source.includes("${WYS_STORAGE_KEY}"), "the key is hard-coded into the claim");
  assert.equal(/"[^"]*wys:v1[^"]*"/.test(source), false, "a second copy of the storage key is typed in claims.ts");
});

test("what /privacy says about the event allowlist is true of the adapter", () => {
  // The page says the event names are a closed list and the properties are a
  // closed list, and that no entry in either is a learner's answer. Both lists
  // are frozen tuples in lib/wys/telemetry.ts, and no member of either names an
  // answer, a judgment, a rulebook or a posture.
  assert.equal(WYS_EVENT_NAMES.length, 13);
  assert.equal(WYS_PROPERTY_KEYS.length, 4);
  const answerish = /answer|judgment|rulebook|posture|choice|scratch|memory/i;
  for (const name of WYS_EVENT_NAMES) assert.equal(answerish.test(name), false, `${name} carries an answer`);
  for (const key of WYS_PROPERTY_KEYS) assert.equal(answerish.test(key), false, `${key} carries an answer`);
});

test("the accessibility claims match what app/globals.css actually ships", () => {
  const css = read("app/globals.css");
  assert.match(css, /:focus-visible\s*\{[^}]*outline:\s*3px solid var\(--focus\)/);
  assert.match(css, /:focus-visible\s*\{[^}]*outline-offset:\s*3px/);
  assert.ok(css.includes(".skip-link"), "the skip link claim has no rule behind it");
  assert.ok(css.includes("min-height: 44px"), "the 44px target claim has no rule behind it");
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.ok(css.includes("--accent-text-on-tint"), "the Q23 token the page describes is gone");

  const contrast = resolveVariant(
    legalCopyRecords.find((record) => record.id === "legal-accessibility-contrast") as AnyCanonicalText,
    "full"
  );
  assert.equal(contrast.kind, "text");
  if (contrast.kind !== "text") return;
  // The measured numbers on the page are the ones in docs/facelift-unapproved.md §B1.
  const unapproved = read("docs/facelift-unapproved.md");
  for (const ratio of ["5.47", "3.23", "1.69", "4.5"]) {
    assert.ok(contrast.text.includes(ratio), `the page drops the measured ratio ${ratio}`);
    assert.ok(unapproved.includes(ratio), `${ratio} is not in the recorded measurement table`);
  }
});

/*
 * `min-height: 44px` appearing SOMEWHERE in the stylesheet was the whole of the
 * old check, and the Phase 12 accessibility pass walked straight through it: the
 * navigation links the sentence names measured 41-42.5px in a real browser while
 * this test stayed green, because the 44px rules it found belonged to other
 * controls. The claim is per-rule, so the check is now per-rule.
 */
function ruleBody(css: string, selector: string): string {
  const at = css.indexOf(`${selector} {`);
  assert.notEqual(at, -1, `the rule ${selector} no longer exists`);
  const close = css.indexOf("}", at);
  return css.slice(at, close);
}

test("every navigation rule the /accessibility sentence names declares its own 44px", () => {
  const css = read("app/globals.css");
  const header = read("components/SiteHeader.module.css");
  const data = read("app/watch-your-step/(shell)/data/data.module.css");

  // Header: the two navs and the brand.
  assert.match(ruleBody(css, ".desktop-nav a"), /min-height: 44px/);
  assert.match(ruleBody(header, ".shipNav a"), /min-height: 44px/);
  assert.match(ruleBody(css, ".brand"), /min-height: 44px/);
  assert.match(ruleBody(header, ".menuButton"), /min-height: 44px/);

  // Footer: no min-height (the links are laid out as blocks in a grid), so the
  // padding has to do it, and the arithmetic is asserted rather than commented.
  const footer = ruleBody(css, ".site-footer a");
  const pad = /padding-block:\s*(\d+)px/.exec(footer);
  assert.ok(pad, "the footer link rule no longer sets padding-block");
  const lineBox = 22.5; // 15px / 1.5, measured in the browser at the Phase 12 pass
  assert.ok(
    Number(pad![1]) * 2 + lineBox >= 44,
    `.site-footer a is ${Number(pad![1]) * 2 + lineBox}px tall, and /accessibility says 44`
  );

  // The one course control that is a <summary> rather than a button.
  assert.match(ruleBody(data, ".summary"), /min-height: 44px/);
});

test("/accessibility claims no transcript and no artifact alternative that has not shipped", () => {
  const media = resolveVariant(
    legalCopyRecords.find((record) => record.id === "legal-accessibility-media") as AnyCanonicalText,
    "full"
  );
  assert.equal(media.kind, "text");
  if (media.kind !== "text") return;
  // The bank is empty, so the page states the rule rather than a shipped fact.
  assert.ok(read("content/watch-your-step/artifacts.ts").includes("wysFictionalArtifacts = [] as const"));
  assert.ok(media.text.includes("has shipped on this site yet"));
});

/* -------------------------------------------------------------------------- */
/* 5. The documents Phase 11 owes                                             */
/* -------------------------------------------------------------------------- */

test("docs/legal-analytics.md describes the second event source", () => {
  const doc = read("docs/legal-analytics.md");
  assert.ok(doc.includes("lib/wys/telemetry.ts"), "the added event source is undocumented");
  assert.ok(doc.includes(WYS_STORAGE_KEY), "the local key is undocumented");
  assert.ok(doc.includes("bct_analytics_consent"), "the consent key is undocumented");
  for (const name of WYS_EVENT_NAMES) {
    assert.ok(doc.includes(name), `docs/legal-analytics.md omits the event ${name}`);
  }
});

test("README.md describes the site the branch actually ships", () => {
  const readme = read("README.md");
  assert.equal(
    readme.includes("the routing foyer for the Ben Chan Tech LLC ecosystem."),
    false,
    "README:3 still describes the site as a routing foyer only (plan §3.2)"
  );
  assert.ok(readme.includes("Watch Your Step"), "the course is undocumented");
  assert.ok(readme.includes("scripts/check-no-deletions.sh"), "the deletion gate is undocumented");
  assert.ok(readme.includes("PORT=3999 npm run build"), "the build loop is undocumented");
  // The analytics section is preserved: it is still accurate and it is the one
  // place the measurement id is written down.
  assert.ok(readme.includes("G-25PDJ8VRNT"));
});

test("Ben has a written diff of every final-copy change", () => {
  const diff = read("docs/facelift-copy-diff.md");
  for (const page of REFRESHED_PAGES) {
    assert.ok(diff.includes(page.route), `the copy diff omits ${page.route}`);
  }
  for (const record of legalCopyRecords) {
    assert.ok(diff.includes(record.id), `the copy diff omits the new record ${record.id}`);
  }
  assert.ok(diff.includes("server-side personalized user memory"));
  assert.ok(diff.includes("server-side persistent user memory"));
});
