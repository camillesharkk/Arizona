"use client";

import { MemberCopy } from "@/components/MemberCopy";
import type { StateCode } from "@/lib/types";
import { isFreeState } from '@/lib/free-state-catalog';
import { prepNavigation } from '@/lib/prep-navigation';

import { fetchAccount } from "@/lib/client-account";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { EnglishForm } from "@/components/EnglishForm";
import { paths } from "@/lib/paths";
import {
  CREDIT_RESTORE_NOTICE,
  ONE_TIME_DISCOUNT_NOTICE,
  REFUND_POLICY_SUMMARY,
} from "@/lib/pricing/copy";
import { STANDARD_PRICE_CENTS } from "@/lib/pricing/catalog";
import { EXAM_GUARANTEE_CENTS, LIFETIME_ACCESS_CENTS, LIFETIME_TOTAL_CENTS } from "@/lib/pricing/lifetime";
import { LIFETIME_PRO_PRODUCT_CODE } from "@/lib/pro-products";
import { formatUsd } from "@/lib/pricing/money";
import { pauseClarityRecording, pendingAnalyticsCheckout, PRO_ITEM_ID, rememberPendingCheckout, trackAnalyticsEvent, trackBeginCheckout, type CheckoutProductCode } from "@/lib/analytics";
import { paddleCheckoutFallback, paddleSuccessUrl } from "@/lib/billing/paddle-public";

type Breakdown = {
  listPriceCents: number;
  standardPriceCents: number;
  newcomerEligible: boolean;
  newcomerExpiresAt: string | null;
  newcomerApplied: boolean;
  newcomerDiscountCents: number;
  referralEligible: boolean;
  referralApplied: boolean;
  referralCreditAvailable: number;
  maxApplicableCredits: number;
  creditsAppliedCount: number;
  creditApplied: boolean;
  creditCents: number;
  subtotalBeforeCreditCents: number;
  finalPriceCents: number;
  display: {
    standard: string;
    newcomer: string | null;
    subtotal: string;
    credit: string | null;
    final: string;
  };
};

type Preview = {
  productCode?: string;
  newcomerOffer: { eligible: boolean; expiresAt: string | null; redeemed: boolean };
  referralDiscount: { eligible: boolean; status: string | null };
  referralCredits: { available: number; maxApplicable: number };
  breakdown: Breakdown;
};

const DISMISS_KEY = "az-newcomer-reminder-dismissed";

function formatRemaining(ms: number) {
  if (ms <= 0) return "expired";
  const total = Math.floor(ms / 1000);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const clock = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return d > 0 ? `${d}d ${clock}` : clock;
}

export function CheckoutButton({ belowCta, ctaLabel, productCode = PRO_ITEM_ID, sourceState, checkoutAvailable = true, lifetimePage = false }: {
  belowCta?: ReactNode;
  ctaLabel?: string;
  productCode?: CheckoutProductCode;
  sourceState?: StateCode;
  checkoutAvailable?: boolean;
  lifetimePage?: boolean;
}) {
  const lifetime = productCode === LIFETIME_PRO_PRODUCT_CODE;
  const timedReturnPath = isFreeState(sourceState) ? prepNavigation[sourceState].paths.pricing : null;
  const returnPath = lifetime ? `${lifetimePage ? "/lifetime/" : paths.pricing}#lifetime-checkout` : timedReturnPath;
  const termsHref = lifetime && !lifetimePage ? "#lifetime-refund-policy" : "#refund-policy";
  const registerHref = returnPath ? `${paths.register}?next=${encodeURIComponent(returnPath)}` : paths.register;
  const loginHref = returnPath ? `${paths.login}?next=${encodeURIComponent(returnPath)}` : paths.login;
  const [preview, setPreview] = useState<Preview | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [ownsLifetime, setOwnsLifetime] = useState(false);
  const [hasPendingLifetime, setHasPendingLifetime] = useState(false);
  const [checkoutClosed, setCheckoutClosed] = useState(false);
  const [applyCredit, setApplyCredit] = useState(false);
  const [policy, setPolicy] = useState(false);
  const [err, setErr] = useState("");
  const [checkoutNote, setCheckoutNote] = useState("");
  const [priceChanged, setPriceChanged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [dismissed, setDismissed] = useState(false);
  const [hideModal, setHideModal] = useState(false);
  const submitting = useRef(false);
  const stopLifetimeWatch = useRef<() => void>(() => undefined);
  const policyId = useId();
  useEffect(() => () => stopLifetimeWatch.current(), []);

  const load = useCallback(async (credit: boolean) => {
    const me = await fetchAccount().then((r) => {
      if (!r.ok) throw new Error("Account unavailable");
      return r.json();
    });
    if (!me.user) {
      setSignedIn(false);
      setPreview(null);
      setOwnsLifetime(false);
      return;
    }
    setSignedIn(true);
    const owned = me.user.lifetimePro === true || me.lifetimePro === true;
    setOwnsLifetime(owned);
    if (owned || (lifetime && !checkoutAvailable)) return;
    const res = await fetch(`/api/pricing/preview/?applyCredit=${credit ? "1" : "0"}&productCode=${productCode}`, { cache: "no-store" });
    const data: Preview & { error?: string } = await res.json();
    if (lifetime && data.error === "LIFETIME_PRODUCT_UNAVAILABLE") {
      setCheckoutClosed(true);
      return;
    }
    if (!res.ok || !data.breakdown || (lifetime && (data.productCode !== productCode || data.breakdown.finalPriceCents !== LIFETIME_TOTAL_CENTS))) {
      throw new Error("Price unavailable");
    }
    setPreview(data);
  }, [checkoutAvailable, lifetime, productCode]);

  useEffect(() => {
    if (lifetime) {
      setHasPendingLifetime(Boolean(pendingAnalyticsCheckout(LIFETIME_PRO_PRODUCT_CODE)));
      return;
    }
    try { setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1"); } catch { /* optional display preference */ }
  }, [lifetime]);

  useEffect(() => {
    void load(applyCredit).catch(() => setErr("Checkout information couldn't be loaded. Please try again."));
  }, [applyCredit, load]);

  useEffect(() => {
    if (lifetime) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [lifetime]);

  const remainingMs = useMemo(() => {
    const exp = preview?.breakdown.newcomerExpiresAt;
    if (!exp || !preview?.breakdown.newcomerEligible) return 0;
    return new Date(exp).getTime() - now;
  }, [preview, now]);

  useEffect(() => {
    if (preview?.breakdown.newcomerEligible && remainingMs <= 0) {
      void load(applyCredit).catch(() => undefined);
    }
  }, [remainingMs, preview, applyCredit, load]);

  async function openPaddleOverlay(transactionId: string) {
    const {
      PADDLE_OVERLAY_SETTINGS,
      loadBrowserPaddle,
      paddleBrowserConfig,
      watchPaddleCheckout,
    } = await import("@/lib/billing/paddle-browser");
    const cfg = paddleBrowserConfig();
    if (!cfg.ok) return { ok: false as const, error: "PADDLE_CLIENT_UNAVAILABLE" };
    pauseClarityRecording();
    const paddle = await loadBrowserPaddle();
    if (!paddle) return { ok: false as const, error: "PADDLE_CLIENT_UNAVAILABLE" };
    if (lifetime) {
      stopLifetimeWatch.current();
      setCheckoutNote("");
      stopLifetimeWatch.current = watchPaddleCheckout((event) => {
        if (event.transactionId && event.transactionId !== transactionId) return;
        if (event.name === "checkout.completed") {
          setCheckoutNote("Payment submitted. Waiting for confirmation.");
          stopLifetimeWatch.current();
        } else if (event.name === "checkout.closed") {
          setCheckoutNote("Checkout closed. You can continue the same checkout.");
          stopLifetimeWatch.current();
        } else if (event.name === "checkout.error" || event.name === "checkout.failed") {
          setCheckoutNote("Checkout reported a payment error. You can retry the same checkout.");
        }
      });
    }
    return await new Promise<{ ok: true } | { ok: false; error: string }>((resolve) => {
      let settled = false;
      let timer: number | undefined;
      const finish = (result: { ok: true } | { ok: false; error: string }) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        stop();
        resolve(result);
      };
      const stop = watchPaddleCheckout((event) => {
        if (event.transactionId && event.transactionId !== transactionId) return;
        if (event.name === "checkout.loaded") finish({ ok: true });
        else if (event.name === "checkout.error" || event.name === "checkout.failed") {
          finish({ ok: false, error: "CHECKOUT_OPEN_FAILED" });
        }
      });
      timer = window.setTimeout(() => finish({ ok: false, error: "CHECKOUT_OPEN_FAILED" }), 8000);
      try {
        paddle.Checkout.open({
          transactionId,
          settings: {
            ...PADDLE_OVERLAY_SETTINGS,
            successUrl: paddleSuccessUrl(window.location.origin, lifetime, transactionId),
          },
        });
      } catch {
        finish({ ok: false, error: "CHECKOUT_OPEN_FAILED" });
      }
    });
  }

  async function finishPaddle(
    data: { transactionId?: string; checkoutUrl?: string | null; url?: string; error?: string; productCode?: string; finalPriceCents?: number; paymentPending?: boolean },
    breakdown: { finalPriceCents?: number; newcomerApplied?: boolean; referralApplied?: boolean; creditApplied?: boolean } | null
  ) {
    if (data.error === "lifetime_already_owned") {
      await load(false);
      return;
    }
    if (data.error === "LIFETIME_PRODUCT_UNAVAILABLE") {
      setCheckoutClosed(true);
      return;
    }
    if (data.error === "PRICE_CHANGED") {
      setPriceChanged(true);
      await load(applyCredit);
      return;
    }
    if (data.transactionId) {
      if (lifetime && (data.productCode !== productCode || data.finalPriceCents !== LIFETIME_TOTAL_CENTS || !/^txn_[a-z0-9]+$/i.test(data.transactionId))) throw new Error("Checkout mismatch");
      if (lifetime && data.paymentPending) {
        rememberPendingCheckout(data.transactionId, productCode);
        window.location.assign(paddleSuccessUrl(window.location.origin, true, data.transactionId));
        return;
      }
      trackBeginCheckout(breakdown, data.transactionId, productCode);
      if (lifetime) setHasPendingLifetime(true);
      const fallback = paddleCheckoutFallback(data.checkoutUrl, data.transactionId, window.location.host, lifetime);
      if (!lifetime && fallback) {
        window.location.assign(fallback);
        return;
      }
      const overlay = await openPaddleOverlay(data.transactionId).catch(() => ({ ok: false as const }));
      if (overlay.ok) return;
      if (lifetime) {
        stopLifetimeWatch.current();
        if (fallback) {
          window.location.assign(fallback);
          return;
        }
      }
      setErr("Checkout couldn't be opened. Please try again.");
      return;
    }
    if (lifetime || !data.url) {
      setErr(
        data.error === "checkout_in_progress"
          ? "Checkout is already starting. Please try again to continue."
          : "Checkout couldn't be started. Please try again."
      );
      return;
    }
    trackBeginCheckout(breakdown, undefined, productCode);
    window.location.href = data.url;
  }

  async function go(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!policy || submitting.current || signedIn !== true || ownsLifetime || !checkoutAvailable || checkoutClosed || (lifetime && !preview)) return;
    submitting.current = true;
    trackAnalyticsEvent("checkout_click", { product_code: productCode, plan: "free", entry_point: "pricing" });
    setBusy(true);
    setErr("");
    setPriceChanged(false);
    try {
      const quoteRes = await fetch("/api/pricing/quote/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productCode, applyCredit: !lifetime && applyCredit, policyAccepted: true }),
      });
      const quote = await quoteRes.json();
      if (!quoteRes.ok) {
        if (quoteRes.status === 401) setSignedIn(false);
        else await finishPaddle(quote, null);
        return;
      }
      if (lifetime && quote.breakdown?.finalPriceCents !== LIFETIME_TOTAL_CENTS) throw new Error("Checkout price mismatch");
      const createCheckout = () => fetch("/api/billing/checkout/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId: quote.quoteId, sourceState }),
      });
      let res = await createCheckout();
      let data = await res.json();
      if (res.status === 409 && data.error === "promotion_checkout_in_progress") {
        setErr("A checkout with this one-time discount is already open. Continue the existing checkout or contact support.");
        return;
      }
      if (res.status === 409 && data.error === "checkout_in_progress") {
        res = await createCheckout();
        data = await res.json();
      }
      if (res.status === 401) setSignedIn(false);
      else await finishPaddle(data, quote.breakdown);
    } catch {
      setErr("Checkout couldn't be started. Please try again.");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  const b = lifetime ? undefined : preview?.breakdown;
  const guestPrice = formatUsd(lifetime ? LIFETIME_TOTAL_CENTS : STANDARD_PRICE_CENTS);
  const ctaPrice = b ? b.display.final : guestPrice;
  const isGuest = signedIn === false;
  const unavailable = lifetime && (!checkoutAvailable || checkoutClosed);
  const checkoutLabel = lifetime ? `${hasPendingLifetime ? "Continue Checkout" : "Get Lifetime Pro"} — ${ctaPrice}` : `Get 60-Day Pro — ${ctaPrice}`;
  const showCheckoutForm = !isGuest && !unavailable && !ownsLifetime;
  const savingsCents = b ? b.listPriceCents - b.finalPriceCents : 0;
  const showSave = !isGuest && Boolean(b) && savingsCents > 0;
  const showNewcomerPromo = Boolean(signedIn && b?.newcomerApplied && !dismissed);
  const showCountdown = Boolean(signedIn && b?.newcomerEligible && remainingMs > 0 && !dismissed);
  const showDismiss = Boolean(signedIn && preview?.newcomerOffer.eligible && !dismissed);

  return (
    <div className="pricing-buy clarity-mask">
      {!lifetime && signedIn && (preview?.referralCredits.available || 0) > 0 && (preview?.referralCredits.maxApplicable || 0) > 0 && (
        <label className="notice credit-apply">
          <input type="checkbox" checked={applyCredit} onChange={(e) => setApplyCredit(e.target.checked)} />{" "}
          You have {preview?.referralCredits.available} Referral Credit
          {(preview?.referralCredits.available || 0) === 1 ? "" : "s"} available. Apply{" "}
          {b?.creditApplied && b.creditsAppliedCount
            ? `${b.creditsAppliedCount} Referral Credit${b.creditsAppliedCount === 1 ? "" : "s"} (−${b.display.credit})`
            : `${preview?.referralCredits.maxApplicable} Referral Credit${(preview?.referralCredits.maxApplicable || 0) === 1 ? "" : "s"}`}
        </label>
      )}
      <section className="price-summary-card" aria-label="Price summary">
        {showDismiss && (
          <button
            type="button"
            className="newcomer-dismiss"
            aria-label="Hide newcomer offer reminder"
            onClick={() => setHideModal(true)}
          >
            ×
          </button>
        )}
        {(showNewcomerPromo || (signedIn && b?.referralApplied) || (signedIn && b?.creditApplied && (b.creditsAppliedCount || 0) > 0)) && (
          <div className={showDismiss ? "offer-badges offer-badges-dismiss" : "offer-badges"}>
            {showNewcomerPromo && <span className="offer-badge">NEW MEMBER OFFER</span>}
            {signedIn && b?.referralApplied && <span className="offer-badge">REFERRAL -10%</span>}
            {signedIn && b?.creditApplied && b.creditsAppliedCount > 0 && (
              <span className="offer-badge offer-badge-credit">
                {b.creditsAppliedCount === 1 ? "$3 CREDIT APPLIED" : `${b.creditsAppliedCount} CREDITS APPLIED`}
              </span>
            )}
          </div>
        )}
        <div className="price-hero">
          <div>
            <p className="price-hero-label">{lifetime ? "STANDARD PRICE" : (isGuest || !b ? "YOUR PRICE" : "YOUR PRICE TODAY")}</p>
            <p className="price-today" aria-label={`Your price today ${ctaPrice}`}>
              {ctaPrice}
            </p>
          </div>
          {showSave && b && (
            <p className="you-save">Save {formatUsd(savingsCents)} today</p>
          )}
        </div>
        <dl className="price-breakdown">
          {lifetime ? (
            <>
              <dt>Lifetime Pro access</dt><dd>{formatUsd(LIFETIME_ACCESS_CENTS)}</dd>
              <dt>Official exam guarantee</dt><dd>{formatUsd(EXAM_GUARANTEE_CENTS)}</dd>
            </>
          ) : (
            <><dt>Standard price</dt><dd>{b?.display.standard || guestPrice}</dd></>
          )}
          {signedIn && b?.newcomerApplied && b.display.newcomer && (
            <>
              <dt>New Member price</dt>
              <dd>{b.display.newcomer}</dd>
            </>
          )}
          {signedIn && b?.referralApplied && (
            <>
              <dt>Referral discount</dt>
              <dd>−10%</dd>
            </>
          )}
          {signedIn && b?.creditApplied && b.display.credit && (
            <>
              <dt>Referral Credits</dt>
              <dd>−{b.display.credit}</dd>
            </>
          )}
        </dl>
        {showCountdown && (
          <p className="offer-ends">
            Offer ends in <strong>{formatRemaining(remainingMs)}</strong>
          </p>
        )}
        <p className="price-assurance">
          {lifetime ? "One-time payment · All available states · No expiration" : "One-time payment · 60-day full access · No subscription · No automatic renewal"}
        </p>
      </section>

      {ownsLifetime ? (
        <p className="checkout-status" role="status">Lifetime Pro is active on your account. <Link href={paths.billing}>View Billing &amp; Access</Link></p>
      ) : unavailable ? (
        <p className="checkout-status" role="status">Lifetime checkout is currently unavailable.</p>
      ) : isGuest ? (
        lifetime ? (
          <Link className="btn btn-primary pricing-cta" href={loginHref}>Sign in to buy Lifetime Pro</Link>
        ) : (
          <Link className="btn btn-primary pricing-cta" href={registerHref}>
            <MemberCopy member={ctaLabel || "View Member Offer"}>{ctaLabel || "Create Free Account to Unlock Offer"}</MemberCopy>
          </Link>
        )
      ) : null}
      {showCheckoutForm && (
        <EnglishForm onSubmit={go}>
          {signedIn && (
            <div className="policy-accept">
              <input
                id={policyId}
                type="checkbox"
                required
                data-required-message={lifetime
                  ? "Check the box to accept the Lifetime Pro exam guarantee terms before continuing."
                  : "Check the box to confirm you understand the refund and promotion terms before continuing."}
                checked={policy}
                onChange={(e) => setPolicy(e.target.checked)}
              />
              <span>
                <label htmlFor={policyId}>{lifetime ? "I accept the Lifetime Pro exam guarantee terms." : "I understand the refund and promotion terms."}</label>{" "}
                <a href={termsHref}>View refund policy</a>
              </span>
            </div>
          )}
          <button className="btn btn-primary pricing-cta" type="submit" disabled={busy || signedIn !== true || (lifetime && !preview)}>
            {busy ? "Working…" : ctaLabel || checkoutLabel}
          </button>
        </EnglishForm>
      )}
      {belowCta}
      <p className="notice">
        <Link href={paths.contact}>Contact support</Link>
      </p>
      <div role="status">
        {busy && <span className="visually-hidden">Preparing secure checkout.</span>}
        {priceChanged && <p className="notice">Your available price has changed.</p>}
        {checkoutNote && <p className="notice">{checkoutNote}</p>}
        {err && (
          <p className="notice">
            {err}{" "}
            {(signedIn === null || (lifetime && !preview)) && (
              <button className="link-button" type="button" onClick={() => {
                setErr("");
                void load(applyCredit).catch(() => setErr("Checkout information couldn't be loaded. Please try again."));
              }}>Retry</button>
            )}
          </p>
        )}
      </div>
      {!lifetime && isGuest && (
        <p className="notice">
          <Link href={registerHref}>Create an account</Link> or <Link href={loginHref}>sign in</Link> to see eligible
          New Member or Referral pricing.
        </p>
      )}

      {!lifetime && <div className="card pricing-policy-card" id="refund-policy">
        <h3>3-Day Unused Refund Policy</h3>
        <p>{REFUND_POLICY_SUMMARY}</p>
        <h3>One-time discount notice</h3>
        <p>{ONE_TIME_DISCOUNT_NOTICE}</p>
        {applyCredit && <p>{CREDIT_RESTORE_NOTICE}</p>}
      </div>}

      {hideModal && (
        <div className="nav-backdrop" style={{ inset: 0, zIndex: 50 }} onClick={() => setHideModal(false)}>
          <div
            className="card"
            style={{ maxWidth: 420, margin: "20vh auto", position: "relative", zIndex: 51 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Hide your newcomer offer reminder?</h2>
            <p>
              Your one-time New Member discount expires in{" "}
              {remainingMs > 0 ? formatRemaining(remainingMs) : "less than a minute"} and will not be extended once it
              expires.
            </p>
            <div className="row">
              <button className="btn btn-primary" type="button" onClick={() => setHideModal(false)}>
                Keep reminder
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => {
                  window.localStorage.setItem(DISMISS_KEY, "1");
                  setDismissed(true);
                  setHideModal(false);
                }}
              >
                Hide reminder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
