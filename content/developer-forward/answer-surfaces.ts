export type DeveloperForwardAnswer = {
  slug: string;
  question: string;
  title: string;
  description: string;
  answer: string;
  evidenceCase: string;
  evidence: string[];
  currentApplication: string;
  boundary: string;
  related: string[];
  provenance: string;
};

export const DEVELOPER_FORWARD_ANSWERS: readonly DeveloperForwardAnswer[] = [
  {
    slug: "can-you-trust-ai-generated-code",
    question: "Can you trust AI-generated code?",
    title: "Can You Trust AI-Generated Code?",
    description: "A consequence-based answer to when AI-generated code deserves trust, grounded in Ben Chan's real engineering cases.",
    answer:
      "Trust should follow evidence, not the fact that AI produced the code or the fact that the code looks polished. The amount of evidence you require should scale with the consequence, recoverability, detectability, exposure, and likelihood of failure.",
    evidenceCase: "Case 33 — Verification Scales With Consequence",
    evidence: [
      "Before generative AI, Ben built a payment system and deliberately spent far more effort on logging, transaction safety, queues, duplicate handling, adversarial testing, and layered verification than the happy path required.",
      "Years later the system encountered intermittent outages, duplicate submissions, attempted gaming, and coupon-code sabotage. The earlier safeguards made those failures visible or containable rather than silently trusting the normal path.",
      "The case separates implementation difficulty from verification depth: cheap generation does not reduce the consequence of being wrong."
    ],
    currentApplication:
      "AI makes convincing happy paths cheap. That increases the importance of independent evidence for consequential systems. A generated implementation can be a useful contribution while still requiring tests, observed behavior, security checks, runtime evidence, or human review appropriate to what failure would cost.",
    boundary:
      "This is not a rule to maximize testing everywhere. Low-consequence, reversible work can justify much lighter verification. The point is proportionality, not blanket distrust of AI-generated code.",
    related: ["how-to-verify-ai-generated-code", "when-is-ai-generated-work-complete", "how-much-work-can-ai-safely-own"],
    provenance:
      "Grounded in Ben Chan's canonical Case 33 historical record. The answer and AI-era application are a current synthesis of that evidence, not a claim that the historical case involved generative AI."
  },
  {
    slug: "how-to-verify-ai-generated-code",
    question: "How do you verify AI-generated code?",
    title: "How to Verify AI-Generated Code",
    description: "Verify AI-generated code by proving the behavior that matters, scaling checks to consequence, and separating mechanical completion from human judgment.",
    answer:
      "Start with the promise the code must keep. Verify the consequential paths against that promise with deterministic evidence where possible, then inspect the parts where correctness still depends on architecture, context, security, or judgment. Do not treat an AI claim of completion as proof that the required state occurred.",
    evidenceCase: "Cases 33 and 39 — Verification Scales With Consequence; Probably Complete Is Not Complete",
    evidence: [
      "Case 33 shows why verification depth should follow consequence rather than implementation effort.",
      "Case 39 records three live AI-workflow failures: required sections silently disappeared, an expected workflow transition was skipped, and a later artifact preserved meaning while drifting from the required structure.",
      "Those failures led to a practical split: people judge substance; deterministic checks should carry mechanical completion and conformance whenever those states matter."
    ],
    currentApplication:
      "A useful verification stack therefore begins with compilation, tests, static checks, and observable runtime behavior, but it does not end there. Confirm that required workflow steps happened, required fields exist, consequential assumptions are true, and the person shipping the change can still explain what they are standing behind.",
    boundary:
      "Mechanical validation does not prove good judgment. A perfectly conformant artifact can still embody a bad decision. Verification should remove avoidable checking from human attention so that human review can concentrate on substance and consequence.",
    related: ["can-you-trust-ai-generated-code", "when-is-ai-generated-work-complete", "how-much-work-can-ai-safely-own"],
    provenance:
      "Grounded in Ben Chan's canonical Cases 33 and 39. Case 39 is live human/AI workflow evidence from September 2026; hidden model causes remain unknown."
  },
  {
    slug: "how-much-work-can-ai-safely-own",
    question: "How much work can AI safely own?",
    title: "How Much Work Can AI Safely Own?",
    description: "Delegate AI execution according to bounded authority, consequence, verification, and recoverability rather than a fixed percentage of work.",
    answer:
      "There is no useful universal percentage. AI can carry more work when the desired outcome is explicit, authority is bounded, failure is recoverable, and the result can be independently checked. Human ownership becomes more important as consequences rise, ambiguity changes the goal, or the system would otherwise be allowed to redefine its own authority.",
    evidenceCase: "Cases 33 and 39, plus Ben Chan Tech's current operating experiment",
    evidence: [
      "Case 39 separates generative freedom from workflow authority: AI can decide how to fill a required structure without silently deciding that the structure or approval step no longer matters.",
      "Case 33 shows that lower execution cost does not lower consequence, so cheaper AI labor is not itself a reason to relax verification.",
      "Ben Chan Tech applies the same distinction operationally: ordinary execution is delegated aggressively while authority expansion, consequential judgment, unsupported public claims, and irreversible commitments remain escalation boundaries."
    ],
    currentApplication:
      "The practical target is not maximum AI autonomy. It is maximum useful output per unit of human judgment. Give AI ordinary decisions inside a known envelope, make the envelope observable, and widen it only when evidence shows that the surrounding checks are carrying the risk rather than merely hiding it.",
    boundary:
      "This does not require a human to inspect every token or approve every routine decision. If human review becomes the mechanical validator for everything, delegation has failed. The boundary should preserve judgment, not recreate manual execution under a new name.",
    related: ["can-you-trust-ai-generated-code", "how-to-verify-ai-generated-code", "when-is-ai-generated-work-complete"],
    provenance:
      "The historical evidence comes from Ben Chan's canonical case corpus. The company-operating application is current Ben Chan Tech practice and is presented as such, not retroactively inserted into the older cases."
  },
  {
    slug: "when-is-ai-generated-work-complete",
    question: "When is AI-generated work actually complete?",
    title: "When Is AI-Generated Work Actually Complete?",
    description: "AI-generated work is complete when independently observable required state exists, not when the output looks finished or the model says it is done.",
    answer:
      "Completion is an observable state, not a confidence signal. If a workflow requires specific artifacts, transitions, approvals, tests, or schema conformance, those conditions should be checked independently of the model that generated the work.",
    evidenceCase: "Case 39 — Probably Complete Is Not Complete",
    evidence: [
      "During construction of the Trust Forward case corpus, AI produced polished case objects that silently omitted required sections.",
      "Later, the conversation continued naturally even though an entire expected completed-case transition never occurred.",
      "After a reference structure had been demonstrated, another case preserved much of the meaning while using a different serialization. Ben detected and repaired all three classes of drift."
    ],
    currentApplication:
      "The resulting architecture is simple: allow probabilistic synthesis inside a provable workflow envelope. Validate completion, required transitions, structural conformance, provenance, and authority mechanically where those properties matter. Reserve human attention for whether the substance is actually good enough to ship.",
    boundary:
      "Not every creative or exploratory task needs rigid conformance. Exactness becomes important when structure controls downstream automation, provenance, approval state, contractual meaning, routing, or consequential action.",
    related: ["how-to-verify-ai-generated-code", "can-you-trust-ai-generated-code", "how-much-work-can-ai-safely-own"],
    provenance:
      "Grounded in the canonical live-workflow meta-case Probably Complete Is Not Complete. The observed omissions are historical evidence; explanations for why the model produced them are intentionally not asserted."
  },
  {
    slug: "does-ai-change-build-vs-buy",
    question: "Does AI change the build-vs-buy decision?",
    title: "Does AI Change Build vs Buy?",
    description: "AI can slash implementation cost without eliminating maintenance, security, support, operational knowledge, or long-term ownership.",
    answer:
      "AI changes the implementation-cost line, sometimes dramatically. It does not automatically change who owns maintenance, incidents, security judgment, support, accumulated operational knowledge, or future edge cases. Build versus buy is therefore still an ownership decision, not merely a code-generation decision.",
    evidenceCase: "Cases 17 and 18 — Push Back on Build vs Buy; Recommend Against Your Own Revenue",
    evidence: [
      "In Case 17, Ben pushed back on a custom internal metrics build, helped evaluate an existing vendor's security and operating process, and the client bought the product. Later bugs were handled by the vendor rather than becoming Ben's continuing burden.",
      "In Case 18, a larger custom platform would have created meaningful development revenue for Ben. He still recommended the established product and then built a serious prototype when the client wanted to test the custom path. The prototype exposed multi-tenant and operating complexity and the client ultimately bought the established option.",
      "Both cases preserve the same distinction: being capable of generating software is different from being willing and able to carry the system over time."
    ],
    currentApplication:
      "When AI makes a custom build look nearly free, enumerate the costs that remain after the first successful implementation: maintenance, hidden domain knowledge, incident response, vendor or data risk, support, security practice, integrations, and future human attention. Then compare systems, not codebases.",
    boundary:
      "This is not an argument to always buy. Custom differentiation, unavailable vendors, unacceptable data exposure, or unusually strong internal operating capability can reverse the decision. The AI-era mistake is assuming that cheaper construction settles the ownership question by itself.",
    related: ["how-much-work-can-ai-safely-own", "can-you-trust-ai-generated-code", "how-to-verify-ai-generated-code"],
    provenance:
      "Grounded in Ben Chan's canonical Cases 17 and 18. Client, vendor, pricing, NDA, and implementation details that are not established in the corpus remain intentionally unspecified."
  }
] as const;

export function developerForwardAnswer(slug: string): DeveloperForwardAnswer {
  const answer = DEVELOPER_FORWARD_ANSWERS.find((entry) => entry.slug === slug);
  if (!answer) throw new Error(`Unknown Developer Forward answer surface: ${slug}`);
  return answer;
}
