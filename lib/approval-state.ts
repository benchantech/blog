/**
 * Approval state is DATA, never copy (plan §6.6).
 *
 * This module is the single source for every governance string on screen. The
 * `4a` footer "Designed first for mobile · Not yet stamped", the grey
 * "Standing Orders · draft" pill, the `5d` "approval pending" chip on every log
 * entry, the Bridge mono block and the disclosure strip's final sentence all
 * flip from ONE typed value. Ben stamping a section flips all of them without
 * a copy edit.
 *
 * `tests/governance-strings.test.ts` greps `app/` and `components/` for these
 * literals and fails if any appears outside this file or `content/`. Without
 * that test the module is a convention, not a mechanism.
 *
 * Nothing here is written in Ben's first person (plan R10). These are state
 * lines describing the build, not positions attributed to him.
 */

/** packet: Captain's Stamp — five named elements. */
export interface CaptainsStamp {
  approvedBy: "Ben Chan";
  /** ISO 8601. */
  approvedAt: string;
  /** The Standing Orders version AT TIME OF APPROVAL, not the current one. */
  standingOrdersVersion: string;
  /** Commit / build identifier. */
  buildId: string;
  /** Cryptographic fingerprint where appropriate. */
  fingerprint?: string;
}

/**
 * `stamp` is `CaptainsStamp | null`, never the string "not-yet-stamped": a bare
 * string can represent none of the five elements above, so the module could not
 * express a stamp once Ben made one.
 */
export interface CaptainsRound {
  /** ISO 8601. */
  conductedAt: string;
  /** The snapshot this round produced, once one exists. */
  snapshotId: string | null;
}

export interface Snapshot {
  id: string;
  /** ISO 8601. */
  takenAt: string;
  /** Entries awaiting Ben's stamp at the time of the snapshot. */
  pendingCount: number;
}

export interface KeelRecord {
  /** The full name, as the Standing Orders block renders it. */
  name: string;
  /** The short form the Bridge mono block renders. Same fact, second presentation (§6.8). */
  shortName: string;
  version: string;
  url: string;
  /**
   * No SHA-256 is printed for YY Method v2.3 until Ben publishes one on
   * yymethod.com/work. packet: hashing requires freeze -> SHA-256 of canonical
   * UTF-8/LF Markdown -> publish on /work -> THEN cite.
   */
  sha256: string | null;
}

export const approvalState = {
  /** null renders the unstamped line. */
  stamp: null as CaptainsStamp | null,
  /** null renders "none yet". */
  lastCaptainsRound: null as CaptainsRound | null,
  /** null renders "0 pending". */
  latestSnapshot: null as Snapshot | null,
  standingOrders: { version: "draft", status: "draft" },
  keel: {
    name: "YY Method Professional v2.3",
    shortName: "YY Method v2.3",
    version: "2.3",
    url: "https://yymethod.com/work",
    sha256: null
  } as KeelRecord
} as const;

/* -------------------------------------------------------------------------- */
/* Rendered forms — every governance string on the site comes from here.      */
/* -------------------------------------------------------------------------- */

/** The `4a` footer's right-hand half and the mobile footer's stamp line. */
export function stampLabel(): string {
  const stamp = approvalState.stamp;
  if (!stamp) return "Not yet stamped";
  return `Stamped ${stamp.approvedAt} · ${stamp.approvedBy}`;
}

/** The mono form: "captain's stamp: not yet stamped". */
export function stampStateLine(): string {
  const stamp = approvalState.stamp;
  if (!stamp) return "captain's stamp: not yet stamped";
  return `captain's stamp: ${stamp.approvedAt} · ${stamp.buildId}`;
}

/** The default state of every Ship's Log entry (`5d`). */
export function entryApprovalLabel(entry?: { approvedAt?: string; approvedBy?: string }): string {
  if (entry?.approvedAt) return `approved by Ben · ${entry.approvedAt}`;
  return "approval pending";
}

/** The grey pill above the Standing Orders H1. */
export function standingOrdersPill(): string {
  return `Standing Orders · ${approvalState.standingOrders.status}`;
}

/** "captain's round: none yet". */
export function captainsRoundLine(): string {
  const round = approvalState.lastCaptainsRound;
  return round ? `captain's round: ${round.conductedAt}` : "captain's round: none yet";
}

/** "snapshot: 0 pending". */
export function snapshotLine(): string {
  const snapshot = approvalState.latestSnapshot;
  return snapshot ? `snapshot: ${snapshot.id} · ${snapshot.pendingCount} pending` : "snapshot: 0 pending";
}

/** "governed by YY Method v2.3" — the short keel rendering. */
export function governedByLine(): string {
  return `governed by ${approvalState.keel.shortName}`;
}

/** "governed by: YY Method Professional v2.3" — the full keel rendering. */
export function governedByLineFull(): string {
  return `governed by: ${approvalState.keel.name}`;
}

/**
 * "sha256: pending publication" until Ben publishes the hash on
 * yymethod.com/work. Never prints a fabricated digest.
 */
export function keelHashLine(): string {
  const sha256 = approvalState.keel.sha256;
  return sha256 ? `sha256: ${sha256}` : "sha256: pending publication";
}

/** The Bridge mono block, as one ordered list of lines. */
export function bridgeStateLines(): string[] {
  return [
    "status: current",
    captainsRoundLine(),
    snapshotLine(),
    stampStateLine(),
    governedByLine(),
    keelHashLine()
  ];
}

/** True once Ben has stamped anything at all. Gates the disclosure strip wording (Q1). */
export function isStamped(): boolean {
  return approvalState.stamp !== null;
}
