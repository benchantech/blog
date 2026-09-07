/**
 * Trust Forward Lite - the 16 SHIP profile bodies.
 *
 * Keyed by the four SHIP bits, "0000" through "1111", which is exactly the
 * `profileKey` that `ShipResult` carries. Sixteen bodies, not 729: the profile
 * is the coarse SHIP-level reading and the fine-grained statement is the
 * recovered terminal narrative in `./narrative.ts`. The two are composed at the
 * reveal; neither is a substitute for the other.
 *
 * Verbatim from the codex package stamp
 * `01_trust-forward-lite-codex-package/config/trust-forward-lite.v1.json`,
 * `ship.profiles`. No wording here was authored in this repository.
 *
 * THE PUBLIC UI NEVER RENDERS "You are SHIP-0111." `code` is a label for the
 * observed pattern, not an identity claim about the learner, and the plan states
 * the constraint twice - at the reveal step ("Never `You are SHIP-...`") and
 * again in the launch checklist, where a test greps the built output. Compose
 * the code as an observed-pattern label; never as a second-person predicate.
 *
 * "NEW GAME PLUS" IS AN INTERNAL METAPHOR AND MUST NEVER APPEAR. The phrase
 * comes from the internal `SHIP_PROFILES.md` design note. It is a note about how
 * the 16 profiles were conceived, not learner-facing copy, and the same test
 * greps the built output for it. It appears nowhere in the strings below and
 * must not be reintroduced by a component, a heading, or an aria-label.
 *
 * `profile_headline` IS DELIBERATELY NOT PORTED. Ben's layer-07 ruling is
 * "Drop the old 3-value `profile_headline` from Lite v1.1"
 * (07_transition-copy-import-telemetry-resolution-2026-09-07/
 * BEN_APPROVED_RULINGS_2026-09-07.md, "Final profile"). The recovered CSV still
 * carries that column and it is not read - reading it back in because it is
 * present in the source data would restore the exact three-bucket headline the
 * ruling removed. There are seven fields per profile, and headline is not one
 * of them.
 *
 * Provenance: `recovered_prior_authoring`. These bodies arrived in the layer-01
 * codex package rather than being written here, and the tag must not drift to
 * `ben_canonical` merely because the wording now sits in this repository.
 *
 * Pure TypeScript. No React, no JSX, no CSS import, no component import - the
 * suite runs as `node --import tsx --test tests/*.test.ts` and cannot load a
 * `.css` specifier. All learner-facing prose lives in `content/`, which is why
 * these strings are here and not in the result component that renders them.
 */

/**
 * One SHIP profile body. Seven fields, all learner-facing prose except `code`,
 * which is a label. There is no headline field; see the header.
 */
export interface ShipProfile {
  /** `SHIP-0000` ... `SHIP-1111`. A pattern label. Never "You are SHIP-0000." */
  code: string;
  /** The short profile name, e.g. "Fast Path". */
  name: string;
  specialAbility: string;
  synthesis: string;
  strongestPattern: string;
  likelyTension: string;
  reflectionQuestion: string;
}

/**
 * The provenance tag for every string in this module. Recovered prior
 * authoring; not Ben-verbatim canon, not implementation-authored.
 */
export const SHIP_PROFILES_PROVENANCE = "recovered_prior_authoring" as const;

/**
 * profileKey (the four SHIP bits) -> profile body.
 *
 * All 16 keys are present. A missing key is not a rendering fallback case: every
 * one of the 729 terminal states resolves to one of these 16, so an absent key
 * means the SHIP reducer produced a bit string it should not have.
 */
export const SHIP_PROFILES: Record<string, ShipProfile> = {
  "0000": {
    code: "SHIP-0000",
    name: "Fast Path",
    specialAbility: "Moves from available scope, delegates cleanly, inspects proportionately, and keeps the work centered on the task.",
    synthesis: "You tend to preserve momentum by keeping decisions close to the visible request.",
    strongestPattern: "Speed and clarity can be an advantage when the consequence surface is genuinely contained.",
    likelyTension: "The pressure point is noticing when a seemingly bounded task has quietly become a trust or ownership problem.",
    reflectionQuestion: "What signal would make you stop treating the work as locally bounded?"
  },
  "0001": {
    code: "SHIP-0001",
    name: "Signal Bridge",
    specialAbility: "Keeps implementation moving while widening communication toward the people who depend on it.",
    synthesis: "You tend to act from the visible task while keeping relationship consequences in view.",
    strongestPattern: "Your strongest pattern is connecting delivery decisions to stakeholder continuity.",
    likelyTension: "The tension is that partnership awareness can outrun deeper scope or evidence checks.",
    reflectionQuestion: "When does protecting the relationship require slowing the technical move itself?"
  },
  "0010": {
    code: "SHIP-0010",
    name: "Proof Burst",
    specialAbility: "Moves quickly on scope but raises the verification bar before consequential completion.",
    synthesis: "You tend to accept the working frame while asking for stronger evidence before calling the work done.",
    strongestPattern: "Your strongest pattern is separating implementation momentum from proof of completion.",
    likelyTension: "The tension is whether scope assumptions deserve the same scrutiny you apply to verification.",
    reflectionQuestion: "What would make you inspect the request before investing in proving the implementation?"
  },
  "0011": {
    code: "SHIP-0011",
    name: "Proof Relay",
    specialAbility: "Pairs strong verification with active stakeholder continuity.",
    synthesis: "You tend to keep the initial frame moving while treating evidence and communication as part of delivery.",
    strongestPattern: "Your strongest pattern is making proof legible to the people affected by the work.",
    likelyTension: "The tension is that a well-verified answer can still be an answer to the wrong scope.",
    reflectionQuestion: "What would cause you to reopen the problem definition rather than strengthen the proof?"
  },
  "0100": {
    code: "SHIP-0100",
    name: "Anchor Hold",
    specialAbility: "Retains consequential ownership while allowing the task itself to stay simple.",
    synthesis: "You tend to let implementation move without overcomplicating scope while keeping responsibility close.",
    strongestPattern: "Your strongest pattern is refusing to let delegation erase accountability.",
    likelyTension: "The tension is whether retained ownership is paired with enough independent evidence.",
    reflectionQuestion: "What evidence do you need before retained ownership becomes more than retained responsibility?"
  },
  "0101": {
    code: "SHIP-0101",
    name: "Trust Anchor",
    specialAbility: "Holds consequential ownership while protecting stakeholder continuity.",
    synthesis: "You tend to keep responsibility close when the outcome still lands on you or the relationship.",
    strongestPattern: "Your strongest pattern is treating ownership as a trust obligation rather than a title.",
    likelyTension: "The tension is deciding when personal ownership should yield to stronger distributed systems.",
    reflectionQuestion: "What can you safely hand off without handing off the promise?"
  },
  "0110": {
    code: "SHIP-0110",
    name: "Control Loop",
    specialAbility: "Keeps consequential ownership and closes it with deeper verification.",
    synthesis: "You tend to retain authority where risk lands and independently establish enough evidence to approve the result.",
    strongestPattern: "Your strongest pattern is coupling ownership with proof.",
    likelyTension: "The tension is the cost of carrying both authority and verification yourself.",
    reflectionQuestion: "Which parts of your control loop could be delegated without weakening the final check?"
  },
  "0111": {
    code: "SHIP-0111",
    name: "Steward Loop",
    specialAbility: "Combines retained ownership, deep verification, and stakeholder continuity.",
    synthesis: "You tend to treat consequential delivery as a stewardship problem: someone must own the promise, the evidence, and the trust around it.",
    strongestPattern: "Your strongest pattern is integrating accountability, proof, and relationship context.",
    likelyTension: "The tension is over-retaining work that could be safely distributed.",
    reflectionQuestion: "What would have to be true for you to release more ownership without reducing stewardship?"
  },
  "1000": {
    code: "SHIP-1000",
    name: "Scope Scan",
    specialAbility: "Stops to clarify or inspect before committing, then keeps execution proportionate.",
    synthesis: "You tend to invest judgment early by making sure the request is actually understood.",
    strongestPattern: "Your strongest pattern is reducing ambiguity before momentum hardens into commitment.",
    likelyTension: "The tension is whether later ownership and verification stay as deliberate as the initial framing.",
    reflectionQuestion: "After the scope becomes clear, what determines how much evidence and ownership you retain?"
  },
  "1001": {
    code: "SHIP-1001",
    name: "Context Link",
    specialAbility: "Clarifies the real problem early and keeps stakeholder continuity in the frame.",
    synthesis: "You tend to widen the problem definition before committing and connect that definition to the people depending on it.",
    strongestPattern: "Your strongest pattern is treating context as part of the technical requirement.",
    likelyTension: "The tension is whether partnership pressure can pull you into commitments before proof is ready.",
    reflectionQuestion: "How do you keep relationship urgency from becoming technical certainty?"
  },
  "1010": {
    code: "SHIP-1010",
    name: "Invariant Scan",
    specialAbility: "Clarifies scope first, then independently verifies the conditions that matter.",
    synthesis: "You tend to challenge the initial frame and the final evidence rather than trusting either by default.",
    strongestPattern: "Your strongest pattern is checking both problem definition and proof.",
    likelyTension: "The tension is that stronger framing and verification can still leave ownership diffuse.",
    reflectionQuestion: "Who owns the final call when your evidence says the work is ready?"
  },
  "1011": {
    code: "SHIP-1011",
    name: "Signal Proof",
    specialAbility: "Connects clarified scope, deeper verification, and stakeholder communication.",
    synthesis: "You tend to make the problem explicit, prove what matters, and keep affected people oriented.",
    strongestPattern: "Your strongest pattern is turning technical evidence into shared confidence.",
    likelyTension: "The tension is whether ownership is explicit enough when the evidence becomes contested.",
    reflectionQuestion: "When reasonable people disagree about the proof, who has authority to decide?"
  },
  "1100": {
    code: "SHIP-1100",
    name: "Boundary Lock",
    specialAbility: "Clarifies scope and retains consequential ownership without automatically escalating verification.",
    synthesis: "You tend to define the boundary before committing and keep responsibility for what crosses it.",
    strongestPattern: "Your strongest pattern is making ownership follow explicit scope.",
    likelyTension: "The tension is whether a strong boundary can create false comfort when evidence is thin.",
    reflectionQuestion: "What would make you verify beyond the boundary you already defined?"
  },
  "1101": {
    code: "SHIP-1101",
    name: "Promise Guard",
    specialAbility: "Clarifies the boundary, retains responsibility, and keeps the stakeholder promise visible.",
    synthesis: "You tend to treat scope, ownership, and trust as a connected promise.",
    strongestPattern: "Your strongest pattern is resisting commitments whose boundaries are not yet clear.",
    likelyTension: "The tension is that promise discipline still needs a sufficiently strong evidence model.",
    reflectionQuestion: "What proof earns the right to close the promise?"
  },
  "1110": {
    code: "SHIP-1110",
    name: "Verification Gate",
    specialAbility: "Clarifies scope, retains consequential authority, and requires deeper evidence before approval.",
    synthesis: "You tend to place a deliberate gate between ambiguity and release.",
    strongestPattern: "Your strongest pattern is making final approval depend on both understood scope and independently established evidence.",
    likelyTension: "The tension is throughput: the gate can become a bottleneck if nothing is allowed to mature outside your direct control.",
    reflectionQuestion: "Which evidence can be produced by others while the approval gate remains yours?"
  },
  "1111": {
    code: "SHIP-1111",
    name: "Full Stack Steward",
    specialAbility: "Links scope, ownership, proof, and stakeholder trust into one approval loop.",
    synthesis: "You tend to treat consequential work as an end-to-end judgment system rather than a sequence of isolated technical tasks.",
    strongestPattern: "Your strongest pattern is maintaining continuity from problem framing through final promise.",
    likelyTension: "The tension is carrying too much of the system personally.",
    reflectionQuestion: "What structure would let the system preserve your standard without requiring your attention at every step?"
  }
};
