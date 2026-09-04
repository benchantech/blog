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

/* -------------------------------------------------------------------------- */
/* Phase 6 — the §35-class content flags and the posture vocabulary           */
/* -------------------------------------------------------------------------- */

/**
 * (WYS §35) decision 10 — "whether learner local judgments should persist".
 *
 * **Q20, ratified ON**, matching the approved `5b` Progress screen, which draws
 * "C → B · revised" and therefore requires a previous choice to still exist.
 * `lib/wys/local-state.ts` already carries the `localJudgments` field; this flag
 * decides whether anything writes to it.
 *
 * (WYS §35) also requires that changing one of its thirteen decisions be a DATA
 * OR CONFIG EDIT, never a component edit. That is why this is a constant here
 * and not a branch inside a screen.
 */
export const PERSIST_LOCAL_JUDGMENTS = true;

/**
 * (WYS §35) decision 11 — "whether the local rulebook should appear in v0".
 *
 * **Q20, ratified ON**, matching `5b` Progress ("YOUR RULEBOOK · YOURS, NOT
 * BEN'S", outlined rows plus a dashed "+ Add a rule") and the `5c` Data page.
 * (WYS §16): local only, editable, exportable as plain text or JSON, deletable,
 * never labelled Ben doctrine, never automatically sent to analytics, never
 * rewritten by AI.
 */
export const SHIP_LEARNER_RULEBOOK = true;

/**
 * (WYS §35) decision 1 — "exact admission wording". PRE-ANSWERED by artboard
 * `5a` step 2, so R1 ships it verbatim and Ben confirms rather than decides.
 *
 * (WYS §9.2) governs what onboarding may not ask: no free-text biography,
 * company, job title, family details, email, full name, exact age, reason for
 * distrust or psychological label. A four-option posture question with a
 * "no wrong answer" footnote is the whole of it.
 */
export const POSTURE_QUESTION = "Where are you with AI right now?";

export const POSTURE_QUESTION_NOTE =
  "No wrong answer, nothing to justify. It only sets the pace of your first week.";

/**
 * (WYS §35) decision 2 — "exact posture options". PRE-ANSWERED by artboard `5a`
 * step 2. Four options, verbatim, in the drawn order.
 *
 * The `id` is what `lib/wys/local-state.ts` stores and validates against; the
 * `label` is what renders. Storing an id rather than the sentence is what keeps
 * the persisted state a declared vocabulary instead of free text — the
 * serializer DROPS any value that is not one of these ids (plan §7.2).
 *
 * The superseded "I hate it" option (WYS §9.2) is not here and must not return.
 */
export interface WysPostureOption {
  id: string;
  label: string;
}

export const POSTURE_OPTIONS = [
  { id: "never-used", label: "I've never really used it" },
  { id: "tried-and-stopped", label: "I've tried it and stopped" },
  { id: "use-but-distrust", label: "I use it but I don't trust it" },
  { id: "use-a-lot", label: "I use it a lot and want better judgment" }
] as const satisfies readonly WysPostureOption[];

export const POSTURE_OPTION_IDS: readonly string[] = POSTURE_OPTIONS.map((option) => option.id);

/**
 * Dismissable notice ids — the serializer's `noticeIds` domain (plan §7.2).
 *
 * Empty is not a placeholder: no approved artboard draws a dismissable notice,
 * so nothing may write to `ui.dismissedNotices` yet and the fail-closed default
 * is the correct one. Adding a notice means adding its id here first.
 */
export const WYS_NOTICE_IDS: readonly string[] = [];
