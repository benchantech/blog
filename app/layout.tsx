import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { ConsentBanner } from "@/components/ConsentBanner";
import { DisclosureStrip } from "@/components/DisclosureStrip";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

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
  title: "BenChanTech — the $20 AI-native company experiment",
  description:
    "Ben Chan Tech is a live experiment in how far one person can push AI execution while keeping human judgment, provenance, and accountability intact, using ChatGPT Plus as the only required AI operating expense.",
  metadataBase: new URL("https://benchantech.com"),
  openGraph: {
    title: "BenChanTech — the $20 AI-native company experiment",
    description:
      "A real company testing how much work AI can carry on one required $20/month AI subscription while human judgment stays authoritative.",
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
        <a className="skip-link" href="#main">Skip to content</a>
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
