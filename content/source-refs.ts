/**
 * The registry of EXTERNAL source references (plan §6.8 check 1, "unresolved
 * component references"; §6.8 check 3, "missing source metadata").
 *
 * Content records cite two kinds of source. Some cite another record in this
 * repo — a `WysSourceAsset`, a principle, a scenario — and those resolve
 * against the module that defines them. The rest cite something OUTSIDE the
 * repo: a section of the governing spec, a region of an approved artboard, a
 * page of the planning packet, a preserved page of the live site. Before this
 * file those were free strings: `content/claims.ts` already cites
 * `"wys-spec-18"` and `"artboard-5c-data-infrastructure"`, and nothing checked
 * that a typo in one of them resolved to anything at all.
 *
 * So they are enumerated here, with what each one points at, and
 * `tests/wys-content.test.ts` fails on a citation that is neither a repo record
 * nor a member of this list. That is the difference between provenance and a
 * habit of writing plausible ids.
 *
 * ADDING ONE is expected as later phases cite more of the sources. Removing one
 * that a record still cites breaks the build, which is the point.
 */

export type ExternalSourceRefKind = "spec" | "artboard" | "packet" | "repo-page" | "repo-doc";

export interface ExternalSourceRef {
  id: string;
  kind: ExternalSourceRefKind;
  /** Where the citation points, precisely enough to check it by hand. */
  locator: string;
}

export const externalSourceRefs = [
  /* The governing spec — /Users/benchan/yy/bct-facelift/WATCH-YOUR-STEP.md */
  { id: "wys-spec-2-2", kind: "spec", locator: "WYS §2.2 — current scope; future concepts disabled and invisible" },
  { id: "wys-spec-3-3", kind: "spec", locator: "WYS §3.3 — core habit" },
  { id: "wys-spec-3-4", kind: "spec", locator: "WYS §3.4 — what anonymization means here" },
  { id: "wys-spec-8", kind: "spec", locator: "WYS §8 — authoring data model" },
  { id: "wys-spec-9-1", kind: "spec", locator: "WYS §9.1 — required onboarding sequence" },
  { id: "wys-spec-9-3", kind: "spec", locator: "WYS §9.3 — Lesson Zero completion condition" },
  { id: "wys-spec-10", kind: "spec", locator: "WYS §10 — daily curriculum contract" },
  { id: "wys-spec-11", kind: "spec", locator: "WYS §11 — provisional curriculum skeleton" },
  { id: "wys-spec-12", kind: "spec", locator: "WYS §12 — plan view and working paths" },
  { id: "wys-spec-13", kind: "spec", locator: "WYS §13 — progress view and completion semantics" },
  { id: "wys-spec-14", kind: "spec", locator: "WYS §14 — practice, replay and the invariant rule" },
  { id: "wys-spec-15-1", kind: "spec", locator: "WYS §15.1 — From Memory" },
  { id: "wys-spec-15-2", kind: "spec", locator: "WYS §15.2 — detox / no-AI practice" },
  { id: "wys-spec-16", kind: "spec", locator: "WYS §16 — learner-owned rulebook" },
  { id: "wys-spec-17", kind: "spec", locator: "WYS §17 — local state" },
  { id: "wys-spec-18", kind: "spec", locator: "WYS §18 — data manifest" },
  { id: "wys-spec-19", kind: "spec", locator: "WYS §19 — analytics / telemetry doctrine" },
  { id: "wys-spec-20", kind: "spec", locator: "WYS §20 — see what this site knows about you" },
  { id: "wys-spec-21", kind: "spec", locator: "WYS §21 — appetite filter" },
  { id: "wys-spec-23", kind: "spec", locator: "WYS §23 — provenance UI" },
  { id: "wys-spec-24", kind: "spec", locator: "WYS §24 — mixed-media disclosure curriculum" },
  { id: "wys-spec-25", kind: "spec", locator: "WYS §25 — over-withholding must be taught" },
  { id: "wys-spec-26", kind: "spec", locator: "WYS §26 — external authority" },
  { id: "wys-spec-27", kind: "spec", locator: "WYS §27 — accessibility" },
  { id: "wys-spec-35", kind: "spec", locator: "WYS §35 — open Ben content decisions" },
  { id: "wys-spec-36", kind: "spec", locator: "WYS §36 — content authoring templates" },

  /* The approved artboards — design_handoff_bct_facelift/BCT Face Lift.dc.html */
  { id: "artboard-4a-hero-demo", kind: "artboard", locator: "4a desktop hero demo card, dc.html:333-359" },
  { id: "artboard-4a-hero-demo-mobile", kind: "artboard", locator: "4a phone hero demo card, dc.html:441-459" },
  { id: "artboard-4a-instructor-band", kind: "artboard", locator: "4a instructor band, dc.html:361-374" },
  { id: "artboard-4a-the-path", kind: "artboard", locator: "4a the path, nine cells, dc.html:378-391" },
  { id: "artboard-4a-disclosure-strip", kind: "artboard", locator: "4a disclosure strip, dc.html:424" },
  { id: "artboard-4a-how-the-site-is-run", kind: "artboard", locator: "4a how the site is run, dc.html:418-421" },
  { id: "artboard-5a-posture", kind: "artboard", locator: "5a step 2, posture, dc.html:19-31" },
  { id: "artboard-5a-posture-footnote", kind: "artboard", locator: "5a step 2 footnote, dc.html:29" },
  { id: "artboard-5a-first-habit", kind: "artboard", locator: "5a step 5, THE FIRST HABIT card, dc.html:38" },
  { id: "artboard-5a-repair-scenario", kind: "artboard", locator: "5a step 5, the leaking-pipe exercise, dc.html:40-48" },
  { id: "artboard-5a-cadence-and-time", kind: "artboard", locator: "5a steps 7-9, cadence, time and data, dc.html:53-70" },
  { id: "artboard-5b-today", kind: "artboard", locator: "5b Today, dc.html:78-96" },
  { id: "artboard-5b-plan", kind: "artboard", locator: "5b Plan, dc.html:99-118" },
  { id: "artboard-5b-progress", kind: "artboard", locator: "5b Progress, dc.html:121-145" },
  { id: "artboard-5b-rulebook-note", kind: "artboard", locator: "5b Progress rulebook note, dc.html:143" },
  { id: "artboard-5c-practice", kind: "artboard", locator: "5c Practice, dc.html:152-176" },
  { id: "artboard-5c-data", kind: "artboard", locator: "5c Data, dc.html:179-207" },
  { id: "artboard-5c-data-card-2", kind: "artboard", locator: "5c Data card 2, BEN MAY RECEIVE, dc.html:194-195" },
  { id: "artboard-5c-data-card-3", kind: "artboard", locator: "5c Data card 3, BEN DOES NOT NEED, dc.html:198" },
  { id: "artboard-5c-data-infrastructure", kind: "artboard", locator: "5c Data infrastructure paragraph, dc.html:201" },
  { id: "artboard-5c-data-footnote", kind: "artboard", locator: "5c Data clearing footnote, dc.html:207" },
  { id: "artboard-5d-bridge", kind: "artboard", locator: "5d Bridge, dc.html:215-235" },
  { id: "artboard-5d-standing-orders", kind: "artboard", locator: "5d Standing Orders, dc.html:237-255" },
  { id: "artboard-5d-ships-log", kind: "artboard", locator: "5d Ship's Log, dc.html:257-283" },
  { id: "artboard-5d-quarters", kind: "artboard", locator: "5d Captain's Quarters, dc.html:285-297" },

  /* The planning packet — BCT_Author_Ship_Master_Planning_Packet_2026-09-03.pdf */
  { id: "packet-one-definition", kind: "packet", locator: "packet: one-definition / Standing Order 07" },
  { id: "packet-captains-stamp", kind: "packet", locator: "packet: Captain's Stamp, five named elements" },
  { id: "packet-crew-manifest", kind: "packet", locator: "packet: Crew Manifest, five fields per system" },
  { id: "packet-quarters-selection-rule", kind: "packet", locator: "packet: quarters-selection-rule" },
  { id: "packet-ships-log", kind: "packet", locator: "packet: Ship's Log, what an entry records" },
  { id: "packet-bridge", kind: "packet", locator: "packet: Bridge, always current" },
  { id: "packet-historical-machine-readable", kind: "packet", locator: "packet: historical-machine-readable — superseded objects carry supersededBy and canonical: false" },
  { id: "packet-corpus", kind: "packet", locator: "packet: raw voice corpus front matter" },
  { id: "packet-hashing", kind: "packet", locator: "packet: hashing — freeze, digest, publish, then cite" },
  { id: "packet-voice-constitution", kind: "packet", locator: "packet: Voice and Reasoning Constitution" },
  { id: "packet-agent-bootstrap", kind: "packet", locator: "packet: agent-bootstrap — the four sentences an agent reads first" },
  { id: "packet-crawl-surfaces", kind: "packet", locator: "packet: crawl-surfaces — sitemap and robots as a map of current canonical surfaces" },
  { id: "packet-llms-txt-role", kind: "packet", locator: "packet: llms-txt-role — a map, never a corpus dump" },
  { id: "packet-state-json", kind: "packet", locator: "packet: state.json — the machine mirror and its key set" },
  { id: "packet-canonical-node", kind: "packet", locator: "packet: canonical-node rule — one canonical human node per concept" },

  /* The live repo */
  { id: "app-privacy-page", kind: "repo-page", locator: "app/privacy/page.tsx, preserved verbatim" },
  { id: "docs-legal-analytics", kind: "repo-doc", locator: "docs/legal-analytics.md" },
  { id: "repo-intent-router", kind: "repo-page", locator: "components/IntentRouter.tsx — Capture / Why / Why-Not / Commit" }
] as const satisfies readonly ExternalSourceRef[];

export const EXTERNAL_SOURCE_REF_IDS: readonly string[] = externalSourceRefs.map((ref) => ref.id);

export function isExternalSourceRef(id: string): boolean {
  return EXTERNAL_SOURCE_REF_IDS.includes(id);
}
