import { randomUUID } from "crypto";
import { DEVICE_INACTIVE_MS } from "./policy.ts";
import type { DeviceActivationRow, DeviceSessionRow } from "./types.ts";

export type DeviceRepo = {
  getSession(id: string): Promise<DeviceSessionRow | null>;
  getByTokenHash(userId: string, hash: string): Promise<DeviceSessionRow | null>;
  listSessions(userId: string): Promise<DeviceSessionRow[]>;
  insertSession(row: DeviceSessionRow): Promise<void>;
  touchSession(id: string, at: string, label?: string, summary?: string | null): Promise<void>;
  unrevokeSession(id: string, at: string): Promise<boolean>;
  revokeSession(id: string, userId: string, at: string): Promise<boolean>;
  revokeOthers(userId: string, keepId: string, at: string): Promise<number>;
  revokeAll(userId: string, at: string): Promise<number>;
  insertActivation(row: DeviceActivationRow): Promise<void>;
  countActivationsSince(userId: string, sinceIso: string): Promise<number>;
  withUserLock<T>(userId: string, fn: () => Promise<T>): Promise<T>;
};

type Mem = {
  sessions: DeviceSessionRow[];
  activations: DeviceActivationRow[];
};

function empty(): Mem {
  return { sessions: [], activations: [] };
}

function hydrate(raw?: Record<string, unknown> | Mem): Mem {
  const base = empty();
  if (!raw) return base;
  return {
    sessions: Array.isArray(raw.sessions) ? (raw.sessions as DeviceSessionRow[]) : [],
    activations: Array.isArray(raw.activations) ? (raw.activations as DeviceActivationRow[]) : [],
  };
}

export type MemoryDeviceRepo = DeviceRepo & { snapshot: () => Mem };

export function createMemoryDeviceRepo(raw?: Record<string, unknown> | Mem): MemoryDeviceRepo {
  const db = hydrate(raw);
  const locks = new Map<string, Promise<void>>();

  async function withLock<T>(key: string, fn: () => Promise<T> | T): Promise<T> {
    const prev = locks.get(key) ?? Promise.resolve();
    let release!: () => void;
    const next = new Promise<void>((r) => {
      release = r;
    });
    locks.set(key, prev.then(() => next));
    await prev;
    try {
      return await fn();
    } finally {
      release();
    }
  }

  const repo: DeviceRepo = {
    async getSession(id) {
      return db.sessions.find((s) => s.id === id) ?? null;
    },
    async getByTokenHash(userId, hash) {
      return db.sessions.find((s) => s.userId === userId && s.deviceTokenHash === hash) ?? null;
    },
    async listSessions(userId) {
      return db.sessions.filter((s) => s.userId === userId);
    },
    async insertSession(row) {
      if (db.sessions.some((s) => s.id === row.id || (s.userId === row.userId && s.deviceTokenHash === row.deviceTokenHash))) {
        throw new Error("device_conflict");
      }
      db.sessions.push(row);
    },
    async touchSession(id, at, label, summary) {
      const s = db.sessions.find((x) => x.id === id);
      if (!s) return;
      s.lastSeenAt = at;
      if (label) s.deviceLabel = label;
      if (summary !== undefined) s.userAgentSummary = summary;
    },
    async unrevokeSession(id, at) {
      const s = db.sessions.find((x) => x.id === id);
      if (!s) return false;
      s.revokedAt = null;
      s.lastSeenAt = at;
      return true;
    },
    async revokeSession(id, userId, at) {
      const s = db.sessions.find((x) => x.id === id && x.userId === userId);
      if (!s || s.revokedAt) return false;
      s.revokedAt = at;
      return true;
    },
    async revokeOthers(userId, keepId, at) {
      let n = 0;
      for (const s of db.sessions) {
        if (s.userId === userId && s.id !== keepId && !s.revokedAt) {
          s.revokedAt = at;
          n += 1;
        }
      }
      return n;
    },
    async revokeAll(userId, at) {
      let n = 0;
      for (const s of db.sessions) {
        if (s.userId === userId && !s.revokedAt) {
          s.revokedAt = at;
          n += 1;
        }
      }
      return n;
    },
    async insertActivation(row) {
      db.activations.push(row);
    },
    async countActivationsSince(userId, sinceIso) {
      const t = new Date(sinceIso).getTime();
      return db.activations.filter((a) => a.userId === userId && new Date(a.at).getTime() >= t).length;
    },
    async withUserLock(userId, fn) {
      return withLock(`user:${userId}`, fn);
    },
  };

  return Object.assign(repo, {
    snapshot() {
      return db;
    },
  });
}

export function isDeviceActive(row: DeviceSessionRow, now: Date, inactiveMs = DEVICE_INACTIVE_MS): boolean {
  if (row.revokedAt) return false;
  return now.getTime() - new Date(row.lastSeenAt).getTime() < inactiveMs;
}

export { randomUUID };
