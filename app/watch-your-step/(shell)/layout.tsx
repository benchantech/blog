import type { ReactNode } from "react";
import styles from "../wys-groups.module.css";

/**
 * The course shell (plan §5.4).
 *
 * Phase 7 mounts the BottomNav here — five tabs rendering their REAL
 * destinations in server HTML, so the hrefs are stable across hydration and
 * the site works with no JS. It is not mounted in Phase 5 because those five
 * routes do not exist yet and this phase's exit is "no dead links".
 */
export default function WatchYourStepShellLayout({ children }: { children: ReactNode }) {
  return <div className={styles.shell}>{children}</div>;
}
