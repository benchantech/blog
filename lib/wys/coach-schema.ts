/**
 * Future Coach — SCHEMA ONLY, DISABLED IN V0 (WYS §22; plan §6.10).
 *
 * WYS §2.2: "These future concepts may be represented in code schemas or
 * feature flags, but they must be DISABLED AND INVISIBLE in v0."
 *
 * So this file is type-only. It has:
 *   - no runtime call and no exported value,
 *   - no import from any component,
 *   - no config flag that could turn a Coach on,
 *   - nothing that puts a hint of a Coach on any screen.
 *
 * Note the contrast with Q20's two flags, which default ON to match the
 * artboards: those gate SHIPPED, APPROVED features (persisting local judgments,
 * the learner rulebook) and are visible by design. A §2.2 flag gates a FUTURE
 * feature and must be off and invisible. Two different postures — do not
 * generalise one into the other.
 *
 * Encoding the rules now is free and stops the coach architecture drifting
 * later with nothing written down. All SIXTEEN of §22's governing rules are
 * reproduced verbatim below; do not ship a subset. The six most easily dropped
 * are the data-flow constraints, which are the whole reason for writing the
 * file now.
 */

/* WYS §22 — future governing rules, verbatim, all sixteen:
 *
 * Coach is explicitly disclosed as AI
 * anything intentionally sent to Coach is sent to AI
 * no need to chat to complete WYS
 * unlock is access only
 * activation requires explicit learner choice
 * model never infers readiness
 * pressure happens only after initial commitment
 * scenario provenance and judgment provenance are separate
 * canonical Ben variant before AI generation
 * synthesis retains source basis
 * insufficient signal is valid
 * minimal live context
 * full transcript not automatically forwarded
 * no companion behavior
 * no automatic next question
 * learner correction outranks inference
 *
 * WYS §22: "Do not implement runtime calls yet."
 */

/** WYS §22 potential action enums, verbatim. */
export type WysCoachAction =
  | "EXPLAIN_CANONICAL"
  | "SYNTHESIZE_JUDGMENT"
  | "GENERATE_REPLAY_VARIANT"
  | "PUSH_BACK"
  | "ARGUE_OTHER_SIDE"
  | "CHANGE_ONE_FACT"
  | "COACH_PROVE_IT"
  | "NO_CLEAN_ANSWER";

/**
 * The shape a future request would take, recorded so "minimal live context"
 * and "full transcript not automatically forwarded" are constraints written
 * down rather than remembered. Nothing constructs one of these in v0.
 */
export interface WysCoachRequest {
  action: WysCoachAction;
  /** The scenario or principle the learner is on. Ids only — never prose. */
  contextIds: readonly string[];
  /** The learner's committed choice key. Never free text. */
  committedChoice: string | null;
  /** Explicit learner activation. There is no implicit path to true. */
  learnerActivated: true;
}

/**
 * A future response, recorded with its provenance obligations: scenario
 * provenance and judgment provenance are separate, synthesis retains source
 * basis, and insufficient signal is a valid result rather than an error.
 */
export interface WysCoachResponse {
  action: WysCoachAction;
  /** The Ben sources the synthesis rests on. Empty means insufficient signal. */
  sourceIds: readonly string[];
  insufficientSignal: boolean;
}
