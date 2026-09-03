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
