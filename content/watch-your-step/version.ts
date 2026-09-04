/**
 * The single content version constant (WYS §19.1B, §30; plan Phase 6).
 *
 * It travels with every aggregate distribution row so counts from two different
 * wordings of the same scenario are never mixed:
 *
 *   event_type       scenario_id  choice_key  content_version  count
 *   scenario_choice  scn_003      B           2026-09-03       114
 *
 * HAND-BUMP RULE — the whole point of the constant. Bump it when, and only
 * when, one of these changes:
 *
 *   - a scenario's rendered text (`setting`, `decisionMoment`, or either of
 *     their short forms);
 *   - a scenario's choice set: a key added, removed, reordered, or a `label` /
 *     `shortLabel` reworded;
 *   - a judgment's `call` or `shortCall`, where the reveal could change which
 *     option a learner would have picked.
 *
 * Do NOT bump for: a typo in a comment, a new principle, a new boundary, a
 * ritual or carry edit, a status/origin change, or anything that does not alter
 * what the learner reads before committing.
 *
 * DISTRIBUTIONS MUST NEVER MIX VERSIONS. A counter row is keyed by
 * (scenario_id, choice_key, content_version); bumping starts a fresh row rather
 * than polluting the old one. `lib/wys/aggregate.ts` is disabled in v0 (Q12,
 * `WYS_AGGREGATE_ENABLED === false`), so nothing is counted yet — the constant
 * exists so that when it is enabled there is exactly one place this value comes
 * from, never a hand-typed date at a call site.
 *
 * FORMAT is constrained by two validators that must both accept it:
 * `lib/wys/telemetry.ts`'s `content_version` property pattern and
 * `lib/wys/aggregate.ts`'s field token pattern. An ISO date satisfies both.
 * `tests/wys-content.test.ts` asserts that rather than trusting it.
 */
export const CONTENT_VERSION = "2026-09-03";
