import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Class contract (plan Phase 0).
 *
 * This repo has no CSS Modules today, no working `npm run lint` (Q14: dropped
 * from the gates) and zero rendering coverage, so a misspelled class name is
 * invisible to every other check: `styles.doesNotExist` type-checks clean under
 * this tsconfig because next-env.d.ts pulls in Next's loose
 * `{ readonly [key: string]: string }` CSS-module typing.
 *
 * Three modes, regex + fs, zero dependencies:
 *   1. className string literal  -> globals.css selector
 *   2. styles.<key> member access -> sibling .module.css class selector
 *   3. globals.css class selector -> some className token (orphan-rule scan)
 *
 * The two registers below are ALLOWLISTS OF KNOWN MISMATCHES, and they are
 * asserted EXACTLY, not as an upper bound: a stale entry fails the test. Phase
 * 10 resolves every entry and empties both lists. They are two lists because
 * they are two different kinds of finding — a className→selector scan never
 * visits an orphan rule, so an orphan parked in UNRESOLVED_CLASSNAMES could
 * never be reported and would sit there forever.
 */

/** className tokens applied in .tsx with no rule anywhere. Phase 10 resolves. */
const UNRESOLVED_CLASSNAMES = [
  // app/page.tsx:8 — `hero hero-foyer`; no `.hero-foyer` rule exists.
  "hero-foyer",
  // app/page.tsx:26 — `audience-button secondary`; globals.css has only
  // `.secondary-results` (:583/:590/:595), so the two hero buttons are
  // asymmetric by accident: `.audience-button.primary` styles one, nothing
  // styles the other.
  "secondary"
];

/** globals.css class selectors referenced by no className. Phase 10 resolves. */
const ORPHAN_RULES = [
  // globals.css:178 — referenced by no className in any .tsx.
  "hero-principle",
  // globals.css:162 — a member of the .welcome-label/.eyebrow/.question-label/
  // .card-eyebrow/.room-number selector group; the other four are live.
  // MEASURED ADDITION to the plan's one-item list (see docs/facelift-build-notes.md).
  "card-eyebrow"
];

/**
 * Class names built at runtime from data. The static prefix before `${` is the
 * key; the expansion is the full set of values it can take. An unregistered
 * dynamic class is a hard failure, so a later phase must register it rather
 * than silently lose coverage for it.
 */
const DYNAMIC_CLASS_EXPANSIONS: Record<string, string[]> = {
  // app/page.tsx:44 — `plan-room-${item.number}`, values 1-4 from
  // content/site-config.ts destinations[].number.
  "plan-room-": ["plan-room-1", "plan-room-2", "plan-room-3", "plan-room-4"]
};

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skipDirs = new Set(["node_modules", ".next", ".git"]);

function walk(dir: string, extension: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (skipDirs.has(entry)) continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, extension, out);
    else if (full.endsWith(extension)) out.push(full);
  }
  return out;
}

const componentDirs = [path.join(repoRoot, "app"), path.join(repoRoot, "components")];
const tsxFiles = componentDirs.flatMap((dir) => walk(dir, ".tsx"));

/* -------------------------------------------------------------------------- */
/* CSS selector extraction                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Collect class selectors from a stylesheet.
 *
 * Only text that precedes a `{` is treated as a selector, and any buffer is
 * dropped at `;` or `}`. That keeps declaration values out of the result — an
 * `@import url("https://fonts.googleapis.com/...")` ends in `;`, so it never
 * contributes a bogus `googleapis` / `com` "class".
 */
function cssClassSelectors(css: string): Set<string> {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, " ");
  const found = new Set<string>();
  let buffer = "";

  for (const char of withoutComments) {
    if (char === "{") {
      const prelude = buffer.trim();
      // `@media (...)`, `@supports (...)` etc. carry no class selectors.
      if (!prelude.startsWith("@")) {
        for (const match of prelude.matchAll(/\.(-?[A-Za-z_][A-Za-z0-9_-]*)/g)) found.add(match[1]);
      }
      buffer = "";
    } else if (char === "}" || char === ";") {
      buffer = "";
    } else {
      buffer += char;
    }
  }

  return found;
}

/* -------------------------------------------------------------------------- */
/* className extraction                                                       */
/* -------------------------------------------------------------------------- */

type ClassUse = { token: string; file: string };

/** Read a balanced `{...}` expression starting at the opening brace. */
function readBalancedBraces(source: string, openIndex: number): string {
  let depth = 0;
  for (let index = openIndex; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    else if (source[index] === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(openIndex + 1, index);
    }
  }
  return source.slice(openIndex + 1);
}

function expandToken(raw: string, file: string, out: ClassUse[]): void {
  if (!raw) return;
  if (raw.includes("${")) {
    const prefix = raw.slice(0, raw.indexOf("${"));
    const expansion = DYNAMIC_CLASS_EXPANSIONS[prefix];
    assert.ok(
      expansion,
      `${file}: dynamic className "${raw}" has no entry in DYNAMIC_CLASS_EXPANSIONS. ` +
        "Register its possible values so it stays covered."
    );
    for (const value of expansion) out.push({ token: value, file });
    return;
  }
  out.push({ token: raw, file });
}

/** Every className token applied in a .tsx file, dynamic cases expanded. */
function classNameUses(source: string, file: string): ClassUse[] {
  const uses: ClassUse[] = [];
  const marker = "className=";
  let cursor = source.indexOf(marker);

  while (cursor !== -1) {
    const valueStart = cursor + marker.length;
    const char = source[valueStart];

    if (char === '"' || char === "'") {
      const end = source.indexOf(char, valueStart + 1);
      const literal = source.slice(valueStart + 1, end === -1 ? undefined : end);
      for (const raw of literal.split(/\s+/)) expandToken(raw, file, uses);
    } else if (char === "{") {
      const expression = readBalancedBraces(source, valueStart);
      // Every string and template literal inside the expression is a candidate
      // class list. This is what picks up the IntentRouter stepper's
      // "active" / "complete" ternary states (IntentRouter.tsx:53).
      for (const match of expression.matchAll(/"([^"]*)"|'([^']*)'|`([^`]*)`/g)) {
        const literal = match[1] ?? match[2] ?? match[3] ?? "";
        for (const raw of literal.split(/\s+/)) expandToken(raw, file, uses);
      }
    }

    cursor = source.indexOf(marker, valueStart);
  }

  return uses;
}

const globalsCss = readFileSync(path.join(repoRoot, "app", "globals.css"), "utf8");
const globalSelectors = cssClassSelectors(globalsCss);
const allClassUses = tsxFiles.flatMap((file) =>
  classNameUses(readFileSync(file, "utf8"), path.relative(repoRoot, file))
);

/* -------------------------------------------------------------------------- */
/* Mode 1 — className string literal -> globals.css selector                  */
/* -------------------------------------------------------------------------- */

test("mode 1: every className token resolves to a globals.css rule", () => {
  const unresolved = new Map<string, string>();
  for (const use of allClassUses) {
    if (globalSelectors.has(use.token)) continue;
    if (!unresolved.has(use.token)) unresolved.set(use.token, use.file);
  }

  const unexpected = [...unresolved].filter(([token]) => !UNRESOLVED_CLASSNAMES.includes(token));
  assert.deepEqual(
    unexpected.map(([token, file]) => `${token} (${file})`),
    [],
    "className tokens with no rule in globals.css and no allowlist entry"
  );

  const stale = UNRESOLVED_CLASSNAMES.filter((token) => !unresolved.has(token));
  assert.deepEqual(
    stale,
    [],
    "UNRESOLVED_CLASSNAMES entries that now resolve — delete them from the register"
  );
});

test("mode 1: the extractor actually sees the known tokens", () => {
  // Guards the scanner itself. A silently-empty scan would make every other
  // assertion in this file vacuously true.
  const tokens = new Set(allClassUses.map((use) => use.token));
  for (const expected of [
    "hero",
    "audience-button",
    "plan-room-1",
    "plan-room-4",
    "active",
    "complete",
    "skip-link",
    "legal-page"
  ]) {
    assert.ok(tokens.has(expected), `className extractor missed "${expected}"`);
  }
  assert.ok(allClassUses.length > 40, "className extractor returned implausibly few tokens");
});

/* -------------------------------------------------------------------------- */
/* Mode 2 — styles.<key> -> sibling .module.css                               */
/* -------------------------------------------------------------------------- */

test("mode 2: every styles.<key> resolves to a class in its sibling .module.css", () => {
  const failures: string[] = [];
  let modulesChecked = 0;

  for (const file of tsxFiles) {
    const source = readFileSync(file, "utf8");
    const relative = path.relative(repoRoot, file);

    for (const importMatch of source.matchAll(
      /import\s+(\w+)\s+from\s+["'](\.[^"']*\.module\.css)["']/g
    )) {
      const [, binding, specifier] = importMatch;
      const modulePath = path.resolve(path.dirname(file), specifier);
      if (!existsSync(modulePath)) {
        failures.push(`${relative}: imports ${specifier}, which does not exist`);
        continue;
      }
      modulesChecked += 1;
      const moduleSelectors = cssClassSelectors(readFileSync(modulePath, "utf8"));

      const memberPattern = new RegExp(
        `\\b${binding}\\.([A-Za-z_][A-Za-z0-9_]*)|\\b${binding}\\[\\s*["']([^"']+)["']\\s*\\]`,
        "g"
      );
      for (const use of source.matchAll(memberPattern)) {
        const key = use[1] ?? use[2];
        if (!moduleSelectors.has(key)) {
          failures.push(`${relative}: ${binding}.${key} has no .${key} rule in ${specifier}`);
        }
      }
    }
  }

  assert.deepEqual(failures, [], "unresolved CSS Module class references");
  // Phase 4 established the CSS Modules boundary (plan §4.1): every NEW surface
  // and primitive is scoped, because `.hero`, `.eyebrow`, `.brand`,
  // `.detail-page`, `.section-heading`, `.option-grid`, `.primary`, `.secondary`
  // and `.compact` are already taken globally and a new component using one of
  // those names would silently inherit blueprint geometry with no compile error.
  //
  // The count is asserted EXACTLY, not as a floor. It is the number of
  // `.module.css` IMPORT STATEMENTS across app/ and components/ — three shared
  // stylesheets (components/ui, components/wys, components/provenance) imported
  // by 25 primitives. A later phase that adds a primitive updates this number
  // deliberately; that is the point of the assertion, and it is what stops a
  // module quietly falling out of coverage.
  assert.equal(modulesChecked, 25, "CSS Module imports across app/ and components/ — update deliberately");
});

/* -------------------------------------------------------------------------- */
/* Mode 3 — globals.css selector -> some className (orphan-rule scan)         */
/* -------------------------------------------------------------------------- */

test("mode 3: every globals.css class selector is referenced by some className", () => {
  const referenced = new Set(allClassUses.map((use) => use.token));
  const orphans = [...globalSelectors].filter((selector) => !referenced.has(selector)).sort();

  const unexpected = orphans.filter((selector) => !ORPHAN_RULES.includes(selector));
  assert.deepEqual(unexpected, [], "globals.css rules referenced by no className and not allowlisted");

  const stale = ORPHAN_RULES.filter((selector) => !orphans.includes(selector));
  assert.deepEqual(stale, [], "ORPHAN_RULES entries that are now referenced — delete them from the register");
});

test("mode 3: the stylesheet parser does not invent selectors from declarations", () => {
  // The @import url(...) on line 1 must not contribute "googleapis" or "com".
  assert.ok(!globalSelectors.has("googleapis"));
  assert.ok(!globalSelectors.has("com"));
  assert.ok(globalSelectors.has("site-header"), "stylesheet parser missed a real selector");
  assert.ok(globalSelectors.size > 40, "stylesheet parser returned implausibly few selectors");
});
