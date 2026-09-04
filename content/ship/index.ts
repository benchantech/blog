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

import { bridgeRecords } from "./bridge";
import { crewManifest } from "./crew-manifest";
import { quartersRecords } from "./quarters";
import { captainsRoundNote, shipsLogEntries } from "./ships-log";
import { standingOrders } from "./standing-orders";

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
  { module: "content/ship/standing-orders.ts", records: standingOrders },
  { module: "content/ship/ships-log.ts", records: [...shipsLogEntries, captainsRoundNote] },
  { module: "content/ship/bridge.ts", records: bridgeRecords },
  { module: "content/ship/crew-manifest.ts", records: crewManifest },
  { module: "content/ship/quarters.ts", records: quartersRecords }
];

export const shipContentObjects: readonly ShipGovernedObject[] = shipRegistry.flatMap(
  (group) => group.records
);

/** Modules under content/ship/ that define no records. */
export const SHIP_NON_RECORD_MODULES: readonly string[] = ["index.ts"];
