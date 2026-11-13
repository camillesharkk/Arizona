import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getStore } from "@/lib/store";
import { accountProExpiry, ctProCovers } from "@/lib/account-pro";
import { getArizonaEntitlement } from "@/lib/entitlements";
import { AI_LIMIT_FREE, AI_LIMIT_PRO } from "@/lib/product";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null }, { headers: { "Cache-Control": "private, no-store" } });
  const store = await getStore();
  const [user, entitlements, exams] = await Promise.all([
    store.getUserById(session.id),
    store.listEntitlements(session.id),
    store.listExams(session.id),
  ]);
  if (!user) return NextResponse.json({ user: null }, { headers: { "Cache-Control": "private, no-store" } });
  const entitlement = await getArizonaEntitlement(session.id, entitlements);
  const arizonaPro = Boolean(entitlement);
  const connecticutPro = ctProCovers(entitlements);
  const count = (mode: string) => exams.filter(exam => exam.mode === mode).length;
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: arizonaPro ? "pro" : "free",
      planStatus: user.planStatus,
      emailVerified: user.emailVerified,
      arizonaPro,
      connecticutPro,
      connecticutProExpiresAt: connecticutPro ? accountProExpiry(entitlements, new Date(), "CT")?.toISOString() ?? null : null,
      californiaPro: arizonaPro,
      hawaiiPro: arizonaPro,
      planExpiresAt: entitlement?.expiresAt ?? null,
      aiDailyLimit: arizonaPro ? AI_LIMIT_PRO : AI_LIMIT_FREE,
      fullExamCount: count("full"),
      caFullExamCount: count("ca-full"),
      hiFullExamCount: count("hi-full"),
      packFullExamCount: { NY: count("ny-full"), PA: count("pa-full"), LA: count("la-full"), CT: count("ct-full") },
    },
  }, { headers: { "Cache-Control": "private, no-store" } });
}
