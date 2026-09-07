/**
 * Trust Forward Lite — the non-decision learner-facing surfaces: opening
 * callbacks, case closes, the four gated teaser cards, and the final reveal.
 *
 * Pure TypeScript. No React, no JSX, no CSS import, no component import — the
 * same constraint `lib/wys/local-state.ts` and `lib/wys/telemetry.ts` work
 * under, for the same reason: `package.json` runs the suite as
 * `node --import tsx --test tests/*.test.ts`, and Node cannot load a `.css`
 * specifier, so a module that reaches a stylesheet takes its whole test file
 * down with `ERR_UNKNOWN_FILE_EXTENSION`.
 *
 * ALL LEARNER-FACING PROSE LIVES HERE, NOT IN `app/` OR `components/`. Every
 * string below is recovered prior authoring from
 * `06_full-five-case-authoring-extraction-2026-09-07/FULL_FIVE_CASES_ALL_TEXT_OPTIONS_VERBATIM.md`,
 * approved by Ben on 2026-09-07 (`SC_TF1_APPROVAL_RECORD_2026-09-07.md`).
 * Nothing here was written by this implementation except where a record says so
 * in its own `provenance` field. A renderer composes these records; it does not
 * add a sentence, a heading or a connective of its own.
 *
 * WHY THE SURFACES ARE SLOTTED RATHER THAN INTERPOLATED STRINGS. Every callback
 * and every close resurfaces the learner's own earlier choice, and the governing
 * rule on all of them is "No interpretation." (Case 2 callback) — the surface
 * shows the EXACT selected option text and authored situation framing around it,
 * never a summary, never a paraphrase, never a judgement. So a resurfacing line
 * is modelled as `lead + slot + trail` (`SlotLine`), where the slot names the
 * `DecisionId` whose exact option text fills it. A template string with `${}`
 * holes would have let a caller pass anything; this shape lets the caller pass
 * only an answer that already exists on the active path, and lets a test assert
 * which decision each surface actually replays.
 *
 * WHERE A SLOT'S DECISION ID CAME FROM. The recovered source marks some slots
 * with a bracket marker (`[exact Case 1 choice]`) and others with an example
 * choice in bold (`**targeted adversarial checks**`); neither form names a
 * decision id. Each slot therefore carries `sourceMarker` — the recovered form,
 * kept verbatim so the authoring stays auditable, and NEVER rendered — plus a
 * `binding` saying how the decision id was fixed:
 *
 *   - `authored` — the source itself names the case and the decision
 *     unambiguously (Case 1's "First move" / "Commitment" replay).
 *   - `resolved_under_ben_approved_slot_table` — resolved against the Case 5
 *     callback ruling's slot table (`case5-callback-template.BEN_APPROVED.json`),
 *     which is the only approved statement of which decision carries which
 *     context: C1D1 scope/ambiguity, C2D2 communication under uncertainty,
 *     C3D2 verification, C4D2 response to delegated completion. That table is
 *     what makes "[relevant Case 2 answer]" resolve to C2D2 rather than C2D1,
 *     and it is why the resolution is a recorded ruling application rather than
 *     a guess.
 *
 * THREE SUPERSESSIONS. The verbatim source is historical provenance and is NOT
 * shipped where a later ruling contradicts it. All three overrides below come
 * from `07_transition-copy-import-telemetry-resolution-2026-09-07/` and are
 * recorded here because the difference is invisible at the call site:
 *
 *   1. **"729 possible profiles" is not shipped.** The source's closing upsell
 *      reads "Five fictional cases. A fixed decision tree. 729 possible
 *      profiles." Ruling Q-C (`public-copy-and-full-bridge.BEN_APPROVED.json`,
 *      `BEN_APPROVED_RULINGS_2026-09-07.md` — "Do not market Lite as '729
 *      possible profiles.'") replaces the whole descriptor — the count AND
 *      "tree" — with `FULL_OFFER.descriptor`. 729 is a technical count for
 *      export and engineering documentation, never a public claim, and no
 *      public string in this module carries a profile count at all.
 *   2. **"39 real, scar-bearing cases" is not shipped.** The approved Full
 *      bridge is `FULL_OFFER.bridge` — "30+ real cases…" — and it travels with
 *      `FULL_OFFER.confidentiality`, because cases may be anonymized or
 *      composited to protect clients, employers, colleagues and confidential
 *      details while preserving the underlying decision pressure. The internal
 *      Full corpus authority is 42; the learner-facing bridge deliberately says
 *      30+. No public string here says 42 or 39.
 *   3. **The Case 5 callback does not rank.** The source says "The app selects
 *      the strongest relevant earlier fixed choices" and shows paraphrased
 *      choices ("inspect first"). `case5-callback-template.BEN_APPROVED.json`
 *      supersedes both: all four slots are always shown, in the table's fixed
 *      order, carrying `exact_selected_option_text`, with ranking,
 *      strongest-selection, omission, redundancy-suppression and interpretation
 *      all named as forbidden.
 *
 * THE OVERRIDDEN STRINGS ARE NOT RE-TYPED HERE. They are `ben_canonical` layer-07
 * copy, and `content/trust-forward/copy.ts` is where `ben_canonical` copy lives
 * and is tagged (`COPY_PROVENANCE.FULL_OFFER`, `COPY_PROVENANCE.LANDING_INCOMPLETE`);
 * this module is the layer-06 `recovered_prior_authoring` side, and
 * `CURRENT_IMPLEMENTATION_STATUS_2026-09-07.md` is explicit that the two
 * provenances must not be collapsed in either direction. So the closing upsell
 * IMPORTS `FULL_OFFER` and the evidence line rather than restating them — the
 * repo's standing rule against a sentence having two homes, enforced by
 * `tests/canonical-text.test.ts`. A second copy of the approved descriptor here
 * would be a second place the superseded "729" could quietly come back.
 *
 * WHAT IS DELIBERATELY ABSENT. Case 4 has no opening callback in the recovered
 * source — see `TODO_CASE_4_OPENING_CALLBACK_UNAUTHORED`. Cases 2 and 4 have no
 * authored close HEADING; only Case 1 ("Decision preserved.") and Case 3
 * ("Three decisions, preserved") do, so the other two carry `heading: null`
 * rather than a borrowed one. Authoring directions in the source that speak
 * about the design rather than to the learner ("Do not issue judgment.", "That
 * is excellent conversion copy") are kept as comments here and are not exported
 * as copy.
 */

import { FULL_OFFER, LANDING_INCOMPLETE } from "@/content/trust-forward/copy";
import type { CaseNumber, DecisionId } from "@/lib/trust-forward/types";

/* -------------------------------------------------------------------------- */
/* 1. Provenance                                                              */
/* -------------------------------------------------------------------------- */

/**
 * The governance vocabulary every Trust Forward content module tags its groups
 * with. `recovered_prior_authoring` is the honest tag for almost everything
 * here: it is Ben's earlier writing, recovered and approved on 2026-09-07 — not
 * newly authored, and not something this implementation may edit for tone.
 */
export type SurfaceProvenance =
  | "ben_canonical"
  | "recovered_prior_authoring"
  | "implementation_authored_under_ben_approved_rule"
  | "learner_authored_verbatim"
  | "deterministic_derived";

/** Provenance per exported group. One tag per group, as governance requires. */
export const SURFACE_PROVENANCE = {
  openingCallbacks: "recovered_prior_authoring",
  caseCloses: "recovered_prior_authoring",
  gatedCards: "recovered_prior_authoring",
  finalReveal: "recovered_prior_authoring",
  deterministicSummaryFraming: "recovered_prior_authoring",
  learnerWordsBlock: "recovered_prior_authoring",
  closingUpsell: "recovered_prior_authoring"
} as const satisfies Record<string, SurfaceProvenance>;

/* -------------------------------------------------------------------------- */
/* 2. Slots — how a learner's own choice re-enters a surface                  */
/* -------------------------------------------------------------------------- */

/** How a slot's `decisionId` was fixed. See the header. */
export type SlotBinding = "authored" | "resolved_under_ben_approved_slot_table";

export interface SurfaceSlot {
  /**
   * The recovered form of this slot — a bracket marker where the source wrote
   * one (`[exact Case 1 choice]`), otherwise the source's example choice
   * (`targeted adversarial checks`). NEVER RENDERED. It exists so the recovered
   * authoring stays auditable against the extraction file.
   */
  sourceMarker: string;
  /** The decision whose EXACT selected option text fills this slot. */
  decisionId: DecisionId;
  binding: SlotBinding;
  /** The slot table's context label, where the ruling supplies one. */
  context?: string;
}

/**
 * One resurfacing line: authored framing, the learner's exact choice, authored
 * tail. `layout` preserves the recovered form — `stacked` means the source put
 * the choice on its own line under the lead, which is the emphatic form the
 * Case 2 and Case 3 openings use.
 */
export interface SlotLine {
  lead: string;
  slot: SurfaceSlot;
  trail: string;
  layout: "inline" | "stacked";
}

/* -------------------------------------------------------------------------- */
/* 3. Opening callbacks (Cases 2, 3, 5)                                       */
/* -------------------------------------------------------------------------- */

export interface OpeningCallback {
  caseNumber: CaseNumber;
  /** Authored lines above the resurfaced choices. */
  intro: readonly string[];
  /** The resurfaced choices, in authored order. Never reordered, never culled. */
  lines: readonly SlotLine[];
  /** Authored lines below them, turning the callback into this case's question. */
  outro: readonly string[];
  provenance: SurfaceProvenance;
}

/**
 * Cases 2, 3 and 5 only.
 *
 * Case 2's authoring rule is stated in the source as the bare line "No
 * interpretation." — it governs every record in this array. Case 5's equivalent
 * is the approved slot table's forbidden list: no ranking, no
 * strongest-selection, no omission, no redundancy suppression, no
 * interpretation. A renderer that drops a Case 5 bullet because it duplicates
 * another one has broken the ruling, not tidied the screen.
 *
 * Case 4 is absent by fact, not oversight. See
 * `TODO_CASE_4_OPENING_CALLBACK_UNAUTHORED`.
 */
export const openingCallbacks: readonly OpeningCallback[] = [
  {
    caseNumber: 2,
    intro: [],
    lines: [
      {
        lead: "Last time, when the request became less clear, you chose to:",
        slot: {
          sourceMarker: "[exact Case 1 choice]",
          decisionId: "C1D1",
          binding: "resolved_under_ben_approved_slot_table",
          context: "scope / ambiguity"
        },
        trail: "",
        layout: "stacked"
      }
    ],
    outro: ["Now you’re the one holding incomplete information."],
    provenance: "recovered_prior_authoring"
  },
  {
    caseNumber: 3,
    intro: [],
    lines: [
      {
        lead: "Earlier, when information was incomplete, you chose:",
        slot: {
          sourceMarker: "[relevant Case 2 answer]",
          decisionId: "C2D2",
          binding: "resolved_under_ben_approved_slot_table",
          context: "communication under uncertainty"
        },
        trail: "",
        layout: "stacked"
      }
    ],
    outro: [
      "This time the question isn’t what to tell someone.",
      "It’s what counts as enough evidence for you to ship."
    ],
    provenance: "recovered_prior_authoring"
  },
  {
    caseNumber: 5,
    intro: ["So far:"],
    // The four slots of `case5-callback-template.BEN_APPROVED.json`, in the
    // ruling's order. The bolded choices in the source ("inspect first",
    // "verify critical invariants") are examples of a PARAPHRASE the ruling
    // forbids; the slots carry exact selected option text.
    lines: [
      {
        lead: "when scope became ambiguous, you chose to ",
        slot: {
          sourceMarker: "inspect first",
          decisionId: "C1D1",
          binding: "resolved_under_ben_approved_slot_table",
          context: "scope / ambiguity"
        },
        trail: ";",
        layout: "inline"
      },
      {
        lead: "when delivery became uncertain, you chose to ",
        slot: {
          sourceMarker: "surface the uncertainty with evidence",
          decisionId: "C2D2",
          binding: "resolved_under_ben_approved_slot_table",
          context: "communication under uncertainty"
        },
        trail: ";",
        layout: "inline"
      },
      {
        lead: "before shipping, you chose to ",
        slot: {
          sourceMarker: "verify critical invariants",
          decisionId: "C3D2",
          binding: "resolved_under_ben_approved_slot_table",
          context: "verification"
        },
        trail: ";",
        layout: "inline"
      },
      {
        lead: "when another developer said “done,” you chose to ",
        slot: {
          sourceMarker: "review agreed evidence",
          decisionId: "C4D2",
          binding: "resolved_under_ben_approved_slot_table",
          context: "response to delegated completion"
        },
        trail: ".",
        layout: "inline"
      }
    ],
    outro: ["Now the worker reporting “done” is AI."],
    provenance: "recovered_prior_authoring"
  }
];

/**
 * NOT LEARNER-FACING COPY. The recovered source authors no opening callback for
 * Case 4: Case 4 opens on its variant selector and scenario, and its only
 * cross-case resurfacing is the exact-contrast in its CLOSE. Rather than invent
 * an opening for it, `openingCallbacks` has no Case 4 entry and a renderer must
 * show none. If Ben later authors one, delete this constant and add the record.
 */
/**
 * RULED 2026-09-07: **none by design.**
 *
 * Cases 2, 3 and 5 open by resurfacing the learner's exact prior choice; Case 4
 * does not, and that is now a decision rather than an absence. The approved
 * rule: "Case 4 opens directly on its variant/scenario. Its cross-case
 * resurfacing belongs at the Case 4 close. Do not add an opening callback for
 * symmetry."
 *
 * The last clause is the operative one. The pull to add one here is symmetry
 * with the other three cases, and symmetry is not a reason — Case 4's contrast
 * lands harder at the close, where the learner has just answered, than at the
 * open, where they have not.
 */
export const TODO_CASE_4_OPENING_CALLBACK_UNAUTHORED = null;

export function openingCallbackForCase(caseNumber: CaseNumber): OpeningCallback | null {
  return openingCallbacks.find((callback) => callback.caseNumber === caseNumber) ?? null;
}

/* -------------------------------------------------------------------------- */
/* 4. Case closes (Cases 1-4)                                                 */
/* -------------------------------------------------------------------------- */

export type GatedCardId = 1 | 2 | 3 | 4;

export interface CaseClose {
  caseNumber: CaseNumber;
  /** Only Cases 1 and 3 have an authored heading. The others are `null`. */
  heading: string | null;
  intro: readonly string[];
  /** The factual replay. Authored framing plus the learner's exact choices. */
  lines: readonly SlotLine[];
  /**
   * The boundary sentences — what Lite is NOT doing with what it just showed.
   * These are the load-bearing honesty of the whole product and are never
   * trimmed for space: they are the reason the replay is not a verdict.
   */
  boundary: readonly string[];
  /** The teaser card this close hands off to. */
  gatedCardId: GatedCardId;
  provenance: SurfaceProvenance;
}

/**
 * The shared prefix for echoing a learner's own reflection back under a close.
 * The source authors it once, in the Case 1 close ("If free text exists: You
 * wrote: '…'"). Any close that echoes a reflection uses THIS string — a second
 * spelling of the same prefix is a second place the framing can drift, and the
 * reflection itself is `learner_authored_verbatim` and is never edited, quoted
 * selectively, or interpreted.
 */
export const reflectionEchoPrefix = "You wrote:";

export const caseCloses: readonly CaseClose[] = [
  {
    /* "Do **not** issue judgment. Show only:" — the source's direction for
       this screen, and the reason no interpretation line appears here. */
    caseNumber: 1,
    heading: "Decision preserved.",
    intro: ["You made two calls before seeing where the situation goes next."],
    lines: [
      {
        lead: "First move: ",
        slot: {
          sourceMarker: "Ask one question before starting",
          decisionId: "C1D1",
          binding: "authored"
        },
        trail: "",
        layout: "inline"
      },
      {
        lead: "Commitment: ",
        slot: {
          sourceMarker: "Probably, with a boundary",
          decisionId: "C1D2",
          binding: "authored"
        },
        trail: "",
        layout: "inline"
      }
    ],
    boundary: [],
    gatedCardId: 1,
    provenance: "recovered_prior_authoring"
  },
  {
    /* "Do not say what that 'means.'" — the source's direction. The absence of
       a boundary sentence here is deliberate: this close resurfaces two choices
       side by side and stops, and the missing interpretation is the point. */
    caseNumber: 2,
    heading: null,
    intro: [],
    lines: [
      {
        lead: "In Case 1 you ",
        slot: {
          sourceMarker: "[exact commitment choice]",
          decisionId: "C1D2",
          binding: "authored"
        },
        trail: ".",
        layout: "inline"
      },
      {
        lead: "Here you chose to ",
        slot: {
          sourceMarker: "[exact communication choice]",
          decisionId: "C2D2",
          binding: "resolved_under_ben_approved_slot_table",
          context: "communication under uncertainty"
        },
        trail: ".",
        layout: "inline"
      }
    ],
    boundary: [],
    gatedCardId: 2,
    provenance: "recovered_prior_authoring"
  },
  {
    // The first cross-case pattern surface. The three leads are authored
    // SITUATION framings — they describe the case, not the option chosen — which
    // is what lets the same three lines carry any of the 27 possible answer
    // combinations without interpreting one.
    caseNumber: 3,
    heading: "Three decisions, preserved",
    intro: [],
    lines: [
      {
        lead: "When scope was unclear: ",
        slot: {
          sourceMarker: "you clarified first.",
          decisionId: "C1D1",
          binding: "resolved_under_ben_approved_slot_table",
          context: "scope / ambiguity"
        },
        trail: "",
        layout: "inline"
      },
      {
        lead: "When another person’s decision was exposed: ",
        slot: {
          sourceMarker: "you communicated with a boundary.",
          decisionId: "C2D2",
          binding: "resolved_under_ben_approved_slot_table",
          context: "communication under uncertainty"
        },
        trail: "",
        layout: "inline"
      },
      {
        lead: "When shipping became reversible: ",
        slot: {
          sourceMarker: "you staged the release.",
          decisionId: "C3D1",
          binding: "authored"
        },
        trail: "",
        layout: "inline"
      }
    ],
    boundary: [
      "Those are facts about your selections. Lite isn’t deciding whether they form a principle."
    ],
    gatedCardId: 3,
    provenance: "recovered_prior_authoring"
  },
  {
    // The exact-contrast close. Its boundary sentence is an ACTUAL limitation of
    // a deterministic system, not withheld capability, and it is the sentence
    // the whole Lite-to-Full argument rests on.
    caseNumber: 4,
    heading: null,
    intro: [],
    lines: [
      {
        lead: "Earlier, you chose ",
        slot: {
          sourceMarker: "targeted adversarial checks",
          decisionId: "C3D2",
          binding: "resolved_under_ben_approved_slot_table",
          context: "verification"
        },
        trail: " before shipping.",
        layout: "inline"
      },
      {
        lead: "Here, with another developer doing the work, you chose ",
        slot: {
          sourceMarker: "accept the completion report",
          decisionId: "C4D2",
          binding: "resolved_under_ben_approved_slot_table",
          context: "response to delegated completion"
        },
        trail: ".",
        layout: "inline"
      }
    ],
    boundary: [
      "Lite can show that difference.",
      "It cannot know whether the difference reflects trust, consequence, delegation philosophy, inconsistency, or something you haven’t written down."
    ],
    gatedCardId: 4,
    provenance: "recovered_prior_authoring"
  }
];

export function caseCloseForCase(caseNumber: CaseNumber): CaseClose | null {
  return caseCloses.find((close) => close.caseNumber === caseNumber) ?? null;
}

/* -------------------------------------------------------------------------- */
/* 5. The four gated teaser cards                                             */
/* -------------------------------------------------------------------------- */

export interface GatedCard {
  id: GatedCardId;
  /** The case close this card follows. */
  afterCase: CaseNumber;
  title: string;
  body: readonly string[];
  ctaLabel: string;
  provenance: SurfaceProvenance;
}

/**
 * Each card states one thing Lite genuinely cannot do and names the Full
 * capability that can. They escalate deliberately — synthesis, then WHY-NOT,
 * then cross-case pattern, then perspective flip — which is why they are an
 * ordered array keyed to their case, not an interchangeable set. The source's
 * direction for card 1 is "Soft, visually secondary. No lengthy AI explanation
 * yet."; the escalation is what earns the later cards their weight.
 */
export const gatedCards: readonly GatedCard[] = [
  {
    id: 1,
    afterCase: 1,
    title: "AI Coach synthesis — Full Trust Forward",
    body: [
      "Lite can remember the choices you made.",
      "Full Trust Forward can interpret the reasoning behind them and use your growing judgment history to decide which real case should challenge you next."
    ],
    ctaLabel: "See full Trust Forward →",
    provenance: "recovered_prior_authoring"
  },
  {
    id: 2,
    afterCase: 2,
    title: "A stronger WHY-NOT — Full Trust Forward",
    body: [
      "Lite can show you these two decisions side by side.",
      "The full Coach can ask why they differ, identify the strongest argument against your current reasoning, and preserve whether you change your mind."
    ],
    ctaLabel: "Pressure-test my judgment →",
    provenance: "recovered_prior_authoring"
  },
  {
    id: 3,
    afterCase: 3,
    // The source emphasises "you" in the second line ("let **you** keep, reject,
    // or rewrite them"). Emphasis is a render concern; the words are unchanged.
    title: "Cross-case pattern synthesis — Full Trust Forward",
    body: [
      "Three fixed cases already create possible patterns.",
      "Full Trust Forward can compare your reasoning across many real cases, propose candidate Playbook principles, expose contradictions, and let you keep, reject, or rewrite them."
    ],
    ctaLabel: "Build my living Playbook →",
    provenance: "recovered_prior_authoring"
  },
  {
    id: 4,
    afterCase: 4,
    title: "Mirror your judgment — Full Trust Forward",
    body: [
      "What happens if you’re the developer receiving that level of oversight?",
      "Full Trust Forward can flip stakeholder position, incentives, consequence, authority, and other conditions around your prior reasoning—then see what still survives."
    ],
    ctaLabel: "Test the other side →",
    provenance: "recovered_prior_authoring"
  }
];

export function gatedCardById(id: GatedCardId): GatedCard {
  const card = gatedCards.find((candidate) => candidate.id === id);
  if (!card) {
    throw new Error(`No gated card ${id}.`);
  }
  return card;
}

/* -------------------------------------------------------------------------- */
/* 6. The final reveal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * The deterministic/probabilistic distinction becomes explicit here, and this is
 * the one place the product makes a falsifiable claim about itself. "Nothing in
 * this profile was generated by AI." is only true because the narrative, the
 * receipts and the SHIP result are all selected from approved authoring by
 * fixed rules — the same reason `lite did not interpret them` can be said about
 * the reflections. If any part of the result ever becomes generated, this block
 * is the first thing that has to change.
 */
export const finalRevealBlock = {
  headline: "Your five cases are complete.",
  subheadline: "Nothing in this profile was generated by AI.",
  body: [
    "Trust Forward Lite followed rules written in advance.",
    "It remembered your fixed choices, carried them forward, selected from approved scenario paths, and assembled your profile deterministically.",
    "Your written reflections are included below exactly as you entered them.",
    "Lite did not interpret them.",
    "That is deliberate."
  ],
  provenance: "recovered_prior_authoring" as SurfaceProvenance
} as const;

/**
 * The sentence that sits under the terminal narrative. The source calls it the
 * "Critical final sentence" and it is: without it the narrative reads as a
 * verdict about the person rather than a description of eleven selections.
 * The narrative itself belongs to the terminal-narrative module; only this
 * framing line lives here.
 */
export const deterministicSummaryFraming = {
  closingLine:
    "This is a description of the options you selected—not a score, diagnosis, or claim about who you are.",
  provenance: "recovered_prior_authoring" as SurfaceProvenance
} as const;

/**
 * The learner's five reflections, shown back verbatim.
 *
 * The block exists to demonstrate the unused signal: five pieces of the
 * learner's own writing, reproduced exactly, with nothing done to them. The
 * reflections themselves are `learner_authored_verbatim` and never leave the
 * browser; only this framing is authored copy.
 */
export const learnerWordsBlock = {
  heading: "What you actually wrote",
  /** The source's own note on the block. Nothing is summarised or combined. */
  note: "No synthesis.",
  provenance: "recovered_prior_authoring" as SurfaceProvenance
} as const;

/**
 * `Case 1:` … `Case 5:`. Derived from the case number, not authored per case —
 * five hand-typed labels would be five chances to mislabel a learner's own
 * words. Tagged `deterministic_derived` for that reason.
 */
export function learnerWordsCaseLabel(caseNumber: CaseNumber): string {
  return `Case ${caseNumber}:`;
}

/* -------------------------------------------------------------------------- */
/* 7. The closing upsell                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The honest close: what Lite did, the eight things it could not do, and where
 * the other thing lives.
 *
 * `descriptor`, `fullBridge` and `fullBridgeConfidentiality` are the
 * `ben_canonical` supersessions, imported from `copy.ts` rather than re-typed:
 * the source's "729 possible profiles" and "39 real, scar-bearing cases" are NOT
 * shipped (see header, supersessions 1 and 2). `evidenceLine` is imported for
 * the same reason — the landing and this upsell say the doctrine boundary in one
 * sentence, and one sentence gets one definition. The eight `couldNotItems` are
 * recovered verbatim and are not a marketing list: each is a real capability
 * boundary, which is what makes the evidence line survivable as a claim.
 */
export const closingUpsell = {
  heading: "This was the deterministic version.",
  /** Supersedes the source's "…fixed decision tree. 729 possible profiles." */
  descriptor: FULL_OFFER.descriptor,
  couldLine: "It could remember what you selected.",
  couldNotHeading: "It could not:",
  couldNotItems: [
    "interpret what you wrote;",
    "notice a contradiction nobody explicitly encoded;",
    "decide which tension matters most for you next;",
    "construct the strongest WHY-NOT to your reasoning;",
    "retrieve the best real Ben case for your current pattern;",
    "change perspective around something uniquely yours;",
    "build a novel transfer test around your evolving rules;",
    "decide whether two very different answers are actually expressions of the same principle."
  ],
  fullBridgeLead: "Full Trust Forward does that around a different source:",
  /** Supersedes "39 real, scar-bearing cases from my developer, freelance, …". */
  fullBridge: FULL_OFFER.bridge,
  fullBridgeConfidentiality: FULL_OFFER.confidentiality,
  evidenceLine: LANDING_INCOMPLETE.evidenceLine,
  corePromiseHeading: "Become The Developer Clients Keep",
  corePromiseBody:
    "Build a living Developer Judgment Playbook from the decisions you actually make—and learn what still has to remain yours as AI carries more of the work.",
  ctaLabel: "Continue in full Trust Forward →",
  provenance: "recovered_prior_authoring" as SurfaceProvenance,
  /** The two fields above that are Ben-approved overrides, not recovered text. */
  provenanceOverrides: {
    descriptor: "ben_canonical",
    fullBridge: "ben_canonical",
    fullBridgeConfidentiality: "ben_canonical"
  } as Record<string, SurfaceProvenance>
} as const;
