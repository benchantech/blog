import type { GatedContent } from "@/lib/wys/content-gate";
import { todayLabels, todayTranscriptSlot } from "@/content/watch-your-step/today";
import { wysLabels } from "@/content/watch-your-step/copy";
import { BenSlot } from "@/components/provenance/BenSlot";
import { MediaSlot } from "@/components/provenance/MediaSlot";
import { PlayDisc } from "@/components/ui/PlayDisc";
import { GatedText } from "@/components/wys/GatedText";
import styles from "./today.module.css";

/**
 * WATCH (plan Phase 7; WYS §10 WATCH; mockup 5b dc.html:86-88).
 *
 * ONE PRIMARY HUMAN SOURCE, AND NO INTERPRETATION ABOVE IT. (WYS §10) makes
 * both rules explicit — "one primary human source per source period/week is the
 * working model" and "no AI interpretation before the human source" — and this
 * card is where they become layout: the slot is first, the caption that says so
 * is second, and nothing drafted appears above either.
 *
 * THE SLOT CANNOT BE FILLED (§6.4). `MediaSlot` takes a label and an
 * awaited-asset descriptor and declares `children`, `text` and `body` as
 * `never`, so no generated string can occupy the space Ben's recording will
 * take. Both strings come from the `slot-today-watch-video` record in
 * `content/watch-your-step/sources.ts`, through `wysLabels`, so the overlay pill
 * and the mono line have one definition rather than being retyped here.
 *
 * THE DISC IS DECORATIVE. Artboard 5b draws a 56px ink disc inside the stripe;
 * no recording is selected, so a real control would be an affordance for
 * something that does not exist. `PlayDisc` is `aria-hidden`, the overlay takes
 * no pointer events, and the slot keeps MediaSlot's single accessible name.
 *
 * THE TRANSCRIPT IS AN INLINE EXPANDABLE BLOCK, not a link to a second surface:
 * a transcript on its own route would be a second canonical node for one source
 * (§5.1), and plan Phase 7 asks for the block. Native `<details>`, so it opens
 * with JavaScript off and is a real disclosure widget to a screen reader. What
 * it opens onto is a Ben slot: per plan §13.1 "the recording is the primary
 * source, not the transcript", and each clip ships with an approved transcript
 * carrying the same approval status — so with no recording selected there is
 * nothing to transcribe, and the block says exactly that rather than standing
 * empty.
 */
export function WatchCard({ lead }: { lead: GatedContent | null }) {
  return (
    <section className={styles.watchCard}>
      <div className={styles.watchMedia}>
        <MediaSlot
          label={wysLabels.watchSlotOverlay}
          awaitedAsset={wysLabels.watchSlotMono}
          medium="video"
          height={196}
          tone="light"
        />
        <span className={styles.watchDisc}>
          <PlayDisc />
        </span>
      </div>
      <div className={styles.watchCaption}>
        {lead ? <GatedText content={lead} /> : null}
        <details className={styles.transcript}>
          <summary className={styles.transcriptSummary}>{todayLabels.transcript}</summary>
          <div className={styles.transcriptBody}>
            <BenSlot
              label={todayTranscriptSlot.label}
              awaitedAsset={todayTranscriptSlot.awaitedAsset}
            />
          </div>
        </details>
      </div>
    </section>
  );
}
