export type CompanyExperiment = {
  slug: string;
  title: string;
  status: "active" | "complete" | "observing";
  date: string;
  question: string;
  observation: string;
  evidence: string[];
  currentConclusion: string;
  unresolvedBoundary: string;
};

export const COMPANY_EXPERIMENTS: readonly CompanyExperiment[] = [
  {
    slug: "20-dollar-company",
    title: "The $20 Company Experiment",
    status: "active",
    date: "2026-09-10",
    question: "How much of a real one-person company can run with one $20/month ChatGPT Plus subscription as its only required AI operating expense?",
    observation: "The Benchantech rebuild has so far stayed on ordinary Next.js, React, GitHub, Vercel, static content, and deterministic browser behavior. No paid AI API is required by the public site.",
    evidence: ["The company constitution prohibits additional required paid AI dependencies.", "The public site renders deterministic artifacts rather than calling a model for each visitor.", "The repository itself carries the current operating state and authority rules."],
    currentConclusion: "A consumer AI subscription can currently supply a large share of the cognitive and editorial work while the published system remains ordinary software. The interesting boundary is increasingly authority and verification, not raw generation capability.",
    unresolvedBoundary: "The experiment has not yet established how far this remains true as operational workflows become more autonomous or require external actions beyond GitHub."
  },
  {
    slug: "chatgpt-github-operation",
    title: "Operating the Company Through ChatGPT and GitHub",
    status: "active",
    date: "2026-09-10",
    question: "Can ChatGPT act as the company's primary cognitive operating surface while GitHub carries durable state?",
    observation: "A new Benchantech mission branch, company constitution, current-state file, Developer Forward migration, preservation rules, and public content changes were created directly through the connected GitHub workflow from ChatGPT.",
    evidence: ["GitHub acts as shared durable state rather than requiring a separate agent database.", "Repository instructions tell future workers what authority and cost constraints are in force.", "Implementation work can be reduced to narrow engineering tasks after direction, evidence synthesis, and content architecture are completed in chat."],
    currentConclusion: "For this content-heavy company, ChatGPT plus GitHub is already sufficient for a meaningful portion of planning, synthesis, writing, governance, and repository maintenance.",
    unresolvedBoundary: "Runtime rendering, local build execution, and some environment-specific debugging may still justify specialist coding-tool involvement."
  },
  {
    slug: "codex-usage-meter",
    title: "A Usage Meter Maintained by the AI Workforce",
    status: "observing",
    date: "2026-09-10",
    question: "Can the $20 AI workforce publish its own current usage and reset state without adding another paid service?",
    observation: "The installed Codex CLI can expose the relevant usage/reset state locally, allowing a lightweight local job to normalize that observation and update a tracked site artifact.",
    evidence: ["The source is the authenticated local CLI rather than a new paid API.", "The public site only needs the normalized deterministic artifact.", "The update path can be restricted to the exact usage data file and ordinary Git operations."],
    currentConclusion: "The meter can remain inside the $20 architecture when the existing CLI supplies the observation and the site publishes only the resulting data artifact.",
    unresolvedBoundary: "The stability of the CLI-visible usage representation should be monitored; a format change should fail visibly rather than fabricate history."
  }
] as const;

export function companyExperiment(slug: string): CompanyExperiment {
  const experiment = COMPANY_EXPERIMENTS.find((entry) => entry.slug === slug);
  if (!experiment) throw new Error(`Unknown company experiment: ${slug}`);
  return experiment;
}
