"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { paths } from "@/lib/paths";
import { ProAccessNote } from "@/components/ProAccessNote";
import { STANDARD_PRICE_CENTS } from "@/lib/pricing/catalog";
import { formatUsd } from "@/lib/pricing/money";
import { GUEST_NEWCOMER_HINT } from "@/lib/pricing/copy";

export function HomeProCta() {
  const [isPro, setIsPro] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me/")
      .then((r) => r.json())
      .then((d) => {
        setIsPro(Boolean(d.user?.arizonaPro));
        setSignedIn(Boolean(d.user));
        setExpiresAt(d.user?.planExpiresAt || null);
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  if (ready && isPro) {
    return (
      <section className="card" style={{ marginTop: 20 }}>
        <h2>You&apos;re on Pro</h2>
        <ProAccessNote plan="pro" planExpiresAt={expiresAt} />
        <p className="lede">Your 60-day Arizona Notary Exam Prep Pro access is active. This is not a lifetime membership.</p>
        <Link className="btn btn-ghost" href={paths.dashboard}>
          Go to Dashboard
        </Link>
      </section>
    );
  }

  return (
    <section className="card" style={{ marginTop: 20 }}>
      <h2>Ready for the full prep experience?</h2>
      <p className="lede">
        Upgrade to Arizona Notary Exam Prep Pro for the full question bank, unlimited full-length
        practice tests, weak-area training, advanced progress insights, and more.
      </p>
      <ul>
        <li>Full question bank</li>
        <li>Unlimited full exams</li>
        <li>Weak-area training</li>
        <li>Exam readiness &amp; advanced analytics</li>
      </ul>
      <p>
        <strong>{formatUsd(STANDARD_PRICE_CENTS)} · 60-Day Full Access</strong>
      </p>
      <p className="notice">One-time payment. No subscription. No automatic renewal.</p>
      {!signedIn && <p className="notice">{GUEST_NEWCOMER_HINT}</p>}
      <Link className="btn btn-ghost" href={paths.pricing}>
        View Pro &amp; Pricing
      </Link>
    </section>
  );
}
