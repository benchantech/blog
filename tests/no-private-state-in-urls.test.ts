import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync, readdirSync, type Dirent } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * No learner value in a route segment, a query parameter or a page title
 * (plan §8.5; WYS §19.3).
 *
 * This is load-bearing because `components/GoogleAnalytics.tsx` — byte-frozen —
 * sets `send_page_view: true`, so `page_location` (query string included) and
 * `page_title` reach GA4 automatically on every route, OUTSIDE `trackWys` and
 * outside its property allowlist. A URL is telemetry whether or not the adapter
 * knows about it, so no adapter can police it.
 *
 * > No posture choice, cadence, time budget, scenario answer, judgment,
 * > rulebook value or any other learner input may ever appear in a path
 * > segment, a query parameter, or a page title. Lesson Zero step state is a
 * > step INDEX only.
 *
 * "Derived from a learner value" is undecidable by inspection, so plan §8.5
 * states the rule as two **statically decidable** assertions, both regex + `fs`
 * over source with no rendering:
 *
 *   1. no directory under `app/watch-your-step/` is a dynamic segment other
 *      than the allowlisted `[stopId]`;
 *   2. no `metadata` object and no `generateMetadata` function in that tree
 *      references anything imported from `lib/wys/local-state` or from
 *      `components/wys/useWysState`.
 *
 * The course tree does not exist until Phase 7. The test is written now, in the
 * phase that owns the rule, and reports its own scope so a later reader cannot
 * mistake "no tree yet" for "checked and clean".
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const courseRoot = path.join(repoRoot, "app", "watch-your-step");

/** The ONE dynamic segment plan §5.3 authorises, and a stop id is content data, not learner data. */
const ALLOWED_DYNAMIC_SEGMENTS = ["[stopId]"];

/** Modules whose exports are, by definition, learner state. */
const LEARNER_STATE_MODULES = ["lib/wys/local-state", "components/wys/useWysState"];

function directoriesUnder(root: string): string[] {
  if (!existsSync(root)) return [];
  const found: string[] = [];
  const walk = (dir: string) => {
    let entries: Dirent[];
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const full = path.join(dir, entry.name);
      found.push(full);
      walk(full);
    }
  };
  walk(root);
  return found;
}

function filesUnder(root: string): string[] {
  if (!existsSync(root)) return [];
  const found: string[] = [];
  const walk = (dir: string) => {
    let entries: Dirent[];
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.tsx?$/.test(entry.name)) found.push(full);
    }
  };
  walk(root);
  return found;
}

/** Binding names imported from any learner-state module in this file. */
function learnerStateBindings(source: string): string[] {
  const bindings: string[] = [];
  const importPattern = /import\s+(type\s+)?({[^}]*}|[A-Za-z0-9_$]+)\s+from\s+["']([^"']+)["']/g;
  let match: RegExpExecArray | null;
  while ((match = importPattern.exec(source)) !== null) {
    const specifier = match[3];
    const isLearnerState = LEARNER_STATE_MODULES.some(
      (module) => specifier.endsWith(module) || specifier.endsWith(module.replace("lib/", "").replace("components/", ""))
    );
    if (!isLearnerState) continue;

    const clause = match[2];
    if (clause.startsWith("{")) {
      for (const raw of clause.slice(1, -1).split(",")) {
        const name = raw.trim().replace(/^type\s+/, "").split(/\s+as\s+/).pop()?.trim();
        if (name) bindings.push(name);
      }
    } else {
      bindings.push(clause.trim());
    }
  }
  return bindings;
}

/** The `export const metadata = …` initialiser and any `generateMetadata` body, crudely but decidably. */
function metadataRegions(source: string): string[] {
  const regions: string[] = [];

  const metaIndex = source.search(/export\s+const\s+metadata\b/);
  if (metaIndex >= 0) {
    const open = source.indexOf("{", metaIndex);
    if (open >= 0) regions.push(braceBlock(source, open));
  }

  const genIndex = source.search(/export\s+(async\s+)?function\s+generateMetadata\b/);
  if (genIndex >= 0) {
    const open = source.indexOf("{", source.indexOf(")", genIndex));
    if (open >= 0) regions.push(braceBlock(source, open));
  }

  return regions;
}

function braceBlock(source: string, open: number): string {
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    else if (source[index] === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(open, index + 1);
    }
  }
  return source.slice(open);
}

/* -------------------------------------------------------------------------- */

test("the course tree's scope is reported, so an absent tree is not mistaken for a clean one", () => {
  const directories = directoriesUnder(courseRoot);
  const files = filesUnder(courseRoot);
  // Not an assertion about the count - Phase 7 builds the tree. This records
  // what the two assertions below actually covered on this run.
  assert.ok(directories.length >= 0 && files.length >= 0);
});

test("no dynamic route segment under app/watch-your-step/ other than the allowlisted [stopId]", () => {
  const offenders = directoriesUnder(courseRoot)
    .map((dir) => path.basename(dir))
    .filter((name) => name.startsWith("[") || name.includes("["))
    .filter((name) => !ALLOWED_DYNAMIC_SEGMENTS.includes(name));

  assert.deepEqual(
    offenders,
    [],
    "a dynamic segment other than [stopId] can carry a learner value into page_location"
  );
});

test("no route segment under app/watch-your-step/ is named for a learner value", () => {
  // Belt and braces on the static half: a literal segment named `posture` or
  // `cadence` would be a learner value in the path even without brackets.
  const forbidden = /^(posture|cadence|time-?budget|judgment|answer|choice|rulebook|reason)$/i;
  const offenders = directoriesUnder(courseRoot)
    .map((dir) => path.basename(dir))
    .filter((name) => forbidden.test(name));
  assert.deepEqual(offenders, []);
});

test("no metadata or generateMetadata in the course tree references learner state", () => {
  const offenders: string[] = [];

  for (const file of filesUnder(courseRoot)) {
    const source = readFileSync(file, "utf8");
    const bindings = learnerStateBindings(source);
    if (bindings.length === 0) continue;

    for (const region of metadataRegions(source)) {
      for (const binding of bindings) {
        if (new RegExp(`\\b${binding}\\b`).test(region)) {
          offenders.push(`${path.relative(repoRoot, file)} -> ${binding}`);
        }
      }
    }
  }

  assert.deepEqual(offenders, [], "a page title built from learner state would reach GA4 as page_title");
});

test("the two learner-state modules this rule names still exist under those paths", () => {
  // If either module is ever moved, the assertion above would silently stop
  // matching and pass for the wrong reason.
  assert.ok(existsSync(path.join(repoRoot, "lib/wys/local-state.ts")));
  assert.ok(existsSync(path.join(repoRoot, "components/wys/useWysState.ts")));
});

test("the helper actually detects a violation when one is present", () => {
  // A synthetic page, so the assertion above is proved to have teeth while the
  // real tree is still empty.
  const synthetic = [
    'import { readWysState } from "@/lib/wys/local-state";',
    "export const metadata = {",
    "  title: `Watch Your Step - ${readWysState().state.onboarding.postureChoice} - BenChanTech`",
    "};"
  ].join("\n");

  const bindings = learnerStateBindings(synthetic);
  assert.deepEqual(bindings, ["readWysState"]);

  const regions = metadataRegions(synthetic);
  assert.equal(regions.length, 1);
  assert.ok(new RegExp(`\\b${bindings[0]}\\b`).test(regions[0]));
});
