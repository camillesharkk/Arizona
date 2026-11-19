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
const webLink = /(?:[a-z][a-z0-9+.-]*:\/\/|https?:|(?<![\w:/])\/\/)[^\s<>"']+/giu;

export function linkRisk(message: string): "allowed" | "blocked" {
  const text = message.normalize("NFKC").replace(/[\u200b-\u200d\ufeff]/gu, "");
  if (dangerousScheme.test(text)) return "blocked";
  for (const match of text.matchAll(webLink)) {
    const token = match[0].replace(/[.,!?;:)\]}]+$/u, "");
    const value = token.startsWith("//") ? "https:" + token : token;
    const url = URL.canParse(value) ? new URL(value) : null;
    if (url?.username || url?.password) return "blocked";
  }
  return "allowed";
}
