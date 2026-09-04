#!/usr/bin/env node
/**
 * Primitives preview (plan Phase 4, §4.8, §4.9, using the §6.11 mechanism).
 *
 * A SCRIPT DUMP, NOT A ROUTE. §6.11's build-now default keeps preview tooling
 * out of `app/` entirely: a page that returns null still yields a prerendered,
 * publicly reachable URL, still pulls its imports into the production build
 * graph, and still inflates the Phase 0 prerendered-route regression floor with
 * a route that should never deploy.
 *
 * This renders the REAL components (via react-dom/server, already a runtime
 * dependency) with the REAL stylesheets inlined, at both canonical widths —
 * 1280 desktop and 390 mobile — so §4.9's "recreate pixel-close" fidelity target
 * can actually be checked. Nothing is copied by hand, so the preview cannot
 * drift from the components.
 *
 * Usage:
 *   node scripts/preview-primitives.mjs                 # HTML to stdout
 *   node scripts/preview-primitives.mjs --out FILE      # HTML to a file
 *   node scripts/preview-primitives.mjs --list          # inventory only
 *
 * The repo already depends on `tsx` (devDependency, used by `npm test`), so this
 * re-executes itself under that loader rather than adding a dependency.
 */

import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const selfPath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(selfPath), "..");

if (process.env.BCT_PREVIEW_TSX !== "1") {
  const result = spawnSync(process.execPath, ["--import", "tsx", selfPath, ...process.argv.slice(2)], {
    stdio: "inherit",
    env: { ...process.env, BCT_PREVIEW_TSX: "1" }
  });
  process.exit(result.status ?? 1);
}

const { registerCssModuleHooks } = await import("./css-module-hooks.mjs");
registerCssModuleHooks();

const React = (await import("react")).default;
const { createElement: h, Fragment } = React;
const { renderToStaticMarkup } = await import("react-dom/server");

/**
 * `tsconfig.json` sets `"jsx": "preserve"` for the Next compiler and is
 * byte-frozen (plan §3.2), so `tsx` transforms the components' JSX with the
 * CLASSIC runtime and their compiled output references a bare `React`. Next
 * supplies that automatic runtime in a real build; this dev-only script has to
 * put it on the global itself. Nothing outside this process is affected.
 */
globalThis.React = React;

const { provenanceLabelFor, renderPolicyFor } = await import("../lib/content-status.ts");

const { Pill } = await import("../components/ui/Pill.tsx");
const { ActionPill } = await import("../components/ui/ActionPill.tsx");
const { StruckPill } = await import("../components/ui/StruckPill.tsx");
const { ChoiceRow, ChoiceList } = await import("../components/ui/ChoiceRow.tsx");
const { CardShell, CardHeader } = await import("../components/ui/CardShell.tsx");
const { PlayDisc } = await import("../components/ui/PlayDisc.tsx");
const { LinkRow } = await import("../components/ui/LinkRow.tsx");
const { KvRow, KvList } = await import("../components/ui/KvRow.tsx");
const { SectionEyebrow } = await import("../components/ui/SectionEyebrow.tsx");
const { StatCard, StatGrid } = await import("../components/ui/StatCard.tsx");
const { ProgressRail } = await import("../components/ui/ProgressRail.tsx");
const { GridTile, GridTiles } = await import("../components/ui/GridTile.tsx");
const { BottomNav } = await import("../components/ui/BottomNav.tsx");

const { PhasePills } = await import("../components/wys/PhasePills.tsx");
const { StopCard, StopStrip } = await import("../components/wys/StopCard.tsx");
const { NumberedOrderCard, OrderList } = await import("../components/wys/NumberedOrderCard.tsx");
const { LogEntryCard } = await import("../components/wys/LogEntryCard.tsx");
const { DistributionBars } = await import("../components/wys/DistributionBars.tsx");
const { JudgmentCard } = await import("../components/wys/JudgmentCard.tsx");
const { AudioSlotPill } = await import("../components/wys/AudioSlotPill.tsx");

const { ProvenanceMono } = await import("../components/provenance/ProvenanceMono.tsx");
const { ProvenanceLabel } = await import("../components/provenance/ProvenanceLabel.tsx");
const { DraftMark } = await import("../components/provenance/DraftMark.tsx");
const { BenSlot } = await import("../components/provenance/BenSlot.tsx");
const { DashedSlot } = await import("../components/provenance/DashedSlot.tsx");
const { MediaSlot } = await import("../components/provenance/MediaSlot.tsx");

/* -------------------------------------------------------------------------- */
/* The specimen set. Every variant the plan's §4.8 inventory names.            */
/* -------------------------------------------------------------------------- */

const judgmentObject = {
  surfaceKind: "judgment",
  origin: "AI_SYNTHESIS",
  status: "draft"
};
const judgmentPolicy = renderPolicyFor(judgmentObject);
const judgmentLabel = provenanceLabelFor("judgment", "AI_SYNTHESIS");

const specimens = [
  ["Pill · status", h(Pill, { variant: "status" }, "Try one · fictional · nothing about you")],
  ["Pill · draft", h(Pill, { variant: "draft" }, "Standing Orders · draft")],
  ["Pill · white", h(Pill, { variant: "white" }, "Order 03")],
  ["Pill · onMedia", h(Pill, { variant: "onMedia" }, "Ben source · video · 6:40")],
  ["Pill · outlined", h(Pill, { variant: "outlined", size: "sm" }, "approval pending")],
  ["ActionPill · ink", h(ActionPill, { variant: "ink" }, "Start Lesson Zero · 5 min")],
  ["ActionPill · teal", h(ActionPill, { variant: "teal" }, "Keep going — Lesson Zero")],
  ["ActionPill · outlined", h(ActionPill, { variant: "outlined", meta: "· keeps rulebook" }, "Restart the course")],
  ["ActionPill · disabled (Q17 ink/25% pair)", h(ActionPill, { disabled: true }, "Commit — then see Ben's take")],
  ["ActionPill · full width", h(ActionPill, { variant: "ink", full: true }, "Show my plan")],
  [
    "StruckPill · desktop (8 labels)",
    h(StruckPill, {
      labels: [
        "A chatbot",
        "An account",
        "Your email",
        "A streak",
        "A certificate",
        "A privacy score",
        "Anything to unlock",
        '"AI you can trust"'
      ]
    })
  ],
  [
    "ChoiceRow · rest / selected / grey fill (Q18, non-reflowing)",
    h(
      ChoiceList,
      null,
      h(ChoiceRow, { letter: "A", key: "a" }, "Keep everything — context makes the rewrite better"),
      h(ChoiceRow, { letter: "B", selected: true, key: "b" }, "Keep the tone and the reason; drop the name and the total"),
      h(ChoiceRow, { letter: "C", fill: "grey", key: "c" }, "Strip every specific and ask for a generic decline")
    )
  ],
  [
    "CardShell · live decision surface (the `4a` demo card)",
    h(
      CardShell,
      { fill: "live", size: "demo" },
      h(CardHeader, {
        left: h(Pill, { variant: "status" }, "Try one · fictional · nothing about you"),
        right: "Lesson Zero, question 1"
      }),
      h("div", null, "A fictional coworker asks AI to soften a message declining a client meeting.")
    )
  ],
  ["CardShell · ink", h(CardShell, { fill: "ink" }, "AI can crew the ship. It can't sign the logbook.")],
  ["CardShell · teal", h(CardShell, { fill: "teal" }, "Carry · then leave")],
  ["CardShell · grey", h(CardShell, { fill: "grey" }, "How others answered")],
  ["CardShell · dashed", h(CardShell, { fill: "dashed" }, "the end")],
  ["PlayDisc · 56 / 40", h(Fragment, null, h(PlayDisc, { key: "l" }), h(PlayDisc, { size: "sm", key: "s" }))],
  ["LinkRow", h(LinkRow, { href: "#", size: "lg" }, "See what this site knows about you")],
  [
    "KvRow · filled / outlined / bare",
    h(
      KvList,
      null,
      h(KvRow, { label: "Onboarding", value: "done", key: "1" }),
      h(KvRow, { label: "I crop screenshots before I upload them.", value: "", variant: "outlined", key: "2" }),
      h(KvRow, { label: "Rulebook", value: "2 rules", variant: "bare", key: "3" })
    )
  ],
  [
    "SectionEyebrow · desktop / mobile",
    h(
      Fragment,
      null,
      h(SectionEyebrow, { key: "d" }, "Every visit, the same four moves"),
      h(SectionEyebrow, { breakpoint: "mobile", key: "m" }, "YOUR RULEBOOK · YOURS, NOT BEN'S")
    )
  ],
  [
    "StatCard",
    h(
      StatGrid,
      null,
      h(StatCard, { value: 1, denominator: "of 9", label: "stops completed", key: "1" }),
      h(StatCard, { value: 4, label: "judgments committed", key: "2" })
    )
  ],
  ["ProgressRail · 2 of 10", h(ProgressRail, { step: 2, total: 10, label: "Lesson Zero progress" })],
  [
    "GridTile",
    h(
      GridTiles,
      null,
      h(GridTile, { title: "YY Method", meta: "v2.3 · the keel", key: "1" }),
      h(GridTile, { title: "Watch Your Step", meta: "this site", current: true, key: "2" }),
      h(GridTile, { title: "Studio", meta: "rented laboratory (unlinked — Q5)", key: "3" })
    )
  ],
  ["PhasePills", h(PhasePills, { active: "Watch" })],
  [
    "StopCard · four state fills",
    h(
      StopStrip,
      { layout: "peek" },
      h(StopCard, { meta: "Lesson 0 · 5 min", title: "Start With Distrust", state: "lesson", key: "0" }),
      h(StopCard, { meta: "A · 3 visits", title: "Task Before Prompt", state: "current", key: "a" }),
      h(StopCard, { meta: "B · 3 visits", title: "Minimum Necessary ≠ Minimum Possible", key: "b" }),
      h(StopCard, { meta: "H · the end", title: "Your Rules. Exit.", state: "terminal", key: "h" })
    )
  ],
  [
    "NumberedOrderCard",
    h(
      OrderList,
      null,
      h(NumberedOrderCard, {
        number: "01",
        title: "Human judgment stays authoritative.",
        gloss: "AI may execute; only Ben signs.",
        lead: true,
        key: "1"
      }),
      h(NumberedOrderCard, { number: "02", title: "Deterministic before probabilistic.", key: "2" })
    )
  ],
  [
    "LogEntryCard",
    h(
      LogEntryCard,
      { date: "3 Sep 2026", status: "approval pending", title: "Watch Your Step moved to website-first", orderTags: ["Order 03", "Order 04"] },
      "De-escalated from a Studio AI Coach launch to a self-serve, no-account course on this site."
    )
  ],
  [
    "DistributionBars · bars + strip (caption is not optional)",
    h(
      Fragment,
      null,
      h(DistributionBars, {
        key: "bars",
        slices: [
          { letter: "A", percent: 18 },
          { letter: "B", percent: 61 },
          { letter: "C", percent: 21 }
        ],
        caption: "Example numbers — live totals appear once the first-party counter is on."
      }),
      h(DistributionBars, {
        key: "strip",
        layout: "strip",
        slices: [
          { letter: "A", percent: 18 },
          { letter: "B", percent: 61 },
          { letter: "C", percent: 21 }
        ],
        caption: "Example numbers — live totals appear once the first-party counter is on."
      })
    )
  ],
  [
    "JudgmentCard · draft body blocked under RENDER_MARKED_DRAFT=false (Q21)",
    h(JudgmentCard, {
      surfaceTitle: "BEN'S JUDGMENT",
      origin: "AI_SYNTHESIS",
      slotState: "slot awaiting Ben",
      chose: "B",
      content: { policy: judgmentPolicy, text: "", label: judgmentLabel }
    })
  ],
  [
    "AudioSlotPill",
    h(AudioSlotPill, { title: "Hear Ben, 60 seconds", sub: "Ben source · slot awaiting selection", tone: "onLight" })
  ],
  ["ProvenanceMono · 11 / 12", h(Fragment, null, h(ProvenanceMono, { key: "a" }, "key: wys:v1 · raw JSON ↓"), h(ProvenanceMono, { size: "12", key: "b" }, "stamp: not yet stamped · governed by YY Method v2.3"))],
  [
    "ProvenanceLabel · computed, never typed",
    h(ProvenanceLabel, {
      surfaceKind: "fictional-scenario",
      origin: "FICTIONAL_AUTHORED",
      label: provenanceLabelFor("fictional-scenario", "FICTIONAL_AUTHORED")
    })
  ],
  ["DraftMark · default / scenario", h(Fragment, null, h(DraftMark, { variant: "default", key: "d" }), h(DraftMark, { variant: "scenario", key: "s" }))],
  ["BenSlot", h(BenSlot, { label: "BEN'S POSITION · SLOT", awaitedAsset: "Awaiting Ben. No draft AI text is shown here, by rule." })],
  ["DashedSlot · empty", h(DashedSlot, { label: "+ Add a rule", awaitedAsset: "Stored here only. Export as text any time.", variant: "empty" })],
  [
    "MediaSlot · block + disc (never an image)",
    h(
      Fragment,
      null,
      h(MediaSlot, { key: "b", label: "Ben source · video · 6:40", awaitedAsset: "slot: Ben-selected recording", medium: "video", tone: "light", height: 196 }),
      h(MediaSlot, { key: "d", label: "portrait", awaitedAsset: "Ben-supplied photo", medium: "image", shape: "disc", width: 72, height: 72 })
    )
  ],
  [
    "BottomNav · course-internal only",
    h(BottomNav, {
      activeHref: "#today",
      items: [
        { href: "#today", label: "Today" },
        { href: "#plan", label: "Plan" },
        { href: "#progress", label: "Progress" },
        { href: "#practice", label: "Practice" },
        { href: "#data", label: "Data" }
      ]
    })
  ]
];

if (process.argv.includes("--list")) {
  console.log("Primitive inventory (plan §4.8) — " + specimens.length + " specimen groups");
  for (const [name] of specimens) console.log("  · " + name);
  process.exit(0);
}

/* -------------------------------------------------------------------------- */
/* Render                                                                      */
/* -------------------------------------------------------------------------- */

const sheets = [
  "app/globals.css",
  "components/ui/primitives.module.css",
  "components/wys/wys-primitives.module.css",
  "components/provenance/provenance.module.css"
]
  .map((file) => "/* " + file + " */\n" + readFileSync(path.join(repoRoot, file), "utf8"))
  .join("\n\n");

function column(width, note) {
  return (
    '<section class="preview-col" style="width:' +
    width +
    'px">' +
    '<h2 class="preview-h">' +
    width +
    "px — " +
    note +
    "</h2>" +
    specimens
      .map(
        ([name, node]) =>
          '<div class="preview-item"><div class="preview-name">' +
          name +
          '</div><div class="preview-stage">' +
          renderToStaticMarkup(node) +
          "</div></div>"
      )
      .join("") +
    "</section>"
  );
}

const html =
  "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\">" +
  '<meta name="viewport" content="width=device-width,initial-scale=1">' +
  "<title>BCT primitives preview</title>" +
  '<link rel="preconnect" href="https://fonts.googleapis.com">' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap">' +
  "<style>\n" +
  /* The preview stands in for next/font, which only runs inside the Next build.
     This stylesheet link exists HERE and nowhere else — app/globals.css has no
     @import, which is the point of §4.3. */
  ":root{--font-plex-sans:'IBM Plex Sans';--font-plex-mono:'IBM Plex Mono';}\n" +
  sheets +
  "\n.preview-page{display:flex;gap:48px;align-items:flex-start;padding:32px;background:#e9edf1}" +
  ".preview-col{background:#fff;border-radius:12px;padding:24px}" +
  ".preview-h{font:600 15px/1.2 var(--sans);margin:0 0 24px;color:var(--muted)}" +
  ".preview-item{margin-bottom:28px}" +
  ".preview-name{font:400 11px/1.6 var(--mono);color:var(--muted);margin-bottom:8px}" +
  ".preview-stage{position:relative}" +
  "</style></head><body>" +
  '<div class="preview-page">' +
  column(1280, "desktop") +
  column(390, "mobile canonical") +
  "</div></body></html>";

const outFlag = process.argv.indexOf("--out");
if (outFlag !== -1 && process.argv[outFlag + 1]) {
  const target = path.resolve(process.cwd(), process.argv[outFlag + 1]);
  writeFileSync(target, html);
  console.error("wrote " + target);
} else {
  process.stdout.write(html);
}
