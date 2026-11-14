"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { paths } from "@/lib/paths";
import { topicLabel } from "@/lib/quiz";
import type { TopicId } from "@/lib/types";
import { readinessScore } from "@/lib/stats";
import type { ExamRow, QuestionStat, UserRow } from "@/lib/store/types";
import { ProAccessNote, formatProUntil } from "@/components/ProAccessNote";
import { LoadingNote } from "@/components/QuizChrome";
import { useResolvedState, useSavedState } from "@/components/SavedState";
import { WrongAnswersLink } from "@/components/WrongAnswersLink";
import { caPaths } from "@/lib/ca-site";
import { isFreeState } from '@/lib/free-state-catalog';
import { packFor } from "@/lib/prep-pack";
import { examState } from "@/lib/ca-daily-shape";
import { hiPaths } from "@/lib/hi-site";
import { recoverPendingPurchase, type AnalyticsPaidOrder } from "@/lib/analytics";
import { syncGuestProgress } from "@/lib/ca-sync";
import { clientStatePro } from "@/lib/state-pro";

const ACCESS_POLL_MS = 1000;
const ACCESS_POLL_MAX = 10;

type ProgressPayload = {
  stats: QuestionStat[];
  exams: ExamRow[];
  user: UserRow | null;
  arizonaPro?: boolean;
  californiaPro?: boolean;
  hawaiiPro?: boolean;
  ncPro?: boolean;
  connecticutPro?: boolean;
  connecticutProExpiresAt?: string | null;
  ncPlanExpiresAt?: string | null;
  indianaPro?: boolean;
  indianaProExpiresAt?: string | null;
};

type CheckoutPhase = "boot" | "off" | "activating" | "activated" | "timeout" | "session";

type AccessPayload = {
  ncPro?: boolean;
  connecticutPro?: boolean;
  connecticutProExpiresAt?: string | null;
  arizonaPro?: boolean;
  californiaPro?: boolean;
  hawaiiPro?: boolean;
  indianaPro?: boolean;
  indianaProExpiresAt?: string | null;
  planExpiresAt?: string | null;
  californiaPlanExpiresAt?: string | null;
  hawaiiPlanExpiresAt?: string | null;
  orders?: AnalyticsPaidOrder[];
};

function proForState(row: { arizonaPro?: boolean; californiaPro?: boolean; hawaiiPro?: boolean; ncPro?: boolean; connecticutPro?: boolean; indianaPro?: boolean } | null | undefined, state: string) {
  return clientStatePro(row, state);
}

function clearCheckoutQuery() {
  const url = new URL(window.location.href);
  if (url.searchParams.get("checkout") !== "success") return;
  url.searchParams.delete("checkout");
  const search = url.searchParams.toString();
  window.history.replaceState(null, "", `${url.pathname}${search ? `?${search}` : ""}${url.hash}`);
}

function trackPaidAccess(access: AccessPayload) {
  recoverPendingPurchase(Array.isArray(access.orders) ? access.orders : []);
}

async function readAccess(res: Response): Promise<AccessPayload | null> {
  return res.json().catch(() => null);
}

export function DashboardClient() {
  const state = useResolvedState(useSavedState());
  const site = packFor(state)?.paths || (state === "HI" ? hiPaths : state === "CA" ? caPaths : paths);
  const [data, setData] = useState<ProgressPayload | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
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
      try {
        const imports = await syncGuestProgress();
        if (cancelled) return;
        setSyncMessage(imports.find(result => result.pending)?.message || "");
        const response = await fetch("/api/progress/");
        const progress = await response.json().catch(() => null);
        if (cancelled) return;
        if (!response.ok || !progress || typeof progress !== "object") throw new Error("progress");
        if (progress.user) {
          setData((prev) => ({
            ...(progress as ProgressPayload),
            arizonaPro: Boolean(
              grantedRef.current || prev?.arizonaPro || (progress as ProgressPayload).arizonaPro
            ),
          }));
        }
        setFailed(false);
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoaded(true);
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
        if (access && proForState(access, state ?? "AZ")) {
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
  }, [accessRetry, applyProAccess, state]);

  const retryAccess = () => {
    setCheckoutPhase("activating");
    setAccessRetry((n) => n + 1);
  };
  const activating = checkoutPhase === "activating" || checkoutPhase === "timeout";
  const isAzPro = Boolean(proForState(data, state ?? "AZ") || (state === "AZ" && data?.user?.plan === "pro") || checkoutPhase === "activated");

  useEffect(() => {
    if (!loaded || !data?.user || !isAzPro || !isFreeState(state) || packFor(state)?.freeLaunch) return;
    void fetch('/api/billing/pro-usage/', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featureCode: 'advanced_analytics', state }) }).catch(() => undefined);
  }, [loaded, data?.user?.id, isAzPro, state]);

  if (!loaded || checkoutPhase === "boot") {
    return (
      <div className="loading-stage">
        <LoadingNote text="Loading your dashboard…" />
      </div>
    );
  }

  if (failed && !data?.user) {
    return (
      <div className="card">
        <p className="form-error" role="alert">Could not load this dashboard.</p>
        <button className="btn btn-primary" type="button" onClick={() => { setLoaded(false); setFailed(false); setAccessRetry((n) => n + 1); }}>Retry</button>
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
  const stats = (data!.stats || []).filter((row) => (row.state || "AZ") === state);
  const exams = (data!.exams || []).filter((row) => examState(row.mode) === (state || "AZ"));
  const answered = stats.reduce((n, s) => n + s.rightCount + s.wrongCount, 0);
  const right = stats.reduce((n, s) => n + s.rightCount, 0);
  const acc = answered ? Math.round((right / answered) * 100) : 0;
  const fullState = isFreeState(state) && !packFor(state)?.freeLaunch;
  const byTopic = new Map<string, { r: number; w: number }>();
  stats.forEach((s) => {
    const key = state === "IN" || fullState ? s.chapter || s.topic : s.topic;
    const cur = byTopic.get(key) || { r: 0, w: 0 };
    cur.r += s.rightCount;
    cur.w += s.wrongCount;
    byTopic.set(key, cur);
  });
  const ready = readinessScore(stats, exams);
  const showAsPro = (state === "AZ" || state === "NY" || state === "NC" || state === "CT" || fullState) && isAzPro;
  const hideFreePlan = activating && !showAsPro;
  const weakPlan = [...byTopic.entries()]
    .map(([id, v]) => ({ id, acc: v.r + v.w ? Math.round((v.r / (v.r + v.w)) * 100) : 100, missed: v.w }))
    .sort((a, b) => a.acc - b.acc)
    .slice(0, 3);
  const planLabel = isAzPro ? "Pro" : hideFreePlan ? "…" : "Free";
  const bestScore = exams.length ? Math.max(...exams.map((row) => row.score)) : null;
  const lastStudy = [...stats.map((row) => row.lastAt), ...exams.map((row) => row.at)].filter(Boolean).sort().at(-1) || null;

  return (
    <div className="grid">
      {syncMessage && <p className="notice" role="status">{syncMessage} <button type="button" className="link-button" onClick={() => { setLoaded(false); setAccessRetry(n => n + 1); }}>Retry sync</button></p>}
      {checkEmail && <p className="notice">Check your inbox for a verification email, then click the link.</p>}
      {checkoutPhase === "activated" && <p className="notice">Pro activated successfully.</p>}
      {activating && <CheckoutStatus phase={checkoutPhase} onRefresh={retryAccess} />}
      <div className="grid grid-4 stats-mobile">
        <div className="stat"><b>{answered}</b><span>Answers</span></div>
        <div className="stat"><b>{acc}%</b><span>Accuracy</span></div>
        <div className="stat"><b>{user.streakDays}</b><span>{state === "IN" || fullState ? "Account streak" : "Day streak"}</span></div>
        <div className="stat"><b>{planLabel}</b><span>Plan</span></div>
      </div>
      {state === "IN" && data?.indianaPro && data.indianaProExpiresAt ? <p className="notice">All-state Pro · Active until {new Date(data.indianaProExpiresAt).toLocaleDateString("en-US")}</p> : null}
      {showAsPro && (
        <div className="card">
          {state === "NC" ? <p>North Carolina Pro{data?.ncPlanExpiresAt ? ` · Active until ${formatProUntil(data.ncPlanExpiresAt)}` : ""}</p> : <ProAccessNote plan="pro" planExpiresAt={user.planExpiresAt} />}
        </div>
      )}
      <div className="card">
        <h2>{state === "IN" ? "Indiana practice history" : `${fullState ? "Practice readiness" : "Exam readiness"} ${showAsPro ? `${ready}%` : ""}`}</h2>
        <p>Best score {bestScore ?? "—"}% · Tests taken {exams.length} · Last study {lastStudy?.slice(0, 10) || "—"}</p>
        {state === "AZ" && !showAsPro && !hideFreePlan && (
          <p>Free practice uses the free question pool. Pro adds the rest of the bank, the full study-card deck, more full exams, and the exam readiness score.</p>
        )}
        {state === "AZ" && !showAsPro && !hideFreePlan && (
          <Link className="btn btn-primary" href={paths.pricing}>
            View Pro
          </Link>
        )}
      </div>
      {showAsPro && weakPlan.length > 0 && (
        <div className="card">
          <h2>Personalized study plan</h2>
          <p>Focus next on:</p>
          {weakPlan.map((w) => (
            <p key={w.id}>
              {packFor(state)?.topics.find(topic => topic.id === w.id)?.label || topicLabel(w.id as TopicId)} ({w.acc}% accuracy)
            </p>
          ))}
          <Link className="btn btn-primary" href={`${site.practice}?mode=weak`}>
            Train weak areas
          </Link>
        </div>
      )}
      <div className="card">
        <h2>Topic accuracy</h2>
        {[...byTopic.entries()].map(([id, v]) => (
          <p key={id}>
            {packFor(state)?.topics.find(topic => topic.id === id)?.label || topicLabel(id as TopicId)}: {v.r + v.w ? Math.round((v.r / (v.r + v.w)) * 100) : 0}% ({v.w} missed)
          </p>
        ))}
      </div>
      <div className="row">
        <Link className="btn btn-primary" href={state ? site.practice : "/"}>Continue Practice</Link>
        <WrongAnswersLink className="btn btn-ghost" href={state ? site.mistakes : "/"} stateCode={state || "AZ"} />
        <Link className="btn btn-ghost" href={state ? site.study : "/"}>Study Guide</Link>
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
