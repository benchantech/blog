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

/**
 * Strip comments before counting a code-level occurrence.
 *
 * The landmark assertions below count how many elements carry an accessible
 * name. A doc comment that QUOTES the name is not an element, and the header
 * documents its own preservation rule in prose — so counting the raw file
 * conflates documentation with markup and fails on a correct component.
 */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

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

test("preserved redirects and launch redirects survive in next.config.ts", () => {
  const config = readRepoFile("next.config.ts");
  const redirects = [
    { source: "/lab", destination: "/neon" },
    { source: "/about", destination: "/system" },
    { source: "/posts", destination: "https://benchanviolin.substack.com" },
    { source: "/upwork", destination: "https://www.upwork.com/freelancers/~01a10f284f33009412" },
    /*
     * RETIRED, NOT REMOVED. Ben's 2026-09-07 ruling takes Watch Your Step out
     * of navigation and public discovery and points its old entry routes at the
     * homepage. The destination therefore changes from `/watch-your-step` to
     * `/` — a deliberate edit, not a dropped redirect — and both the specific
     * route and the wildcard are asserted so neither can quietly disappear.
     *
     * `permanent: false` on both is asserted separately below: it is what keeps
     * the retirement reversible.
     */
    { source: "/watch-your-step", destination: "/" },
    { source: "/watch-your-step/:path+", destination: "/" },
    /* The Trust Forward bridge. One line to change when Studio moves. */
    { source: "/tf", destination: "https://studio.com/benchanviolin/trust-forward" }
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
  assert.equal(occurrences(config, "source:"), redirects.length, "redirect count changed without test coverage");
  // No redirect this build adds may be permanent: a 308 is cached indefinitely
  // and would make the Watch Your Step retirement irreversible in the wild.
  assert.equal(occurrences(config, "permanent: true"), 0, "a permanent redirect was introduced");
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

/* -------------------------------------------------------------------------- */
/* New links mounted in Phase 5 — the other half of the promise               */
/* -------------------------------------------------------------------------- */

/**
 * Nothing may be dropped, AND nothing new may ship dead.
 *
 * Phase 5 mounts a header carrying two nav inventories, a footer carrying four
 * link groups, and a disclosure strip on every page footer. Every internal
 * destination among them has to resolve to a real page file, which is why the
 * phase stubs seven routes rather than five: the six nav items and the CTA
 * point at destinations Phases 7 and 9 do not create until later.
 */

/** Every URL the app directory actually serves, with route groups stripped. */
function servedUrls(): Set<string> {
  const urls = new Set<string>();
  const appDir = path.join(repoRoot, "app");

  function visit(dir: string, segments: string[]): void {
    for (const entry of readdirSync(dir)) {
      if (skipDirs.has(entry)) continue;
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) {
        // `(shell)` and `(flow)` are route GROUPS: they organise layouts and do
        // not appear in the URL (plan §5.4).
        visit(full, entry.startsWith("(") && entry.endsWith(")") ? segments : [...segments, entry]);
      } else if (entry === "page.tsx") {
        urls.add(`/${segments.join("/")}`.replace(/\/+$/, "") || "/");
      }
    }
  }

  visit(appDir, []);
  return urls;
}

/** Internal hrefs written in the chrome, wherever they are declared. */
function chromeInternalHrefs(): { href: string; file: string }[] {
  const files = [
    "content/nav.ts",
    "components/SiteHeader.tsx",
    "components/SiteFooter.tsx",
    "components/DisclosureStrip.tsx",
    "lib/approval-state.ts"
  ];
  const found: { href: string; file: string }[] = [];
  for (const file of files) {
    for (const match of readRepoFile(file).matchAll(/"(\/[A-Za-z0-9/-]*)"/g)) {
      found.push({ href: match[1], file });
    }
  }
  return found;
}

test("the route-group structure serves /watch-your-step and /watch-your-step/start", () => {
  // Proving §5.4's (shell)/(flow) split before Phase 7 depends on it. Route
  // groups do not affect URLs.
  const urls = servedUrls();
  assert.ok(urls.has("/watch-your-step"), "the (shell) landing does not serve /watch-your-step");
  assert.ok(urls.has("/watch-your-step/start"), "the (flow) Lesson Zero does not serve /watch-your-step/start");
  assert.ok(
    existsSync(path.join(repoRoot, "app", "watch-your-step", "(shell)", "layout.tsx")),
    "the (shell) layout — where Phase 7 hangs the bottom nav — is missing"
  );
  assert.ok(
    existsSync(path.join(repoRoot, "app", "watch-your-step", "(flow)", "layout.tsx")),
    "the (flow) layout — no bottom nav, 60px bottom padding — is missing"
  );
});

test("the seven routes stubbed in Phase 5 all exist", () => {
  const urls = servedUrls();
  for (const url of [
    "/bridge",
    "/standing-orders",
    "/ships-log",
    "/crew",
    "/ben",
    "/watch-your-step",
    "/watch-your-step/start"
  ]) {
    assert.ok(urls.has(url), `nav destination ${url} has no page file — it would ship dead`);
  }
});

test("every course tab URL has a page file behind it", () => {
  // Phase 7 shipped the five-tab bottom nav and Phase 8 landed the last screen
  // behind it. The bar is persistent chrome on six routes, so a missing page
  // here is a 404 reachable from every course screen — the "nothing new ships
  // dead" half of the deletion contract, applied to course-internal navigation.
  const urls = servedUrls();
  for (const url of [
    "/watch-your-step/today",
    "/watch-your-step/plan",
    "/watch-your-step/progress",
    "/watch-your-step/practice",
    "/watch-your-step/data"
  ]) {
    assert.ok(urls.has(url), `course tab ${url} has no page file — it would ship dead`);
  }
});

test("no internal href written in the chrome is dead", () => {
  const urls = servedUrls();
  const dead: string[] = [];
  for (const { href, file } of chromeInternalHrefs()) {
    if (!urls.has(href)) dead.push(`${file}: ${href}`);
  }
  assert.deepEqual(dead, [], "chrome links with no page file behind them");
});

test("both nav inventories survive in the header", () => {
  // §3.3: the six approved ship links and the CTA are ADDED; the three links
  // the live header carries today are KEPT. R7 forbids trading one for the
  // other, so both must be present.
  const nav = readRepoFile("content/nav.ts");
  for (const label of [
    "Watch Your Step",
    "Bridge",
    "Standing Orders",
    "Ship's Log",
    "Crew",
    "Ben",
    "Start Lesson Zero",
    "Violin for Parents",
    "Neon",
    "YY Method™"
  ]) {
    assert.ok(nav.includes(`"${label}"`), `nav label "${label}" is missing from content/nav.ts`);
  }
  const header = readRepoFile("components/SiteHeader.tsx");
  assert.ok(header.includes('className="brand"'), "the preserved brand link was dropped from the header");
  assert.ok(header.includes('alt=""'), "the <img aria-hidden> + adjacent-text pairing was broken");
  assert.ok(header.includes("BenChanTech"), "the wordmark changed (Q8: it stays BenChanTech)");
  // The preserved accessible name stays on the PRESERVED element. Asserting the
  // string alone would pass while the label was moved onto the new ship tier and
  // the live three-link row was renamed — a rename of a shipped landmark, which
  // the deletion contract forbids just as much as dropping it. The new tier gets
  // a NEW name (R7, R9: add the new, keep the old).
  assert.ok(
    header.includes('className={cx("desktop-nav", styles.ecosystemNav)} aria-label="Primary navigation"'),
    'aria-label="Primary navigation" must stay on the preserved .desktop-nav element'
  );
  assert.ok(header.includes('className={cx("desktop-nav"'), "the preserved .desktop-nav class was dropped");
  assert.equal(
    occurrences(stripComments(header), 'aria-label="Primary navigation"'),
    1,
    "exactly one landmark carries the preserved name"
  );
  for (const label of ["Ship navigation", "Mobile navigation"]) {
    assert.ok(header.includes(`aria-label="${label}"`), `the new header landmark "${label}" is unnamed`);
  }
});

test("the footer is a complete mobile path to every header link", () => {
  // The gap this closes is real: `.desktop-nav` is display:none below 700px
  // with no replacement today, so /studio, /neon and yymethod.com are
  // unreachable from mobile chrome. This assertion holds however Q9 resolves.
  const footer = readRepoFile("components/SiteFooter.tsx");
  /*
   * `publicShipNav` / `publicLessonZeroCta`, not the raw inventories.
   *
   * `content/nav.ts` keeps `shipNav` and `lessonZeroCta` as the full inventory
   * — the labels are the course's names and deleting one loses that name — and
   * exposes filtered views that drop Watch Your Step while `WYS_NAV_RETIRED` is
   * true. The chrome must render the FILTERED views, or it advertises routes
   * that redirect to `/`.
   *
   * This assertion named the raw inventories, so it passed for the whole period
   * in which the flag existed and nothing read it. The requirement it encodes —
   * every header link is reachable from the footer on mobile — is unchanged.
   */
  for (const inventory of ["publicShipNav", "publicLessonZeroCta", "footerDoors", "ecosystemNav"]) {
    assert.ok(footer.includes(inventory), `the footer does not render ${inventory}`);
  }
  assert.ok(footer.includes("stampLabel()"), "the footer stamp line is not bound to approvalState");
});

test("the disclosure strip is mounted on every page and reads its sentence from state", () => {
  const layout = readRepoFile("app/layout.tsx");
  assert.ok(layout.includes("<DisclosureStrip />"), "the strip is not mounted in the root layout");

  const strip = readRepoFile("components/DisclosureStrip.tsx");
  assert.ok(strip.includes("disclosureApprovalLine()"), "the strip's fourth sentence is not read from state");
  assert.ok(strip.includes('claimById("zero-ai")') || strip.includes('inlineClaim("zero-ai")'));
  assert.ok(strip.includes('inlineClaim("ai-assisted-ben-approved")'));
  // The approval sentence is a variant of approval STATE, never a literal in a
  // component (§6.6, R8). tests/governance-strings.test.ts bans the literal
  // from app/ and components/; this asserts the positive form.
  assert.equal(/approved by ben/i.test(strip), false, "the strip hardcodes the approval sentence");
  assert.ok(strip.includes('href="/crew"'), 'the strip\'s "Crew Manifest →" target was dropped');
});

test("every root metadata value survives verbatim", () => {
  const layout = readRepoFile("app/layout.tsx");
  for (const value of [
    'title: "BenChanTech"',
    'metadataBase: new URL("https://benchantech.com")',
    'url: "https://benchantech.com"',
    'siteName: "BenChanTech"',
    'type: "website"',
    '{ url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" }',
    '{ url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }',
    '{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }',
    '{ url: "/icon-512.png", sizes: "512x512", type: "image/png" }',
    'apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]'
  ]) {
    assert.ok(layout.includes(value), `root metadata lost ${value}`);
  }
  assert.ok(
    layout.includes("Ben Chan's systems work across AI, software, violin, and human judgment"),
    "the root description changed"
  );
  assert.ok(
    layout.includes("AI systems, software infrastructure, violin-informed product design"),
    "the OpenGraph description changed"
  );
});

test("every new route declares a title and a canonical URL", () => {
  // §5.2: title only, matching "X - BenChanTech"; plus alternates.canonical so
  // §5.1's one-canonical-node rule is visible to crawlers, not only to a test.
  // The four preserved pages that export no metadata at all stay that way.
  const newRoutes = [
    "app/bridge/page.tsx",
    "app/standing-orders/page.tsx",
    "app/ships-log/page.tsx",
    "app/crew/page.tsx",
    "app/ben/page.tsx",
    "app/watch-your-step/(shell)/page.tsx",
    "app/watch-your-step/(flow)/start/page.tsx"
  ];
  for (const file of newRoutes) {
    const source = readRepoFile(file);
    assert.match(source, /title: "[^"]+ - BenChanTech"/, `${file} breaks the title convention`);
    assert.match(source, /alternates: \{ canonical: "\/[^"]*" \}/, `${file} declares no canonical URL`);
    assert.equal(/description:/.test(source), false, `${file} adds a description — that is a new convention`);
  }
});

test("the three new NEW-surface convention files exist and are client components where required", () => {
  const notFound = readRepoFile("app/not-found.tsx");
  const error = readRepoFile("app/error.tsx");
  const globalError = readRepoFile("app/global-error.tsx");
  assert.ok(notFound.includes("StatusPage"));
  assert.ok(error.startsWith('"use client"'), "app/error.tsx must be a client component");
  assert.ok(globalError.startsWith('"use client"'), "app/global-error.tsx must be a client component");
  // global-error replaces the root layout, so it renders its own document.
  assert.ok(globalError.includes("<html"), "app/global-error.tsx must render its own <html>");
  assert.ok(globalError.includes("<body"), "app/global-error.tsx must render its own <body>");
});
