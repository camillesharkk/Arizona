import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getCommerceRepo } from "@/lib/commerce";
import { previewPrice } from "@/lib/commerce/service";
import { publicBreakdown } from "@/lib/commerce/public";
import { isSiteProProduct, SITE_PRO_PRODUCT_CODE } from "@/lib/pro-products";
import { POLICY_VERSION } from "@/lib/pricing/catalog";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const url = new URL(req.url);
  const applyCredit = url.searchParams.get("applyCredit") === "1" || url.searchParams.get("applyCredit") === "true";
  const productCode = url.searchParams.get("productCode") || SITE_PRO_PRODUCT_CODE;
  if (!isSiteProProduct(productCode)) return NextResponse.json({ error: "product_mismatch" }, { status: 400 });
  const repo = await getCommerceRepo();
  const { snap, breakdown } = await previewPrice(repo, session.id, applyCredit);
  return NextResponse.json({
    productCode,
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
