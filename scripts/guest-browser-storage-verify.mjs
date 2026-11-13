import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { testLoader } from './pack-test-utils.mjs';

function storage() {
  const values = new Map();
  return { get length() { return values.size; }, key: index => [...values.keys()][index] ?? null,
    getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
}
const localStorage = storage(), sessionStorage = storage();
let requests = [], fail = false;
const load = testLoader({}, { localStorage, sessionStorage, window: {}, fetch: async (url, options) => {
  requests.push([url, options]);
  return Response.json({}, { status: fail ? 503 : 200 });
} });
const attempts = load('lib/ca-attempts.ts');
const sittings = load('lib/sitting.ts');
const sync = load('lib/ca-sync.ts');
const banks = {
  AZ: load('data/questions.ts').publishedQuestions(), CA: load('data/ca-questions.ts').publishedCaQuestions(),
  HI: load('data/hi-questions.ts').publishedHiQuestions(), NY: load('data/ny-content.ts').publishedNyQuestions(),
  PA: load('data/pa-content.ts').publishedPaQuestions(), LA: load('data/la-content.ts').publishedLaQuestions(),
};
for (const [state, bank] of Object.entries(banks)) {
  const question = bank.find(question => question.is_free);
  const id = randomUUID();
  const record = { id, owner: 'guest', state, mode: 'quick', sittingMode: 'quick', finishedAt: new Date().toISOString(), seed: 27,
    questionIds: [question.question_id], questionVersions: { [question.question_id]: question.version }, presentationVersion: 2,
    answers: { [question.question_id]: 'B' }, originalAnswers: { [question.question_id]: 'A' }, attemptIds: { [question.question_id]: randomUUID() },
    correctIds: [], wrongIds: [question.question_id], skippedIds: [], topicMisses: [] };
  attempts.saveCaQuickAttempt(record);
  const sitting = { ...record, version: 1, idx: 0, explainOpen: {}, flaggedIds: [], startedAt: Date.now(), timeLimitSeconds: null,
    done: true, examId: id, recordedIds: [], scored: false };
  sittings.writeSitting(sessionStorage, sitting);
  fail = true;
  assert.equal((await sync.syncCaAttempts(state, 'account-one')).pending, true);
  assert.equal(attempts.listCaAttempts('guest', state).length, 0);
  assert.equal(attempts.listCaAttempts('account-one', state)[0].synced, undefined);
  assert.equal(sittings.readSitting(sessionStorage, 'account-one', 'quick', state).examId, id);
  const payload = JSON.parse(requests.at(-1)[1].body);
  assert.equal(payload.questions[0].selected, 'A', 'Send canonical letters, retain shuffled display letters');
  assert.equal(payload.questions[0].questionVersion, question.version);
  assert.equal(payload.examId, id);
  const before = requests.length;
  await sync.syncCaAttempts(state, 'account-two');
  assert.equal(requests.length, before, 'Another account cannot claim previously adopted progress');
  fail = false;
  await Promise.all([sync.syncCaAttempts(state, 'account-one'), sync.syncCaAttempts(state, 'account-one')]);
  assert.equal(requests.length, before + 1, 'Concurrent consumers share one import');
  assert.equal(attempts.listCaAttempts('account-one', state)[0].synced, true);
  await sync.syncCaAttempts(state, 'account-one');
  assert.equal(requests.length, before + 1, 'Synced progress requires no auth or import request');
  console.log(`${state}: canonical answers, version, owner adoption, sitting restore, failed-sync retry and concurrent import passed`);
}

const legacyQuestions = banks.AZ.filter(question=>question.is_free).slice(0,10);
const presentation = load('lib/answer-sequence.ts').presentExamQuestions(legacyQuestions,41,1);
const legacyAnswers = Object.fromEntries(legacyQuestions.map(question=>[question.question_id,Object.entries(presentation.maps[question.question_id]).find(([,letter])=>letter===question.correct_option)[0]]));
for(const mode of ['quick','home-quick']) {
  load('lib/guest-sitting-attempt.ts').archiveGuestArizonaQuick({state:'AZ',mode,done:true,examId:randomUUID(),seed:41,questionIds:legacyQuestions.map(question=>question.question_id),answers:legacyAnswers,attemptIds:{},startedAt:Date.now()});
  const legacy = attempts.listCaAttempts('guest','AZ').find(attempt=>attempt.sittingMode===mode);
  assert.equal(legacy.correctIds.length,10,'Legacy AZ shuffled letters retain the original score');
}
localStorage.removeItem('az-notary-attempts');
const homeId = randomUUID();
sittings.writeSitting(sessionStorage,{version:1,owner:'guest',state:'AZ',mode:'home-quick',done:true,examId:homeId,seed:41,questionIds:legacyQuestions.map(question=>question.question_id),answers:legacyAnswers,attemptIds:{},startedAt:Date.now()});
await sync.syncCaAttempts('AZ','account-one');
assert.equal(attempts.listCaAttempts('account-one','AZ')[0].synced,true,'Legacy home Quick10 reaches the shared import');
const homeImport = JSON.parse(requests.at(-1)[1].body);
assert.equal(homeImport.examId,homeId);
assert.ok(homeImport.questions.every(answer=>answer.selected===legacyQuestions.find(question=>question.question_id===answer.questionId).correct_option));

const original = { version:1, owner:'guest', state:'NY', mode:'quick', seed:29, questionIds:['ny-001'], questionVersions:{'ny-001':0}, done:true, examId:randomUUID() };
sessionStorage.setItem(sittings.sittingKey('guest','quick','NY'), JSON.stringify(original));
const accountKey = sittings.sittingKey('account-one','quick','NY');
const existing = sessionStorage.getItem(accountKey);
sittings.adoptGuestSittings(sessionStorage,'account-one','NY');
assert.equal(sessionStorage.getItem(accountKey), existing, 'Keep an existing account sitting');
assert.ok(sessionStorage.getItem(`${accountKey}:history:${original.examId}`), 'Keep older raw versions in history');
const guestKey = sittings.sittingKey('guest','quick','CA');
sessionStorage.setItem(guestKey, JSON.stringify({...original,state:'CA'}));
sittings.adoptGuestSittings({...sessionStorage, setItem() { throw new Error('quota'); }},'account-one','CA');
assert.ok(sessionStorage.getItem(guestKey), 'Failed writes retain the guest source');

const reads = [];
let readCount = 0;
const accountLoad = testLoader({}, { fetch: () => { readCount++; return new Promise(resolve => { reads.push(resolve); }); } });
const account = accountLoad('lib/client-account.ts');
const controller = new AbortController();
const first = account.fetchAccount({signal:controller.signal});
const second = account.fetchAccount();
controller.abort();
reads[0](Response.json({user:{id:'one'}}));
await assert.rejects(first, {name:'AbortError'});
assert.equal((await (await second).json()).user.id,'one');
assert.equal(readCount,1);
const third = account.fetchAccount();
account.invalidateAccountRead();
const fourth = account.fetchAccount();
reads[1](Response.json({user:{id:'one'}}));
await third;
const fifth = account.fetchAccount();
assert.equal(readCount,3,'An older completed read cannot clear the newer session read');
reads[2](Response.json({user:{id:'two'}}));
assert.equal((await (await fourth).json()).user.id,'two');
assert.equal((await (await fifth).json()).user.id,'two','Each reader gets an independent response body');
assert.equal(readCount,3,'Session changes invalidate in-flight reads');
console.log('Storage history/write failures and concurrent auth reads, consumer abort and session invalidation passed');
