const responseKit = [
  "a short observation prompt",
  "relevant guidance from Ben's approved teaching",
  "one important alternative to the parent's first interpretation",
  "a boundary around what should not be attempted at home",
  "one recommended next step",
  "a concise question or summary for the teacher or appropriate professional"
];

const escalationMoves = [
  "stop the provoking activity",
  "preserve the child's exact words",
  "separate observations from conclusions",
  "identify escalation signals",
  "prepare a concise summary",
  "contact the appropriate human"
];

const successSignals = [
  "observes more clearly",
  "reacts less quickly",
  "protects the child's relationship with music",
  "preserves the teacher's role",
  "recognizes what should not be solved at home",
  "asks better questions",
  "chooses one appropriate next move",
  "becomes less dependent on the application over time"
];

export default function StudioPage() {
  return (
    <section className="detail-page">
      <p className="eyebrow">Studio.com route</p>
      <h1>Violin Stand Partner helps parents handle the uncertain moments between violin lessons.</h1>
      <p>
        A child resists practice. An instruction is remembered differently at home. A string will not stay in tune.
        Something hurts. A parent is unsure whether to help, wait, stop, or contact someone more qualified.
      </p>
      <p>
        Violin Stand Partner begins with that situation. It helps the parent establish what actually happened, consider
        the most important missing side, and choose one bounded next step without becoming the child&apos;s second violin
        teacher.
      </p>

      <aside className="detail-callout">
        <p className="eyebrow">The Studio.com fit</p>
        <h2>AI is capable crew. It is not captain.</h2>
        <p>
          This is not a generic AI violin coach. It is a parent-first continuity system built around a stricter
          constraint: AI may organize observations, retrieve approved teaching, compare possibilities, prepare better
          questions, and assemble a focused response kit.
        </p>
        <p>
          It may not replace the parent&apos;s judgment, the child&apos;s experience, the teacher&apos;s instructional
          authority, Ben Chan&apos;s actual teaching, or the expertise of an appropriate professional.
        </p>
      </aside>

      <div className="detail-grid">
        <article>
          <h2>First move</h2>
          <p>
            A parent often arrives with a conclusion: my child is being difficult, the teacher&apos;s instructions did
            not work, the violin is broken, or her wrist hurts because her posture is wrong.
          </p>
          <p>
            The application should not reinforce the conclusion simply because it sounds plausible. It asks the smallest
            question that materially changes the route: what did the child actually say, what did the parent see or
            hear, when did it happen, what changed, and what remains uncertain?
          </p>
          <p>Observation comes before interpretation.</p>
        </article>

        <article>
          <h2>Response kit</h2>
          <p>
            The product does not begin by assigning a broad curriculum. It turns the situation in front of the parent
            into a focused response kit.
          </p>
          <ul className="detail-list">
            {responseKit.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>The purpose is not to produce more advice. It is to make today&apos;s decision smaller and clearer.</p>
        </article>

        <article>
          <h2>Human authority</h2>
          <p>
            The application must first recognize whose judgment is authoritative. The child has authority over what they
            feel and experience. The parent has authority over immediate protective action and family context. The
            teacher has authority over violin instruction.
          </p>
          <p>
            A qualified luthier or repair professional has authority over consequential instrument work. An appropriate
            clinician has authority over medical evaluation and clearance.
          </p>
          <p>
            The application may help prepare the right human conversation. It must not expand its own jurisdiction
            merely because it can generate a plausible answer.
          </p>
        </article>

        <article>
          <h2>Ben is the teacher</h2>
          <p>
            Ben&apos;s approved stories, demonstrations, principles, decision trees, and teaching materials remain the
            primary instructional source. The AI may retrieve, compare, summarize, and apply that material to today&apos;s
            situation.
          </p>
          <p>
            It may not manufacture a Ben story, quotation, memory, or personal experience when no verified source
            supports it. Generated fluency does not create authorship. Attribution does not create authority.
          </p>
        </article>
      </div>

      <div className="detail-grid">
        <article>
          <h2>Safety changes the objective</h2>
          <p>
            When a violin concern crosses into pain, injury, significant emotional distress, unsafe adult behavior,
            hearing changes, structural instrument work, or another professional jurisdiction, the normal coaching
            objective stops. The application moves from advisor to coordinator.
          </p>
          <ul className="detail-list">
            {escalationMoves.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            It must not diagnose, treat, medically clear, supervise professional-only work, or provide partial
            procedural instructions after recognizing a boundary.
          </p>
        </article>

        <article>
          <h2>The quiet loop</h2>
          <p>The application uses the YY Method™ without repeatedly explaining it.</p>
          <dl className="method-list">
            <div>
              <dt>Capture</dt>
              <dd>What actually happened?</dd>
            </div>
            <div>
              <dt>Why</dt>
              <dd>What may be contributing?</dd>
            </div>
            <div>
              <dt>Why-Not</dt>
              <dd>What important side may be missing?</dd>
            </div>
            <div>
              <dt>Commit</dt>
              <dd>What is the smallest useful next move?</dd>
            </div>
            <div>
              <dt>Timestamp</dt>
              <dd>What changed, and what remains unresolved?</dd>
            </div>
          </dl>
          <p>
            The parent experiences the method through the questions, the restraint, and the quality of the resulting
            judgment.
          </p>
        </article>

        <article>
          <h2>What this is not</h2>
          <p>
            It is not a replacement for the child&apos;s teacher, a diagnosis engine, a remote instrument-repair guide, a
            system for turning parents into violin instructors, or a promise that AI can resolve every concern at home.
          </p>
          <p>It is a continuity and judgment system for the days when the teacher is not in the room.</p>
        </article>

        <article>
          <h2>Why now</h2>
          <p>
            The necessary pieces now exist: a parent-first problem, an approved teaching archive, explicit authority
            boundaries, situation-specific response kits, safety and professional-jurisdiction rules, continuity across
            unresolved concerns, and a method designed to strengthen rather than replace human judgment.
          </p>
          <p>
            This allows the product to be evaluated as a governed coaching application rather than a speculative AI
            demonstration.
          </p>
        </article>
      </div>

      <aside className="detail-callout">
        <p className="eyebrow">Success</p>
        <h2>Every interaction should end smaller than it began.</h2>
        <p>The application succeeds when the parent:</p>
        <ul className="detail-list columns">
          {successSignals.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </aside>
    </section>
  );
}
