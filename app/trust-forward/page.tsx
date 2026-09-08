import type { Metadata } from "next";
import { FULL_OFFER, LANDING_FAQ, LANDING_INCOMPLETE, TRUST_FORWARD_TEASER } from "@/content/trust-forward/copy";
import { ROUTES } from "@/content/trust-forward/stamp/v1-1-0";
import { ActionPill } from "@/components/ui/ActionPill";
import { CardShell } from "@/components/ui/CardShell";
import { LinkRow } from "@/components/ui/LinkRow";
import styles from "./trust-forward.module.css";

/**
 * `/trust-forward` — the canonical public node for Trust Forward (layer 07's
 * routes ruling; `ROUTES.canonical`).
 *
 * WHAT THIS PAGE IS NOW, AND WHAT IT STOPPED BEING. Ben's instruction of
 * 2026-09-08: *"Create a simple `/trust-forward` teaser page explaining the
 * relationship between Trust Forward Lite and the full Trust Forward
 * experience… Keep this page compact. It should feel like a teaser, not a
 * duplicate landing page."* It used to be the landing page that SOLD Lite —
 * lede, body, descriptor, time estimate, a reveal list and a full-width Start
 * button. The homepage now carries that pitch, so this page carrying it too was
 * the duplication the instruction names. Every sentence of the teaser comes
 * from `TRUST_FORWARD_TEASER`, which records the ruling and the one edit made
 * to Ben's words.
 *
 * THE ONE-STATE DECISION, WHICH WAS FORCED RATHER THAN CHOSEN. This page used
 * to render two trees through `LandingCompletion`, an island that swaps in a
 * "Lite complete" state when the browser holds a finished run. That island
 * reads `TRUST_FORWARD_LITE_STORAGE_KEY` and gates on `result_viewed`,
 * `export_markdown` and three other SHIP-era ledger events. The YY runtime
 * writes `TRUST_FORWARD_YY_STORAGE_KEY` and emits none of them, so since the
 * YY rewrite the complete tree has been unreachable for every learner: a person
 * who finished all five cases still saw "Complete Lite to reveal:". Shipping a
 * teaser through a state machine with one live state would have been shipping
 * the appearance of a second door. So there is one page for everybody, and the
 * dead branch is reported rather than re-plumbed — `LandingCompletion` and
 * `LANDING_COMPLETE` are both still exported and neither is deleted, so the fix
 * is a rewire when someone rules on what "complete" means under YY.
 *
 * TWO SENTENCES STOPPED RENDERING HERE AND THAT IS A REPAIR, NOT A LOSS.
 * `LANDING_INCOMPLETE.revealItems` promised "your observed SHIP developer
 * pattern" and `LANDING_COMPLETE.bridge` opened "SHIP gives you a place to
 * start looking at how you decide." SHIP was removed from the required path by
 * the YY rewrite (docs/adr/0001), so both were approved copy that had become
 * false — the same defect as the homepage's "five fictional cases", which was
 * fixed on 2026-09-08 in a pass that did not reach this route. They remain
 * exported and unrendered rather than edited, because rewriting an approved
 * sentence to describe a product it was not written about is how a false claim
 * survives a review: it looks like maintenance.
 *
 * A SERVER COMPONENT, PRERENDERED, AND THAT IS A PRODUCT REQUIREMENT RATHER
 * THAN A PERFORMANCE ONE. Layer 07's SEO ruling puts the answer-first material
 * — the semantic wedge and the six intent questions — on this page precisely
 * because "personalized local summaries are not the crawlable SEO surface". The
 * teaser is compact; the FAQ below it is not a second landing page but the
 * crawlable surface that ruling requires, and it is the only place on the site
 * those six answers exist. Dropping it to satisfy "compact" would have been
 * this build overruling a ruling. With the completion island gone, the whole
 * page is now static HTML with nothing to hide behind an effect, which is a
 * stronger version of what the ruling asked for.
 *
 * COMPLETION NO LONGER CHANGES THIS PAGE AT ALL, so the privacy note that used
 * to sit here is narrower than it was: this file reads no browser state, fires
 * no telemetry, and takes no query, hash or segment.
 * `tf_full_trust_forward_clicked` is still owned by Lite's four gated cards and
 * is NOT fired by the primary CTA below — this page has no client boundary to
 * fire it from, and adding one to measure a click would undo the paragraph
 * above. That is a real gap in the funnel and it is named here rather than
 * silently accepted. `components/GoogleAnalytics.tsx` is byte-frozen with
 * `send_page_view: true`, so a URL is telemetry whether or not the adapter
 * knows about it.
 *
 * THE CTA POINTS AT `ROUTES.fullTarget`, NOT AT `/tf`. Ben's instruction gives
 * the destination as a literal URL, and `ROUTES.fullTarget` already holds
 * exactly that string — so this links to the one definition rather than to the
 * redirect that resolves to it, and `TRUST_FORWARD_PROVENANCE.md`'s requirement
 * that the Full target keep a single definition under `content/trust-forward/`
 * is met either way. `/tf` stays live and stays the short link.
 *
 * EVERY SENTENCE COMES FROM `content/trust-forward/copy.ts`.
 * `tests/canonical-text.test.ts` fails on any prose literal or JSX text node of
 * twelve words or more under `app/`, and that mechanism is what makes "all
 * learner-facing prose is governed content" true rather than aspirational.
 *
 * THE BRIDGE AND ITS CONFIDENTIALITY SENTENCE ARE RENDERED AS ONE UNIT.
 * "40+ real cases drawn from Ben Chan's actual professional experience" is a
 * claim about real clients, employers and colleagues; the sentence that says
 * how they are protected is what makes the first sentence publishable. copy.ts
 * states it plainly — a renderer that shows `bridge` without `confidentiality`
 * has published the claim without its limit — so there is no code path here
 * that can show one without the other.
 *
 * A HEADING AND A PARAGRAPH, INSIDE A LIST. The FAQ question is an `h2` because
 * it is what a screen-reader user jumps between and what a crawler indexes, and
 * a bolded paragraph is neither. The six sit in a `ul` so assistive technology
 * announces how many there are before the reader commits to the first; the
 * marker is removed in the stylesheet, not the semantics.
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
 * The offer's two public sentences, as one block. Never rendered apart — see
 * the file header.
 */
function FullOffer() {
  return (
    <CardShell fill="grey">
      <p className={styles.offerBridge}>{FULL_OFFER.bridge}</p>
      <p className={styles.offerLimit}>{FULL_OFFER.confidentiality}</p>
    </CardShell>
  );
}

export default function TrustForwardPage() {
  const teaser = TRUST_FORWARD_TEASER;
  return (
    <article className={styles.landing}>
      <header className={styles.hero}>
        <h1 className={styles.title}>{teaser.heading}</h1>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>{teaser.lite.heading}</h2>
        <p className={styles.sectionBody}>{teaser.lite.body}</p>
        {/*
          The product's own words, in the product's own punctuation. It is a
          `blockquote` and not a styled paragraph because it is a quotation of a
          surface the reader has not seen yet, and the seventeen checkpoints ask
          it verbatim.
        */}
        <blockquote className={styles.prompt}>{teaser.lite.prompt}</blockquote>
        <p className={styles.boundedLead}>{teaser.lite.boundedLead}</p>
        <ul className={styles.boundedList}>
          {teaser.lite.boundedItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>{teaser.full.heading}</h2>
        <p className={styles.sectionBody}>{teaser.full.body}</p>
        {/*
          An ordered list, because the three passes ARE an order: Pass 3 asks
          the learner to transfer a pattern they can only have formed in passes
          1 and 2. A `ul` would say these are three things you can do; `ol` says
          what the curriculum actually claims.
        */}
        <ol className={styles.passList}>
          {teaser.full.passes.map((pass) => (
            <li className={styles.passItem} key={pass.label}>
              <p className={styles.passLabel}>{pass.label}</p>
              <p className={styles.passBody}>{pass.body}</p>
            </li>
          ))}
        </ol>
        <p className={styles.alsoLine}>{teaser.full.alsoLine}</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>{teaser.method.heading}</h2>
        <p className={styles.grammar}>{teaser.method.grammar}</p>
        <p className={styles.sectionBody}>{teaser.method.body}</p>
      </section>

      <p className={styles.goal}>{teaser.goal}</p>

      <div className={styles.positioning}>
        {teaser.positioning.map((line) => (
          <p className={styles.positioningLine} key={line}>
            {line}
          </p>
        ))}
      </div>

      <div className={styles.cta}>
        <ActionPill href={ROUTES.fullTarget} variant="ink" full>
          {teaser.primaryCta}
        </ActionPill>
      </div>

      <div className={styles.block}>
        <FullOffer />
      </div>

      <div className={styles.secondary}>
        <LinkRow href={ROUTES.publicAlternate} size="lg">
          {teaser.liteCta}
        </LinkRow>
      </div>

      <section className={styles.wedge}>
        <p className={styles.wedgeLead}>{LANDING_INCOMPLETE.semanticWedge}</p>
        <ul className={styles.faqList}>
          {LANDING_FAQ.map((entry) => (
            <li key={entry.question} className={styles.faqItem}>
              <h2 className={styles.faqQuestion}>{entry.question}</h2>
              <p className={styles.faqAnswer}>{entry.answer}</p>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
