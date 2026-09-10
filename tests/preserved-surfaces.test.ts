import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative: string): string => readFileSync(path.join(repoRoot, relative), "utf8");

/**
 * Preservation after ADR 0010.
 *
 * The old version of this test froze the 2026-09-04 homepage composition and
 * the former Studio destination. ADR 0010 intentionally changes both while
 * keeping the load-bearing URLs, evidence, legal surfaces, ecosystem links,
 * machine surfaces, and reversible historical source intact. This test guards
 * that current preservation boundary rather than forcing the retired homepage
 * to remain the product architecture forever.
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

test("Developer Forward and Lite remain canonical public surfaces", () => {
  const canonical = read("content/canonical-surfaces.ts");
  assert.ok(canonical.includes('path: "/developer-forward"'));
  assert.ok(canonical.includes('path: "/developer-forward-lite"'));

  const full = read("app/developer-forward/page.tsx");
  const lite = read("app/developer-forward-lite/page.tsx");
  assert.ok(full.includes('alternates: { canonical: "/developer-forward" }'));
  assert.ok(lite.includes('alternates: { canonical: "/developer-forward-lite" }'));
  assert.ok(full.includes("LANDING_FAQ"), "Developer Forward lost its answer-first FAQ evidence");
});

test("the current public Developer Forward path contains no active Studio checkout or coupon", () => {
  const full = read("app/developer-forward/page.tsx");
  const lite = read("app/developer-forward-lite/page.tsx");
  const stamp = read("content/developer-forward/stamp/v1-1-0.ts");
  assert.equal(full.includes("StudioCta"), false);
  assert.equal(full.includes("couponTarget"), false);
  assert.ok(lite.includes("no paid upgrade is currently offered"));
  assert.equal(stamp.includes("studio.com/benchanviolin"), false);
});

test("the major ecosystem authority links remain in source", () => {
  const files = [
    read("content/site-config.ts"),
    read("content/nav.ts"),
    read("app/page.tsx"),
    read("next.config.ts")
  ].join("\n");
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

test("the new homepage keeps professional evidence and reviewer routes reachable", () => {
  const home = read("app/page.tsx");
  assert.ok(home.includes('href="/upwork"'));
  assert.ok(home.includes('href="/developer-forward"'));
  assert.ok(home.includes('href="/developer-forward-lite"'));
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
