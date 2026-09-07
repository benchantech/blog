import { ActionPill } from "@/components/ui/ActionPill";
import styles from "./case.module.css";

/**
 * One of the four gated Full-product cards (plan §7, `surfaces.ts` — "GAP-5:
 * callbacks, case closes, cross-case surfaces, 5 teaser cards"; the records are
 * `gatedCards` in `content/trust-forward/surfaces.ts`).
 *
 * VISUALLY SECONDARY IS THE SPEC, NOT A TASTE CALL. The source's own direction
 * for the first card is *"Soft, visually secondary. No lengthy AI explanation
 * yet."*, and it governs all four. So this is the quietest thing on a case
 * screen: a `--tint-grey` fill with no border and no shadow, a 15px title
 * against the case title's 26px, `--muted` body text, and an OUTLINED action
 * rather than the one primary ink fill that §4.7.2 reserves for the action the
 * learner is actually there to take. A card that competed with the decision in
 * front of the learner would be selling during the exercise.
 *
 * THE FOUR CARDS ESCALATE AND ARE NOT INTERCHANGEABLE — synthesis, then a
 * stronger WHY-NOT, then cross-case pattern, then the perspective flip — which
 * is why `gatedCards` is an ordered array keyed to the case each one follows,
 * and why this component takes ONE card's fields rather than picking from the
 * set. Which card appears where is a content decision, and it is not made here.
 *
 * EVERY WORD IS A PROP. `title`, `body` and `ctaLabel` come from the
 * `recovered_prior_authoring` records; nothing is typed into this file, because
 * `tests/canonical-text.test.ts` fails on prose of twelve words or more under
 * `components/` and each of these cards makes a claim about what full Trust
 * Forward can do. A claim needs one governed definition, and this is a
 * renderer.
 *
 * `body` IS AN ARRAY AND EVERY ENTRY IS RENDERED. The authored cards are two
 * lines — what Lite can do, then what Full can do — and the second line only
 * lands because the first one concedes the limit. There is no truncation, no
 * "read more", and no line the layout may drop.
 *
 * THE CTA IS AN ANCHOR, NOT A HANDLER. `href` points at the canonical Full
 * target, which `TRUST_FORWARD_PROVENANCE.md` requires be preserved through
 * every refactor and which therefore has exactly one definition under
 * `content/trust-forward/`. This component never constructs it, and it never
 * carries learner state: nothing about a run may appear in a path, query or
 * hash, because GA4 ships `send_page_view: true` and the URL is telemetry.
 */
export function TeaserCard({
  title,
  body,
  ctaLabel,
  href,
  onNavigate
}: {
  /** The card's authored title, e.g. the AI Coach synthesis heading. */
  title: string;
  /** The authored lines, in order. All of them render. */
  body: readonly string[];
  /** The authored CTA label, arrow included where the source typed one. */
  ctaLabel: string;
  /**
   * The Full destination, from `content/trust-forward/`. Omit to render the
   * card with no action — a state the run needs where the offer is shown but
   * the destination is still SC-TF6-unconfirmed, rather than shipping a dead
   * control that looks live.
   */
  href?: string;
  /**
   * Fired when the CTA is activated, alongside navigation — never instead of it.
   *
   * The four gated cards are the product's conversion surface, and
   * `tf_full_trust_forward_clicked` is one of the seventeen allowlisted events.
   * It carries no property at all: which card was clicked would be a path
   * signal, and the allowlist has no field for it.
   */
  onNavigate?: () => void;
}) {
  return (
    <aside className={styles.teaser}>
      <p className={styles.teaserTitle}>{title}</p>
      <div className={styles.teaserBody}>
        {body.map((line) => (
          <p className={styles.teaserLine} key={line}>
            {line}
          </p>
        ))}
      </div>
      {href ? (
        <div className={styles.teaserCta}>
          <ActionPill variant="outlined" href={href} onClick={onNavigate}>
            {ctaLabel}
          </ActionPill>
        </div>
      ) : null}
    </aside>
  );
}
