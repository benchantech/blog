/**
 * Content-integrity digests for the Trust Forward Lite handoff (plan §7).
 *
 * A SECOND DECLARED HOME, NOT A LOOSENING OF THE RULE.
 *
 * `tests/canonical-text.test.ts` fails the build on any 64-hex string anywhere
 * in `content/`, `lib/`, `app/` or `components/` that is not declared in a
 * registry, because `approvalState.keel.sha256` is null and (packet: hashing)
 * forbids citing a governance digest before Ben publishes one. That check does
 * not distinguish a fabricated keel hash from a real file digest by looking at
 * it — nothing can — so it distinguishes them by DECLARATION.
 *
 * `content/watch-your-step/sources.ts` was the only declared home while the
 * only content digest was the raw voice corpus. Trust Forward needs digests for
 * a different reason and they cannot honestly live in a Watch Your Step module,
 * so this is a second home with the SAME obligations, not a weaker one: every
 * entry names the artifact, says why it is a content digest rather than a
 * governance digest, and is asserted by the same test.
 *
 * WHY TRUST FORWARD NEEDS THEM AT ALL, when Watch Your Step needed one:
 * every other source this repo cites is either inside the repo or a document
 * that does not change. The Trust Forward rulings are neither. They arrive in a
 * versioned bundle, and between the 2026-09-07 handoffs two files stamped
 * `BEN_APPROVED` were EDITED IN PLACE rather than superseded —
 * `variant-transition-rules` gained the Case 3 fallback and
 * `routes-telemetry-wys` gained the aggregate-scope keys. Both edits were
 * correct. That is precisely the problem: a filename could no longer identify
 * which ruling the build was written against, and a digest can.
 *
 * These identify SOURCE ARTIFACTS OUTSIDE THIS REPOSITORY. None of them is a
 * hash of anything this site publishes, and none renders on any surface.
 *
 * Pure data. No React, no CSS, no component import.
 */

export interface TrustForwardDigest {
  /** The SHA-256, as published in the handoff's own inventory manifest. */
  digest: string;
  /** The artifact, by its path within the handoff bundle. */
  artifact: string;
  /** Why this is a content-integrity digest and not a governance digest. */
  reason: string;
}

export const TRUST_FORWARD_DIGESTS = [
  {
    digest: "d0c861958ac0313cf75abf53c99c3bf35ba9c17ae60605c8ffd92c98afaddc1d",
    artifact: "06_full-five-case-authoring-extraction/FULL_FIVE_CASES_ALL_TEXT_OPTIONS_VERBATIM.md",
    reason:
      "Identifies the exact five-case prior-authoring source the content modules were extracted from. It ships its own .sha256 sidecar, which matches."
  },
  {
    digest: "3ca9cc2bf260ba594c302f0d744c18d34561d82df88f5c68f63df26393c5fa38",
    artifact: "03_codex-completion-handoff/recovered/fixed-answer-signal-map.recovered.json",
    reason:
      "Identifies the 138 recovered posture tags. Nine of them are deliberately non-monotonic, so a silently different revision of this file would change scoring without changing any code."
  },
  {
    digest: "76d509bc6a2b8f81f6da8eae3832d97cb8d4397b096f671b1ba4d21e5f56c2b0",
    artifact: "03_codex-completion-handoff/recovered/55-variant-composition-spec.recovered.json",
    reason: "Identifies the 27 authored world-state fragments the 55 variants compose from."
  },
  {
    digest: "e1d6875aa5494e9509d849ee3cb9d2367f18367f0fd900b4ab99c3708ccf735c",
    artifact: "03_codex-completion-handoff/drafts/33-receipt-phrases.MARKED_DRAFT.json",
    reason:
      "Identifies the 33 implementation-authored receipt phrases, which are governed by Ben's approved receipt rule rather than by per-string approval."
  },
  {
    digest: "347621843a64642b98f490c598d4ca0bcf50f951425ac5328dc07c566bb7371a",
    artifact: "04_reviewed-implementation-plan/recovered/trust_forward_lite_729_profiles_SHIP_recalculated.csv",
    reason:
      "Identifies the recovered 729 terminal narratives. The build ships 18 composed clauses instead of the 830KB table, and a test asserts those clauses reproduce this artifact's 729 rows byte-exact — that assertion is only meaningful against a pinned artifact."
  }
] as const satisfies readonly TrustForwardDigest[];

export const TRUST_FORWARD_DIGEST_VALUES: readonly string[] = TRUST_FORWARD_DIGESTS.map(
  (entry) => entry.digest
);
