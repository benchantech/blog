import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import Link from "next/link";
import { ConsentBanner } from "@/components/ConsentBanner";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

/**
 * Fonts (plan §4.3).
 *
 * These replace the render-blocking Google Fonts `@import` that used to be
 * `app/globals.css:1` — the single intentional line-level removal in the whole
 * build (§3.0). A CSS `@import` serialises a second round trip before first
 * paint, and it has to be the first at-rule in a sheet, so it had to go before
 * any new at-rule could be added.
 *
 * THE WEIGHT SET IS DECIDED BY THE PRESERVED STYLESHEET, NOT BY THE ARTBOARDS
 * ALONE. The artboards need Sans 400/500/600 and Mono 400/500. But §4.4 aliases
 * `--serif` and `--mono` onto these same two faces, and the preserved rules
 * still declare Mono at 600 and 700 and Sans in italic. Loading fewer faces
 * produces browser-synthesised faux-bold and faux-italic on every preserved
 * page — with no compile error and no test failure. So: Sans 400/500/600 with
 * a real italic axis, Mono 400/500/600/700. Two extra mono weights are a far
 * more reversible cost than editing legacy declarations the restyle is not
 * otherwise touching. Flattening the ramp later is its own recorded sweep.
 *
 * `next/font/google` ships with Next 15 — no dependency is added.
 */
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-plex-sans"
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-plex-mono"
});

export const metadata: Metadata = {
  title: "BenChanTech",
  description:
    "Ben Chan's systems work across AI, software, violin, and human judgment, including authority-boundary design for Violin for Parents.",
  metadataBase: new URL("https://benchantech.com"),
  openGraph: {
    title: "BenChanTech",
    description:
      "AI systems, software infrastructure, violin-informed product design, and human judgment boundaries by Ben Chan.",
    url: "https://benchantech.com",
    siteName: "BenChanTech",
    type: "website"
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={[plexSans.variable, plexMono.variable].join(" ")}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <header className="site-header">
          <Link className="brand" href="/">
            <span className="brand-mark" aria-hidden="true">
              <img src="/brand-mark.png" alt="" />
            </span>
            <span>BenChanTech</span>
          </Link>
          <nav className="desktop-nav" aria-label="Primary navigation">
            <Link href="/studio">Violin for Parents</Link>
            <Link href="/neon">Neon</Link>
            <a href="https://yymethod.com" rel="noreferrer">
              YY Method™
            </a>
          </nav>
        </header>
        <main id="main">{children}</main>
        <SiteFooter />
        <GoogleAnalytics />
        <ConsentBanner />
      </body>
    </html>
  );
}
