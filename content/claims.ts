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
 *
 * PHASE 11 wrote the `full` variants (plan §8b.1: "Phase 11 keeps only the
 * legal-page prose pass, writing `full` onto these same records against frozen
 * code"). Two rules governed that pass and both are load-bearing:
 *
 *  1. **A `full` on a BEN_APPROVED record may state only what its cited sources
 *     state.** Those records resolve to `canon`, and `canon` means "may render
 *     as Ben-attributed". The Phase 6 gate caught four records whose longer
 *     variants EXTENDED an approved sentence with claims that appear in no
 *     source; the fix was per-variant citation, and it only works if the
 *     citation is honest. Each `full` below is a longer PRESENTATION of the
 *     claim its `variantSources` name — §6.8's "one definition, many
 *     presentations" — never a new claim wearing an old record's origin.
 *  2. **Prose this build authored goes to a non-Ben origin.** `provenance` and
 *     `privacy-disclosure` are exactly that, and they moved from
 *     `draft` + IMPLEMENTATION_PLACEHOLDER to `published` + AI_SYNTHESIS —
 *     which resolves to `marked`, so they render WITH "Drafted during
 *     implementation — not Ben's words" and their draft mark. `published`
 *     rather than `draft` for the same reason `content/watch-your-step/data.ts`
 *     gave in Phase 8: Q21's flag exists to stop this build publishing draft
 *     BEN doctrine, and a privacy page that silently withheld its own account
 *     of what it stores would be worse than one that shows it labelled.
 *
 * Everything Phase 11 wrote is on the Final-copy escalation list in
 * docs/facelift-unapproved.md, and every changed sentence is in
 * docs/facelift-copy-diff.md with the code line that forced it.
 */

import type { AnyCanonicalText } from "@/lib/canonical-text";
import { WYS_STORAGE_KEY } from "@/lib/wys/local-state";

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
    sourceIds: ["artboard-4a-disclosure-strip", "wys-spec-22", "wys-spec-28"],
    variantSources: {
      inline: ["artboard-4a-disclosure-strip"],
      full: ["artboard-4a-disclosure-strip", "wys-spec-22", "wys-spec-28"]
    },
    variants: {
      inline:
        "You're not talking to AI anywhere on this site. No chatbot, no coach, no generated answers.",
      /**
       * PHASE 11, /ai-disclosure. Three sourced claims and no fourth:
       * (WYS §22) "FUTURE COACH — SCHEMA ONLY, DISABLED IN V0 … Do not
       * implement runtime calls yet"; (WYS §28) "no AI SDK in v0 client bundle,
       * no chat SDK"; artboard 4a's "No chatbot, no coach, no generated
       * answers." Nothing here promises a model will never run — it says what
       * this build contains.
       */
      full:
        "No page on this site calls an AI model while you use it. There is no chatbot, no coach and no generated answer anywhere in the course: the coach that might exist one day is a disabled schema with no runtime call behind it, and the bundle this site ships to a browser contains no AI SDK and no chat SDK."
    }
  },
  {
    id: "ai-assisted-ben-approved",
    surfaceKind: "general",
    status: "published",
    origin: "BEN_APPROVED",
    sourceIds: ["artboard-4a-disclosure-strip", "artboard-4a-how-the-site-is-run", "packet-crew-manifest"],
    variantSources: {
      inline: ["artboard-4a-disclosure-strip"],
      full: ["artboard-4a-disclosure-strip", "artboard-4a-how-the-site-is-run", "packet-crew-manifest"]
    },
    variants: {
      inline: "AI did help build the site and draft the copy — as crew, listed in the manifest.",
      /**
       * PHASE 11, /ai-disclosure. SC-1 requires the approval language on that
       * page to match the disclosure strip word for word, and it does — but
       * NOT by being restated here. The approval sentence is
       * `disclosureApprovalLine()` in lib/approval-state.ts, and
       * /ai-disclosure renders that function, exactly as the strip does. This
       * variant carries the OTHER half: what the crew did and where each one
       * is listed (artboard 5d /crew, "Each AI aboard, its access, and its
       * limits").
       */
      full:
        "AI tools drafted copy, wrote code and did research for this site, as crew rather than as authors. Each system aboard is named in the Crew Manifest with what it was given access to and what it was not allowed to decide."
    }
  },
  {
    id: "ai-role-boundaries",
    surfaceKind: "general",
    status: "published",
    origin: "BEN_APPROVED",
    sourceIds: ["artboard-4a-how-the-site-is-run", "packet-captains-stamp", "code-approval-state"],
    variantSources: {
      short: ["artboard-4a-how-the-site-is-run"],
      full: ["artboard-4a-how-the-site-is-run", "packet-captains-stamp", "code-approval-state"]
    },
    variants: {
      short: "AI can crew the ship. It can't sign the logbook.",
      /**
       * PHASE 11, /ai-disclosure. The boundary, not the state: WHAT has been
       * signed is data (lib/approval-state.ts), never wording, so this variant
       * says only what the roles are and where the current answer is read
       * from. tests/governance-strings.test.ts keeps the state literals out of
       * app/ and components/ for the same reason.
       */
      full:
        "A tool may draft, code or research; only a person can sign something into the record as a position. Which sections have been signed is a stored value rather than a sentence, so it can change without anyone editing this page, and the Ship's Log is where each change is written down."
    }
  },
  {
    id: "localStorage",
    surfaceKind: "general",
    status: "published",
    origin: "BEN_APPROVED",
    sourceIds: [
      "artboard-5a-posture-footnote",
      "artboard-5b-rulebook-note",
      "wys-spec-17",
      "wys-spec-18",
      "code-wys-local-state"
    ],
    variantSources: {
      inline: ["artboard-5a-posture-footnote"],
      full: ["wys-spec-17", "wys-spec-18", "code-wys-local-state"]
    },
    variants: {
      inline: "Stays in this browser. Never sent.",
      /**
       * NO `short` VARIANT, AND THAT IS THE FIX FOR A STANDING ORDER 07 BREACH
       * FOUND AT THE PHASE 12 GATE.
       *
       * This key used to read "Stored here only. Export as text any time." —
       * the same eight words, from the same source (`artboard-5b-rulebook-note`),
       * as `rulebookStorageText` in `content/watch-your-step/progress.ts`. Two
       * canonical nodes for one artboard sentence is exactly what Order 07
       * ("One idea, one canonical definition") forbids, and `/standing-orders`
       * publishes that order live.
       *
       * The Progress record is the owner — it is the one that renders, on the
       * screen the artboard draws — and this variant had no consumer at all:
       * `/privacy` and `/cookies` read `full`, Lesson Zero reads `inline`.
       * Nothing that renders anywhere was removed, and no line of preserved
       * copy was touched. A caller asking for a shorter form here now falls
       * back to `full`, which is the documented direction.
       *
       * The check that should have caught this had a twelve-word floor and the
       * sentence is eight words long; `tests/canonical-text.test.ts` now floors
       * both duplicate checks at six.
       */
      /**
       * PHASE 11, /privacy and /cookies. The list is (WYS §18)'s own "This
       * browser can store" list, plus §17's local judgments, and the key is
       * COMPOSED from `WYS_STORAGE_KEY` rather than typed — the same rule
       * `content/watch-your-step/data.ts` applies to `key: wys:v1 · raw JSON ↓`,
       * so changing the storage key changes the legal page.
       */
      full:
        `Watch Your Step keeps your course state in this browser, under a single namespaced key called ${WYS_STORAGE_KEY}. It holds whether you completed onboarding, your selected pace and time preference, where you are in the curriculum, which fictional exercises you completed, the choices you kept, your local rulebook, and whether you asked for deeper practice. Nothing in it is copied to a server, and the course keeps working if the browser refuses to store it at all.`
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
    sourceIds: [
      "artboard-5c-data-card-2",
      "wys-spec-18",
      "wys-spec-19",
      "docs-legal-analytics",
      "code-wys-telemetry"
    ],
    variantSources: {
      short: ["artboard-5c-data-card-2"],
      full: ["wys-spec-18", "wys-spec-19", "code-wys-telemetry"]
    },
    variants: {
      short:
        "Page analytics, and coarse counts: someone started, finished a stop, used replay, reached a carry, asked for depth.",
      /**
       * PHASE 11, /privacy and /cookies. (WYS §18)'s "Ben may receive" list,
       * with §19.1A's "Do not include semantic learner answers" stated as the
       * limit it is. The aggregate clause keeps §18's conditional — "if the
       * first-party aggregate endpoint is enabled" — because the endpoint is
       * NOT enabled and a flat assertion would be false; that it is not built
       * is said outright by `legal-aggregate-not-built` in content/legal.ts,
       * beside this one.
       */
      full:
        "Ben may receive only what is necessary to understand how the course is used, and only what the enabled analytics allow: ordinary page and route analytics, coarse curriculum engagement events, an anonymous signal that someone wants deeper practice, and — only if the first-party aggregate endpoint is ever enabled — aggregate counts for selected structured exercises. The event names are a closed list and the properties they may carry are a closed list, and no entry in either one is a learner's answer."
    }
  },
  {
    /**
     * PHASE 11 wrote this against the shipped label table, and MOVED IT to
     * `published` + AI_SYNTHESIS. It is build description, not Ben doctrine, so
     * it renders `marked` — the words plus "Drafted during implementation — not
     * Ben's words" plus its draft mark — rather than as canon.
     */
    id: "provenance",
    surfaceKind: "general",
    status: "published",
    origin: "AI_SYNTHESIS",
    sourceIds: ["wys-spec-23", "packet-one-definition", "code-content-status"],
    variantSources: {
      full: ["wys-spec-23", "code-content-status"]
    },
    variants: {
      full:
        "Every piece of writing on this site carries a record of where it came from, and two fields on that record decide what happens to it: one says how far along it is, the other says who produced it. Together they decide whether it may be shown at all, whether it must be shown with a line naming its author, and whether it may be presented as a person's position. Nothing that fails those checks is quietly published unlabelled; it is withheld, and the label says so in its place."
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
    /**
     * PHASE 11 wrote this against frozen code, and MOVED IT to `published` +
     * AI_SYNTHESIS for the same reason as `provenance` above. It is the
     * paragraph that opens the enlarged /privacy surface and points at the
     * Data page as a supplement — §8b.1: "The Data page supplements and does
     * not supersede the legal pages."
     */
    id: "privacy-disclosure",
    surfaceKind: "general",
    status: "published",
    origin: "AI_SYNTHESIS",
    sourceIds: ["wys-spec-18", "wys-spec-20", "app-privacy-page", "code-wys-local-state"],
    variantSources: {
      full: ["wys-spec-18", "wys-spec-20", "app-privacy-page"]
    },
    variants: {
      full:
        "This site now carries more than a routing foyer. It also carries a finite course, a set of pages describing how the site is run, and state that lives in the browser you are reading this in. This policy covers all of it. The course's own Data page shows the same facts for your browser specifically, and reading it is a supplement to this policy rather than a replacement for it."
    }
  }
] as const satisfies readonly AnyCanonicalText[];

export function claimById(id: ClaimId): AnyCanonicalText {
  const record = claims.find((claim) => claim.id === id);
  if (!record) throw new Error(`No claim record with id "${id}".`);
  return record;
}
