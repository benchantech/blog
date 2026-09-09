import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { case1 } from "@/content/developer-forward/yy/case-1";
import { isRevealUnlocked } from "@/lib/developer-forward/yy/records";

/**
 * THE REVEAL BOUNDARY.
 *
 * Ben THEN and Ben NOW must be unreachable until the learner commits. CAPTURE
 * exists to protect the historical decision boundary; a leak turns the
 * learner's judgment into reading comprehension, which is the one failure that
 * would make every downstream artifact — receipts, resonances, the export —
 * evidence of nothing.
 *
 * A review verified this by rendering the component through `react-dom/server`
 * and by scanning 72 built HTML files. Both are stronger than what a test in
 * this repo can do — the suite runs as `node --import tsx --test tests/*.test.ts`
 * and cannot import a component, because a `.module.css` specifier takes the
 * whole file down with `ERR_UNKNOWN_FILE_EXTENSION`.
 *
 * So the invariant was guarded by review alone, and review does not run on the
 * next change. This file guards the two halves that ARE reachable from here:
 * the pure gate every render path funnels through, and a static check that no
 * component outside the reveal can name Ben at all.
 */

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const yyDir = path.join(repoRoot, "components", "developer-forward", "yy");

const checkpoint = case1.checkpoints[0];
const committed = {
  caseId: checkpoint.caseId,
  checkpointId: checkpoint.id,
  runId: "run_test",
  capture: { canonicalSituationId: checkpoint.id },
  why: { choiceId: checkpoint.choices[0].id },
  whyNot: { closestAlternativeChoiceId: checkpoint.choices[1].id },
  commit: { committedAtLocal: "2026-09-08T10:00:00-04:00" },
  timestamp: { benThenChoiceId: checkpoint.choices[2].id }
};

/* -------------------------------------------------------------------------- */
/* 1. The gate refuses everything that is not a committed judgment            */
/* -------------------------------------------------------------------------- */

test("isRevealUnlocked accepts a committed record and refuses every near-miss", () => {
  assert.equal(isRevealUnlocked(committed), true, "a well-formed committed record must unlock");

  const refusals: [string, unknown][] = [
    ["null", null],
    ["undefined", undefined],
    ["a string", "committed"],
    ["an array", []],
    ["no commit block", { ...committed, commit: undefined }],
    ["an empty commit timestamp", { ...committed, commit: { committedAtLocal: "   " } }],
    ["no why", { ...committed, why: undefined }],
    ["no why-not", { ...committed, whyNot: undefined }],
    /*
     * The one that mattered. WHY equal to WHY-NOT is not a commitment — the
     * learner has not named a closest ALTERNATIVE, they have named their own
     * choice twice. `resonance.ts` used to accept it while receipt building
     * refused it, so a resonance could count a fork whose evidence did not
     * exist. Both paths now ask this function.
     */
    ["why equal to why-not", { ...committed, whyNot: { closestAlternativeChoiceId: committed.why.choiceId } }],
    ["a missing runId", { ...committed, runId: "" }],
    ["a missing checkpointId", { ...committed, checkpointId: "" }]
  ];

  for (const [name, record] of refusals) {
    assert.equal(isRevealUnlocked(record as never), false, `${name} must not unlock the reveal`);
  }
});

/* -------------------------------------------------------------------------- */
/* 2. Only the reveal may name Ben                                            */
/* -------------------------------------------------------------------------- */

function componentFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (full.endsWith(".tsx")) out.push(full);
    }
  };
  walk(yyDir);
  return out;
}

test("no component outside the reveal reads Ben's judgment", () => {
  /*
   * A component that never receives the data cannot leak it, whatever its
   * render logic does later. This is the structural half of the guarantee: the
   * gate above stops a bad record, and this stops the data reaching a surface
   * that has no gate at all.
   */
  const allowed = new Set(["RevealPanel.tsx"]);
  const offenders: string[] = [];
  for (const file of componentFiles()) {
    const name = path.basename(file);
    if (allowed.has(name)) continue;
    const code = readFileSync(file, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/^\s*\/\/.*$/gm, " ");
    for (const field of ["benThen", "benNow", ".conditions"]) {
      if (code.includes(field)) offenders.push(`${name}: reads ${field}`);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    "only RevealPanel may read Ben's judgment. A component that holds it can leak it."
  );
});

test("the reveal is mounted conditionally, never hidden with CSS", () => {
  /*
   * A rendered-then-hidden panel is still in the served HTML and still readable
   * from the inspector or the accessibility tree. Hiding is not gating.
   */
  const sandbox = readFileSync(path.join(yyDir, "YYSandbox.tsx"), "utf8");
  // Match the JSX element, not a prop list quoted in a doc comment.
  const code = sandbox.replace(/\/\*[\s\S]*?\*\//g, " ");
  const mounts = [...code.matchAll(/<RevealPanel[\s\S]*?\/>/g)];
  assert.equal(mounts.length, 1, "RevealPanel should be mounted exactly once");
  const mount = mounts[0];
  assert.ok(
    /\{\s*committed[A-Za-z]*\s*\?/.test(sandbox),
    "RevealPanel must be behind a conditional mount on a committed record"
  );
  assert.ok(mount[0].includes("runId="), "the reveal must be scoped to the CURRENT run, not any run");

  const panelRaw = readFileSync(path.join(yyDir, "RevealPanel.tsx"), "utf8");
  /*
   * Strip comments before scanning for hiding techniques. The panel's own
   * header states that it contains no `display: none` branch — and a raw scan
   * fires on that sentence, failing a correct file for documenting itself. The
   * repo hits this often enough to keep a `stripComments` helper for it.
   */
  const panel = panelRaw.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
  assert.ok(panelRaw.includes("isRevealUnlocked"), "RevealPanel must gate on the record itself");
  assert.ok(
    panelRaw.includes("record.runId !== runId"),
    "RevealPanel must refuse a record from another run — it does not trust its caller"
  );
  for (const hide of ["display: none", "visibility: hidden", "aria-hidden"]) {
    assert.equal(panel.includes(hide), false, `RevealPanel uses ${hide} — hiding is not gating`);
  }
});

/**
 * The step transition starts at the top of the page, and does so ONCE.
 *
 * This is asserted by reading the source because the runner cannot load a
 * component — `node --import tsx --test` has no CSS loader, so no test in this
 * repo may import anything under `components/`. What is checkable from text is
 * the shape of the guard, and the shape is the whole risk: an unguarded
 * `window.scrollTo` inside a component that re-renders on every keystroke would
 * pin the viewport to the top while a learner types their WHY, and it would do
 * it silently — the page would simply refuse to stay where they put it.
 *
 * THREE PROPERTIES, EACH A SEPARATE WAY TO GET THIS WRONG:
 *
 *  1. The call is inside an effect keyed on the screen, not on every render.
 *  2. A ref holds the previous screen, so a re-render at the same screen is not
 *     a transition. Without it, any state change would scroll.
 *  3. The first observed screen does not scroll. `resumePhase` can hydrate a
 *     returning learner into the middle of case 2, and scrolling on arrival
 *     fights the browser's own restored scroll position.
 *
 * The `behavior` check is the fourth: `app/globals.css` sets
 * `html { scroll-behavior: smooth }` paired with a `prefers-reduced-motion`
 * override, and passing an explicit `behavior: "smooth"` here would override
 * that pairing from inside a component — turning a published accessibility
 * claim into a lie for the one surface where the scrolling actually happens.
 */
test("a new step scrolls to the top once, never on re-render and never on resume", () => {
  const raw = readFileSync(path.join(yyDir, "YYSandbox.tsx"), "utf8");
  const code = raw.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

  const calls = [...code.matchAll(/window\.scrollTo\(([^)]*)\)/g)];
  assert.equal(calls.length, 1, "the sandbox should scroll from exactly one place");

  assert.equal(
    /behavior/.test(calls[0][1]),
    false,
    "scrollTo must not name a behavior — it inherits html { scroll-behavior } and its reduced-motion pair"
  );

  // The effect that owns the call, from `useEffect(` to its dependency array.
  const effect = code.slice(0, code.indexOf("window.scrollTo")).lastIndexOf("useEffect(");
  assert.ok(effect !== -1, "the scroll must happen inside an effect, not during render");
  const tail = code.slice(effect);
  const body = tail.slice(0, tail.indexOf("}, ["));
  const deps = tail.slice(tail.indexOf("}, ["), tail.indexOf("]", tail.indexOf("}, [")) + 1);

  assert.ok(deps.includes("screenKey"), `the scroll effect must be keyed on the screen; deps were ${deps}`);
  assert.ok(
    /scrolledFromRef\.current/.test(body),
    "the effect must compare against the previous screen held in a ref, or it fires on every render"
  );
  assert.ok(
    /previous === null/.test(body),
    "the first observed screen must not scroll — a resumed learner arrives mid-run"
  );

  // `screenKey` must not carry the run id: it resolves from null to a real
  // value on the first render after `openCase`, which would scroll twice.
  const key = code.slice(code.indexOf("const screenKey"), code.indexOf("const scrolledFromRef"));
  assert.equal(
    /activeRunId/.test(key),
    false,
    "screenKey must not depend on activeRunId — it resolves late and would fire a second scroll"
  );
});
