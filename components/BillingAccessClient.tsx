"use client";

import { useEffect, useMemo, useState } from "react";
import { CREDIT_RESTORE_NOTICE, ONE_TIME_DISCOUNT_NOTICE } from "@/lib/pricing/copy";

type Order = {
  orderId: string;
  status: string;
  paidAt: string;
  amount: string;
  promotions: { newcomer: boolean; referralDiscount: boolean; creditCents: number };
  refundedAt: string | null;
  eligibility:
    | { eligible: true; remainingMs: number }
    | { eligible: false; reason: string; usedAt?: string };
};

function remain(ms: number) {
  const h = Math.max(0, Math.floor(ms / 3600000));
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return d > 0 ? `${d} days ${rh} hours remaining` : `${rh} hours remaining`;
}

export function BillingAccessClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [requests, setRequests] = useState<{ id: string; orderId: string; status: string; note: string | null }[]>([]);
  const [modal, setModal] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [now, setNow] = useState(() => Date.now());

  async function load() {
    const d = await fetch("/api/billing/access/").then((r) => r.json());
    setOrders(d.orders || []);
    setRequests(d.refundRequests || []);
  }
  useEffect(() => {
    load().catch(() => undefined);
  }, []);
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(t);
  }, []);

  const live = useMemo(() => orders, [orders, now]);

  async function requestRefund(orderId: string) {
    const res = await fetch("/api/billing/refund-request/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    const data = await res.json();
    setModal(null);
    setMsg(data.message || data.error || "Request recorded");
    await load();
  }

  return (
    <div className="grid">
      {msg && <p className="notice">{msg}</p>}
      {live.map((o) => (
        <section className="card" key={o.orderId}>
          <h2>Arizona Notary Exam Prep Pro</h2>
          <p>
            {o.amount} · {o.status} · paid {new Date(o.paidAt).toLocaleString()}
          </p>
          <h3>Promotions used on this purchase</h3>
          <p>New Member Offer {o.promotions.newcomer ? "Redeemed" : "Not used"}</p>
          <p>Referral Discount {o.promotions.referralDiscount ? "Redeemed" : "Not used"}</p>
          <p>Referral Credit {o.promotions.creditCents ? "$3.00 redeemed" : "Not used"}</p>
          <p className="notice">{ONE_TIME_DISCOUNT_NOTICE}</p>
          {o.promotions.creditCents > 0 && <p className="notice">{CREDIT_RESTORE_NOTICE}</p>}
          <h3>Refund eligibility</h3>
          {o.status === "refunded" ? (
            <p>Refunded {o.refundedAt ? new Date(o.refundedAt).toLocaleString() : ""}</p>
          ) : o.eligibility.eligible ? (
            <>
              <p>
                Eligible · {remain(o.eligibility.remainingMs)}
              </p>
              <p>You have not used any Pro-only features.</p>
              <button className="btn btn-primary" type="button" onClick={() => setModal(o.orderId)}>
                Request refund
              </button>
            </>
          ) : o.eligibility.reason === "pro_used" ? (
            <>
              <p>No longer eligible</p>
              <p>
                Pro access first used:{" "}
                {o.eligibility.usedAt ? new Date(o.eligibility.usedAt).toLocaleString() : "recorded"}
              </p>
            </>
          ) : o.eligibility.reason === "expired" ? (
            <>
              <p>Expired</p>
              <p>The 3-day unused refund window has ended.</p>
            </>
          ) : (
            <p>Not eligible ({o.eligibility.reason})</p>
          )}
        </section>
      ))}
      {!live.length && <p className="notice">No purchases on this account yet.</p>}
      {requests.length > 0 && (
        <section className="card">
          <h2>Refund requests</h2>
          {requests.map((r) => (
            <p key={r.id}>
              {r.status} · order {r.orderId.slice(0, 8)} · {r.note}
            </p>
          ))}
        </section>
      )}
      {modal && (
        <div className="nav-backdrop" style={{ inset: 0, zIndex: 50 }} onClick={() => setModal(null)}>
          <div className="card" style={{ maxWidth: 480, margin: "18vh auto" }} onClick={(e) => e.stopPropagation()}>
            <h2>Before you request a refund</h2>
            <p>If eligible, this purchase will be fully refunded and your Pro access will end.</p>
            <p>
              Any one-time New Member or Referral discount used on this purchase will remain redeemed and will not be
              restored.
            </p>
            <p>
              If a $3 Referral Credit was used, that credit will be restored after an eligible unused full refund is
              completed.
            </p>
            <p className="notice">Payment-provider refund is not processed automatically in this release.</p>
            <div className="row">
              <button className="btn btn-ghost" type="button" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" type="button" onClick={() => requestRefund(modal)}>
                Request eligible refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
