import assert from 'node:assert/strict';
import { testLoader } from './pack-test-utils.mjs';

const { createPgDeviceRepo } = testLoader()('lib/devices/pg-repo.ts');
const calls = [];
let nextTransaction = 0;
const sql = async (strings) => {
  const query = strings.join('?');
  assert.doesNotMatch(query, /pg_advisory_lock\(/, 'Session locks leak through transaction pooling');
  calls.push({ connection: 'pool', query });
  return [];
};
sql.begin = async (action) => {
  const connection = ++nextTransaction;
  const transaction = async (strings, ...values) => {
    calls.push({ connection, query: strings.join('?'), values });
    return [];
  };
  try {
    const result = await action(transaction);
    calls.push({ connection, query: 'commit' });
    return result;
  } catch (error) {
    calls.push({ connection, query: 'rollback' });
    throw error;
  }
};
const repo = createPgDeviceRepo(sql);
await repo.withUserLock('first', () => repo.getSession('first-session'));
assert.equal(calls[0].connection, 1);
assert.match(calls[0].query, /pg_advisory_xact_lock/);
assert.ok(calls.every(call => call.connection === 1), 'Callback queries stay on the lock transaction');
assert.equal(calls.at(-1).query, 'commit');

calls.length = 0;
await assert.rejects(repo.withUserLock('failed', async () => {
  await repo.listSessions('failed');
  throw new Error('activation failed');
}), /activation failed/);
assert.equal(calls.at(-1).query, 'rollback');

calls.length = 0;
let release;
const gate = new Promise(resolve => { release = resolve; });
await Promise.all([
  repo.withUserLock('left', async () => { await gate; await repo.listSessions('left'); }),
  repo.withUserLock('right', async () => { release(); await repo.listSessions('right'); }),
]);
const left = calls.find(call => call.values?.includes('device:left'));
const right = calls.find(call => call.values?.includes('device:right'));
assert.notEqual(left.connection, right.connection);
assert.equal(calls.find(call => call.values?.includes('left')).connection, left.connection);
assert.equal(calls.find(call => call.values?.includes('right')).connection, right.connection);
assert.ok(calls.every(call => call.connection !== 'pool'));
console.log('PostgreSQL device locks use one transaction, rollback safely and isolate concurrent callbacks');
