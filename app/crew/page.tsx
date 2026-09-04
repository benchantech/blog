import type { Metadata } from "next";
import {
  CREW_FIELD_LABELS,
  CREW_ROLE_LABELS,
  type CrewMember,
  crewByRole,
  crewIntro
} from "@/content/ship/crew-manifest";
import { standingOrderTag } from "@/content/ship/standing-orders";
import { gateProse, isShowable } from "@/lib/wys/content-gate";
import { CardShell } from "@/components/ui/CardShell";
import { Pill } from "@/components/ui/Pill";
import { ProvenanceMono } from "@/components/provenance/ProvenanceMono";
import { GatedText } from "@/components/wys/GatedText";
import { ProvenanceMarks } from "@/components/wys/ProvenanceMarks";
import styles from "./crew.module.css";

/**
 * `/crew` — the Crew Manifest (plan Phase 9, §5.2; packet: Crew Manifest;
 * Standing Order 06). Replaces the Phase 5 stub.
 *
 * THE ONLY SHIP SURFACE WITH NO ARTBOARD, at any width. It also cannot be
 * deferred: `components/DisclosureStrip.tsx` links here from the footer of
 * every page, so a missing manifest is a dead link out of a transparency
 * claim. The visual is therefore COMPOSED from `5d` primitives — the tint-teal
 * status pill, the 32px h1, the 12px/600 accent section label, grey rounded
 * cards, 14px muted body — and it is flagged NEW in docs/facelift-unapproved.md
 * (CRW1). Nothing here is transcribed from a design, because there is none.
 *
 * EVERY STRING COMES FROM `content/ship/crew-manifest.ts`. This file types no
 * copy at all: not the pill, not the h1, not the five field labels, not the two
 * role headings. That is the provenance spine (§6.8), and
 * `tests/canonical-text.test.ts`'s `no-raw-curriculum-prose` check is what keeps
 * it true. No governance string is typed either — nothing on this page reads
 * from approval state, and `tests/governance-strings.test.ts` scans it anyway.
 *
 * PROVENANCE IS PER RECORD, WHICH IS PER CARD. Every record this page renders is
 * `published` + `IMPLEMENTATION_PLACEHOLDER`, so `renderPolicyFor` resolves each
 * to `marked` — the words, then the §23 label, then the mono draft mark. The
 * open question the content phase left to this page (build notes, Phase 9
 * decision 6) was whether that mark lands once per record or once per section.
 * It lands ONCE PER RECORD: a crew member is one content object with five
 * fields, `ProvenanceMarks` exists precisely because "one record's provenance is
 * one line, not one line per paragraph", and a per-section mark would detach the
 * label from the body it qualifies, which §6.2 forbids. Five cards therefore
 * carry five marks. On a page whose entire subject is who wrote what, that is
 * the message rather than the noise.
 *
 * A BLOCKED RECORD LOSES ITS WHOLE CARD, not just its lead sentence. The four
 * remaining fields are plain strings on the record, so a card that gated only
 * `does` and then printed `canAccess` underneath would publish exactly the prose
 * its label said was withheld — the leak `withoutBlockedProse` was written to
 * close. So the gate is read once per member and the card renders either all of
 * it, marked, or the label alone. No record is blocked today; the branch exists
 * so a later status change cannot open the hole quietly.
 *
 * NO BEN SLOT, AND NOTHING ATTRIBUTED TO BEN. The manifest describes systems,
 * in the third person, and Standing Order 06 is REFERENCED by its tag rather
 * than restated (R10, §6.8).
 *
 * STATIC. A server component with no state, no client boundary and no request
 * dependency: the route builds `○` with the rest of the site.
 */

export const metadata: Metadata = {
  title: "Crew Manifest - BenChanTech",
  alternates: { canonical: "/crew" }
};

/**
 * Section ids for `aria-labelledby`. Static values rather than a template in
 * the JSX, so the two headings that name these sections are greppable.
 */
const ROLE_SECTION_IDS = {
  build: "crew-build",
  runtime: "crew-runtime"
} as const;

const ROLES = ["build", "runtime"] as const;

/**
 * The packet's five fields, in the packet's order, zipped to their labels.
 *
 * The zip is positional because `CREW_FIELD_LABELS` is an ordered list of
 * strings rather than a keyed record — the request to key it by field name is
 * recorded in docs/facelift-build-notes.md rather than made here, since
 * `content/ship/crew-manifest.ts` belongs to the content half of this phase.
 * The length check turns a future mismatch into a build failure instead of a
 * silently mislabelled disclosure row.
 */
function crewFields(member: CrewMember, does: string) {
  const columns: readonly (readonly string[])[] = [
    [does],
    member.canAccess,
    member.cannotAccess,
    member.hasAuthorityTo,
    member.hasNoAuthorityTo
  ];
  if (columns.length !== CREW_FIELD_LABELS.length) {
    throw new Error("Crew field labels do not match the record shape.");
  }
  return columns.map((values, index) => ({ label: CREW_FIELD_LABELS[index], values }));
}

function CrewCard({ member }: { member: CrewMember }) {
  // One gate per record. `text` is the member's own `does` line, emptied by the
  // gate if the record may not render, and `policy` drives both branches below.
  const lead = gateProse("general", member, member.does);

  if (!isShowable(lead)) {
    return (
      <CardShell fill="grey">
        <ProvenanceMono>{lead.label}</ProvenanceMono>
      </CardShell>
    );
  }

  return (
    <CardShell fill="grey">
      <h3 className={styles.crewName}>{member.name}</h3>
      <dl className={styles.fields}>
        {crewFields(member, lead.text).map((field) => (
          <div className={styles.field} key={field.label}>
            <dt className={styles.fieldLabel}>{field.label}</dt>
            {field.values.map((value) => (
              <dd className={styles.fieldValue} key={value}>
                {value}
              </dd>
            ))}
          </div>
        ))}
      </dl>
      <div className={styles.cardMarks}>
        <ProvenanceMarks content={lead} />
      </div>
    </CardShell>
  );
}

export default function CrewPage() {
  const intro = gateProse("general", crewIntro, crewIntro.body);

  // The h1, the pill and the intro are three fields of ONE record. If that
  // record ever stops being renderable, a page that still printed its title
  // would be publishing the withheld half of it, so this fails the build
  // loudly instead — the same direction `app/watch-your-step/(shell)/data`
  // takes, and the same direction `shipsLogTimeline()` takes on a malformed
  // Bridge position.
  if (!isShowable(intro)) {
    throw new Error("The Crew Manifest header is not renderable.");
  }

  return (
    <article className={styles.page}>
      <header className={styles.head}>
        <p className={styles.pillRow}>
          <Pill variant="status">{crewIntro.pill}</Pill>
        </p>
        <h1 className={styles.title}>{crewIntro.title}</h1>
        <div className={styles.lead}>
          <GatedText content={intro} />
        </div>
        {crewIntro.orderTags.length > 0 ? (
          <p className={styles.tags}>
            {crewIntro.orderTags.map((id) => (
              <Pill variant="outlined" size="sm" key={id}>
                {standingOrderTag(id)}
              </Pill>
            ))}
          </p>
        ) : null}
      </header>

      {ROLES.map((role) => (
        <section className={styles.section} aria-labelledby={ROLE_SECTION_IDS[role]} key={role}>
          <h2 className={styles.sectionHeading} id={ROLE_SECTION_IDS[role]}>
            {CREW_ROLE_LABELS[role]}
          </h2>
          <ul className={styles.cards}>
            {crewByRole(role).map((member) => (
              <li key={member.id}>
                <CrewCard member={member} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  );
}
