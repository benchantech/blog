import Link from "next/link";
import { currentBuild, registry, vessels, yardLog } from "@/content/site-config";

export default function Home() {
  return (
    <>
      <section className="hero yard-hero">
        <div className="hero-copy-block">
          <p className="welcome-label">BenChanTech · Yard record</p>
          <h1>Shipyard log.</h1>
          <p className="hero-copy">Independent systems, publications, and experiments by Ben Chan.</p>
        </div>
        <div className="yard-stamp" aria-label="Current yard status">
          <span>Log open</span>
          <strong>July 2026</strong>
        </div>
      </section>

      <section className="current-build-section" aria-labelledby="current-build-heading">
        <div className="section-heading compact">
          <p className="eyebrow">Current build</p>
          <h2 id="current-build-heading">{currentBuild.title}</h2>
          <p>{currentBuild.summary}</p>
        </div>
        <div className="build-ledger">
          <span>{currentBuild.status}</span>
          <strong>Deterministic routing · transcript-grounded retrieval</strong>
          <div>
            {currentBuild.links.map((link) => (
              <Link href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="yard-section" aria-labelledby="yard-heading">
        <div className="section-heading compact">
          <p className="eyebrow">In the yard</p>
          <h2 id="yard-heading">Active vessels and present condition.</h2>
        </div>
        <div className="yard-grid">
          {vessels.map((vessel) => (
            <a className="vessel-entry" href={vessel.href} rel="noreferrer" key={vessel.id}>
              <span className="vessel-meta">{vessel.type}</span>
              <strong>{vessel.name}</strong>
              <small>{vessel.latest}</small>
              <span className="vessel-footer">
                <em>{vessel.status}</em>
                <time>{vessel.latestDate}</time>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="yard-record-section" aria-labelledby="yard-log-heading">
        <div className="yard-log-panel">
          <div className="section-heading compact">
            <p className="eyebrow">Recent movements</p>
            <h2 id="yard-log-heading">Yard log</h2>
          </div>
          <ol className="yard-log">
            {yardLog.map((entry) => (
              <li key={`${entry.date}-${entry.event}`}>
                <time>{entry.date}</time>
                <p>{entry.event}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="registry-panel">
          <div className="section-heading compact">
            <p className="eyebrow">Registry</p>
            <h2>Vessel record</h2>
          </div>
          <table className="registry-table">
            <thead>
              <tr>
                <th scope="col">Vessel</th>
                <th scope="col">Launched</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {registry.map((entry) => (
                <tr key={entry.vessel}>
                  <td>{entry.vessel}</td>
                  <td>{entry.launched}</td>
                  <td>{entry.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
