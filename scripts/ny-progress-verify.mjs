import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import ts from 'typescript';

const nativeRequire = createRequire(import.meta.url);
const cache = new Map();
let store;
let allowPro = true;
const browserData = new Map();
const localStorage = { getItem: key => browserData.get(key) ?? null, setItem: (key, value) => browserData.set(key, value) };
function load(file) {
  file = path.resolve(file);
  if (!path.extname(file)) file += '.ts';
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const require = name => {
    if (name === '@/lib/store') return { getStore: async () => store };
    if (name === '@/lib/session') return { getSession: async () => ({ id: 'isolated-test' }) };
    if (name === '@/lib/entitlements') return { canAccessQuestion: async (_id, q) => q.is_free || allowPro };
    if (name === '@/lib/commerce/usage') return { recordProUsage: async () => undefined };
    // Use the actual exam snapshot persistence for NY historical records.
    if (name === '@/lib/account') return { currentEmail: () => null };
    if (name.startsWith('@/')) return load(name.slice(2));
    if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name));
    return nativeRequire(name);
  };
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(js, { module, exports: module.exports, require, console, Date, Math, process, URL, structuredClone, localStorage, window: { dispatchEvent() {} }, Event });
  return module.exports;
}
store = load('lib/store/memory-store.ts').createMemoryStore();
const { recordQuestionAnswer } = load('lib/progress.ts');
const banks = [
  ['NY', load('data/ny-content.ts').publishedNyQuestions()],
  ['AZ', load('data/questions.ts').publishedQuestions()],
  ['CA', load('data/ca-questions.ts').publishedCaQuestions()],
  ['HI', load('data/hi-questions.ts').publishedHiQuestions()],
  ['PA', load('data/pa-content.ts').publishedPaQuestions()],
  ['LA', load('data/la-content.ts').publishedLaQuestions()],
];
for (const [state, questions] of banks) {
  const q = questions[0];
  const wrong = ['A', 'B', 'C', 'D'].find(x => x !== q.correct_option);
  const opts = { userId: 'isolated-test', questionId: q.question_id, selected: wrong, correct: false, attemptId: `${state}-1` };
  await recordQuestionAnswer(opts);
  let saved = await store.getStat(opts.userId, q.question_id);
  assert.equal(saved.state, state);
  assert.equal(saved.lastSelected, wrong);
  assert.equal(saved.wrongCount, 1);
  assert.ok(saved.nextReviewAt);
  await recordQuestionAnswer(opts);
  assert.equal((await store.getStat(opts.userId, q.question_id)).wrongCount, 1);
  await recordQuestionAnswer({ ...opts, selected: q.correct_option, correct: true, attemptId: `${state}-2` });
  saved = await store.getStat(opts.userId, q.question_id);
  assert.equal(saved.lastCorrect, true);
  assert.equal(saved.wrongCount, 1);
  assert.equal(saved.firstCorrect, false);
  console.log(`${state}: answer, wrong-answer history, review schedule and attempt deduplication passed`);
}
assert.equal((await store.listStats('isolated-test')).length, 6);
const replacement = load('data/ny-content.ts').publishedNyQuestions().find(q => q.question_id === 'ny-057');
const old = { ...(await store.listStats('isolated-test'))[0], questionId: replacement.question_id,
  mastered: true, favorited: true, rightCount: 12, wrongCount: 3, questionVersion: 1 };
await store.upsertStat(old);
await recordQuestionAnswer({ userId: old.userId, questionId: old.questionId, selected: replacement.correct_option, correct: true });
const revised = await store.getStat(old.userId, old.questionId);
assert.equal(revised.questionVersion, 2);
assert.equal(revised.mastered, false);
assert.equal(revised.rightCount, 1);
assert.equal(revised.favorited, true);
assert.equal(revised.revisionHistory[0].rightCount, 12);
assert.equal(revised.revisionHistory[0].wrongCount, 3);
console.log('Replaced item: historical record and favorite preserved; new mastery starts independently');
const { POST } = load('app/api/progress/route.ts');
const request = data => new Request('http://localhost/api/progress/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
const payload = { questionId: replacement.question_id, questionVersion: 2, selected: replacement.correct_option, state: 'NY', attemptId: 'ny-route-0001' };
assert.equal((await POST(request({ ...payload, state: 'CA' }))).status, 400);
assert.equal((await POST(request({ ...payload, questionVersion: 1 }))).status, 409);
assert.equal((await POST(request({ ...payload, questionVersion: undefined }))).status, 409);
allowPro = false;
assert.equal((await POST(request(payload))).status, 402);
allowPro = true;
let response = await POST(request(payload));
assert.equal(response.status, 200);
let body = await response.json();
assert.equal(body.correct, true);
assert.equal(body.stat.state, 'NY');
assert.equal(body.stat.questionVersion, 2);
const rightCount = body.stat.rightCount;
response = await POST(request(payload));
assert.equal((await response.json()).stat.rightCount, rightCount);
console.log('Actual POST handler: NY save 200, cross-state 400, stale/legacy version 409, free-user Pro denial 402, idempotent retry');
const previousVercelEnv = process.env.VERCEL_ENV;
process.env.VERCEL_ENV = 'production';
try {
  const { productionStateBlocked } = load('lib/state-release.ts');
  for (const state of ['LA']) {
    assert.equal(productionStateBlocked(state), true);
    assert.equal((await POST(request({kind:'exam',state,mode:'quick',score:0,correctCount:0,total:10}))).status,404);
  }
  for (const state of ['AZ','CA','HI','NY','PA']) assert.equal(productionStateBlocked(state),false);
  assert.equal((await POST(request(payload))).status,200);
  assert.equal((await POST(request({...payload,state:'AZ'}))).status,400);
  const { POST: mutateMistake, GET: readMistakes } = load('app/api/mistakes/route.ts');
  assert.equal((await mutateMistake(request({questionId:'la-001',favorited:true}))).status,404);
  assert.equal((await readMistakes(new Request('http://localhost/api/mistakes/?state=LA'))).status,404);
  const { GET: daily, POST: mutateDaily } = load('app/api/daily-study/route.ts');
  assert.equal((await daily(new Request('http://localhost/api/daily-study/?state=LA'))).status,404);
  assert.equal((await mutateDaily(new Request('http://localhost/api/daily-study/?state=LA',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'more',attemptId:'release-test-001'})}))).status,404);
  console.log('Production: LA learning rejected; NY answers and live states allowed; spoofed answer state denied');
} finally {
  if (previousVercelEnv === undefined) delete process.env.VERCEL_ENV;
  else process.env.VERCEL_ENV = previousVercelEnv;
}
await assert.rejects(recordQuestionAnswer({ userId: 'isolated-test', questionId: 'missing', selected: 'A', correct: false }), /unknown_question/);
const { loadProgress, recordAnswer } = load('lib/storage.ts');
localStorage.setItem('ny-notary-progress', JSON.stringify({ answeredIds: ['ny-057', 'ny-001'], wrongIds: ['ny-057'], flaggedIds: ['ny-057'], scores: [{ score: 80 }] }));
let local = loadProgress('NY');
assert.equal(local.answeredIds.join(','), 'ny-001');
assert.equal(local.wrongIds.length, 0);
assert.equal(local.flaggedIds[0], 'ny-057');
assert.equal(local.scores[0].score, 80);
assert.equal(local.revisionHistory[0].wrong, true);
assert.equal(loadProgress('NY').revisionHistory.length, 1);
recordAnswer('ny-057', false, 'NY');
local = loadProgress('NY');
assert.equal(local.wrongIds[0], 'ny-057');
assert.equal(local.questionVersions['ny-057'], 2);
assert.equal(local.revisionHistory.length, 1);
assert.equal(loadProgress('CA').answeredIds.length, 0);
console.log('Browser progress: old answers archived once, flags/scores preserved, current answer retained, CA isolated');
const { prepPacks } = load('lib/prep-pack.ts');
for (let seed = 0; seed < 200; seed++) {
  const quick = prepPacks.NY.pickQuick(seed);
  const full = prepPacks.NY.pickFull(seed).questions;
  assert.equal(new Set(quick.map(q => q.question_id)).size, 10);
  assert.ok(quick.every(q => q.is_free && q.state === 'NY'));
  assert.equal(new Set(full.map(q => q.question_id)).size, 40);
  assert.ok(full.every(q => q.state === 'NY'));
}
assert.equal(new Set(prepPacks.NY.cards.map(c => c.id)).size, 50);
assert.equal(new Set(prepPacks.NY.cards.map(c => c.front)).size, 50);
console.log('NY draws: 200 seeds each, Quick 10 free/unique, full 40 unique; 50 distinct card IDs/fronts');
const { readCaAttempt, latestCaQuick, listCaAttempts } = load('lib/ca-attempts.ts');
localStorage.setItem('ny-notary-attempts', JSON.stringify([
  { id: 'old', owner: 'test', state: 'NY', mode: 'quick', finishedAt: '2026-11-09', questionIds: ['ny-057'] },
  { id: 'current', owner: 'test', state: 'NY', mode: 'quick', finishedAt: '2026-11-08', questionIds: ['ny-001'], questionVersions: { 'ny-001': 1 } },
]));
assert.equal(readCaAttempt('test', 'old', 'NY'), null);
assert.equal(latestCaQuick('test', 'NY').id, 'current');
assert.equal(listCaAttempts('test', 'NY').length, 2);
assert.equal(latestCaQuick('test', 'CA'), null);
console.log('NY import: stale attempts excluded from regrading, raw history retained, latest current attempt selected, CA isolated');

const { examState, recentCaExams } = load('lib/ca-daily-shape.ts');
for (const state of ['AZ', 'CA', 'HI', 'NY', 'PA', 'LA']) {
  assert.equal(examState(state === 'AZ' ? 'full' : state.toLowerCase() + '-full'), state);
}
const examId = 'f0c98b2d-ec5f-4d19-81a1-d94c3c138555';
const examResponse = await POST(request({ kind: 'exam', mode: 'quick', state: 'NY', score: 90, correctCount: 9, total: 10, examId, wrongIds: ['ny-001'], skipped: 0 }));
assert.equal(examResponse.status, 200);
const duplicateExam = await POST(request({ kind: 'exam', mode: 'quick', state: 'NY', score: 0, correctCount: 0, total: 10, examId, wrongIds: ['ny-002'], skipped: 0 }));
assert.equal((await duplicateExam.json()).duplicate, true);
const snapshot = (await store.getStudyPlan('isolated-test', 'NY')).document.checks;
assert.deepEqual(Array.from(snapshot[examId].wrongIds), ['ny-001']);
const exams = await store.listExams('isolated-test');
assert.equal(exams.find(exam => exam.id === examId).mode, 'ny-quick');
const historic = recentCaExams(exams, snapshot, [], 'NY');
assert.deepEqual(Array.from(historic[0].wrongIds), ['ny-001']);
const perfect = recentCaExams([{ ...exams[0], id: 'perfect' }], { perfect: { wrong: 0, skipped: 0, wrongIds: [] } }, [{ questionId: 'ny-unrelated', state: 'NY', wrongCount: 1, mastered: false, nextReviewAt: null, lastWrongAt: exams[0].at }], 'NY');
assert.equal(perfect[0].wrongIds.length, 0);
console.log('NY historical exams: state attribution, saved wrong-ID snapshot and empty snapshot preserved independently of current stats');
if (process.argv.includes('--seed-preview')) {
  process.env.NOTARY_DATA_DIR = path.resolve(process.env.NY_TEST_DATA_DIR || '.tools/ny-verification-data');
  const { fileStore } = load('lib/store/file-store.ts');
  const { hash } = nativeRequire('bcryptjs');
  for (const kind of ['free', 'pro', 'expired']) {
    const email = `ny-${kind}@example.invalid`;
    let user = await fileStore.getUserByEmail(email);
    if (!user) user = await fileStore.createUser({ email, passwordHash: await hash('NY-preview-test-2026!', 10), name: `NY ${kind} test` });
    await fileStore.updateUser(user.id, { emailVerified: true, emailVerifiedAt: new Date().toISOString() });
    if (kind !== 'free' && !(await fileStore.listEntitlements(user.id)).length) {
      const day = 86400000;
      await fileStore.insertEntitlement({ userId: user.id, productCode: 'az_exam_pro_60d', state: 'ALL', status: 'active', startsAt: new Date(Date.now() - 2 * day).toISOString(), expiresAt: new Date(Date.now() + (kind === 'pro' ? 20 : -1) * day).toISOString(), provider: 'mock', providerOrderId: `ny-preview-${kind}`, providerCustomerId: null });
    }
  }
  console.log('Seeded three isolated localhost accounts (free / active Pro / expired Pro); no external account or user data changed');
}
