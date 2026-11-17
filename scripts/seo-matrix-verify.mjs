import assert from 'node:assert/strict';
import fs from 'node:fs';
import { testLoader } from './pack-test-utils.mjs';

const load = testLoader();
const { availableStates } = load('lib/states.ts');
// The public catalog must be the same catalog consumed by routes and resource pages.
assert.ok(fs.existsSync('lib/seo-article-catalog.ts'), 'Public SEO catalog and new search entry points are missing');
const { stateSeoArticles } = load('lib/seo-article-catalog.ts');
const { seoGuides } = load('lib/seo-guides.ts');
const { articleStudyActions } = load('lib/article-study-actions.ts');
const { supplementalArticles } = load('data/seo-matrix-articles.ts');
const { freeStateFeatures } = load('lib/free-state-catalog.ts');
const sitemap = load('app/sitemap.ts').default();
const indexed = new Set(sitemap.map(item => new URL(item.url).pathname));
const allPaths = new Set();
const allTitles = new Set();
const bodyCopies = new Set();
const report = [];
for (const state of availableStates()) {
  const articles = state.code === 'AZ' ? [...seoGuides.filter(article => article.index !== false), ...stateSeoArticles.AZ] : stateSeoArticles[state.code];
  assert.ok(articles?.length >= 10, `${state.code} needs at least ten independent editorial articles`);
  const additions = supplementalArticles[state.code] || [];
  for (const article of articles) {
    assert.ok(!allPaths.has(article.path), `Duplicate article path ${article.path}`);
    assert.ok(!allTitles.has(article.title.toLowerCase()), `Duplicate title ${article.title}`);
    assert.ok(indexed.has(article.path), `${article.path} missing from public sitemap`);
    assert.ok(article.description.trim().length > 0, `${article.path} needs a description`);
    allPaths.add(article.path);
    allTitles.add(article.title.toLowerCase());
  }
  for (const article of additions) {
    assert.ok(article.description.length >= 70, `${article.path} needs a useful description`);
    const text = [article.lede, ...article.sections.map(section => section.body)].join(' ');
    assert.ok(text.split(/\s+/).length >= 240, `${article.path} needs a complete answer`);
    assert.ok(!bodyCopies.has(text.toLowerCase().replaceAll(state.name.toLowerCase(), 'STATE')), `${article.path} copied article body`);
    bodyCopies.add(text.toLowerCase().replaceAll(state.name.toLowerCase(), 'STATE'));
    assert.ok(article.sections.some(section => section.link?.targetMode === 'official'), `${article.path} needs an official source`);
    assert.ok(article.sections.some(section => section.link?.targetMode === 'guide'), `${article.path} needs a contextual Study Guide action`);
    assert.ok(article.related.some(link => link.href !== article.path && (link.href.includes('/guides/') || link.href.includes('/resources/') || link.href.includes('/exam-guides/'))), `${article.path} needs discovery links`);
  }
  const actions = articleStudyActions(state.code);
  assert.ok(actions.some(action => action.targetMode === 'quick' && action.href.includes('mode=quick')), `${state.code} free Quick 10`);
  assert.ok(actions.some(action => action.targetMode === 'guide'), `${state.code} Study Guide`);
  if (freeStateFeatures[state.code]?.fullPractice === false) {
    assert.ok(actions.every(action => action.targetMode !== 'full'), `${state.code} closed full practice`);
  } else {
    assert.ok(actions.some(action => action.targetMode === 'full' && action.href.includes('mode=full')), `${state.code} full practice`);
  }
  if (freeStateFeatures[state.code]?.purchase === false) {
    assert.ok(actions.every(action => action.targetMode !== 'pricing'), `${state.code} closed purchase`);
  } else {
    assert.ok(actions.some(action => action.targetMode === 'pricing'), `${state.code} Pro bank`);
  }
  assert.ok(actions.every(action => action.href.startsWith(state.code === 'AZ' ? '/' : `/${state.slug}/`)), `${state.code} cross-state CTA`);
  report.push({ state: state.code, articles: articles.length, added: additions.length });
}
for (const component of ['components/StateArticle.tsx', 'components/SeoGuidePage.tsx']) {
  assert.match(fs.readFileSync(component, 'utf8'), /ArticleStudyActions/, `${component} must render the product journey`);
}
const states = load('lib/states.ts');
const gated = testLoader({
  '@/lib/states': { ...states, stateByCode: code => code === 'AR' ? { ...states.stateByCode(code), status: 'comingSoon' } : states.stateByCode(code) },
})('app/sitemap.ts').default();
assert.ok(gated.every(item => !stateSeoArticles.AR.some(article => item.url.endsWith(article.path))), 'Draft-state articles must stay outside the public sitemap');
console.log(JSON.stringify({ states: report, total: allPaths.size, result: 'PASS' }, null, 2));
