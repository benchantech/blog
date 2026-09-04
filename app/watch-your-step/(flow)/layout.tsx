import type { ReactNode } from "react";
import styles from "../wys-groups.module.css";

/**
 * The Lesson Zero flow (plan §5.4): progress rail, no bottom nav, 60px bottom
 * padding. The rail lands in Phase 7 with the step content that gives it a
 * denominator.
 */
export default function WatchYourStepFlowLayout({ children }: { children: ReactNode }) {
  return <div className={styles.flow}>{children}</div>;
}
