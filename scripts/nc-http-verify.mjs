import assert from 'node:assert/strict';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { testLoader, TEST_PASSWORD } from './pack-test-utils.mjs';

const base = process.env.PACK_TEST_BASE_URL || 'http://127.0.0.1:3431';
if (!/^http:\/\/(127\.0\.0\.1|localhost):/.test(base)) throw new Error('NC checks require isolated localhost data');
const bank = JSON.parse(fs.readFileSync('.tools/pack-bank.json', 'utf8'));
const load = testLoader();
const pack = load('lib/prep-pack.ts').packFor('NC');
const records = [];
for (const feature of ['', 'practice/', 'study-guide/', 'study-cards/', 'resources/', 'become-a-notary/', 'laws/', 'questions/', 'pricing/']) {
  const response = await fetch(`${base}/north-carolina/${feature}`);
  assert.equal(response.status, 200, feature);
  const html = await response.text();
  assert.match(html, /noindex/);
  assert.match(html, /https:\/\/arizonanotaryprep.com\/north-carolina\//);
}
assert.doesNotMatch(await (await fetch(base + '/sitemap.xml')).text(), /north-carolina/);

for (const kind of ['free', 'pro', 'expired', 'azpro']) {
  const login = await fetch(base + '/api/auth/login/', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: `nc-${kind}-http@example.invalid`, password: TEST_PASSWORD }) });
  assert.equal(login.status, 200, kind);
  const cookie = login.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
  async function request(route, body, status = 200) {
    const response = await fetch(base + route, { method: body ? 'POST' : 'GET', headers: { cookie, 'content-type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
    assert.equal(response.status, status, `${kind} ${route} ${await response.clone().text()}`);
    return response.json();
  }
  const me = (await request('/api/auth/me/')).user;
  assert.equal(me.ncPro, kind === 'pro');
  assert.equal(me.arizonaPro, kind === 'azpro');
  assert.equal(Boolean(me.ncPlanExpiresAt), kind === 'pro');
  const free = bank.NC.find(q => q.is_free), paid = bank.NC.find(q => !q.is_free);
  const answer = q => ({ state: 'NC', questionId: q.question_id, questionVersion: q.version, selected: q.correct_option, attemptId: randomUUID() });
  await request('/api/progress/', answer(free));
  await request('/api/progress/', answer(paid), kind === 'pro' ? 200 : 402);
  await request('/api/progress/', { ...answer(free), state: 'AZ' }, 400);
  const azPaid = bank.AZ.find(q => !q.is_free);
  await request('/api/progress/', { ...answer(azPaid), state: 'AZ' }, kind === 'azpro' ? 200 : 402);

  const quick = pack.pickQuick(317);
  const input = { accountId: me.id, state: 'NC', examId: randomUUID(), finishedAt: new Date().toISOString(), questions: quick.map((q, index) => ({ questionId: q.question_id, questionVersion: q.version, selected: index < 3 ? ['A', 'B', 'C', 'D'].find(letter => letter !== q.correct_option) : q.correct_option, attemptId: randomUUID() })) };
  const imports = await Promise.all([request('/api/progress/import/', input), request('/api/progress/import/', input)]);
  assert.equal(imports.filter(result => result.duplicate).length, 1);
  await request('/api/progress/import/', input);
  const progress = await request('/api/progress/');
  assert.equal(progress.ncPro, kind === 'pro');
  assert.equal(Boolean(progress.ncPlanExpiresAt), kind === 'pro');
  assert.equal(progress.exams.filter(exam => exam.id === input.examId).length, 1);
  assert.equal(progress.exams.find(exam => exam.id === input.examId).correctCount, 7);
  const wrong = await request('/api/mistakes/?state=NC');
  assert.ok(input.questions.slice(0, 3).every(q => wrong.mistakes.some(stat => stat.questionId === q.questionId)));
  assert.ok(wrong.mistakes.every(stat => stat.state === 'NC' && stat.bank === 'north-carolina-notary-practice'));
  assert.ok((await request('/api/mistakes/?state=AZ')).mistakes.every(stat => stat.state === 'AZ'));
  await request('/api/mistakes/', { questionId: free.question_id, favorited: true });
  assert.ok((await request('/api/mistakes/?state=NC')).favorites.some(stat => stat.questionId === free.question_id));
  await request('/api/mistakes/', { questionId: free.question_id, saveForReview: true });
  const daily = await request('/api/daily-study/?state=NC');
  assert.equal(daily.state, 'NC');
  assert.equal(daily.freeOnly, kind !== 'pro');
  await request('/api/study-settings/?state=NC', { mode: 'custom', newQuestions: 3 });
  assert.equal((await request('/api/study-settings/?state=NC')).settings.newQuestions, 3);
  assert.equal((await request('/api/daily-study/?state=NC')).settings.newQuestions, 3);
  await request('/api/ai/tutor/', { state: 'NC', questionId: free.question_id, questionVersion: free.version, mode: 'explain' });

  const full = pack.pickFull(805, kind === 'pro').questions;
  assert.equal(full.length, 60);
  const submission = { kind: 'pack-full', state: 'NC', examId: randomUUID(), seed: 805, questions: full.map((q, index) => ({ questionId: q.question_id, questionVersion: q.version, selected: index < 2 ? ['A', 'B', 'C', 'D'].find(letter => letter !== q.correct_option) : q.correct_option })) };
  const priorFull = me.packFullExamCount.NC;
  if (kind === 'pro' || priorFull === 0) {
    const saved = await request('/api/progress/', submission);
    assert.equal(saved.exam.correctCount, 58);
    assert.equal(saved.exam.total, 60);
    assert.equal((await request('/api/progress/', submission)).duplicate, true);
  }
  await request('/api/progress/', { ...submission, examId: randomUUID() }, kind === 'pro' ? 200 : 402);
  records.push({ kind, ncPro: me.ncPro, azPro: me.arizonaPro, import: 'retained once', full: 'server graded', favorites: 'state isolated', daily: 'preserved' });
}
fs.writeFileSync('.tools/nc-http-results.json', JSON.stringify(records, null, 2));
console.log('NC HTTP passed for free, NC Pro, expired NC Pro and historical AZ Pro. Routes, noindex, sitemap, permissions, duplicate imports, full grading, state isolation, favorites, Daily Study, settings and Tutor verified.');
