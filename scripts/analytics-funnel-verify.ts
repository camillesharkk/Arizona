/** Regression tests: no network, real analytics functions with browser boundary fixtures. */
import assert from "node:assert/strict";
import { test, beforeEach, afterEach } from "node:test";
import * as analytics from "../lib/analytics.ts";
import { reconcilePurchases } from "./analytics-reconcile.ts";

const originalEnv = { ...process.env };
function storage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
}
beforeEach(() => {
  Reflect.set(process.env, "NODE_ENV", "production");
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";
  delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
  delete process.env.NEXT_PUBLIC_ANALYTICS_DEBUG;
  delete process.env.NEXT_PUBLIC_PADDLE_ENV;
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    location: new URL("https://arizonanotaryprep.com/arizona-notary-practice-test/"),
    sessionStorage: storage(), localStorage: storage(),
  } });
  analytics.resetAnalyticsDedupe();
});
afterEach(() => {
  Reflect.deleteProperty(globalThis, "window");
  for (const key of Object.keys(process.env)) if (!(key in originalEnv)) delete process.env[key];
  Object.assign(process.env, originalEnv);
});
function commands() {
  return (window.dataLayer || []).map((command) => Array.from(command as ArrayLike<unknown>));
}
function events(name: string) {
  return commands().filter((command) => command[0] === "event" && command[1] === name)
    .map((command) => command[2] as Record<string, any>);
}

test("first page and product events survive a delayed Google script, configured once before events", () => {
  analytics.trackPageView("/arizona-notary-practice-test/");
  analytics.trackAnalyticsEvent("exam_start", { mode: "quick10" });
  assert.equal(events("page_view").length, 1, "initial page_view was dropped");
  assert.equal(events("exam_start").length, 1);
  assert.equal(commands()[0][0], "js");
  assert.equal(commands()[1][0], "config");
  assert.equal(commands().filter((row) => row[0] === "config").length, 1);
});

test("checkout emits the standard ecommerce event with items, while preserving the old event", () => {
  assert.equal(typeof analytics.trackBeginCheckout, "function");
  analytics.trackBeginCheckout({ finalPriceCents: 1999, newcomerApplied: true }, "txn_test123");
  const event = events("begin_checkout")[0];
  assert.equal(event.value, 19.99);
  assert.equal(event.currency, "USD");
  assert.equal(event.items[0].item_id, "az_exam_pro_60d");
  assert.equal(event.items[0].price, 19.99);
  assert.equal(event.items[0].quantity, 1);
  assert.equal(events("checkout_start").length, 1);
});

test("purchase queues before Google is ready and reports a validated transaction only once", () => {
  const order = { transactionId: "txn_test123", valueCents: 1999 };
  assert.equal(analytics.trackPurchase(order), true);
  analytics.trackPurchase(order);
  assert.equal(events("purchase").length, 1);
  assert.equal(events("purchase")[0].transaction_id, "txn_test123");
  assert.equal(events("purchase")[0].items[0].price, 19.99);
  assert.equal(analytics.trackPurchase({ transactionId: "", valueCents: 1999 }), false);
  assert.equal(analytics.trackPurchase({ transactionId: "txn_bad", valueCents: NaN }), false);
});

test("disabled analytics never marks an unsent purchase as delivered", () => {
  delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  assert.equal(analytics.trackPurchase({ transactionId: "txn_test123", valueCents: 1999 }), false);
  assert.equal(analytics.hasRememberedPurchase("txn_test123", window.localStorage), false);
  assert.equal(commands().length, 0);
});

test("DebugView traffic is labelled internal across navigation; normal traffic is unlabelled", () => {
  window.location.href = "https://arizonanotaryprep.com/?analytics_debug=1";
  analytics.trackEvent("landing_view");
  window.location.href = "https://arizonanotaryprep.com/pricing/";
  analytics.trackEvent("pricing_view");
  assert.equal(events("landing_view")[0].debug_mode, true);
  assert.equal(events("pricing_view")[0].traffic_type, "internal");
  window.location.href = "https://arizonanotaryprep.com/?analytics_debug=0";
  analytics.trackEvent("landing_view");
  assert.equal(events("landing_view")[1].debug_mode, undefined);
  assert.equal(events("landing_view")[1].traffic_type, undefined);
});

test("upgrade source survives registration and pricing navigation", () => {
  assert.equal(typeof analytics.rememberUpgradeSource, "function");
  analytics.rememberUpgradeSource("exam_results");
  window.location.href = "https://arizonanotaryprep.com/register/";
  analytics.trackAnalyticsEvent("sign_up", { plan: "free" });
  assert.equal(events("sign_up")[0].upgrade_source, "exam_results");
  assert.equal(events("sign_up")[0].upgrade_page, "/arizona-notary-practice-test/");
});

test("distinct upgrade placements are not deduplicated as the same event", () => {
  analytics.trackAnalyticsEvent("upgrade_view", { entry_point: "header" });
  analytics.trackAnalyticsEvent("upgrade_view", { entry_point: "exam_results" });
  assert.equal(events("upgrade_view").length, 2);
});

test("a failed return can recover only its pending transaction, never an older paid order", () => {
  assert.equal(typeof analytics.recoverPendingPurchase, "function");
  analytics.trackBeginCheckout({ finalPriceCents: 1999 }, "txn_pending");
  const old = { orderId: "old", providerOrderId: "txn_old", status: "paid", amountCents: 1999, entitlementId: "ent_old" };
  assert.equal(analytics.recoverPendingPurchase([old]), false);
  assert.equal(events("purchase").length, 0);
  const paid = { ...old, orderId: "new", providerOrderId: "txn_pending", entitlementId: "ent_new" };
  assert.equal(analytics.recoverPendingPurchase([old, paid]), true);
  assert.equal(events("purchase")[0].transaction_id, "txn_pending");
  assert.equal(events("entitlement_granted").length, 1);
  analytics.recoverPendingPurchase([paid]);
  assert.equal(events("purchase").length, 1);
});

test("blocked browser storage does not suppress the first purchase or duplicate it in this page", () => {
  Object.defineProperty(window, "localStorage", { get() { throw new Error("storage denied"); } });
  const order = { transactionId: "txn_private", valueCents: 2221 };
  assert.equal(analytics.trackPurchase(order), true);
  analytics.trackPurchase(order);
  assert.equal(events("purchase").length, 1);
});

test("purchase recovery waits for its entitlement without re-emitting the purchase", () => {
  analytics.trackBeginCheckout({ finalPriceCents: 1999 }, "txn_pending");
  const order = { orderId: "new", providerOrderId: "txn_pending", status: "paid", amountCents: 1999, entitlementId: null };
  assert.equal(analytics.recoverPendingPurchase([order]), false);
  assert.equal(events("purchase").length, 1);
  assert.equal(analytics.recoverPendingPurchase([{ ...order, entitlementId: "ent_new" }]), true);
  assert.equal(events("purchase").length, 1);
  assert.equal(events("entitlement_granted").length, 1);
});

test("sandbox checkout traffic is always internal", () => {
  process.env.NEXT_PUBLIC_PADDLE_ENV = "sandbox";
  analytics.trackEvent("pricing_view");
  assert.equal(events("pricing_view")[0].traffic_type, "internal");
});

test("reconciliation distinguishes unavailable GA data from zero and accepts legacy ids", () => {
  const orders = [
    { id: "order1", provider_order_id: "txn_one", entitlement_id: "ent1" },
    { id: "order2", provider_order_id: "txn_two", entitlement_id: null },
  ];
  assert.equal(reconcilePurchases(orders, ["txn_one", "txn_two"], null).gaMissing, null);
  const report = reconcilePurchases(orders, ["txn_one", "txn_two"], ["order1", "txn_unknown"]);
  assert.deepEqual(report.gaMissing, ["txn_two"]);
  assert.deepEqual(report.gaUnmatched, ["txn_unknown"]);
  assert.deepEqual(report.missingEntitlement, ["txn_two"]);
});
