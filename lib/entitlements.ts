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
import { PRO_PRODUCTS, type ProState } from "@/lib/pro-products";

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

export async function getArizonaEntitlement(userId: string | null | undefined): Promise<EntitlementRow | null> {
  if (!userId) return null;
  const store = await getStore();
  return store.getArizonaEntitlement(userId);
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

export async function hasStatePro(userId: string | null | undefined, state: ProState) {
  if (!userId) return false;
  const store = await getStore();
  return Boolean(await store.getStateEntitlement(userId, state));
}

export async function refreshPlanCache(userId: string) {
  const store = await getStore();
  const row = await store.getArizonaEntitlement(userId);
  await store.updateUser(userId, {
    plan: row ? "pro" : "free",
    planStatus: row ? "active" : "expired",
    planExpiresAt: row?.expiresAt ?? null,
  });
}

export async function grantStatePro60d(opts: {
  userId: string;
  state: ProState;
  provider: "mock" | "lemon_squeezy" | "paddle";
  providerOrderId: string;
  providerCustomerId?: string | null;
}): Promise<{ ok: true; duplicate: boolean; entitlement: EntitlementRow }> {
  const store = await getStore();
  const existing = await store.getEntitlementByProviderOrder(opts.provider, opts.providerOrderId);
  if (existing) {
    if (existing.userId !== opts.userId || existing.state !== opts.state) {
      throw new Error("order_user_mismatch");
    }
    return { ok: true, duplicate: true, entitlement: existing };
  }
  const latestExpiry = await store.getLatestStateExpiry(opts.userId, opts.state);
  const now = new Date();
  const window = nextProWindow(latestExpiry, now);
  const entitlement = await store.insertEntitlement({
    userId: opts.userId,
    productCode: PRO_PRODUCTS[opts.state].code,
    state: opts.state,
    status: "active",
    startsAt: window.startsAt.toISOString(),
    expiresAt: window.expiresAt.toISOString(),
    provider: opts.provider,
    providerOrderId: opts.providerOrderId,
    providerCustomerId: opts.providerCustomerId ?? null,
  });
  if (opts.state === "AZ") await refreshPlanCache(opts.userId);
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
  if (q.state === "CA" || q.state === "HI" || q.state === "AZ") return hasStatePro(userId, q.state);
  return false;
}

export async function visibleQuestions(userId: string | null | undefined) {
  const pro = await hasArizonaPro(userId);
  return publishedQuestions().filter((q) => q.is_free || pro);
}

export async function aiDailyLimit(userId: string | null | undefined, state: ProState = "AZ") {
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
