import assert from 'node:assert/strict';
import { testLoader } from './pack-test-utils.mjs';
const load = testLoader();
const { packFor } = load('lib/prep-pack.ts');
const pack = packFor('CT');
assert.ok(pack, 'CT must be a registered prep pack');
assert.equal(pack.fullMinutes, null);
assert.deepEqual(JSON.parse(JSON.stringify(pack.counts())), { published: 203, free: 60, pro: 143 });
assert.ok(pack.cards.length >= 50);
const questions = pack.questions();
assert.equal(load('data/ct-articles.ts').ctArticles.length, 10);
assert.ok(pack.cards.every(card => !questions.some(q => q.question_text === card.front)));
assert.equal(new Set(questions.map(q => q.question_id)).size, 203);
assert.equal(new Set(questions.map(q => q.question_text.toLowerCase())).size, 203);
assert.equal(new Set(pack.cards.map(c => c.front.toLowerCase())).size, pack.cards.length);
const { findSource } = load('data/sources.ts');
for (const q of questions) {
  assert.equal(q.state, 'CT');
  assert.match(q.question_id, /^ct-\d{3}$/);
  assert.ok(findSource(q.source_id)?.url, q.question_id + ' source');
  assert.ok(q.source_reference && q.last_verified_at === '2026-11-13');
  assert.ok(q.concept_ids.length && q.concept_ids.every(id => pack.cards.some(c => c.id === id)));
  for (const letter of ['A', 'B', 'C', 'D']) assert.ok(q.option_feedback[letter].length > 12);
  assert.equal(new Set([q.option_a, q.option_b, q.option_c, q.option_d]).size, 4);
}
for (const topic of pack.topics) assert.ok(questions.filter(q => q.study_topic === topic.id && q.is_free).length >= 4);
for (let seed = 1; seed <= 200; seed++) {
  const quick = pack.pickQuick(seed);
  assert.equal(quick.length, 10);
  assert.equal(new Set(quick.map(q => q.question_id)).size, 10);
  assert.ok(quick.every(q => q.state === 'CT' && q.is_free));
  const full = pack.pickFull(seed);
  assert.equal(full.questions.length, pack.fullCount);
  assert.equal(new Set(full.questions.map(q => q.question_id)).size, pack.fullCount);
}
assert.equal(load('lib/site-state.ts').pathState('/connecticut/practice/'), 'CT');
assert.equal(load('lib/ca-site.ts').switchStateHref('/connecticut/practice/', 'AZ'), '/arizona-notary-practice-test/');
const { ctExam } = load('lib/ct-site.ts');
assert.equal(ctExam.allAnswersCorrect, true);
assert.equal(ctExam.officialQuestionCount, null);
assert.equal(ctExam.officialTimeLimitMinutes, null);
assert.equal(ctExam.officialFormat, null);
assert.equal(ctExam.officialReferenceMaterials, null);
console.log('CT content, sources, cards, 200 free/full draws, paths and official unknowns passed');
