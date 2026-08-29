import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getStore } from "@/lib/store";
import { isPro } from "@/lib/entitlements";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });
  const store = await getStore();
  const user = await store.getUserById(session.id);
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: isPro({ ...session, plan: user.plan, planStatus: user.planStatus }) ? "pro" : "free",
      planStatus: user.planStatus,
      emailVerified: user.emailVerified,
    },
  });
}
