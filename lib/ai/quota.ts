import type { Store } from "../store/types.ts";
import { AI_LIMIT_FREE } from "../product.ts";

export function utcAiDay(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

export async function readAiUsage(store: Store, userId: string, limit: number, day = utcAiDay()) {
  const used = await store.aiCount(userId, day);
  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
  };
}

export async function deliverTutorAnswer(opts: {
  store: Store;
  userId: string;
  limit: number;
  text: string;
  day?: string;
  onExceedFreeQuota?: (used: number) => Promise<void>;
}) {
  const day = opts.day ?? utcAiDay();
  const current = await readAiUsage(opts.store, opts.userId, opts.limit, day);
  if (!opts.text.trim()) {
    return { ok: false as const, reason: "empty" as const, ...current };
  }
  const consumed = await opts.store.consumeAiQuota(opts.userId, day, opts.limit);
  if (!consumed.ok) {
    return {
      ok: false as const,
      reason: "limit" as const,
      used: consumed.used,
      limit: consumed.limit,
      remaining: 0,
    };
  }
  if (consumed.used > AI_LIMIT_FREE && opts.onExceedFreeQuota) {
    await opts.onExceedFreeQuota(consumed.used);
  }
  return {
    ok: true as const,
    used: consumed.used,
    limit: consumed.limit,
    remaining: consumed.remaining,
  };
}
