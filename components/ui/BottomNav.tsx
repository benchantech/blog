import { cx } from "@/components/provenance/cx";
import styles from "./primitives.module.css";

/**
 * BottomNav (plan §4.8): white, a 1px top hairline, five equal items, active
 * ink/600. No icons, no badges, no indicator dot.
 *
 * This is COURSE-INTERNAL navigation only (WYS §5.2) and is never a substitute
 * for site navigation. The artboard's 30px bottom padding becomes
 * `env(safe-area-inset-bottom)` with 30px as the fallback.
 */
export function BottomNav({
  items,
  activeHref,
  label = "Course sections"
}: {
  items: readonly { href: string; label: string }[];
  activeHref?: string;
  label?: string;
}) {
  return (
    <nav className={styles.bottomNav} aria-label={label}>
      {items.map((item) => {
        const active = item.href === activeHref;
        return (
          <a
            className={cx(styles.bottomNavItem, active && styles.bottomNavActive)}
            href={item.href}
            key={item.href}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
