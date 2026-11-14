"use client";

import { clientStatePro } from '@/lib/state-pro';
import { isFreeState } from '@/lib/free-state-catalog';

import { fetchAccount } from "@/lib/client-account";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { publishedQuestions } from "@/data/questions";
import { publishedCaQuestions } from "@/data/ca-questions";
import { publishedHiQuestions } from "@/data/hi-questions";
import { topics } from "@/data/exam-config";
import { caPaths } from "@/lib/ca-site";
import { caStudyLabel, caStudyTopics } from "@/lib/ca-topics";
import { hiPaths } from "@/lib/hi-site";
import { hiStudyLabel, hiStudyTopics } from "@/lib/hi-topics";
import { ExamRunner } from "@/components/ExamRunner";
import { MistakeActions, mistakeTargets } from "@/components/MistakeActions";
import { Breadcrumb } from "@/components/Breadcrumb";
import { LoadingNote } from "@/components/QuizChrome";
import { topicLabel } from "@/lib/quiz";
import { paths } from "@/lib/paths";
import { readCaAttempt, latestCaQuick, type CaQuickAttempt } from "@/lib/ca-attempts";
import { listPhase } from "@/lib/list-phase";
import { markMistakePromptSeen, mistakePrompt, readMistakePrompts, type MistakeAction, type MistakePrompt } from "@/lib/mistake-prompts";
import { packFor } from "@/lib/prep-pack";
import { syncCaAttempts } from "@/lib/ca-sync";
import type { Question, StateCode } from "@/lib/types";
import type { QuestionStat } from "@/lib/store/types";

function dueNow(stat: QuestionStat) {
  return Boolean(stat.nextReviewAt) && Date.parse(stat.nextReviewAt as string) <= Date.now();
}

function notebookHref(base: string, topic: string, attempt: string) {
  const params = new URLSearchParams();
  if (topic && topic !== "all") params.set("topic", topic);
  if (attempt) params.set("attempt", attempt);
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

export function CloudMistakes({ initialTopic, stateCode = "AZ", attemptId = "" }: { initialTopic?: string; stateCode?: StateCode; attemptId?: string }) {
  const onCa = stateCode === "CA";
  const onHi = stateCode === "HI";
  const pack = packFor(stateCode);
  const topicPractice = onCa || onHi || Boolean(pack);
  const practiceState = stateCode;
  const site = pack ? pack.paths : onHi ? hiPaths : onCa ? caPaths : paths;
  const [authorizedQuestions, setAuthorizedQuestions] = useState<Question[] | null>(null);
  const questionPool = authorizedQuestions ? authorizedQuestions : pack ? pack.questions() : onHi ? publishedHiQuestions() : onCa ? publishedCaQuestions() : publishedQuestions();
  const topicChoices = pack
    ? pack.topics.map((item) => ({ id: item.id, short: item.label }))
    : topicPractice
    ? (onHi ? hiStudyTopics : caStudyTopics).map((item) => ({ id: item.id, short: item.label }))
    : topics.map((item) => ({ id: item.id, short: item.short }));
  const router = useRouter();
  const [stats, setStats] = useState<QuestionStat[]>([]);
  const allowedTopics = new Set<string>(topicChoices.map((item) => item.id));
  const [topic, setTopic] = useState<string>(initialTopic && allowedTopics.has(initialTopic) ? initialTopic : "all");
  const [queue, setQueue] = useState<Question[] | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [needAuth, setNeedAuth] = useState(false);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [source, setSource] = useState<"all" | "incorrect" | "saved">("all");
  const requestId = useRef(0);
  const pendingIds = useRef(new Set<string>());
  const [pending, setPending] = useState<Record<string, string>>({});
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({});
  const [actionMessage, setActionMessage] = useState("");
  const [scopeIds, setScopeIds] = useState<string[] | null>(null);
  const [scopeSummary, setScopeSummary] = useState("");
  const [scopeNote, setScopeNote] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [importAttempt, setImportAttempt] = useState<CaQuickAttempt | null>(null);
  const [importMessage, setImportMessage] = useState("");
  const [importError, setImportError] = useState("");
  const [importBusy, setImportBusy] = useState(false);
  const [seen, setSeen] = useState({ mastered: false, favorite: false });
  const [prompt, setPrompt] = useState<{ stat: QuestionStat; action: MistakeAction; copy: MistakePrompt } | null>(null);
  const userIdRef = useRef("");
  const dialogRef = useRef<HTMLDivElement>(null);

  async function load() {
    if (pendingIds.current.size) return;
    const id = ++requestId.current;
    setLoadError(false);
    setReady(false);
    setStats([]);
    setScopeIds(null);
    setScopeSummary("");
    setScopeNote("");
    try {
      const meResponse = await fetchAccount({ cache: "no-store", signal: AbortSignal.timeout(30000) });
      if (id !== requestId.current || pendingIds.current.size) return;
      if (!meResponse.ok) throw new Error("account");
      const me = await meResponse.json();
      if (id !== requestId.current || pendingIds.current.size) return;
      if (!me.user) {
        setNeedAuth(true);
        setReady(true);
        return;
      }
      setNeedAuth(false);
      const sync = await syncCaAttempts(stateCode, me.user.id);
      if (id !== requestId.current) return;
      setSyncMessage(sync.message || "");
      userIdRef.current = me.user.id;
      setSeen(readMistakePrompts(window.localStorage, me.user.id));
      setIsPro(clientStatePro(me.user, stateCode));
      if (stateCode === "IN" || isFreeState(stateCode)) { const response = await fetch(stateCode === "IN" ? "/api/indiana/questions/" : `/api/state/questions/?state=${stateCode}`, { cache: "no-store" }); if (!response.ok) throw new Error("questions"); const bank = await response.json(); if (id !== requestId.current) return; setAuthorizedQuestions(bank.questions); }
      const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Phoenix";
      const day = new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
      const response = await fetch(`/api/mistakes/?state=${stateCode}&timeZone=${encodeURIComponent(zone)}&day=${day}&account=${encodeURIComponent(me.user.id)}`, { cache: "no-store", signal: AbortSignal.timeout(30000) });
      if (id !== requestId.current || pendingIds.current.size) return;
      if (!response.ok) throw new Error("mistakes");
      const data = await response.json();
      if (id !== requestId.current || pendingIds.current.size || data.state !== stateCode || data.accountId !== me.user.id) return;
      if (!Array.isArray(data.mistakes)) throw new Error("mistakes");
      const scope = await resolveScope(me.user.id, attemptId);
      if (id !== requestId.current) return;
      setScopeIds(scope.ids);
      setScopeSummary(scope.summary);
      setScopeNote(scope.note);
      setStats(data.mistakes);
      setReady(true);
    } catch {
      if (id !== requestId.current || pendingIds.current.size) return;
      setLoadError(true);
      setReady(true);
    }
  }

  async function resolveScope(userId: string, requested: string) {
    if (!requested) return { ids: null as string[] | null, summary: "", note: "" };
    const local = readCaAttempt(userId, requested, practiceState);
    if (local && local.owner === userId) {
      return {
        ids: local.wrongIds,
        summary: `This practice · ${new Date(local.finishedAt).toLocaleString()} · ${local.correctIds.filter(id => !local.unscoredIds?.includes(id)).length}/${local.questionIds.length - (local.unscoredIds?.length || 0)} · ${local.wrongIds.length} missed`,
        note: "",
      };
    }
    const daily = await fetch(`/api/daily-study/?state=${practiceState}&timeZone=${encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Phoenix")}&account=${encodeURIComponent(userId)}`, { cache: "no-store" }).catch(() => null);
    const body = daily?.ok ? await daily.json().catch(() => null) : null;
    const row = Array.isArray(body?.recent) ? body.recent.find((item: { id?: string }) => item.id === requested) : null;
    if (row && body?.state === (practiceState)) {
      const wrongIds = Array.isArray(row.wrongIds) ? row.wrongIds.filter((item: unknown) => typeof item === "string") : [];
      return {
        ids: wrongIds,
        summary: `This practice · ${row.label || "Practice"} · ${row.correct}/${row.total} · ${wrongIds.length} missed`,
        note: "",
      };
    }
    return { ids: null, summary: "", note: "That practice is not on this account. Showing every saved record for this state." };
  }

  async function updateRecord(stat: QuestionStat, action: "mastered" | "favorite" | "remove" | "save") {
    const questionId = stat.questionId;
    if (pendingIds.current.has(questionId)) return;
    pendingIds.current.add(questionId);
    setPending((current) => ({ ...current, [questionId]: action }));
    setActionErrors((current) => ({ ...current, [questionId]: "" }));
    setActionMessage("");
    // An earlier refresh must not overwrite a successful mutation.
    ++requestId.current;
    try {
      const patch = action === "save"
        ? { saveForReview: !stat.savedForReview }
        : action === "mastered" ? { mastered: true }
        : action === "remove" ? { remove: true } : { favorited: !stat.favorited };
      const response = await fetch("/api/mistakes/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, ...patch }),
        signal: AbortSignal.timeout(30000),
      });
      if (response.status === 401) {
        setNeedAuth(true);
        return;
      }
      const data = await response.json().catch(() => null);
      if (!response.ok || data?.ok !== true) {
        throw new Error(data?.error || "Could not update this question. Please try again.");
      }
      ++requestId.current;
      if (action === "save") {
        const saved = Boolean(data.savedForReview);
        setStats((current) => current.map((row) => row.questionId === questionId
          ? { ...row, savedForReview: saved, nextReviewAt: data.nextReviewAt ?? row.nextReviewAt }
          : row));
        setActionMessage(saved
          ? `Added to Daily Study.${data.nextReviewAt ? ` Next review ${new Date(data.nextReviewAt).toLocaleString()}.` : ""}`
          : "Removed from the review plan.");
      } else {
        setStats((current) => action === "favorite"
          ? current.map((row) => row.questionId === questionId ? { ...row, favorited: !stat.favorited } : row)
          : current.filter((row) => row.questionId !== questionId));
        if (userIdRef.current && (action === "mastered" || (action === "favorite" && !stat.favorited))) {
          markMistakePromptSeen(window.localStorage, userIdRef.current, action === "mastered" ? "mastered" : "favorite");
          setSeen(readMistakePrompts(window.localStorage, userIdRef.current));
        }
        setActionMessage(action === "mastered" ? "Question marked as mastered."
          : action === "remove" ? "Record deleted." : stat.favorited ? "Favorite removed." : "Question favorited.");
      }
      window.dispatchEvent(new Event("az-mistakes-change"));
      router.refresh();
    } catch (error) {
      setActionErrors((current) => ({ ...current, [questionId]:
        error instanceof Error && error.name === "TimeoutError"
          ? "This request timed out. Refresh the list to check whether the change was saved."
          : error instanceof Error && error.name !== "TypeError"
            ? error.message : "Could not update this question. Check your connection and try again." }));
    } finally {
      pendingIds.current.delete(questionId);
      setPending((current) => ({ ...current, [questionId]: "" }));
    }
  }

  useEffect(() => {
    load();
    function onSave() {
      load();
    }
    window.addEventListener("az-review-save", onSave);
    return () => window.removeEventListener("az-review-save", onSave);
    // A new state or sitting starts a new request. Mutations keep their own refresh lock.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateCode, attemptId]);

  useEffect(() => {
    setTopic(initialTopic && allowedTopics.has(initialTopic) ? initialTopic : "all");
  }, [initialTopic]);

  useEffect(() => {
    if (!prompt) return;
    dialogRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setPrompt(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prompt]);

  const byTopic = stats.filter((s) => {
    if (topic === "all") return true;
    const question = questionPool.find((item) => item.question_id === s.questionId);
    if (!topicPractice) return s.topic === topic;
    return question?.study_topic === topic;
  });
  const filtered = byTopic.filter((s) => {
    if (scopeIds && !scopeIds.includes(s.questionId)) return false;
    if (source === "incorrect") return s.wrongCount > 0;
    if (source === "saved") return Boolean(s.savedForReview);
    return true;
  });
  const due = filtered.filter(dueNow);
  const nextReview = filtered
    .map((s) => s.nextReviewAt)
    .filter((value): value is string => Boolean(value))
    .sort()[0];
  const phase = listPhase(loadError ? "error" : ready ? "ready" : "loading", filtered.length);
  const returnTo = notebookHref(site.mistakes, topic, attemptId);
  const scopedCount = stats.filter((row) => !scopeIds || scopeIds.includes(row.questionId)).length;

  function selectTopic(id: string) {
    setTopic(id);
    router.replace(notebookHref(site.mistakes, id, attemptId), { scroll: false });
  }

  function viewAllRecords() {
    setScopeIds(null);
    setScopeSummary("");
    setScopeNote("");
    router.replace(notebookHref(site.mistakes, topic, ""), { scroll: false });
  }

  function requestAction(stat: QuestionStat, action: "mastered" | "favorite" | "remove" | "save") {
    if (pendingIds.current.has(stat.questionId)) return;
    if (action === "save") {
      void updateRecord(stat, action);
      return;
    }
    const copy = mistakePrompt(action, { favorited: stat.favorited, seenMastered: seen.mastered, seenFavorite: seen.favorite });
    if (copy) {
      setPrompt({ stat, action, copy });
      return;
    }
    void updateRecord(stat, action);
  }

  function begin() {
    const byId = new Map(questionPool.map((question) => [question.question_id, question]));
    const next = filtered.flatMap((stat) => {
      const question = byId.get(stat.questionId);
      return question && (stateCode !== "CT" || question.is_free || isPro) ? [question] : [];
    });
    setQueue(next);
  }

  async function importMistakes() {
    const attempt = importAttempt;
    if (!attempt || importBusy) return;
    const missing = attempt.wrongIds.filter((id) => !stats.some((row) => row.questionId === id));
    if (missing.length === 0) {
      setImportMessage(`${attempt.wrongIds.length} already saved`);
      return;
    }
    setImportBusy(true);
    setImportError("");
    setImportMessage("");
    try {
      let added = 0;
      let already = attempt.wrongIds.length - missing.length;
      for (const id of missing) {
        const selected = attempt.originalAnswers[id];
        const savedAttempt = attempt.attemptIds[id];
        if (!selected || !savedAttempt) continue;
        const response = await fetch("/api/progress/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: id, questionVersion: attempt.questionVersions?.[id] ?? 1, selected, attemptId: savedAttempt, review: false, state: practiceState }),
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(data?.error || "Could not import these mistakes.");
        if (data?.duplicate) already += 1;
        else added += 1;
      }
      setImportMessage(`${added} ${added === 1 ? "mistake" : "mistakes"} added · ${already} already saved`);
      await load();
    } catch (reason) {
      setImportError(reason instanceof Error ? reason.message : "Could not import these mistakes.");
    } finally {
      setImportBusy(false);
    }
  }

  function shell(children: ReactNode) {
    return (
      <main className="wrap hero">
        <Breadcrumb items={[{ name: "Home", path: site.home }, { name: "Wrong Answers", path: site.mistakes }]} />
        <h1>Wrong-answer notebook</h1>
        {children}
      </main>
    );
  }

  if (needAuth) {
    return shell(
      <div className="card">
        <p>Sign in to practice the questions you missed. Your place is saved.</p>
        <Link className="btn btn-primary" href={`${site.login}?next=${encodeURIComponent(returnTo)}`}>
          Sign in
        </Link>
      </div>,
    );
  }

  if (queue) {
    return shell(
      <div>
        <button className="btn btn-ghost" type="button" onClick={() => { setQueue(null); load(); }}>
          Back
        </button>
        <ExamRunner mode="weak" practice review preset={queue} isPro={stateCode === "CT" || stateCode === "NC" || stateCode === "IN" || isFreeState(stateCode) ? isPro : topicPractice ? true : isPro} sittingMode={`review-${source}-${topic}${stateCode === "CT" ? `-${attemptId || "all"}` : ""}`} stateCode={stateCode} />
      </div>,
    );
  }

  const emptyCopy = scopeIds && scopedCount === 0
    ? "No mistakes in this practice."
    : stats.length > 0
      ? "Nothing matches this filter."
      : source === "saved"
        ? "No questions saved."
        : source === "incorrect"
          ? "No missed questions."
          : "No missed or saved questions on this account yet.";

  return shell(
    <div>
      {ready && isPro ? (
        <p className="notice">Pro is active. Missed questions and questions you save stay on this account.</p>
      ) : null}
      {ready && !isPro && !topicPractice ? (
        <p className="notice">
          Missed questions and questions you save stay on this account. Pro adds the rest of the practice bank.{" "}
          <Link href={paths.pricing} data-upgrade-source="wrong_answers">View Pro</Link>
        </p>
      ) : null}
      {ready && onCa ? <p className="notice">Missed California questions and questions you save stay on this account.</p> : null}
      {ready && onHi ? <p className="notice">Missed Hawaii questions and questions you save stay on this account.</p> : null}
      {scopeSummary ? (
        <p className="notice">
          {scopeSummary}{" "}
          <button className="btn btn-ghost" type="button" onClick={viewAllRecords}>View all records</button>
        </p>
      ) : null}
      {scopeNote ? <p className="notice" role="status">{scopeNote}</p> : null}
      {syncMessage ? <p className="notice" role="status">{syncMessage} <button className="btn btn-ghost" onClick={() => void load()}>Retry sync</button></p> : null}
      {!ready && !loadError ? <LoadingNote text="Loading your questions…" /> : null}
      {ready ? (
      <>
      <div className="tool-row" aria-label="Review source">
        <button className={`chip ${source === "all" ? "on" : ""}`} type="button" onClick={() => setSource("all")}>All</button>
        <button className={`chip ${source === "incorrect" ? "on" : ""}`} type="button" onClick={() => setSource("incorrect")}>Incorrect</button>
        <button className={`chip ${source === "saved" ? "on" : ""}`} type="button" onClick={() => setSource("saved")}>Saved</button>
      </div>
      <div className="tool-row">
        <button className={`chip ${topic === "all" ? "on" : ""}`} type="button" onClick={() => selectTopic("all")}>
          All
        </button>
        {topicChoices.map((item) => (
          <button key={item.id} className={`chip ${topic === item.id ? "on" : ""}`} type="button" onClick={() => selectTopic(item.id)}>
            {item.short}
          </button>
        ))}
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <Link className="btn btn-primary" href={site.daily}>Open Daily Study</Link>
        <button className="btn btn-ghost" type="button" onClick={begin} disabled={filtered.length === 0 || (isFreeState(stateCode) && !filtered.some(stat => questionPool.some(question => question.question_id === stat.questionId)))}>Practice wrong answers</button>
        {topicPractice ? <button className="btn btn-ghost" type="button" onClick={() => { setImportOpen((open) => !open); setImportError(""); const found = (attemptId && readCaAttempt(userIdRef.current, attemptId, practiceState)) || latestCaQuick(userIdRef.current, practiceState); setImportAttempt(found); }}>Import Mistakes</button> : null}
      </div>
      {importOpen && topicPractice ? (
        <div className="card import-panel">
          <h2>Import Mistakes</h2>
          {!importAttempt ? <p>No finished practice on this account can be imported.</p> : importAttempt.wrongIds.length === 0 ? (
            <p>No mistakes to import. Finished {new Date(importAttempt.finishedAt).toLocaleString()} with {importAttempt.correctIds.length} correct.</p>
          ) : (
            <>
              <p>Finished {new Date(importAttempt.finishedAt).toLocaleString()}. {importAttempt.wrongIds.length} missed. {importAttempt.wrongIds.filter((id) => stats.some((row) => row.questionId === id)).length} already saved.</p>
              <button className="btn btn-primary" type="button" disabled={importBusy} onClick={() => void importMistakes()}>{importBusy ? "Saving…" : "Import Mistakes"}</button>
            </>
          )}
          {importMessage ? <p className="notice" role="status">{importMessage}</p> : null}
          {importError ? <p className="form-error" role="alert">{importError}</p> : null}
        </div>
      ) : null}
      </>
      ) : null}
      {phase === "error" ? (
        <div className="card">
          <p className="form-error" role="alert">Could not load your questions.</p>
          <button className="btn btn-primary" type="button" onClick={() => { setReady(false); load(); }}>Retry</button>
        </div>
      ) : null}
      {ready && due.length === 0 && nextReview ? <p className="notice">Next review {new Date(nextReview).toLocaleString()}.</p> : null}
      {phase === "empty" ? (
        <div className="card">
          <p>{emptyCopy}</p>
          {stats.length === 0 && !scopeIds ? <Link className="btn btn-primary" href={site.practice}>Start a practice test</Link> : null}
        </div>
      ) : null}
      <p
        className="card"
        role="status"
        aria-live="polite"
        style={{
          position: "fixed",
          zIndex: 45,
          left: 16,
          right: 16,
          top: 80,
          margin: "0 auto",
          maxWidth: 480,
          background: "#fff",
          display: actionMessage ? "block" : "none",
        }}
      >
        {actionMessage}
      </p>
      {filtered.map((s) => {
        const q = questionPool.find((x) => x.question_id === s.questionId);
        if (!q) return null;
        return (
          <article className="card" key={s.questionId} style={{ marginTop: 12 }}>
            <span className="kicker">
              {(onHi ? hiStudyLabel(q.study_topic || q.topic) : onCa ? caStudyLabel(q.study_topic || q.topic) : topicLabel(q.topic))} · {dueNow(s) ? "Due" : "Later"}
              {s.wrongCount > 0 ? " · Incorrect" : ""}
              {s.savedForReview ? " · Saved" : ""}
            </span>
            <h3>{q.question_text}</h3>
            <p>
              {s.wrongCount > 0 ? `Wrong ${s.wrongCount} ${s.wrongCount === 1 ? "time" : "times"}` : "Saved for review"}
              {s.nextReviewAt ? ` · Next review ${new Date(s.nextReviewAt).toLocaleString()}` : ""}
            </p>
            <MistakeActions
              {...mistakeTargets(stateCode, q)}
              stat={s}
              pending={pending[s.questionId]}
              onAction={(action) => requestAction(s, action)}
            />
            {actionErrors[s.questionId] ? (
              <div className="form-error" role="alert">
                <p>{actionErrors[s.questionId]}</p>
                <button className="chip" type="button" disabled={Boolean(pending[s.questionId])} onClick={() => load()}>Refresh list</button>
              </div>
            ) : null}
          </article>
        );
      })}
      {prompt ? (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0, 0, 0, 0.32)", overflow: "auto" }}
          onClick={() => setPrompt(null)}
        >
          <div
            ref={dialogRef}
            className="card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mistake-prompt-title"
            tabIndex={-1}
            style={{ maxWidth: 480, margin: "18vh auto", background: "#fff" }}
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="mistake-prompt-title">{prompt.copy.title}</h2>
            <p>{prompt.copy.body}</p>
            <div className="row">
              <button className="btn btn-ghost" type="button" onClick={() => setPrompt(null)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => {
                  const current = prompt;
                  setPrompt(null);
                  void updateRecord(current.stat, current.action);
                }}
              >
                {prompt.copy.confirm}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>,
  );
}
