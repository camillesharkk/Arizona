import "server-only";
import { refreshPlanCache } from "@/lib/entitlements";
import { manualProInput, type ManualProInput } from "@/lib/manual-pro-input";
import { ManualProGrantError, manualProWindow } from "@/lib/manual-pro-window";
import { getPgSql, pgStore } from "@/lib/store/pg-store";

export { ManualProGrantError } from "@/lib/manual-pro-window";

type Actor = { kind: "administrator"; id: string } | { kind: "database-operator" };
type ReceiptRow = {
  request_id: string; user_id: string; product_code: string; state: string; days: number;
  actor_id: string; actor_kind: Actor["kind"]; reason: string; previous_expires_at: Date | null;
  starts_at: Date; expires_at: Date; created_at: Date;
};

function receipt(row: ReceiptRow) {
  return {
    requestId: row.request_id, userId: row.user_id, productCode: row.product_code, state: row.state, days: row.days,
    actorId: row.actor_id, actorKind: row.actor_kind, reason: row.reason, previousExpiresAt: row.previous_expires_at?.toISOString() ?? null,
    startsAt: row.starts_at.toISOString(), expiresAt: row.expires_at.toISOString(), createdAt: row.created_at.toISOString(),
  };
}

export async function grantManualPro(raw: ManualProInput, actor: Actor) {
  if (!process.env.DATABASE_URL?.startsWith("postgres")) throw new ManualProGrantError("unavailable");
  const input = manualProInput.parse(raw);
  const matches = await getPgSql()<{ id: string }[]>`
    select id from users where lower(email) = ${input.email} limit 2
  `;
  if (matches.length !== 1) throw new ManualProGrantError("account");
  const userId = matches[0].id;

  return pgStore.accountTransaction(userId, async store => {
    const sql = getPgSql();
    const [account] = await sql<{ email: string; deleted_at: Date | null; email_verified: boolean }[]>`
      select email, deleted_at, email_verified from users where id = ${userId}
    `;
    if (!account || account.deleted_at || !account.email_verified || account.email.toLowerCase() !== input.email) {
      throw new ManualProGrantError("account");
    }
    const actorId = actor.kind === "administrator"
      ? actor.id
      : (await sql<{ role: string }[]>`select current_user as role`)[0].role;
    await sql`select pg_advisory_xact_lock(881123, hashtext(${input.requestId}))`;
    const [existing] = await sql<ReceiptRow[]>`select * from manual_pro_grants where request_id = ${input.requestId}`;
    if (existing) {
      if (existing.user_id !== userId || existing.product_code !== input.productCode || existing.days !== input.days ||
          existing.reason !== input.reason || existing.actor_kind !== actor.kind || existing.actor_id !== actorId) {
        throw new ManualProGrantError("request");
      }
      return { receipt: receipt(existing), duplicate: true };
    }

    const now = new Date();
    const window = manualProWindow(await store.listEntitlements(userId), input.productCode, input.days, now);
    const entitlement = await store.insertEntitlement({
      userId, productCode: input.productCode, state: window.state, status: "active",
      startsAt: window.startsAt, expiresAt: window.expiresAt,
      provider: "manual", providerOrderId: input.requestId, providerCustomerId: null,
    });
    if (entitlement.userId !== userId || entitlement.status !== "active" || entitlement.productCode !== input.productCode ||
        entitlement.state !== window.state || entitlement.startsAt !== window.startsAt || entitlement.expiresAt !== window.expiresAt) {
      throw new ManualProGrantError("request");
    }
    const [saved] = await sql<ReceiptRow[]>`
      insert into manual_pro_grants (
        request_id, entitlement_id, user_id, actor_kind, actor_id, product_code, state,
        days, previous_expires_at, starts_at, expires_at, reason, created_at
      ) values (
        ${input.requestId}, ${entitlement.id}, ${userId}, ${actor.kind}, ${actorId}, ${input.productCode}, ${window.state},
        ${input.days}, ${window.previousExpiresAt}, ${window.startsAt}, ${window.expiresAt}, ${input.reason}, ${now.toISOString()}
      ) returning *
    `;
    await refreshPlanCache(userId);
    return { receipt: receipt(saved), duplicate: false };
  });
}

export async function listManualProGrants() {
  const rows = await getPgSql()<(ReceiptRow & { email: string })[]>`
    select g.*, users.email from manual_pro_grants g join users on users.id = g.user_id
    order by g.created_at desc, g.request_id desc limit 25
  `;
  return rows.map(row => ({ ...receipt(row), email: row.email }));
}
