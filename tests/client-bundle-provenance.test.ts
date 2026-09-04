import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The client bundle is a published surface (plan §6.2; WYS §7, §23).
 *
 * FOUND IN THE PHASE 12 AUDIT. `lib/wys/content-gate.ts` empties `text` on a
 * blocked record so withheld prose cannot ride the RSC flight payload into the
 * prerendered HTML — the PROP path. It does nothing about the MODULE path: a
 * client component that imports a content module pulls that module into a
 * client JavaScript chunk whatever it goes on to read from it.
 *
 * `content/watch-your-step/domains.ts` — the vocabulary every course client
 * component hands the serializer — reached `scenarios.ts` and `weeks.ts`, and
 * `CurrentStopGate` reached `letteredStops()`. The result: the entire scenario
 * bank (settings, decision moments, every choice label, the internal authoring
 * notes) plus all nine stop titles shipped in plain text in
 * `static/chunks/*.js`, downloaded by every visitor of pages whose DOM read
 * "Implementation placeholder — not Ben's words". The label was true of the
 * pixels and false of the page's asset graph.
 *
 * WHY THE CHECK RUNS ON THE ARTEFACT, NOT ON THE SOURCE. An import-graph rule
 * ("no client component may import `content/`") is both too strict and too
 * loose: `BottomNav` legitimately imports its tab labels, and a bundler change
 * could reintroduce the leak with no import edge added. So the gate reads
 * `.next/static` and asks the only question that matters — is any withheld
 * string actually being served?
 *
 * `scripts/check-bundle-provenance.mjs` is the single implementation;
 * `npm run build` runs it after `next build` and this test shells out to it, so
 * both gates fail on a leak. Same arrangement as `scripts/check-no-deletions.sh`
 * and `tests/preserved-surfaces.test.ts` (plan §3.0).
 */

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const script = path.join(repoRoot, "scripts", "check-bundle-provenance.mjs");
const staticDir = path.join(repoRoot, ".next", "static");

test("withheld prose is not served in any client bundle", () => {
  if (!existsSync(staticDir)) {
    /**
     * No build to inspect. Reported rather than silently passed: `npm run build`
     * runs the same script, so the gate is still executed in the flow that
     * produces a deployable artefact — but a reader of this output should know
     * this run proved nothing.
     */
    console.warn(
      "[client-bundle-provenance] no .next/static in this working tree — " +
        "run `PORT=3999 npm run build` to exercise this gate."
    );
    return;
  }

  let output = "";
  let failed = false;
  try {
    output = execFileSync(process.execPath, [script], { encoding: "utf8", cwd: repoRoot });
  } catch (error) {
    failed = true;
    const shell = error as { stdout?: string; stderr?: string };
    output = `${shell.stdout ?? ""}${shell.stderr ?? ""}`;
  }
  assert.equal(failed, false, `withheld prose is in a client bundle:\n${output}`);
});

/**
 * The gate has to be wired, or it is a script nobody runs.
 *
 * `docs/facelift-build-notes.md` §7.5 names the failure mode this guards
 * against in the content registries — a module nothing imports is a module
 * nothing governs — and it applies to a check as much as to a record.
 */
test("the bundle gate runs as part of the build", () => {
  const pkg = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8")) as {
    scripts: Record<string, string>;
  };
  assert.match(
    pkg.scripts.build,
    /check-bundle-provenance\.mjs/,
    "npm run build must run scripts/check-bundle-provenance.mjs"
  );
});

/**
 * The tree-shaking half of the fix.
 *
 * `sideEffects` is what lets webpack drop an unused export from a content
 * module a client component imports for one id list. Without it every such
 * import drags the whole record bank into a chunk, and the artefact check above
 * starts failing for a reason nobody will connect to a missing package.json
 * field. `"*.css"` stays listed because `app/globals.css` and every CSS module
 * ARE side-effectful imports and must not be dropped.
 */
test("package.json declares the side-effect boundary that makes tree-shaking possible", () => {
  const pkg = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8")) as {
    sideEffects?: string[];
  };
  assert.deepEqual(pkg.sideEffects, ["*.css"]);
});
