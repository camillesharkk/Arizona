import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { testLoader, TEST_PASSWORD } from './pack-test-utils.mjs';

const load = testLoader();
const pack = load('lib/prep-pack.ts').packFor('CT');
if (process.argv.includes('--seed-ct')) {
  process.env.NOTARY_DATA_DIR = path.resolve('.tools/ct-data');
  delete process.env.DATABASE_URL;
  const store = testLoader()('lib/store/file-store.ts').fileStore;
  const { hashSync } = createRequire(import.meta.url)('bcryptjs');
  for (const surface of ['desktop', 'mobile', 'http']) for (const kind of ['free', 'pro', 'expired', 'otherstate', 'all', 'guestclaim']) {
    const email = `ct-${kind}-${surface}${process.env.CT_TEST_ACCOUNT_SUFFIX || ""}@example.invalid`;
    let user = await store.getUserByEmail(email);
    if (!user) user = await store.createUser({ email, passwordHash: hashSync(TEST_PASSWORD, 4), name: `CT ${kind} ${surface}` });
    await store.updateUser(user.id, { emailVerified: true, emailVerifiedAt: new Date().toISOString() });
    if (!['free', 'guestclaim'].includes(kind) && !(await store.listEntitlements(user.id)).length) {
      await store.insertEntitlement({ userId: user.id, productCode: 'az_exam_pro_60d', state: kind === 'otherstate' ? 'AZ' : kind === 'all' ? 'ALL' : 'CT', status: 'active', startsAt: new Date(Date.now() - 86400000).toISOString(), expiresAt: new Date(Date.now() + (kind === 'expired' ? -3600000 : 86400000 * 59)).toISOString(), provider: 'mock', providerOrderId: `ct-${kind}-${surface}-${user.id}`, providerCustomerId: null });
    }
  }
  console.log('Seeded 18 isolated local accounts, including CT, ALL, other-state and expired entitlements');
  process.exit(0);
}

const base = process.env.PACK_TEST_BASE_URL || 'http://127.0.0.1:3436';
assert.match(base, /^http:\/\/(127\.0\.0\.1|localhost):/);
const reports = [];
for (const kind of ['free', 'pro', 'expired', 'otherstate', 'all']) {
  const login = await fetch(base + '/api/auth/login/', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: `ct-${kind}-http@example.invalid`, password: TEST_PASSWORD }) });
  assert.equal(login.status, 200, await login.clone().text());
  const cookie = login.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
  const request = (route, body) => fetch(base + route, { method: body ? 'POST' : 'GET', headers: { cookie, 'content-type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(60000) });
  const json = async (route, body) => { const response = await request(route, body); assert.equal(response.status, 200, route + ': ' + await response.clone().text()); return response.json(); };
  const premium = kind === 'pro' || kind === 'all' || kind === 'otherstate';
  const me = await json('/api/auth/me/');
  assert.equal(me.user.connecticutPro, premium);
  if (kind === "pro") assert.equal(me.user.arizonaPro, true);
  const azBefore = await json('/api/mistakes/?state=AZ');
  const free = pack.questions().find(q => q.is_free), paid = pack.questions().find(q => !q.is_free);
  const wrong = ['A','B','C','D'].find(letter => letter !== free.correct_option);
  const answer = { state: 'CT', questionId: free.question_id, questionVersion: free.version, selected: wrong, attemptId: randomUUID() };
  const saved = await json('/api/progress/', answer);
  assert.equal(saved.stat.state, 'CT'); assert.equal(saved.stat.bank, 'connecticut-notary-exam');
  assert.equal((await json('/api/progress/', answer)).stat.wrongCount, saved.stat.wrongCount);
  assert.equal((await request('/api/progress/', { ...answer, questionId: paid.question_id, selected: paid.correct_option, attemptId: randomUUID() })).status, premium ? 200 : 402);
  assert.equal((await request('/api/progress/', { ...answer, state: 'AZ' })).status, 400);
  assert.equal((await request('/api/progress/', { ...answer, questionVersion: 999 })).status, 409);
  await json('/api/mistakes/', { questionId: free.question_id, favorited: true });
  await json('/api/mistakes/', { questionId: free.question_id, saveForReview: true });
  const notebook = await json('/api/mistakes/?state=CT');
  assert.ok(notebook.mistakes.some(q => q.questionId === free.question_id));
  assert.ok(notebook.favorites.some(q => q.questionId === free.question_id));
  const input = { accountId: me.user.id, state: 'CT', examId: randomUUID(), finishedAt: new Date().toISOString(), questions: pack.pickQuick(78413).map((q, index) => ({ questionId: q.question_id, questionVersion: q.version, selected: index < 3 ? ['A','B','C','D'].find(letter => letter !== q.correct_option) : q.correct_option, attemptId: randomUUID() })) };
  const imports = await Promise.all([json('/api/progress/import/', input), json('/api/progress/import/', input)]);
  assert.equal(imports.filter(result => result.duplicate).length, 1);
  assert.equal(imports[0].exam.correctCount, 7);
  const progress = await json('/api/progress/');
  assert.equal(progress.exams.filter(exam => exam.id === input.examId).length, 1);
  const ctDaily = await json('/api/daily-study/?state=CT');
  assert.equal(ctDaily.questionCount, 203);
  assert.equal(ctDaily.freeQuestionCount, 60);
  assert.equal(ctDaily.freeOnly, !premium);
  const allowed = new Set(pack.questions().filter(q => premium || q.is_free).map(q => q.question_id));
  assert.ok([...ctDaily.practiceQuestionIds, ...ctDaily.reviewQuestionIds].every(id => allowed.has(id)));
  assert.ok([...ctDaily.practiceQuestionIds, ...ctDaily.reviewQuestionIds].every(id => id.startsWith('ct-')));
  const card = ctDaily.practiceCards[0] || ctDaily.reviewCards[0];
  assert.ok(card?.id.startsWith('ct-card-'));
  await json('/api/daily-study/?state=CT', { action: 'studied', cardId: card.id, attemptId: randomUUID() });
  assert.ok((await json('/api/daily-study/?state=CT')).taskStatus.some(task => task.key === 'card:' + card.id && task.status === 'done'));
  assert.deepEqual(await json('/api/mistakes/?state=AZ'), azBefore);
  const seed = 571231, draw = pack.pickFull(seed);
  const earlierFull = (await json('/api/progress/')).exams.find(exam => exam.mode === 'ct-full');
  const full = { kind: 'pack-full', state: 'CT', seed, examId: earlierFull?.id || randomUUID(), questions: draw.questions.map(q => ({ questionId: q.question_id, questionVersion: q.version, selected: q.correct_option })) };
  const result = await json('/api/progress/', full);
  assert.equal(result.exam.correctCount, 40);
  assert.equal((await json('/api/progress/', full)).duplicate, true);
  assert.equal((await request('/api/progress/', { ...full, examId: randomUUID() })).status, premium ? 200 : 402);
  reports.push({ kind, connecticutPro: premium, questions: premium ? ctDaily.questionCount : ctDaily.freeQuestionCount, importScore: 7, duplicateImport: true, favorites: true, daily: true, full: 40, azIsolation: true });
}
fs.mkdirSync('.tools', { recursive: true });
fs.writeFileSync('.tools/ct-http-result.json', JSON.stringify({ checkedAt: new Date().toISOString(), base, reports }, null, 2));
console.log(JSON.stringify(reports, null, 2));
