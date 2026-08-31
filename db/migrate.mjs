import { readdirSync, readFileSync } from "fs";
import path from "path";
import { sqlClient } from "./env.mjs";

const sql = sqlClient();
const dir = path.join(process.cwd(), "db", "migrations");

try {
  await sql.unsafe(`
    create table if not exists schema_migrations (
      id text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const appliedRows = await sql`select id from schema_migrations`;
  const applied = new Set(appliedRows.map((r) => r.id));
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (!files.length) {
    throw new Error("No SQL files in db/migrations");
  }

  for (const file of files) {
    const id = file.replace(/\.sql$/i, "");
    if (applied.has(id)) {
      console.log("Already applied:", id);
      continue;
    }
    const body = readFileSync(path.join(dir, file), "utf8");
    await sql.unsafe(body);
    await sql`insert into schema_migrations (id) values (${id})`;
    console.log("Applied:", id);
  }

  const tables = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
    order by table_name
  `;
  console.log("Migration complete.");
  console.log("Tables:", tables.map((t) => t.table_name).join(", "));
} finally {
  await sql.end({ timeout: 5 });
}
