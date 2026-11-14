import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { issueUserSession } from "@/lib/devices/http";
import { cookies } from 'next/headers';
import { AUTH_RETURN_COOKIE, safeAuthReturn } from '@/lib/auth-return';

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });
  const store = await getStore();
  const row = await store.takeToken(token, "verify");
  if (!row) return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  const current = await store.getUserById(row.userId);
  if (!current || current.deletedAt) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }
  const at = new Date().toISOString();
  const user = await store.updateUser(row.userId, {
    emailVerified: true,
    emailVerifiedAt: current.emailVerifiedAt || at,
  });
  const login = new URL("/login/?verified=1", req.url);
  let returnTo: string | null = null;
  try {
    const stored = (await cookies()).get(AUTH_RETURN_COOKIE)?.value || '';
    returnTo = safeAuthReturn(decodeURIComponent(stored));
  } catch {
    // Ignore a malformed return cookie.
  }
  if (returnTo) login.searchParams.set('next', returnTo);
  try {
    const issued = await issueUserSession(
      {
        id: user.id,
        email: user.email,
        plan: user.plan,
        planStatus: user.planStatus,
        emailVerified: true,
        name: user.name,
      },
      { req }
    );
    if (issued.ok) {
      const response = NextResponse.redirect(new URL(returnTo || '/dashboard/', req.url));
      response.cookies.delete(AUTH_RETURN_COOKIE);
      return response;
    }
  } catch {
    /* fall through to sign-in */
  }
  return NextResponse.redirect(login);
}
