/**
 * The JUDGE state machine (plan Phase 7; WYS §10 JUDGE; mockup 4a
 * `data-dc-script`).
 *
 * The verbatim contract, and every clause is load-bearing:
 *
 *   - single-select;
 *   - re-selectable **only while uncommitted**;
 *   - Commit is disabled until a pick exists;
 *   - on commit: lock the choices, then reveal the judgment, the distribution
 *     and the actions;
 *   - Reset clears both the pick and the commit;
 *   - **nothing is revealed before commit.**
 *
 * WHY THIS IS A PURE MODULE AND NOT `useState` INSIDE THE CARD. The last clause
 * is the whole method — "You commit before you see anything" — and it is the
 * one thing a component test cannot check in this repo, because the suite runs
 * as `node --import tsx --test tests/*.test.ts` with no DOM and no renderer
 * (Q15, ratified at manual QA). Keeping the transitions here makes the
 * invariant a unit test (`tests/wys-shell.test.ts`) instead of a review
 * promise, and `components/wys/JudgeCard.tsx` stays a thin `useState` shell
 * over these four functions, exactly as WYS §10 asks ("plain useState").
 *
 * Pure TypeScript. No React, no CSS, no component import.
 */

export interface JudgeState {
  /** The learner's current pick. Never leaves the browser (WYS §19.3). */
  selected: string | null;
  committed: boolean;
}

export const initialJudgeState: JudgeState = { selected: null, committed: false };

/**
 * Single-select, and re-selectable ONLY while uncommitted.
 *
 * `choiceKeys` is the declared vocabulary the caller renders. A key outside it
 * is ignored rather than stored: the same fail-closed rule the serializer
 * applies (plan §7.2), one layer earlier.
 */
export function selectChoice(
  state: JudgeState,
  key: string,
  choiceKeys: readonly string[]
): JudgeState {
  if (state.committed) return state;
  if (!choiceKeys.includes(key)) return state;
  return { selected: key, committed: false };
}

/** Commit is a no-op without a pick — that is the disabled Commit pill, in data. */
export function canCommit(state: JudgeState): boolean {
  return !state.committed && state.selected !== null;
}

export function commitJudge(state: JudgeState): JudgeState {
  if (!canCommit(state)) return state;
  return { selected: state.selected, committed: true };
}

/** Reset clears BOTH (WYS §10). Not "uncommit": the pick goes too. */
export function resetJudge(): JudgeState {
  return { selected: null, committed: false };
}

/**
 * What the surface may show, derived — never tracked as its own flags.
 *
 * Every field except `choicesEnabled` is `state.committed`, and that is the
 * point: there is no code path that reveals the judgment while a second boolean
 * says uncommitted, because there is no second boolean.
 */
export interface JudgeReveal {
  /** Choices stay visible and legible after commit; they stop being operable. */
  choicesEnabled: boolean;
  commitVisible: boolean;
  commitEnabled: boolean;
  judgment: boolean;
  distribution: boolean;
  actions: boolean;
}

export function judgeReveal(state: JudgeState): JudgeReveal {
  return {
    choicesEnabled: !state.committed,
    commitVisible: !state.committed,
    commitEnabled: canCommit(state),
    judgment: state.committed,
    distribution: state.committed,
    actions: state.committed
  };
}
