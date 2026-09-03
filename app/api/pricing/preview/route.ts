import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getCommerceRepo } from "@/lib/commerce";
import { previewPrice } from "@/lib/commerce/service";
import { publicBreakdown } from "@/lib/commerce/public";
import { POLICY_VERSION } from "@/lib/pricing/catalog";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const url = new URL(req.url);
  const applyCredit = url.searchParams.get("applyCredit") === "1" || url.searchParams.get("applyCredit") === "true";
  const repo = await getCommerceRepo();
  const { snap, breakdown } = await previewPrice(repo, session.id, applyCredit);
  return NextResponse.json({
    productCode: "az_exam_pro_60d",
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
    },
    breakdown: publicBreakdown(breakdown),
  });
}
