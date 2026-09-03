import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Preserved-surface fixture (plan Phase 0, user constraint 2).
 *
 * Every live surface survives at its URL with its copy, links and behaviour.
 * This file is the executed form of that promise: routes, redirects, outbound
 * hrefs and the in-page anchor targets the home page depends on.
 *
 * Assertions are corpus-wide on purpose. A link may legitimately MOVE between
 * files in a later phase (the header is rebuilt in Phase 5); it may never
 * disappear. Pinning each href to one file would fail on a lawful move and
 * teach the next phase to weaken the test.
 */

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Directories whose source is scanned for links, anchors and ids. */
const sourceDirs = ["app", "components", "content", "lib"];
const sourceExtensions = new Set([".ts", ".tsx", ".css", ".mjs", ".js"]);
const skipDirs = new Set(["node_modules", ".next", ".git"]);

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (skipDirs.has(entry)) continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (sourceExtensions.has(path.extname(entry))) out.push(full);
  }
  return out;
}

function readRepoFile(relativePath: string): string {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

const sourceFiles = [
  ...sourceDirs.flatMap((dir) => walk(path.join(repoRoot, dir))),
  path.join(repoRoot, "next.config.ts")
];

/** Every scanned source file, concatenated, with its path kept for messages. */
const corpus = sourceFiles.map((file) => readFileSync(file, "utf8")).join("\n\n");

function occurrences(haystack: string, needle: string): number {
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    count += 1;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}

/* -------------------------------------------------------------------------- */
/* Routes                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The 11 page.tsx routes that exist today (plan §3.1 normalised counts:
 * app/page.tsx plus 10 route directories). This list is a floor, never a cap —
 * new routes are added by later phases and must not be listed here.
 */
const preservedRoutes: { url: string; file: string }[] = [
  { url: "/", file: "app/page.tsx" },
  { url: "/studio", file: "app/studio/page.tsx" },
  { url: "/neon", file: "app/neon/page.tsx" },
  { url: "/system", file: "app/system/page.tsx" },
  { url: "/contact", file: "app/contact/page.tsx" },
  { url: "/privacy", file: "app/privacy/page.tsx" },
  { url: "/terms", file: "app/terms/page.tsx" },
  { url: "/cookies", file: "app/cookies/page.tsx" },
  { url: "/copyright", file: "app/copyright/page.tsx" },
  { url: "/accessibility", file: "app/accessibility/page.tsx" },
  { url: "/ai-disclosure", file: "app/ai-disclosure/page.tsx" }
];

test("every preserved route still has a page file at its URL", () => {
  for (const route of preservedRoutes) {
    assert.ok(
      existsSync(path.join(repoRoot, route.file)),
      `route ${route.url} lost its page file ${route.file}`
    );
  }
  assert.equal(preservedRoutes.length, 11, "plan §3.1 normalised count: 11 page.tsx routes");
});

test("the 7 footer legal links and the 6 refreshed legal pages are not confused", () => {
  // /contact is a footer legal link but NOT one of the six refreshed pages
  // (plan §3.1) and must never be counted twice.
  const footerLegalLinks = [
    "/privacy",
    "/terms",
    "/cookies",
    "/accessibility",
    "/ai-disclosure",
    "/copyright",
    "/contact"
  ];
  const refreshedLegalPages = footerLegalLinks.filter((href) => href !== "/contact");
  assert.equal(footerLegalLinks.length, 7);
  assert.equal(refreshedLegalPages.length, 6);

  const footerSource = readRepoFile("components/SiteFooter.tsx");
  for (const href of footerLegalLinks) {
    assert.ok(
      footerSource.includes(`"${href}"`),
      `footer legal link ${href} is missing from components/SiteFooter.tsx`
    );
  }
  assert.ok(
    footerSource.includes('aria-label="Legal and company information"'),
    "the legal nav aria-label is preserved copy"
  );
});

/* -------------------------------------------------------------------------- */
/* Redirects                                                                  */
/* -------------------------------------------------------------------------- */

test("all three redirects survive in next.config.ts", () => {
  const config = readRepoFile("next.config.ts");
  const redirects = [
    { source: "/lab", destination: "/neon" },
    { source: "/about", destination: "/system" },
    { source: "/posts", destination: "https://benchanviolin.substack.com" }
  ];
  for (const redirect of redirects) {
    assert.ok(
      config.includes(`source: "${redirect.source}"`),
      `redirect source ${redirect.source} was dropped from next.config.ts`
    );
    assert.ok(
      config.includes(`destination: "${redirect.destination}"`),
      `redirect destination ${redirect.destination} was dropped from next.config.ts`
    );
  }
  assert.equal(occurrences(config, "source:"), 3, "exactly three redirects exist today");
});

/* -------------------------------------------------------------------------- */
/* Outbound hrefs                                                             */
/* -------------------------------------------------------------------------- */

/**
 * The two yymethod.com hrefs are asserted SEPARATELY and with their closing
 * quote. A bare `yymethod.com` substring check would pass while one of them was
 * silently dropped (plan §3.3), which is the exact regression this guards.
 */
test("both distinct yymethod.com hrefs survive, asserted separately", () => {
  assert.ok(
    corpus.includes('"https://yymethod.com/doctrine"'),
    'destinations[0].url "https://yymethod.com/doctrine" (the footer doctrine door) was dropped'
  );
  assert.ok(
    corpus.includes('"https://yymethod.com"'),
    'the bare header href "https://yymethod.com" (label "YY Method™") was dropped'
  );
});

test("every other outbound href survives", () => {
  const outboundHrefs = [
    '"https://benchanviolin.com/library"',
    '"https://yyandme.benchantech.com"',
    '"https://benchanviolin.substack.com"',
    '"https://benchanviolin.com/violin-for-parents"',
    '"mailto:ben@benchantech.com"'
  ];
  for (const href of outboundHrefs) {
    assert.ok(corpus.includes(href), `outbound href ${href} was dropped from the site`);
  }
});

test("the /neon callout and the site-config door both keep the library link", () => {
  // The same URL is reachable from two independent surfaces; losing either is a
  // dropped link even though a corpus-wide substring check would still pass.
  assert.ok(readRepoFile("app/neon/page.tsx").includes("https://benchanviolin.com/library"));
  assert.ok(readRepoFile("content/site-config.ts").includes("https://benchanviolin.com/library"));
});

test("the /studio CTA keeps its target and rel attributes", () => {
  const studio = readRepoFile("app/studio/page.tsx");
  assert.ok(studio.includes('target="_blank"'));
  assert.ok(studio.includes('rel="noopener"'));
});

/* -------------------------------------------------------------------------- */
/* In-page anchor targets                                                     */
/* -------------------------------------------------------------------------- */

/**
 * An anchor that stops resolving breaks a live control just as surely as a
 * dropped href, and nothing else in the suite would notice (plan Phase 0).
 */
const anchorIds = ["main", "router", "router-heading", "destinations-heading", "stakeholder-heading"];

test("every in-page anchor target id still exists", () => {
  for (const id of anchorIds) {
    assert.ok(corpus.includes(`id="${id}"`), `anchor target id="${id}" no longer exists`);
  }
});

test("every in-page anchor reference still points at a live target", () => {
  assert.ok(corpus.includes('href="#main"'), "the skip link lost its #main target");
  assert.ok(
    occurrences(corpus, 'href="#router"') >= 2,
    'both audience buttons ("I’m human" / "I’m AI") keep their live href="#router"'
  );
  for (const id of ["router-heading", "destinations-heading", "stakeholder-heading"]) {
    assert.ok(
      corpus.includes(`aria-labelledby="${id}"`),
      `the section labelled by ${id} lost its aria-labelledby reference`
    );
  }
});

test("the sr-only destinations heading copy is preserved", () => {
  assert.ok(readRepoFile("app/page.tsx").includes("The ecosystem has four stable doors."));
});

/* -------------------------------------------------------------------------- */
/* Deletion contract                                                          */
/* -------------------------------------------------------------------------- */

test("scripts/check-no-deletions.sh exits 0 (nothing deleted or renamed)", () => {
  // The gate is removed or renamed files, never a line count, and never
  // `git diff --stat`, which cannot detect a deletion (plan §3.0).
  const output = execFileSync("sh", [path.join(repoRoot, "scripts", "check-no-deletions.sh")], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  assert.match(output, /Deletion contract OK/);
});
