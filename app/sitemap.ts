import type { MetadataRoute } from "next";
import { absoluteUrl, humanCanonicalSurfaces } from "@/content/canonical-surfaces";

/**
 * `/sitemap.xml` (plan Phase 9; packet: crawl-surfaces, canonical-node rule).
 *
 * CURRENT CANONICAL SURFACES ONLY. The roster is
 * `content/canonical-surfaces.ts` and this file adds nothing to it: no
 * redirect (`/about`, `/lab`, `/posts` are preserved redirects, not canonical
 * URLs), no superseded object, no `[stopId]` template — the nine concrete stop
 * URLs instead. A sitemap that listed a redirect would hand a crawler two
 * nodes for one concept, which is the thing Standing Order 07 forbids.
 *
 * The machine mirrors are excluded: `humanCanonicalSurfaces()` filters them
 * out, because a sitemap is a map of pages a person reads.
 *
 * NO `lastModified`, NO `priority`, NO `changeFrequency`. Every one of them
 * would be an assertion this build cannot support — the build has no per-page
 * modification record, and inventing dates on a site whose whole subject is
 * provenance is precisely the failure mode plan R8 names.
 *
 * STATIC, and asserted so: `force-static` plus no request-dependent code.
 */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return humanCanonicalSurfaces().map((surface) => ({ url: absoluteUrl(surface.path) }));
}
