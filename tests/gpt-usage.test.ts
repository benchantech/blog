import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import usage from "@/content/company/gpt-usage.json";
import usageHistory from "@/content/company/gpt-usage-history.json";
import { parseArguments, updateUsage, validateInput } from "../scripts/update-gpt-usage.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("usage input accepts only an integer percentage and a parseable date/time", () => {
  assert.deepEqual(
    parseArguments(["--remaining", "68", "--reset-at", "2026-09-14T15:12:00-04:00"]),
    { remaining: 68, resetAt: "2026-09-14T15:12:00-04:00" },
  );
  for (const remaining of [-1, 1.5, 101, Number.NaN]) {
    assert.throws(() => validateInput(remaining, "2026-09-14T15:12:00-04:00"));
  }
  assert.throws(() => validateInput(68, "not-a-date"));
  assert.throws(() => parseArguments(["--remaining", "68.5", "--reset-at", "2026-09-14T15:12:00-04:00"]));
});

test("an update replaces current state and appends history without changing prior records", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "gpt-usage-"));
  const currentPath = path.join(directory, "current.json");
  const historyPath = path.join(directory, "history.json");
  const prior = { observedAt: "2026-09-01T10:00:00-04:00", remainingPercent: 90 };
  await writeFile(currentPath, '{"untouched":true}\n');
  await writeFile(historyPath, `${JSON.stringify([prior])}\n`);

  try {
    const observation = await updateUsage({
      remaining: 68,
      resetAt: "2026-09-14T15:12:00-04:00",
      observedAt: "2026-09-10T15:20:00-04:00",
      currentPath,
      historyPath,
    });
    assert.deepEqual(JSON.parse(await readFile(currentPath, "utf8")), observation);
    assert.deepEqual(JSON.parse(await readFile(historyPath, "utf8")), [prior, observation]);

    const beforeCurrent = await readFile(currentPath, "utf8");
    const beforeHistory = await readFile(historyPath, "utf8");
    await assert.rejects(() => updateUsage({ remaining: 101, resetAt: "invalid", currentPath, historyPath }));
    assert.equal(await readFile(currentPath, "utf8"), beforeCurrent);
    assert.equal(await readFile(historyPath, "utf8"), beforeHistory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("the homepage meter renders its operating-cost and observation contract", () => {
  const component = readFileSync(path.join(repoRoot, "components/GptUsageMeter.tsx"), "utf8");
  const homepage = readFileSync(path.join(repoRoot, "app/page.tsx"), "utf8");
  assert.ok(homepage.includes("<GptUsageMeter />"), "the homepage no longer renders the usage meter");
  assert.ok(component.includes('from "@/content/company/gpt-usage.json"'));
  assert.ok(Number.isInteger(usage.remainingPercent));
  assert.ok(usage.remainingPercent >= 0 && usage.remainingPercent <= 100);
  assert.equal(usage.planCostMonthlyUsd, 20);
  assert.ok(!Number.isNaN(Date.parse(usage.resetAt)));
  assert.ok(!Number.isNaN(Date.parse(usage.observedAt)));
  assert.deepEqual(usageHistory.at(-1), usage, "current usage must match the latest history record");
  assert.match(component, /\$20 Operating Meter/);
  assert.match(component, /installed Codex CLI/i);
  assert.match(component, /not via browser or account scraping/i);
});
