import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  approvalState,
  bridgeStateLines,
  captainsRoundLine,
  entryApprovalLabel,
  governedByLine,
  governedByLineFull,
  isStamped,
  keelHashLine,
  snapshotLine,
  stampLabel,
  stampStateLine,
  standingOrdersPill
} from "@/lib/approval-state";

/**
 * Approval state is data, never copy (plan §6.6).
 *
 * lib/approval-state.ts is the single source for every governance string on
 * screen. This test greps `app/` and `components/` for those literals and fails
 * if any appears outside that module or `content/`. Without it, the module is a
 * convention rather than a mechanism, and the `4a` footer, the Standing Orders
 * pill, the `5d` log chips and the Bridge mono block would each drift on their
 * own.
 *
 * If a later phase makes this fail, the fix is to render the string from
 * lib/approval-state.ts — not to add the file to an exemption list.
 */

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skipDirs = new Set(["node_modules", ".next", ".git"]);

/** The literals §6.6 names. Matched case-insensitively. */
const GOVERNANCE_LITERALS = [
  "Not yet stamped",
  "approval pending",
  "Standing Orders · draft",
  "approved by Ben",
  "captain's round"
];

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    if (skipDirs.has(entry)) continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (full.endsWith(".ts") || full.endsWith(".tsx")) out.push(full);
  }
  return out;
}

const scanned = [
  ...walk(path.join(repoRoot, "app")),
  ...walk(path.join(repoRoot, "components"))
];

test("the scan actually reaches the surfaces it claims to cover", () => {
  assert.ok(scanned.length >= 15, `expected to scan app/ and components/, found ${scanned.length} files`);
  assert.ok(scanned.some((file) => file.endsWith(path.join("app", "page.tsx"))));
  assert.ok(scanned.some((file) => file.endsWith(path.join("components", "SiteFooter.tsx"))));
});

test("no governance string literal appears in app/ or components/", () => {
  const offences: string[] = [];

  for (const file of scanned) {
    const source = readFileSync(file, "utf8").toLowerCase();
    for (const literal of GOVERNANCE_LITERALS) {
      if (source.includes(literal.toLowerCase())) {
        offences.push(`${path.relative(repoRoot, file)} contains "${literal}"`);
      }
    }
  }

  assert.deepEqual(
    offences,
    [],
    `Governance strings belong in lib/approval-state.ts (or content/), so one typed value flips them all:\n${offences.join("\n")}`
  );
});

/* -------------------------------------------------------------------------- */
/* The module itself                                                          */
/* -------------------------------------------------------------------------- */

test("nothing is stamped, and the stamp is a record type rather than a string", () => {
  assert.equal(approvalState.stamp, null);
  assert.equal(isStamped(), false);
  assert.equal(stampLabel(), "Not yet stamped");
  assert.equal(stampStateLine(), "captain's stamp: not yet stamped");
});

test("the default Ship's Log entry state is approval pending", () => {
  assert.equal(entryApprovalLabel(), "approval pending");
  assert.equal(entryApprovalLabel({}), "approval pending");
  assert.match(entryApprovalLabel({ approvedAt: "2026-09-03" }), /^approved by Ben/);
});

test("the Standing Orders pill renders its draft status from data", () => {
  assert.equal(approvalState.standingOrders.status, "draft");
  assert.equal(standingOrdersPill(), "Standing Orders · draft");
});

test("captain's round and snapshot render their empty states", () => {
  assert.equal(approvalState.lastCaptainsRound, null);
  assert.equal(approvalState.latestSnapshot, null);
  assert.equal(captainsRoundLine(), "captain's round: none yet");
  assert.equal(snapshotLine(), "snapshot: 0 pending");
});

test("the keel is named once and rendered in two forms", () => {
  assert.equal(approvalState.keel.name, "YY Method Professional v2.3");
  assert.equal(approvalState.keel.shortName, "YY Method v2.3");
  assert.equal(approvalState.keel.url, "https://yymethod.com/work");
  assert.equal(governedByLine(), "governed by YY Method v2.3");
  assert.equal(governedByLineFull(), "governed by: YY Method Professional v2.3");
});

test("no SHA-256 is printed until Ben publishes one on yymethod.com/work", () => {
  assert.equal(approvalState.keel.sha256, null);
  assert.equal(keelHashLine(), "sha256: pending publication");
  assert.equal(/[0-9a-f]{64}/.test(keelHashLine()), false);
});

test("the Bridge mono block renders every state line from approvalState", () => {
  assert.deepEqual(bridgeStateLines(), [
    "status: current",
    "captain's round: none yet",
    "snapshot: 0 pending",
    "captain's stamp: not yet stamped",
    "governed by YY Method v2.3",
    "sha256: pending publication"
  ]);
});
