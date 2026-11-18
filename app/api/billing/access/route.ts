import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getCommerceRepo } from "@/lib/commerce";
import { refundEligibility, releaseMatureRewards } from "@/lib/commerce/service";
import { formatUsd } from "@/lib/pricing/money";
import { hasArizonaPro, hasStatePro, getArizonaEntitlement } from "@/lib/entitlements";
import { getStore } from "@/lib/store";
import { hasLifetimePro } from "@/lib/account-pro";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const repo = await getCommerceRepo();
  const store = await getStore();
  await releaseMatureRewards(repo);
  const [orders, requests, entitlements] = await Promise.all([
    repo.listOrders(session.id), repo.listRefundRequests(session.id), store.listEntitlements(session.id),
  ]);
  const now = new Date();
  const lifetimePro = hasLifetimePro(entitlements, now);
  const entitlement = await getArizonaEntitlement(session.id, entitlements);
  const items = [];
  for (const order of orders) {
    const el = await refundEligibility(repo, { userId: session.id, orderId: order.id });
    items.push({
      orderId: order.id,
      providerOrderId: order.providerOrderId,
      entitlementId: order.entitlementId,
      entitlementActive: entitlements.some(row =>
        row.id === order.entitlementId && row.status === "active" &&
        Date.parse(row.startsAt) <= now.getTime() && (row.expiresAt === null || Date.parse(row.expiresAt) > now.getTime())),
      productCode: order.productCode,
      status: order.status,
      paidAt: order.paidAt,
      amount: formatUsd(order.amountCents),
      amountCents: order.amountCents,
      promotions: {
        newcomer: order.newcomerApplied,
        referralDiscount: order.referralDiscountApplied,
        creditCents: order.creditCents,
      },
      refundedAt: order.refundedAt,
      refundReason: order.refundReason,
      eligibility: el.eligible
        ? { eligible: true, remainingMs: el.remainingMs }
        : { eligible: false, reason: el.reason, usedAt: "usedAt" in el ? el.usedAt : undefined },
    });
  }
  const [californiaEntitlement, hawaiiEntitlement] = await Promise.all([
    store.getStateEntitlement(session.id, "CA"),
    store.getStateEntitlement(session.id, "HI"),
  ]);
  return NextResponse.json({
    lifetimePro,
    arizonaPro: await hasArizonaPro(session.id),
    californiaPro: await hasStatePro(session.id, "CA"),
    hawaiiPro: await hasStatePro(session.id, "HI"),
    planExpiresAt: entitlement?.expiresAt ?? null,
    californiaPlanExpiresAt: lifetimePro ? null : californiaEntitlement?.expiresAt ?? null,
    hawaiiPlanExpiresAt: lifetimePro ? null : hawaiiEntitlement?.expiresAt ?? null,
    orders: items,
    refundRequests: requests.map((r) => ({
      id: r.id,
      orderId: r.orderId,
      status: r.status,
      createdAt: r.createdAt,
      note: r.note,
    })),
  }, { headers: { "Cache-Control": "private, no-store" } });
}
