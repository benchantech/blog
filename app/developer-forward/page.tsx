import type { Metadata } from "next";
import Link from "next/link";
import { FULL_OFFER, LANDING_FAQ, DEVELOPER_FORWARD_TEASER } from "@/content/developer-forward/copy";
import { ROUTES } from "@/content/developer-forward/stamp/v1-1-0";
import styles from "./developer-forward.module.css";

/**
 * `/developer-forward` — the canonical public node (layer 07's routes ruling;
 * `ROUTES.canonical`).
 *
 * BUILT TO BEN'S 2026-09-08 REDESIGN BRIEF (`bct-facelift/Developer Forward
 * redesign brief/Developer Forward.dc.html`), adapted rather than transcribed. Five
 * sections in the brief's order — hero, the two doors, the method, the FAQ, the
 * close — and every sentence is the brief's, with one exception recorded at
 * `DEVELOPER_FORWARD_TEASER.lite.chips`: the brief says "15–30 min" twice, and that
 * figure was measured against a product with eleven decisions rather than
 * seventeen checkpoints.
 *
 * ITS LAYOUT, THE SITE'S SKIN (second pass). The brief's own palette and its
 * three typefaces shipped first and read as a different product on a shared
 * domain. Ben: *"fix the font and colors to match the aesthetic of the rest of
 * the site, it should still feel definitely like the rest of the site."* Every
 * colour on this page now resolves to a token `app/globals.css` already owns,
 * mapped by ROLE rather than by hue, and the structure below is untouched. See
 * `developer-forward.module.css` for the whole mapping.
 *
 * THIS ROUTE NOW LOADS NO FONTS AT ALL. The first build pulled Instrument
 * Serif, Hanken Grotesk and JetBrains Mono through `next/font` and shipped five
 * extra woff2 files; all three are gone, and the headings, labels and body take
 * `--sans` / `--mono`, which `app/layout.tsx` already loads for every page. The
 * italic hero line survives the swap rather than being dropped — the layout
 * loads Plex Sans italic, so it is a real italic and not a synthesised oblique.
 *
 * NOTHING GLOBAL CHANGED, which was the first instruction and is still true:
 * `app/globals.css` is untouched, and the `--tf-*` names in the module are a
 * mapping layer onto the site's tokens rather than a palette of their own.
 *
 * MOBILE-FIRST, AND THE BASE RULES ARE THE PHONE. Every `grid-template-columns`
 * in the brief is a desktop instruction written as `repeat(auto-fit, minmax(…))`;
 * this build states the single column as the base and opens it at 701px, which
 * is the breakpoint `app/globals.css` already steps `--gutter` at and the one
 * the rest of this repo uses. Built against 320, 375, 390 and 430. The hero
 * type ramps with `clamp()` from a phone-first floor, the stat row wraps to two
 * columns before it wraps to four, and no fixed width appears anywhere, so the
 * layout cannot overflow a 320px viewport.
 *
 * THE TWO CTAs ARE ON EVERY SCREEN OF THE PAGE, and their weighting is the
 * argument. Studio is the paid destination and takes the filled pill in the
 * hero and in the close; Lite takes the outlined one. In the two-door section
 * they swap, because there the reader is choosing rather than being sold to.
 * Both hrefs come from `ROUTES` — the brief writes them as absolute
 * `benchantech.com` URLs, which would be a same-site absolute link, and
 * `ROUTES.fullTarget` already holds the Studio URL character for character.
 *
 * THE COUPON IS THE ONE THING HERE THAT IS NOT YET REAL. Ben asked for Lite to
 * be "an easy to justify thing that clearly will earn them a coupon toward
 * studio". No code on this site issues, stores or validates a coupon, and there
 * is no account to attach one to — so the offer is written as a promise a
 * person keeps rather than a system, and it points at `/contact`, which works
 * today. See `DEVELOPER_FORWARD_TEASER.coupon`.
 *
 * EVERY SENTENCE COMES FROM `content/developer-forward/copy.ts`.
 * `tests/canonical-text.test.ts` fails on any prose literal or JSX text node of
 * twelve words or more under `app/`, which is what makes "all learner-facing
 * prose is governed content" true rather than aspirational.
 *
 * THE BRIDGE AND ITS CONFIDENTIALITY SENTENCE ARE ONE UNIT, in the method
 * section's marked box, exactly as the brief sets them. "40+ real cases drawn
 * from Ben Chan's actual professional experience" is a claim about real clients
 * and colleagues, and the sentence saying how they are protected is what makes
 * the first publishable; there is no code path here that shows one without the
 * other.
 *
 * STILL A SERVER COMPONENT WITH NO CLIENT BOUNDARY. Layer 07's SEO ruling puts
 * the answer-first material on this page because "personalized local summaries
 * are not the crawlable SEO surface", so the six FAQ answers ship in the served
 * HTML with nothing to expand and no effect to run. This file reads no browser
 * state, fires no telemetry and takes no query, hash or segment.
 */

export const metadata: Metadata = {
  title: "Developer Forward - BenChanTech",
  alternates: { canonical: "/developer-forward" }
};

const teaser = DEVELOPER_FORWARD_TEASER;

/*
 * THE CALLER PASSES THE CLASS, NOT A TONE NAME. An earlier version took
 * `tone: "filled" | "outlined"` and resolved it in the className expression —
 * and `tests/class-contract.test.ts` mode 1 read the bare `"filled"` inside
 * that expression as a className token with no rule behind it. It was right to:
 * a scanner cannot tell a discriminator from a global class name, and the way
 * to keep it able to tell is to put no bare strings in a className at all.
 */

/** Studio. The paid destination, and the page's primary action. */
function StudioCta({ className }: { className: string }) {
  return (
    <a className={className} href={ROUTES.fullTarget}>
      {teaser.primaryCta}
    </a>
  );
}

/** Lite. Free, local, and the thing the coupon is attached to. */
function LiteCta({ className }: { className: string }) {
  return (
    <Link className={className} href={ROUTES.publicAlternate}>
      {teaser.liteCta}
    </Link>
  );
}

/**
 * `goal`, with two words set solid.
 *
 * Split on the phrase rather than stored as three strings: the sentence is one
 * governed record and must stay diffable against the brief. If the emphasis
 * ever stops appearing in the sentence the split yields one part and the
 * paragraph still renders whole, which is the correct failure.
 */
function Goal() {
  const parts = teaser.goal.split(teaser.goalEmphasis);
  return (
    <p className={styles.goal}>
      {parts[0]}
      {parts.length > 1 ? <strong className={styles.goalStrong}>{teaser.goalEmphasis}</strong> : null}
      {parts.slice(1).join(teaser.goalEmphasis)}
    </p>
  );
}

export default function DeveloperForwardPage() {
  return (
    <div className={styles.page}>
      {/* 1 — Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroLead}>
            <p className={styles.eyebrowOnInk}>
              <span className={styles.dot} aria-hidden="true" />
              {teaser.eyebrow}
            </p>
            <h1 className={styles.title}>{teaser.heading}</h1>
            <p className={styles.prompt}>{teaser.prompt}</p>
            {/*
              An unordered list, because the three lines are an arc rather than
              a ranking or a sequence a reader must follow in order. Markers are
              drawn in the stylesheet, not typed, so nothing here can put a
              bullet character into governed copy.
            */}
            <ul className={styles.heroPoints}>
              {teaser.heroPoints.map((point) => (
                <li className={styles.heroPoint} key={point}>
                  {point}
                </li>
              ))}
            </ul>
            <div className={styles.ctaRow}>
              <StudioCta className={styles.ctaFilled} />
              <LiteCta className={styles.ctaOutlined} />
            </div>
            <p className={styles.couponHeroLine}>{teaser.coupon.lead}</p>
          </div>

          {/*
            The five stages as a numbered rail. An ordered list, because the
            order IS the method — Commit before Timestamp is the whole claim —
            and the numbers are the list's own, not typed beside the labels.
          */}
          <div className={styles.sequence}>
            <p className={styles.eyebrowOnInk}>{teaser.sequence.label}</p>
            <ol className={styles.sequenceList}>
              {teaser.sequence.stages.map((stage) => (
                <li className={styles.sequenceItem} key={stage}>
                  <span className={styles.sequenceName}>{stage}</span>
                </li>
              ))}
            </ol>
            <p className={styles.sequenceNote}>{teaser.sequence.note}</p>
          </div>
        </div>

        <dl className={styles.stats}>
          {teaser.stats.map((stat) => (
            <div className={styles.stat} key={stat.value + stat.label}>
              <dt className={styles.statValue}>{stat.value}</dt>
              <dd className={styles.statLabel}>{stat.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 2 — Two doors */}
      <section className={styles.band}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>{teaser.ladder.eyebrow}</p>
          <h2 className={styles.sectionHeading}>{teaser.ladder.heading}</h2>

          <div className={styles.doors}>
            <article className={styles.cardLight}>
              <p className={styles.cardMeta}>
                <span>{teaser.lite.name}</span>
                <span className={styles.badge}>{teaser.lite.badge}</span>
              </p>
              <h3 className={styles.cardHeading}>{teaser.lite.cardHeading}</h3>
              {/*
                The checkpoint's own question, quoted, then the four steps that
                follow it. A `blockquote` because it is a quotation of a surface
                the reader has not seen yet — the run asks it seventeen times.
              */}
              <blockquote className={styles.cardPrompt}>{teaser.lite.prompt}</blockquote>
              <p className={styles.cardBody}>{teaser.lite.body}</p>
              <ul className={styles.chips}>
                {teaser.lite.chips.map((chip) => (
                  <li className={styles.chip} key={chip}>
                    {chip}
                  </li>
                ))}
              </ul>
              <div>
                <p className={styles.boundedLead}>{teaser.lite.boundedLead}</p>
                <ul className={styles.bounded}>
                  {teaser.lite.boundedItems.map((item) => (
                    <li className={styles.boundedItem} key={item}>
                      <span className={styles.dash} aria-hidden="true">
                        —
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {/*
                The coupon, on the card it belongs to. It sits above the Lite
                CTA rather than beside the Studio one because it is the reason
                to press THIS button — see DEVELOPER_FORWARD_TEASER.coupon for what
                is and is not real about the offer.
              */}
              <div className={styles.coupon}>
                <p className={styles.couponBadge}>{teaser.coupon.badge}</p>
                <p className={styles.couponLead}>{teaser.coupon.lead}</p>
                <p className={styles.couponBody}>{teaser.coupon.body}</p>
              </div>
              <LiteCta className={styles.ctaFilled} />
            </article>

            <article className={styles.cardInk}>
              <p className={styles.cardMetaOnInk}>
                <span>{teaser.full.name}</span>
                <span className={styles.badgeOnInk}>{teaser.full.badge}</span>
              </p>
              <h3 className={styles.cardHeadingOnInk}>{teaser.full.cardHeading}</h3>
              <p className={styles.cardBodyOnInk}>{teaser.full.body}</p>
              <ol className={styles.passes}>
                {teaser.full.passes.map((pass) => (
                  <li className={styles.pass} key={pass.step}>
                    <p className={styles.passHead}>
                      <span className={styles.passStep}>{pass.step}</span>
                      <span className={styles.passLabel}>{pass.label}</span>
                    </p>
                    <p className={styles.passBody}>{pass.body}</p>
                  </li>
                ))}
              </ol>
              <p className={styles.alsoLine}>{teaser.full.alsoLine}</p>
              <StudioCta className={styles.ctaFilled} />
            </article>
          </div>
        </div>
      </section>

      {/* 3 — The method */}
      <section className={styles.method}>
        <div className={styles.innerSplit}>
          <div>
            <p className={styles.eyebrow}>{teaser.method.eyebrow}</p>
            <h2 className={styles.sectionHeading}>{teaser.method.heading}</h2>
            {/*
              The grammar as five marked stages with separators between them.
              The arrows are `aria-hidden`: a screen reader reads five list
              items in order, which is the same statement without five spoken
              "right arrow"s in the middle of it.
            */}
            <ol className={styles.grammar}>
              {teaser.sequence.stages.map((stage, index) => (
                <li className={styles.grammarItem} key={stage}>
                  <span className={index > 2 ? styles.stageSolid : styles.stage}>{stage}</span>
                  {index < teaser.sequence.stages.length - 1 ? (
                    <span className={styles.arrow} aria-hidden="true">
                      →
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
          <div className={styles.methodBody}>
            <p className={styles.methodLead}>{teaser.method.body}</p>
            <Goal />
            <div className={styles.offer}>
              <p className={styles.offerBridge}>{FULL_OFFER.bridge}</p>
              <p className={styles.offerLimit}>{FULL_OFFER.confidentiality}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 — FAQ */}
      <section className={styles.band}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>{teaser.faq.eyebrow}</p>
          <h2 className={styles.sectionHeading}>{teaser.faq.heading}</h2>
          {/*
            A heading and a paragraph, inside a list. The question is an `h3`
            because it is what a screen-reader user jumps between and what a
            crawler indexes; the six sit in a `ul` so assistive technology
            announces how many there are before the reader commits to the first.
            No `<details>`, no accordion, no client reveal — layer 07's rule is
            answer-first content a machine can read without executing anything.
          */}
          <ul className={styles.faq}>
            {LANDING_FAQ.map((entry) => (
              <li className={styles.faqItem} key={entry.question}>
                <h3 className={styles.faqQuestion}>{entry.question}</h3>
                <p className={styles.faqAnswer}>{entry.answer}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 5 — Close */}
      <section className={styles.close}>
        <div className={styles.closeInner}>
          <h2 className={styles.closeHeading}>{teaser.close.heading}</h2>
          <p className={styles.closeBody}>{teaser.close.body}</p>
          <div className={styles.ctaRowCentred}>
            <LiteCta className={styles.ctaFilled} />
            <StudioCta className={styles.ctaOutlined} />
          </div>
          {/*
            NO CLAIM LINK ANY MORE. This was the coupon lead followed by "Ask
            for your coupon" pointing at `/contact`, because nothing here could
            issue one. Ben's mechanism (2026-09-09) is a hyperlink the learner
            receives on completion, so the close states the offer and how it
            arrives, and sends nobody anywhere to ask for it.

            THE SECOND SENTENCE IS A CLAIM THE PRODUCT DOES NOT YET MEET:
            `EvidenceSummary` renders no coupon link and nothing generates a
            coupon URL. See `DEVELOPER_FORWARD_TEASER.coupon`.
          */}
          <p className={styles.couponClose}>{teaser.coupon.lead}</p>
          <p className={styles.couponNote}>{teaser.coupon.access}</p>
          <p className={styles.noAi}>
            <strong className={styles.noAiLead}>{teaser.close.noAiLead}</strong> {teaser.close.noAiBody}
          </p>
        </div>
      </section>
    </div>
  );
}
