"use client";

import { MemberCopy } from "@/components/MemberCopy";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { paths } from "@/lib/paths";
import { topicLabel } from "@/lib/quiz-ui";
import type { TopicId } from "@/lib/types";
import { readinessScore } from "@/lib/stats";
import type { ExamRow, QuestionStat, UserRow } from "@/lib/store/types";
import { ProAccessNote, formatProUntil } from "@/components/ProAccessNote";
import { LoadingNote } from "@/components/QuizChrome";
import { useResolvedState, useSavedState } from "@/components/SavedState";
import { WrongAnswersLink } from "@/components/WrongAnswersLink";
import { caPaths } from "@/lib/ca-site";
import { isFreeState } from '@/lib/free-state-catalog';
import { packFor } from "@/lib/client-pack";
import { examState } from "@/lib/ca-daily-shape";
import { hiPaths } from "@/lib/hi-site";
import { isLifetimePurchaseConfirmed, pendingAnalyticsCheckout, recoverPendingPurchase, type AnalyticsPaidOrder } from "@/lib/analytics";
import { LIFETIME_PRO_PRODUCT_CODE } from "@/lib/pro-products";
import { lifetimeReturnTransaction, paddleSuccessUrl } from "@/lib/billing/paddle-public";
import { syncGuestProgress } from "@/lib/ca-sync";
import { clientStatePro } from "@/lib/state-pro";

const ACCESS_POLL_MS = 1000;
const ACCESS_POLL_MAX = 10;

type ProgressPayload = {
  stats: QuestionStat[];
  exams: ExamRow[];
  user: UserRow | null;
  lifetimePro?: boolean;
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
  lifetimePro?: boolean;
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
  if (url.searchParams.get("plan") === "lifetime") {
    url.searchParams.delete("plan");
    url.searchParams.delete("txn");
  }
  const search = url.searchParams.toString();
  window.history.replaceState(null, "", `${url.pathname}${search ? `?${search}` : ""}${url.hash}`);
}

function trackPaidAccess(access: AccessPayload) {
  recoverPendingPurchase(Array.isArray(access.orders) ? access.orders : [], access.lifetimePro === true);
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
  const [checkingLifetime, setCheckingLifetime] = useState(false);
  const [signInReturn, setSignInReturn] = useState<string>(paths.dashboard);
  const [activatedLifetime, setActivatedLifetime] = useState(false);
  const grantedRef = useRef(false);

  const applyProAccess = useCallback((access: AccessPayload) => {
    grantedRef.current = true;
    setActivatedLifetime(access.lifetimePro === true);
    trackPaidAccess(access);
    setData((prev) => {
      if (!prev?.user) {
        return prev ? { ...prev, arizonaPro: true, lifetimePro: access.lifetimePro === true } : prev;
      }
      return {
        ...prev,
        arizonaPro: true,
        lifetimePro: access.lifetimePro === true,
        user: {
          ...prev.user,
          plan: "pro",
          planExpiresAt: access.lifetimePro ? null : (access.planExpiresAt ?? prev.user.planExpiresAt),
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
    const lifetimeCheckout = pending && params.get("plan") === "lifetime";
    setCheckingLifetime(lifetimeCheckout);
    const returnedId = lifetimeCheckout ? lifetimeReturnTransaction(params) : null;
    const pendingLifetime = returnedId ? { transactionId: returnedId }
      : lifetimeCheckout ? pendingAnalyticsCheckout(LIFETIME_PRO_PRODUCT_CODE) : null;
    if (pending) {
      const returnUrl = new URL(paddleSuccessUrl(window.location.origin, lifetimeCheckout, returnedId ?? undefined));
      setSignInReturn(returnUrl.pathname + returnUrl.search);
    }

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
        const confirmed = lifetimeCheckout
          ? Boolean(access && isLifetimePurchaseConfirmed(pendingLifetime, access.orders ?? [], access.lifetimePro === true))
          : Boolean(access && proForState(access, state ?? "AZ"));
        if (access && confirmed) {
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
  const lifetimePro = data?.lifetimePro === true || activatedLifetime;
  const isAzPro = Boolean(lifetimePro || proForState(data, state ?? "AZ") || (state === "AZ" && data?.user?.plan === "pro") || checkoutPhase === "activated");

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
        <p>Please sign in again to check your Pro access.</p>
        <Link className="btn btn-primary" href={`${paths.login}?next=${encodeURIComponent(signInReturn)}`}>
          Sign in
        </Link>
      </div>
    );
  }

  if (activating && !data?.user) {
    return <CheckoutStatus phase={checkoutPhase} lifetime={checkingLifetime} onRefresh={retryAccess} />;
  }

  if (checkoutPhase === "activated" && !data?.user) {
    return (
      <div className="card">
        <p className="notice">{activatedLifetime ? "Lifetime Pro is now active." : "Pro activated successfully."}</p>
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
  const showAsPro = lifetimePro || ((state === "AZ" || state === "NY" || state === "NC" || state === "CT" || fullState) && isAzPro);
  const hideFreePlan = activating && !showAsPro;
  const weakPlan = [...byTopic.entries()]
    .map(([id, v]) => ({ id, acc: v.r + v.w ? Math.round((v.r / (v.r + v.w)) * 100) : 100, missed: v.w }))
    .sort((a, b) => a.acc - b.acc)
    .slice(0, 3);
  const planLabel = lifetimePro ? "Lifetime Pro" : isAzPro ? "Pro" : hideFreePlan ? "…" : "Free";
  const bestScore = exams.length ? Math.max(...exams.map((row) => row.score)) : null;
  const lastStudy = [...stats.map((row) => row.lastAt), ...exams.map((row) => row.at)].filter(Boolean).sort().at(-1) || null;

  return (
    <div className="grid">
      {syncMessage && <p className="notice" role="status">{syncMessage} <button type="button" className="link-button" onClick={() => { setLoaded(false); setAccessRetry(n => n + 1); }}>Retry sync</button></p>}
      {checkEmail && <p className="notice">Check your inbox for a verification email, then click the link.</p>}
      {checkoutPhase === "activated" && <p className="notice" role="status">{activatedLifetime ? "Lifetime Pro is now active." : "Pro activated successfully."}</p>}
      {activating && <CheckoutStatus phase={checkoutPhase} lifetime={checkingLifetime} onRefresh={retryAccess} />}
      <div className="grid grid-4 stats-mobile">
        <div className="stat"><b>{answered}</b><span>Answers</span></div>
        <div className="stat"><b>{acc}%</b><span>Accuracy</span></div>
        <div className="stat"><b>{user.streakDays}</b><span>{state === "IN" || fullState ? "Account streak" : "Day streak"}</span></div>
        <div className="stat"><b>{planLabel}</b><span>Plan</span></div>
      </div>
      {!lifetimePro && state === "IN" && data?.indianaPro && data.indianaProExpiresAt ? <p className="notice">All-state Pro · Active until {new Date(data.indianaProExpiresAt).toLocaleDateString("en-US")}</p> : null}
      {showAsPro && (
        <div className="card">
          {state === "NC" && !lifetimePro ? <p>North Carolina Pro{data?.ncPlanExpiresAt ? ` · Active until ${formatProUntil(data.ncPlanExpiresAt)}` : ""}</p> : <ProAccessNote plan="pro" lifetimePro={lifetimePro} planExpiresAt={user.planExpiresAt} purchaseEnabled={packFor(state)?.purchaseEnabled !== false} />}
        </div>
      )}
      <div className="card">
        <h2>{state === "IN" ? "Indiana practice history" : `${fullState ? "Practice readiness" : "Exam readiness"} ${showAsPro ? `${ready}%` : ""}`}</h2>
        <p>Best score {bestScore ?? "—"}% · Tests taken {exams.length} · Last study {lastStudy?.slice(0, 10) || "—"}</p>
        {state === "AZ" && !showAsPro && !hideFreePlan && (
          <p><MemberCopy member={<>Starter practice uses the starter question pool. Pro adds the rest of the bank, the full study-card deck, more full exams, and the exam readiness score.</>}>Free practice uses the free question pool. Pro adds the rest of the bank, the full study-card deck, more full exams, and the exam readiness score.</MemberCopy></p>
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

function CheckoutStatus({ phase, lifetime, onRefresh }: { phase: CheckoutPhase; lifetime: boolean; onRefresh: () => void }) {
  const timedOut = phase === "timeout";
  return (
    <div className="card">
      <p role="status">{timedOut ? "We're still waiting for confirmation from Paddle." : `Checking your ${lifetime ? "Lifetime Pro" : "Pro"} purchase…`}</p>
      {timedOut && <>
        <p>If Paddle sent a receipt, keep it and check your access again. <Link href={paths.contact}>Contact support</Link> if you need help.</p>
        <button className="btn btn-primary" type="button" onClick={onRefresh}>
          Refresh access
        </button>
      </>}
    </div>
  );
}
