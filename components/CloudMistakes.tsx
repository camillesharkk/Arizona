"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { publishedQuestions } from "@/data/questions";
import { publishedCaQuestions } from "@/data/ca-questions";
import { topics } from "@/data/exam-config";
import { CA_EXAM, caPaths } from "@/lib/ca-site";
import { ExamRunner } from "@/components/ExamRunner";
import { MistakeActions } from "@/components/MistakeActions";
import { LoadingNote } from "@/components/QuizChrome";
import { topicLabel } from "@/lib/quiz";
import { paths } from "@/lib/paths";
import { listPhase } from "@/lib/list-phase";
import { markMistakePromptSeen, mistakePrompt, readMistakePrompts, type MistakeAction, type MistakePrompt } from "@/lib/mistake-prompts";
import type { Question } from "@/lib/types";
import type { QuestionStat } from "@/lib/store/types";

const topicIds = new Set<string>(topics.map((topic) => topic.id));

function dueNow(stat: QuestionStat) {
  return Boolean(stat.nextReviewAt) && Date.parse(stat.nextReviewAt as string) <= Date.now();
}

export function CloudMistakes({ initialTopic, stateCode = "AZ", attemptIds, hideDailyLink = false }: { initialTopic?: string; stateCode?: "AZ" | "CA"; attemptIds?: string[]; hideDailyLink?: boolean }) {
  const onCa = stateCode === "CA";
  const site = onCa ? caPaths : paths;
  const questionPool = onCa ? publishedCaQuestions() : publishedQuestions();
  const topicChoices = onCa
    ? CA_EXAM.quotas.map((item) => ({ id: item.area, short: item.label }))
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
  const [source, setSource] = useState<"all" | "incorrect" | "saved">("all");
  const requestId = useRef(0);
  const pendingIds = useRef(new Set<string>());
  const [pending, setPending] = useState<Record<string, string>>({});
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({});
  const [actionMessage, setActionMessage] = useState("");
  const [seen, setSeen] = useState({ mastered: false, favorite: false });
  const [prompt, setPrompt] = useState<{ stat: QuestionStat; action: MistakeAction; copy: MistakePrompt } | null>(null);
  const userIdRef = useRef("");
  const dialogRef = useRef<HTMLDivElement>(null);

  async function load() {
    if (pendingIds.current.size) return;
    const id = ++requestId.current;
    setLoadError(false);
    try {
      const meResponse = await fetch("/api/auth/me/", { cache: "no-store", signal: AbortSignal.timeout(30000) });
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
      userIdRef.current = me.user.id;
      setSeen(readMistakePrompts(window.localStorage, me.user.id));
      setIsPro(Boolean(me.user.arizonaPro || me.user.plan === "pro"));
      const response = await fetch(onCa ? "/api/mistakes/?state=CA" : "/api/mistakes/", { cache: "no-store", signal: AbortSignal.timeout(30000) });
      if (id !== requestId.current || pendingIds.current.size) return;
      if (!response.ok) throw new Error("mistakes");
      const data = await response.json();
      if (id !== requestId.current || pendingIds.current.size) return;
      if (!Array.isArray(data.mistakes)) throw new Error("mistakes");
      setStats(data.mistakes);
      setReady(true);
    } catch {
      if (id !== requestId.current || pendingIds.current.size) return;
      setLoadError(true);
      setReady(true);
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (!onCa) return s.topic === topic;
    return questionPool.find((question) => question.question_id === s.questionId)?.exam_area === topic;
  });
  const filtered = byTopic.filter((s) => {
    if (attemptIds?.length && !attemptIds.includes(s.questionId)) return false;
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
  const returnTo = topic === "all" ? site.mistakes : `${site.mistakes}?topic=${topic}`;

  function selectTopic(id: string) {
    setTopic(id);
    router.replace(id === "all" ? site.mistakes : `${site.mistakes}?topic=${id}`, { scroll: false });
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
      return question ? [question] : [];
    });
    setQueue(next);
  }

  if (needAuth) {
    return (
      <div className="card">
        <p>Sign in to practice the questions you missed. Your place is saved.</p>
        <Link className="btn btn-primary" href={`${site.login}?next=${encodeURIComponent(returnTo)}`}>
          Sign in
        </Link>
      </div>
    );
  }

  if (queue) {
    return (
      <div>
        <button className="btn btn-ghost" type="button" onClick={() => { setQueue(null); load(); }}>
          Back
        </button>
        <ExamRunner mode="weak" practice review preset={queue} isPro={onCa ? true : isPro} sittingMode={`review-${source}-${topic}`} stateCode={stateCode} />
      </div>
    );
  }

  return (
    <div>
      {ready && isPro ? (
        <p className="notice">Pro is active. Missed questions and questions you save stay on this account.</p>
      ) : null}
      {ready && !isPro && !onCa ? (
        <p className="notice">
          Missed questions and questions you save stay on this account. Pro adds the rest of the practice bank.{" "}
          <Link href={paths.pricing} data-upgrade-source="wrong_answers">View Pro</Link>
        </p>
      ) : null}
      {ready && onCa ? <p className="notice">Missed California questions and questions you save stay on this account.</p> : null}
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
      {phase === "loading" ? <LoadingNote /> : null}
      {phase === "error" ? (
        <div className="card">
          <p className="form-error" role="alert">Could not load your questions.</p>
          <button className="btn btn-primary" type="button" onClick={() => { setReady(false); load(); }}>Retry</button>
        </div>
      ) : null}
      {loadError && phase === "list" ? (
        <p className="form-error" role="alert">
          Could not refresh this list.{" "}
          <button className="btn btn-ghost" type="button" onClick={() => load()}>Retry</button>
        </p>
      ) : null}
      {phase === "empty" ? (
        <div className="card">
          <p>
            {source === "saved"
              ? "No questions saved."
              : source === "incorrect"
                ? "No missed questions."
                : "No missed or saved questions in this set yet."}
          </p>
          <Link className="btn btn-primary" href={site.practice}>Start a practice test</Link>
        </div>
      ) : null}
      {phase === "list" ? (
        <>
          {hideDailyLink ? null : <Link className="btn btn-primary" href={site.daily}>Open Daily Study</Link>}
          {due.length === 0 && nextReview ? <p className="notice">Next review {new Date(nextReview).toLocaleString()}.</p> : null}
          <button className="btn btn-ghost" type="button" onClick={begin}>
            {due.length === 0 ? "Practice all wrong answers" : "Practice wrong answers"}
          </button>
        </>
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
              {topicLabel(q.topic)} · {dueNow(s) ? "Due" : "Later"}
              {s.wrongCount > 0 ? " · Incorrect" : ""}
              {s.savedForReview ? " · Saved" : ""}
            </span>
            <h3>{q.question_text}</h3>
            <p>
              {s.wrongCount > 0 ? `Wrong ${s.wrongCount} ${s.wrongCount === 1 ? "time" : "times"}` : "Saved for review"}
              {s.nextReviewAt ? ` · Next review ${new Date(s.nextReviewAt).toLocaleString()}` : ""}
            </p>
            <MistakeActions
              stateCode={onCa ? "CA" : "AZ"}
              studyTopic={onCa ? q.study_topic : undefined}
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
    </div>
  );
}
