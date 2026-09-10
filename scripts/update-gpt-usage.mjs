import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SOURCE = "manually observed in ChatGPT usage UI";
const PLAN_COST_MONTHLY_USD = 20;
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDirectory, "..");

export function validateInput(remaining, resetAt) {
  if (!Number.isInteger(remaining) || remaining < 0 || remaining > 100) {
    throw new Error("--remaining must be an integer from 0 to 100");
  }

  if (
    typeof resetAt !== "string" ||
    !/[T ]\d{2}:\d{2}/.test(resetAt) ||
    Number.isNaN(Date.parse(resetAt))
  ) {
    throw new Error("--reset-at must be a valid date/time");
  }
}

export function localIsoDateTime(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteOffset = Math.abs(offsetMinutes);

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
    `${sign}${pad(Math.floor(absoluteOffset / 60))}:${pad(absoluteOffset % 60)}`
  );
}

export function parseArguments(args) {
  const values = {};
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index];
    const value = args[index + 1];
    if ((flag !== "--remaining" && flag !== "--reset-at") || value === undefined) {
      throw new Error("usage: node scripts/update-gpt-usage.mjs --remaining <0-100> --reset-at <date/time>");
    }
    if (values[flag] !== undefined) throw new Error(`${flag} may only be provided once`);
    values[flag] = value;
  }

  if (values["--remaining"] === undefined || values["--reset-at"] === undefined) {
    throw new Error("both --remaining and --reset-at are required");
  }

  if (!/^(0|[1-9]\d*)$/.test(values["--remaining"])) {
    throw new Error("--remaining must be an integer from 0 to 100");
  }

  return {
    remaining: Number(values["--remaining"]),
    resetAt: values["--reset-at"],
  };
}

export async function updateUsage({ remaining, resetAt, observedAt = localIsoDateTime(), currentPath, historyPath }) {
  validateInput(remaining, resetAt);
  validateInput(remaining, observedAt);

  const resolvedCurrentPath = currentPath ?? path.join(repoRoot, "content/company/gpt-usage.json");
  const resolvedHistoryPath = historyPath ?? path.join(repoRoot, "content/company/gpt-usage-history.json");
  const history = JSON.parse(await readFile(resolvedHistoryPath, "utf8"));
  if (!Array.isArray(history)) throw new Error("gpt-usage-history.json must contain an array");

  const observation = {
    observedAt,
    remainingPercent: remaining,
    resetAt,
    planCostMonthlyUsd: PLAN_COST_MONTHLY_USD,
    source: SOURCE,
  };
  const currentJson = `${JSON.stringify(observation, null, 2)}\n`;
  const historyJson = `${JSON.stringify([...history, observation], null, 2)}\n`;

  await writeFile(resolvedCurrentPath, currentJson, "utf8");
  await writeFile(resolvedHistoryPath, historyJson, "utf8");
  return observation;
}

async function main() {
  const input = parseArguments(process.argv.slice(2));
  await updateUsage(input);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
