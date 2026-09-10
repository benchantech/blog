# 0010 — The company runs inside the $20 AI operating constraint

**Status:** ACCEPTED
**Decided:** 2026-09-10
**Supersedes:** the active-offer portions of ADR 0009 and the prior homepage/product-entry assumption
**Stale when:** Ben changes the $20 required-AI-expense rule, selects a new canonical full Developer Forward destination, or explicitly restores Developer Forward as an active paid offering

---

## Context

Ben Chan Tech is no longer being organized around selling the current Studio version of Developer Forward. The broader experiment is now the company itself: how much real company work can be delegated to AI while Ben retains judgment, provenance, authorship, and accountability.

The operating constraint is deliberately hard: one $20/month ChatGPT Plus subscription is the only required AI workforce expense for the core company and public knowledge surface.

Developer Forward still has useful search traction and a strong real-case corpus. Deleting the canonical route or folding it into a generic homepage would throw away useful accumulated surface area. Developer Forward Lite also remains useful as a deterministic, no-account, no-runtime-AI five-case experience.

## Decision

1. `/` becomes the canonical public surface for the AI-native company experiment.
2. `/developer-forward` remains canonical and becomes the indexed developer-judgment evidence hub.
3. `/developer-forward-lite` remains a standalone free experience.
4. The prior full Developer Forward Studio offer is discontinued.
5. Lite carries no coupon, checkout, or active upgrade promise.
6. `/df` remains a Benchantech-controlled shortcut but resolves to `/developer-forward` until a future course destination is actually selected.
7. Existing harmless, indexed, or evidence-bearing surfaces are preserved by default.
8. No paid AI API, additional AI subscription, AI CMS, agent platform, vector database, or other recurring AI service may become required infrastructure for the core public site.
9. ChatGPT should do cognitive/content work first; specialist coding tools are used only when runtime engineering materially requires them.

## Why

The constraint makes the experiment measurable and falsifiable. If the company requires additional paid AI infrastructure to perform a critical function, that limitation should be recorded before the constraint is relaxed.

The preservation rule protects accumulated SEO/AEO/GEO value while allowing the homepage and company mission to change. A route that already carries evidence should not disappear merely because its commercial wrapper changed.

## Consequences

- The homepage is no longer a Developer Forward sales page.
- Developer Forward remains an authority surface rather than a dead product URL.
- Lite remains useful without pretending a full course currently exists.
- Studio-specific links are no longer part of the active public path.
- The repository gains a company constitution and current-state record that future agents read before acting.
- Existing deterministic site architecture becomes an asset of the $20 experiment rather than something to replace.

## Guards

- `company/CONSTITUTION.md` states the $20 rule and authority boundary.
- `company/CURRENT_STATE.md` records current product/surface status.
- `AGENTS.md` requires both files on boot.
- `/developer-forward` metadata and page copy describe the current evidence-hub role.
- `/developer-forward-lite` metadata states that no paid upgrade is currently offered.
- `next.config.ts` keeps `/df` internal until a real destination exists.
