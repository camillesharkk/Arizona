import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getCommerceRepo } from "@/lib/commerce";
import { ensureReferralCode, eligibilitySnapshot, releaseMatureRewards } from "@/lib/commerce/service";
import { siteUrl } from "@/lib/site";
import { paths } from "@/lib/paths";
import { REFERRAL_CREDIT_CENTS } from "@/lib/pricing/catalog";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const repo = await getCommerceRepo();
  await releaseMatureRewards(repo);
  const code = await ensureReferralCode(repo, session.id);
  const snap = await eligibilitySnapshot(repo, session.id);
  const credits = await repo.listCredits(session.id);
  const rewards = await repo.listRewardsForReferrer(session.id);
  const available = credits.filter((c) => c.status === "available").length;
  const pending = credits.filter((c) => c.status === "pending").length;
  const used = credits.filter((c) => c.status === "redeemed").length;
  const invitePath = `${siteUrl()}${paths.register}?ref=${encodeURIComponent(code.code)}`;
  return NextResponse.json({
    code: code.code,
    inviteLink: invitePath,
    creditAmountCents: REFERRAL_CREDIT_CENTS,
    credits: { available, pending, used, reserved: credits.filter((c) => c.status === "reserved").length },
    referralDiscount: {
      eligible: snap.referralDiscountEligible,
      status: snap.relationship?.discountStatus ?? null,
    },
    qualifiedReferrer: await repo.hasQualifyingPaidOrder(session.id),
    rewardAdjustmentCents: (await repo.listOpenDebts(session.id)).reduce((n, d) => n + d.remainingCents, 0),
    rewards: {
      pending: rewards.filter((r) => r.status === "pending").length,
      available: rewards.filter((r) => r.status === "available").length,
      canceled: rewards.filter((r) => r.status === "canceled").length,
    },
  });
}
