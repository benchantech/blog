import Link from "next/link";
import { MobileMenuShell } from "@/components/MobileMenuShell";
import { cx } from "@/components/provenance/cx";
import { ecosystemNav, publicLessonZeroCta, publicShipNav, type NavItem } from "@/content/nav";
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
 * WHAT THE CHROME RENDERS IS THE *PUBLIC* INVENTORY.
 *
 * `shipNav` and `lessonZeroCta` remain the full inventory in `content/nav.ts` —
 * the course's names, kept because a label is a name for a node and deleting it
 * loses that name. The header renders `publicShipNav` and
 * `publicLessonZeroCta`, which drop Watch Your Step while `WYS_NAV_RETIRED` is
 * true.
 *
 * Wiring these was missed when the flag was added: the constant existed, the
 * filtered exports existed, and the header went on rendering the unfiltered
 * inventory — so a retired course kept a nav entry and a CTA pointing at routes
 * that now redirect to `/`. A flag nothing reads is not a flag.
 *
 * PRESERVED FROM app/layout.tsx, unchanged: the `.brand` link to `/`, the
 * `<img aria-hidden>` + adjacent-text pairing (the accessible name comes from
 * the text node, not from alt text), the wordmark "BenChanTech" (Q8 — the
 * artboard reads "Ben Chan Tech"; changing it would touch metadata and OG copy),
 * and the ecosystem row's element EXACTLY AS IT SHIPS TODAY: the same
 * `.desktop-nav` class and the same `aria-label="Primary navigation"` on the
 * same element.
 *
 * ONE MENU, FROM 2026-09-08 (Ben): *"move Violin for Parents, Neon, and YY
 * Method up into it so there's only one menu now."* Until then the header
 * carried two tiers — a "Ship navigation" row of six and the preserved
 * three-link "Primary navigation" row — under R7's additive reading, and the
 * ship row is what `SHIP_NAV_CONSOLIDATED` has now emptied down to Trust
 * Forward. Two landmarks for four links is chrome describing itself; the tiers
 * are merged into the single preserved element.
 *
 * WHICH ELEMENT SURVIVED IS NOT ARBITRARY. The merge renders into the
 * `.desktop-nav` node carrying `aria-label="Primary navigation"` — the element
 * that shipped before any of this work — because a landmark's accessible name
 * is a shipped surface: moving the four links into the NEW node and deleting
 * the old one would read identically on screen while renaming a landmark a
 * screen-reader user navigates by. The "Ship navigation" name goes, since the
 * tier it named is gone; `styles.shipNav` stays in the stylesheet against the
 * flag being reversed.
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
    /* External nav destinations open in a new tab and say so. The arrow is
     * decorative (aria-hidden); the spoken cue is the visually-hidden span, so
     * a screen-reader user is told before activating the link rather than
     * discovering it afterwards. `noopener` is added alongside the preserved
     * `noreferrer` because the link now carries target="_blank".
     * NEW — the handoff README's glyph set is the arrow, check and play only;
     * see docs/facelift-unapproved.md. */
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer">
        {item.label}
        <span className="external-arrow" aria-hidden="true">
          ↗
        </span>
        <span className="sr-only"> (opens in a new tab)</span>
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
        <nav className={cx("desktop-nav", styles.ecosystemNav)} aria-label="Primary navigation">
          {[...publicShipNav, ...ecosystemNav].map((item) => (
            <NavLink item={item} key={item.href} />
          ))}
          {/*
            Still rendered from `publicLessonZeroCta` rather than dropped: it is
            `null` while the course is retired, so this is a no-op today and the
            teal CTA returns with the course rather than having to be rebuilt.
          */}
          {publicLessonZeroCta ? (
            <Link className={styles.cta} href={publicLessonZeroCta.href}>
              {publicLessonZeroCta.label}
            </Link>
          ) : null}
        </nav>
      </div>

      {/*
        The shell is a client component; everything inside it is still rendered
        here, on the server. See `components/MobileMenuShell.tsx` for why the
        split is that way round rather than the whole header becoming a client
        component — the short version is that this file's structure is asserted
        by name in tests/preserved-surfaces.test.ts.
      */}
      <MobileMenuShell className={styles.menu} summaryClassName={styles.menuButton} label="Menu">
        <nav className={styles.menuPanel} aria-label="Mobile navigation">
          {[...publicShipNav, ...(publicLessonZeroCta ? [publicLessonZeroCta] : []), ...ecosystemNav].map((item) => (
            <NavLink item={item} key={item.href} />
          ))}
        </nav>
      </MobileMenuShell>
    </header>
  );
}
