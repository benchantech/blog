import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { case1 } from "@/content/developer-forward/yy/case-1";
import { case2 } from "@/content/developer-forward/yy/case-2";
import { case3 } from "@/content/developer-forward/yy/case-3";
import { case4 } from "@/content/developer-forward/yy/case-4";
import { case5 } from "@/content/developer-forward/yy/case-5";
import { APPROVED_BLURS, applyApprovedBlurs } from "@/content/developer-forward/yy/approved-blurs";
import { caseArtFor } from "@/content/developer-forward/yy/case-art";
import {
  EVIDENCE_TAGS,
  EVIDENCE_TAG_INDEX,
  RESONANCE_CAPABLE_TAGS,
  SINGLE_CHECKPOINT_TAGS,
  TAGGED_CHOICE_IDS,
  evidenceTagsForChoiceId
} from "@/content/developer-forward/yy/evidence-tags";
import {
  DECISION_LAYER_PROVENANCES,
  REVEAL_PROVENANCES,
  RESONANCE_THRESHOLD,
  YY_PROVENANCES,
  type YYCase,
  type YYProvenance
} from "@/lib/developer-forward/yy/types";

/**
 * THE COMPOSITING SEAM, ENFORCED.
 *
 * `docs/developer-forward-compositing-policy.md` records Ben's authorization to
 * composite case NARRATIVE so real clients cannot be identified, and his
 * instruction that the decision layer — choices, Ben THEN, Ben NOW, conditions —
 * "must stay intact especially the decision flow and reasoning".
 *
 * That policy, this repo's `types.ts`, and all five case files each state that a
 * test named `tests/developer-forward-yy-content.test.ts` enforces it. **It did not
 * exist.** Six files asserted a guard that was never written, and the seam was
 * correct only by hand — which is the failure commit 39f9803 named ("checks that
 * were green while what they guarded was false"), one step worse, because an
 * absent check cannot even go red.
 *
 * This is that file. It is deliberately built to fail on the two things that
 * would actually destroy the product:
 *
 *   1. a decision-layer field drifting from Ben's source by even one character;
 *   2. a decision-layer field being marked as composited.
 *
 * Both are checked against the canonical source document, not against a fixture
 * copied from the implementation — a fixture would drift with the bug.
 */

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
/** The YY components, read as text: the runner cannot import a `.css` importer. */
const yyDir = path.join(repoRoot, "components", "developer-forward", "yy");

/**
 * The canonical source lives outside the repo, in the handoff bundle.
 *
 * If it is absent (a fresh clone, CI without the bundle), the byte-identity
 * tests SKIP rather than pass. A skipped check reports itself; a check that
 * silently passes when it cannot see its evidence is worse than no check, and
 * is precisely what this file exists to stop happening again.
 */
const SOURCE_PATH =
  "/Users/benchan/yy/bct-facelift/YY_REDO_V1/Developer Forward Lite — YY Method Cases 1–5 Implementation Source.md";

function sourceText(): string | null {
  try {
    return readFileSync(SOURCE_PATH, "utf8");
  } catch {
    return null;
  }
}

const CASES: readonly YYCase[] = [case1, case2, case3, case4, case5];

/** Whitespace-insensitive compare: the shipped strings are line-wrapped. */
function normalise(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Every CAPTURE / NEXT CAPTURE narrative block in Ben's source, in order.
 *
 * READS THE WHOLE BLOCKQUOTE, INCLUDING CONTINUATION LINES. An earlier version
 * matched `> (.+)` and took the first line only. Ben's source separates
 * paragraphs inside a blockquote with a bare `>` — no trailing space — so that
 * pattern stopped at the blank line and silently dropped every paragraph after
 * the first.
 *
 * It cost a real paragraph: case 2's checkpoint 4 shipped 43 words instead of
 * 120, losing the discovery that the packages were approaching end-of-life and
 * that Ben intended to bring options and a recommendation back to the client.
 * That is decision pressure, and it vanished silently.
 *
 * It was invisible because the extraction that BUILT the content and the check
 * that VERIFIED it used the same faulty pattern, so they agreed with each other
 * while both were wrong. A verifier must not share a parser with the thing it
 * verifies; this one now reads the raw blockquote.
 */
function collectSourceNarratives(source: string): string[] {
  const out: string[] = [];
  const pattern = /(?:### CAPTURE[^\n]*|## NEXT CAPTURE[^\n]*)\n\n((?:>.*\n)+)/g;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(source)) !== null) {
    const paragraphs: string[] = [];
    let current: string[] = [];
    for (const line of m[1].replace(/\n$/, "").split("\n")) {
      const body = line.slice(1).trim();
      if (body === "") {
        if (current.length > 0) paragraphs.push(current.join(" "));
        current = [];
      } else {
        current.push(body);
      }
    }
    if (current.length > 0) paragraphs.push(current.join(" "));
    out.push(paragraphs.join("\n\n"));
  }
  return out;
}

/**
 * Every narrative block carries at least as many words as its source block.
 *
 * A separate assertion from the equality check on purpose: equality already
 * implies it, but this one names the failure mode in its message, and a
 * truncation is the one corruption that reads as perfectly good prose.
 */
function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Every decision-layer string, with a label naming where it came from. */
/*
 * THE DECISION LAYER HAS TWO RULES AS OF 2026-09-09, so the walker reports
 * which one each field is under. Options and conditions are the case's own
 * material and stay Ben-only; Ben THEN and Ben NOW are his judgment in prose
 * that may be AI-written from it. See `REVEAL_PROVENANCES`.
 */
type DecisionField = {
  where: string;
  text: string;
  provenance: YYProvenance;
  allowed: readonly YYProvenance[];
};

function decisionLayerFields(): DecisionField[] {
  const out: DecisionField[] = [];
  for (const c of CASES) {
    for (const cp of c.checkpoints) {
      for (const choice of cp.choices) {
        out.push({
          where: `${cp.id} choice ${choice.label}`,
          text: choice.text,
          provenance: choice.provenance,
          allowed: DECISION_LAYER_PROVENANCES
        });
      }
      out.push({
        where: `${cp.id} BEN THEN`,
        text: cp.benThen.reasoning,
        provenance: cp.benThen.provenance,
        allowed: REVEAL_PROVENANCES
      });
      out.push({
        where: `${cp.id} BEN NOW`,
        text: cp.benNow.reasoning,
        provenance: cp.benNow.provenance,
        allowed: REVEAL_PROVENANCES
      });
      for (const cond of cp.conditions) {
        out.push({
          where: `${cp.id} condition ${cond.label}`,
          text: cond.condition,
          provenance: cond.provenance,
          allowed: DECISION_LAYER_PROVENANCES
        });
      }
    }
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* 0. The guard that runs even without the source                             */
/* -------------------------------------------------------------------------- */

/**
 * A SKIPPED CHECK IS NOT A PASSING CHECK, AND A GREEN SUITE MUST NOT MEAN
 * "NOTHING WAS VERIFIED".
 *
 * The canonical source lives outside this repo, at an absolute path on one
 * machine. Every check below that compares against it degrades to `t.skip` when
 * it is missing — and a review found the consequence: repoint that path and the
 * file reports 7 passed, 4 skipped, 0 failed. Green, with the guarantee absent.
 * Five case files meanwhile stated flatly that an unapproved change "fails the
 * build". On any machine but Ben's, it did not.
 *
 * That is the exact defect commit 39f9803 was written about, so it does not get
 * to survive here. `text-fixture.json` carries the SHA-256 of every
 * learner-facing string, generated while the source WAS present and full
 * verification passed. It needs no external file, so it runs everywhere.
 *
 * It is a weaker claim than the source comparison — it proves the text has not
 * DRIFTED since it was verified, not that it matches Ben's document today — and
 * that is precisely why both exist. There is now no configuration in which
 * nothing checks the text.
 */
const FIXTURE = JSON.parse(
  readFileSync(path.join(repoRoot, "content/developer-forward/yy/text-fixture.json"), "utf8")
) as { count: number; hashes: Record<string, string> };

function digest(text: string): string {
  return createHash("sha256").update(text.replace(/\s+/g, " ").trim()).digest("hex");
}

test("every learner-facing string matches the committed fixture", () => {
  const drift: string[] = [];
  const seen = new Set<string>();
  const check = (key: string, text: string) => {
    seen.add(key);
    const want = FIXTURE.hashes[key];
    if (want === undefined) drift.push(`${key}: not in fixture — new text arrived unverified`);
    else if (want !== digest(text)) drift.push(`${key}: text changed since it was verified`);
  };
  for (const c of CASES) {
    /*
     * THE TITLE WAS NOT COVERED UNTIL 2026-09-09, and the gap was found by
     * walking through it: three case titles were rewritten and this file
     * reported 726 passed. A title is learner-facing text — `CheckpointScreen`
     * renders it above EVERY checkpoint in its case and `renderEnding` shows it
     * again — so it was the most-displayed string in the run and the only one
     * outside the fixture. It is covered now, which is why the fixture holds
     * 138 entries rather than 133.
     */
    check(`title:${c.id}`, c.title);
    check(`ending:${c.id}`, c.ending);
    for (const cp of c.checkpoints) {
      check(`capture:${cp.id}`, cp.capture);
      for (const ch of cp.choices) check(`choice:${ch.id}`, ch.text);
      check(`then:${cp.id}`, cp.benThen.reasoning);
      check(`now:${cp.id}`, cp.benNow.reasoning);
      for (const cd of cp.conditions) check(`cond:${cp.id}:${cd.label}`, cd.condition);
    }
  }
  assert.deepEqual(drift, [], "learner-facing text drifted from the verified fixture");
  // A fixture entry with nothing to check is a check that quietly stopped running.
  const orphans = Object.keys(FIXTURE.hashes).filter((k) => !seen.has(k));
  assert.deepEqual(orphans, [], "fixture entries no longer covered by any content");
  assert.equal(seen.size, FIXTURE.count, "fixture count and covered strings disagree");
});

/* -------------------------------------------------------------------------- */
/* 1. The decision layer may never be composited                              */
/* -------------------------------------------------------------------------- */

test("no decision-layer field is marked composite", () => {
  const offenders: string[] = [];
  for (const field of decisionLayerFields()) {
    if (!field.allowed.includes(field.provenance)) {
      offenders.push(`${field.where}: ${field.provenance}`);
    }
  }

  /*
   * AND THE HALF THE SPLIT COULD LOSE. Widening the reveal's list is only safe
   * while the OPTIONS keep the narrow one, so that is asserted directly rather
   * than left to the loop above — a future edit that pointed choices at
   * `REVEAL_PROVENANCES` would pass every check in that loop.
   */
  assert.deepEqual(
    [...DECISION_LAYER_PROVENANCES],
    ["ben_authored"],
    "the option/condition rule widened; an AI-written option makes the exercise a test of AI, not of Ben's work"
  );
  assert.equal(
    REVEAL_PROVENANCES.includes("ben_authored_composite"),
    false,
    "a composited Ben THEN or Ben NOW would make the product's central claim untrue (docs/adr/0002)"
  );
  assert.deepEqual(
    offenders,
    [],
    "Ben authorized compositing of NARRATIVE ONLY. Ben THEN and Ben NOW are facts about his own " +
      "judgment, not about any client; compositing them would make the product's central claim " +
      "untrue. Reversing this needs a new authorization, not a test edit."
  );
});

test("the guard covers every decision-layer field, so it cannot pass vacuously", () => {
  // 17 checkpoints x 4 choices, plus a THEN and a NOW each.
  const fields = decisionLayerFields();
  const choices = fields.filter((f) => f.where.includes("choice")).length;
  const judgments = fields.filter((f) => f.where.includes("BEN")).length;
  assert.equal(choices, 68, "expected 4 choices across each of 17 checkpoints");
  assert.equal(judgments, 34, "expected a Ben THEN and a Ben NOW for each of 17 checkpoints");
  assert.ok(fields.length >= 102, `only ${fields.length} decision-layer fields were collected`);
});

/* -------------------------------------------------------------------------- */
/* 2. The decision layer is byte-identical to Ben's source                    */
/* -------------------------------------------------------------------------- */

test("every decision-layer string appears verbatim in the canonical source", (t) => {
  const source = sourceText();
  if (source === null) {
    t.skip(`canonical source not present at ${SOURCE_PATH} — byte-identity NOT verified`);
    return;
  }
  /*
   * Compared PARAGRAPH BY PARAGRAPH, not as one blob.
   *
   * The source formats a Ben judgment as a bold label line, a blank line, then
   * the reasoning. Case 3 checkpoint 3 is the one place where that label line
   * carries a whole sentence — "D remains the governing authority decision." —
   * rather than a bare letter, and the implementation joins it to the reasoning
   * with a blank line because `ChoiceLabel` can only hold "D".
   *
   * That is a lawful re-join of Ben's own words, not an edit, and a whole-blob
   * check would fail on it while catching nothing real. Checking each paragraph
   * keeps the strictness where it belongs: a changed hyphen, a tidied capital or
   * an invented clause still fails, because that paragraph will not be found.
   */
  const missing: string[] = [];
  for (const field of decisionLayerFields()) {
    for (const paragraph of field.text.split(/\n{2,}/)) {
      const text = paragraph.trim();
      if (text.length === 0) continue; // two THEN reasonings are genuinely empty in the source
      if (!source.includes(text)) missing.push(`${field.where}: ${text.slice(0, 70)}…`);
    }
  }
  assert.deepEqual(
    missing,
    [],
    "a decision-layer string is not present verbatim in Ben's source document. Even a changed " +
      "hyphen or a tidied capital counts: this layer is his, and it is preserved exactly."
  );
});

/* -------------------------------------------------------------------------- */
/* 3. Narrative provenance is honest in both directions                       */
/* -------------------------------------------------------------------------- */

test("the shipped narrative is Ben's source plus EXACTLY the approved blurs", (t) => {
  const source = sourceText();
  if (source === null) {
    t.skip("canonical source not present — narrative fidelity NOT verified");
    return;
  }

  /*
   * THE GUARANTEE, AND WHY IT IS A DIFF RATHER THAN A TAG.
   *
   * Ben's instruction was "narrowly blur but maintain ben authored". He reviewed
   * and approved each of the six substitutions individually, so the shipped text
   * is his — a `ben_authored_composite` tag would understate its authority.
   *
   * But Ben-authored cannot mean unchecked. So the guarantee is stated as a
   * diff: take his source, apply the six approved substitutions, and the result
   * must equal what ships, exactly. A seventh change anywhere — a tightened
   * clause, a dropped subordinate, a "tidied" number — fails here.
   *
   * That is strictly stronger than the tag it replaces. A tag says "something
   * was changed". This says "precisely this was changed, and nothing else" —
   * which is the property that actually protects the cases, because the earlier
   * pass's real damage was not mislabelled provenance. It was prose-tightening
   * that quietly deleted decision pressure while every tag stayed correct.
   */
  const narratives = collectSourceNarratives(source);
  const failures: string[] = [];

  for (const c of CASES) {
    for (const cp of c.checkpoints) {
      const shipped = normalise(cp.capture);
      const match = narratives.find((n) => {
        const expected = normalise(applyApprovedBlurs(n, c.id));
        return expected === shipped;
      });
      if (match === undefined) {
        failures.push(
          `${cp.id}: shipped narrative is not any source block with the approved blurs applied`
        );
      }
    }
  }

  assert.deepEqual(
    failures,
    [],
    "A narrative differs from Ben's source by something other than the six approved blurs. " +
      "Every substitution must be registered in content/developer-forward/yy/approved-blurs.ts and " +
      "approved by Ben; nothing may be tightened, smoothed or dropped in passing."
  );
});

test("every approved blur is actually used, and none is a no-op", (t) => {
  const source = sourceText();
  if (source === null) {
    t.skip("canonical source not present — blur registry NOT verified");
    return;
  }
  // A stale registry entry is as much a lie as an unregistered change: it claims
  // a protection that is not being applied to anything.
  for (const blur of APPROVED_BLURS) {
    assert.ok(
      source.includes(blur.from),
      `approved blur is stale — "${blur.from.slice(0, 50)}…" is not in Ben's source`
    );
    assert.notEqual(blur.from, blur.to, "a blur that changes nothing is not a blur");
    assert.ok(blur.reason.trim().length > 0, `${blur.caseId}: blur has no recorded reason`);
  }
  const shipped = CASES.flatMap((c) => c.checkpoints.map((cp) => cp.capture)).join("\n");
  for (const blur of APPROVED_BLURS) {
    assert.equal(
      shipped.includes(blur.from),
      false,
      `"${blur.from.slice(0, 50)}…" still ships unblurred`
    );
  }
});

test("no narrative carries a composite provenance now that blurs are Ben-approved", () => {
  for (const c of CASES) {
    for (const cp of c.checkpoints) {
      assert.notEqual(
        cp.captureProvenance,
        "ben_authored_composite",
        `${cp.id}: Ben approved each blur individually, so the text is ben_authored`
      );
    }
  }
});

test("no narrative is truncated relative to its source block", (t) => {
  const source = sourceText();
  if (source === null) {
    t.skip("canonical source not present — truncation NOT verified");
    return;
  }
  const narratives = collectSourceNarratives(source);
  const shortest = Math.min(...narratives.map(wordCount));
  assert.ok(shortest > 0, "source extraction returned an empty block");
  for (const c of CASES) {
    for (const cp of c.checkpoints) {
      const shipped = wordCount(cp.capture);
      const match = narratives.find((n) => normalise(applyApprovedBlurs(n, c.id)) === normalise(cp.capture));
      assert.ok(
        match !== undefined,
        `${cp.id}: no source block matches — ${shipped} words shipped. A dropped paragraph reads ` +
          "as good prose and is invisible without this check."
      );
    }
  }
});

test("every provenance value is a declared one", () => {
  for (const c of CASES) {
    for (const cp of c.checkpoints) {
      assert.ok(YY_PROVENANCES.includes(cp.captureProvenance), `${cp.id}: ${cp.captureProvenance}`);
    }
    assert.ok(YY_PROVENANCES.includes(c.endingProvenance), `${c.id} ending`);
  }
});

/* -------------------------------------------------------------------------- */
/* 4. Structure                                                               */
/* -------------------------------------------------------------------------- */

test("the corpus is five cases and seventeen checkpoints", () => {
  assert.equal(CASES.length, 5);
  assert.deepEqual(CASES.map((c) => c.checkpoints.length), [3, 4, 4, 3, 3]);
  assert.equal(CASES.reduce((n, c) => n + c.checkpoints.length, 0), 17);
});

test("every checkpoint offers four labelled choices and both Ben judgments", () => {
  for (const c of CASES) {
    for (const cp of c.checkpoints) {
      assert.deepEqual(cp.choices.map((x) => x.label), ["A", "B", "C", "D"], cp.id);
      assert.equal(new Set(cp.choices.map((x) => x.id)).size, 4, `${cp.id} has duplicate choice ids`);
      assert.ok(cp.benThen.choiceLabel, `${cp.id} has no Ben THEN`);
      assert.ok(cp.benNow.choiceLabel, `${cp.id} has no Ben NOW`);
    }
  }
});

test("CAPTURE never leaks Ben's judgment before the learner commits", () => {
  // The reveal boundary is the point of CAPTURE. A capture that names Ben's
  // choice turns the learner's judgment into reading comprehension.
  for (const c of CASES) {
    for (const cp of c.checkpoints) {
      const lowered = cp.capture.toLowerCase();
      for (const leak of ["ben then", "ben now", "i chose", "the right answer", "the correct"]) {
        assert.equal(lowered.includes(leak), false, `${cp.id} capture leaks "${leak}"`);
      }
    }
  }
});

/* -------------------------------------------------------------------------- */
/* 5. The evidence-tag taxonomy                                               */
/* -------------------------------------------------------------------------- */

/**
 * Tags are what the resonance engine counts, so a wrong tag is a wrong pattern
 * shown to a learner as evidence about themselves. They get checked here rather
 * than nowhere: this file is the declared guard for the whole YY subtree, and
 * `tests/developer-forward-content.test.ts` asserts that claim is true by requiring
 * this file to actually reference each module it covers.
 */

test("every tagged choice id belongs to a real choice", () => {
  const real = new Set(CASES.flatMap((c) => c.checkpoints.flatMap((cp) => cp.choices.map((ch) => ch.id))));
  const unknown = TAGGED_CHOICE_IDS.filter((id) => !real.has(id));
  assert.deepEqual(unknown, [], "the tag table references choice ids that do not exist");
  assert.equal(real.size, 68, "expected 68 choices across 17 checkpoints");
});

test("a tag carried by one checkpoint can never resonate, and is declared as such", () => {
  /*
   * The two-tuning-fork rule means a tag appearing in a single checkpoint is
   * structurally incapable of producing a resonance. That is signal about the
   * instrument, not a defect — and the honest response is to NAME those tags,
   * not to merge them with others until something lights up. Merging to
   * manufacture a resonance would be the most damaging possible edit here,
   * because it would look like the product working.
   */
  const byTag = new Map<string, Set<string>>();
  for (const c of CASES) {
    for (const cp of c.checkpoints) {
      for (const ch of cp.choices) {
        for (const tag of evidenceTagsForChoiceId(ch.id) ?? []) {
          const set = byTag.get(tag) ?? new Set<string>();
          set.add(cp.id);
          byTag.set(tag, set);
        }
      }
    }
  }
  const single = [...byTag.entries()].filter(([, cps]) => cps.size < RESONANCE_THRESHOLD).map(([t]) => t);
  const capable = [...byTag.entries()].filter(([, cps]) => cps.size >= RESONANCE_THRESHOLD).map(([t]) => t);

  assert.deepEqual(
    [...single].sort(),
    [...SINGLE_CHECKPOINT_TAGS].sort(),
    "the declared single-checkpoint tags disagree with the actual tag distribution"
  );
  assert.deepEqual(
    [...capable].sort(),
    [...RESONANCE_CAPABLE_TAGS].sort(),
    "the declared resonance-capable tags disagree with the actual tag distribution"
  );
  assert.ok(capable.length > 0, "no tag can resonate — the instrument would never surface a pattern");
});

test("every declared tag has a definition and appears on at least one choice", () => {
  for (const tag of EVIDENCE_TAGS) {
    assert.ok(Object.hasOwn(EVIDENCE_TAG_INDEX, tag), `${tag} has no definition`);
    assert.ok(
      TAGGED_CHOICE_IDS.some((id) => (evidenceTagsForChoiceId(id) ?? []).includes(tag)),
      `${tag} is declared but carried by no choice — a vocabulary entry that guards nothing`
    );
  }
});

/* -------------------------------------------------------------------------- */
/* 6. The opening illustrations                                               */
/* -------------------------------------------------------------------------- */

/**
 * `content/developer-forward/yy/case-art.ts` — five scenes, one per case.
 *
 * THE ALT TEXT IS THE POINT OF THIS TEST. Ben's instruction was that the
 * picture lands "above the first paragraph of each case so they see it first
 * before they read", which makes it the first thing in the case — and a reader
 * who cannot see it would start with less than a reader who can unless the
 * description carries the same setting. So an empty `alt` is a failure here
 * rather than the decorative default it is elsewhere on this site.
 *
 * The files are asserted to EXIST because a `<picture>` with a missing source
 * fails silently: the layout still reserves its box, the page still renders,
 * and the only symptom is a scene nobody sees. Both variants, because the
 * mobile one is served to phones alone and would be the last to be noticed.
 */
test("every case has an opening illustration, with both files on disk and real alt text", () => {
  const seen = new Set<string>();
  for (const c of CASES) {
    const art = caseArtFor(c.id);
    assert.ok(art, `${c.id} has no opening illustration`);
    if (!art) continue;
    seen.add(c.id);

    for (const src of [art.desktop, art.mobile]) {
      assert.ok(src.startsWith("/"), `${c.id}: ${src} is not a site-absolute path`);
      assert.ok(
        existsSync(path.join(repoRoot, "public", src.slice(1))),
        `${c.id}: ${src} is referenced but not in public/ — a <picture> fails silently`
      );
    }

    // A description, not a filename and not a label.
    assert.ok(art.alt.trim().length > 0, `${c.id} ships an empty alt on a non-decorative image`);
    assert.ok(
      art.alt.split(/\s+/).length >= 20,
      `${c.id}'s alt is too short to stand in for the picture: "${art.alt}"`
    );
    assert.equal(/\.webp|\.png|image of|picture of/i.test(art.alt), false, `${c.id}'s alt describes the file, not the scene`);

    // The intrinsic size the layout reserves has to be the real one.
    assert.ok(art.width > 0 && art.height > 0, `${c.id} declares no intrinsic size`);
  }
  assert.equal(seen.size, CASES.length, "a case lost its illustration");

  // Five cases, five distinct images — a copy-paste would show the wrong scene.
  const sources = CASES.map((c) => caseArtFor(c.id)?.desktop);
  assert.equal(new Set(sources).size, CASES.length, "two cases share an illustration");
});

/**
 * The scene is set ONCE, on checkpoint 1.
 *
 * Ben asked for it "just above the first paragraph of each case", and then
 * narrowed it himself: "it only shows on the first step of each case, then
 * hides." Repeating it above checkpoints 2, 3 and 4 would re-establish a
 * setting the learner is already inside, and would push the situation they are
 * being asked to judge below the fold on a phone.
 *
 * Asserted from source, since the runner cannot import a component. What the
 * scan holds is the ordinal test itself — the component has no opinion about
 * ordinals by design, so if the caller stops checking, nothing else will.
 */
test("the opening illustration renders on the first checkpoint of a case and no other", () => {
  const sandbox = readFileSync(path.join(yyDir, "YYSandbox.tsx"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^\s*\/\/.*$/gm, " ");
  assert.match(
    sandbox,
    /art=\{checkpoint\.ordinal === 1 \? caseArtFor\(kase\.id\) : null\}/,
    "the sandbox no longer gates the illustration on the first checkpoint"
  );

  const screen = readFileSync(path.join(yyDir, "CheckpointScreen.tsx"), "utf8");
  assert.match(screen, /art = null/, "the art prop lost its null default; a caller that forgets would repeat the scene");
  assert.match(screen, /loading="lazy"/, "the illustrations load eagerly; four of five belong to unreached cases");
  assert.match(screen, /width=\{art\.width\}/, "no intrinsic width — the capture will jump as the image arrives");
});
