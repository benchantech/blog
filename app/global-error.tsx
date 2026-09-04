"use client";

/**
 * Root-layout error boundary (plan Phase 5, §5.2). NEW surface.
 *
 * REQUIRED IN THIS PHASE SPECIFICALLY. Phase 5 rewrites the root layout, and
 * `app/error.tsx` does not catch a throw from the root layout itself — which is
 * exactly where the new header, the disclosure strip and `next/font` now live.
 * Without this file, a failure in any of them renders Next's unstyled default
 * in production.
 *
 * It replaces the root layout, so it must render its own `<html>` and `<body>`
 * — and it cannot rely on anything the root layout set up. That includes
 * `app/globals.css` and the `next/font` CSS variables, so every value below is
 * written out literally against a system font stack. Those literals are the
 * facelift tokens (§4.2): --white, --ink, --body, --accent. If the palette
 * changes, this file is the one place that has to be updated by hand.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#ffffff", color: "#16202b" }}>
        <main
          style={{
            fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
            maxWidth: "720px",
            margin: "0 auto",
            padding: "96px 22px 120px"
          }}
        >
          <p style={{ margin: "0 0 10px", fontSize: "15px", fontWeight: 500, color: "#1a6b7b" }}>ERROR</p>
          <h1 style={{ margin: 0, fontSize: "40px", lineHeight: 1.08, letterSpacing: "-0.025em" }}>
            The site failed to load.
          </h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", marginTop: "26px" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                font: "500 17px/1 system-ui, -apple-system, Segoe UI, sans-serif",
                padding: "17px 28px",
                border: "none",
                borderRadius: "999px",
                background: "#16202b",
                color: "#ffffff",
                cursor: "pointer"
              }}
            >
              Try again
            </button>
            <a href="/" style={{ fontSize: "17px", fontWeight: 500, color: "#1a6b7b", textDecoration: "none" }}>
              Back to the foyer →
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
