/**
 * One definition, many presentations (plan §6.8; packet: one-definition).
 *
 * "Canonical text is defined once. Every repeated appearance references that
 * canonical source." This is Ben's own hard constraint and it is rendered on
 * the site as Standing Order 07.
 *
 * Five variants, not three (packet §8 names seven presentations a single source
 * may render as — short, medium, full, FAQ, inline disclosure, technical page,
 * machine-readable; FAQ and technical page reuse `full`, the other two need
 * their own slots). `inline` and `machine` are load-bearing, not speculative:
 * the disclosure strip renders an inline claim on every page, and
 * /author-ship/state.json would otherwise hand-type the same claims the legal
 * pages define — the drift this module exists to prevent.
 *
 * Pure TypeScript: no JSX, no CSS import (plan Phase 0's test-runner decision).
 */

import {
  type ContentStatus,
  type OriginFor,
  type RenderPolicy,
  type RenderSurface,
  type SurfaceKind,
  renderPolicyFor
} from "@/lib/content-status";

export type CanonicalTextVariantKey = "short" | "medium" | "full" | "inline" | "machine";

export const CANONICAL_TEXT_VARIANT_KEYS: readonly CanonicalTextVariantKey[] = [
  "short",
  "medium",
  "full",
  "inline",
  "machine"
];

/**
 * A variant nobody has written yet.
 *
 * §6.8's interface types `full` as `string`, but §8b.1 is equally binding:
 * "Write legal copy last, after the code is frozen (Phase 11). Writing it
 * earlier is how a page ends up claiming more privacy than the implementation
 * delivers." The two resolve only if an unwritten variant can be represented as
 * something that is structurally NOT text — the same mechanism §6.4 uses for
 * Ben slots. `resolveVariant()` returns `kind: "awaiting"` for these, so no
 * renderer can turn a descriptor into prose. Reported as a deviation from
 * §6.8's literal `full: string`.
 */
export interface AwaitingCopy {
  /** What is awaited, in build language. Never a claim, never Ben's voice. */
  awaiting: string;
  /** Who has to write it, and in which phase. */
  writtenBy: "ben" | "phase-8" | "phase-11";
}

export function isAwaitingCopy(value: string | AwaitingCopy | undefined): value is AwaitingCopy {
  return typeof value === "object" && value !== null && "awaiting" in value;
}

export interface CanonicalTextVariants {
  /** Data page card, inline card body. */
  short?: string | AwaitingCopy;
  medium?: string | AwaitingCopy;
  /** Legal page prose — the authoritative form. */
  full: string | AwaitingCopy;
  /** One-sentence inline disclosure. */
  inline?: string | AwaitingCopy;
  /** /author-ship/state.json, llms.txt. */
  machine?: string | AwaitingCopy;
}

export interface CanonicalText<K extends SurfaceKind = "general"> {
  id: string;
  surfaceKind: K;
  variants: CanonicalTextVariants;
  status: ContentStatus;
  origin: OriginFor<K>;
  /** Where the text came from. Empty is a validation failure (§11.1). */
  sourceIds: readonly string[];
  /**
   * Per-variant sources, where variants have different authorities. The
   * `minimal-trust` record is the worked example: its `short` is artboard `5c`
   * and its `full` is WYS §18 verbatim, and a builder told to ship "§18
   * verbatim" on the Data page would otherwise ship the wrong string (§8b.3).
   */
  variantSources?: Partial<Record<CanonicalTextVariantKey, readonly string[]>>;
  supersededBy?: string;
  canonical?: boolean;
  approvedBy?: string;
  approvedAt?: string;
  standingOrdersVersion?: string;
}

/** Any canonical record, discriminated by `surfaceKind`. */
export type AnyCanonicalText = { [K in SurfaceKind]: CanonicalText<K> }[SurfaceKind];

/* -------------------------------------------------------------------------- */
/* Resolution                                                                 */
/* -------------------------------------------------------------------------- */

export type VariantResolution =
  | { kind: "text"; variant: CanonicalTextVariantKey; text: string }
  | { kind: "awaiting"; variant: CanonicalTextVariantKey; awaiting: AwaitingCopy }
  | { kind: "missing"; variant: CanonicalTextVariantKey };

/**
 * Declared fallback chains. A presentation falls back only to a LONGER or
 * equally authoritative form, never to a shorter one — shortening a claim is
 * how a hedge quietly becomes an assertion (packet 3.4, no modal upgrade).
 */
const VARIANT_FALLBACKS: Record<CanonicalTextVariantKey, readonly CanonicalTextVariantKey[]> = {
  short: ["short", "medium", "full"],
  medium: ["medium", "full"],
  full: ["full"],
  inline: ["inline", "short", "medium", "full"],
  machine: ["machine", "full"]
};

/** Resolve one presentation of a canonical record. Never invents text. */
export function resolveVariant(
  record: AnyCanonicalText,
  variant: CanonicalTextVariantKey
): VariantResolution {
  let firstAwaiting: { variant: CanonicalTextVariantKey; awaiting: AwaitingCopy } | null = null;

  for (const key of VARIANT_FALLBACKS[variant]) {
    const value = record.variants[key];
    if (value === undefined) continue;
    if (isAwaitingCopy(value)) {
      firstAwaiting ??= { variant: key, awaiting: value };
      continue;
    }
    return { kind: "text", variant: key, text: value };
  }

  if (firstAwaiting) return { kind: "awaiting", ...firstAwaiting };
  return { kind: "missing", variant };
}

/** The render policy for a canonical record, computed from its own fields. */
export function policyForCanonicalText(
  record: AnyCanonicalText,
  surface: RenderSurface = "public"
): RenderPolicy {
  switch (record.surfaceKind) {
    case "human-source":
      return renderPolicyFor(record, surface);
    case "fictional-scenario":
      return renderPolicyFor(record, surface);
    case "judgment":
      return renderPolicyFor(record, surface);
    case "general":
      return renderPolicyFor(record, surface);
    case "constructed-case":
      return renderPolicyFor(record, surface);
  }
}

/**
 * The renderer takes the content object, not a string (§6.2): text and policy
 * come back together, so a component cannot receive the prose without also
 * receiving what it is allowed to do with it.
 */
export type CanonicalRendering =
  | { kind: "text"; variant: CanonicalTextVariantKey; text: string; policy: RenderPolicy }
  | { kind: "awaiting"; variant: CanonicalTextVariantKey; awaiting: AwaitingCopy }
  | { kind: "missing"; variant: CanonicalTextVariantKey }
  | { kind: "blocked"; variant: CanonicalTextVariantKey; reason: string };

export function renderCanonicalText(
  record: AnyCanonicalText,
  variant: CanonicalTextVariantKey,
  surface: RenderSurface = "public"
): CanonicalRendering {
  const resolved = resolveVariant(record, variant);
  if (resolved.kind !== "text") return resolved;

  const policy = policyForCanonicalText(record, surface);
  if (policy.kind === "blocked") {
    return { kind: "blocked", variant: resolved.variant, reason: policy.reason };
  }
  return { kind: "text", variant: resolved.variant, text: resolved.text, policy };
}

/* -------------------------------------------------------------------------- */
/* Index and validation                                                       */
/* -------------------------------------------------------------------------- */

/** Build an id -> record index. Throws on a duplicate canonical definition. */
export function canonicalTextIndex(records: readonly AnyCanonicalText[]): Map<string, AnyCanonicalText> {
  const index = new Map<string, AnyCanonicalText>();
  for (const record of records) {
    if (index.has(record.id)) {
      throw new Error(`Duplicate canonical definition for id "${record.id}".`);
    }
    index.set(record.id, record);
  }
  return index;
}

/**
 * The per-record half of the packet's governance validation (§6.8). The
 * cross-record checks — duplicate prose, unresolved component references, more
 * than one current canonical node, stale governance hash — live in
 * tests/canonical-text.test.ts, which is where they can see every module.
 */
export function validateCanonicalText(record: AnyCanonicalText): string[] {
  const issues: string[] = [];

  if (record.id.trim() === "") issues.push("a canonical record needs an id");
  if (record.sourceIds.length === 0) issues.push(`"${record.id}" is missing source metadata`);
  if (record.variants.full === undefined) issues.push(`"${record.id}" has no full variant`);

  for (const key of CANONICAL_TEXT_VARIANT_KEYS) {
    const value = record.variants[key];
    if (typeof value === "string" && value.trim() === "") {
      issues.push(`"${record.id}" has an empty ${key} variant; use an awaiting descriptor instead`);
    }
    if (isAwaitingCopy(value) && value.awaiting.trim() === "") {
      issues.push(`"${record.id}" has an ${key} awaiting descriptor with no description`);
    }
  }

  if (record.status === "historical" || record.status === "superseded") {
    if (!record.supersededBy) issues.push(`"${record.id}" is ${record.status} without supersededBy`);
    if (record.canonical !== false) issues.push(`"${record.id}" is ${record.status} without canonical: false`);
  }

  return issues;
}
