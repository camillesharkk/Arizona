import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { createMemoryDeviceRepo, type DeviceRepo } from "./repo.ts";

const filePath = () => path.join(process.cwd(), ".data", "devices.json");
let queue: Promise<void> = Promise.resolve();

async function loadRaw(): Promise<Record<string, unknown>> {
  try {
    return JSON.parse(await readFile(filePath(), "utf8")) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function saveRaw(data: unknown) {
  await mkdir(path.dirname(filePath()), { recursive: true });
  await writeFile(filePath(), JSON.stringify(data, null, 2));
}

export async function createFileDeviceRepo(): Promise<DeviceRepo> {
  const raw = await loadRaw();
  const inner = createMemoryDeviceRepo(raw);
  const wrap =
    <A extends unknown[], R>(fn: (...args: A) => Promise<R>) =>
    async (...args: A) => {
      const run = queue.then(async () => {
        const result = await fn(...args);
        await saveRaw(inner.snapshot());
        return result;
      });
      queue = run.then(() => undefined).catch(() => undefined);
      return run;
    };

  return {
    getSession: inner.getSession.bind(inner),
    getByTokenHash: inner.getByTokenHash.bind(inner),
    listSessions: inner.listSessions.bind(inner),
    insertSession: wrap(inner.insertSession.bind(inner)),
    touchSession: wrap(inner.touchSession.bind(inner)),
    unrevokeSession: wrap(inner.unrevokeSession.bind(inner)),
    revokeSession: wrap(inner.revokeSession.bind(inner)),
    revokeOthers: wrap(inner.revokeOthers.bind(inner)),
    revokeAll: wrap(inner.revokeAll.bind(inner)),
    insertActivation: wrap(inner.insertActivation.bind(inner)),
    countActivationsSince: inner.countActivationsSince.bind(inner),
    withUserLock: inner.withUserLock.bind(inner),
  };
}
