import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { testLoader } from './pack-test-utils.mjs';

assert.ok(fs.existsSync('data/in-questions.ts'), 'Indiana question bank must exist');
const load = testLoader();
const bank = load('data/in-questions.ts');
const questions = bank.publishedInQuestions();
const freeModule = load('data/in-free-questions.ts');
const summary = load('data/in-bank-summary.ts');
assert.equal(JSON.stringify(freeModule.inFreeQuestions), JSON.stringify(questions.filter(q=>q.is_free)), 'Client free bank matches authoritative public items');
for(const [key,value] of Object.entries({candidate:203,draft:0,published:203,free:60,pro:143})) assert.equal(summary.inBankCounts[key],value);
assert.ok(!/from\s+["'][^"']*(?:in-questions|in-question-items)/.test(fs.readFileSync('data/in-free-questions.ts','utf8')), 'Public bank must not import full paid bank');
assert.ok(freeModule.inFreeQuestions.every(q=>q.status==='published' && q.is_free));
assert.equal(bank.inQuestions.length,203,'203 original Indiana candidates');
assert.equal(questions.length, 203, 'Only primary-supported rows are published');
assert.equal(questions.filter(q => q.is_free).length, 60, '60 free questions');
assert.equal(questions.filter(q => !q.is_free).length, 143, '143 verified Pro questions');
assert.equal(new Set(bank.inQuestions.map(q => q.question_id)).size, 203);
assert.equal(new Set(bank.inQuestions.map(q => q.question_text.toLowerCase().replace(/[^a-z0-9]/g, ''))).size, 203, 'No duplicate question stems');
assert.equal(bank.inTopics.length, 6);
for (let i = 0; i < bank.inQuestions.length; i++) {
  const q = bank.inQuestions[i];
  assert.equal(q.question_id, `in-${String(i + 1).padStart(3, '0')}`);
  assert.equal(q.state, 'IN');
  assert.equal(q.last_verified_at, q.status === 'published' ? '2026-11-13' : '');
  if(q.status === 'draft') assert.equal(q.is_free,false);
  assert.ok(bank.inTopics.some(t => t.id === q.study_topic));
  assert.ok(['in-faq','in-sos-2025','in-guide-2024','in-shelby-seal'].includes(q.source_id) && q.source_reference.includes('https://'));
  assert.ok(q.concept_ids?.length && q.concept_ids.every(c => /^in-card-0[0-4][0-9]$|^in-card-050$/.test(c)));
  assert.equal(new Set([q.option_a,q.option_b,q.option_c,q.option_d]).size, 4);
  assert.ok(q.explanation.length >= 45);
  for (const letter of ['A','B','C','D']) assert.ok(q.option_feedback[letter].length >= 15);
}
const cards = load('data/in-cards.ts');
const publicCards = load('data/in-public-cards.ts');
assert.equal(publicCards.inPublicCards.length,50);
assert.equal(JSON.stringify(publicCards.inPublicCards),JSON.stringify(cards.inCards),'Only the reviewed published cards are client-accessible');
for (const q of questions) assert.ok(cards.inCards.some(card=>q.concept_ids.includes(card.id)), `Published question links a published card: ${q.question_id}`);
assert.equal(bank.inQuestionReview.filter(q=>q.status==='draft').length,0);
assert.ok(bank.inQuestionReview.filter(q=>q.status==='draft').every(q=>q.reason.length>20));
for (const topic of bank.inTopics) assert.equal(questions.filter(q => q.is_free && q.study_topic === topic.id).length,10, `Ten verified free questions: ${topic.id}`);
for (const seed of new Set([1,2,42,20261113,...Array.from({length:200},(_,i)=>i)])) {
  const quick = bank.pickInQuickExam(seed);
  assert.equal(quick.length, 10);
  assert.equal(new Set(quick.map(q => q.question_id)).size, 10);
  assert.ok(quick.every(q => q.is_free));
  assert.equal(new Set(quick.map(q => q.study_topic)).size, 6);
  assert.deepEqual(quick.map(q=>q.question_id), bank.pickInQuickExam(seed).map(q=>q.question_id));
  for (const pro of [false,true]) {
    const full = bank.pickInFullExam(seed,pro);
    assert.equal(full.questions.length,30);
    assert.equal(new Set(full.questions.map(q=>q.question_id)).size,30);
    assert.equal(full.unscoredIds.length,0);
    if (!pro) assert.ok(full.questions.every(q=>q.is_free));
    assert.deepEqual(full.questions.map(q=>q.question_id),bank.pickInFullExam(seed,pro).questions.map(q=>q.question_id));
  }
}
assert.ok(bank.pickInFullExam(42,true).questions.some(q=>!q.is_free));
console.log(JSON.stringify({ok:true,...bank.inQuestionCounts(),quick:10,full:30}));
