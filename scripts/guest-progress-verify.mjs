import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { testLoader } from './pack-test-utils.mjs';

// Exercise the candidate CT import with its preview flag enabled in this process.
process.env.NEXT_PUBLIC_CT_PREVIEW = "1";

let store;
process.env.STATE_PREVIEW = '1';
let owner;
const load = testLoader({
  '@/lib/store': { getStore: async () => store },
  '@/lib/session': { getSession: async () => owner ? { id: owner.id } : null },
});
store = load('lib/store/memory-store.ts').createMemoryStore();
owner = await store.createUser({ email: 'guest-import@example.invalid', passwordHash: 'isolated', name: null });
const { POST } = load('app/api/progress/import/route.ts');
const banks = {
  AZ: load('data/questions.ts').publishedQuestions(),
  CA: load('data/ca-questions.ts').publishedCaQuestions(),
  HI: load('data/hi-questions.ts').publishedHiQuestions(),
  NY: load('data/ny-content.ts').publishedNyQuestions(),
  PA: load('data/pa-content.ts').publishedPaQuestions(),
  LA: load('data/la-content.ts').publishedLaQuestions(),
  CT: load('data/ct-content.ts').publishedCtQuestions(),
  NC: load('data/nc-content.ts').publishedNcQuestions(),
};
const post = body => POST(new Request('http://localhost/api/progress/import/', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }));
for (const [state, bank] of Object.entries(banks)) {
  const questions = bank.filter(question => question.is_free).slice(0, 10);
  const input = {
    accountId: owner.id, state, examId: randomUUID(), finishedAt: new Date().toISOString(),
    questions: questions.map((question, index) => ({ questionId: question.question_id, questionVersion: question.version, selected: index < 3 ? ['A','B','C'].find(letter => letter !== question.correct_option) : question.correct_option, attemptId: randomUUID() })),
  };
  let response = await post(input);
  assert.equal(response.status, 200, state);
  assert.equal((await response.json()).exam.correctCount, 7);
  response = await post(input);
  assert.equal((await response.json()).duplicate, true);
  const stats = (await store.listStats(owner.id)).filter(stat => stat.state === state);
  assert.equal(stats.length, 10);
  assert.equal(stats.filter(stat => stat.wrongCount === 1).length, 3);
  assert.equal(stats.reduce((sum, stat) => sum + stat.rightCount + stat.wrongCount, 0), 10);
  assert.equal((await store.listExams(owner.id)).filter(exam => exam.id === input.examId).length, 1);
  const wrong = load('app/api/mistakes/route.ts');
  const notebook = await (await wrong.GET(new Request('http://localhost/api/mistakes/?state=' + state))).json();
  assert.equal(notebook.mistakes.length, 3);
  assert.ok(notebook.mistakes.every(stat => stat.state === state));
  assert.equal((await post({ ...input, accountId: randomUUID() })).status, 409);
  assert.equal((await post({ ...input, examId: randomUUID(), questions: [{ ...input.questions[0], questionId: questions[0].question_id, questionVersion: questions[0].version + 1 }] })).status, 409);
  console.log(state + ': guest Quick10 answers, mistakes, history, immutable retry and account/version boundaries passed');
}
const paid = banks.NY.find(question => !question.is_free);
assert.equal((await post({ accountId: owner.id, state:'NY', examId:randomUUID(), finishedAt:new Date().toISOString(), questions:[{questionId:paid.question_id,questionVersion:paid.version,selected:paid.correct_option,attemptId:randomUUID()}] })).status, 400);
owner = null;
assert.equal((await post({})).status, 401);
console.log('Guest import rejects Pro-question injection and anonymous requests');
