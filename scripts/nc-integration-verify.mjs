import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { testLoader } from './pack-test-utils.mjs';

const load = testLoader();
const { pathState } = load('lib/site-state.ts');
assert.equal(pathState('/north-carolina/practice/'), 'NC');
const { packFor } = load('lib/prep-pack.ts');
const pack = packFor('NC');
assert.ok(pack);
assert.equal(pack.fullMinutes, null);
assert.equal(pack.fullTitle, 'Comprehensive Practice');
assert.equal(pack.counts().published, 203);
assert.equal(pack.counts().free, 60);
assert.equal(pack.cards.length >= 50, true);
for (let seed = 1; seed <= 100; seed++) {
  const quick = pack.pickQuick(seed);
  assert.equal(quick.length, 10);
  assert.equal(new Set(quick.map(q => q.question_id)).size, 10);
  assert.ok(quick.every(q => q.is_free && q.state === 'NC'));
  for (const pro of [false, true]) {
    const full = pack.pickFull(seed, pro).questions;
    assert.equal(full.length, Math.min(60, pro ? 203 : 60));
    assert.equal(new Set(full.map(q => q.question_id)).size, full.length);
    assert.ok(full.every(q => q.state === 'NC' && (pro || q.is_free)));
  }
}
const { stateProCovers } = load('lib/state-pro.ts');
const active = { productCode: 'nc_exam_pro_60d', state: 'NC', status: 'active', startsAt: '2026-01-01', expiresAt: '2027-01-01', provider: 'mock', providerOrderId: 'nc-test' };
const now = new Date('2026-11-13');
assert.ok(stateProCovers([active], 'NC', now));
assert.equal(stateProCovers([active], 'AZ', now), false);
assert.equal(stateProCovers([{ ...active, expiresAt: '2026-01-02' }], 'NC', now), false);
assert.equal(stateProCovers([{ ...active, state: 'ALL', productCode: 'az_exam_pro_60d' }], 'NC', now), false);
const memory = load('lib/store/memory-store.ts').createMemoryStore();
const grants = testLoader({ '@/lib/store': { getStore: async () => memory } });
const user = await memory.createUser({ email: 'nc-windows@example.invalid', passwordHash: 'isolated', name: null });
const { grantStatePro60d } = grants('lib/entitlements.ts');
const receipts = [];
for (let index = 0; index < 3; index++) receipts.push(await grantStatePro60d({ userId: user.id, state: 'NC', provider: 'mock', providerOrderId: `nc-${index}` }));
assert.equal(Math.round((Date.parse(receipts[2].entitlement.expiresAt) - Date.parse(receipts[0].entitlement.startsAt)) / 86400000), 180, 'Three NC grants retain all 180 days');
assert.equal((await grantStatePro60d({ userId: user.id, state: 'NC', provider: 'mock', providerOrderId: 'nc-2' })).duplicate, true);
const { NcPracticeNext } = load('components/NcPracticeNext.tsx');
const topics = pack.topics.slice(0, 3).map(topic => ({ ...topic, right: 0, total: 3 }));
const weakHtml = renderToStaticMarkup(createElement(NcPracticeNext, { correct: 1, total: 10, topics, quick: true }));
assert.equal((weakHtml.match(/study-cards\/?\?topic=/g) || []).length, 2);
assert.equal((weakHtml.match(/mode=practice&amp;area=/g) || []).length, 2);
const strongHtml = renderToStaticMarkup(createElement(NcPracticeNext, { correct: 9, total: 10, topics: [], quick: true }));
assert.match(strongHtml, /north-carolina\/?#courses/);
assert.match(strongHtml, /Continue Practicing/);
console.log('NC routing, free Quick 10, access-aware unique comprehensive draw and state Pro boundaries passed');
