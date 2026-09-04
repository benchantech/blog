# BenChanTech

Next.js source for [benchantech.com](https://benchantech.com): the routing foyer for the Ben Chan Tech LLC ecosystem, the Watch Your Step course, and the public record of how the site is run.

## Stack

- Next.js App Router
- React
- TypeScript
- Vercel

## Development

```bash
npm install
npm run dev
PORT=3999 npm run build
npm test
```

`npm test` runs flat files in `tests/` through `node --import tsx --test`, so a test module cannot import a `.css` specifier. `scripts/check-no-deletions.sh` fails on any removed or renamed file; `tests/preserved-surfaces.test.ts` shells out to it, so a deletion fails the suite rather than a review.

Keep content in typed content modules under `content/`, not in JSX, and public assets under `public/`. Claims that appear on more than one page are defined once in `content/claims.ts` and rendered as variants; `tests/canonical-text.test.ts` fails on a second definition.

## Analytics

GA4 uses direct `gtag.js` with Google Consent Mode v2. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in Vercel for Production, Preview, and Development. The current Benchantech web stream uses `G-25PDJ8VRNT`.

Analytics storage defaults to denied until the visitor allows analytics through the first-party consent notice.
