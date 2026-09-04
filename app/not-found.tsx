import type { Metadata } from "next";
import { StatusPage } from "@/components/StatusPage";

/**
 * 404 (plan Phase 5). NEW surface — the repo had no not-found.tsx.
 *
 * Title-only metadata, matching the repo convention (§5.2). No canonical: a
 * 404 is not a canonical node for anything.
 */
export const metadata: Metadata = {
  title: "Page not found - BenChanTech"
};

export default function NotFound() {
  return <StatusPage eyebrow="404" title="That page isn't here." />;
}
