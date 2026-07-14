import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "BenChanTech",
  description: "A deterministic routing foyer for the BenChanTech reasoning ecosystem.",
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
    <html lang="en">
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
            <Link href="/studio">Studio.com</Link>
            <Link href="/neon">Neon</Link>
            <a href="https://yymethod.com" rel="noreferrer">
              YY Method
            </a>
          </nav>
        </header>
        <main id="main">{children}</main>
        <footer className="site-footer">
          <span>BenChanTech LLC</span>
          <span>AI executes inside boundaries; human judgment sets them.</span>
        </footer>
      </body>
    </html>
  );
}
