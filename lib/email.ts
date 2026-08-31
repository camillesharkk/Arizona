import "server-only";
import { randomBytes } from "crypto";
import { paths } from "@/lib/paths";

const TEST_FROM = "Arizona Notary Prep <onboarding@resend.dev>";

export function mailFrom() {
  const configured = (process.env.EMAIL_FROM || "").trim();
  return configured || TEST_FROM;
}

export function mailSiteUrl() {
  const explicit = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/$/, "");
  if (explicit) return explicit;
  const vercel = (process.env.VERCEL_URL || "").trim().replace(/\/$/, "");
  if (vercel) {
    console.warn("[email] NEXT_PUBLIC_SITE_URL is not set; using VERCEL_URL for mail links");
    return `https://${vercel}`;
  }
  return "http://localhost:3000";
}

export function newToken() {
  return randomBytes(32).toString("hex");
}

export function verifyUrl(token: string) {
  return `${mailSiteUrl()}${paths.verify}?token=${encodeURIComponent(token)}`;
}

export function resetUrl(token: string) {
  return `${mailSiteUrl()}${paths.reset}?token=${encodeURIComponent(token)}`;
}

export const VERIFY_SUBJECT = "Verify your Arizona Notary Prep account";
export const RESET_SUBJECT = "Reset your Arizona Notary Prep password";

export function verificationEmailHtml(link: string) {
  return `<p>Confirm your email for Arizona Notary Prep.</p>
<p><a href="${link}">Verify email</a></p>
<p>If the button does not work, copy this link:</p>
<p>${link}</p>
<p>This link expires in 24 hours.</p>`;
}

export function resetEmailHtml(link: string) {
  return `<p>We received a request to reset your Arizona Notary Prep password.</p>
<p><a href="${link}">Reset password</a></p>
<p>If the button does not work, copy this link:</p>
<p>${link}</p>
<p>This link expires in 30 minutes. If you did not request it, you can ignore this email.</p>`;
}

export function allowDevEmailTokens() {
  return process.env.NODE_ENV !== "production" && !process.env.RESEND_API_KEY;
}

export async function sendMail(
  to: string,
  subject: string,
  html: string
): Promise<{ ok: true; mocked: boolean; messageId?: string } | { ok: false; error: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = mailFrom();

  if (!key) {
    if (process.env.NODE_ENV === "production") {
      console.error("[email] RESEND_API_KEY is not configured");
      return { ok: false, error: "Email service is not configured" };
    }
    console.info("[email:dev] skipped Resend (no API key)", { to, subject, from });
    return { ok: true, mocked: true, messageId: "dev-mock" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) {
      console.error("[email] Resend send failed", { status: res.status, to, subject, from });
      return { ok: false, error: "Could not send email. Please try again." };
    }
    const json = (await res.json().catch(() => ({}))) as { id?: string };
    console.info("[email] Resend send ok", { to, subject, from });
    return { ok: true, mocked: false, messageId: json.id };
  } catch {
    console.error("[email] Resend request failed", { to, subject });
    return { ok: false, error: "Could not send email. Please try again." };
  }
}
