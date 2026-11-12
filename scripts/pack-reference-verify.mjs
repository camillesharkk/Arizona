import assert from 'node:assert/strict';
import { testLoader, verificationStates } from './pack-test-utils.mjs';

const states = verificationStates(['NY', 'PA', 'LA']);

process.env.STATE_PREVIEW = '1';
process.env.VERCEL_ENV = 'preview';
const load = testLoader({ 'next/navigation': { notFound() { throw new Error('not_found'); } } });
const { prepReferences } = load('lib/prep-articles.ts');
const { nyPassingScore, nyLaws, nyApplication } = load('data/ny-guides.ts');
const references = { 'passing-score': nyPassingScore, laws: nyLaws, 'become-a-notary': nyApplication };
const publicMetadata = {
  'passing-score': ['New York Exam Results and Passing Requirements', 'Read how New York reports examination results, retakes and practice scores.'],
  laws: ['New York Notary Laws', 'Review New York appointment, notarial acts, identification, journal, fees and electronic notarization rules.'],
  'become-a-notary': ['How to Become a New York Notary', 'Follow New York qualification, examination, oath, application and appointment steps.'],
};

for (const [reference, nyArticle] of Object.entries(references)) {
  const route = load(`app/preview/[state]/${reference}/page.tsx`);
  for (const [slug, code] of [['pennsylvania', 'PA'], ['louisiana', 'LA'], ['new-york', 'NY']]) {
    if (!states.includes(code)) continue;
    const params = Promise.resolve({ state: slug });
    const expected = code === 'NY' ? nyArticle : prepReferences[code][reference];
    const rendered = await route.default({ params });
    assert.equal(rendered.props.article, expected, `${code}/${reference} must render its registered article`);
    assert.equal(rendered.props.article.h1, expected.h1);
    const metadata = await route.generateMetadata({ params });
    assert.equal(metadata.title, expected.title, `${code}/${reference} must use its own title`);
    assert.equal(metadata.description, expected.description, `${code}/${reference} must use its own description`);
  }
  const publicRoute = load(`app/new-york/${reference}/page.tsx`);
  const publicRendered = await publicRoute.default();
  assert.equal(publicRendered.props.article, nyArticle, `Public NY ${reference} keeps the existing article`);
  assert.equal(publicRoute.metadata.title.absolute, publicMetadata[reference][0]);
  assert.equal(publicRoute.metadata.description, publicMetadata[reference][1]);
}

process.env.VERCEL_ENV = 'production';
for (const reference of Object.keys(references)) {
  const route = load(`app/preview/[state]/${reference}/page.tsx`);
  for (const state of ['louisiana']) {
    await assert.rejects(route.default({ params: Promise.resolve({ state }) }), /not_found/);
    await assert.rejects(route.generateMetadata({ params: Promise.resolve({ state }) }), /not_found/);
  }
}
console.log(`${states.join('/')} reference routes render registered articles and per-state metadata; public NY wrappers and LA renderer gate preserved; HTTP verification covers preview middleware`);
