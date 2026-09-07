import type { Metadata } from "next";
import { LANDING_COMPLETE, LANDING_INCOMPLETE } from "@/content/trust-forward/copy";
import { ROUTES } from "@/content/trust-forward/stamp/v1-1-0";
import { ActionPill } from "@/components/ui/ActionPill";
import { CardShell } from "@/components/ui/CardShell";
import { LinkRow } from "@/components/ui/LinkRow";
import { Pill } from "@/components/ui/Pill";
import { LandingCompletion } from "@/components/trust-forward/LandingCompletion";
import styles from "./trust-forward.module.css";

/**
 * `/trust-forward` — the canonical public node for Trust Forward (layer 07's
 * routes ruling; `ROUTES.canonical`).
 *
 * A SERVER COMPONENT, PRERENDERED, AND THAT IS A PRODUCT REQUIREMENT RATHER
 * THAN A PERFORMANCE ONE. Layer 07's SEO ruling puts the answer-first material
 * — the semantic wedge and the six intent questions — on this page precisely
 * because "personalized local summaries are not the crawlable SEO surface". A
 * page that read `localStorage` during render would be dynamic for everybody,
 * including the crawler that the wedge exists for. So nothing outside
 * `LandingCompletion` touches the browser, and the HTML that ships is the
 * incomplete state.
 *
 * TWO STATES, BOTH DECIDED LOCALLY, AND THE SERVER PICKS NEITHER. Both trees
 * are built here and handed to the island, which swaps them in an effect. The
 * server cannot know which one is right — completion lives in one browser's
 * `localStorage` and, per PRIVACY_ANALYTICS.md, must never be transmitted, so
 * there is no request-time signal that could tell it. See
 * `components/trust-forward/LandingCompletion.tsx` for why the island carries
 * neither the copy nor the stylesheet nor the case bank.
 *
 * COMPLETION CHANGES THIS PAGE'S UI AND NOTHING ELSE. PRIVACY_ANALYTICS.md's
 * last line is the whole permission: inspect it to change the UI, never emit it
 * as a learner identity attribute. This file therefore fires no telemetry at
 * all. `tf_lite_started` belongs to the Lite route (it answers "does the
 * landing convert into an actual start?", and only the start can answer it) and
 * `tf_full_trust_forward_clicked` to whichever surface owns the onward CTA's
 * click; adding either here would put a landing-side event next to the one fact
 * that is not allowed to travel, which is exactly the adjacency the rule bans.
 *
 * NO LEARNER STATE IN THE URL. There is one URL for the whole five-case run and
 * this is not it — `/trust-forward` is a door and takes no query, no hash and
 * no segment. `components/GoogleAnalytics.tsx` is byte-frozen with
 * `send_page_view: true`, so `page_location` and `page_title` reach GA4 outside
 * `trackTrustForward` and outside its four-key allowlist. A URL is telemetry
 * whether or not the adapter knows about it.
 *
 * EVERY SENTENCE COMES FROM `content/trust-forward/copy.ts`, and both states
 * read it through one door apiece — `LANDING_INCOMPLETE` and `LANDING_COMPLETE`
 * — including their `fullOffer`, which is the same `FULL_OFFER` object in both.
 * `tests/canonical-text.test.ts` fails on any prose literal or JSX text node of
 * twelve words or more under `app/`, and that mechanism is what makes "all
 * learner-facing prose is governed content" true rather than aspirational.
 *
 * THE BRIDGE AND ITS CONFIDENTIALITY SENTENCE ARE RENDERED AS ONE UNIT, in both
 * states, and `renderFullOffer` is a single function for exactly that reason.
 * "30+ real cases drawn from Ben Chan's actual professional experience" is a
 * claim about real clients, employers and colleagues; the sentence that says
 * how they are protected is what makes the first sentence publishable. copy.ts
 * states it plainly — a renderer that shows `bridge` without `confidentiality`
 * has published the claim without its limit — so there is no code path here
 * that can show one without the other.
 *
 * THE SIX INTENT QUESTIONS RENDER AS AN INDEX, NOT AS AN FAQ. The handoff
 * supplies the questions and no approved answers (`TODO_LANDING_FAQ_ANSWERS` is
 * `null` at its definition site, and `TRUST_FORWARD_UNSOURCED_SURFACES` names
 * it). Six plausible paragraphs would read as Ben answering six questions about
 * his own product, which is the relabelling `TRUST_FORWARD_PROVENANCE.md`
 * forbids. A list of questions is honest; six invented answers are not.
 *
 * NO SECTION EYEBROWS. `SectionEyebrow` is a fine primitive and every label it
 * would carry here would have to be typed in this file — caps are typed in the
 * copy, by rule — and no eyebrow label for this surface exists in the handoff.
 * The page uses the approved sentences as its own structure instead.
 *
 * MOBILE-FIRST. The base rules in the stylesheet are the phone; 320, 375, 390
 * and 430 are the widths this was built against, and the desktop block only
 * widens the measure and lifts the type ramp.
 */

export const metadata: Metadata = {
  title: "Trust Forward - BenChanTech",
  alternates: { canonical: "/trust-forward" }
};

/**
 * The offer's three approved public sentences, as one block.
 *
 * `descriptor` describes LITE (fictional cases, a fixed system) and is the
 * honest counterweight to `bridge`, which describes FULL (real cases). They are
 * rendered apart for that reason: the descriptor belongs beside the thing it
 * describes, at the top of the incomplete state. `bridge` and `confidentiality`
 * are never rendered apart — see the file header.
 */
function FullOffer({ offer }: { offer: typeof LANDING_INCOMPLETE.fullOffer }) {
  return (
    <CardShell fill="grey">
      <p className={styles.offerBridge}>{offer.bridge}</p>
      <p className={styles.offerLimit}>{offer.confidentiality}</p>
    </CardShell>
  );
}

/** The visitor with no local completion: the page sells Lite. */
function IncompleteLanding() {
  const copy = LANDING_INCOMPLETE;
  return (
    <article className={styles.landing}>
      <header className={styles.hero}>
        <h1 className={styles.title}>{copy.heading}</h1>
        <p className={styles.lede}>{copy.lede}</p>
        <p className={styles.body}>{copy.body}</p>
        <p className={styles.descriptor}>{copy.fullOffer.descriptor}</p>
        <p className={styles.timeRow}>
          <Pill variant="status">{copy.timeEstimate}</Pill>
        </p>
      </header>

      <div className={styles.block}>
        <CardShell fill="teal">
          <p className={styles.revealLead}>{copy.revealLead}</p>
          <ul className={styles.revealList}>
            {copy.revealItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </CardShell>
      </div>

      <div className={styles.cta}>
        <ActionPill href={ROUTES.publicAlternate} variant="ink" full>
          {copy.primaryCta}
        </ActionPill>
      </div>

      <p className={styles.evidence}>{copy.evidenceLine}</p>

      <div className={styles.block}>
        <FullOffer offer={copy.fullOffer} />
      </div>

      <div className={styles.wedge}>
        <p className={styles.wedgeLead}>{copy.semanticWedge}</p>
        <ul className={styles.questionList}>
          {copy.intentQuestions.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

/**
 * The visitor whose browser holds a finished run: a different page, not the
 * same page with a badge.
 *
 * Two doors, and the copy is blunt about which is which. `LANDING_COMPLETE.bridge`
 * concedes that the pattern may not hold — that is the sentence that earns the
 * onward CTA, so it stands immediately before it. `/tf` is a redirect and never
 * a canonical node, which is why it is read from `ROUTES.redirect` rather than
 * typed.
 */
function CompleteLanding() {
  const copy = LANDING_COMPLETE;
  return (
    <article className={styles.landing}>
      <header className={styles.hero}>
        <h1 className={styles.title}>{copy.heading}</h1>
        <p className={styles.statusRow}>
          <Pill variant="status">{copy.status}</Pill>
        </p>
      </header>

      <div className={styles.block}>
        <LinkRow href={ROUTES.publicAlternate} size="lg">
          {copy.reopenCta}
        </LinkRow>
      </div>

      <p className={styles.completeBridge}>{copy.bridge}</p>

      <div className={styles.cta}>
        <ActionPill href={ROUTES.redirect} variant="ink" full>
          {copy.continueCta}
        </ActionPill>
      </div>

      <div className={styles.block}>
        <FullOffer offer={copy.fullOffer} />
      </div>
    </article>
  );
}

export default function TrustForwardPage() {
  return <LandingCompletion incomplete={<IncompleteLanding />} complete={<CompleteLanding />} />;
}
