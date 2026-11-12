import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import ts from 'typescript';
import { PGlite } from '../.tools/ny-pg/node_modules/@electric-sql/pglite/dist/index.js';

const native = createRequire(import.meta.url);
const cache = new Map();
let store;
let postgresAdapter;
let renameAttempts = 0;
function load(file) {
  file = path.resolve(file);
  if (!path.extname(file)) file += '.ts';
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const require = name => {
    if (name === '@/lib/store') return { getStore: async () => store };
    if (name === 'postgres') return () => postgresAdapter;
    if (name === 'fs/promises') return { ...native(name), rename: async (...args) => {
      if (renameAttempts++ < 2) throw Object.assign(new Error('simulated Windows file occupancy'), { code: 'EPERM' });
      return native(name).rename(...args);
    } };
    if (name.startsWith('@/')) return load(name.slice(2));
    if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name));
    return native(name);
  };
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  vm.runInNewContext(js, { module, exports: module.exports, require, process, console, Date, Math, structuredClone });
  return module.exports;
}
const { saveNyFullSubmission } = load('lib/ny-full-submission.ts');
const { recordQuestionAnswer } = load('lib/progress.ts');
const bank = load('data/ny-content.ts').publishedNyQuestions();
const questions = bank.slice(0, 20).concat(bank.slice(50, 70)).map(q => ({ questionId: q.question_id, questionVersion: q.version, selected: ['A','B','C','D'].find(letter => letter !== q.correct_option) }));
assert.ok(questions.some(answer => !bank.find(q => q.question_id === answer.questionId).is_free));

const db = new PGlite();
for (const file of fs.readdirSync('db/migrations').filter(file => file.endsWith('.sql')).sort()) {
  await db.exec(fs.readFileSync('db/migrations/' + file, 'utf8'));
}
await db.exec("create table schema_migrations(id text primary key)");
for (const file of fs.readdirSync('db/migrations').filter(file => file.endsWith('.sql'))) await db.query('insert into schema_migrations values ($1)', [file.slice(0,-4)]);
function sql(strings, ...values) {
  const fragment = { strings, values };
  fragment.then = (resolve, reject) => {
    const parameters = [];
    const flatten = part => part.strings.reduce((text, string, index) => {
      if (!index) return string;
      const value = part.values[index - 1];
      if (value?.strings) return text + flatten(value) + string;
      parameters.push(value);
      return text + '$' + parameters.length + string;
    }, '');
    return db.query(flatten(fragment), parameters).then(result => result.rows).then(resolve,reject);
  };
  return fragment;
}
let queue = Promise.resolve();
sql.begin = callback => {
  const run = queue.then(async () => {
    await db.exec('begin');
    try { const result = await callback(sql); await db.exec('commit'); return result; }
    catch (error) { await db.exec('rollback'); throw error; }
  });
  queue = run.catch(() => undefined);
  return run;
};
postgresAdapter = sql;
const previousDir = process.env.NOTARY_DATA_DIR;
process.env.NOTARY_DATA_DIR = path.resolve('.tools/ny-full-tests-' + randomUUID());
try {
  for (const [name, backend] of [
    ['memory', load('lib/store/memory-store.ts').createMemoryStore()],
    ['file', load('lib/store/file-store.ts').fileStore],
    ['PostgreSQL', load('lib/store/pg-store.ts').pgStore],
  ]) {
    store = backend;
    const user = await store.createUser({ email: `full-${name}@example.invalid`, passwordHash: 'isolated', name: null });
    const submission = { examId: randomUUID(), questions };
    const transaction = store.learningTransaction.bind(store);
    store.learningTransaction = (id, action) => transaction(id, async scoped => {
      let writes = 0;
      const failing = Object.create(scoped);
      failing.upsertStat = async stat => {
        if (++writes === 7) throw new Error('injected seventh-answer failure');
        return scoped.upsertStat(stat);
      };
      return action(failing);
    });
    await assert.rejects(saveNyFullSubmission(store, user.id, submission), /seventh-answer/);
    store.learningTransaction = transaction;
    assert.equal((await store.listStats(user.id)).length, 0);
    assert.equal((await store.listExams(user.id)).length, 0);
    assert.equal(await store.getStudyPlan(user.id,'NY'), null);
    assert.equal((await store.getUserById(user.id)).lastStudyAt, null);
    const stale = { ...submission, questions: questions.map((answer,index) => index === 1 ? {...answer,questionVersion:999} : answer) };
    await assert.rejects(saveNyFullSubmission(store,user.id,stale), /question_updated/);
    const saved = await saveNyFullSubmission(store,user.id,submission);
    assert.equal(saved.exam.correctCount,0);
    assert.equal(saved.exam.score,0);
    assert.equal((await store.listStats(user.id)).length,40);
    assert.equal((await store.getStudyPlan(user.id,'NY')).document.checks[submission.examId].wrongIds.length,40);
    assert.equal((await saveNyFullSubmission(store,user.id,submission)).duplicate,true);
    assert.equal((await store.listStats(user.id)).every(stat => stat.wrongCount === 1),true);
    await assert.rejects(saveNyFullSubmission(store,user.id,{...submission,examId:randomUUID()}), /full_trial_used/);
    const other = await store.createUser({email:`concurrent-${name}@example.invalid`,passwordHash:'isolated',name:null});
    const outcomes = await Promise.allSettled([1,2].map(() => saveNyFullSubmission(store,other.id,{...submission,examId:randomUUID()})));
    assert.equal(outcomes.filter(result => result.status === 'fulfilled').length,1);
    assert.equal((await store.listExams(other.id)).length,1);
    const free = bank.find(q=>q.is_free);
    await Promise.all([1,2].map(index => recordQuestionAnswer({userId:user.id,questionId:free.question_id,selected:free.correct_option,correct:true,attemptId:'normal-parallel-'+index})));
    assert.equal((await store.getStat(user.id,free.question_id)).rightCount,2);
    if (name === 'memory') {
      const otherState = {...await store.getStat(other.id,questions[0].questionId)};
      let resume;
      let entered;
      const waiting = new Promise(resolve => { entered = resolve; });
      const paused = new Promise(resolve => { resume = resolve; });
      const updating = store.learningTransaction(user.id, async scoped => {
        entered();
        await paused;
        const stat = await scoped.getStat(user.id,free.question_id);
        await scoped.upsertStat({...stat,rightCount:stat.rightCount+1});
      });
      await waiting;
      const changes = [
        store.updateReviewStat(user.id,free.question_id,{favorited:true}),
        store.updateUser(user.id,{name:'Concurrent name retained'}),
        store.upsertStat({...otherState,userId:user.id,questionId:'az-concurrent',state:'AZ'}),
      ];
      resume();
      await Promise.all([updating,...changes]);
      assert.equal((await store.getStat(user.id,free.question_id)).favorited,true);
      assert.equal((await store.getUserById(user.id)).name,'Concurrent name retained');
      assert.equal((await store.getStat(user.id,'az-concurrent')).state,'AZ');
    }
    const now=Date.now();
    const entitlement=await store.insertEntitlement({userId:user.id,productCode:'az_exam_pro_60d',state:'ALL',status:'active',startsAt:new Date(now-10000).toISOString(),expiresAt:new Date(now+86400000).toISOString(),provider:'mock',providerOrderId:randomUUID(),providerCustomerId:null});
    await saveNyFullSubmission(store,user.id,{...submission,examId:randomUUID()});
    for (const count of [1,39]) {
      const mixed = questions.map((answer,index) => index < count ? {...answer, selected:bank.find(q=>q.question_id===answer.questionId).correct_option} : answer);
      const result = await saveNyFullSubmission(store,user.id,{examId:randomUUID(),questions:mixed});
      assert.equal(result.exam.correctCount,count);
      assert.equal(result.exam.score,Math.round(count/40*100));
    }
    await store.setEntitlementStatus(user.id,'mock',entitlement.providerOrderId,'expired');
    await assert.rejects(saveNyFullSubmission(store,user.id,{...submission,examId:randomUUID()}), /full_trial_used/);
    console.log(`${name}: trial paid-question persistence, seventh-write rollback, retry, immutable duplicate, version rejection, one concurrent trial, concurrent ordinary answers and live/expired entitlement checks passed`);
  }
} finally {
  if (previousDir === undefined) delete process.env.NOTARY_DATA_DIR;
  else process.env.NOTARY_DATA_DIR=previousDir;
  await db.close();
}
