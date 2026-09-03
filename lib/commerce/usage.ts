import "server-only";
import { getStore } from "@/lib/store";
import { hasArizonaPro } from "@/lib/entitlements";
import { getCommerceRepo } from "./index.ts";
import { markProUsed } from "./service.ts";

export const PRO_USAGE_FEATURES = [
  "pro_question",
  "full_exam_extra",
  "ai_tutor_pro_quota",
  "flashcards_full",
  "weak_areas",
  "advanced_analytics",
] as const;

export type ProUsageFeature = (typeof PRO_USAGE_FEATURES)[number];

export async function recordProUsage(userId: string, featureCode: ProUsageFeature) {
  const entitled = await hasArizonaPro(userId);
  if (!entitled) return { recorded: false, reason: "not_entitled" as const };
  const store = await getStore();
  const ents = await store.listActiveArizonaEntitlements(userId);
  if (!ents.length) return { recorded: false, reason: "no_active_entitlement" as const };
  const repo = await getCommerceRepo();
  return markProUsed(repo, {
    userId,
    featureCode,
    entitlements: ents.map((e) => ({ id: e.id, startsAt: e.startsAt, expiresAt: e.expiresAt })),
  });
}
