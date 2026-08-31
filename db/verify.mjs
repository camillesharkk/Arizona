import { sqlClient } from "./env.mjs";

const sql = sqlClient();

try {
  await sql`select 1 as ok`;
  const tables = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
    order by table_name
  `;
  const names = tables.map((t) => t.table_name);
  const required = ["users", "tokens", "question_stats", "exams", "ai_usage", "webhooks", "email_logs", "schema_migrations"];
  const missing = required.filter((n) => !names.includes(n));
  if (missing.length) {
    throw new Error(`Missing tables: ${missing.join(", ")}. Run npm run db:migrate`);
  }
  const [{ n }] = await sql`select count(*)::int as n from users`;
  const [{ applied }] = await sql`select count(*)::int as applied from schema_migrations`;
  console.log("Database connection: OK");
  console.log("Tables:", names.join(", "));
  console.log("schema_migrations rows:", applied);
  console.log("users count:", n);
} finally {
  await sql.end();
}
