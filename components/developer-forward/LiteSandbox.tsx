"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { caseByNumber, decisionById, optionById } from "@/content/developer-forward/cases";
import type { AiCompletionReport } from "@/content/developer-forward/cases";
import {
  C5_AI_EXPLANATION_BODY,
  HANDLE,
  INFO_MARKERS,
  LITE_INTRO,
  PROGRESS,
  REFLECTION,
  RESULT,
  RESUME_RESULT_CTA
} from "@/content/developer-forward/copy";
import {
  caseCloseForCase,
  gatedCardById,
  openingCallbackForCase,
  reflectionEchoPrefix
} from "@/content/developer-forward/surfaces";
import type { CaseClose, OpeningCallback, SlotLine } from "@/content/developer-forward/surfaces";
import { fragmentText } from "@/content/developer-forward/variants";
import { ROUTES, STAMP, VERSION_MANIFEST } from "@/content/developer-forward/stamp/v1-1-0";
import { CASE_NUMBERS, caseOfDecision } from "@/lib/developer-forward/types";
import type {
  ActivePath,
  CaseNumber,
  DecisionId,
  LiteDataset,
  LiteResult,
  OptionId
} from "@/lib/developer-forward/types";
import {
  clearLiteState,
  emptyLiteDataset,
  isUnstartedLiteDataset,
  readLiteState,
  startLiteDataset,
  storageAvailable,
  writeLiteState
} from "@/lib/developer-forward/storage";
import { appendEventInSession, rollSessionIfIdle } from "@/lib/developer-forward/session";
import { makeLocalTimestamp } from "@/lib/developer-forward/ledger";
import type { LedgerEventInput } from "@/lib/developer-forward/ledger";
import {
  SIGNAL_LOOKUP,
  activeDecisionFor,
  casesWithChangedScenario,
  decisionsOfCase,
  isCaseNavigable,
  isCaseTitleVisible,
  latestExactAnswers,
  resolveActivePathFromAnswers,
  resultAndExportsPresent
} from "@/lib/developer-forward/pointers";
import { dimensionStateFromActivePath } from "@/lib/developer-forward/aggregation";
import { calculateShip } from "@/lib/developer-forward/scoring";
import { composeNarrative } from "@/lib/developer-forward/narrative";
import { allReceipts } from "@/lib/developer-forward/receipts";
import {
  activePathReflections,
  buildClipboardSummary,
  clipboardSummaryFields,
  copyLiteSummary,
  downloadLiteExportJson,
  downloadLiteExportMarkdown
} from "@/lib/developer-forward/exports";
import type { ClipboardOutcome, ClipboardSummaryFieldId, LiteExportInput } from "@/lib/developer-forward/exports";
import { trackDeveloperForward } from "@/lib/developer-forward/telemetry";
import type { DeveloperForwardEventName, DeveloperForwardEventProperties } from "@/lib/developer-forward/telemetry";
import { ActionPill } from "@/components/ui/ActionPill";
import { cx } from "@/components/provenance/cx";
import { CaseScreen } from "@/components/developer-forward/CaseScreen";
import { DecisionRow } from "@/components/developer-forward/DecisionRow";
import { ReflectionBox } from "@/components/developer-forward/ReflectionBox";
import { Reveal } from "@/components/developer-forward/Reveal";
import { TeaserCard } from "@/components/developer-forward/TeaserCard";
import styles from "./lite.module.css";

/**
 * `LiteSandbox` — the one client island for the whole five-case run
 * (plan §6.10, Phases 8-11).
 *
 * ONE URL, AND THE URL IS NOT THE STATE. Every screen of the run — intro, five
 * cases, eleven decisions, five reflections, four closes, the handle ask, the
 * reveal — is mounted at `/developer-forward-lite`, and the learner's position
 * lives in `localStorage` and in this component's ephemeral phase, never in a
 * path segment, a query or a hash. That is SC-TF8's standing instruction and it
 * is not a preference: `components/GoogleAnalytics.tsx` is byte-frozen with
 * `send_page_view: true`, so any learner state that reaches the URL is
 * transmitted on every navigation. A router-driven wizard would have shipped
 * the learner's case number, and eventually their answers, to a vendor.
 *
 * THE LEDGER IS THE STATE; EVERYTHING ELSE IS DERIVED. This component holds one
 * `LiteDataset` and appends to its ledger. It stores no "current case", no
 * "answers" map and no completion flag, because every one of those is a second
 * place the same fact could be wrong. The active path — which exact questions
 * stand right now, under which world-state variants, and which of them are
 * answered — comes out of `resolveActivePathFromAnswers` on every render, and
 * an upstream edit therefore re-resolves the downstream world with no
 * invalidation pass written here. Restoration is exact-match on
 * `variantId::decisionId`: an answer given under a world that no longer stands
 * is not evidence about the world that does.
 *
 * WHAT IS EPHEMERAL, AND WHY IT IS ALLOWED TO BE. `phase` and `cursor` are the
 * two pieces of screen position that are NOT in the ledger. They are honestly
 * transient: on reload the run resumes at the first unanswered active decision,
 * or at the reveal when the path is complete. A close screen, a reflection
 * surface and the handle ask are moments between answers, not places, so
 * persisting them would invent a resumable state the handoff never described —
 * and would let a stale cursor point at a case an upstream edit has un-reached.
 *
 * NO SIDE EFFECT INSIDE A STATE UPDATER. Every mutation goes through `apply()`,
 * which writes through `writeLiteState` and then sets state with the dataset
 * that was ACTUALLY PERSISTED. `setDataset(prev => append(prev, …))` would be
 * the obvious form and it is wrong: React may invoke an updater twice, and an
 * updater that appends a ledger event would record the learner's decision
 * twice, with two sequences, in a log whose whole contract is that it is
 * replayable. `datasetRef` carries the current dataset for the handlers so they
 * never need one.
 *
 * THE RESULT AND BOTH EXPORTS ARE ABSENT, NOT DISABLED. `resultAndExportsPresent`
 * gates them, `scoringAnswers`-style: when any active required decision is
 * unanswered there is no `LiteResult` to render, so `<Reveal/>` is not mounted
 * at all. A greyed-out export button would be a claim that a file exists and is
 * being withheld; nothing exists.
 *
 * PROGRESS IS A LABEL AND FUTURE TITLES ARE SPOILERS. `PROGRESS.caseLabel` gives
 * the case the learner is ON. The reached-case navigator renders numbers only,
 * and a case title reaches the screen only through `isCaseTitleVisible` —
 * `EXPERIENCE.futureCaseTitlesHiddenUntilReached` is stamped, and Case 5 is
 * TAKE THE WHEEL: a learner who reads that before Case 1 answers Case 1
 * differently.
 *
 * REFLECTIONS ARE EVIDENCE, NEVER INPUT. Five surfaces, one per case, at the
 * five `REFLECTION_PLACEMENTS`. Nothing the learner writes is passed to
 * `dimensionStateFromActivePath`, `calculateShip`, `resolveCaseVariant` or any
 * receipt — structurally, because those functions take the active path and the
 * signal lookup and have no parameter through which text could arrive. Drafts
 * autosave into `dataset.drafts` and NOT as a ledger event per keystroke: the
 * ledger is the learner's decision history, and a typing log would bury it and
 * would copy their words into the export dozens of times.
 *
 * TELEMETRY IS ORDINALS ONLY. Every call goes through `trackDeveloperForward`, whose
 * allowlist has no key that could carry an option id, a variant id, a SHIP code,
 * a handle or a word of writing. This island never builds a property object from
 * anything but a case number, a decision ordinal and the stamped app version.
 *
 * THE SURFACES OWN THEIR OWN MARKUP; THIS FILE OWNS THE COMPOSITION BETWEEN
 * THEM. `CaseScreen`, `DecisionRow`, `InfoMarker`, `ReflectionBox`,
 * `TeaserCard` and `Reveal` each draw one thing and are told what to draw. What
 * is left over — which authored blocks make up a scenario, where a case close
 * sits relative to the advance control, which slot lines carry a learner's own
 * words — is ARRANGEMENT, and arrangement is decided by whoever knows the
 * active path. So it is decided here, in §3.10, out of authored records and
 * with no sentence typed into this file.
 *
 * WHICH SIDE MOVED, AND WHY, for each prop contract this island passes. The
 * rule applied was: a surface is widened when it is being handed something it
 * should reasonably render on its own (a whole result, a learner's handle, a
 * set of clipboard rows); the CALL SITE moves instead when what was being
 * handed over is really assembly — an order, a set of visibility flags, a
 * choice about what sits next to what.
 *
 *   CaseScreen    CALL SITE. It was being passed `caseData` plus
 *                 `scenarioVisible` / `changedConditionVisible` / `close` /
 *                 `reflectionEcho`, which is a shell being asked to be three
 *                 screens behind four booleans. It stays a shell — a header, a
 *                 rail, a `scenario` slot, `children` and a `footer` — and the
 *                 three screens are composed here instead.
 *   DecisionRow   CALL SITE. It is ONE A/B/C row and its name, its stylesheet
 *                 and its own header all say so. The decision's setup lines,
 *                 heading, question and its three rows are composed here.
 *   ReflectionBox CALL SITE. It takes `value` / `onChange` and the three
 *                 actions; which of the five placements is showing, and whose
 *                 draft that is, are path questions and stay on this side.
 *   TeaserCard    CALL SITE. One card's authored fields, not the card record —
 *                 the component's own header pins that ("EVERY WORD IS A
 *                 PROP"), and picking the card is a content decision made here.
 *   Reveal        WIDENED, then one prop adapted. It now accepts `handle`,
 *                 `clipboardFields` (nullable — no rows, no control),
 *                 `onReopenDecisions` and `onContinueToFull`, because every one
 *                 of those is something the reveal should render or fire on its
 *                 own. `labels` went the other way: seven control strings are
 *                 assembly, the component refuses to author them, and this file
 *                 is the composition root that supplies them.
 *
 * THE PROP CONTRACT THIS ISLAND PASSES, stated once so the surfaces can be read
 * against it rather than inferred from call sites:
 *
 *   CaseScreen    caseLabel, step, total, title (null = withheld), job, notice,
 *                 scenario, children, footer
 *   DecisionRow   optionId, label, detail, selected, onSelect — ONE option row,
 *                 so the decision's setup, heading, question and its three rows
 *                 are composed here
 *   ReflectionBox value, onChange, onContinue, onSkip, onAlwaysSkip; and in its
 *                 `suppressed` form, value, onChange, onShowInput
 *   TeaserCard    title, body, ctaLabel, href
 *   Reveal        result, reflections, handle, fullHref, clipboardFields,
 *                 labels, onExportMarkdown, onExportJson, onCopySummary,
 *                 onReopenDecisions, onStartOver, onContinueToFull,
 *                 onExportFirst, onViewed
 *
 * `TeaserCard` renders its CTA as a plain link with no click hook, so
 * `df_full_developer_forward_clicked` fires from the reveal's CTA AND from the four
 * gated teaser cards, which are the product's real conversion surface. It used
 * to fire from the reveal only, and not by design: `components/ui/ActionPill`
 * rendered an anchor without its `onClick`, so the teaser handler was accepted
 * and silently discarded — no type error, no failing test, and an event that
 * simply never arrived. Fixed in the primitive, where the next caller to pass
 * both an `href` and an `onClick` would otherwise have hit the same thing.
 *
 * The event carries no card identity. Which of the four was clicked is a path
 * signal, and the property allowlist has no field for it. That is an
 * under-count on the four gated cards and it is recorded here rather than
 * papered over with a wrapper element that intercepts a click on a control this
 * file does not own.
 *
 * STORAGE UNAVAILABLE IS A RENDERED STATE. iOS Safari in private browsing throws
 * on `localStorage` access and iPhone Safari at ~390 CSS px is the primary QA
 * target, so `TEST_PLAN.md` requires a pre-start explanation rather than a blank
 * screen or a thrown error. See `renderBlocked()` for the one thing this build
 * could not do about that surface's wording.
 */

/* -------------------------------------------------------------------------- */
/* 1. Screen position — ephemeral by design (see the header)                  */
/* -------------------------------------------------------------------------- */

type Phase =
  | { readonly kind: "intro" }
  | { readonly kind: "decisions" }
  | { readonly kind: "reflection"; readonly decisionId: DecisionId }
  | { readonly kind: "close"; readonly caseNumber: CaseNumber }
  | { readonly kind: "handle" }
  | { readonly kind: "result" };

const INTRO: Phase = { kind: "intro" };
const DECISIONS: Phase = { kind: "decisions" };

const LAST_CASE: CaseNumber = CASE_NUMBERS[CASE_NUMBERS.length - 1];

/** The learner's exact selected option text, keyed by decision, for slot lines. */
type SlotChoices = Partial<Record<DecisionId, string>>;

/**
 * The seven reveal control labels the approved sources do not supply.
 *
 * `UX_COPY.md`'s "## Final result" words the receipts toggle, `See full`, the
 * completion CTA, `Reopen your decisions` and `Start over` — those come from
 * `RESULT` and `Reveal` reads them there. It names the export and copy controls
 * without wording them ("export + copy actions"), and `INSTALLATION.md` specifies
 * the two-step destructive confirmation and the completed learner's "Export
 * first" as BEHAVIOUR with no strings at all. `Reveal` therefore refuses to type
 * them into itself and takes them as a prop, and the composition root is this
 * file.
 *
 * SO THIS IS THE ONE PLACE THIS ISLAND AUTHORS A CONTROL LABEL, and it is
 * recorded rather than hidden. Each is the specification's own noun for the
 * control — `EXPORT_SPEC.md` says Markdown, JSON and summary; `INSTALLATION.md`
 * says "Export first" — capitalised and nothing more, exactly the rule
 * `EXPORT_SECTION_LABELS` in `lib/developer-forward/exports.ts` states for the
 * export headings and tags `implementation_authored_under_ben_approved_rule`.
 * The destructive confirmation reuses `RESULT.destructiveCta` so the second
 * press says what the first one said.
 *
 * They belong in `content/developer-forward/copy.ts` under that provenance tag the
 * moment there is a group for them. Until then this constant is the record of
 * which strings on the reveal are not Ben's.
 */
const REVEAL_ACTION_LABELS = {
  exportMarkdown: "Export Markdown",
  exportJson: "Export JSON",
  copySummary: "Copy summary",
  copyConfirm: "Copy",
  startOverExportFirst: "Export first",
  startOverConfirm: RESULT.destructiveCta,
  startOverCancel: "Cancel"
} as const;

/* -------------------------------------------------------------------------- */
/* 2. Pure helpers over a resolved path                                       */
/* -------------------------------------------------------------------------- */

/**
 * The ordinal of a decision WITHIN its case, 1-based.
 *
 * This is the only decision identity telemetry is allowed to carry:
 * `decision_number` is domain-checked 1-3, and `C2D1` as a string would be a
 * finer-grained fact than the funnel needs.
 */
function decisionOrdinal(decisionId: DecisionId): number {
  return decisionsOfCase(caseOfDecision(decisionId)).indexOf(decisionId) + 1;
}

/** The variant id standing for a case on this path, or null if unreached. */
function caseVariantId(path: ActivePath, caseNumber: CaseNumber): string | null {
  return path.decisions.find((decision) => decision.caseNumber === caseNumber)?.variant.id ?? null;
}

/** True when every active decision of a case is answered. */
function caseAnswered(path: ActivePath, caseNumber: CaseNumber): boolean {
  const decisions = path.decisions.filter((decision) => decision.caseNumber === caseNumber);
  return decisions.length > 0 && decisions.every((decision) => decision.selectedOptionId !== null);
}

/**
 * What an upstream edit did to the cases after it.
 *
 * A downstream case whose variant tuple moved is either RESTORED — the learner
 * had answered this exact new tuple before, so `resolveActivePathFromAnswers`
 * found it — or INVALIDATED, in which case its decisions are open again. Both
 * are recorded, because "your later answers survived" and "your later answers
 * are gone" are different things to have happened to someone and the ledger is
 * the only place that difference is preserved.
 */
function downstreamChanges(
  before: ActivePath,
  after: ActivePath,
  editedCase: CaseNumber
): readonly { readonly caseNumber: CaseNumber; readonly restored: boolean }[] {
  const changes: { caseNumber: CaseNumber; restored: boolean }[] = [];
  for (const caseNumber of CASE_NUMBERS) {
    if (caseNumber <= editedCase) continue;
    if (!before.reachedCases.includes(caseNumber)) continue;
    const was = caseVariantId(before, caseNumber);
    const now = caseVariantId(after, caseNumber);
    if (now === was) continue;
    changes.push({ caseNumber, restored: now !== null && caseAnswered(after, caseNumber) });
  }
  return changes;
}

/* -------------------------------------------------------------------------- */
/* 3. The island                                                              */
/* -------------------------------------------------------------------------- */

export function LiteSandbox({ children }: { children: ReactNode }) {
  /**
   * `children` is the server-composed intro block (see the page's header). It
   * is a slot rather than markup here so the intro's words are in the initial
   * HTML for a crawler and for the first paint, and still disappear the moment
   * the run starts.
   */
  const [dataset, setDataset] = useState<LiteDataset>(() => emptyLiteDataset());
  const datasetRef = useRef<LiteDataset>(dataset);
  const [phase, setPhase] = useState<Phase>(INTRO);
  const [cursor, setCursor] = useState<CaseNumber | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [handleDraft, setHandleDraft] = useState("");
  const handleAskedRef = useRef(false);
  const resultViewedRef = useRef(false);

  /* ---------------------------------------------------------------------- */
  /* 3.1 Telemetry                                                          */
  /* ---------------------------------------------------------------------- */

  /**
   * The one call site. `app_version` is stamped on every event from the version
   * manifest rather than typed per call, so a restamp moves the funnel with it
   * and no event can report a version the build is not running.
   */
  const track = useCallback((name: DeveloperForwardEventName, props: DeveloperForwardEventProperties = {}) => {
    trackDeveloperForward(name, { ...props, app_version: VERSION_MANIFEST.appVersion });
  }, []);

  /* ---------------------------------------------------------------------- */
  /* 3.2 Persistence                                                        */
  /* ---------------------------------------------------------------------- */

  /**
   * Write through, then render what was stored.
   *
   * `writeLiteState` returns the dataset it actually persisted after the
   * serializer's allowlist has run, so state and storage cannot drift: a field
   * the serializer would have dropped is dropped here too, in the same render,
   * rather than living on in memory until the next reload silently removes it.
   * A refused write (quota, restricted browser) keeps the run working in memory.
   */
  const apply = useCallback((next: LiteDataset) => {
    const written = writeLiteState(next);
    datasetRef.current = written.dataset;
    setDataset(written.dataset);
  }, []);

  /** Append events under the six-hour session rule, in order, then persist. */
  const commit = useCallback(
    (events: readonly LedgerEventInput[]): LiteDataset => {
      let next = datasetRef.current;
      for (const event of events) {
        next = appendEventInSession(next, event).dataset;
      }
      apply(next);
      return next;
    },
    [apply]
  );

  /* ---------------------------------------------------------------------- */
  /* 3.3 Mount                                                              */
  /* ---------------------------------------------------------------------- */

  /**
   * The first render on the client is deliberately the SERVER'S render — the
   * intro — and only this effect moves it. Reading `localStorage` during render
   * would either mismatch hydration or force the route out of prerendering, and
   * both of those cost more than one frame of intro.
   */
  useEffect(() => {
    if (!storageAvailable()) {
      setBlocked(true);
      setHydrated(true);
      return;
    }
    const read = readLiteState();
    if (read.storageBlocked) {
      setBlocked(true);
      setHydrated(true);
      return;
    }
    const rolled = rollSessionIfIdle(read.dataset);
    datasetRef.current = rolled.dataset;
    setDataset(rolled.dataset);
    if (rolled.rolled) writeLiteState(rolled.dataset);

    if (isUnstartedLiteDataset(rolled.dataset)) {
      setPhase(INTRO);
    } else {
      const path = resolveActivePathFromAnswers(STAMP, latestExactAnswers(rolled.dataset.ledger));
      setPhase(resultAndExportsPresent(path) ? { kind: "result" } : DECISIONS);
    }
    setHydrated(true);
  }, []);

  /* ---------------------------------------------------------------------- */
  /* 3.4 Derivation                                                         */
  /* ---------------------------------------------------------------------- */

  const answers = useMemo(() => latestExactAnswers(dataset.ledger), [dataset]);
  const path = useMemo(() => resolveActivePathFromAnswers(STAMP, answers), [answers]);
  const changedCases = useMemo(() => casesWithChangedScenario(path, answers), [path, answers]);

  /**
   * The case in front of the learner: the one they navigated to, else the one
   * holding the first unanswered active decision, else the last case. Derived,
   * never stored — an upstream edit that un-reaches a case moves this with it.
   */
  const activeCase: CaseNumber = useMemo(() => {
    if (cursor !== null && isCaseNavigable(path, cursor)) return cursor;
    const open = path.decisions.find((decision) => decision.selectedOptionId === null);
    return open ? open.caseNumber : LAST_CASE;
  }, [cursor, path]);

  /** Every answered active decision's EXACT option text, for the slot lines. */
  const slotChoices = useMemo<SlotChoices>(() => {
    const choices: SlotChoices = {};
    for (const decision of path.decisions) {
      if (decision.selectedOptionId === null) continue;
      const option = optionById(decision.decisionId, decision.selectedOptionId);
      const text = option.label ?? option.detail;
      if (text !== null) choices[decision.decisionId] = text;
    }
    return choices;
  }, [path]);

  /**
   * The deterministic result, or `null`.
   *
   * Assembled here rather than in `Reveal` so that the surface has no path to a
   * partial result: when the gate is shut there is no object to render one from.
   * Nothing in this computation can see a reflection or a handle.
   */
  const result = useMemo<LiteResult | null>(() => {
    if (!resultAndExportsPresent(path)) return null;
    const dimensionState = dimensionStateFromActivePath(path, SIGNAL_LOOKUP);
    const ship = calculateShip(dimensionState);
    return {
      dimensionState,
      ship,
      profileKey: ship.profileKey,
      narrative: composeNarrative(dimensionState),
      receipts: allReceipts(path)
    };
  }, [path]);

  const reflections = useMemo(() => activePathReflections(dataset, path), [dataset, path]);

  /** Everything an export needs. The clock is read at the moment of the click. */
  const exportInput = useCallback(
    (): LiteExportInput => ({
      dataset: datasetRef.current,
      activePath: path,
      result,
      exportedAtLocal: makeLocalTimestamp(new Date())
    }),
    [path, result]
  );

  const clipboardFields = useMemo(
    () => (result === null ? null : clipboardSummaryFields(exportInput())),
    [result, exportInput]
  );

  const draftFor = useCallback(
    (decisionId: DecisionId): string =>
      dataset.drafts.find((draft) => draft.decisionId === decisionId)?.text ?? "",
    [dataset]
  );

  /* ---------------------------------------------------------------------- */
  /* 3.5 The reveal is viewed once                                          */
  /* ---------------------------------------------------------------------- */

  /**
   * `Reveal` fires this once per mount; the ref makes it once per RUN, so
   * stepping back into the decisions and returning does not report a second
   * first viewing.
   */
  const onResultViewed = useCallback(() => {
    if (resultViewedRef.current) return;
    resultViewedRef.current = true;
    commit([{ type: "result_viewed" }]);
    track("df_ship_result_viewed");
  }, [commit, track]);

  /** Opening "Why this result?" and "See full" are both detail views. */
  const onReceiptsOpened = useCallback(() => {
    commit([{ type: "result_detail_viewed" }]);
  }, [commit]);

  /* ---------------------------------------------------------------------- */
  /* 3.6 Transitions                                                        */
  /* ---------------------------------------------------------------------- */

  /** Case 1 begins immediately; the intro is a sentence, not a gate. */
  const onStart = useCallback(() => {
    let next = startLiteDataset(VERSION_MANIFEST);
    next = appendEventInSession(next, { type: "lite_started" }).dataset;
    next = appendEventInSession(next, { type: "case_reached", caseNumber: 1 }).dataset;
    apply(next);
    setCursor(null);
    setPhase(DECISIONS);
    track("df_lite_started");
    track("df_case_reached", { case_number: 1 });
  }, [apply, track]);

  /** Where the run goes once a case's last decision and its reflection are done. */
  const leaveCase = useCallback((caseNumber: CaseNumber) => {
    setCursor(null);
    if (caseNumber < LAST_CASE) {
      setPhase({ kind: "close", caseNumber });
      return;
    }
    setPhase({ kind: "result" });
  }, []);

  /** After an answer: the reflection if one is placed here, else onward. */
  const afterAnswer = useCallback(
    (decisionId: DecisionId, suppressed: boolean) => {
      const caseNumber = caseOfDecision(decisionId);
      const placement = REFLECTION.placements.find((entry) => entry.afterDecisionId === decisionId);
      if (placement && !suppressed) {
        setPhase({ kind: "reflection", decisionId });
        track("df_reflection_shown", { case_number: caseNumber });
        return;
      }
      const decisions = decisionsOfCase(caseNumber);
      if (decisions[decisions.length - 1] === decisionId) {
        leaveCase(caseNumber);
        return;
      }
      setPhase(DECISIONS);
    },
    [leaveCase, track]
  );

  /**
   * Record one selection.
   *
   * `decision_changed` does not supersede `decision_selected` in place — both
   * stay in the ledger and the higher sequence simply wins the lookup, which is
   * what makes an edit reversible without rewriting history. Re-selecting the
   * option already standing appends nothing: it is not a decision, and a ledger
   * full of no-op events is a ledger nobody can read.
   */
  const onSelect = useCallback(
    (decisionId: DecisionId, optionId: OptionId) => {
      const active = activeDecisionFor(path, decisionId);
      if (!active) return;
      const suppressed = datasetRef.current.reflectionsSuppressed;

      if (active.selectedOptionId === optionId) {
        afterAnswer(decisionId, suppressed);
        return;
      }

      const caseNumber = active.caseNumber;
      const changed = active.selectedOptionId !== null;

      // The answer is written FIRST, then the path is re-resolved from what was
      // actually stored, and only then are the consequences recorded. Deriving
      // the new world from a fabricated in-memory event would be deriving it
      // from something the ledger does not contain.
      const answered = commit([
        {
          type: changed ? "decision_changed" : "decision_selected",
          caseNumber,
          decisionId,
          variantId: active.variant.id,
          selectedOptionId: optionId
        }
      ]);

      const nextPath = resolveActivePathFromAnswers(STAMP, latestExactAnswers(answered.ledger));
      const changes = downstreamChanges(path, nextPath, caseNumber);
      const reached = nextPath.reachedCases.filter(
        (candidate) => !path.reachedCases.includes(candidate)
      );

      const consequences: LedgerEventInput[] = [
        ...changes.map((change) => ({
          type: change.restored ? ("downstream_restored" as const) : ("downstream_invalidated" as const),
          caseNumber: change.caseNumber
        })),
        ...reached.map((candidate) => ({ type: "case_reached" as const, caseNumber: candidate }))
      ];
      if (consequences.length > 0) commit(consequences);

      track(changed ? "df_answer_changed" : "df_decision_completed", {
        case_number: caseNumber,
        decision_number: decisionOrdinal(decisionId)
      });
      for (const change of changes) {
        track(
          change.restored ? "df_downstream_scenario_resolved" : "df_downstream_scenario_invalidated",
          { case_number: change.caseNumber, from_case_number: caseNumber }
        );
      }
      for (const candidate of reached) track("df_case_reached", { case_number: candidate });
      if (nextPath.complete && !path.complete) track("df_case5_completed", { case_number: LAST_CASE });

      afterAnswer(decisionId, suppressed);
    },
    [afterAnswer, commit, path, track]
  );

  /* ---------------------------------------------------------------------- */
  /* 3.7 Reflections                                                        */
  /* ---------------------------------------------------------------------- */

  /**
   * Autosave, and nothing else.
   *
   * The draft is stored under `drafts`, which the serializer declares and the
   * export carries as the learner's own unfinished writing. No ledger event is
   * appended per keystroke: see the header.
   */
  const onDraftChange = useCallback(
    (decisionId: DecisionId, text: string) => {
      const current = datasetRef.current;
      const drafts = current.drafts.some((draft) => draft.decisionId === decisionId)
        ? current.drafts.map((draft) => (draft.decisionId === decisionId ? { decisionId, text } : draft))
        : [...current.drafts, { decisionId, text }];
      apply({ ...current, drafts });
    },
    [apply]
  );

  /**
   * Continue commits what is there. An empty box is a skip, not an empty
   * reflection: Ben's import contract treats reflections as verbatim evidence,
   * and a stored empty string would be a placeholder pretending to be evidence.
   * The text itself is never trimmed — only the emptiness test is.
   */
  const onReflectionContinue = useCallback(
    (decisionId: DecisionId) => {
      const text = draftFor(decisionId);
      if (text.trim().length > 0) {
        commit([
          { type: "reflection_committed", caseNumber: caseOfDecision(decisionId), decisionId, text }
        ]);
      } else {
        commit([{ type: "reflection_skipped", caseNumber: caseOfDecision(decisionId), decisionId }]);
      }
      leaveCase(caseOfDecision(decisionId));
    },
    [commit, draftFor, leaveCase]
  );

  const onReflectionSkip = useCallback(
    (decisionId: DecisionId) => {
      const caseNumber = caseOfDecision(decisionId);
      commit([{ type: "reflection_skipped", caseNumber, decisionId }]);
      track("df_reflection_skipped", { case_number: caseNumber });
      leaveCase(caseNumber);
    },
    [commit, leaveCase, track]
  );

  /**
   * "Always skip" suppresses the SURFACE for the rest of the run. It deletes
   * nothing: drafts already written survive, the preference change is recorded,
   * and `REFLECTION.showInput` brings the surface back from the footer.
   */
  const onReflectionAlwaysSkip = useCallback(
    (decisionId: DecisionId) => {
      const caseNumber = caseOfDecision(decisionId);
      const current = datasetRef.current;
      apply({ ...current, reflectionsSuppressed: true });
      commit([
        { type: "reflection_skipped", caseNumber, decisionId },
        { type: "reflection_preference_changed", caseNumber, value: true }
      ]);
      track("df_reflection_always_skip", { case_number: caseNumber });
      leaveCase(caseNumber);
    },
    [apply, commit, leaveCase, track]
  );

  /** The reversal. Reachable from inside the run, not from a settings screen. */
  /**
   * Reopen a case's note after its reflection surface has already passed.
   *
   * The run shows each of the five reflection surfaces EXACTLY ONCE, right
   * after that case's last decision. Continue or Skip and it is gone: the only
   * route back was `renderSuppressedFooter`, which renders only while
   * `reflectionsSuppressed` is true. So a learner who simply clicked Skip —
   * never "Always skip" — had no way to add a note afterwards, and a learner
   * who wrote one had no way to edit it.
   *
   * Reopening is safe because the ledger is append-only and the reader takes
   * the highest-sequence commit per decision: a later note supersedes an
   * earlier one, and the earlier one stays in the export as history. Nothing is
   * overwritten and nothing is lost.
   */
  const onReopenNote = useCallback(
    (caseNumber: CaseNumber) => {
      const placement = REFLECTION.placements.find(
        (entry) => caseOfDecision(entry.afterDecisionId) === caseNumber
      );
      if (!placement) return;
      if (!activeDecisionFor(path, placement.afterDecisionId)?.selectedOptionId) return;
      setCursor(caseNumber);
      setPhase({ kind: "reflection", decisionId: placement.afterDecisionId });
      track("df_reflection_shown", { case_number: caseNumber });
    },
    [path, track]
  );

  const onShowReflections = useCallback(() => {
    const current = datasetRef.current;
    apply({ ...current, reflectionsSuppressed: false });
    commit([{ type: "reflection_preference_changed", caseNumber: activeCase, value: false }]);
    track("df_reflection_reenabled", { case_number: activeCase });
    const placement = REFLECTION.placements.find(
      (entry) => caseOfDecision(entry.afterDecisionId) === activeCase
    );
    if (placement && activeDecisionFor(path, placement.afterDecisionId)?.selectedOptionId) {
      setPhase({ kind: "reflection", decisionId: placement.afterDecisionId });
      track("df_reflection_shown", { case_number: activeCase });
    }
  }, [activeCase, apply, commit, path, track]);

  /* ---------------------------------------------------------------------- */
  /* 3.8 Closes, the handle ask, navigation, reset                          */
  /* ---------------------------------------------------------------------- */

  /**
   * Leaving a close screen. Case 1's close is the ONE place the handle is
   * asked (`HANDLE.afterCaseNumber`), and asking it here rather than on the
   * intro is the difference between a continuity offer and a signup form: the
   * learner has something worth continuing by now. It is asked once per mount
   * and never again once a handle exists.
   */
  const onCloseContinue = useCallback(
    (caseNumber: CaseNumber) => {
      if (
        caseNumber === HANDLE.afterCaseNumber &&
        datasetRef.current.handle === null &&
        !handleAskedRef.current
      ) {
        handleAskedRef.current = true;
        setPhase({ kind: "handle" });
        return;
      }
      setCursor(null);
      setPhase(DECISIONS);
    },
    []
  );

  const onHandleAdd = useCallback(() => {
    const value = handleDraft.trim();
    if (value.length > 0) {
      const current = datasetRef.current;
      apply({ ...current, handle: value });
      commit([{ type: current.handle === null ? "handle_set" : "handle_changed" }]);
    }
    setHandleDraft("");
    setCursor(null);
    setPhase(DECISIONS);
  }, [apply, commit, handleDraft]);

  /** Declining is a full-weight choice and records nothing about the person. */
  const onHandleDecline = useCallback(() => {
    setHandleDraft("");
    setCursor(null);
    setPhase(DECISIONS);
  }, []);

  const onNavigateToCase = useCallback(
    (caseNumber: CaseNumber) => {
      if (!isCaseNavigable(path, caseNumber)) return;
      const from = activeCase;
      commit([{ type: "navigated", caseNumber }]);
      setCursor(caseNumber);
      setPhase(DECISIONS);
      if (caseNumber < from) {
        track("df_navigation_back", { case_number: caseNumber, from_case_number: from });
      }
    },
    [activeCase, commit, path, track]
  );

  const onReopenDecisions = useCallback(() => {
    onNavigateToCase(CASE_NUMBERS[0]);
  }, [onNavigateToCase]);

  /**
   * Start over.
   *
   * The `reset` event is appended and PERSISTED before the key is removed, so
   * the last thing the stored dataset says about itself is why it is about to
   * vanish — a second tab reading the key, or a learner reading an export taken
   * a moment earlier, sees the reason rather than an unexplained absence.
   * `clearLiteState` then removes THIS product's key and nothing else: not the
   * site-wide namespace, and not the analytics consent decision.
   *
   * The two-step confirmation the versioning ruling requires belongs to the
   * surface that draws the button; this handler is the mechanism, never the
   * decision.
   */
  const onStartOver = useCallback(() => {
    commit([{ type: "reset" }]);
    const cleared = clearLiteState();
    datasetRef.current = cleared.dataset;
    setDataset(cleared.dataset);
    resultViewedRef.current = false;
    handleAskedRef.current = false;
    setCursor(null);
    setPhase(INTRO);
  }, [commit]);

  /* ---------------------------------------------------------------------- */
  /* 3.9 Exports                                                            */
  /* ---------------------------------------------------------------------- */

  const onExportMarkdown = useCallback(() => {
    commit([{ type: "export_markdown" }]);
    track("df_markdown_export_clicked");
    return downloadLiteExportMarkdown(exportInput());
  }, [commit, exportInput, track]);

  const onExportJson = useCallback(() => {
    commit([{ type: "export_json" }]);
    track("df_json_export_clicked");
    return downloadLiteExportJson(exportInput());
  }, [commit, exportInput, track]);

  const onCopySummary = useCallback(
    async (selection: readonly ClipboardSummaryFieldId[]): Promise<ClipboardOutcome> => {
      const text = buildClipboardSummary(exportInput(), selection);
      commit([{ type: "copy_summary" }]);
      track("df_copy_summary_clicked");
      return copyLiteSummary(text ?? "");
    },
    [commit, exportInput, track]
  );


  /**
   * The one conversion click this island can observe. `TeaserCard` renders its
   * CTA as a plain link with no click hook, so the four gated cards do not fire
   * this event; that under-count is recorded rather than papered over with a
   * wrapper element intercepting a click on a control this file does not own.
   */
  const onContinueToFull = useCallback(() => {
    track("df_full_developer_forward_clicked", { case_number: activeCase });
  }, [activeCase, track]);

  /* ---------------------------------------------------------------------- */
  /* 3.10 Composition                                                       */
  /* ---------------------------------------------------------------------- */

  /*
   * The six surfaces are PRIMITIVES, not screens: `CaseScreen` is a frame with
   * a scenario slot, a body and a footer, `DecisionRow` is ONE option row, and
   * `TeaserCard` takes three authored fields. Composing them — which authored
   * lines go in the scenario, which learner choice fills which slot, what sits
   * in the footer of a close — is the run's job and therefore this file's. Every
   * word below is an expression reading `content/developer-forward/`; nothing here
   * is a sentence, which is both the provenance rule and what
   * `tests/canonical-text.test.ts` enforces.
   */

  /**
   * One resurfacing line: authored lead, the learner's EXACT selected option
   * text, authored trail.
   *
   * The choice is never paraphrased, never ranked, never omitted and never
   * suppressed as redundant — the Case 5 slot table forbids all five by name.
   * When a slot's decision is unanswered the line renders its authored framing
   * and no choice, rather than inventing one.
   */
  const renderSlotLine = (line: SlotLine, key: string) => {
    const choice = slotChoices[line.slot.decisionId] ?? null;
    if (line.layout === "stacked") {
      return (
        <p className={styles.slotStacked} key={key}>
          <span className={styles.slotLead}>{line.lead}</span>
          {choice ? <span className={styles.slotChoice}>{choice}</span> : null}
          {line.trail ? <span className={styles.slotTrail}>{line.trail}</span> : null}
        </p>
      );
    }
    return (
      <p className={styles.slotInline} key={key}>
        {line.lead}
        {choice ? <span className={styles.slotChoice}>{choice}</span> : null}
        {line.trail}
      </p>
    );
  };

  /** Cases 2, 3 and 5. Case 4 has none, and none may be written for it. */
  const renderOpeningCallback = (callback: OpeningCallback) => (
    <section className={styles.callback}>
      {callback.intro.map((line) => (
        <p className={styles.line} key={line}>
          {line}
        </p>
      ))}
      {callback.lines.map((line, index) => renderSlotLine(line, line.slot.decisionId + index))}
      {callback.outro.map((line) => (
        <p className={styles.line} key={line}>
          {line}
        </p>
      ))}
    </section>
  );

  /**
   * Case 5's completion report. It is meant to look competent, and does.
   *
   * THE EXPLANATION BODY IS ONE STRING FOR ALL 27 VARIANTS
   * (09_final-copy-completion-2026-09-07/case5-ai-explanation-body, BEN_APPROVED,
   * scope `all_case5_variants`). The ruling forbids giving it framework,
   * library, file or variant-specific detail, and that prohibition is the case
   * rather than a copy preference: a report that named a real file, a real test
   * name or the learner's own stack would be a report the learner could go and
   * check, and checking it would settle the question the case exists to leave
   * open. Case 5's whole subject is a claim that is competent, plausible and
   * confidently incomplete — the learner has to decide what to do about it
   * WITHOUT a detail they can verify. So this body is deliberately unfalsifiable
   * from the outside, it is the same body on every path into Case 5, and it is
   * read from content/ rather than composed here. Any future branch on variant,
   * path or decision state would re-open the prohibition, not implement it.
   */
  const renderAiReport = (report: AiCompletionReport) => (
    <section className={styles.report}>
      <p className={styles.line}>{report.lead}</p>
      <p className={styles.reportHeadline}>{report.headline}</p>
      <ul className={styles.reportClaims}>
        {report.claims.map((claim) => (
          <li key={claim}>{claim}</li>
        ))}
      </ul>
      <p className={styles.reportBody}>{C5_AI_EXPLANATION_BODY}</p>
    </section>
  );

  const renderScenario = (
    number: CaseNumber,
    variantLines: readonly string[],
    callback: OpeningCallback | null
  ) => {
    const data = caseByNumber(number);
    return (
      <>
        {callback ? renderOpeningCallback(callback) : null}
        {data.scenario.heading ? <h2 className={styles.scenarioHeading}>{data.scenario.heading}</h2> : null}
        {data.scenario.lines.map((line) => (
          <p className={styles.line} key={line}>
            {line}
          </p>
        ))}
        {variantLines.map((line) => (
          <p className={styles.variantLine} key={line}>
            {line}
          </p>
        ))}
        {data.aiReport ? renderAiReport(data.aiReport) : null}
      </>
    );
  };

  /**
   * One decision: its authored setup, its heading if it has one, its question,
   * and its three options in AUTHORED ORDER — which is not rank. Selecting an
   * option never locks the row: an answer stays editable, and the ledger records
   * the change rather than overwriting the original.
   */
  const renderDecision = (decisionId: DecisionId, selectedOptionId: OptionId | null) => {
    const decision = decisionById(decisionId);
    return (
      <section className={styles.decision} key={decisionId}>
        {decision.setup.map((line) => (
          <p className={styles.line} key={line}>
            {line}
          </p>
        ))}
        {decision.title ? <h3 className={styles.decisionTitle}>{decision.title}</h3> : null}
        {decision.prompt ? <p className={styles.decisionPrompt}>{decision.prompt}</p> : null}
        <div className={styles.options}>
          {decision.options.map((option) => (
            <DecisionRow
              key={option.id}
              optionId={option.id}
              label={option.label}
              detail={option.detail}
              selected={selectedOptionId === option.id}
              onSelect={() => onSelect(decisionId, option.id)}
            />
          ))}
        </div>
      </section>
    );
  };

  /**
   * A case close: the factual replay, the boundary sentences, and the learner's
   * own words echoed back under it.
   *
   * The boundary lines are never trimmed for space. They are the reason the
   * replay is not a verdict, and Case 4's pair — Lite can show the difference,
   * and cannot know what it means — is the sentence the whole Lite-to-Full
   * argument rests on.
   */
  const renderClose = (close: CaseClose, echo: string | null) => (
    <section className={styles.close}>
      {close.heading ? <h2 className={styles.closeHeading}>{close.heading}</h2> : null}
      {close.intro.map((line) => (
        <p className={styles.line} key={line}>
          {line}
        </p>
      ))}
      {close.lines.map((line, index) => renderSlotLine(line, line.slot.decisionId + index))}
      {close.boundary.map((line) => (
        <p className={styles.boundary} key={line}>
          {line}
        </p>
      ))}
      {echo ? (
        <figure className={styles.echo}>
          <figcaption className={styles.echoLabel}>{reflectionEchoPrefix}</figcaption>
          <blockquote className={styles.echoText}>{echo}</blockquote>
        </figure>
      ) : null}
    </section>
  );

  /* ---------------------------------------------------------------------- */
  /* 3.11 Screens                                                           */
  /* ---------------------------------------------------------------------- */

  /**
   * The storage-unavailable surface.
   *
   * WHAT THIS BUILD COULD NOT DO: the approved sources supply no sentence for
   * this state. `TEST_PLAN.md` requires "a clear pre-start failure explanation"
   * and `content/developer-forward/copy.ts` carries no record for one — the gap is
   * not on `DEVELOPER_FORWARD_UNSOURCED_SURFACES` either. Rather than author a
   * sentence in `components/`, which is the one thing the provenance spine
   * forbids everywhere else, this renders the approved local-only disclosure —
   * the marker whose entire subject is the browser storage Lite depends on —
   * with the Start control ABSENT, so a learner reads what Lite needs and can
   * see that the run does not begin. When Ben approves wording for a blocked
   * browser it belongs in `copy.ts`, and this block renders that instead.
   */
  const renderBlocked = () => (
    <section className={styles.blocked}>
      <p className={styles.blockedLabel}>{INFO_MARKERS.localOnly.label}</p>
      <p className={styles.blockedBody}>{INFO_MARKERS.localOnly.expansion}</p>
    </section>
  );

  const renderIntro = () => (
    <>
      {children}
      <div className={styles.startActions}>
        <ActionPill variant="ink" full onClick={onStart}>
          {LITE_INTRO.cta}
        </ActionPill>
      </div>
    </>
  );

  /** The rail of reached cases. Numbers only — a title here would be a spoiler. */
  const renderCaseNav = () => (
    <nav className={styles.caseNav}>
      {CASE_NUMBERS.filter((caseNumber) => isCaseNavigable(path, caseNumber)).map((caseNumber) => (
        <button
          key={caseNumber}
          type="button"
          className={cx(styles.caseNavItem, caseNumber === activeCase && styles.caseNavCurrent)}
          aria-current={caseNumber === activeCase ? "step" : undefined}
          onClick={() => onNavigateToCase(caseNumber)}
        >
          {PROGRESS.caseLabel(caseNumber)}
        </button>
      ))}
    </nav>
  );

  const caseData = caseByNumber(activeCase);
  const caseDecisions = path.decisions.filter((decision) => decision.caseNumber === activeCase);
  const firstOpen = caseDecisions.findIndex((decision) => decision.selectedOptionId === null);
  const visibleDecisions = caseDecisions.slice(0, firstOpen === -1 ? caseDecisions.length : firstOpen + 1);
  const changedNotice = changedCases.includes(activeCase) ? PROGRESS.changedScenarioNotice : null;
  const variantLines =
    caseDecisions[0]?.variant.axes.map((axis) => fragmentText(activeCase, axis.fragmentId)) ?? [];
  const echoFor = (caseNumber: CaseNumber) =>
    reflections.find((reflection) => reflection.caseNumber === caseNumber)?.text ?? null;
  const placementOf = (caseNumber: CaseNumber) =>
    REFLECTION.placements.find((entry) => caseOfDecision(entry.afterDecisionId) === caseNumber)
      ?.afterDecisionId ?? null;

  /**
   * Case 5's changed condition is revealed only AFTER C5D1 is committed — the
   * learner decides under an intact promise first, and the change arrives as a
   * consequence rather than as a hint.
   */
  const renderDecisions = () => (
    <CaseScreen
      caseLabel={PROGRESS.caseLabel(activeCase)}
      step={activeCase}
      total={CASE_NUMBERS.length}
      title={isCaseTitleVisible(path, activeCase) ? caseData.title : null}
      job={caseData.job}
      notice={changedNotice}
      scenario={renderScenario(activeCase, variantLines, openingCallbackForCase(activeCase))}
    >
      <div className={styles.decisions}>
        {visibleDecisions.map((decision, index) => (
          <div className={styles.decisionSlot} key={decision.decisionId}>
            {index === 1 && caseData.changedCondition
              ? caseData.changedCondition.lines.map((line) => (
                  <p className={styles.changed} key={line}>
                    {line}
                  </p>
                ))
              : null}
            {renderDecision(decision.decisionId, decision.selectedOptionId)}
          </div>
        ))}
      </div>
      {/*
        THE WAY BACK TO THE RESULT.

        Forward motion through the run is a side effect of ANSWERING: the last
        decision of a case triggers its reflection, and the reflection's
        continue leaves the case. That works exactly once. A learner who
        finishes the run and then navigates back to a case — two clicks, and
        "Reopen your decisions" on the reveal invites it — has every decision
        answered, so nothing fires, and the screen offers no way onward. The
        case navigator only moves sideways.

        So the control appears whenever the active path is complete, on every
        case, not only Case 5. Its absence was a dead end reachable from the
        product's own affordances.

        It is NOT rendered when the path is incomplete, and that is the same
        rule the reveal follows: with an unanswered active decision there is no
        result to go back to, and a button promising one would be a claim that
        something exists.
      */}
      {resultAndExportsPresent(path) ? (
        <div className={styles.resumeResult}>
          <ActionPill variant="ink" full onClick={() => setPhase({ kind: "result" })}>
            {RESUME_RESULT_CTA}
          </ActionPill>
        </div>
      ) : null}
    </CaseScreen>
  );

  const renderReflectionScreen = (decisionId: DecisionId) => {
    const caseNumber = caseOfDecision(decisionId);
    const closedCase = caseByNumber(caseNumber);
    return (
      <CaseScreen
        caseLabel={PROGRESS.caseLabel(caseNumber)}
        step={caseNumber}
        total={CASE_NUMBERS.length}
        title={isCaseTitleVisible(path, caseNumber) ? closedCase.title : null}
        job={closedCase.job}
      >
        <ReflectionBox
          value={draftFor(decisionId)}
          onChange={(text: string) => onDraftChange(decisionId, text)}
          onContinue={() => onReflectionContinue(decisionId)}
          onSkip={() => onReflectionSkip(decisionId)}
          onAlwaysSkip={() => onReflectionAlwaysSkip(decisionId)}
        />
      </CaseScreen>
    );
  };

  const renderCloseScreen = (caseNumber: CaseNumber) => {
    const close = caseCloseForCase(caseNumber);
    const closedCase = caseByNumber(caseNumber);
    const card = close ? gatedCardById(close.gatedCardId) : null;
    return (
      <CaseScreen
        caseLabel={PROGRESS.caseLabel(caseNumber)}
        step={caseNumber}
        total={CASE_NUMBERS.length}
        title={isCaseTitleVisible(path, caseNumber) ? closedCase.title : null}
        job={closedCase.job}
        footer={
          <div className={styles.advance}>
            {card ? (
              <TeaserCard
                title={card.title}
                body={card.body}
                ctaLabel={card.ctaLabel}
                href={ROUTES.redirect}
                onNavigate={onContinueToFull}
              />
            ) : null}
            <ActionPill variant="ink" full onClick={() => onCloseContinue(caseNumber)}>
              {REFLECTION.actions.continue}
            </ActionPill>
          </div>
        }
      >
        {close ? renderClose(close, echoFor(caseNumber)) : null}
      </CaseScreen>
    );
  };

  /**
   * The handle ask. Both actions are rendered in the SAME pill variant and given
   * the same flex basis, because `HANDLE.equalVisualWeight` is a ruling: a
   * filled "Add handle" beside a ghost "Stay incognito" would make the decline
   * the discouraged path, and the handle is local-only, never scored and never
   * transmitted — there is nothing here for the product to want.
   */
  const renderHandleAsk = () => (
    <section className={styles.handle}>
      <p className={styles.handlePrompt}>{HANDLE.prompt}</p>
      <input
        className={styles.handleField}
        type="text"
        value={handleDraft}
        autoComplete="off"
        aria-label={HANDLE.actions.add}
        onChange={(event) => setHandleDraft(event.target.value)}
      />
      <div className={styles.handleActions}>
        <span className={styles.handleAction}>
          <ActionPill variant="outlined" full onClick={onHandleAdd}>
            {HANDLE.actions.add}
          </ActionPill>
        </span>
        <span className={styles.handleAction}>
          <ActionPill variant="outlined" full onClick={onHandleDecline}>
            {HANDLE.actions.decline}
          </ActionPill>
        </span>
      </div>
    </section>
  );

  /**
   * The reveal is mounted only when a result exists. When an upstream edit
   * reopens a decision, `result` becomes `null` and this branch renders the
   * decisions instead — the result and both exports are ABSENT, not disabled.
   *
   * `onExportFirst` is wired to JSON, not Markdown, and the two are not
   * interchangeable at this one call site. The Markdown document is the
   * readable summary; the JSON export is the only artifact carrying the whole
   * ledger, which is precisely what clearing local storage destroys. `Reveal`
   * states that reasoning on the prop itself, and this is the call site
   * keeping it.
   */
  const renderResult = () =>
    result === null ? (
      renderDecisions()
    ) : (
      <Reveal
        result={result}
        reflections={reflections}
        handle={dataset.handle}
        clipboardFields={clipboardFields}
        labels={REVEAL_ACTION_LABELS}
        fullHref={ROUTES.redirect}
        onExportMarkdown={onExportMarkdown}
        onExportJson={onExportJson}
        onCopySummary={onCopySummary}
        onReopenDecisions={onReopenDecisions}
        onStartOver={onStartOver}
        onContinueToFull={onContinueToFull}
        onExportFirst={onExportJson}
        onViewed={onResultViewed}
        onReceiptsOpened={onReceiptsOpened}
        onSeeAllReceipts={onReceiptsOpened}
      />
    );

  /**
   * "Always skip" is a PREFERENCE, never a deletion. While it is on, the surface
   * does not interrupt the run at all, and `ReflectionBox`'s own suppressed
   * state is the standing way back to it — so the reversal lives with the thing
   * it reverses rather than in a settings screen the run never shows.
   */
  const renderSuppressedFooter = () => {
    const decisionId = placementOf(activeCase);
    return (
      <div className={styles.footer}>
        <ReflectionBox
          value={decisionId ? draftFor(decisionId) : ""}
          suppressed
          onChange={(text: string) => {
            if (decisionId) onDraftChange(decisionId, text);
          }}
          onShowInput={onShowReflections}
        />
      </div>
    );
  };

  /**
   * The way back to this case's note when reflections are NOT suppressed.
   *
   * Its suppressed sibling above re-enables the surface; this one reopens a
   * surface the learner has already been shown and moved past. Both exist for
   * the same reason: the reflection is offered once, and "once" is not a
   * design, it is what falls out of the surface being a step in the flow.
   *
   * It renders only when this case's reflection decision is answered — before
   * that, the surface has not been reached and offering it would jump the run.
   */
  const renderNotesFooter = () => {
    const decisionId = placementOf(activeCase);
    if (!decisionId) return null;
    if (!activeDecisionFor(path, decisionId)?.selectedOptionId) return null;
    return (
      <div className={styles.footer}>
        <button
          type="button"
          className={styles.notesReopen}
          onClick={() => onReopenNote(activeCase)}
        >
          {REFLECTION.heading}
        </button>
      </div>
    );
  };

  const renderPhase = () => {
    if (!hydrated || phase.kind === "intro") return renderIntro();
    if (phase.kind === "reflection") return renderReflectionScreen(phase.decisionId);
    if (phase.kind === "close") return renderCloseScreen(phase.caseNumber);
    if (phase.kind === "handle") return renderHandleAsk();
    if (phase.kind === "result") return renderResult();
    return renderDecisions();
  };

  if (hydrated && blocked) {
    return (
      <div className={styles.sandbox}>
        {children}
        {renderBlocked()}
      </div>
    );
  }

  const inRun = hydrated && phase.kind !== "intro";

  return (
    <div className={styles.sandbox}>
      <div className={styles.screen}>{renderPhase()}</div>
      {inRun ? renderCaseNav() : null}
      {inRun && phase.kind === "decisions" && dataset.reflectionsSuppressed
        ? renderSuppressedFooter()
        : null}
      {inRun && phase.kind === "decisions" && !dataset.reflectionsSuppressed
        ? renderNotesFooter()
        : null}
    </div>
  );
}
