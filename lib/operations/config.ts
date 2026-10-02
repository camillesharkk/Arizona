/** Server report identifiers. Secrets are read only when a server job calls this. */

export function posthogQueryHost(env: Record<string, string | undefined> = process.env) {
  const explicit = String(env.POSTHOG_HOST || "").trim().replace(/\/$/, "");
  if (/^https:\/\/[a-z0-9.-]+$/i.test(explicit) && !explicit.includes(".i.posthog.com")) return explicit;
  const ingest = String(env.NEXT_PUBLIC_POSTHOG_HOST || "");
  if (ingest.includes("eu.")) return "https://eu.posthog.com";
  return "https://us.posthog.com";
}

export function reportConfig(env: Record<string, string | undefined> = process.env) {
  return {
    ga4PropertyId: String(env.GA4_PROPERTY_ID || "552874520").trim(),
    gscSiteUrl: String(env.GSC_SITE_URL || "sc-domain:arizonanotaryprep.com").trim(),
    posthogKey: String(env.POSTHOG_PERSONAL_API_KEY || "").trim(),
    posthogProjectId: String(env.POSTHOG_PROJECT_ID || "").trim(),
    posthogHost: posthogQueryHost(env),
    vercelToken: String(env.VERCEL_ACCESS_TOKEN || "").trim(),
    vercelProjectId: String(env.VERCEL_PROJECT_ID || "").trim(),
    vercelTeamId: String(env.VERCEL_TEAM_ID || "").trim(),
  };
}
