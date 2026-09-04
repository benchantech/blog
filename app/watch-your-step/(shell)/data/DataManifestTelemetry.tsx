"use client";

import { useEffect } from "react";
import { trackWys } from "@/lib/wys/telemetry";

/**
 * `wys_data_manifest_view` (plan Phase 8; WYS §19.4).
 *
 * `lib/wys/telemetry.ts`'s own decision table names the firing point —
 * "/watch-your-step/data first render per session" — and states the exposure:
 * "The event name and route_type. Never the contents of the page, which are the
 * learner's own state." So the call carries `route_type` and NOTHING ELSE.
 * Nothing about which rows had values, how many rules the learner has written,
 * or whether they opened the raw JSON is available to send, because none of it
 * is ever passed here — and `trackWys` would drop it if it were (§8.2).
 *
 * ONCE PER SESSION, WITH NO NEW STORAGE KEY. The guard is a module-level
 * boolean, exactly as `components/wys/StopStartTelemetry.tsx` uses a
 * module-level `Set`: it survives client-side navigation between course
 * screens, and a `sessionStorage` flag would be more precise across reloads and
 * would ALSO be a third browser key — one this very page would then have to
 * list. Making the Data page's own key list longer in order to make a
 * diagnostic count slightly more precise is the wrong trade.
 *
 * `trackWys` refuses to send at all unless `bct_analytics_consent === "granted"`
 * (Q7), so a visitor who declined analytics produces no request from this
 * component — which is also why card 2's approved sentence renders only for a
 * browser that granted them.
 *
 * WHY THE EVENT IS DISCLOSED ON THE PAGE IT COUNTS. The decision row's own
 * judgment is "fire it, and disclose it on that same page". Card 2's event
 * register lists `wys_data_manifest_view` beside every other allowlisted event,
 * so counting a visit to the transparency page is itself visible on it.
 *
 * It renders nothing.
 */

let viewed = false;

export function DataManifestTelemetry() {
  useEffect(() => {
    if (viewed) return;
    viewed = true;
    trackWys("wys_data_manifest_view", { route_type: "course" });
  }, []);

  return null;
}
