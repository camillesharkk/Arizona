import { promises as dns } from "node:dns";

const cache = new Map<string, { ok: boolean; at: number }>();
const TEN_MINUTES = 10 * 60_000;

/** Common crawlers, including Google-InspectionTool, use a googlebot.com name. googleusercontent.com is not accepted. */
export function googlebotHostname(hostname: string) {
  const name = hostname.toLowerCase().replace(/\.$/, "");
  return name.endsWith(".googlebot.com") || name === "googlebot.com";
}

export async function verifyGooglebot(ip: string, lookup: Pick<typeof dns, "reverse" | "resolve4" | "resolve6"> = dns) {
  if (!ip || ip === "local" || ip.includes(",")) return false;
  const hit = cache.get(ip);
  if (hit && Date.now() - hit.at < TEN_MINUTES) return hit.ok;
  let ok = false;
  try {
    const names = await lookup.reverse(ip);
    const hostname = names.find(googlebotHostname);
    if (hostname) {
      const forward = ip.includes(":") ? await lookup.resolve6(hostname) : await lookup.resolve4(hostname);
      ok = forward.includes(ip);
    }
  } catch {
    ok = false;
  }
  cache.set(ip, { ok, at: Date.now() });
  return ok;
}
