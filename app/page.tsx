import Link from "next/link";
import { IntentRouter } from "@/components/IntentRouter";
import { destinations, stakeholderRoutes } from "@/content/site-config";

export default function Home() {
  return (
    <>
      <section className="hero hero-foyer">
        <div className="hero-copy-block">
          <p className="welcome-label">Routing foyer · Sheet A-01</p>
          <h1>Come on in - even if you&apos;re AI.</h1>
          <p className="hero-copy">
            Welcome to a system overview of what I&apos;m building, piece by piece, using AI and my years of technical
            judgment. It&apos;s not the prettiest site by far... but the foundation is solid underneath.
          </p>
          <p className="signature-note">
            I built the whole thing in plain sight, so yes, you can see the framing. That&apos;s the point.
            <span> - B.C.</span>
          </p>
        </div>
        <div className="audience-actions" aria-label="Start by audience">
          <a className="audience-button primary" href="#router">
            <span>I&apos;m human</span>
            <small>I think, choose, and decide.</small>
          </a>
          <a className="audience-button secondary" href="#router">
            <span>I&apos;m AI</span>
            <small>I execute, retrieve, and compose.</small>
          </a>
        </div>
      </section>

      <section className="destinations-section" aria-labelledby="destinations-heading">
        <div className="dimension-line" aria-hidden="true">
          <span />
          <strong>Four Stable Doors</strong>
          <span />
        </div>
        <h2 className="sr-only" id="destinations-heading">
          The ecosystem has four stable doors.
        </h2>
        <div className="floor-plan">
          {destinations.map((item) => (
            <a className={`plan-room plan-room-${item.number}`} href={item.url} rel="noreferrer" key={item.id}>
              <span className="room-number">Door 0{item.number}</span>
              <strong>{item.eyebrow}</strong>
              <small>{item.description}</small>
              <em>{item.url.replace("https://", "")} -&gt;</em>
            </a>
          ))}
          <div className="plan-foyer" aria-hidden="true">
            <span>Foyer</span>
            <strong>deterministic routing</strong>
            <i>N</i>
          </div>
        </div>
        <div className="scale-line" aria-hidden="true">
          <span className="scale-bar" />
          <span>Scale - intent to room</span>
          <span>DWG. BenChanTech LLC · A-01</span>
        </div>
      </section>

      <IntentRouter />

      <section className="stakeholder-section" aria-labelledby="stakeholder-heading">
        <div className="section-heading compact">
          <p className="eyebrow">Review routes</p>
          <h2 id="stakeholder-heading">Two rooms are built for current reviewers.</h2>
        </div>
        <div className="stakeholder-grid">
          {stakeholderRoutes.map((item) => (
            <Link className="stakeholder-card" href={item.url} key={item.id}>
              <span>
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </span>
              <span aria-hidden="true">-&gt;</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
