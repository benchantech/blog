import { llmsTxt } from "@/lib/llms-txt";

/**
 * `/llms.txt` (plan Phase 9).
 *
 * STATIC, DELIBERATELY. In Next 15 a plain `GET` Route Handler is NOT cached
 * by default: it builds as `ƒ (Dynamic) server-rendered on demand`, which
 * would make this the first non-static route in a fully prerendered build and
 * fail the plan's own regression gate (§5.3). `force-static` plus a handler
 * that reads nothing from the request is what keeps it `○`, and
 * `tests/machine-surfaces.test.ts` asserts the export is present.
 *
 * The body is built in `lib/llms-txt.ts`, so nothing on this surface is typed
 * into a route file where no content check would see it.
 */
export const dynamic = "force-static";

export function GET(): Response {
  return new Response(llmsTxt(), {
    headers: { "content-type": "text/plain; charset=utf-8" }
  });
}
