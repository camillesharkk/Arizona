"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { publishedCaQuestions } from "@/data/ca-questions";
import { CloudMistakes } from "@/components/CloudMistakes";
import { MistakeActions } from "@/components/MistakeActions";
import {
  adoptGuestCaRecords,
  importLocalMistakes,
  latestCaQuick,
  localMistakeIds,
  readCaAttempt,
  type CaQuickAttempt,
} from "@/lib/ca-attempts";
import { caPaths } from "@/lib/ca-site";
import { caStudyLabel } from "@/lib/ca-topics";
import type { QuestionStat } from "@/lib/store/types";

type Preview = {
  attempt: CaQuickAttempt | null;
  saved: string[];
  missing: string[];
  signedIn: boolean;
};

export function CaliforniaMistakes() {
  const params = useSearchParams();
  const requested = params.get("attempt") || "";
  const [owner, setOwner] = useState("guest");
  const [open, setOpen] = useState(Boolean(requested));
  const [preview, setPreview] = useState<Preview>({ attempt: null, saved: [], missing: [], signedIn: false });
  const [stats, setStats] = useState<QuestionStat[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [cardNote, setCardNote] = useState("");

  async function cardAction(questionId: string, action: "mastered" | "favorite" | "remove" | "save") {
    const current = stats.find((row) => row.questionId === questionId);
    setCardNote("");
    const body = action === "save"
      ? { questionId, saveForReview: !current?.savedForReview }
      : action === "remove"
        ? { questionId, remove: true }
        : action === "mastered"
          ? { questionId, mastered: true }
          : { questionId, favorited: !current?.favorited };
    const response = await fetch("/api/mistakes/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null);
    const data = response?.ok ? await response.json().catch(() => null) : null;
    if (!response?.ok || !data?.ok) {
      setCardNote("Could not update this question. Try again.");
      return;
    }
    if (action === "save") {
      const saved = Boolean(data.savedForReview);
      setStats((rows) => {
        const next = rows.filter((row) => row.questionId !== questionId);
        const base = current || { questionId, state: "CA", wrongCount: 0, favorited: false, mastered: false, savedForReview: false, nextReviewAt: null } as QuestionStat;
        return [...next, { ...base, savedForReview: saved, nextReviewAt: data.nextReviewAt ?? base.nextReviewAt }];
      });
      setCardNote(saved ? `Added to Daily Study.${data.nextReviewAt ? ` Next review ${new Date(data.nextReviewAt).toLocaleString()}.` : ""}` : "Removed from the review plan.");
      return;
    }
    if (action === "favorite" && current) {
      setStats((rows) => rows.map((row) => row.questionId === questionId ? { ...row, favorited: !row.favorited } : row));
      setCardNote(current.favorited ? "Favorite removed." : "Question favorited.");
      return;
    }
    setStats((rows) => rows.filter((row) => row.questionId !== questionId));
    setCardNote(action === "mastered" ? "Question marked as mastered." : "Record deleted.");
  }

  async function resolve(userId: string) {
    if (userId) adoptGuestCaRecords(userId);
    const nextOwner = userId || "guest";
    setOwner(nextOwner);
    let attempt = requested ? readCaAttempt(nextOwner, requested) : latestCaQuick(nextOwner);
    if (!attempt && userId && requested) {
      const daily = await fetch("/api/daily-study/?state=CA", { cache: "no-store" });
      const body = daily.ok ? await daily.json() : null;
      const row = Array.isArray(body?.recent) ? body.recent.find((item: { id: string }) => item.id === requested) : null;
      if (row) {
        attempt = {
          id: row.id,
          owner: userId,
          state: "CA",
          mode: "quick",
          sittingMode: "quick",
          finishedAt: row.at,
          seed: 0,
          questionIds: [...row.wrongIds, ...Array.from({ length: Math.max(0, row.total - row.wrongIds.length) }, () => "")],
          answers: {},
          originalAnswers: {},
          attemptIds: {},
          correctIds: Array.from({ length: row.correct }, () => ""),
          wrongIds: row.wrongIds,
          skippedIds: [],
          topicMisses: [],
        };
      }
    }
    const wrong = attempt?.wrongIds || [];
    if (!userId) {
      const have = new Set(localMistakeIds(nextOwner));
      setPreview({
        attempt,
        saved: wrong.filter((id) => have.has(id)),
        missing: wrong.filter((id) => !have.has(id)),
        signedIn: false,
      });
      setStats([]);
      return;
    }
    const response = await fetch("/api/progress/", { cache: "no-store" });
    const data = response.ok ? await response.json() : { stats: [] };
    const rows = Array.isArray(data.stats) ? data.stats as QuestionStat[] : [];
    const have = new Set(rows.filter((row) => row.state === "CA").map((row) => row.questionId));
    setStats(rows);
    setPreview({
      attempt,
      saved: wrong.filter((id) => have.has(id)),
      missing: wrong.filter((id) => !have.has(id)),
      signedIn: true,
    });
  }

  useEffect(() => {
    fetch("/api/auth/me/")
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("account"))))
      .then((data) => resolve(data.user?.id || ""))
      .catch(() => resolve(""));
    // The attempt in the URL selects the record. Auth is read once per URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requested, reloadKey]);

  const attempt = preview.attempt;
  const wrong = attempt?.wrongIds || [];
  const questions = publishedCaQuestions().filter((item) => wrong.includes(item.question_id));
  const due = stats
    .filter((row) => wrong.includes(row.questionId) && row.nextReviewAt)
    .map((row) => row.nextReviewAt as string)
    .sort()[0];
  const returnTo = `${caPaths.mistakes}${requested ? `?attempt=${encodeURIComponent(requested)}` : attempt ? `?attempt=${encodeURIComponent(attempt.id)}` : ""}`;

  async function importMistakes() {
    if (!attempt || busy) return;
    if (preview.missing.length === 0) {
      setShowAll(false);
      setOpen(false);
      setMessage(`${attempt.wrongIds.length} already saved`);
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (!preview.signedIn) {
        const result = importLocalMistakes(owner, attempt.wrongIds);
        setMessage(`${result.added} ${result.added === 1 ? "mistake" : "mistakes"} added · ${result.already} already saved`);
        setShowAll(false);
        setReloadKey((value) => value + 1);
        return;
      }
      let added = 0;
      let already = preview.saved.length;
      for (const id of preview.missing) {
        const selected = attempt.originalAnswers[id];
        const attemptId = attempt.attemptIds[id];
        if (!selected || !attemptId) continue;
        const response = await fetch("/api/progress/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: id, selected, attemptId, review: false, state: "CA" }),
        });
        const data = await response.json().catch(() => null);
        if (response.status === 401) {
          setPreview((current) => ({ ...current, signedIn: false }));
          throw new Error("Sign in to save these mistakes on your account.");
        }
        if (!response.ok) throw new Error(data?.error || "Could not import these mistakes.");
        if (data?.duplicate) already += 1;
        else added += 1;
      }
      setMessage(`${added} ${added === 1 ? "mistake" : "mistakes"} added · ${already} already saved`);
      setShowAll(false);
      setReloadKey((value) => value + 1);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not import these mistakes.");
    } finally {
      setBusy(false);
    }
  }

  const viewLabel = preview.missing.length === 0 && wrong.length > 0
    ? `View ${wrong.length} Saved Mistakes`
    : `Import ${preview.missing.length} Mistakes`;

  return (
    <>
      <div className="row space">
        <h1>California wrong answers</h1>
        <button className="btn btn-ghost" type="button" onClick={() => { setOpen((value) => !value); setError(""); }}>
          Import Mistakes
        </button>
      </div>
      {open ? (
        <div className="card import-panel">
          <h2>Import Mistakes</h2>
          {!attempt ? (
            <>
              <p>No finished Quick 10 is on this account yet.</p>
              <Link className="btn btn-primary" href={`${caPaths.practice}?mode=quick`}>Start Quick 10</Link>
            </>
          ) : wrong.length === 0 ? (
            <p>No mistakes to import. Finished {new Date(attempt.finishedAt).toLocaleString()} with {attempt.correctIds.length} correct.</p>
          ) : (
            <>
              <p>
                Finished {new Date(attempt.finishedAt).toLocaleString()}. Score {attempt.correctIds.length} of {attempt.questionIds.length}. {wrong.length} missed. {preview.saved.length} already saved. {preview.missing.length} can be added.
              </p>
              <button className="btn btn-primary" type="button" disabled={busy} onClick={() => void importMistakes()}>
                {busy ? "Saving…" : viewLabel}
              </button>
              {!preview.signedIn ? (
                <p className="notice">
                  These questions stay in this browser. Sign in to keep them on your account.{" "}
                  <Link href={`${caPaths.login}?next=${encodeURIComponent(returnTo)}`}>Sign in</Link>
                </p>
              ) : null}
            </>
          )}
          {error ? (
            <p className="form-error" role="alert">
              {error}{" "}
              <button className="btn btn-ghost" type="button" onClick={() => void importMistakes()}>Try again</button>
            </p>
          ) : null}
        </div>
      ) : null}
      {message ? <p className="notice" role="status">{message}</p> : null}
      <div className="row" style={{ margin: "12px 0" }}>
        <Link className="btn btn-primary" href={preview.signedIn ? caPaths.daily : `${caPaths.login}?next=${encodeURIComponent(caPaths.daily)}`}>Open Daily Study</Link>
      </div>
      <div className="tool-row" aria-label="Mistake list">
        <button className={`chip ${showAll ? "" : "on"}`} type="button" onClick={() => setShowAll(false)}>This practice</button>
        <button className={`chip ${showAll ? "on" : ""}`} type="button" onClick={() => setShowAll(true)}>All mistakes</button>
      </div>
      {due && !showAll ? <p className="notice">Next review {new Date(due).toLocaleString()}.</p> : null}
      {cardNote ? <p className="notice" role="status">{cardNote}</p> : null}
      {!showAll && questions.length > 0 ? (
        questions.map((question) => {
          const stat = stats.find((row) => row.questionId === question.question_id);
          return (
            <article className="card" key={question.question_id}>
              <span className="kicker">{question.study_topic ? caStudyLabel(question.study_topic) : "California"}</span>
              <h2>{question.question_text}</h2>
              {stat?.nextReviewAt ? <p>Next review {new Date(stat.nextReviewAt).toLocaleString()}.</p> : null}
              {stat?.mastered ? <p>Mastered. Import does not clear that status.</p> : null}
              <MistakeActions
                stateCode="CA"
                studyTopic={question.study_topic}
                stat={stat}
                signedIn={preview.signedIn}
                onAction={(action) => void cardAction(question.question_id, action)}
              />
            </article>
          );
        })
      ) : null}
      {!showAll && attempt && questions.length === 0 ? <p className="notice">No mistakes to import.</p> : null}
      {!showAll && !attempt ? <p className="notice">Finish a Quick 10 to list its missed questions here.</p> : null}
      {showAll && preview.signedIn ? <CloudMistakes stateCode="CA" hideDailyLink /> : null}
      {showAll && !preview.signedIn ? (
        <div className="card">
          <p>Sign in to open the saved notebook. This browser can still show the Quick 10 you just finished.</p>
          <Link className="btn btn-primary" href={`${caPaths.login}?next=${encodeURIComponent(returnTo)}`}>Sign in</Link>
        </div>
      ) : null}
    </>
  );
}
