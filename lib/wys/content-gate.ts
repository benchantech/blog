/**
 * The one way a course screen turns a content record into renderable prose
 * (plan §6.2, §6.3).
 *
 * §6.2's rule is that "the renderer takes the content object, not a string: a
 * component cannot receive the prose without also receiving the label."
 * `components/wys/JudgmentCard.tsx` already takes that shape —
 * `{ policy, text, label }` — and Phase 7 needs the same shape on Today, Plan,
 * Practice, the per-stop route and the hero demo. Without one builder every
 * screen would compute `renderPolicyFor` + `provenanceLabelFor` by hand, and
 * the first screen that forgot the second call would render draft prose bare.
 *
 * So: **one function in, one gated object out, and no screen calls
 * `provenanceLabelFor` itself.**
 *
 * THE Q21 CONSEQUENCE IS NOT A BUG. `RENDER_MARKED_DRAFT` ships `false`
 * (ratified), and every scenario, choice label, judgment body and stop title in
 * `content/watch-your-step/` is `draft` + `IMPLEMENTATION_PLACEHOLDER`. So
 * almost every call here returns `policy.kind === "blocked"` today, and the
 * screens render the withheld state — the provenance label alone, saying whose
 * words are missing. Phase 7 builds against that reality; it does not "fix" it
 * by editing a status field (docs/facelift-build-notes.md, Phase 6 hazards).
 * One constant flips the whole course when Ben rules on Q21.
 *
 * Pure TypeScript. No React, no CSS, no component import.
 */

import {
  type ContentOrigin,
  type ContentStatus,
  type LabelOrigin,
  type OriginFor,
  type ProvenanceLabel,
  type RenderPolicy,
  type RenderSurface,
  type SurfaceKind,
  hasProvenanceLabel,
  provenanceLabelFor,
  renderPolicyFor
} from "@/lib/content-status";
import {
  type AnyCanonicalText,
  type AwaitingCopy,
  type CanonicalTextVariantKey,
  isAwaitingCopy,
  policyForCanonicalText,
  resolveVariant
} from "@/lib/canonical-text";

/**
 * Prose plus everything needed to render it honestly, as one value.
 *
 * There is no constructor for this type outside this module, and no component
 * takes `text` on its own, so a screen cannot hold the words without also
 * holding the policy and the label that govern them.
 */
export interface GatedContent {
  surfaceKind: SurfaceKind;
  /**
   * The origin the label was computed from. Typed as the WIDE `LabelOrigin`
   * rather than `OriginFor<surfaceKind>` on purpose: `AnyCanonicalText` is a
   * union of four surface kinds, and a generic parameter here would force every
   * caller that holds a union of records to pick one kind before it can hold
   * the prose. The narrowing guarantee is not lost — it moves to the moment the
   * label is COMPUTED (below and in `provenanceLabelFor`), and `label` is a
   * branded type nothing else can produce.
   */
  origin: LabelOrigin;
  policy: RenderPolicy;
  /** The prose. Rendered only when `policy.kind` is `marked` or `canon`. */
  text: string;
  /** Computed from `(surfaceKind, origin)`. Never hand-typed (§6.3). */
  label: ProvenanceLabel;
}

/** The provenance fields a content record carries (`content/watch-your-step/types.ts`). */
export interface GateableRecord {
  status: ContentStatus;
  origin: ContentOrigin | LabelOrigin;
  supersededBy?: string;
  canonical?: boolean;
  approvedBy?: string;
  approvedAt?: string;
  standingOrdersVersion?: string;
}

/**
 * Blocked prose is emptied HERE, at the constructor, not at each call site.
 *
 * This is a serving fact, not a styling one. Every course screen is a server
 * component that hands `GatedContent` to a client component (`JudgeCard`,
 * `PlanStops`, `ReplayList`, `LessonZeroFlow`), and React serialises every
 * client prop into the RSC flight payload, which Next.js inlines into the
 * prerendered `.html`. So a blocked record that still carried its `text` would
 * be **published in the document** — visible in view-source, in the `.rsc`
 * file and to anything that reads the page without running it — while the
 * screen honestly drew "Implementation placeholder — not Ben's words". The
 * label would be true of the pixels and false of the page.
 *
 * Three Phase 7 surfaces each wrote their own local `redactIfBlocked` /
 * `withheldTextRemoved` for this, and the three that did not have the leak.
 * That is the signature of a rule kept in the wrong place: `GatedContent` has
 * exactly two constructors, so the rule belongs in both of them and nowhere
 * else (§5.1's one-canonical-definition rule, applied to code).
 *
 * `label`, `origin`, `surfaceKind` and `policy.reason` all survive — the
 * withheld state still says whose words are missing and why. Only the words go.
 *
 * Note what this does NOT do: on the `"preview"` surface (§6.11) a draft
 * non-Ben record resolves to `marked`, not `blocked`, so the draft preview
 * tooling still sees the prose. Flipping `RENDER_MARKED_DRAFT` (Q21) restores
 * it on the public surface the same way, with no component change.
 */
function withoutBlockedProse(content: GatedContent): GatedContent {
  return content.policy.kind === "blocked" ? { ...content, text: "" } : content;
}

/**
 * Gate one string from one content record.
 *
 * `origin` on the §8 interfaces is the WIDE `ContentOrigin` (or, for
 * `WysJudgment`, `OriginFor<"judgment">`), while the label table is indexed by
 * `(surfaceKind, origin)` and is deliberately partial — `LEARNER_OWNED` has no
 * `judgment` label because a learner writes no judgments. Narrowing therefore
 * happens HERE, once, with a runtime check that throws.
 *
 * A throw is the correct failure. Every call site is a server component
 * rendered at build time, so an unlabelled pair fails `next build` loudly
 * instead of rendering a blank label into a static page — which is exactly what
 * §6.3 requires ("a missing mapping is a build failure, not a blank label").
 */
export function gateProse<K extends SurfaceKind>(
  surfaceKind: K,
  record: GateableRecord,
  text: string,
  surface: RenderSurface = "public"
): GatedContent {
  if (!hasProvenanceLabel(surfaceKind, record.origin as LabelOrigin)) {
    throw new Error(
      `No provenance label for surface "${surfaceKind}" and origin "${record.origin}" — ` +
        "declare the pair in lib/content-status.ts or render this record on another surface."
    );
  }
  const origin = record.origin as OriginFor<K>;
  const policy = renderPolicyFor(
    {
      surfaceKind,
      origin,
      status: record.status,
      supersededBy: record.supersededBy,
      canonical: record.canonical,
      approvedBy: record.approvedBy,
      approvedAt: record.approvedAt,
      standingOrdersVersion: record.standingOrdersVersion
    },
    surface
  );
  return withoutBlockedProse({
    surfaceKind,
    origin,
    policy,
    text,
    label: provenanceLabelFor(surfaceKind, origin)
  });
}

/**
 * The canonical-record form.
 *
 * `lib/canonical-text.ts` already resolves variants and policy, but it collapses
 * a blocked record to `{ kind: "blocked", reason }` — dropping the label, which
 * is the one thing a withheld surface still has to show. This keeps the label.
 *
 * `awaiting` and `missing` are returned rather than thrown: an unwritten
 * variant is a labelled empty slot (§6.4), not an error, and the caller decides
 * which slot to draw.
 */
export type CanonicalGate =
  | { kind: "text"; variant: CanonicalTextVariantKey; content: GatedContent }
  | { kind: "awaiting"; variant: CanonicalTextVariantKey; awaiting: AwaitingCopy }
  | { kind: "missing"; variant: CanonicalTextVariantKey };

function canonicalLabel(record: AnyCanonicalText): ProvenanceLabel {
  switch (record.surfaceKind) {
    case "human-source":
      return provenanceLabelFor("human-source", record.origin);
    case "fictional-scenario":
      return provenanceLabelFor("fictional-scenario", record.origin);
    case "judgment":
      return provenanceLabelFor("judgment", record.origin);
    case "general":
      return provenanceLabelFor("general", record.origin);
    case "constructed-case":
      return provenanceLabelFor("constructed-case", record.origin);
  }
}

export function gateCanonical(
  record: AnyCanonicalText,
  variant: CanonicalTextVariantKey,
  surface: RenderSurface = "public"
): CanonicalGate {
  const resolved = resolveVariant(record, variant);
  if (resolved.kind === "awaiting") {
    return { kind: "awaiting", variant: resolved.variant, awaiting: resolved.awaiting };
  }
  if (resolved.kind === "missing") return { kind: "missing", variant: resolved.variant };

  const policy = policyForCanonicalText(record, surface);
  // The switch, rather than one call, because `record` is a union of four
  // surface kinds and `provenanceLabelFor` is indexed by the pair. Same shape
  // `policyForCanonicalText` uses, and for the same reason.
  const label = canonicalLabel(record);
  return {
    kind: "text",
    variant: resolved.variant,
    content: withoutBlockedProse({
      surfaceKind: record.surfaceKind,
      origin: record.origin,
      policy,
      text: resolved.text,
      label
    })
  };
}

/**
 * The canonical text a screen can render right now, or null.
 *
 * The common call: "give me this sentence if it may be shown, otherwise nothing
 * and I will draw a slot". Keeps `awaiting`/`missing`/`blocked` from each
 * needing a branch on every screen that renders a one-line note.
 */
export function gatedCanonicalText(
  record: AnyCanonicalText,
  variant: CanonicalTextVariantKey,
  surface: RenderSurface = "public"
): GatedContent | null {
  const gate = gateCanonical(record, variant, surface);
  if (gate.kind !== "text") return null;
  if (gate.content.policy.kind === "blocked") return null;
  return gate.content;
}

/**
 * True when the prose itself may be shown.
 *
 * Blocked material is never text — `withoutBlockedProse` has already emptied
 * `text`, so a caller that ignores this check renders an empty string rather
 * than withheld prose. The check is still required: an empty body where a
 * provenance label belongs is a worse surface, not a leak.
 */
export function isShowable(content: GatedContent): boolean {
  return content.policy.kind !== "blocked";
}

/**
 * The rule that decides whether an INTERACTIVE exercise runs at all.
 *
 * A scenario is not one string. It is a setting, a decision moment, four choice
 * labels and a judgment, and only some of them pass through `GatedContent` on
 * their way to the screen — `WysScenario.choices[].label` is a bare string that
 * `ChoiceRow` renders directly. So a surface that gates the setting, draws its
 * "Implementation placeholder — not Ben's words" line, and then renders the
 * four choice labels underneath has published exactly the prose the label says
 * is missing. That is what Today shipped before this gate, and the reason it is
 * a helper here rather than a habit: the rule is "the exercise runs only when
 * the scenario's own prose may render", and Practice already applies it by
 * serialising `exercise: null`.
 *
 * One definition, two surfaces, no third way to be half-withheld.
 */
export function allShowable(...parts: readonly GatedContent[]): boolean {
  return parts.every(isShowable);
}

/** Re-exported so a screen never reaches past this module for the awaiting check. */
export { isAwaitingCopy };
