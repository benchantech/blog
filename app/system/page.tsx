import { routeNodes } from "@/lib/route-graph";

export default function SystemPage() {
  return (
    <section className="detail-page">
      <p className="eyebrow">Inspectable map</p>
      <h1>The routing system is fixed and reviewable.</h1>
      <p>
        The current graph contains {Object.keys(routeNodes).length} route nodes. Question nodes only advance to declared
        nodes, and result nodes resolve to known destination or stakeholder records.
      </p>
    </section>
  );
}
