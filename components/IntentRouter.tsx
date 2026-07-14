"use client";

import { useMemo, useRef, useState } from "react";
import { getNextNode, getNode, resolveResult } from "@/lib/route-resolver";
import type { RouteNodeId } from "@/lib/route-graph";

const steps = ["Capture", "Why", "Why-Not", "Commit"];

export function IntentRouter() {
  const [currentNodeId, setCurrentNodeId] = useState<RouteNodeId>("start");
  const [history, setHistory] = useState<RouteNodeId[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const node = getNode(currentNodeId);

  const activeStep = node.step;
  const result = useMemo(() => (node.type === "question" ? null : resolveResult(node)), [node]);

  function moveTo(nextNodeId: RouteNodeId) {
    setHistory((items) => [...items, currentNodeId]);
    setCurrentNodeId(nextNodeId);
    window.requestAnimationFrame(() => panelRef.current?.focus());
  }

  function chooseOption(optionId: string) {
    const next = getNextNode(currentNodeId, optionId);
    moveTo(next.id);
  }

  function goBack() {
    const previous = history.at(-1);
    if (!previous) return;
    setHistory((items) => items.slice(0, -1));
    setCurrentNodeId(previous);
  }

  function reset() {
    setHistory([]);
    setCurrentNodeId("start");
  }

  return (
    <section className="router-section" id="router" aria-labelledby="router-heading">
      <div className="section-heading">
        <p className="eyebrow">Deterministic router</p>
        <h2 id="router-heading">Pick a path. The rules stay visible.</h2>
        <p>The route is a fixed decision tree ported from the prototype, not a generative chat layer.</p>
      </div>
      <div className="router-card">
        <ol className="stepper" aria-label="Route progress">
          {steps.map((label, index) => {
            const step = index + 1;
            return (
              <li className={step === activeStep ? "active" : step < activeStep ? "complete" : ""} key={label}>
                <span>{step}</span>
                {label}
              </li>
            );
          })}
        </ol>
        <div aria-live="polite" ref={panelRef} tabIndex={-1}>
          {node.type === "question" ? (
            <div className="question-panel">
              <p className="question-label">{node.label}</p>
              <h3>{node.prompt}</h3>
              <div className="option-grid">
                {node.options.map((option) => (
                  <button type="button" onClick={() => chooseOption(option.id)} key={option.id}>
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="router-note">Your selection determines the next fixed question.</p>
            </div>
          ) : result ? (
            <div className="result-panel">
              <p className="question-label">{node.label}</p>
              <h3>Recommended destination</h3>
              <p>{result.explanation}</p>
              <article className="result-primary">
                <h4>{result.primary.title}</h4>
                <p>{result.primary.description}</p>
                <a href={result.primary.url} rel="noreferrer">
                  Enter this room <span aria-hidden="true">-&gt;</span>
                </a>
              </article>
              {result.secondary.length > 0 ? (
                <div className="secondary-results">
                  <p>Also relevant:</p>
                  {result.secondary.map((item) => (
                    <a href={item.url} rel="noreferrer" key={item.id}>
                      {item.title}
                    </a>
                  ))}
                </div>
              ) : null}
              <p className="timestamp-note">This router stores no personal data.</p>
            </div>
          ) : null}
        </div>
        <div className="router-controls">
          <button className="text-button" type="button" onClick={goBack} disabled={history.length === 0}>
            Back
          </button>
          <button className="text-button" type="button" onClick={reset}>
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}
