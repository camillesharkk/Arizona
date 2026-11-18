import { freeStateCatalog } from './free-state-catalog.ts';
import type { Question } from "@/lib/types";
import { publishedQuestions } from "@/data/questions";
import { getStore } from "@/lib/store";
import type { EntitlementRow, ExamRow } from "@/lib/store/types";
import {
  AI_LIMIT_FREE,
  AI_LIMIT_PRO,
  AZ_PRO_PRODUCT,
  AZ_STATE,
  FREE_FULL_EXAMS,
  PRO_DURATION_DAYS,
} from "@/lib/product";
import { isLifetimeProProduct, isSiteProProduct, SITE_PRO_PRODUCT_CODE } from "@/lib/pro-products";
import { accountTimedProExpiry, activeLifetimePro } from "./account-pro.ts";

export { accountProCovers, accountProExpiry, hasLifetimePro } from "./account-pro.ts";

export type Plan = "free" | "pro";

export type SessionUser = {
  id: string;
  email: string;
  plan: Plan;
  planStatus: string;
  emailVerified: boolean;
  name: string | null;
  deviceSessionId?: string | null;
};

export { AZ_PRO_PRODUCT, AZ_STATE, PRO_DURATION_DAYS, AI_LIMIT_FREE, AI_LIMIT_PRO, FREE_FULL_EXAMS, FREE_WEAK_PREVIEW, FREE_FLASHCARD_PREVIEW } from "@/lib/product";

export async function getArizonaEntitlement(userId: string | null | undefined, entitlements?: EntitlementRow[]): Promise<EntitlementRow | null> {
  if (!userId) return null;
  const store = await getStore();
  const rows = entitlements ?? await store.listEntitlements(userId);
  const entitlement = servingAccountEntitlement(rows, new Date());
  return entitlement ? { ...entitlement, state: "ALL" } : null;
}

export function servingEntitlements<T extends { startsAt: string; expiresAt: string | null }>(
  ents: T[],
  now = new Date()
): T[] {
  const t = now.getTime();
  return ents.filter((e) => Date.parse(e.startsAt) <= t && (e.expiresAt === null || Date.parse(e.expiresAt) > t));
}

export function nextProWindow(latestExpiry: Date | null, now = new Date(), days = PRO_DURATION_DAYS) {
  const start = latestExpiry && latestExpiry > now ? latestExpiry : now;
  return {
    startsAt: start,
    expiresAt: new Date(start.getTime() + days * 24 * 60 * 60 * 1000),
  };
}

export async function hasArizonaPro(userId: string | null | undefined) {
  const row = await getArizonaEntitlement(userId);
  return Boolean(row);
}

export const IN_PRO_PRODUCT = "in_exam_pro_60d";

function servingAccountEntitlement(rows: EntitlementRow[], now: Date): EntitlementRow | null {
  const lifetime = activeLifetimePro(rows, now);
  if (lifetime) return lifetime;
  const timed = rows.filter((row): row is EntitlementRow & { expiresAt: string } =>
    row.status === "active" && isSiteProProduct(row.productCode) && row.expiresAt !== null);
  const serving = servingEntitlements(timed, now).sort((a, b) => Date.parse(b.expiresAt) - Date.parse(a.expiresAt))[0];
  const expiry = accountTimedProExpiry(timed, now);
  return serving && expiry ? { ...serving, expiresAt: expiry.toISOString() } : null;
}

export function indianaEntitlement(rows: EntitlementRow[], now = new Date()): EntitlementRow | null {
  return servingAccountEntitlement(rows, now);
}

export async function getIndianaEntitlement(userId: string | null | undefined): Promise<EntitlementRow | null> {
  if (!userId) return null;
  return indianaEntitlement(await (await getStore()).listEntitlements(userId));
}

export async function hasStatePro(userId: string | null | undefined, _state?: string) {
  return hasArizonaPro(userId);
}

export async function refreshPlanCache(userId: string) {
  const store = await getStore();
  const row = servingAccountEntitlement(await store.listEntitlements(userId), new Date());
  await store.updatePlanCache(userId, {
    plan: row ? "pro" : "free",
    planStatus: row ? "active" : "expired",
    planExpiresAt: row?.expiresAt ?? null,
  });
}

export async function grantStatePro60d(opts: {
  userId: string;
  state?: string;
  provider: "mock" | "lemon_squeezy" | "paddle";
  providerOrderId: string;
  providerCustomerId?: string | null;
}): Promise<{ ok: true; duplicate: boolean; entitlement: EntitlementRow }> {
  const store = await getStore();
  const existing = await store.getEntitlementByProviderOrder(opts.provider, opts.providerOrderId);
  if (existing) {
    if (existing.userId !== opts.userId) throw new Error("order_user_mismatch");
    if (!isSiteProProduct(existing.productCode)) throw new Error("product_mismatch");
    return { ok: true, duplicate: true, entitlement: existing };
  }
  const rows = await store.listEntitlements(opts.userId);
  const now = new Date();
  const window = nextProWindow(accountTimedProExpiry(rows, now), now);
  const entitlement = await store.insertEntitlement({
    userId: opts.userId,
    productCode: SITE_PRO_PRODUCT_CODE,
    state: "ALL",
    status: "active",
    startsAt: window.startsAt.toISOString(),
    expiresAt: window.expiresAt.toISOString(),
    provider: opts.provider,
    providerOrderId: opts.providerOrderId,
    providerCustomerId: opts.providerCustomerId ?? null,
  });
  if (entitlement.userId !== opts.userId) throw new Error("order_user_mismatch");
  if (!isSiteProProduct(entitlement.productCode)) throw new Error("product_mismatch");
  await refreshPlanCache(opts.userId);
  return { ok: true, duplicate: false, entitlement };
}

export async function grantSitePro(opts: Parameters<typeof grantStatePro60d>[0] & { productCode: string }) {
  if (isSiteProProduct(opts.productCode)) return grantStatePro60d(opts);
  if (!isLifetimeProProduct(opts.productCode)) throw new Error("product_mismatch");

  const store = await getStore();
  const existing = await store.getEntitlementByProviderOrder(opts.provider, opts.providerOrderId);
  const entitlement = existing ?? await store.insertEntitlement({
    userId: opts.userId,
    productCode: opts.productCode,
    state: "ALL",
    status: "active",
    startsAt: new Date().toISOString(),
    expiresAt: null,
    provider: opts.provider,
    providerOrderId: opts.providerOrderId,
    providerCustomerId: opts.providerCustomerId ?? null,
  });
  if (entitlement.userId !== opts.userId) throw new Error("order_user_mismatch");
  if (!isLifetimeProProduct(entitlement.productCode) || entitlement.state !== "ALL" || entitlement.expiresAt !== null) {
    throw new Error("product_mismatch");
  }
  await refreshPlanCache(opts.userId);
  return { ok: true as const, duplicate: existing !== null, entitlement };
}

export async function grantArizonaPro60d(opts: {
  userId: string;
  provider: "mock" | "lemon_squeezy" | "paddle";
  providerOrderId: string;
  providerCustomerId?: string | null;
}) {
  return grantStatePro60d({ ...opts, state: "AZ" });
}

export async function refundArizonaOrder(userId: string, provider: string, providerOrderId: string) {
  const store = await getStore();
  await store.setEntitlementStatus(userId, provider, providerOrderId, "refunded");
  await refreshPlanCache(userId);
}

export async function canAccessQuestion(userId: string | null | undefined, q: Question) {
  if (q.is_free) return true;
  return hasStatePro(userId, q.state);
}

export async function visibleQuestions(userId: string | null | undefined) {
  const pro = await hasArizonaPro(userId);
  return publishedQuestions().filter((q) => q.is_free || pro);
}

export async function aiDailyLimit(userId: string | null | undefined, state?: string) {
  if (!userId) return 0;
  return (await hasStatePro(userId, state)) ? AI_LIMIT_PRO : AI_LIMIT_FREE;
}

export async function canUseAdvancedAnalytics(userId: string | null | undefined) {
  return hasArizonaPro(userId);
}

export async function canTakeFullExam(userId: string | null | undefined) {
  if (await hasArizonaPro(userId)) return true;
  if (!userId) return true;
  const store = await getStore();
  const exams = await store.listExams(userId);
  const full = exams.filter((e) => e.mode === "full").length;
  return full < FREE_FULL_EXAMS;
}

export async function fullExamCount(userId: string) {
  const store = await getStore();
  const exams = await store.listExams(userId);
  return exams.filter((e) => e.mode === "full").length;
}

export async function caFullExamCount(userId: string) {
  const store = await getStore();
  const exams = await store.listExams(userId);
  return exams.filter((e) => e.mode === "ca-full").length;
}

export async function hiFullExamCount(userId: string) {
  const store = await getStore();
  const exams = await store.listExams(userId);
  return exams.filter((e) => e.mode === "hi-full").length;
}

export async function packFullExamCounts(userId: string, savedExams?: ExamRow[]) {
  const exams = savedExams ?? await (await getStore()).listExams(userId);
  const count = (prefix: string) => exams.filter((exam) => exam.mode === prefix).length;
  return { ...Object.fromEntries(freeStateCatalog.map(([code]) => [code, count(`${code.toLowerCase()}-full`)])), NY: count("ny-full"), PA: count("pa-full"), LA: count("la-full"), CT: count("ct-full"), NC: count("nc-full"), IN: count("in-full") };
}
