import { createHash, randomBytes } from "crypto";

export function hashDeviceToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function newDeviceToken(): string {
  return randomBytes(32).toString("hex");
}

export function summarizeUserAgent(ua: string | null | undefined): { label: string; summary: string | null } {
  const raw = (ua || "").slice(0, 180);
  const browser = raw.includes("Edg/")
    ? "Edge"
    : raw.includes("Chrome/")
      ? "Chrome"
      : raw.includes("Firefox/")
        ? "Firefox"
        : raw.includes("Safari/")
          ? "Safari"
          : "Browser";
  const os = /iPhone/i.test(raw)
    ? "iPhone"
    : /iPad/i.test(raw)
      ? "iPad"
      : /Android/i.test(raw)
        ? "Android"
        : /Mac OS X|Macintosh/i.test(raw)
          ? "Mac"
          : /Windows/i.test(raw)
            ? "Windows"
            : /Linux/i.test(raw)
              ? "Linux"
              : "Unknown";
  return { label: `${browser} on ${os}`, summary: raw || null };
}

export function deviceLabelFromUserAgent(ua: string | null | undefined): string {
  return summarizeUserAgent(ua).label;
}
