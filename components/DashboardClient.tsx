"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { paths } from "@/lib/paths";
import { topicLabel } from "@/lib/quiz";
import type { TopicId } from "@/lib/types";
import { readinessScore } from "@/lib/stats";
import type { ExamRow, QuestionStat, UserRow } from "@/lib/store/types";
import { ProAccessNote } from "@/components/ProAccessNote";
import { hasRememberedPurchase, pickLatestPaidOrder, rememberPurchase, trackPurchase } from "@/lib/analytics";

export function DashboardClient() {
  const [data, setData] = useState<{
    stats: QuestionStat[];
    exams: ExamRow[];
    user: UserRow | null;
    arizonaPro?: boolean;
  } | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);
  const [checkoutPending, setCheckoutPending] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCheckEmail(params.get("checkEmail") === "1");
    const pending = params.get("checkout") === "success";
    setCheckoutPending(pending);
    async function load() {
      const progress = await fetch("/api/progress/").then((r) => r.json()).catch(() => null);
      setData(progress);
      if (pending) {
        const access = await fetch("/api/billing/access/").then((r) => r.json()).catch(() => null);
        if (access && typeof access.arizonaPro === "boolean" && progress) {
          setData({ ...progress, arizonaPro: access.arizonaPro });
        }
        if (access?.arizonaPro) {
          const latest = pickLatestPaidOrder(Array.isArray(access.orders) ? access.orders : []);
          if (latest?.orderId && !hasRememberedPurchase(latest.orderId, window.localStorage)) {
            rememberPurchase(latest.orderId, window.localStorage);
            trackPurchase({ transactionId: latest.orderId, valueCents: Number(latest.amountCents || 0) });
          }
        }
      }
    }
    load();
  }, []);
  if (!data?.user) {
    return (
      <div className="card">
        <p>Sign in to sync scores, mistakes, and streak across devices.</p>
        <Link className="btn btn-primary" href={paths.login}>
          Sign in
        </Link>
      </div>
    );
  }
  const answered = data.stats.reduce((n, s) => n + s.rightCount + s.wrongCount, 0);
  const right = data.stats.reduce((n, s) => n + s.rightCount, 0);
  const wrong = data.stats.reduce((n, s) => n + s.wrongCount, 0);
  const acc = answered ? Math.round((right / answered) * 100) : 0;
  const byTopic = new Map<string, { r: number; w: number }>();
  data.stats.forEach((s) => {
    const cur = byTopic.get(s.topic) || { r: 0, w: 0 };
    cur.r += s.rightCount;
    cur.w += s.wrongCount;
    byTopic.set(s.topic, cur);
  });
  const ready = readinessScore(data.stats, data.exams);
  const isAzPro = Boolean(data.arizonaPro || data.user.plan === "pro");
  const weakPlan = [...byTopic.entries()]
    .map(([id, v]) => ({ id, acc: v.r + v.w ? Math.round((v.r / (v.r + v.w)) * 100) : 100, missed: v.w }))
    .sort((a, b) => a.acc - b.acc)
    .slice(0, 3);
  return (
    <div className="grid">
      {checkEmail && <p className="notice">Check your inbox for a verification email, then click the link.</p>}
      {checkoutPending && !isAzPro && (
        <p className="notice">Payment received. Your access is being activated.</p>
      )}
      <div className="grid grid-4 stats-mobile">
        <div className="stat"><b>{answered}</b><span>Answers</span></div>
        <div className="stat"><b>{acc}%</b><span>Accuracy</span></div>
        <div className="stat"><b>{data.user.streakDays}</b><span>Day streak</span></div>
        <div className="stat"><b>{isAzPro ? "Pro" : "Free"}</b><span>Plan</span></div>
      </div>
      {isAzPro && (
        <div className="card">
          <ProAccessNote plan="pro" planExpiresAt={data.user.planExpiresAt} />
        </div>
      )}
      <div className="card">
        <h2>Exam readiness {isAzPro ? `${ready}%` : ""}</h2>
        <p>Best score {data.user.bestScore ?? "—"}% · Tests taken {data.exams.length} · Last study {data.user.lastStudyAt?.slice(0, 10) || "—"}</p>
        {!isAzPro && (
          <p>Exam readiness score is included with Pro — know exactly what to study next.</p>
        )}
        {!isAzPro && (
          <Link className="btn btn-primary" href={paths.pricing}>
            Unlock Pro
          </Link>
        )}
      </div>
      {isAzPro && weakPlan.length > 0 && (
        <div className="card">
          <h2>Personalized study plan</h2>
          <p>Focus next on:</p>
          {weakPlan.map((w) => (
            <p key={w.id}>
              {topicLabel(w.id as TopicId)} ({w.acc}% accuracy)
            </p>
          ))}
          <Link className="btn btn-primary" href={`${paths.practice}?mode=weak`}>
            Train weak areas
          </Link>
        </div>
      )}
      <div className="card">
        <h2>Topic accuracy</h2>
        {[...byTopic.entries()].map(([id, v]) => (
          <p key={id}>
            {topicLabel(id as TopicId)}: {v.r + v.w ? Math.round((v.r / (v.r + v.w)) * 100) : 0}% ({v.w} missed)
          </p>
        ))}
      </div>
      <div className="row">
        <Link className="btn btn-primary" href={paths.practice}>Continue Practice</Link>
        <Link className="btn btn-ghost" href={paths.mistakes}>Wrong Answers</Link>
        <Link className="btn btn-ghost" href={paths.study}>Study Guide</Link>
      </div>
    </div>
  );
}
