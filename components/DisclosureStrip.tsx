import Link from "next/link";
import { claimById } from "@/content/claims";
import { disclosureApprovalLine } from "@/lib/approval-state";
import { renderCanonicalText } from "@/lib/canonical-text";
import styles from "./DisclosureStrip.module.css";

/**
 * The disclosure strip (plan §5.5; handoff README:38 — "Required on every page
 * footer"; mockup 4a, dc.html:422-426).
 *
 * FOUR SENTENCES, NONE OF THEM HARDCODED HERE.
 *
 *   1-2  `claims["zero-ai"].inline`
 *   3    `claims["ai-assisted-ben-approved"].inline`
 *   4    `disclosureApprovalLine()` — a VARIANT selected by
 *        `approvalState.stamp`, not a string (Q1, SC-1).
 *
 * The first three are Final copy from the approved artboard and are
 * `CanonicalText` `inline` variants, so they come through
 * `renderCanonicalText`, which returns the text and its render policy together
 * — a component cannot receive the prose without also receiving what it is
 * allowed to do with it (§6.2). If a record is ever blocked, awaiting or
 * missing, NOTHING renders in its place: this component never invents a
 * sentence.
 *
 * The artboard bolds the first sentence only. That is a presentation of one
 * canonical string, so it is split at its first sentence boundary rather than
 * stored twice (§6.8, one definition).
 *
 * MOBILE IS NEW/UNAPPROVED. The strip exists in the approved set only at `4a`
 * desktop: its flex geometry (gap 32, two `nowrap` children, 18px body) cannot
 * survive 390px minus 44px of gutters. It stacks below 700px, in the `5d`
 * dark-card register, with the structural precedent of superseded turn `2f`.
 * One DOM at both breakpoints; see docs/facelift-unapproved.md.
 */

/** Split a canonical sentence pair at its first boundary. Never re-words it. */
function splitLead(text: string): { lead: string; rest: string } {
  const boundary = text.indexOf(". ");
  if (boundary === -1) return { lead: text, rest: "" };
  return { lead: text.slice(0, boundary + 1), rest: text.slice(boundary + 2) };
}

function inlineClaim(id: Parameters<typeof claimById>[0]): string | null {
  const rendered = renderCanonicalText(claimById(id), "inline");
  return rendered.kind === "text" ? rendered.text : null;
}

export function DisclosureStrip() {
  const zeroAi = inlineClaim("zero-ai");
  const aiCrew = inlineClaim("ai-assisted-ben-approved");
  const approval = disclosureApprovalLine();
  const opening = zeroAi ? splitLead(zeroAi) : null;

  return (
    <aside className={styles.strip} aria-label="Site disclosure">
      <p className={styles.pill}>Disclosure</p>
      <p className={styles.body}>
        {opening ? <b>{opening.lead}</b> : null}
        {opening?.rest ? <> {opening.rest}</> : null}
        {aiCrew ? <> {aiCrew}</> : null} {approval.text}
        {approval.href && approval.linkLabel ? (
          <>
            {" "}
            <Link className={styles.inlineLink} href={approval.href}>
              {approval.linkLabel} →
            </Link>
          </>
        ) : null}
      </p>
      {/*
        THE CREW MANIFEST LINK WAS REMOVED 2026-09-08. `/crew` is retired behind
        a redirect to `/` (content/canonical-surfaces.ts, CONSOLIDATED_SURFACES),
        and this strip is mounted in the root layout — so leaving it would have
        put a link labelled "Crew Manifest" on EVERY page of the site, landing
        every reader on the homepage. It is the widest-reaching of the links the
        consolidation had to withdraw, which is why it went with them rather
        than after them.

        `styles.crew` stays in the stylesheet, unreferenced, so restoring this
        is one element and not a rebuild. See `SHIP_NAV_CONSOLIDATED`.
      */}
    </aside>
  );
}
