/**
 * Server-only PostHog capture and query config.
 * POSTHOG_PERSONAL_API_KEY is read only in this module. Do not import it from client components.
 * Capture uses the project key (NEXT_PUBLIC_POSTHOG_KEY). The personal key is for later server queries only.
 * Webhook and checkout events are best-effort: a PostHog failure must not change Paddle fulfillment.
 * GA4 has no Measurement Protocol secret here, so server events are delivered to PostHog only.
 */
import { AZ_PRO_PRODUCT_CODE } from "./pricing/catalog.ts";
import { posthogQueryHost } from "./operations/config.ts";
import {
  ANALYTICS_SITE,
  ANALYTICS_STATE,
  applyCommonParams,
  fulfillmentAnalyticsEvents,
  isInternalUserId,
  parsePosthogHost,
  parsePosthogProjectKey,
  sanitizeEventParams,
  shouldSendProductAnalytics,
} from "./analytics.ts";

export function readPosthogQueryConfig(env: Record<string, string | undefined> = process.env) {
  const personalApiKey = String(env.POSTHOG_PERSONAL_API_KEY || "").trim();
  const projectId = String(env.POSTHOG_PROJECT_ID || "").trim();
  const host = posthogQueryHost(env);
  return {
    personalApiKey: personalApiKey || null,
    projectId: projectId || null,
    host,
    configured: Boolean(personalApiKey && projectId && host),
  };
}

export async function trackServerAnalyticsEvent(
  name: string,
  distinctId: string,
  params?: Record<string, unknown>
) {
  try {
    if (!shouldSendProductAnalytics({ hostname: "" })) return;
    if (!isInternalUserId(distinctId)) return;
    const key = parsePosthogProjectKey(process.env.NEXT_PUBLIC_POSTHOG_KEY);
    const host = parsePosthogHost(process.env.NEXT_PUBLIC_POSTHOG_HOST);
    if (!key || !host) return;
    const { PostHog } = await import("posthog-node");
    const client = new PostHog(key, { host, flushAt: 1, flushInterval: 0 });
    try {
      client.capture({
        distinctId,
        event: name,
        properties: applyCommonParams(sanitizeEventParams(params)),
      });
    } finally {
      await client.shutdown();
    }
  } catch {
    /* best-effort */
  }
}

export function reportCheckoutCreate(ok: boolean, userId: string) {
  void trackServerAnalyticsEvent(ok ? "checkout_create_success" : "checkout_create_failed", userId, {
    product_code: AZ_PRO_PRODUCT_CODE,
    plan: "free",
    state: ANALYTICS_STATE,
    site: ANALYTICS_SITE,
  });
}

export function reportPaddleFulfillment(input: {
  userId: string;
  duplicate: boolean;
  orderConfirmed: boolean;
  entitlementId?: string | null;
  entitlementFailed?: boolean;
}) {
  const events = fulfillmentAnalyticsEvents(input);
  for (const name of events) {
    void trackServerAnalyticsEvent(name, input.userId, {
      product_code: AZ_PRO_PRODUCT_CODE,
      plan: "pro",
      state: ANALYTICS_STATE,
      site: ANALYTICS_SITE,
    });
  }
}
