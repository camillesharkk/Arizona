import { createHmac, timingSafeEqual } from "crypto";
import type { UserRow } from "@/lib/store/types";
import { getStore } from "@/lib/store";
import { siteUrl } from "@/lib/site";
import { paths } from "@/lib/paths";

export type BillingEvent =
  | { type: "purchase_completed"; eventId: string; email?: string; userId?: string; customerId?: string; subscriptionId?: string }
  | { type: "subscription_cancelled"; eventId: string; userId?: string; customerId?: string; subscriptionId?: string }
  | { type: "subscription_expired"; eventId: string; userId?: string; customerId?: string; subscriptionId?: string }
  | { type: "refund"; eventId: string; userId?: string; customerId?: string };

function provider() {
  return (process.env.MOR_PROVIDER || "mock").toLowerCase();
}

export function verifyMorSignature(raw: string, header: string | null) {
  const secret = process.env.MOR_WEBHOOK_SECRET;
  if (!secret) return provider() === "mock";
  if (!header) return false;
  const digest = createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(digest);
  const b = Buffer.from(header.replace(/^sha256=/, ""));
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function checkoutUrl(user: { id: string; email: string }) {
  const p = provider();
  if (p === "paddle" && process.env.PADDLE_PRICE_ID) {
    const u = new URL("https://buy.paddle.com/checkout");
    u.searchParams.set("price_id", process.env.PADDLE_PRICE_ID);
    u.searchParams.set("email", user.email);
    u.searchParams.set("passthrough", user.id);
    return u.toString();
  }
  if (p === "lemonsqueezy" && process.env.LEMONSQUEEZY_CHECKOUT_URL) {
    const u = new URL(process.env.LEMONSQUEEZY_CHECKOUT_URL);
    u.searchParams.set("checkout[email]", user.email);
    u.searchParams.set("checkout[custom][user_id]", user.id);
    return u.toString();
  }
  return `${siteUrl()}${paths.pricing}?checkout=mock&uid=${encodeURIComponent(user.id)}`;
}

export async function applyBillingEvent(event: BillingEvent) {
  const store = await getStore();
  const duplicate = await store.seenWebhook(event.eventId, provider());
  if (duplicate) return { ok: true, duplicate: true };

  let user: UserRow | null = null;
  if (event.userId) user = await store.getUserById(event.userId);
  if (!user && "email" in event && event.email) user = await store.getUserByEmail(event.email.toLowerCase());

  if (!user) return { ok: false, error: "user_not_found" };

  if (event.type === "purchase_completed") {
    await store.updateUser(user.id, {
      plan: "pro",
      planStatus: "active",
      billingCustomerId: event.customerId || user.billingCustomerId,
      billingSubscriptionId: event.subscriptionId || user.billingSubscriptionId,
    });
  }
  if (event.type === "subscription_cancelled") {
    await store.updateUser(user.id, { planStatus: "canceled", plan: "free" });
  }
  if (event.type === "subscription_expired" || event.type === "refund") {
    await store.updateUser(user.id, { plan: "free", planStatus: event.type === "refund" ? "refunded" : "expired" });
  }
  return { ok: true, duplicate: false };
}

export function parsePaddleLike(body: Record<string, unknown>): BillingEvent | null {
  const eventId = String(body.event_id || body.id || body.alert_id || Date.now());
  const type = String(body.event_type || body.alert_name || body.type || "");
  const custom = (body.passthrough || body.custom_data || {}) as Record<string, string>;
  const userId = String(custom.user_id || body.passthrough || "");
  const email = String(body.email || body.customer_email || "");
  if (/transaction\.completed|order_created|subscription_payment_succeeded|purchase/i.test(type)) {
    return { type: "purchase_completed", eventId, userId, email, customerId: String(body.customer_id || ""), subscriptionId: String(body.subscription_id || "") };
  }
  if (/subscription\.canceled|subscription_cancelled/i.test(type)) {
    return { type: "subscription_cancelled", eventId, userId, customerId: String(body.customer_id || "") };
  }
  if (/expired|past_due/i.test(type)) {
    return { type: "subscription_expired", eventId, userId };
  }
  if (/refund/i.test(type)) {
    return { type: "refund", eventId, userId };
  }
  return null;
}
