"use client";

/**
 * `/trust-forward`'s completion switch (PRIVACY_ANALYTICS.md, final line;
 * layer 07 routes ruling; plan §7.3).
 *
 * PRIVACY_ANALYTICS.md grants this page exactly one privilege and withholds
 * everything next to it:
 *
 * > `/trust-forward` may inspect local completion to change its own UI, but do
 * > not emit completion as a learner identity attribute.
 *
 * So this component reads and it does not report. There is no `trackLite` call
 * in this file and there must never be one: `lib/trust-forward/telemetry.ts`
 * closes the property allowlist at four ordinal keys, and the way "completion
 * is not a learner attribute" is made TRUE rather than promised is that the
 * only code that knows about completion — this file — has no transport. A
 * landing-view event fired from here would carry the fact in its very presence,
 * whatever its properties said.
 *
 * IT TAKES TWO RENDERED TREES AND CHOOSES ONE. Both `incomplete` and `complete`
 * are built by the server component and handed in as props, which is what keeps
 * this island small in the three senses that matter:
 *
 *  1. NO COPY. Every sentence stays in `content/trust-forward/copy.ts` and
 *     reaches the DOM through the server half, so `tests/canonical-text.test.ts`
 *     keeps its grip on the whole page — a client component that imported the
 *     copy module would still pass that test but would put governed prose in a
 *     JavaScript chunk, which is the MODULE path
 *     `scripts/check-bundle-provenance.mjs` exists to close.
 *  2. NO STYLESHEET. The page's CSS Module is imported once, by the page.
 *  3. NO CONTENT BANK. See the note on `localLiteCompletion` below — the
 *     predicate is deliberately a fold over the ledger and nothing else, so
 *     `content/trust-forward/cases.ts` and `variants.ts` are not dragged into a
 *     public marketing page's bundle. `EXPERIENCE.futureCaseTitlesHiddenUntilReached`
 *     is a promise about what a visitor can see, and a case bank served in a
 *     chunk to someone who has not started Lite breaks it in the asset graph
 *     while the DOM still looks honest.
 *
 * HYDRATION-SAFE BY THE REPO'S ESTABLISHED PATTERN (`components/ConsentBanner.tsx`,
 * `components/wys/useWysState.ts`): the initial state is the INCOMPLETE tree,
 * `localStorage` is touched only inside `useEffect`, and so server HTML and
 * first client HTML are byte-identical. That is also what keeps `/trust-forward`
 * prerendered — the route is the crawlable, answer-first surface layer 07's SEO
 * ruling puts the semantic wedge on, and a route that read storage during
 * render would opt out of static generation for everyone.
 *
 * A BLOCKED STORE FALLS TO INCOMPLETE. `readLiteState` returns the empty
 * dataset with `storageBlocked: true` when the browser refuses (iOS Safari
 * private browsing throws on access, and iPhone Safari is this repo's primary
 * QA target). Showing the sell-Lite state to someone who has actually finished
 * is a mild indignity; showing "Lite complete" and a "Reopen Lite result" link
 * to someone whose result cannot be reopened is a lie. The fallback is chosen
 * in that direction on purpose.
 */

import { type ReactNode, useEffect, useState } from "react";
import { readLiteState } from "@/lib/trust-forward/storage";
import type { LedgerEvent, LedgerEventType } from "@/lib/trust-forward/types";

/**
 * The ledger events that can only exist downstream of `resultAndExportsPresent`.
 *
 * Every one of these five is emitted by a surface `lib/trust-forward/pointers.ts`
 * gates on a complete active path, so any one of them in the ledger is proof
 * that this browser once held a finished run. Five rather than one because
 * `result_viewed` alone would make this page's state depend on a single call
 * site in another agent's route file; a learner who completed Lite and went
 * straight to an export is just as complete.
 */
const COMPLETION_GATED_EVENTS: readonly LedgerEventType[] = [
  "result_viewed",
  "result_detail_viewed",
  "export_markdown",
  "export_json",
  "copy_summary"
];

/**
 * The events that can un-finish a finished run.
 *
 * A ledger only ever grows, so "has completed" is monotonic and "IS complete"
 * is not: an upstream edit can un-reach Case 5 and leave the earlier
 * `result_viewed` standing. Comparing sequences is the cheap, content-free way
 * to say the honest thing — the completion evidence counts only while nothing
 * has touched the path since. `reset` is included because a reset that was
 * recorded before the store was cleared should not read as a live result.
 *
 * The failure direction is conservative: an edit that has not been re-viewed
 * puts the page back into its incomplete state, which sends the learner to Lite
 * rather than offering a result that no longer matches their answers.
 */
const PATH_INVALIDATING_EVENTS: readonly LedgerEventType[] = [
  "decision_selected",
  "decision_changed",
  "reset"
];

function highestSequence(
  ledger: readonly LedgerEvent[],
  types: readonly LedgerEventType[]
): number | null {
  let highest: number | null = null;
  for (const event of ledger) {
    if (!types.includes(event.type)) continue;
    if (highest === null || event.sequence > highest) highest = event.sequence;
  }
  return highest;
}

/**
 * Local completion, decided from the ledger alone.
 *
 * NOT `resultAndExportsPresent(resolveActivePath(...))`, which is the
 * authoritative predicate and the one the Lite route itself must use. That one
 * resolves variants, and resolving variants imports the whole authored corpus —
 * see point 3 in the header. This page does not need to know WHICH decisions
 * stand; it needs to know whether to show one door or two, and the ledger's own
 * sequence numbers answer that without opening a single case.
 *
 * Exported so the rule is testable without rendering a component — a test file
 * in this repo cannot import this module's default surface anyway, because
 * `node --import tsx --test` cannot load the `.css` specifier that reaches it
 * through the page.
 */
export function localLiteCompletion(ledger: readonly LedgerEvent[]): boolean {
  const proven = highestSequence(ledger, COMPLETION_GATED_EVENTS);
  if (proven === null) return false;
  const invalidated = highestSequence(ledger, PATH_INVALIDATING_EVENTS);
  return invalidated === null || proven > invalidated;
}

export function LandingCompletion({
  incomplete,
  complete
}: {
  /** The server-rendered sell-Lite page. Also the server and first-client render. */
  incomplete: ReactNode;
  /** The server-rendered two-door page. Mounted only after the effect says so. */
  complete: ReactNode;
}) {
  const [completedLocally, setCompletedLocally] = useState(false);

  useEffect(() => {
    setCompletedLocally(localLiteCompletion(readLiteState().dataset.ledger));
  }, []);

  return <>{completedLocally ? complete : incomplete}</>;
}
