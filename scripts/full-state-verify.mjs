import assert from 'node:assert/strict';
import { testLoader } from './pack-test-utils.mjs';

const load = testLoader();
const { packFor } = load('lib/prep-pack.ts');
const { freeStateCatalog } = load('lib/free-state-catalog.ts');
const expected = process.env.FULL_STATE_VERIFY_CODES?.split(',') || freeStateCatalog.map(([code]) => code);
for (const code of expected) {
  const pack = packFor(code);
  assert.ok(pack.counts().published >= 203, `${code} full published bank`);
  assert.equal(pack.counts().free, 60, `${code} free pool`);
  assert.equal(pack.counts().pro, pack.counts().published - 60);
  assert.equal(pack.freeLaunch, false, `${code} complete product`);
  assert.equal(pack.purchaseEnabled, true, `${code} shared Pro checkout`);
  assert.equal(pack.fullReady, true, `${code} comprehensive practice`);
  assert.equal(pack.pickQuick(42).length, 10);
  assert.ok(pack.cards.length >= 50, `${code} independent cards`);
  assert.ok(pack.cards.every(card => !pack.questions().some(question => question.question_text === card.front)));
  assert.equal(pack.pickFull(42, false).questions.length, pack.fullCount);
  assert.ok(pack.pickFull(42, false).questions.every(question => question.is_free));
}
console.log(`${expected.length} full products have complete banks, cards, Quick10, comprehensive practice and Pro`);
