/**
 * Curriculum copy that more than one surface renders, defined once
 * (plan §6.8; packet: one-definition; Standing Order 07).
 *
 * Two kinds of thing live here and they are kept apart on purpose:
 *
 *  - CANONICAL RECORDS (`wysCopyRecords`) — claims and teaching lines. Each is
 *    an `AnyCanonicalText`, so it carries status, origin and sources and is
 *    checked by all eight governance checks in `tests/canonical-text.test.ts`.
 *  - PINNED LABELS (`wysLabels`) — short UI strings that are not claims: a page
 *    title, a link label, a slot caption. They are not canonical records
 *    because a two-word label has no `full` form and no source to cite beyond
 *    the artboard it is drawn on, but they are pinned HERE rather than typed
 *    into a component so a node cannot end up with two names.
 *
 * PROVENANCE MAPPING, unchanged from `content/claims.ts`: text taken verbatim
 * from the governing spec or an approved artboard is `status: "published"`,
 * `origin: "BEN_APPROVED"` — Ben approved the artboards and wrote the spec; the
 * Captain's Stamp is a separate axis carried by `lib/approval-state.ts` and the
 * site says "Not yet stamped" from that value, not from these.
 */

import type { AnyCanonicalText } from "@/lib/canonical-text";
import { ecosystemNav, footerDoorLabel, shipNav } from "@/content/nav";
import { destinations } from "@/content/site-config";
import { countWord, stopCount, stopCountWord } from "./weeks";
import { wysBenSlotById } from "./sources";

/* -------------------------------------------------------------------------- */
/* 1. Canonical records                                                       */
/* -------------------------------------------------------------------------- */

/**
 * (WYS §25), verbatim, and the rule that travels with it.
 *
 * "A privacy course can become useless if every answer is 'remove more.'" The
 * feedback line is the same on every over-withholding scenario, which is
 * exactly why it is one record selected by `WysScenario.overWithholdingClass`
 * rather than a sentence repeated eight times.
 *
 * DO NOT SHAME THE LEARNER FOR OVER-WITHHOLDING. That is (WYS §25)'s own
 * instruction and an acceptance box in §37 — but it is an instruction to the
 * BUILD, not a sentence for the learner, so it is enforced by
 * `tests/wys-content.test.ts` ("no over-withholding scenario or judgment shames
 * the learner") and it is NOT paraphrased into a rendered variant. §25 supplies
 * exactly one feedback sentence and that sentence is the authoritative form.
 */
export const overWithholdingFeedbackText = {
  id: "over-withholding-feedback",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["wys-spec-25"],
  variantSources: {
    short: ["wys-spec-25"],
    full: ["wys-spec-25"],
    machine: ["wys-spec-25"]
  },
  variants: {
    short: "Caution is allowed. The question is whether the missing detail changes the task.",
    full: "Caution is allowed. The question is whether the missing detail changes the task.",
    machine: "over-withholding=taught; tone=no-shaming"
  }
} as const satisfies AnyCanonicalText;

/**
 * (WYS §26), verbatim. The sentence that outranks the whole exercise.
 *
 * `full` is the outranking sentence followed by §26's own list of what WYS does
 * not supersede, in §26's order. There is no `inline` variant: §26 supplies no
 * shorter wording, and `VARIANT_FALLBACKS` already resolves an inline request to
 * `short`, which is the spec sentence itself.
 */
export const externalAuthorityText = {
  id: "external-authority-outranks",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["wys-spec-26"],
  variantSources: {
    short: ["wys-spec-26"],
    full: ["wys-spec-26"],
    machine: ["wys-spec-26"]
  },
  variants: {
    short: "External authority outranks WYS's abstraction exercise.",
    full: "External authority outranks WYS's abstraction exercise. Watch Your Step does not supersede employer policy, client confidentiality, school policy, law, professional duties, platform terms, or medical, legal and financial authority.",
    machine: "supersedes=none; outranked-by=employer|client|school|law|profession|platform|clinical"
  }
} as const satisfies AnyCanonicalText;

/** (WYS §26)'s second teaching, kept as its own node because it is a separate claim. */
export const anonymizationNotALoopholeText = {
  id: "anonymization-not-a-loophole",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["wys-spec-26"],
  variantSources: {
    short: ["wys-spec-26"],
    full: ["wys-spec-26"]
  },
  variants: {
    short: "Anonymization is not a loophole.",
    full: "Anonymization is not a loophole."
  }
} as const satisfies AnyCanonicalText;

/**
 * The scaffold footnote (plan §6.8 collapse 3).
 *
 * The desktop artboard reads "Period titles…" and the phone reads "Stop
 * titles…". One node, one wording: "stop" is what the rest of the approved copy
 * uses, and "period" is residue from the spec's internal vocabulary.
 */
export const stopScaffoldFootnoteText = {
  id: "stop-scaffold-footnote",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["artboard-5b-plan", "artboard-4a-the-path", "wys-spec-11"],
  variantSources: {
    short: ["artboard-5b-plan"],
    full: ["artboard-5b-plan", "wys-spec-11"],
    machine: ["wys-spec-11"]
  },
  variants: {
    short: "Stop titles are a working scaffold; Ben is choosing the recordings.",
    full: "Stop titles are a working scaffold; Ben is choosing the recordings. They are an implementation scaffold derived from the current architecture, not Ben-authored doctrine.",
    machine: "stop-titles=scaffold; ben-selection=pending"
  }
} as const satisfies AnyCanonicalText;

/**
 * Artboard 5b Today, under the Commit pill. Final copy, and the whole of it —
 * the artboard draws two sentences and there is no longer approved form, so
 * `full` is those two sentences and nothing is added to them.
 */
export const disagreementText = {
  id: "disagreement-is-not-the-score",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["artboard-5b-today", "wys-spec-13"],
  variantSources: {
    short: ["artboard-5b-today"],
    full: ["artboard-5b-today"]
  },
  variants: {
    short: "Disagreeing with Ben is fine. Agreement isn't the score.",
    full: "Disagreeing with Ben is fine. Agreement isn't the score."
  }
} as const satisfies AnyCanonicalText;

/**
 * Artboard 5b Today, the teal CARRY card's second half.
 *
 * (WYS §10 / §13) "The product should regularly tell the learner to leave" is
 * an instruction to the build, not a sentence to render, so it governs
 * `content/watch-your-step/carries.ts` and `rituals.ts` — where the test "no
 * carry requires reporting" enforces it — rather than being paraphrased into
 * second person here.
 */
export const carryThenLeaveText = {
  id: "carry-then-leave",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["artboard-5b-today", "wys-spec-10"],
  variantSources: {
    short: ["artboard-5b-today"],
    full: ["artboard-5b-today"]
  },
  variants: {
    short: "No need to report back.",
    full: "No need to report back."
  }
} as const satisfies AnyCanonicalText;

export const wysCopyRecords: readonly AnyCanonicalText[] = [
  overWithholdingFeedbackText,
  externalAuthorityText,
  anonymizationNotALoopholeText,
  stopScaffoldFootnoteText,
  disagreementText,
  carryThenLeaveText
];

/* -------------------------------------------------------------------------- */
/* 2. Pinned labels — one node, one name                                      */
/* -------------------------------------------------------------------------- */

/**
 * Q6, ratified: keep the sitewide Data page title AND render
 * `bct_analytics_consent` in card 1 so the title is honest; pin
 * "See what this site knows about you" as the one link label everywhere.
 *
 * Collapse 5, ratified: the node is "Ship's Log" on every surface, including
 * the `4a` governance chip row, which the artboard abbreviates to "Log". That
 * chip row is Final copy, so the change is recorded as a copy amendment in
 * docs/facelift-unapproved.md.
 *
 * Collapse 6: "YY Method" names two different URLs and constraint 2 forbids
 * dropping either, so they are two nodes with two labels — the property in the
 * header, the document in the footer. Already implemented in Phase 5; pinned
 * here so the pair has one home.
 */
const doorEyebrow = (id: (typeof destinations)[number]["id"]): string => {
  const record = destinations.find((entry) => entry.id === id);
  if (!record) throw new Error(`No destination with id "${id}".`);
  return record.eyebrow;
};

const navLabel = (href: string): string => {
  const item = [...shipNav, ...ecosystemNav].find((entry) => entry.href === href);
  if (!item) throw new Error(`No navigation item for "${href}".`);
  return item.label;
};

/**
 * NOTHING HERE IS RETYPED. Corrected at the Phase 6 gate.
 *
 * The first pass restated eleven strings that other modules already define —
 * four node labels `content/nav.ts` pins and six slot strings
 * `content/watch-your-step/sources.ts` carries on the slot records themselves —
 * with a comment saying they were being given "one home". Two homes is what it
 * produced, and a second definition is exactly what Standing Order 07 and plan
 * §6.8 exist to stop: the Ship's Log could be renamed in the header and stay
 * "Ship's Log" in the course, from a different file, with every test green.
 *
 * So this object now REFERENCES. Only the strings whose single definition is
 * here are literals: the Data page pins (Q6, which has no other home) and the
 * four short course tags drawn only on the course artboards.
 */
export const wysLabels = {
  /** Q6, ratified. This pair has no other definition anywhere. */
  dataPageTitle: "What this site knows about you",
  dataPageLinkLabel: "See what this site knows about you",

  /** Node labels — defined in content/nav.ts (plan §3.3, §6.8 collapses 5 and 6). */
  shipsLogLabel: navLabel("/ships-log"),
  yyMethodPropertyLabel: navLabel("https://yymethod.com"),
  yyMethodDocumentLabel: footerDoorLabel("method", doorEyebrow("method")),

  /** Slot strings — defined on the slot records in ./sources.ts (§6.4). */
  watchSlotOverlay: wysBenSlotById("slot-today-watch-video").label,
  watchSlotMono: wysBenSlotById("slot-today-watch-video").awaitedAsset,
  hearBenLabel: wysBenSlotById("slot-hear-ben-60s").label,
  hearBenSubLabel: wysBenSlotById("slot-hear-ben-60s").awaitedAsset,
  judgmentSurfaceTitle: wysBenSlotById("slot-judgment-header").label,
  judgmentSlotState: wysBenSlotById("slot-judgment-header").awaitedAsset,

  /** Course tags drawn only on the 5b / 4a course artboards. */
  fictionalPill: "Fictional · nothing about you",
  offSiteTag: "off-site",
  terminalTag: "the end",
  carryHeading: "Carry · then leave"
} as const;

export type WysLabelKey = keyof typeof wysLabels;

/* -------------------------------------------------------------------------- */
/* 3. Count-derived prose (plan §6.9)                                         */
/* -------------------------------------------------------------------------- */

/**
 * The approved copy spells the count out in prose and uses the numeral in the
 * stat tile. Both derive from `wysWeeks.length`; neither is typed. These are
 * FUNCTIONS rather than canonical records because a canonical record stores a
 * string, and storing "Nine short stops" would be typing the count the long way
 * round — precisely what §6.9 forbids.
 *
 * If the count ever stops being nine, the prose changes WORD, not just digit,
 * and that is a Final-copy change requiring Ben (Q10).
 */
export function stopsHeadline(): string {
  return `${stopCountWord()} short stops. Then it's over.`;
}

/** Artboard 4a phone, the peek-row heading. */
export function stopsPeekHeading(): string {
  return `${stopCountWord()} short stops, then it's over`;
}

/** Artboard 5b Plan, the intro line. */
export function planIntro(): string {
  return `${stopCountWord()} stops, one Ben recording each. It ends. Missing days changes nothing.`;
}

/** Artboard 5b Progress, the stat tile denominator. Numeral, not word. */
export function stopsCompletedOf(): number {
  return stopCount();
}

/** "1 of 9" — the stat tile form. */
export function stopsCompletedLabel(completed: number): string {
  return `${completed} of ${stopCount()}`;
}

/** Exposed so a caller cannot re-implement the number-word table. */
export { countWord, stopCount, stopCountWord };

/* -------------------------------------------------------------------------- */
/* 4. The collapsed-collision register (plan §6.8)                            */
/* -------------------------------------------------------------------------- */

export interface CanonicalCollision {
  id: string;
  concept: string;
  /** What the sources disagreed about. */
  conflict: string;
  /** What ships, and where the single definition lives. */
  resolution: string;
  /** Whether Ben has to see this one. */
  escalated: boolean;
}

/**
 * The list §6.8 requires this phase to record. It is data rather than a
 * paragraph in a doc so the §38 report and the unapproved register can both
 * render the same rows from one place.
 */
export const canonicalCollisions = [
  {
    id: "collision-scenario-length",
    concept: "The client-meeting scenario and its judgment",
    conflict: "Written at two lengths across the 4a desktop and phone artboards; the phone drops a sentence.",
    resolution:
      "One scenario record with a shortForm, one judgment record with a shortCall; the breakpoint selects.",
    escalated: false
  },
  {
    id: "collision-stop-titles",
    concept: "Three stop titles",
    conflict: "4a and 5b disagree on stops B, E and G.",
    resolution: "The 5b long forms win because they match WYS §11; shortTitle carries the desktop-cell form.",
    escalated: false
  },
  {
    id: "collision-scaffold-footnote",
    concept: "The scaffold footnote",
    conflict: "\"Period titles…\" on desktop, \"Stop titles…\" on mobile.",
    resolution: "One record, the mobile wording, because the rest of the approved copy says stop.",
    escalated: true
  },
  {
    id: "collision-data-page-name",
    concept: "The Data page",
    conflict: "Named four ways across four surfaces.",
    resolution: "Q6's default: keep the sitewide title, pin one link label, render the consent key so it is honest.",
    escalated: true
  },
  {
    id: "collision-ships-log-label",
    concept: "The Ship's Log node",
    conflict: "The 4a nav says Ship's Log; the governance chip row says Log.",
    resolution: "Ship's Log everywhere; the chip row change is a copy amendment to Final copy.",
    escalated: true
  },
  {
    id: "collision-commit-label",
    concept: "The JUDGE Commit pill",
    conflict: "4a punctuates it \"Commit — then see Ben's take\"; 5b Today punctuates it \"Commit, then see Ben's take\".",
    resolution:
      "The 5b form is pinned in ./judge.ts, because a course string follows the course artboard; the 4a hero renders it, which amends Final copy.",
    escalated: true
  },
  {
    id: "collision-yy-method-node",
    concept: "YY Method",
    conflict: "One eyebrow, two different URLs — the property and the doctrine document.",
    resolution: "Two nodes, two labels. Neither href is dropped, which constraint 2 forbids.",
    escalated: true
  }
] as const satisfies readonly CanonicalCollision[];
