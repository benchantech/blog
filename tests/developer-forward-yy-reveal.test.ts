import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { case1 } from "@/content/developer-forward/yy/case-1";
import { isRevealUnlocked } from "@/lib/developer-forward/yy/records";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const yyDir = path.join(repoRoot, "components", "developer-forward", "yy");

const checkpoint = case1.checkpoints[0];
const committed = {
  caseId: checkpoint.caseId,
  checkpointId: checkpoint.id,
  runId: "run_test",
  capture: { canonicalSituationId: checkpoint.id },
  why: { choiceId: checkpoint.choices[0].id },
  whyNot: { closestAlternativeChoiceId: checkpoint.choices[1].id },
  commit: { committedAtLocal: "2026-09-08T10:00:00-04:00" },
  timestamp: { benThenChoiceId: checkpoint.choices[2].id }
};

test("isRevealUnlocked accepts a committed record and refuses near-misses", () => {
  assert.equal(isRevealUnlocked(committed), true);
  const refusals: unknown[] = [
    null,
    undefined,
    "committed",
    [],
    { ...committed, commit: undefined },
    { ...committed, commit: { committedAtLocal: "   " } },
    { ...committed, why: undefined },
    { ...committed, whyNot: undefined },
    { ...committed, whyNot: { closestAlternativeChoiceId: committed.why.choiceId } },
    { ...committed, runId: "" },
    { ...committed, checkpointId: "" }
  ];
  for (const record of refusals) assert.equal(isRevealUnlocked(record as never), false);
});

function componentFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (full.endsWith(".tsx")) out.push(full);
    }
  };
  walk(yyDir);
  return out;
}

test("no component outside the reveal reads Ben's judgment", () => {
  const allowed = new Set(["RevealPanel.tsx"]);
  const offenders: string[] = [];
  for (const file of componentFiles()) {
    const name = path.basename(file);
    if (allowed.has(name)) continue;
    const code = readFileSync(file, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/^\s*\/\/.*$/gm, " ");
    for (const field of ["benThen", "benNow", ".conditions"]) {
      if (code.includes(field)) offenders.push(`${name}: reads ${field}`);
    }
  }
  assert.deepEqual(offenders, []);
});

test("the reveal is mounted conditionally, never hidden with CSS", () => {
  const sandbox = readFileSync(path.join(yyDir, "YYSandbox.tsx"), "utf8");
  const code = sandbox.replace(/\/\*[\s\S]*?\*\//g, " ");
  const mounts = [...code.matchAll(/<RevealPanel[\s\S]*?\/>/g)];
  assert.equal(mounts.length, 1);
  assert.ok(/\{\s*committed[A-Za-z]*\s*\?/.test(sandbox));
  assert.ok(mounts[0][0].includes("runId="));

  const panelRaw = readFileSync(path.join(yyDir, "RevealPanel.tsx"), "utf8");
  const panel = panelRaw.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
  assert.ok(panelRaw.includes("isRevealUnlocked"));
  assert.ok(panelRaw.includes("record.runId !== runId"));
  for (const hide of ["display: none", "visibility: hidden", "aria-hidden"]) {
    assert.equal(panel.includes(hide), false);
  }
});

test("a new step scrolls to the top once and inherits reduced-motion behavior", () => {
  const raw = readFileSync(path.join(yyDir, "YYSandbox.tsx"), "utf8");
  const code = raw.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
  const calls = [...code.matchAll(/window\.scrollTo\(([^)]*)\)/g)];
  assert.equal(calls.length, 1);
  assert.equal(/behavior/.test(calls[0][1]), false);
  assert.ok(code.includes("scrolledFromRef.current"));
  assert.ok(code.includes("previous === null"));
});

test("the current public Lite route does not expose a paid upgrade or coupon", () => {
  const page = readFileSync(path.join(repoRoot, "app", "developer-forward-lite", "page.tsx"), "utf8");
  const stamp = readFileSync(path.join(repoRoot, "content", "developer-forward", "stamp", "v1-1-0.ts"), "utf8");
  assert.ok(page.includes("no paid upgrade is currently offered"));
  assert.ok(page.includes('[class*="coupon"]'));
  assert.ok(stamp.includes('fullTarget: "/developer-forward"'));
  assert.ok(stamp.includes('couponTarget: "/developer-forward"'));
  assert.equal(stamp.includes("studio.com/benchanviolin"), false);
});
