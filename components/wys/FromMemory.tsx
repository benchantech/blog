"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { GatedContent } from "@/lib/wys/content-gate";
import { isShowable } from "@/lib/wys/content-gate";
import { practiceLabels } from "@/content/watch-your-step/practice";
import { ActionPill } from "@/components/ui/ActionPill";
import { ProvenanceMono } from "@/components/provenance/ProvenanceMono";
import { GatedText } from "./GatedText";
import styles from "./practice.module.css";

/**
 * FROM MEMORY (plan Phase 7; WYS §15.1; mockup 5c dc.html:163-170).
 *
 * Retrieval practice before checking. The card offers three ways to attempt it
 * — aloud, on paper, or typed here — and the typed one is the only one this
 * site could possibly capture, so it is the one the spec constrains word for
 * word:
 *
 *   > If a local scratch box exists: no network request · no analytics event
 *   > containing its content · no persistence · clear on route change ·
 *   > label: "This stays in this page and is not sent anywhere."
 *
 * ALL FIVE ARE STRUCTURAL HERE, NOT PROCEDURAL. Read the imports: there is no
 * `useWysState`, no `localStorage`, no `fetch`, no `trackWys`, no
 * `sendAggregate` and no server action in this file. The scratch value lives in
 * one `useState` and is named in exactly two expressions — the binding itself
 * and the textarea's `value`. It is not in a dependency array, not in an effect body,
 * not in a `key`, not in an `aria-` attribute and not in any function argument,
 * so there is no expression anywhere in this component that could carry it off
 * the page. `tests/wys-practice.test.ts` asserts that mechanically with §29.2's
 * `DO_NOT_SEND_WYS_TEST_9f31` canary rather than trusting this paragraph.
 *
 * THE LABEL IS A PRECONDITION OF THE BOX, NOT AN ANNOTATION ON IT. `notice` is
 * a required prop and the textarea renders only when the notice may render
 * (`isShowable`). There is no code path that draws an unlabelled scratch box —
 * which is the difference between the promise being kept and the promise being
 * printed.
 *
 * CLEARED ON ROUTE CHANGE, TWICE OVER. Next's App Router unmounts this
 * component on a route change and the state goes with it; the `usePathname`
 * effect below clears it again, so the guarantee does not depend on an
 * unmount that a future layout change could remove. The two together are why
 * the card can say "It clears when you leave" as a fact.
 *
 * "I DID IT" RECORDS NOTHING, AND SAYS SO. (WYS §8.8)'s ritual record wants the
 * mark stored; §7.1's `wys:v1` shape is verbatim and holds no field for a
 * ritual completion, and writing a ritual id into `progress.completedLessonIds`
 * would inflate a count another surface reads as lessons. So the mark is an
 * in-page acknowledgement, it clears with the card, and the acknowledgement
 * says exactly that instead of implying a record. Narrowing recorded in
 * docs/facelift-unapproved.md R4.
 *
 * NOT HERE, deliberately: no score, no model answer, no comparison, no "you
 * were close", no timer. (WYS §8.8) `appMustNotDo` lists four of those on
 * `rit-from-memory` and the fifth is the same idea.
 */
export function FromMemory({
  prompt,
  notice
}: {
  /** The retrieval prompt, gated. Rendered through `GatedText` like all prose. */
  prompt: GatedContent;
  /**
   * §15.1's mandated label. Required, and the scratch box is drawn only when
   * this may render — the box cannot exist without its promise.
   */
  notice: GatedContent;
}) {
  const pathname = usePathname();
  const [scratch, setScratch] = useState("");
  const [marked, setMarked] = useState(false);

  useEffect(() => {
    // WYS §15.1: "clear on route change". The unmount already does this; the
    // effect makes it true even if this card is ever hoisted into a layout that
    // survives navigation. Both states are page-local, so both clear.
    setScratch("");
    setMarked(false);
  }, [pathname]);

  const scratchAllowed = isShowable(notice);

  return (
    <div className={styles.fromMemory}>
      <div className={styles.fromMemoryPrompt}>
        <GatedText content={prompt} tone="dark" />
      </div>

      <ul className={styles.offers}>
        <li className={styles.offer}>{practiceLabels.sayItAloud}</li>
        <li className={styles.offer}>{practiceLabels.writeItOnPaper}</li>
      </ul>

      {scratchAllowed ? (
        <>
          <label className={styles.scratchField}>
            <span className="sr-only">{practiceLabels.scratchFieldLabel}</span>
            <textarea
              className={styles.scratch}
              value={scratch}
              onChange={(event) => setScratch(event.target.value)}
              placeholder={practiceLabels.scratchPlaceholder}
              rows={2}
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          <div className={styles.scratchNotice}>
            <GatedText content={notice} tone="dark" />
          </div>
        </>
      ) : null}

      <ActionPill variant="onInk" full onClick={() => setMarked(true)}>
        {practiceLabels.didIt}
      </ActionPill>
      {marked ? (
        <div className={styles.didItDone}>
          <ProvenanceMono tone="dark">{practiceLabels.didItAcknowledged}</ProvenanceMono>
        </div>
      ) : null}
    </div>
  );
}
