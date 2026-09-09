import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CANONICAL_SURFACE_GROUP_LABELS,
  MACHINE_SURFACE_PATHS,
  SITE_ORIGIN,
  absoluteUrl,
  RETIRED_SURFACES,
  canonicalSurfacePaths,
  canonicalSurfaces,
  humanCanonicalSurfaces
} from "@/content/canonical-surfaces";
import { agentBootstrap, agentBootstrapText, historicalSnapshotInstruction } from "@/content/ship/agent-bootstrap";
import { authorShipState, authorShipStateJson } from "@/lib/author-ship-state";
import { llmsTxt } from "@/lib/llms-txt";
import { approvalState } from "@/lib/approval-state";
import { WYS_STOP_IDS } from "@/content/watch-your-step/weeks";
import { isExternalSourceRef } from "@/content/source-refs";

/**
 * The four machine surfaces (plan Phase 9): `/sitemap.xml`, `/robots.txt`,
 * `/llms.txt` and `/author-ship/state.json`.
 *
 * These are the surfaces with no visual review. Nobody looks at them, so every
 * property the plan names for them is asserted here instead: current canonical
 * surfaces only, one canonical node per concept, the route roster matching the
 * real `app/` tree, `force-static` on both route handlers, no digest, no Ben
 * slot filled with prose, and `AGENTS.md` carrying the same bootstrap string
 * the code does.
 */

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* -------------------------------------------------------------------------- */
/* The roster matches the real route tree                                     */
/* -------------------------------------------------------------------------- */

/** Every `page.tsx` under `app/`, as a URL path. Route groups are stripped. */
function routePathsFromDisk(): string[] {
  const appDir = path.join(repoRoot, "app");
  const found: string[] = [];

  function walk(dir: string) {
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (entry !== "page.tsx") continue;
      const relative = path.relative(appDir, path.dirname(full)).split(path.sep);
      const segments = relative.filter((segment) => segment !== "" && !segment.startsWith("("));
      found.push(`/${segments.join("/")}`.replace(/\/$/, "") || "/");
    }
  }

  walk(appDir);
  return found;
}

test("the roster and the app/ route tree describe the same site", () => {
  const disk = new Set(routePathsFromDisk());
  const roster = new Set(canonicalSurfacePaths());

  // The dynamic template is not a surface; its nine concrete URLs are.
  assert.ok(disk.delete("/watch-your-step/stop/[stopId]"), "the per-stop route still exists");

  /*
   * RETIRED ROUTES: on disk, shadowed by a redirect, not canonical.
   *
   * Watch Your Step is retired from public discovery but NOT deleted — the
   * deletion contract forbids removing any of its files, so its nine page.tsx
   * routes are still here. They are therefore removed from BOTH sides of the
   * parity check rather than from neither, and the assertion below is what
   * stops that being a loophole: a route may only leave the roster this way if
   * a redirect actually shadows it.
   */
  const config = readFileSync(path.join(repoRoot, "next.config.ts"), "utf8");
  for (const retired of RETIRED_SURFACES) {
    // The nine per-stop URLs are served by the `[stopId]` template, which is
    // deleted from `disk` above, so they legitimately have no page file of
    // their own. Every other retired route must actually exist — you may only
    // retire something that is there.
    const servedByTemplate = retired.startsWith("/watch-your-step/stop/");
    if (!servedByTemplate) {
      assert.ok(
        disk.has(retired),
        `${retired} is registered as retired but has no page file — retire only what exists`
      );
    }
    assert.ok(
      !roster.has(retired),
      `${retired} is both retired and canonical; it cannot be both`
    );
    // The wildcard `/watch-your-step/:path+` covers every course URL below the
    // landing, so a route is shadowed by its own rule or by that one.
    const shadowed =
      config.includes(`source: "${retired}"`) ||
      config.includes('source: "/watch-your-step/:path+"');
    assert.ok(shadowed, `${retired} was dropped from discovery with no redirect behind it`);
    disk.delete(retired);
  }
  for (const id of WYS_STOP_IDS) {
    const stop = `/watch-your-step/stop/${id}`;
    if (RETIRED_SURFACES.includes(stop)) continue;
    assert.ok(roster.has(stop), `roster is missing stop ${id}`);
    roster.delete(stop);
  }

  // Machine mirrors are surfaces without a page.tsx.
  for (const machinePath of Object.values(MACHINE_SURFACE_PATHS)) {
    roster.delete(machinePath);
  }

  const missingFromRoster = [...disk].filter((route) => !roster.has(route)).sort();
  const missingFromDisk = [...roster].filter((route) => !disk.has(route)).sort();

  assert.deepEqual(missingFromRoster, [], "a route exists that no machine surface maps");
  assert.deepEqual(missingFromDisk, [], "the roster names a route that does not exist");
});

test("no surface is listed twice — one canonical node per concept", () => {
  const paths = canonicalSurfacePaths();
  assert.equal(new Set(paths).size, paths.length);
});

test("the roster lists no redirect and no historical alternative", () => {
  // `/about`, `/lab`, `/posts` and `/upwork` are redirects in
  // next.config.ts. They keep working; they are not canonical URLs.
  for (const redirect of ["/about", "/lab", "/posts", "/upwork"]) {
    assert.ok(!canonicalSurfacePaths().includes(redirect), `${redirect} is a redirect, not a surface`);
  }
  assert.ok(!canonicalSurfacePaths().includes("/watch-your-step/stop/[stopId]"));
});

test("every roster label is a name the site already uses", () => {
  for (const surface of canonicalSurfaces) {
    assert.ok(surface.label.trim().length > 0, `${surface.path} has no label`);
    assert.ok(!surface.label.includes("undefined"));
  }
  // Seven groups: Developer Forward joined the roster as the site's primary
  // product entry. Pinned so a group cannot be added without a decision.
  assert.equal(Object.keys(CANONICAL_SURFACE_GROUP_LABELS).length, 7);
});

test("the origin is stated once — the roster and the preserved metadataBase agree", () => {
  // app/layout.tsx is preserved verbatim (user constraint 2), so the origin
  // cannot be moved into the roster. It is bound to it by this assertion
  // instead: two literals, one checked equality.
  const layout = readFileSync(path.join(repoRoot, "app", "layout.tsx"), "utf8");
  assert.ok(layout.includes(`metadataBase: new URL("${SITE_ORIGIN}")`));
  assert.equal(absoluteUrl("/"), SITE_ORIGIN);
  assert.equal(absoluteUrl("/bridge"), `${SITE_ORIGIN}/bridge`);
});

/* -------------------------------------------------------------------------- */
/* Both route handlers are static                                             */
/* -------------------------------------------------------------------------- */

test("no machine surface makes the build dynamic", () => {
  const files = [
    path.join("app", "llms.txt", "route.ts"),
    path.join("app", "author-ship", "state.json", "route.ts"),
    path.join("app", "sitemap.ts"),
    path.join("app", "robots.ts")
  ];
  for (const relative of files) {
    const full = path.join(repoRoot, relative);
    assert.ok(existsSync(full), `${relative} is missing`);
    const source = readFileSync(full, "utf8");
    assert.ok(
      source.includes('export const dynamic = "force-static"'),
      `${relative} must declare force-static — a plain GET handler builds as a dynamic route in Next 15`
    );
    const code = source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
    assert.ok(
      !/\bheaders\s*\(\)|\bcookies\s*\(\)|\bdraftMode\s*\(|\bnew Date\b|:\s*Request\b/.test(code),
      `${relative} reads something request- or clock-dependent`
    );
  }
});

/* -------------------------------------------------------------------------- */
/* llms.txt is a map, not a corpus                                            */
/* -------------------------------------------------------------------------- */

test("llms.txt lists every current canonical surface and nothing else", () => {
  const text = llmsTxt();
  for (const surface of canonicalSurfaces) {
    assert.ok(text.includes(absoluteUrl(surface.path)), `llms.txt omits ${surface.path}`);
  }
  for (const redirect of ["/about", "/lab", "/posts", "/upwork"]) {
    assert.ok(!text.includes(`${SITE_ORIGIN}${redirect}`), `llms.txt lists the ${redirect} redirect`);
  }
});

test("llms.txt carries the instruction about superseded material", () => {
  const text = llmsTxt();
  assert.ok(text.includes(agentBootstrapText()));
  assert.ok(text.includes(historicalSnapshotInstruction()));
  // Indexed from the END, not from position 3. The ADR sentence was inserted
  // before it on 2026-09-08 and a front-indexed reference silently pointed at
  // the wrong sentence — the drift Standing Order 07 exists to prevent, caught
  // here rather than shipped.
  assert.equal(
    historicalSnapshotInstruction(),
    agentBootstrap.lines[agentBootstrap.lines.length - 1]
  );
  // The ADR instruction is part of the boot path, not an optional extra.
  assert.ok(
    agentBootstrapText().includes("docs/adr/README.md"),
    "the boot instruction no longer points agents at the ADRs"
  );
});

test("llms.txt is a map — it copies no curriculum prose into itself", () => {
  const text = llmsTxt();
  // Every non-heading, non-blank line is either a link row or a governance
  // line read from approvalState. A corpus dump would fail this immediately.
  for (const line of text.split("\n")) {
    if (line === "" || line.startsWith("#")) continue;
    if (line === agentBootstrapText()) continue;
    assert.ok(line.startsWith("- "), `unexpected line in llms.txt: ${line}`);
  }
});

test("llms.txt prints no digest", () => {
  assert.equal(approvalState.keel.sha256, null);
  assert.equal(/\b[0-9a-f]{64}\b/.test(llmsTxt()), false);
});

/* -------------------------------------------------------------------------- */
/* state.json                                                                 */
/* -------------------------------------------------------------------------- */

/** The packet's key set, plus the in-band canonical-node key the plan requires. */
const REQUIRED_STATE_KEYS: readonly string[] = [
  "canonical_human_node",
  "mission",
  "current_doctrine",
  "standing_orders_version",
  "current_experiments",
  "resolved_decisions",
  "open_questions",
  "deprecated_assumptions",
  "source_refs",
  "tool_roles",
  "last_captains_round",
  "last_approved_snapshot"
];

test("state.json carries the packet's key set and the canonical-node key", () => {
  const state = authorShipState() as Record<string, unknown>;
  for (const key of REQUIRED_STATE_KEYS) {
    assert.ok(key in state, `state.json is missing "${key}"`);
  }
});

test("state.json documents its canonical human nodes in band, per key", () => {
  const state = authorShipState();
  const byKey = state.canonical_human_node.by_key;
  for (const key of REQUIRED_STATE_KEYS) {
    if (key === "canonical_human_node") continue;
    assert.ok(key in byKey, `no canonical human node declared for "${key}"`);
  }
  assert.equal(state.canonical_human_node.self, absoluteUrl("/bridge"));
  // Only external citations may declare no human node.
  const nulls = Object.entries(byKey)
    .filter(([, value]) => value === null)
    .map(([key]) => key);
  assert.deepEqual(nulls, ["source_refs"]);
});

test("state.json prints no digest and no fabricated hash", () => {
  const json = authorShipStateJson();
  assert.equal(state_sha_free(json), true);
  assert.equal(authorShipState().current_doctrine.sha256, null);
});

function state_sha_free(json: string): boolean {
  return !/\b[0-9a-f]{64}\b/.test(json);
}

test("state.json never prints prose a public surface must withhold", () => {
  const json = JSON.parse(authorShipStateJson()) as unknown;

  function walkValue(value: unknown): void {
    if (Array.isArray(value)) {
      value.forEach(walkValue);
      return;
    }
    if (value === null || typeof value !== "object") return;
    const record = value as Record<string, unknown>;
    if (record.withheld === true) {
      assert.equal("text" in record, false, "a withheld object still carries its words");
      assert.ok(typeof record.provenance === "string");
    }
    if (typeof record.text === "string") {
      assert.ok(typeof record.provenance === "string", "prose without a provenance label");
    }
    Object.values(record).forEach(walkValue);
  }

  walkValue(json);
});

test("every source ref state.json publishes resolves", () => {
  for (const ref of authorShipState().source_refs) {
    assert.ok(isExternalSourceRef(ref.id), `unresolved source ref "${ref.id}"`);
  }
});

test("state.json states no mission it has not been given", () => {
  // R8: a claim the implementation cannot support is narrowed, never worded.
  // No canonical mission record exists, so the key renders an awaiting
  // descriptor and points at the human node that will own it.
  const mission = authorShipState().mission;
  assert.equal(mission.state, "awaiting");
  assert.equal(mission.canonical_human_node, "/watch-your-step");
});

test("deprecated_assumptions renders the Q25 machinery, and is empty because nothing is superseded", () => {
  assert.deepEqual(authorShipState().deprecated_assumptions, []);
});

test("state.json is valid JSON with a trailing newline", () => {
  const json = authorShipStateJson();
  assert.ok(json.endsWith("\n"));
  assert.doesNotThrow(() => JSON.parse(json));
});

/* -------------------------------------------------------------------------- */
/* AGENTS.md and the code cannot disagree                                     */
/* -------------------------------------------------------------------------- */

test("AGENTS.md carries the bootstrap verbatim, from the one module that defines it", () => {
  const agents = readFileSync(path.join(repoRoot, "AGENTS.md"), "utf8");
  assert.ok(
    agents.includes(agentBootstrapText()),
    "AGENTS.md and content/ship/agent-bootstrap.ts disagree — edit the module"
  );
  for (const line of agentBootstrap.lines) {
    assert.ok(agents.includes(line));
  }
});

test("the sitemap carries human pages only", () => {
  const human = humanCanonicalSurfaces();
  assert.ok(human.length > 0);
  for (const surface of human) {
    assert.notEqual(surface.group, "machine");
  }
  assert.equal(human.length, canonicalSurfaces.length - 2);
});
