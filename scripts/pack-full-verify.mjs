import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import ts from 'typescript';
import { verificationStates } from './pack-test-utils.mjs';
const native = createRequire(import.meta.url), cache = new Map();
let store;
function load(file) {
  file=path.resolve(file); if(!path.extname(file)) file+='.ts';
  if(cache.has(file)) return cache.get(file).exports;
  const module={exports:{}}; cache.set(file,module);
  const require=name=> name==='@/lib/store' ? {getStore:async()=>store} : name.startsWith('@/') ? load(name.slice(2)) : name.startsWith('.') ? load(path.resolve(path.dirname(file),name)) : native(name);
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,{module,exports:module.exports,require,process,console,Date,Math,structuredClone});
  return module.exports;
}
const {savePackFullSubmission}=load('lib/ny-full-submission.ts');
assert.equal(typeof savePackFullSubmission,'function','PA/LA need one atomic server-graded submission');
const {prepPacks}=load('lib/prep-pack.ts');
for(const state of verificationStates(['PA','LA'])) {
  const pack=prepPacks[state];
  const draw=pack.pickFull(7123);
  if(process.argv.includes('--state')) assert.ok(draw, `${state} selected candidate must have a complete full draw`);
  if(!draw) { assert.equal(state,'LA'); console.log('LA content draw pending; rerun after integration'); continue; }
  store=load('lib/store/memory-store.ts').createMemoryStore();
  const user=await store.createUser({email:randomUUID()+'@example.invalid',passwordHash:'isolated',name:null});
  const input={state,examId:randomUUID(),seed:7123,questions:draw.questions.map(q=>({questionId:q.question_id,questionVersion:q.version,selected:q.correct_option}))};
  const result=await savePackFullSubmission(store,user.id,input);
  assert.equal(result.exam.total,state==='PA'?25:pack.fullCount);
  assert.equal(result.exam.correctCount,result.exam.total);
  assert.equal(result.exam.score,100);
  assert.equal((await store.listStats(user.id)).length,pack.fullCount);
  assert.equal((await store.getStudyPlan(user.id,state)).document.checks[input.examId].wrongIds.length,0,'correct unscored answers are not mistakes');
  assert.equal((await savePackFullSubmission(store,user.id,{...input,questions:[]})).duplicate,true,'retry returns original immutable result');
  assert.equal((await store.listExams(user.id)).length,1);
  await assert.rejects(savePackFullSubmission(store,user.id,{...input,examId:randomUUID()}),/full_trial_used/);
  const other=await store.createUser({email:randomUUID()+'@example.invalid',passwordHash:'isolated',name:null});
  if(state==='PA') await assert.rejects(savePackFullSubmission(store,other.id,{...input,examId:randomUUID(),questions:input.questions.map((q,i)=>i? q:{...q,selected:'D'})}),/invalid_exam/,'PA has no D choice');
  await assert.rejects(savePackFullSubmission(store,other.id,{...input,examId:randomUUID(),seed:99123}),/invalid_exam/,'the server owns PA scoring and site unscored allocation');
  const outcomes=await Promise.allSettled([1,2].map(()=>savePackFullSubmission(store,other.id,{...input,examId:randomUUID()})));
  assert.equal(outcomes.filter(r=>r.status==='fulfilled').length,1);
  if(state==='PA') {
    const legacy=await store.createUser({email:randomUUID()+'@example.invalid',passwordHash:'isolated',name:null});
    const saved=await savePackFullSubmission(store,legacy.id,{...input,examId:randomUUID(),seed:99991,unscoredIds:draw.unscoredIds});
    assert.equal(saved.exam.correctCount,25,'A valid saved draw survives a changed bank without reselecting unscored items');
    const bad=await store.createUser({email:randomUUID()+'@example.invalid',passwordHash:'isolated',name:null});
    await assert.rejects(savePackFullSubmission(store,bad.id,{...input,examId:randomUUID(),seed:99991,unscoredIds:draw.questions.slice(0,5).map(q=>q.question_id)}),/invalid_exam/);
  }
  const now=Date.now();
  const entitlement=await store.insertEntitlement({userId:user.id,productCode:'az_exam_pro_60d',state:'ALL',status:'active',startsAt:new Date(now-10000).toISOString(),expiresAt:new Date(now+86400000).toISOString(),provider:'mock',providerOrderId:randomUUID(),providerCustomerId:null});
  const paid=await savePackFullSubmission(store,user.id,{...input,examId:randomUUID()});
  assert.equal(paid.proUsage.featureCode,'full_exam_extra');
  const mixedId=randomUUID();
  const mixed=input.questions.map((answer,index)=>{
    const q=draw.questions[index];
    if(state==='PA') {
      const wrong=draw.unscoredIds.includes(q.question_id)||q.question_id===draw.questions.find(q=>!draw.unscoredIds.includes(q.question_id)).question_id;
      return wrong?{...answer,selected:['A','B','C'].find(l=>l!==q.correct_option)}:answer;
    }
    if(index<2)return {...answer,selected:undefined};
    return index<5?{...answer,selected:['A','B','C','D'].find(l=>l!==q.correct_option)}:answer;
  });
  const mixedResult=await savePackFullSubmission(store,user.id,{...input,examId:mixedId,questions:mixed});
  assert.equal(mixedResult.exam.correctCount,state==='PA'?24:35);
  assert.equal(mixedResult.exam.score,state==='PA'?96:88);
  const check=(await store.getStudyPlan(user.id,state)).document.checks[mixedId];
  assert.equal(check.wrongIds.length,state==='PA'?6:3);assert.equal(check.skipped,state==='PA'?0:2);
  await store.setEntitlementStatus(user.id,'mock',entitlement.providerOrderId,'expired');
  await assert.rejects(savePackFullSubmission(store,user.id,{...input,examId:randomUUID()}),/full_trial_used/);
  assert.ok((await store.listStats(user.id)).every(q=>q.state===state));
  console.log(state+': server grading, per-state trial, immutable duplicate, draw validation, concurrent trial and active/expired Pro passed');
}
