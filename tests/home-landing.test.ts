import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AI_NATIVE_COMPANY } from "@/content/ai-native-company";

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
  assert.ok(AI_NATIVE_COMPANY.costRule.body.includes("only required AI operating expense"));
});

test("the homepage preserves the load-bearing public evidence destinations", () => {
  for (const destination of REQUIRED_HOME_DESTINATIONS) {
    assert.ok(homePage.includes(destination), `home no longer exposes ${destination}`);
  }
});

test("Developer Forward is preserved as evidence and Lite remains directly reachable", () => {
  assert.ok(AI_NATIVE_COMPANY.developerForward.body.includes("discontinued"));
  assert.ok(AI_NATIVE_COMPANY.developerForward.body.includes("Developer Forward Lite remains available"));
  assert.ok(homePage.includes('href="/developer-forward"'));
  assert.ok(homePage.includes('href="/developer-forward-lite"'));
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
