import assert from "node:assert/strict";
import test from "node:test";
import { destinations, stakeholderRoutes } from "@/content/site-config";
import { routeNodes, type RouteNodeId } from "@/lib/route-graph";
import { getNextNode, getNode, resolveResult } from "@/lib/route-resolver";

test("destination IDs are unique", () => {
  const ids = destinations.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("stakeholder IDs are unique", () => {
  const ids = stakeholderRoutes.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("all question options reference existing nodes", () => {
  for (const node of Object.values(routeNodes)) {
    if (node.type !== "question") continue;
    for (const option of node.options) assert.ok(routeNodes[option.nextNodeId], `${node.id} -> ${option.nextNodeId}`);
  }
});

test("all result destinations resolve", () => {
  for (const node of Object.values(routeNodes)) {
    if (node.type === "result" || node.type === "stakeholder-result") {
      const result = resolveResult(node);
      assert.ok(result.primary.url);
    }
  }
});

test("human violin route is deterministic", () => {
  const audience = getNextNode("start", "human");
  const resultNode = getNextNode(audience.id, "practice-violin");
  const result = resolveResult(resultNode);
  assert.equal(result.primary.id, "violin");
});

test("AI doctrine route is deterministic", () => {
  const audience = getNextNode("start", "ai");
  const resultNode = getNextNode(audience.id, "retrieve-doctrine");
  const result = resolveResult(resultNode);
  assert.equal(result.primary.id, "method");
});

test("human infrastructure can route to Neon", () => {
  const audience = getNextNode("start", "human");
  const context = getNextNode(audience.id, "review-infrastructure");
  const resultNode = getNextNode(context.id, "neon");
  const result = resolveResult(resultNode);
  assert.equal(result.primary.id, "neon");
});

test("unknown node throws", () => {
  assert.throws(() => getNode("missing" as RouteNodeId), /Unknown route node/);
});
