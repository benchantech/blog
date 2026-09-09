/**
 * Developer Forward Lite — chrome and framing copy (plan §7, "copy.ts — UX_COPY.md
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
 *   LANDING_INCOMPLETE 01_…/UX_COPY.md "## `/developer-forward` — incomplete Lite"
 *                      + 07_…/public-copy-and-full-bridge.BEN_APPROVED.json
 *                      + 07_…/professional-summary-market-direction.BEN_APPROVED.json
 *   LANDING_COMPLETE   01_…/UX_COPY.md "## `/developer-forward` — completed Lite"
 *   FULL_OFFER         07_…/public-copy-and-full-bridge.BEN_APPROVED.json
 *
 * `FULL_OFFER` AND `LANDING_INCOMPLETE.evidenceLine` ARE THE SINGLE DEFINITIONS
 * OF THE FOUR APPROVED PUBLIC SENTENCES. `content/developer-forward/surfaces.ts`
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
 *     `internalCanonicalFullCorpusCount`. **SUPERSEDED THREE TIMES, AND THE
 *     RULE ENDED UP BACK WHERE IT STARTED.** Ben raised the public floor from
 *     "30+" to "40+" on 2026-09-08 (the floor moved, the rule held); then wrote
 *     "42 canonical case families" into the teaser, which killed the
 *     internal-only rule outright; then on 2026-09-09 replaced that phrase with
 *     "40+ real cases" and moved the stat off the page entirely.
 *
 *     So layer 07's rule is in force again: **42 is the internal corpus
 *     authority and no public string says it.** There is now exactly ONE public
 *     number for the corpus — the "40+" floor — said in two places that use the
 *     same words, so they cannot disagree. `tests/developer-forward-content.test.ts`
 *     bans 42 from learner-facing copy and pins the floor by name.
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

import { CASE_NUMBERS } from "@/lib/developer-forward/types";
import type { CaseNumber, DecisionId } from "@/lib/developer-forward/types";

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
      "Developer Forward Lite runs from real cases written in advance and fixed rules. Nothing you write is read by a model — your optional notes are remembered locally, exactly as you wrote them, and never interpreted."
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
  heading: "Developer Forward Lite",
  lede: "Five fixed developer-judgment cases.",
  promiseLead: "Make the calls, see the pattern, and finish with:",
  promiseItems: [
    "your SHIP profile",
    "Markdown + JSON export",
    "and a completion offer for full Developer Forward"
  ],
  /*
   * 15–25, from 2026-09-09. This is the layer-01 approved string and it read
   * "About 15–30 minutes." for the whole of that time; the intro screen was
   * the last surface still saying it, so a learner met one figure on the way
   * in and a different one on the landing they came from. Ben set 15–25 for
   * both. Every time statement the product makes is now the same number.
   */
  timeEstimate: "About 15–25 minutes.",
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
 * browser" is `lib/developer-forward` local state, "preserved exactly as you wrote
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
 * `lib/developer-forward/types.ts` carries the same rule in its own comment —
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
  completionCta: "Continue to full Developer Forward",
  secondaryCta: "Reopen your decisions",
  /** Destructive. Clears local state; the ledger's own reset event records it. */
  destructiveCta: "Start over"
} as const;

/* -------------------------------------------------------------------------- */
/* 7. The full Developer Forward offer                                            */
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
 * `DEVELOPER_FORWARD_IMPLEMENTATION_AUTHORED_LABELS` as implementation-authored,
 * not passed off as the approved string it replaces.
 */
export const FULL_OFFER = {
  descriptor:
    /*
     * "Seventeen decision points." was struck by Ben on 2026-09-09. It was
     * true — the five cases carry seventeen checkpoints — and it is the kind of
     * true number that reads as a workload rather than an offer. The two
     * sentences that remain are the ones that say what the exercise IS.
     */
    "Five real cases. Your judgment is recorded before Ben's is revealed.",
  bridge: "40+ real cases drawn from Ben Chan’s actual professional experience.",
  confidentiality:
    "Cases may be anonymized or composited where necessary to protect clients, employers, colleagues, confidential information, or identifying details while preserving the underlying decision pressure."
} as const;

/* -------------------------------------------------------------------------- */
/* 8. Landing — incomplete Lite                                               */
/*    (UX_COPY.md "## `/developer-forward` — incomplete Lite";                    */
/*     07_…/professional-summary-market-direction.BEN_APPROVED.json)          */
/* -------------------------------------------------------------------------- */

/**
 * `/developer-forward` for a visitor with no local completion.
 *
 * `semanticWedge` and `intentQuestions` are layer 07's answer-first material.
 * The ruling's own SEO rule is why they are on the LANDING and not on the
 * result: "Personalized local summaries are not the crawlable SEO surface. Use
 * answer-first public Developer Forward landing/FAQ content." A personalised result
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
  heading: "Developer Forward",
  /*
   * REPLACED 2026-09-09 (Ben). The layer-01 lede — "Hands-dirty judgment
   * practice for developers deciding what AI can carry—and what still has to
   * remain theirs" — described the MECHANISM. This one names the outcome, and
   * it is the same promise `closingUpsell.corePromiseHeading` already makes at
   * the end of a run ("Become The Developer Clients Keep"), moved to the front
   * where a first-time visitor meets it. The two differ deliberately: clients
   * for the freelancer close, companies for the landing.
   */
  lede: "Become the developer companies keep.",
  /*
   * SUPERSEDED 2026-09-08. "Five fixed developer scenarios" described the
   * fictional instrument; it now understates the product and miscounts the
   * work — five cases, but seventeen decision points inside them.
   *
   * "The runtime stays deterministic" survives unchanged: it was true then and
   * is true now, and it is the claim the whole architecture exists to keep.
   */
  /*
   * STRUCK 2026-09-09, and kept as an empty string rather than deleted from the
   * shape. Ben removed the paragraph; `body` is read by `app/page.tsx` and by
   * `/developer-forward`'s incomplete landing, and dropping the FIELD would
   * have been an edit to two renderers instead of to one sentence. Both call
   * sites skip it when it is empty, so nothing renders a blank paragraph and
   * restoring the copy is one string.
   */
  body: "",
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
  /*
   * "about 15-25 minutes", set by Ben on 2026-09-09, superseding this build's
   * own 30–45 estimate — which itself superseded layer 01's approved 15–30
   * after the YY rewrite. The 30–45 figure was reasoned from the checkpoint
   * count, never measured; Ben's is the one from someone who has run it. Still
   * an estimate rather than a measurement, and still the only time statement
   * either landing makes. En dash, matching every other range on the site.
   */
  timeEstimate: "Expected time: about 15–25 minutes.",
  revealLead: "Complete Lite to reveal:",
  revealItems: [
    "your observed SHIP developer pattern",
    "your local export",
    "and a completion offer for full Developer Forward"
  ],
  primaryCta: "Start Developer Forward Lite",
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
/*    (UX_COPY.md "## `/developer-forward` — completed Lite")                     */
/* -------------------------------------------------------------------------- */

/**
 * `/developer-forward` for a visitor whose browser holds a completed Lite run.
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
  heading: "Developer Forward",
  status: "Lite complete.",
  reopenCta: "Reopen Lite result",
  continueCta: "Continue to full Developer Forward",
  bridge:
    "SHIP gives you a place to start looking at how you decide. Developer Forward helps you find out when that pattern holds—and when it should change.",
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
   * recorded at `DEVELOPER_FORWARD_TEASER`'s definition, and the matching entry in
   * `BEN_AUTHORED_GROUPS` in tests/developer-forward-content.test.ts, which is the
   * gate that requires the ruling to exist.
   */
  DEVELOPER_FORWARD_TEASER: "ben_canonical"
} as const;

export type DeveloperForwardCopyGroup = keyof typeof COPY_PROVENANCE;

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
 * answer-first public Developer Forward landing/FAQ content." A personalised result
 * lives in one learner's browser and is worth nothing to a reader arriving from
 * a search for "how do you verify AI-generated code".
 *
 * ANSWER-FIRST, AS OF 2026-09-09 — AWAITING BEN'S APPROVAL. He asked for his
 * four answers to be massaged toward SEO/AEO/GEO targets with minimal rewording,
 * and every edit here is the same edit: the opening clause now restates the
 * SUBJECT of the question, so the passage stands alone when an answer engine
 * quotes it without the heading above it. "It depends on the underlying
 * judgment" became "AI-generated code is only as trustworthy as the judgment";
 * "You can ask multiple AI models" became "To verify AI-generated code, ask
 * several"; "Take what you would normally tell a human developer" gained "AI
 * can safely own as much work as you can specify" in front of it; and the
 * whiteboard test now closes by answering the question it was asked instead of
 * with a bare "now you're ready".
 *
 * NOTHING ELSE MOVED. No claim was added, softened or dropped; the pinball
 * machine, the North Star and the whiteboard are Ben's, word for word. The
 * substitutions are marked in `tests/developer-forward-content.test.ts` against
 * both his text and the layer-09 approved text, so what he wrote is recoverable
 * if he wants any of it back.
 *
 * THE THIRD-PERSON RULE IS NO LONGER TRUE OF THIS SECTION, and saying so is
 * cheaper than leaving a comment that lies. Two of the six answers are still
 * the approved layer-09 text in the site's third-person register. Four are not:
 * Ben rewrote them on 2026-09-09 — in direct address ("if you can explain… ship
 * it under your own name"), in his own first person ("remain my North Star"),
 * in the second person with a metaphor ("AI is like a pinball machine"), and in
 * the imperative ("Grab a whiteboard, put the laptops away"). The section's
 * heading above them is first person outright. The register here is now deliberately mixed — see
 * `DEVELOPER_FORWARD_TEASER.faq.heading` and the coupon block, which made the
 * same move on the same day. Update this count as the rest are rewritten.
 */
export const LANDING_FAQ = [
  {
    /*
     * ANSWER REPLACED 2026-09-09 (Ben), superseding the layer-09 approved text:
     * "AI-generated code can be trusted only to the extent that the parts that
     * matter have been verified. The required evidence should scale with the
     * consequence of being wrong, and the developer should understand enough of
     * the implementation to know what still needs checking."
     *
     * Same position, three concrete tests instead of a principle — explain it,
     * see the results yourself, put your name on it.
     *
     * THE QUESTION IS UNCHANGED, DELIBERATELY. Ben's note wrote it as "Can I
     * trust AI-generated code?"; it ships as "Can you…" because this exact
     * string is also `LANDING_INCOMPLETE.intentQuestions[0]`, the approved SEO
     * intent phrasing, and the two are the same node. Rewording it here alone
     * would give one question two forms. If the "I" phrasing is wanted, both
     * have to move together.
     */
    question: "Can you trust AI-generated code?",
    answer:
      "AI-generated code is only as trustworthy as the judgment encoded into it. If you can explain what the code should do in your own words, verify the test results with your own eyes, and ship it under your own name — that is when you can consider it trustworthy."
  },
  {
    /*
     * ANSWER REPLACED 2026-09-09 (Ben), superseding the layer-09 approved text:
     * "Start with the actual promise the code has to keep, then test the
     * consequential paths against that promise. Review assumptions, inspect the
     * parts that carry meaningful risk, and use deterministic evidence such as
     * tests and observed behavior rather than treating a plausible
     * implementation or an AI claim of completion as proof."
     *
     * The approved answer named a method; this one names two things a reader
     * can do tomorrow, concedes what they cost, and then says what Ben will not
     * trade away. "My North Star" is first person — the second answer in this
     * block to move into it, and the register note above the array records that
     * the section is now deliberately mixed.
     */
    question: "How do you verify AI-generated code?",
    answer:
      "To verify AI-generated code, ask several AI models to explain it back to you with no context, or read it start to finish yourself. Time is the main factor in choosing between them. Either way, deterministic unit tests plus validation in production remain my North Star."
  },
  {
    /*
     * ANSWER REPLACED 2026-09-09 (Ben), superseding the layer-09 approved text:
     * "AI can carry a large share of execution. Accountability still needs an
     * explicit human owner. More work can be delegated when scope is clear,
     * consequences are bounded, verification is available, and someone remains
     * responsible for deciding what evidence is enough before the work ships."
     *
     * The approved answer listed the four conditions for delegating; this one
     * answers the question a reader is actually asking — how do I hand work
     * over — and gives them a calibration ("more specific than you would tell a
     * human") plus an image for why. The first FIGURATIVE language in this
     * block, and the only one on the page.
     *
     * WHAT THE OLD ANSWER SAID AND THIS ONE DOES NOT: that accountability needs
     * an explicit human owner. That claim has not left the site — it is the
     * whole of `claimById("ai-role-boundaries")` on `/ai-disclosure`, and the
     * footer carries "AI executes inside boundaries; human judgment sets them"
     * on every page. Worth knowing it moved rather than went.
     */
    question: "How much work can AI safely own?",
    answer:
      "AI can safely own as much work as you can specify. Take what you would normally tell a human developer and then make it even more specific. AI is like a pinball machine: you have to place the flippers in the right spots to ensure the balls eventually reach their intended positions."
  },
  {
    /*
     * ANSWER REPLACED 2026-09-09 (Ben), superseding the layer-09 approved text:
     * "AI readiness is less about access to AI tools than the judgment
     * surrounding their use. A ready team can clarify ambiguous work, decide
     * what to delegate, verify according to consequence, surface uncertainty,
     * keep ownership visible, and recognize when generated work exceeds the
     * team's ability to judge responsibly."
     *
     * The approved answer defined readiness with a six-item list; this one
     * hands the reader a test they can run this afternoon and lets the
     * definition fall out of it. Imperative throughout — the first answer in
     * this block written as instructions rather than as a position.
     *
     * IT ANSWERS A NARROWER QUESTION THAN IT IS ASKED, deliberately and worth
     * knowing. "Is my team ready" covered six capabilities; the whiteboard test
     * probes one of them — whether the design is understood well enough to be
     * explained without the screen. That is the load-bearing one, and the next
     * answer ("AI readiness assessment") is where the fuller list still lives.
     */
    question: "Is my engineering team ready for AI?",
    answer:
      "Here is the readiness test. Grab a whiteboard, put the laptops away. Sketch your design. Does it make sense? Can you explain the plan without looking? If yes, your team is ready for AI."
  },
  /*
   * TWO ENTRIES WERE WITHDRAWN 2026-09-09, and the reason is visible in the
   * list itself. "AI readiness assessment" and "AI fluency and judgment" are
   * not questions — they are the two bare SEARCH TERMS among layer 07's six
   * intent clusters, and layer 09 authored answers for all six without noticing
   * that four of them ask something and two just name a keyword. Beside four
   * real questions they read as exactly what they are.
   *
   * Ben: "that just looks like SEO grab and i don't like it."
   *
   * Their approved text is not deleted — it is pinned as withdrawn, byte for
   * byte, in `tests/developer-forward-content.test.ts`, so the artifact cannot
   * drift while they are off the page and restoring them is a copy-paste.
   * `LANDING_INCOMPLETE.intentQuestions` still lists all six: that array is the
   * approved SEO record and it renders nowhere, so it stays as inventory.
   */
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
 * `tests/developer-forward-content.test.ts` asserts every clause matches the
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
 * Registered in `DEVELOPER_FORWARD_IMPLEMENTATION_AUTHORED_LABELS` so it is visible
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
 * This is the site's existing trust posture, stated for Developer Forward. It reads
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
/* 13. The /developer-forward teaser                                              */
/*     (Ben's instruction, 2026-09-08 — see the provenance note below)        */
/* -------------------------------------------------------------------------- */

/**
 * What `/developer-forward` says now: how Lite and full Developer Forward relate.
 *
 * PROVENANCE, STATED PRECISELY, BECAUSE THIS GROUP IS `ben_canonical` AND THAT
 * TAG IS GATED. Every other `ben_canonical` group in this module came from a
 * Ben-supplied FILE — layer 01's `UX_COPY.md` or a layer-07
 * `ben_approved_governing_rule`. This one did not. Ben wrote these sentences
 * directly, in the session of 2026-09-08, as the brief for this page. There is
 * no artifact under `bct-facelift/` to diff against and there never will be, so
 * the record of what he wrote is the session transcript and this comment.
 *
 * `tests/developer-forward-content.test.ts` freezes the set of groups allowed to
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
 * `42` IS NOT ON THIS PAGE ANY MORE. It was, for one day: Ben wrote "42
 * canonical case families" into the Full card and the stat row on 2026-09-08,
 * and replaced both with "40+ real cases" on 2026-09-09. Layer 07's rule — 42
 * is the internal corpus authority, no public string says it — is therefore
 * back in force, and the corpus now has exactly one public number said in one
 * form. See the header, conflict (3).
 *
 * THE ORDER OF THE PAGE IS THE ARGUMENT. Lite first, bounded, and honest about
 * what it refuses to do; then Full, which is where the AI Coach appears; then
 * the method that governs both; then the goal, which is the only sentence that
 * says what any of it is FOR. The positioning couplet is last before the CTA
 * because it is the sentence a reader should be holding when they click.
 */
export const DEVELOPER_FORWARD_TEASER = {
  eyebrow: "Developer judgment for AI-assisted engineering",
  heading: "Developer Forward",
  /*
   * THE HERO LINE STOPPED QUOTING THE PRODUCT (Ben, 2026-09-09). It was "What
   * would you do in my shoes?", the checkpoint prompt itself. That prompt is
   * unchanged and still asked seventeen times inside the run — see
   * `YYSandbox`'s `STEP_COPY.whyPrompt`, which is the canonical grammar and is
   * not this string. What changed is the hero's job: it now says why the
   * exercise exists rather than showing a sample of it.
   */
  prompt:
    "The judgment developers built before AI—and why the next generation needs it now.",
  /*
   * THREE LINES, NOT A PARAGRAPH (Ben, 2026-09-09), replacing "What to trust,
   * what to verify, what to delegate, what to promise, and when to take the
   * wheel back. Authored professional situations that require you to commit
   * your judgment before you see what Ben actually did."
   *
   * They are an arc and the order carries it: what the corpus is, what you do
   * with it, what you leave with. The third names the same outcome as the
   * landing lede and the last stat, which is deliberate repetition rather than
   * drift — a visitor should meet that promise three times before the CTA.
   */
  heroPoints: [
    "40+ real cases from decades of developer work",
    "Make your call, pressure test it, then decide what to carry forward",
    "Build your Developer Judgment playbook—and take it with you"
  ],

  /** The five stages as a numbered rail beside the hero. */
  sequence: {
    label: "The YY Method™ sequence",
    stages: ["Capture", "Why", "Why-Not", "Commit", "Timestamp"],
    note: "You commit first. Ben's historical judgment comes afterward."
  },

  /*
   * THE FOUR NUMBERS UNDER THE HERO, AND WHERE EACH ONE IS PINNED.
   * "40+" is `FULL_OFFER.bridge`'s floor and "42" the count the teaser states
   * outright — `tests/developer-forward-content.test.ts` asserts both by name, so
   * these labels cannot drift from the sentences that carry the same figures.
   * "3" is `full.passes.length` and "90" is the curriculum length in `full.body`.
   */
  stats: [
    { value: "40+", label: "real cases from lived professional experience" },
    { value: "3", label: "passes per underlying problem" },
    { value: "90", label: "days, AI-assisted curriculum" },
    /*
     * LAST, AND IT IS THE ONLY ONE THAT IS NOT A SIZE (Ben, 2026-09-09). The
     * first three count what the curriculum contains; this one names what the
     * learner leaves with, which is the thing the other three are for. It
     * replaced "42 canonical case families" in the row and took the last
     * position rather than that one's, so the numbers still descend from the
     * corpus to the reader instead of ending on a duration.
     */
    { value: "1", label: "Judgment Playbook that's yours" }
  ],

  ladder: {
    /*
     * "Try before you commit" (Ben, 2026-09-09), replacing "Two doors". The old
     * label described the SHAPE of the section — two cards — which the reader
     * can already see. This one states the offer, and it puts the free half
     * first, which is the order the cards are in.
     */
    eyebrow: "Try before you commit",
    /*
     * SUPERSEDES THE TWO-LINE COUPLET. Ben's 2026-09-08 brief sets the section
     * heading as one sentence and shortens the second clause — "Developer Forward
     * tests whether it survives" for "helps you test whether it survives
     * another perspective, another condition, and eventually your own real
     * work". Same claim, and the shorter form is the one that can be a heading.
     */
    /*
     * REWRITTEN 2026-09-09 (Ben), superseding the couplet this section was
     * built around. The old heading balanced the two products as equals —
     * "Lite helps you hear your own signal. Developer Forward tests whether it
     * survives." This one names the paid product's outcome first and casts
     * Lite as the free sample of it, which is what the section is actually
     * arranged to argue.
     */
    heading:
      "Developer Forward helps you become the developer companies keep. Lite gives you a free sample up front."
  },

  lite: {
    name: "Developer Forward Lite",
    badge: "Deterministic",
    /*
     * "Real pre-AI judgment calls." (Ben, 2026-09-09), replacing "The
     * deterministic introduction." The old heading described the RUNTIME; the
     * badge beside it already says "Deterministic", so the heading was
     * spending the card's largest type on a word repeated six inches away.
     * This one says what is inside the cases, and it pairs with the hero line
     * about judgment built before AI.
     */
    cardHeading: "Real pre-AI judgment calls.",
    /*
     * THE CARD NOW SHOWS THE MECHANISM INSTEAD OF DESCRIBING IT (Ben,
     * 2026-09-09). It read "It gives you authored professional situations, asks
     * what you would do in Ben's shoes, and requires you to commit your
     * judgment before you see what Ben actually did." — accurate, and abstract
     * enough that a reader could not picture a single screen.
     *
     * `prompt` is the checkpoint's real question, quoted, and `body` walks the
     * loop that follows it — in Ben's first person, as of 2026-09-09, matching
     * the coupon block below rather than the third-person register the rest of
     * the card uses.
     *
     * IT NAMES FOUR OF THE FIVE STEPS AND SKIPS ONE. `ChoiceList` renders four
     * options ("four possibilities"), the reveal shows Ben THEN and Ben NOW
     * ("what I did then, what I would do now"), and `ReflectBox` closes it
     * ("decide what to take forward"). What is not mentioned is `WhyNotStep`,
     * which REQUIRES a closest alternative before `CommitBar` will enable — so
     * a learner meets a mandatory step this card did not advertise. That is a
     * deliberate compression of a card, not an error, but it is the sentence to
     * revisit if anyone reports the commit button feeling stuck.
     */
    prompt: "What would you do in my shoes?",
    body:
      "Read my case, choose your response from four possibilities. See what I did then, what I would do now, and decide what to take forward with you.",
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
    chips: ["5 real cases", "About 15–25 minutes", "Stays in your browser"],
    /*
     * NAMED, NOT PRONOUNED (Ben, 2026-09-09). "It is deliberately bounded:"
     * sits six lines below the card's last mention of the product, under a
     * heading that no longer contains the word "Lite" — so "it" had drifted
     * far enough from its antecedent that the three refusals underneath could
     * read as limits on Developer Forward itself, which is the opposite of what
     * they say.
     */
    boundedLead: "Developer Forward Lite is deliberately bounded:",
    boundedItems: [
      "No AI interprets your free text.",
      "No personality score is produced.",
      "No AI gets to decide what you believe."
    ]
  },

  full: {
    name: "Developer Forward",
    badge: "90 days",
    cardHeading: "The 90-day curriculum.",
    /*
     * "40+ real cases", not "42 canonical case families" (Ben, 2026-09-09).
     * That returns the page to layer 07's original rule — 42 is the INTERNAL
     * corpus authority and no public string says it — which Ben himself had
     * superseded on 2026-09-08 by writing the count into this sentence. It is
     * superseded back. One public number for the corpus now, the same "40+"
     * floor `FULL_OFFER.bridge` carries, so the two cannot disagree.
     */
    body:
      "The deeper 90-day AI-assisted judgment curriculum, built from 40+ real cases grounded in Ben Chan's lived professional experience. You encounter each case across multiple rounds.",
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
    /*
     * A PROVENANCE CLAIM WHERE A TOPIC HEADING WAS (Ben, 2026-09-09). It read
     * "What to trust, what to verify, what to delegate." — the three-clause
     * summary of the six questions underneath. The topic is still stated: the
     * eyebrow above it says "Developer judgment, answered", and the questions
     * are their own headings. What this line does now is answer the question a
     * reader actually has about a page of AI-judgment copy, which is who wrote
     * it.
     *
     * IT SITS BESIDE AN UNSTAMPED SITE, and the two are compatible but worth
     * reading together. `DisclosureStrip` publishes "Nothing here is published
     * as Ben's position until he stamps it" on every page, because
     * `approvalState.stamp` is null. This sentence claims editorial CONTROL —
     * AI drafts, Ben decides — not approval, so it does not trip the gate in
     * `tests/developer-forward-content.test.ts` that bans a shipped string
     * asserting Ben approved or stamped anything. If the stamp is ever set,
     * check that these two still say different things.
     */
    heading: "Written by a real developer. AI drafts, but I decide what sticks."
  },

  close: {
    heading: "Commit your judgment first.",
    body: "Five cases. About 15–25 minutes. Everything stays in your browser.",
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
   * implementation-authored in `DEVELOPER_FORWARD_IMPLEMENTATION_AUTHORED_LABELS`:
   * the intent is his, the sentences are not, and a commercial commitment is
   * not something this build should be phrasing on his behalf.
   */
  coupon: {
    badge: "Free · earn your coupon",
    lead: "Finishing Lite earns you a coupon toward Developer Forward on Studio.",
    /*
     * BEN'S VOICE, 2026-09-09, replacing this build's own sentence ("It costs
     * nothing, it stays in your browser, and it is the cheapest way to find out
     * whether the full curriculum is worth your ninety days"). Two things
     * changed beyond the words: it says "no obligation to buy" outright, which
     * the old one only implied, and it drops into FIRST PERSON — "walk in my
     * shoes" — which nothing else on this page does. That is the right voice
     * for this block: the coupon is a promise Ben keeps personally, and the
     * cases are his.
     */
    body:
      "No obligation to buy, just an opportunity to walk in my shoes for five cases and then decide if the full journey is worth it to you.",
    /*
     * REPLACED 2026-09-09 (Ben). The close used to read "Ask for your coupon"
     * over a link to `/contact`, because nothing on this site could issue one
     * and a promise a reader cannot claim is a broken promise. Ben's mechanism
     * is different and better: the coupon is a hyperlink the learner is given
     * the moment they finish.
     *
     * THAT MECHANISM DOES NOT EXIST YET, AND THIS SENTENCE NOW ASSERTS IT.
     * `EvidenceSummary` — the screen a completed run ends on — renders no
     * coupon link, and no code in `app/`, `components/` or `lib/` produces a
     * coupon URL. Until it does, this is a claim about behaviour the product
     * does not have, which is a heavier thing to publish than the "ask and I
     * will send it" it replaced. Recorded here, in
     * `DEVELOPER_FORWARD_IMPLEMENTATION_AUTHORED_LABELS`, and reported to Ben.
     */
    access: "Access your coupon immediately upon completion via hyperlink."
  },

  /** The arrow is Ben's, typed in his brief. */
  primaryCta: "Continue to Developer Forward →",
  /** The way back to the free doorway. */
  liteCta: "Start Developer Forward Lite →"
} as const;
