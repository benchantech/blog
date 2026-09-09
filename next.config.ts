import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/lab",
        destination: "/neon",
        permanent: false
      },
      {
        source: "/about",
        /*
         * `/system` until 2026-09-08, when it was consolidated and given its
         * own redirect to `/`. Pointed straight at the destination rather than
         * left as a two-hop chain: a redirect to a redirect costs a round trip
         * and, more to the point, hides where `/about` actually lands from
         * anyone reading this table. Restore this to "/system" when
         * `SHIP_NAV_CONSOLIDATED` is flipped back.
         */
        destination: "/",
        permanent: false
      },
      {
        source: "/posts",
        destination: "https://benchanviolin.substack.com",
        permanent: false
      },
      {
        source: "/upwork",
        destination: "https://www.upwork.com/freelancers/~01a10f284f33009412",
        permanent: false
      },
      /*
       * WATCH YOUR STEP IS RETIRED FROM PUBLIC DISCOVERY, NOT DELETED.
       *
       * Ben's 2026-09-07 ruling: remove it from navigation and discovery,
       * preserve the source as a non-public stub, and redirect old public entry
       * routes to the homepage with NON-PERMANENT redirects. All 34 files under
       * `app/watch-your-step/` stay exactly where they are — the deletion
       * contract (`scripts/check-no-deletions.sh`) forbids removing or renaming
       * any of them, and `content/canonical-surfaces.ts` records them in
       * RETIRED_SURFACES so roster/disk parity still holds.
       *
       * `permanent: false` is load-bearing and is the reason this is reversible:
       * a 308 is cached by browsers indefinitely, so a permanent redirect here
       * would make un-retiring the course impossible for anyone who had visited
       * it once. The specific route is listed BEFORE the wildcard because Next
       * matches in order.
       */
      {
        source: "/watch-your-step",
        destination: "/",
        permanent: false
      },
      {
        source: "/watch-your-step/:path+",
        destination: "/",
        permanent: false
      },
      /*
       * THE 2026-09-08 CONSOLIDATION, shadowing the six surfaces
       * `CONSOLIDATED_SURFACES` withdrew from the roster.
       *
       * Ben: *"hide the links themselves and update the site map so nothing is
       * reachable that isn't linked in the main pages."* Dropping them from the
       * sitemap alone would have hidden them from crawlers while leaving them
       * live for anyone holding a link — the reverse of what was asked, and a
       * worse state than either end. `tests/machine-surfaces.test.ts` refuses a
       * route that leaves discovery without a redirect behind it, which is why
       * these six lines and that register have to land together.
       *
       * `permanent: false` for the same reason the course's redirects use it: a
       * 308 is cached indefinitely, so a permanent redirect would make
       * un-consolidating impossible for anyone who had visited once. Flipping
       * `SHIP_NAV_CONSOLIDATED` restores the menu and the roster; these lines
       * are the third place to change, and the test above fails until they do.
       *
       * NO FILES ARE DELETED. All six pages are still on disk and
       * `tests/preserved-surfaces.test.ts` still asserts each one exists.
       */
      {
        source: "/bridge",
        destination: "/",
        permanent: false
      },
      {
        source: "/standing-orders",
        destination: "/",
        permanent: false
      },
      {
        source: "/ships-log",
        destination: "/",
        permanent: false
      },
      {
        source: "/crew",
        destination: "/",
        permanent: false
      },
      {
        source: "/ben",
        destination: "/",
        permanent: false
      },
      {
        source: "/system",
        destination: "/",
        permanent: false
      },
      /*
       * `/df` is the stable redirect BenChanTech controls (layer-01 README, where it
       * reads `/tf`; renamed with the product on 2026-09-09).
       * Every "continue to full Developer Forward" CTA in the product points here
       * rather than at studio.com directly, so when the destination moves this
       * is the only line that changes. Canonical destination confirmed under
       * SC-TF6 (layer 08).
       */
      {
        source: "/df",
        destination: "https://studio.com/benchanviolin/trust-forward",
        permanent: false
      }
    ];
  }
};

export default nextConfig;
