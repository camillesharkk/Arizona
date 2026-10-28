/** Read-only reconciliation. Never sends/backfills events or modifies an order. */
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import postgres from "postgres";
import { createPaddleSdk, getPaddleCheckoutConfig } from "../lib/billing/paddle.ts";
import { phoenixWindow } from "../lib/operations/windows.ts";

type Order = { id: string; provider_order_id: string; entitlement_id: string | null };
export function reconcilePurchases(orders: Order[], completedIds: string[], gaIds: string[] | null) {
  const completed = new Set(completedIds);
  const ga = gaIds === null ? null : new Set(gaIds);
  const known = new Set(orders.flatMap((o) => [o.id, o.provider_order_id]));
  const confirmed = orders.filter((o) => completed.has(o.provider_order_id));
  return {
    ordersInWindow: orders.length,
    paddleConfirmed: confirmed.length,
    notConfirmedByPaddle: orders.filter((o) => !completed.has(o.provider_order_id)).map((o) => o.provider_order_id),
    missingEntitlement: confirmed.filter((o) => !o.entitlement_id).map((o) => o.provider_order_id),
    gaStatus: ga ? "provided_export" : "unavailable",
    // Old GA events used the internal order id; new events use Paddle txn id.
    gaMissing: ga ? confirmed.filter((o) => !ga.has(o.id) && !ga.has(o.provider_order_id)).map((o) => o.provider_order_id) : null,
    gaUnmatched: ga ? [...ga].filter((id) => !known.has(id)) : null,
  };
}

async function main() {
  const [startDate, endDate, gaFile] = process.argv.slice(2);
  if (![startDate, endDate].every((s) => /^\d{4}-\d{2}-\d{2}$/.test(s || "")) || startDate > endDate) {
    throw new Error("Usage: analytics-reconcile.ts YYYY-MM-DD YYYY-MM-DD [ga-export.json]");
  }
  const window = phoenixWindow(startDate, endDate);
  if (new Date(`${startDate}T00:00:00Z`).toISOString().slice(0, 10) !== startDate ||
      new Date(`${endDate}T00:00:00Z`).toISOString().slice(0, 10) !== endDate) throw new Error("Invalid calendar date");
  let gaIds: string[] | null = null;
  if (gaFile) {
    const data = JSON.parse(readFileSync(gaFile, "utf8"));
    if (data.timeZone !== window.timezone || data.startDate !== startDate || data.endDate !== endDate ||
        !Array.isArray(data.transactionIds) || data.transactionIds.some((id: unknown) => typeof id !== "string")) {
      throw new Error("GA export must have matching dates, America/Phoenix timeZone and transactionIds[]");
    }
    gaIds = data.transactionIds;
  }
  const cfg = getPaddleCheckoutConfig();
  if (!cfg.ok || !process.env.DATABASE_URL) throw new Error("Paddle or database configuration missing");
  const sql = postgres(process.env.DATABASE_URL, { max: 1, connect_timeout: 10 });
  try {
    const orders = await sql.begin("read only", async (tx) => tx<Order[]>`
      select o.id, o.provider_order_id, e.id as entitlement_id
      from commerce_orders o left join entitlements e on e.id = o.entitlement_id
      where o.provider = 'paddle' and o.product_code = 'az_exam_pro_60d' and o.status = 'paid'
        and o.paid_at >= ${window.startIso} and o.paid_at < ${window.endIso}
    `);
    const paddle = createPaddleSdk(cfg.config);
    const completed: string[] = [];
    for (const order of orders) {
      const transaction = await paddle.transactions.get(order.provider_order_id);
      if (transaction.status === "completed") completed.push(transaction.id);
    }
    console.log(JSON.stringify({
      ...window, environment: cfg.config.environment,
      scope: "Paid database orders in this window, each checked against Paddle. Does not discover missing webhooks or send GA events.",
      ...reconcilePurchases(orders, completed, gaIds),
    }, null, 2));
  } finally {
    await sql.end({ timeout: 5 });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    // SDK errors may contain customer data; never log their bodies or credentials.
    console.error("Reconciliation failed:", error instanceof Error ? error.name : "UnknownError");
    process.exitCode = 1;
  });
}
