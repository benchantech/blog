# 0012 — Permanently retired public surfaces use permanent redirects

**Status:** ACCEPTED  
**Decided:** 2026-09-29  
**Decision authority:** Captain  
**Stale when:** Ben explicitly restores one of the retired Watch Your Step or Author Ship public surfaces as a live product/presentation destination.

---

## Context

The 2026-09 consolidation retired two public surface families while preserving their source in the repository:

- Watch Your Step: `/watch-your-step` and its child routes.
- Author Ship presentation: `/bridge`, `/standing-orders`, `/ships-log`, `/crew`, `/ben`, and `/system`.

They initially used temporary redirects because the retirement decision was still reversible.

On 2026-09-29 Ben confirmed that these retired products/presentation surfaces are permanently discontinued. Keeping temporary redirects after that decision would make the HTTP signal disagree with durable product state.

## Decision

The retired Watch Your Step and Author Ship routes redirect directly to `/` with Next.js `permanent: true`. In this application that produces an HTTP 308 permanent redirect.

The historical page source remains preserved on disk for provenance and auditability. Permanent public retirement does not require source deletion.

This decision does **not** change unrelated shortcuts or compatibility routes. The following remain temporary until separately decided:

- `/lab -> /neon`
- `/about -> /`
- `/posts -> https://benchanviolin.substack.com`
- `/upwork -> https://www.upwork.com/freelancers/~01a10f284f33009412`
- `/df -> /developer-forward`

## Why

The redirect status should tell crawlers and clients the truth about URL intent. These surfaces are no longer candidates to return as public products. Their useful public authority should consolidate onto the current destination rather than continue to look like a provisional move.

The source-preservation rule remains unchanged: history and evidence stay inspectable even when the public route is permanently retired.

## Guards

- `tests/preserved-surfaces.test.ts` distinguishes permanent retired surfaces from temporary shortcuts.
- `scripts/verify-retired-redirects.mjs` provides a zero-dependency runner check.
- The retired routes remain absent from the canonical human sitemap.
