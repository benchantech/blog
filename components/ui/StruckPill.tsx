import { cx } from "@/components/provenance/cx";
import styles from "./primitives.module.css";

/**
 * The anti-feature list (plan §4.8).
 *
 * `text-decoration: line-through` is load-bearing, not decorative: "AI you can
 * trust" is on (WYS §32)'s forbidden-claims list, and a struck pill on the home
 * page is its ONE approved use. Rendering this list without the strike would
 * publish a banned claim.
 *
 * Desktop: 8 labels, centred, max-width 820. Mobile: 5 shortened labels, left
 * aligned. The caller supplies the list; the component supplies the strike.
 */
export function StruckPill({
  labels,
  breakpoint = "desktop",
  tone = "onPaper"
}: {
  labels: readonly string[];
  breakpoint?: "desktop" | "mobile";
  /**
   * The ground the pills sit on. `onInk` is not a colour preference: `--muted`
   * against `--ink` measures 3.01:1, under the 4.5:1 this site publishes for
   * text at ordinary size, and `--border-pill` is a dark rule that vanishes
   * entirely on a dark slab. A caller that puts this list on an ink block
   * without saying so ships unreadable text, so the ground is a prop rather
   * than something the component tries to guess.
   */
  tone?: "onPaper" | "onInk";
}) {
  const mobile = breakpoint === "mobile";
  const onInk = tone === "onInk";
  const listClasses = cx(styles.struckList, mobile && styles.struckListMobile);
  const itemClasses = cx(styles.struck, mobile && styles.struckMobile, onInk && styles.struckOnInk);
  return (
    <ul className={listClasses}>
      {labels.map((label) => (
        <li className={itemClasses} key={label}>
          {label}
        </li>
      ))}
    </ul>
  );
}
