import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { operationsAccess } from "@/lib/operations/report-view";
import { readSessionToken, SESSION_COOKIE } from "@/lib/session-token";

export async function middleware(request: NextRequest) {
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
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
