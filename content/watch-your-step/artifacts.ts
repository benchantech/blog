/**
 * Fictional artifacts (WYS §8.7, §24, §27) — the TYPE, and a deliberately EMPTY
 * BANK.
 *
 * Source Period C is the mixed-media stop: screenshots, documents, spreadsheets,
 * photographs, recordings. Those are image and audio production, not text, and
 * plan §13.1 lists them as awaiting Ben. So the bank ships empty and stop C
 * renders "not yet available" rather than an invented screenshot — inventing
 * one would put a fabricated artifact on a page whose entire subject is what
 * files disclose.
 *
 * The empty array is not a stub. `WysFictionalArtifact` is fully typed with
 * §24's twelve containers (see `types.ts`), `accessibilityText` and
 * `generationProvenance` are NON-OPTIONAL so no artifact can ever land without
 * a text alternative or a record of how it was made, and
 * `tests/wys-content.test.ts` enforces both the moment a first record exists.
 * (WYS §27): a text alternative "must preserve the relevant decision problem
 * without leaking the answer."
 *
 * Every scenario in the bank carries no `artifactIds`, so nothing references a
 * record that is not here.
 */

import type { AnyCanonicalText } from "@/lib/canonical-text";
import type { WysFictionalArtifact } from "./types";

/**
 * Empty on purpose. When the first artifact lands it needs: a `type` from the
 * twelve, the `scenarioId` it belongs to, what is intentionally included and
 * intentionally irrelevant, which fields look sensitive, which can be removed,
 * which must remain, the hidden metadata or inference clues, an
 * `accessibilityText` that does not leak the answer, and a
 * `generationProvenance` saying exactly how the asset was produced.
 */
export const wysFictionalArtifacts = [] as const satisfies readonly WysFictionalArtifact[];

/** What Source Period C shows while the bank is empty. Build language, not a claim. */
export const ARTIFACT_BANK_EMPTY_REASON =
  "Fictional artifacts for this stop need image and audio production, and none has been made yet.";

/**
 * The reusable judgment pattern (WYS §24), defined once.
 *
 * It is the through-line of the whole mixed-media stop and it appears on more
 * than one surface, so it is a canonical record rather than a screen string
 * (Standing Order 07). Verbatim from the spec, hence `BEN_APPROVED` — the same
 * mapping `content/claims.ts` established in Phase 1 for spec-verbatim copy.
 */
export const disclosureContainerPatternText = {
  id: "disclosure-container-pattern",
  surfaceKind: "general",
  status: "published",
  origin: "BEN_APPROVED",
  sourceIds: ["wys-spec-24"],
  variantSources: {
    short: ["wys-spec-24"],
    full: ["wys-spec-24"],
    machine: ["wys-spec-24"]
  },
  variants: {
    short: "Inspect → narrow/extract/trim/crop → anonymize → upload only if allowed",
    full: [
      "Inspect → narrow/extract/trim/crop → anonymize → upload only if allowed",
      "",
      "Crop only the relevant region of a screenshot.",
      "Export a small table rather than an entire workbook.",
      "Copy one paragraph rather than upload a whole PDF.",
      "Remove hidden identifiers from a fictional document.",
      "Transcribe only the useful sentence from a fictional audio clip."
    ].join("\n"),
    machine: "inspect|narrow-extract-trim-crop|anonymize|upload-only-if-allowed"
  }
} as const satisfies AnyCanonicalText;

/**
 * The v0 restraint that goes with the pattern (WYS §24): "Do not make the user
 * practice on their own real sensitive file in v0. Use fictional artifacts."
 *
 * PROVENANCE, corrected at the Phase 6 gate. §24's two sentences are
 * instructions to the build; they are not learner-facing copy, and no approved
 * artboard draws a learner-facing form of them. The two strings below were
 * therefore AUTHORED BY THIS BUILD, so they cannot carry `origin:
 * "BEN_APPROVED"` — that label means "approved by Ben", and Ben has not seen
 * these words. They ship at `draft` / `IMPLEMENTATION_PLACEHOLDER`, which under
 * the ratified `RENDER_MARKED_DRAFT === false` means they do not render
 * publicly at all, and they are on the Final-copy escalation list
 * (docs/facelift-unapproved.md §H). The pinned pill "Fictional · nothing about
 * you" in `copy.ts` is the artboard-verbatim string a surface can render today.
 */
export const fictionalOnlyText = {
  id: "fictional-artifacts-only",
  surfaceKind: "general",
  status: "draft",
  origin: "IMPLEMENTATION_PLACEHOLDER",
  sourceIds: ["wys-spec-24"],
  variants: {
    inline: "Every exercise here is fictional. Nothing asks you to use your own material.",
    full: "Every exercise here is fictional. Nothing asks you to use your own material, and there is nowhere on this site to upload a file.",
    machine: "practice-material=fictional-only; upload=none"
  }
} as const satisfies AnyCanonicalText;

export const artifactCanonicalRecords: readonly AnyCanonicalText[] = [
  disclosureContainerPatternText,
  fictionalOnlyText
];
