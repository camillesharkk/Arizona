import type { DeviceRepo } from "./repo.ts";
import type { DeviceActivationRow, DeviceSessionRow } from "./types.ts";

function iso(v: unknown): string {
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

function mapSession(r: Record<string, unknown>): DeviceSessionRow {
  return {
    id: String(r.id),
    userId: String(r.user_id),
    deviceTokenHash: String(r.device_token_hash),
    deviceLabel: String(r.device_label),
    userAgentSummary: r.user_agent_summary ? String(r.user_agent_summary) : null,
    createdAt: iso(r.created_at),
    lastSeenAt: iso(r.last_seen_at),
    revokedAt: r.revoked_at ? iso(r.revoked_at) : null,
  };
}

export function createPgDeviceRepo(sql: any): DeviceRepo {
  return {
    async getSession(id) {
      const rows = await sql`select * from device_sessions where id = ${id} limit 1`;
      return rows[0] ? mapSession(rows[0]) : null;
    },
    async getByTokenHash(userId, hash) {
      const rows = await sql`
        select * from device_sessions
        where user_id = ${userId} and device_token_hash = ${hash}
        limit 1
      `;
      return rows[0] ? mapSession(rows[0]) : null;
    },
    async listSessions(userId) {
      const rows = await sql`select * from device_sessions where user_id = ${userId}`;
      return (rows as Record<string, unknown>[]).map(mapSession);
    },
    async insertSession(row) {
      await sql`insert into device_sessions (
        id, user_id, device_token_hash, device_label, user_agent_summary, created_at, last_seen_at, revoked_at
      ) values (
        ${row.id}, ${row.userId}, ${row.deviceTokenHash}, ${row.deviceLabel}, ${row.userAgentSummary},
        ${row.createdAt}, ${row.lastSeenAt}, ${row.revokedAt}
      )`;
    },
    async touchSession(id, at, label, summary) {
      if (label !== undefined || summary !== undefined) {
        await sql`
          update device_sessions
          set last_seen_at = ${at},
              device_label = coalesce(${label ?? null}, device_label),
              user_agent_summary = coalesce(${summary ?? null}, user_agent_summary)
          where id = ${id}
        `;
        return;
      }
      await sql`update device_sessions set last_seen_at = ${at} where id = ${id}`;
    },
    async unrevokeSession(id, at) {
      const rows = await sql`
        update device_sessions
        set revoked_at = null, last_seen_at = ${at}
        where id = ${id}
        returning id
      `;
      return rows.length > 0;
    },
    async revokeSession(id, userId, at) {
      const rows = await sql`
        update device_sessions
        set revoked_at = ${at}
        where id = ${id} and user_id = ${userId} and revoked_at is null
        returning id
      `;
      return rows.length > 0;
    },
    async revokeOthers(userId, keepId, at) {
      const rows = await sql`
        update device_sessions
        set revoked_at = ${at}
        where user_id = ${userId} and id <> ${keepId} and revoked_at is null
        returning id
      `;
      return rows.length;
    },
    async revokeAll(userId, at) {
      const rows = await sql`
        update device_sessions
        set revoked_at = ${at}
        where user_id = ${userId} and revoked_at is null
        returning id
      `;
      return rows.length;
    },
    async insertActivation(row: DeviceActivationRow) {
      await sql`insert into device_activations (id, user_id, device_session_id, at)
        values (${row.id}, ${row.userId}, ${row.deviceSessionId}, ${row.at})`;
    },
    async countActivationsSince(userId, sinceIso) {
      const rows = await sql`
        select count(*)::int as n from device_activations
        where user_id = ${userId} and at >= ${sinceIso}::timestamptz
      `;
      return Number(rows[0]?.n || 0);
    },
    async withUserLock(userId, fn) {
      await sql`select pg_advisory_lock(hashtext(${`device:${userId}`}))`;
      try {
        return await fn();
      } finally {
        await sql`select pg_advisory_unlock(hashtext(${`device:${userId}`}))`;
      }
    },
  };
}
