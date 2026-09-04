/**
 * `/llms.txt` — the map an agent reads first (plan Phase 9; packet:
 * llms-txt-role, crawl-surfaces).
 *
 * A MAP, NEVER A CORPUS DUMP. The packet's rule is explicit: this file is "a
 * map of current canonical surfaces only — never a corpus dump, never an
 * indiscriminate enumeration of historical alternatives". So it lists URLs and
 * the names those URLs already have in navigation, and it copies no curriculum
 * prose, no scenario, no judgment and no Ben source into itself. A model that
 * wants the words fetches the page, where the provenance label travels with
 * them; a file that inlined the prose would strip every label off it.
 *
 * THE INSTRUCTION IS THE POINT. `agentBootstrapText()` is the packet's own
 * four sentences, stored once in `content/ship/agent-bootstrap.ts` and rendered
 * here, in `AGENTS.md` and in `/author-ship/state.json`. Its fourth sentence is
 * the "historical snapshots must not be treated as current" rule the plan
 * requires this surface to carry, referenced through
 * `historicalSnapshotInstruction()` rather than restated (Standing Order 07).
 *
 * NOTHING IS AUTHORED HERE. Every heading is a pinned group label from
 * `content/canonical-surfaces.ts`; every link label is the name the node
 * already has in `content/nav.ts` or `content/watch-your-step/tabs.ts`.
 *
 * Pure TypeScript, so the test runner can assert its contents directly.
 */

import {
  CANONICAL_SURFACE_GROUP_LABELS,
  CANONICAL_SURFACE_GROUP_ORDER,
  MACHINE_SURFACE_PATHS,
  absoluteUrl,
  surfacesInGroup
} from "@/content/canonical-surfaces";
import {
  agentBootstrapText,
  historicalSnapshotInstruction
} from "@/content/ship/agent-bootstrap";
import { governedByLineFull, keelHashLine, standingOrdersPill, stampStateLine } from "@/lib/approval-state";

/** The site's own name, as the home node is labelled in the roster. */
const TITLE = "BenChanTech";

export function llmsTxt(): string {
  const lines: string[] = [`# ${TITLE}`, ""];

  lines.push(agentBootstrapText(), "");

  /* Governance state, as data. Three lines, all read from approvalState. */
  lines.push(
    `- ${standingOrdersPill()}`,
    `- ${governedByLineFull()}`,
    `- ${keelHashLine()}`,
    `- ${stampStateLine()}`,
    ""
  );

  for (const group of CANONICAL_SURFACE_GROUP_ORDER) {
    const surfaces = surfacesInGroup(group);
    if (surfaces.length === 0) continue;
    lines.push(`## ${CANONICAL_SURFACE_GROUP_LABELS[group]}`);
    for (const surface of surfaces) {
      lines.push(`- [${surface.label}](${absoluteUrl(surface.path)})`);
    }
    lines.push("");
  }

  lines.push(
    "## Superseded material",
    `- ${historicalSnapshotInstruction()}`,
    `- [Ship's Log](${absoluteUrl("/ships-log")})`,
    `- [Author Ship state](${absoluteUrl(MACHINE_SURFACE_PATHS.state)})`,
    ""
  );

  return `${lines.join("\n").trimEnd()}\n`;
}
