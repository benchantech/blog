import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { case1 } from "@/content/developer-forward/yy/case-1";
import { DEVELOPER_FORWARD_LITE_CURRENT_STATUS } from "@/content/developer-forward/current-status";
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
  assert.ok(page.includes("DEVELOPER_FORWARD_LITE_CURRENT_STATUS"));
  assert.match(DEVELOPER_FORWARD_LITE_CURRENT_STATUS.metadataDescription, /no paid upgrade/i);
  /*
   * THIS REQUIRED THE HIDE, AND THE HIDE WAS THE BUG (2026-09-10).
   *
   * It asserted the Lite page carried `[class*="coupon"] { display: none }` and
   * that the stamp still held a `couponTarget`. Together those encoded the
   * offer as PRESENT-BUT-INVISIBLE — shipped in the bundle, hidden by a
   * substring selector, and pointed at `/developer-forward`, a page that says
   * there is no coupon. The same file forbids exactly this for `RevealPanel`:
   * a rendered-then-hidden block is still in the served HTML.
   *
   * The offer is gone at the source now, so the check is absence rather than
   * concealment: no coupon route key, no hiding rule, and nothing on the
   * completion screen that promises an upgrade.
   */
  /*
   * COMMENTS STRIPPED FIRST. The stamp's own note explains that `couponTarget`
   * was removed and why — and a raw scan fires on that sentence, failing a
   * correct file for documenting itself. The same trap is recorded a few tests
   * below, where `RevealPanel` had to be stripped before scanning for hiding
   * techniques it says in prose that it does not use.
   */
  const stampCode = stamp.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
  assert.ok(stampCode.includes('fullTarget: "/developer-forward"'));
  assert.equal(stampCode.includes("couponTarget"), false, "the coupon route key is back");
  assert.equal(stampCode.includes("studio.com/benchanviolin"), false);
  // Same reason as the stamp above: the page's own comment describes the
  // `display: none` rule it no longer has.
  const pageCode = page.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
  assert.equal(
    pageCode.includes("display: none"),
    false,
    "the Lite route hides something again; hiding is not removing (see RevealPanel, same file)"
  );

  const sandbox = readFileSync(path.join(yyDir, "YYSandbox.tsx"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^\s*\/\/.*$/gm, " ");
  for (const banned of ["coupon", "Coupon", "DEVELOPER_FORWARD_TEASER"]) {
    assert.equal(
      sandbox.includes(banned),
      false,
      `the run still references "${banned}"; the current record offers no coupon or upgrade`
    );
  }
});
