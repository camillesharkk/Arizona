import assert from 'node:assert/strict';
import { testLoader } from './pack-test-utils.mjs';

const load = testLoader();
const { packFor } = load('lib/prep-pack.ts');
const { pathState } = load('lib/site-state.ts');
const { switchStateHref } = load('lib/ca-site.ts');
const { freeStateContent } = load('data/free-state-content.ts');
const { sources } = load('data/sources.ts');
const { fullStateSummary } = load('data/full-state-summary.ts');
const codes = (process.env.VERIFY_STATES || 'AR,CO,IL,ME,MD,MO,MT,NE,NV,NJ,NM,OH,OR,UT,VT,WI,WY').split(',');
for (const code of codes) {
  const pack = packFor(code);
  assert.ok(pack, `${code} has a shared practice pack`);
  assert.equal(pack.questions().length >= 10, true);
  assert.equal(pack.pickQuick(42).length, 10);
  assert.equal(new Set(pack.pickQuick(42).map(q => q.question_id)).size, 10);
  assert.equal(pack.pickQuick(42).every(q => q.state === code && q.is_free && q.status === 'published'), true);
  assert.equal(pathState(pack.paths.practice), code);
  assert.equal(switchStateHref('/california/practice/', code), pack.paths.practice);
  assert.equal(switchStateHref(pack.paths.practice, 'CA'), '/california/practice/');
  assert.equal(pack.fullReady, Boolean(fullStateSummary[code]?.ready));
  assert.equal(pack.purchaseEnabled, Boolean(fullStateSummary[code]?.ready));
  const content = freeStateContent[code];
  assert.ok(content.sources.length > 0);
  assert.ok(pack.topics.length >= 3);
  for (const question of pack.questions()) {
    assert.ok(sources[question.source_id]?.url.startsWith('https://'));
    assert.equal(question.last_verified_at, '2026-11-14');
    assert.ok(question.explanation.length > 20);
    assert.equal(new Set([question.option_a, question.option_b, question.option_c, question.option_d]).size, 4);
    assert.ok(Object.values(question.option_feedback).every(note => note.length > 5));
    assert.ok(pack.topics.some(topic => topic.id === question.study_topic));
  }
}
console.log(`${codes.length} state packs, sources, explanations, Quick 10 draws, state paths and reviewed product gates passed`);
