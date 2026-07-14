import { destinations, stakeholderRoutes } from "@/content/site-config";
import { routeNodes, type RouteNode, type RouteNodeId } from "@/lib/route-graph";

export const destinationById = Object.fromEntries(destinations.map((item) => [item.id, item]));
export const stakeholderById = Object.fromEntries(stakeholderRoutes.map((item) => [item.id, item]));

export function getNode(nodeId: RouteNodeId): RouteNode {
  const node = routeNodes[nodeId];
  if (!node) throw new Error(`Unknown route node: ${nodeId}`);
  return node;
}

export function getNextNode(currentNodeId: RouteNodeId, optionId: string): RouteNode {
  const node = getNode(currentNodeId);
  if (node.type !== "question") throw new Error(`Node ${currentNodeId} is not a question`);
  const option = node.options.find((item) => item.id === optionId);
  if (!option) throw new Error(`Unknown option ${optionId} for node ${currentNodeId}`);
  return getNode(option.nextNodeId);
}

export function resolveResult(node: RouteNode) {
  if (node.type === "result") {
    const primary = destinationById[node.destinationId];
    if (!primary) throw new Error(`Unknown destination: ${node.destinationId}`);
    const secondary = (node.secondaryDestinationIds ?? []).map((id) => {
      const destination = destinationById[id];
      if (!destination) throw new Error(`Unknown secondary destination: ${id}`);
      return destination;
    });
    return { kind: "destination" as const, primary, secondary, explanation: node.explanation };
  }

  if (node.type === "stakeholder-result") {
    const primary = stakeholderById[node.stakeholderId];
    if (!primary) throw new Error(`Unknown stakeholder route: ${node.stakeholderId}`);
    return { kind: "stakeholder" as const, primary, secondary: [], explanation: node.explanation };
  }

  throw new Error(`Node ${node.id} is not a result`);
}
