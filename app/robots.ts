import type { MetadataRoute } from "next";
import { MACHINE_SURFACE_PATHS, absoluteUrl } from "@/content/canonical-surfaces";

/**
 * `/robots.txt` (plan Phase 9; packet: crawl-surfaces).
 *
 * A MAP, NOT A GATE. Nothing on this site is hidden from crawlers, so the file
 * says so once and points at the sitemap. It adds no `disallow` rule, because
 * every rule it could add would be a claim about a surface that does not exist.
 *
 * STATIC. `MetadataRoute.Robots` with no request-dependent code prerenders to a
 * file; there is no `ƒ` route in this build and this does not add the first
 * one (plan §5.3).
 */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: absoluteUrl(MACHINE_SURFACE_PATHS.sitemap),
    host: absoluteUrl("/")
  };
}
