"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { paths } from "@/lib/paths";
import {
  CREDIT_RESTORE_NOTICE,
  ONE_TIME_DISCOUNT_NOTICE,
  POLICY_CHECKBOX_TEXT,
  REFUND_POLICY_SUMMARY,
} from "@/lib/pricing/copy";

type Breakdown = {
  listPriceCents: number;
  standardPriceCents: number;
  newcomerEligible: boolean;
  newcomerExpiresAt: string | null;
  newcomerApplied: boolean;
  referralEligible: boolean;
  referralApplied: boolean;
  referralCreditAvailable: number;
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
  referralCredits: { available: number };
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
  const guestPrice = "$19.99";
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
          <p className="kicker">New Member Offer · 15% off</p>
          <p>
            <strong>{b?.display.newcomer}</strong>
            {remainingMs > 0 ? <> · Ends in {formatRemaining(remainingMs)}</> : <> · expired</>}
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
      {signedIn && (preview?.referralCredits.available || 0) > 0 && (
        <label className="notice" style={{ display: "block", margin: "8px 0" }}>
          <input type="checkbox" checked={applyCredit} onChange={(e) => setApplyCredit(e.target.checked)} />{" "}
          {(preview?.referralCredits.available || 0) === 1
            ? "You have a $3 Referral Credit available. Apply $3 Referral Credit"
            : `You have ${preview?.referralCredits.available} Referral Credits available. Apply one $3 Referral Credit`}
        </label>
      )}

      <div className="price-breakdown">
        <p>
          Standard price: <strong>{b?.display.standard || guestPrice}</strong>
        </p>
        {b?.newcomerApplied && <p>New Member Offer: {b.display.newcomer}</p>}
        {b?.referralApplied && <p>Referral Discount: −10%</p>}
        {b?.newcomerApplied && b.referralApplied && <p>Your price: {b.display.subtotal}</p>}
        {b?.creditApplied && <p>Referral Credit: −{b.display.credit}</p>}
        <p className="kicker">Final price: {ctaPrice}</p>
      </div>

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
          <Link href={paths.login}>Sign in</Link> to apply New Member or Referral pricing.
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
