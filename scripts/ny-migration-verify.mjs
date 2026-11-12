import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PGlite } from '../.tools/ny-pg/node_modules/@electric-sql/pglite/dist/index.js';

let db = new PGlite();
const migrationId = '016_question_revisions';
const migration = fs.readFileSync(`db/migrations/${migrationId}.sql`, 'utf8');
const source = fs.readFileSync('db/migrate.mjs', 'utf8').replace(/^import .*;\r?\n/gm, '');
const executeRunner = new (Object.getPrototypeOf(async function () {}).constructor)(
  'sqlClient', 'path', 'readdirSync', 'readFileSync', 'process', 'console', source,
);
let rejectLedger = false;
let sawColumnsBeforeFailure = false;
const settings = [];
function sql(strings, ...values) {
  const query = strings.reduce((text, part, index) => text + (index ? `$${index}` : '') + part, '');
  return (async () => {
    if (rejectLedger && /insert into schema_migrations/.test(query)) {
      sawColumnsBeforeFailure = (await columns()).length === 2;
      throw new Error('injected migration ledger failure');
    }
    return (await db.query(query, values)).rows;
  })();
}
sql.unsafe = async text => {
  if (/^set local/.test(text)) settings.push(text);
  return db.exec(text);
};
sql.begin = async callback => {
  await db.exec('begin');
  try {
    const result = await callback(sql);
    await db.exec('commit');
    return result;
  } catch (error) {
    await db.exec('rollback');
    throw error;
  }
};
sql.end = async () => {};
const columns = async () => (await db.query("select column_name from information_schema.columns where table_name='question_stats' and column_name in ('question_version','revision_history')")).rows;
const ledger = async () => (await db.query('select id from schema_migrations')).rows;
const run = (files = [`${migrationId}.sql`]) => executeRunner(() => sql, { join: (...parts) => parts.join('/') },
  () => files, file => fs.readFileSync(file,'utf8'), process, { log() {} });

try {
  await db.exec("create table question_stats (question_id text primary key, right_count integer); insert into question_stats values ('az-old',7)");
  rejectLedger = true;
  await assert.rejects(run(), /injected migration ledger failure/);
  assert.equal(sawColumnsBeforeFailure, true);
  assert.equal((await columns()).length, 0);
  assert.equal((await ledger()).length, 0);
  rejectLedger = false;
  await run();
  assert.equal((await columns()).length, 2);
  assert.deepEqual((await ledger()).map(row => row.id), [migrationId]);
  assert.deepEqual((await db.query('select * from question_stats')).rows, [
    { question_id: 'az-old', right_count: 7, question_version: 1, revision_history: [] },
  ]);
  await run();
  assert.equal((await ledger()).length, 1);
  // Recover SQL that was committed by the previous non-transactional executor.
  await db.exec('delete from schema_migrations');
  await db.exec(migration);
  await run();
  assert.equal((await columns()).length, 2);
  assert.equal((await ledger()).length, 1);
  assert.ok(settings.includes("set local lock_timeout = '5s'"));
  assert.ok(settings.includes("set local statement_timeout = '30s'"));
  await db.close();
  db = new PGlite();
  const files = fs.readdirSync('db/migrations').filter(file => file.endsWith('.sql')).sort();
  await run(files);
  assert.equal((await ledger()).length,16);
  await run(files);
  assert.equal((await ledger()).length,16);
  console.log('Actual migration executor passed atomic ledger-failure rollback, retry, repeated execution, legacy partial recovery, existing-row defaults and local timeout checks in isolated PostgreSQL.');
} finally {
  await db.close();
}
