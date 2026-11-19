import { NextResponse } from "next/server";
import { z } from "zod";
import { durableLimit } from "@/lib/durable-limit";
import { trustedClientIp } from "@/lib/trusted-ip";

export const dynamic = "force-dynamic";

const maxBytes = 8000;
const legacy = z.object({
  "effective-directive": z.string(),
  "blocked-uri": z.string().optional(),
});
const modern = z.array(z.object({
  type: z.literal("csp-violation"),
  body: z.object({ effectiveDirective: z.string(), blockedURL: z.string().optional() }),
})).max(20);

function resource(value = "") {
  if (["inline", "eval", "wasm-eval", "data", "blob"].includes(value)) return value;
  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") return url.origin.slice(0, 255);
  } catch {
    return "other";
  }
  return "other";
}

export async function POST(req: Request) {
  const type = req.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
  if (type !== "application/csp-report" && type !== "application/reports+json") {
    return new NextResponse(null, { status: 415 });
  }
  if (Number(req.headers.get("content-length")) > maxBytes) return new NextResponse(null, { status: 413 });
  const cap = await durableLimit(`csp:${trustedClientIp(req)}`, 30, 10 * 60_000);
  if (!cap.ok) return new NextResponse(null, { status: 429, headers: { "Retry-After": String(cap.retryAfter) } });
  const reader = req.body?.getReader();
  if (!reader) return new NextResponse(null, { status: 400 });
  const buffer = new Uint8Array(maxBytes);
  let length = 0;
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      if (length + chunk.value.byteLength > maxBytes) {
        await reader.cancel().catch(() => undefined);
        return new NextResponse(null, { status: 413 });
      }
      buffer.set(chunk.value, length);
      length += chunk.value.byteLength;
    }
    const raw: unknown = JSON.parse(new TextDecoder().decode(buffer.subarray(0, length)));
    const reports = type === "application/csp-report"
      ? [z.object({ "csp-report": legacy }).parse(raw)["csp-report"]].map((entry) => ({
        directive: entry["effective-directive"], blocked: entry["blocked-uri"],
      }))
      : modern.parse(raw).map(({ body }) => ({ directive: body.effectiveDirective, blocked: body.blockedURL }));
    const violations = reports
      .filter(({ directive }) => /^(?:(?:child|connect|default|font|frame|img|manifest|media|object|script|style|worker)-src(?:-elem|-attr)?|base-uri|form-action|frame-ancestors)$/.test(directive))
      .map(({ directive, blocked }) => ({ directive, origin: resource(blocked) }));
    if (violations.length) console.info(JSON.stringify({ event: "csp_report", violations }));
  } catch {
    return new NextResponse(null, { status: 400 });
  } finally {
    reader.releaseLock();
  }
  return new NextResponse(null, { status: 204 });
}
