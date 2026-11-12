import "server-only";
import { fileStore } from "./file-store";
import type { Store } from "./types";
import { currentRevisionStat } from "../question-revisions";

function revisionAware(store: Store): Store {
  return {
    ...store,
    async getStat(userId, questionId) {
      const stat = await store.getStat(userId, questionId);
      return stat ? currentRevisionStat(stat) : null;
    },
    async listStats(userId) {
      return (await store.listStats(userId)).map(currentRevisionStat);
    },
    async updateReviewStat(userId, questionId, patch) {
      const old = await store.getStat(userId, questionId);
      if (old) {
        const projected = currentRevisionStat(old);
        if (projected !== old) await store.upsertStat(projected);
      }
      return store.updateReviewStat(userId, questionId, patch);
    },
  };
}

export async function getStore(): Promise<Store> {
  const url = process.env.DATABASE_URL || "";
  if (url.startsWith("postgres")) {
    const { pgStore } = await import("./pg-store");
    return revisionAware(pgStore);
  }
  return revisionAware(fileStore);
}
