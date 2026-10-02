import "server-only";

import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";

import { operationsSources } from "@/lib/operations/sources";
import { summarizeGa4, summarizeGsc } from "@/lib/operations/google-summary";

export { summarizeGa4, summarizeGsc } from "@/lib/operations/google-summary";
export type { Ga4Totals, GscTotals } from "@/lib/operations/google-summary";

const GA4_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const GSC_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

type ServiceAccount = {
  client_email: string;
  private_key: string;
};

export function loadGoogleServiceAccount(
  env: NodeJS.ProcessEnv = process.env
): { ok: true; account: ServiceAccount } | { ok: false; error: string } {
  const email = String(env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "").trim();
  const privateKey = String(env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || "").trim();
  if (email && privateKey) {
    return { ok: true, account: { client_email: email, private_key: privateKey.replace(/\\n/g, "\n") } };
  }
  const raw = String(env.GOOGLE_SERVICE_ACCOUNT_JSON || "").trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as ServiceAccount;
      if (!parsed.client_email || !parsed.private_key) return { ok: false, error: "GOOGLE_CREDENTIALS_INVALID" };
      return { ok: true, account: parsed };
    } catch {
      return { ok: false, error: "GOOGLE_CREDENTIALS_INVALID" };
    }
  }
  const filePath = String(env.GOOGLE_APPLICATION_CREDENTIALS || "").trim();
  if (!filePath) return { ok: false, error: "GOOGLE_CREDENTIALS_MISSING" };
  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as ServiceAccount;
    if (!parsed.client_email || !parsed.private_key) return { ok: false, error: "GOOGLE_CREDENTIALS_INVALID" };
    return { ok: true, account: parsed };
  } catch {
    return { ok: false, error: "GOOGLE_CREDENTIALS_INVALID" };
  }
}

function googleJwt(account: ServiceAccount) {
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      iss: account.client_email,
      scope: `${GA4_SCOPE} ${GSC_SCOPE}`,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  ).toString("base64url");
  const unsigned = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  return `${unsigned}.${signer.sign(account.private_key, "base64url")}`;
}

async function googleAccessToken(account: ServiceAccount) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: googleJwt(account),
    }),
  });
  const json = (await res.json()) as { access_token?: string };
  if (!res.ok || !json.access_token) throw new Error("GOOGLE_TOKEN_FAILED");
  return json.access_token;
}

async function postJson(url: string, token: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json: unknown = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error("GOOGLE_API_FAILED");
  return json;
}

export async function googleApiPost(url: string, body: unknown): Promise<{ ok: true; json: unknown } | { ok: false; error: string }> {
  const loaded = loadGoogleServiceAccount();
  if (!loaded.ok) return loaded;
  try {
    const token = await googleAccessToken(loaded.account);
    return { ok: true, json: await postJson(url, token, body) };
  } catch {
    return { ok: false, error: "GOOGLE_API_FAILED" };
  }
}

export async function fetchGoogleOperationsReport(opts: { reportDate: string; weekStart: string }) {
  const loaded = loadGoogleServiceAccount();
  if (!loaded.ok) return loaded;

  const propertyId = operationsSources.ga4.propertyId;
  const siteUrl = operationsSources.searchConsole.siteUrl;
  const token = await googleAccessToken(loaded.account);
  const metrics = [{ name: "sessions" }, { name: "totalUsers" }, { name: "screenPageViews" }];
  const dimensions = [{ name: "sessionDefaultChannelGroup" }];

  const [ga4YesterdayJson, ga4WeekJson, gscYesterdayJson, gscWeekJson] = await Promise.all([
    postJson(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, token, {
      dateRanges: [{ startDate: opts.reportDate, endDate: opts.reportDate }],
      metrics,
      dimensions,
    }),
    postJson(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, token, {
      dateRanges: [{ startDate: opts.weekStart, endDate: opts.reportDate }],
      metrics,
      dimensions,
    }),
    postJson(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      token,
      { startDate: opts.reportDate, endDate: opts.reportDate, dimensions: ["query"], rowLimit: 10 }
    ),
    postJson(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      token,
      { startDate: opts.weekStart, endDate: opts.reportDate, dimensions: ["query"], rowLimit: 10 }
    ),
  ]);

  return {
    ok: true as const,
    ga4: {
      yesterday: summarizeGa4(ga4YesterdayJson),
      week: summarizeGa4(ga4WeekJson),
    },
    gsc: {
      yesterday: summarizeGsc(gscYesterdayJson),
      week: summarizeGsc(gscWeekJson),
    },
  };
}
