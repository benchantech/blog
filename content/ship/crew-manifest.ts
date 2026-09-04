/**
 * The Crew Manifest (packet: Crew Manifest; Standing Order 06).
 *
 * NO ARTBOARD EXISTS FOR THIS PAGE, and it cannot be deferred: the disclosure
 * strip on every page links to it, so a missing manifest is a dead link out of
 * a transparency claim. Phase 9 composes the visual from `5d` primitives and
 * flags it NEW; this module is its content.
 *
 * FIVE FIELDS PER SYSTEM, as the packet names them: what it does · what it can
 * access · what it cannot access · what authority it has · what authority it
 * does not have. All five are REQUIRED by the type, because a manifest with
 * four of them answered is the shape of a disclosure that omits the
 * inconvenient one.
 *
 * The entry for the Claude session that built this site is honest and is listed
 * first. Standing Order 06 is "AI assistance is disclosed. No invisible crew",
 * and the disclosure strip already says AI helped build the site and draft the
 * copy — this is where that becomes specific.
 *
 * VOICE. Every line is factual build description in the third person (plan §2.1,
 * R10). No system here is given a personality, and none of them speaks.
 */

import type { ContentOrigin, ContentStatus } from "@/lib/content-status";

export type CrewMemberId =
  | "crew-claude-build-session"
  | "crew-design-canvas"
  | "crew-google-analytics"
  | "crew-vercel-hosting"
  | "crew-browser-storage";

export const CREW_MEMBER_IDS: readonly CrewMemberId[] = [
  "crew-claude-build-session",
  "crew-design-canvas",
  "crew-google-analytics",
  "crew-vercel-hosting",
  "crew-browser-storage"
];

export interface CrewMember {
  id: CrewMemberId;
  status: ContentStatus;
  origin: ContentOrigin;
  name: string;
  /** Runtime crew act while a visitor is on the site; build crew never do. */
  role: "build" | "runtime";
  does: string;
  canAccess: readonly string[];
  cannotAccess: readonly string[];
  hasAuthorityTo: readonly string[];
  hasNoAuthorityTo: readonly string[];
  sourceIds: readonly string[];
}

export const crewManifest = [
  {
    id: "crew-claude-build-session",
    status: "published",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    name: "Claude — the session that built this site",
    role: "build",
    does: "Writes the code, drafts placeholder copy, and records what it could not decide.",
    canAccess: [
      "The repository, at build time only.",
      "The design handoff and the governing spec.",
      "The planning packet Ben assembled."
    ],
    cannotAccess: [
      "Anything a visitor does on the site.",
      "Local browser state, which never leaves the visitor's machine.",
      "Analytics data."
    ],
    hasAuthorityTo: [
      "Propose wording and mark it as not Ben's.",
      "Refuse to ship a claim the implementation cannot honour."
    ],
    hasNoAuthorityTo: [
      "Sign anything.",
      "Fill a slot labelled as Ben's.",
      "Publish a claim as Ben's position.",
      "Decide any of the thirteen open content questions."
    ],
    sourceIds: ["packet-crew-manifest", "artboard-4a-disclosure-strip"]
  },
  {
    id: "crew-design-canvas",
    status: "published",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    name: "The design canvas that produced the artboards",
    role: "build",
    does: "Held the approved visual design that this build recreates in the codebase.",
    canAccess: ["Nothing on the live site."],
    cannotAccess: ["Visitors.", "Local browser state.", "Analytics data."],
    hasAuthorityTo: ["Settle a visual question, where an approved artboard answers it."],
    hasNoAuthorityTo: ["Settle a behavioural question, which the spec governs."],
    sourceIds: ["packet-crew-manifest"]
  },
  {
    id: "crew-google-analytics",
    status: "published",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    name: "Google Analytics 4, behind Consent Mode",
    role: "runtime",
    does: "Counts page views and a short allowlist of coarse course events, once consent is granted.",
    canAccess: [
      "Which pages were opened.",
      "That an allowlisted event happened, with its allowlisted properties.",
      "Ordinary request metadata that any web request carries."
    ],
    cannotAccess: [
      "Anything typed into the site.",
      "The learner's rulebook.",
      "The contents of any local state.",
      "Any identifier this site created."
    ],
    hasAuthorityTo: ["Receive the allowlisted events, and only while consent is granted."],
    hasNoAuthorityTo: ["Receive a property that is not on the allowlist.", "Receive free text of any kind."],
    sourceIds: ["packet-crew-manifest", "wys-spec-19", "docs-legal-analytics"]
  },
  {
    id: "crew-vercel-hosting",
    status: "published",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    name: "The hosting platform",
    role: "runtime",
    does: "Serves the pages and the static assets.",
    canAccess: ["Request metadata such as an IP address, as part of ordinary delivery and security logging."],
    cannotAccess: ["Local browser state, which is never sent to it."],
    hasAuthorityTo: ["Deliver the site."],
    hasNoAuthorityTo: ["Change what the site says.", "Be described as processing nothing at all."],
    sourceIds: ["packet-crew-manifest", "wys-spec-18"]
  },
  {
    id: "crew-browser-storage",
    status: "published",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    name: "This browser's local storage",
    role: "runtime",
    does: "Holds the course state on the visitor's own machine, under one key.",
    canAccess: ["Only what the course writes: pace, progress, choices, rules and preferences."],
    cannotAccess: ["Any other site.", "Anything the visitor did not do here."],
    hasAuthorityTo: ["Keep the state until the visitor clears it."],
    hasNoAuthorityTo: ["Send anything anywhere.", "Survive a clear.", "Be read by Ben."],
    sourceIds: ["packet-crew-manifest", "wys-spec-17"]
  }
] as const satisfies readonly CrewMember[];

export function crewMemberById(id: CrewMemberId): CrewMember {
  const record = crewManifest.find((member) => member.id === id);
  if (!record) throw new Error(`No crew member with id "${id}".`);
  return record;
}

/** The five field names, as the packet states them. Rendered as row labels. */
export const CREW_FIELD_LABELS: readonly string[] = [
  "What it does",
  "What it can access",
  "What it cannot access",
  "What authority it has",
  "What authority it does not have"
];
