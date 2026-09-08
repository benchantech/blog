import type { ReactNode } from "react";
import { ProgressRail } from "@/components/ui/ProgressRail";
import styles from "./checkpoint.module.css";

/**
 * The container one YY checkpoint is answered inside — CAPTURE, then the fixed
 * prompt, then the options (governing addendum
 * `TRUST_FORWARD_LITE_YY_METHOD_ADDENDUM_2026-09-08.md` §3, "canonical
 * checkpoint grammar").
 *
 * BEN CANNOT REACH THE DOM THROUGH THIS COMPONENT, AND THE GUARANTEE IS THE
 * PROP LIST RATHER THAN A CONDITIONAL. Ben THEN, Ben NOW and the conditions
 * around the unchosen options are the three things §29 forbids showing before
 * COMMIT, and the reason the rule is worth this much care is that CAPTURE's
 * whole job is to hold the historical decision boundary open: a learner who
 * has read what I did is no longer exercising judgment, they are doing reading
 * comprehension, and the record the run produces is worth nothing.
 *
 * There is no `benThen`, `benNow` or `conditions` prop below. Not a gated one,
 * not an optional one, not one guarded by `isRevealUnlockedForCheckpoint` —
 * none. A gate is a runtime decision that can be got wrong; an absent prop
 * cannot be got wrong, and it cannot be got wrong by a CALLER either, which is
 * the case a gate inside this file would not have covered. The reveal is
 * `components/trust-forward/Reveal.tsx`'s job and it is mounted separately,
 * after the ledger says the checkpoint is committed.
 *
 * That also rules out the failure this build is most likely to make by
 * accident: rendering Ben and hiding him with CSS. A `hidden` element is still
 * in the served HTML, still in "view source", still read aloud by nothing
 * stopping a screen reader that ignores the rule, and still one devtools
 * keystroke from being visible. Nothing here can hide anything, because
 * nothing here HAS anything to hide.
 *
 * PROGRESS READS AS CASE AND CHECKPOINT, NEVER AS A SCORE (§7). `caseLabel`
 * and `checkpointLabel` give the position the learner is AT in a fixed
 * sequence — not a count of what they have completed, not a percentage, not
 * anything that could be filled. The rail is `role="progressbar"` because that
 * is what it is structurally, and nothing in the product depends on filling
 * it; there is no completion reward, no streak and no per-checkpoint clock.
 *
 * IT RENDERS NO WORDS OF ITS OWN. `caseLabel`, `checkpointLabel`, `title`,
 * `capture` and `prompt` are strings the caller derives from `content/`. That
 * is the same contract `components/trust-forward/CaseScreen.tsx` states and
 * `tests/canonical-text.test.ts` enforces — prose of twelve words or more
 * typed into `components/` fails the build, because the provenance spine is
 * the thing that lets a reader check that Ben wrote what the page attributes
 * to him.
 *
 * `title` IS NULLABLE, and that is the spoiler rule rather than defensiveness:
 * Case 5 is TAKE THE WHEEL, and a learner who reads that before Case 1 answers
 * Case 1 differently. The caller decides reachedness and passes `null`; this
 * component draws nothing, so there is no code path in which an unreached
 * title reaches the DOM and is merely hidden.
 *
 * NO DOMAIN LOGIC, NO STATE, NO STORAGE, NO TELEMETRY. It does not read the
 * ledger, does not know what a run is, does not decide whether the checkpoint
 * is committed and does not record anything. It takes derived props and lays
 * them out.
 */
export function CheckpointScreen({
  caseLabel,
  checkpointLabel,
  step,
  total,
  title,
  capture,
  prompt,
  children,
  footer
}: {
  /** `Case 3 of 5`. Position in a fixed sequence, from `content/`. */
  caseLabel: string;
  /**
   * `Checkpoint 2 of 4`. The second half of the position, and the reason the
   * rail's `aria-label` can name a checkpoint rather than a bare number.
   */
  checkpointLabel: string;
  /** Checkpoint position WITHIN the case. Not a score, not a completion count. */
  step: number;
  total: number;
  /** The case title, or `null` while the case is unreached — the spoiler rule. */
  title?: string | null;
  /**
   * The situation AS IT EXISTED at the decision point, verbatim from the
   * canonical case module. Blank lines separate paragraphs and this component
   * splits on them; it never trims, re-wraps or re-orders the text, because
   * the content test hashes every learner-facing string and a "tidied" one is
   * a different string.
   */
  capture: string;
  /** `What would you do in my shoes?` — fixed across all seventeen checkpoints. */
  prompt: string;
  /** The decision area: the options, the optional WHY prose, WHY-NOT, COMMIT. */
  children: ReactNode;
  /** Whatever follows the commit control on this screen. Never Ben. */
  footer?: ReactNode;
}) {
  /* Paragraphs, not one block. The canonical captures run to several hundred
     words and arrive with blank-line breaks; collapsing them into a single
     <p> would be a rendering decision that changes how much of the situation a
     learner actually reads. Empty segments are dropped so a trailing newline
     cannot emit a stray empty paragraph. */
  const paragraphs = capture.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);

  return (
    <article className={styles.screen}>
      <header className={styles.head}>
        <div className={styles.labelRow}>
          <p className={styles.caseLabel}>{caseLabel}</p>
          <p className={styles.checkpointLabel}>{checkpointLabel}</p>
        </div>
        <ProgressRail step={step} total={total} label={checkpointLabel} />
        {title ? (
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{title}</h1>
          </div>
        ) : null}
      </header>

      <div className={styles.capture}>
        {paragraphs.map((paragraph, index) => (
          <p className={styles.captureParagraph} key={index}>
            {paragraph}
          </p>
        ))}
      </div>

      <h2 className={styles.prompt}>{prompt}</h2>

      <div className={styles.body}>{children}</div>

      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </article>
  );
}
