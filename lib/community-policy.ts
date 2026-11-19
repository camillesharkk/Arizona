import { isIP } from "node:net";
import { parseWebUrl } from "@/lib/web-url";

import { communityLimits } from "@/lib/community-config";

export { communityLimits, communityReportReasons, type CommunityReportReason } from "@/lib/community-config";

export const unreadableCommunityText = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/u;

export function nicknameValue(raw: string) {
  const value = raw.normalize("NFKC").trim().replace(/ +/g, " ");
  const size = Array.from(value).length;
  if (size < communityLimits.nicknameMin || size > communityLimits.nicknameMax) return null;
  if (!/^[\p{L}\p{N}][\p{L}\p{M}\p{N} ._-]*$/u.test(value)) return null;
  if (/^(?:official|admin(?:istrator)?|moderator|support|notary prep)(?:$|[ ._-])/i.test(value)) return null;
  return value;
}

const dangerousScheme = /(?:^|[^\p{L}\p{N}_])(?:javascript|vbscript|data|file|blob):[^\s]/iu;
const webLink = /(?:https?:[\\/]{2}|(?:^|\s)\/\/|(?<![\w@])www\.)[^\s<>"']+/giu;
const shorteners = new Set(["bit.ly", "t.co", "tinyurl.com", "is.gd", "cutt.ly", "rebrand.ly", "rb.gy", "shorturl.at"]);

export function linkRisk(message: string): "allowed" | "pending" | "blocked" {
  const text = message.normalize("NFKC").replace(/[\u200b-\u200d\ufeff]/gu, "");
  if (dangerousScheme.test(text)) return "blocked";
  const urls = new Set<string>();
  for (const match of text.matchAll(webLink)) {
    const token = match[0].trim().replace(/[.,!?;:)\]}]+$/u, "");
    const value = token.startsWith("//") ? "https:" + token : /^www\./i.test(token) ? "https://" + token : token;
    const url = parseWebUrl(value);
    if (!url) return "pending";
    const host = url.hostname.toLowerCase().replace(/\.$/, "").replace(/^www\./, "");
    if (url.username || url.password || shorteners.has(host) || isIP(host.replace(/^\[|\]$/g, "")) ||
        host.split(".").some((part) => part.startsWith("xn--")) || host === "localhost") return "pending";
    urls.add(url.href);
  }
  return urls.size >= communityLimits.reviewAtDistinctLinks ? "pending" : "allowed";
}

function normalizedMessage(text: string) {
  return text.normalize("NFKC").toLowerCase().replace(/[\p{P}\p{S}\p{Z}\p{C}\s]+/gu, " ").trim();
}

function trigrams(value: string) {
  const grams = new Set<string>();
  for (let index = 0; index + 2 < value.length; index++) grams.add(value.slice(index, index + 3));
  return grams;
}

export function duplicates(left: string, right: string) {
  if (left.normalize("NFKC").trim() === right.normalize("NFKC").trim()) return true;
  const first = normalizedMessage(left);
  const second = normalizedMessage(right);
  if (first && first === second) return true;
  if (Math.min(first.length, second.length) < communityLimits.similarityMinLength) return false;
  const a = trigrams(first);
  const b = trigrams(second);
  let intersection = 0;
  for (const gram of a) if (b.has(gram)) intersection++;
  return intersection / (a.size + b.size - intersection) >= communityLimits.similarityThreshold;
}
