import { BROWSER_KEYS } from "@/lib/wys/browser-keys";
import { dataLabels } from "@/content/watch-your-step/data";
import { ProvenanceMono } from "@/components/provenance/ProvenanceMono";

/**
 * Every browser key this site writes, named on the page (plan §8b.2, §7.5).
 *
 * GENERATED, never hand-maintained. `/privacy` and `/cookies` both have to name
 * both keys, and a hand-typed pair on two pages is three lists to keep in
 * step — so the rows come from `lib/wys/browser-keys.ts`, which is the registry
 * the Data page reads too. A third key added in month three appears on all
 * three surfaces without anyone editing a legal page, which is the only way
 * "both browser keys by name" stays true.
 *
 * The two clear labels come from `content/watch-your-step/data.ts` rather than
 * being restated here: the Data page already names those two states and a
 * second wording would be the drift Standing Order 07 forbids.
 *
 * No `className`, so it inherits `.legal-page p` and the shared mono line. No
 * VALUES are read: this is the list of keys the site can write, which is true
 * at every moment and on the server, not a report on the reader's browser —
 * that report is the Data page's job and needs the browser to answer it.
 */
export function BrowserKeyList() {
  return (
    <>
      {BROWSER_KEYS.map((record) => (
        <div key={record.key}>
          <ProvenanceMono>{record.key}</ProvenanceMono>
          <p>
            {record.holds}
            {" — "}
            {record.clearedByWysClear ? dataLabels.keyClearedByClear : dataLabels.keyKeptByClear}
            {"."}
          </p>
        </div>
      ))}
    </>
  );
}
