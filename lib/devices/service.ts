import { DEVICE_TOUCH_MIN_MS } from "./policy.ts";
import { deviceLabelFromUserAgent, hashDeviceToken, summarizeUserAgent } from "./label.ts";
import { isDeviceActive, randomUUID, type DeviceRepo } from "./repo.ts";
import type { DeviceSessionRow, PublicDevice } from "./types.ts";
import type { SessionUser } from "@/lib/entitlements";

export type ActivateOk = { ok: true; session: DeviceSessionRow; created: boolean };
export type ActivateChurn = { ok: false; error: "TOO_MANY_DEVICE_CHANGES" };
export type ActivateResult = ActivateOk | ActivateChurn;

export function publicDevices(
  rows: DeviceSessionRow[],
  now: Date,
  currentId?: string | null
): PublicDevice[] {
  return rows
    .filter((s) => isDeviceActive(s, now))
    .sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt))
    .map((s) => ({
      id: s.id,
      deviceLabel: s.deviceLabel,
      lastSeenAt: s.lastSeenAt,
      current: Boolean(currentId && s.id === currentId),
    }));
}

export async function listActivePublicDevices(
  repo: DeviceRepo,
  userId: string,
  now = new Date(),
  currentId?: string | null
) {
  const rows = await repo.listSessions(userId);
  return publicDevices(rows, now, currentId);
}

export async function activeDeviceCount(repo: DeviceRepo, userId: string, now = new Date()) {
  const rows = await repo.listSessions(userId);
  return rows.filter((s) => isDeviceActive(s, now)).length;
}

export async function sessionIsUsable(repo: DeviceRepo, deviceSessionId: string, now = new Date()) {
  const row = await repo.getSession(deviceSessionId);
  if (!row || row.revokedAt) return null;
  if (!isDeviceActive(row, now)) return null;
  return row;
}

export type BoundSessionFail = "legacy" | "missing" | "mismatch" | "revoked" | "inactive";

export async function evaluateBoundSession(
  repo: DeviceRepo,
  user: Pick<SessionUser, "id" | "deviceSessionId">,
  now = new Date()
): Promise<{ ok: true } | { ok: false; reason: BoundSessionFail }> {
  if (!user.deviceSessionId) return { ok: false, reason: "legacy" };
  const row = await repo.getSession(user.deviceSessionId);
  if (!row) return { ok: false, reason: "missing" };
  if (row.userId !== user.id) return { ok: false, reason: "mismatch" };
  if (row.revokedAt) return { ok: false, reason: "revoked" };
  if (!isDeviceActive(row, now)) return { ok: false, reason: "inactive" };
  return { ok: true };
}

export async function touchIfNeeded(
  repo: DeviceRepo,
  deviceSessionId: string,
  now = new Date()
) {
  const row = await repo.getSession(deviceSessionId);
  if (!row || row.revokedAt) return false;
  if (now.getTime() - new Date(row.lastSeenAt).getTime() < DEVICE_TOUCH_MIN_MS) return true;
  await repo.touchSession(deviceSessionId, now.toISOString());
  return true;
}

export async function activateDevice(
  repo: DeviceRepo,
  opts: {
    userId: string;
    token: string;
    userAgent?: string | null;
    now?: Date;
    skipLimits?: boolean;
  }
): Promise<ActivateResult> {
  const now = opts.now ?? new Date();
  const at = now.toISOString();
  const hash = hashDeviceToken(opts.token);
  const { label, summary } = summarizeUserAgent(opts.userAgent);
  const uaSummary = (opts.userAgent || "").slice(0, 180) || null;

  return repo.withUserLock(opts.userId, async () => {
    const existing = await repo.getByTokenHash(opts.userId, hash);

    if (existing && !existing.revokedAt) {
      await repo.touchSession(existing.id, at, label, uaSummary);
      const next = await repo.getSession(existing.id);
      return { ok: true as const, session: next || { ...existing, lastSeenAt: at, deviceLabel: label, userAgentSummary: uaSummary }, created: false };
    }

    if (existing && existing.revokedAt) {
      await repo.unrevokeSession(existing.id, at);
      await repo.touchSession(existing.id, at, label, uaSummary);
      const next = await repo.getSession(existing.id);
      return { ok: true as const, session: next || { ...existing, revokedAt: null, lastSeenAt: at, deviceLabel: label }, created: false };
    }

    const session: DeviceSessionRow = {
      id: randomUUID(),
      userId: opts.userId,
      deviceTokenHash: hash,
      deviceLabel: label || deviceLabelFromUserAgent(opts.userAgent),
      userAgentSummary: summary || uaSummary,
      createdAt: at,
      lastSeenAt: at,
      revokedAt: null,
    };
    await repo.insertSession(session);
    await repo.insertActivation({
      id: randomUUID(),
      userId: opts.userId,
      deviceSessionId: session.id,
      at,
    });
    return { ok: true as const, session, created: true };
  });
}

export async function revokeOwnDevice(
  repo: DeviceRepo,
  opts: { userId: string; deviceId: string; now?: Date }
) {
  const now = opts.now ?? new Date();
  return repo.revokeSession(opts.deviceId, opts.userId, now.toISOString());
}

export async function signOutCurrent(
  repo: DeviceRepo,
  opts: { userId: string; deviceSessionId: string; now?: Date }
) {
  const now = opts.now ?? new Date();
  return repo.revokeSession(opts.deviceSessionId, opts.userId, now.toISOString());
}

export async function signOutOtherDevices(
  repo: DeviceRepo,
  opts: { userId: string; keepDeviceId: string; now?: Date }
) {
  const now = opts.now ?? new Date();
  return repo.revokeOthers(opts.userId, opts.keepDeviceId, now.toISOString());
}

export async function revokeAllDevices(
  repo: DeviceRepo,
  opts: { userId: string; now?: Date }
) {
  const now = opts.now ?? new Date();
  return repo.revokeAll(opts.userId, now.toISOString());
}

export async function revokeOthersKeepCurrent(
  repo: DeviceRepo,
  opts: { userId: string; keepDeviceId: string | null | undefined; now?: Date }
) {
  const now = opts.now ?? new Date();
  if (!opts.keepDeviceId) return repo.revokeAll(opts.userId, now.toISOString());
  return repo.revokeOthers(opts.userId, opts.keepDeviceId, now.toISOString());
}
