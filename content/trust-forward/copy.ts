/**
 * Trust Forward Lite — chrome and framing copy (plan §7, "copy.ts — UX_COPY.md
 * strings + the final-reveal copy").
 *
 * Pure TypeScript. No React, no JSX, no CSS import, no component import. That
 * is a hard requirement, not a style preference: `package.json` runs the suite
 * as `node --import tsx --test tests/*.test.ts`, and Node cannot load a `.css`
 * specifier, so a component import here would take the whole test file down
 * with `ERR_UNKNOWN_FILE_EXTENSION`. The same discipline
 * `lib/wys/local-state.ts` and `lib/wys/telemetry.ts` already work under.
 *
 * WHY THE STRINGS LIVE HERE AND NOT IN THE COMPONENT THAT RENDERS THEM.
 * `tests/wys-content.test.ts` fails on any long prose literal or JSX text node
 * under `app/` or `components/`, and that mechanism is what makes "all
 * learner-facing prose is governed content" true rather than a convention. A
 * sentence typed into a `<p>` carries no provenance tag, cannot be cited, and
 * cannot be diffed against the handoff it came from. Every string below is
 * copied character-for-character out of a named handoff document and the
 * document is cited on its group.
 *
 * NOTHING IN THIS FILE IS AUTHORED BY THIS BUILD. Where the handoff supplies no
 * wording for a surface the plan calls for, this module exports a `TODO_`
 * constant instead of a plausible sentence — see `TODO_LANDING_FAQ_ANSWERS` and
 * `TODO_RESULT_PROFESSIONAL_SUMMARY` at the bottom. An invented sentence would
 * be indistinguishable from recovered wording once it is on the page, which is
 * exactly the failure `TRUST_FORWARD_PROVENANCE.md` forbids: "Never relabel
 * implementation-authored copy as Ben-authored merely because it was generated
 * to fill a package gap."
 *
 * SOURCES, by group (all paths relative to
 * `TRUST_FORWARD_LITE_CODEX_FINAL_LITE_GATES_RESOLVED_2026-09-07/`):
 *
 *   LITE_INTRO         01_trust-forward-lite-codex-package/UX_COPY.md, "## Lite intro"
 *   INFO_MARKERS       01_…/UX_COPY.md, the two `[info]` expansions in "## Lite intro"
 *   PROGRESS           01_…/UX_COPY.md, "## Progress" + "## Changed downstream scenario"
 *   REFLECTION         07_…/reflection-placement.BEN_APPROVED.json (heading, prompt,
 *                      disclosure, the five placements) + 01_…/UX_COPY.md "## Reflection"
 *                      for the three action labels and the suppressed-state label
 *   HANDLE             01_…/UX_COPY.md, "## Handle after Case 1"
 *   RESULT             01_…/UX_COPY.md, "## Final result"
 *   LANDING_INCOMPLETE 01_…/UX_COPY.md "## `/trust-forward` — incomplete Lite"
 *                      + 07_…/public-copy-and-full-bridge.BEN_APPROVED.json
 *                      + 07_…/professional-summary-market-direction.BEN_APPROVED.json
 *   LANDING_COMPLETE   01_…/UX_COPY.md "## `/trust-forward` — completed Lite"
 *   FULL_OFFER         07_…/public-copy-and-full-bridge.BEN_APPROVED.json
 *
 * `FULL_OFFER` AND `LANDING_INCOMPLETE.evidenceLine` ARE THE SINGLE DEFINITIONS
 * OF THE FOUR APPROVED PUBLIC SENTENCES. `content/trust-forward/surfaces.ts`
 * imports both for the Case 5 closing upsell, which makes the same claims at
 * the end of the run. They are defined here rather than there because `tests/canonical-text.test.ts` fails on any >= 6-word
 * literal defined twice under `content/`, and that test is the mechanism behind
 * the repo's one-definition rule: two copies of an approved public claim are
 * two places a later ruling has to be applied, and the second is the one that
 * gets missed. The dependency runs copy.ts -> nothing, surfaces.ts -> copy.ts.
 * Do not import from `./surfaces` here; that closes a cycle.
 *
 * THREE PLACES A LATER LAYER OVERRULES `UX_COPY.md`, and the conflict is real
 * enough that reading only layer 01 would ship the wrong words:
 *
 *  1. **The reflection prompt.** `UX_COPY.md` "## Reflection" offers
 *     "Anything you want to remember about why?" with a short `[info]`
 *     expansion. Layer 07's `reflection-placement.BEN_APPROVED.json` is a
 *     Ben-approved governing rule dated 2026-09-07 and supplies a heading, a
 *     longer prompt and a longer disclosure. `FINAL_READ_ORDER_AND_AUTHORITY.md`
 *     puts layer 07 above layer 01, so layer 07's three strings are what
 *     `REFLECTION` carries. Layer 01's superseded prompt is deliberately NOT
 *     exported: keeping it available is how it ends up rendered by accident.
 *  2. **How many reflections there are, and where.** Layer 07 fixes the count at
 *     exactly five — after C1D2, C2D2, C3D2, C4D2, and after C5D3 *before* the
 *     final reveal. That is one per case, not one per decision: eleven prompts
 *     would be the naive reading of "## Reflection" sitting in a decision-flow
 *     document. `REFLECTION_PLACEMENTS` is therefore keyed by the decision the
 *     surface comes AFTER, and the C5D3 entry carries `beforeFinalReveal`,
 *     because a fifth reflection shown after the SHIP result is a different
 *     product — the learner would be writing about the answer, not the case.
 *  3. **The size of the full corpus, in public.** Layer 02's corpus-count
 *     supersession makes every current internal reference 42. Layer 07's
 *     `public-copy-and-full-bridge.BEN_APPROVED.json` is newer and fixed the
 *     PUBLIC bridge sentence at "30+ real cases", while recording 42 as
 *     `internalCanonicalFullCorpusCount`. **SUPERSEDED TWICE ON 2026-09-08, and
 *     the second time the rule went with it.** First Ben raised the public
 *     floor from "30+" to "40+" — the floor moved, the rule held.  Then he
 *     wrote `TRUST_FORWARD_TEASER`, which says "42 canonical case families" in
 *     public, in his own words. Layer 07's rule that 42 is internal-only is
 *     therefore GONE, not narrowed, and any comment in this file claiming 42
 *     does not appear here is out of date the moment you read it.
 *
 *     The two numbers are not in conflict — a floor of 40+ under a count of 42,
 *     and a "case family" is not a "case" — but they ARE two public statements
 *     of one corpus. If that corpus ever changes, both have to change.
 *     `tests/trust-forward-content.test.ts` pins each of them by name so
 *     neither can drift alone.
 *
 * TYPOGRAPHY IS PART OF THE SOURCE. The en dash in "15–30", the unspaced em
 * dashes in "carry—and what still has to remain theirs", the spaced em dash in
 * the handle prompt, and the curly apostrophes layer 07 uses ("Lite won’t",
 * "Ben Chan’s") are reproduced exactly. Layer 01 uses a straight apostrophe in
 * "this browser's local storage" and layer 07 uses a curly one in its own
 * strings; both are preserved as written rather than normalised, so a diff
 * against the handoff stays clean.
 *
 * PROVENANCE. `COPY_PROVENANCE` tags every group. All of it is `ben_canonical`:
 * `UX_COPY.md` is part of the Ben-supplied codex package that
 * `FINAL_READ_ORDER_AND_AUTHORITY.md` calls the base authority, and the two
 * layer-07 files are `ben_approved_*` rulings. It is NOT
 * `recovered_prior_authoring` — that tag belongs to the layer-06 extraction
 * (the 27 fragments, callbacks, closes, cross-case surfaces, case and option
 * text, and the 729 narratives), and `CURRENT_IMPLEMENTATION_STATUS_2026-09-07.md`
 * is explicit that the two must not be collapsed in either direction. The
 * Captain's Stamp is a separate axis carried by `lib/approval-state.ts`, exactly
 * as `content/claims.ts` records for the artboard copy; `ben_canonical` here is
 * a statement about who wrote the sentence, not a claim that the site is
 * stamped.
 */

import { CASE_NUMBERS } from "@/lib/trust-forward/types";
import type { CaseNumber, DecisionId } from "@/lib/trust-forward/types";

/* -------------------------------------------------------------------------- */
/* 1. Info markers (UX_COPY.md — "## Global rule" and "## Lite intro")         */
/* -------------------------------------------------------------------------- */

/**
 * The shared disclosure pattern: "Shallow by default, deeper on demand. Use one
 * consistent info marker/popover."
 *
 * A marker is a `label` plus an `expansion`, never a bare icon, because
 * `UX_COPY.md`'s global rule makes tap/click primary and hover an enhancement
 * only — a marker whose meaning lives in a hover tooltip has no touch form at
 * all, and iPhone Safari is this repo's primary QA target. The label is the
 * visible trigger text; the expansion is what the disclosure reveals.
 *
 * These two are the intro's `[info]` markers verbatim. The reflection
 * disclosure and the SHIP explanation are also disclosure text, but they are
 * bound to their own surfaces and live on `REFLECTION` and `RESULT`.
 */
export const INFO_MARKERS = {
  /** The privacy expansion. `[info]` on the intro's local-storage line. */
  localOnly: {
    id: "local-only",
    label: "Everything stays in your browser",
    expansion:
      "Your decisions, optional writing, local handle, drafts and the whole run history stay in this browser's local storage. They are not sent to the server. The site may collect coarse funnel events such as whether a case was reached or an export button was clicked, but not which options you chose or what you wrote."
  },
  /** The determinism expansion. `[info]` on the intro's no-AI line. */
  deterministic: {
    id: "deterministic",
    label: "Real cases. No AI reading your answers.",
    expansion:
      "Trust Forward Lite runs from real cases written in advance and fixed rules. Nothing you write is read by a model — your optional notes are remembered locally, exactly as you wrote them, and never interpreted."
  }
} as const;

export type InfoMarkerKey = keyof typeof INFO_MARKERS;

/* -------------------------------------------------------------------------- */
/* 2. Lite intro (UX_COPY.md — "## Lite intro")                               */
/* -------------------------------------------------------------------------- */

/**
 * The very short intro before Case 1.
 *
 * `timeEstimate` is the ONLY time statement Lite makes. `README.md`'s locked UX
 * says "No per-case time estimate. Intro may say 15–30 minutes." A per-case
 * number is not merely absent from the handoff, it is forbidden: the five cases
 * are meant to be completable in one sitting with no artificial pauses, and a
 * per-case clock turns a judgment sandbox into a timed test.
 *
 * `promiseItems` is the three-item completion promise in source order and is
 * the same promise `LANDING_INCOMPLETE.revealItems` makes in its own wording —
 * the two lists are NOT interchangeable and neither is derived from the other,
 * because `UX_COPY.md` words them differently on purpose (the landing says
 * "your observed SHIP developer pattern", the intro says "your SHIP profile").
 */
export const LITE_INTRO = {
  heading: "Trust Forward Lite",
  lede: "Five fixed developer-judgment cases.",
  promiseLead: "Make the calls, see the pattern, and finish with:",
  promiseItems: [
    "your SHIP profile",
    "Markdown + JSON export",
    "and a completion offer for full Trust Forward"
  ],
  timeEstimate: "About 15–30 minutes.",
  /** Rendered in this order, each as the shared info marker. */
  infoMarkerKeys: ["localOnly", "deterministic"],
  cta: "Start Case 1"
} as const satisfies {
  heading: string;
  lede: string;
  promiseLead: string;
  promiseItems: readonly string[];
  timeEstimate: string;
  infoMarkerKeys: readonly InfoMarkerKey[];
  cta: string;
};

/* -------------------------------------------------------------------------- */
/* 3. Progress and the changed-scenario notice (UX_COPY.md — "## Progress",   */
/*    "## Changed downstream scenario")                                       */
/* -------------------------------------------------------------------------- */

/**
 * `Case n of 5`, and the one sentence that explains a scenario the learner did
 * not expect to see.
 *
 * The denominator comes from `CASE_NUMBERS.length` rather than a literal `5`
 * so the label cannot drift from the contract that defines how many cases
 * exist. It is a label, not a scoreboard: `UX_COPY.md` gives the number of the
 * case the learner is ON, never a count of cases completed.
 *
 * `showOnlyReachedTitles` is a rendering RULE from the same section — "Show
 * only reached/current titles; unreached future titles remain hidden" — pinned
 * here beside the label it governs. A future case title is a spoiler: Case 5 is
 * TAKE THE WHEEL, and a learner who reads that before Case 1 answers Case 1
 * differently.
 *
 * `changedScenarioNotice` is shown when an edit upstream re-resolved a
 * downstream variant. It states the fact and stops. It does not apologise, does
 * not name what changed, and does not invite the learner to undo the edit —
 * anything longer would be this build authoring product behaviour into a
 * sentence the handoff deliberately kept to eight words.
 */
export const PROGRESS = {
  /** `Case 3 of 5`. */
  caseLabel: (caseNumber: CaseNumber): string =>
    `Case ${caseNumber} of ${CASE_NUMBERS.length}`,
  /** UX_COPY.md "## Progress": unreached future titles remain hidden. */
  showOnlyReachedTitles: true,
  changedScenarioNotice: "This scenario changed because of an earlier edit."
} as const;

/* -------------------------------------------------------------------------- */
/* 4. Reflection (07_…/reflection-placement.BEN_APPROVED.json; action labels  */
/*    from UX_COPY.md "## Reflection")                                        */
/* -------------------------------------------------------------------------- */

/** One reflection surface: the decision it follows, and whether the reveal is next. */
export interface ReflectionPlacement {
  /** The reflection is shown AFTER this decision is answered. */
  afterDecisionId: DecisionId;
  /** True only for C5D3: the surface sits between the last answer and the reveal. */
  beforeFinalReveal: boolean;
}

/**
 * Exactly five, one per case, in experience order.
 *
 * `count: 5` in the layer-07 ruling is a ceiling as well as a floor. Reflections
 * are learner-authored verbatim evidence that Full may quote exactly, so the
 * number of prompts is a product judgment Ben made, not a density knob.
 */
export const REFLECTION_PLACEMENTS: readonly ReflectionPlacement[] = [
  { afterDecisionId: "C1D2", beforeFinalReveal: false },
  { afterDecisionId: "C2D2", beforeFinalReveal: false },
  { afterDecisionId: "C3D2", beforeFinalReveal: false },
  { afterDecisionId: "C4D2", beforeFinalReveal: false },
  { afterDecisionId: "C5D3", beforeFinalReveal: true }
];

/**
 * The reflection surface.
 *
 * `heading`, `prompt` and `disclosure` are layer 07 verbatim and supersede
 * `UX_COPY.md`'s shorter prompt (see the header note). The three action labels
 * and the suppressed-state label have no layer-07 replacement and are
 * `UX_COPY.md` verbatim.
 *
 * `disclosure` is the load-bearing string in the group and every clause in it
 * is a commitment the rest of the build has to keep: "saved only in this
 * browser" is `lib/trust-forward` local state, "preserved exactly as you wrote
 * them" is why the serializer must not trim or normalise the text, and "Lite
 * won’t interpret them" is why reflections appear in no scoring path — the
 * ruling's own `affects` list is empty, and `BEN_APPROVED_RULINGS_2026-09-07.md`
 * spells it out: reflections never affect routing, scoring, variants, receipts,
 * SHIP, or Lite interpretation.
 *
 * "Always skip" suppresses the surface for the rest of the run; `showInput` is
 * the label that brings it back, which is why suppression is a preference and
 * never a deletion — the ledger records the preference change, and drafts
 * already written survive it.
 */
export const REFLECTION = {
  heading: "Your notes on this case",
  prompt:
    "What stood out to you? You can write about any decision, assumption, tradeoff, disagreement, or anything else you noticed in this case.",
  disclosure:
    "Optional. Write as much or as little as you want. Your words are saved only in this browser and preserved exactly as you wrote them. Lite won’t interpret them.",
  actions: {
    continue: "Continue",
    skip: "Skip",
    alwaysSkip: "Always skip"
  },
  /** Shown in place of the surface once "Always skip" is chosen. */
  showInput: "Show text input",
  placements: REFLECTION_PLACEMENTS
} as const;

/* -------------------------------------------------------------------------- */
/* 5. Handle (UX_COPY.md — "## Handle after Case 1")                          */
/* -------------------------------------------------------------------------- */

/**
 * The one time Lite asks for a name, offered after Case 1 and never again.
 *
 * The two actions carry EQUAL VISUAL WEIGHT — `UX_COPY.md` says so in the same
 * breath as it names them, so the requirement is pinned here as data rather
 * than left to a component's button variant. "Stay incognito" as a ghost button
 * beside a filled "Add handle" would make the decline the discouraged path, and
 * the handle is local-only, never scored, never transmitted, and stripped on
 * import by Full: there is nothing for the product to want here.
 *
 * `afterCaseNumber` is 1 because the ask lands only once the learner has
 * something worth continuing — asking on the intro screen is a signup form
 * wearing a different word.
 */
export const HANDLE = {
  afterCaseNumber: 1,
  prompt: "By the way — want to add a local handle for continuity and export?",
  actions: {
    add: "Add handle",
    decline: "Stay incognito"
  },
  /** UX_COPY.md: "Equal visual weight." Not a styling preference. */
  equalVisualWeight: true
} as const;

/* -------------------------------------------------------------------------- */
/* 6. Final result (UX_COPY.md — "## Final result")                           */
/* -------------------------------------------------------------------------- */

/**
 * The reveal chrome. The profile body itself is not here — it is the recovered
 * 729-state terminal narrative plus the 16 SHIP-level bodies, which live in
 * `profiles.ts` and are never regenerated.
 *
 * `label` is "Your observed developer pattern", and the word "observed" is
 * doing the work: the result is a description of eleven answers the learner
 * actually gave, not a type they belong to. `ShipResult.code` in
 * `lib/trust-forward/types.ts` carries the same rule in its own comment —
 * never rendered as "You are SHIP-0111."
 *
 * `disclaimer` is the strongest de-escalation the handoff writes and it is
 * exported whole. Do not shorten it, and do not move "not a personality type,
 * diagnosis, validated psychometric measurement, or prediction" behind a
 * disclosure marker: the four things SHIP is not are the claim, and a
 * collapsed disclaimer is a disclaimer that most learners never open.
 *
 * `shipExplanation` is the `[info]` expansion for the acronym. It is the only
 * place the four axis names are spelled out, and its last sentence — "Optional
 * writing is never scored" — is the same promise `REFLECTION.disclosure` makes,
 * repeated at the moment a learner is most likely to wonder whether what they
 * typed moved the number.
 *
 * `receiptsToggle` opens the collapsed receipt list, `receiptsSeeAll` reveals
 * every active receipt. Both labels are required because the highlight subset
 * is a subset: `BEN_APPROVED_RULINGS_2026-09-07.md` allows the profile to
 * highlight fewer receipts but forbids deleting or substituting the underlying
 * trail, so there must always be a way to see the whole thing.
 */
export const RESULT = {
  label: "Your observed developer pattern",
  disclaimer:
    "These are mostly decorative pattern-matching stats from five fixed developer-judgment scenarios. SHIP is a starting point for reflection, not a personality type, diagnosis, validated psychometric measurement, or prediction. Different stakes, roles, evidence, and constraints may shift the pattern.",
  shipExplanation:
    "SHIP compresses six deterministic state dimensions into four public leans: Scope, Handoff, Inspection, and Partnership. The exact percentages come from your active fixed answers. Optional writing is never scored.",
  receiptsToggle: "Why this result?",
  receiptsSeeAll: "See full",
  completionCta: "Continue to full Trust Forward",
  secondaryCta: "Reopen your decisions",
  /** Destructive. Clears local state; the ledger's own reset event records it. */
  destructiveCta: "Start over"
} as const;

/* -------------------------------------------------------------------------- */
/* 7. The full Trust Forward offer                                            */
/*    (07_…/public-copy-and-full-bridge.BEN_APPROVED.json)                    */
/* -------------------------------------------------------------------------- */

/**
 * The three approved public sentences of the offer, defined once for the whole
 * product.
 *
 * Both landing states and `surfaces.ts`'s Case 5 closing upsell render these,
 * which is exactly why they are one definition and not two (see the header).
 *
 * `bridge` says "40+ real cases", not 42: see conflict (3) in the header. It
 * also supersedes the recovered source's "39 real, scar-bearing cases…", and,
 * as of 2026-09-08, layer 07's own approved "30+" — Ben raised the public floor
 * to 40+. Both the old and the new sentence are FLOORS chosen to sit under the
 * internal count of 42; "40+" is a tighter floor, not a new claim about a
 * larger corpus, and it stays true only while that count does not fall.
 * `confidentiality` travels WITH `bridge` and is not optional garnish — "real
 * cases drawn from Ben Chan's actual professional experience" is a claim about
 * real clients and colleagues, and the sentence that says how they are
 * protected is what makes the first sentence safe to publish. A renderer that
 * shows `bridge` without `confidentiality` has published the claim without its
 * limit.
 *
 * `descriptor` is layer 07's approved public descriptor for Lite, and it
 * supersedes the recovered "Five fictional cases. A fixed decision tree. 729
 * possible profiles." on both counts: "tree" became "system", and the profile
 * count left public copy entirely — 729 is an engineering number, not a
 * marketing one. It is also the honest counterweight to `bridge`: Lite's cases
 * are fictional, Full's are not.
 *
 */
/**
 * SUPERSEDED 2026-09-08 — the approved descriptor became FALSE.
 *
 * Ruling Q-C (2026-09-07) approved "Five fictional cases. A fixed decision
 * system. Six dimensions of judgment." for the product that existed then. The
 * YY Method rewrite the next day made two thirds of that sentence untrue:
 *
 *   "fictional"            -> the five cases are Ben's REAL professional work,
 *                             composited only where they named something
 *                             concrete (docs/adr/0002).
 *   "six dimensions"       -> SHIP and its six-dimension lattice were removed
 *                             from the required path entirely (docs/adr/0001).
 *
 * A published page cannot go on saying either. R8 is explicit that a false
 * public claim is fixed rather than left, and this one is worse than most
 * because the false half — "fictional" — understates what the product actually
 * offers. Approved copy is not exempt from being true; approval fixes the
 * wording, not the world it described.
 *
 * The replacement states only what the shipped product does: five cases,
 * seventeen checkpoints, and the ordering that makes the exercise mean
 * anything — the learner's judgment is recorded BEFORE Ben's is revealed.
 *
 * NEEDS BEN'S APPROVAL. It is registered in
 * `TRUST_FORWARD_IMPLEMENTATION_AUTHORED_LABELS` as implementation-authored,
 * not passed off as the approved string it replaces.
 */
export const FULL_OFFER = {
  descriptor:
    "Five real cases. Seventeen decision points. Your judgment is recorded before Ben's is revealed.",
  bridge: "40+ real cases drawn from Ben Chan’s actual professional experience.",
  confidentiality:
    "Cases may be anonymized or composited where necessary to protect clients, employers, colleagues, confidential information, or identifying details while preserving the underlying decision pressure."
} as const;

/* -------------------------------------------------------------------------- */
/* 8. Landing — incomplete Lite                                               */
/*    (UX_COPY.md "## `/trust-forward` — incomplete Lite";                    */
/*     07_…/professional-summary-market-direction.BEN_APPROVED.json)          */
/* -------------------------------------------------------------------------- */

/**
 * `/trust-forward` for a visitor with no local completion.
 *
 * `semanticWedge` and `intentQuestions` are layer 07's answer-first material.
 * The ruling's own SEO rule is why they are on the LANDING and not on the
 * result: "Personalized local summaries are not the crawlable SEO surface. Use
 * answer-first public Trust Forward landing/FAQ content." A personalised result
 * page lives in one learner's browser and is worth nothing to a reader arriving
 * from a search for "how do you verify AI-generated code".
 *
 * `intentQuestions` are the six approved clusters verbatim, and they are
 * QUESTIONS ONLY. The handoff supplies no approved answer for any of them, so
 * this module supplies none either — see `TODO_LANDING_FAQ_ANSWERS`. Six
 * plausible paragraphs would read as Ben answering six questions about his own
 * product, which is precisely the relabelling the provenance rule forbids.
 *
 * `evidenceLine` is `UX_COPY.md`'s "Full-product support copy may include"
 * sentence, and it is defined HERE rather than in `surfaces.ts` for the reason
 * given on `FULL_OFFER` — the Case 5 closing upsell imports it. It is the
 * doctrine boundary in one line: layer 02's "evidence never doctrine" rule,
 * said to the learner instead of to the build, and the sentence that makes the
 * offer's three claims survivable.
 */
export const LANDING_INCOMPLETE = {
  heading: "Trust Forward",
  lede:
    "Hands-dirty judgment practice for developers deciding what AI can carry—and what still has to remain theirs.",
  /*
   * SUPERSEDED 2026-09-08. "Five fixed developer scenarios" described the
   * fictional instrument; it now understates the product and miscounts the
   * work — five cases, but seventeen decision points inside them.
   *
   * "The runtime stays deterministic" survives unchanged: it was true then and
   * is true now, and it is the claim the whole architecture exists to keep.
   */
  body:
    "Five cases from Ben Chan's own professional work. You decide at each point and commit, before you see what he chose — and how his judgment has changed since. The runtime stays deterministic.",
  /*
   * SUPERSEDED 2026-09-08, and flagged rather than silently re-estimated.
   *
   * "About 15-30 minutes" was measured against eleven decisions with three
   * options each. The product now has seventeen checkpoints, four options each,
   * plus a closest-alternative selection, a commit, a two-part reveal and an
   * optional note at every one. The old figure is not a rounding error; it is
   * roughly half.
   *
   * The replacement is an ESTIMATE this build made, not a measurement and not
   * an approved string. It is registered as implementation-authored. If it is
   * wrong it should be replaced by timing a real run, not by adjusting it until
   * it feels right — an under-promise on time is the kind of small dishonesty
   * that a learner notices exactly once.
   */
  timeEstimate: "Expected time: about 30–45 minutes.",
  revealLead: "Complete Lite to reveal:",
  revealItems: [
    "your observed SHIP developer pattern",
    "your local export",
    "and a completion offer for full Trust Forward"
  ],
  primaryCta: "Start Trust Forward Lite",
  evidenceLine: "My decisions are evidence. They are not your answer key.",
  semanticWedge:
    "Developer judgment for AI-assisted engineering: what to trust, what to verify, what to delegate, what to promise, and when to take the wheel back.",
  intentQuestions: [
    "Can you trust AI-generated code?",
    "How do you verify AI-generated code?",
    "How much work can AI safely own?",
    "Is my engineering team ready for AI?",
    "AI readiness assessment",
    "AI fluency and judgment"
  ],
  fullOffer: FULL_OFFER
} as const;

/* -------------------------------------------------------------------------- */
/* 9. Landing — completed Lite                                                */
/*    (UX_COPY.md "## `/trust-forward` — completed Lite")                     */
/* -------------------------------------------------------------------------- */

/**
 * `/trust-forward` for a visitor whose browser holds a completed Lite run.
 *
 * A different page, not the same page with a badge. The incomplete state sells
 * Lite; this one assumes Lite is done and offers two doors — back to the result
 * the learner already owns, and forward to Full.
 *
 * `bridge` is the completed-state sentence and it is the honest version of the
 * upsell: SHIP "gives you a place to start looking", and Full is where you find
 * out "when that pattern holds—and when it should change". It concedes that the
 * pattern may not hold, which is the whole reason the disclaimer on the result
 * page can be as blunt as it is.
 *
 * `status` is two words on purpose. There is no completion congratulation in
 * the handoff, and writing one would be this build adding a tone Ben did not.
 */
export const LANDING_COMPLETE = {
  heading: "Trust Forward",
  status: "Lite complete.",
  reopenCta: "Reopen Lite result",
  continueCta: "Continue to full Trust Forward",
  bridge:
    "SHIP gives you a place to start looking at how you decide. Trust Forward helps you find out when that pattern holds—and when it should change.",
  fullOffer: FULL_OFFER
} as const;

/* -------------------------------------------------------------------------- */
/* 10. Gaps the handoff does not fill                                         */
/* -------------------------------------------------------------------------- */

/**
 * The landing's answer-first FAQ has approved QUESTIONS and no approved
 * ANSWERS.
 *
 * `professional-summary-market-direction.BEN_APPROVED.json` locks the direction
 * and records `"status":"direction_locked_exact_copy_implementation_authored"`,
 * which is an instruction to author the exact copy — under a marked
 * implementation-authored provenance, through the repo's normal approval
 * mechanics, and not inside this module, whose whole contract is that every
 * string is traceable to a handoff document. Until that copy exists and is
 * approved, `LANDING_INCOMPLETE.intentQuestions` renders as vocabulary — a
 * heading list, a FAQ index — and not as a question-and-answer block with six
 * empty answers.
 */
/**
 * RESOLVED 2026-09-07 — the answers are authored; see `LANDING_FAQ` below.
 * Kept as a tombstone so a reader who searches for the old name finds where it
 * went rather than concluding the FAQ was dropped.
 */
export const TODO_LANDING_FAQ_ANSWERS = null;

/**
 * The result page's professional summary body is not in this module.
 *
 * Layer 07 keeps a professional summary and drops the old three-value
 * `profile_headline`, but marks the summary implementation-authored from market
 * vocabulary rather than recovered. The authoritative profile body is the
 * recovered 729-state deterministic narrative, which `profiles.ts` owns. This
 * constant exists so that a reader who searches this file for the summary finds
 * the reason it is absent instead of assuming it was forgotten.
 */
/**
 * RESOLVED 2026-09-07 — the template is authored; see
 * `PROFESSIONAL_SUMMARY_CLAUSES` below. Tombstone, as above.
 */
export const TODO_RESULT_PROFESSIONAL_SUMMARY = null;

/* -------------------------------------------------------------------------- */
/* 11. Provenance                                                             */
/* -------------------------------------------------------------------------- */

/**
 * One tag per group, as the Lite content invariant requires.
 *
 * Every group is `ben_canonical`: layer 01's `UX_COPY.md` is Ben's own codex
 * package and the two layer-07 files are `ben_approved_*` rulings. Deliberately
 * NOT `recovered_prior_authoring` — that tag is reserved for the layer-06
 * extraction, and `CURRENT_IMPLEMENTATION_STATUS_2026-09-07.md` forbids
 * converting between the two in either direction. Nothing here is
 * `implementation_authored_under_ben_approved_rule`, because this module
 * authored no prose at all; the surfaces that would have needed it are the two
 * `TODO_` constants above.
 */
export const COPY_PROVENANCE = {
  INFO_MARKERS: "ben_canonical",
  LITE_INTRO: "ben_canonical",
  PROGRESS: "ben_canonical",
  REFLECTION: "ben_canonical",
  HANDLE: "ben_canonical",
  RESULT: "ben_canonical",
  FULL_OFFER: "ben_canonical",
  LANDING_INCOMPLETE: "ben_canonical",
  LANDING_COMPLETE: "ben_canonical",
  /*
   * Added 2026-09-08. The only `ben_canonical` group in this module that came
   * from Ben directly rather than from a Ben-supplied file — see the ruling
   * recorded at `TRUST_FORWARD_TEASER`'s definition, and the matching entry in
   * `BEN_AUTHORED_GROUPS` in tests/trust-forward-content.test.ts, which is the
   * gate that requires the ruling to exist.
   */
  TRUST_FORWARD_TEASER: "ben_canonical"
} as const;

export type TrustForwardCopyGroup = keyof typeof COPY_PROVENANCE;

/**
 * The SHIP bars' axis-END captions — what each end of a two-ended bar MEANS.
 *
 * `ROUTING_AND_SCORING.md` gives a 0 and a 1 reading for each of the four axes
 * (S: "Start from available scope" / "Stop, inspect, clarify before
 * committing"; and so on). Those readings are the natural captions, and the
 * bars would be far more legible with them.
 *
 * They are NOT shipped, and the reason is narrow: those sentences describe a
 * SHIP BIT — one side of a threshold — while the bar renders a continuous lean.
 * Captioning a lean with a bit's reading would tell a learner at 50.4% that
 * they "stop and inspect before committing", which is a claim their answers do
 * not support. Nothing in the approved sources captions a bar END, so the ends
 * ship unlabelled: honest about being directionless rather than dishonest about
 * what a direction means.
 *
 * RULED 2026-09-07: **no endpoint captions, by design.** This is no longer a
 * gap awaiting copy — it is a decision, and the approved reason is the one this
 * comment already gave: the bars show a continuous lean while the existing 0/1
 * language describes thresholded bit outcomes, so "endpoint captions would
 * imply unsupported precision."
 *
 * `null` therefore stays, permanently rather than provisionally. Captions may
 * be added only if Ben later authors language for continuous tendencies rather
 * than for bit meanings.
 */
export const TODO_SHIP_AXIS_END_LABELS = null;

/* -------------------------------------------------------------------------- */
/* Layer 09 — the final approved copy (2026-09-07)                            */
/* -------------------------------------------------------------------------- */

/**
 * The landing FAQ, answers included.
 *
 * These are the ANSWERS to the six approved intent clusters, and the reason
 * they belong on the landing rather than the result is layer 07's own SEO rule:
 * "Personalized local summaries are not the crawlable SEO surface. Use
 * answer-first public Trust Forward landing/FAQ content." A personalised result
 * lives in one learner's browser and is worth nothing to a reader arriving from
 * a search for "how do you verify AI-generated code".
 *
 * Third-person site register, never Ben's first person — the same rule every
 * other public surface here follows.
 */
export const LANDING_FAQ = [
  {
    question: "Can you trust AI-generated code?",
    answer:
      "AI-generated code can be trusted only to the extent that the parts that matter have been verified. The required evidence should scale with the consequence of being wrong, and the developer should understand enough of the implementation to know what still needs checking."
  },
  {
    question: "How do you verify AI-generated code?",
    answer:
      "Start with the actual promise the code has to keep, then test the consequential paths against that promise. Review assumptions, inspect the parts that carry meaningful risk, and use deterministic evidence such as tests and observed behavior rather than treating a plausible implementation or an AI claim of completion as proof."
  },
  {
    question: "How much work can AI safely own?",
    answer:
      "AI can carry a large share of execution. Accountability still needs an explicit human owner. More work can be delegated when scope is clear, consequences are bounded, verification is available, and someone remains responsible for deciding what evidence is enough before the work ships."
  },
  {
    question: "Is my engineering team ready for AI?",
    answer:
      "AI readiness is less about access to AI tools than the judgment surrounding their use. A ready team can clarify ambiguous work, decide what to delegate, verify according to consequence, surface uncertainty, keep ownership visible, and recognize when generated work exceeds the team's ability to judge responsibly."
  },
  {
    question: "AI readiness assessment",
    answer:
      "An AI readiness assessment should examine how a team handles scope, verification, promises, risk, delegation, and accountability as AI carries more execution. The goal is to expose where AI creates real leverage and where faster implementation could outrun the judgment needed to stand behind the result."
  },
  {
    question: "AI fluency and judgment",
    answer:
      "AI fluency is more than knowing how to prompt or generate code. It includes knowing what to ask AI to do, what should remain human, how to test what comes back, when to challenge a plausible answer, and what responsibility still belongs to the person or team using the tool."
  },
]  as const;

/**
 * The professional summary — "A professional version you can keep".
 *
 * Deterministic template, NOT AI-generated: one clause per dimension selected
 * by the learner's terminal posture, then a fixed closing sentence. It is the
 * one place Lite writes something the learner might reuse elsewhere, which is
 * exactly why it is composed from a fixed table rather than generated.
 *
 * THE KEYS ARE MAPPED BY POSITION, AND THAT IS LOAD-BEARING. The approved
 * template names three postures differently from the six-dimension vocabulary:
 * `bound` for `investigate`, `target` for `sample`, `verify` for `prove`. The
 * orderings agree (low, middle, high) and the meanings agree, so the mapping is
 * safe — but a key lookup would silently return `undefined` for three of the
 * eighteen clauses and drop them from the paragraph with no error. The table
 * below is written in the CANONICAL vocabulary, and
 * `tests/trust-forward-content.test.ts` asserts every clause matches the
 * approved artifact so the translation cannot drift.
 *
 * Forbidden inputs, per the ruling: the SHIP code, learner reflections, the
 * recovered `market_copy` and `strongest_upsell` columns, and `profile_headline`.
 */
export const PROFESSIONAL_SUMMARY_CLAUSES = {
  ambiguity: {
    act: "When the scope is clear enough to move, I start with what I have.",
    clarify: "If an unclear detail could change the work, I clarify it before I commit.",
    /* approved template key: `bound` */
    investigate: "I can move with some uncertainty when I make the unknowns and limits clear.",
  },
  verification: {
    trust: "I rely on credible existing evidence when it already answers the question.",
    /* approved template key: `target` */
    sample: "I check the specific parts that still need evidence.",
    /* approved template key: `verify` */
    prove: "I do more verification when being wrong would have bigger consequences.",
  },
  promise: {
    commit: "I make a clear commitment when I have enough evidence to stand behind it.",
    qualify: "If important facts are still missing, I make clear what I can promise and what is still uncertain.",
    renegotiate: "If new evidence changes what I can responsibly deliver, I revisit the commitment.",
  },
  risk: {
    move: "I keep moving when a mistake would be easy to recover from.",
    stage: "I break work into reversible steps and checkpoints when I need to limit risk.",
    protect: "I add safeguards when a failure would be costly or hard to undo.",
  },
  ownership: {
    transfer: "When I delegate work, I let ownership transfer when the new owner is clear.",
    share: "I can share the work while keeping checkpoints and accountability clear.",
    retain: "I can delegate the work and still keep final accountability when responsibility has not actually transferred.",
  },
  trust: {
    task: "I stay focused on getting the agreed work delivered.",
    relationship: "I consider both delivery and what the stakeholder needs to make informed decisions.",
    stewardship: "I think beyond the immediate task and consider the long-term trust attached to what ships.",
  },
} as const;

/** Closes every professional summary, whatever the six clauses were. */
export const PROFESSIONAL_SUMMARY_CLOSING =
  "As AI takes on more of the implementation, I stay clear on what still needs my judgment, what evidence I need, and what I am willing to stand behind.";

/** The surface's own title, from the approved ruling. */
export const PROFESSIONAL_SUMMARY_TITLE = "A professional version you can keep";

/**
 * Case 5's AI completion report explanation, beneath the five claim lines.
 *
 * ONE BODY FOR ALL 27 VARIANTS, per the ruling — and the ruling's second
 * sentence is the interesting one: "Do not add framework, library, file, or
 * variant-specific implementation details." A report that named real files
 * would be a report a learner could check. This one cannot be checked, which is
 * the whole point of the case: it is competent, plausible, and confidently
 * incomplete.
 */
export const C5_AI_EXPLANATION_BODY =
  "I updated the requested behavior, added checks around the affected path, and extended the tests to cover the expected flow and relevant edge cases. I also ran the existing test suite to check for regressions around the change. Everything is passing, and I found no remaining issues that would block deployment.";

/**
 * The Export-first offer shown to a completed learner before "Start over".
 *
 * JSON, not Markdown, and the ruling says why: JSON is the only artifact
 * carrying the whole ledger, and the reset is what destroys it. Markdown stays
 * available as the readable summary but is not a substitute for the backup.
 */
export const EXPORT_FIRST = {
  primaryAction: "Download full backup (JSON)",
  explanation: "Saves your complete Lite record before this browser copy is reset."
} as const;

/**
 * The forward control on an already-answered case.
 *
 * IMPLEMENTATION-AUTHORED, AND UNSOURCED. No approved artifact supplies a
 * "back to your result" label — `RESULT.secondaryCta` is the reverse direction
 * ("Reopen your decisions") and the run's normal forward motion happens as a
 * side effect of answering, never as a named control.
 *
 * It exists because the product is otherwise unfinishable from one real state:
 * a learner who completes the run and then navigates back to a case has every
 * decision answered, so nothing triggers the advance, and the screen offers no
 * way to the result. The case navigator only moves between cases. That is a
 * dead end reachable in two clicks.
 *
 * Registered in `TRUST_FORWARD_IMPLEMENTATION_AUTHORED_LABELS` so it is visible
 * as unsourced rather than passing for approved copy, and it is on the list of
 * questions back to the handoff author.
 */
export const RESUME_RESULT_CTA = "See your result";

/* -------------------------------------------------------------------------- */
/* Trust strip — the four things a visitor wants to know before starting      */
/* -------------------------------------------------------------------------- */

/**
 * Free, no account, no AI, nothing leaves the browser.
 *
 * EVERY CLAIM HERE WAS VERIFIED AGAINST THE CODE BEFORE IT WAS WRITTEN, which
 * is the only reason it is allowed to be this confident:
 *
 *   "Free"                  no payment, pricing or checkout code exists anywhere
 *                           in `app/`, `components/` or `lib/`.
 *   "No account"            no auth code, no session cookie, no identity of any
 *                           kind. The optional handle is a local string.
 *   "No AI"                 `package.json` runtime dependencies are `next`,
 *                           `react`, `react-dom`. There is no model in the
 *                           bundle and none is called at runtime.
 *   "Nothing leaves your browser"
 *                           answers, notes and the whole ledger live in
 *                           localStorage. Analytics carry coarse funnel events
 *                           only — that a case was reached, not which option was
 *                           chosen — behind a consent gate, and the aggregate
 *                           choice counter ships disabled (`TF_AGGREGATE_ENABLED
 *                           = false`, no endpoint exists).
 *
 * This is the site's existing trust posture, stated for Trust Forward. It reads
 * as marketing because the honest version of these four facts IS the pitch —
 * "no AI reading your answers" is a real differentiator precisely because it is
 * true, and it would be worth nothing the moment it stopped being.
 *
 * IMPLEMENTATION-AUTHORED. Registered as such; not an approved artifact string.
 */
export const TRUST_STRIP = {
  items: [
    "Free",
    "No account",
    "No AI",
    "Nothing leaves your browser"
  ],
  /** The one-line expansion under the pills. */
  line:
    "No signup, no email, no chatbot. Your decisions and notes stay in this browser — the site counts whether a case was reached, never what you chose.",
  /** What the product deliberately does not have. The site's anti-feature idiom. */
  without: ["A chatbot", "An account", "Your email", "A score", "A certificate"]
} as const;

/* -------------------------------------------------------------------------- */
/* 13. The /trust-forward teaser                                              */
/*     (Ben's instruction, 2026-09-08 — see the provenance note below)        */
/* -------------------------------------------------------------------------- */

/**
 * What `/trust-forward` says now: how Lite and full Trust Forward relate.
 *
 * PROVENANCE, STATED PRECISELY, BECAUSE THIS GROUP IS `ben_canonical` AND THAT
 * TAG IS GATED. Every other `ben_canonical` group in this module came from a
 * Ben-supplied FILE — layer 01's `UX_COPY.md` or a layer-07
 * `ben_approved_governing_rule`. This one did not. Ben wrote these sentences
 * directly, in the session of 2026-09-08, as the brief for this page. There is
 * no artifact under `bct-facelift/` to diff against and there never will be, so
 * the record of what he wrote is the session transcript and this comment.
 *
 * `tests/trust-forward-content.test.ts` freezes the set of groups allowed to
 * claim `ben_canonical` and fails on any addition, for a good reason: *"Never
 * relabel implementation-authored copy as Ben-authored merely because it was
 * generated to fill a package gap."* That rule is about copy this build wrote.
 * These are Ben's own sentences, so labelling them anything else would be the
 * same lie pointing the other way — and
 * `CURRENT_IMPLEMENTATION_STATUS_2026-09-07.md` forbids the conversion in both
 * directions. The gate is satisfied the way it asks to be: by a ruling recorded
 * alongside the addition, not by a quiet content edit.
 *
 * THE ONE EDIT MADE TO HIS TEXT, AND ITS LIMIT. Ben's brief describes the
 * product in the third person — *"It gives the learner authored professional
 * situations"*, *"The learner encounters each case across multiple rounds"* —
 * because he was writing a specification, not a page. His own headline copy is
 * second person (*"helps you hear your own signal"*), and a public page that
 * calls its reader "the learner" is talking about them rather than to them. So
 * every "the learner" became "you" and the surrounding verbs agree. Nothing
 * else changed: no sentence was shortened, reordered, softened or added, and
 * the two headline lines, the pass names, the method grammar and the CTA are
 * character-for-character his.
 *
 * WHAT `42` IS DOING IN PUBLIC COPY, GIVEN THAT `FULL_OFFER.bridge` SAYS "40+".
 * Layer 07 ruled that 42 was the INTERNAL corpus authority and that no public
 * string should say it; the plan records that as SC-TF7. Ben superseded both
 * halves of that on 2026-09-08 — first by raising the public floor from "30+"
 * to "40+", then by writing "42 canonical case families" into this page
 * himself. The two numbers do not contradict each other (a floor of 40+ under a
 * count of 42, and a "case family" is not a "case"), but they are two different
 * public statements of the same corpus, and that is a thing to notice rather
 * than to smooth over: if the corpus count ever moves, BOTH have to move, and
 * only one of them is guarded by a test that names the number.
 *
 * THE ORDER OF THE PAGE IS THE ARGUMENT. Lite first, bounded, and honest about
 * what it refuses to do; then Full, which is where the AI Coach appears; then
 * the method that governs both; then the goal, which is the only sentence that
 * says what any of it is FOR. The positioning couplet is last before the CTA
 * because it is the sentence a reader should be holding when they click.
 */
export const TRUST_FORWARD_TEASER = {
  eyebrow: "Developer judgment for AI-assisted engineering",
  heading: "Trust Forward",
  /** The product's own prompt, quoted. Set in italic serif in the hero. */
  prompt: "What would you do in my shoes?",
  heroBody:
    "What to trust, what to verify, what to delegate, what to promise, and when to take the wheel back. Authored professional situations that require you to commit your judgment before you see what Ben actually did.",

  /** The five stages as a numbered rail beside the hero. */
  sequence: {
    label: "The YY Method™ sequence",
    stages: ["Capture", "Why", "Why-Not", "Commit", "Timestamp"],
    note: "You commit first. Ben's historical judgment comes afterward."
  },

  /*
   * THE FOUR NUMBERS UNDER THE HERO, AND WHERE EACH ONE IS PINNED.
   * "40+" is `FULL_OFFER.bridge`'s floor and "42" the count the teaser states
   * outright — `tests/trust-forward-content.test.ts` asserts both by name, so
   * these labels cannot drift from the sentences that carry the same figures.
   * "3" is `full.passes.length` and "90" is the curriculum length in `full.body`.
   */
  stats: [
    { value: "40+", label: "real cases from lived professional experience" },
    { value: "42", label: "canonical case families" },
    { value: "3", label: "passes per underlying problem" },
    { value: "90", label: "days, AI-assisted curriculum" }
  ],

  ladder: {
    eyebrow: "Two doors",
    /*
     * SUPERSEDES THE TWO-LINE COUPLET. Ben's 2026-09-08 brief sets the section
     * heading as one sentence and shortens the second clause — "Trust Forward
     * tests whether it survives" for "helps you test whether it survives
     * another perspective, another condition, and eventually your own real
     * work". Same claim, and the shorter form is the one that can be a heading.
     */
    heading:
      "Trust Forward Lite helps you hear your own signal. Trust Forward tests whether it survives."
  },

  lite: {
    name: "Trust Forward Lite",
    badge: "Deterministic",
    cardHeading: "The deterministic introduction.",
    body:
      "It gives you authored professional situations, asks what you would do in Ben's shoes, and requires you to commit your judgment before you see what Ben actually did. It preserves an auditable record of your decisions.",
    /*
     * THE MIDDLE CHIP IS NOT THE BRIEF'S. The brief says "15–30 min", twice.
     * That figure was measured against ELEVEN decisions with three options
     * each; the shipped product has seventeen checkpoints with four options, a
     * closest-alternative selection, a commit, a two-part reveal and an
     * optional note at every one. It is not a rounding error, it is roughly
     * half, and it is already recorded as superseded at
     * `LANDING_INCOMPLETE.timeEstimate`. An under-promise on time is the kind
     * of small dishonesty a learner notices exactly once — and on a page whose
     * whole pitch is "commit before you see the answer", it is the wrong thing
     * to be wrong about. Everything else on this page is the brief verbatim.
     */
    chips: ["5 fixed cases", "About 30–45 minutes", "Stays in your browser"],
    boundedLead: "It is deliberately bounded:",
    boundedItems: [
      "No AI interprets your free text.",
      "No personality score is produced.",
      "No AI gets to decide what you believe."
    ]
  },

  full: {
    name: "Trust Forward",
    badge: "90 days",
    cardHeading: "The 90-day curriculum.",
    body:
      "The deeper 90-day AI-assisted judgment curriculum, built from 42 canonical case families grounded in Ben Chan's lived professional experience. You encounter each case across multiple rounds.",
    passes: [
      {
        step: "Pass 1",
        label: "Draw From the Well",
        body: "Make an independent call before seeing Ben's historical decision and outcome."
      },
      {
        step: "Pass 2",
        label: "Study the Map",
        body:
          "Revisit the same underlying problem after a meaningful condition, incentive, perspective, or role changes."
      },
      {
        step: "Pass 3",
        label: "Build Your Compass",
        body:
          "Transfer the pattern into a sufficiently different situation where simply copying Ben — or your own earlier answer — can fail."
      }
    ],
    alsoLine:
      "Selected cases also include STORM recovery exercises, source inspection, perspective inversions, and spaced retrieval of your own earlier judgments."
  },

  method: {
    eyebrow: "The rule",
    heading: "Every consequential decision follows the YY Method™.",
    body:
      "You commit first. Ben's historical judgment comes afterward. Ben's current judgment may disagree with his past judgment. The AI Coach can retrieve, compare, challenge, and pressure-test, but it does not make your decision for you."
  },

  goal:
    "The goal is not to teach you to copy Ben. It is to help you accumulate enough real judgment evidence, corrections, disagreements, verification rules, delegation boundaries, and recovery principles that you build a Developer Judgment Playbook of your own.",
  /** The two words set solid inside `goal`. Rendered by splitting on it. */
  goalEmphasis: "Developer Judgment Playbook",

  faq: {
    eyebrow: "Developer judgment, answered",
    heading: "What to trust, what to verify, what to delegate."
  },

  close: {
    heading: "Commit your judgment first.",
    body: "Five cases. About 30–45 minutes. Everything stays in your browser.",
    noAiLead: "You're not talking to AI anywhere on this site.",
    noAiBody:
      "No chatbot, no coach, no generated answers. AI executes inside boundaries; human judgment sets them."
  },

  /*
   * THE COUPON. Ben's instruction, 2026-09-08: make Lite *"an easy to justify
   * thing that clearly will earn them a coupon toward studio."*
   *
   * IT IS AN OFFER THIS SITE HAS NO CODE FOR, AND THAT IS THE THING TO KNOW
   * ABOUT IT. Nothing in `app/`, `components/` or `lib/` issues, stores or
   * validates a coupon; there is no account, no email capture and no payment
   * integration, by design. So the promise is only as good as the person who
   * answers the claim, and the wording says exactly that rather than implying a
   * system: you finish Lite, you ask, Ben sends it. `claimHref` points at
   * `/contact`, which is a real page that already works — a coupon a reader
   * cannot claim would be a broken promise on the one page whose entire pitch
   * is that judgment gets committed before the answer is shown.
   *
   * NEEDS BEN'S WORDING AND HIS FULFILMENT DECISION. Registered as
   * implementation-authored in `TRUST_FORWARD_IMPLEMENTATION_AUTHORED_LABELS`:
   * the intent is his, the sentences are not, and a commercial commitment is
   * not something this build should be phrasing on his behalf.
   */
  coupon: {
    badge: "Free · earns a coupon",
    lead: "Finishing Lite earns you a coupon toward Trust Forward on Studio.",
    body:
      "It costs nothing, it stays in your browser, and it is the cheapest way to find out whether the full curriculum is worth your ninety days.",
    claimLabel: "Ask for your coupon",
    claimNote: "Finish Lite, then send a note. There is no account and nothing to sign up for."
  },

  /** The arrow is Ben's, typed in his brief. */
  primaryCta: "Continue to Trust Forward →",
  /** The way back to the free doorway. */
  liteCta: "Start Trust Forward Lite →"
} as const;
