import assert from 'node:assert/strict';
import fs from 'node:fs';
import { testLoader } from './pack-test-utils.mjs';

const load = testLoader();
const { availableStates } = load('lib/states.ts');
const { stateSeoArticles } = load('lib/seo-article-catalog.ts');
const { seoGuides } = load('lib/seo-guides.ts');
const { articleStudyActions, articlePaths } = load('lib/article-study-actions.ts');
const base = process.env.SEO_TEST_BASE || 'http://127.0.0.1:3417';
const canonicalBase = process.env.SEO_CANONICAL_BASE || 'https://arizonanotaryprep.com';
const docs = new Map();
const internalTargets = new Set();
const indexHtml = new Map();
const read = async path => {
  const response = await fetch(new URL(path, base), { redirect: 'manual', signal: AbortSignal.timeout(60000) });
  assert.equal(response.status, 200, `Public URL ${path}`);
  return response.text();
};
const sitemap = await read('/sitemap.xml');
const queue = [];
for (const state of availableStates()) {
  const resource = state.code === 'AZ' ? '/arizona-notary-exam-guides/' : articlePaths(state.code).resources;
  indexHtml.set(state.code, await read(resource));
  const articles = state.code === 'AZ' ? [...seoGuides.filter(article => article.index !== false), ...stateSeoArticles.AZ] : stateSeoArticles[state.code];
  for (const article of articles) queue.push({ state, article });
}
// Bound concurrency so this check is also suitable for a read-only production recheck.
const workers = Array.from({ length: 4 }, async () => {
  while (queue.length) {
    const { state, article } = queue.shift();
    const html = await read(article.path);
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];
    assert.ok(main, `${article.path} server-rendered article`);
    assert.equal((main.match(/<h1\b/g) || []).length, 1, `${article.path} unique H1`);
    assert.ok(html.includes(`rel="canonical" href="${canonicalBase}${article.path}"`), `${article.path} self canonical`);
    assert.ok(!/<meta name="robots" content="[^"]*noindex/.test(html), `${article.path} indexable`);
    assert.ok(html.includes('"@type":"BlogPosting"'), `${article.path} structured article data`);
    assert.ok(sitemap.includes(`${canonicalBase}${article.path}</loc>`), `${article.path} sitemap`);
    assert.ok(indexHtml.get(state.code).includes(`href="${article.path}"`), `${article.path} linked from state index`);
    for (const action of articleStudyActions(state.code)) {
      assert.ok(main.includes(`href="${action.href}"`), `${article.path} action ${action.targetMode}`);
      internalTargets.add(action.href);
    }
    for (const match of main.matchAll(/href="(\/[^"#]*)"/g)) internalTargets.add(match[1].replaceAll('&amp;', '&'));
    docs.set(article.path, { state: state.code, characters: main.replace(/<[^>]+>/g, ' ').length });
  }
});
await Promise.all(workers);
const targets = [...internalTargets];
await Promise.all(Array.from({ length: 4 }, async () => {
  while (targets.length) await read(targets.shift());
}));
const report = { states: availableStates().length, articles: docs.size, directInternalTargets: internalTargets.size, result: 'PASS' };
fs.mkdirSync('.tools', { recursive: true });
fs.writeFileSync('.tools/seo-matrix-http.json', JSON.stringify({ ...report, pages: Object.fromEntries(docs) }, null, 2));
console.log(JSON.stringify(report, null, 2));
