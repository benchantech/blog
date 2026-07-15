export default function NeonPage() {
  return (
    <section className="detail-page">
      <p className="eyebrow">Neon route</p>
      <h1>Neon turns a musician&apos;s archive into a searchable practice memory.</h1>
      <p>
        BenChanViolin Library is the proof surface: a Next.js site backed by Neon Postgres where decades of YouTube
        teaching can be organized into reviewed clips, canonical technique tags, learner phrases, transcript clues, and
        timestamped practice entry points.
      </p>
      <p>
        The database is not just storage for videos. It is the layer that lets human review, musical taxonomy, transcript
        language, and future YY Method™ practice threads meet without turning the archive into a black-box chatbot.
      </p>

      <aside className="detail-callout">
        <p className="eyebrow">Primary review path</p>
        <h2>Inspect the live BenChanViolin Library.</h2>
        <p>
          Neon reviewers can start with the working library surface: reviewed technique clips, canonical tags, learner
          phrases, transcript clues, and timestamped YouTube entry points.
        </p>
        <a className="detail-link" href="https://benchanviolin.com/library">
          Visit benchanviolin.com/library <span aria-hidden="true">-&gt;</span>
        </a>
      </aside>

      <div className="detail-grid">
        <article>
          <h2>Current library</h2>
          <p>
            The sibling BenChanViolin app already models videos, segments, tag groups, tags, aliases, and segment-tag
            relationships in Postgres. Public pages search reviewed technique clips by validated concepts and the words a
            player would actually type.
          </p>
        </article>
        <article>
          <h2>Search shape</h2>
          <p>
            Queries combine exact labels, slugs, learner aliases, trigram fuzzy matches, full-text search, and contextual
            transcript clues. A search for bow bounce or tense bow hand can land on a tag, a reviewed segment, or the
            original YouTube timestamp.
          </p>
        </article>
        <article>
          <h2>Human review</h2>
          <p>
            Segments carry titles, summaries, use-when guidance, suggested experiments, reflection prompts, review
            status, source files, and quality scores. AI can propose candidates, but public retrieval is separated from
            review and publication.
          </p>
        </article>
        <article>
          <h2>YY Method™ expansion</h2>
          <p>
            The same structure can feed Capture, Why, Why-Not, Commit, and Timestamp. A musician arrives with an
            observation; the system retrieves relevant human teaching, keeps competing explanations alive, and returns a
            bounded next experiment.
          </p>
        </article>
      </div>

      <div className="detail-grid">
        <article>
          <h2>Why Neon</h2>
          <p>
            Postgres fits the work because the product needs relational truth and retrieval flexibility at the same time:
            durable source records, public/private flags, review workflows, searchable text, aliases, timestamps, and
            future event history.
          </p>
        </article>
        <article>
          <h2>White-label path</h2>
          <p>
            Many serious musicians have large libraries: lessons, masterclasses, rehearsals, essays, streams, and
            annotations. The reusable offer is a branded expert-learning layer that turns each library into searchable
            practice guidance without erasing the artist&apos;s voice.
          </p>
        </article>
        <article>
          <h2>What scales</h2>
          <p>
            The schema can generalize from violin to other instruments by swapping taxonomy, source collections,
            reviewed segments, learner phrases, and practice prompts while preserving the same review, retrieval, and
            method loop.
          </p>
        </article>
        <article>
          <h2>What stays bounded</h2>
          <p>
            The system should not claim authority because text was retrieved. It should show the source, explain the
            match, preserve uncertainty, and make it easy for the musician or teacher to correct what does not fit.
          </p>
        </article>
      </div>

      <p>
        The funding wedge is practical: use Neon to make Ben&apos;s existing teaching archive genuinely useful first, then
        package the pattern for other musicians whose knowledge is already public or recorded but not yet queryable,
        teachable, or method-aware.
      </p>
    </section>
  );
}
