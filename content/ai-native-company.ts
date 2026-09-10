/**
 * `/` — the AI-native company experiment.
 *
 * EVERY LEARNER-FACING STRING ON THE HOME PAGE LIVES HERE, which is the site's
 * standing rule rather than a preference for this file: `app/` renders governed
 * content and authors none. `tests/canonical-text.test.ts` enforces a FLOOR of
 * twelve words, and the section eyebrows, link labels and card titles this
 * module gained on 2026-09-10 are all shorter than that — they were typed into
 * `app/page.tsx` and no guard fired. Short copy is still copy: "Free · no
 * account · deterministic" is a claim about the product, and a claim needs one
 * definition wherever it is short enough to retype.
 */

export const AI_NATIVE_COMPANY = {
  eyebrow: "Ben Chan Tech · live operating experiment",
  heading: "How far can one person push AI execution on a $20 monthly AI bill?",
  lede:
    "Ben Chan Tech is being rebuilt as an AI-native company with ChatGPT Plus as its only required AI operating expense. Ben sets direction, retains judgment and accountability, and delegates as much ordinary cognitive and execution work as the tools can responsibly carry.",
  costRule: {
    label: "$20 / month",
    heading: "One required AI expense.",
    body:
      "The core company must remain buildable, publishable and operable with one ChatGPT Plus subscription. Paid AI APIs, agent platforms, vector databases, AI CMS products and additional AI subscriptions may be tested separately, but none may become required infrastructure for the public knowledge surface."
  },
  experiment: {
    heading: "The company is the case study.",
    body:
      "The question is not whether AI can produce a demo. The question is how much real company work can move from human execution to AI execution while human judgment, provenance and responsibility remain intact.",
    measures: [
      "Captain minutes per useful shipped outcome",
      "Interventions caused by judgment, authority, missing context, failure or tooling",
      "Work completed in ChatGPT before specialist coding work is required",
      "Claims and pages traceable to real evidence rather than synthetic authority"
    ]
  },
  operatingModel: {
    heading: "ChatGPT is the primary cognitive workforce.",
    body:
      "Research, synthesis, simulation, planning, writing, content architecture, evidence mapping, review and much of site maintenance should happen inside the subscription first. GitHub holds durable state. The public site prefers deterministic artifacts. Specialist coding tools are used only when runtime engineering materially requires them.",
    rule: "If the final artifact can be produced in ChatGPT and stored as ordinary code or content, do not add another paid AI dependency."
  },
  evidence: {
    heading: "Built from accumulated human evidence.",
    body:
      "The experiment starts with decades of software and music work, real professional cases, product experiments, essays, transcripts, technical systems and published methods. AI can search, pressure-test and recombine that record. It cannot manufacture Ben's experience, authority or conclusions."
  },
  questions: {
    heading: "Questions this experiment should be able to answer with evidence",
    items: [
      "Can ChatGPT maintain a production company website through GitHub?",
      "When is a $20 consumer AI subscription enough for real business operations?",
      "What company work still requires human judgment after execution becomes cheap?",
      "When does a coding agent add leverage, and when is chat enough?",
      "Can synthetic simulations improve an evidence corpus without becoming synthetic authority?",
      "How much human review does AI-generated public knowledge actually require?"
    ]
  },
  developerForward: {
    heading: "Developer Forward continues as an evidence surface.",
    body:
      "The full Developer Forward offering is discontinued for now. Developer Forward Lite remains available as a free, deterministic five-case experience. The broader Developer Forward name remains the home for developer-judgment research and a possible future traditional course, but there is currently no paid destination or upgrade promise."
  },
  principle: "Give AI as much room as it can responsibly carry. Keep the boundaries that matter.",

  /**
   * The section labels, in render order.
   *
   * Keyed rather than positional so a reordered page cannot silently relabel a
   * section — the failure a numbered array invites is the one nobody sees.
   */
  eyebrows: {
    costRule: "The operating constraint",
    experiment: "The live experiment",
    operatingModel: "Operating model",
    evidence: "Evidence, not synthetic authority",
    developerForward: "Developer Forward",
    questions: "Questions the company is trying to answer",
    reviewers: "Review routes",
    principle: "Standing principle"
  },

  /** The reviewer section's heading and the label every preserved card carries. */
  reviewers: {
    heading: "Two rooms are built for current reviewers.",
    cardLabel: "Preserved"
  },

  /** The two Developer Forward cards. */
  developerForwardLinks: [
    {
      href: "/developer-forward",
      label: "Indexed evidence surface",
      title: "Explore Developer Forward"
    },
    {
      href: "/developer-forward-lite",
      label: "Free · no account · deterministic",
      title: "Run Developer Forward Lite"
    }
  ]
} as const;

/**
 * One evidence card.
 *
 * `external` IS OPTIONAL AND THE TYPE SAYS SO, which is the whole reason this
 * interface exists. The array was declared `as const` in `app/page.tsx` with
 * `external: true` on only its last three members, so its element type was a
 * union in which four members had no such property — and `item.external` in the
 * renderer failed the production typecheck. The page was CORRECT at runtime
 * (`undefined` is falsy, so internal links took the `<Link>` branch), which is
 * the awkward part: `next dev` served it happily and only `next build` refused,
 * so the branch ran locally and could not deploy.
 *
 * Naming the shape fixes it once. `NavItem` in `content/nav.ts` already
 * declares the same optional flag for the same reason.
 */
export interface EvidenceLink {
  href: string;
  /** The small line above the title. A category, never a claim. */
  label: string;
  title: string;
  /** Rendered as a new-tab anchor with `rel="noopener noreferrer"`. */
  external?: boolean;
}

/**
 * The evidence surfaces, in render order.
 *
 * Internal routes first, then the three off-site records. Moved out of
 * `app/page.tsx` on 2026-09-10 with the rest of that page's copy.
 */
export const EVIDENCE_LINKS: readonly EvidenceLink[] = [
  { href: "/developer-forward", label: "Developer judgment", title: "Developer Forward" },
  {
    href: "/developer-forward-lite",
    label: "Free deterministic experience",
    title: "Developer Forward Lite"
  },
  { href: "/neon", label: "Technical case study", title: "Neon / retrieval architecture" },
  { href: "/upwork", label: "Professional evidence", title: "Freelancer to CTO record" },
  { href: "https://yymethod.com", label: "Canonical method", title: "YY Method™", external: true },
  {
    href: "https://yyandme.benchantech.com",
    label: "Narrative record",
    title: "YY & Me",
    external: true
  },
  {
    href: "https://benchanviolin.substack.com",
    label: "Essays and field notes",
    title: "Resonant Patterns",
    external: true
  }
];
