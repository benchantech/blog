/**
 * Ben's human sources — every one of them a LABELLED EMPTY SLOT (plan §6.4,
 * §13.1; handoff README bucket 2; WYS §11 "Do not invent Ben stories or quotes").
 *
 * (WYS §11): "Ben still needs to select the actual first human sources that
 * anchor these periods." So each record below is a place for a recording, not a
 * recording: `approvedExcerpts` is `[]`, `allowedSurfaces` is `[]`,
 * `localAssetPath` and `canonicalUrl` are absent, and every `title` and
 * `purpose` is written in BUILD LANGUAGE — what the slot is for — never in
 * Ben's voice and never as a description of a recording that does not exist
 * (plan R10).
 *
 * `status: "draft"` with `origin: "BEN_AUTHORED"` is deliberate and it is what
 * makes the slot safe: `renderPolicyFor` returns `blocked` for a Ben origin
 * that is not `published`, so there is no code path that renders any of this as
 * Ben-attributed text. The SLOT UI renders from `components/provenance/*`,
 * whose props cannot accept a body at all.
 *
 * Empty `approvedExcerpts` / `allowedSurfaces` / `principleIds` are permitted
 * here and ONLY here, and every record says why in `emptyReferenceReason` —
 * the Phase 6 exit criterion ("or carry an explicit recorded reason for being
 * empty while Ben's recordings are unselected").
 */

import type { WysSourceAsset } from "./types";

export type WysSourceId =
  | "src-stop-a-recording"
  | "src-stop-b-recording"
  | "src-stop-c-recording"
  | "src-stop-d-recording"
  | "src-stop-e-recording"
  | "src-stop-f-recording"
  | "src-stop-g-recording"
  | "src-stop-h-recording"
  | "src-ben-intro-60s"
  | "src-raw-voice-corpus";

export const WYS_SOURCE_IDS: readonly WysSourceId[] = [
  "src-stop-a-recording",
  "src-stop-b-recording",
  "src-stop-c-recording",
  "src-stop-d-recording",
  "src-stop-e-recording",
  "src-stop-f-recording",
  "src-stop-g-recording",
  "src-stop-h-recording",
  "src-ben-intro-60s",
  "src-raw-voice-corpus"
];

const AWAITING_SELECTION =
  "Ben has not selected the recording for this stop yet (WYS §35 decision 4).";

const NO_EXCERPTS_YET = [
  "There is no recording to excerpt yet, so no timecodes exist to approve.",
  "Excerpts are per-approved-excerpt, never a corpus-wide index (packet: not-a-rag-dump)."
];

/**
 * The raw voice corpus digest (plan §6.12), recorded so that a later claim
 * about WHICH corpus this record stands for is checkable rather than asserted.
 *
 * Declaring it here rather than inline is what lets the stale-governance-hash
 * check stay strict: `tests/canonical-text.test.ts` permits a 64-hex literal
 * only when it is a member of `CONTENT_INTEGRITY_DIGESTS`, only in this file,
 * and only on a record that renders on no surface. Every other 64-hex string in
 * `content/`, `lib/`, `app/` or `components/` still fails the build while
 * `approvalState.keel.sha256` is null.
 */
export const RAW_VOICE_CORPUS_SHA256 =
  "6011511431dadb977d4e29902614c88c3c0faeef904a80e29921835afa08e532";

export interface ContentIntegrityDigest {
  /** The digest itself. */
  digest: string;
  /** The record it belongs to. Must render on no surface. */
  ownerId: WysSourceId;
  /** Why a content digest is not a governance digest. */
  reason: string;
}

/**
 * Every content-integrity digest the repo is allowed to carry. One entry.
 * Adding a second one means answering the same question again in the test.
 */
export const CONTENT_INTEGRITY_DIGESTS = [
  {
    digest: RAW_VOICE_CORPUS_SHA256,
    ownerId: "src-raw-voice-corpus",
    reason:
      "Identifies the transcript file this provenance record stands for. Not the YY Method keel digest, which packet: hashing says may not be cited until Ben publishes it."
  }
] as const satisfies readonly ContentIntegrityDigest[];

/**
 * Eight lettered stops, one primary human source each, plus the standing
 * 60-second introduction the landing page and the Captain's Quarters both point
 * at — ONE record, two presentations (plan §6.8), not two audio files.
 *
 * The count is 9 slots for a course whose engine supports "approximately 8-12
 * source periods without hardcoding a fixed number" (WYS §11). Lesson Zero has
 * no recording and stop F is done off-site; both facts are carried in
 * `weeks.ts`, not asserted here.
 */
export const wysSources = [
  {
    id: "src-stop-a-recording",
    status: "draft",
    origin: "BEN_AUTHORED",
    title: "Stop A primary source — slot",
    medium: "video",
    purpose:
      "Anchors stop A. The learner watches this before any interpretation of it (WYS §9.1 step 3).",
    principleIds: ["prn-task-before-prompt"],
    approvedExcerpts: [],
    doesNotClaim: [
      "That the stop title is Ben's phrasing.",
      "That anything in the surrounding curriculum is quoted from him."
    ],
    allowedSurfaces: [],
    coachParaphrasePolicy: "No paraphrase until Ben approves excerpts and surfaces.",
    emptyReferenceReason: AWAITING_SELECTION
  },
  {
    id: "src-stop-b-recording",
    status: "draft",
    origin: "BEN_AUTHORED",
    title: "Stop B primary source — slot",
    medium: "video",
    purpose: "Anchors stop B, where calibrated disclosure and over-withholding are taught.",
    principleIds: ["prn-minimum-necessary"],
    approvedExcerpts: [],
    doesNotClaim: ["That Ben has ruled on any specific scenario in the bank."],
    allowedSurfaces: [],
    coachParaphrasePolicy: "No paraphrase until Ben approves excerpts and surfaces.",
    emptyReferenceReason: AWAITING_SELECTION
  },
  {
    id: "src-stop-c-recording",
    status: "draft",
    origin: "BEN_AUTHORED",
    title: "Stop C primary source — slot",
    medium: "video",
    purpose: "Anchors stop C, the mixed-media disclosure containers (WYS §24).",
    principleIds: ["prn-hidden-exposure"],
    approvedExcerpts: [],
    doesNotClaim: ["That any fictional artifact in stop C came from Ben."],
    allowedSurfaces: [],
    coachParaphrasePolicy: "No paraphrase until Ben approves excerpts and surfaces.",
    emptyReferenceReason: AWAITING_SELECTION
  },
  {
    id: "src-stop-d-recording",
    status: "draft",
    origin: "BEN_AUTHORED",
    title: "Stop D primary source — slot",
    medium: "video",
    purpose: "Anchors stop D, where capability is separated from authority.",
    principleIds: ["prn-source-before-synthesis"],
    approvedExcerpts: [],
    doesNotClaim: ["That a model's fluency is evidence about its authority."],
    allowedSurfaces: [],
    coachParaphrasePolicy: "No paraphrase until Ben approves excerpts and surfaces.",
    emptyReferenceReason: AWAITING_SELECTION
  },
  {
    id: "src-stop-e-recording",
    status: "draft",
    origin: "BEN_AUTHORED",
    title: "Stop E primary source — slot",
    medium: "video",
    purpose: "Anchors stop E, delegation, verification cost and outside rules.",
    principleIds: ["prn-delegate-then-verify"],
    approvedExcerpts: [],
    doesNotClaim: ["That any employer, client or platform rule is restated correctly here."],
    allowedSurfaces: [],
    coachParaphrasePolicy: "No paraphrase until Ben approves excerpts and surfaces.",
    emptyReferenceReason: AWAITING_SELECTION
  },
  {
    id: "src-stop-f-recording",
    status: "draft",
    origin: "BEN_AUTHORED",
    title: "Stop F primary source — slot",
    medium: "video",
    purpose: "Anchors stop F. The stop itself happens away from the site (WYS §15.2).",
    principleIds: ["prn-retrieve-before-checking"],
    approvedExcerpts: [],
    doesNotClaim: ["That going without AI for a period proves anything on its own."],
    allowedSurfaces: [],
    coachParaphrasePolicy: "No paraphrase until Ben approves excerpts and surfaces.",
    emptyReferenceReason: AWAITING_SELECTION
  },
  {
    id: "src-stop-g-recording",
    status: "draft",
    origin: "BEN_AUTHORED",
    title: "Stop G primary source — slot",
    medium: "video",
    purpose: "Anchors stop G, what systems retain and what correction means.",
    principleIds: ["prn-correction-outranks-inference"],
    approvedExcerpts: [],
    doesNotClaim: ["That any named product's retention behaviour is described here."],
    allowedSurfaces: [],
    coachParaphrasePolicy: "No paraphrase until Ben approves excerpts and surfaces.",
    emptyReferenceReason: AWAITING_SELECTION
  },
  {
    id: "src-stop-h-recording",
    status: "draft",
    origin: "BEN_AUTHORED",
    title: "Stop H primary source — slot",
    medium: "video",
    purpose: "Anchors stop H, where the learner keeps their own rules and leaves.",
    principleIds: ["prn-learner-rules-outrank"],
    approvedExcerpts: [],
    doesNotClaim: ["That finishing the course certifies anything."],
    allowedSurfaces: [],
    coachParaphrasePolicy: "No paraphrase until Ben approves excerpts and surfaces.",
    emptyReferenceReason: AWAITING_SELECTION
  },
  {
    /**
     * The "Hear Ben, 60 seconds" pill. ONE record; the home band, the
     * `/watch-your-step` landing and the Captain's Quarters all render it
     * (plan §6.8 — one definition, many presentations).
     */
    id: "src-ben-intro-60s",
    status: "draft",
    origin: "BEN_AUTHORED",
    title: "Sixty-second introduction — slot",
    medium: "audio",
    purpose: "The instructor-presence pill on the home band, the landing and the quarters.",
    principleIds: [],
    approvedExcerpts: [],
    doesNotClaim: ["That a voice sample is evidence of anything the course teaches."],
    allowedSurfaces: [],
    coachParaphrasePolicy: "No paraphrase. Clone-voice audio may never occupy this slot.",
    emptyReferenceReason:
      "No clip is selected, so it anchors no principle and is allowed on no surface yet."
  },
  {
    /**
     * The raw voice corpus (plan §6.12; packet: corpus front matter).
     *
     * It enters as EXACTLY ONE source asset and nothing else. Do not embed,
     * chunk, index or quote it for any coach, search, retrieval or llms.txt
     * surface. Its own front matter: "It is evidence, not yet doctrine." It
     * contains private health detail, named family members,
     * employer-confidential material, unverified third-party incident
     * retellings, and transcription errors that corrupt Ben's own vocabulary.
     * Ben states on the record that these recordings were not made to be
     * shared, and instructs that anything he claims in them be independently
     * verified before use.
     *
     * THE DIGEST IS RECORDED (plan §6.12), as `RAW_VOICE_CORPUS_SHA256` below.
     * It is a CONTENT-INTEGRITY digest of a transcript — "this record stands
     * for that file and no other" — and it is not the GOVERNANCE digest the
     * stale-hash check exists to police, which is the SHA-256 of the frozen YY
     * Method v2.3 Markdown that Ben has not published yet
     * (`approvalState.keel.sha256`, packet: hashing). The first Phase 6 pass
     * conflated the two and dropped this value; the gate separated them
     * instead. `tests/canonical-text.test.ts` now permits exactly the digests
     * declared in `CONTENT_INTEGRITY_DIGESTS`, only in this file, only on a
     * record whose `allowedSurfaces` is empty, and still fails on a 64-hex
     * string anywhere under `app/`, `components/` or `lib/` — so no digest can
     * reach a rendered surface.
     */
    id: "src-raw-voice-corpus",
    status: "draft",
    origin: "BEN_AUTHORED",
    title: "Raw voice corpus — evidence, not doctrine",
    medium: "transcript",
    purpose:
      "Held as a single provenance record so nothing derived from it can be cited without one.",
    principleIds: [],
    approvedExcerpts: [],
    doesNotClaim: [
      "That anything in it is Ben's settled position.",
      "That its transcription is accurate.",
      "That it may be summarised, indexed or retrieved from."
    ],
    allowedSurfaces: [],
    hash: RAW_VOICE_CORPUS_SHA256,
    coachParaphrasePolicy:
      "Paraphrase forbidden. No embedding, chunking, indexing, retrieval or summary, by any surface.",
    historicalStatus: "Evidence held for review. Never a source of record until Ben approves an excerpt.",
    emptyReferenceReason:
      "Nothing in it is approved, so it anchors no principle and is allowed on no surface."
  }
] as const satisfies readonly WysSourceAsset[];

export function wysSourceById(id: WysSourceId): WysSourceAsset {
  const record = wysSources.find((source) => source.id === id);
  if (!record) throw new Error(`No WYS source asset with id "${id}".`);
  return record;
}

/** Why every source carries an empty excerpt list, for the preview dump. */
export const WYS_SOURCE_EMPTY_EXCERPT_REASONS: readonly string[] = NO_EXCERPTS_YET;

/* -------------------------------------------------------------------------- */
/* Ben slots that are not source assets                                       */
/* -------------------------------------------------------------------------- */

/**
 * The rest of plan §13.1's list.
 *
 * These are not `WysSourceAsset` records: §8.1's `medium` union has no member
 * for a portrait, and a page's awaiting-Ben region (the Bridge position, the
 * Stop H exit copy, Selected history) is not an asset at all. Modelling them as
 * source assets would have meant widening §8.1's union to make room for things
 * that are not sources — so they are their own small type, shaped to the props
 * `components/provenance/*` already accept (`label` + `awaitedAsset`, and no
 * way to pass a body).
 *
 * `status` / `origin` are carried so `tests/canonical-text.test.ts` sees them
 * like every other content object.
 */
export interface WysBenSlot {
  id: string;
  status: "draft";
  origin: "BEN_AUTHORED";
  /** The on-screen slot label, verbatim from the approved artboards. */
  label: string;
  /** What is being waited for, in build language. */
  awaitedAsset: string;
  kind: "media" | "dashed";
  medium?: "video" | "audio" | "image" | "transcript";
  /** Reserved geometry so the page does not reflow when the asset lands. */
  width?: number;
  height?: number;
  surfaces: readonly string[];
  emptyReferenceReason: string;
}

export const wysBenSlots = [
  {
    id: "slot-today-watch-video",
    status: "draft",
    origin: "BEN_AUTHORED",
    label: "Ben source · video · 6:40",
    awaitedAsset: "slot: Ben-selected recording",
    kind: "media",
    medium: "video",
    height: 196,
    surfaces: ["/watch-your-step/today"],
    emptyReferenceReason: AWAITING_SELECTION
  },
  {
    id: "slot-hear-ben-60s",
    status: "draft",
    origin: "BEN_AUTHORED",
    label: "Hear Ben, 60 seconds",
    awaitedAsset: "Ben source · slot awaiting selection",
    kind: "media",
    medium: "audio",
    surfaces: ["/", "/watch-your-step", "/ben"],
    emptyReferenceReason: AWAITING_SELECTION
  },
  {
    id: "slot-portrait-desktop",
    status: "draft",
    origin: "BEN_AUTHORED",
    label: "portrait — Ben-supplied photo",
    awaitedAsset: "300x340 instructor band portrait",
    kind: "media",
    medium: "image",
    width: 300,
    height: 340,
    surfaces: ["/"],
    emptyReferenceReason: "Ben supplies the photograph; nothing is generated for this slot."
  },
  {
    id: "slot-portrait-mobile-disc",
    status: "draft",
    origin: "BEN_AUTHORED",
    label: "portrait — Ben-supplied photo",
    awaitedAsset: "72px instructor disc on the landing card",
    kind: "media",
    medium: "image",
    width: 72,
    height: 72,
    surfaces: ["/watch-your-step"],
    emptyReferenceReason: "Ben supplies the photograph; nothing is generated for this slot."
  },
  {
    id: "slot-portrait-quarters",
    status: "draft",
    origin: "BEN_AUTHORED",
    label: "portrait — Ben-supplied",
    awaitedAsset: "300px Captain's Quarters hero",
    kind: "media",
    medium: "image",
    height: 300,
    surfaces: ["/ben"],
    emptyReferenceReason: "Ben supplies the photograph; nothing is generated for this slot."
  },
  {
    id: "slot-bridge-position",
    status: "draft",
    origin: "BEN_AUTHORED",
    label: "BEN'S POSITION · SLOT",
    awaitedAsset: "Awaiting Ben. No draft AI text is shown here, by rule.",
    kind: "dashed",
    surfaces: ["/bridge"],
    emptyReferenceReason: "The Bridge states a position only once Ben writes one."
  },
  {
    id: "slot-quarters-selected-history",
    status: "draft",
    origin: "BEN_AUTHORED",
    label: "Selected history",
    awaitedAsset: "career, performances, interviews, milestones — Ben selects each entry",
    kind: "dashed",
    surfaces: ["/ben"],
    emptyReferenceReason: "Nothing is inferred or pulled in automatically (packet: quarters-selection-rule)."
  },
  {
    id: "slot-judgment-header",
    status: "draft",
    origin: "BEN_AUTHORED",
    label: "BEN'S JUDGMENT",
    awaitedAsset: "slot awaiting Ben",
    kind: "dashed",
    surfaces: ["/", "/watch-your-step", "/watch-your-step/today"],
    emptyReferenceReason: "The judgment body shipped beneath it is a placeholder and says so."
  },
  {
    id: "slot-stop-h-exit-copy",
    status: "draft",
    origin: "BEN_AUTHORED",
    label: "BEN'S EXIT NOTE · SLOT",
    awaitedAsset: "what Ben wants to say to someone who has finished and is leaving",
    kind: "dashed",
    surfaces: ["/watch-your-step/end"],
    emptyReferenceReason: "Ben has not written the exit note; nothing stands in for it."
  }
] as const satisfies readonly WysBenSlot[];

export function wysBenSlotById(id: string): WysBenSlot {
  const record = wysBenSlots.find((slot) => slot.id === id);
  if (!record) throw new Error(`No Ben slot with id "${id}".`);
  return record;
}
