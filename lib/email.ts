import { randomBytes } from "crypto";
import { siteUrl } from "@/lib/site";
import { paths } from "@/lib/paths";

export async function sendMail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Arizona Exam <noreply@localhost>";
  if (!key) {
    console.info("[email:dev]", { to, subject, html: html.slice(0, 500) });
    return { ok: true, mocked: true as const };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!res.ok) throw new Error("email_failed");
  return { ok: true, mocked: false as const };
}

export function newToken() {
  return randomBytes(32).toString("hex");
}

export function verifyUrl(token: string) {
  return `${siteUrl()}${paths.verify}?token=${token}`;
}

export function resetUrl(token: string) {
  return `${siteUrl()}${paths.reset}?token=${token}`;
}
