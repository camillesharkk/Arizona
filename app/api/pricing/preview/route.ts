import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getCommerceRepo } from "@/lib/commerce";
import { lifetimeBreakdown, previewPrice } from "@/lib/commerce/service";
import { publicBreakdown } from "@/lib/commerce/public";
import { isLifetimeProProduct, isPurchasableProProduct, SITE_PRO_PRODUCT_CODE } from "@/lib/pro-products";
import { POLICY_VERSION } from "@/lib/pricing/catalog";
import { LIFETIME_POLICY_VERSION } from "@/lib/pricing/lifetime";
import { getLifetimeCheckoutAvailability } from "@/lib/billing/lifetime-availability";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const url = new URL(req.url);
  const applyCredit = url.searchParams.get("applyCredit") === "1" || url.searchParams.get("applyCredit") === "true";
  const productCode = url.searchParams.get("productCode") || SITE_PRO_PRODUCT_CODE;
  if (!isPurchasableProProduct(productCode)) return NextResponse.json({ error: "product_mismatch" }, { status: 400 });
  const lifetime = isLifetimeProProduct(productCode);
  if (lifetime && !await getLifetimeCheckoutAvailability()) {
    return NextResponse.json({ error: "LIFETIME_PRODUCT_UNAVAILABLE" }, { status: 503 });
  }
  const repo = await getCommerceRepo();
  const lifetimePro = await repo.hasActiveLifetimePro(session.id, new Date().toISOString());
  if (lifetime) {
    return NextResponse.json({
      productCode, lifetimePro, policyVersion: LIFETIME_POLICY_VERSION,
      newcomerOffer: { eligible: false, expiresAt: null, redeemed: false },
      referralDiscount: { eligible: false, status: null },
      referralCredits: { available: 0, maxApplicable: 0 },
      breakdown: publicBreakdown(lifetimeBreakdown()),
    });
  }
  const { snap, breakdown } = await previewPrice(repo, session.id, applyCredit);
  return NextResponse.json({
    productCode,
    lifetimePro,
    policyVersion: POLICY_VERSION,
    newcomerOffer: {
      eligible: snap.newcomerEligible,
      expiresAt: snap.newcomerExpiresAt,
      redeemed: snap.newcomerRedeemed,
    },
    referralDiscount: {
      eligible: snap.referralDiscountEligible,
      status: snap.relationship?.discountStatus ?? null,
    },
    referralCredits: {
      available: snap.availableCreditCount,
      maxApplicable: breakdown.maxApplicableCredits,
    },
    breakdown: publicBreakdown(breakdown),
  });
}
