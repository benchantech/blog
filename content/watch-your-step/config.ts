/**
 * Watch Your Step build-time configuration constants (plan §8.6, Q12, Q22).
 *
 * **Phase 3 opens this file with ONE flag.** The rest of the §35-class content
 * flags (Q20's `PERSIST_LOCAL_JUDGMENTS` and `SHIP_LEARNER_RULEBOOK`, the
 * posture options, the admission wording) land in Phase 6, which owns the WYS
 * content model. Do not pre-empt them here.
 *
 * Everything in this file is a CONSTANT, not an environment variable, and that
 * is deliberate. `lib/wys/aggregate.ts` runs in the browser, where a bare
 * `process.env.WYS_AGGREGATE_ENABLED` is `undefined` at runtime unless the name
 * carries the `NEXT_PUBLIC_` prefix — so an env-var reading would ship a stub
 * that is off *by accident*, and the "aggregate-disabled makes no network call"
 * test would pass without proving anything about the flag (plan §8.6).
 *
 * If Ben later prefers an env var it becomes `NEXT_PUBLIC_WYS_AGGREGATE_ENABLED`
 * — never the unprefixed name. `.env.example` records that.
 */

/**
 * The first-party aggregate counter (WYS §19.1B, §19.2, §30).
 *
 * **FALSE, and the endpoint is not built.** (WYS §30): "Only build if the repo
 * already has a suitable database/persistence layer." `lib/db/client.ts` is a
 * two-line stub whose only function throws and which nothing imports, and there
 * is no `pg` / `@vercel/postgres` / `@neondatabase/serverless` / `@vercel/kv`
 * in `node_modules`. The precondition is unmet, so (WYS §19.2) applies: "ship
 * with GA4/coarse engagement only and leave the aggregate adapter disabled and
 * documented."
 *
 * Consequence, stated plainly so nothing drifts: `wys_scenario_choice` and
 * `wys_scenario_skip` send **nothing at all**, and the 18/61/21 bars keep their
 * "Example numbers" caption.
 *
 * Ben question **Q12**. Flipping this to `true` is NOT sufficient on its own —
 * see `aggregateCounterSentence()` below and `lib/wys/aggregate.ts`.
 */
export const WYS_AGGREGATE_ENABLED = false;

/**
 * Artboard `5c` card 2, third sentence (dc.html:195), verbatim.
 *
 * It is a **state-bound string**: with `WYS_AGGREGATE_ENABLED` false there is
 * nothing in this build that could make it true, and (WYS §37) requires "no
 * privacy claim exceeds implemented fact" while (WYS §34) forbids solving that
 * in copy. (WYS §20) conditions the identical text on "If enabled:".
 *
 * This is stop condition **SC-12** and Ben question **Q22**.
 */
export const AGGREGATE_COUNTER_SENTENCE =
  "Some fictional exercises send only scenario ID + option to a first-party counter — stored as totals, never as your history.";

/**
 * The ONLY sanctioned way to put that sentence on a page.
 *
 * The Data page (Phase 8) renders `aggregateCounterSentence()`, never the
 * constant, so the string is absent from the DOM whenever the counter is off.
 * The string and the flag live in this one module precisely so the copy cannot
 * outrun the code — `tests/wys-telemetry.test.ts` flips the flag both ways
 * against this function.
 *
 * The `enabled` parameter exists for that test and for a future preview
 * surface. Callers in `app/` pass nothing.
 */
export function aggregateCounterSentence(enabled: boolean = WYS_AGGREGATE_ENABLED): string | null {
  return enabled ? AGGREGATE_COUNTER_SENTENCE : null;
}
