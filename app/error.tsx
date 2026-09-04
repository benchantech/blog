"use client";

import { ActionPill } from "@/components/ui/ActionPill";
import { StatusPage } from "@/components/StatusPage";

/**
 * Route-segment error boundary (plan Phase 5, §5.2). NEW surface.
 *
 * `"use client"` is required by the App Router. `/error` IS NOT A URL: this is
 * a convention file that catches throws in the segments BELOW the root layout,
 * so it never appears in a route table or in the prerendered-route list. It
 * does not catch a throw from the root layout itself — that is what
 * app/global-error.tsx is for, and why that file ships in this phase.
 *
 * The error is deliberately not printed. A stack or a message on a public page
 * is an information leak, and the digest is already in the server logs.
 */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <StatusPage eyebrow="ERROR" title="Something went wrong here.">
      <ActionPill onClick={reset}>Try again</ActionPill>
    </StatusPage>
  );
}
