import assert from 'node:assert/strict';
import fs from 'node:fs';
import { testLoader, TEST_PASSWORD } from './pack-test-utils.mjs';
const base = process.env.PACK_TEST_BASE_URL || 'http://127.0.0.1:3438';
const gates = process.env.CT_GATE_BASE_URL || 'http://127.0.0.1:3439';
assert.match(base, /^http:\/\/(127\.0\.0\.1|localhost):/);
assert.match(gates, /^http:\/\/(127\.0\.0\.1|localhost):/);
const { ctPaths, ctSources } = testLoader()('lib/ct-site.ts');
const { ctArticles } = testLoader()('data/ct-articles.ts');
const routes = [...new Set([...Object.values(ctPaths), ...ctArticles.map(article => article.path)])].filter(route => route.startsWith('/connecticut/'));
for (const route of routes) {
  const response = await fetch(base + route, { redirect: 'manual', headers: { 'user-agent': 'Googlebot' } });
  assert.ok(route === ctPaths.daily ? [200, 307].includes(response.status) : response.status === 200, route);
  if (response.status === 200) {
    const html = await response.text();
    if (route === ctPaths.daily) { assert.ok(html.includes('/login/') && html.includes('NEXT_REDIRECT')); assert.equal((await fetch(gates + route)).status, 404); continue; }
    assert.match(html, /name="robots" content="noindex/);
    assert.ok(html.includes(`rel="canonical" href="https://arizonanotaryprep.com${route}"`), route + ' canonical');
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1, route + ' direct canonical');
  }
  assert.equal((await fetch(gates + route)).status, 404, 'Production gate ' + route);
}
const sitemap = await (await fetch(base + '/sitemap.xml')).text();
assert.ok(!sitemap.includes('/connecticut/'));
const home = await (await fetch(base + ctPaths.home)).text();
assert.ok(home.includes(ctSources.application));
assert.ok(!/Unlock Pro|Upgrade to Pro|Buy Pro/.test(home));
const login = await fetch(gates + '/api/auth/login/', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'ct-free-http@example.invalid', password: TEST_PASSWORD }) });
assert.equal(login.status, 200);
const cookie = login.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
for (const route of ['/api/daily-study/?state=CT', '/api/mistakes/?state=CT', '/api/study-settings/?state=CT']) assert.equal((await fetch(gates + route, { headers: { cookie } })).status, 404);
const q = testLoader()('data/ct-content.ts').publishedCtQuestions()[0];
assert.equal((await fetch(gates + '/api/progress/', { method: 'POST', headers: { cookie, 'content-type': 'application/json' }, body: JSON.stringify({ state: 'CT', questionId: q.question_id, questionVersion: q.version, selected: q.correct_option }) })).status, 404);
fs.writeFileSync('.tools/ct-routes-result.json', JSON.stringify({ checkedAt: new Date().toISOString(), routes: routes.length, directMetadata: 'one canonical and noindex', sitemap: 'CT excluded', productionPagesAndApis: '404', application: ctSources.application }, null, 2));
console.log(`CT ${routes.length} routes, direct metadata, sitemap, purchase suppression and production page/API gates passed`);
