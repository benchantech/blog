import { ActionPill } from "@/components/ui/ActionPill";
import { cx } from "@/components/provenance/cx";
import type { YYChoiceOption } from "./ChoiceList";
import styles from "./checkpoint.module.css";

/**
 * Every word this bar puts on screen, supplied by the caller from `content/`.
 */
export interface CommitBarCopy {
  /** Names the chosen action in the confirmation. A row label, not a verdict. */
  chosenLabel: string;
  /** Names the closest alternative in the confirmation. */
  closestLabel: string;
  /** WHAT COMMITTING DOES: it freezes this run's judgment, before any reveal. */
  freezeNote: string;
  /** `Commit decision`. */
  action: string;
  /** Why the action is unavailable — shown only while WHY-NOT is unanswered. */
  pendingNote?: string | null;
  /** What committing has done, once it has. Replaces the control. */
  committedNote?: string | null;
}

/**
 * COMMIT: the compact confirmation, and the freeze (governing addendum
 * `TRUST_FORWARD_LITE_YY_METHOD_ADDENDUM_2026-09-08.md` §3 and §4).
 *
 * §3 asks for exactly two things in the confirmation — the chosen action and
 * the closest alternative — and this component shows those two and stops. It
 * is not a summary screen: no restatement of the situation, no count of what
 * has been answered, no preview of what comes next, and above all no
 * indication of whether the choice was a good one. §7 forbids a grade, a
 * percentage, a competence judgment, a personality type and a preferred
 * convergence target, and a confirmation step is precisely where a product
 * that meant to keep that promise would break it by accident — one reassuring
 * adjective here would be a score with no number attached.
 *
 * THE FREEZE IS EXPLAINED BEFORE THE BUTTON, NOT AFTER IT. This is the reason
 * the step exists. Committing fixes this run's judgment permanently and it is
 * only after that fix that anything of mine appears — Ben THEN, Ben NOW, the
 * conditions under which the other options make sense. A learner who does not
 * know that cannot meaningfully consent to it, and a learner who finds out
 * afterwards has been handled rather than informed. So `freezeNote` renders
 * ABOVE the action, in body colour rather than as fine print, on every
 * uncommitted checkpoint. It is a term of the interaction.
 *
 * The freeze is not a punishment and the copy should not read as one: replay
 * begins a NEW run with a new `runId` and the original is never overwritten
 * (§15). What is frozen is the RECORD of what the learner believed at this
 * point, which is the only thing that makes the record worth exporting — a
 * judgment that could be edited after the reveal would be a judgment made with
 * the reveal in hand.
 *
 * WHY-NOT-BEFORE-COMMIT IS ENFORCED HERE, STRUCTURALLY. §14 makes the closest
 * alternative required, and this component cannot enable its action without
 * one: `ready` is derived from both halves being present, not passed in, so
 * there is no prop a caller can set that produces a live Commit button over an
 * incomplete record. `pendingNote` names the missing piece in a `role="status"`
 * region rather than leaving a learner to work out why a control will not
 * respond — a disabled button with no explanation reads as a broken page.
 *
 * NO BEN HERE EITHER, AND THIS IS THE LAST SURFACE BEFORE THE REVEAL. There is
 * no `benThen`, `benNow` or `conditions` prop: the two options quoted back are
 * the LEARNER'S own two answers. Nothing on this bar compares them to
 * anything, because there is nothing here to compare them to.
 *
 * NO DOMAIN LOGIC, NO STATE, NO STORAGE, NO TELEMETRY. It does not write the
 * ledger, mint a `runId` or stamp a timestamp; it reports a press, and
 * `lib/trust-forward/yy/records.ts` does all of that — where it is also
 * guarded on the write side and again on the read side.
 */
export function CommitBar({
  copy,
  chosen,
  closest,
  committed = false,
  onCommit
}: {
  copy: CommitBarCopy;
  /** The learner's chosen action. `null` until WHY is answered. */
  chosen: YYChoiceOption | null;
  /** The learner's closest alternative. `null` until WHY-NOT is answered. */
  closest: YYChoiceOption | null;
  /** True once this run's judgment is frozen. The control goes; the record stays. */
  committed?: boolean;
  onCommit?: () => void;
}) {
  /* DERIVED, NEVER PASSED IN. A `ready` prop would be a way for a caller to
     commit a checkpoint with no closest alternative, which §14 does not allow.
     Both halves present and not already frozen, and nothing else. */
  const ready = chosen !== null && closest !== null && !committed;

  return (
    <section className={cx(styles.bar, committed && styles.frozen)}>
      <div className={styles.summary}>
        {chosen ? (
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>{copy.chosenLabel}</span>
            <span className={styles.summaryValue}>
              <span className={styles.summaryLetter}>{chosen.label}</span>
              <span className={styles.summaryText}>{chosen.text}</span>
            </span>
          </div>
        ) : null}

        {closest ? (
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>{copy.closestLabel}</span>
            <span className={styles.summaryValue}>
              <span className={styles.summaryLetter}>{closest.label}</span>
              <span className={styles.summaryText}>{closest.text}</span>
            </span>
          </div>
        ) : null}
      </div>

      {committed ? (
        copy.committedNote ? (
          <p className={styles.freeze}>{copy.committedNote}</p>
        ) : null
      ) : (
        <>
          <p className={styles.freeze}>{copy.freezeNote}</p>
          <div className={styles.actions}>
            <ActionPill disabled={!ready} onClick={onCommit}>
              {copy.action}
            </ActionPill>
            {!ready && copy.pendingNote ? (
              <p className={styles.pending} role="status">
                {copy.pendingNote}
              </p>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}
