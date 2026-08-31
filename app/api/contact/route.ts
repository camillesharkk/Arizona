import { NextResponse } from "next/server";
import { z } from "zod";
import { contactNoticeHtml, contactToEmail, sendMail } from "@/lib/email";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const schema = z
  .object({
    name: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().max(40).optional().default(""),
    preferred: z.enum(["Email", "Phone"]),
    message: z.string().trim().min(1).max(4000),
    website: z.string().optional().default(""),
    pageUrl: z.string().trim().max(500).optional().default(""),
  })
  .superRefine((data, ctx) => {
    if (data.preferred === "Phone" && !data.phone) {
      ctx.addIssue({ code: "custom", message: "Phone is required when Phone is the preferred contact method.", path: ["phone"] });
    }
  });

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

  const parsed = schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 });

  if (parsed.data.website) {
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
      pageUrl: parsed.data.pageUrl || "",
    }),
    { replyTo: parsed.data.email }
  );

  if (!mail.ok) {
    return NextResponse.json({ error: mail.error }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
