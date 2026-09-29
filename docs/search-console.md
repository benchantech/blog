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
