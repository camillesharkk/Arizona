"use client";

import { useEffect, useState } from "react";
import { caPaths } from "@/lib/ca-site";
import { quickNextBand, rankMissedTopics, type TopicMiss } from "@/lib/ca-next";

export function CaQuickNext({
  correct,
  total,
  skipped,
  misses,
  attemptId,
  fullHref,
  fullResume,
  fullLocked,
}: {
  correct: number;
  total: number;
  skipped: number;
  misses: TopicMiss[];
  attemptId: string;
  fullHref: string;
  fullResume: boolean;
  fullLocked: boolean;
}) {
  const band = quickNextBand(correct, total);
  const topic = rankMissedTopics(misses);
  const wrong = misses.reduce((sum, item) => sum + item.missed, 0);
  const attempt = attemptId ? `attempt=${encodeURIComponent(attemptId)}` : "";
  const guideHref = topic
    ? `${caPaths.study}?${attempt ? `${attempt}&` : ""}chapter=${encodeURIComponent(topic.id)}#${topic.id}`
    : caPaths.study;
  const mistakeHref = `${caPaths.mistakes}${attempt ? `?${attempt}` : ""}`;
  const fullLabel = fullResume ? "Resume Full 45 Practice Exam" : "Start Full 45 Practice Exam";
  const [nextReviewAt, setNextReviewAt] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    fetch(`/api/daily-study/?state=CA&timeZone=${encodeURIComponent(zone)}`, { cache: "no-store" })
      .then((response) => {
        setSignedIn(response.ok);
        return response.ok ? response.json() : null;
      })
      .then((data) => setNextReviewAt(data?.nextReviewAt || ""))
      .catch(() => undefined);
  }, []);
  const dailyHref = signedIn ? caPaths.daily : `${caPaths.login}?next=${encodeURIComponent(caPaths.daily)}`;
  const fullButton = (
    <a className={band === "review" && topic ? "btn btn-ghost" : "btn btn-primary"} href={fullHref}>
      {fullLabel}
    </a>
  );
  const reviewButton = topic ? (
    <a className={band === "review" ? "btn btn-primary" : "btn btn-ghost"} href={guideHref}>
      Review {topic.label}
    </a>
  ) : null;
  const mistakeButton = wrong > 0 ? (
    <a className="btn btn-ghost" href={mistakeHref}>Review My Mistakes ({wrong})</a>
  ) : null;

  return (
    <div className="next-step">
      <h3>Your next step</h3>
      {band === "review" && topic ? (
        <p>You missed {topic.missed} {topic.missed === 1 ? "question" : "questions"} on {topic.label.toLowerCase()}. Start with this chapter.</p>
      ) : null}
      {band === "perfect" ? <p>Every answered question was correct. A full practice exam is the next check.</p> : null}
      {skipped > 0 ? <p>Unanswered: {skipped}. Skipped questions are not counted as missed.</p> : null}
      <div className="result-next">
        {band === "review" && topic ? reviewButton : fullButton}
        {band === "review" ? (
          <>
            {mistakeButton}
            {fullButton}
          </>
        ) : null}
        {band === "ready" ? (
          <>
            {mistakeButton}
            {reviewButton}
          </>
        ) : null}
        {band === "perfect" ? <a className="btn btn-ghost" href={caPaths.studyCards}>Explore Study Cards</a> : null}
        <a className="btn btn-ghost" href={dailyHref}>Open Daily Study</a>
        {nextReviewAt ? <span className="notice">Next review {new Date(nextReviewAt).toLocaleString()}.</span> : null}
      </div>
      {fullLocked && !fullResume ? <p className="notice">The free Full 45 on this account or browser is already used. Opening it shows that limit. California Pro is not open.</p> : null}
    </div>
  );
}
