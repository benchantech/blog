# BenChanTech

Next.js source for [benchantech.com](https://benchantech.com), the routing foyer for the Ben Chan Tech LLC ecosystem.

## Stack

- Next.js App Router
- React
- TypeScript
- Vercel

## Development

```bash
npm install
npm run dev
npm run build
npm test
```

Keep content in the Next app, typed content modules, and public assets under `public/`.

## Analytics

GA4 uses direct `gtag.js` with Google Consent Mode v2. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in Vercel for Production, Preview, and Development. The current Benchantech web stream uses `G-25PDJ8VRNT`.

Analytics storage defaults to denied until the visitor allows analytics through the first-party consent notice.
