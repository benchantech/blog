import { cx } from "@/components/provenance/cx";
import styles from "./wys-primitives.module.css";

/**
 * DistributionBars (plan §4.8, §6.5).
 *
 * THE NUMBERS AND THE CAPTION ARE ONE INSEPARABLE UNIT. The 18/61/21 split is
 * fabricated illustrative data on a live marketing page, and Q11 ships it only
 * with its caption. `caption` is therefore a required prop with no default: a
 * caller cannot render the bars uncaptioned, and there is no code path that
 * produces numbers without the sentence that says what they are.
 *
 * `layout="strip"` is the mobile collapse — a single 13px line, still captioned.
 */
export interface DistributionSlice {
  letter: string;
  percent: number;
}

export function DistributionBars({
  slices,
  caption,
  layout = "bars"
}: {
  slices: readonly DistributionSlice[];
  caption: string;
  layout?: "bars" | "strip";
}) {
  if (layout === "strip") {
    const top = slices.reduce((best, slice) => (slice.percent > best.percent ? slice : best), slices[0]);
    return (
      <div>
        <div className={styles.distributionStrip}>
          <span>How others answered</span>
          <span>
            {slices.map((slice, index) => (
              <span key={slice.letter}>
                {index > 0 ? " · " : ""}
                <span className={cx(slice === top && styles.distributionStripValue)}>
                  {slice.letter} {slice.percent}
                </span>
              </span>
            ))}
          </span>
        </div>
        <p className={styles.distributionCaption}>{caption}</p>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.distribution}>
        {slices.map((slice) => (
          <ClusterRow key={slice.letter} slice={slice} />
        ))}
      </div>
      <p className={styles.distributionCaption}>{caption}</p>
    </div>
  );
}

function ClusterRow({ slice }: { slice: DistributionSlice }) {
  return (
    <>
      <span className={styles.distributionLetter}>{slice.letter}</span>
      <span className={styles.distributionTrack}>
        <span className={styles.distributionFill} style={{ width: slice.percent + "%" }} />
      </span>
      <span className={styles.distributionValue}>{slice.percent}%</span>
    </>
  );
}
