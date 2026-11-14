import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { testLoader } from './pack-test-utils.mjs';

const load = testLoader();
const { packFor } = load('lib/prep-pack.ts');
const { freeStateCatalog } = load('lib/free-state-catalog.ts');
const { serverStateQuestions } = load('data/full-state-server.ts');
const { mistakeReviewQuestions } = load('lib/mistake-targets.ts');
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
  const bank = serverStateQuestions(code);
  const stats = bank.map(question => ({ questionId: question.question_id }));
  assert.equal(mistakeReviewQuestions(code, bank, stats, true).length, 10, `${code} full wrong-answer bank uses bounded practice sets`);
  assert.ok(mistakeReviewQuestions(code, bank, stats, false).every(question => question.is_free), `${code} free review eligibility`);
  assert.ok(pack.topics.every(topic => serverStateQuestions(code).some(question => question.study_topic === topic.id)), `${code} every declared topic has questions`);
  assert.ok(pack.cards.length >= 50, `${code} independent cards`);
  assert.ok(pack.cards.every(card => !pack.questions().some(question => question.question_text === card.front)));
  assert.equal(pack.pickFull(42, false).questions.length, pack.fullCount);
  assert.ok(pack.pickFull(42, false).questions.every(question => question.is_free));
}
console.log(`${expected.length} full products have complete banks, cards, Quick10, comprehensive practice and Pro`);

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
