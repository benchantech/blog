import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { agentBootstrapText } from "@/content/ship/agent-bootstrap";

/**
 * The ADR register audits itself (ADR 0008).
 *
 * `docs/adr/README.md` is what agents are told to read on boot, so a drifted
 * index is a boot instruction pointing at the wrong decisions. This is
 * ADR 0005's rule — a claim about a guard is checked — applied to the register
 * that documents the guards.
 */

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const adrDir = path.join(repoRoot, "docs", "adr");

function adrFiles(): string[] {
  return readdirSync(adrDir).filter((f) => /^\d{4}-.*\.md$/.test(f)).sort();
}

test("every ADR carries the four fields a future session needs", () => {
  for (const file of adrFiles()) {
    const source = readFileSync(path.join(adrDir, file), "utf8");
    assert.match(source, /^# \d{4} — .+/m, `${file}: no title line`);
    assert.match(source, /^\*\*Status:\*\* (ACCEPTED|SUPERSEDED by \d{4}|OPEN|REJECTED)/m, `${file}: bad Status`);
    assert.match(source, /^\*\*Decided:\*\* 20\d\d-\d\d-\d\d/m, `${file}: no ISO Decided date`);
    /*
     * Stale-when is the field that makes an ADR safe to leave lying around: it
     * is how a future session tells guidance from history. An ADR without one
     * is a decision that can never be retired, which is how a register becomes
     * a graveyard nobody trusts.
     */
    assert.match(source, /^\*\*Stale when:\*\* .+/m, `${file}: no Stale-when condition`);
  }
});

test("the index and the directory describe the same register", () => {
  const readme = readFileSync(path.join(adrDir, "README.md"), "utf8");
  const files = adrFiles();
  assert.ok(files.length > 0, "no ADRs found");

  for (const file of files) {
    assert.ok(readme.includes(file), `${file} exists but is not in the index`);
  }
  for (const link of readme.matchAll(/\((\d{4}-[a-z0-9-]+\.md)\)/g)) {
    assert.ok(existsSync(path.join(adrDir, link[1])), `index links ${link[1]}, which does not exist`);
  }

  // Numbers are unique and contiguous from 0001 — a gap means a deleted ADR,
  // and ADRs are superseded, never deleted.
  const numbers = files.map((f) => Number(f.slice(0, 4)));
  assert.deepEqual(numbers, numbers.map((_, i) => i + 1), "ADR numbers are not contiguous from 0001");
});

test("a superseded ADR names its replacement, and the replacement exists", () => {
  for (const file of adrFiles()) {
    const source = readFileSync(path.join(adrDir, file), "utf8");
    const superseded = source.match(/^\*\*Status:\*\* SUPERSEDED by (\d{4})/m);
    if (superseded === null) continue;
    const replacement = adrFiles().find((f) => f.startsWith(superseded[1]));
    assert.ok(replacement, `${file} is superseded by ${superseded[1]}, which does not exist`);
  }
});

test("the boot instruction still points agents at the register", () => {
  // If this sentence is ever dropped, the ADRs stop being read and become
  // decoration. That is the failure ADR 0008 exists to prevent.
  const boot = agentBootstrapText();
  assert.ok(boot.includes("docs/adr/README.md"), "the boot instruction no longer names the ADR index");
  assert.ok(boot.includes("Stale-when"), "the boot instruction no longer warns about staleness");
});
