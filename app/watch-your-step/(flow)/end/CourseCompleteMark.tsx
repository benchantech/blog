"use client";

import { useEffect } from "react";
import { WYS_DOMAINS } from "@/content/watch-your-step/domains";
import { CONTENT_VERSION } from "@/content/watch-your-step/version";
import { endLabels } from "@/content/watch-your-step/end";
import { trackWys } from "@/lib/wys/telemetry";
import { visitPositionFor, type VisitCountableStop } from "@/lib/wys/visit";
import { ProvenanceMono } from "@/components/provenance/ProvenanceMono";
import { RulebookExportButton } from "@/components/wys/RulebookExport";
import { useWysState } from "@/components/wys/useWysState";

/**
 * `wys_course_complete`, and the rulebook the learner leaves with.
 *
 * THE EVENT FIRES ON THE STATE, NOT ON THE VISIT. `lib/wys/telemetry.ts`'s
 * decision table says it fires when "Stop H terminal surface reaches its
 * completed state", and the difference matters: firing on arrival would count
 * everyone who opened the URL as having finished a nine-stop course, which is
 * the §31 error — and the plan's completion semantics are explicit that
 * "opening is not completion, scrolling is not completion, time on page is not
 * completion". So the guard is the terminal stop's own derived position, the
 * same `visitPositionFor` Today's counter and Progress's first tile use.
 *
 * ONCE PER LOAD, WITH NO NEW STORAGE KEY. A module-level `Set`, exactly as
 * `components/wys/StopStartTelemetry.tsx` argues at length: a `sessionStorage`
 * flag would be more precise across reloads and would also be an undeclared
 * third browser key, which is the worse trade.
 *
 * WHAT LEAVES THE BROWSER: the event name and `content_version`, and only when
 * `bct_analytics_consent === "granted"` — `trackWys` refuses otherwise. No
 * count of rules, no list of stops, no timing. The rulebook itself never
 * leaves: the export is a client-side blob (`RulebookExport`), because there is
 * no server copy to ask for.
 *
 * HYDRATION (§7.3). The rulebook and the completion state both live in
 * `wys:v1`, so neither may be read during a server render. Until `loaded` the
 * list renders as nothing at all rather than as an empty state that would be
 * wrong for a learner who has written rules and would then correct itself.
 */

const fired = new Set<string>();

export function CourseCompleteMark({
  terminalStop,
  rulebookLabel
}: {
  /** The terminal stop, projected. Null when no stop declares itself terminal. */
  terminalStop: VisitCountableStop | null;
  /** `provenanceLabelFor("general", "LEARNER_OWNED")`, computed on the server. */
  rulebookLabel: string;
}) {
  const { loaded, state } = useWysState(WYS_DOMAINS);
  const complete =
    loaded && terminalStop !== null
      ? visitPositionFor(terminalStop, state.progress, state.onboarding.cadence).complete
      : false;

  useEffect(() => {
    if (!complete || terminalStop === null) return;
    if (fired.has(terminalStop.id)) return;
    fired.add(terminalStop.id);
    trackWys("wys_course_complete", { content_version: CONTENT_VERSION });
  }, [complete, terminalStop]);

  const rulebook = loaded ? state.rulebook : [];

  if (!loaded) return null;

  return (
    <>
      {rulebook.length === 0 ? (
        <p>{endLabels.noRulesYet}</p>
      ) : (
        <ul>
          {rulebook.map((rule) => (
            <li key={rule.id}>{rule.text}</li>
          ))}
        </ul>
      )}
      {/* One provenance line for the whole list, as Progress and Plan both do:
          repeating it per row until it stops being read is not more honest. */}
      <ProvenanceMono>{rulebookLabel}</ProvenanceMono>
      <RulebookExportButton rulebook={rulebook} />
    </>
  );
}
