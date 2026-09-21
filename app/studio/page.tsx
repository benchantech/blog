import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio.com Experiment Archive - BenChanTech",
  description: "A preserved reviewer surface for Ben Chan's Studio.com experiments and the product-design lessons they produced.",
  alternates: { canonical: "/studio" },
  openGraph: {
    title: "Studio.com Experiment Archive - BenChanTech",
    description: "A preserved record of Studio.com experimentation, product testing, and human-AI design boundaries.",
    url: "/studio"
  }
};

export default function StudioPage() {
  return (
    <section className="detail-page">
      <p className="eyebrow">Studio.com experiment archive</p>
      <h1>This preserved surface records what the Studio.com experiments taught.</h1>
      <p>
        Ben Chan used Studio.com to test how quickly AI-assisted products could move from an idea to sustained use.
        The active product offers have ended, but the practical findings remain part of the company&apos;s evidence.
      </p>

      <div className="detail-grid">
        <article>
          <h2>Prototype speed is not product proof</h2>
          <p>
            AI can compress the time required to build an experiment. It does not prove that the result is accurate,
            durable, useful, or worth returning to over time.
          </p>
        </article>
        <article>
          <h2>Longitudinal use reveals the boundary</h2>
          <p>
            Memory, continuity, drift, and trust failures emerge through repeated use. A strong first session cannot
            substitute for evidence gathered across days or weeks.
          </p>
        </article>
        <article>
          <h2>Human authority stays explicit</h2>
          <p>
            AI may generate options, structure an experience, and make iteration cheaper. Domain judgment and the
            decision about what is safe or true remain human responsibilities.
          </p>
        </article>
        <article>
          <h2>Retirement is also evidence</h2>
          <p>
            Ending an offer does not erase the experiment. Preserving this route keeps the record legible without
            presenting a retired product as current.
          </p>
        </article>
      </div>

      <p>
        Current work continues through the public Ben Chan Tech experiment and its preserved case, method, and
        operating-record surfaces.
      </p>
    </section>
  );
}
