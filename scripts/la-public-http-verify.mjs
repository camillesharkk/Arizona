import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { testLoader, TEST_PASSWORD } from './pack-test-utils.mjs';

const base = process.env.PACK_TEST_BASE_URL || 'http://127.0.0.1:3423';
if (!/^http:\/\/(localhost|127\.0\.0\.1):/.test(base)) throw Error('Isolated localhost only');
const data = path.resolve(process.env.NOTARY_DATA_DIR || '.tools/la-public-data');
if (!data.startsWith(path.resolve('.tools') + path.sep)) throw Error('Test accounts must stay in this worktree .tools directory');
process.env.NOTARY_DATA_DIR = data;
const load = testLoader();
const store = load('lib/store/file-store.ts').fileStore;
const { prepPacks } = load('lib/prep-pack.ts');
const { laArticles, laReferenceArticles } = load('data/la-articles.ts');
const paths = Object.entries(prepPacks.LA.paths).filter(([key]) => key !== 'login').map(([, value]) => value);
const pages = [];
for (const path of [...paths, ...laArticles.map(article => article.path)]) {
  const response = await fetch(base + path);
  const html = await response.text();
  assert.equal(response.status, 200, path);
  if (path.includes('daily-study')) {
    assert.ok(html.includes('NEXT_REDIRECT') && html.includes('%2Flouisiana%2Fdaily-study%2F'), 'Anonymous daily study must retain the LA login return path');
  } else {
    assert.ok(/<h1(?:\s[^>]*)?>/.test(html), path + ' missing page heading');
  }
  assert.doesNotMatch(html, /Under development|NEXT_HTTP_ERROR_FALLBACK;404/, path);
  assert.doesNotMatch(html, /href="\/preview\/louisiana\//, path + ' links to preview');
  assert.match(html, /np_state|Louisiana/, path);
  if (!path.includes('daily-study') && !path.includes('wrong-answers')) {
    assert.ok(html.includes(`href="https://arizonanotaryprep.com${path}"`), path + ' canonical missing');
  }
  pages.push({ path, status: response.status });
}
for (const article of Object.values(laReferenceArticles)) {
  const html = await (await fetch(base + article.path)).text();
  assert.ok(html.includes(article.h1), article.path + ' wrong reference content');
}
for (const slug of ['pennsylvania', 'louisiana', 'new-york']) {
  for (const route of ['', 'practice/', 'laws/', 'pricing/']) {
    for (const rsc of [false, true]) {
      const response = await fetch(base + '/preview/' + slug + '/' + route, { headers: rsc ? { RSC: '1', 'Next-Router-Prefetch': '1' } : {} });
      assert.equal(response.status, 404, slug + ' preview must stay blocked');
    }
  }
}
assert.doesNotMatch(await (await fetch(base + '/louisiana/')).text(), /Under development/);
assert.equal((await fetch(base + '/louisiana/practice/')).status, 200);
const rights = [];
for (const kind of ['free', 'pro', 'expired']) {
  const email = `la-public-${kind}-${randomUUID()}@example.invalid`;
  const user = await store.createUser({ email, passwordHash: bcrypt.hashSync(TEST_PASSWORD, 4), name: 'LA public acceptance' });
  await store.updateUser(user.id, { emailVerified: true, emailVerifiedAt: new Date().toISOString() });
  if (kind !== 'free') {
    await store.insertEntitlement({ userId: user.id, productCode: 'az_exam_pro_60d', state: 'ALL', status: 'active', startsAt: new Date(Date.now() - 172800000).toISOString(), expiresAt: new Date(Date.now() + (kind === 'pro' ? 2592000000 : -86400000)).toISOString(), provider: 'mock', providerOrderId: randomUUID(), providerCustomerId: null });
  }
  const login = await fetch(base + '/api/auth/login/', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password: TEST_PASSWORD }) });
  assert.equal(login.status, 200);
  const cookie = login.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
  const request = (route, body) => fetch(base + route, { method: body ? 'POST' : 'GET', headers: { cookie, 'content-type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const dailyPage = await request('/louisiana/daily-study/');
  assert.equal(dailyPage.status, 200);
  assert.ok((await dailyPage.text()).includes('Daily Study'), 'Signed-in daily study renders');
  for (const route of ['/api/mistakes/', '/api/daily-study/', '/api/study-settings/', '/api/ai/tutor/']) {
    assert.equal((await request(route + '?state=LA')).status, 200, route + ' LA');
    assert.equal((await request(route + '?state=PA')).status, 200, route + ' PA');
  }
  assert.equal((await request('/api/progress/', { kind: 'pack-full', state: 'LA' })).status, 400);
  const paid = prepPacks.LA.questions().find(question => !question.is_free);
  const paidResponse = await request('/api/progress/', { state: 'LA', questionId: paid.question_id, questionVersion: paid.version, selected: paid.correct_option, attemptId: randomUUID() });
  assert.equal(paidResponse.status, kind === 'pro' ? 200 : 402);
  const seed = 12361;
  const draw = prepPacks.LA.pickFull(seed);
  const input = { kind: 'pack-full', state: 'LA', examId: randomUUID(), seed, questions: draw.questions.map(question => ({ questionId: question.question_id, questionVersion: question.version, selected: question.correct_option })) };
  const response = await request('/api/progress/', input);
  assert.equal(response.status, 200, await response.clone().text());
  const saved = await response.json();
  assert.equal(saved.exam.total, 40);
  assert.equal(saved.exam.score, 100);
  const repeated = await request('/api/progress/', input);
  assert.equal((await repeated.json()).duplicate, true);
  const progress = await (await request('/api/progress/')).json();
  assert.equal(progress.exams.filter(exam => exam.id === input.examId).length, 1);
  rights.push({ identity: kind, laFull: 200, paidAnswer: paidResponse.status, laLearning: 200, immutableReplay: true });
}
const sitemap = await (await fetch(base + '/sitemap.xml')).text();
assert.match(sitemap, /\/louisiana\/practice\//);
assert.match(sitemap, /\/pennsylvania\/practice\//);
assert.match(sitemap, /\/new-york\/practice\//);
assert.doesNotMatch(sitemap, /\/preview\//);
const result = { checkedAt: new Date().toISOString(), pages, rights, previewHtmlAndRsc: 'all blocked', sitemap: 'PA, LA and NY included; preview excluded' };
fs.writeFileSync('.tools/la-public-http-result.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
