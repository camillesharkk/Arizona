import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { setSessionCookie } from "@/lib/session";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });
  const store = await getStore();
  const row = await store.takeToken(token, "verify");
  if (!row) return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  const user = await store.updateUser(row.userId, { emailVerified: true });
  await setSessionCookie({
    id: user.id,
    email: user.email,
    plan: user.plan,
    planStatus: user.planStatus,
    emailVerified: true,
    name: user.name,
  });
  return NextResponse.redirect(new URL("/dashboard/", req.url));
}
