import "server-only";
import { getStore } from "@/lib/store";
import { hasStatePro, servingEntitlements } from "@/lib/entitlements";
import { NC_PRO_PRODUCT, entitlementServesState } from "../state-pro.ts";
import { getCommerceRepo } from "./index.ts";
import { markProUsed } from "./service.ts";
import { isSiteProProduct } from "../pro-products.ts";

export const PRO_USAGE_FEATURES = [
  "pro_question",
  "full_exam_extra",
  "ai_tutor_pro_quota",
  "flashcards_full",
  "weak_areas",
  "advanced_analytics",
] as const;

export type ProUsageFeature = (typeof PRO_USAGE_FEATURES)[number];

export type ProUsageContext = { eventId: string; at: string; entitlementIds: string[] };

export async function recordProUsage(userId: string, featureCode: ProUsageFeature, event?: ProUsageContext, state = "AZ") {
  const entitled = event ? true : await hasStatePro(userId, state);
  if (!entitled) return { recorded: false, reason: "not_entitled" as const };
  const now = event ? new Date(event.at) : new Date();
  if (!Number.isFinite(now.getTime())) throw new Error("Invalid Pro usage time");
  const allowed = event ? new Set(event.entitlementIds) : null;
  const store = await getStore();
  const ents = (await store.listEntitlements(userId))
    .filter(entitlement => entitlementServesState(entitlement, state) &&
      (allowed ? allowed.has(entitlement.id) : entitlement.status === "active"));
  const serving = servingEntitlements(ents, now);
  if (!serving.length) return { recorded: false, reason: "no_active_entitlement" as const };
  const repo = await getCommerceRepo();
  return markProUsed(repo, {
    userId,
    featureCode,
    now,
    eventId: event?.eventId,
    entitlements: serving.map((e) => ({ id: e.id, startsAt: e.startsAt, expiresAt: e.expiresAt })),
  });
}
