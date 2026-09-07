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

/**
 * `repo-code` is added in Phase 11. The legal refresh is the first content
 * that cites a SHIPPED MODULE as its authority rather than a document: §8b.1's
 * rule is that every claim traces to one definition and one line of shipped
 * code, and a claim sourced to "the serializer" with no way to say which file
 * is a claim with no checkable source at all.
 */
export type ExternalSourceRefKind =
  | "spec"
  | "artboard"
  | "packet"
  | "repo-page"
  | "repo-doc"
  | "repo-code"
  | "tf-package";

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
  { id: "wys-spec-3-5", kind: "spec", locator: "WYS §3.5 — non-goals" },
  { id: "wys-spec-4", kind: "spec", locator: "WYS §4 — audience; the 13+ design test, and do not collect exact age" },
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
  { id: "wys-spec-22", kind: "spec", locator: "WYS §22 — future coach, schema only, disabled in v0" },
  { id: "wys-spec-23", kind: "spec", locator: "WYS §23 — provenance UI" },
  { id: "wys-spec-24", kind: "spec", locator: "WYS §24 — mixed-media disclosure curriculum" },
  { id: "wys-spec-25", kind: "spec", locator: "WYS §25 — over-withholding must be taught" },
  { id: "wys-spec-26", kind: "spec", locator: "WYS §26 — external authority" },
  { id: "wys-spec-27", kind: "spec", locator: "WYS §27 — accessibility" },
  { id: "wys-spec-28", kind: "spec", locator: "WYS §28 — performance; no AI SDK, chat SDK or auth SDK in the v0 bundle" },
  { id: "wys-spec-30", kind: "spec", locator: "WYS §30 — first-party aggregate telemetry endpoint; build only on an existing persistence layer" },
  { id: "wys-spec-32", kind: "spec", locator: "WYS §32 — public risk / launch restraint" },
  { id: "wys-spec-34", kind: "spec", locator: "WYS §34 — stop conditions; fix the architecture, not the copy" },
  { id: "wys-spec-35", kind: "spec", locator: "WYS §35 — open Ben content decisions" },
  { id: "wys-spec-36", kind: "spec", locator: "WYS §36 — content authoring templates" },

  /* The approved artboards — design_handoff_bct_facelift/BCT Face Lift.dc.html */
  { id: "artboard-4a-hero", kind: "artboard", locator: "4a desktop hero, badge/H1/lead/CTA row, dc.html:326-331" },
  { id: "artboard-4a-hero-mobile", kind: "artboard", locator: "4a phone hero, badge/H1/lead/try-line, dc.html:435-440" },
  { id: "artboard-4a-hero-demo", kind: "artboard", locator: "4a desktop hero demo card, dc.html:333-359" },
  { id: "artboard-4a-instructor-band-mobile", kind: "artboard", locator: "4a phone instructor pill, dc.html:461-464" },
  { id: "artboard-4a-stop-peek-mobile", kind: "artboard", locator: "4a phone stop peek row, dc.html:465-471" },
  { id: "artboard-4a-four-moves", kind: "artboard", locator: "4a Watch/Try/Judge/Carry block, dc.html:393-406" },
  { id: "artboard-4a-anti-features", kind: "artboard", locator: "4a what you will not find here, dc.html:407-414" },
  { id: "artboard-4a-anti-features-mobile", kind: "artboard", locator: "4a phone struck pill row, dc.html:472" },
  { id: "artboard-4a-data-link-mobile", kind: "artboard", locator: "4a phone data link row, dc.html:474" },
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
  { id: "app-cookies-page", kind: "repo-page", locator: "app/cookies/page.tsx, preserved verbatim" },
  { id: "app-terms-page", kind: "repo-page", locator: "app/terms/page.tsx, preserved verbatim" },
  { id: "app-copyright-page", kind: "repo-page", locator: "app/copyright/page.tsx, preserved verbatim" },
  { id: "app-accessibility-page", kind: "repo-page", locator: "app/accessibility/page.tsx, preserved verbatim" },
  { id: "app-ai-disclosure-page", kind: "repo-page", locator: "app/ai-disclosure/page.tsx, preserved verbatim" },
  { id: "docs-legal-analytics", kind: "repo-doc", locator: "docs/legal-analytics.md" },
  { id: "docs-facelift-unapproved", kind: "repo-doc", locator: "docs/facelift-unapproved.md — the NEW/unapproved register and the Q23 contrast table" },
  { id: "repo-intent-router", kind: "repo-page", locator: "components/IntentRouter.tsx — Capture / Why / Why-Not / Commit" },

  /* Shipped modules cited as the authority for a legal claim (Phase 11, §8b.1) */
  { id: "code-wys-local-state", kind: "repo-code", locator: "lib/wys/local-state.ts — the wys:v1 schema, the serializer and clearAllWysData()" },
  { id: "code-wys-browser-keys", kind: "repo-code", locator: "lib/wys/browser-keys.ts — BROWSER_KEYS, the two keys this site writes" },
  { id: "code-wys-telemetry", kind: "repo-code", locator: "lib/wys/telemetry.ts — WYS_EVENT_NAMES, WYS_PROPERTY_KEYS, the consent gate in trackWys" },
  { id: "code-wys-aggregate", kind: "repo-code", locator: "lib/wys/aggregate.ts — AGGREGATE_ENDPOINT is null and no app/api route exists" },
  { id: "code-wys-config", kind: "repo-code", locator: "content/watch-your-step/config.ts — WYS_AGGREGATE_ENABLED is false" },
  { id: "code-content-status", kind: "repo-code", locator: "lib/content-status.ts — the provenance label table and the two-axis render policy" },
  { id: "code-approval-state", kind: "repo-code", locator: "lib/approval-state.ts — approvalState.stamp and disclosureApprovalLine()" },
  { id: "code-globals-css", kind: "repo-code", locator: "app/globals.css — :focus-visible, .skip-link, the 44px targets and the reduced-motion block" },
  { id: "code-wys-artifacts", kind: "repo-code", locator: "content/watch-your-step/types.ts + content/watch-your-step/artifacts.ts — accessibilityText is non-optional and the bank is empty" },
  { id: "code-wys-rulebook", kind: "repo-code", locator: "lib/wys/local-state.ts rulebook[] — learner-owned free text, never sent" },
  {
    id: "code-wys-scenarios",
    kind: "repo-code",
    locator:
      "content/watch-your-step/scenarios.ts + content/watch-your-step/types.ts — every scenario carries a FICTIONAL_AUTHORED origin and renders under its fictional label"
  },
  {
    id: "code-wys-no-scores",
    kind: "repo-code",
    locator:
      "lib/wys/local-state.ts WYS_DECLARED_KEYS — the declared schema has no score, streak, percentage or grade field, so the serializer cannot persist one"
  },
  /* ---------------------------------------------------------------------- */
  /* Trust Forward Lite — the 2026-09-07 handoff (plan §7).                   */
  /*                                                                          */
  /* `tf-package` is added in the Trust Forward phase. Every locator carries  */
  /* the artifact's SHA-256 from the handoff's own manifest, because these    */
  /* are the first sources this repo cites that live in a versioned bundle    */
  /* outside it: a filename alone cannot distinguish the layer-07 ruling from */
  /* the edited-in-place copy that shipped with layer 08, and one of those    */
  /* two really did change between handoffs.                                  */
  /* ---------------------------------------------------------------------- */
  {
    id: "tf-cases-verbatim",
    kind: "tf-package",
    locator:
      "06_full-five-case-authoring-extraction/FULL_FIVE_CASES_ALL_TEXT_OPTIONS_VERBATIM.md — the complete five-case prior authoring (digest declared in content/trust-forward/digests.ts)"
  },
  {
    id: "tf-signal-map",
    kind: "tf-package",
    locator:
      "03_codex-completion-handoff/recovered/fixed-answer-signal-map.recovered.json — 138 recovered posture tags (digest declared in content/trust-forward/digests.ts)"
  },
  {
    id: "tf-variant-composition",
    kind: "tf-package",
    locator:
      "03_codex-completion-handoff/recovered/55-variant-composition-spec.recovered.json — the 27 world-state fragments (digest declared in content/trust-forward/digests.ts)"
  },
  {
    id: "tf-receipt-drafts",
    kind: "tf-package",
    locator:
      "03_codex-completion-handoff/drafts/33-receipt-phrases.MARKED_DRAFT.json — 33 implementation-authored receipts (digest declared in content/trust-forward/digests.ts)"
  },
  {
    id: "tf-729-narratives",
    kind: "tf-package",
    locator:
      "04_reviewed-implementation-plan/recovered/trust_forward_lite_729_profiles_SHIP_recalculated.csv — the recovered terminal narratives (digest declared in content/trust-forward/digests.ts)"
  },
  {
    id: "tf-aggregation-policy",
    kind: "tf-package",
    locator:
      "05_ship16-reachability-resolution/SHIP16_AGGREGATION_POLICY.v1.json — TF-LITE-AGGREGATION-DOMINANT-POSTURE-LATER-TIEBREAK-v1, proven 16/16 SHIP reachable over all 177147 sequences"
  },
  {
    id: "tf-sc-tf1-approval",
    kind: "tf-package",
    locator:
      "06_full-five-case-authoring-extraction/SC_TF1_APPROVAL_RECORD_2026-09-07.md — Ben approves the 27 fragments, the callback/close/cross-case surfaces and the 729 narratives for public render; the 33 receipts are excluded"
  },
  {
    id: "tf-layer07-rulings",
    kind: "tf-package",
    locator:
      "07_transition-copy-import-telemetry-resolution/BEN_APPROVED_RULINGS_2026-09-07.md — transitions, Case 5 callbacks, five reflections, receipt invariant, public copy, routes, WYS, telemetry, Lite-to-Full import, v1.1.0"
  },
  {
    id: "tf-layer08-rulings",
    kind: "tf-package",
    locator:
      "08_final-lite-gates-resolution/LAYER08_RULINGS.md — Q-D Case 3 VERIFY_TRUST neutral, Q-E aggregate ships disabled, SC-TF6 Studio URL authority"
  },
  {
    id: "tf-supersession-42",
    kind: "tf-package",
    locator:
      "02_read-last-supersession/CORPUS_COUNT_42_SUPERSESSION.json — internal corpus authority 42; superseded for learner-facing copy by layer 07's \"30+ real cases\""
  }
] as const satisfies readonly ExternalSourceRef[];

export const EXTERNAL_SOURCE_REF_IDS: readonly string[] = externalSourceRefs.map((ref) => ref.id);

export function isExternalSourceRef(id: string): boolean {
  return EXTERNAL_SOURCE_REF_IDS.includes(id);
}
