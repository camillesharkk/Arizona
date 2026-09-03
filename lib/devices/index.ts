import "server-only";
import type { DeviceRepo } from "./repo.ts";

let cached: DeviceRepo | null = null;
let cachedKind = "";

export async function getDeviceRepo(): Promise<DeviceRepo> {
  const url = process.env.DATABASE_URL || "";
  const kind = url.startsWith("postgres") ? "pg" : "file";
  if (cached && cachedKind === kind) return cached;
  if (kind === "pg") {
    const { ensurePgSchema, getPgSql } = await import("../store/pg-store");
    await ensurePgSchema();
    const { createPgDeviceRepo } = await import("./pg-repo.ts");
    cached = createPgDeviceRepo(getPgSql());
  } else {
    const { createFileDeviceRepo } = await import("./file-repo.ts");
    cached = await createFileDeviceRepo();
  }
  cachedKind = kind;
  return cached;
}

export {
  MAX_ACTIVE_DEVICES,
  DEVICE_INACTIVE_MS,
  MAX_NEW_DEVICE_ACTIVATIONS_PER_WINDOW,
} from "./policy.ts";
export { createMemoryDeviceRepo } from "./repo.ts";
export {
  activateDevice,
  listActivePublicDevices,
  revokeOwnDevice,
  signOutCurrent,
  signOutOtherDevices,
  revokeAllDevices,
  revokeOthersKeepCurrent,
  sessionIsUsable,
  evaluateBoundSession,
  touchIfNeeded,
} from "./service.ts";
