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
export function StruckPill({ labels, breakpoint = "desktop" }: { labels: readonly string[]; breakpoint?: "desktop" | "mobile" }) {
  const mobile = breakpoint === "mobile";
  const listClasses = cx(styles.struckList, mobile && styles.struckListMobile);
  const itemClasses = cx(styles.struck, mobile && styles.struckMobile);
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
