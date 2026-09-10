import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AI_NATIVE_COMPANY, EVIDENCE_LINKS } from "@/content/ai-native-company";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative: string): string => readFileSync(path.join(repoRoot, relative), "utf8");
const homePage = read("app/page.tsx");
const layout = read("app/layout.tsx");

const REQUIRED_HOME_DESTINATIONS = [
  "/developer-forward",
  "/developer-forward-lite",
  "/neon",
  "https://yymethod.com",
  "https://yyandme.benchantech.com",
  "https://benchanviolin.substack.com"
] as const;

test("the homepage is driven by the canonical AI-native company content record", () => {
  assert.ok(homePage.includes('from "@/content/ai-native-company"'));
  assert.ok(homePage.includes("AI_NATIVE_COMPANY"));
  assert.ok(AI_NATIVE_COMPANY.heading.includes("$20"));
  /*
   * THE CLAIM, WHEREVER THE RECORD MAKES IT (2026-09-10). This named
   * `costRule.body`, which does not contain the phrase and never did — the
   * "only required AI operating expense" sentence is in the `lede`, and
   * `costRule.body` says the same thing in its own words ("one ChatGPT Plus
   * subscription", "none may become required infrastructure"). The test was
   * asserting a location rather than the claim, so it failed while the claim
   * was being made correctly two fields away.
   */
  assert.ok(
    AI_NATIVE_COMPANY.lede.includes("only required AI operating expense"),
    "the home page no longer states the one-required-expense claim"
  );
  assert.ok(
    AI_NATIVE_COMPANY.costRule.body.includes("one ChatGPT Plus subscription"),
    "the cost rule no longer names the single subscription it is a rule about"
  );
});

/*
 * THESE TWO NOW CHECK THE CONTENT, NOT THE FILE THE COPY HAPPENED TO SIT IN.
 *
 * Both read `app/page.tsx` as text and asserted the destinations appeared in
 * it. That was true while the links were typed into the renderer, and the
 * requirement it encodes — the home page still exposes these six surfaces — is
 * unchanged. What changed on 2026-09-10 is that the links moved to
 * `content/ai-native-company.ts` with the rest of that page's copy, so a check
 * that greps the renderer now reports a loss where there is none.
 *
 * The destination register is the thing worth keeping, so it is applied to the
 * arrays the page renders, plus an assertion that the page actually renders
 * them. A guard that names a LOCATION goes stale every time content moves; one
 * that names a PROPERTY does not.
 */
test("the homepage preserves the load-bearing public evidence destinations", () => {
  const shipped = new Set([
    ...EVIDENCE_LINKS.map((item) => item.href),
    ...AI_NATIVE_COMPANY.developerForwardLinks.map((item) => item.href)
  ]);
  for (const destination of REQUIRED_HOME_DESTINATIONS) {
    assert.ok(shipped.has(destination), `home no longer exposes ${destination}`);
  }
  // …and the page renders the arrays, so a destination cannot survive in the
  // content while quietly leaving the screen.
  assert.ok(homePage.includes("EVIDENCE_LINKS"), "the home page no longer renders the evidence links");
  assert.ok(
    homePage.includes("developerForwardLinks"),
    "the home page no longer renders the Developer Forward links"
  );
});

test("Developer Forward is preserved as evidence and Lite remains directly reachable", () => {
  assert.ok(AI_NATIVE_COMPANY.developerForward.body.includes("discontinued"));
  assert.ok(AI_NATIVE_COMPANY.developerForward.body.includes("Developer Forward Lite remains available"));
  const hrefs = AI_NATIVE_COMPANY.developerForwardLinks.map((item) => item.href);
  assert.ok(hrefs.includes("/developer-forward"), "Developer Forward is no longer linked from the home page");
  assert.ok(hrefs.includes("/developer-forward-lite"), "Lite is no longer directly reachable from the home page");
});

test("the company experiment names evidence and intervention measures", () => {
  assert.ok(AI_NATIVE_COMPANY.experiment.measures.length >= 4);
  assert.ok(AI_NATIVE_COMPANY.experiment.measures.some((item) => item.includes("Captain minutes")));
  assert.ok(AI_NATIVE_COMPANY.experiment.measures.some((item) => item.includes("traceable to real evidence")));
});

test("the root metadata describes the AI-native company experiment", () => {
  assert.ok(layout.includes("$20 AI-native company experiment"));
  assert.ok(layout.includes("only required AI operating expense"));
  assert.ok(layout.includes('metadataBase: new URL("https://benchantech.com")'));
});
