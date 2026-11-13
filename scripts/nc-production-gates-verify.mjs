import assert from 'node:assert/strict';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { TEST_PASSWORD } from './pack-test-utils.mjs';

const base = process.env.PACK_TEST_BASE_URL || 'http://127.0.0.1:3432';
if (!/^http:\/\/(127\.0\.0\.1|localhost):/.test(base)) throw new Error('Production gate verification requires localhost');
for (const feature of ['', 'practice/', 'questions/', 'study-cards/', 'study-guide/', 'wrong-answers/', 'daily-study/', 'resources/', 'become-a-notary/', 'pricing/', 'exam-guide/', 'laws/', 'passing-score/']) {
  assert.equal((await fetch(base + '/north-carolina/' + feature)).status, 404, feature);
}
assert.equal((await fetch(base + '/preview/north-carolina/practice/')).status, 404);
for (const route of ['/arizona-notary-practice-test/', '/new-york/practice/']) assert.equal((await fetch(base + route)).status, 200);
assert.doesNotMatch(await (await fetch(base + '/sitemap.xml')).text(), /north-carolina/);
const login = await fetch(base + '/api/auth/login/', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'nc-free-http@example.invalid', password: TEST_PASSWORD }) });
assert.equal(login.status, 200);
const cookie = login.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
const me = await (await fetch(base + '/api/auth/me/', { headers: { cookie } })).json();
const question = JSON.parse(fs.readFileSync('.tools/pack-bank.json', 'utf8')).NC.find(q => q.is_free);
for (const route of ['/api/mistakes/?state=NC', '/api/daily-study/?state=NC', '/api/study-settings/?state=NC', '/api/ai/tutor/?state=NC']) {
  assert.equal((await fetch(base + route, { headers: { cookie } })).status, 404, route);
}
const cases = [
  ['/api/progress/', { state: 'NC', questionId: question.question_id, questionVersion: question.version, selected: question.correct_option }],
  ['/api/progress/import/', { accountId: me.user.id, state: 'NC', examId: randomUUID(), finishedAt: new Date().toISOString(), questions: [{ questionId: question.question_id, questionVersion: question.version, selected: question.correct_option }] }],
  ['/api/mistakes/', { questionId: question.question_id, favorited: true }],
  ['/api/ai/tutor/', { state: 'NC', questionId: question.question_id, questionVersion: question.version, mode: 'explain' }],
  ['/api/billing/pro-usage/', { state: 'NC', featureCode: 'weak_areas' }],
];
for (const [route, body] of cases) {
  const response = await fetch(base + route, { method: 'POST', headers: { cookie, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  assert.equal(response.status, 404, route);
}
console.log('Production-mode NC page, preview URL, authenticated learning mutations, settings, Tutor and usage gates passed. AZ and NY practice remain available. NC is absent from sitemap.');
