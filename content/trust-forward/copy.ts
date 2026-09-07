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
 *     `public-copy-and-full-bridge.BEN_APPROVED.json` is newer and fixes the
 *     PUBLIC bridge sentence at "30+ real cases", while recording 42 as
 *     `internalCanonicalFullCorpusCount`. `FULL_OFFER.bridge` is the public
 *     sentence verbatim; 42 is not a landing-page number and does not appear
 *     anywhere in this module.
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
      "Your answers, optional writing, local handle, drafts, SHIP result, and Lite history stay in this browser's local storage. They are not sent to the server. The site may collect coarse funnel events such as whether a case was reached or an export button was clicked, but not which answers you chose or what you wrote."
  },
  /** The determinism expansion. `[info]` on the intro's no-AI line. */
  deterministic: {
    id: "deterministic",
    label: "Fixed scenarios. No AI reading your answers.",
    expansion:
      "Trust Forward Lite runs from prewritten cases, fixed transition rules, and deterministic scoring. Your optional writing is remembered locally but is not interpreted."
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
 * `bridge` says "30+ real cases", not 42: see conflict (3) in the header. It
 * also supersedes the recovered source's "39 real, scar-bearing cases…".
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
export const FULL_OFFER = {
  descriptor: "Five fictional cases. A fixed decision system. Six dimensions of judgment.",
  bridge: "30+ real cases drawn from Ben Chan’s actual professional experience.",
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
  body: "Start with five fixed developer scenarios. You make the calls. The runtime stays deterministic.",
  timeEstimate: "Expected time: about 15–30 minutes.",
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
  LANDING_COMPLETE: "ben_canonical"
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
 * `null`, not a description of itself — the same rule as the other four
 * unsourced surfaces. Resolve by authoring four end-pairs under a Ben-approved
 * rule and passing them to `ShipBars` through `endLabels`.
 */
export const TODO_SHIP_AXIS_END_LABELS = null;
