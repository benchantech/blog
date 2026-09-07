/**
 * Trust Forward Lite — the shared type contract (plan §6).
 *
 * Pure TypeScript. No React, no JSX, no CSS import, no component import. That
 * is a hard requirement, not a style preference: `package.json` runs the suite
 * as `node --import tsx --test tests/*.test.ts`, and Node cannot load a `.css`
 * specifier, so any module that reaches a stylesheet takes its whole test file
 * down with `ERR_UNKNOWN_FILE_EXTENSION`. The same discipline
 * `lib/wys/local-state.ts` and `lib/wys/telemetry.ts` already work under.
 *
 * Every identifier here is fixed by an approved ruling in the 2026-09-07
 * handoff. Where a name looks arbitrary it is not: `reliance` is Case 2's
 * approved world-state axis key (layer 07), chosen so it cannot collide with
 * the six-dimension `trust` construct that Case 4 uses as its own axis.
 */

/* -------------------------------------------------------------------------- */
/* 1. The six deterministic dimensions (ROUTING_AND_SCORING.md)               */
/* -------------------------------------------------------------------------- */

export type Dimension =
  | "ambiguity"
  | "verification"
  | "promise"
  | "risk"
  | "ownership"
  | "trust";

export const DIMENSIONS: readonly Dimension[] = [
  "ambiguity",
  "verification",
  "promise",
  "risk",
  "ownership",
  "trust"
];

/**
 * The authored posture vocabulary, three per dimension, in ascending order.
 *
 * THE ORDER IS THE VALUE MAPPING: index 0 -> 0.0, 1 -> 0.5, 2 -> 1.0. It is
 * never `A/B/C -> 0/0.5/1`. Nine of the 138 recovered signal tags are
 * non-monotonic — C2D1 is deliberately inverted on promise and trust, so
 * "Tell them now" (option A) carries `trust:stewardship` (1.0) — and a reducer
 * that read the level from the option's position would be wrong on all nine
 * without failing any obvious check.
 */
export const POSTURES = {
  ambiguity: ["act", "clarify", "investigate"],
  verification: ["trust", "sample", "prove"],
  promise: ["commit", "qualify", "renegotiate"],
  risk: ["move", "stage", "protect"],
  ownership: ["transfer", "share", "retain"],
  trust: ["task", "relationship", "stewardship"]
} as const satisfies Record<Dimension, readonly [string, string, string]>;

export type Posture<D extends Dimension = Dimension> = (typeof POSTURES)[D][number];

/** Normalised dimension state. Exactly three values; 3^6 = 729 terminal states. */
export type TernaryState = 0 | 0.5 | 1;

export const TERNARY_STATES: readonly TernaryState[] = [0, 0.5, 1];

export type DimensionState = Record<Dimension, TernaryState>;

/** Posture -> ternary value, read from the authored vocabulary order. */
export function postureValue(dimension: Dimension, posture: string): TernaryState {
  const index = (POSTURES[dimension] as readonly string[]).indexOf(posture);
  if (index === -1) {
    throw new Error(`"${posture}" is not a declared posture of "${dimension}".`);
  }
  return TERNARY_STATES[index];
}

/** Ternary value -> posture. The inverse of `postureValue`. */
export function valuePosture(dimension: Dimension, value: TernaryState): string {
  return POSTURES[dimension][TERNARY_STATES.indexOf(value)];
}

/* -------------------------------------------------------------------------- */
/* 2. SHIP                                                                    */
/* -------------------------------------------------------------------------- */

export type ShipAxis = "S" | "H" | "I" | "P";

export const SHIP_AXES: readonly ShipAxis[] = ["S", "H", "I", "P"];

export interface ShipResult {
  /** `SHIP-0111`. Never rendered as "You are SHIP-0111." */
  code: string;
  /** The raw lean per axis, 0..1. */
  leans: Record<ShipAxis, number>;
  /** Exact percentage to the nearest 0.1, for the numeric readout. */
  displayPercents: Record<ShipAxis, number>;
  /** Rounded to the nearest 10, for the two-ended bar. */
  barPercents: Record<ShipAxis, number>;
  /** The four bits, e.g. `0111`. Keys the 16 profile bodies. */
  profileKey: string;
}

/* -------------------------------------------------------------------------- */
/* 3. Cases, decisions, options                                               */
/* -------------------------------------------------------------------------- */

/** `C1D1` … `C5D3`. Eleven decisions, in experience order. */
export type DecisionId =
  | "C1D1" | "C1D2"
  | "C2D1" | "C2D2"
  | "C3D1" | "C3D2"
  | "C4D1" | "C4D2"
  | "C5D1" | "C5D2" | "C5D3";

export const DECISION_IDS: readonly DecisionId[] = [
  "C1D1", "C1D2",
  "C2D1", "C2D2",
  "C3D1", "C3D2",
  "C4D1", "C4D2",
  "C5D1", "C5D2", "C5D3"
];

export type OptionId = "A" | "B" | "C";

export const OPTION_IDS: readonly OptionId[] = ["A", "B", "C"];

export type CaseNumber = 1 | 2 | 3 | 4 | 5;

export const CASE_NUMBERS: readonly CaseNumber[] = [1, 2, 3, 4, 5];

export function caseOfDecision(decisionId: DecisionId): CaseNumber {
  return Number(decisionId[1]) as CaseNumber;
}

/** A single recovered signal tag: this option is evidence of this posture. */
export type SignalMap = Partial<Record<Dimension, string>>;

/* -------------------------------------------------------------------------- */
/* 4. World-state variants                                                    */
/* -------------------------------------------------------------------------- */

/**
 * The world-state axes. `reliance` is Case 2's approved axis key (layer 07);
 * its fragment text is the reliance ladder and its VALUE derives from the
 * `trust` dimension. It is deliberately not named `trust` so an axis key and a
 * dimension key can never be confused in a stored `variantId`.
 */
export type AxisKey =
  | "ambiguity"
  | "reliance"
  | "verification"
  | "risk"
  | "ownership"
  | "trust";

/** One resolved axis, as it appears in a variant tuple. */
export interface AxisState {
  axis: AxisKey;
  /** The authored fragment id, e.g. `AMB_BOUNDED`, `RISK_PROTECT`. */
  fragmentId: string;
}

/**
 * A variant identity.
 *
 * `id` is the stored key and pointer restoration is EXACT MATCH on it, so its
 * shape is frozen: `c<n>:<axis>=<fragmentId>|<axis>=<fragmentId>` with axes in
 * the stamp's declared order. Renaming an axis after a learner has stored a
 * variantId silently invalidates every downstream answer.
 */
export interface VariantId {
  caseNumber: CaseNumber;
  axes: readonly AxisState[];
  id: string;
}

/* -------------------------------------------------------------------------- */
/* 5. The ledger                                                              */
/* -------------------------------------------------------------------------- */

export type LedgerEventType =
  | "lite_started"
  | "case_reached"
  | "decision_selected"
  | "decision_changed"
  | "reflection_draft"
  | "reflection_committed"
  | "reflection_skipped"
  | "reflection_preference_changed"
  | "handle_set"
  | "handle_changed"
  | "handle_removed"
  | "navigated"
  | "downstream_invalidated"
  | "downstream_restored"
  | "result_viewed"
  | "result_detail_viewed"
  | "export_markdown"
  | "export_json"
  | "copy_summary"
  | "reset"
  | "newer_version_detected"
  | "version_switched";

export interface LedgerEvent {
  eventId: string;
  /** Strictly increasing across the whole dataset. Never reused. */
  sequence: number;
  type: LedgerEventType;
  /**
   * Local time with a NUMERIC UTC offset and no timezone name — a timezone
   * name is a location signal, and this value travels in the export.
   */
  localTimestamp: string;
  sessionId: string;
  caseNumber?: CaseNumber;
  decisionId?: DecisionId;
  variantId?: string;
  selectedOptionId?: OptionId;
  /** Learner-authored free text. Declared, local-only, never scored, never sent. */
  text?: string;
  value?: string | number | boolean;
  relatedEventId?: string;
  supersedesEventId?: string;
}

/** The latest answer for one exact variant+decision pair. */
export interface ExactAnswer {
  variantId: string;
  decisionId: DecisionId;
  selectedOptionId: OptionId;
  eventId: string;
  sequence: number;
}

/* -------------------------------------------------------------------------- */
/* 6. The persisted dataset                                                   */
/* -------------------------------------------------------------------------- */

export interface ReflectionDraft {
  decisionId: DecisionId;
  text: string;
}

export interface LiteDataset {
  /** Schema of the stored blob itself, not of the product. */
  schemaVersion: 1;
  /** The stamp the learner is pinned to. Never silently migrated. */
  versionManifest: Record<string, string>;
  createdAtLocal: string;
  lastActivityAtLocal: string;
  currentSessionId: string;
  /** Monotonic; the next event takes `sequence + 1`. */
  sequence: number;
  ledger: LedgerEvent[];
  /** Local-only, learner-owned, never scored, never transmitted. */
  handle: string | null;
  drafts: ReflectionDraft[];
  reflectionsSuppressed: boolean;
}

/* -------------------------------------------------------------------------- */
/* 7. Derived views                                                           */
/* -------------------------------------------------------------------------- */

/** One decision on the active path, with its resolved variant. */
export interface ActiveDecision {
  caseNumber: CaseNumber;
  decisionId: DecisionId;
  variant: VariantId;
  selectedOptionId: OptionId | null;
}

export interface ActivePath {
  decisions: readonly ActiveDecision[];
  /** Cases the learner has actually reached, in order. */
  reachedCases: readonly CaseNumber[];
  /** True only when every active decision through Case 5 is answered. */
  complete: boolean;
  /** Active decisions still unanswered. Non-empty => no result, no export. */
  unanswered: readonly DecisionId[];
}

/** A factual receipt for one active fixed answer. Situation -> action. */
export interface Receipt {
  decisionId: DecisionId;
  caseNumber: CaseNumber;
  optionId: OptionId;
  phrase: string;
  /** Absolute contribution to the public SHIP axes. Drives highlight order. */
  shipContribution: number;
}

export interface LiteResult {
  dimensionState: DimensionState;
  ship: ShipResult;
  /** The 16-profile body, keyed by the four bits. */
  profileKey: string;
  /** The recovered terminal narrative for this exact six-dimension state. */
  narrative: string;
  receipts: readonly Receipt[];
}
