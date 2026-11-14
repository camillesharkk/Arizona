import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { testLoader } from './pack-test-utils.mjs';

process.env.AI_PROVIDER = 'local';
process.env.VERCEL_ENV = 'preview';
let store, session = null;
const usage = [];
const load = testLoader({
  '@/lib/store': { getStore: async () => store },
  '@/lib/session': { getSession: async () => session },
  '@/lib/commerce/usage': { recordProUsage: async (...args) => usage.push(args) },
});
store = load('lib/store/memory-store.ts').createMemoryStore();
const { fullStateSummary } = load('data/full-state-summary.ts');
const codes = process.env.FULL_STATE_VERIFY_CODES?.split(',') || Object.keys(fullStateSummary);
assert.ok(codes.length, 'Reviewed full state content is available');
const bankRoute = load('app/api/state/questions/route.ts');
const progress = load('app/api/progress/route.ts');
const tutor = load('app/api/ai/tutor/route.ts');
const daily = load('app/api/daily-study/route.ts');
const proUsageRoute = load('app/api/billing/pro-usage/route.ts');
const mistakes = load('app/api/mistakes/route.ts');
const authMe = load('app/api/auth/me/route.ts');
const { serverStateQuestions } = load('data/full-state-server.ts');
const { shuffle } = load('lib/answer-sequence.ts');
const { packFullExamCounts } = load('lib/entitlements.ts');
let testIp = '192.0.2.1';
const request = (path, body) => new Request(`http://localhost${path}`, body ? {
  method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': testIp }, body: JSON.stringify(body),
} : undefined);
const postProgress = body => progress.POST(request('/api/progress/', body));

for (const code of codes) {
  testIp = `192.0.2.${codes.indexOf(code) + 1}`;
  const payload = load('lib/billing/paddle.ts').buildPaddleTransactionPayload({ productId: 'pro-existing', finalPriceCents: 1999,
    userId: 'acceptance-user', quoteId: randomUUID(), productCode: 'az_exam_pro_60d', sourceState: code });
  assert.equal(payload.customData.source_state, code);
  assert.equal(payload.customData.product_code, 'az_exam_pro_60d');
  const bank = serverStateQuestions(code);
  const free = bank.filter(question => question.is_free);
  const paid = bank.find(question => !question.is_free);
  assert.equal(bank.length, 203, code);
  session = null;
  let response = await bankRoute.GET(request(`/api/state/questions/?state=${code}`));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  assert.equal((await response.json()).questions.length, 60);
  const freeUser = await store.createUser({ email: `${code}-free@example.invalid`, passwordHash: 'isolated', name: null });
  const proUser = await store.createUser({ email: `${code}-pro@example.invalid`, passwordHash: 'isolated', name: null });
  const expiredUser = await store.createUser({ email: `${code}-expired@example.invalid`, passwordHash: 'isolated', name: null });
  for (const [user, active] of [[proUser, true], [expiredUser, false]]) {
    await store.insertEntitlement({ userId: user.id, productCode: 'az_exam_pro_60d', state: 'ALL', status: 'active',
      startsAt: new Date(Date.now() - 172800000).toISOString(), expiresAt: new Date(Date.now() + (active ? 86400000 : -86400000)).toISOString(),
      provider: 'mock', providerOrderId: randomUUID(), providerCustomerId: null });
  }
  for (const [user, accessible, isPro] of [[freeUser, 60, false], [proUser, 203, true], [expiredUser, 60, false]]) {
    session = { id: user.id };
    const result = await (await bankRoute.GET(request(`/api/state/questions/?state=${code}`))).json();
    assert.equal(result.questions.length, accessible, `${code} bank ${accessible}`);
    assert.equal(result.pro, isPro);
    if (isPro) {
      assert.equal((await proUsageRoute.POST(request('/api/billing/pro-usage/', { featureCode: 'advanced_analytics', state: code }))).status, 200);
      assert.equal(usage.at(-1)[3], code);
    }
    const answer = { state: code, questionId: paid.question_id, questionVersion: paid.version, selected: paid.correct_option, attemptId: randomUUID() };
    response = await postProgress(answer);
    assert.equal(response.status, isPro ? 200 : 402, `${code} paid answer authorization`);
    response = await mistakes.POST(request('/api/mistakes/', { questionId: paid.question_id, saveForReview: true }));
    assert.equal(response.status, isPro ? 200 : 402, `${code} new paid review authorization`);
    response = await tutor.POST(request('/api/ai/tutor/', { state: code, questionId: paid.question_id, questionVersion: paid.version, mode: 'explain' }));
    assert.equal(response.status, isPro ? 200 : 402, `${code} paid Tutor authorization`);
    const plan = await (await daily.GET(request(`/api/daily-study/?state=${code}`))).json();
    assert.equal(plan.questionCount, 203, `${code} Daily Study full pool`);
    assert.equal(plan.freeQuestionCount, 60);
    assert.equal(plan.cardCount, 50);
    assert.equal(plan.freeOnly, !isPro);
  }
  const full = (pool, seed) => ({ kind: 'pack-full', state: code, seed, examId: randomUUID(),
    questions: shuffle(pool, seed).slice(0, 40).map((question, index) => ({ questionId: question.question_id, questionVersion: question.version,
      selected: index < 4 ? ['A', 'B', 'C', 'D'].find(letter => letter !== question.correct_option) : question.correct_option, attemptId: randomUUID() })),
  });
  session = { id: freeUser.id };
  assert.equal((await postProgress(full(bank, 28))).status, 400, `${code} free rejects premium draw`);
  const sitting = full(free, 42);
  const results = await Promise.all([postProgress(sitting), postProgress(sitting)]);
  assert.ok(results.every(result => result.status === 200));
  const saved = await Promise.all(results.map(result => result.json()));
  assert.equal(saved.filter(result => result.duplicate).length, 1);
  assert.equal(saved[0].exam.correctCount, 36);
  const answerStats = await store.listStats(freeUser.id);
  assert.equal(answerStats.length, 40);
  assert.ok(answerStats.every(stat => stat.chapter === bank.find(question => question.question_id === stat.questionId).study_topic));
  const legacyStat = answerStats.find(stat => stat.wrongCount > 0);
  await store.upsertStat({ ...legacyStat, chapter: legacyStat.topic });
  const projected = await (await progress.GET(request('/api/progress/'))).json();
  assert.equal(projected.stats.find(stat => stat.questionId === legacyStat.questionId).chapter, bank.find(question => question.question_id === legacyStat.questionId).study_topic);
  assert.equal((await store.getStat(freeUser.id, legacyStat.questionId)).wrongCount, legacyStat.wrongCount);
  assert.equal((await packFullExamCounts(freeUser.id))[code], 1);
  assert.equal((await (await authMe.GET()).json()).user.packFullExamCount[code], 1, `${code} account exposes its consumed full trial`);
  assert.equal((await postProgress(full(free, 43))).status, 402, `${code} free full trial limit`);
  const wrong = await (await mistakes.GET(request(`/api/mistakes/?state=${code}`))).json();
  assert.equal(wrong.mistakes.length, 4);
  assert.ok(wrong.mistakes.every(stat => stat.state === code));
  session = { id: proUser.id };
  for (const seed of [91, 92]) assert.equal((await postProgress(full(bank, seed))).status, 200, `${code} repeated Pro full practice`);
  // A visitor can finish a free sitting and then sign into an existing Pro account.
  assert.equal((await postProgress(full(free, 93))).status, 200, `${code} guest free draw retained by Pro account`);
  assert.equal((await packFullExamCounts(proUser.id))[code], 3);
  const invalidState = full(bank, 94);
  invalidState.questions[0].questionId = code === 'AR' ? 'co-001' : 'ar-001';
  assert.equal((await postProgress(invalidState)).status, 400, `${code} cross-state injection rejected`);
  console.log(`${code} actual handlers passed guest/free/Pro/expired banks, paid authorization, Tutor, Daily Study, full grading, concurrent retry, trial limit and state isolation`);
}
assert.ok(usage.some(args => args[1] === 'full_exam_extra'));
console.log(`${codes.length} full states passed with the shared ALL-state product`);
