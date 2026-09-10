export const DEVELOPER_FORWARD_CURRENT_STATUS = {
  metadataTitle: "Developer Forward — Developer Judgment in the AI Era | BenChanTech",
  metadataDescription:
    "Developer Forward is Ben Chan Tech's evidence surface for developer judgment in AI-assisted engineering: what to trust, verify, delegate, promise, and take back.",
  eyebrow: "Developer Forward · current status",
  heading: "Developer Forward is becoming a public developer-judgment evidence surface.",
  body:
    "The previous full Developer Forward offering has been discontinued. Developer Forward Lite remains available as a free, deterministic five-case experience. A broader Developer Forward course may return later in a traditional course format, but no paid destination is currently planned or promised.",
  liteCta: "Try Developer Forward Lite",
  futureLabel: "Future course",
  futureBody:
    "The broader curriculum is still being developed from Ben Chan's real professional case corpus. If a full course returns, this page will become its canonical home. Until then, there is no checkout, coupon, waitlist, or upgrade path.",
  evidenceHeading: "Developer judgment in the AI era",
  evidenceBody:
    "Developer Forward focuses on the parts of engineering that remain consequential when implementation gets cheaper: what to trust, what to verify, what to delegate, what to promise, when to push back, and when to take the wheel back.",
  corpusHeading: "The evidence base continues to grow.",
  corpusBody:
    "The work draws from more than forty real case families from Ben Chan's professional history, plus current AI-era experiments. Cases may be anonymized or composited where necessary to protect clients, employers, colleagues, confidential information, or identifying details while preserving the underlying decision pressure.",
  closeHeading: "Start with the five-case Lite experience.",
  closeBody:
    "Lite is the working public sample today. The larger Developer Forward body of work remains here as an indexed research and evidence surface while the eventual course format is still undecided."
} as const;

export const DEVELOPER_FORWARD_LITE_CURRENT_STATUS = {
  metadataTitle: "Developer Forward Lite — Free Developer Judgment Practice | BenChanTech",
  metadataDescription:
    "A free, deterministic five-case developer-judgment experience. No account, no runtime AI, and no paid upgrade is currently offered.",
  noUpgradeStatement: "No paid upgrade is currently offered.",

  /*
   * WHAT THE COMPLETION SCREEN SAYS NOW, replacing a coupon (2026-09-10).
   *
   * Until this commit a learner who finished all five cases was told "You
   * earned your coupon", "It applies to Developer Forward on Studio", and given
   * an "Open your coupon →" link — which, after the AI-native pivot repointed
   * `couponTarget`, landed them on `/developer-forward`, a page that says in
   * its own words that there is "no checkout, coupon, waitlist, or upgrade
   * path". Two falsehoods in one block: there is no coupon, and Studio is no
   * longer the destination at all.
   *
   * This is the honest close for the same moment. It says what the learner
   * actually has — their own committed record — and where the work continues,
   * and it makes no offer, because there is none to make. `noUpgradeStatement`
   * above is reused rather than restated so the two cannot drift.
   */
  completion: {
    heading: "That is the five-case sample.",
    body:
      "What you committed is yours and stays in this browser. Developer Forward continues as a public evidence surface for developer judgment in the AI era, and it is where this work is written up.",
    cta: "See where the work continues →"
  }
} as const;
