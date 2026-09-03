/**
 * Provenance substrate (plan Phase 1, §6.1-§6.3).
 *
 * Pure TypeScript. No JSX, no CSS import, no React, no component import. That
 * is a hard requirement, not a style preference: `package.json` runs the suite
 * as `node --import tsx --test tests/*.test.ts`, and Node cannot load a `.css`
 * specifier, so any module that reaches a stylesheet takes its whole test file
 * down with `ERR_UNKNOWN_FILE_EXTENSION` (plan Phase 0, Q15). The load-bearing
 * provenance logic therefore lives here, rendering-free and unit-tested, and
 * the components that render it are built in Phase 4.
 *
 * The goal of this file: make it structurally impossible for draft or
 * AI-written prose to reach a Ben-authored label.
 */

/* -------------------------------------------------------------------------- */
/* 1. The two enums (§6.1)                                                    */
/* -------------------------------------------------------------------------- */

/** WYS §7, verbatim. */
export type ContentStatus =
  | "draft"
  | "ben_reviewed"
  | "published"
  | "historical"
  | "superseded";

/**
 * WYS §7 lists eight. `IMPLEMENTATION_PLACEHOLDER` is the ninth, required by
 * §7's own "Never do this" rule ("mark origin `AI_SYNTHESIS` or
 * `IMPLEMENTATION_PLACEHOLDER`") and by handoff README bucket 3, even though
 * §7's type listing omits it.
 */
export type ContentOrigin =
  | "BEN_AUTHORED"
  | "BEN_APPROVED"
  | "BEN_AUTHORED_VARIATION"
  | "FICTIONAL_AUTHORED"
  | "AI_ADAPTATION"
  | "AI_SYNTHESIS"
  | "EXTERNAL_SOURCE"
  | "LEARNER_OWNED"
  | "IMPLEMENTATION_PLACEHOLDER";

export const CONTENT_STATUSES: readonly ContentStatus[] = [
  "draft",
  "ben_reviewed",
  "published",
  "historical",
  "superseded"
];

export const CONTENT_ORIGINS: readonly ContentOrigin[] = [
  "BEN_AUTHORED",
  "BEN_APPROVED",
  "BEN_AUTHORED_VARIATION",
  "FICTIONAL_AUTHORED",
  "AI_ADAPTATION",
  "AI_SYNTHESIS",
  "EXTERNAL_SOURCE",
  "LEARNER_OWNED",
  "IMPLEMENTATION_PLACEHOLDER"
];

/**
 * WYS §8.4 narrows `WysJudgment.origin` to include `"INSUFFICIENT_SIGNAL"`,
 * which is an authored result ("Ben has not addressed this closely enough"),
 * not an error state and not a `ContentOrigin`. The label map has to carry it
 * because §23 gives it a string, so it is a distinct union member here.
 */
export type LabelOrigin = ContentOrigin | "INSUFFICIENT_SIGNAL";

/** The three Ben origins. Only these may ever resolve to `canon` (§6.2 rule 1). */
export const BEN_ORIGINS: readonly ContentOrigin[] = [
  "BEN_AUTHORED",
  "BEN_APPROVED",
  "BEN_AUTHORED_VARIATION"
];

export function isBenOrigin(origin: LabelOrigin): boolean {
  return (BEN_ORIGINS as readonly string[]).includes(origin);
}

/* -------------------------------------------------------------------------- */
/* 2. Provenance labels (§6.3, WYS §23)                                       */
/* -------------------------------------------------------------------------- */

/**
 * WYS §23 groups its seven strings BY SURFACE KIND, not by origin, so the
 * label is `(surfaceKind, origin) => string` and never `origin` alone.
 *
 * `general` is an addition this build makes and reports: §23 names only the
 * three surfaces below it, but `WysRitual`, `WysCarry`, principle bodies, the
 * claim records and the ship prose all render publicly and all need a label.
 * See docs/facelift-build-notes.md.
 */
export type SurfaceKind = "human-source" | "fictional-scenario" | "judgment" | "general";

export const SURFACE_KINDS: readonly SurfaceKind[] = [
  "human-source",
  "fictional-scenario",
  "judgment",
  "general"
];

declare const provenanceLabelBrand: unique symbol;

/**
 * A provenance label string that `provenanceLabelFor()` produced.
 *
 * The brand is the mechanism behind §6.2's "the label must be structurally
 * inseparable from the body": a component prop typed `ProvenanceLabel` cannot
 * be satisfied by a hand-typed string literal, so `JudgmentCard`'s header
 * label is COMPUTED from `origin` and can never be a hardcoded
 * "BEN'S JUDGMENT".
 */
export type ProvenanceLabel = string & { readonly [provenanceLabelBrand]: true };

/**
 * The label table.
 *
 * Rows 1-7 are verbatim WYS §23. The five strings marked NEW are copy this
 * build authored because §23 supplies none for those origins and the `marked`
 * policy needs all of them; a provenance label is a claim about who wrote
 * something, so each one is on the Final-copy escalation list for Ben's stamp
 * (plan §6.3, §8b.4, Q1). Do not reword one here — escalate it.
 *
 * Totality (§6.3): a `(surfaceKind, origin)` pair either maps to a string in
 * this table or is a COMPILE ERROR at the call site. There is no fallback
 * string and no empty render. Pairs are absent deliberately, not by oversight:
 * `BEN_AUTHORED_VARIATION` exists only on `fictional-scenario` because WYS
 * §8.6 narrows `WysCanonicalVariant.origin` to variants of a scenario, and
 * `INSUFFICIENT_SIGNAL` exists only on `judgment` because WYS §8.4 is the only
 * type that admits it.
 */
const PROVENANCE_LABELS = {
  "human-source": {
    BEN_AUTHORED: "Ben source",
    BEN_APPROVED: "Approved by Ben", // NEW
    EXTERNAL_SOURCE: "External source — not Ben's words", // NEW
    IMPLEMENTATION_PLACEHOLDER: "Implementation placeholder — not Ben's words" // NEW
  },
  "fictional-scenario": {
    FICTIONAL_AUTHORED: "Fictional practice scenario — authored for Watch Your Step",
    BEN_AUTHORED: "Ben-authored fictional scenario",
    BEN_AUTHORED_VARIATION: "Ben-authored fictional scenario",
    BEN_APPROVED: "Approved by Ben", // NEW
    AI_ADAPTATION: "AI adaptation based on Ben's supplied principles",
    AI_SYNTHESIS: "Drafted during implementation — not Ben's words", // NEW
    IMPLEMENTATION_PLACEHOLDER: "Implementation placeholder — not Ben's words" // NEW
  },
  judgment: {
    BEN_AUTHORED: "Ben's authored judgment",
    BEN_APPROVED: "Approved by Ben", // NEW
    AI_SYNTHESIS: "Coach synthesis based on Ben sources",
    INSUFFICIENT_SIGNAL: "Ben has not addressed this closely enough",
    IMPLEMENTATION_PLACEHOLDER: "Implementation placeholder — not Ben's words" // NEW
  },
  general: {
    BEN_AUTHORED: "Ben source",
    BEN_APPROVED: "Approved by Ben", // NEW
    FICTIONAL_AUTHORED: "Fictional practice scenario — authored for Watch Your Step",
    AI_ADAPTATION: "AI adaptation based on Ben's supplied principles",
    AI_SYNTHESIS: "Drafted during implementation — not Ben's words", // NEW
    EXTERNAL_SOURCE: "External source — not Ben's words", // NEW
    LEARNER_OWNED: "Yours. Stored in this browser only.", // NEW
    IMPLEMENTATION_PLACEHOLDER: "Implementation placeholder — not Ben's words" // NEW
  }
} as const satisfies Record<SurfaceKind, Partial<Record<LabelOrigin, string>>>;

/** The five label strings this build authored. They need Ben's stamp. */
export const NEW_PROVENANCE_LABELS: readonly string[] = [
  "Implementation placeholder — not Ben's words",
  "Drafted during implementation — not Ben's words",
  "External source — not Ben's words",
  "Yours. Stored in this browser only.",
  "Approved by Ben"
];

/** The origins that carry a label on a given surface kind. */
export type OriginFor<K extends SurfaceKind> = keyof (typeof PROVENANCE_LABELS)[K] & LabelOrigin;

/**
 * The `(surfaceKind, origin) -> label` mapping (§6.3).
 *
 * Total by construction: an unmapped pair does not type-check. The runtime
 * throw exists for callers that reach this from untyped JavaScript (the
 * preview script, a JSON fixture) — a missing mapping is a build failure, not
 * a blank label.
 */
export function provenanceLabelFor<K extends SurfaceKind>(
  surfaceKind: K,
  origin: OriginFor<K>
): ProvenanceLabel {
  const row = PROVENANCE_LABELS[surfaceKind] as Partial<Record<LabelOrigin, string>> | undefined;
  const label = row?.[origin as LabelOrigin];
  if (!label) {
    throw new Error(`No provenance label for surface "${surfaceKind}" and origin "${origin}".`);
  }
  return label as ProvenanceLabel;
}

/** Every declared pair, for the totality test and the preview dump. */
export function provenanceLabelPairs(): { surfaceKind: SurfaceKind; origin: LabelOrigin; label: string }[] {
  const pairs: { surfaceKind: SurfaceKind; origin: LabelOrigin; label: string }[] = [];
  for (const surfaceKind of SURFACE_KINDS) {
    const row = PROVENANCE_LABELS[surfaceKind] as Record<string, string>;
    for (const origin of Object.keys(row)) {
      pairs.push({ surfaceKind, origin: origin as LabelOrigin, label: row[origin] });
    }
  }
  return pairs;
}

/** True when `(surfaceKind, origin)` has a declared label. */
export function hasProvenanceLabel(surfaceKind: SurfaceKind, origin: LabelOrigin): boolean {
  const row = PROVENANCE_LABELS[surfaceKind] as Record<string, string> | undefined;
  return Boolean(row && row[origin]);
}

/* -------------------------------------------------------------------------- */
/* 3. Draft marks (§6.3, the mono lines in the approved artboards)            */
/* -------------------------------------------------------------------------- */

export type DraftMarkVariant = "default" | "scenario";

/**
 * Verbatim from the approved artboards. R9: the `4a` phone omits the default
 * mark that the desktop carries; that omission is a defect, not a design, so
 * the mark renders on BOTH breakpoints.
 */
const DRAFT_MARKS = {
  default: "draft · implementation placeholder · not Ben's words",
  scenario: "scenario: draft · implementation placeholder"
} as const satisfies Record<DraftMarkVariant, string>;

export const DRAFT_MARK_VARIANTS: readonly DraftMarkVariant[] = ["default", "scenario"];

export function draftMarkFor(variant: DraftMarkVariant): string {
  return DRAFT_MARKS[variant];
}

/** §6.2 rule 2: AI_* and IMPLEMENTATION_PLACEHOLDER need a DraftMark as well as a label. */
export function requiresDraftMark(origin: LabelOrigin): boolean {
  return origin === "AI_SYNTHESIS" || origin === "AI_ADAPTATION" || origin === "IMPLEMENTATION_PLACEHOLDER";
}

/* -------------------------------------------------------------------------- */
/* 4. The render policy is TWO-AXIS, not one boolean (§6.2)                   */
/* -------------------------------------------------------------------------- */

/**
 * Q13, ratified at its build-now default: production renders `published` only.
 * WYS §7 makes `ben_reviewed` Ben's explicit choice, so this stays false until
 * he makes it. Typed `boolean`, not the literal `false`, so flipping it is one
 * character and no comparison anywhere narrows to a dead branch.
 */
export const RENDER_BEN_REVIEWED: boolean = false;

/**
 * Q21, ratified at its build-now default: FALSE, matching WYS §7's literal
 * public-rendering whitelist.
 *
 * The tension, stated exactly as it is (plan §6.2, SC-13): handoff README
 * bucket 3 REQUIRES every fictional scenario, choice label, revealed judgment
 * body, the 18/61/21 split and stop titles A-H to ship at `status: "draft"`,
 * and the approved artboards draw them. But plan R3 says the spec beats the
 * README, and WYS §33 step 25 agrees with the spec ("Populate only
 * verified/published Ben material"). So the two-axis machinery below is built
 * in full — it is the thing that makes the question answerable at all — and
 * this constant decides only what a PRODUCTION VISITOR sees.
 *
 * With it false, bucket-3 content still exists in `content/`, still compiles,
 * still carries its labels, and is visible through the draft preview tooling
 * (`scripts/preview-content.mjs`, §6.11) — it simply is not public. Flipping
 * it to true after Ben rules is one line and no component change.
 *
 * Shipping the public course with draft scenario prose requires Ben's answer
 * to Q21.
 */
export const RENDER_MARKED_DRAFT: boolean = false;

/**
 * Which surface is asking.
 *
 * `public`  — a production route a visitor can reach.
 * `preview` — the development draft preview tooling (§6.11). Never deployed.
 * `archive` — a surface whose whole job is to show superseded material with
 *             its supersession recorded: the Ship's Log (Q25's default adds the
 *             machinery so "every earlier state lives in the Log" is true in
 *             architecture rather than in copy). ADDITION by this build, and an
 *             archive render is `marked`, never `canon` — a superseded position
 *             must never read as a current one.
 */
export type RenderSurface = "public" | "preview" | "archive";

export type RenderPolicy =
  | { kind: "blocked"; reason: string }
  | { kind: "marked"; label: ProvenanceLabel; draftMark: DraftMarkVariant | null }
  | { kind: "canon" };

/** The provenance fields every content object carries. */
export interface ProvenanceFields {
  status: ContentStatus;
  origin: ContentOrigin;
  /** Required on `historical` / `superseded` objects (§6.2 rule 4). */
  supersededBy?: string;
  /** Must be `false` on `historical` / `superseded` objects (§6.2 rule 4). */
  canonical?: boolean;
  /** Per-object approval (§6.6) — so "missing approval" is answerable per record. */
  approvedBy?: string;
  approvedAt?: string;
  standingOrdersVersion?: string;
}

/**
 * A content object as `renderPolicyFor` sees it. `origin` is narrowed by
 * `surfaceKind`, which is what turns an unlabelled pair into a compile error
 * at the call site rather than a blank label at runtime.
 */
export type RenderableObject<K extends SurfaceKind = SurfaceKind> = Omit<ProvenanceFields, "origin"> & {
  surfaceKind: K;
  origin: OriginFor<K>;
};

function blocked(reason: string): RenderPolicy {
  return { kind: "blocked", reason };
}

/** §6.2 rule 4, checked as data rather than trusted. */
export function validateProvenance(obj: {
  status: ContentStatus;
  supersededBy?: string;
  canonical?: boolean;
}): string[] {
  const issues: string[] = [];
  if (obj.status === "historical" || obj.status === "superseded") {
    if (!obj.supersededBy) issues.push(`a "${obj.status}" object must carry supersededBy`);
    if (obj.canonical !== false) issues.push(`a "${obj.status}" object must carry canonical: false`);
  }
  return issues;
}

/**
 * The two-axis render policy (§6.2).
 *
 *  canon   — may render as Ben-attributed.
 *  marked  — renders ONLY with its provenance label (and, for AI_* and
 *            IMPLEMENTATION_PLACEHOLDER, its draft mark).
 *  blocked — must not render at all.
 *
 * Rules, in order:
 *  1. `canon` requires a Ben origin AND `published` (plus `ben_reviewed` iff
 *     RENDER_BEN_REVIEWED).
 *  2. non-Ben origin at `draft` is `marked` only while RENDER_MARKED_DRAFT is
 *     true; otherwise `blocked` in public and `marked` in preview.
 *  3. anything Ben-origin that is not published (or permitted `ben_reviewed`)
 *     is blocked; so is anything historical/superseded reached from a current
 *     surface.
 *  4. a historical/superseded object missing `supersededBy` / `canonical:false`
 *     is blocked everywhere, including the archive.
 */
export function renderPolicyFor<K extends SurfaceKind>(
  obj: RenderableObject<K>,
  surface: RenderSurface = "public"
): RenderPolicy {
  const label = provenanceLabelFor(obj.surfaceKind, obj.origin);
  const draftMark: DraftMarkVariant | null = requiresDraftMark(obj.origin)
    ? obj.surfaceKind === "fictional-scenario"
      ? "scenario"
      : "default"
    : null;

  const issues = validateProvenance(obj);
  if (issues.length > 0) return blocked(issues.join("; "));

  if (obj.status === "historical" || obj.status === "superseded") {
    if (surface === "archive") return { kind: "marked", label, draftMark };
    return blocked(`"${obj.status}" material is not rendered on a current surface`);
  }

  const benReviewedAllowed = RENDER_BEN_REVIEWED || surface === "preview";
  const markedDraftAllowed = RENDER_MARKED_DRAFT || surface === "preview";

  if (isBenOrigin(obj.origin)) {
    if (obj.status === "published") return { kind: "canon" };
    if (obj.status === "ben_reviewed" && benReviewedAllowed) return { kind: "canon" };
    return blocked(
      obj.status === "ben_reviewed"
        ? "ben_reviewed is not rendered while RENDER_BEN_REVIEWED is false (Q13)"
        : "Ben-origin material renders only at published status"
    );
  }

  if (obj.status === "published") return { kind: "marked", label, draftMark };
  if (obj.status === "ben_reviewed" && benReviewedAllowed) return { kind: "marked", label, draftMark };
  if (obj.status === "draft" && markedDraftAllowed) return { kind: "marked", label, draftMark };

  return blocked(
    obj.status === "draft"
      ? "draft material is not public while RENDER_MARKED_DRAFT is false (Q21)"
      : "ben_reviewed is not rendered while RENDER_BEN_REVIEWED is false (Q13)"
  );
}

/** Convenience for callers that only need to know whether to render at all. */
export function isRenderable(policy: RenderPolicy): boolean {
  return policy.kind !== "blocked";
}
