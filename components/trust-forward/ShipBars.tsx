import { SHIP_AXES, type ShipAxis, type ShipResult } from "@/lib/trust-forward/types";
import { SHIP_AXIS_LABELS } from "@/lib/trust-forward/exports";
import { cx } from "@/components/provenance/cx";
import styles from "./reveal.module.css";

/**
 * The four SHIP leans (INSTALLATION.md "Phase 10 — Final result";
 * ROUTING_AND_SCORING.md "## Display").
 *
 * ONE RULE MAKES THIS A SEPARATE COMPONENT. `ROUTING_AND_SCORING.md`: "Bars
 * neutral/two-ended, never visually ranked as higher=better." That is a
 * constraint on pixels, and a constraint on pixels needs an owner — a file
 * somebody has to open, with the rule written at the top, rather than four
 * `<div>`s inside a 400-line reveal where the next person adds a gradient
 * because it looked flat.
 *
 * WHY IT MATTERS HERE AND NOT ON AN ORDINARY CHART. The six authored postures
 * ascend in KIND, not in quality: `task -> relationship -> stewardship`,
 * `transfer -> share -> retain`, `act -> clarify -> investigate`. A learner at
 * 82.5% on Partnership has not scored better than one at 17.5%; they answered
 * five fictional scenarios differently. `RESULT.disclaimer` spends a whole
 * sentence saying SHIP is "not a personality type, diagnosis, validated
 * psychometric measurement, or prediction", and a bar that fills up like a
 * progress meter contradicts that sentence in a language the disclaimer cannot
 * reach.
 *
 * SO THE GEOMETRY IS A MARKER ON AN EMPTY CHANNEL, NOT A FILL. There is no
 * fill element and `reveal.module.css` has no `.barFill` rule to reach for. A
 * left-anchored fill is the thing that encodes "higher is more"; a marker
 * encodes "here, between two named ends", which is what a lean is. The
 * stylesheet's header carries the other three rules — one ink in both
 * directions, typographically identical end captions, a hairline at the 50%
 * bit threshold — and the reasons they are each refusals rather than
 * preferences.
 *
 * THE AXIS ORDER IS `SHIP_AXES`, NEVER SORTED BY VALUE. Sorting four rows by
 * magnitude publishes a ranking of the learner's own dimensions using nothing
 * but row order, which is exactly the claim the rule forbids and exactly the
 * kind of "helpful" touch that leaves no trace in the copy. S, H, I, P, always,
 * whatever the numbers are.
 *
 * TWO ROUNDINGS, NEVER ONE. `displayPercents` (nearest 0.1) is the number a
 * learner reads; `barPercents` (nearest 10) is where the marker sits.
 * `lib/trust-forward/scoring.ts` keeps them as separate fields for the reason
 * this component depends on: a bar rounded to 10 must never be the number
 * anyone quotes, and a readout at 0.1 must never imply the marker is that
 * precise. Both derive from `leans`, and so does the bit, so no rounding here
 * can move a code.
 *
 * NO PROSE IS AUTHORED IN THIS FILE. The axis names come from Ben's own config
 * via `SHIP_AXIS_LABELS`; the ends carry no captions at all, and as of layer 09
 * that is a RULING rather than a gap — see `TODO_SHIP_AXIS_END_LABELS`.
 */

/**
 * The two ends of one axis, low bit first.
 *
 * Named `low`/`high` after the BIT, not after any judgment: `high` is the end
 * `axisBit` returns `1` for, and nothing else follows from that.
 */
export interface ShipAxisEnds {
  low: string;
  high: string;
}

/**
 * NOT A GAP — A RULING. Layer 09 decided the bar ends carry NO CAPTIONS, BY
 * DESIGN (`ship-axis-end-captions.BEN_APPROVED.json`, 2026-09-07), and the
 * approved reason is the one this component was already giving:
 * `ROUTING_AND_SCORING.md` describes both ends of all four axes — Scope's
 * "Start from available scope" against "Stop / inspect / clarify before
 * committing", and the three like it — but those sentences read a thresholded
 * BIT while the bar renders a continuous lean, so captioning the ends with them
 * "would imply unsupported precision". A learner at 50.4% would be told they
 * stop and inspect before committing, which is not a claim their answers make.
 *
 * So `TODO_SHIP_AXIS_END_LABELS` stays `null` permanently rather than
 * provisionally, and it is registered on `TRUST_FORWARD_ABSENT_BY_DESIGN`
 * rather than on the unsourced list. Nothing here is waiting for copy: the next
 * person to notice that a two-ended bar has unlabelled ends should read this
 * comment and stop, not go looking for the eight sentences. The ruling's own
 * future rule is the only way in — captions become possible if Ben later
 * authors language for CONTINUOUS TENDENCIES rather than for bit meanings, and
 * `endLabels` is the slot that would then be filled from `content/`, never from
 * this file.
 */
/*
 * RE-EXPORTED FROM `content/`, NOT DECLARED HERE. The decision is about a
 * learner-facing string, so it is recorded where the content registry answers
 * "what is absent and why" — `TRUST_FORWARD_ABSENT_BY_DESIGN` — and re-exported
 * here for the component the decision is about. A `null` in a component is only
 * a component's business; this one is the registry's.
 */
export { TODO_SHIP_AXIS_END_LABELS } from "@/content/trust-forward/copy";

/**
 * The exact lean, to the nearest 0.1%.
 *
 * The same formatting `lib/trust-forward/exports.ts` applies to the identical
 * number in the Markdown document and the clipboard summary, so a learner's
 * screen and their export agree digit for digit. It is a number formatter, not
 * copy: `toFixed(1)` and a percent sign.
 */
export function formatLean(displayPercent: number): string {
  return displayPercent.toFixed(1) + "%";
}

export function ShipBars({
  ship,
  axisLabels = SHIP_AXIS_LABELS,
  endLabels
}: {
  ship: ShipResult;
  /** Defaults to the four `ship.axes[*].label` values from Ben's config. */
  axisLabels?: Readonly<Record<ShipAxis, string>>;
  /** Ruled absent by design; the slot survives for the ruling's future rule. */
  endLabels?: Readonly<Record<ShipAxis, ShipAxisEnds>>;
}) {
  return (
    <ul className={styles.bars}>
      {SHIP_AXES.map((axis) => {
        const ends = endLabels ? endLabels[axis] : null;
        return (
          <li className={styles.bar} key={axis}>
            <div className={styles.barHead}>
              <span className={styles.barAxis}>{axisLabels[axis]}</span>
              <span className={styles.barReadout}>{formatLean(ship.displayPercents[axis])}</span>
            </div>
            {/*
              Decorative by construction. The axis name and the exact lean above
              are real text, so a screen reader gets the whole reading without
              this element; an aria-label here would be a second, hand-composed
              statement of the same numbers and a place for a ranking word to
              appear where no visual review would ever catch it.
            */}
            <div className={styles.barTrack} aria-hidden="true">
              <span className={styles.barMidline} />
              <span
                className={styles.barMarker}
                style={{ left: ship.barPercents[axis] + "%" }}
              />
            </div>
            {ends ? (
              <div className={styles.barEnds}>
                <span className={styles.barEnd}>{ends.low}</span>
                <span className={cx(styles.barEnd, styles.barEndHigh)}>{ends.high}</span>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
