"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import styles from "./reveal.module.css";

/**
 * Developer Forward Lite — REFLECT, the one thing a committed record may still
 * gain (governing addendum §3 "REFLECT is a Developer Forward learning step. It is
 * not a sixth YY Method stage"; §13 free text is never used for Lite
 * inference; §25 the analytics boundary).
 *
 * WHAT THIS COMPONENT IS ALLOWED TO DO WITH WHAT THE LEARNER WRITES: keep it,
 * and hand it to the one callback that stores it locally. That is the entire
 * list. §13 is the most absolute rule in the addendum — free text may never
 * determine a tag, a receipt, a pattern, a resonance, a score, a
 * recommendation, a trait or a posture, is never sent to a model, is never
 * parsed for inference and is never sent to analytics.
 *
 * READ THE IMPORTS, BECAUSE THEY ARE THE PROOF. Three: React, the class-name
 * joiner, the stylesheet. No analytics module, no telemetry module, no
 * scoring module, no aggregation module, no `fetch`, no `navigator.sendBeacon`.
 * The text arrives from the keyboard and leaves through `onAutosave`, and
 * there is no third path out of this file. A promise that is checkable by
 * reading the import list is worth more than a promise in a comment, which is
 * the same argument `components/developer-forward/ReflectionBox.tsx` makes.
 *
 * NOTHING HERE INSPECTS THE TEXT. It is measured in exactly one way — compared
 * for equality against the last value autosaved, so an idle timer does not
 * write the same string twice. `length`, word counts, keyword scans, sentiment,
 * a minimum before "Continue" unlocks: none of them exist, and each would be a
 * small, reasonable-looking step onto the path §13 closes.
 *
 * WHY AUTOSAVE RATHER THAN A SAVE BUTTON. A reflection is optional, and a
 * button makes "optional" cost a decision — the learner who closes the tab
 * mid-sentence loses what they wrote and learns that this surface does not
 * keep things. The whole product claim is that it keeps things. So the draft
 * is written on an idle timer, on blur, and on unmount, and the status line
 * says so plainly.
 *
 * IT IS UNCONTROLLED ON PURPOSE, AND KEYED BY THE CALLER. The draft lives in
 * this component's state, seeded once from `initialText`. A controlled
 * textarea whose value round-trips through a debounced parent write would lag
 * the caret, and re-seeding from props on every render would fight the person
 * typing. Give it `key={checkpointId}` when the checkpoint changes; the
 * unmount flush means the outgoing draft is written before the new one mounts.
 *
 * SERVER-RENDER SAFE. The first render is `initialText` and the idle status,
 * which are the same on the server and on the client, so there is nothing here
 * to hydrate differently. Every timer lives inside an effect.
 */

/**
 * The four fixed strings. Structural, and short by necessity rather than by
 * taste: no YY copy module exists in this build and this agent does not own
 * `content/` (ADR 0007), so the `labels` prop is the seam for one to arrive
 * later. `note` is a commitment the rest of this file has to keep, and it does
 * — "in this browser" is why there is no network call, "never interpreted" is
 * why there is no scoring path.
 */
export interface ReflectLabels {
  /** The prompt. Labels the textarea. */
  prompt: string;
  /** What happens to what is written here. */
  note: string;
  /** Shown while an edit is waiting on the idle timer. */
  saving: string;
  /** Shown once the draft has been handed to `onAutosave`. */
  saved: string;
}

export const REFLECT_LABELS: ReflectLabels = {
  prompt: "What would you have done differently?",
  note: "Optional. Kept in this browser, never interpreted.",
  saving: "Saving…",
  saved: "Saved"
};

export interface ReflectBoxProps {
  /**
   * The draft to open with, verbatim. Read ONCE, at mount. Never trimmed,
   * never normalised — "preserved exactly as you wrote them" is the promise,
   * and a component that tidies whitespace has already broken it.
   */
  initialText?: string;
  /**
   * Where the draft goes. Called with the text verbatim, after the idle
   * delay, on blur, and on unmount.
   *
   * The ONLY exit from this component. A caller wires it to the local ledger
   * (`recordReflected`) or to nothing; anything that puts it on a wire would
   * break §13 and §25 at the call site rather than here, which is why this
   * prop is named for storage and not for a generic "onChange".
   */
  onAutosave?: (text: string) => void;
  /** Idle milliseconds before a write. Default 700. */
  delayMs?: number;
  /** Override the four structural strings. Defaults to `REFLECT_LABELS`. */
  labels?: ReflectLabels;
}

type SaveStatus = "idle" | "pending" | "saved";

export function ReflectBox({
  initialText = "",
  onAutosave,
  delayMs = 700,
  labels = REFLECT_LABELS
}: ReflectBoxProps) {
  const [text, setText] = useState(initialText);
  const [status, setStatus] = useState<SaveStatus>("idle");

  /*
   * The note is what tells a learner where their words go, and until
   * 2026-09-08 nothing tied it to the box they go in. A screen reader moving
   * field to field in forms mode reads the label and skips the sibling
   * paragraph, so the disclosure was reaching everyone except the learner least
   * able to find it by scanning. `useId` because two ReflectBoxes can exist
   * across a replay and an id has to survive hydration.
   */
  const noteId = useId();

  /*
   * Refs rather than state for everything the flush needs. The unmount flush
   * runs from a cleanup that must not re-subscribe on every keystroke, so what
   * it reads has to be a box it can look inside at cleanup time rather than a
   * value captured when the effect was created. `lastSaved` starts at
   * `initialText`: what was passed in is, by definition, already stored.
   */
  const pending = useRef(initialText);
  const lastSaved = useRef(initialText);
  const save = useRef(onAutosave);
  save.current = onAutosave;

  /** Hand the current draft over, unless it is byte-identical to the last one. */
  const flush = useCallback(() => {
    const value = pending.current;
    /*
     * An unchanged draft is not written again — an append-only ledger would
     * otherwise carry a row per idle timer. The status still settles, because
     * a learner who typed a word and deleted it IS stored as they left it, and
     * leaving "Saving…" on screen forever would say otherwise.
     */
    if (value !== lastSaved.current) {
      lastSaved.current = value;
      save.current?.(value);
    }
    setStatus("saved");
  }, []);

  /* The idle timer. Re-armed by each edit; cleared before it can fire twice. */
  useEffect(() => {
    if (status !== "pending") return;
    const timer = window.setTimeout(flush, delayMs);
    return () => window.clearTimeout(timer);
  }, [text, status, delayMs, flush]);

  /*
   * The unmount flush, and it is a SEPARATE effect with an empty dependency
   * list on purpose. Folded into the timer effect above, its cleanup would run
   * on every keystroke and write the draft on every character — an append-only
   * ledger would then carry one row per letter. Empty deps means this cleanup
   * runs exactly once, when the component goes away.
   */
  useEffect(() => {
    return flush;
  }, [flush]);

  /*
   * Compared out here rather than inside the `className` / JSX attributes.
   * `tests/class-contract.test.ts` mode 1 treats every string literal inside a
   * `className={...}` expression as a class token, so a `status === "idle"`
   * guard written in an attribute would be reported as an unresolved class
   * named "idle". Naming the three states as booleans keeps that scanner
   * honest about what is and is not a class name.
   */
  const isPending = status === "pending";
  const isSaved = status === "saved";

  return (
    <section className={styles.reflect}>
      <label className={styles.reflectField}>
        <span className={styles.reflectPrompt}>{labels.prompt}</span>
        <textarea
          className={styles.reflectInput}
          value={text}
          onChange={(event) => {
            const next = event.target.value;
            pending.current = next;
            setText(next);
            setStatus("pending");
          }}
          onBlur={flush}
          rows={4}
          autoComplete="off"
          spellCheck={true}
          aria-describedby={noteId}
        />
      </label>

      <p className={styles.reflectNote} id={noteId}>
        {labels.note}
      </p>

      {/*
        `aria-live="polite"` and never `assertive`: a save notice is an
        acknowledgement, and interrupting someone mid-sentence to tell them
        their sentence was stored is worse than not telling them. Empty at
        idle, so the region exists from first render and has nothing to
        announce until there is something to announce.
      */}
      <p className={styles.reflectStatus} aria-live="polite">
        {isPending ? labels.saving : null}
        {isSaved ? labels.saved : null}
      </p>
    </section>
  );
}
