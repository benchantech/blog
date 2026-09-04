#!/usr/bin/env node
/**
 * Draft preview TOOLING (plan §6.11; WYS §7 "Use development preview tooling
 * for drafts", §33 step 29 "Keep draft content behind development preview").
 *
 * It is a stdout dump, NOT a route. "Guarded by process.env.NODE_ENV" is not a
 * mechanism: a component that returns null still yields a prerendered, publicly
 * reachable URL, still pulls every draft content module into the production
 * build graph, and still inflates the Phase 0 prerendered-route regression
 * floor with a route that should never deploy. So: zero routes added, zero
 * draft modules in the production graph, and the dev-time need is met.
 *
 * Usage:
 *   node scripts/preview-content.mjs
 *
 * The repo already depends on `tsx` (devDependency, used by `npm test`), so
 * this re-executes itself under that loader rather than adding a dependency.
 */

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const selfPath = fileURLToPath(import.meta.url);

if (process.env.BCT_PREVIEW_TSX !== "1") {
  const result = spawnSync(process.execPath, ["--import", "tsx", selfPath], {
    stdio: "inherit",
    env: { ...process.env, BCT_PREVIEW_TSX: "1" }
  });
  process.exit(result.status ?? 1);
}

const { RENDER_BEN_REVIEWED, RENDER_MARKED_DRAFT, provenanceLabelPairs, renderPolicyFor } =
  await import("../lib/content-status.ts");
const { claims } = await import("../content/claims.ts");
const { authorityChain } = await import("../content/authority-chain.ts");
const { resolveVariant } = await import("../lib/canonical-text.ts");
const { approvalState, bridgeStateLines } = await import("../lib/approval-state.ts");
const { wysRegistry, wysCanonicalRecords } = await import("../content/watch-your-step/index.ts");
const { shipRegistry } = await import("../content/ship/index.ts");
const { judgmentFrameworkRecords } = await import("../content/canonical/judgment-framework.ts");
const { stopCount, stopCountWord, wysWeeks } = await import("../content/watch-your-step/weeks.ts");
const { CONTENT_VERSION } = await import("../content/watch-your-step/version.ts");

/**
 * Which surface kind a module's records render on, so the preview shows the
 * SAME policy a screen would compute. `general` is the fallback, exactly as in
 * tests/wys-content.test.ts.
 */
const SURFACE_BY_MODULE = {
  "content/watch-your-step/sources.ts": "human-source",
  "content/watch-your-step/sources.ts (Ben slots)": "human-source",
  "content/watch-your-step/scenarios.ts": "fictional-scenario",
  "content/watch-your-step/variants.ts": "fictional-scenario",
  "content/watch-your-step/judgments.ts": "judgment"
};

function describePolicy(policy) {
  if (policy.kind === "blocked") return `blocked (${policy.reason})`;
  if (policy.kind === "marked") return `marked [${policy.label}]${policy.draftMark ? ` + ${policy.draftMark} mark` : ""}`;
  return "canon";
}

function table(rows) {
  if (rows.length === 0) return;
  const keys = Object.keys(rows[0]);
  const width = Object.fromEntries(
    keys.map((key) => [key, Math.max(key.length, ...rows.map((row) => String(row[key]).length))])
  );
  const line = (cells) => cells.map((cell, i) => String(cell).padEnd(width[keys[i]])).join("  ");
  console.log(line(keys));
  console.log(keys.map((key) => "-".repeat(width[key])).join("  "));
  for (const row of rows) console.log(line(keys.map((key) => row[key])));
}

console.log("Watch Your Step — draft content preview");
console.log("=======================================");
console.log(`RENDER_BEN_REVIEWED = ${RENDER_BEN_REVIEWED}   (Q13: production renders published only)`);
console.log(`RENDER_MARKED_DRAFT = ${RENDER_MARKED_DRAFT}   (Q21: the spec's whitelist, pending Ben's answer)`);
console.log("");

console.log("## Claim records (content/claims.ts)");
table(
  claims.map((claim) => ({
    id: claim.id,
    status: claim.status,
    origin: claim.origin,
    public: describePolicy(renderPolicyFor(claim, "public")),
    preview: describePolicy(renderPolicyFor(claim, "preview"))
  }))
);
console.log("");

console.log("## Claim variants");
table(
  claims.flatMap((claim) =>
    ["short", "medium", "full", "inline", "machine"].flatMap((variant) => {
      const value = claim.variants[variant];
      if (value === undefined) return [];
      const resolved = resolveVariant(claim, variant);
      return [
        {
          id: claim.id,
          variant,
          state: resolved.kind,
          detail:
            resolved.kind === "text"
              ? `${resolved.text.slice(0, 60)}${resolved.text.length > 60 ? "..." : ""}`
              : resolved.kind === "awaiting"
                ? `awaiting ${resolved.awaiting.writtenBy}`
                : ""
        }
      ];
    })
  )
);
console.log("");

console.log("## Authority chain (content/authority-chain.ts)");
table(
  authorityChain.map((link) => ({
    order: link.order,
    id: link.id,
    href: link.href,
    hash: link.hash.value ?? "(none published)",
    public: describePolicy(renderPolicyFor(link, "public")),
    preview: describePolicy(renderPolicyFor(link, "preview"))
  }))
);
console.log("");

console.log("## Provenance label map (surfaceKind, origin) -> label");
table(provenanceLabelPairs().map((pair) => ({ surface: pair.surfaceKind, origin: pair.origin, label: pair.label })));
console.log("");

console.log("## Approval state (lib/approval-state.ts)");
console.log(`stamp: ${approvalState.stamp === null ? "null" : "set"}`);
for (const line of bridgeStateLines()) console.log(`  ${line}`);

console.log("");

console.log("## Watch Your Step content (content/watch-your-step/*)");
console.log(`CONTENT_VERSION = ${CONTENT_VERSION}`);
console.log(`stops = ${stopCount()} (${stopCountWord()}) — derived from wysWeeks.length, never typed`);
console.log("");

for (const group of [...wysRegistry, ...shipRegistry]) {
  if (group.records.length === 0) {
    console.log(`### ${group.module} — no records (deliberately empty)`);
    console.log("");
    continue;
  }
  const surfaceKind = SURFACE_BY_MODULE[group.module] ?? "general";
  console.log(`### ${group.module}  [surface: ${surfaceKind}]`);
  table(
    group.records.map((record) => ({
      id: record.id,
      status: record.status,
      origin: record.origin,
      public: describePolicy(renderPolicyFor({ ...record, surfaceKind }, "public")),
      preview: describePolicy(renderPolicyFor({ ...record, surfaceKind }, "preview"))
    }))
  );
  console.log("");
}

console.log("## Curriculum canonical records");
table(
  [...judgmentFrameworkRecords, ...wysCanonicalRecords].map((record) => ({
    id: record.id,
    status: record.status,
    origin: record.origin,
    public: describePolicy(renderPolicyFor(record, "public"))
  }))
);
console.log("");

console.log("## Stops (content/watch-your-step/weeks.ts)");
table(
  wysWeeks.map((week) => ({
    order: week.order,
    id: week.id,
    title: week.title,
    source: week.primarySourceId ?? "(none — Q10)",
    visits2: week.cadencePaths.days2.length,
    visits3: (week.cadencePaths.days3 ?? week.cadencePaths.days2).length,
    visits5: week.cadencePaths.days5.length
  }))
);
