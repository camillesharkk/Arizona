import assert from 'node:assert/strict';
import fs from 'node:fs';
import { testLoader } from './pack-test-utils.mjs';

process.env.VERCEL_ENV = 'production';
process.env.STATE_PREVIEW = '1';
const load = testLoader();
const { productionStateBlocked, prepPageEnabled } = load('lib/state-release.ts');
assert.equal(productionStateBlocked('PA'), false, 'PA public learning APIs must be enabled');
assert.equal(productionStateBlocked('LA'), false, 'LA candidate enables learning');
assert.equal(prepPageEnabled('pennsylvania'), true);
assert.equal(prepPageEnabled('louisiana'), true);
const { switchStateHref } = load('lib/ca-site.ts');
assert.equal(switchStateHref('/new-york/practice/?mode=full', 'PA'), '/pennsylvania/practice/');
assert.equal(switchStateHref('/pennsylvania/practice/', 'NY'), '/new-york/practice/');
assert.equal(switchStateHref('/california/pricing/', 'PA'), '/pennsylvania/pricing/');
const { prepPacks } = load('lib/prep-pack.ts');
const { stateByCode } = load('lib/states.ts');
assert.equal(prepPacks.PA.available, true);
assert.equal(stateByCode('PA').homePath, '/pennsylvania/');
assert.equal(stateByCode('PA').status, 'available');
assert.equal(stateByCode('LA').status, 'available');
for (const [key, path] of Object.entries(prepPacks.PA.paths)) {
  assert.ok(key === 'login' || path.startsWith('/pennsylvania/'), key + ' must use the public PA path');
}
const { paArticles, paReferenceArticles } = load('data/pa-articles.ts');
assert.equal(paArticles.length, 10);
assert.equal(Object.keys(paReferenceArticles).length, 3);
assert.doesNotMatch(JSON.stringify([paArticles, paReferenceArticles]), /\/preview\/pennsylvania/);
const sitemap = load('app/sitemap.ts').default().map(entry => new URL(entry.url).pathname);
for (const path of [prepPacks.PA.paths.home, prepPacks.PA.paths.practice, prepPacks.PA.paths.pricing, ...paArticles.map(article => article.path), ...Object.values(paReferenceArticles).map(article => article.path)]) assert.ok(sitemap.includes(path), path + ' missing from sitemap');
assert.ok(sitemap.includes('/new-york/'));
assert.ok(!sitemap.some(path => path.startsWith('/preview/')));
for (const route of ['', 'practice/', 'questions/', 'study-guide/', 'study-cards/', 'wrong-answers/', 'daily-study/', 'resources/', 'exam-guide/', 'passing-score/', 'laws/', 'become-a-notary/', 'pricing/']) {
  const file = 'app/pennsylvania/' + route + 'page.tsx';
  assert.ok(fs.existsSync(file), file + ' missing');
}
console.log('PA public routes, state entry, learning gates, article links and sitemap passed; LA candidate retains public PA');

// Render the actual selector with its menu open, without browser globals or effects.
const menuLoad = testLoader({
  react: { useState: () => [true, () => {}], useEffect: () => {}, useRef: () => ({ current: null }) },
  'next/link': { __esModule: true, default: 'a' },
});
const { StateMenu } = menuLoad('components/StateMenu.tsx');
function elements(node) {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== 'object') return [];
  return [node, ...elements(node.props?.children)];
}
const nyMenu = elements(StateMenu({ pathname: '/new-york/practice/', current: 'NY' }));
assert.ok(nyMenu.some(node => node.props?.role === 'menuitem' && node.props.href === '/pennsylvania/practice/'));
assert.ok(nyMenu.some(node => node.props?.href === '/louisiana/practice/'));
const paMenu = elements(StateMenu({ pathname: '/pennsylvania/practice/', current: 'PA' }));
assert.ok(paMenu.some(node => node.props?.role === 'menuitem' && node.props.href === '/new-york/practice/'));
