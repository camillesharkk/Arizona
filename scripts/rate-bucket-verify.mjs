import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "../node_modules/@electric-sql/pglite/dist/index.js";

const db = new PGlite();
const sqlText = readFileSync(new URL("../db/migrations/023_rate_buckets.sql", import.meta.url), "utf8");
await db.exec(sqlText);
await db.exec(sqlText);

async function hit(key) {
  const result = await db.query(
    `insert into rate_buckets (bucket_key, hits, reset_at)
     values ($1, 1, now() + interval '600 seconds')
     on conflict (bucket_key) do update set
       hits = case when rate_buckets.reset_at <= now() then 1 else rate_buckets.hits + 1 end,
       reset_at = case when rate_buckets.reset_at <= now() then excluded.reset_at else rate_buckets.reset_at end
     returning hits`,
    [key],
  );
  return result.rows[0].hits;
}

const counts = [];
for (let i = 0; i < 12; i += 1) counts.push(await hit("sit:actor"));
assert.deepEqual(counts, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
assert.equal(await hit("sit:actor") > 12, true);

await db.query(`update rate_buckets set reset_at = now() - interval '1 second' where bucket_key = $1`, ["sit:actor"]);
assert.equal(await hit("sit:actor"), 1);

await db.query(`update rate_buckets set reset_at = now() - interval '2 days'`);
await db.query(`delete from rate_buckets where reset_at < now() - interval '1 day'`);
const left = await db.query(`select count(*)::int as n from rate_buckets`);
assert.equal(left.rows[0].n, 0);

const parallel = await Promise.all(Array.from({ length: 20 }, () => hit("reveal:actor")));
assert.equal(Math.max(...parallel), 20);
console.log("rate buckets ok (one PGlite connection; parallel calls are queued and do not prove two servers)");
await db.close();
