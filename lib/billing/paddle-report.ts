import "server-only";

import type { Adjustment, Transaction } from "@paddle/paddle-node-sdk";
import { createPaddleSdk, getPaddleCheckoutConfig } from "./paddle";

const MAX_RANGE_DAYS = 31;
const MAX_ADJUSTMENTS_SCANNED = 2_000;

export type ReportRange = {
  start: string;
  end: string;
  startIso: string;
  endIso: string;
  days: number;
  timeZone: "Asia/Shanghai";
};

type MoneyByCurrency = Record<string, number>;

function parseDate(value: string | null, name: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${name}_invalid`);
  }
  const timestamp = Date.parse(`${value}T00:00:00+08:00`);
  if (!Number.isFinite(timestamp)) throw new Error(`${name}_invalid`);
  return timestamp;
}

export function reportRange(start: string | null, end: string | null): ReportRange {
  const startMs = parseDate(start, "start");
  const endMs = parseDate(end, "end");
  const endExclusiveMs = endMs + 24 * 60 * 60 * 1000;
  const days = Math.round((endExclusiveMs - startMs) / (24 * 60 * 60 * 1000));
  if (days < 1 || days > MAX_RANGE_DAYS) throw new Error("range_invalid");
  return {
    start: String(start),
    end: String(end),
    startIso: new Date(startMs).toISOString(),
    endIso: new Date(endExclusiveMs).toISOString(),
    days,
    timeZone: "Asia/Shanghai",
  };
}

function addMoney(target: MoneyByCurrency, currency: string, amount: string | null | undefined) {
  if (!currency || !amount || !/^-?\d+$/.test(amount)) return;
  target[currency] = (target[currency] || 0) + Number(amount);
}

function presentMoney(cents: MoneyByCurrency) {
  return Object.fromEntries(
    Object.entries(cents).map(([currency, amount]) => [
      currency,
      { minorUnits: amount, formatted: `${(amount / 100).toFixed(2)} ${currency}` },
    ])
  );
}

function inside(iso: string, range: ReportRange) {
  return iso >= range.startIso && iso < range.endIso;
}

export async function buildPaddleOperationsReport(range: ReportRange) {
  const config = getPaddleCheckoutConfig();
  if (!config.ok) throw new Error(config.error);
  const paddle = createPaddleSdk(config.config);

  const statusCounts: Record<string, number> = {};
  const completedGross: MoneyByCurrency = {};
  let transactionCount = 0;

  const transactions = paddle.transactions.list({
    "createdAt[GTE]": range.startIso,
    "createdAt[LT]": range.endIso,
    perPage: 200,
    orderBy: "created_at[DESC]",
  });
  for await (const transaction of transactions) {
    const item = transaction as Transaction;
    transactionCount += 1;
    statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
    if (item.status === "completed") {
      addMoney(completedGross, item.currencyCode, item.details?.totals?.grandTotal);
    }
  }

  const refunded: MoneyByCurrency = {};
  let refundCount = 0;
  let adjustmentsScanned = 0;
  const adjustments = paddle.adjustments.list({ perPage: 200, orderBy: "id[DESC]" });
  for await (const adjustment of adjustments) {
    const item = adjustment as Adjustment;
    adjustmentsScanned += 1;
    if (inside(item.createdAt, range) && item.status === "approved" && item.action === "refund") {
      refundCount += 1;
      addMoney(refunded, item.currencyCode, item.totals?.total);
    }
    if (item.createdAt < range.startIso || adjustmentsScanned >= MAX_ADJUSTMENTS_SCANNED) break;
  }

  return {
    generatedAt: new Date().toISOString(),
    environment: config.config.environment,
    range,
    transactions: {
      created: transactionCount,
      byStatus: statusCounts,
      completedGross: presentMoney(completedGross),
    },
    refunds: {
      approved: refundCount,
      amount: presentMoney(refunded),
    },
    privacy: {
      includesCustomerDetails: false,
      includesTransactionIds: false,
      includesUserIds: false,
    },
  };
}
