import postgres from "postgres";
import { timingSafeEqual } from "node:crypto";

// Run via the linked Vercel project's env run --environment production.
// Prints only fixed identifiers, booleans, status codes, and schema metadata.
if (process.env.LIFETIME_AUDIT_SOURCE !== "vercel-production") {
  console.error("Run through Vercel Production environment injection.");
  process.exit(1);
}

const env = process.env;
const productId = "pro_01m7q8c7xbe978746wx7n1t5d9";
const priceId = "pri_01m7q8g48pcgkxncf7jbh2hq0q";
const endpoint = "https://arizona-lac.vercel.app/api/billing/webhook/";
const events = ["transaction.completed", "adjustment.created", "adjustment.updated"];
const config = {
  productMatches: env.PADDLE_LIFETIME_PRODUCT_ID === productId,
  priceMatches: env.PADDLE_LIFETIME_PRICE_ID === priceId,
  policyMatches: env.LIFETIME_REFUND_POLICY_VERSION === "2026-11-lifetime-v2",
  salesEnabled: env.LIFETIME_CHECKOUT_ENABLED === "1",
  liveProvider: env.MOR_PROVIDER === "paddle" && env.PADDLE_ENVIRONMENT === "production",
  liveBrowser: env.NEXT_PUBLIC_PADDLE_ENV === "production" && Boolean(env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN?.startsWith("live_")),
  serverKeyInjected: Boolean(env.PADDLE_API_KEY),
  webhookSecretInjected: Boolean(env.PADDLE_WEBHOOK_SECRET),
  databaseInjected: Boolean(env.DATABASE_URL),
};

async function paddleGet(path) {
  try {
    const response = await fetch(`https://api.paddle.com${path}`, {
      headers: { Authorization: `Bearer ${env.PADDLE_API_KEY.trim()}`, "Paddle-Version": "1" },
      signal: AbortSignal.timeout(10000),
      redirect: "error",
    });
    return { status: response.status, data: response.ok ? (await response.json()).data : undefined };
  } catch {
    return { status: "request_failed" };
  }
}

async function auditPaddle() {
  if (!env.PADDLE_API_KEY || !config.liveProvider) return { status: "configured_live_key_unavailable" };
  const [price, settings, delivery] = await Promise.all([
    paddleGet(`/prices/${priceId}?include=product`),
    paddleGet("/notification-settings?active=true&per_page=50"),
    paddleGet("/notifications?per_page=50"),
  ]);
  const priceData = price.data;
  const destination = Array.isArray(settings.data) ? settings.data.find(row => row.destination === endpoint) : null;
  const expectedSecret = env.PADDLE_WEBHOOK_SECRET?.trim();
  const actualSecret = destination?.endpoint_secret_key;
  const matches = typeof actualSecret === "string" && Boolean(expectedSecret) &&
    Buffer.byteLength(actualSecret) === Buffer.byteLength(expectedSecret)
    ? timingSafeEqual(Buffer.from(actualSecret), Buffer.from(expectedSecret))
    : actualSecret && expectedSecret ? false : null;
  return {
    priceHttp: price.status,
    price: priceData ? {
      active: priceData.status === "active", productActive: priceData.product?.status === "active",
      productMatches: priceData.product_id === productId, priceMatches: priceData.id === priceId,
      usd2999: priceData.unit_price?.currency_code === "USD" && priceData.unit_price?.amount === "2999",
      oneTime: priceData.billing_cycle === null, quantity: priceData.quantity,
      overrides: priceData.unit_price_overrides?.length,
    } : null,
    settingsHttp: settings.status,
    destination: destination ? {
      active: destination.active, trafficSource: destination.traffic_source,
      subscriptions: Object.fromEntries(events.map(event => [event, destination.subscribed_events?.some(row =>
        (typeof row === "string" ? row : row.name) === event) ?? false])),
      sameSigningSecret: matches,
    } : null,
    notificationsHttp: delivery.status,
    sampledDelivery: destination && Array.isArray(delivery.data) ? Object.fromEntries(events.map(event => [
      event,
      delivery.data.find(row => row.notification_setting_id === destination.id && row.type === event &&
        row.status === "delivered" && row.origin === "event")?.delivered_at ?? null,
    ])) : null,
  };
}

async function auditDatabase() {
  if (!env.DATABASE_URL) return { status: "production_database_not_injected" };
  let sql;
  try {
    const endpoint = new URL(env.DATABASE_URL).hostname;
    sql = postgres(env.DATABASE_URL, { ssl: "require", max: 1, connect_timeout: 8, connection: { statement_timeout: 8000 } });
    return await sql.begin("read only", async tx => {
      const [schema] = await tx`
        select current_database() as database_name, current_schema() as schema_name,
          to_regclass('entitlements') is not null as entitlements,
          to_regclass('provider_refunds') is not null as provider_refunds,
          to_regclass('schema_migrations') is not null as ledger,
          (select is_nullable from information_schema.columns where table_schema = current_schema()
            and table_name = 'entitlements' and column_name = 'expires_at') as expiry_nullable,
          exists(select 1 from pg_constraint where conrelid = to_regclass('entitlements')
            and convalidated and conname = 'entitlements_lifetime_window_check') as lifetime_constraint,
          exists(select 1 from information_schema.columns where table_schema = current_schema()
            and table_name = 'provider_refunds' and column_name = 'reason') as refund_reason
      `;
      const migrations = schema.ledger ? (await tx`select id from schema_migrations order by id`).map(row => row.id) : [];
      return { status: "read_only_ok", endpoint, schema, migrations };
    });
  } catch (error) {
    const code = typeof error?.code === "string" && /^[A-Z0-9_]{1,30}$/.test(error.code) ? error.code : "READ_FAILED";
    return { status: "read_only_failed", code };
  } finally {
    await sql?.end({ timeout: 2 }).catch(() => undefined);
  }
}

const [paddle, database] = await Promise.all([auditPaddle(), auditDatabase()]);
console.log(JSON.stringify({ config, paddle, database }, null, 2));
