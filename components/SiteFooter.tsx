import Link from "next/link";
import { stampLabel } from "@/lib/approval-state";
import { ecosystemNav, footerDoors, lessonZeroCta, shipNav, type NavItem } from "@/content/nav";

/**
 * Site footer (plan §3.3, §5.4, Phase 5; mockup 4a footer, dc.html:427-430).
 *
 * PRESERVED, unchanged: all seven legal links below, the
 * `aria-label="Legal and company information"` nav landmark, "Ben Chan Tech
 * LLC" and the tagline.
 *
 * THE FOOTER IS THE COMPLETE MOBILE PATH TO EVERY LINK, and that is a
 * requirement independent of how Q9 resolves: today `.desktop-nav` is
 * `display:none` below 700px with no replacement, so /studio, /neon and
 * yymethod.com are unreachable from mobile chrome. Even if the compact mobile
 * header is rejected, every header link is still reachable from here.
 *
 * Group 3 is §3.3's Reviewers group. It carries the two stakeholder routes AND
 * the bare https://yymethod.com root — the header's tier-2 inventory in full —
 * because that root link would otherwise have no mobile home. The four doors in
 * group 2 render from `content/site-config.ts` `destinations[]`, so those URLs
 * are preserved by construction; `footerDoorLabel` is the overlay §3.3
 * authorises, never a new field on the pinned config.
 *
 * The stamp line is `stampLabel()`. Approval state is data, never copy (§6.6):
 * nothing in this file types a governance string.
 */

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
  { href: "/accessibility", label: "Accessibility" },
  { href: "/ai-disclosure", label: "AI Disclosure" },
  { href: "/copyright", label: "Copyright" },
  { href: "/contact", label: "Contact" }
];

function FooterLink({ item }: { item: NavItem }) {
  if (item.external) {
    /* Same treatment as the header (components/SiteHeader.tsx): the four
     * property destinations leave the site, so they open in a new tab and mark
     * it. Kept identical here because yymethod.com appears in BOTH chromes and
     * one destination behaving two ways reads as a bug. */
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

function FooterGroup({
  label,
  ariaLabel,
  items
}: {
  label: string;
  ariaLabel: string;
  items: readonly NavItem[];
}) {
  return (
    <nav className="footer-group" aria-label={ariaLabel}>
      <p className="footer-group-label">{label}</p>
      {items.map((item) => (
        <FooterLink item={item} key={item.href} />
      ))}
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-identity">
        <span>Ben Chan Tech LLC</span>
        <small>AI executes inside boundaries; human judgment sets them.</small>
      </div>

      <div className="footer-groups">
        <FooterGroup
          label="THE SHIP"
          ariaLabel="Ship links"
          items={[...shipNav, lessonZeroCta]}
        />
        <FooterGroup label="DOORS" ariaLabel="The four destinations" items={footerDoors} />
        <FooterGroup label="REVIEWERS" ariaLabel="Reviewer routes" items={ecosystemNav} />
        <nav className="footer-group" aria-label="Legal and company information">
          <p className="footer-group-label">LEGAL</p>
          {legalLinks.map((link) => (
            <Link href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <p className="footer-stamp">Designed first for mobile · {stampLabel()}</p>
    </footer>
  );
}
