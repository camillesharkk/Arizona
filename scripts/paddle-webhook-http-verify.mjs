import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import path from "node:path";
import { TEST_PASSWORD, testLoader } from "./pack-test-utils.mjs";

const base = process.env.PADDLE_HTTP_BASE;
const dataDir = path.resolve(process.env.NOTARY_DATA_DIR || ".");
const secret = process.env.PADDLE_WEBHOOK_SECRET;
assert.match(base || "", /^http:\/\/127\.0\.0\.1:\d+$/);
assert.ok(dataDir.startsWith(path.resolve(".tools") + path.sep));
assert.equal(process.env.PADDLE_ENVIRONMENT, "sandbox");
assert.ok(secret?.startsWith("local-fixture-"));
assert.ok(!process.env.DATABASE_URL);

const email = "pack-free-http@example.invalid";
const load = testLoader();
const { fileStore } = load("lib/store/file-store.ts");
const user = await fileStore.getUserByEmail(email);
assert.ok(user, "Run the pack seed against this same fixture directory first");
const { createFileCommerceRepo } = load("lib/commerce/file-repo.ts");
const { createQuote } = load("lib/commerce/service.ts");
const repo = await createFileCommerceRepo();
const productId = process.env.PADDLE_LIFETIME_PRODUCT_ID;
const priceId = process.env.PADDLE_LIFETIME_PRICE_ID;
const productCode = "all_state_pro_lifetime";
const transactionId = "txn_" + randomUUID().replaceAll("-", "");
const checkoutAttemptId = randomUUID();
const now = new Date();
const quoted = await createQuote(repo, { userId: user.id, applyCredit: false, policyAccepted: true, productCode, now });
assert.ok(quoted.ok);
const quote = quoted.quote;
assert.ok((await repo.claimCheckoutBinding({ quoteId: quote.id, provider: "paddle", expiresAt: quote.expiresAt, now: now.toISOString() })).created);
assert.ok(await repo.completeCheckoutBinding({ quoteId: quote.id, providerCheckoutId: transactionId, checkoutUrl: "paddle-overlay:" + transactionId }));

const auth = await fetch(base + "/api/auth/login/", {
  method: "POST", headers: { "content-type": "application/json" },
  body: JSON.stringify({ email, password: TEST_PASSWORD }),
});
assert.equal(auth.status, 200);
const cookie = auth.headers.getSetCookie().map(row => row.split(";")[0]).join("; ");
async function access() {
  const response = await fetch(base + "/api/billing/access/", { headers: { cookie } });
  assert.equal(response.status, 200);
  return response.json();
}
let notice = 0;
async function send(status, { invalid = false, eventDate = now, notificationId = ++notice } = {}) {
  const raw = JSON.stringify({
    event_type: "transaction.completed", notification_id: "ntf_fixture_" + notificationId, event_id: "evt_fixture_" + notificationId,
    occurred_at: eventDate.toISOString(),
    data: {
      id: transactionId, status, currency_code: "USD",
      custom_data: { user_id: user.id, quote_id: quote.id, product_code: productCode, source_state: "NY", checkout_attempt_id: checkoutAttemptId },
      items: [{ quantity: 1, price: {
        id: priceId, product_id: productId, billing_cycle: null, quantity: { minimum: 1, maximum: 1 },
        unit_price: { amount: String(quote.finalPriceCents), currency_code: "USD" },
      } }],
      payments: [],
      details: { tax_rates_used: [], line_items: [{ price_id: priceId, quantity: 1, product: { id: productId } }], totals: { total: String(quote.finalPriceCents), tax: "0" } },
    },
  });
  const timestamp = Math.floor(Date.now() / 1000);
  const hmac = createHmac("sha256", invalid ? "wrong-fixture-secret" : secret).update(timestamp + ":" + raw).digest("hex");
  const response = await fetch(base + "/api/billing/webhook/", {
    method: "POST", headers: { "Paddle-Signature": `ts=${timestamp};h1=${hmac}`, "Content-Type": "application/json" }, body: raw,
  });
  return { status: response.status, body: await response.json() };
}

assert.equal((await send("completed", { invalid: true })).status, 401);
assert.equal((await send("paid")).body.ignored, true);
assert.equal((await access()).orders.filter(row => row.providerOrderId === transactionId).length, 0);
const completed = await send("completed", { eventDate: new Date(now.getTime() - 3600_000) });
assert.equal(completed.status, 200, JSON.stringify(completed.body));
const repeated = await send("completed", { notificationId: notice });
assert.equal(repeated.status, 200);
assert.equal((await send("completed")).body.duplicate, true);
assert.equal((await send("paid", { eventDate: new Date(now.getTime() - 7200_000) })).body.ignored, true);
const after = await access();
const rows = after.orders.filter(row => row.providerOrderId === transactionId);
assert.equal(rows.length, 1);
assert.equal(rows[0].status, "paid");
assert.equal(rows[0].orderId, completed.body.orderId);
assert.equal(rows[0].amountCents, quote.finalPriceCents);
assert.ok(rows[0].entitlementId && rows[0].entitlementActive && after.lifetimePro);
console.log("Paddle signed webhook HTTP: invalid signature rejected, non-completed state ignored, delayed completion accepted, duplicate delivery and business replay idempotent, order linked to one active entitlement.");
