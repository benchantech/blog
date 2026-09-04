import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderPolicyFor } from "@/lib/content-status";
import { approvalState, entryApprovalLabel, standingOrdersPill } from "@/lib/approval-state";
import { isExternalSourceRef } from "@/content/source-refs";
import { shipContentObjects, shipRegistry } from "@/content/ship";
import {
  standingOrderById,
  standingOrderTag,
  standingOrders,
  standingOrdersIntro,
  standingOrdersIntroLine
} from "@/content/ship/standing-orders";
import {
  type ShipsLogEntry,
  captainsRoundNote,
  formatLogDate,
  shipsLogEntries,
  shipsLogIntro,
  shipsLogTimeline,
  supersededPositionItems
} from "@/content/ship/ships-log";
import {
  type BridgePosition,
  BRIDGE_POSITION_SLOT_ID,
  bridgeIntro,
  bridgeOpenQuestions,
  bridgeSectionLabels,
  bridgeWorkItems,
  currentBridgePosition,
  supersedePosition
} from "@/content/ship/bridge";
import {
  CREW_FIELD_LABELS,
  CREW_ROLE_LABELS,
  crewByRole,
  crewIntro,
  crewManifest
} from "@/content/ship/crew-manifest";
import {
  QUARTERS_SLOT_IDS,
  quartersAudioSlot,
  quartersGridLabel,
  quartersHistoryNote,
  quartersIntro,
  quartersPortraitSlot,
  quartersSlots,
  quartersTiles
} from "@/content/ship/quarters";

/**
 * Phase 9, content half — the ship and governance surfaces as data.
 *
 * The eight packet build checks live in `tests/canonical-text.test.ts` and run
 * over `shipContentObjects`, so registration is what makes a record governed at
 * all (docs/facelift-build-notes.md §7.5). This file owns what is specific to
 * these five surfaces: that every governance string still comes from
 * `lib/approval-state.ts`, that the keel is cited with no digest, that the Q25
 * supersession machinery actually delivers a superseded position to the Log,
 * that every order tag resolves, and that the slots stay unfillable.
 *
 * No page is asserted here. Phase 9's pages are built by other hands; these are
 * the objects they render.
 */

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shipDir = path.join(repoRoot, "content", "ship");

const shipModules = readdirSync(shipDir)
  .filter((entry) => !statSync(path.join(shipDir, entry)).isDirectory())
  .filter((entry) => entry.endsWith(".ts"));

/** Source with comments stripped — a rule about typed strings is not a rule about prose. */
function codeOf(file: string): string {
  return readFileSync(path.join(shipDir, file), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^\s*\/\/.*$/gm, " ");
}

function stringLiteralsIn(source: string): string[] {
  return [...source.matchAll(/"((?:[^"\\\n]|\\.)*)"/g)].map((match) => match[1]);
}

const shipIds = new Set(shipContentObjects.map((object) => object.id));

/* -------------------------------------------------------------------------- */
/* Registration — an unregistered record escapes every governance check        */
/* -------------------------------------------------------------------------- */

test("every Phase 9 header record is registered in the ship registry", () => {
  for (const id of [
    "standing-orders-intro",
    "ships-log-intro",
    "crew-intro",
    "bridge-intro",
    "quarters-intro",
    // Phase 9's gate added the sixth module: the agent bootstrap, rendered by
    // AGENTS.md, /llms.txt and /author-ship/state.json from one definition.
    "agent-bootstrap"
  ]) {
    assert.ok(shipIds.has(id), `${id} is not reachable from content/ship/index.ts`);
  }
  assert.equal(shipRegistry.length, 6, "one registry group per ship content module");
});

test("every ship record's sources resolve to a registered reference", () => {
  const cited: { id: string; sourceIds: readonly string[] }[] = [
    standingOrdersIntro,
    ...standingOrders,
    shipsLogIntro,
    ...shipsLogEntries,
    captainsRoundNote,
    bridgeIntro,
    ...bridgeWorkItems,
    ...bridgeOpenQuestions,
    crewIntro,
    ...crewManifest,
    quartersIntro,
    ...quartersTiles,
    quartersHistoryNote
  ];

  const unresolved: string[] = [];
  for (const record of cited) {
    assert.ok(record.sourceIds.length > 0, `${record.id} cites nothing`);
    for (const sourceId of record.sourceIds) {
      if (!isExternalSourceRef(sourceId)) unresolved.push(`${record.id} cites "${sourceId}"`);
    }
  }
  assert.deepEqual(unresolved, []);
});

/* -------------------------------------------------------------------------- */
/* Governance strings come from approval state, never from content            */
/* -------------------------------------------------------------------------- */

test("no ship content module types a governance string it should be reading", () => {
  const offences: string[] = [];
  for (const file of shipModules) {
    const code = codeOf(file);
    // "captain's round:" is the state line; "NEXT · CAPTAIN'S ROUND" is the
    // artboard's ink card and belongs in content.
    for (const literal of ["Not yet stamped", "approval pending", "Standing Orders · draft", "captain's round:"]) {
      if (code.toLowerCase().includes(literal.toLowerCase())) {
        offences.push(`${file} types "${literal}"`);
      }
    }
  }
  assert.deepEqual(
    offences,
    [],
    "These flip from lib/approval-state.ts, so one typed value moves every surface (§6.6)."
  );

  // And the values the ship surfaces render still come from there.
  assert.equal(standingOrdersPill(), "Standing Orders · draft");
  const firstEntry: ShipsLogEntry = shipsLogEntries[0];
  assert.equal(firstEntry.approvedAt, undefined, "nothing is stamped, so no entry claims approval");
  assert.equal(entryApprovalLabel(firstEntry), "approval pending");
});

test("the Standing Orders intro cites the keel by name and prints no digest", () => {
  assert.equal(standingOrdersIntro.derivedFrom.keelName, approvalState.keel.name);
  assert.equal(standingOrdersIntro.keelHref, approvalState.keel.url);
  assert.equal(standingOrdersIntro.citesHash, false);
  assert.equal(approvalState.keel.sha256, null);

  const line = standingOrdersIntroLine();
  assert.ok(line.includes(approvalState.keel.name));
  assert.equal(/[0-9a-f]{64}/.test(line), false, "no v2.3 hash is printed (packet: hashing)");
  assert.equal(/sha256/i.test(line), false);
  assert.equal(standingOrdersIntro.title, "The rules this site runs on");
});

/* -------------------------------------------------------------------------- */
/* Order tags are references (§6.8)                                           */
/* -------------------------------------------------------------------------- */

test("every order tag on an entry or on the Crew Manifest resolves to a Standing Order", () => {
  const tagged: { id: string; orderTags: readonly string[] }[] = [...shipsLogEntries, crewIntro];
  for (const record of tagged) {
    assert.ok(record.orderTags.length > 0, `${record.id} carries no order tag`);
    for (const tag of record.orderTags) {
      const order = standingOrderById(tag as never);
      assert.ok(order.title.length > 0);
    }
  }

  assert.deepEqual([...crewIntro.orderTags], ["order-06"], "the manifest exists because Order 06 requires it");
  assert.equal(standingOrderTag("order-06"), "Order 06");
  assert.equal(standingOrders.length, 9);
});

/* -------------------------------------------------------------------------- */
/* Dates are data                                                             */
/* -------------------------------------------------------------------------- */

test("the artboard's date form is rendered from ISO, without a timezone in the path", () => {
  assert.equal(formatLogDate("2026-09-03"), "3 Sep 2026");
  assert.equal(formatLogDate("2026-12-31"), "31 Dec 2026");
  assert.equal(formatLogDate("2026-01-01"), "1 Jan 2026");
  assert.throws(() => formatLogDate("3 Sep 2026"), /ISO 8601/);
  for (const entry of shipsLogEntries) assert.match(entry.date, /^\d{4}-\d{2}-\d{2}$/);
});

/* -------------------------------------------------------------------------- */
/* Q25 — "every earlier state lives in the Log" is true in architecture       */
/* -------------------------------------------------------------------------- */

const firstPosition: BridgePosition = {
  id: "position-one",
  status: "published",
  origin: "BEN_AUTHORED",
  takenAt: "2026-09-01",
  statement: "A position only Ben ever writes.",
  sourceIds: ["packet-bridge"]
};

const secondPosition: BridgePosition = {
  ...firstPosition,
  id: "position-two",
  takenAt: "2026-09-10"
};

test("a superseded Bridge position becomes a historical record the Log renders", () => {
  const [superseded, current] = supersedePosition(firstPosition, secondPosition);

  assert.equal(superseded.status, "historical");
  assert.equal(superseded.supersededBy, "position-two");
  assert.equal(superseded.canonical, false);
  assert.equal(current.id, "position-two");

  const items = supersededPositionItems([superseded, current]);
  assert.equal(items.length, 1, "only the superseded one goes to the Log");
  assert.equal(items[0].id, "log-superseded-position-one");
  assert.equal(items[0].date, "2026-09-01");
  assert.equal(items[0].position.statement, firstPosition.statement);

  // The Log is an archive surface; a current surface must not render it at all.
  const archive = renderPolicyFor(
    {
      surfaceKind: "general",
      origin: superseded.origin as "BEN_AUTHORED",
      status: superseded.status,
      supersededBy: superseded.supersededBy,
      canonical: superseded.canonical
    },
    "archive"
  );
  assert.equal(archive.kind, "marked", "a superseded position never reads as a current one");

  const publicPolicy = renderPolicyFor(
    {
      surfaceKind: "general",
      origin: superseded.origin as "BEN_AUTHORED",
      status: superseded.status,
      supersededBy: superseded.supersededBy,
      canonical: superseded.canonical
    },
    "public"
  );
  assert.equal(publicPolicy.kind, "blocked");
});

test("a malformed historical position throws rather than vanishing from the Log", () => {
  const broken: BridgePosition = { ...firstPosition, status: "historical" };
  assert.throws(() => supersededPositionItems([broken]), /supersededBy/);
});

test("the Log's timeline carries entries and superseded positions, newest first", () => {
  const [superseded, current] = supersedePosition(firstPosition, secondPosition);
  const timeline = shipsLogTimeline(shipsLogEntries as readonly ShipsLogEntry[], [superseded, current]);

  assert.equal(timeline.length, shipsLogEntries.length + 1);
  const dates = timeline.map((item) => item.date);
  assert.deepEqual([...dates].sort((a, b) => (a < b ? 1 : -1)), dates, "newest first");
  assert.ok(timeline.some((item) => item.kind === "superseded-position"));
  assert.equal(
    timeline.some((item) => item.kind === "entry" && item.entry.id === (captainsRoundNote as { id: string }).id),
    false,
    "the forward-looking note is not an entry and is not in the record of the past"
  );
});

test("the Bridge states one position at a time, and today it states none", () => {
  assert.equal(currentBridgePosition(), null, "Ben has written no position, so the page renders the slot");
  assert.equal(BRIDGE_POSITION_SLOT_ID, "slot-bridge-position");

  const [superseded, current] = supersedePosition(firstPosition, secondPosition);
  assert.equal(currentBridgePosition([superseded, current])?.id, "position-two");
  assert.throws(() => currentBridgePosition([firstPosition, secondPosition]), /one position at a time/);
});

test("the Bridge intro claims the Log holds earlier states, and the section labels are pinned", () => {
  assert.match(bridgeIntro.body, /every earlier state lives in the Log/);
  assert.deepEqual(Object.values(bridgeSectionLabels), [
    "WORKING ON",
    "EXPERIMENT UNDERWAY",
    "OPEN QUESTIONS"
  ]);
});

/* -------------------------------------------------------------------------- */
/* R10 — one first-person string on these surfaces, and it is the artboard's  */
/* -------------------------------------------------------------------------- */

test("the only first-person string in content/ship is the approved Ship's Log h1", () => {
  const offences: string[] = [];
  for (const file of shipModules) {
    for (const literal of stringLiteralsIn(codeOf(file))) {
      if (literal === shipsLogIntro.title) continue;
      if (/(^|[^A-Za-z])(I|I'm|my|mine)([^A-Za-z]|$)/.test(literal)) {
        offences.push(`${file}: ${literal.slice(0, 60)}`);
      }
    }
  }
  assert.deepEqual(
    offences,
    [],
    "Prose in Ben's first person is forbidden (R10); the 5d h1 is the one approved exception and is escalated in docs/facelift-unapproved.md."
  );
  assert.equal(shipsLogIntro.firstPerson, true);
  assert.equal(shipsLogIntro.title, "I may change my mind. I won't rewrite the record.");
  assert.equal(shipsLogIntro.pill, "Ship's Log · append-only");
});

/* -------------------------------------------------------------------------- */
/* Crew Manifest — NEW, and honest about the session that built the site      */
/* -------------------------------------------------------------------------- */

test("the Crew Manifest header is build-authored and renders marked, never as canon", () => {
  assert.equal(crewIntro.origin, "IMPLEMENTATION_PLACEHOLDER");
  const policy = renderPolicyFor(
    { surfaceKind: "general", origin: crewIntro.origin, status: crewIntro.status },
    "public"
  );
  assert.equal(policy.kind, "marked", "no artboard approved these words, so they carry their label");
  if (policy.kind !== "marked") return;
  assert.equal(policy.label, "Implementation placeholder — not Ben's words");
  assert.equal(policy.draftMark, "default");
});

test("every crew member is grouped, and the grouping loses nobody", () => {
  assert.equal(CREW_FIELD_LABELS.length, 5);
  assert.deepEqual(Object.keys(CREW_ROLE_LABELS).sort(), ["build", "runtime"]);
  assert.equal(crewByRole("build").length + crewByRole("runtime").length, crewManifest.length);
  assert.ok(crewByRole("build").some((member) => member.id === "crew-claude-build-session"));
});

/* -------------------------------------------------------------------------- */
/* Captain's Quarters — six tiles, one unlinked, three unfillable slots       */
/* -------------------------------------------------------------------------- */

test("the Studio tile is unlinked until Ben answers Q5, and never points at /studio", () => {
  const studio = quartersTiles.find((tile) => tile.id === "tile-studio");
  assert.ok(studio);
  assert.equal(studio.href, null, "null is the data form of an open question; \"\" would render a link");
  assert.equal(studio.label, "Studio");
  assert.equal(
    quartersTiles.some((tile) => tile.href === "/studio"),
    false,
    "/studio is the preserved Violin for Parents page and is not relabelled"
  );
  assert.equal(quartersTiles.length, 6);
  assert.equal(quartersTiles.filter((tile) => tile.href === null).length, 1);
});

test("the keel tile's sub-label is state, not copy", () => {
  const keelTile = quartersTiles.find((tile) => tile.id === "tile-yy-method");
  assert.ok(keelTile);
  assert.equal(keelTile.subLabel, `v${approvalState.keel.version} · the keel`);
  assert.equal(/[0-9a-f]{64}/.test(keelTile.subLabel), false);
});

test("the portrait, the 60-second audio and Selected history are slots nothing can fill", () => {
  assert.equal(QUARTERS_SLOT_IDS.length, 3);
  assert.equal(quartersSlots.length, 3);
  assert.equal(quartersGridLabel, "WORK & PROPERTIES");

  for (const slot of quartersSlots) {
    assert.equal(slot.status, "draft");
    assert.equal(slot.origin, "BEN_AUTHORED");
    const policy = renderPolicyFor(
      { surfaceKind: "human-source", origin: slot.origin, status: slot.status },
      "public"
    );
    assert.equal(policy.kind, "blocked", `${slot.id} could render as Ben-attributed text`);
  }

  assert.equal(quartersPortraitSlot.label, "portrait — Ben-supplied");
  assert.equal(quartersAudioSlot.label, "Hear Ben, 60 seconds");
  assert.equal(quartersAudioSlot.awaitedAsset, "Ben source · slot awaiting selection");
  assert.equal(quartersHistoryNote.heading, "Selected history");
  assert.ok(quartersAudioSlot.surfaces.includes("/ben"), "one audio slot, three surfaces");
});
