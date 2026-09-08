"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { paths } from "@/lib/paths";
import { topicLabel } from "@/lib/quiz";
import type { TopicId } from "@/lib/types";
import { readinessScore } from "@/lib/stats";
import type { ExamRow, QuestionStat, UserRow } from "@/lib/store/types";
import { ProAccessNote } from "@/components/ProAccessNote";
import { hasRememberedPurchase, pickLatestPaidOrder, rememberPurchase, trackPurchase } from "@/lib/analytics";

const ACCESS_POLL_MS = 1000;
const ACCESS_POLL_MAX = 10;

type ProgressPayload = {
  stats: QuestionStat[];
  exams: ExamRow[];
  user: UserRow | null;
  arizonaPro?: boolean;
};

type CheckoutPhase = "boot" | "off" | "activating" | "activated" | "timeout" | "session";

type AccessPayload = {
  arizonaPro?: boolean;
  planExpiresAt?: string | null;
  orders?: { orderId?: string; status?: string; amountCents?: number; paidAt?: string }[];
};

function clearCheckoutQuery() {
  const url = new URL(window.location.href);
  if (url.searchParams.get("checkout") !== "success") return;
  url.searchParams.delete("checkout");
  const search = url.searchParams.toString();
  window.history.replaceState(null, "", `${url.pathname}${search ? `?${search}` : ""}${url.hash}`);
}

function trackPaidAccess(access: AccessPayload) {
  const latest = pickLatestPaidOrder(Array.isArray(access.orders) ? access.orders : []);
  if (latest?.orderId && !hasRememberedPurchase(latest.orderId, window.localStorage)) {
    rememberPurchase(latest.orderId, window.localStorage);
    trackPurchase({ transactionId: latest.orderId, valueCents: Number(latest.amountCents || 0) });
  }
}

async function readAccess(res: Response): Promise<AccessPayload | null> {
  return res.json().catch(() => null);
}

export function DashboardClient() {
  const [data, setData] = useState<ProgressPayload | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);
  const [checkoutPhase, setCheckoutPhase] = useState<CheckoutPhase>("boot");
  const [accessRetry, setAccessRetry] = useState(0);
  const grantedRef = useRef(false);

  const applyProAccess = useCallback((access: AccessPayload) => {
    grantedRef.current = true;
    trackPaidAccess(access);
    setData((prev) => {
      if (!prev?.user) {
        return prev ? { ...prev, arizonaPro: true } : prev;
      }
      return {
        ...prev,
        arizonaPro: true,
        user: {
          ...prev.user,
          plan: "pro",
          planExpiresAt: access.planExpiresAt ?? prev.user.planExpiresAt,
        },
      };
    });
    setCheckoutPhase("activated");
    clearCheckoutQuery();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCheckEmail(params.get("checkEmail") === "1");
    const pending = params.get("checkout") === "success";

    let cancelled = false;

    async function loadProgress() {
      const progress = await fetch("/api/progress/").then((r) => r.json()).catch(() => null);
      if (cancelled || !progress || typeof progress !== "object") return;
      if (progress.user) {
        setData((prev) => ({
          ...(progress as ProgressPayload),
          arizonaPro: Boolean(
            grantedRef.current || prev?.arizonaPro || (progress as ProgressPayload).arizonaPro
          ),
        }));
      }
    }

    async function pollAccess() {
      for (let attempt = 0; attempt < ACCESS_POLL_MAX; attempt += 1) {
        if (cancelled) return;
        const res = await fetch("/api/billing/access/").catch(() => null);
        if (cancelled) return;
        if (!res) {
          if (attempt < ACCESS_POLL_MAX - 1) {
            await new Promise((resolve) => window.setTimeout(resolve, ACCESS_POLL_MS));
          }
          continue;
        }
        if (res.status === 401) {
          setCheckoutPhase("session");
          return;
        }
        const access = await readAccess(res);
        if (cancelled) return;
        if (access?.arizonaPro === true) {
          applyProAccess(access);
          return;
        }
        if (attempt < ACCESS_POLL_MAX - 1) {
          await new Promise((resolve) => window.setTimeout(resolve, ACCESS_POLL_MS));
        }
      }
      if (!cancelled) setCheckoutPhase("timeout");
    }

    loadProgress();
    if (!pending) {
      setCheckoutPhase("off");
      return () => {
        cancelled = true;
      };
    }

    setCheckoutPhase("activating");
    void pollAccess();
    return () => {
      cancelled = true;
    };
  }, [accessRetry, applyProAccess]);

  const retryAccess = () => {
    setCheckoutPhase("activating");
    setAccessRetry((n) => n + 1);
  };
  const activating = checkoutPhase === "activating" || checkoutPhase === "timeout";
  const isAzPro = Boolean(data?.arizonaPro || data?.user?.plan === "pro" || checkoutPhase === "activated");

  if (checkoutPhase === "boot") {
    return (
      <div className="card">
        <p className="notice">Loading your dashboard…</p>
      </div>
    );
  }

  if (checkoutPhase === "session") {
    return (
      <div className="card">
        <p>Your session needs to be refreshed.</p>
        <p>Please sign in again to view your activated Pro access.</p>
        <Link className="btn btn-primary" href={paths.login}>
          Sign in
        </Link>
      </div>
    );
  }

  if (activating && !data?.user) {
    return <CheckoutStatus phase={checkoutPhase} onRefresh={retryAccess} />;
  }

  if (checkoutPhase === "activated" && !data?.user) {
    return (
      <div className="card">
        <p className="notice">Pro activated successfully.</p>
      </div>
    );
  }

  if (!activating && !data?.user) {
    return (
      <div className="card">
        <p>Sign in to sync scores, mistakes, and streak across devices.</p>
        <Link className="btn btn-primary" href={paths.login}>
          Sign in
        </Link>
      </div>
    );
  }

  const user = data!.user!;
  const stats = data!.stats || [];
  const exams = data!.exams || [];
  const answered = stats.reduce((n, s) => n + s.rightCount + s.wrongCount, 0);
  const right = stats.reduce((n, s) => n + s.rightCount, 0);
  const acc = answered ? Math.round((right / answered) * 100) : 0;
  const byTopic = new Map<string, { r: number; w: number }>();
  stats.forEach((s) => {
    const cur = byTopic.get(s.topic) || { r: 0, w: 0 };
    cur.r += s.rightCount;
    cur.w += s.wrongCount;
    byTopic.set(s.topic, cur);
  });
  const ready = readinessScore(stats, exams);
  const showAsPro = isAzPro;
  const hideFreePlan = activating && !showAsPro;
  const weakPlan = [...byTopic.entries()]
    .map(([id, v]) => ({ id, acc: v.r + v.w ? Math.round((v.r / (v.r + v.w)) * 100) : 100, missed: v.w }))
    .sort((a, b) => a.acc - b.acc)
    .slice(0, 3);
  const planLabel = showAsPro ? "Pro" : hideFreePlan ? "…" : "Free";

  return (
    <div className="grid">
      {checkEmail && <p className="notice">Check your inbox for a verification email, then click the link.</p>}
      {checkoutPhase === "activated" && <p className="notice">Pro activated successfully.</p>}
      {activating && <CheckoutStatus phase={checkoutPhase} onRefresh={retryAccess} />}
      <div className="grid grid-4 stats-mobile">
        <div className="stat"><b>{answered}</b><span>Answers</span></div>
        <div className="stat"><b>{acc}%</b><span>Accuracy</span></div>
        <div className="stat"><b>{user.streakDays}</b><span>Day streak</span></div>
        <div className="stat"><b>{planLabel}</b><span>Plan</span></div>
      </div>
      {showAsPro && (
        <div className="card">
          <ProAccessNote plan="pro" planExpiresAt={user.planExpiresAt} />
        </div>
      )}
      <div className="card">
        <h2>Exam readiness {showAsPro ? `${ready}%` : ""}</h2>
        <p>Best score {user.bestScore ?? "—"}% · Tests taken {exams.length} · Last study {user.lastStudyAt?.slice(0, 10) || "—"}</p>
        {!showAsPro && !hideFreePlan && (
          <p>Exam readiness score is included with Pro — know exactly what to study next.</p>
        )}
        {!showAsPro && !hideFreePlan && (
          <Link className="btn btn-primary" href={paths.pricing}>
            Unlock Pro
          </Link>
        )}
      </div>
      {showAsPro && weakPlan.length > 0 && (
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

function CheckoutStatus({ phase, onRefresh }: { phase: CheckoutPhase; onRefresh: () => void }) {
  if (phase === "timeout") {
    return (
      <div className="card">
        <p>Payment received, but activation is taking longer than expected.</p>
        <p>Please refresh this page in a moment.</p>
        <button className="btn btn-primary" type="button" onClick={onRefresh}>
          Refresh access
        </button>
      </div>
    );
  }
  return (
    <div className="card">
      <p>Payment received.</p>
      <p>Activating your Pro access…</p>
      <p className="notice">This usually takes just a few seconds.</p>
    </div>
  );
}
