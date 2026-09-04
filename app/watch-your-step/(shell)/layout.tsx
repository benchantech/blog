import type { ReactNode } from "react";
import { WysBottomNav } from "@/components/wys/BottomNav";
import styles from "../wys-groups.module.css";

/**
 * The course shell (plan §5.4).
 *
 * Phase 7 mounts the BottomNav here — five tabs rendering their REAL
 * destinations in server HTML, so the hrefs are stable across hydration and
 * the site works with no JS.
 *
 * ONE BAR FOR THE WHOLE GROUP, not one per screen: the bar is persistent
 * chrome, it must not remount between tabs, and mounting it in the layout is
 * what makes "no active item on the landing" a property of the route rather
 * than of six page files agreeing.
 *
 * The 110px bottom padding on `.shell` is the clearance for it — the bar is
 * `position: fixed` with `env(safe-area-inset-bottom)` beneath (§4.8).
 */
export default function WatchYourStepShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      {children}
      <WysBottomNav />
    </div>
  );
}
