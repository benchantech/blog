import { ChoiceRow } from "@/components/ui/ChoiceRow";
import type { OptionId } from "@/lib/trust-forward/types";
import styles from "./case.module.css";

/**
 * One A/B/C option of one decision (plan §7, `cases.ts` — "33 options + sub-
 * descriptions").
 *
 * BOTH HALVES SHIP, AND THAT IS THE WHOLE POINT OF THIS COMPONENT. The
 * extraction guide behind `content/trust-forward/cases.ts` states one CRITICAL
 * RENDER RULE: *"Do not shorten the actual scenario/options to the terse
 * paraphrases in layer-01 `CASES.md`."* So an option is the authored `label`
 * ("Ask one question before starting") STACKED WITH its authored `detail`
 * ("Ask which records they actually expect the export to contain."), and the
 * detail is never collapsed behind a disclosure, truncated with an ellipsis, or
 * shown on hover. The label alone is the paraphrase the guide forbids, and it
 * is a materially different product: the learner would be choosing between
 * three stubs instead of between three positions.
 *
 * `label` IS NULLABLE BECAUSE THE SOURCE MADE IT SO. C2D2 and C5D3 authored
 * their options as the message itself with no name above it, and
 * `CaseOption.label` is `string | null` to record that fact rather than pad it
 * with an invented heading. When it is null the detail is the option, and it is
 * rendered in the label's own weight so a nameless option does not read as a
 * subtitle waiting for a title.
 *
 * IT COMPOSES `ChoiceRow` RATHER THAN REDRAWING IT. Selection styling is a
 * ruling, not a choice: `app/globals.css` §1a says *"Selection is a 2px INK
 * ring on a pale-teal fill — never teal"*, and `ChoiceRow` already implements
 * it with the compensating inset shadow that stops a selected row reflowing
 * the rows beneath it (§4.7.1, Q18). Re-styling selection here would be a
 * second definition of that ruling and the second one is the one that drifts.
 * The letter, the 44px target, the disabled/locked state and `aria-pressed`
 * all come from the primitive too. This file adds exactly one thing: the
 * two-line stack inside the row.
 *
 * NO DOMAIN LOGIC. It does not know what a variant is, does not read the
 * ledger, does not score, and does not decide whether it is selected — it is
 * told. `selected` is derived from the active path by `lib/trust-forward/
 * pointers.ts`, which is the only place that can answer it correctly, because
 * an answer counts only when its exact variant tuple is on the active path.
 *
 * LONG LABELS WRAP. `.option` sets `min-width: 0` and `overflow-wrap: anywhere`
 * so a long authored label wraps inside the row at 320px instead of widening
 * it; several of the 33 options run past forty characters.
 */
export function DecisionRow({
  optionId,
  label,
  detail,
  selected = false,
  locked = false,
  live = true,
  breakpoint = "desktop",
  onSelect
}: {
  /** `A`, `B` or `C`. Authored ORDER, never rank — see `cases.ts`. */
  optionId: OptionId;
  /** The authored option label, or `null` where the source authored none. */
  label: string | null;
  /** The authored sub-description. Always rendered when present. */
  detail: string | null;
  selected?: boolean;
  /** Rows stay visible and stay legible once committed; they never grey out. */
  locked?: boolean;
  /**
   * `false` renders a static row for the read-only replays — the case closes
   * and the cross-case callbacks resurface a learner's exact choice as a FACT,
   * and a fact must not be presented as something still pressable. Mirrors
   * `ChoiceRow`'s own prop rather than being inferred from the absence of
   * `onSelect`, so a locked-but-answered row keeps its `aria-pressed` state.
   */
  live?: boolean;
  breakpoint?: "desktop" | "mobile";
  onSelect?: () => void;
}) {
  /* A nameless option is not a detail with a missing title, so the one line
     the source did author takes the label's weight. */
  const heading = label ?? detail;
  const sub = label === null ? null : detail;

  return (
    <ChoiceRow
      letter={optionId}
      selected={selected}
      locked={locked}
      breakpoint={breakpoint}
      live={live}
      onSelect={onSelect}
    >
      <span className={styles.option}>
        {heading ? <span className={styles.optionLabel}>{heading}</span> : null}
        {sub ? <span className={styles.optionDetail}>{sub}</span> : null}
      </span>
    </ChoiceRow>
  );
}
