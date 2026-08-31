import { readFileSync, existsSync } from "fs";
import path from "path";
import postgres from "postgres";

function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    const file = path.join(process.cwd(), name);
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

export function databaseUrl() {
  loadEnv();
  const url = process.env.DATABASE_URL || "";
  if (!url.startsWith("postgres")) {
    throw new Error("DATABASE_URL is missing or is not a postgres URL. Put it in .env.local");
  }
  return url;
}

export function sqlClient() {
  const url = databaseUrl();
  return postgres(url, {
    max: 1,
    ssl: url.includes("localhost") ? false : "require",
  });
}
