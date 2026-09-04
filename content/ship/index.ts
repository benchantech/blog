/**
 * The ship content registry — the same governance mechanism as
 * `content/watch-your-step/index.ts`.
 *
 * `tests/canonical-text.test.ts` only checks what it imports. Everything under
 * `content/ship/` is collected here so the test imports one thing, and
 * `tests/wys-content.test.ts` fails if a module in this directory is absent
 * from the registry — the failure mode docs/facelift-build-notes.md §7.5
 * describes, where an unregistered module escapes every check silently.
 */

import { agentBootstrap } from "./agent-bootstrap";
import { bridgeRecords } from "./bridge";
import { crewIntro, crewManifest } from "./crew-manifest";
import { quartersRecords } from "./quarters";
import { captainsRoundNote, shipsLogEntries, shipsLogIntro } from "./ships-log";
import { standingOrders, standingOrdersIntro } from "./standing-orders";

export interface ShipGovernedObject {
  id: string;
  status: string;
  origin: string;
  canonical?: boolean;
  supersededBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  standingOrdersVersion?: string;
}

export interface ShipRegistryGroup {
  module: string;
  records: readonly ShipGovernedObject[];
}

export const shipRegistry: readonly ShipRegistryGroup[] = [
  { module: "content/ship/standing-orders.ts", records: [standingOrdersIntro, ...standingOrders] },
  {
    module: "content/ship/ships-log.ts",
    records: [shipsLogIntro, ...shipsLogEntries, captainsRoundNote]
  },
  { module: "content/ship/bridge.ts", records: bridgeRecords },
  { module: "content/ship/crew-manifest.ts", records: [crewIntro, ...crewManifest] },
  { module: "content/ship/quarters.ts", records: quartersRecords },
  /**
   * The agent bootstrap is a governance object like any other: it carries
   * status, origin and its source reference, and it is registered here so the
   * eight checks in `tests/canonical-text.test.ts` see it. An unregistered
   * module escapes all of them silently (docs/facelift-build-notes.md §7.5).
   */
  { module: "content/ship/agent-bootstrap.ts", records: [agentBootstrap] }
];

export const shipContentObjects: readonly ShipGovernedObject[] = shipRegistry.flatMap(
  (group) => group.records
);

/** Modules under content/ship/ that define no records. */
export const SHIP_NON_RECORD_MODULES: readonly string[] = ["index.ts"];
