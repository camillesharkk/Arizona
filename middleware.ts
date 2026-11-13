import { productionStateBlocked } from "@/lib/state-release";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { operationsAccess } from "@/lib/operations/report-view";
import { STATE_COOKIE, pathState } from "@/lib/site-state";
import { readSessionToken, SESSION_COOKIE } from "@/lib/session-token";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if ((path === "/connecticut" || path.startsWith("/connecticut/")) &&
      (process.env.VERCEL_ENV === "production" || process.env.NEXT_PUBLIC_CT_PREVIEW !== "1")) {
    return new NextResponse("Not found", { status: 404 });
  }
  if (productionStateBlocked("IN") && (path === "/indiana" || path.startsWith("/indiana/"))) return new NextResponse("Not found", { status: 404 });
  // Deny before rendering (including RSC requests), not merely via noindex or links.
  if (process.env.VERCEL_ENV === "production" && (path === "/preview" || path.startsWith("/preview/"))) {
    return new NextResponse("Not found", { status: 404 });
  }
  if (process.env.VERCEL_ENV === "production" && (path === "/north-carolina" || path.startsWith("/north-carolina/"))) {
    return new NextResponse("Not found", { status: 404 });
  }
  if (!productionStateBlocked("IN") && (path === "/preview/indiana" || path.startsWith("/preview/indiana/"))) { const url = request.nextUrl.clone(); url.pathname = path.replace("/preview/indiana", "/indiana"); return NextResponse.redirect(url); }
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
