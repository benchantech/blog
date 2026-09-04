import type { Metadata } from "next";
import { RouteStub } from "@/components/RouteStub";

/**
 * Stub (plan Phase 5). Real content lands in phase 9.
 *
 * Metadata convention (§5.2): TITLE ONLY, matching the repo's existing
 * "X - BenChanTech" pattern, plus `alternates.canonical` — every new route
 * declares its canonical URL so §5.1's one-canonical-node rule is visible to
 * crawlers and not only to a content-layer test. No `description`: adding one
 * to new routes would be a new convention, not a restyle.
 */
export const metadata: Metadata = {
  title: "Bridge - BenChanTech",
  alternates: { canonical: "/bridge" }
};

export default function BridgePage() {
  return <RouteStub eyebrow="THE SHIP" title="Bridge" buildPhase="phase 9" />;
}
