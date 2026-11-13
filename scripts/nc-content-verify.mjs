import assert from 'node:assert/strict';
import fs from 'node:fs';
import { testLoader } from './pack-test-utils.mjs';

const load = testLoader();
const { publishedNcQuestions, ncQuestionCounts, ncTopics, ncCards, ncSources, NC_CHECKED } = load('data/nc-content.ts');
const questions = publishedNcQuestions();
assert.deepEqual(JSON.parse(JSON.stringify(ncQuestionCounts())), { published: 203, free: 60, pro: 143 });
assert.equal(questions.length, new Set(questions.map(question => question.question_id)).size);
assert.equal(ncCards.length, new Set(ncCards.map(card => card.id)).size);
assert.ok(ncCards.length >= 50, 'At least fifty independently authored knowledge cards');
const cardIds = new Set(ncCards.map(card => card.id));
const topicIds = new Set(ncTopics.map(topic => topic.id));
const normalized = text => text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const stems = new Set();
const distribution = {};
const answers = { A: 0, B: 0, C: 0, D: 0 };

for (let index = 0; index < questions.length; index += 1) {
  const question = questions[index];
  assert.equal(question.question_id, `nc-${String(index + 1).padStart(3, '0')}`);
  assert.equal(question.state, 'NC');
  assert.equal(question.status, 'published');
  assert.equal(question.last_verified_at, NC_CHECKED);
  assert.equal(question.version, 1);
  assert.ok(topicIds.has(question.study_topic));
  assert.ok(ncSources[question.source_id], `${question.question_id} resolves its official source`);
  assert.ok(/G\.S\. 10B-\d+|18 NCAC 07[A-Z] \.\d{4}|SOS 2026/.test(question.source_reference));
  assert.ok(question.concept_ids.length > 0);
  for (const id of question.concept_ids) assert.ok(cardIds.has(id), `${question.question_id} maps to card ${id}`);
  assert.ok(question.explanation.length > 45);
  assert.ok(!stems.has(normalized(question.question_text)), `${question.question_id} has a unique stem`);
  stems.add(normalized(question.question_text));
  const choices = ['a', 'b', 'c', 'd'].map(letter => question[`option_${letter}`]);
  assert.equal(new Set(choices.map(normalized)).size, 4, `${question.question_id} has four distinct options`);
  for (const letter of ['A', 'B', 'C', 'D']) assert.ok(question.option_feedback[letter]?.length > 15);
  assert.equal(question.option_feedback[question.correct_option], question.explanation);
  answers[question.correct_option] += 1;
  distribution[question.study_topic] ??= { published: 0, free: 0, pro: 0 };
  distribution[question.study_topic].published += 1;
  distribution[question.study_topic][question.is_free ? 'free' : 'pro'] += 1;
}
for (const topic of ncTopics) {
  assert.ok(distribution[topic.id]?.published > 0);
  assert.ok(distribution[topic.id]?.free >= 5, `${topic.id} has free foundations`);
}
for (const card of ncCards) {
  for (const key of ['id', 'study', 'title', 'front', 'rule', 'boundary', 'mixup', 'source', 'sourceUrl']) assert.ok(card[key]?.length, `${card.id} has ${key}`);
  assert.ok(topicIds.has(card.study));
  assert.ok(/^https:\/\/(www\.ncleg\.gov|reports\.oah\.state\.nc\.us|www\.sosnc\.gov)\//.test(card.sourceUrl));
  assert.ok(!questions.some(question => normalized(card.front) === normalized(question.question_text)), `${card.id} is independently written`);
}
const stopWords = new Set('a an the of to is in and or for with as on by at that what which does may must not only no it be can'.split(' '));
const words = text => new Set(normalized(text).split(' ').filter(word => !stopWords.has(word)));
const similarityCandidates = [];
for (let left = 0; left < questions.length; left += 1) {
  const a = words(questions[left].question_text);
  for (let right = left + 1; right < questions.length; right += 1) {
    const b = words(questions[right].question_text);
    const overlap = [...a].filter(word => b.has(word)).length;
    const score = overlap / new Set([...a, ...b]).size;
    if (score >= 0.5) similarityCandidates.push({ left: questions[left].question_id, right: questions[right].question_id, score: Number(score.toFixed(3)) });
  }
}
const contentFiles = fs.readdirSync('data').filter(name => /^nc-(identity|acts|certificates|conflicts|fees-seals|records)\.ts$/.test(name));
assert.equal(contentFiles.length, 6);
console.log(JSON.stringify({ result: 'PASS', checked: NC_CHECKED, counts: ncQuestionCounts(), independentCards: ncCards.length, distribution, answers, similarityCandidates }, null, 2));
