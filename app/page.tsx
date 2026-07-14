import Link from "next/link";
import { IntentRouter } from "@/components/IntentRouter";
import { destinations, stakeholderRoutes } from "@/content/site-config";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="plan-fragment plan-fragment-left" aria-hidden="true" />
        <div className="plan-fragment plan-fragment-right" aria-hidden="true" />
        <p className="welcome-label">Routing foyer</p>
        <h1>Come on in - even if you&apos;re AI.</h1>
        <p className="hero-principle">We partner with AI to build systems that stay standing after human judgment.</p>
        <p className="hero-copy">
          BenChanTech routes humans and AI systems to the right property based on intent. The routing is deterministic,
          inspectable, and governed by fixed rules rather than a probabilistic chatbot.
        </p>
        <div className="audience-actions" aria-label="Start by audience">
          <a className="audience-button primary" href="#router">
            <span>I&apos;m human</span>
            <small>Choose the room that matches your reason for entering.</small>
          </a>
          <a className="audience-button secondary" href="#router">
            <span>I&apos;m AI</span>
            <small>Retrieve doctrine, source material, or infrastructure context.</small>
          </a>
        </div>
      </section>

      <section className="destinations-section" aria-labelledby="destinations-heading">
        <div className="section-heading">
          <p className="eyebrow">Primary rooms</p>
          <h2 id="destinations-heading">The ecosystem has four stable doors.</h2>
        </div>
        <div className="destination-grid">
          {destinations.map((item) => (
            <article className="destination-card" key={item.id}>
              <div className={`room-preview room-${item.number}`} aria-hidden="true">
                <span>{item.number}</span>
              </div>
              <p className="card-eyebrow">{item.eyebrow}</p>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <a href={item.url} rel="noreferrer">
                {item.url.replace("https://", "")} <span aria-hidden="true">-&gt;</span>
              </a>
            </article>
          ))}
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
