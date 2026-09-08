"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { case1 } from "@/content/trust-forward/yy/case-1";
import { case2 } from "@/content/trust-forward/yy/case-2";
import { case3 } from "@/content/trust-forward/yy/case-3";
import { case4 } from "@/content/trust-forward/yy/case-4";
import { case5 } from "@/content/trust-forward/yy/case-5";
import { LITE_INTRO, PROGRESS } from "@/content/trust-forward/copy";
import { CASE_NUMBERS } from "@/lib/trust-forward/types";
import type { CaseNumber } from "@/lib/trust-forward/types";
import {
  beginRun,
  buildDecisionRecords,
  checkpointIndex,
  currentRunIdForCase,
  distinctCheckpointIds,
  isRevealUnlockedForCheckpoint,
  readYYLedger,
  recordCaptureReached,
  recordCommitted,
  recordReflected,
  recordWhyNotSelected,
  recordWhySelected,
  recordsForCheckpoint,
  runStage,
  writeYYLedger,
  yyStorageAvailable,
  emptyYYLedger
} from "@/lib/trust-forward/yy/records";
import type { YYLedger } from "@/lib/trust-forward/yy/records";
import { buildReceipts } from "@/lib/trust-forward/yy/receipts";
import { resonances } from "@/lib/trust-forward/yy/resonance";
import { evidenceTagsForChoiceId } from "@/content/trust-forward/yy/evidence-tags";
import type { YYCase, YYCheckpoint, YYChoice } from "@/lib/trust-forward/yy/types";
import { ActionPill } from "@/components/ui/ActionPill";
import { CheckpointScreen } from "@/components/trust-forward/yy/CheckpointScreen";
import { ChoiceList } from "@/components/trust-forward/yy/ChoiceList";
import { CommitBar } from "@/components/trust-forward/yy/CommitBar";
import type { CommitBarCopy } from "@/components/trust-forward/yy/CommitBar";
import { EvidenceSummary } from "@/components/trust-forward/yy/EvidenceSummary";
import { ReflectBox } from "@/components/trust-forward/yy/ReflectBox";
import { RevealPanel } from "@/components/trust-forward/yy/RevealPanel";
import { WhyNotStep } from "@/components/trust-forward/yy/WhyNotStep";
import type { WhyNotStepCopy } from "@/components/trust-forward/yy/WhyNotStep";
import styles from "./yy.module.css";

/**
 * `YYSandbox` — the one client island for the whole YY Method run: five cases,
 * seventeen checkpoints, one URL.
 *
 * It drives `CAPTURE -> WHY -> WHY-NOT -> COMMIT -> TIMESTAMP` per checkpoint
 * (governing addendum `TRUST_FORWARD_LITE_YY_METHOD_ADDENDUM_2026-09-08.md` §3),
 * then REFLECT, then the next capture, then the case ending, then the next
 * case; after case 5, the evidence summary. It is the composition root and it
 * draws almost nothing: the surfaces below own their own markup, and this file
 * owns the ARRANGEMENT between them and the ledger writes underneath.
 *
 * ONE URL, AND THE URL IS NOT THE STATE. Every screen mounts at
 * `/trust-forward-lite`. The learner's position lives in `localStorage` and in
 * this component's ephemeral phase — never in a path segment, a query or a
 * hash. `components/GoogleAnalytics.tsx` is byte-frozen with
 * `send_page_view: true`, so anything that reaches the URL is transmitted to a
 * vendor on every navigation. A router-driven wizard would have shipped the
 * learner's case number, and eventually the shape of their answers.
 *
 * ------------------------------------------------------------------------
 * THE FIVE INVARIANTS, AND WHERE EACH ONE IS ENFORCED IN THIS FILE
 * ------------------------------------------------------------------------
 *
 * 1. BEN IS NEVER VISIBLE BEFORE COMMIT. `<RevealPanel/>` is the only element
 *    this file mounts that can reach `benThen`, `benNow` or `conditions`, and
 *    it is mounted behind `isRevealUnlockedForCheckpoint(ledger, runId,
 *    checkpointId)` — a CONDITIONAL MOUNT, never a CSS state. A
 *    rendered-then-hidden panel is still in the served HTML and still readable
 *    by anyone who opens the inspector or reads the accessibility tree, so
 *    `hidden`, `display: none` and an `aria-hidden` wrapper are all
 *    disqualified: they turn judgment into reading comprehension for exactly
 *    the learner most likely to look. Nothing this file passes to
 *    `CheckpointScreen`, `ChoiceList`, `WhyNotStep` or `CommitBar` carries any
 *    of the three. The panel gates itself a second time on `isRevealUnlocked`,
 *    and the redundancy is deliberate: this is the invariant where a single
 *    point of failure is not acceptable.
 *
 *    (The Ben-authored text is in the CLIENT BUNDLE — it has to be, the run is
 *    offline after first paint. The invariant is about the DOM, which is the
 *    boundary a learner actually reads. A build that fetched Ben's judgment per
 *    checkpoint would put the learner's position on the wire, which is a worse
 *    trade against a stricter-sounding guarantee.)
 *
 * 2. WHY-NOT IS REQUIRED BEFORE COMMIT. `CommitBar` is handed a `closest` of
 *    `null` until a distinct unchosen option is selected, and it refuses to
 *    fire; `appendYYEvent` then refuses the commit anyway if either half is
 *    missing. Two independent gates, deliberately, because the UI one can be
 *    regressed by a layout change and the ledger one cannot. `WhyNotStep`
 *    filters the chosen option out of its own list, so the two selections
 *    cannot be equal — which is the third thing the ledger refuses.
 *
 * 3. COMMIT FREEZES. After `recordCommitted` the ledger itself throws on any
 *    further WHY, WHY-NOT or second COMMIT for that (run, checkpoint), so
 *    `locked` on the surfaces is a courtesy to the learner rather than the
 *    guarantee. Replay goes through `beginRun`, which mints a new `runId` and
 *    appends `yy_replay_started` carrying `previousRunId`; the earlier run is
 *    not modified, superseded or marked, and both runs keep their own records.
 *
 * 4. NO SCORE ANYWHERE. No percentage, no ranking of the four options, no
 *    agreement-with-Ben measure, no personality inference — not in this file
 *    and not in anything it passes down. `EvidenceSummary` receives receipts,
 *    resonances and three FACTUAL COUNTS — decisions committed, distinct
 *    checkpoints covered, checkpoints whose committed action changed on a later
 *    run — and not one of them is a numerator over Ben. Ben THEN and Ben
 *    NOW are not an answer key and NOW is not portrayed as superior: the
 *    reveal reports that the two agree or differ, which is the evidence the
 *    addendum is interested in, and says nothing about which is better.
 *
 *    This is also why the rewired page does not render
 *    `LITE_INTRO.promiseItems`: it promises "your SHIP profile", SHIP is off
 *    the required path (ADR 0001), and a promise of a score on the first screen
 *    would break this invariant before the learner had answered anything.
 *
 * 5. A RESONANCE NEEDS TWO INDEPENDENT CHECKPOINTS. This file does not decide
 *    that and must not soften it. It hands `EvidenceSummary` the records and
 *    nothing else, so there is no near-resonance state here to render and no
 *    code path that could turn a replay into a second fork: replays of one
 *    checkpoint share one `checkpointId`, and that id is what the threshold
 *    counts.
 *
 * ------------------------------------------------------------------------
 * THE LEDGER IS THE STATE; EVERYTHING ELSE IS DERIVED
 * ------------------------------------------------------------------------
 *
 * One `YYLedger` in state, appended through the recorders in
 * `lib/trust-forward/yy/records.ts`. There is no second ledger, no "answers"
 * map, no "current checkpoint" field and no completion flag, because every one
 * of those is a second place the same fact could be wrong. Position on resume
 * is DERIVED — the first checkpoint of the first case that is not committed in
 * that case's current run — so a stream written by another tab resumes
 * correctly with no invalidation pass written here.
 *
 * WHY `writeYYLedger` AND NOT `updateYYLedger`. `updateYYLedger` re-reads
 * storage, applies the transform and writes back. That is the right shape when
 * storage is the source of truth — and it is exactly wrong when the browser has
 * REFUSED storage, which is a supported state here: every read would return an
 * empty ledger and the learner's whole in-memory run would be discarded on the
 * next interaction. So the ledger in `ledgerRef` is the source of truth for the
 * session, `writeYYLedger` persists it and returns what was ACTUALLY stored
 * after the sanitizer ran, and state is set from that return value so memory
 * and storage cannot drift. A refused write sets `persistFailed`, the learner
 * is told, and the run continues.
 *
 * NO SIDE EFFECT INSIDE A STATE UPDATER. Every mutation goes through `apply()`.
 * `setLedger(prev => append(prev, ...))` is the obvious form and it is wrong:
 * React may invoke an updater twice, and an updater that appends a ledger event
 * would record the learner's decision twice in a log whose entire contract is
 * that it is append-only and replayable. `ledgerRef` carries the current ledger
 * for the handlers so they never need an updater.
 *
 * WHEN EVENTS ARE WRITTEN, AND WHY TWICE. A selection appends
 * `yy_why_selected` / `yy_why_not_selected` as the learner makes it — the
 * addendum is explicit that a learner changing their mind is not an error and
 * that every attempt stays in the stream. Both are then re-appended at COMMIT
 * carrying the final prose, because prose typed AFTER a selection would
 * otherwise never reach the record and the fold takes the LAST event strictly
 * before the commit. Re-appending in the order WHY then WHY-NOT also clears the
 * one hazard in the grammar: a learner who moves their WHY onto the option
 * currently held as WHY-NOT would otherwise commit a record whose closest
 * alternative equals its selection, which the ledger refuses. The draft handler
 * clears the alternative in that case, and the commit path re-states both.
 *
 * REFLECT AUTOSAVES, BUT NOT PER KEYSTROKE. `ReflectBox` debounces and calls
 * back with settled text; this file appends only when that text DIFFERS from
 * the last reflection it recorded for the pair. A reflection event per pause is
 * evidence; a reflection event per keystroke is a typing log that would bury
 * the learner's decisions in their own stream and copy their words into the
 * export dozens of times.
 *
 * FREE TEXT IS CARRIED, NEVER READ. `whyText`, `whyNotText` and the reflection
 * reach exactly one place — the `text` field of a ledger event. Nothing here
 * branches on their content, nothing derived is given them, and there is no
 * telemetry call in this island at all.
 *
 * STORAGE UNAVAILABLE IS A RENDERED STATE. iOS Safari in private browsing
 * THROWS on `localStorage` access — on the property lookup, not on the read —
 * and iPhone Safari at ~390 CSS px is the primary QA target. Every browser
 * touch is behind `typeof window` and a `try`/`catch` inside `records.ts`, this
 * component reads storage only inside an effect, and a refusal renders an
 * explanation with the Start control ABSENT rather than a blank screen.
 *
 * THE PROP CONTRACT THIS ISLAND PASSES, stated once so the surfaces can be read
 * against it rather than inferred from call sites:
 *
 *   CheckpointScreen  caseLabel, checkpointLabel, step, total, title, capture,
 *                     prompt, children — and NO footer, because the reveal is
 *                     what follows the commit control and the reveal is Ben
 *   ChoiceList        options, groupLabel, selectedId, locked, onSelect
 *   WhyNotStep        copy, options (ALL four; it filters), chosenId, closestId,
 *                     prose, onSelectClosest, onProseChange, locked
 *   CommitBar         copy, chosen, closest, committed, onCommit
 *   RevealPanel       checkpoint, record, ledger, runId
 *   ReflectBox        initialText, onAutosave — keyed per (run, checkpoint)
 *   EvidenceSummary   cases, records
 *
 * Each is DATA the surface renders, plus the two `copy` objects those surfaces
 * refuse to author for themselves.
 *
 * NOTHING IN THIS FILE IS A SENTENCE OF CURRICULUM. `tests/canonical-text.test.ts`
 * fails on prose of twelve words or more under `components/`, and the floor is
 * not the point: every word about a CASE comes from `content/`. What this file
 * does author is `STEP_COPY` and `SHELL_LABELS` — control labels and step
 * prompts — and that is recorded there rather than hidden.
 */

/* -------------------------------------------------------------------------- */
/* 1. The corpus                                                              */
/* -------------------------------------------------------------------------- */

/** The five canonical cases, in order. Seventeen checkpoints between them. */
const CASES: readonly YYCase[] = [case1, case2, case3, case4, case5];

const CHECKPOINTS: readonly YYCheckpoint[] = CASES.flatMap((kase) => kase.checkpoints);

const CHECKPOINT_INDEX = checkpointIndex(CHECKPOINTS);

/**
 * The same checkpoints with each choice's compiled evidence tags attached.
 *
 * The case files ship `evidenceTags: []` on all sixty-eight choices by
 * instruction, and the taxonomy lives in
 * `content/trust-forward/yy/evidence-tags.ts` keyed by choice id — compiled
 * from the actual Ben-authored choices rather than invented up front. Joining
 * the two is a DERIVATION, done once here, and it is deliberately not written
 * back into the case modules: those are the guarded artefact
 * (`tests/trust-forward-yy-content.test.ts` diffs them against Ben's source),
 * and a tag written into them would be a change to text that must not change.
 *
 * Only `resonances()` is given this array. `buildReceipts` gets the ORIGINAL
 * cases, because a receipt quotes the learner's chosen option verbatim and a
 * tag has no business in that sentence.
 */
const TAGGED_CHECKPOINTS: readonly YYCheckpoint[] = CHECKPOINTS.map((checkpoint) => ({
  ...checkpoint,
  choices: checkpoint.choices.map((choice) => ({
    ...choice,
    evidenceTags: evidenceTagsForChoiceId(choice.id) ?? []
  }))
}));

/**
 * The step prompts and control labels this island supplies to the surfaces.
 *
 * WHERE THESE COME FROM, AND WHY THEY ARE HERE RATHER THAN IN `content/`.
 * `whyPrompt`, `whyProseLabel` and the two WHY-NOT prompts are the addendum's
 * own words, quoted from §3's canonical checkpoint grammar — "What would you do
 * in my shoes?", "Why this choice?", "Which other option came closest?", "What
 * kept you from choosing it?" — and `commit.action` is §3's "Commit decision".
 * They are the METHOD, not case content: they are identical across all
 * seventeen checkpoints and they change only if the grammar changes.
 *
 * The remainder are control nouns and one-clause statements of mechanism. Each
 * is short by construction, none describes a case, a choice, Ben, or the
 * learner, and none makes a claim about how the run went.
 *
 * THEY STILL BELONG IN `content/trust-forward/yy/`. There is no YY copy module
 * in this build; when there is, these move to it under a provenance tag and
 * this constant becomes an import. `REVEAL_ACTION_LABELS` in
 * `components/trust-forward/LiteSandbox.tsx` set the precedent for recording
 * exactly this rather than quietly typing strings into a composition root, and
 * this is the same record: these words are not Ben's.
 */
const STEP_COPY = {
  /** §3 WHY. Fixed across every checkpoint. */
  whyPrompt: "What would you do in my shoes?",
  whyGroupLabel: "Your choice",
  whyProseLabel: "Why this choice?",
  whyProseHint: "Optional. Kept in this browser, never interpreted.",
  whyNot: {
    prompt: "Which other option came closest?",
    requiredNote: "Required before you commit.",
    groupLabel: "Closest alternative",
    proseLabel: "What kept you from choosing it?",
    proseHint: "Optional. Kept in this browser, never interpreted."
  } satisfies WhyNotStepCopy,
  commit: {
    chosenLabel: "Your choice",
    closestLabel: "Closest alternative",
    freezeNote: "Committing freezes this before the reveal.",
    action: "Commit decision",
    pendingNote: "Choose an option and a closest alternative.",
    committedNote: "Frozen. A replay starts a new run."
  } satisfies CommitBarCopy
} as const;

const SHELL_LABELS = {
  checkpointLead: "Checkpoint",
  positionJoin: "of",
  continue: "Continue",
  nextCase: "Next case",
  seeEvidence: "See your evidence",
  replay: "Replay",
  replayHeading: "Replay a case",
  endingLabel: "What happened next",
  storageBlocked: "This browser is blocking local storage.",
  storageBlockedBody: "Private browsing can do this. Nothing can be saved.",
  writeRefused: "Your browser refused to save. This run stays in memory."
} as const;

/** `Checkpoint 2 of 4`. Position in a fixed sequence, never a completion count. */
function checkpointLabel(ordinal: number, total: number): string {
  return `${SHELL_LABELS.checkpointLead} ${ordinal} ${SHELL_LABELS.positionJoin} ${total}`;
}

/* -------------------------------------------------------------------------- */
/* 2. Screen position — ephemeral by design                                   */
/* -------------------------------------------------------------------------- */

interface Position {
  readonly caseIndex: number;
  readonly checkpointIndex: number;
}

type Phase =
  | { readonly kind: "intro" }
  | { readonly kind: "run"; readonly at: Position }
  | { readonly kind: "ending"; readonly caseIndex: number }
  | { readonly kind: "summary" };

const INTRO: Phase = { kind: "intro" };
const SUMMARY: Phase = { kind: "summary" };

/**
 * Where the learner stands, derived from the stream alone.
 *
 * A case with no run has not been opened, so the learner is parked on the
 * PREVIOUS case's ending screen — pressing its advance is what opens the next
 * run, and resuming straight into an unopened case would render a checkpoint
 * whose run does not exist yet. Case 1 with no run is the intro.
 */
function resumePhase(ledger: YYLedger): Phase {
  for (let index = 0; index < CASES.length; index += 1) {
    const kase = CASES[index];
    const runId = currentRunIdForCase(ledger, kase.id);
    if (runId === null) return index === 0 ? INTRO : { kind: "ending", caseIndex: index - 1 };
    const open = kase.checkpoints.findIndex(
      (checkpoint) => !isRevealUnlockedForCheckpoint(ledger, runId, checkpoint.id)
    );
    if (open !== -1) return { kind: "run", at: { caseIndex: index, checkpointIndex: open } };
  }
  return SUMMARY;
}

/* -------------------------------------------------------------------------- */
/* 3. The island                                                              */
/* -------------------------------------------------------------------------- */

export function YYSandbox({ children }: { children?: ReactNode }) {
  /**
   * `children` is the server-composed intro block. It is a slot rather than
   * markup here so the intro's words are in the initial HTML for a crawler and
   * for the first paint, and still disappear the moment the run starts.
   */
  const [ledger, setLedger] = useState<YYLedger>(() => emptyYYLedger());
  const ledgerRef = useRef<YYLedger>(ledger);
  const [phase, setPhase] = useState<Phase>(INTRO);
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [blocked, setBlocked] = useState<boolean>(false);
  const [persistFailed, setPersistFailed] = useState<boolean>(false);

  /** Run ids minted for a case whose first event has not landed yet. */
  const [pendingRunIds, setPendingRunIds] = useState<Record<string, string>>({});

  /** The uncommitted draft for the checkpoint in front of the learner. */
  const [choiceId, setChoiceId] = useState<string | null>(null);
  const [alternativeId, setAlternativeId] = useState<string | null>(null);
  const [whyText, setWhyText] = useState<string>("");
  const [whyNotText, setWhyNotText] = useState<string>("");

  /** (run, checkpoint) pairs whose CAPTURE has been recorded this mount. */
  const capturedRef = useRef<Set<string>>(new Set());
  /** The last reflection text appended per pair, so autosave cannot repeat one. */
  const reflectedRef = useRef<Map<string, string>>(new Map());

  /* ---------------------------------------------------------------------- */
  /* 3.1 Persistence                                                        */
  /* ---------------------------------------------------------------------- */

  /**
   * Write through, then render what was stored.
   *
   * `writeYYLedger` returns the ledger it actually persisted after the
   * sanitizer's allowlist has run, so state and storage cannot drift: a field
   * the sanitizer would have dropped is dropped here too, in the same render,
   * rather than living on in memory until the next reload silently removes it.
   */
  const apply = useCallback((next: YYLedger): void => {
    const written = writeYYLedger(next);
    ledgerRef.current = written.ledger;
    setLedger(written.ledger);
    if (!written.persisted) setPersistFailed(true);
  }, []);

  /**
   * Every ledger write goes through here.
   *
   * The recorders THROW on a grammar violation — a WHY after COMMIT, a commit
   * with no closest alternative, a reflection before the freeze — because each
   * is a programming error in a surface rather than a learner-reachable state.
   * An uncaught throw inside a React event handler unmounts the tree in
   * production, which would cost the learner the screen they are on, so it is
   * caught here and reported as a refused write. The stored stream is untouched
   * in that case: `appendYYEvent` never mutates its argument.
   */
  const mutate = useCallback(
    (change: (current: YYLedger) => YYLedger): void => {
      try {
        apply(change(ledgerRef.current));
      } catch {
        setPersistFailed(true);
      }
    },
    [apply]
  );

  /* ---------------------------------------------------------------------- */
  /* 3.2 Mount                                                              */
  /* ---------------------------------------------------------------------- */

  /**
   * The first render on the client is deliberately the SERVER'S render — the
   * intro — and only this effect moves it. Reading `localStorage` during render
   * would either mismatch hydration or force the route out of prerendering, and
   * both cost more than one frame of intro.
   */
  useEffect(() => {
    let read;
    try {
      if (!yyStorageAvailable()) {
        setBlocked(true);
        setHydrated(true);
        return;
      }
      read = readYYLedger();
    } catch {
      // Belt and braces. `records.ts` guards the property lookup itself, but a
      // blank screen is the one outcome this surface may not produce.
      setBlocked(true);
      setHydrated(true);
      return;
    }
    if (read.storageBlocked) {
      setBlocked(true);
      setHydrated(true);
      return;
    }
    ledgerRef.current = read.ledger;
    setLedger(read.ledger);
    setPhase(resumePhase(read.ledger));
    setHydrated(true);
  }, []);

  /* ---------------------------------------------------------------------- */
  /* 3.3 Derivation                                                         */
  /* ---------------------------------------------------------------------- */

  const runIdForCase = useCallback(
    (caseId: string): string | null =>
      currentRunIdForCase(ledger, caseId) ?? pendingRunIds[caseId] ?? null,
    [ledger, pendingRunIds]
  );

  const activeCase: YYCase | null = phase.kind === "run" ? CASES[phase.at.caseIndex] : null;
  const activeCheckpoint: YYCheckpoint | null =
    phase.kind === "run" ? activeCase?.checkpoints[phase.at.checkpointIndex] ?? null : null;
  const activeRunId: string | null = activeCase ? runIdForCase(activeCase.id) : null;

  const records = useMemo(() => buildDecisionRecords(ledger, CHECKPOINT_INDEX).records, [ledger]);

  /**
   * The committed record for the checkpoint on screen, if the learner has
   * already frozen it in THIS run.
   *
   * It is what the reveal is gated on, what seeds the drafts on resume, and the
   * only reason a committed checkpoint can be re-rendered showing what the
   * learner actually chose. `recordsForCheckpoint` is the longitudinal view —
   * every run of this one checkpoint — and picking this run out of it is not a
   * count of anything: all of those records share one `checkpointId` and are
   * one tuning fork struck repeatedly.
   */
  const committedHere = useMemo(() => {
    if (!activeCheckpoint || !activeRunId) return null;
    return (
      recordsForCheckpoint(records, activeCheckpoint.id).find(
        (record) => record.runId === activeRunId
      ) ?? null
    );
  }, [records, activeCheckpoint, activeRunId]);

  const positionKey =
    phase.kind === "run"
      ? `${activeRunId ?? "-"}|${phase.at.caseIndex}|${phase.at.checkpointIndex}`
      : phase.kind;

  /**
   * Seed the drafts when the position changes, and only then.
   *
   * Depending on the committed record instead would reset the learner's typing
   * on every ledger write. Depending on the position alone means a commit
   * leaves the drafts exactly as they were, which is what the frozen surfaces
   * then render.
   */
  useEffect(() => {
    setChoiceId(committedHere?.why.choiceId ?? null);
    setAlternativeId(committedHere?.whyNot.closestAlternativeChoiceId ?? null);
    setWhyText(committedHere?.why.learnerText ?? "");
    setWhyNotText(committedHere?.whyNot.learnerText ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionKey]);

  /**
   * The screen the learner is looking at, as one string — and it is NOT
   * `positionKey`.
   *
   * The two keys answer different questions and the difference matters twice.
   * `positionKey` carries `activeRunId` because a REPLAY has to reseed the
   * drafts even though the case and checkpoint indices did not move; it also
   * collapses every case ending to the bare string `"ending"`, because seeding
   * drafts on an ending screen is meaningless. This key does the opposite on
   * both counts: it ignores the run id, so the id resolving from `null` to a
   * real value on the first render after `openCase` is not mistaken for a
   * change of screen and cannot scroll twice; and it separates
   * `ending|0` from `ending|1`, so a transition between two endings would be
   * seen. Nothing today produces that transition — an ending always leaves
   * through `openCase` or to the summary — but a key that is only correct
   * because of a route nobody takes is a key that breaks when somebody takes
   * it.
   */
  const screenKey =
    phase.kind === "run"
      ? `run|${phase.at.caseIndex}|${phase.at.checkpointIndex}`
      : phase.kind === "ending"
        ? `ending|${phase.caseIndex}`
        : phase.kind;

  const scrolledFromRef = useRef<string | null>(null);

  /**
   * Every new step starts at the top of the page.
   *
   * WHY THIS IS A CORRECTNESS FIX AND NOT A NICETY. A checkpoint is tall: the
   * situation, four options, a free-text box, the closest-alternative step with
   * the four options again, another box, the commit bar, then a two-part reveal
   * and a reflection. By the time a learner presses Continue they are a long way
   * down. Without this, the next checkpoint mounts with the viewport still at
   * that depth — so the first thing a learner sees of the new situation is its
   * middle, and the CAPTURE paragraph that the whole exercise depends on their
   * reading has already scrolled past. `capture`'s own contract is that it is
   * the situation AS IT EXISTED at the decision point; a learner who starts
   * halfway down it is answering a different question than the one asked.
   *
   * KEYED ON THE SCREEN, GUARDED ON THE FIRST RUN. The ref holds the last
   * screen actually scrolled from, so the effect fires once per real change and
   * never on a re-render caused by typing, a ledger write or a commit. The
   * `previous === null` branch is the one that matters: on hydration
   * `resumePhase` can drop a returning learner straight into checkpoint 3 of
   * case 2, and yanking their viewport on arrival — when the browser has
   * already restored their scroll position — would be this effect fighting the
   * browser over a screen the learner did not navigate to.
   *
   * NO `behavior`, DELIBERATELY. Omitting it means "auto", which defers to the
   * `scroll-behavior` of the document element — and `app/globals.css` sets
   * `html { scroll-behavior: smooth }` PAIRED with a `prefers-reduced-motion`
   * block that returns it to `auto`. So this inherits the site's published
   * motion contract instead of declaring a second one here, and a learner who
   * asked their OS for less motion gets an instant jump without this file
   * needing to know they exist. Passing "smooth" would have quietly overridden
   * that accessibility claim from inside a component.
   *
   * SCROLL ONLY, AND FOCUS IS A KNOWN GAP. This moves the viewport; it does not
   * move focus. A keyboard or screen-reader user therefore lands at the top
   * visually while their focus falls back to the document body. The correct
   * complement is a `tabIndex={-1}` heading on the new screen that receives
   * focus here, which is a change to `CheckpointScreen`'s markup contract and
   * is not made under a request about scrolling.
   */
  useEffect(() => {
    if (!hydrated) return;
    const previous = scrolledFromRef.current;
    scrolledFromRef.current = screenKey;
    if (previous === null || previous === screenKey) return;
    window.scrollTo({ top: 0, left: 0 });
  }, [hydrated, screenKey]);

  /**
   * CAPTURE: the learner reached the situation as it existed at the decision
   * point. Recorded once per (run, checkpoint), guarded by a ref because React
   * invokes an effect twice in development and an append is not idempotent.
   */
  useEffect(() => {
    if (!hydrated || !activeCase || !activeCheckpoint || !activeRunId) return;
    const runId = activeRunId;
    const caseId = activeCase.id;
    const checkpointId = activeCheckpoint.id;
    const guard = `${runId}|${checkpointId}`;
    if (capturedRef.current.has(guard)) return;
    capturedRef.current.add(guard);
    if (runStage(ledgerRef.current, runId, checkpointId) !== "capture") return;
    mutate((current) => recordCaptureReached(current, { runId, caseId, checkpointId }));
  }, [hydrated, activeCase, activeCheckpoint, activeRunId, mutate]);

  /* ---------------------------------------------------------------------- */
  /* 3.4 The grammar, one checkpoint at a time                              */
  /* ---------------------------------------------------------------------- */

  const committed = committedHere !== null;

  const choiceById = useCallback(
    (id: string | null): YYChoice | null =>
      id === null ? null : activeCheckpoint?.choices.find((choice) => choice.id === id) ?? null,
    [activeCheckpoint]
  );

  /**
   * WHY. Recorded as it is made, and re-recorded at COMMIT with the prose.
   *
   * Moving the selection onto the option currently held as the closest
   * alternative clears that alternative: the two must differ, and silently
   * keeping an equal pair would produce a commit the ledger refuses at the one
   * moment the learner cannot be asked to fix it.
   */
  const onSelectChoice = useCallback(
    (id: string) => {
      if (committed || !activeCase || !activeCheckpoint || !activeRunId) return;
      // Re-clicking the option already held is not a new attempt. Appending it
      // again would put a row in the learner's history that records nothing
      // that happened.
      if (choiceId === id) return;
      const choice = activeCheckpoint.choices.find((candidate) => candidate.id === id);
      if (!choice) return;
      setChoiceId(id);
      if (alternativeId === id) setAlternativeId(null);
      const runId = activeRunId;
      const caseId = activeCase.id;
      const checkpointId = activeCheckpoint.id;
      mutate((current) =>
        recordWhySelected(current, {
          runId,
          caseId,
          checkpointId,
          choiceId: id,
          choiceLabel: choice.label
        })
      );
    },
    [committed, activeCase, activeCheckpoint, activeRunId, choiceId, alternativeId, mutate]
  );

  /** WHY-NOT: one UNCHOSEN option as the closest alternative. Structured evidence. */
  const onSelectAlternative = useCallback(
    (id: string) => {
      if (committed || !activeCase || !activeCheckpoint || !activeRunId) return;
      if (id === choiceId || id === alternativeId) return;
      const choice = activeCheckpoint.choices.find((candidate) => candidate.id === id);
      if (!choice) return;
      setAlternativeId(id);
      const runId = activeRunId;
      const caseId = activeCase.id;
      const checkpointId = activeCheckpoint.id;
      mutate((current) =>
        recordWhyNotSelected(current, {
          runId,
          caseId,
          checkpointId,
          choiceId: id,
          choiceLabel: choice.label
        })
      );
    },
    [committed, activeCase, activeCheckpoint, activeRunId, choiceId, alternativeId, mutate]
  );

  /**
   * COMMIT. The three appends are one transaction over an immutable ledger:
   * they are folded onto a local value and applied once, so a refusal anywhere
   * in the sequence leaves the stored stream exactly as it was rather than
   * half-advanced.
   */
  const onCommit = useCallback(() => {
    if (committed || !activeCase || !activeCheckpoint || !activeRunId) return;
    const chosen = choiceById(choiceId);
    const alternative = choiceById(alternativeId);
    if (!chosen || !alternative || chosen.id === alternative.id) return;
    const runId = activeRunId;
    const caseId = activeCase.id;
    const checkpointId = activeCheckpoint.id;
    const why = whyText.trim();
    const whyNot = whyNotText.trim();
    mutate((current) => {
      let next = recordWhySelected(current, {
        runId,
        caseId,
        checkpointId,
        choiceId: chosen.id,
        choiceLabel: chosen.label,
        text: why.length > 0 ? why : undefined
      });
      next = recordWhyNotSelected(next, {
        runId,
        caseId,
        checkpointId,
        choiceId: alternative.id,
        choiceLabel: alternative.label,
        text: whyNot.length > 0 ? whyNot : undefined
      });
      return recordCommitted(next, { runId, caseId, checkpointId });
    });
  }, [
    committed,
    activeCase,
    activeCheckpoint,
    activeRunId,
    choiceById,
    choiceId,
    alternativeId,
    whyText,
    whyNotText,
    mutate
  ]);

  /** REFLECT: post-reveal prose, carried verbatim and read by nothing. */
  const onReflectAutosave = useCallback(
    (text: string) => {
      if (!committed || !activeCase || !activeCheckpoint || !activeRunId) return;
      const trimmed = text.trim();
      if (trimmed.length === 0) return;
      const runId = activeRunId;
      const caseId = activeCase.id;
      const checkpointId = activeCheckpoint.id;
      const guard = `${runId}|${checkpointId}`;
      if (reflectedRef.current.get(guard) === trimmed) return;
      reflectedRef.current.set(guard, trimmed);
      mutate((current) => recordReflected(current, { runId, caseId, checkpointId, text: trimmed }));
    },
    [committed, activeCase, activeCheckpoint, activeRunId, mutate]
  );

  /* ---------------------------------------------------------------------- */
  /* 3.5 Movement                                                           */
  /* ---------------------------------------------------------------------- */

  /**
   * Open a case at its first uncommitted checkpoint, minting a run if it has
   * none. A case that already has a run is RESUMED, never restarted —
   * restarting silently would overwrite nothing (the ledger is append-only) but
   * would present a frozen checkpoint as if it were open. A case with nothing
   * left open goes to its ending, for the same reason.
   */
  const openCase = useCallback(
    (caseIndex: number) => {
      const kase = CASES[caseIndex];
      if (!kase) return;
      let runId = currentRunIdForCase(ledgerRef.current, kase.id) ?? pendingRunIds[kase.id] ?? null;
      if (runId === null) {
        const begun = beginRun(ledgerRef.current, kase.id);
        runId = begun.runId;
        setPendingRunIds((current) => ({ ...current, [kase.id]: begun.runId }));
        apply(begun.ledger);
      }
      const resolved = runId;
      const open = kase.checkpoints.findIndex(
        (checkpoint) => !isRevealUnlockedForCheckpoint(ledgerRef.current, resolved, checkpoint.id)
      );
      // Every checkpoint of this case is already frozen in its current run —
      // reachable after a replay of an earlier case. Walking the learner back
      // through committed checkpoints would present frozen judgments as if
      // they were open, so the case goes straight to its ending instead.
      if (open === -1) {
        setPhase({ kind: "ending", caseIndex });
        return;
      }
      setPhase({ kind: "run", at: { caseIndex, checkpointIndex: open } });
    },
    [apply, pendingRunIds]
  );

  /**
   * REPLAY. A NEW run with a new `runId`, never an overwrite.
   *
   * `beginRun` appends `yy_replay_started` carrying `previousRunId`, which is
   * the fact no other event records and the only thing that makes the
   * longitudinal reading possible. Run 1 stays exactly where the learner left
   * it and keeps its own records and receipts — and, the part that is easy to
   * get wrong, it does not become a second independent checkpoint.
   */
  const onReplayCase = useCallback(
    (caseIndex: number) => {
      const kase = CASES[caseIndex];
      if (!kase) return;
      const begun = beginRun(ledgerRef.current, kase.id);
      setPendingRunIds((current) => ({ ...current, [kase.id]: begun.runId }));
      apply(begun.ledger);
      setPhase({ kind: "run", at: { caseIndex, checkpointIndex: 0 } });
    },
    [apply]
  );

  const onAdvance = useCallback(() => {
    if (phase.kind !== "run") return;
    const kase = CASES[phase.at.caseIndex];
    const next = phase.at.checkpointIndex + 1;
    if (next < kase.checkpoints.length) {
      setPhase({ kind: "run", at: { caseIndex: phase.at.caseIndex, checkpointIndex: next } });
      return;
    }
    setPhase({ kind: "ending", caseIndex: phase.at.caseIndex });
  }, [phase]);

  const onLeaveEnding = useCallback(
    (caseIndex: number) => {
      if (caseIndex + 1 < CASES.length) {
        openCase(caseIndex + 1);
        return;
      }
      setPhase(SUMMARY);
    },
    [openCase]
  );

  const onStart = useCallback(() => openCase(0), [openCase]);

  /* ---------------------------------------------------------------------- */
  /* 3.6 Derived evidence — for the summary, and nowhere else               */
  /* ---------------------------------------------------------------------- */

  /**
   * Receipts and resonances are computed from the COMMITTED RECORDS ONLY, and
   * `FrozenJudgment` is why that is structural rather than careful:
   * `buildReceipts` declares a parameter type with no `learnerText` field at
   * any depth, so the learner's prose is not in scope inside it and no future
   * edit can reach it. `resonances()` reads choice ids, checkpoint ids and
   * authored tags — change the prose and its output is byte-identical, because
   * the prose is never loaded.
   */
  const receipts = useMemo(() => buildReceipts(CASES, records), [records]);

  const resonanceList = useMemo(
    () => resonances(records, TAGGED_CHECKPOINTS, receipts),
    [records, receipts]
  );

  /**
   * Checkpoints whose COMMITTED ACTION changed between the first run and the
   * most recent one (§21, "Revisions over time").
   *
   * A factual count of revisions with no claim attached: growth, improvement,
   * indecision and learning are all inferences the addendum forbids drawing
   * from it. Counted over DISTINCT checkpoints — a checkpoint answered three
   * times is one revision at most — so this can never be read as a second
   * independent point either.
   */
  const revisedCheckpointCount = useMemo(() => {
    let revised = 0;
    for (const id of distinctCheckpointIds(records)) {
      const rows = recordsForCheckpoint(records, id);
      if (rows.length < 2) continue;
      if (rows[rows.length - 1].why.choiceId !== rows[0].why.choiceId) revised += 1;
    }
    return revised;
  }, [records]);

  /* ---------------------------------------------------------------------- */
  /* 3.7 Render                                                             */
  /* ---------------------------------------------------------------------- */

  const renderNotice = () =>
    persistFailed ? (
      <p className={styles.notice} role="status">
        {SHELL_LABELS.writeRefused}
      </p>
    ) : null;

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

  const renderRun = (at: Position) => {
    const kase = CASES[at.caseIndex];
    const checkpoint = kase.checkpoints[at.checkpointIndex];
    if (!checkpoint || activeRunId === null) return null;

    const chosen = choiceById(choiceId);
    const alternative = choiceById(alternativeId);
    const caseNumber: CaseNumber = CASE_NUMBERS[at.caseIndex];

    return (
      <div className={styles.stack}>
        <CheckpointScreen
          caseLabel={PROGRESS.caseLabel(caseNumber)}
          checkpointLabel={checkpointLabel(checkpoint.ordinal, kase.checkpoints.length)}
          step={checkpoint.ordinal}
          total={kase.checkpoints.length}
          title={kase.title}
          capture={checkpoint.capture}
          prompt={STEP_COPY.whyPrompt}
        >
          <ChoiceList
            options={checkpoint.choices}
            groupLabel={STEP_COPY.whyGroupLabel}
            selectedId={choiceId}
            locked={committed}
            onSelect={onSelectChoice}
          />

          <label className={styles.field}>
            <span className={styles.fieldLabel}>{STEP_COPY.whyProseLabel}</span>
            <textarea
              className={styles.input}
              value={whyText}
              onChange={(event) => setWhyText(event.target.value)}
              rows={4}
              readOnly={committed}
              autoComplete="off"
              spellCheck={true}
            />
          </label>
          <p className={styles.hint}>{STEP_COPY.whyProseHint}</p>

          {chosen ? (
            <WhyNotStep
              copy={STEP_COPY.whyNot}
              options={checkpoint.choices}
              chosenId={chosen.id}
              closestId={alternativeId}
              prose={whyNotText}
              onSelectClosest={onSelectAlternative}
              onProseChange={setWhyNotText}
              locked={committed}
            />
          ) : null}

          {chosen ? (
            <CommitBar
              copy={STEP_COPY.commit}
              chosen={chosen}
              closest={alternative}
              committed={committed}
              onCommit={onCommit}
            />
          ) : null}
        </CheckpointScreen>

        {/*
          THE REVEAL GATE. Mounted only once this (run, checkpoint) carries a
          COMMIT — `committedHere` is non-null only for a committed record, and
          `RevealPanel` re-checks `isRevealUnlocked` on the record it is given.
          Not rendered and hidden; not rendered at all. Ben THEN, Ben NOW and
          the conditions are absent from the DOM until the learner's judgment is
          frozen, which is the whole reason the record is worth anything.
        */}
        {committed ? (
          <div className={styles.step}>
            <RevealPanel checkpoint={checkpoint} record={committedHere} ledger={ledger} runId={activeRunId} />
          </div>
        ) : null}

        {committed ? (
          <div className={styles.step}>
            <ReflectBox
              key={`${activeRunId}|${checkpoint.id}`}
              initialText={committedHere?.reflection?.learnerText ?? ""}
              onAutosave={onReflectAutosave}
            />
            <div className={styles.stepActions}>
              <ActionPill variant="ink" onClick={onAdvance}>
                {SHELL_LABELS.continue}
              </ActionPill>
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  const renderEnding = (caseIndex: number) => {
    const kase = CASES[caseIndex];
    if (!kase) return null;
    const last = caseIndex + 1 >= CASES.length;
    return (
      <section className={styles.ending}>
        <p className={styles.endingLabel}>{SHELL_LABELS.endingLabel}</p>
        <h2 className={styles.endingTitle}>{kase.title}</h2>
        <p className={styles.endingBody}>{kase.ending}</p>
        <div className={styles.endingActions}>
          <ActionPill variant="ink" onClick={() => onLeaveEnding(caseIndex)}>
            {last ? SHELL_LABELS.seeEvidence : SHELL_LABELS.nextCase}
          </ActionPill>
        </div>
      </section>
    );
  };

  /**
   * The summary, and the one control that follows it.
   *
   * `EvidenceSummary` is handed the derived evidence and three factual counts.
   * The threshold that decides a resonance lives in `resonances()` and nowhere
   * else — a second copy of it in this file would be a second place the
   * product's central epistemic commitment could go wrong. The replay rail
   * below it is a list of CASES and not a list of results: nothing here reports
   * how a case went, and nothing is ordered by anything a learner did.
   */
  const renderSummary = () => (
    <div className={styles.summary}>
      <EvidenceSummary
        receipts={receipts}
        resonances={resonanceList}
        committedCount={records.length}
        checkpointCount={distinctCheckpointIds(records).length}
        revisedCheckpointCount={revisedCheckpointCount}
        records={records}
        cases={CASES}
      />
      <section className={styles.replay}>
        <p className={styles.replayLabel}>{SHELL_LABELS.replayHeading}</p>
        <ul className={styles.replayList}>
          {CASES.map((kase, index) => (
            <li className={styles.replayItem} key={kase.id}>
              <span className={styles.replayName}>{PROGRESS.caseLabel(CASE_NUMBERS[index])}</span>
              <button
                className={styles.replayAction}
                type="button"
                onClick={() => onReplayCase(index)}
              >
                {SHELL_LABELS.replay}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );

  /**
   * The storage-unavailable surface.
   *
   * The Start control is ABSENT rather than disabled — a greyed-out control
   * claims the run exists and is being withheld — and two authored clauses
   * state the mechanism. See `SHELL_LABELS` for why those two are authored here
   * and where they belong.
   *
   * `INFO_MARKERS.localOnly`'s expansion is DELIBERATELY NOT rendered, here or
   * on the intro. It tells the learner their "SHIP result" is stored, and this
   * build has no SHIP result. A disclosure that names a thing the product no
   * longer produces is a false statement about storage, which is the one
   * subject a storage disclosure may not be wrong about. Its `label` alone is
   * true, and that is what the intro carries.
   */
  const renderBlocked = () => (
    <section className={styles.blocked}>
      <p className={styles.blockedLabel}>{SHELL_LABELS.storageBlocked}</p>
      <p className={styles.blockedBody}>{SHELL_LABELS.storageBlockedBody}</p>
    </section>
  );

  if (hydrated && blocked) {
    return (
      <div className={styles.sandbox}>
        {children}
        {renderBlocked()}
      </div>
    );
  }

  const renderPhase = () => {
    if (!hydrated || phase.kind === "intro") return renderIntro();
    if (phase.kind === "run") return renderRun(phase.at);
    if (phase.kind === "ending") return renderEnding(phase.caseIndex);
    return renderSummary();
  };

  return (
    <div className={styles.sandbox}>
      {renderNotice()}
      <div className={styles.screen}>{renderPhase()}</div>
    </div>
  );
}

export default YYSandbox;
