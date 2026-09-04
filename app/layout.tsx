import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { ConsentBanner } from "@/components/ConsentBanner";
import { DisclosureStrip } from "@/components/DisclosureStrip";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
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

/**
 * Root chrome renders on EVERY route, course and ship pages included (§5.6).
 *
 * The phone artboards begin straight at content with no site header and no
 * footer strip, but the handoff README requires the disclosure strip on every
 * page footer and mobile visitors need site navigation somewhere. Suppressing
 * the strip on the Watch Your Step screens would break both the README
 * requirement and the site's own transparency claim, so it renders everywhere
 * and the vertical geometry of every WYS screen shifts from its artboard.
 * NEW/unapproved; see docs/facelift-unapproved.md (Q9).
 *
 * PRESERVED HERE, VERBATIM: every metadata value above, the skip link and its
 * `#main` target, `<main id="main">`, and the header's `<img aria-hidden>` +
 * adjacent-text pairing (now inside components/SiteHeader.tsx).
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={[plexSans.variable, plexMono.variable].join(" ")}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <DisclosureStrip />
        <SiteFooter />
        <GoogleAnalytics />
        <ConsentBanner />
      </body>
    </html>
  );
}
