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
        destination: "/system",
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
       * `/tf` is the stable redirect BenChanTech controls (layer-01 README).
       * Every "continue to full Trust Forward" CTA in the product points here
       * rather than at studio.com directly, so when the destination moves this
       * is the only line that changes. Canonical destination confirmed under
       * SC-TF6 (layer 08).
       */
      {
        source: "/tf",
        destination: "https://studio.com/benchanviolin/trust-forward",
        permanent: false
      }
    ];
  }
};

export default nextConfig;
