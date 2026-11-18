import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import postgres from "postgres";
import { accountProCovers, accountProExpiry, hasLifetimePro } from "../lib/account-pro.ts";
import { deleteUserAccount } from "../lib/auth/deletion.ts";
import { createPgCommerceRepo } from "../lib/commerce/pg-repo.ts";
import { completeNonRestoringRefund, confirmPaidOrder, createQuote } from "../lib/commerce/service.ts";
import { createMemoryDeviceRepo } from "../lib/devices/repo.ts";
import { LIFETIME_PRO_PRODUCT_CODE } from "../lib/pro-products.ts";
import { stateProCovers } from "../lib/state-pro.ts";
import { testLoader } from "./pack-test-utils.mjs";

const previewHost = "ep-still-voice-a74guk0q.ap-southeast-2.aws.neon.tech";
function previewConnection(raw) {
  let uri;
  try {
    uri = new URL(raw.trim());
  } catch {
    throw new Error("Malformed Lifetime preview database URL");
  }
  assert.ok(["postgres:", "postgresql:"].includes(uri.protocol), "Expected a PostgreSQL URL");
  assert.equal(uri.hostname, previewHost, "Expected the dedicated Lifetime preview host");
  assert.equal(uri.pathname, "/neondb", "Expected the dedicated preview database name");
  assert.ok(!uri.port || uri.port === "5432", "Expected the PostgreSQL preview port");
  assert.ok(uri.username && uri.password, "Expected credentials for the preview database");
  return {
    host: previewHost, database: "neondb", port: 5432,
    username: decodeURIComponent(uri.username), password: decodeURIComponent(uri.password),
    max: 1, ssl: "require", connect_timeout: 10, onnotice() {},
  };
}
assert.throws(() => previewConnection("postgresql://user:pass@production.invalid/neondb"), /dedicated Lifetime preview host/);
assert.throws(() => previewConnection("postgresql://user:pass@" + previewHost + "/other"), /dedicated preview database name/);

const raw = process.env.LIFETIME_QA_DATABASE_URL
  || await readFile(new URL("../../preview-database-url.txt", import.meta.url), "utf8");
const connection = previewConnection(raw);
const schema = "lifetime_qa_" + randomUUID().replaceAll("-", "");
const operator = postgres(connection);
const clients = [0, 1].map(() => postgres({
  ...connection,
  connection: { options: "-c search_path=" + schema },
}));
const [firstSql, secondSql] = clients;
let created = false;
try {
  await operator`create schema ${operator(schema)}`;
  created = true;
  for (const sql of clients) {
    const [scope] = await sql`select current_schema() as schema, current_database() as database`;
    assert.deepEqual({ ...scope }, { schema, database: "neondb" });
  }
  await firstSql`create table schema_migrations (id text primary key)`;
  for (const file of [
    "001_init", "002_email_reminders", "003_entitlements", "004_commerce", "005_credits_devices",
    "006_referral_reversals", "007_account_lifecycle", "008_provider_checkout_bindings", "009_paddle_provider",
    "013_question_review", "014_study_plan", "018_lifetime_entitlements",
  ]) {
    const source = await readFile(new URL("../db/migrations/" + file + ".sql", import.meta.url), "utf8");
    await firstSql.begin(async sql => {
      await sql.unsafe(source);
      await sql`insert into schema_migrations (id) values (${file})`;
    });
  }

  const [column] = await firstSql`select is_nullable from information_schema.columns
    where table_schema = ${schema} and table_name = 'entitlements' and column_name = 'expires_at'`;
  assert.equal(column.is_nullable, "YES");
  await firstSql`insert into users(id, email, password_hash, email_verified_at)
    values ('member', 'fixture@example.invalid', 'unusable', now() - interval '7 days')`;
  const first = createPgCommerceRepo(firstSql);
  const second = createPgCommerceRepo(secondSql);
  const now = new Date();
  const start = now.toISOString();
  const end = new Date(now.getTime() + 60 * 86400000).toISOString();
  const timedCode = "az_exam_pro_60d";

  const insertGrant = async (sql, { userId = "member", provider = "paddle", providerOrderId, productCode, state = "ALL", expiresAt }) => {
    await sql`insert into entitlements(id, user_id, product_code, state, status, starts_at, expires_at, provider, provider_order_id)
      values (${providerOrderId}, ${userId}, ${productCode}, ${state}, 'active', ${start}, ${expiresAt}, ${provider}, ${providerOrderId})
      on conflict (provider, provider_order_id) do nothing`;
    const [row] = await sql`select id from entitlements where provider = ${provider} and provider_order_id = ${providerOrderId}`;
    return { entitlement: row };
  };
  for (const [productCode, state, expiresAt] of [[timedCode, "ALL", null], [LIFETIME_PRO_PRODUCT_CODE, "AZ", null], [LIFETIME_PRO_PRODUCT_CODE, "ALL", end]]) {
    await assert.rejects(() => insertGrant(firstSql, { providerOrderId: "invalid", productCode, state, expiresAt }), {
      code: "23514", constraint_name: "entitlements_lifetime_window_check",
    });
  }

  const makeQuote = async (repo, productCode = LIFETIME_PRO_PRODUCT_CODE) => {
    const result = await createQuote(repo, { userId: "member", productCode, applyCredit: false, policyAccepted: true, now });
    assert.ok(result.ok);
    return result.quote;
  };
  const claim = (repo, quote, at = start) => repo.claimCheckoutBinding({
    quoteId: quote.id, provider: "paddle", now: at, expiresAt: quote.expiresAt,
  });
  const settle = (repo, sql, quote, providerOrderId) => confirmPaidOrder(repo, {
    userId: "member", quoteId: quote.id, provider: "paddle", providerOrderId, boundFulfillment: true, now,
    grantPro: opts => insertGrant(sql, { ...opts, expiresAt: opts.productCode === LIFETIME_PRO_PRODUCT_CODE ? null : end }),
  });
  const timedQuote = await makeQuote(first, timedCode);
  const historicalQuote = await makeQuote(first, timedCode);
  assert.ok((await settle(first, firstSql, timedQuote, "txn_timed")).ok);
  const quotes = await Promise.all([makeQuote(first), makeQuote(second)]);
  assert.equal(quotes[0].finalPriceCents, 2999);
  const claims = await Promise.all([claim(first, quotes[0]), claim(second, quotes[1])]);
  assert.equal(claims.filter(result => result.created).length, 1);
  const conflict = claims.find(result => "error" in result);
  assert.equal(conflict.error, "lifetime_checkout_in_progress");
  const winner = quotes.find(quote => quote.id === conflict.quoteId);
  const loser = quotes.find(quote => quote.id !== winner.id);
  await first.completeCheckoutBinding({ quoteId: winner.id, providerCheckoutId: "txn_lifetime", checkoutUrl: "paddle-overlay:txn_lifetime" });
  assert.deepEqual(await claim(second, loser, new Date(now.getTime() + 86400000).toISOString()), conflict);

  // Persist a receipt before the paid order exists and verify concurrent inserts across connections.
  await Promise.all([first.rememberProviderRefund("paddle", "txn_lifetime"), second.rememberProviderRefund("paddle", "txn_lifetime")]);
  assert.equal(await first.getOrderByProvider("paddle", "txn_lifetime"), null);
  assert.equal(await createPgCommerceRepo(secondSql).getProviderRefundReason("paddle", "txn_lifetime"), "provider_initiated");
  assert.equal(await second.getProviderRefundReason("mock", "txn_lifetime"), null);
  assert.equal((await firstSql`select count(*)::int as count from provider_refunds`)[0].count, 1);

  const settled = await Promise.all([settle(first, firstSql, winner, "txn_lifetime"), settle(second, secondSql, winner, "txn_lifetime")]);
  assert.ok(settled.every(result => result.ok && result.order.id === settled[0].order.id));
  const order = settled[0].order;
  assert.equal((await firstSql`select count(*)::int as count from entitlements
    where provider_order_id = 'txn_lifetime' and expires_at is null`)[0].count, 1);
  assert.equal(await second.hasActiveLifetimePro("member", start), true);
  assert.deepEqual(await claim(second, loser), { created: false, error: "lifetime_already_owned" });
  assert.deepEqual(await createQuote(first, { userId: "member", applyCredit: false, policyAccepted: true, now }), {
    ok: false, error: "lifetime_already_owned",
  });
  assert.ok((await settle(second, secondSql, historicalQuote, "txn_timed_historical")).ok);

  const fetchRows = () => firstSql`select id, product_code as "productCode", state, status, provider,
    provider_order_id as "providerOrderId", starts_at as "startsAt", expires_at as "expiresAt"
    from entitlements where user_id = 'member'`.then(rows => rows.map(row => ({
      ...row, startsAt: row.startsAt.toISOString(), expiresAt: row.expiresAt?.toISOString() ?? null,
    })));
  const before = await fetchRows();
  assert.equal(hasLifetimePro(before, now), true);
  assert.equal(accountProExpiry(before, now), null);
  assert.equal(accountProCovers(before, new Date("2100-01-01")), true);
  assert.equal(stateProCovers(before, "FUTURE", new Date("2100-01-01")), true);
  assert.equal(await first.getProviderRefundReason("paddle", order.providerOrderId), "provider_initiated");
  assert.ok((await completeNonRestoringRefund(first, {
    userId: "member", orderId: order.id, reason: "provider_initiated", now,
    refundEntitlement: ({ userId, provider, providerOrderId }) => firstSql`update entitlements set status = 'refunded'
      where user_id = ${userId} and provider = ${provider} and provider_order_id = ${providerOrderId}`,
  })).ok);
  assert.equal(await second.hasActiveLifetimePro("member", start), false);
  const after = await fetchRows();
  assert.equal(after.filter(row => row.status === "active" && row.productCode === timedCode).length, 2);
  assert.ok(accountProExpiry(after, now));
  assert.equal((await claim(second, loser)).created, true);
  console.log("PostgreSQL Lifetime migration, cross-device claim, null expiry, historical access and refund receipt passed in " + schema);

  const loadStore = (client) => testLoader({ postgres: () => client })("lib/store/pg-store.ts");
  const firstStore = loadStore(firstSql);
  const secondStore = loadStore(secondSql);
  const account = await firstStore.pgStore.createUser({
    email: "delete-payment-fixture@example.invalid", passwordHash: "unusable", name: null,
  });
  const accountQuote = async (productCode, transactionId) => {
    const priced = await createQuote(first, {
      userId: account.id, productCode, applyCredit: false, policyAccepted: true, now,
    });
    assert.ok(priced.ok);
    assert.equal((await claim(first, priced.quote)).created, true);
    await first.completeCheckoutBinding({ quoteId: priced.quote.id, providerCheckoutId: transactionId,
      checkoutUrl: `paddle-overlay:${transactionId}` });
    return priced.quote;
  };
  const atomicId = "txn_atomic_rollback";
  const lateId = "txn_lifetime_after_deletion";
  const atomicQuote = await accountQuote(timedCode, atomicId);
  const lateQuote = await accountQuote(LIFETIME_PRO_PRODUCT_CODE, lateId);
  const fulfill = (scoped, quote, providerOrderId) => confirmPaidOrder(createPgCommerceRepo(scoped.getPgSql()), {
    userId: account.id, quoteId: quote.id, provider: "paddle", providerOrderId, boundFulfillment: true, now,
    grantPro: async (opts) => ({ entitlement: await scoped.pgStore.insertEntitlement({
      ...opts, state: "ALL", status: "active", startsAt: start,
      expiresAt: opts.productCode === LIFETIME_PRO_PRODUCT_CODE ? null : end, providerCustomerId: null,
    }) }),
  });

  const [{ pid: secondPid }] = await secondSql`select pg_backend_pid() as pid`;
  const staged = Promise.withResolvers();
  const rollbackNow = Promise.withResolvers();
  const rollbackError = new Error("forced PostgreSQL payment rollback");
  const firstAttempt = assert.rejects(firstStore.withPaddlePaymentTransaction(atomicId, account.id, async () => {
    const result = await fulfill(firstStore, atomicQuote, atomicId);
    assert.ok(result.ok);
    await firstStore.pgStore.updatePlanCache(account.id, { plan: "pro", planStatus: "active", planExpiresAt: end });
    staged.resolve(result.order);
    await rollbackNow.promise;
    throw rollbackError;
  }), error => error === rollbackError);
  let rolledBackOrder;
  let retry;
  try {
    rolledBackOrder = await Promise.race([staged.promise, firstAttempt]);
    // Use the same transaction ID and omit the account lock to observe the advisory lock independently.
    retry = secondStore.withPaddlePaymentTransaction(atomicId, "", async () => {
      const repo = createPgCommerceRepo(secondStore.getPgSql());
      assert.equal(await repo.getOrderByProvider("paddle", atomicId), null);
      assert.equal(await secondStore.pgStore.getEntitlementByProviderOrder("paddle", atomicId), null);
      assert.equal((await repo.getQuote(atomicQuote.id)).status, "open");
      assert.equal((await secondStore.pgStore.getUserById(account.id)).plan, "free");
      return fulfill(secondStore, atomicQuote, atomicId);
    });
    const waitForLock = async () => {
      const until = Date.now() + 10_000;
      while (Date.now() < until) {
        const [{ waiting }] = await operator`select exists (select 1 from pg_locks
          where pid = ${secondPid} and locktype = 'advisory' and not granted) as waiting`;
        if (waiting) return;
        await delay(50);
      }
      assert.fail("Second payment transaction never waited on the advisory lock");
    };
    await Promise.race([waitForLock(), retry.then(() => assert.fail("Payment replay bypassed the advisory lock"))]);
  } finally {
    rollbackNow.resolve();
    await Promise.allSettled([firstAttempt, retry]);
  }
  await firstAttempt;
  const retried = await retry;
  assert.ok(retried.ok);
  assert.notEqual(retried.order.id, rolledBackOrder.id);
  assert.notEqual(retried.order.entitlementId, rolledBackOrder.entitlementId);
  assert.equal((await firstStore.pgStore.getEntitlementByProviderOrder("paddle", atomicId)).status, "active");
  console.log("PostgreSQL payment transactions serialize matching IDs and roll back order, quote, receipt and plan changes.");

  const accountLocked = Promise.withResolvers();
  const releaseAccount = Promise.withResolvers();
  const holdAccount = firstStore.pgStore.accountTransaction(account.id, async () => {
    accountLocked.resolve();
    await releaseAccount.promise;
  });
  await accountLocked.promise;
  const adjustment = secondStore.withPaddlePaymentTransaction(atomicId, "", async () => true);
  try {
    const waiting = async () => {
      for (let attempt = 0; attempt < 20; attempt += 1) {
        const [{ locked }] = await operator`select exists (select 1 from pg_locks
          where pid = ${secondPid} and locktype = 'transactionid' and not granted) as locked`;
        if (locked) return;
        await delay(50);
      }
      assert.fail("Adjustment did not acquire the existing order owner's lock");
    };
    await Promise.race([waiting(), adjustment.then(() => assert.fail("Adjustment raced past the account lock"))]);
  } finally {
    releaseAccount.resolve();
    await Promise.allSettled([holdAccount, adjustment]);
  }
  assert.equal(await adjustment, true);

  process.env.ACCOUNT_TOMBSTONE_SECRET = "isolated-lifetime-preview-test-only";
  assert.ok((await deleteUserAccount({ store: firstStore.pgStore, commerce: first,
    devices: createMemoryDeviceRepo(), userId: account.id, now })).ok);
  assert.equal((await firstStore.pgStore.getEntitlementByProviderOrder("paddle", atomicId)).status, "revoked");
  assert.equal((await first.getOrderByProvider("paddle", atomicId)).status, "paid");
  const settleLate = () => secondStore.withPaddlePaymentTransaction(lateId, account.id,
    () => fulfill(secondStore, lateQuote, lateId));
  const late = await settleLate();
  assert.ok(late.ok);
  assert.equal(late.order.status, "paid");
  const lateReceipt = await firstStore.pgStore.getEntitlementByProviderOrder("paddle", lateId);
  assert.equal(lateReceipt.id, late.order.entitlementId);
  assert.equal(lateReceipt.status, "revoked");
  assert.equal(lateReceipt.expiresAt, null);
  assert.equal((await settleLate()).order.id, late.order.id);
  await secondStore.pgStore.updatePlanCache(account.id, { plan: "pro", planStatus: "active", planExpiresAt: null });
  assert.equal((await firstStore.pgStore.getUserById(account.id)).planStatus, "deleted");
  console.log("PostgreSQL deletion revokes existing access and keeps late payments linked to revoked receipts.");
} finally {
  try {
    if (created) {
      assert.match(schema, /^lifetime_qa_[a-f0-9]{32}$/);
      await operator`drop schema ${operator(schema)} cascade`;
      assert.equal((await operator`select count(*)::int as count from information_schema.schemata where schema_name = ${schema}`)[0].count, 0);
      console.log("Removed the isolated Lifetime verification schema.");
    }
  } finally {
    await Promise.all([...clients, operator].map(sql => sql.end({ timeout: 5 })));
  }
}
