import { ChoiceRow, ChoiceList as ChoiceRowStack } from "@/components/ui/ChoiceRow";
import type { ChoiceLabel } from "@/lib/trust-forward/yy/types";
import styles from "./checkpoint.module.css";

/**
 * One option as this component needs it: the id it is recorded under, the
 * letter it is labelled with, and the Ben-authored text.
 *
 * A structural subset of `YYChoice`, and the two fields it deliberately does
 * NOT carry are the point. `provenance` and `evidenceTags` are the deterministic
 * derivation layer — receipts and resonance read them — and a presentational
 * component that received them could style by them. An option that looked
 * different because of the tag it carries would be a ranking with no number
 * attached, so the tags do not come in here at all.
 */
export interface YYChoiceOption {
  id: string;
  label: ChoiceLabel;
  text: string;
}

/**
 * The four A-D options of one checkpoint (governing addendum
 * `TRUST_FORWARD_LITE_YY_METHOD_ADDENDUM_2026-09-08.md` §3, WHY).
 *
 * FOUR OPTIONS, DRAWN IDENTICALLY, AND THE ORDER IS A LABEL RATHER THAN A
 * RANKING. The addendum is explicit that C or D is not "the right answer" and
 * that agreement with Ben is not success (§7) — disagreement is legitimate
 * evidence, and Ben THEN is not an answer key. So there is no visual grammar
 * of better and worse anywhere in this component or its stylesheet: no
 * emphasis on the first option, no de-emphasis of the last, no recommended
 * marker, no colour that varies by letter, no ordering by length, and no
 * re-sorting of the authored sequence. The letters identify the options so the
 * learner can refer to one on the next screen. They do not grade them.
 *
 * The corollary is that this component NEVER SORTS. Options render in the
 * order the canonical case module authored them, because that order is
 * Ben-authored content and re-ordering it — alphabetically, by length, by
 * anything — would be this build editing a governed surface.
 *
 * SELECTION STYLING IS COMPOSED, NOT REDRAWN. `app/globals.css` §1a rules that
 * selection is *a 2px INK ring on a pale-teal fill, never teal*, and
 * `components/ui/ChoiceRow` already implements it with the compensating inset
 * shadow that stops a selected option reflowing the options below it (§4.7.1,
 * Q18). Re-styling selection here would be a second definition of that ruling,
 * and the second definition is the one that drifts. The 44px target, the
 * disabled/locked state and `aria-pressed` come from the primitive too. This
 * file adds exactly one rule — `.optionText`, which is what makes a long
 * authored label wrap inside its row at 320px instead of widening it.
 *
 * IT RENDERS NO WORDS OF ITS OWN. Every string on screen is `option.text`,
 * authored by Ben and passed through verbatim, plus the caller's `groupLabel`
 * for assistive technology. Nothing is truncated, ellipsised, collapsed behind
 * a disclosure or shown on hover: several of the seventeen checkpoints author
 * options that are two clauses long, and an option reduced to its first clause
 * is a materially different option to choose between.
 *
 * NO DOMAIN LOGIC. It does not know what a run is, does not read the ledger,
 * does not decide what is selected — it is told, and it reports a click.
 */
export function ChoiceList({
  options,
  groupLabel,
  selectedId = null,
  locked = false,
  live = true,
  breakpoint = "desktop",
  onSelect
}: {
  /** The checkpoint's options, in AUTHORED order. Never re-sorted. */
  options: readonly YYChoiceOption[];
  /**
   * The accessible name of the group, from `content/`. A screen reader
   * otherwise meets four unrelated buttons with no statement of what they are
   * four answers to.
   */
  groupLabel: string;
  /** The option currently selected, by id. `null` before the learner answers. */
  selectedId?: string | null;
  /**
   * True once the checkpoint is committed. COMMIT FREEZES (§4): the options
   * stay visible and stay legible — they are now the record of what was
   * chosen — and they stop being pressable. Nothing greys out and nothing is
   * removed, so a learner can still read the four positions they weighed.
   */
  locked?: boolean;
  /** `false` renders static rows for a read-only recap of a frozen run. */
  live?: boolean;
  breakpoint?: "desktop" | "mobile";
  onSelect?: (choiceId: string) => void;
}) {
  return (
    <div role="group" aria-label={groupLabel}>
      <ChoiceRowStack>
        {options.map((option) => (
          <ChoiceRow
            key={option.id}
            letter={option.label}
            selected={option.id === selectedId}
            locked={locked}
            live={live}
            breakpoint={breakpoint}
            onSelect={onSelect ? () => onSelect(option.id) : undefined}
          >
            <span className={styles.optionText}>{option.text}</span>
          </ChoiceRow>
        ))}
      </ChoiceRowStack>
    </div>
  );
}
