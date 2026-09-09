import type { YYProvenance } from "@/lib/developer-forward/yy/types";

/**
 * The opening illustration for each case.
 *
 * WHAT THESE ARE AND WHERE THEY SIT. Ben supplied five pencil-sketch scenes on
 * 2026-09-09, one per case, to run above the first paragraph of the FIRST
 * checkpoint only — "so they see it first before they read". Not above every
 * checkpoint: the picture sets a scene, and a scene is set once. Checkpoints 2
 * and beyond continue inside it.
 *
 * THEY ARE NOT DECORATION, WHICH DECIDES THE ALT TEXT. A purely ornamental
 * image takes `alt=""` and is skipped; these carry the same information the
 * capture's opening lines carry — where you are, what is on the screens, who
 * else is in the room — and they are placed to land BEFORE the prose. A reader
 * who cannot see them would otherwise start the case with less than a reader
 * who can. So each one is described, from the image, in the same register the
 * capture uses.
 *
 * WHAT THE ALT TEXT MUST NOT DO is say more than the picture. None of these
 * names the decision, the outcome, or anything the learner is about to be asked
 * to judge — a description that leaked the answer would defeat the
 * commit-before-reveal rule more quietly than any copy could.
 *
 * PROVENANCE. The images are `ben_authored`: he made them and supplied them.
 * The DESCRIPTIONS are not — this build wrote them by reading the files, which
 * is `ai_synthesis_from_ben_reasoning`'s nearest honest neighbour but not the
 * same thing, so they carry their own tag and are registered in
 * `DEVELOPER_FORWARD_IMPLEMENTATION_AUTHORED_LABELS`. Ben has not read them.
 *
 * TWO SOURCES, ONE IMAGE. `desktop` is 1440x1080 and `mobile` 760x570, the same
 * `<picture>` + `srcSet` pairing `app/page.tsx` uses for the Upwork feature, cut
 * at the 700px breakpoint the rest of the site steps at. The intrinsic size is
 * declared so the column does not jump when the file arrives.
 */
export interface CaseArt {
  /** Rendered at <=700px. */
  mobile: string;
  /** Rendered above it, and the `src` every browser falls back to. */
  desktop: string;
  /** The desktop file's intrinsic size, for the aspect ratio box. */
  width: number;
  height: number;
  /** Written by this build from the image. Never Ben's words. */
  alt: string;
  provenance: YYProvenance;
}

const SIZE = { width: 1440, height: 1080 } as const;

export const CASE_ART: Readonly<Record<string, CaseArt>> = {
  "case-1": {
    mobile: "/case-1-mobile.webp",
    desktop: "/case-1-desktop.webp",
    ...SIZE,
    alt: "Pencil sketch from behind a developer's own hands at a keyboard and mouse. A wide monitor shows a code editor beside a window of database tables; a laptop to the right shows an email with a spreadsheet attached. A mug, an hourglass, and a notebook of hand-drawn flow diagrams sit on the desk, with colleagues at their own screens across an open-plan office.",
    provenance: "ben_authored"
  },
  "case-2": {
    mobile: "/case-2-mobile.webp",
    desktop: "/case-2-desktop.webp",
    ...SIZE,
    alt: "Pencil sketch of the same first-person desk. The laptop shows a checkout flow beside a list of green ticks and two red crosses; the monitor behind it shows a dark dashboard with a falling line chart and a row of red warning triangles. Across the office a colleague holds a phone handset with one hand raised, mid-explanation.",
    provenance: "ben_authored"
  },
  "case-3": {
    mobile: "/case-3-mobile.webp",
    desktop: "/case-3-desktop.webp",
    ...SIZE,
    alt: "Pencil sketch of a desk with a laptop showing a product catalogue table of toggles, a monitor of code beside it, and two phones on stands — one displaying a product page, the other an error icon. Printed product sheets with checkboxes are spread across the desk.",
    provenance: "ben_authored"
  },
  "case-4": {
    mobile: "/case-4-mobile.webp",
    desktop: "/case-4-desktop.webp",
    ...SIZE,
    alt: "Pencil sketch of four people around a table, two of them pointing at a wall papered with printed landing-page mockups — dozens of near-identical product pages. A laptop of code sits open in the middle of the table, with more printouts, a phone and a mug around it.",
    provenance: "ben_authored"
  },
  "case-5": {
    mobile: "/case-5-mobile.webp",
    desktop: "/case-5-desktop.webp",
    ...SIZE,
    alt: "Pencil sketch of a server rack thick with cable bundles beside a laptop showing logs. One hand is plugging a cable into a small box-sized server on the floor; a notebook of handwritten lines lies open next to it. Behind, in a lit warehouse, people move stacked cardboard boxes on trolleys.",
    provenance: "ben_authored"
  }
};

/** The art for a case, or `null` where a case has none. */
export function caseArtFor(caseId: string): CaseArt | null {
  return CASE_ART[caseId] ?? null;
}
