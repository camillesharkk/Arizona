import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getStore } from "@/lib/store";
import { getArizonaEntitlement } from "@/lib/entitlements";
import { AI_LIMIT_FREE, AI_LIMIT_PRO } from "@/lib/product";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null }, { headers: { "Cache-Control": "private, no-store" } });
  const store = await getStore();
  const [user, entitlement, exams] = await Promise.all([
    store.getUserById(session.id),
    getArizonaEntitlement(session.id),
    store.listExams(session.id),
  ]);
  if (!user) return NextResponse.json({ user: null }, { headers: { "Cache-Control": "private, no-store" } });
  const arizonaPro = Boolean(entitlement);
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
      californiaPro: arizonaPro,
      hawaiiPro: arizonaPro,
      planExpiresAt: entitlement?.expiresAt ?? null,
      aiDailyLimit: arizonaPro ? AI_LIMIT_PRO : AI_LIMIT_FREE,
      fullExamCount: count("full"),
      caFullExamCount: count("ca-full"),
      hiFullExamCount: count("hi-full"),
      packFullExamCount: { NY: count("ny-full"), PA: count("pa-full"), LA: count("la-full") },
    },
  }, { headers: { "Cache-Control": "private, no-store" } });
}
