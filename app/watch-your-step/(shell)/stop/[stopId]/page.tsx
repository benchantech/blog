import type { Metadata } from "next";
import { stopDisplayName, stopRouteLabels } from "@/content/watch-your-step/tabs";
import { stopScaffoldFootnoteText } from "@/content/watch-your-step/copy";
import { endLabels } from "@/content/watch-your-step/end";
import { WYS_STOP_IDS, wysWeekById, wysWeeks } from "@/content/watch-your-step/weeks";
import { gateProse, gatedCanonicalText } from "@/lib/wys/content-gate";
import { visitCountableStop } from "@/lib/wys/visit";
import { CourseScreen } from "@/components/wys/CourseScreen";
import { GatedText } from "@/components/wys/GatedText";
import { StopStartTelemetry } from "@/components/wys/StopStartTelemetry";
import { VisitCounter } from "@/components/wys/VisitCounter";
import { LinkRow } from "@/components/ui/LinkRow";

/**
 * The per-stop surface (plan §5.3, §5.2).
 *
 * REQUIRED AND UNDESIGNED. No artboard draws it, and it cannot be dropped:
 * Plan's nine rows and the desktop path strip both link to a per-stop URL, and
 * without one they ship dead. So this is the deep-linkable form of a stop —
 * which stop it is, where the learner is inside it, and the way through to the
 * surface that does the work. It is deliberately NOT a second Today: §5.1
 * allows one canonical node per concept, and Today is the node for "the visit
 * in front of you".
 *
 * STATIC, NOT DYNAMIC. `generateStaticParams()` over the declared stop ids plus
 * `dynamicParams = false` means an unknown `stopId` 404s at build time instead
 * of falling back to on-demand rendering. Note the build marker this produces:
 * `●  (SSG) prerendered as static HTML`, not `○  (Static)`. The acceptance gate
 * is "every route is `○` or `●`; zero `ƒ`" (§5.3) — not "every route Static".
 *
 * THE TITLE IS THE LETTER, NEVER THE STOP TITLE. Titles A-H are draft
 * implementation scaffold (WYS §11) and are blocked from public rendering while
 * `RENDER_MARKED_DRAFT` is false (Q21). A metadata title is a published string
 * that reaches search results and, because the preserved GA4 config sets
 * `send_page_view: true`, reaches GA4 as `page_title` — so putting a draft
 * title there would publish draft prose twice over. `stopDisplayName()` is
 * derived structure, which is true whatever Ben decides.
 *
 * NO LEARNER STATE IN THE URL OR THE TITLE (§8.5). The only dynamic segment is
 * `[stopId]`, which is content data; the visit number is derived and rendered
 * inside a client component, never routed on.
 *
 * AND NO DRAFT PROSE IN THE PAYLOAD. Client props are serialised into the RSC
 * payload that ships inside the static HTML, so the stop is projected through
 * `visitCountableStop()` before it crosses that boundary — id, cadence paths,
 * off-site flag. Passing the record whole would publish the draft title and
 * purpose in page source while the screen drew the withheld label.
 */

export const dynamicParams = false;

export function generateStaticParams(): { stopId: string }[] {
  return WYS_STOP_IDS.map((stopId) => ({ stopId }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ stopId: string }>;
}): Promise<Metadata> {
  const { stopId } = await params;
  const week = wysWeeks.find((candidate) => candidate.id === stopId);
  const name = week ? stopDisplayName(week) : stopRouteLabels.stopNamePrefix;
  return {
    title: `${name} - BenChanTech`,
    alternates: { canonical: `/watch-your-step/stop/${stopId}` }
  };
}

export default async function StopPage({ params }: { params: Promise<{ stopId: string }> }) {
  const { stopId } = await params;
  // `dynamicParams = false` means only the declared ids reach this function, so
  // the throw inside `wysWeekById` is unreachable at runtime and is a build-time
  // failure if the content and the params ever disagree.
  const week = wysWeekById(stopId);
  const name = stopDisplayName(week);

  // The two client components below need an id, the cadence paths and the
  // off-site flag — nothing else. Handing them `week` whole would satisfy the
  // compiler and publish this stop's draft `title` and `purpose` in the RSC
  // payload inlined into the static HTML, which is the one thing the withheld
  // rendering below exists to prevent. `visitCountableStop` is the projection.
  const visitStop = visitCountableStop(week);

  // One record, one provenance line: the title is the stop's own scaffold
  // wording and renders as its label while Q21's default holds.
  const title = gateProse("general", week, week.title);
  const footnote = gatedCanonicalText(stopScaffoldFootnoteText, "short");

  return (
    <>
      <StopStartTelemetry stop={visitStop} />
      <CourseScreen title={name} meta={<VisitCounter stop={visitStop} />}>
        <GatedText content={title} />
        {footnote ? <GatedText content={footnote} /> : null}
        <LinkRow href="/watch-your-step/today">{stopRouteLabels.openInToday}</LinkRow>
        <LinkRow href="/watch-your-step/plan">{stopRouteLabels.backToPlan}</LinkRow>
        {/*
          The only door into the Stop H terminal surface. `5b` draws Plan's
          dashed "the end" row with nothing behind it and the tab bar has no
          sixth item, so without this `/watch-your-step/end` — a declared route
          in §5.2 — would ship unreachable. Rendered on the terminal stop alone,
          which is the stop it belongs to.
        */}
        {week.terminal ? (
          <LinkRow href="/watch-your-step/end">{endLabels.openTheEnd}</LinkRow>
        ) : null}
      </CourseScreen>
    </>
  );
}
