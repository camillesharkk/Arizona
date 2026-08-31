import { NextResponse } from "next/server";
import { contactNoticeHtml, contactToEmail, sendMail } from "@/lib/email";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { validateContactInput } from "@/lib/contact-validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const limited = rateLimit(`contact:${clientIp(req)}`, 5, 10 * 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const length = Number(req.headers.get("content-length") || "0");
  if (length > 20_000) return NextResponse.json({ error: "Request too large" }, { status: 413 });

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (JSON.stringify(raw).length > 20_000) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  const body = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const parsed = validateContactInput({
    name: body.name,
    email: body.email,
    phone: body.phone,
    preferred: body.preferred ?? body.preferredContact,
    message: body.message,
  });
  if (!parsed.ok) {
    return NextResponse.json(
      { error: "Please check the form and try again.", fields: parsed.errors },
      { status: 400 }
    );
  }

  if (String(body.website ?? "").trim()) {
    return NextResponse.json({ ok: true });
  }

  const to = contactToEmail();
  if (!to) {
    console.error("[contact] CONTACT_TO_EMAIL is not configured");
    return NextResponse.json({ error: "Contact is temporarily unavailable." }, { status: 503 });
  }

  const submittedAt = new Date().toISOString();
  const mail = await sendMail(
    to,
    `New Arizona Notary contact — ${parsed.data.name}`,
    contactNoticeHtml({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      preferred: parsed.data.preferred,
      message: parsed.data.message,
      submittedAt,
      pageUrl: String(body.pageUrl ?? "").trim().slice(0, 500),
    }),
    { replyTo: parsed.data.email }
  );

  if (!mail.ok) {
    return NextResponse.json({ error: mail.error }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
