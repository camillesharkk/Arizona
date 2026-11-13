import assert from 'node:assert/strict';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { TEST_PASSWORD } from './pack-test-utils.mjs';

const base = process.env.PACK_TEST_BASE_URL || 'http://127.0.0.1:3427';
if (!/^http:\/\/(127\.0\.0\.1|localhost):/.test(base)) throw new Error('Guest write checks require seeded localhost data');
const bank = JSON.parse(fs.readFileSync('.tools/pack-bank.json','utf8'));
const login = await fetch(base + '/api/auth/login/', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:'pack-free-http@example.invalid',password:TEST_PASSWORD})});
assert.equal(login.status,200);
const cookie = login.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');
async function request(route, body) {
  const response = await fetch(base+route,{method:body?'POST':'GET',headers:{cookie,'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  assert.equal(response.status,200,route);
  return response.json();
}
const me = await request('/api/auth/me/');
const allowance = JSON.stringify(me.user);
for (const [state, questions] of Object.entries(bank)) {
  const snapshot = await request('/api/progress/');
  const count = rows=>rows.filter(stat=>stat.state===state).reduce((sum,stat)=>sum+stat.rightCount+stat.wrongCount,0);
  const input = {accountId:me.user.id,state,examId:randomUUID(),finishedAt:new Date().toISOString(),questions:questions.filter(question=>question.is_free).slice(0,10).map((question,index)=>({questionId:question.question_id,questionVersion:question.version,selected:index<3?['A','B','C'].find(letter=>letter!==question.correct_option):question.correct_option,attemptId:randomUUID()}))};
  const responses = await Promise.all([request('/api/progress/import/',input),request('/api/progress/import/',input)]);
  assert.equal(responses.filter(response=>response.duplicate).length,1);
  const saved = await request('/api/progress/');
  assert.equal(count(saved.stats)-count(snapshot.stats),10);
  assert.equal(saved.exams.filter(exam=>exam.id===input.examId).length,1);
  assert.equal(saved.exams.find(exam=>exam.id===input.examId).correctCount,7);
  const wrong = await request('/api/mistakes/?state='+state);
  assert.ok(input.questions.slice(0,3).every(answer=>wrong.mistakes.some(stat=>stat.questionId===answer.questionId)));
  assert.ok(wrong.mistakes.every(stat=>stat.state===state));
  await request('/api/progress/import/',input);
  assert.equal(count((await request('/api/progress/')).stats),count(saved.stats));
  console.log(`${state}: actual HTTP concurrent import, 10 retained answers, 3 mistakes, one history record and refreshed replay passed`);
}
assert.equal(JSON.stringify((await request('/api/auth/me/')).user),allowance,'Guest imports preserve full-exam allowances and Pro rights');
assert.equal((await fetch(base+'/api/progress/import/',{method:'POST',headers:{'content-type':'application/json'},body:'{}'})).status,401);
console.log('Guest imports preserve the free account and six full-exam counters and require authentication');
