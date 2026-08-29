import { NextResponse } from "next/server";
import { getSession, setSessionCookie } from "@/lib/session";
import { getStore } from "@/lib/store";
import { checkoutUrl, applyBillingEvent } from "@/lib/billing";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  return NextResponse.json({ url: checkoutUrl(session) });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("mock") !== "success") return NextResponse.json({ error: "Not found" }, { status: 404 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  await applyBillingEvent({
    type: "purchase_completed",
    eventId: `mock-${session.id}-${Date.now()}`,
    userId: session.id,
    email: session.email,
  });
  const store = await getStore();
  const user = await store.getUserById(session.id);
  if (user) {
    await setSessionCookie({
      id: user.id,
      email: user.email,
      plan: "pro",
      planStatus: "active",
      emailVerified: user.emailVerified,
      name: user.name,
    });
  }
  return NextResponse.redirect(new URL("/dashboard/?upgraded=1", req.url));
}
