import type { ReactNode } from "react";
import { cx } from "./cx";
import styles from "./provenance.module.css";

/**
 * The only component permitted to use IBM Plex Mono (plan §4.8).
 *
 * 11px everywhere, 12px for the Bridge state block. Anything else that reaches
 * for the mono face is a bug: Mono is the site's provenance-and-state voice,
 * and using it decoratively would make a provenance line stop reading as one.
 */
export function ProvenanceMono({
  children,
  size = "11",
  tone = "light",
  className
}: {
  children: ReactNode;
  size?: "11" | "12";
  tone?: "light" | "dark";
  className?: string;
}) {
  // Composed before the JSX on purpose: `tests/class-contract.test.ts` mode 1
  // reads every string literal inside a `className={...}` expression as a class
  // token, so a variant comparison written inline would be reported as an
  // unresolved class name. Hoisting keeps the guard strict instead of loosening
  // it. The same shape is used in every primitive below.
  const classes = cx(
    styles.mono,
    size === "12" && styles.monoState,
    tone === "dark" && styles.monoOnDark,
    className
  );
  return <p className={classes}>{children}</p>;
}
