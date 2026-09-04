/**
 * `/author-ship/state.json` — the machine mirror (plan Phase 9; packet:
 * state.json, canonical-node rule).
 *
 * IT IS A RENDERING, NOT A SECOND CANONICAL NODE. Every value below is read
 * from a module that already defines it — `lib/approval-state.ts`,
 * `content/ship/*`, `content/claims.ts`, `content/source-refs.ts` — and the
 * `canonical_human_node` map says so IN BAND, per key, so a machine reader is
 * told which human page each section mirrors without having to read a code
 * comment. Nothing here is typed twice, and nothing here is authored.
 *
 * PROSE PASSES THE SAME GATE THE PAGES USE. Every sentence that reaches the
 * JSON goes through `gateProse`, so a record that must not render publicly
 * arrives as `{ "withheld": true, "provenance": "<label>" }` and never as
 * words. That is not decoration: the RSC leak `withoutBlockedProse` exists to
 * stop is exactly the leak a hand-built JSON serialiser would reintroduce, on
 * a surface with no visual review at all.
 *
 * THE THREE PLACES THIS NARROWS THE PACKET'S KEY SET, all recorded in
 * docs/facelift-unapproved.md:
 *   1. `mission` has no canonical record yet — the `/watch-your-step` landing
 *      is still a Phase 5 stub — so it renders as an `awaiting` descriptor
 *      pointing at the human node that will own it. Never an invented mission.
 *   2. `resolved_decisions` renders the Ship's Log, which is where this build
 *      records a decision that was taken. There is no separate decision
 *      register, and inventing one would be a second canonical node.
 *   3. `deprecated_assumptions` renders superseded Bridge positions through
 *      the Q25 machinery. It is `[]` today because nothing has been superseded
 *      yet, and that emptiness is true rather than unimplemented.
 *
 * TWO KEYS ARE ADDITIONS to the packet's list, and both are recorded:
 * `claims` (required by the plan's own instruction that claim strings come
 * from `content/claims.ts`, never hand-typed) and `agent_bootstrap` (so an
 * agent that fetches only this file still reads the instruction that stops it
 * treating a superseded decision as current).
 *
 * NO HASH. `approvalState.keel.sha256` is null, so `current_doctrine.sha256`
 * is `null` and the human-readable line is `keelHashLine()`. Nothing here
 * fabricates a digest (packet: hashing).
 *
 * Pure TypeScript — no React, no CSS — so the test runner loads it directly
 * and `app/author-ship/state.json/route.ts` is four lines of serialisation.
 */

import {
  approvalState,
  captainsRoundLine,
  entryApprovalLabel,
  governedByLineFull,
  keelHashLine,
  snapshotLine,
  stampStateLine,
  standingOrdersPill
} from "@/lib/approval-state";
import { type GateableRecord, type GatedContent, gateProse } from "@/lib/wys/content-gate";
import { CLAIM_IDS, claimById } from "@/content/claims";
import { resolveVariant } from "@/lib/canonical-text";
import { absoluteUrl } from "@/content/canonical-surfaces";
import { agentBootstrap } from "@/content/ship/agent-bootstrap";
import { bridgeExperiment, bridgeOpenQuestions } from "@/content/ship/bridge";
import { crewManifest } from "@/content/ship/crew-manifest";
import { type ShipsLogEntry, shipsLogEntries, supersededPositionItems } from "@/content/ship/ships-log";
import { standingOrders } from "@/content/ship/standing-orders";
import { externalSourceRefs } from "@/content/source-refs";

/** Prose in the JSON is either the words or an honest refusal to print them. */
export type MachineProse =
  | { text: string; provenance: string }
  | { withheld: true; provenance: string; reason: string };

function machineProse(record: GateableRecord, text: string): MachineProse {
  return proseFromGate(gateProse("general", record, text));
}

function proseFromGate(gate: GatedContent): MachineProse {
  if (gate.policy.kind === "blocked") {
    return { withheld: true, provenance: gate.label, reason: gate.policy.reason };
  }
  return { text: gate.text, provenance: gate.label };
}

/**
 * The claim block. `machine` is the variant asked for, and the declared
 * fallback chain in `lib/canonical-text.ts` is `machine -> full` — never to a
 * shorter form, because shortening a claim is how a hedge becomes an assertion
 * (packet 3.4). A claim whose authoritative wording is still unwritten renders
 * as its `awaiting` descriptor, which is build language and structurally not a
 * claim, so this file can never publish a privacy assertion Phase 11 has not
 * written.
 */
export function claimBlock() {
  return CLAIM_IDS.map((id) => {
    const record = claimById(id);
    const resolved = resolveVariant(record, "machine");
    const base = { id, status: record.status, origin: record.origin, source_refs: record.sourceIds };
    if (resolved.kind !== "text") {
      return {
        ...base,
        state: resolved.kind,
        awaiting: resolved.kind === "awaiting" ? resolved.awaiting.awaiting : null,
        written_by: resolved.kind === "awaiting" ? resolved.awaiting.writtenBy : null
      };
    }
    return { ...base, state: "text", variant: resolved.variant, ...machineProse(record, resolved.text) };
  });
}

/**
 * Which human page each section of this file mirrors.
 *
 * The packet's canonical-node rule in band: a machine reader is told, key by
 * key, that this JSON renders the same objects a person reads at those URLs.
 */
/** The human node that will own the mission statement (plan Q3). */
const MISSION_HUMAN_NODE = "/watch-your-step";

/** The human page this whole file mirrors. */
const SELF_HUMAN_NODE = "/bridge";

const CANONICAL_HUMAN_NODES: Readonly<Record<string, string | null>> = {
  self: SELF_HUMAN_NODE,
  mission: MISSION_HUMAN_NODE,
  current_doctrine: approvalState.keel.url,
  standing_orders_version: "/standing-orders",
  current_experiments: "/bridge",
  open_questions: "/bridge",
  resolved_decisions: "/ships-log",
  deprecated_assumptions: "/ships-log",
  /**
   * `null`, and deliberately: a source ref is a citation of something OUTSIDE
   * this site — a spec section, an artboard region, a page of the planning
   * packet — so it has no canonical human node here. Naming one would be a
   * false pointer, which is worse than an honest null.
   */
  source_refs: null,
  tool_roles: "/crew",
  last_captains_round: "/ships-log",
  last_approved_snapshot: "/ships-log",
  claims: "/watch-your-step/data",
  agent_bootstrap: "/crew"
};

export function authorShipState() {
  return {
    canonical_human_node: {
      /**
       * In band, not only in a comment: this file is a rendering of the same
       * canonical objects, not a second canonical node.
       */
      self: absoluteUrl(SELF_HUMAN_NODE),
      by_key: CANONICAL_HUMAN_NODES
    },

    mission: {
      state: "awaiting",
      awaiting: "the Watch Your Step landing statement, once that surface leaves stub",
      canonical_human_node: MISSION_HUMAN_NODE
    },

    current_doctrine: {
      name: approvalState.keel.name,
      short_name: approvalState.keel.shortName,
      version: approvalState.keel.version,
      url: approvalState.keel.url,
      sha256: approvalState.keel.sha256,
      hash_line: keelHashLine(),
      governed_by: governedByLineFull()
    },

    standing_orders_version: {
      version: approvalState.standingOrders.version,
      status: approvalState.standingOrders.status,
      pill: standingOrdersPill(),
      orders: standingOrders.map((order) => ({
        id: order.id,
        number: order.number,
        ...machineProse(order, order.title)
      }))
    },

    current_experiments: [
      {
        id: bridgeExperiment.id,
        lead: bridgeExperiment.lead,
        ...machineProse(bridgeExperiment, bridgeExperiment.body)
      }
    ],

    /**
     * `entry` is annotated with its declared interface rather than the `as
     * const` literal type: `entryApprovalLabel` takes an all-optional shape, so
     * TypeScript's weak-type check rejects a literal that happens to carry none
     * of `approvedAt` / `approvedBy` — which is every unstamped entry. The
     * annotation is the fix that does not widen a shared governance signature.
     */
    resolved_decisions: shipsLogEntries.map((entry: ShipsLogEntry) => ({
      id: entry.id,
      date: entry.date,
      approval: entryApprovalLabel(entry),
      standing_orders: entry.orderTags,
      title: machineProse(entry, entry.title),
      body: machineProse(entry, entry.body),
      source_refs: entry.sourceIds
    })),

    open_questions: bridgeOpenQuestions.map((question) => ({
      id: question.id,
      spec_decision: question.specDecision ?? null,
      ...machineProse(question, question.question)
    })),

    /**
     * Superseded Bridge positions, through the Q25 machinery. `[]` today
     * because nothing has been superseded — an accurate empty list, not a
     * missing feature. `supersededPositionItems()` throws on a malformed
     * record rather than dropping it.
     */
    deprecated_assumptions: supersededPositionItems().map((item) => ({
      id: item.id,
      superseded_position: item.positionId,
      date: item.date,
      superseded_by: item.position.supersededBy ?? null,
      canonical: item.position.canonical ?? false
    })),

    source_refs: externalSourceRefs.map((ref) => ({
      id: ref.id,
      kind: ref.kind,
      locator: ref.locator
    })),

    tool_roles: crewManifest.map((member) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      does: machineProse(member, member.does),
      can_access: member.canAccess,
      cannot_access: member.cannotAccess,
      has_authority_to: member.hasAuthorityTo,
      has_no_authority_to: member.hasNoAuthorityTo,
      source_refs: member.sourceIds
    })),

    last_captains_round: {
      value: approvalState.lastCaptainsRound,
      line: captainsRoundLine(),
      stamp: approvalState.stamp,
      stamp_line: stampStateLine()
    },

    last_approved_snapshot: {
      value: approvalState.latestSnapshot,
      line: snapshotLine()
    },

    claims: claimBlock(),

    agent_bootstrap: {
      id: agentBootstrap.id,
      origin: agentBootstrap.origin,
      lines: agentBootstrap.lines,
      source_refs: agentBootstrap.sourceIds
    }
  };
}

/** The serialised body. Two-space JSON, trailing newline, LF. */
export function authorShipStateJson(): string {
  return `${JSON.stringify(authorShipState(), null, 2)}\n`;
}
