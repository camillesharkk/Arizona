"use client";

import { MemberCopy } from "@/components/MemberCopy";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MissedStateGallery, ScheduledReviewGallery, type MissedState, type ScheduledReviewItem } from "@/components/DailyStudyGalleries";
import { ExamRunner } from "@/components/ExamRunner";
import { MessageDialog } from "@/components/MessageDialog";
import { StudyCardBody, type StudyCardView } from "@/components/StudyCardBody";
import { StudyPager } from "@/components/StudyPager";
import { LoadingNote } from "@/components/QuizChrome";
import { caPaths } from "@/lib/ca-site";
import { hiPaths } from "@/lib/hi-site";
import { hiStudyLabel } from "@/lib/hi-topics";
import { syncCaAttempts } from "@/lib/ca-sync";
import { paths } from "@/lib/paths";
import { isFreeState } from "@/lib/free-state-catalog";
import { packFor } from "@/lib/client-pack";
import type { Question, StateCode } from "@/lib/types";
import "@/app/daily-study-galleries.css";

const guideSteps = [
  {
    title: "Start with today’s tasks",
    text: "Today’s Practice gives you new cards and questions. Start with Today’s Review when you have reviews due, so you revisit material before moving on.",
  },
  {
    title: "Find all your missed questions",
    text: "When you miss a question in practice or a submitted exam, we record it under your account. Missed questions across the site shows your totals by state. Open a state’s Daily Study to see its review queue and scheduled questions.",
  },
  {
    title: "Review before you forget",
    text: "Spaced repetition is inspired by the forgetting curve. After a miss, your next review is scheduled for the following day. Correct answers on due reviews extend the interval to 7, 14, and then 30 days. Another miss brings the question back the next day.",
  },
  {
    title: "Set a plan that fits your schedule",
    text: "Open Study Settings to choose an exam target date, study days, and time zone. Use the recommended pace or set your own daily goals. Check Scheduled review to see when a question comes back.",
  },
];

type Card = StudyCardView & { id: string };
type View = {
  accountId: string;
  wrongQuestionCount: number;
  wrongQuestionsByState: MissedState[];
  today: string;
  dayNumber: number;
  done: number;
  goal: number;
  introduced: number;
  reviewed: number;
  total: number;
  targetDate: string;
  projectedDate: string | null;
  projectReason: string | null;
  entitlementExpiresAt: string | null;
  freeOnly: boolean;
  freeQuestionCount: number;
  questionCount: number;
  freeCardCount: number;
  cardCount: number;
  reason: string | null;
  practiceCards: Card[];
  reviewCards: Card[];
  practiceQuestionIds: string[];
  reviewQuestionIds: string[];
  yesterdayWaiting: { id: string; nextReviewAt: string }[];
  unmappedQuestionIds: string[];
  nextReviewAt: string | null;
  taskStatus: { key: string; kind: string; status: string }[];
  recent?: { id: string; at: string; label: string; correct: number; total: number; wrong: number }[];
  scheduled?: ScheduledReviewItem[];
  deliveryToken?: string;
};

export function DailyStudyClient({ stateCode = "AZ" }: { stateCode?: StateCode }) {
  const pack = packFor(stateCode);
  const site = pack ? pack.paths : stateCode === "HI" ? hiPaths : stateCode === "CA" ? caPaths : paths;
  const [view, setView] = useState<View | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [guideStep, setGuideStep] = useState<number | null>(null);
  const guideOpenedFor = useRef<string | null>(null);
  const guideHeading = useRef<HTMLHeadingElement>(null);
  const loadId = useRef(0);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [flipped, setFlipped] = useState<"practice" | "review" | null>(null);
  const [pinned, setPinned] = useState<"practice" | "review">("practice");
  const practiceFace = useRef<HTMLDivElement>(null);
  const reviewFace = useRef<HTMLDivElement>(null);
  const zone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Phoenix", []);
  const visibleStart = useRef<number | null>(null);

  const query = `timeZone=${encodeURIComponent(zone)}&state=${stateCode}`;
  const guideAccountId = view?.accountId;

  useEffect(() => {
    if (!guideAccountId) return;
    let cancelled = false;
    let seenLocally = false;
    try {
      seenLocally = Boolean(localStorage.getItem(`notary-daily-study-guide:${guideAccountId}`));
    } catch {
      // The account receipt also works when browser storage is unavailable.
    }
    fetch("/api/daily-study/guide/", { method: "POST" })
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        if (!cancelled && result?.show === true && !seenLocally && guideOpenedFor.current !== guideAccountId) {
          guideOpenedFor.current = guideAccountId;
          setGuideStep(0);
        }
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [guideAccountId]);

  function openGuide() {
    guideOpenedFor.current = guideAccountId ?? null;
    setGuideStep(0);
  }

  useEffect(() => {
    if (guideStep != null && guideStep > 0) guideHeading.current?.focus();
  }, [guideStep]);

  async function load() {
    const id = ++loadId.current;
    setLoading(true);
    setLoadError(false);
    let hold = false;
    try {
      await syncCaAttempts(stateCode);
      if (id !== loadId.current) return;
      const response = await fetch(`/api/daily-study/?${query}`, { cache: "no-store" });
      if (id !== loadId.current) return;
      const back = `${site.login}?next=${encodeURIComponent(`${site.daily}${window.location.search}`)}`;
      if (response.status === 401) {
        hold = true;
        window.location.href = back;
        return;
      }
      if (!response.ok) throw new Error("daily");
      const data = await response.json();
      if (data.error) {
        hold = true;
        window.location.href = back;
        return;
      }
      if (stateCode !== "AZ" && data.state !== stateCode) throw new Error("state");
      setView(data);
    } catch {
      if (id === loadId.current) setLoadError(true);
    } finally {
      if (id === loadId.current && !hold) setLoading(false);
    }
  }

  useEffect(() => {
    load();
    function onVisibility() {
      if (document.visibilityState === "hidden") flushVisible();
      else visibleStart.current = Date.now();
    }
    visibleStart.current = Date.now();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      flushVisible();
    };
    // The timer is tied to this page, not to each refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zone]);

  function flushVisible() {
    if (visibleStart.current == null) return;
    const seconds = Math.round((Date.now() - visibleStart.current) / 1000);
    visibleStart.current = document.visibilityState === "visible" ? Date.now() : null;
    if (seconds < 5) return;
    fetch(`/api/daily-study/?${query}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "visible", seconds: Math.min(seconds, 120), attemptId: crypto.randomUUID() }),
    }).catch(() => undefined);
  }

  async function mark(cardId: string, action: "studied" | "remembered" | "need-review") {
    const data = await fetch(`/api/daily-study/?${query}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, cardId, attemptId: crypto.randomUUID() }),
    }).then((response) => response.json());
    if (!data.error) setView(data);
    setFlipped(null);
  }

  if (!view && loading) return <LoadingNote text="Loading your study plan…" />;
  if (loadError && !view) {
    return (
      <div className="card">
        <p className="form-error" role="alert">Could not load today’s plan.</p>
        <button className="btn btn-primary" type="button" onClick={() => load()}>Retry</button>
      </div>
    );
  }
  if (!view) return <LoadingNote text="Loading your study plan…" />;
  const pending = (kind: string) => new Set(view.taskStatus.filter((task) => task.kind === kind && task.status === "pending").map((task) => task.key));
  const practiceCards = view.practiceCards.filter((card) => pending("new-card").has(`card:${card.id}`));
  const reviewCards = view.reviewCards.filter((card) => pending("review-card").has(`card:${card.id}`));
  const practiceCard = practiceCards[Math.min(practiceIndex, Math.max(practiceCards.length - 1, 0))];
  const reviewCard = reviewCards[Math.min(reviewIndex, Math.max(reviewCards.length - 1, 0))];
  const practiceIds = view.practiceQuestionIds.filter((id) => pending("new-question").has(`question:${id}`));
  const reviewIds = view.reviewQuestionIds.filter((id) => pending("review-question").has(`question:${id}`));
  const stub = (id: string) => ({ question_id: id, state: stateCode, question_text: "", options: [], correct_option: "", explanation: "", is_free: true, topic: "commission" }) as unknown as Question;
  const studySettingsHref = `${paths.studySettings}?state=${stateCode}`;
  const scheduledById = new Map(view.scheduled?.map((item) => [item.questionId, item]));
  const entitlement = view.entitlementExpiresAt ? view.entitlementExpiresAt.slice(0, 10) : null;
  const progress = view.total ? Math.round(((view.introduced + view.reviewed) / (view.total * 2)) * 100) : 0;

  return (
    <>
      <div className="daily-meta">
        <span>Day {view.dayNumber}</span>
        <span>{view.done} / {view.goal} today</span>
        <span>{progress}% of this plan</span>
        <span>Target {view.targetDate}</span>
        <Link className="btn btn-ghost card-action" href={studySettingsHref}>Study Settings</Link>
        <button className="btn btn-ghost" type="button" aria-haspopup="dialog" onClick={openGuide}>Daily Study guide</button>
        <Link className="btn btn-ghost" href={paths.community}>Explore Community Insights</Link>
      </div>
      {guideStep != null ? (
        <MessageDialog title="Daily Study guide" onClose={() => setGuideStep(null)}>
          <p className="kicker">Step {guideStep + 1} of {guideSteps.length}</p>
          <h3 ref={guideHeading} tabIndex={-1}>{guideSteps[guideStep].title}</h3>
          <p>{guideSteps[guideStep].text}</p>
          <form className="row message-dialog-close daily-guide-actions" method="dialog">
            <button className="btn btn-ghost" type="submit">Skip guide</button>
            {guideStep === guideSteps.length - 1 ? (
              <button className="btn btn-primary" type="submit" key="finish">Finish guide</button>
            ) : (
              <button className="btn btn-primary" type="button" key="next" data-dialog-autofocus onClick={() => setGuideStep(guideStep + 1)}>Next</button>
            )}
          </form>
        </MessageDialog>
      ) : null}
      {stateCode === "AZ" && view.freeOnly ? (
        <p className="notice"><MemberCopy member={<>
          Today’s plan uses the starter set: </>}>
          Today’s plan uses the free set: </MemberCopy>{view.freeQuestionCount} questions and {view.freeCardCount} study cards. Pro uses all {view.questionCount} questions and {view.cardCount} study cards.{" "}
          <Link href={paths.pricing}>View Pro</Link>
        </p>
      ) : stateCode === "AZ" ? (
        <p className="notice">Pro is active. Today’s plan uses the full question bank and study cards.</p>
      ) : null}
      {stateCode === "AZ" && entitlement && entitlement < view.targetDate ? <p className="notice">Pro access ends {entitlement}. The study target stays {view.targetDate}.</p> : null}
      {view.projectedDate && view.projectedDate > view.targetDate ? <p className="notice">At the current pace the plan finishes {view.projectedDate}.</p> : null}
      {view.projectReason ? <p className="notice">{view.projectReason}</p> : null}
      {view.reason ? <p className="notice">{view.reason}</p> : null}
      {view.unmappedQuestionIds.length ? <p className="notice">{view.unmappedQuestionIds.length} missed questions are not on a study card yet.</p> : null}
      <div className="daily-grid">
        <section className="card daily-practice-card" aria-label="Today’s Practice">
          <h2>Today’s Practice</h2>
          <p>New cards and questions follow your daily goal. Adjust your pace in <Link href={studySettingsHref}>Study Settings</Link>.</p>
          {practiceCard ? (
            <>
              <p className="notice">Why this card? It’s new to your study plan.</p>
              <div ref={practiceFace} className="study-face" onClick={() => setFlipped(flipped === "practice" ? null : "practice")}>
                <StudyCardBody card={practiceCard} flipped={flipped === "practice"} labelFor={stateCode === "HI" ? hiStudyLabel : undefined} />
                <button className="btn btn-ghost" type="button" aria-expanded={flipped === "practice"} onClick={(event) => {
                  event.stopPropagation();
                  setFlipped(flipped === "practice" ? null : "practice");
                }}>{flipped === "practice" ? "Show prompt" : "Show answer"}</button>
              </div>
              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn btn-primary" type="button" onClick={() => mark(practiceCard.id, "studied")}>Mark studied</button>
              </div>
              <StudyPager
                index={Math.min(practiceIndex, practiceCards.length - 1)}
                total={practiceCards.length}
                target={practiceFace}
                pin={Boolean(practiceCard) && (pinned === "practice" || !reviewCard)}
                onPrev={() => { setPinned("practice"); setPracticeIndex((index) => index - 1); setFlipped(null); }}
                onNext={() => { setPinned("practice"); setPracticeIndex((index) => index + 1); setFlipped(null); }}
              />
            </>
          ) : <p>No new cards left in today’s goal.</p>}
        </section>
        <section className="card daily-review-card" aria-label="Today’s Review">
          <h2>Today’s Review</h2>
          <p>Missed or saved questions and studied cards return when due, using spaced repetition inspired by the forgetting curve. Retry a question or mark a card reviewed. Choose Need review to see a card again sooner.</p>
          {view.yesterdayWaiting.length ? (
            <p className="notice">
              {view.yesterdayWaiting.length} missed {view.yesterdayWaiting.length === 1 ? "question is" : "questions are"} not due until {new Date(view.yesterdayWaiting[0].nextReviewAt).toLocaleString("en-US")}.
            </p>
          ) : null}
          {!reviewCard && !reviewIds.length ? (
            <p>No reviews due today.{view.nextReviewAt ? ` Next review ${new Date(view.nextReviewAt).toLocaleString("en-US")}.` : ""}</p>
          ) : null}
          {reviewCard ? (
            <>
              <p className="notice">Why this card? It has reached its scheduled review time.</p>
              <div ref={reviewFace} className="study-face" onClick={() => setFlipped(flipped === "review" ? null : "review")}>
                <StudyCardBody card={reviewCard} flipped={flipped === "review"} labelFor={stateCode === "HI" ? hiStudyLabel : undefined} />
                <button className="btn btn-ghost" type="button" aria-expanded={flipped === "review"} onClick={(event) => {
                  event.stopPropagation();
                  setFlipped(flipped === "review" ? null : "review");
                }}>{flipped === "review" ? "Show prompt" : "Show answer"}</button>
              </div>
              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn btn-primary" type="button" onClick={() => mark(reviewCard.id, "remembered")}>Mark reviewed</button>
                <button className="btn btn-ghost" type="button" onClick={() => mark(reviewCard.id, "need-review")}>Need review</button>
              </div>
              <StudyPager
                index={Math.min(reviewIndex, reviewCards.length - 1)}
                total={reviewCards.length}
                target={reviewFace}
                pin={pinned === "review" || !practiceCard}
                onPrev={() => { setPinned("review"); setReviewIndex((index) => index - 1); setFlipped(null); }}
                onNext={() => { setPinned("review"); setReviewIndex((index) => index + 1); setFlipped(null); }}
              />
            </>
          ) : null}
        </section>
        {practiceIds.length ? (
          <div className="daily-practice-quiz">
            <ExamRunner mode="practice" practice isPro={(stateCode === "CT" || stateCode === "NC" || stateCode === "IN" || isFreeState(stateCode)) && view.freeOnly === false} preset={practiceIds.map(stub)} deliveryToken={view.deliveryToken} questionReason={() => "You haven’t answered this question yet. It counts toward today’s practice goal."} onRecorded={load} sittingMode={`daily-practice-${view.today}`} stateCode={stateCode} />
          </div>
        ) : null}
        {reviewIds.length ? (
          <div className="daily-review-quiz">
            <ExamRunner mode="weak" practice review isPro={(stateCode === "CT" || stateCode === "NC" || stateCode === "IN" || isFreeState(stateCode)) && view.freeOnly === false} preset={reviewIds.map(stub)} deliveryToken={view.deliveryToken} questionReason={(id) => {
              const item = scheduledById.get(id);
              if (item?.wrongCount) return "You previously missed this question, and it’s due for review.";
              if (item?.saved) return "You added this question to Daily Study, and it’s due for review.";
              return "This question has reached its scheduled review time.";
            }} onRecorded={load} sittingMode={`daily-review-${view.today}`} stateCode={stateCode} />
          </div>
        ) : null}
      </div>
      <p style={{ marginTop: 16 }}>
        <button className="btn btn-ghost" type="button" onClick={async () => {
          const data = await fetch(`/api/daily-study/?${query}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "more", attemptId: crypto.randomUUID() }),
          }).then((response) => response.json());
          if (!data.error) setView(data);
        }}>Keep studying</button>
      </p>
      {view.recent && view.recent.length > 0 ? (
        <section className="card" style={{ marginTop: 16 }}>
          <h2>Recent practice</h2>
          <ul className="check">
            {view.recent.map((exam) => (
              <li key={exam.id}>
                <strong>{exam.label}</strong>
                {" · "}
                {new Date(exam.at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                {" · "}
                {exam.correct}/{exam.total}
                {exam.wrong > 0 ? <> · <Link href={`${site.mistakes}?attempt=${exam.id}`}>Review My Mistakes ({exam.wrong})</Link></> : " · No mistakes"}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <ScheduledReviewGallery key={stateCode} items={view.scheduled ?? []} stateCode={stateCode} />
      <MissedStateGallery total={view.wrongQuestionCount} states={view.wrongQuestionsByState} stateCode={stateCode} dailyHref={site.daily} />
    </>
  );
}
