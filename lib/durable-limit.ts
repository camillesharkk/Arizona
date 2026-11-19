import { timingSafeEqual } from "node:crypto";
import { getPgSql } from "@/lib/store/pg-store";
import { rateLimit } from "@/lib/rate-limit";

export type LimitResult = { ok: boolean; retryAfter: number; degraded: boolean };

function retrySeconds(resetAt: Date) {
  return Math.max(1, Math.ceil((resetAt.getTime() - Date.now()) / 1000));
}

/** Shared limiter. Postgres down: allow ordinary traffic, with a per-instance burst ceiling. */
export async function durableLimit(key: string, limit: number, windowMs: number): Promise<LimitResult> {
  if (process.env.PRACTICE_LIMITS === "off") return { ok: true, retryAfter: 0, degraded: true };
  const url = process.env.DATABASE_URL || "";
  if (!url.startsWith("postgres")) return burst(key, limit, windowMs);
  try {
    const sql = getPgSql();
    const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
    const [row] = await sql<{ hits: number; reset_at: Date }[]>`
      insert into rate_buckets (bucket_key, hits, reset_at)
      values (${key}, 1, now() + (${windowSeconds} * interval '1 second'))
      on conflict (bucket_key) do update set
        hits = case when rate_buckets.reset_at <= now() then 1 else rate_buckets.hits + 1 end,
        reset_at = case when rate_buckets.reset_at <= now() then excluded.reset_at else rate_buckets.reset_at end
      returning hits, reset_at
    `;
    if (!row || row.hits <= limit) return { ok: true, retryAfter: 0, degraded: false };
    return { ok: false, retryAfter: retrySeconds(new Date(row.reset_at)), degraded: false };
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (code !== "42P01") console.info(JSON.stringify({ event: "rate_limit_degraded", bucket: key.split(":")[0] }));
    return burst(key, limit, windowMs);
  }
}

function burst(key: string, limit: number, windowMs: number): LimitResult {
  // ponytail: one instance only while Postgres is unavailable. Upgrade path is the rate_buckets table.
  const limited = rateLimit(`burst:${key}`, Math.max(limit, 120), Math.min(windowMs, 60_000));
  return { ok: limited.ok, retryAfter: limited.ok ? 0 : 60, degraded: true };
}

export function internalTask(req: Request) {
  const secret = process.env.CRON_SECRET || "";
  const header = req.headers.get("authorization") || "";
  if (!secret || !header.startsWith("Bearer ")) return false;
  const got = Buffer.from(header.slice("Bearer ".length));
  const want = Buffer.from(secret);
  if (got.length !== want.length) return false;
  return timingSafeEqual(got, want);
}

export function sameOrigin(req: Request) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const origin = req.headers.get("origin");
  if (!host || !origin) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
