import Link from "next/link";

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
  { href: "/accessibility", label: "Accessibility" },
  { href: "/ai-disclosure", label: "AI Disclosure" },
  { href: "/copyright", label: "Copyright" },
  { href: "/contact", label: "Contact" }
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <span>Ben Chan Tech LLC</span>
        <small>AI executes inside boundaries; human judgment sets them.</small>
      </div>
      <nav aria-label="Legal and company information">
        {legalLinks.map((link) => (
          <Link href={link.href} key={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
