"use client";

import { useEffect, useState } from "react";
import { REFERRAL_CREDIT_RULES, CREDIT_PER_ORDER_NOTICE } from "@/lib/pricing/copy";

type Me = {
  code: string;
  inviteLink: string;
  credits: { available: number; pending: number; used: number; reserved: number };
  referralDiscount: { eligible: boolean; status: string | null };
  qualifiedReferrer: boolean;
};

export function ReferralsClient() {
  const [data, setData] = useState<Me | null>(null);
  const [copied, setCopied] = useState("");
  useEffect(() => {
    fetch("/api/referrals/me/")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);
  if (!data?.code) {
    return (
      <p className="notice">Sign in to view your referral code.</p>
    );
  }
  async function copy(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
  }
  return (
    <div className="grid">
      <section className="card">
        <h2>Your referral code</h2>
        <p className="kicker">{data.code}</p>
        <button className="btn btn-ghost" type="button" onClick={() => copy(data.code, "code")}>
          Copy code
        </button>
        {copied === "code" && <p className="notice">Copied.</p>}
        <h2>Invite link</h2>
        <p className="notice">{data.inviteLink}</p>
        <button className="btn btn-ghost" type="button" onClick={() => copy(data.inviteLink, "link")}>
          Copy link
        </button>
        {copied === "link" && <p className="notice">Copied.</p>}
      </section>
      <section className="card">
        <h2>Referral Credits</h2>
        <p>Available: $3 credits × {data.credits.available}</p>
        <p>Pending: {data.credits.pending}</p>
        <p>Used: {data.credits.used}</p>
        {data.referralDiscount.eligible && (
          <p className="notice">Referral Discount · 10% off · Available · One-time use</p>
        )}
        {!data.qualifiedReferrer && (
          <p className="notice">
            $3 Referral Credits are earned after you have completed a qualifying purchase on this site.
          </p>
        )}
      </section>
      <section className="card">
        <h2>How it works</h2>
        <p>
          When a referred friend completes their first qualifying purchase, you may earn one $3 Referral Credit.
        </p>
        <p>Referral Credits:</p>
        <p className="notice">{CREDIT_PER_ORDER_NOTICE}</p>
        <ul>
          {REFERRAL_CREDIT_RULES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <p>
          The credit becomes available only after that referred customer&apos;s qualifying order is no longer eligible
          for our ordinary unused refund policy (Pro-only features used, or 72 hours after payment with no refund).
        </p>
      </section>
    </div>
  );
}
