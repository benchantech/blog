import { ActionPill } from "@/components/ui/ActionPill";
import { REFLECTION } from "@/content/developer-forward/copy";
import styles from "./case.module.css";

/**
 * The optional-writing surface (plan §7; layer 07
 * `reflection-placement.BEN_APPROVED.json`, which is a Ben-approved governing
 * rule dated 2026-09-07 and outranks `UX_COPY.md`'s shorter prompt).
 *
 * FIVE OF THESE EXIST IN THE WHOLE RUN, one per case, and the placement is
 * `REFLECTION.placements` rather than anything this component decides — after
 * C1D2, C2D2, C3D2, C4D2, and after C5D3 *before* the final reveal. Eleven
 * prompts is the naive reading of a reflection section sitting in a
 * decision-flow document; five is the product judgment Ben made. A component
 * that could be mounted anywhere is not the place to enforce that, and it does
 * not try to: the caller reads the placement table.
 *
 * WHAT IS WRITTEN HERE NEVER MOVES ANYTHING. The ruling's own `affects` list is
 * empty and `BEN_APPROVED_RULINGS_2026-09-07.md` spells it out — reflections
 * never affect routing, scoring, variants, receipts, SHIP, or Lite
 * interpretation. Read the imports: there is no scoring module, no aggregation
 * module, no telemetry call and no storage call in this file. The text arrives
 * as `value` and leaves through `onChange`, and the only consumers of that
 * callback are the ledger's draft event and the local dataset.
 *
 * THE DISCLOSURE IS RENDERED INLINE, NOT BEHIND AN INFO MARKER, and that is a
 * deliberate departure from `UX_COPY.md`'s `[info]` treatment of the layer-01
 * prompt. Two reasons, both load-bearing. First, layer 07 supplies a heading, a
 * prompt and a disclosure but NO short trigger label, and inventing one would
 * be this build authoring copy into a governed surface — the failure
 * `TRUST_FORWARD_PROVENANCE.md` forbids by name. Second, every clause of
 * `REFLECTION.disclosure` is a commitment the rest of the build has to keep:
 * "saved only in this browser" is why the state is local, "preserved exactly as
 * you wrote them" is why the serializer must not trim or normalise, and the
 * promise that Lite will not interpret them is why they appear in no scoring
 * path. `copy.ts` makes the same argument about the result disclaimer — a
 * collapsed promise is a promise most learners never open.
 *
 * THE PROMPT LABELS THE TEXTAREA, by wrapping both in one `<label>`. Implicit
 * association needs no generated id, so this file needs no `useId`, no `"use
 * client"` directive of its own, and no id prop threaded down from the caller —
 * and there is no code path that draws an unlabelled writing box.
 * `components/wys/FromMemory.tsx` uses the same wrapping pattern.
 *
 * "ALWAYS SKIP" IS A PREFERENCE, NOT A DELETION. It suppresses the surface for
 * the rest of the run and `REFLECTION.showInput` brings it back, which is why
 * the suppressed state still renders a control instead of rendering nothing.
 * The ledger records the preference change and drafts already written survive
 * it. Suppression is passed in as `suppressed`; this component does not
 * remember it.
 *
 * ACTION WEIGHTS ARE THIS BUILD'S, AND ARE MARKED AS SUCH. `UX_COPY.md` pins
 * equal visual weight for the HANDLE pair and says nothing about these three,
 * so Continue takes the one primary ink fill (§4.7.2) as the forward action and
 * both skips are outlined. That is a layout decision, not a nudge: skipping is
 * a first-class outcome here, the disclosure says so, and neither skip is
 * hidden, greyed, or moved behind an overflow at any width.
 */
export function ReflectionBox({
  value,
  suppressed = false,
  onChange,
  onContinue,
  onSkip,
  onAlwaysSkip,
  onShowInput
}: {
  /**
   * The current draft, verbatim. `learner_authored_verbatim` content: never
   * trimmed, never normalised, never interpreted, and never sent anywhere.
   */
  value: string;
  /** True once "Always skip" was chosen. The surface collapses to one control. */
  suppressed?: boolean;
  /**
   * REQUIRED, unlike every other callback here. The textarea is controlled, so
   * a missing handler is not a no-op — it is a box the learner cannot type in,
   * and React warns about exactly that. The three action callbacks stay
   * optional because a missing one is inert rather than broken.
   */
  onChange: (text: string) => void;
  /** Commit the draft and move on. */
  onContinue?: () => void;
  /** Move on without committing. A first-class outcome. */
  onSkip?: () => void;
  /** Suppress the surface for the rest of the run. Reversible. */
  onAlwaysSkip?: () => void;
  /** Undo the suppression. Required whenever `suppressed` is true. */
  onShowInput?: () => void;
}) {
  if (suppressed) {
    return (
      <section className={styles.reflectionSuppressed}>
        <ActionPill variant="outlined" onClick={onShowInput}>
          {REFLECTION.showInput}
        </ActionPill>
      </section>
    );
  }

  return (
    <section className={styles.reflection}>
      <h2 className={styles.reflectionHeading}>{REFLECTION.heading}</h2>

      <label className={styles.reflectionField}>
        <span className={styles.reflectionPrompt}>{REFLECTION.prompt}</span>
        <textarea
          className={styles.reflectionInput}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          autoComplete="off"
          spellCheck={true}
        />
      </label>

      <p className={styles.reflectionDisclosure}>{REFLECTION.disclosure}</p>

      <div className={styles.reflectionActions}>
        <ActionPill onClick={onContinue}>{REFLECTION.actions.continue}</ActionPill>
        <ActionPill variant="outlined" onClick={onSkip}>
          {REFLECTION.actions.skip}
        </ActionPill>
        <ActionPill variant="outlined" onClick={onAlwaysSkip}>
          {REFLECTION.actions.alwaysSkip}
        </ActionPill>
      </div>
    </section>
  );
}
