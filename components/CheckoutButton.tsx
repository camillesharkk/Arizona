"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { paths } from "@/lib/paths";
import {
  CREDIT_PER_ORDER_NOTICE,
  CREDIT_RESTORE_NOTICE,
  GUEST_NEWCOMER_HINT,
  ONE_TIME_DISCOUNT_NOTICE,
  PERSONAL_USE_NOTICE,
  POLICY_CHECKBOX_TEXT,
  PRO_DURATION_NOTICE,
  REFUND_POLICY_SUMMARY,
} from "@/lib/pricing/copy";
import { NEWCOMER_PRICE_CENTS, STANDARD_PRICE_CENTS } from "@/lib/pricing/catalog";
import { formatUsd } from "@/lib/pricing/money";

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
    const data = await res.json();
    setBusy(false);
    if (res.status === 409 || data.error === "PRICE_CHANGED") {
      setPriceChanged(true);
      await load(applyCredit);
      return;
    }
    if (!res.ok) {
      setErr(data.error || "Sign in first");
      return;
    }
    window.location.href = data.url;
  }

  const b = preview?.breakdown;
  const guestPrice = formatUsd(STANDARD_PRICE_CENTS);
  const ctaPrice = b ? b.display.final : guestPrice;
  const expiresLabel = preview?.newcomerOffer.expiresAt
    ? new Date(preview.newcomerOffer.expiresAt).toLocaleString()
    : "";

  return (
    <div className="pricing-buy">
      {signedIn && preview?.newcomerOffer.eligible && !dismissed && (
        <div className="card newcomer-banner" style={{ position: "relative", marginBottom: 12 }}>
          <button
            type="button"
            className="newcomer-dismiss"
            aria-label="Hide newcomer offer reminder"
            onClick={() => setHideModal(true)}
          >
            ×
          </button>
          <p className="kicker">New Member Offer</p>
          <p>
            Standard price {guestPrice} · Your New Member price <strong>{b?.display.newcomer || formatUsd(NEWCOMER_PRICE_CENTS)}</strong>
            {b?.newcomerDiscountCents ? <> · Save {formatUsd(b.newcomerDiscountCents)}</> : null}
          </p>
          <p>
            {remainingMs > 0 ? <>Ends in {formatRemaining(remainingMs)}</> : <>expired</>}
          </p>
        </div>
      )}
      {signedIn && preview?.newcomerOffer.eligible && dismissed && expiresLabel && (
        <p className="notice">New Member pricing is still available until {expiresLabel}</p>
      )}
      {signedIn && preview?.referralDiscount.eligible && (
        <p className="notice">
          Referral Discount · 10% off · Available · One-time use
        </p>
      )}
      {signedIn && (preview?.referralCredits.available || 0) > 0 && (preview?.referralCredits.maxApplicable || 0) > 0 && (
        <label className="notice" style={{ display: "block", margin: "8px 0" }}>
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

      <p className="notice">{PRO_DURATION_NOTICE}</p>
      <p className="notice">{PERSONAL_USE_NOTICE}</p>

      <section className="price-summary-card" aria-label="Price summary">
        {signedIn !== false && b?.newcomerApplied && <span className="offer-badge">NEW MEMBER OFFER ACTIVE</span>}
        {signedIn !== false && b?.referralApplied && <span className="offer-badge">REFERRAL DISCOUNT APPLIED</span>}
        {signedIn !== false && b?.creditApplied && b.creditsAppliedCount > 0 && (
          <span className="offer-badge">
            {b.creditsAppliedCount === 1 ? "$3 CREDIT APPLIED" : `${b.creditsAppliedCount} CREDITS APPLIED`}
          </span>
        )}
        {signedIn !== false && b && b.listPriceCents - b.finalPriceCents > 0 && (
          <span className="offer-badge">SAVE {formatUsd(b.listPriceCents - b.finalPriceCents)} TODAY</span>
        )}
        <p className="kicker">{signedIn === false || !b ? "YOUR PRICE" : "YOUR PRICE TODAY"}</p>
        <p className="price-today" aria-label={`Your price today ${ctaPrice}`}>
          {ctaPrice}
        </p>
        {signedIn !== false && b && b.listPriceCents - b.finalPriceCents > 0 && (
          <p className="you-save">YOU SAVE {formatUsd(b.listPriceCents - b.finalPriceCents)}</p>
        )}
        <p>Standard price {b?.display.standard || guestPrice}</p>
        {signedIn === false && <p>{GUEST_NEWCOMER_HINT}</p>}
        {signedIn && b?.newcomerApplied && <p>Your New Member price {b.display.newcomer}</p>}
        {signedIn && b?.referralApplied && <p>Referral discount −10%</p>}
        {signedIn && b?.creditApplied && b.display.credit && (
          <p>
            Referral Credits −{b.display.credit}
            {b.creditsAppliedCount ? ` (${b.creditsAppliedCount})` : ""}
          </p>
        )}
        {signedIn && b?.newcomerEligible && remainingMs > 0 && (
          <p>
            Offer ends in: <strong>{formatRemaining(remainingMs)}</strong>
          </p>
        )}
        <p className="notice">One-time payment · 60-day full access · No subscription · No automatic renewal</p>
      </section>

      <div className="card" style={{ margin: "12px 0" }}>
        <h3>3-Day Unused Refund Policy</h3>
        <p>{REFUND_POLICY_SUMMARY}</p>
        <h3>One-time discount notice</h3>
        <p>{ONE_TIME_DISCOUNT_NOTICE}</p>
        {applyCredit && <p>{CREDIT_RESTORE_NOTICE}</p>}
        <label style={{ display: "block", marginTop: 12 }}>
          <input type="checkbox" checked={policy} onChange={(e) => setPolicy(e.target.checked)} /> {POLICY_CHECKBOX_TEXT}
        </label>
      </div>

      <button className="btn btn-primary" type="button" onClick={go} disabled={busy || (signedIn === true && !policy)}>
        {busy ? "Working…" : `Get 60-Day Pro — ${ctaPrice}`}
      </button>
      {priceChanged && <p className="notice">Your available price has changed.</p>}
      {err && (
        <p className="notice">
          {err}. <Link href={paths.login}>Sign in</Link>
        </p>
      )}
      {signedIn === false && (
        <p className="notice">
          {GUEST_NEWCOMER_HINT}{" "}
          <Link href={paths.register}>Create an account</Link> or <Link href={paths.login}>sign in</Link> to apply New
          Member or Referral pricing.
        </p>
      )}

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
