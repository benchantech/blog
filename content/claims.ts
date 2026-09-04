/**
 * The shared claim records (plan §8b.1, moved into Phase 1 on purpose).
 *
 * "Build it before either page's copy is written" and "write legal copy last"
 * are both true, and they resolve by splitting the module from the prose: the
 * type plus the shared records are created now, so Phase 5 renders `inline` for
 * the disclosure strip, Phase 8 renders `short` on the Data page and Phase 9
 * renders `machine` into /author-ship/state.json from an EXISTING module.
 * Phase 11 keeps only the legal-page prose pass, writing `full` onto these same
 * records against frozen code. Leaving the module in Phase 11 would guarantee
 * the Data page's infrastructure paragraph and card bodies were hand-typed
 * three phases early and then re-derived — the drift §6.8 exists to prevent.
 *
 * Variants nobody has written yet are `AwaitingCopy` descriptors, not empty
 * strings and not invented prose: an unwritten claim is structurally not text,
 * so it cannot render (see lib/canonical-text.ts).
 *
 * PROVENANCE MAPPING for this file, from handoff README "Content status":
 *   - "Final copy"          -> status "published", origin "BEN_APPROVED".
 *                              Ben approved the artboards; the Captain's Stamp
 *                              is a SEPARATE axis, modelled in
 *                              lib/approval-state.ts, and the site says
 *                              "Not yet stamped" from that value.
 *   - "Slots awaiting Ben"  -> never text. components/provenance/types.ts.
 *   - "Draft placeholders"  -> status "draft", origin AI_SYNTHESIS or
 *                              IMPLEMENTATION_PLACEHOLDER, gated by Q21.
 *
 * The nine ids below are the named canonical components from packet:
 * one-definition, quoted in plan §6.8. Do not add a tenth without adding it
 * there too.
 */

import type { AnyCanonicalText } from "@/lib/canonical-text";

export type ClaimId =
  | "minimal-trust"
  | "zero-ai"
  | "localStorage"
  | "analytics"
  | "ai-assisted-ben-approved"
  | "provenance"
  | "captain-stamp"
  | "privacy-disclosure"
  | "ai-role-boundaries";

export const CLAIM_IDS: readonly ClaimId[] = [
  "minimal-trust",
  "zero-ai",
  "localStorage",
  "analytics",
  "ai-assisted-ben-approved",
  "provenance",
  "captain-stamp",
  "privacy-disclosure",
  "ai-role-boundaries"
];

export const claims = [
  {
    /**
     * The infrastructure paragraph. It exists in TWO authoritative wordings and
     * they are cited separately rather than one being attributed to the other
     * (§8b.3): the Data page renders the artboard's `short`, and /privacy and
     * /cookies render WYS §18 verbatim as `full`. A builder told to ship "§18
     * verbatim" on the Data page would otherwise ship the wrong string.
     */
    id: "minimal-trust",
    surfaceKind: "general",
    status: "published",
    origin: "BEN_APPROVED",
    sourceIds: ["artboard-5c-data-infrastructure", "wys-spec-18"],
    variantSources: {
      short: ["artboard-5c-data-infrastructure"],
      full: ["wys-spec-18"]
    },
    variants: {
      short:
        "Watch Your Step still runs on a website. Hosting, security and limited analytics may receive ordinary technical information. Not zero trust — the minimum trust required, and named.",
      full:
        "Watch Your Step still runs on a website. Hosting, security, and limited analytics services may receive ordinary technical information needed to deliver or understand use of the site. The point is not “zero trust.” The point is to ask for the minimum trust required and disclose it."
    }
  },
  {
    /**
     * Disclosure strip, sentences 1-2. Required on every page footer.
     *
     * The strip's FOURTH sentence — the one asserting that every published word
     * was approved by Ben — is deliberately NOT recorded here. Nothing is
     * stamped (lib/approval-state.ts), so the sentence cannot be made true by
     * copy, and plan R8 forbids fixing a false public claim in copy. Q1's
     * ratified default renders the first three sentences plus a truthful
     * unstamped line bound to `approvalState`, and escalates the wording.
     * Recorded in docs/facelift-build-notes.md.
     */
    id: "zero-ai",
    surfaceKind: "general",
    status: "published",
    origin: "BEN_APPROVED",
    sourceIds: ["artboard-4a-disclosure-strip"],
    variantSources: {
      inline: ["artboard-4a-disclosure-strip"]
    },
    variants: {
      inline:
        "You're not talking to AI anywhere on this site. No chatbot, no coach, no generated answers.",
      full: {
        awaiting: "/ai-disclosure prose, written against frozen code in Phase 11 (plan §8b.2)",
        writtenBy: "phase-11"
      }
    }
  },
  {
    id: "ai-assisted-ben-approved",
    surfaceKind: "general",
    status: "published",
    origin: "BEN_APPROVED",
    sourceIds: ["artboard-4a-disclosure-strip"],
    variantSources: {
      inline: ["artboard-4a-disclosure-strip"]
    },
    variants: {
      inline: "AI did help build the site and draft the copy — as crew, listed in the manifest.",
      full: {
        awaiting:
          "/ai-disclosure section on AI's role as disclosed crew during authoring, word-for-word matched to the disclosure strip (SC-1)",
        writtenBy: "phase-11"
      }
    }
  },
  {
    id: "ai-role-boundaries",
    surfaceKind: "general",
    status: "published",
    origin: "BEN_APPROVED",
    sourceIds: ["artboard-4a-how-the-site-is-run"],
    variantSources: {
      short: ["artboard-4a-how-the-site-is-run"]
    },
    variants: {
      short: "AI can crew the ship. It can't sign the logbook.",
      full: {
        awaiting: "the Crew Manifest's system descriptions and what Ben has and has not approved",
        writtenBy: "phase-11"
      }
    }
  },
  {
    id: "localStorage",
    surfaceKind: "general",
    status: "published",
    origin: "BEN_APPROVED",
    sourceIds: ["artboard-5a-posture-footnote", "artboard-5b-rulebook-note"],
    variantSources: {
      inline: ["artboard-5a-posture-footnote"],
      short: ["artboard-5b-rulebook-note"]
    },
    variants: {
      inline: "Stays in this browser. Never sent.",
      short: "Stored here only. Export as text any time.",
      full: {
        awaiting:
          "/privacy and /cookies prose naming the wys:v1 key and exactly what it holds, written against the frozen serializer in Phase 11",
        writtenBy: "phase-11"
      }
    }
  },
  {
    /**
     * Card 2's approved sentence (mockup 5c, dc.html:195), WRITTEN IN PHASE 8
     * as its `awaiting` descriptor said it would be — against the shipped
     * adapter rather than against the artboard.
     *
     * IT IS A STATE-BOUND STRING, and the state is the consent gate. `trackWys`
     * sends nothing at all unless `bct_analytics_consent === "granted"` (Q7's
     * ratified full-suppression default, plan §8.3), so asserting flatly that
     * coarse counts are sent would be false for every visitor who declined and
     * for every visitor who has not chosen. The Data page therefore renders
     * this variant ONLY in the state that makes it true, and renders a truthful
     * state line otherwise (`content/watch-your-step/data.ts`). That is stop
     * condition SC-2, fixed in architecture rather than in copy (R8).
     *
     * The sentence stops where the artboard's second sentence begins. That
     * second sentence — the first-party counter — is not stored here at all:
     * it lives in `content/watch-your-step/config.ts` behind
     * `aggregateCounterSentence()`, so it is absent from the DOM while
     * `WYS_AGGREGATE_ENABLED` is false (SC-12, Q22). Two sentences, two truth
     * conditions, two homes — one record each.
     *
     * Status and origin follow the file's own mapping: approved artboard copy
     * is `published` + `BEN_APPROVED`. It was `draft` +
     * `IMPLEMENTATION_PLACEHOLDER` only because no wording existed yet.
     */
    id: "analytics",
    surfaceKind: "general",
    status: "published",
    origin: "BEN_APPROVED",
    sourceIds: ["artboard-5c-data-card-2", "wys-spec-19", "docs-legal-analytics"],
    variantSources: {
      short: ["artboard-5c-data-card-2"]
    },
    variants: {
      short:
        "Page analytics, and coarse counts: someone started, finished a stop, used replay, reached a carry, asked for depth.",
      full: {
        awaiting: "/privacy and /cookies analytics prose, written in Phase 11 against the frozen event allowlist",
        writtenBy: "phase-11"
      }
    }
  },
  {
    id: "provenance",
    surfaceKind: "general",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    sourceIds: ["wys-spec-23", "packet-one-definition"],
    variants: {
      full: {
        awaiting: "the public explanation of how provenance labels are computed, once Phase 4 has shipped them",
        writtenBy: "phase-11"
      }
    }
  },
  {
    /**
     * The record exists so cross-references resolve. Its ON-SCREEN form is not
     * prose at all: it is produced by lib/approval-state.ts, because approval
     * state is data, never copy (§6.6).
     */
    id: "captain-stamp",
    surfaceKind: "general",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    sourceIds: ["packet-captains-stamp"],
    variants: {
      full: {
        awaiting: "the public explanation of what a Captain's Stamp is; the stamp state itself renders from lib/approval-state.ts",
        writtenBy: "ben"
      }
    }
  },
  {
    id: "privacy-disclosure",
    surfaceKind: "general",
    status: "draft",
    origin: "IMPLEMENTATION_PLACEHOLDER",
    sourceIds: ["wys-spec-18", "app-privacy-page"],
    variants: {
      full: {
        awaiting: "the /privacy accuracy refresh in Phase 11, written against frozen code (§8b.2)",
        writtenBy: "phase-11"
      }
    }
  }
] as const satisfies readonly AnyCanonicalText[];

export function claimById(id: ClaimId): AnyCanonicalText {
  const record = claims.find((claim) => claim.id === id);
  if (!record) throw new Error(`No claim record with id "${id}".`);
  return record;
}
