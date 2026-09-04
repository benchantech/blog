"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { GatedContent } from "@/lib/wys/content-gate";
import { BROWSER_KEYS } from "@/lib/wys/browser-keys";
import { WYS_STORAGE_KEY } from "@/lib/wys/local-state";
import { trackWys } from "@/lib/wys/telemetry";
import { WYS_DOMAINS } from "@/content/watch-your-step/domains";
import {
  type BrowserKeyReading,
  browserKeyValueSummary,
  dataLabels,
  dataPageRowsInRenderOrder,
  localDataFile,
  rawJsonPreview
} from "@/content/watch-your-step/data";
import { useWysState } from "@/components/wys/useWysState";
import { ActionPill } from "@/components/ui/ActionPill";
import { CardShell } from "@/components/ui/CardShell";
import { KvList, KvRow } from "@/components/ui/KvRow";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { ProvenanceMono } from "@/components/provenance/ProvenanceMono";
import { DataLines, DataText } from "./DataText";
import styles from "./data.module.css";

/**
 * Card 1 and the three actions (plan Phase 8; WYS §18, §20; mockup `5c` Data,
 * dc.html:182-207).
 *
 * ONE HOOK INSTANCE OWNS THE WHOLE INTERACTION. `useWysState` holds its
 * snapshot in `useState`, so two components calling it hold two snapshots: a
 * clear fired from an actions component would leave a rows component still
 * showing the state it read on mount, and the page would be lying about the
 * browser in the exact moment it is teaching the learner not to take its word
 * for it. So this component owns the hook and the artboard's middle — cards 2
 * and 3 and the infrastructure paragraph, which need no local state — arrive
 * as slots and stay server-rendered.
 *
 * CARD 1'S ROWS ARE GENERATED, NOT LISTED (§7.5). Every row comes from
 * `WYS_DATA_PAGE_ROWS`, the total mapping over the declared `WysLocalStateV1`
 * field set, so a field added to the schema surfaces here without an edit —
 * which is the only way "Generated from what's actually stored right now" stays
 * true. Nine rows where the artboard draws five; the five additions are ordered
 * after the approved four and escalated in docs/facelift-unapproved.md.
 *
 * THE KEY REGISTER IS GENERATED TOO, and it is what makes the sitewide title
 * honest (Q6). "What this site knows about you" is a claim about the site, not
 * about Watch Your Step, so `bct_analytics_consent` is listed beside `wys:v1`
 * with its stored value and with whether a clear removes it — read from
 * `lib/wys/browser-keys.ts`, so a third key added later appears with no edit.
 *
 * HYDRATION (§7.3). Nothing here reads `localStorage` during render. The hook
 * reads inside `useEffect`; the raw key readings do the same, into their own
 * state, refreshed after every mutation. Until both return, values read
 * "not read yet" — NOT an em dash, which on this page would be the false claim
 * "nothing stored" rather than a placeholder, and which is what a visitor with
 * JavaScript disabled would be left with. The row labels render either way:
 * the set of fields this browser can hold is (WYS §18)'s "This browser can
 * store" list and is true at every moment.
 *
 * RESTART AND CLEAR ARE TWO OPERATIONS, and each explains itself BEFORE it
 * runs (WYS §17). The pill opens a panel; the panel carries the only control
 * that acts. The explanations are `RESTART_COURSE_EXPLANATION` and
 * `CLEAR_ALL_WYS_DATA_EXPLANATION` from `lib/wys/local-state.ts` — written
 * beside the two functions so the explanation cannot drift from the behaviour.
 *
 * TELEMETRY: `wys_local_state_clear` and `wys_restart_course`, both bare, both
 * fired AFTER the local operation, so a browser with analytics blocked still
 * gets the operation. `wys_data_manifest_view` fires from
 * `DataManifestTelemetry`. Those three and nothing else.
 */

type Panel = "none" | "restart" | "clear" | "cleared";

/** Fail-closed raw read. Never called during render (§7.3). */
function readRawKey(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function readAllKeys(): BrowserKeyReading[] {
  return BROWSER_KEYS.map((record) => ({ key: record.key, raw: readRawKey(record.key) }));
}

/**
 * The download (WYS §18). Built in the browser from the browser's own bytes;
 * there is no server copy to request and no request is made.
 */
function downloadLocalData(readings: readonly BrowserKeyReading[]): void {
  if (typeof document === "undefined") return;
  const blob = new Blob([localDataFile(readings)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = dataLabels.downloadFileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function DataManifest({
  clearingFootnote,
  clearingSurvives,
  clearedDemonstration,
  storageBlockedNotice,
  restartExplanation,
  clearExplanation,
  infrastructure,
  children
}: {
  /** The approved artboard footnote, unchanged. */
  clearingFootnote: GatedContent;
  /** The addition that names what a clear leaves behind. Its own label. */
  clearingSurvives: GatedContent;
  /** The post-clear panel (WYS §20's teaching interaction). */
  clearedDemonstration: GatedContent;
  /** The no-storage variant (§7.3). */
  storageBlockedNotice: GatedContent;
  restartExplanation: readonly GatedContent[];
  clearExplanation: readonly GatedContent[];
  /**
   * The infrastructure paragraph (dc.html:201), server-rendered. It is a slot
   * rather than part of `children` because the artboard puts it OUTSIDE the
   * 12px card stack and above the actions — one of the two places on this
   * screen where order is load-bearing.
   */
  infrastructure: ReactNode;
  /** Cards 2 and 3 — server-rendered; they hold no local state. */
  children: ReactNode;
}) {
  const { loaded, state, storageBlocked, restart, clearAll } = useWysState(WYS_DOMAINS);
  // `null` until the effect has run: "not read yet" is a different statement
  // from "not set", and the server render can only make the first one.
  const [readings, setReadings] = useState<readonly BrowserKeyReading[] | null>(null);
  const [panel, setPanel] = useState<Panel>("none");

  const refresh = useCallback(() => setReadings(readAllKeys()), []);
  useEffect(() => {
    refresh();
  }, [refresh]);

  const wysRaw = readings?.find((reading) => reading.key === WYS_STORAGE_KEY)?.raw ?? null;

  function confirmRestart(): void {
    restart();
    refresh();
    setPanel("none");
    trackWys("wys_restart_course");
  }

  function confirmClear(): void {
    clearAll();
    refresh();
    setPanel("cleared");
    trackWys("wys_local_state_clear");
  }

  function reload(): void {
    if (typeof window !== "undefined") window.location.reload();
  }

  return (
    <>
      <div className={styles.cards}>
        <CardShell fill="grey">
          <SectionEyebrow breakpoint="mobile">{dataLabels.card1Eyebrow}</SectionEyebrow>

          {storageBlocked ? (
            <DataText content={storageBlockedNotice} className={styles.notice} />
          ) : (
            <>
              <KvList bare>
                {dataPageRowsInRenderOrder.flatMap((row) =>
                  row.lines.map((line) => (
                    <KvRow
                      key={line.label}
                      variant="bare"
                      label={line.label}
                      value={loaded ? line.value(state) : dataLabels.pendingValue}
                    />
                  ))
                )}
              </KvList>

              <ul className={styles.keys}>
                <li className={styles.keysHeading}>{dataLabels.keysHeading}</li>
                {BROWSER_KEYS.map((record) => {
                  const raw = readings?.find((reading) => reading.key === record.key)?.raw ?? null;
                  return (
                    <li key={record.key} className={styles.key}>
                      <div className={styles.keyName}>
                        <ProvenanceMono>{record.key}</ProvenanceMono>
                      </div>
                      <div className={styles.keyValue}>
                        {readings === null ? dataLabels.pendingValue : browserKeyValueSummary(raw)}
                        {" · "}
                        {record.clearedByWysClear
                          ? dataLabels.keyClearedByClear
                          : dataLabels.keyKeptByClear}
                      </div>
                    </li>
                  );
                })}
              </ul>

              <details className={styles.disclosure}>
                <summary className={styles.summary}>{dataLabels.rawJsonSummary}</summary>
                <pre className={styles.json}>
                  {readings === null ? dataLabels.pendingValue : rawJsonPreview(wysRaw)}
                </pre>
              </details>
            </>
          )}
        </CardShell>

        {children}
      </div>

      {infrastructure}

      {panel === "cleared" ? (
        <div className={styles.cleared}>
          <DataText content={clearedDemonstration} className={styles.clearedText} />
          <div className={styles.clearedActions}>
            <ActionPill variant="ink" onClick={reload}>
              {dataLabels.reloadPage}
            </ActionPill>
          </div>
        </div>
      ) : null}

      <div className={styles.actions}>
        <ActionPill
          variant="ink"
          full
          disabled={storageBlocked || readings === null}
          onClick={() => downloadLocalData(readings ?? [])}
        >
          {dataLabels.downloadLocalData}
        </ActionPill>

        {panel === "restart" ? (
          <div className={styles.confirm}>
            <DataLines lines={restartExplanation} className={styles.confirmLine} />
            <div className={styles.confirmActions}>
              <ActionPill variant="ink" onClick={confirmRestart}>
                {dataLabels.confirmRestart}
              </ActionPill>
              <ActionPill variant="outlined" onClick={() => setPanel("none")}>
                {dataLabels.cancel}
              </ActionPill>
            </div>
          </div>
        ) : (
          <ActionPill
            variant="outlined"
            full
            meta={dataLabels.restartCourseMeta}
            disabled={storageBlocked}
            onClick={() => setPanel("restart")}
          >
            {dataLabels.restartCourse}
          </ActionPill>
        )}

        {panel === "clear" ? (
          <div className={styles.confirm}>
            <DataLines lines={clearExplanation} className={styles.confirmLine} />
            <div className={styles.confirmActions}>
              <ActionPill variant="ink" onClick={confirmClear}>
                {dataLabels.confirmClear}
              </ActionPill>
              <ActionPill variant="outlined" onClick={() => setPanel("none")}>
                {dataLabels.cancel}
              </ActionPill>
            </div>
          </div>
        ) : (
          <ActionPill
            variant="outlined"
            full
            disabled={storageBlocked}
            onClick={() => setPanel("clear")}
          >
            {dataLabels.clearBrowserData}
          </ActionPill>
        )}
      </div>

      <DataText content={clearingFootnote} className={styles.footnote} />
      <div className={styles.footnoteAddition}>
        <DataText content={clearingSurvives} className={styles.footnote} />
        <a className={styles.footnoteLink} href={dataLabels.cookiesHref}>
          {dataLabels.cookiesLinkLabel} →
        </a>
      </div>
    </>
  );
}
