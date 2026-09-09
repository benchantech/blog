/**
 * Developer Forward Lite — the local export surface (plan §6.9; `EXPORT_SPEC.md`).
 *
 * Pure TypeScript. No React, no JSX, no CSS import, no component import — the
 * suite runs as `node --import tsx --test tests/*.test.ts` and Node cannot load
 * a `.css` specifier, so a module that reaches a stylesheet takes its whole
 * test file down with `ERR_UNKNOWN_FILE_EXTENSION`. The same discipline
 * `lib/wys/local-state.ts` and `lib/wys/telemetry.ts` already work under.
 *
 * WHAT THIS MODULE IS. Two artifacts and one gate. The artifacts are a
 * thirteen-part Markdown document and a machine-readable JSON record; the gate
 * is `EXPORT_SPEC.md`'s first sentence — export exists only when Case 5 is
 * reached, every active required decision is answered, and a current SHIP
 * result exists, and "if an edit makes the active path incomplete, hide
 * exports until complete again". That is why every builder here returns `null`
 * rather than a partial document: an export that renders half a run is a file
 * a learner can send to someone, and a greyed-out button is still a button.
 *
 * WHY IT IS A PURE FORMATTER. Everything this module renders is handed to it —
 * the dataset, the resolved active path, the computed result, and the local
 * timestamp. It computes no variants, aggregates no signals, and owns no
 * clock. `pointers.ts` resolves the path, `aggregation.ts` and `scoring.ts`
 * produce the result, and `ledger.ts` owns the timestamp format (local time
 * with a NUMERIC UTC offset and no timezone name — a timezone name is a
 * location signal, and this value travels in the export). A formatter that
 * re-derived any of those would be a second implementation of the scoring
 * system, reachable only through the download button, and it would drift.
 *
 * WHAT IS DELIBERATELY ABSENT FROM THE PUBLIC ARTIFACT. Ben's approved import
 * contract (07_…/lite-full-import-contract.BEN_APPROVED.json) sets
 * `"hiddenNumericScoringInternalsAllowed": false`. So:
 *
 *   - `ShipResult.leans` — the raw 0..1 floats the reducer works in — is NOT
 *     exported. `displayPercents` and `barPercents` ARE, because those are the
 *     two numbers the reveal already shows the learner; the export carries what
 *     the screen carries and not the reducer's working state.
 *   - `Receipt.shipContribution` is NOT exported. It is the internal magnitude
 *     that orders the highlight subset, and the export is ordered by case and
 *     decision instead (see `exportReceipts`).
 *   - The six-dimension terminal state is exported CATEGORICALLY, as postures
 *     ("clarify", "sample", "stewardship"), never as 0 / 0.5 / 1. Ben's
 *     contract accepts "the terminal six-dimensional categorical state" in
 *     those words, and the ternary values are the scoring substrate, not the
 *     state's meaning. `valuePosture` in the shared contract is the only
 *     mapping used, so the export cannot invent a fourth level.
 *
 * WHY `product` EXISTS AND WHERE IT CAME FROM. Full's importer validates
 * `requireRecognizedLiteProduct` fail-closed
 * (02_…/LITE_TO_FULL_IMPORT_SUPERSESSION.json) while `EXPORT_SPEC.md` defines
 * no identity field at all. Layer 04's interface proposal resolves the
 * contradiction with a top-level `product: "developer-forward-lite"`, and layer
 * 07's approved import contract is what makes it safe to ship: Full accepts the
 * eleven fixed choices, the eleven receipts, the five verbatim reflections, the
 * terminal categorical state, the SHIP result, scenario/variant reconstruction
 * state, and provenance/schema/product/version metadata. Without `product` the
 * artifact fails recognition and the whole import is refused, so the field is
 * required, not decorative.
 *
 * `validateLiteExport` IS A LOCAL MIRROR AND PROVES NOTHING ABOUT STUDIO. It
 * re-implements the five fail-closed conditions the supersession names —
 * recognized product, supported export version, Case 5 completion, valid
 * fixed-choice state, deterministic profile consistency — against our own
 * artifact, so a test can show the artifact we generate satisfies the contract
 * as written. It CANNOT show that the real Full importer at
 * `studio.com/benchanviolin/trust-forward` accepts this exact field shape. That
 * remains a release verification item under SC-TF6 / interface QA, exactly as
 * plan §6.9 says, and no test in this repository may be read as evidence for
 * it.
 *
 * NOTHING LEAVES THE BROWSER. Downloads are `Blob` + object URL + `<a
 * download>`, revoked after the click. There is no network call, no share link,
 * no upload, and no server round trip anywhere in this file — plan §12 greps
 * this directory for every request API by name, and finds none. The clipboard summary shows its checkbox list BEFORE the copy,
 * per `EXPORT_SPEC.md`, and when the clipboard API is unavailable it returns
 * the text for a selectable surface instead of failing silently.
 */

import {
  DECISION_IDS,
  DIMENSIONS,
  OPTION_IDS,
  SHIP_AXES,
  caseOfDecision,
  valuePosture,
  type ActivePath,
  type CaseNumber,
  type DecisionId,
  type Dimension,
  type LedgerEvent,
  type LiteDataset,
  type LiteResult,
  type OptionId,
  type Receipt,
  type ShipAxis
} from "@/lib/developer-forward/types";
import { LITE_INTRO, RESULT } from "@/content/developer-forward/copy";
import { SHIP_PROFILES } from "@/content/developer-forward/profiles";
import { VERSION_MANIFEST } from "@/content/developer-forward/stamp/v1-1-0";

/* -------------------------------------------------------------------------- */
/* 1. Identity, schema and labels                                             */
/* -------------------------------------------------------------------------- */

/**
 * The product identity Full's `requireRecognizedLiteProduct` matches on.
 *
 * Frozen. Changing this string invalidates every export a learner has already
 * saved, because recognition is fail-closed and an unrecognized product is
 * refused rather than best-guessed
 * (`"rejectArbitraryJsonInterpretation": true`).
 */
export const LITE_EXPORT_PRODUCT = "developer-forward-lite" as const;

/**
 * The schema of the exported ARTIFACT, which is not the schema of the stored
 * blob (`LiteDataset.schemaVersion`) and not the product version
 * (`VERSION_MANIFEST.appVersion`). Three different numbers with three different
 * lifetimes; `VERSIONING.md` restamps the export schema on its own trigger.
 */
export const LITE_EXPORT_SCHEMA_VERSION = 1 as const;

/**
 * Export schema versions this build's validator accepts.
 *
 * A list rather than an equality test because `VERSIONING.md` keeps old stamps
 * deployable and a learner pinned to an older stamp must still be able to
 * validate their own file. Adding a version here is a deliberate act.
 */
export const SUPPORTED_EXPORT_SCHEMA_VERSIONS: readonly number[] = [1];

/**
 * Export-schema strings from the version manifest that this build recognises.
 *
 * `exportSchemaVersion` is `1.1.0` in the production stamp — `product` identity
 * was added for Full's importer, which is precisely the kind of change
 * `VERSIONING.md` requires a restamp for. `1.0.0` is listed because it remains
 * immutable historical provenance under Ben's version ruling and a file stamped
 * with it is still a real Lite export.
 */
export const SUPPORTED_MANIFEST_EXPORT_SCHEMA_VERSIONS: readonly string[] = ["1.0.0", "1.1.0"];

/**
 * The four public SHIP axis labels.
 *
 * These are the `ship.axes[*].label` values from the handoff config
 * (`01_…/config/developer-forward-lite.v1.json`), governed by the manifest's
 * `shipAxisDefinitionVersion`. They live here rather than in `content/` because
 * `content/developer-forward/` holds no axis-label record: `RESULT.shipExplanation`
 * spells the four names out inside one sentence, and parsing four labels back
 * out of a sentence is exactly the kind of cleverness that breaks silently when
 * the sentence is reworded. They are labels, not prose — one word each, from
 * Ben's own config file. If a stamped axis-definition record is added later,
 * this constant should be replaced by a re-export of it rather than kept in
 * parallel.
 */
export const SHIP_AXIS_LABELS: Record<ShipAxis, string> = {
  S: "Scope",
  H: "Handoff",
  I: "Inspection",
  P: "Partnership"
};

export const SHIP_AXIS_LABEL_PROVENANCE = "ben_canonical" as const;

/** The thirteen Markdown parts, in `EXPORT_SPEC.md`'s exact order. */
export type MarkdownPartKey =
  | "title"
  | "localExportDate"
  | "localHandle"
  | "observedShipResult"
  | "shipLeans"
  | "profileName"
  | "specialAbility"
  | "synthesis"
  | "disclaimer"
  | "receipts"
  | "reflections"
  | "ledger"
  | "versionManifest";

/**
 * The order. A test asserts the emitted parts appear as a strictly increasing
 * subsequence of this list, which is what "exact 13-part order" means once the
 * two optional parts are allowed to be absent.
 */
export const MARKDOWN_PART_KEYS: readonly MarkdownPartKey[] = [
  "title",
  "localExportDate",
  "localHandle",
  "observedShipResult",
  "shipLeans",
  "profileName",
  "specialAbility",
  "synthesis",
  "disclaimer",
  "receipts",
  "reflections",
  "ledger",
  "versionManifest"
];

/** The two parts `EXPORT_SPEC.md` marks optional. Everything else is required. */
export const OPTIONAL_MARKDOWN_PART_KEYS: readonly MarkdownPartKey[] = [
  "localHandle",
  "reflections"
];

/**
 * Section headings for the Markdown document.
 *
 * Each one is `EXPORT_SPEC.md`'s OWN name for that part, capitalized, with the
 * word "optional" dropped where it marks optionality rather than names the
 * section. That rule is the whole of the authoring here, and it exists because
 * the handoff supplies no heading copy for the export anywhere: layer 06's
 * approval covers the final REVEAL screen, and layer 07's approval scope
 * manifest explicitly supersedes layer 06 on "professional-summary/export/
 * import rules", so the reveal's approved headings are not export headings to
 * borrow. Rather than write eleven sentences Ben never wrote, the document
 * labels its parts with the names the specification already gives them. See
 * `TODO_EXPORT_HEADING_COPY`.
 *
 * `title` has no heading: it IS the document title.
 */
export const EXPORT_SECTION_LABELS: Record<Exclude<MarkdownPartKey, "title">, string> = {
  localExportDate: "Local export date",
  localHandle: "Local handle",
  observedShipResult: "Observed SHIP result",
  shipLeans: "Four exact SHIP leans",
  profileName: "Profile name",
  specialAbility: "Special ability",
  synthesis: "Synthesis",
  disclaimer: "Disclaimer",
  receipts: "Active fixed-answer receipts",
  reflections: "Active-path reflections",
  ledger: "Complete immutable local ledger",
  versionManifest: "Machine-readable JSON version manifest"
};

export const EXPORT_SECTION_LABEL_PROVENANCE =
  "implementation_authored_under_ben_approved_rule" as const;

/**
 * There is no Ben-approved heading copy for the export document.
 *
 * `EXPORT_SPEC.md` gives an ordered list of thirteen part NAMES and a JSON
 * shape; it gives no rendered headings, no lead-ins, and no title line.
 * `UX_COPY.md` covers the reveal screen and the two landing states and stops.
 * The approved reveal copy that would otherwise fit — "What you actually
 * wrote" over the reflections block — belongs to the layer-06 final reveal, and
 * layer 07 supersedes layer 06 on export rules, so it is deliberately not
 * imported here.
 *
 * Until export heading copy is authored and approved, `EXPORT_SECTION_LABELS`
 * renders the specification's own part names. This constant exists so that a
 * reader who searches this file for the missing copy finds the reason instead
 * of assuming it was forgotten.
 */
export const TODO_EXPORT_HEADING_COPY = null;

/* -------------------------------------------------------------------------- */
/* 2. The gate                                                                */
/* -------------------------------------------------------------------------- */

/** Why an export is unavailable. Enum keys for a renderer, never learner copy. */
export type ExportLockReason =
  | "case_five_not_reached"
  | "active_decisions_unanswered"
  | "no_result";

export type ExportAvailability =
  | { readonly available: true }
  | { readonly available: false; readonly reasons: readonly ExportLockReason[] };

/**
 * `EXPORT_SPEC.md`'s unlock condition, evaluated as three independent facts.
 *
 * All three are checked even though `ActivePath.complete` implies the second,
 * because `complete` is a claim made by another module and this gate is the
 * last thing standing between an incomplete run and a file the learner can
 * hand to someone. `unanswered` being empty is verified directly, and the
 * reached-cases list is verified to actually contain Case 5 rather than
 * inferred from the number of answers.
 */
export function exportAvailability(
  activePath: ActivePath,
  result: LiteResult | null
): ExportAvailability {
  const reasons: ExportLockReason[] = [];
  if (!activePath.reachedCases.includes(5)) reasons.push("case_five_not_reached");
  if (!activePath.complete || activePath.unanswered.length > 0) {
    reasons.push("active_decisions_unanswered");
  }
  if (result === null || result === undefined) reasons.push("no_result");
  return reasons.length === 0 ? { available: true } : { available: false, reasons };
}

/** Convenience predicate over `exportAvailability`. */
export function isExportUnlocked(activePath: ActivePath, result: LiteResult | null): boolean {
  return exportAvailability(activePath, result).available;
}

/* -------------------------------------------------------------------------- */
/* 3. Input                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Everything an export needs, and nothing it could derive for itself.
 *
 * `exportedAtLocal` is passed in rather than read from a clock so that the
 * builders are pure and byte-reproducible under test, and so that this module
 * never spells the timestamp format a second time. `ledger.ts` owns that
 * format: local time, numeric UTC offset, no timezone name.
 */
export interface LiteExportInput {
  dataset: LiteDataset;
  activePath: ActivePath;
  result: LiteResult | null;
  exportedAtLocal: string;
}

/** One reflection as it appears in an export. Learner-authored, verbatim. */
export interface ExportReflection {
  decisionId: DecisionId;
  caseNumber: CaseNumber;
  /** Exactly as the learner wrote it. Never trimmed, normalised or summarised. */
  text: string;
  /** The commit event's own local timestamp, so Full can preserve it. */
  localTimestamp: string;
  eventId: string;
}

/**
 * The committed reflections that sit on the active path, latest commit per
 * decision, in decision order.
 *
 * Latest-by-`sequence` wins for the same reason `pointers.ts` resolves answers
 * that way: a re-committed reflection supersedes its predecessor in the CURRENT
 * view while both stay in the ledger forever. A reflection is keyed to its
 * decision and not to a variant tuple — reflections never affect routing,
 * scoring, variants, receipts or SHIP (`BEN_APPROVED_RULINGS_2026-09-07.md`),
 * so a changed upstream answer cannot invalidate what the learner wrote about
 * a case they actually saw.
 *
 * An empty-after-trim commit is dropped: it carries no words, and Ben's import
 * contract accepts "5 verbatim reflections" as evidence, not as placeholders.
 * The stored text itself is never trimmed — only the emptiness test is.
 */
export function activePathReflections(
  dataset: LiteDataset,
  activePath: ActivePath
): readonly ExportReflection[] {
  const activeDecisionIds = new Set<DecisionId>(activePath.decisions.map((d) => d.decisionId));
  const latest = new Map<DecisionId, LedgerEvent>();

  for (const event of dataset.ledger) {
    if (event.type !== "reflection_committed") continue;
    if (!event.decisionId || !activeDecisionIds.has(event.decisionId)) continue;
    if (typeof event.text !== "string" || event.text.trim().length === 0) continue;
    const held = latest.get(event.decisionId);
    if (!held || event.sequence > held.sequence) latest.set(event.decisionId, event);
  }

  const ordered: ExportReflection[] = [];
  for (const decisionId of DECISION_IDS) {
    const event = latest.get(decisionId);
    if (!event) continue;
    ordered.push({
      decisionId,
      caseNumber: caseOfDecision(decisionId),
      text: event.text as string,
      localTimestamp: event.localTimestamp,
      eventId: event.eventId
    });
  }
  return ordered;
}

/**
 * The eleven receipts in export order: case, then decision.
 *
 * `receipt-authoring-and-export.BEN_APPROVED.json` sets
 * `"export": { "allDecisionReceipts": true, "count": 11, "order":
 * "case_then_decision" }`. That is a DIFFERENT order from the reveal's
 * highlight list, which sorts by SHIP contribution. The export is a trail, and
 * a trail is read in the order it happened; sorting the file by contribution
 * would rank the learner's own decisions by a number the file is not allowed
 * to contain. `DECISION_IDS` is already in experience order, so the sort is a
 * lookup rather than a comparison.
 */
export function exportReceipts(receipts: readonly Receipt[]): readonly Receipt[] {
  const index = new Map<DecisionId, number>(DECISION_IDS.map((id, i) => [id, i]));
  return [...receipts].sort((a, b) => {
    if (a.caseNumber !== b.caseNumber) return a.caseNumber - b.caseNumber;
    return (index.get(a.decisionId) ?? 0) - (index.get(b.decisionId) ?? 0);
  });
}

/* -------------------------------------------------------------------------- */
/* 4. The JSON artifact                                                       */
/* -------------------------------------------------------------------------- */

/** One resolved axis of a variant, for scenario reconstruction on import. */
export interface ExportVariantAxis {
  axis: string;
  fragmentId: string;
}

/**
 * One fixed choice, with the exact variant it was made against.
 *
 * `variantId` and `variantAxes` are the "scenario/variant reconstruction state"
 * Ben's import contract accepts. Both are present on purpose: the id is the
 * exact-match key Lite restores pointers with, and the axis tuple is what lets
 * a reader reconstruct the scenario without Lite's stamp in hand.
 */
export interface ExportDecision {
  caseNumber: CaseNumber;
  decisionId: DecisionId;
  variantId: string;
  variantAxes: readonly ExportVariantAxis[];
  selectedOptionId: OptionId;
}

/** A receipt as exported: the factual trail, with no scoring magnitude. */
export interface ExportReceipt {
  caseNumber: CaseNumber;
  decisionId: DecisionId;
  optionId: OptionId;
  phrase: string;
}

/** The SHIP result as exported. Public readouts only; no raw leans. */
export interface ExportShip {
  code: string;
  profileKey: string;
  axisLabels: Record<ShipAxis, string>;
  /** Exact percentage to the nearest 0.1 — the reveal's numeric readout. */
  displayPercents: Record<ShipAxis, number>;
  /** Rounded to the nearest 10 — the reveal's two-ended bar. */
  barPercents: Record<ShipAxis, number>;
}

/** The 16-profile body, plus the recovered 729-state terminal narrative. */
export interface ExportProfile {
  key: string;
  code: string;
  name: string;
  specialAbility: string;
  synthesis: string;
  /** The recovered deterministic terminal summary for this exact state. */
  narrative: string;
}

export interface LiteExportCurrent {
  /** Learner-owned, local-only, never scored. Full MUST drop this on import. */
  handle: string | null;
  activePath: {
    reachedCases: readonly CaseNumber[];
    complete: boolean;
    decisions: readonly ExportDecision[];
  };
  ship: ExportShip;
  /** The terminal six-dimensional CATEGORICAL state. Postures, never numbers. */
  dimensionState: Record<Dimension, string>;
  profile: ExportProfile;
  receipts: readonly ExportReceipt[];
  reflections: readonly ExportReflection[];
}

export interface LiteExportJson {
  /** Required. Full's `requireRecognizedLiteProduct` is fail-closed. */
  product: typeof LITE_EXPORT_PRODUCT;
  schemaVersion: number;
  exportedAtLocal: string;
  versionManifest: Record<string, string>;
  current: LiteExportCurrent;
  /** THE COMPLETE LEDGER — superseded and inactive events included. */
  ledger: readonly LedgerEvent[];
}

/**
 * Build the JSON artifact, or `null` when the export is locked.
 *
 * The ledger is copied whole and sorted by `sequence` only. Nothing is filtered:
 * a superseded answer, an abandoned branch, a reflection the learner rewrote,
 * a reset — all of it stays, because `EXPORT_SPEC.md` says "inactive/superseded
 * events remain in full ledger" and because the ledger is the only place the
 * learner's own history of changing their mind survives. `current` is the
 * active view; `ledger` is the record.
 */
export function buildLiteExportJson(input: LiteExportInput): LiteExportJson | null {
  const { dataset, activePath, result, exportedAtLocal } = input;
  if (!isExportUnlocked(activePath, result) || result === null) return null;

  const profile = SHIP_PROFILES[result.profileKey];
  if (!profile) return null;

  const decisions: ExportDecision[] = [];
  for (const decision of activePath.decisions) {
    if (decision.selectedOptionId === null) return null;
    decisions.push({
      caseNumber: decision.caseNumber,
      decisionId: decision.decisionId,
      variantId: decision.variant.id,
      variantAxes: decision.variant.axes.map((axis) => ({
        axis: axis.axis,
        fragmentId: axis.fragmentId
      })),
      selectedOptionId: decision.selectedOptionId
    });
  }

  const dimensionState = {} as Record<Dimension, string>;
  for (const dimension of DIMENSIONS) {
    dimensionState[dimension] = valuePosture(dimension, result.dimensionState[dimension]);
  }

  const ship: ExportShip = {
    code: result.ship.code,
    profileKey: result.ship.profileKey,
    axisLabels: { ...SHIP_AXIS_LABELS },
    displayPercents: { ...result.ship.displayPercents },
    barPercents: { ...result.ship.barPercents }
  };

  return {
    product: LITE_EXPORT_PRODUCT,
    schemaVersion: LITE_EXPORT_SCHEMA_VERSION,
    exportedAtLocal,
    versionManifest: { ...VERSION_MANIFEST },
    current: {
      handle: dataset.handle,
      activePath: {
        reachedCases: [...activePath.reachedCases],
        complete: activePath.complete,
        decisions
      },
      ship,
      dimensionState,
      profile: {
        key: result.profileKey,
        code: profile.code,
        name: profile.name,
        specialAbility: profile.specialAbility,
        synthesis: profile.synthesis,
        narrative: result.narrative
      },
      receipts: exportReceipts(result.receipts).map((receipt) => ({
        caseNumber: receipt.caseNumber,
        decisionId: receipt.decisionId,
        optionId: receipt.optionId,
        phrase: receipt.phrase
      })),
      reflections: activePathReflections(dataset, activePath)
    },
    ledger: [...dataset.ledger].sort((a, b) => a.sequence - b.sequence)
  };
}

/** The JSON artifact as a downloadable string. `null` when locked. */
export function buildLiteExportJsonText(input: LiteExportInput): string | null {
  const json = buildLiteExportJson(input);
  return json === null ? null : `${JSON.stringify(json, null, 2)}\n`;
}

/* -------------------------------------------------------------------------- */
/* 5. The Markdown artifact                                                   */
/* -------------------------------------------------------------------------- */

export interface LiteExportMarkdownPart {
  /** 1-based position in `EXPORT_SPEC.md`'s thirteen-part order. */
  part: number;
  key: MarkdownPartKey;
  /** `null` only for the title, which is its own heading. */
  heading: string | null;
  body: string;
}

/**
 * A fence long enough to contain `text` verbatim.
 *
 * Learner text and a Markdown code fence are on a collision course: a
 * reflection containing three backticks would close a three-backtick block and
 * spill the rest of the document into prose. The fence grows past the longest
 * backtick run in the payload, which is what makes "verbatim" survive contact
 * with the format. Used for reflections and for the ledger block.
 */
function fenceFor(text: string): string {
  let longest = 0;
  for (const run of text.match(/`+/g) ?? []) longest = Math.max(longest, run.length);
  return "`".repeat(Math.max(3, longest + 1));
}

function fenced(text: string, language = ""): string {
  const fence = fenceFor(text);
  return `${fence}${language}\n${text}\n${fence}`;
}

/** `52.5%`. One decimal, always — `EXPORT_SPEC.md`'s "exact" lean. */
function percent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * The Markdown document as its ordered parts.
 *
 * Returned as parts rather than one string so a test can assert the ORDER
 * directly instead of pattern-matching headings out of prose, and so a caller
 * that wants to render the same document as React can do it without reparsing
 * Markdown. `buildLiteExportMarkdown` is the join.
 *
 * Part 8 carries two paragraphs. `EXPORT_SPEC.md`'s thirteen parts are
 * exhaustive and ordered, so this build appends no fourteenth part for the
 * recovered 729-state terminal narrative; instead the narrative sits under
 * "Synthesis" beside the 16-profile `synthesis` field, which is what it is — the
 * same result synthesised at finer granularity, and per plan §6.6 the
 * authoritative profile body. Rendering the profile's one-line synthesis and
 * silently dropping the narrative would export the summary of the summary.
 */
export function buildLiteExportMarkdownParts(
  input: LiteExportInput
): readonly LiteExportMarkdownPart[] | null {
  const { dataset, result, exportedAtLocal } = input;
  const json = buildLiteExportJson(input);
  if (json === null || result === null) return null;

  const profile = json.current.profile;
  const parts: LiteExportMarkdownPart[] = [];
  const push = (key: MarkdownPartKey, body: string): void => {
    parts.push({
      part: MARKDOWN_PART_KEYS.indexOf(key) + 1,
      key,
      heading: key === "title" ? null : EXPORT_SECTION_LABELS[key],
      body
    });
  };

  /* 1. title — the product name, from the intro copy. */
  push("title", `# ${LITE_INTRO.heading}`);

  /* 2. local export date. */
  push("localExportDate", exportedAtLocal);

  /* 3. optional local handle. Absent, not empty, when the learner declined. */
  if (dataset.handle !== null && dataset.handle.trim().length > 0) {
    push("localHandle", dataset.handle);
  }

  /* 4. observed SHIP result. `RESULT.label` is the approved framing: the code
     is a pattern label, and the export never writes "You are SHIP-0111." */
  push("observedShipResult", `${RESULT.label}: ${json.current.ship.code}`);

  /* 5. the four exact SHIP leans, in `SHIP_AXES` order. */
  push(
    "shipLeans",
    SHIP_AXES.map(
      (axis) =>
        `- ${SHIP_AXIS_LABELS[axis]} (${axis}): ${percent(json.current.ship.displayPercents[axis])}`
    ).join("\n")
  );

  /* 6-8. the profile body. */
  push("profileName", profile.name);
  push("specialAbility", profile.specialAbility);
  push("synthesis", `${profile.synthesis}\n\n${profile.narrative}`);

  /* 9. disclaimer. Exported whole and never shortened — the four things SHIP
     is not are the claim, and a truncated disclaimer is not one. */
  push("disclaimer", RESULT.disclaimer);

  /* 10. active fixed-answer receipts, case then decision. */
  push(
    "receipts",
    json.current.receipts
      .map(
        (receipt) =>
          `- **Case ${receipt.caseNumber} · ${receipt.decisionId} · ${receipt.optionId}** — ${receipt.phrase}`
      )
      .join("\n")
  );

  /* 11. optional active-path reflections, verbatim inside a grown fence. */
  if (json.current.reflections.length > 0) {
    push(
      "reflections",
      json.current.reflections
        .map(
          (reflection) =>
            `**Case ${reflection.caseNumber} · ${reflection.decisionId}**\n\n${fenced(reflection.text)}`
        )
        .join("\n\n")
    );
  }

  /* 12. the complete immutable local ledger.

     Fenced JSON rather than a bulleted list. A list would have to flatten or
     escape the newlines inside a learner's reflection text, and "complete" and
     "immutable" stop being true the moment the format edits the payload to fit.
     Superseded and inactive events are all here; `activePath` above is the
     active view and this is the record. */
  push("ledger", fenced(JSON.stringify(json.ledger, null, 2), "json"));

  /* 13. machine-readable JSON version manifest, as the FINAL block.

     `product` and `schemaVersion` ride along inside it so that the Markdown
     document is itself recognisable to a fail-closed reader; a bare manifest
     would identify its versions without identifying what they version. */
  push(
    "versionManifest",
    fenced(
      JSON.stringify(
        {
          product: json.product,
          schemaVersion: json.schemaVersion,
          versionManifest: json.versionManifest
        },
        null,
        2
      ),
      "json"
    )
  );

  return parts;
}

/** The Markdown artifact as one document. `null` when the export is locked. */
export function buildLiteExportMarkdown(input: LiteExportInput): string | null {
  const parts = buildLiteExportMarkdownParts(input);
  if (parts === null) return null;
  return `${parts
    .map((part) => (part.heading === null ? part.body : `## ${part.heading}\n\n${part.body}`))
    .join("\n\n")}\n`;
}

/* -------------------------------------------------------------------------- */
/* 6. The clipboard summary                                                   */
/* -------------------------------------------------------------------------- */

/**
 * The clipboard summary fields.
 *
 * Exactly the list `EXPORT_SPEC.md` names — "handle if present, SHIP code,
 * profile name, special ability, four lean percentages, synthesis, disclaimer"
 * — and nothing else. Receipts, reflections and the ledger are deliberately not
 * offered: the spec does not list them, and a clipboard control that can paste
 * a learner's private writing into a chat window is a different product
 * decision from a summary, not a bigger version of one. Those live in the two
 * download artifacts, which the learner saves rather than pastes.
 */
export type ClipboardSummaryFieldId =
  | "handle"
  | "shipCode"
  | "profileName"
  | "specialAbility"
  | "shipLeans"
  | "synthesis"
  | "disclaimer";

export const CLIPBOARD_SUMMARY_FIELD_IDS: readonly ClipboardSummaryFieldId[] = [
  "handle",
  "shipCode",
  "profileName",
  "specialAbility",
  "shipLeans",
  "synthesis",
  "disclaimer"
];

/** One row of the checkbox list the learner sees BEFORE any copy happens. */
export interface ClipboardSummaryField {
  id: ClipboardSummaryFieldId;
  /** The section label this field corresponds to in the Markdown document. */
  label: string;
  /** `EXPORT_SPEC.md`: every listed field is checked by default. */
  defaultChecked: boolean;
  /** The value that would be copied. Shown so the list is a preview, not a promise. */
  value: string;
}

/**
 * The checkbox list, built from the same artifact the download would produce.
 *
 * `handle` appears only when the learner set one — the spec's "handle if
 * present" is about the row existing, not about a row that copies an empty
 * string. Everything present is `defaultChecked`, per the spec; the control is
 * an opt-OUT, which is the honest default for a list of things the learner is
 * about to paste somewhere themselves.
 */
export function clipboardSummaryFields(
  input: LiteExportInput
): readonly ClipboardSummaryField[] | null {
  const json = buildLiteExportJson(input);
  if (json === null) return null;

  const rows: ClipboardSummaryField[] = [];
  if (json.current.handle !== null && json.current.handle.trim().length > 0) {
    rows.push({
      id: "handle",
      label: EXPORT_SECTION_LABELS.localHandle,
      defaultChecked: true,
      value: json.current.handle
    });
  }
  rows.push(
    {
      id: "shipCode",
      label: EXPORT_SECTION_LABELS.observedShipResult,
      defaultChecked: true,
      value: `${RESULT.label}: ${json.current.ship.code}`
    },
    {
      id: "profileName",
      label: EXPORT_SECTION_LABELS.profileName,
      defaultChecked: true,
      value: json.current.profile.name
    },
    {
      id: "specialAbility",
      label: EXPORT_SECTION_LABELS.specialAbility,
      defaultChecked: true,
      value: json.current.profile.specialAbility
    },
    {
      id: "shipLeans",
      label: EXPORT_SECTION_LABELS.shipLeans,
      defaultChecked: true,
      value: SHIP_AXES.map(
        (axis) =>
          `${SHIP_AXIS_LABELS[axis]} ${percent(json.current.ship.displayPercents[axis])}`
      ).join(" · ")
    },
    {
      id: "synthesis",
      label: EXPORT_SECTION_LABELS.synthesis,
      defaultChecked: true,
      value: json.current.profile.synthesis
    },
    {
      id: "disclaimer",
      label: EXPORT_SECTION_LABELS.disclaimer,
      defaultChecked: true,
      value: RESULT.disclaimer
    }
  );
  return rows;
}

/** Field ids checked when the list first renders. */
export function defaultClipboardSummarySelection(
  input: LiteExportInput
): readonly ClipboardSummaryFieldId[] | null {
  const fields = clipboardSummaryFields(input);
  if (fields === null) return null;
  return fields.filter((field) => field.defaultChecked).map((field) => field.id);
}

/**
 * The summary text for the checked fields, in the spec's field order.
 *
 * Order comes from `CLIPBOARD_SUMMARY_FIELD_IDS`, not from the order the caller
 * happened to collect the checkboxes in, so the same selection always produces
 * the same bytes. An empty selection produces an empty string rather than a
 * document with nothing in it.
 */
export function buildClipboardSummary(
  input: LiteExportInput,
  selected: readonly ClipboardSummaryFieldId[]
): string | null {
  const fields = clipboardSummaryFields(input);
  if (fields === null) return null;
  const chosen = new Set(selected);
  const byId = new Map(fields.map((field) => [field.id, field]));
  return CLIPBOARD_SUMMARY_FIELD_IDS.filter((id) => chosen.has(id) && byId.has(id))
    .map((id) => (byId.get(id) as ClipboardSummaryField).value)
    .join("\n\n");
}

/* -------------------------------------------------------------------------- */
/* 7. Local delivery — download and clipboard                                 */
/* -------------------------------------------------------------------------- */

/**
 * `Blob` + object URL + `<a download>`, revoked after the click.
 *
 * Every browser-touching line is guarded on `typeof window`/`typeof document`
 * and wrapped in `try/catch` and returns `false` on failure, for the reason
 * `lib/wys/local-state.ts` gives: iOS Safari in private browsing throws where
 * other browsers return, and iPhone Safari at ~390 CSS px is the primary QA
 * target. A thrown error inside a click handler is a dead button with no
 * explanation.
 *
 * The object URL is revoked in a `finally`, so a failure between creation and
 * click does not leak the blob for the life of the document. Nothing here
 * requests, uploads or links to anything: the export is a file the learner
 * already has, not a resource anyone else can address.
 */
export function downloadTextFile(filename: string, mimeType: string, text: string): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  let objectUrl: string | null = null;
  try {
    const blob = new Blob([text], { type: mimeType });
    objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.rel = "noopener";
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    return true;
  } catch {
    return false;
  } finally {
    if (objectUrl !== null) {
      try {
        URL.revokeObjectURL(objectUrl);
      } catch {
        /* revocation is best-effort; the download has already been handed over. */
      }
    }
  }
}

/**
 * `developer-forward-lite-2026-09-07.md`.
 *
 * The date comes from `exportedAtLocal`, which already carries a numeric UTC
 * offset and no timezone name. Only the leading `YYYY-MM-DD` is used and only
 * when it matches; anything else falls back to the bare product name rather
 * than putting an unvalidated string into a filename.
 */
export function exportFilename(exportedAtLocal: string, extension: "md" | "json"): string {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(exportedAtLocal);
  return match
    ? `${LITE_EXPORT_PRODUCT}-${match[1]}.${extension}`
    : `${LITE_EXPORT_PRODUCT}.${extension}`;
}

/** Download the Markdown artifact. `false` when locked or when the DOM refuses. */
export function downloadLiteExportMarkdown(input: LiteExportInput): boolean {
  const text = buildLiteExportMarkdown(input);
  if (text === null) return false;
  return downloadTextFile(
    exportFilename(input.exportedAtLocal, "md"),
    "text/markdown;charset=utf-8",
    text
  );
}

/** Download the JSON artifact. `false` when locked or when the DOM refuses. */
export function downloadLiteExportJson(input: LiteExportInput): boolean {
  const text = buildLiteExportJsonText(input);
  if (text === null) return false;
  return downloadTextFile(
    exportFilename(input.exportedAtLocal, "json"),
    "application/json;charset=utf-8",
    text
  );
}

/**
 * Copy, or hand back the text for a selectable surface.
 *
 * `EXPORT_SPEC.md` puts the checkbox list before the copy; this function is
 * what happens after. The clipboard API is absent on insecure origins and in
 * several mobile browsers, and `writeText` rejects when the document is not
 * focused, so the failure is ordinary rather than exceptional. Failing silently
 * would leave the learner believing they had copied something. The `fallback`
 * outcome carries the same text the copy would have carried, so the caller
 * renders a selectable block and the learner copies it by hand.
 */
export type ClipboardOutcome =
  | { readonly status: "copied" }
  | { readonly status: "fallback"; readonly text: string };

export async function copyLiteSummary(text: string): Promise<ClipboardOutcome> {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    return { status: "fallback", text };
  }
  try {
    await navigator.clipboard.writeText(text);
    return { status: "copied" };
  } catch {
    return { status: "fallback", text };
  }
}

/* -------------------------------------------------------------------------- */
/* 8. The local mirror of Full's five fail-closed import conditions           */
/* -------------------------------------------------------------------------- */

/**
 * READ THIS BEFORE TRUSTING A GREEN TEST.
 *
 * `validateLiteExport` is a LOCAL MIRROR of the five conditions
 * `LITE_TO_FULL_IMPORT_SUPERSESSION.json` names. It proves that the artifact
 * this repository generates satisfies the contract AS WRITTEN IN THE HANDOFF.
 * It cannot prove, and must never be cited as proving, that the real Full
 * importer in Studio accepts it — that importer is external code, its field
 * matching is not in this repository, and layer 04 records `product` as an
 * interface PROPOSAL. End-to-end acceptance is a release verification item
 * under SC-TF6 / interface QA.
 *
 * A validator that shares an implementation with the thing it validates proves
 * only that the code agrees with itself, so this one reads the artifact back as
 * `unknown` and re-derives every check from the JSON, exactly as a foreign
 * reader would.
 */
export type LiteImportConditionId =
  | "requireRecognizedLiteProduct"
  | "requireSupportedExportVersion"
  | "requireCase5Completion"
  | "requireValidFixedChoiceState"
  | "requireDeterministicProfileConsistency";

export const LITE_IMPORT_CONDITION_IDS: readonly LiteImportConditionId[] = [
  "requireRecognizedLiteProduct",
  "requireSupportedExportVersion",
  "requireCase5Completion",
  "requireValidFixedChoiceState",
  "requireDeterministicProfileConsistency"
];

export interface LiteExportValidationFailure {
  condition: LiteImportConditionId;
  /** A machine-readable detail key. Diagnostic, never learner-facing copy. */
  detail: string;
}

export interface LiteExportValidation {
  valid: boolean;
  failures: readonly LiteExportValidationFailure[];
  /** Every condition that passed, so a test can assert all five were reached. */
  passed: readonly LiteImportConditionId[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Validate an export artifact against the five fail-closed conditions.
 *
 * Fail-closed means every condition is answered from what is actually present:
 * a missing field fails its condition, it does not skip it. The one condition
 * the supersession itself qualifies is the fifth —
 * `requireDeterministicProfileConsistencyWhenPresent` — and "when present"
 * governs the SHIP block as a whole, not each field inside it; an artifact with
 * a `ship` block and no `profile` block is inconsistent, not exempt.
 */
export function validateLiteExport(candidate: unknown): LiteExportValidation {
  const failures: LiteExportValidationFailure[] = [];
  const fail = (condition: LiteImportConditionId, detail: string): void => {
    failures.push({ condition, detail });
  };

  if (!isRecord(candidate)) {
    for (const condition of LITE_IMPORT_CONDITION_IDS) fail(condition, "not_an_object");
    return { valid: false, failures, passed: [] };
  }

  /* 1. Recognized Lite product. */
  if (candidate.product !== LITE_EXPORT_PRODUCT) {
    fail("requireRecognizedLiteProduct", "product_not_recognized");
  }

  /* 2. Supported export version — both the artifact's own schema number and
        the manifest's `exportSchemaVersion`. A file can carry a schema this
        build reads while being stamped by a product version it does not. */
  const manifest = candidate.versionManifest;
  if (
    typeof candidate.schemaVersion !== "number" ||
    !SUPPORTED_EXPORT_SCHEMA_VERSIONS.includes(candidate.schemaVersion)
  ) {
    fail("requireSupportedExportVersion", "schema_version_unsupported");
  }
  if (!isRecord(manifest)) {
    fail("requireSupportedExportVersion", "version_manifest_missing");
  } else if (
    typeof manifest.exportSchemaVersion !== "string" ||
    !SUPPORTED_MANIFEST_EXPORT_SCHEMA_VERSIONS.includes(manifest.exportSchemaVersion)
  ) {
    fail("requireSupportedExportVersion", "manifest_export_schema_unsupported");
  }

  const current = isRecord(candidate.current) ? candidate.current : null;
  const activePath = current && isRecord(current.activePath) ? current.activePath : null;
  const decisions =
    activePath && Array.isArray(activePath.decisions) ? activePath.decisions : null;

  /* 3. Case 5 completion. */
  if (!activePath || !decisions) {
    fail("requireCase5Completion", "active_path_missing");
  } else {
    if (activePath.complete !== true) fail("requireCase5Completion", "active_path_incomplete");
    const reached = Array.isArray(activePath.reachedCases) ? activePath.reachedCases : [];
    if (!reached.includes(5)) fail("requireCase5Completion", "case_five_not_reached");
    const answered = new Set(
      decisions.filter(isRecord).map((decision) => decision.decisionId as string)
    );
    for (const decisionId of DECISION_IDS) {
      if (!answered.has(decisionId)) {
        fail("requireCase5Completion", `decision_missing:${decisionId}`);
      }
    }
  }

  /* 4. Valid fixed-choice state — eleven decisions, each a declared decision id
        answered with a declared option id against a non-empty variant, no
        duplicates, and eleven receipts that agree with them. */
  if (!decisions) {
    fail("requireValidFixedChoiceState", "decisions_missing");
  } else {
    if (decisions.length !== DECISION_IDS.length) {
      fail("requireValidFixedChoiceState", "decision_count_mismatch");
    }
    const seen = new Set<string>();
    for (const decision of decisions) {
      if (!isRecord(decision)) {
        fail("requireValidFixedChoiceState", "decision_not_an_object");
        continue;
      }
      const decisionId = decision.decisionId;
      if (typeof decisionId !== "string" || !DECISION_IDS.includes(decisionId as DecisionId)) {
        fail("requireValidFixedChoiceState", "decision_id_unknown");
        continue;
      }
      if (seen.has(decisionId)) {
        fail("requireValidFixedChoiceState", `decision_duplicated:${decisionId}`);
      }
      seen.add(decisionId);
      const optionId = decision.selectedOptionId;
      if (typeof optionId !== "string" || !OPTION_IDS.includes(optionId as OptionId)) {
        fail("requireValidFixedChoiceState", `option_invalid:${decisionId}`);
      }
      if (typeof decision.variantId !== "string" || decision.variantId.length === 0) {
        fail("requireValidFixedChoiceState", `variant_missing:${decisionId}`);
      }
    }

    const receipts = current && Array.isArray(current.receipts) ? current.receipts : null;
    if (!receipts) {
      fail("requireValidFixedChoiceState", "receipts_missing");
    } else {
      if (receipts.length !== DECISION_IDS.length) {
        fail("requireValidFixedChoiceState", "receipt_count_mismatch");
      }
      const chosen = new Map<string, unknown>();
      for (const decision of decisions) {
        if (isRecord(decision) && typeof decision.decisionId === "string") {
          chosen.set(decision.decisionId, decision.selectedOptionId);
        }
      }
      for (const receipt of receipts) {
        if (!isRecord(receipt) || typeof receipt.decisionId !== "string") {
          fail("requireValidFixedChoiceState", "receipt_not_an_object");
          continue;
        }
        if (!chosen.has(receipt.decisionId)) {
          fail("requireValidFixedChoiceState", `receipt_off_path:${receipt.decisionId}`);
          continue;
        }
        if (chosen.get(receipt.decisionId) !== receipt.optionId) {
          fail("requireValidFixedChoiceState", `receipt_option_mismatch:${receipt.decisionId}`);
        }
        if (typeof receipt.phrase !== "string" || receipt.phrase.trim().length === 0) {
          fail("requireValidFixedChoiceState", `receipt_phrase_missing:${receipt.decisionId}`);
        }
      }
    }
  }

  /* 5. Deterministic profile consistency.

     Three independent checks, none of which needs the scoring reducer:

       a. the profile body is the stamped body for its key — a file whose
          profile name and key disagree has been edited or mis-assembled;
       b. `code` is `SHIP-` + the four bits, and the bits key the profile;
       c. each bit agrees with its own published percentage.

     (c) is exact rather than approximate. Every dimension value is 0, 0.5 or 1
     and every axis weight is a multiple of 0.05, so every lean is a multiple of
     0.025 and `displayPercents` — `round(lean * 1000) / 10` — represents it
     without loss. The reducer's threshold is `lean > 0.5`, never `>=`, so the
     bit is `displayPercents > 50` with no boundary case: 50.0 is 0 and the next
     reachable value up is 52.5. A validator that recomputed the leans instead
     would be a second copy of `scoring.ts` living inside the export module. */
  const ship = current && isRecord(current.ship) ? current.ship : null;
  const profile = current && isRecord(current.profile) ? current.profile : null;
  if (!ship || !profile) {
    fail("requireDeterministicProfileConsistency", "ship_or_profile_missing");
  } else {
    const profileKey = ship.profileKey;
    if (typeof profileKey !== "string" || !/^[01]{4}$/.test(profileKey)) {
      fail("requireDeterministicProfileConsistency", "profile_key_malformed");
    } else {
      if (ship.code !== `SHIP-${profileKey}`) {
        fail("requireDeterministicProfileConsistency", "ship_code_mismatch");
      }
      if (profile.key !== profileKey) {
        fail("requireDeterministicProfileConsistency", "profile_key_mismatch");
      }
      const stamped = SHIP_PROFILES[profileKey];
      if (!stamped) {
        fail("requireDeterministicProfileConsistency", "profile_key_unknown");
      } else if (
        profile.code !== stamped.code ||
        profile.name !== stamped.name ||
        profile.specialAbility !== stamped.specialAbility ||
        profile.synthesis !== stamped.synthesis
      ) {
        fail("requireDeterministicProfileConsistency", "profile_body_mismatch");
      }

      const display = isRecord(ship.displayPercents) ? ship.displayPercents : null;
      const bars = isRecord(ship.barPercents) ? ship.barPercents : null;
      if (!display || !bars) {
        fail("requireDeterministicProfileConsistency", "ship_percents_missing");
      } else {
        SHIP_AXES.forEach((axis, index) => {
          const value = display[axis];
          const bar = bars[axis];
          if (typeof value !== "number" || Number.isNaN(value) || value < 0 || value > 100) {
            fail("requireDeterministicProfileConsistency", `lean_out_of_range:${axis}`);
            return;
          }
          const expectedBit = value > 50 ? "1" : "0";
          if (profileKey[index] !== expectedBit) {
            fail("requireDeterministicProfileConsistency", `bit_disagrees_with_lean:${axis}`);
          }
          if (typeof bar !== "number" || bar !== Math.round(value / 10) * 10) {
            fail("requireDeterministicProfileConsistency", `bar_percent_inconsistent:${axis}`);
          }
        });
      }
    }

    /* The terminal categorical state must be postures, not numbers — and must
       be a complete six-dimension state. `valuePosture` is the only mapping
       that produced it, so a value it cannot name did not come from Lite. */
    const state = current && isRecord(current.dimensionState) ? current.dimensionState : null;
    if (!state) {
      fail("requireDeterministicProfileConsistency", "dimension_state_missing");
    } else {
      for (const dimension of DIMENSIONS) {
        const posture = state[dimension];
        const declared = [0, 0.5, 1].map((value) =>
          valuePosture(dimension, value as 0 | 0.5 | 1)
        );
        if (typeof posture !== "string" || !declared.includes(posture)) {
          fail("requireDeterministicProfileConsistency", `posture_invalid:${dimension}`);
        }
      }
    }
  }

  const failed = new Set(failures.map((failure) => failure.condition));
  return {
    valid: failures.length === 0,
    failures,
    passed: LITE_IMPORT_CONDITION_IDS.filter((condition) => !failed.has(condition))
  };
}
