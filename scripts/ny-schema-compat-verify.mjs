import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { PGlite } from '../.tools/ny-pg/node_modules/@electric-sql/pglite/dist/index.js';
const native = createRequire(import.meta.url);
const db = new PGlite();
await db.exec('create table schema_migrations(id text primary key)');
for (const file of fs.readdirSync('db/migrations').filter(file => file.endsWith('.sql') && !file.startsWith('016')).sort()) {
  await db.exec(fs.readFileSync('db/migrations/' + file, 'utf8'));
  await db.query('insert into schema_migrations values ($1)', [file.slice(0, -4)]);
}
await db.exec("insert into users(id,email,password_hash) values ('test','test@example.invalid','test'); insert into question_stats(user_id,question_id,topic,bank,chapter,state,wrong_count,right_count,mastered,favorited) values ('test','ny-057','commission','new-york-notary-exam','commission','NY',3,12,true,true)");
// A lazy tagged-template adapter supports the same nested SQL fragments as postgres.js.
function fragment(strings, ...values) {
  const query = { strings, values };
  query.then = (resolve, reject) => {
    const parameters = [];
    function flatten(part) {
      return part.strings.reduce((text, string, index) => {
        if (!index) return string;
        const value = part.values[index - 1];
        if (value && value.strings) return text + flatten(value) + string;
        parameters.push(value);
        return text + '$' + parameters.length + string;
      }, '');
    }
    return db.query(flatten(query), parameters).then(result => result.rows).then(resolve, reject);
  };
  return query;
}
function loadStore(source) {
  const module = { exports: {} };
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  vm.runInNewContext(js, { module, exports: module.exports, require: name => name === 'postgres' ? () => fragment : native(name), process, Date, console });
  return module.exports.pgStore;
}
const source = fs.readFileSync('lib/store/pg-store.ts', 'utf8');
try {
  let store = loadStore(source);
  const legacyNy = await store.getStat('test', 'ny-057');
  for (const state of ['AZ', 'CA', 'HI']) {
    const id = state.toLowerCase() + '-001';
    assert.equal(await store.claimAttempt('test', 'legacy-' + state, id), true);
    await store.upsertStat({ ...legacyNy, questionId: id, state, bank: state === 'AZ' ? 'arizona-notary-exam' : state === 'CA' ? 'california-notary-exam' : 'hawaii-notary-exam', questionVersion: 1, revisionHistory: [], wrongCount: 1, mastered: false });
    assert.equal((await store.getStat('test', id)).wrongCount, 1);
    await store.upsertStat({ ...await store.getStat('test', id), rightCount: 1 });
    assert.equal((await store.getStat('test', id)).rightCount, 1);
  }
  await assert.rejects(store.claimAttempt('test', 'ny-retry-after-migration', 'ny-057'), /016/);
  assert.equal((await db.query("select * from answer_attempts where attempt_id='ny-retry-after-migration'")).rows.length, 0);
  await assert.rejects(store.upsertStat({ ...legacyNy, questionVersion: 2, revisionHistory: [legacyNy], wrongCount: 0 }), /016/);
  assert.equal((await store.getStat('test', 'ny-057')).rightCount, 12);
  const migration = fs.readFileSync('db/migrations/016_question_revisions.sql', 'utf8');
  await db.exec(migration);
  await db.exec(migration);
  // Validate the currently deployed pre-release store against the expanded schema.
  const oldStore = loadStore(execFileSync('git', ['show', '1cf61ab33263f1c7fe3a046f7bb64c7af842bcc0:lib/store/pg-store.ts'], { encoding: 'utf8' }));
  await oldStore.upsertStat({ ...await oldStore.getStat('test', 'az-001'), rightCount: 2 });
  assert.equal((await oldStore.getStat('test', 'az-001')).rightCount, 2);
  // Retry through the same warm application instance after migration.
  assert.equal(await store.claimAttempt('test', 'ny-retry-after-migration', 'ny-057'), true);
  await store.upsertStat({ ...legacyNy, questionVersion: 2, revisionHistory: [legacyNy], wrongCount: 0, rightCount: 1, mastered: false });
  const revised = await store.getStat('test', 'ny-057');
  assert.equal(revised.questionVersion, 2);
  assert.equal(revised.rightCount, 1);
  assert.equal(revised.revisionHistory[0].rightCount, 12);
  assert.equal(revised.revisionHistory[0].wrongCount, 3);
  await store.upsertStat({ ...revised, rightCount: 2 });
  assert.equal((await store.getStat('test', 'ny-057')).revisionHistory.length, 1);
  console.log('PostgreSQL compatibility passed: 001-015 AZ/CA/HI insert/update; NY refusal before dedup claim; additive 016 twice; old production code after 016; retry and NY revision history after 016.');
} finally { await db.close(); }
