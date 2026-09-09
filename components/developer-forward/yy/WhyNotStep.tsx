import { useId } from "react";
import { ChoiceList, type YYChoiceOption } from "./ChoiceList";
import styles from "./checkpoint.module.css";

/**
 * Every word this step puts on screen, supplied by the caller from `content/`.
 */
export interface WhyNotStepCopy {
  /** `Which other option came closest?` — the fixed WHY-NOT prompt. */
  prompt: string;
  /** Why the selection is asked for before COMMIT. Stated before the control. */
  requiredNote?: string | null;
  /** The accessible name of the three-option group. */
  groupLabel: string;
  /** `What kept you from choosing it?` — the OPTIONAL prose label. */
  proseLabel: string;
  /** That the prose is optional, stays local, and is never interpreted. */
  proseHint?: string | null;
}

/**
 * WHY-NOT: the closest alternative, required before COMMIT (governing addendum
 * `TRUST_FORWARD_LITE_YY_METHOD_ADDENDUM_2026-09-08.md` §3 and §14).
 *
 * THE SELECTION IS THE EVIDENCE; THE PROSE IS NOT. §14 is the reason this step
 * exists at all: two learners can choose the same primary action for
 * materially different reasons, and the structured second choice preserves
 * that distinction deterministically, with no model reading anything. So the
 * REQUIRED half of this surface is the option, and the prose beside it is
 * optional — §13 is absolute that free text is never used for tags, receipts,
 * resonance, scoring or any inference, and never leaves the browser except
 * through an explicit export the learner asks for. It is carried verbatim as
 * learner-authored evidence and nothing else. Read the imports: there is no
 * scoring module, no telemetry call and no storage call in this file.
 *
 * THE CHOSEN OPTION IS NOT IN THE LIST, AND IT IS NOT IN THE DOM. §14 asks for
 * one UNCHOSEN option, so the chosen one is filtered out before the list is
 * built rather than rendered and disabled. Rendering it disabled would leave a
 * fourth row a learner could try to press and a screen reader would still
 * announce, and it would leave the "which other option" question standing
 * beside the option they already picked. Three rows is the honest shape of the
 * question. The filter is by id — the id is what the record stores — so it
 * cannot be defeated by two options sharing a letter or a label.
 *
 * REQUIRED IS SAID, NOT DISCOVERED. `requiredNote` sits above the options,
 * because the alternative is a learner meeting a dead Commit button and
 * inferring the rule from a control that will not respond. That reads as a
 * broken page; the same requirement stated here reads as part of the method,
 * which is what it is. The enforcement itself lives in `CommitBar`, which
 * cannot enable its action without a closest alternative.
 *
 * THE PROMPT LABELS THE TEXTAREA, by wrapping both in one `<label>`. Implicit
 * association needs no generated id for the NAME, and there is no code path
 * that draws an unlabelled writing box.
 * `components/developer-forward/ReflectionBox.tsx` uses the same pattern.
 *
 * THE HINT IS A DIFFERENT PROBLEM AND IT DOES NEED AN ID (2026-09-08). "Kept in
 * this browser, never interpreted" is the sentence that tells a learner what
 * happens to what they are about to write, and it sat as a sibling paragraph
 * with nothing tying it to the field. Read linearly that is fine; a screen
 * reader moving field to field in forms mode never reaches it, so the one
 * learner who most needs to know where their words go is the one who is not
 * told. `useId` is the cost — this component now generates one id — and the
 * earlier note claiming none was needed was true only about the label.
 *
 * NO BEN, AGAIN BY ABSENCE. This surface sits BEFORE commit, so §29's
 * commit-before-reveal rule is in force here exactly as it is on the checkpoint
 * screen: there is no `benThen`, `benNow` or `conditions` prop, nothing to gate
 * and nothing to hide with CSS. In particular the conditions Ben supplied for
 * the unchosen options — the closest thing in the content to an answer for
 * this very question — belong to the reveal and are not reachable from here.
 */
export function WhyNotStep({
  copy,
  options,
  chosenId,
  closestId = null,
  prose,
  onSelectClosest,
  onProseChange,
  locked = false,
  breakpoint = "desktop"
}: {
  copy: WhyNotStepCopy;
  /** ALL FOUR of the checkpoint's options, in authored order. Filtered here. */
  options: readonly YYChoiceOption[];
  /**
   * The option the learner selected at WHY. Required rather than nullable:
   * the grammar puts WHY before WHY-NOT, and a "which OTHER option" question
   * asked before there is a chosen one is not a question this component can
   * draw honestly.
   */
  chosenId: string;
  /** The closest alternative so far, by id. `null` until the learner picks. */
  closestId?: string | null;
  /**
   * The optional prose, verbatim. `learner_authored` content: never trimmed,
   * never normalised, never interpreted, never sent anywhere.
   */
  prose: string;
  onSelectClosest?: (choiceId: string) => void;
  /**
   * REQUIRED, unlike the selection callback. The textarea is controlled, so a
   * missing handler is not a no-op — it is a box the learner cannot type in,
   * and React warns about exactly that.
   */
  onProseChange: (text: string) => void;
  /** True once the checkpoint is committed. The answer stays; the controls stop. */
  locked?: boolean;
  breakpoint?: "desktop" | "mobile";
}) {
  /* The chosen option never reaches the DOM on this surface. Filtered, not
     disabled — see the header. */
  const alternatives = options.filter((option) => option.id !== chosenId);

  /* Stable across server and client render, and unique per instance — two
     checkpoints' WHY-NOT boxes must not describe each other. */
  const hintId = useId();

  return (
    <section className={styles.step}>
      <div className={styles.stepHead}>
        <h3 className={styles.stepPrompt}>{copy.prompt}</h3>
        {copy.requiredNote ? <p className={styles.stepNote}>{copy.requiredNote}</p> : null}
      </div>

      <ChoiceList
        options={alternatives}
        groupLabel={copy.groupLabel}
        selectedId={closestId}
        locked={locked}
        breakpoint={breakpoint}
        onSelect={onSelectClosest}
      />

      <label className={styles.field}>
        <span className={styles.fieldLabel}>{copy.proseLabel}</span>
        <textarea
          className={styles.input}
          value={prose}
          onChange={(event) => onProseChange(event.target.value)}
          rows={4}
          readOnly={locked}
          autoComplete="off"
          spellCheck={true}
          aria-describedby={copy.proseHint ? hintId : undefined}
        />
      </label>

      {copy.proseHint ? (
        <p className={styles.hint} id={hintId}>
          {copy.proseHint}
        </p>
      ) : null}
    </section>
  );
}
