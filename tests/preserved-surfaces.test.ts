import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DEVELOPER_FORWARD_LITE_CURRENT_STATUS } from "@/content/developer-forward/current-status";
import { AI_NATIVE_COMPANY, EVIDENCE_LINKS } from "@/content/ai-native-company";
import { canonicalSurfacePaths } from "@/content/canonical-surfaces";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative: string): string => readFileSync(path.join(repoRoot, relative), "utf8");

/**
 * Preservation after ADR 0010.
 *
 * The old version froze the 2026-09-04 homepage composition and former Studio
 * destination. ADR 0010 intentionally changes both while preserving the
 * load-bearing URLs, evidence, legal surfaces, ecosystem links, machine
 * surfaces, and reversible historical source.
 */
const REQUIRED_PAGE_FILES = [
  "app/page.tsx",
  "app/developer-forward/page.tsx",
  "app/developer-forward-lite/page.tsx",
  "app/studio/page.tsx",
  "app/neon/page.tsx",
  "app/system/page.tsx",
  "app/contact/page.tsx",
  "app/privacy/page.tsx",
  "app/terms/page.tsx",
  "app/cookies/page.tsx",
  "app/copyright/page.tsx",
  "app/accessibility/page.tsx",
  "app/ai-disclosure/page.tsx",
  "app/bridge/page.tsx",
  "app/standing-orders/page.tsx",
  "app/ships-log/page.tsx",
  "app/crew/page.tsx",
  "app/ben/page.tsx"
] as const;

test("load-bearing and harmless historical page source remains on disk", () => {
  for (const file of REQUIRED_PAGE_FILES) {
    assert.ok(existsSync(path.join(repoRoot, file)), `${file} was removed`);
  }
});

test("the deletion contract still runs", () => {
  const output = execFileSync("sh", [path.join(repoRoot, "scripts", "check-no-deletions.sh")], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  assert.match(output, /Deletion contract OK/);
});

test("current redirects preserve useful entry points without a discontinued Studio offer", () => {
  const config = read("next.config.ts");
  for (const pair of [
    ['source: "/lab"', 'destination: "/neon"'],
    ['source: "/about"', 'destination: "/"'],
    ['source: "/posts"', 'destination: "https://benchanviolin.substack.com"'],
    ['source: "/upwork"', 'destination: "https://www.upwork.com/freelancers/~01a10f284f33009412"'],
    ['source: "/df"', 'destination: "/developer-forward"']
  ] as const) {
    assert.ok(config.includes(pair[0]), `missing redirect source ${pair[0]}`);
    assert.ok(config.includes(pair[1]), `missing redirect destination ${pair[1]}`);
  }
  assert.equal(config.includes("studio.com/benchanviolin/trust-forward"), false);
  assert.equal(config.includes("permanent: true"), false);
});

/*
 * CHECKS THE ROSTER, NOT THE SOURCE TEXT (2026-09-10). This grepped
 * `content/canonical-surfaces.ts` for the literal `path: "/developer-forward"`,
 * which the file has not contained since the entry was built from
 * `developerForwardNav.href` instead of a hard-coded string. The route was in
 * the roster and in the served sitemap the whole time; only the grep was
 * stale. Reading the exported roster asks the question the test means — is this
 * surface canonical — and survives the next refactor of how the row is built.
 */
test("Developer Forward and Lite remain canonical public surfaces", () => {
  const roster = new Set(canonicalSurfacePaths());
  assert.ok(roster.has("/developer-forward"), "/developer-forward left the canonical roster");
  assert.ok(roster.has("/developer-forward-lite"), "/developer-forward-lite left the canonical roster");

  const full = read("app/developer-forward/page.tsx");
  const lite = read("app/developer-forward-lite/page.tsx");
  assert.ok(full.includes('alternates: { canonical: "/developer-forward" }'));
  assert.ok(lite.includes('alternates: { canonical: "/developer-forward-lite" }'));
  assert.ok(full.includes("LANDING_FAQ"), "Developer Forward lost its answer-first FAQ evidence");
});

/*
 * THIS CHECKED TWO PAGE FILES AND MISSED THE SCREEN THE OFFER WAS ACTUALLY ON.
 *
 * It read `app/developer-forward/page.tsx` and `app/developer-forward-lite/
 * page.tsx` — and the Lite route file is four lines that mount `<YYSandbox>`.
 * The coupon lived in the sandbox, so for a day after the pivot a learner who
 * finished five cases was told "You earned your coupon … on Studio", handed a
 * link, and delivered to a page saying there is "no checkout, coupon, waitlist,
 * or upgrade path". Every assertion here passed throughout.
 *
 * A route file is not a surface. The scan now covers every component the run
 * actually renders, and the superseded offer records are asserted unrendered
 * rather than merely unmentioned — they are live-sounding offers one import
 * away from a screen. See docs/adr/0011.
 */
test("the current public Developer Forward path contains no active Studio checkout or coupon", () => {
  // Comments stripped: the stamp explains the removal in prose, and a raw scan
  // would fail a correct file for documenting itself.
  const stamp = read("content/developer-forward/stamp/v1-1-0.ts")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^\s*\/\/.*$/gm, " ");
  assert.equal(stamp.includes("studio.com/benchanviolin"), false);
  assert.equal(stamp.includes("couponTarget"), false, "the coupon route key is back");
  assert.match(DEVELOPER_FORWARD_LITE_CURRENT_STATUS.metadataDescription, /no paid upgrade/i);
  assert.ok(read("app/developer-forward-lite/page.tsx").includes("DEVELOPER_FORWARD_LITE_CURRENT_STATUS"));

  const surfaces: string[] = [];
  const collect = (dir: string) => {
    for (const entry of readdirSync(path.join(repoRoot, dir), { withFileTypes: true })) {
      const next = `${dir}/${entry.name}`;
      if (entry.isDirectory()) collect(next);
      else if (entry.name.endsWith(".tsx")) surfaces.push(next);
    }
  };
  collect("app");
  collect("components");

  const offences: string[] = [];
  for (const file of surfaces) {
    const source = read(file).replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
    // The superseded offer records, and the Studio destination they pointed at.
    for (const banned of [
      "FULL_OFFER",
      "LANDING_INCOMPLETE",
      "LANDING_COMPLETE",
      "DEVELOPER_FORWARD_TEASER",
      "couponTarget",
      "StudioCta",
      "studio.com/benchanviolin"
    ]) {
      if (source.includes(banned)) offences.push(`${file}: ${banned}`);
    }
  }
  assert.deepEqual(
    offences,
    [],
    "a surface renders a superseded paid offer; the current record says there is no checkout, coupon or upgrade path"
  );
});

test("the major ecosystem authority links remain in source", () => {
  const files = [read("content/site-config.ts"), read("content/nav.ts"), read("app/page.tsx"), read("next.config.ts")].join("\n");
  for (const href of [
    "https://yymethod.com",
    "https://yymethod.com/doctrine",
    "https://benchanviolin.com/library",
    "https://yyandme.benchantech.com",
    "https://benchanviolin.substack.com",
    "https://www.upwork.com/freelancers/~01a10f284f33009412"
  ]) {
    assert.ok(files.includes(href), `authority link ${href} was dropped`);
  }
});

test("legal and disclosure routes remain wired into the footer", () => {
  const footer = read("components/SiteFooter.tsx");
  for (const href of ["/privacy", "/terms", "/cookies", "/accessibility", "/ai-disclosure", "/copyright", "/contact"]) {
    assert.ok(footer.includes(href), `footer lost ${href}`);
  }
});

test("machine discovery surfaces remain generated from canonical state", () => {
  const sitemap = read("app/sitemap.ts");
  const robots = read("app/robots.ts");
  const llms = read("lib/llms-txt.ts");
  assert.ok(sitemap.includes("humanCanonicalSurfaces"));
  assert.ok(robots.includes("sitemap"));
  assert.ok(llms.includes("CANONICAL_SURFACE_GROUP_ORDER"));
  assert.ok(llms.includes("AI_NATIVE_COMPANY"));
});

/*
 * CHECKS THE LINKS, NOT THE FILE THEY USED TO BE TYPED IN (2026-09-10). The
 * hrefs moved to `content/ai-native-company.ts` when the home page's copy was
 * brought under the provenance spine, so grepping the renderer reported a loss
 * where there was none — every destination was linked and serving. The
 * requirement is unchanged: these surfaces stay reachable from `/`.
 */
test("the new homepage keeps professional evidence and reviewer routes reachable", () => {
  const home = read("app/page.tsx");
  const linked = new Set([
    ...EVIDENCE_LINKS.map((item) => item.href),
    ...AI_NATIVE_COMPANY.developerForwardLinks.map((item) => item.href)
  ]);
  for (const href of ["/upwork", "/developer-forward", "/developer-forward-lite"]) {
    assert.ok(linked.has(href), `the home page no longer links ${href}`);
  }
  // The reviewer block is still rendered, and still named for its heading.
  assert.ok(home.includes('id="stakeholder-heading"'));
  assert.ok(home.includes("stakeholderRoutes"));
});

test("root metadata keeps the site identity while naming the new experiment", () => {
  const layout = read("app/layout.tsx");
  assert.ok(layout.includes('metadataBase: new URL("https://benchantech.com")'));
  assert.ok(layout.includes('siteName: "BenChanTech"'));
  assert.ok(layout.includes("$20 AI-native company experiment"));
  for (const asset of ["/favicon-16x16.png", "/favicon-32x32.png", "/icon-192.png", "/icon-512.png", "/apple-touch-icon.png"]) {
    assert.ok(layout.includes(asset), `root metadata lost ${asset}`);
  }
});

test("the $20 operating constitution is part of the repository boot path", () => {
  const agents = read("AGENTS.md");
  const bootstrap = read("content/ship/agent-bootstrap.ts");
  assert.ok(agents.includes("company/CONSTITUTION.md"));
  assert.ok(agents.includes("company/CURRENT_STATE.md"));
  assert.ok(agents.includes("$20 AI operating constraint"));
  assert.ok(bootstrap.includes("company/CONSTITUTION.md"));
  assert.ok(bootstrap.includes("$20 AI operating constraint"));
});
