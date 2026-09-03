import "server-only";
import type { CommerceRepo } from "./repo.ts";

let cached: CommerceRepo | null = null;
let cachedKind = "";

export async function getCommerceRepo(): Promise<CommerceRepo> {
  const url = process.env.DATABASE_URL || "";
  const kind = url.startsWith("postgres") ? "pg" : "file";
  if (cached && cachedKind === kind) return cached;
  if (kind === "pg") {
    const { ensurePgSchema, getPgSql } = await import("../store/pg-store");
    await ensurePgSchema();
    const { createPgCommerceRepo } = await import("./pg-repo.ts");
    cached = createPgCommerceRepo(getPgSql());
  } else {
    const { createFileCommerceRepo } = await import("./file-repo.ts");
    cached = await createFileCommerceRepo();
  }
  cachedKind = kind;
  return cached;
}
