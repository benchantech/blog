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
import { ROUTES } from "@/content/trust-forward/stamp/v1-1-0";

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

/**
 * Markup, with the doc comments removed.
 *
 * The negative assertions below say a name is no longer RENDERED. A header
 * comment that records which names were removed, and why, is documentation —
 * counting it as markup would make the file unable to explain its own change,
 * which is the same distinction `tests/preserved-surfaces.test.ts` draws when
 * it strips comments before counting landmarks.
 */
const homeMarkup = homePage.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
const landingPage = read("app/watch-your-step/(shell)/page.tsx");
const heroDemo = read("components/wys/HeroDemo.tsx");

/* -------------------------------------------------------------------------- */
/* The preserved half of `/`                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Every line of copy the plan §3.1 enumeration names, verbatim — MINUS the
 * twelve Ben withdrew on 2026-09-08.
 *
 * *"from routing foyer down to just above review routes remove all of these
 * sections … we're consolidating until i can build it out more."* The routing
 * foyer, the four-door floor plan and the intent router left `/`; Review routes
 * stayed, and its two lines are what remains of the preserved half here.
 *
 * THE WITHDRAWN LINES ARE LISTED, NOT DELETED, because this array's job is to
 * be the record of what §3.1 enumerated. An entry silently dropped from a
 * verbatim register is indistinguishable from an entry that was never there,
 * and the next person to compare this file against the plan would find twelve
 * unexplained absences. `WITHDRAWN_HOME_COPY` is asserted below in the
 * opposite direction — it must NOT appear — so the two halves cannot drift:
 * restoring the markup fails that assertion until the line moves back up.
 */
const PRESERVED_HOME_COPY: readonly string[] = [
  "Review routes",
  "Two rooms are built for current reviewers."
];

/** Withdrawn from `/` on 2026-09-08. Still in the markup would be the bug. */
const WITHDRAWN_HOME_COPY: readonly string[] = [
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
  "Door 0"
];

test("every preserved line of home copy survives the assimilation, verbatim", () => {
  const missing = PRESERVED_HOME_COPY.filter((line) => !homePage.includes(line));
  assert.deepEqual(missing, [], "copy dropped from the preserved half of /");
});

/*
 * The withdrawal, asserted from the other side. Without this the register above
 * would be a comment: twelve lines could sit in `WITHDRAWN_HOME_COPY` while the
 * markup that carries them was never actually removed, and every test in this
 * file would still pass. `homeMarkup` rather than `homePage`, so the commit's
 * own explanation of what it withdrew does not count as the markup returning.
 */
test("the withdrawn home sections are gone from the markup, not just from the register", () => {
  const present = WITHDRAWN_HOME_COPY.filter((line) => homeMarkup.includes(line));
  assert.deepEqual(present, [], "copy registered as withdrawn is still rendered on /");
});

test("the preserved sections keep their ids, their labels and their order", () => {
  for (const fragment of [
    'className="stakeholder-section" aria-labelledby="stakeholder-heading"',
    'id="stakeholder-heading"'
  ]) {
    assert.ok(homePage.includes(fragment), `the preserved half of / lost: ${fragment}`);
  }

  // Order matters: Q2's ratified default APPENDS the preserved block below the
  // 4a composition. Relocating it inside would satisfy the assertion above and
  // still be the thing the plan forbids. Three of the four blocks this once
  // ordered were withdrawn on 2026-09-08; Review routes is the one that stayed,
  // and it is still last.
  const stakeholders = homePage.indexOf('className="stakeholder-section"');
  assert.ok(
    homePage.indexOf("upworkFeature") < stakeholders,
    "the 4a composition is no longer above the preserved Review routes block"
  );
  assert.ok(homePage.indexOf("styles.seam") < stakeholders, "the seam no longer divides the two halves");
});

test("the two class-contract findings are resolved in the stylesheet, not in the markup", () => {
  const css = read("app/globals.css");
  /*
   * The MARKUP for these two was withdrawn on 2026-09-08 and the RULES were
   * deliberately kept — see ORPHAN_RULES in tests/class-contract.test.ts, which
   * names both and fails if they are ever referenced again without being
   * de-registered. So this still asserts exactly what it always did: the Phase
   * 0 findings were fixed by giving each class the job it claimed, and neither
   * was ever fixed by deleting a class from preserved markup.
   */
  assert.ok(css.includes(".hero-foyer {"), "the withdrawn foyer's rule was deleted rather than kept");
  assert.ok(css.includes(".audience-button.secondary {"), "the withdrawn button pair's rule was deleted");
  assert.ok(!css.includes(".hero-principle"), "the retired orphan rule came back");
  assert.ok(!css.includes(".card-eyebrow"), "the retired orphan selector came back");
});

/* -------------------------------------------------------------------------- */
/* Q3 — one component, one content object, two URLs                           */
/* -------------------------------------------------------------------------- */

test("home renders the Upwork feature, and the course landing keeps the hero demo", () => {
  assert.ok(!homePage.includes('from "@/components/wys/HeroDemo"'), "/ still mounts HeroDemo");
  assert.ok(landingPage.includes('from "@/components/wys/HeroDemo"'), "/watch-your-step does not mount HeroDemo");
  assert.ok(landingPage.includes('<HeroDemo breakpoint="mobile" />'));
  assert.ok(homePage.includes('href="/upwork"'), "/ does not link to the Upwork redirect");
  assert.ok(homePage.includes('srcSet="/upwork-cto-mobile.webp"'), "/ does not render the mobile Upwork screenshot");
  assert.ok(homePage.includes('src="/upwork-cto-desktop.webp"'), "/ does not render the desktop Upwork screenshot");
  assert.ok(homePage.includes('srcSet="/leveled-up-badge-mobile.webp"'), "/ does not render the mobile graduate badge");
  assert.ok(homePage.includes('src="/leveled-up-badge-desktop.webp"'), "/ does not render the desktop graduate badge");
  assert.ok(homePage.includes('target="_blank"'), "feature links do not pop out");
  assert.ok(homePage.includes('aria-hidden="true">↗</span>'), "feature links do not show external arrows");
  assert.ok(
    homePage.includes('href="https://www.linkedin.com/in/benchantech/"'),
    "/ does not link to LinkedIn"
  );
  assert.ok(homePage.includes("From Upwork to CTO"), "/ does not render the Upwork feature");
});

test("the course landing cannot choose the demo's scenario — the content object does", () => {
  // A `scenarioId` prop would make "the same content object" a convention
  // rather than a fact. The component looks the record up itself.
  for (const [name, source] of [["/watch-your-step", landingPage]] as const) {
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
  // `/` NO LONGER RENDERS THE STOP PREVIEW, so it no longer needs the footnote
  // that explained the withheld titles. Updated deliberately with the change
  // that removed the path section: Watch Your Step is retired from navigation
  // (`WYS_NAV_RETIRED`) and its routes redirect to `/`, so a nine-cell preview
  // of its stops on the home page was advertising a redirect. The footnote is
  // still asserted on `/watch-your-step`, which still renders the cells, and
  // the negative below is what stops the preview drifting back.
  assert.ok(landingPage.includes("stopScaffoldFootnoteText"), "/watch-your-step drops the scaffold footnote");
});

test("/ no longer advertises the retired course: no hero, no CTA, no stop preview", () => {
  // Every one of these controls landed the visitor back on `/` through
  // next.config.ts's non-permanent redirects. They are gone from the RENDER
  // and not from content/, so flipping `WYS_NAV_RETIRED` back restores the
  // course's own landing without recovering deleted copy.
  for (const gone of [
    "landingBadgeText",
    "landingHeadlineText",
    "landingLeadText",
    "landingPathLeadText",
    "stopsHeadline",
    "landingStopCells",
    "StopCard",
    "landingFourMoves",
    "startCtaHref",
    "tryOneDesktop"
  ]) {
    assert.ok(!homeMarkup.includes(gone), `/ still renders the retired course's ${gone}`);
  }
  assert.equal(/href="\/watch-your-step/.test(homeMarkup), false, "/ links straight into the retired tree");
});

test("Trust Forward is the home page's primary CTA, in the approved words", () => {
  // The hero reads `LANDING_INCOMPLETE` — the same object `/trust-forward`
  // renders — so the two surfaces cannot make the offer with different words,
  // and `tests/canonical-text.test.ts`'s one-definition rule keeps it that way.
  assert.ok(homePage.includes('from "@/content/trust-forward/copy"'), "/ types its own Trust Forward copy");
  assert.ok(homePage.includes("LANDING_INCOMPLETE.primaryCta"), "/ has no Trust Forward CTA label");
  assert.ok(homePage.includes("ROUTES.canonical"), "/ does not send the CTA to the canonical node");
  assert.equal(ROUTES.canonical, "/trust-forward");
  // The bridge sentence and its confidentiality limit are one unit or neither
  // (content/trust-forward/copy.ts). The home page shows neither.
  assert.ok(!homeMarkup.includes("fullOffer.bridge"), "/ publishes the real-cases claim without its limit");
  assert.ok(!homeMarkup.includes("confidentiality"), "/ publishes the confidentiality sentence alone");
  /*
   * ONE h1, FROM 2026-09-08 — and this assertion moved from 2 to 1 because the
   * page changed, not because the number was inconvenient.
   *
   * Q2's stacking put the Trust Forward hero above the preserved foyer, and
   * each kept its own h1, so this URL carried two: an accepted deviation
   * recorded as such. Ben's withdrawal of the foyer removed the second one, and
   * a single h1 naming the offer is the correct end state rather than a
   * tolerated one — the page now has one document title in its outline, which
   * is what a screen-reader user navigating by heading level expects.
   *
   * Still an EQUALITY, not a "<= 2": the failure this guards against is a
   * second h1 arriving unnoticed, and that is only catchable by pinning the
   * count.
   */
  assert.ok(homeMarkup.includes('id="trust-forward-heading"'));
  assert.equal(homeMarkup.split("<h1").length - 1, 1, "the home page no longer carries exactly one h1");
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

/*
 * `/` DROPPED OUT OF THIS CHECK ON 2026-09-08, and the one-name rule did not.
 *
 * Q6's rule is that the Data page has ONE name wherever it is linked — `4a`
 * desktop wrote "exactly what this site stores about you" and the phone wrote
 * "See what this site knows about you", and two names for one node is what this
 * guards. The home page no longer links the Data page at all: the page is
 * retired behind the course's wildcard redirect, and a home-page link promising
 * to show a visitor what the site knows about them, that lands them back on the
 * home page, is a broken promise about privacy specifically.
 *
 * So `/` is checked for ABSENCE and the surviving linkers are checked for the
 * name. The second name stays banned everywhere, which is the half of the rule
 * that never depended on who links it.
 *
 * /privacy and /cookies still link the retired Data page and are NOT listed
 * here, deliberately: there the sentence is load-bearing — it is where those
 * documents tell a reader how to download or clear what this browser holds —
 * and the fix is either to un-retire the page or to rewrite two legal
 * paragraphs. Both are Ben's call. Asserting them green here would file the
 * problem as solved.
 */
test("both breakpoints render one link label for the Data page (Q6)", () => {
  assert.equal(
    homeMarkup.includes("landingDataLinkLabel"),
    false,
    "/ links the retired Data page again — restore it only when the page is reachable"
  );
  assert.ok(landingPage.includes("landingDataLinkLabel"), "/watch-your-step does not use the pinned Data link label");
  for (const [name, source] of [["/", homePage], ["/watch-your-step", landingPage]] as const) {
    assert.ok(!source.includes("stores about you"), `${name} reintroduces the second Data page name`);
  }
  assert.equal(wysLabels.dataPageLinkLabel, "See what this site knows about you");
});
