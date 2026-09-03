import assert from "node:assert/strict";
import test from "node:test";
import {
  BEN_ORIGINS,
  CONTENT_ORIGINS,
  CONTENT_STATUSES,
  DRAFT_MARK_VARIANTS,
  NEW_PROVENANCE_LABELS,
  RENDER_BEN_REVIEWED,
  RENDER_MARKED_DRAFT,
  SURFACE_KINDS,
  type ContentOrigin,
  type LabelOrigin,
  type RenderPolicy,
  type SurfaceKind,
  draftMarkFor,
  hasProvenanceLabel,
  isBenOrigin,
  provenanceLabelFor,
  provenanceLabelPairs,
  renderPolicyFor,
  requiresDraftMark,
  validateProvenance
} from "@/lib/content-status";

/**
 * Provenance substrate (plan Phase 1, §6.1-§6.3).
 *
 * Written BEFORE any consumer exists, and entirely against pure modules: no
 * component import, no CSS, no rendering. That is the Phase 0 decision (Q15) —
 * Node cannot load a `.css` specifier, so the load-bearing logic has to be
 * testable without one.
 *
 * The guarantee that `marked` prose cannot render without its label is enforced
 * at the TYPE level by the required, branded `label` prop in
 * components/provenance/types.ts, not by an assertion here.
 */

/* -------------------------------------------------------------------------- */
/* The two enums                                                              */
/* -------------------------------------------------------------------------- */

test("ContentStatus carries the five WYS §7 members", () => {
  assert.deepEqual([...CONTENT_STATUSES], [
    "draft",
    "ben_reviewed",
    "published",
    "historical",
    "superseded"
  ]);
});

test("ContentOrigin carries nine members including IMPLEMENTATION_PLACEHOLDER", () => {
  assert.equal(CONTENT_ORIGINS.length, 9);
  assert.ok(CONTENT_ORIGINS.includes("IMPLEMENTATION_PLACEHOLDER"));
  for (const origin of [
    "BEN_AUTHORED",
    "BEN_APPROVED",
    "BEN_AUTHORED_VARIATION",
    "FICTIONAL_AUTHORED",
    "AI_ADAPTATION",
    "AI_SYNTHESIS",
    "EXTERNAL_SOURCE",
    "LEARNER_OWNED"
  ] as ContentOrigin[]) {
    assert.ok(CONTENT_ORIGINS.includes(origin), `${origin} is missing`);
  }
});

test("only the three Ben origins are Ben origins", () => {
  assert.deepEqual([...BEN_ORIGINS], ["BEN_AUTHORED", "BEN_APPROVED", "BEN_AUTHORED_VARIATION"]);
  assert.equal(isBenOrigin("AI_SYNTHESIS"), false);
  assert.equal(isBenOrigin("FICTIONAL_AUTHORED"), false);
  assert.equal(isBenOrigin("IMPLEMENTATION_PLACEHOLDER"), false);
  assert.equal(isBenOrigin("LEARNER_OWNED"), false);
  assert.equal(isBenOrigin("EXTERNAL_SOURCE"), false);
  assert.equal(isBenOrigin("INSUFFICIENT_SIGNAL"), false);
});

/* -------------------------------------------------------------------------- */
/* The ratified config constants                                              */
/* -------------------------------------------------------------------------- */

test("RENDER_BEN_REVIEWED ships false — production renders published only (Q13)", () => {
  assert.equal(RENDER_BEN_REVIEWED, false);
});

test("RENDER_MARKED_DRAFT ships false — WYS §7's literal whitelist (Q21)", () => {
  assert.equal(RENDER_MARKED_DRAFT, false);
});

/* -------------------------------------------------------------------------- */
/* Provenance labels (§6.3, WYS §23)                                          */
/* -------------------------------------------------------------------------- */

test("the seven WYS §23 strings are present verbatim", () => {
  assert.equal(provenanceLabelFor("human-source", "BEN_AUTHORED"), "Ben source");
  assert.equal(
    provenanceLabelFor("fictional-scenario", "FICTIONAL_AUTHORED"),
    "Fictional practice scenario — authored for Watch Your Step"
  );
  assert.equal(
    provenanceLabelFor("fictional-scenario", "BEN_AUTHORED"),
    "Ben-authored fictional scenario"
  );
  assert.equal(
    provenanceLabelFor("fictional-scenario", "BEN_AUTHORED_VARIATION"),
    "Ben-authored fictional scenario"
  );
  assert.equal(
    provenanceLabelFor("fictional-scenario", "AI_ADAPTATION"),
    "AI adaptation based on Ben's supplied principles"
  );
  assert.equal(provenanceLabelFor("judgment", "BEN_AUTHORED"), "Ben's authored judgment");
  assert.equal(provenanceLabelFor("judgment", "AI_SYNTHESIS"), "Coach synthesis based on Ben sources");
  assert.equal(
    provenanceLabelFor("judgment", "INSUFFICIENT_SIGNAL"),
    "Ben has not addressed this closely enough"
  );
});

test("every one of the five NEW label strings is present and reachable", () => {
  const rendered = new Set(provenanceLabelPairs().map((pair) => pair.label));
  for (const label of NEW_PROVENANCE_LABELS) {
    assert.ok(rendered.has(label), `NEW label missing from the map: ${label}`);
  }
  assert.equal(NEW_PROVENANCE_LABELS.length, 5);
});

test("the label map is total over its declared pairs — no blank label anywhere", () => {
  for (const pair of provenanceLabelPairs()) {
    assert.equal(typeof pair.label, "string");
    assert.notEqual(pair.label.trim(), "", `${pair.surfaceKind}/${pair.origin} resolved to a blank label`);
  }
});

test("an undeclared (surfaceKind, origin) pair throws rather than rendering blank", () => {
  // A compile error at every typed call site; this is the untyped-caller path
  // (the preview script, a JSON fixture). A missing mapping is a build failure,
  // not an empty render.
  assert.equal(hasProvenanceLabel("judgment", "LEARNER_OWNED"), false);
  assert.throws(
    () => provenanceLabelFor("judgment" as SurfaceKind, "LEARNER_OWNED" as never),
    /No provenance label/
  );
});

test("no non-Ben origin can resolve to a Ben-authored label", () => {
  const benAuthoredLabels = new Set([
    "Ben source",
    "Ben's authored judgment",
    "Ben-authored fictional scenario"
  ]);
  for (const pair of provenanceLabelPairs()) {
    if (isBenOrigin(pair.origin)) continue;
    assert.equal(
      benAuthoredLabels.has(pair.label),
      false,
      `${pair.surfaceKind}/${pair.origin} resolves to a Ben-authored label: ${pair.label}`
    );
  }
});

test("BEN_APPROVED never claims Ben authorship", () => {
  for (const surfaceKind of SURFACE_KINDS) {
    if (!hasProvenanceLabel(surfaceKind, "BEN_APPROVED")) continue;
    assert.equal(provenanceLabelFor(surfaceKind, "BEN_APPROVED" as never), "Approved by Ben");
  }
});

/* -------------------------------------------------------------------------- */
/* Draft marks                                                                */
/* -------------------------------------------------------------------------- */

test("the two artboard draft marks are verbatim", () => {
  assert.equal(draftMarkFor("default"), "draft · implementation placeholder · not Ben's words");
  assert.equal(draftMarkFor("scenario"), "scenario: draft · implementation placeholder");
  assert.equal(DRAFT_MARK_VARIANTS.length, 2);
});

test("AI_* and IMPLEMENTATION_PLACEHOLDER require a draft mark; Ben origins do not", () => {
  for (const origin of ["AI_SYNTHESIS", "AI_ADAPTATION", "IMPLEMENTATION_PLACEHOLDER"] as LabelOrigin[]) {
    assert.equal(requiresDraftMark(origin), true, origin);
  }
  for (const origin of [...BEN_ORIGINS, "FICTIONAL_AUTHORED", "EXTERNAL_SOURCE", "LEARNER_OWNED"] as LabelOrigin[]) {
    assert.equal(requiresDraftMark(origin), false, origin);
  }
});

/* -------------------------------------------------------------------------- */
/* The two-axis render policy (§6.2)                                          */
/* -------------------------------------------------------------------------- */

function kind(policy: RenderPolicy): string {
  return policy.kind;
}

test("a draft Ben-origin object is blocked", () => {
  for (const origin of BEN_ORIGINS) {
    const policy = renderPolicyFor({
      surfaceKind: "fictional-scenario",
      status: "draft",
      origin: origin as "BEN_AUTHORED" | "BEN_APPROVED" | "BEN_AUTHORED_VARIATION"
    });
    assert.equal(kind(policy), "blocked", `${origin} at draft must be blocked`);
  }
});

test("no draft Ben content renders as canon in a production build", () => {
  for (const status of CONTENT_STATUSES) {
    for (const origin of BEN_ORIGINS) {
      const policy = renderPolicyFor(
        {
          surfaceKind: "fictional-scenario",
          status,
          origin: origin as "BEN_AUTHORED" | "BEN_APPROVED" | "BEN_AUTHORED_VARIATION",
          supersededBy: "some-newer-id",
          canonical: false
        },
        "public"
      );
      if (status === "published") assert.equal(kind(policy), "canon");
      else assert.notEqual(kind(policy), "canon", `${origin} at ${status} must not be canon`);
    }
  }
});

test("ben_reviewed is excluded under the default (Q13)", () => {
  const policy = renderPolicyFor({
    surfaceKind: "human-source",
    status: "ben_reviewed",
    origin: "BEN_AUTHORED"
  });
  assert.equal(kind(policy), "blocked");
  assert.match((policy as { reason: string }).reason, /RENDER_BEN_REVIEWED/);
});

test("an AI_SYNTHESIS judgment is marked, never canon, and carries its label", () => {
  const policy = renderPolicyFor(
    { surfaceKind: "judgment", status: "published", origin: "AI_SYNTHESIS" },
    "public"
  );
  assert.equal(policy.kind, "marked");
  if (policy.kind !== "marked") return;
  assert.equal(policy.label, "Coach synthesis based on Ben sources");
  assert.equal(policy.draftMark, "default");
});

test("marked resolves to blocked in public and marked in preview while RENDER_MARKED_DRAFT is false (Q21)", () => {
  const object = {
    surfaceKind: "fictional-scenario",
    status: "draft",
    origin: "FICTIONAL_AUTHORED"
  } as const;

  const publicPolicy = renderPolicyFor(object, "public");
  assert.equal(publicPolicy.kind, "blocked");
  assert.match((publicPolicy as { reason: string }).reason, /RENDER_MARKED_DRAFT/);

  const previewPolicy = renderPolicyFor(object, "preview");
  assert.equal(previewPolicy.kind, "marked");
  if (previewPolicy.kind !== "marked") return;
  assert.equal(previewPolicy.label, "Fictional practice scenario — authored for Watch Your Step");
});

test("a draft AI scenario in preview carries the scenario draft mark, not the default one", () => {
  const policy = renderPolicyFor(
    { surfaceKind: "fictional-scenario", status: "draft", origin: "AI_SYNTHESIS" },
    "preview"
  );
  assert.equal(policy.kind, "marked");
  if (policy.kind !== "marked") return;
  assert.equal(policy.draftMark, "scenario");
  assert.equal(draftMarkFor(policy.draftMark), "scenario: draft · implementation placeholder");
});

test("published non-Ben material renders marked, with its label, on every surface", () => {
  for (const surface of ["public", "preview", "archive"] as const) {
    const policy = renderPolicyFor(
      { surfaceKind: "general", status: "published", origin: "LEARNER_OWNED" },
      surface
    );
    assert.equal(policy.kind, "marked", surface);
    if (policy.kind !== "marked") return;
    assert.equal(policy.label, "Yours. Stored in this browser only.");
  }
});

/* -------------------------------------------------------------------------- */
/* Historical integrity (§6.2 rule 4)                                         */
/* -------------------------------------------------------------------------- */

test("a historical object without supersededBy / canonical:false fails validation", () => {
  assert.deepEqual(validateProvenance({ status: "published" }), []);

  const missingBoth = validateProvenance({ status: "historical" });
  assert.equal(missingBoth.length, 2);

  const missingCanonical = validateProvenance({ status: "historical", supersededBy: "next-id" });
  assert.equal(missingCanonical.length, 1);
  assert.match(missingCanonical[0], /canonical: false/);

  const complete = validateProvenance({
    status: "historical",
    supersededBy: "next-id",
    canonical: false
  });
  assert.deepEqual(complete, []);

  // `superseded` carries the same requirement.
  assert.equal(validateProvenance({ status: "superseded" }).length, 2);
});

test("an invalid historical object is blocked even on the archive surface", () => {
  const policy = renderPolicyFor(
    { surfaceKind: "general", status: "historical", origin: "BEN_AUTHORED" },
    "archive"
  );
  assert.equal(kind(policy), "blocked");
});

test("historical material is blocked on a current surface and marked on the archive", () => {
  const object = {
    surfaceKind: "general",
    status: "historical",
    origin: "BEN_AUTHORED",
    supersededBy: "bridge-position-002",
    canonical: false
  } as const;

  assert.equal(kind(renderPolicyFor(object, "public")), "blocked");
  assert.equal(kind(renderPolicyFor(object, "preview")), "blocked");

  const archived = renderPolicyFor(object, "archive");
  assert.equal(archived.kind, "marked");
  if (archived.kind !== "marked") return;
  // Never canon: a superseded position must not read as a current one.
  assert.equal(archived.label, "Ben source");
});

/* -------------------------------------------------------------------------- */
/* The preview table (§6.11)                                                  */
/* -------------------------------------------------------------------------- */

test("the label map prints on demand for draft review", () => {
  const rows = provenanceLabelPairs();
  assert.ok(rows.length >= 20);
  if (process.env.BCT_PREVIEW === "1") {
    for (const row of rows) console.log(`${row.surfaceKind}\t${row.origin}\t${row.label}`);
  }
});

/* -------------------------------------------------------------------------- */
/* The future Coach schema is disabled and invisible (WYS §2.2, §22)          */
/* -------------------------------------------------------------------------- */

test("lib/wys/coach-schema.ts carries all sixteen §22 governing rules verbatim", async () => {
  const { readFileSync } = await import("node:fs");
  const { fileURLToPath } = await import("node:url");
  const pathModule = await import("node:path");
  const repoRoot = pathModule.resolve(pathModule.dirname(fileURLToPath(import.meta.url)), "..");
  const source = readFileSync(pathModule.join(repoRoot, "lib", "wys", "coach-schema.ts"), "utf8");

  const rules = [
    "Coach is explicitly disclosed as AI",
    "anything intentionally sent to Coach is sent to AI",
    "no need to chat to complete WYS",
    "unlock is access only",
    "activation requires explicit learner choice",
    "model never infers readiness",
    "pressure happens only after initial commitment",
    "scenario provenance and judgment provenance are separate",
    "canonical Ben variant before AI generation",
    "synthesis retains source basis",
    "insufficient signal is valid",
    "minimal live context",
    "full transcript not automatically forwarded",
    "no companion behavior",
    "no automatic next question",
    "learner correction outranks inference"
  ];
  assert.equal(rules.length, 16);
  for (const rule of rules) assert.ok(source.includes(rule), `missing §22 rule: ${rule}`);

  // Type-only: no runtime call, no exported value, no component import, and no
  // flag that could turn a Coach on.
  assert.equal(/export\s+(const|let|var|function|class)\b/.test(source), false);
  assert.equal(/from\s+["']@\/components/.test(source), false);
  assert.equal(/ENABLE|FLAG|enabled/.test(source), false);
});
