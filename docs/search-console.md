# Search Console operations

GOAL-0016 keeps GSC Wizard read-only for analysis. Bounded sitemap mutation is performed through the Captain-local runner with the existing local Google service account.

## Current bounded maintenance profile

Property: `sc-domain:benchantech.com`

Desired sitemap:
- `https://benchantech.com/sitemap.xml`

Obsolete registrations that may be removed:
- `https://benchantech.com/sitemap_index.xml`
- `https://benchantech.com/page-sitemap.xml`
- `https://benchantech.com/post-sitemap.xml`

The script first lists sitemaps using the full `webmasters` scope. If the service account cannot read the exact property, it stops before any mutation. If authorized, it submits the current sitemap, removes only the three exact stale registrations when present, and lists the final state for verification.

Credential material remains local and is never committed or printed to runner receipts.


## 2026-09-29 cleanup proof

Runner request `benchantech-gsc-sync-001` executed against exact target `8705c4c35e525122fdf43f17fcc61255b36ffae0` with safety validation `pass` and exit code `0`.

Observed mutation results:

- submitted `https://benchantech.com/sitemap.xml`: HTTP 204
- deleted `https://benchantech.com/sitemap_index.xml`: HTTP 204
- deleted `https://benchantech.com/page-sitemap.xml`: HTTP 204
- deleted `https://benchantech.com/post-sitemap.xml`: HTTP 204
- final Search Console sitemap list: only `https://benchantech.com/sitemap.xml`
- current sitemap: 23 submitted URLs, 0 warnings, 0 errors

Independent read-only Search Console verification immediately afterward confirmed the same final list. Representative new canonical surfaces `/developer-forward` and `/experiments/20-dollar-company` changed from unknown-to-Google to `Discovered - currently not indexed`. This is an exposure/indexing observation, not evidence of ranking or demand.
