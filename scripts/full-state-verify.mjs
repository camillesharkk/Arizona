import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { testLoader } from './pack-test-utils.mjs';

const load = testLoader();
const { packFor } = load('lib/prep-pack.ts');
const { freeStateCatalog, freeStateFeatures } = load('lib/free-state-catalog.ts');
const { serverStateQuestions } = load('data/full-state-server.ts');
const { mistakeReviewQuestions } = load('lib/mistake-targets.ts');
const { fullStateArticles } = load('data/full-state-articles.ts');
const expected = process.env.FULL_STATE_VERIFY_CODES?.split(',') || freeStateCatalog.map(([code]) => code);
for (const code of expected) {
  const pack = packFor(code);
  const features = freeStateFeatures[code];
  assert.ok(pack.counts().published >= 203, `${code} full published bank`);
  assert.equal(pack.counts().free, 60, `${code} free pool`);
  assert.equal(pack.counts().pro, pack.counts().published - 60);
  assert.equal(pack.freeLaunch, false, `${code} complete product`);
  assert.equal(pack.purchaseEnabled, features?.purchase !== false, `${code} accepted purchase capability`);
  assert.equal(pack.fullReady, features?.fullPractice !== false, `${code} accepted full-practice capability`);
  assert.equal(pack.pickQuick(42).length, 10);
  const bank = serverStateQuestions(code);
  const stats = bank.map(question => ({ questionId: question.question_id }));
  assert.equal(mistakeReviewQuestions(code, bank, stats, true).length, 10, `${code} full wrong-answer bank uses bounded practice sets`);
  assert.ok(mistakeReviewQuestions(code, bank, stats, false).every(question => question.is_free), `${code} free review eligibility`);
  assert.ok(pack.topics.every(topic => serverStateQuestions(code).some(question => question.study_topic === topic.id)), `${code} every declared topic has questions`);
  assert.ok(pack.cards.length >= 50, `${code} independent cards`);
  assert.equal(fullStateArticles[code].length, 10, `${code} independent articles`);
  assert.ok(fullStateArticles[code].every(article => article.title.includes(pack.name)), `${code} article titles identify their state`);
  assert.ok(pack.cards.every(card => !pack.questions().some(question => question.question_text === card.front)));
  if (features?.fullPractice === false) {
    assert.equal(pack.fullCount, 0, `${code} closed full practice has no question-count claim`);
    assert.equal(pack.pickFull(42, false), null);
    assert.equal(pack.pickFull(42, true), null);
    assert.ok(fullStateArticles[code].every(article => article.endCta.targetMode !== 'full'), `${code} articles offer accepted practice formats`);
  } else {
    assert.equal(pack.pickFull(42, false).questions.length, pack.fullCount);
    assert.ok(pack.pickFull(42, false).questions.every(question => question.is_free));
  }
  if (features?.purchase === false) {
    assert.ok(fullStateArticles[code].every(article => article.related.every(link => !link.href.includes('/pricing/'))), `${code} articles hide purchasing`);
  }
}
console.log(`${expected.length} complete learning packs have reviewed banks, cards, articles, Quick 10 and capability-aware full/pricing gates`);

if (process.env.CLIENT_BUILD_DIR) {
  const directory = path.resolve(process.env.CLIENT_BUILD_DIR, 'static/chunks');
  const chunks = fs.readdirSync(directory, { recursive: true }).filter(file => file.endsWith('.js'));
  const browserCode = chunks.map(file => fs.readFileSync(path.join(directory, file), 'utf8')).join('\n');
  const { serverStateQuestions } = load('data/full-state-server.ts');
  const publicStems = new Set(expected.flatMap(code => packFor(code).questions().map(question => question.question_text)));
  for (const code of expected) for (const question of serverStateQuestions(code).filter(question => !question.is_free)) {
    const escaped = JSON.stringify(question.question_text).slice(1, -1);
    assert.ok(!new RegExp(`question_id["']?:["']${question.question_id}["']`).test(browserCode), `${question.question_id} paid record stays outside browser chunks`);
    if (!publicStems.has(question.question_text)) {
      assert.ok(!browserCode.includes(question.question_text) && !browserCode.includes(escaped), `${question.question_id} stays outside browser chunks`);
    }
  }
  console.log(`${expected.length} paid state banks remain server-only across ${chunks.length} browser chunks`);
}
