"use client";

import { progressLabels, rulebookAsText, type RulebookEntry } from "@/content/watch-your-step/progress";
import { ActionPill } from "@/components/ui/ActionPill";

/**
 * The learner's rulebook, as a plain-text file (WYS §16, §35).
 *
 * ONE DEFINITION, TWO SURFACES. Progress draws the export under the rulebook
 * and the Stop H terminal surface draws it again as the thing the learner
 * leaves with (plan Phase 7, "rulebook export + a labelled empty slot"). Those
 * are two presentations of one node (§6.8), so the download itself lives here
 * rather than being written twice — a second copy is how the two screens end up
 * exporting two different shapes of the same file.
 *
 * CLIENT-SIDE ONLY, AND THAT IS THE POINT. There is no server copy of a
 * rulebook to request: the rules live in `wys:v1` in this browser and nowhere
 * else, so the file is built from local state, handed to the browser, and the
 * object URL is revoked immediately. No request is made, and none could be.
 *
 * WHAT GOES IN THE FILE. `rulebookAsText` decides — the learner's own lines,
 * one per line, and nothing else: no header this build wrote, no Ben framing,
 * no ids, no timestamps. It is unit-tested rather than eyeballed, because the
 * drawn footnote "Export as text any time" has to be true in architecture (R8).
 */
export function downloadRulebook(rulebook: readonly RulebookEntry[]): void {
  if (typeof document === "undefined") return;
  const blob = new Blob([rulebookAsText(rulebook)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = progressLabels.exportFileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * The button, so the label and the disabled rule are also single-definition.
 *
 * Disabled on an empty rulebook rather than hidden: an empty state that removes
 * its own control leaves the learner unable to tell whether the feature exists.
 */
export function RulebookExportButton({
  rulebook,
  variant = "outlined"
}: {
  rulebook: readonly RulebookEntry[];
  variant?: "outlined" | "ink";
}) {
  return (
    <ActionPill
      variant={variant}
      disabled={rulebook.length === 0}
      onClick={() => downloadRulebook(rulebook)}
    >
      {progressLabels.exportRulebook}
    </ActionPill>
  );
}
