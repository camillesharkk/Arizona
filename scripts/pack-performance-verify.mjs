import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import ts from 'typescript';
import { verificationStates } from './pack-test-utils.mjs';
import { PGlite } from '../.tools/ny-pg/node_modules/@electric-sql/pglite/dist/index.js';
import { types as postgresTypes } from '../node_modules/postgres/src/types.js';

// Execute the real PostgreSQL store against an isolated PostgreSQL WASM engine.
// No environment connection string or production connection is used.
const native = createRequire(import.meta.url);
const cache = new Map();
let queryCount = 0;
const db = new PGlite();
function load(file) {
  file = path.resolve(file);
  if (!path.extname(file)) file += '.ts';
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const require = name => {
    if (name === '@/lib/store') return { getStore: async () => load('lib/store/pg-store.ts').pgStore };
    if (name === 'postgres') return () => sql;
    if (name.startsWith('@/')) return load(name.slice(2));
    if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name));
    return native(name);
  };
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  vm.runInNewContext(js, { module, exports: module.exports, require, process, console, Date, Math, structuredClone });
  return module.exports;
}
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
    queryCount += 1;
    const query = flatten(fragment);
    return db.describeQuery(query).then(description => {
      // Match the installed production driver's serializer for server-inferred JSON parameters.
      const encoded = parameters.map((value, index) => {
        const type = description.queryParams[index].dataTypeID;
        return typeof value === 'string' && (type === 114 || type === 3802)
          ? postgresTypes.json.serialize(value)
          : value;
      });
      return db.query(query, encoded);
    }).then(result => result.rows).then(resolve, reject);
  };
  return fragment;
}
sql.begin = async callback => {
  queryCount += 1;
  await db.exec('begin');
  try {
    const result = await callback(sql);
    queryCount += 1;
    await db.exec('commit');
    return result;
  } catch (error) {
    queryCount += 1;
    await db.exec('rollback');
    throw error;
  }
};
try {
  for (const file of fs.readdirSync('db/migrations').filter(file => file.endsWith('.sql')).sort()) await db.exec(fs.readFileSync('db/migrations/' + file, 'utf8'));
  await db.exec('create table schema_migrations(id text primary key)');
  for (const file of fs.readdirSync('db/migrations').filter(file => file.endsWith('.sql'))) await db.query('insert into schema_migrations values ($1)', [file.slice(0, -4)]);
  const { savePackFullSubmission } = load('lib/ny-full-submission.ts');
  const { packFor } = load('lib/prep-pack.ts');
  const store = load('lib/store/pg-store.ts').pgStore;
  const unbatched = Object.create(store);
  unbatched.learningTransaction = (id, action) => store.learningTransaction(id, transaction => {
    const scoped = Object.create(transaction);
    scoped.claimAttempts = undefined;
    return action(scoped);
  });
  const results = [];
  for (const state of verificationStates(['NY', 'PA', 'LA', 'CT'])) {
    const user = await store.createUser({ email: `performance-${state}@example.invalid`, passwordHash: 'isolated', name: null });
    const seed = state === 'PA' ? 12361 : 12345;
    const draw = packFor(state).pickFull(seed);
    assert.ok(draw, `${state} full draw unavailable, prior measurements ${JSON.stringify(results)}`);
    const chosen = state === 'NY' ? packFor(state).questions().slice(0, 40) : draw.questions;
    const revisedQuestion = state === 'NY' ? packFor(state).questions().find(question => question.version > 1) : null;
    if (revisedQuestion && !chosen.some(question => question.question_id === revisedQuestion.question_id)) chosen[0] = revisedQuestion;
    const questions = chosen.map(question => ({ questionId: question.question_id, questionVersion: question.version, selected: question.correct_option }));
    const submission = { state, seed, examId: randomUUID(), questions };
    const baselineUser = await store.createUser({ email: `baseline-${state}@example.invalid`, passwordHash: 'isolated', name: null });
    queryCount = 0;
    const baselineStarted = performance.now();
    await savePackFullSubmission(unbatched, baselineUser.id, { ...submission, examId: randomUUID() });
    const baseline = { statements: queryCount, elapsedMs: Number((performance.now() - baselineStarted).toFixed(1)) };
    const revisions = state === 'NY' ? [revisedQuestion] : state === 'PA' ? packFor(state).questions().filter(question => question.version > 1) : [];
    for (const revised of revisions) {
      assert.ok(chosen.some(question => question.question_id === revised.question_id), 'Regression seed must include revised '+revised.question_id);
      await db.query(`insert into question_stats
      (user_id, question_id, topic, bank, chapter, state, question_version, right_count, mastered, favorited)
      values ($1, $2, $3, $4, $3, $5, 1, 7, true, true)`, [user.id, revised.question_id, revised.topic, state === 'PA' ? 'pennsylvania-notary-exam' : 'new-york-notary-exam', state]);
    }
    queryCount = 0;
    const started = performance.now();
    const result = await savePackFullSubmission(store, user.id, submission);
    const elapsedMs = performance.now() - started;
    results.push({ state, answers: questions.length, baseline, batched: { statements: queryCount, elapsedMs: Number(elapsedMs.toFixed(1)) } });
    assert.ok(queryCount <= 16, `${state} full submission used ${queryCount} SQL statements, budget 16`);
    assert.equal(result.exam.score, 100);
    assert.equal((await store.listStats(user.id)).length, questions.length);
    for (const question of revisions) {
      const revised = await store.getStat(user.id, question.question_id);
      assert.equal(revised.questionVersion, 2);
      assert.equal(revised.rightCount, 1);
      assert.equal(revised.favorited, true);
      assert.equal(revised.savedForReview, true);
      assert.equal(revised.revisionHistory[0].questionVersion, 1);
      assert.equal(revised.revisionHistory[0].rightCount, 7);
      assert.equal(revised.revisionHistory[0].mastered, true);
    }
    assert.equal((await db.query('select count(*)::int as n from answer_attempts where user_id=$1', [user.id])).rows[0].n, questions.length);
    const before = JSON.stringify(await store.listStats(user.id));
    queryCount = 0;
    const duplicate = await savePackFullSubmission(store, user.id, { ...submission, questions: [] });
    assert.equal(duplicate.duplicate, true);
    assert.ok(queryCount <= 5);
    assert.equal(JSON.stringify(await store.listStats(user.id)), before);
    await assert.rejects(savePackFullSubmission(store, user.id, { ...submission, examId: randomUUID() }), /full_trial_used/);
    const skippedUser = await store.createUser({ email: `skipped-${state}@example.invalid`, passwordHash: 'isolated', name: null });
    const skipped = await savePackFullSubmission(store, skippedUser.id, { ...submission, examId: randomUUID(), questions: questions.map(({ selected, ...answer }) => answer) });
    assert.equal(skipped.exam.score, 0);
    assert.equal((await store.listStats(skippedUser.id)).length, 0);
    assert.equal((await db.query('select count(*)::int as n from answer_attempts where user_id=$1', [skippedUser.id])).rows[0].n, 0);
    const plan = await store.getStudyPlan(skippedUser.id, state);
    assert.equal(plan.document.checks[skipped.exam.id].skipped, questions.length);
    const rollbackUser = await store.createUser({ email: `rollback-${state}@example.invalid`, passwordHash: 'isolated', name: null });
    const entitlement = await store.insertEntitlement({
      userId: rollbackUser.id, productCode: 'az_exam_pro_60d', state: 'ALL', status: 'active',
      startsAt: new Date(Date.now() - 10000).toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString(),
      provider: 'mock', providerOrderId: randomUUID(), providerCustomerId: null,
    });
    const lateFailure = Object.create(store);
    const rollbackSubmission = { ...submission, examId: randomUUID() };
    lateFailure.learningTransaction = (id, action) => store.learningTransaction(id, transaction => {
      const scoped = Object.create(transaction);
      scoped.addExam = async exam => {
        await transaction.addExam(exam);
        throw new Error('injected failure after exam insert');
      };
      return action(scoped);
    });
    await assert.rejects(savePackFullSubmission(lateFailure, rollbackUser.id, rollbackSubmission), /failure after exam insert/);
    assert.equal((await store.listStats(rollbackUser.id)).length, 0);
    assert.equal((await store.listExams(rollbackUser.id)).length, 0);
    assert.equal(await store.getStudyPlan(rollbackUser.id, state), null);
    assert.equal((await store.getUserById(rollbackUser.id)).lastStudyAt, null);
    assert.equal((await db.query('select count(*)::int as n from answer_attempts where user_id=$1', [rollbackUser.id])).rows[0].n, 0);
    const recovered = await savePackFullSubmission(store, rollbackUser.id, rollbackSubmission);
    assert.equal(recovered.duplicate, false);
    assert.ok(recovered.proUsage);
    await store.setEntitlementStatus(rollbackUser.id, 'mock', entitlement.providerOrderId, 'expired');
    const replayed = await savePackFullSubmission(store, rollbackUser.id, rollbackSubmission);
    assert.equal(replayed.duplicate, true);
    assert.equal(JSON.stringify(replayed.proUsage), JSON.stringify(recovered.proUsage));
    assert.equal((await store.listStats(rollbackUser.id)).every(stat => stat.rightCount === 1), true);
  }
  const classicDraws = {
    AZ: { questions: load('lib/quiz.ts').pickFullExam(614), unscoredIds: [] },
    CA: load('lib/ca-exam.ts').pickCaFullExam(614),
    HI: { questions: load('lib/hi-exam.ts').pickHiFullExam(614), unscoredIds: [] },
  };
  for (const [state, draw] of Object.entries(classicDraws)) {
    const user = await store.createUser({email:`classic-full-${state}@example.invalid`,passwordHash:'isolated',name:null});
    const submission = {state,seed:614,examId:randomUUID(),unscoredIds:draw.unscoredIds,questions:draw.questions.map(question=>({questionId:question.question_id,questionVersion:question.version,selected:question.correct_option}))};
    queryCount = 0;
    const saved = await savePackFullSubmission(store,user.id,submission);
    const statements = queryCount;
    assert.equal(saved.exam.score,100);assert.equal(saved.fullExamCount,1);
    assert.ok(statements<=16,state+' full sitting stays within the batched SQL budget');
    assert.equal((await store.listStats(user.id)).length,draw.questions.length);
    const snapshot = JSON.stringify(await store.listStats(user.id));
    const replay = await savePackFullSubmission(store,user.id,submission);
    assert.equal(replay.duplicate,true);assert.equal(replay.fullExamCount,1);
    assert.equal(JSON.stringify(await store.listStats(user.id)),snapshot);
    await assert.rejects(savePackFullSubmission(store,user.id,{...submission,examId:randomUUID()}),/full_trial_used/);
    console.log(`${state}: ${draw.questions.length} answers and full history commit in ${statements} SQL statements, duplicate and trial count stable`);
  }
  const { recordQuestionAnswers } = load('lib/progress.ts');
  const guestQuestions = {
    AZ: load('data/questions.ts').publishedQuestions(), CA: load('data/ca-questions.ts').publishedCaQuestions(), HI: load('data/hi-questions.ts').publishedHiQuestions(),
    NY: packFor('NY').questions(), PA: packFor('PA').questions(), LA: packFor('LA').questions(), CT: packFor('CT').questions(),
    NC: packFor("NC").questions(),
  };
  for (const [state, bank] of Object.entries(guestQuestions)) {
    const user = await store.createUser({email:`guest-bulk-${state}@example.invalid`,passwordHash:'isolated',name:null});
    const answers = bank.filter(question=>question.is_free).slice(0,10).map(question=>({questionId:question.question_id,selected:question.correct_option,correct:true,attemptId:randomUUID()}));
    const save = () => store.learningTransaction(user.id, async transaction => {
      const plan = await transaction.getStudyPlan(user.id,state);
      await recordQuestionAnswers({store:transaction,userId:user.id,state,answers,plan});
    });
    queryCount = 0;
    await save();
    assert.ok(queryCount <= 10, `${state} ten-answer import used ${queryCount} SQL statements`);
    await save();
    assert.ok((await store.listStats(user.id)).every(stat=>stat.rightCount===1),'Keep retry counts immutable');
    const snapshot = JSON.stringify(await store.listStats(user.id));
    await assert.rejects(store.learningTransaction(user.id,async transaction=>{
      await recordQuestionAnswers({store:transaction,userId:user.id,state,answers:answers.map(answer=>({...answer,attemptId:randomUUID()})),plan:null});
      throw new Error('guest rollback');
    }),/guest rollback/);
    assert.equal(JSON.stringify(await store.listStats(user.id)),snapshot,'Roll back all answers after a late failure');
  }
  console.log('All seven PostgreSQL guest imports use at most 10 SQL statements for 10 answers, preserve retry counts and roll back late failures');
  console.log(JSON.stringify({ environment: 'isolated PGlite, warm schema, no simulated network latency', results }, null, 2));
} finally {
  await db.close();
}
