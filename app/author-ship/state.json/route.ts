import { authorShipStateJson } from "@/lib/author-ship-state";

/**
 * `/author-ship/state.json` (plan Phase 9; packet: state.json).
 *
 * STATIC, for the same reason `/llms.txt` is: an uncached `GET` handler builds
 * `ƒ` and would be the first dynamic route in this build (§5.3, §8.6).
 *
 * The document itself is assembled in `lib/author-ship-state.ts` — every value
 * read from the module that already defines it, every sentence through
 * `gateProse`, and a `canonical_human_node` map saying in band which human page
 * each section mirrors.
 */
export const dynamic = "force-static";

export function GET(): Response {
  return new Response(authorShipStateJson(), {
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}
