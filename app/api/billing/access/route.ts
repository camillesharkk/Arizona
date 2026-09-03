import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getCommerceRepo } from "@/lib/commerce";
import { refundEligibility, releaseMatureRewards } from "@/lib/commerce/service";
import { formatUsd } from "@/lib/pricing/money";
import { hasArizonaPro, getArizonaEntitlement } from "@/lib/entitlements";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const repo = await getCommerceRepo();
  await releaseMatureRewards(repo);
  const orders = await repo.listOrders(session.id);
  const requests = await repo.listRefundRequests(session.id);
  const entitlement = await getArizonaEntitlement(session.id);
  const items = [];
  for (const order of orders) {
    const el = await refundEligibility(repo, { userId: session.id, orderId: order.id });
    items.push({
      orderId: order.id,
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
  return NextResponse.json({
    arizonaPro: await hasArizonaPro(session.id),
    planExpiresAt: entitlement?.expiresAt ?? null,
    orders: items,
    refundRequests: requests.map((r) => ({
      id: r.id,
      orderId: r.orderId,
      status: r.status,
      createdAt: r.createdAt,
      note: r.note,
    })),
  });
}
