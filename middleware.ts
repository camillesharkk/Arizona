import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { operationsAccess } from "@/lib/operations/report-view";
import { STATE_COOKIE, pathState } from "@/lib/site-state";
import { readSessionToken, SESSION_COOKIE } from "@/lib/session-token";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path.startsWith("/admin")) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const user = token ? await readSessionToken(token) : null;
    const access = operationsAccess(user?.email, process.env.OPERATIONS_ADMIN_EMAILS);
    if (access === "anonymous") {
      return new NextResponse("请先登录后再查看运营日报。", {
        status: 401,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
    if (access === "forbidden") {
      return new NextResponse("无权查看运营日报。", {
        status: 403,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", path);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  const live = pathState(path);
  const prefetch = request.headers.get("next-router-prefetch") === "1" || request.headers.get("purpose") === "prefetch";
  const flight = request.headers.get("rsc") === "1";
  if (live && !prefetch && !flight) {
    response.cookies.set(STATE_COOKIE, live, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon.svg|.*\\..*).*)"],
};
