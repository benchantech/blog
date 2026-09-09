import type { ReactNode } from "react";
import { Pill } from "@/components/ui/Pill";
import { ProgressRail } from "@/components/ui/ProgressRail";
import styles from "./case.module.css";

/**
 * The container one Lite case is run inside (plan §6.10).
 *
 * `components/wys/CourseScreen.tsx` is the precedent and the reason this
 * exists: one shell so that the intro, the five cases and the reveal do not
 * each invent a gutter, a title size and a progress treatment. It is the Trust
 * Forward twin of that component, not a copy of it — the course screen's
 * `justify-between` header carries a right-hand meta line, and this one carries
 * a progress rail, because a fixed five-case run has a position and a course
 * screen does not.
 *
 * IT RENDERS NO WORDS OF ITS OWN. `caseLabel`, `title`, `job` and `notice` are
 * strings the caller derives from `content/developer-forward/copy.ts` and
 * `content/developer-forward/cases.ts` — `PROGRESS.caseLabel(n)` produces
 * `Case 3 of 5`, and its denominator comes from `CASE_NUMBERS.length` rather
 * than a literal 5 so the label cannot drift from the contract. Nothing in this
 * file may become a sentence: `tests/canonical-text.test.ts` fails on prose of
 * twelve words or more under `components/`.
 *
 * `title` IS NULLABLE, AND THAT IS THE SPOILER RULE, NOT DEFENSIVENESS.
 * `UX_COPY.md` "## Progress" is explicit — *"Show only reached/current titles;
 * unreached future titles remain hidden"* — and `PROGRESS.showOnlyReachedTitles`
 * pins it as data. Case 5 is TAKE THE WHEEL; a learner who reads that before
 * Case 1 answers Case 1 differently. The caller decides reachedness from the
 * active path and passes `null`; this component simply draws nothing, so there
 * is no code path in which an unreached title reaches the DOM and is merely
 * hidden with CSS.
 *
 * PROGRESS IS POSITION, NEVER SCORE. The rail reports `step of total` in a
 * fixed sequence. Nothing depends on filling it, there is no per-case time
 * estimate anywhere in the product (`README.md`'s locked UX allows exactly one
 * time statement, on the intro), and the label gives the case the learner is ON
 * rather than a count of cases completed.
 *
 * THE CHANGED-SCENARIO NOTICE IS A `role="status"` REGION, on the reasoning
 * that a scenario which re-resolved because of an upstream edit is a change a
 * learner needs to be TOLD about, not one they should have to notice. It is
 * polite, not assertive: nothing has failed, and the notice states the fact and
 * stops — it does not apologise, does not name what changed, and does not
 * invite an undo. The eight-word source sentence is deliberate and the
 * component adds nothing to it.
 *
 * NO DOMAIN LOGIC, NO STATE, NO STORAGE, NO TELEMETRY. It takes derived props
 * and lays them out. Which case is current, which titles are reachable, whether
 * a scenario changed and what the variant resolved to are all answered by
 * `lib/developer-forward/pointers.ts` against the active path, which is the only
 * place that can answer them correctly.
 */
export function CaseScreen({
  caseLabel,
  step,
  total,
  title,
  job,
  notice,
  scenario,
  children,
  footer
}: {
  /** `Case 3 of 5`, from `PROGRESS.caseLabel`. Also names the progress rail. */
  caseLabel: string;
  /** Position in the fixed sequence. Not a score, not a completion count. */
  step: number;
  total: number;
  /** The case title, or `null` while the case is unreached — the spoiler rule. */
  title: string | null;
  /** The case's one-word job — ACT, VERIFY, TAKE THE WHEEL. A job, not a virtue. */
  job?: string | null;
  /** `PROGRESS.changedScenarioNotice`, or `null` when nothing re-resolved. */
  notice?: string | null;
  /** The resolved scenario: base lines, world-state fragments, callbacks. */
  scenario?: ReactNode;
  /** The decisions, and whatever the run puts between them. */
  children: ReactNode;
  /** The case close, the teaser card, the continue control. */
  footer?: ReactNode;
}) {
  return (
    <article className={styles.screen}>
      <header className={styles.head}>
        <p className={styles.caseLabel}>{caseLabel}</p>
        <ProgressRail step={step} total={total} label={caseLabel} />
        {title ? (
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{title}</h1>
            {job ? <Pill size="sm">{job}</Pill> : null}
          </div>
        ) : null}
      </header>

      {notice ? (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      ) : null}

      {scenario ? <div className={styles.scenario}>{scenario}</div> : null}

      <div className={styles.body}>{children}</div>

      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </article>
  );
}
