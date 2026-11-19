import { NextResponse } from "next/server";
import { durableLimit } from "@/lib/durable-limit";
import { trustedClientIp } from "@/lib/trusted-ip";

export const dynamic = "force-dynamic";

function scrub(value: string) {
  return value.replace(/https?:\/\/[^\s"']+/g, (url) => url.split("?")[0]).slice(0, 1500);
}

export async function POST(req: Request) {
  const cap = await durableLimit(`csp:${trustedClientIp(req)}`, 30, 10 * 60_000);
  if (!cap.ok) return new NextResponse(null, { status: 429, headers: { "Retry-After": String(cap.retryAfter) } });
  const raw = await req.text();
  if (raw.length > 8000) return new NextResponse(null, { status: 413 });
  console.info(JSON.stringify({ event: "csp_report", body: scrub(raw) }));
  return new NextResponse(null, { status: 204 });
}
