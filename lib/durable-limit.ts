import { timingSafeEqual } from "node:crypto";
import { getPgSql } from "@/lib/store/pg-store";
import { rateLimit } from "@/lib/rate-limit";

export type LimitResult = { ok: boolean; retryAfter: number; degraded: boolean };
type LimitBucket = { key: string; limit: number; windowMs: number };

let missingTableLogged = false;
let prunedAt = 0;

function retrySeconds(resetAt: Date) {
  return Math.max(1, Math.ceil((resetAt.getTime() - Date.now()) / 1000));
}

/** Shared limiter. Postgres down: allow ordinary traffic, with a per-instance burst ceiling. */
export async function durableLimit(key: string, limit: number, windowMs: number): Promise<LimitResult> {
  const [result] = await durableLimits([{ key, limit, windowMs }]);
  return result;
}

export async function durableLimits(buckets: readonly LimitBucket[]): Promise<LimitResult[]> {
  if (process.env.PRACTICE_LIMITS === "off") return buckets.map(() => ({ ok: true, retryAfter: 0, degraded: true }));
  const fallback = () => buckets.map(({ key, limit, windowMs }) => burst(key, limit, windowMs));
  const url = process.env.DATABASE_URL || "";
  if (!url.startsWith("postgres")) return fallback();
  try {
    const sql = getPgSql();
    const incoming = JSON.stringify(buckets.map(({ key, windowMs }) => ({
      bucket_key: key,
      window_seconds: Math.max(1, Math.ceil(windowMs / 1000)),
    })));
    const rows = await sql<{ bucket_key: string; hits: number; reset_at: Date }[]>`
      insert into rate_buckets (bucket_key, hits, reset_at)
      select bucket_key, 1, now() + window_seconds * interval '1 second'
      from jsonb_to_recordset(${incoming}::text::jsonb) as input(bucket_key text, window_seconds integer)
      order by bucket_key
      on conflict (bucket_key) do update set
        hits = case when rate_buckets.reset_at <= now() then 1 else rate_buckets.hits + 1 end,
        reset_at = case when rate_buckets.reset_at <= now() then excluded.reset_at else rate_buckets.reset_at end
      returning bucket_key, hits, reset_at
    `;
    if (Date.now() - prunedAt >= 60 * 60_000) {
      prunedAt = Date.now();
      await sql`delete from rate_buckets where reset_at < now() - interval '1 day'`.catch(() => undefined);
    }
    const byKey = new Map(rows.map((row) => [row.bucket_key, row]));
    return buckets.map(({ key, limit }) => {
      const row = byKey.get(key);
      if (!row || row.hits <= limit) return { ok: true, retryAfter: 0, degraded: false };
      return { ok: false, retryAfter: retrySeconds(new Date(row.reset_at)), degraded: false };
    });
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (code === "42P01") {
      if (!missingTableLogged) {
        missingTableLogged = true;
        console.info(JSON.stringify({ event: "rate_limit_degraded", reason: "missing_table" }));
      }
    } else {
      console.info(JSON.stringify({ event: "rate_limit_degraded", bucket: buckets[0]?.key.split(":")[0] }));
    }
    return fallback();
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
