import {
  SHIP_NAV_CONSOLIDATED,
  ecosystemNav,
  lessonZeroCta,
  publicShipNav,
  shipNav,
  developerForwardNav
} from "@/content/nav";
import { WYS_NAV_RETIRED } from "@/content/watch-your-step/config";
import { courseTabs, stopDisplayName } from "@/content/watch-your-step/tabs";
import { WYS_STOP_IDS, wysWeekById } from "@/content/watch-your-step/weeks";
import { DEVELOPER_FORWARD_ANSWERS } from "@/content/developer-forward/answer-surfaces";
import { COMPANY_EXPERIMENTS } from "@/content/company/experiments";

export type CanonicalSurfaceGroup =
  | "home"
  | "ship"
  | "developer-forward"
  | "course"
  | "legal"
  | "preserved"
  | "machine";

export interface CanonicalSurface {
  path: string;
  label: string;
  group: CanonicalSurfaceGroup;
  human: boolean;
}

const LEGAL_SURFACES: readonly CanonicalSurface[] = [
  { path: "/privacy", label: "Privacy", group: "legal", human: true },
  { path: "/terms", label: "Terms", group: "legal", human: true },
  { path: "/cookies", label: "Cookies", group: "legal", human: true },
  { path: "/accessibility", label: "Accessibility", group: "legal", human: true },
  { path: "/ai-disclosure", label: "AI Disclosure", group: "legal", human: true },
  { path: "/copyright", label: "Copyright", group: "legal", human: true },
  { path: "/contact", label: "Contact", group: "legal", human: true }
];

const PRESERVED_SURFACES: readonly CanonicalSurface[] = ecosystemNav
  .filter((item) => !item.external)
  .map((item) => ({ path: item.href, label: item.label, group: "preserved" as const, human: true }))
  .concat(
    SHIP_NAV_CONSOLIDATED
      ? []
      : [{ path: "/system", label: "System", group: "preserved" as const, human: true }]
  );

export const MACHINE_SURFACE_PATHS = {
  llms: "/llms.txt",
  state: "/author-ship/state.json",
  sitemap: "/sitemap.xml",
  robots: "/robots.txt"
} as const;

const MACHINE_SURFACES: readonly CanonicalSurface[] = [
  { path: MACHINE_SURFACE_PATHS.llms, label: "llms.txt", group: "machine", human: false },
  { path: MACHINE_SURFACE_PATHS.state, label: "Author Ship state", group: "machine", human: false }
];

const STOP_SURFACES: readonly CanonicalSurface[] = WYS_STOP_IDS.map((id) => ({
  path: `/watch-your-step/stop/${id}`,
  label: stopDisplayName(wysWeekById(id)),
  group: "course" as const,
  human: true
}));

const COURSE_SURFACES: readonly CanonicalSurface[] = [
  { path: lessonZeroCta.href, label: lessonZeroCta.label, group: "course", human: true },
  ...courseTabs.map((tab) => ({
    path: tab.href,
    label: tab.label,
    group: "course" as const,
    human: true
  })),
  ...STOP_SURFACES,
  { path: "/watch-your-step/end", label: "End", group: "course", human: true }
];

const DEVELOPER_FORWARD_SURFACES: readonly CanonicalSurface[] = [
  { path: developerForwardNav.href, label: developerForwardNav.label, group: "developer-forward", human: true },
  { path: "/developer-forward-lite", label: "Developer Forward Lite", group: "developer-forward", human: true },
  { path: "/developer-forward/questions", label: "Developer judgment questions", group: "developer-forward", human: true },
  ...DEVELOPER_FORWARD_ANSWERS.map((answer) => ({
    path: `/developer-forward/questions/${answer.slug}`,
    label: answer.question,
    group: "developer-forward" as const,
    human: true
  }))
];

const COMPANY_EXPERIMENT_SURFACES: readonly CanonicalSurface[] = [
  { path: "/experiments", label: "Experiments", group: "home", human: true },
  ...COMPANY_EXPERIMENTS.map((experiment) => ({
    path: `/experiments/${experiment.slug}`,
    label: experiment.title,
    group: "home" as const,
    human: true
  })),
  { path: "/experiments/operating-metrics", label: "Operating metrics", group: "home", human: true }
];

const CONSOLIDATED_SURFACES: readonly string[] = SHIP_NAV_CONSOLIDATED
  ? [...shipNav.filter((item) => item.href !== "/watch-your-step").map((item) => item.href), "/system"]
  : [];

export const RETIRED_SURFACES: readonly string[] = [
  ...(WYS_NAV_RETIRED
    ? [
        "/watch-your-step",
        lessonZeroCta.href,
        ...courseTabs.map((tab) => tab.href),
        ...WYS_STOP_IDS.map((id) => `/watch-your-step/stop/${id}`),
        "/watch-your-step/end"
      ]
    : []),
  ...CONSOLIDATED_SURFACES
];

export const canonicalSurfaces: readonly CanonicalSurface[] = [
  { path: "/", label: "BenChanTech", group: "home", human: true },
  ...COMPANY_EXPERIMENT_SURFACES,
  ...DEVELOPER_FORWARD_SURFACES,
  ...publicShipNav
    .filter((item) => item.href !== developerForwardNav.href)
    .map((item) => ({
      path: item.href,
      label: item.label,
      group: "ship" as const,
      human: true
    })),
  ...(WYS_NAV_RETIRED ? [] : COURSE_SURFACES),
  ...PRESERVED_SURFACES,
  ...LEGAL_SURFACES,
  ...MACHINE_SURFACES
];

export const CANONICAL_SURFACE_GROUP_LABELS = {
  home: "Home and company experiments",
  ship: "The Author Ship",
  "developer-forward": "Developer Forward",
  course: "Watch Your Step",
  preserved: "Ecosystem and infrastructure",
  legal: "Legal and disclosure",
  machine: "Machine mirrors"
} as const satisfies Record<CanonicalSurfaceGroup, string>;

export const CANONICAL_SURFACE_GROUP_ORDER: readonly CanonicalSurfaceGroup[] = [
  "home",
  "developer-forward",
  "ship",
  "course",
  "preserved",
  "legal",
  "machine"
];

export function surfacesInGroup(group: CanonicalSurfaceGroup): readonly CanonicalSurface[] {
  return canonicalSurfaces.filter((surface) => surface.group === group);
}

export function humanCanonicalSurfaces(): readonly CanonicalSurface[] {
  return canonicalSurfaces.filter((surface) => surface.human);
}

export function canonicalSurfacePaths(): readonly string[] {
  return canonicalSurfaces.map((surface) => surface.path);
}

export const SITE_ORIGIN = "https://benchantech.com";

export function absoluteUrl(path: string): string {
  return `${SITE_ORIGIN}${path === "/" ? "" : path}`;
}
