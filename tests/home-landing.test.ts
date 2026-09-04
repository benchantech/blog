import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { heroDemoDistribution, landingAntiFeatures, landingCopyRecords, landingLabels } from "@/content/watch-your-step/landing";
import { landingStopCells, landingStopPeek } from "@/components/wys/landing-stops";
import { stopCount } from "@/content/watch-your-step/weeks";
import { wysLabels } from "@/content/watch-your-step/copy";
import { lessonZeroCta } from "@/content/nav";
import { policyForCanonicalText } from "@/lib/canonical-text";

/**
 * Phase 10 — `/` and `/watch-your-step` (plan Phase 10; mockup `4a`).
 *
 * Two things this file exists to catch, neither of which any other test can
 * see:
 *
 *  1. **A preserved element disappearing from `/` by omission.** The home page
 *     is now two compositions on one URL and the new half is the one being
 *     edited; `tests/preserved-surfaces.test.ts` asserts the routes, the hrefs
 *     and the anchors, but not the foyer's own copy. Every string, id, class
 *     and href of the preserved half is asserted here, so "nothing removed,
 *     nothing relocated" is executed rather than eyeballed.
 *  2. **The hero demo quietly becoming a second copy of the pitch.** Q3 is
 *     ratified: `/` mounts the SAME component bound to the SAME content object
 *     as `/watch-your-step`. That is a claim about the code, and it is checked
 *     as one.
 */

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative: string): string => readFileSync(path.join(repoRoot, relative), "utf8");

const homePage = read("app/page.tsx");
const landingPage = read("app/watch-your-step/(shell)/page.tsx");
const heroDemo = read("components/wys/HeroDemo.tsx");

/* -------------------------------------------------------------------------- */
/* The preserved half of `/`                                                  */
/* -------------------------------------------------------------------------- */

/** Every line of copy the plan §3.1 enumeration names, verbatim. */
const PRESERVED_HOME_COPY: readonly string[] = [
  "Routing foyer · Sheet A-01",
  "Come on in - even if you&apos;re AI.",
  "Welcome to a system overview of what I&apos;m building, piece by piece, using AI and my years of technical",
  "judgment. It&apos;s not the prettiest site by far... but the foundation is solid underneath.",
  "I built the whole thing in plain sight, so yes, you can see the framing. That&apos;s the point.",
  " - B.C.",
  "I&apos;m human",
  "I think, choose, and decide.",
  "I&apos;m AI",
  "I execute, retrieve, and compose.",
  "The ecosystem has four stable doors.",
  "Door 0",
  "Review routes",
  "Two rooms are built for current reviewers."
];

test("every preserved line of home copy survives the assimilation, verbatim", () => {
  const missing = PRESERVED_HOME_COPY.filter((line) => !homePage.includes(line));
  assert.deepEqual(missing, [], "copy dropped from the preserved half of /");
});

test("both audience buttons keep their live #router anchors and their classes", () => {
  assert.equal(homePage.split('href="#router"').length - 1, 2, "an audience button lost its anchor");
  assert.ok(homePage.includes('className="audience-button primary"'));
  assert.ok(homePage.includes('className="audience-button secondary"'));
});

test("the preserved sections keep their ids, their labels and their order", () => {
  for (const fragment of [
    'className="hero hero-foyer"',
    'className="destinations-section" aria-labelledby="destinations-heading"',
    'className="sr-only" id="destinations-heading"',
    'className="floor-plan"',
    "plan-room plan-room-${item.number}",
    "<IntentRouter />",
    'className="stakeholder-section" aria-labelledby="stakeholder-heading"',
    'id="stakeholder-heading"'
  ]) {
    assert.ok(homePage.includes(fragment), `the preserved half of / lost: ${fragment}`);
  }

  // Order matters: Q2's ratified default APPENDS the preserved blocks below the
  // 4a composition. Relocating one inside it would satisfy every assertion
  // above and still be the thing the plan forbids.
  const foyer = homePage.indexOf('className="hero hero-foyer"');
  const doors = homePage.indexOf('className="destinations-section"');
  const router = homePage.indexOf("<IntentRouter />");
  const stakeholders = homePage.indexOf('className="stakeholder-section"');
  assert.ok(foyer < doors && doors < router && router < stakeholders, "the preserved blocks were reordered");
  assert.ok(homePage.indexOf("<HeroDemo") < foyer, "the 4a composition is no longer above the preserved foyer");
});

test("the two class-contract findings are resolved in the stylesheet, not in the markup", () => {
  const css = read("app/globals.css");
  assert.ok(css.includes(".hero-foyer {"), "`hero-foyer` is applied with no rule again");
  assert.ok(css.includes(".audience-button.secondary {"), "`secondary` is applied with no rule again");
  assert.ok(!css.includes(".hero-principle"), "the retired orphan rule came back");
  assert.ok(!css.includes(".card-eyebrow"), "the retired orphan selector came back");
});

/* -------------------------------------------------------------------------- */
/* Q3 — one component, one content object, two URLs                           */
/* -------------------------------------------------------------------------- */

test("both surfaces mount the same hero demo component", () => {
  assert.ok(homePage.includes('from "@/components/wys/HeroDemo"'), "/ does not mount HeroDemo");
  assert.ok(landingPage.includes('from "@/components/wys/HeroDemo"'), "/watch-your-step does not mount HeroDemo");
  assert.ok(homePage.includes('<HeroDemo breakpoint="desktop" />'));
  assert.ok(landingPage.includes('<HeroDemo breakpoint="mobile" />'));
});

test("neither page can choose the demo's scenario — the content object does", () => {
  // A `scenarioId` prop would make "the same content object" a convention
  // rather than a fact. The component looks the record up itself.
  for (const [name, source] of [["/", homePage], ["/watch-your-step", landingPage]] as const) {
    const mounts = [...source.matchAll(/<HeroDemo\b([^>]*)\/>/g)].map((match) => match[1]);
    assert.equal(mounts.length, 1, `${name} mounts the hero demo ${mounts.length} times`);
    assert.deepEqual(
      mounts[0].trim().replace(/breakpoint="(desktop|mobile)"/, "").trim(),
      "",
      `${name} passes something other than a breakpoint into the hero demo`
    );
  }
  assert.ok(heroDemo.includes("heroDemoDistribution.scenarioId"), "the demo's binding is not the content object's");
  assert.equal(heroDemoDistribution.scenarioId, "scn-client-meeting");
});

test("the hero demo renders no prose of its own", () => {
  // The provenance spine: every string on that card arrives from content/,
  // gated. `tests/canonical-text.test.ts` enforces the >= 12-word rule; this is
  // the narrower statement that the component imports its words.
  for (const module of [
    '@/content/watch-your-step/scenarios',
    '@/content/watch-your-step/judgments',
    '@/content/watch-your-step/landing',
    '@/content/watch-your-step/judge'
  ]) {
    assert.ok(heroDemo.includes(module), `HeroDemo does not read ${module}`);
  }
  assert.ok(heroDemo.includes("allShowable"), "the exercise is not gated on the scenario's own prose");
});

/* -------------------------------------------------------------------------- */
/* Q11 — the numbers and the caption are one object                           */
/* -------------------------------------------------------------------------- */

test("the 18/61/21 split is a draft object that carries its own caption", () => {
  assert.equal(heroDemoDistribution.status, "draft");
  assert.equal(heroDemoDistribution.origin, "IMPLEMENTATION_PLACEHOLDER");
  assert.deepEqual(
    heroDemoDistribution.slices.map((slice) => slice.percent),
    [18, 61, 21]
  );
  assert.match(heroDemoDistribution.caption, /^Example numbers/);
  assert.ok(heroDemoDistribution.sourceIds.length > 0);
});

test("the caption cannot be separated from the numbers", () => {
  // Two mechanisms, both required: the caption is a FIELD on the object that
  // carries the numbers, and `DistributionBars` takes it as a prop with no
  // default. Either alone would let a future caller render the bars bare.
  const bars = read("components/wys/DistributionBars.tsx");
  assert.ok(bars.includes("caption: string;"), "DistributionBars made its caption optional");
  assert.ok(!bars.includes("caption =") , "DistributionBars gave its caption a default");
  assert.ok(heroDemo.includes("caption: caption.text"), "the hero demo passes numbers without the gated caption");
  assert.ok(heroDemo.includes("showSplit"), "the split is not gated with its caption");
});

/* -------------------------------------------------------------------------- */
/* The path cells are derived, never typed (§6.9)                             */
/* -------------------------------------------------------------------------- */

test("the nine path cells come from the curriculum, in curriculum order", () => {
  const cells = landingStopCells();
  assert.equal(cells.length, stopCount());
  assert.equal(cells[0].state, "lesson");
  assert.equal(cells[1].state, "current");
  assert.equal(cells.at(-1)?.state, "terminal");
  assert.equal(cells.filter((cell) => cell.state === "current").length, 1);
});

test("every cell's meta line is composed, and the off-site and terminal tags are the pinned ones", () => {
  const cells = landingStopCells();
  assert.equal(cells[0].meta, `Lesson 0 · ${landingLabels.lessonZeroDuration}`);
  assert.match(cells[1].meta, /^A · \d+ visits$/);
  assert.ok(cells.some((cell) => cell.meta.endsWith(`· ${wysLabels.offSiteTag}`)), "no off-site cell");
  assert.ok(cells.some((cell) => cell.meta.endsWith(`· ${wysLabels.terminalTag}`)), "no terminal cell");
});

test("a withheld stop title falls back to the derived stop name, never to draft prose", () => {
  // Under Q21's ratified default every stop title is blocked, so this is the
  // state that actually ships. The fallback is structure ("Stop A"), which is
  // derived from `order`, and the scaffold footnote explains it on both
  // surfaces.
  const cells = landingStopCells();
  assert.ok(cells.every((cell) => cell.titleWithheld), "a stop title became renderable — re-check this fallback");
  assert.deepEqual(cells.slice(0, 3).map((cell) => cell.title), ["Lesson 0", "Stop A", "Stop B"]);
  assert.ok(homePage.includes("stopScaffoldFootnoteText"), "/ drops the scaffold footnote");
  assert.ok(landingPage.includes("stopScaffoldFootnoteText"), "/watch-your-step drops the scaffold footnote");
});

test("the phone peek is the first three of the same nine — not a second list", () => {
  assert.deepEqual(landingStopPeek(), landingStopCells().slice(0, 3));
});

test("no surface types the stop count or the Lesson Zero control name", () => {
  for (const [name, source] of [["/", homePage], ["/watch-your-step", landingPage]] as const) {
    assert.ok(!/\bNine\b/.test(source), `${name} types the stop count`);
    assert.ok(!source.includes('"Start Lesson Zero"'), `${name} retypes the Lesson Zero control name`);
  }
  assert.ok(landingLabels.startCta.startsWith(lessonZeroCta.label), "the hero CTA stopped composing the nav label");
});

/* -------------------------------------------------------------------------- */
/* Copy that is governed, and one forbidden phrase that is permitted here      */
/* -------------------------------------------------------------------------- */

test("every landing record is published, Ben-approved and sourced to an artboard", () => {
  for (const record of landingCopyRecords) {
    assert.equal(record.status, "published", `${record.id} is not published`);
    assert.equal(record.origin, "BEN_APPROVED", `${record.id} claims Ben authorship`);
    assert.equal(policyForCanonicalText(record).kind, "canon", `${record.id} would not render`);
    assert.ok(
      record.sourceIds.every((id) => id.startsWith("artboard-4a")),
      `${record.id} cites something other than artboard 4a`
    );
  }
});

test("\"AI you can trust\" exists only as a struck anti-feature pill", () => {
  // (WYS §32) forbids the phrase; plan §2.1 names the struck home-page pill as
  // its one approved use. It must therefore appear in exactly one place in the
  // content layer and nowhere in a surface file.
  assert.ok(landingAntiFeatures.some((label) => label.includes("AI you can trust")));
  for (const [name, source] of [["/", homePage], ["/watch-your-step", landingPage]] as const) {
    assert.ok(!source.includes("AI you can trust"), `${name} types the forbidden phrase directly`);
  }
  assert.ok(homePage.includes("StruckPill"), "the anti-feature pills are no longer struck through");
});

test("both breakpoints render one link label for the Data page (Q6)", () => {
  // `4a` desktop writes "exactly what this site stores about you" and the phone
  // writes "See what this site knows about you". One node, one name.
  for (const [name, source] of [["/", homePage], ["/watch-your-step", landingPage]] as const) {
    assert.ok(source.includes("landingDataLinkLabel"), `${name} does not use the pinned Data link label`);
    assert.ok(!source.includes("stores about you"), `${name} reintroduces the second Data page name`);
  }
  assert.equal(wysLabels.dataPageLinkLabel, "See what this site knows about you");
});
