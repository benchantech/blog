/**
 * The Bridge (mockup `5d`; packet: Bridge).
 *
 * BEN'S POSITION IS A SLOT AND STAYS ONE. The dashed teal card reads
 * "Awaiting Ben. No draft AI text is shown here, by rule." That is not a
 * placeholder waiting to be filled by this build: `components/provenance/*`
 * takes a label and an awaited-asset descriptor and declares `children`,
 * `text` and `body` as `never`, so a generated sentence cannot occupy it. The
 * slot record lives in `content/watch-your-step/sources.ts` as
 * `slot-bridge-position`; this module holds the rest of the page.
 *
 * THE INTRO'S OWN CLAIM IS MADE TRUE IN ARCHITECTURE, NOT COPY (Q25, ratified).
 * The artboard ships "Always current; every earlier state lives in the Log."
 * Nothing in a two-entry log makes that true by itself, and plan R8 forbids
 * fixing a false public claim by rewording it. So supersession is a rule of
 * this module: a replaced Bridge position becomes a `historical` object
 * carrying `supersededBy` and `canonical: false` (plan §6.2 rule 4) and is
 * rendered on the Log. `supersedePosition()` below is the only sanctioned way
 * to replace one, and `tests/wys-content.test.ts` checks the shape it produces.
 *
 * PROVENANCE. The `5d` artboard is approved, so the page's own strings are
 * `status: "published"`, `origin: "BEN_APPROVED"` — the same mapping
 * `content/claims.ts` uses. The OPEN QUESTIONS rows are questions, the WORKING
 * ON rows are build state, and the EXPERIMENT card describes the experiment;
 * none of them is a position attributed to Ben, which is the whole reason the
 * position itself is a slot.
 */

import type { ContentOrigin, ContentStatus } from "@/lib/content-status";

export interface BridgeIntro {
  id: string;
  status: ContentStatus;
  origin: ContentOrigin;
  pill: string;
  title: string;
  body: string;
  sourceIds: readonly string[];
}

export const bridgeIntro = {
  id: "bridge-intro",
  status: "published",
  origin: "BEN_APPROVED",
  pill: "The Bridge · current",
  title: "What Ben thinks right now",
  body: "The page Ben reads before an interview or a recording. Always current; every earlier state lives in the Log.",
  sourceIds: ["artboard-5d-bridge", "packet-bridge"]
} as const satisfies BridgeIntro;

/* -------------------------------------------------------------------------- */
/* WORKING ON                                                                 */
/* -------------------------------------------------------------------------- */

export type BridgeWorkStatus = "building" | "in review" | "pending";

export interface BridgeWorkItem {
  id: string;
  status: ContentStatus;
  origin: ContentOrigin;
  label: string;
  workStatus: BridgeWorkStatus;
  sourceIds: readonly string[];
}

export const bridgeWorkItems = [
  {
    id: "work-wys-v0",
    status: "published",
    origin: "BEN_APPROVED",
    label: "Watch Your Step, website v0",
    workStatus: "building",
    sourceIds: ["artboard-5d-bridge"]
  },
  {
    id: "work-face-lift",
    status: "published",
    origin: "BEN_APPROVED",
    label: "This site's face lift",
    workStatus: "in review",
    sourceIds: ["artboard-5d-bridge"]
  },
  {
    id: "work-keel-hash",
    status: "published",
    origin: "BEN_APPROVED",
    label: "Freezing YY Method v2.3 + hash",
    workStatus: "pending",
    sourceIds: ["artboard-5d-bridge", "packet-hashing"]
  }
] as const satisfies readonly BridgeWorkItem[];

/* -------------------------------------------------------------------------- */
/* EXPERIMENT UNDERWAY                                                        */
/* -------------------------------------------------------------------------- */

export interface BridgeExperiment {
  id: string;
  status: ContentStatus;
  origin: ContentOrigin;
  lead: string;
  body: string;
  sourceIds: readonly string[];
}

export const bridgeExperiment = {
  id: "experiment-appetite-filter",
  status: "published",
  origin: "BEN_APPROVED",
  lead: "Appetite filter.",
  body: "Will people use a human-authored AI judgment course when they don't have to trust an AI coach to use it? The site is the experiment.",
  sourceIds: ["artboard-5d-bridge", "wys-spec-21"]
} as const satisfies BridgeExperiment;

/* -------------------------------------------------------------------------- */
/* OPEN QUESTIONS                                                             */
/* -------------------------------------------------------------------------- */

export interface BridgeOpenQuestion {
  id: string;
  status: ContentStatus;
  origin: ContentOrigin;
  question: string;
  /** Which (WYS §35) decision this row is, where it is one. */
  specDecision?: number;
  sourceIds: readonly string[];
}

/**
 * Three rows, verbatim. Each is also a live (WYS §35) decision, recorded here
 * so the page and the register cannot drift apart: 4 (which recordings),
 * 6 (which statements are canonical) and 12 (the evidence threshold).
 */
export const bridgeOpenQuestions = [
  {
    id: "open-which-recordings",
    status: "published",
    origin: "BEN_APPROVED",
    question: "Which 8–12 recordings anchor the stops?",
    specDecision: 4,
    sourceIds: ["artboard-5d-bridge", "wys-spec-35"]
  },
  {
    id: "open-which-statements-canonical",
    status: "published",
    origin: "BEN_APPROVED",
    question: "Which Ben statements are canonical at launch?",
    specDecision: 6,
    sourceIds: ["artboard-5d-bridge", "wys-spec-35"]
  },
  {
    id: "open-coach-evidence",
    status: "published",
    origin: "BEN_APPROVED",
    question: "What evidence would justify an AI coach experiment?",
    specDecision: 12,
    sourceIds: ["artboard-5d-bridge", "wys-spec-35"]
  }
] as const satisfies readonly BridgeOpenQuestion[];

/* -------------------------------------------------------------------------- */
/* Supersession (Q25) — the machinery that makes the intro's claim true       */
/* -------------------------------------------------------------------------- */

export interface BridgePosition {
  id: string;
  status: ContentStatus;
  origin: ContentOrigin;
  /** ISO 8601, when the position was taken. */
  takenAt: string;
  /** Ben's words. Only ever set by Ben. */
  statement: string;
  supersededBy?: string;
  canonical?: boolean;
  sourceIds: readonly string[];
}

/**
 * EMPTY, and that is the current true state: Ben has not written a position, so
 * the page renders the slot. When he writes one it is appended here as a
 * `published` / `BEN_AUTHORED` record.
 */
export const bridgePositions = [] as const satisfies readonly BridgePosition[];

/**
 * Replace a Bridge position without losing the old one.
 *
 * The returned pair is (the superseded old record, the new current record). The
 * old one becomes `historical` with `supersededBy` and `canonical: false`,
 * which is what `renderPolicyFor` requires before it will render anything on an
 * archive surface — so a superseded position can appear in the Log and can
 * never appear as a current one.
 *
 * This is the mechanism behind "every earlier state lives in the Log". Without
 * it the sentence would be a claim about a behaviour nothing implements.
 */
export function supersedePosition(
  current: BridgePosition,
  next: BridgePosition
): [BridgePosition, BridgePosition] {
  return [{ ...current, status: "historical", supersededBy: next.id, canonical: false }, next];
}

/** Every Bridge record carrying provenance fields, for the governance arrays. */
export const bridgeRecords = [
  bridgeIntro,
  ...bridgeWorkItems,
  bridgeExperiment,
  ...bridgeOpenQuestions,
  ...bridgePositions
];

/* -------------------------------------------------------------------------- */
/* Section eyebrows and the slot the page renders (mockup 5d)                 */
/* -------------------------------------------------------------------------- */

/**
 * The three teal eyebrows the artboard draws, pinned here rather than typed
 * into the page, so the Bridge cannot end up with two names for one section
 * (§6.8). They are surface labels, not claims, so they are not canonical
 * records — the same treatment `wysLabels` gives the course's short strings.
 *
 * (packet: Voice Constitution 3.7) rations the nautical metaphor: these are the
 * artboard's own words and the metaphor is not extended into any sub-heading or
 * button label this build adds.
 */
export const bridgeSectionLabels = {
  workingOn: "WORKING ON",
  experiment: "EXPERIMENT UNDERWAY",
  openQuestions: "OPEN QUESTIONS"
} as const;

/**
 * Ben's position is a slot record, defined once in
 * `content/watch-your-step/sources.ts` and referenced here. The label
 * ("BEN'S POSITION · SLOT") and the awaited-asset line ("Awaiting Ben. No draft
 * AI text is shown here, by rule.") live on that record; `components/provenance/*`
 * accepts no body, so nothing can fill it (§6.4, R10).
 */
export const BRIDGE_POSITION_SLOT_ID = "slot-bridge-position";

/**
 * The current position, if Ben has written one.
 *
 * `null` today, and that is why the page renders the slot. Anything superseded
 * is excluded here by construction and is picked up by
 * `supersededPositionItems()` in `./ships-log.ts` — the two halves of the Q25
 * machinery, so the same record cannot be both current and historical.
 */
export function currentBridgePosition(
  positions: readonly BridgePosition[] = bridgePositions
): BridgePosition | null {
  const current = positions.filter(
    (position) => position.status !== "historical" && position.status !== "superseded"
  );
  if (current.length > 1) {
    throw new Error(
      `The Bridge states one position at a time; found ${current.length} current records (plan §6.8, one canonical node).`
    );
  }
  return current[0] ?? null;
}
