import {
  CANONICAL_SURFACE_GROUP_LABELS,
  CANONICAL_SURFACE_GROUP_ORDER,
  MACHINE_SURFACE_PATHS,
  absoluteUrl,
  surfacesInGroup
} from "@/content/canonical-surfaces";
import { AI_NATIVE_COMPANY } from "@/content/ai-native-company";
import {
  agentBootstrapText,
  historicalSnapshotInstruction
} from "@/content/ship/agent-bootstrap";
import { governedByLineFull, keelHashLine, standingOrdersPill, stampStateLine } from "@/lib/approval-state";

const TITLE = "BenChanTech";

/**
 * `/llms.txt` is a map of current public surfaces, not a corpus dump.
 *
 * The 2026-09-10 AI-native company pivot adds the current mission and operating
 * constraint at the top so a machine reader does not have to infer the company
 * from preserved product-era governance. Canonical content still lives on the
 * human pages; this surface supplies concise routing context plus links.
 */
export function llmsTxt(): string {
  const lines: string[] = [`# ${TITLE}`, ""];

  lines.push(
    "## Current company experiment",
    `- Mission: ${AI_NATIVE_COMPANY.lede}`,
    `- Required AI operating expense: ${AI_NATIVE_COMPANY.costRule.label} — ChatGPT Plus is the only required AI workforce expense for the core public company.`,
    `- Operating principle: ${AI_NATIVE_COMPANY.principle}`,
    `- Canonical human node: ${absoluteUrl("/")}`,
    ""
  );

  lines.push("## Agent bootstrap", agentBootstrapText(), "");

  lines.push(
    "## Preserved governance state",
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
