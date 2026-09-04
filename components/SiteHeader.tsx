import Link from "next/link";
import { cx } from "@/components/provenance/cx";
import { ecosystemNav, lessonZeroCta, shipNav, type NavItem } from "@/content/nav";
import styles from "./SiteHeader.module.css";

/**
 * Site header (plan §3.3, Phase 5; mockup 4a, dc.html:321-325).
 *
 * BOTH nav inventories ship. The artboard draws six ship links and a teal CTA;
 * the live site carries /studio, /neon and the yymethod.com root. R7 forbids
 * replacing one with the other, and nine links plus a CTA do not fit one
 * 1280px row minus 56px gutters at 15px / gap 32 — so the header is two tiers:
 * the ship row above, the ecosystem row below, right-aligned under the brand.
 *
 * PRESERVED FROM app/layout.tsx, unchanged: the `.brand` link to `/`, the
 * `<img aria-hidden>` + adjacent-text pairing (the accessible name comes from
 * the text node, not from alt text), the wordmark "BenChanTech" (Q8 — the
 * artboard reads "Ben Chan Tech"; changing it would touch metadata and OG copy),
 * and the three-link ecosystem row EXACTLY AS IT SHIPS TODAY: the same
 * `.desktop-nav` class and the same `aria-label="Primary navigation"` on the
 * same element. Two nav landmarks in one header need two names, and the
 * additive reading (R7, R9) is that the PRESERVED landmark keeps its accessible
 * name and the NEW one gets a new name — not that the new tier takes the old
 * name over. So the ship tier is "Ship navigation".
 *
 * MOBILE (NEW/unapproved, Q9 ratified at its default): today `.desktop-nav`
 * is `display:none` below 700px with no replacement, so /studio, /neon and
 * yymethod.com are unreachable from mobile chrome at all. The compact header
 * below closes that with a `<details>` disclosure — no client JS, no hover-only
 * behaviour, no modal trap, and it still works with JS off. No artboard designs
 * a mobile header; see docs/facelift-unapproved.md.
 */

function NavLink({ item }: { item: NavItem }) {
  if (item.external) {
    return (
      <a href={item.href} rel="noreferrer">
        {item.label}
      </a>
    );
  }
  return <Link href={item.href}>{item.label}</Link>;
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <span className="brand-mark" aria-hidden="true">
          <img src="/brand-mark.png" alt="" />
        </span>
        <span>BenChanTech</span>
      </Link>

      <div className={styles.tiers}>
        <nav className={styles.shipNav} aria-label="Ship navigation">
          {shipNav.map((item) => (
            <NavLink item={item} key={item.href} />
          ))}
          <Link className={styles.cta} href={lessonZeroCta.href}>
            {lessonZeroCta.label}
          </Link>
        </nav>
        <nav className={cx("desktop-nav", styles.ecosystemNav)} aria-label="Primary navigation">
          {ecosystemNav.map((item) => (
            <NavLink item={item} key={item.href} />
          ))}
        </nav>
      </div>

      <details className={styles.menu}>
        <summary className={styles.menuButton}>
          Menu
        </summary>
        <nav className={styles.menuPanel} aria-label="Mobile navigation">
          {[...shipNav, lessonZeroCta, ...ecosystemNav].map((item) => (
            <NavLink item={item} key={item.href} />
          ))}
        </nav>
      </details>
    </header>
  );
}
