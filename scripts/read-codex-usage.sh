#!/bin/sh
set -eu

exec node --input-type=module <<'NODE'
import { spawn } from "node:child_process";

const child = spawn("codex", ["app-server", "--stdio"], {
  stdio: ["pipe", "pipe", "pipe"],
});

let stdoutBuffer = "";
let stderrBuffer = "";
let completed = false;

function send(message) {
  child.stdin.write(`${JSON.stringify(message)}\n`);
}

function localIsoDateTime(date) {
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

function fail(message) {
  if (completed) return;
  completed = true;
  console.error(message);
  child.kill();
  process.exitCode = 1;
}

child.on("error", (error) => fail(`Unable to start Codex CLI: ${error.message}`));
child.stderr.on("data", (chunk) => {
  stderrBuffer += chunk;
});

child.stdout.on("data", (chunk) => {
  stdoutBuffer += chunk;
  let newlineIndex;

  while ((newlineIndex = stdoutBuffer.indexOf("\n")) >= 0) {
    const line = stdoutBuffer.slice(0, newlineIndex);
    stdoutBuffer = stdoutBuffer.slice(newlineIndex + 1);
    if (!line.trim()) continue;

    let message;
    try {
      message = JSON.parse(line);
    } catch {
      continue;
    }

    if (message.id === 1 && message.result) {
      send({ method: "initialized" });
      send({ id: 2, method: "account/rateLimits/read" });
      continue;
    }

    if (message.id !== 2) continue;
    if (message.error) {
      fail(`Codex usage request failed: ${message.error.message ?? "unknown error"}`);
      return;
    }

    const weekly = message.result?.rateLimits?.secondary;
    const usedPercent = weekly?.usedPercent;
    const resetsAtSeconds = weekly?.resetsAt;
    if (
      !Number.isInteger(usedPercent) ||
      usedPercent < 0 ||
      usedPercent > 100 ||
      !Number.isInteger(resetsAtSeconds) ||
      resetsAtSeconds <= 0
    ) {
      fail("Codex did not return a valid weekly usage window");
      return;
    }

    completed = true;
    const observedAt = new Date();
    const resetAt = new Date(resetsAtSeconds * 1000);
    process.stdout.write(`${JSON.stringify({
      remainingPercent: 100 - usedPercent,
      resetAt: localIsoDateTime(resetAt),
      observedAt: localIsoDateTime(observedAt),
    }, null, 2)}\n`);
    child.stdin.end();
  }
});

child.on("exit", (code) => {
  if (!completed && code !== 0) {
    fail(stderrBuffer.trim() || `Codex app-server exited with status ${code}`);
  }
});

send({
  id: 1,
  method: "initialize",
  params: {
    clientInfo: { name: "benchantech-usage-meter", version: "0.1.0" },
    capabilities: { experimentalApi: true },
  },
});

setTimeout(() => fail("Timed out reading Codex usage"), 15_000).unref();
NODE
