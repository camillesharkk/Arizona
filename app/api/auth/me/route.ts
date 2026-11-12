import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getStore } from "@/lib/store";
import { aiDailyLimit, caFullExamCount, fullExamCount, getArizonaEntitlement, hasArizonaPro, hasStatePro, hiFullExamCount, packFullExamCounts } from "@/lib/entitlements";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });
  const store = await getStore();
  const user = await store.getUserById(session.id);
  if (!user) return NextResponse.json({ user: null });
  const arizonaPro = await hasArizonaPro(session.id);
  const entitlement = await getArizonaEntitlement(session.id);
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: arizonaPro ? "pro" : "free",
      planStatus: user.planStatus,
      emailVerified: user.emailVerified,
      arizonaPro,
      californiaPro: await hasStatePro(session.id, "CA"),
      hawaiiPro: await hasStatePro(session.id, "HI"),
      planExpiresAt: entitlement?.expiresAt ?? null,
      aiDailyLimit: await aiDailyLimit(session.id),
      fullExamCount: await fullExamCount(session.id),
      caFullExamCount: await caFullExamCount(session.id),
      hiFullExamCount: await hiFullExamCount(session.id),
      packFullExamCount: await packFullExamCounts(session.id),
    },
  });
}
