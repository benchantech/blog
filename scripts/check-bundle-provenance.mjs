#!/usr/bin/env node
/**
 * THE CLIENT BUNDLE IS A PUBLISHED SURFACE (plan §6.2; WYS §7, §23).
 *
 * `lib/wys/content-gate.ts` empties `text` on a blocked record so withheld
 * prose cannot ride the RSC flight payload into the prerendered HTML. That
 * closes the PROP path. It does nothing about the MODULE path: a client
 * component that imports a content module pulls that module into a client
 * JavaScript chunk whatever it goes on to read from it, and every visitor
 * downloads the chunk.
 *
 * The Phase 12 audit found exactly that. `content/watch-your-step/domains.ts`
 * is the vocabulary every course client component hands the serializer, and it
 * reached `scenarios.ts` and `weeks.ts`; `CurrentStopGate` reached
 * `letteredStops()`. The whole scenario bank — settings, decision moments,
 * every choice label, the internal authoring notes — plus all nine stop titles
 * shipped in plain text in `static/chunks/*.js`, on the same pages whose DOM
 * honestly read "Implementation placeholder — not Ben's words". The label was
 * true of the pixels and false of the page's asset graph.
 *
 * So the gate is EXECUTED, not eyeballed, on the artefact rather than on the
 * source: take every content record whose render policy is `blocked` on the
 * public surface, and fail if any prose string of theirs appears anywhere under
 * `.next/static`. It reads the built output, so it also catches a regression
 * that arrives through a bundler change rather than through an import.
 *
 * `npm run build` runs it after `next build`; `tests/client-bundle-provenance.test.ts`
 * shells out to it so `npm test` fails on a leak too — the same arrangement
 * `scripts/check-no-deletions.sh` and `tests/preserved-surfaces.test.ts` use.
 *
 * Exit 0 clean, 1 on a leak, 0 with a notice when there is no build to check.
 *
 * The repo already depends on `tsx` (devDependency, used by `npm test`), so
 * this re-executes itself under that loader rather than adding a dependency.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const selfPath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(selfPath), "..");

if (process.env.BCT_BUNDLE_CHECK_TSX !== "1") {
  const result = spawnSync(process.execPath, ["--import", "tsx", selfPath], {
    stdio: "inherit",
    env: { ...process.env, BCT_BUNDLE_CHECK_TSX: "1" }
  });
  process.exit(result.status ?? 1);
}

const staticDir = path.join(repoRoot, ".next", "static");
if (!existsSync(staticDir)) {
  console.log("[bundle-provenance] no .next/static — nothing built to check.");
  process.exit(0);
}

const { renderPolicyFor } = await import("../lib/content-status.ts");
const { wysRegistry } = await import("../content/watch-your-step/index.ts");
const { shipRegistry } = await import("../content/ship/index.ts");

/* -------------------------------------------------------------------------- */
/* 1. Every prose string on every record the public surface blocks             */
/* -------------------------------------------------------------------------- */

/**
 * Which surface kind a record belongs to, for the policy call. The registries
 * carry the structural fields, not the kind, and the policy only needs a kind
 * that HAS a label for the origin — so the check walks the four in turn and
 * takes the first that resolves. A record whose origin has no label on any
 * surface is a build failure elsewhere (`provenanceLabelFor` throws), not here.
 */
const SURFACE_KINDS = ["fictional-scenario", "judgment", "human-source", "general"];

function policyFor(record) {
  for (const surfaceKind of SURFACE_KINDS) {
    try {
      return renderPolicyFor({ surfaceKind, origin: record.origin, status: record.status, supersededBy: record.supersededBy, canonical: record.canonical }, "public");
    } catch {
      /* no label for this pair on this surface kind — try the next. */
    }
  }
  return null;
}

/**
 * Strings of five words or more, anywhere in the record.
 *
 * Five, not the twelve `tests/canonical-text.test.ts` uses for duplicate
 * detection: that check is looking for one policy sentence written twice, and
 * short UI language is legitimately repeated. This one is looking for withheld
 * curriculum in a public artefact, where a five-word scenario choice label
 * ("Keep everything — context makes the rewrite better") is exactly the thing
 * that must not be there.
 */
function proseIn(value, out = []) {
  if (typeof value === "string") {
    if (value.trim().split(/\s+/).filter(Boolean).length >= 5) out.push(value.replace(/\s+/g, " ").trim());
    return out;
  }
  if (Array.isArray(value)) { for (const entry of value) proseIn(entry, out); return out; }
  if (value && typeof value === "object") { for (const entry of Object.values(value)) proseIn(entry, out); return out; }
  return out;
}

/**
 * BEN SLOTS ARE EXEMPT, AND THE REASON IS §6.4 RATHER THAN CONVENIENCE.
 *
 * A `BenSlot` record has no body to withhold: it is a LABEL plus an
 * awaited-asset descriptor, and `MediaSlot` / `DashedSlot` take no `children`,
 * no `text` and no `body` prop precisely so a generated string cannot occupy
 * one. Its `label`, `awaitedAsset` and `emptyReferenceReason` are the strings
 * the empty slot DRAWS — "slot: Ben-selected recording", "Awaiting Ben. No
 * draft AI text is shown here, by rule." They are public by design. Its
 * `blocked` policy records that Ben's material has not arrived, which is the
 * slot's whole purpose, not a leak.
 */
const EXEMPT_GROUPS = new Set([
  "content/watch-your-step/sources.ts (Ben slots)",
  "content/watch-your-step/today.ts (Ben slot)",
  "content/watch-your-step/end.ts (Ben slot)",
  "content/watch-your-step/lesson-zero.ts (Ben slot)"
]);

const withheld = [];
for (const group of [...wysRegistry, ...shipRegistry]) {
  if (EXEMPT_GROUPS.has(group.module)) continue;
  for (const record of group.records) {
    const policy = policyFor(record);
    if (!policy || policy.kind !== "blocked") continue;
    for (const text of proseIn(record)) withheld.push({ module: group.module, id: record.id, text });
  }
}

/* -------------------------------------------------------------------------- */
/* 2. The built client bundles                                                 */
/* -------------------------------------------------------------------------- */

const bundles = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (full.endsWith(".js")) bundles.push({ name: path.relative(repoRoot, full), body: readFileSync(full, "utf8") });
  }
})(staticDir);

const leaks = [];
for (const item of withheld) {
  for (const bundle of bundles) {
    if (bundle.body.includes(item.text)) {
      leaks.push({ ...item, bundle: bundle.name });
      break;
    }
  }
}

if (leaks.length === 0) {
  console.log(`[bundle-provenance] OK — ${withheld.length} withheld strings, none in ${bundles.length} client bundles.`);
  process.exit(0);
}

console.error(`[bundle-provenance] FAIL — withheld prose is being served to every visitor in ${new Set(leaks.map((l) => l.bundle)).size} client bundle(s).\n`);
for (const leak of leaks.slice(0, 25)) {
  console.error(`  ${leak.module} · ${leak.id}\n    ${leak.bundle}\n    "${leak.text.slice(0, 100)}"`);
}
if (leaks.length > 25) console.error(`  ... and ${leaks.length - 25} more.`);
console.error(
  "\nA client component is importing a content module. Emptying `text` at the gate\n" +
    "does not help — remove the import edge and hand the client a projection\n" +
    "(see `visitCountableStop` / `currentStopIdFrom` in lib/wys/visit.ts)."
);
process.exit(1);
