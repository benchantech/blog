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
 * The two registers below were ALLOWLISTS OF KNOWN MISMATCHES, and they are
 * asserted EXACTLY, not as an upper bound: a stale entry fails the test. Phase
 * 10 resolved every entry and BOTH LISTS ARE NOW EMPTY, which is the state the
 * plan schedules them into — from here a mismatch in either direction is a
 * regression rather than a to-do. They stay two lists because
 * they are two different kinds of finding — a className→selector scan never
 * visits an orphan rule, so an orphan parked in UNRESOLVED_CLASSNAMES could
 * never be reported and would sit there forever.
 */

/**
 * className tokens applied in a `.tsx` with no rule anywhere.
 *
 * EMPTY, as of Phase 10, and it is asserted EXACTLY — a stale entry fails this
 * test, so a fix and its de-registration land together. The two Phase 0
 * findings were resolved by giving each class the job it was already claiming
 * to have, never by deleting a class from preserved markup:
 *
 *  - `hero-foyer` (app/page.tsx:8) now modifies the preserved foyer hero, which
 *    Q2's ratified stacking makes the SECOND hero on `/`: no top padding, and a
 *    headline in the 44px section register rather than the 66px page register.
 *  - `secondary` (app/page.tsx, the "I'm AI" button) now fills `--tint-grey`
 *    against `.audience-button.primary`'s ink, so the two hero buttons are a
 *    deliberate pair instead of asymmetric by accident.
 *
 * A NEW entry here is a regression, not a to-do. Add a rule or drop the class.
 */
const UNRESOLVED_CLASSNAMES: readonly string[] = [];

/**
 * globals.css class selectors referenced by no className.
 *
 * EMPTY, as of Phase 10. Both Phase 0 findings were rules with no consumer at
 * all — not markup that lost its styling, but styling that never had markup:
 *
 *  - `.hero-principle` (a complete max-width / margin / font block) is retired.
 *  - `.card-eyebrow` leaves the `.welcome-label, .eyebrow, .question-label,
 *    .room-number` caps-label group; the other four members are live and are
 *    untouched.
 *
 * No route, href, id, metadata title or word of copy is involved in either.
 * This list is kept SEPARATE from UNRESOLVED_CLASSNAMES on purpose: a
 * className -> selector scan never visits an orphan rule, so an orphan parked
 * in that list could never be reported and would sit there forever.
 */
/*
 * WITHDRAWN MARKUP, 2026-09-08 — the ONE reason an entry may sit here.
 *
 * Ben removed the routing foyer, the four-door floor plan and the intent
 * router from `/` ("we're consolidating until i can build it out more"). The
 * rules that styled them are KEPT rather than deleted, because the markup is
 * coming back and a stylesheet is cheaper to keep than to reconstruct — the
 * same call `home.module.css` records for `.instructor*`.
 *
 * That leaves eighteen rules in `globals.css` with no className pointing at
 * them, which is precisely the condition this register exists to name out loud
 * instead of letting a scan go quiet. Every entry below is a rule whose markup
 * was withdrawn in one commit, not a rule that never had markup — the two
 * findings this list held at Phase 0 were the latter and were both retired by
 * deletion.
 *
 * SELF-EXPIRING, and that is what keeps it honest: the `stale` assertion below
 * fails the moment one of these is referenced again, so restoring the foyer
 * cannot leave a lie parked here. If the markup is ever abandoned for good,
 * these rules should be deleted and this register should return to empty.
 */
const ORPHAN_RULES: readonly string[] = [
  /*
   * THE AI-NATIVE HOME PAGE REPLACED THE OLD ONE (2026-09-10), and took four
   * more rules' markup with it. The section it removed was the reviewer block
   * — `.stakeholder-section`, `.stakeholder-grid`, `.stakeholder-card` and the
   * `.compact` heading modifier. The reviewer routes themselves did NOT go
   * anywhere: `app/page.tsx` still renders `stakeholderRoutes`, now in the new
   * page's own card styles, so what was lost is four global rules and not two
   * destinations.
   *
   * Kept rather than deleted, like the foyer rules below: this register is
   * self-expiring, and the `stale` assertion fails the moment one of them is
   * referenced again.
   */
  "stakeholder-section",
  "stakeholder-grid",
  "stakeholder-card",
  "compact",
  // The foyer hero: label, headline, copy, signature, and the two buttons.
  "hero",
  "hero-foyer",
  "hero-copy",
  "hero-copy-block",
  "welcome-label",
  "signature-note",
  "audience-actions",
  "audience-button",
  "primary",
  "secondary",
  // The four-door floor plan.
  "destinations-section",
  "floor-plan",
  "plan-room",
  "plan-room-1",
  "plan-room-2",
  "plan-room-3",
  "plan-room-4",
  "room-number"
];

/**
 * Class names built at runtime from data. The static prefix before `${` is the
 * key; the expansion is the full set of values it can take. An unregistered
 * dynamic class is a hard failure, so a later phase must register it rather
 * than silently lose coverage for it.
 */
const DYNAMIC_CLASS_EXPANSIONS: Record<string, string[]> = {
  // `plan-room-${item.number}`, values 1-4 from content/site-config.ts
  // destinations[].number. The floor plan was withdrawn from `/` on
  // 2026-09-08, so nothing expands this today; the entry stays because the
  // markup is coming back and because the check it belongs to fires on
  // UNREGISTERED prefixes, which an empty register would still do.
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
  /*
   * FOUR OF THESE WERE REPLACED ON 2026-09-08, and the replacements were chosen
   * to keep the same three extractor features under test rather than to make
   * the list green. "hero", "audience-button", "plan-room-1" and "plan-room-4"
   * all belonged to the foyer and floor plan Ben withdrew from `/`, so a
   * scanner that had stopped working entirely would now pass on them.
   *
   *   - a MULTI-TOKEN attribute: `className="section-heading compact"` is the
   *     shape `"hero hero-foyer"` used to cover — one attribute, two tokens.
   *   - a CONDITIONAL: "active" / "complete" come from IntentRouter's ternary,
   *     which the component still contains even though `/` no longer mounts it.
   *   - a token from a `cx()` call and one from a bare string, so neither path
   *     can go quiet on its own.
   *
   * The `plan-room-` entry in DYNAMIC_CLASS_EXPANSIONS is now the register's
   * only member and its markup is withdrawn, so the dynamic-className path has
   * no live consumer. It is kept, not deleted: the check fires on any dynamic
   * class it does not recognise, so it is still load-bearing for the next one.
   */
  /*
   * THREE SAMPLES WERE REPOINTED ON 2026-09-10, and the reason is the same one
   * that has moved this list before: they named markup a rewrite removed.
   * "section-heading", "compact" and "stakeholder-card" all belonged to the old
   * home page, which the AI-native rewrite replaced — so a scanner that had
   * stopped working entirely would now pass on them.
   *
   * The replacements keep the same three extractor features under test: a
   * MULTI-TOKEN attribute (`className="detail-page legal-page"` on the seven
   * legal routes — one attribute, two tokens), a CONDITIONAL (IntentRouter's
   * "active" / "complete" ternary), and tokens from the chrome, which no home
   * page rewrite can take away.
   *
   * "hero" and "hero-foyer" are NOT usable as samples any more: they are in
   * `ORPHAN_RULES` above, because the AI-native rewrite removed the markup that
   * carried them. A sample has to be a token something still renders.
   */
  const tokens = new Set(allClassUses.map((use) => use.token));
  for (const expected of [
    "detail-page",
    "section-heading",
    "footer-group-label",
    "external-arrow",
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
  //
  // 25 -> 31 in Phase 5 (chrome): SiteHeader, DisclosureStrip, RouteStub and
  // StatusPage each import their own module, and the two Watch Your Step route
  // groups — `(shell)/layout.tsx` and `(flow)/layout.tsx` — both import
  // `app/watch-your-step/wys-groups.module.css`.
  //
  // 31 -> 35 in Phase 7 (shell): four shared course primitives — CourseScreen,
  // GatedText, ScenarioCard and JudgeCard — import
  // `components/wys/wys-primitives.module.css`. The five course views built on
  // top of them add their own imports and their own number.
  //
  // +4 in Phase 7 (Practice view): ReplayList, FromMemory, AppetiteCard and
  // PracticeSection import `components/wys/practice.module.css`. The Practice
  // page itself imports no stylesheet — its only structural class lives on
  // PracticeSection, so the page stays a pure composition of primitives.
  //
  // NOTE FOR THE MERGE: the five Phase 7 view builders each add their own
  // imports to this one number. It is a TOTAL, so a merge that takes one
  // builder's figure and drops another's will fail here rather than silently
  // lose a stylesheet from coverage. Re-measure at the gate; do not average.
  // Phase 7 (Today view) adds FIVE: page.tsx, WatchCard, CarryCard, CarryMark
  // and TimeBudgetNote each import app/watch-your-step/(shell)/today/today.module.css.
  // Phase 7 (Plan view) adds TWO: page.tsx and PlanStops.tsx import
  // app/watch-your-step/(shell)/plan/plan.module.css. Measured, not incremented
  // from the previous figure — see the merge note above.
  // Phase 7 (Progress view) adds ONE: ProgressView.tsx imports
  // app/watch-your-step/(shell)/progress/progress.module.css. The page imports
  // no stylesheet — every state-dependent mark on that screen is inside the one
  // client component, so there is nothing for the server half to style.
  // Phase 9 (ship surfaces) adds FIVE, re-measured at the gate with all five
  // route builders merged rather than summed from any one of them, exactly as
  // the merge note above requires: /bridge, /standing-orders, /ships-log,
  // /crew and /ben each import one page-level module and nothing else. The
  // four machine surfaces this phase also added — app/sitemap.ts,
  // app/robots.ts, app/llms.txt/route.ts and
  // app/author-ship/state.json/route.ts — import no stylesheet at all and
  // therefore move this figure by zero.
  // Phase 10 (home assimilation) adds THREE, measured rather than incremented:
  // `app/page.tsx` imports `app/home.module.css`, the `/watch-your-step` landing
  // imports `app/watch-your-step/(shell)/landing.module.css`, and
  // `components/wys/HeroDemo.tsx` — the one component both of those pages mount
  // (Q3) — imports `components/wys/wys-primitives.module.css`.
  // `components/wys/landing-stops.ts` is a pure module and imports no
  // stylesheet, so it moves this figure by zero.
  // 59 -> 68 -> 76. Developer Forward added nine CSS Module imports, then the YY
  // Method UI added eight more under components/developer-forward/yy/: the landing, the
  // sandbox shell and the case/reveal component sets. The number is pinned so
  // a new stylesheet cannot arrive unnoticed — bump it in the same commit that
  // adds one, never to make a red test green.
  // The GPT usage meter adds one component-owned CSS Module, taking the
  // deliberately measured total from 76 to 77.
  // The experiment and answer-surface renderers add two more shared module
  // imports, taking the deliberately measured total from 77 to 79.
  assert.equal(modulesChecked, 79, "CSS Module imports across app/ and components/ — update deliberately");
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
