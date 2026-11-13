import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {testLoader} from './pack-test-utils.mjs';

let store, owner;
const load=testLoader({'@/lib/store':{getStore:async()=>store},'@/lib/session':{getSession:async()=>owner},'@/lib/commerce/usage':{recordProUsage:async()=>({recorded:true})}});
store=load('lib/store/memory-store.ts').createMemoryStore();
const {POST}=load('app/api/progress/route.ts');
const {pickFullExam}=load('lib/quiz.ts');
owner=await store.createUser({email:'atomic-full-free@example.invalid',passwordHash:'isolated',name:null});
const draw=pickFullExam(614);
assert.equal(draw.length,45);
assert.ok(draw.some(question=>!question.is_free));
const input={kind:'pack-full',state:'AZ',examId:randomUUID(),seed:614,questions:draw.map(question=>({questionId:question.question_id,questionVersion:question.version,selected:question.correct_option,attemptId:randomUUID()}))};
const post=body=>POST(new Request('http://localhost/api/progress/',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}));
let response=await post(input);
assert.equal(response.status,200,'The free AZ trial authorizes all45 answers atomically');
assert.equal((await response.json()).exam.correctCount,45);
assert.equal((await store.listStats(owner.id)).length,45);
assert.equal((await post(input)).status,200);
assert.equal((await store.listExams(owner.id)).length,1);
assert.ok((await store.listStats(owner.id)).every(stat=>stat.rightCount===1));
assert.equal((await post({...input,examId:randomUUID()})).status,402);
assert.equal((await post({state:'AZ',questionId:draw.find(q=>!q.is_free).question_id,selected:'A'})).status,402,'Full trial authorization stays within the sitting');
console.log('AZ free Full45 atomic save, immutable retry, trial limit and ordinary Pro-question boundary passed');

const savedStore=store;
owner=await store.createUser({email:'legacy-partial-full@example.invalid',passwordHash:'isolated',name:null});
const legacyInput={...input,examId:randomUUID()};
const legacyExam={id:legacyInput.examId,userId:owner.id,mode:'full',score:100,correctCount:45,total:45,at:'2026-11-12T12:00:00.000Z'};
await store.addExam(legacyExam);
for(const answer of legacyInput.questions.filter(answer=>draw.find(q=>q.question_id===answer.questionId).is_free)) {
  await load('lib/progress.ts').recordQuestionAnswer({...answer,userId:owner.id,correct:true,store});
}
assert.ok((await store.listStats(owner.id)).length<45);
response=await post(legacyInput);
assert.equal(response.status,200);
assert.equal((await store.listStats(owner.id)).length,45,'Repair the missing trial answers');
assert.ok((await store.listStats(owner.id)).every(stat=>stat.rightCount===1),'Keep earlier successful per-question attempts counted once');
assert.equal(JSON.stringify((await store.listExams(owner.id))[0]),JSON.stringify(legacyExam),'Keep the original historical result');
await load('lib/daily-study.ts').dailyStudyView(owner.id,undefined,undefined,'AZ');
assert.equal((await store.getStudyPlan(owner.id,'AZ')).document.checks[legacyInput.examId].submissionVersion,1);
await post(legacyInput);
assert.ok((await store.listStats(owner.id)).every(stat=>stat.rightCount===1));
assert.equal((await post({...legacyInput,examId:randomUUID()})).status,402);
console.log('Legacy AZ partial save repairs45 answers once, retains its historical result and keeps its used trial');

owner=await store.createUser({email:'partial-without-summary@example.invalid',passwordHash:'isolated',name:null});
const partialInput={...input,examId:randomUUID()};
for(const answer of partialInput.questions.filter(answer=>draw.find(q=>q.question_id===answer.questionId).is_free)) {
  await load('lib/progress.ts').recordQuestionAnswer({...answer,userId:owner.id,correct:true,store});
}
assert.equal((await post(partialInput)).status,200);
assert.equal((await store.listStats(owner.id)).length,45);
assert.ok((await store.listStats(owner.id)).every(stat=>stat.rightCount===1),'Keep original attempts even when the legacy summary was never saved');
console.log('Legacy per-question writes without a summary recover without duplicate answer counts');

owner=await store.createUser({email:'rollback-full@example.invalid',passwordHash:'isolated',name:null});
const rollbackInput={...input,examId:randomUUID()};
store=Object.assign(Object.create(savedStore),{learningTransaction:(id,action)=>savedStore.learningTransaction(id,transaction=>{
  const failing=Object.assign(Object.create(transaction),{addExam:async exam=>{await transaction.addExam(exam);throw new Error('late-full-failure');}});
  return action(failing);
})});
await assert.rejects(post(rollbackInput),/late-full-failure/);
store=savedStore;
assert.equal((await store.listStats(owner.id)).length,0);
assert.equal((await store.listExams(owner.id)).length,0);
assert.equal(await store.getStudyPlan(owner.id,'AZ'),null);
assert.equal((await store.getUserById(owner.id)).bestScore,null);
assert.equal((await post(rollbackInput)).status,200,'Retry the rolled-back sitting with the same ID');
assert.equal((await store.getUserById(owner.id)).bestScore,100);

owner=await store.createUser({email:'concurrent-full@example.invalid',passwordHash:'isolated',name:null});
const concurrent=await Promise.all([post({...input,examId:randomUUID()}),post({...input,examId:randomUUID()})]);
assert.deepEqual(concurrent.map(response=>response.status).sort(),[200,402]);
assert.equal((await store.listExams(owner.id)).length,1);
assert.equal((await store.listStats(owner.id)).length,45);
console.log('Late failures roll back answers/result/trial/best score; concurrent full trials admit one sitting');
