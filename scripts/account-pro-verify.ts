import { accountProExpiry, accountProCovers } from "../lib/account-pro.ts";
import type { EntitlementRow } from "../lib/store/types.ts";

let failures = 0;
function ok(msg: string) { console.log("OK   ", msg); }
function fail(msg: string) { failures += 1; console.error("FAIL ", msg); }

const now = new Date("2026-11-07T00:00:00.000Z");
const day = 24 * 60 * 60 * 1000;

function row(partial: Partial<EntitlementRow> & Pick<EntitlementRow, "providerOrderId" | "state" | "expiresAt">): EntitlementRow {
  return {
    id: partial.providerOrderId,
    userId: "u",
    productCode: "az_exam_pro_60d",
    status: "active",
    startsAt: now.toISOString(),
    provider: "paddle",
    providerCustomerId: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    ...partial,
  };
}

const single = [row({ providerOrderId: "txn_az", state: "AZ", expiresAt: new Date(now.getTime() + 40 * day).toISOString() })];
const singleExpiry = accountProExpiry(single, now);
if (!singleExpiry || singleExpiry.toISOString() !== single[0].expiresAt) fail("one purchase changed the original expiry");
else ok("one existing purchase keeps its original expiry");
if (!accountProCovers(single, now)) fail("existing AZ purchase did not cover the account");
else ok("existing AZ purchase covers every state");

const parallel = [
  row({ providerOrderId: "txn_az", state: "AZ", expiresAt: new Date(now.getTime() + 40 * day).toISOString() }),
  row({ providerOrderId: "txn_hi", state: "HI", startsAt: now.toISOString(), expiresAt: new Date(now.getTime() + 20 * day).toISOString() }),
];
const merged = accountProExpiry(parallel, now);
const mergedAgain = accountProExpiry(parallel, now);
if (!merged || merged.getTime() !== now.getTime() + 60 * day) fail("parallel purchases were not added");
else ok("separate state purchases add their remaining time");
if (mergedAgain?.getTime() !== merged?.getTime()) fail("reading the expiry twice added time");
else ok("reading the account expiry again does not add time");

const dup = [
  row({ providerOrderId: "txn_same", state: "AZ", expiresAt: new Date(now.getTime() + 40 * day).toISOString() }),
  row({ providerOrderId: "txn_same", state: "HI", expiresAt: new Date(now.getTime() + 40 * day).toISOString() }),
];
const once = accountProExpiry(dup, now);
if (!once || once.toISOString() !== dup[0].expiresAt) fail("the same order was counted twice");
else ok("duplicate rows from one order count once");

const refunded = [
  row({ providerOrderId: "txn_az", state: "AZ", expiresAt: new Date(now.getTime() + 40 * day).toISOString() }),
  row({ providerOrderId: "txn_hi", state: "HI", status: "refunded", expiresAt: new Date(now.getTime() + 20 * day).toISOString() }),
];
const afterRefund = accountProExpiry(refunded, now);
if (!afterRefund || afterRefund.toISOString() !== refunded[0].expiresAt) fail("refund changed the other purchase");
else ok("refund removes only that order");

const stackedStart = merged && merged > now ? merged : now;
const stacked = { startsAt: stackedStart, expiresAt: new Date(stackedStart.getTime() + 60 * day) };
if (stacked.expiresAt.getTime() - stacked.startsAt.getTime() !== 60 * day || stacked.startsAt.getTime() !== merged!.getTime()) {
  fail("renewal did not add 60 days after the current expiry");
} else ok("renewal adds 60 days after the current expiry");

const expiredStart = now;
const expired = { startsAt: expiredStart, expiresAt: new Date(expiredStart.getTime() + 60 * day) };
if (expired.startsAt.getTime() !== now.getTime() || expired.expiresAt.getTime() - now.getTime() !== 60 * day) {
  fail("expired purchase did not start a new 60 days");
} else ok("an expired purchase starts 60 days from payment");

if (failures) {
  console.error(`account-pro-verify failed (${failures})`);
  process.exit(1);
}
console.log("account-pro-verify passed");
