/**
 * The six narrative substitutions Ben approved, span by span.
 *
 * WHY THIS FILE EXISTS INSTEAD OF A PROVENANCE TAG.
 *
 * The first attempt marked composited narrative `ben_authored_composite`. Ben's
 * instruction was to "narrowly blur but maintain ben authored" — and he is
 * right: he reviewed and approved each of these six substitutions individually,
 * so the resulting text is his, not a machine's paraphrase of his. A provenance
 * tag saying otherwise would understate its authority.
 *
 * But "it's still Ben-authored" cannot mean "and therefore unchecked". So the
 * guarantee moves from a TAG to a DIFF: this file records the exact six
 * substitutions, and `tests/trust-forward-yy-content.test.ts` asserts that
 * applying them to Ben's source reproduces the shipped narrative EXACTLY. Any
 * seventh change, anywhere, fails the build.
 *
 * That is strictly stronger than the tag it replaces. A tag says "something
 * here was changed"; this says "precisely this was changed, and nothing else".
 *
 * WHAT IS NOT HERE, AND WHY.
 *
 * Quantities. An earlier pass blurred `24-48 hours`, `55 columns`, `10%`,
 * `15-20%`. All of them were dropped, for a reason that only became visible
 * once the decision layer was verified: those same figures appear VERBATIM in
 * the preserved choices — case 1's options still read "24-48 hour" and "(export
 * 55 columns)". Blurring the narrative while the choice states the number
 * protects nothing and buys a self-contradiction, where the story says "roughly
 * fifty" and the option says 55. A number that lives in the decision layer
 * cannot be hidden by editing the narrative around it.
 *
 * Two of that pass's blurs were also wrong on their own terms and are recorded
 * here so the mistake is not repeated: "long before I took it over" added a
 * magnitude claim ("long") the source does not make, and "a sixth to a fifth"
 * (16.7–20%) NARROWED the source's `15-20%` — a blur that increases precision
 * is not a blur.
 *
 * Party words ("the client", "my client") are untouched: role words, not
 * identifiers. Case 2 and Case 4 receive no substitutions at all.
 */

export interface ApprovedBlur {
  caseId: string;
  /** Exact text in Ben's source document. */
  from: string;
  /** Exact text as shipped. */
  to: string;
  /** Why this span names something concrete, in one line. */
  reason: string;
}

/**
 * Approved by Ben on 2026-09-08, span by span, after review.
 *
 * None of these strings appears anywhere in the decision layer — that was the
 * selection criterion. Each removes a name that narrows the field to a real
 * employer, client or era, while leaving the fact that carries the decision:
 * the system is old, inherited, and load-bearing.
 */
export const APPROVED_BLURS: readonly ApprovedBlur[] = [
  {
    caseId: "case-1",
    from: "written about a decade ago in an older version of PHP",
    to: "written long ago in an older server-side language",
    reason:
      "Names a language and an era. The decision never turns on which language it was — it turns on the system being old and inherited, which both survive."
  },
  {
    caseId: "case-1",
    from: "we were offering a SaaS platform",
    to: "we were offering a platform serving external clients",
    reason:
      "Names the vertical. 'Serving external clients' is the load-bearing fact: it is why an export request carries permission risk at all."
  },
  {
    caseId: "case-1",
    from: "had been with us since before I joined",
    to: "had been with us since before I took it over",
    reason:
      "'Before I joined' dates Ben against an employer. 'Before I took it over' keeps the only thing the decision needs — he inherited it rather than building it."
  },
  {
    caseId: "case-3",
    from: "a mobile app in React Native",
    to: "a mobile app on a cross-platform mobile framework",
    reason:
      "Names the framework. The deep-linking failure is a cross-platform problem, not a React Native one; the class of problem is preserved."
  },
  {
    caseId: "case-5",
    from: "I built it mostly bash script based with file caches",
    to: "I built it mostly out of lightweight scripting with file caches",
    reason:
      "Names the shell. What matters is that the first version was disposable and file-backed — that is what makes its growth into a system of record the case."
  },
  {
    caseId: "case-5",
    from: "so it would run off a micro server",
    to: "so it would run off a very small server",
    reason:
      "'Micro server' reads as a specific hosting tier. The decision needs only that the original footprint was tiny."
  },
  {
    caseId: "case-2",
    from: "the server was running on a much older version of PHP",
    to: "the server was running on a much older version of the server-side language it was built on",
    reason:
      "Names the language, in the same class as blur 1. Approved 2026-09-08 after a dropped paragraph was restored to case 2 checkpoint 4 and brought a second PHP mention back into the shipped text — blurring it in case 1 while shipping it in case 2 would have protected nothing."
  }
];

/** Apply the approved substitutions to a source narrative. Order-independent. */
export function applyApprovedBlurs(sourceText: string, caseId: string): string {
  let out = sourceText;
  for (const blur of APPROVED_BLURS) {
    if (blur.caseId !== caseId) continue;
    out = out.split(blur.from).join(blur.to);
  }
  return out;
}
