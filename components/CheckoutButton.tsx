"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { paths } from "@/lib/paths";
import {
  CREDIT_PER_ORDER_NOTICE,
  CREDIT_RESTORE_NOTICE,
  GUEST_NEWCOMER_HINT,
  ONE_TIME_DISCOUNT_NOTICE,
  REFUND_POLICY_SUMMARY,
  TAX_CHECKOUT_NOTICE,
} from "@/lib/pricing/copy";
import { STANDARD_PRICE_CENTS } from "@/lib/pricing/catalog";
import { formatUsd } from "@/lib/pricing/money";
import { checkoutStartParams, trackEvent } from "@/lib/analytics";

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

export function CheckoutButton() {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [applyCredit, setApplyCredit] = useState(false);
  const [policy, setPolicy] = useState(false);
  const [err, setErr] = useState("");
  const [priceChanged, setPriceChanged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [dismissed, setDismissed] = useState(false);
  const [hideModal, setHideModal] = useState(false);

  const load = useCallback(async (credit: boolean) => {
    const me = await fetch("/api/auth/me/").then((r) => r.json()).catch(() => ({ user: null }));
    if (!me.user) {
      setSignedIn(false);
      setPreview(null);
      return;
    }
    setSignedIn(true);
    const data = await fetch(`/api/pricing/preview/?applyCredit=${credit ? "1" : "0"}`).then((r) => r.json());
    if (data.breakdown) setPreview(data);
  }, []);

  useEffect(() => {
    setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  useEffect(() => {
    load(applyCredit);
  }, [applyCredit, load]);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const remainingMs = useMemo(() => {
    const exp = preview?.breakdown.newcomerExpiresAt;
    if (!exp || !preview?.breakdown.newcomerEligible) return 0;
    return new Date(exp).getTime() - now;
  }, [preview, now]);

  useEffect(() => {
    if (preview?.breakdown.newcomerEligible && remainingMs <= 0) {
      load(applyCredit);
    }
  }, [remainingMs, preview, applyCredit, load]);

  async function go() {
    if (!policy) {
      setErr("Please confirm the refund and promotion terms before checkout.");
      return;
    }
    setBusy(true);
    setErr("");
    setPriceChanged(false);
    const quoteRes = await fetch("/api/pricing/quote/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productCode: "az_exam_pro_60d", applyCredit, policyAccepted: true }),
    });
    const quote = await quoteRes.json();
    if (quoteRes.status === 409 || quote.error === "PRICE_CHANGED") {
      setPriceChanged(true);
      await load(applyCredit);
      setBusy(false);
      return;
    }
    if (!quoteRes.ok) {
      setErr(quote.error || "Could not create price quote");
      setBusy(false);
      return;
    }
    const res = await fetch("/api/billing/checkout/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quoteId: quote.quoteId }),
    });
    let data = await res.json();
    if (res.status === 409 && data.error === "checkout_in_progress") {
      const retry = await fetch("/api/billing/checkout/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId: quote.quoteId }),
      });
      data = await retry.json();
      if (!retry.ok && retry.status !== 409) {
        setErr(data.error || "Could not start checkout");
        setBusy(false);
        return;
      }
      if (retry.ok && data.url) {
        trackEvent("checkout_start", checkoutStartParams(quote.breakdown));
        window.location.href = data.url;
        return;
      }
    }
    setBusy(false);
    if (data.error === "PRICE_CHANGED") {
      setPriceChanged(true);
      await load(applyCredit);
      return;
    }
    if (!data.url) {
      setErr(data.error || "Could not start checkout");
      return;
    }
    trackEvent("checkout_start", checkoutStartParams(quote.breakdown));
    window.location.href = data.url;
  }

  const b = preview?.breakdown;
  const guestPrice = formatUsd(STANDARD_PRICE_CENTS);
  const ctaPrice = b ? b.display.final : guestPrice;
  const isGuest = signedIn === false;
  const savingsCents = b ? b.listPriceCents - b.finalPriceCents : 0;
  const showSave = !isGuest && Boolean(b) && savingsCents > 0;
  const showNewcomerPromo = Boolean(signedIn && b?.newcomerApplied && !dismissed);
  const showCountdown = Boolean(signedIn && b?.newcomerEligible && remainingMs > 0 && !dismissed);
  const showDismiss = Boolean(signedIn && preview?.newcomerOffer.eligible && !dismissed);

  return (
    <div className="pricing-buy">
      {signedIn && (preview?.referralCredits.available || 0) > 0 && (preview?.referralCredits.maxApplicable || 0) > 0 && (
        <label className="notice credit-apply">
          <input type="checkbox" checked={applyCredit} onChange={(e) => setApplyCredit(e.target.checked)} />{" "}
          You have {preview?.referralCredits.available} Referral Credit
          {(preview?.referralCredits.available || 0) === 1 ? "" : "s"} available. Apply{" "}
          {b?.creditApplied && b.creditsAppliedCount
            ? `${b.creditsAppliedCount} Referral Credit${b.creditsAppliedCount === 1 ? "" : "s"} (−${b.display.credit})`
            : `${preview?.referralCredits.maxApplicable} Referral Credit${(preview?.referralCredits.maxApplicable || 0) === 1 ? "" : "s"}`}
        </label>
      )}
      {signedIn && (preview?.referralCredits.available || 0) > 0 && (
        <p className="notice">{CREDIT_PER_ORDER_NOTICE}</p>
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
            <p className="price-hero-label">{isGuest || !b ? "YOUR PRICE" : "YOUR PRICE TODAY"}</p>
            <p className="price-today" aria-label={`Your price today ${ctaPrice}`}>
              {ctaPrice}
            </p>
          </div>
          {showSave && b && (
            <p className="you-save">Save {formatUsd(savingsCents)} today</p>
          )}
        </div>
        <dl className="price-breakdown">
          <dt>Standard price</dt>
          <dd>{b?.display.standard || guestPrice}</dd>
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
        {isGuest && <p className="price-guest-hint">{GUEST_NEWCOMER_HINT}</p>}
        {showCountdown && (
          <p className="offer-ends">
            Offer ends in <strong>{formatRemaining(remainingMs)}</strong>
          </p>
        )}
        <p className="price-assurance">
          One-time payment · 60-day full access · No subscription · No automatic renewal
        </p>
      </section>

      {signedIn && (
        <label className="policy-accept">
          <input type="checkbox" checked={policy} onChange={(e) => setPolicy(e.target.checked)} />
          <span>
            I understand the refund and promotion terms.{" "}
            <a href="#refund-policy">View refund policy</a>
          </span>
        </label>
      )}

      {isGuest ? (
        <Link className="btn btn-primary pricing-cta" href={paths.register}>
          Create Free Account to Unlock Offer
        </Link>
      ) : (
        <button
          className="btn btn-primary pricing-cta"
          type="button"
          onClick={go}
          disabled={busy || signedIn !== true || !policy}
        >
          {busy ? "Working…" : `Get 60-Day Pro — ${ctaPrice}`}
        </button>
      )}
      <p className="notice">{TAX_CHECKOUT_NOTICE}</p>
      {priceChanged && <p className="notice">Your available price has changed.</p>}
      {err && (
        <p className="notice">
          {err}. <Link href={paths.login}>Sign in</Link>
        </p>
      )}
      {isGuest && (
        <p className="notice">
          <Link href={paths.register}>Create an account</Link> or <Link href={paths.login}>sign in</Link> to apply New
          Member or Referral pricing.
        </p>
      )}

      <div className="card pricing-policy-card" id="refund-policy">
        <h3>3-Day Unused Refund Policy</h3>
        <p>{REFUND_POLICY_SUMMARY}</p>
        <h3>One-time discount notice</h3>
        <p>{ONE_TIME_DISCOUNT_NOTICE}</p>
        {applyCredit && <p>{CREDIT_RESTORE_NOTICE}</p>}
      </div>

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
