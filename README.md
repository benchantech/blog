# BenChanTech

Next.js source for [benchantech.com](https://benchantech.com), now being rebuilt as the public operating surface of the Ben Chan Tech $20 AI-native company experiment.

## Mission

Ben Chan Tech finds the practical boundary between human judgment and AI execution by running real systems, preserving the evidence, and publishing what survives.

The hard operating constraint is that **one $20/month ChatGPT Plus subscription is the only required AI workforce expense** for the core company and public knowledge surface.

Read `company/CONSTITUTION.md` and `company/CURRENT_STATE.md` before changing the site.

## Stack

- Next.js App Router
- React
- TypeScript
- Vercel
- GitHub as durable company state and publication substrate

Runtime dependencies remain intentionally small: `next`, `react`, and `react-dom`.

## Development

```bash
npm install
npm run dev
PORT=3999 npm run build
npm test
```

`npm test` runs flat files in `tests/` through `node --import tsx --test`.

Keep public content in typed content modules under `content/` where practical, not duplicated across JSX. Keep public assets under `public/`. Preserve canonical surfaces by default; a redesign is not a reason to erase indexed evidence.

## Current Developer Forward status

- `/developer-forward` — canonical developer-judgment evidence hub; preserve for SEO/AEO/GEO accumulation.
- `/developer-forward-lite` — free deterministic five-case experience; no account and no runtime AI.
- Full Developer Forward — discontinued for now.
- Future course — possible, but no destination currently selected.
- No active coupon, checkout, or paid-upgrade promise.
- `/df` — controlled shortcut to `/developer-forward` until a future destination exists.

## $20 architecture rule

Do not add a paid AI API, additional AI subscription, hosted AI agent platform, vector database, AI CMS, or other recurring AI service as required infrastructure for the core site.

Prefer this sequence:

1. Do the cognitive/content work in ChatGPT.
2. Store durable output in GitHub as ordinary code/content.
3. Serve deterministic artifacts through the existing Next.js/Vercel site.
4. Use specialist coding tools only when runtime engineering materially requires them.

If ChatGPT can produce the final artifact directly, do not add another AI dependency.

## Preserved surfaces

Two bodies of work are still in this repository and still served, and neither is
part of the current experiment:

- **Watch Your Step** — the developer-judgment course. Its nine routes under
  `app/watch-your-step/` are retired from public discovery and redirect to `/`
  with `permanent: false`. The source is preserved, not deleted, and
  `content/canonical-surfaces.ts` records the retirement in `RETIRED_SURFACES`.
- **The Author Ship** — `/bridge`, `/standing-orders`, `/ships-log`, `/crew`,
  `/ben` and `/system`, retired the same way in the 2026-09-09 consolidation.

`scripts/check-no-deletions.sh` is the gate that keeps them: nothing may delete
a file, and the only rename it permits is the Trust Forward → Developer Forward
rebrand, matched by shape rather than by a list of paths. Run it before any
commit that removes markup; `tests/preserved-surfaces.test.ts` runs it too.

Retiring a route means BOTH a redirect and removal from the roster. A page that
serves but is unlisted, or is unlisted but still serves, is the one state
`tests/machine-surfaces.test.ts` refuses.

## Analytics

GA4 uses direct `gtag.js` with Google Consent Mode v2. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in Vercel if analytics are desired. The site renders without analytics when it is unset.
