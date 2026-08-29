import "server-only";
import { fileStore } from "./file-store";
import type { Store } from "./types";

export async function getStore(): Promise<Store> {
  const url = process.env.DATABASE_URL || "";
  if (url.startsWith("postgres")) {
    const { pgStore } = await import("./pg-store");
    return pgStore;
  }
  return fileStore;
}
