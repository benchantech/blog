const productUrl = "https://studio.com/apps/benchanviolin/violin-for-parents";

export default function StudioPage() {
  return (
    <section className="detail-page">
      <p className="eyebrow">Studio.com route</p>
      <h1>Violin for Parents helps adults handle the uncertain moments between violin lessons.</h1>
      <p>
        Violin for Parents is the current public product: an audio-first, adult-facing AI continuity coach for parents
        and caregivers between violin lessons.
      </p>
      <p>
        It helps the parent establish what actually happened, consider the most important missing side, decide who owns
        the decision, and choose one bounded next step without becoming the child&apos;s second violin teacher.
      </p>
      <p>
        <a className="detail-link" href={productUrl} target="_blank" rel="noopener">
          Get help with today&apos;s violin situation
        </a>
      </p>

      <div className="detail-grid">
        <article>
          <h2>First move</h2>
          <p>
            A parent often arrives with a conclusion. The product should first separate observation from interpretation:
            what did the child say, what did the parent see or hear, what changed, and what remains uncertain?
          </p>
        </article>
        <article>
          <h2>AI boundary</h2>
          <p>
            AI may organize observations, retrieve approved teaching, compare possibilities, prepare better questions,
            and expose options. It must not silently replace the parent, child, current teacher, clinician, luthier, or
            Ben Chan&apos;s actual source material.
          </p>
        </article>
        <article>
          <h2>Human authority</h2>
          <p>
            The parent owns immediate protective action and family context. The teacher owns individualized violin
            instruction. Appropriate professionals own medical and instrument-repair decisions.
          </p>
        </article>
        <article>
          <h2>Why this belongs here</h2>
          <p>
            Ben Chan is a violinist, teacher, parent, and CTO building with AI. Violin for Parents is an applied example
            of designing AI around explicit authority and judgment boundaries.
          </p>
        </article>
      </div>

      <p>
        The public position is simple: use AI to see options and decide for yourself. In this product, AI helps narrow
        the situation; it does not take over the lesson.
      </p>
    </section>
  );
}
