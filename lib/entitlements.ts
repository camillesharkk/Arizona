import { stateProCovers, stateProExpiry, NC_PRO_PRODUCT } from "./state-pro.ts";
import type { Question } from "@/lib/types";
import { publishedQuestions } from "@/data/questions";
import { getStore } from "@/lib/store";
import type { EntitlementRow } from "@/lib/store/types";
import {
  AI_LIMIT_FREE,
  AI_LIMIT_PRO,
  AZ_PRO_PRODUCT,
  AZ_STATE,
  FREE_FULL_EXAMS,
  PRO_DURATION_DAYS,
} from "@/lib/product";
import { isSiteProProduct, SITE_PRO_PRODUCT_CODE } from "@/lib/pro-products";
import { accountProCovers, accountProExpiry, ctProCovers } from "./account-pro.ts";

export { accountProCovers, accountProExpiry };

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
  const now = new Date();
  if (!accountProCovers(rows, now)) return null;
  const expiry = accountProExpiry(rows, now);
  const current = rows
    .filter((row) => row.state !== "CT" && row.state !== "IN" && row.state !== "NC" && isSiteProProduct(row.productCode) && row.status === "active" && new Date(row.startsAt).getTime() <= now.getTime() && new Date(row.expiresAt).getTime() > now.getTime())
    .sort((a, b) => new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime())[0];
  if (!current || !expiry) return null;
  return { ...current, state: "ALL", expiresAt: expiry.toISOString() };
}

export function servingEntitlements<T extends { startsAt: string; expiresAt: string }>(
  ents: T[],
  now = new Date()
): T[] {
  const t = now.getTime();
  return ents.filter((e) => new Date(e.startsAt).getTime() <= t && new Date(e.expiresAt).getTime() > t);
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

export function indianaEntitlement(rows: EntitlementRow[], now = new Date()): EntitlementRow | null {
  return rows.filter(row => row.productCode === IN_PRO_PRODUCT && row.state === "IN" && row.status === "active"
    && new Date(row.startsAt).getTime() <= now.getTime() && new Date(row.expiresAt).getTime() > now.getTime())
    .sort((a, b) => Date.parse(b.expiresAt) - Date.parse(a.expiresAt))[0] ?? null;
}

export async function getIndianaEntitlement(userId: string | null | undefined): Promise<EntitlementRow | null> {
  if (!userId) return null;
  return indianaEntitlement(await (await getStore()).listEntitlements(userId));
}

export async function hasStatePro(userId: string | null | undefined, _state?: string) {
  if (_state === "CT") return userId ? ctProCovers(await (await getStore()).listEntitlements(userId)) : false;
  if (_state === "NC") return userId ? stateProCovers(await (await getStore()).listEntitlements(userId), "NC") : false;
  if (_state === "IN") return Boolean(await getIndianaEntitlement(userId));
  return hasArizonaPro(userId);
}

export async function refreshPlanCache(userId: string) {
  const store = await getStore();
  const row = await getArizonaEntitlement(userId);
  await store.updateUser(userId, {
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
    if ((opts.state === "IN") !== (existing.productCode === IN_PRO_PRODUCT && existing.state === "IN")) throw new Error("order_state_mismatch");
    return { ok: true, duplicate: true, entitlement: existing };
  }
  const rows = await store.listEntitlements(opts.userId);
  const now = new Date();
  const latestIndiana = rows.filter(row => row.productCode === IN_PRO_PRODUCT && row.state === "IN" && row.status === "active")
    .sort((a,b) => Date.parse(b.expiresAt)-Date.parse(a.expiresAt))[0] ?? null;
  const state = opts.state === "NC" ? "NC" : opts.state === "IN" ? "IN" : "ALL";
  const window = nextProWindow(state === "IN" ? (latestIndiana ? new Date(latestIndiana.expiresAt) : null) : stateProExpiry(rows, state, now), now);
  const entitlement = await store.insertEntitlement({
    userId: opts.userId,
    productCode: state === "NC" ? NC_PRO_PRODUCT : state === "IN" ? IN_PRO_PRODUCT : SITE_PRO_PRODUCT_CODE,
    state,
    status: "active",
    startsAt: window.startsAt.toISOString(),
    expiresAt: window.expiresAt.toISOString(),
    provider: opts.provider,
    providerOrderId: opts.providerOrderId,
    providerCustomerId: opts.providerCustomerId ?? null,
  });
  if (state !== "NC") await refreshPlanCache(opts.userId);
  return { ok: true, duplicate: false, entitlement };
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

export async function packFullExamCounts(userId: string) {
  const store = await getStore();
  const exams = await store.listExams(userId);
  const count = (prefix: string) => exams.filter((exam) => exam.mode === prefix).length;
  return { NY: count("ny-full"), PA: count("pa-full"), LA: count("la-full"), CT: count("ct-full"), NC: count("nc-full"), IN: count("in-full") };
}
