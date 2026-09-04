"use client";

import { useEffect, useState } from "react";
import type { GatedContent } from "@/lib/wys/content-gate";
import { CONSENT_STORAGE_KEY } from "@/lib/wys/browser-keys";
import {
  type ConsentReading as StoredConsentReading,
  consentReadingFor
} from "@/content/watch-your-step/data";
import { cx } from "@/components/provenance/cx";
import { DataText } from "./DataText";
import styles from "./data.module.css";

/**
 * Card 2's state-bound half (plan Phase 8, §8.8; WYS §20, §37; Q7, SC-2).
 *
 * THE PROBLEM THIS COMPONENT EXISTS FOR. Artboard `5c` card 2 asserts, flatly
 * and in the present tense, that page analytics and coarse counts are sent
 * (dc.html:195). `trackWys` sends nothing at all unless
 * `bct_analytics_consent === "granted"` — Q7's ratified full-suppression
 * default — so for a visitor who declined, and for a visitor who has not
 * chosen, that sentence is false. (WYS §34) forbids solving that in copy and
 * (WYS §37) requires that "no privacy claim exceeds implemented fact", so the
 * approved sentence is CONDITIONED ON THE STATE THAT MAKES IT TRUE rather than
 * reworded: it renders for a granted browser and a different, true sentence
 * renders otherwise.
 *
 * HYDRATION (§7.3). The consent key can only be read in the browser, and iOS
 * Safari private browsing throws on `localStorage` access. So this renders
 * NOTHING until the read returns: the server HTML carries card 2's
 * unconditional half — the two mechanisms and their two conditions — which is
 * true in every state, and the state line arrives when the browser can answer.
 * A guessed line that then corrected itself would be worse than a missing one
 * on a page whose subject is exactly what this browser holds.
 *
 * FAIL CLOSED, exactly as `analyticsConsentGranted()` does: a throw, an absent
 * key and an unrecognised value all read as "no choice stored", which is the
 * state in which nothing is sent. The two agree because they are the same rule
 * applied twice, and `tests/wys-data.test.ts` asserts the mapping rather than
 * trusting the comment.
 *
 * IT READS THE KEY DIRECTLY AND WRITES NOTHING. There is no second consent
 * store (§8.1) and no re-prompt: `components/ConsentBanner.tsx` is the only
 * writer, and it is byte-frozen apart from its `try/catch`.
 */

export type ConsentReading = "pending" | StoredConsentReading;

/**
 * The read, fail-closed.
 *
 * The ACCESS is here — it is the one thing that has to touch `window` — and the
 * MAPPING is `consentReadingFor()` in `content/watch-your-step/data.ts`, which
 * is pure and is checked against `analyticsConsentGranted()` over the same
 * inputs. One definition of what "granted" means, so this page cannot promise a
 * send the adapter would refuse.
 */
function readConsentChoice(): StoredConsentReading {
  if (typeof window === "undefined") return consentReadingFor(null);
  try {
    return consentReadingFor(window.localStorage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    return consentReadingFor(null);
  }
}

/* Composed above the JSX: `tests/class-contract.test.ts` mode 1 reads every
   string literal inside a `className={...}` expression as a class token, and
   every `${` as a dynamic class needing registration. */
const bodyClass = cx(styles.cardBody, styles.cardBodyStacked);

export function AnalyticsReceipt({
  granted,
  declined,
  undecided
}: {
  /** The approved artboard sentence. Renders only when counts are actually sent. */
  granted: GatedContent;
  declined: GatedContent;
  undecided: GatedContent;
}) {
  const [reading, setReading] = useState<ConsentReading>("pending");

  useEffect(() => {
    setReading(readConsentChoice());
  }, []);

  if (reading === "pending") return null;

  const content = reading === "granted" ? granted : reading === "denied" ? declined : undecided;
  return <DataText content={content} className={bodyClass} />;
}
