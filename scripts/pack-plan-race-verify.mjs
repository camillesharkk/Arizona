import assert from 'node:assert/strict';
import {testLoader} from './pack-test-utils.mjs';
let store;
const load=testLoader({'@/lib/store':{getStore:async()=>store}});
store=load('lib/store/memory-store.ts').createMemoryStore();
const {saveCaExamCheck}=load('lib/ca-daily.ts');
for(const state of ['NY','PA','LA']){
 const user=await store.createUser({email:`race-${state}@example.invalid`,passwordHash:'isolated',name:null});
 await store.saveStudyPlan({userId:user.id,state,document:{settings:{newQuestions:1},checks:{}}});
 let entered,resume;
 const started=new Promise(r=>entered=r),paused=new Promise(r=>resume=r);
 const full=store.learningTransaction(user.id,async tx=>{entered();await paused;await tx.saveStudyPlan({userId:user.id,state,document:{settings:{newQuestions:7},checks:{full:{wrong:0,skipped:0,wrongIds:[],proUsage:{eventId:'full-receipt'}}}}});});
 await started;
 const quick=saveCaExamCheck(user.id,'quick',{wrongIds:['state-question'],skipped:0},state);
 await new Promise(r=>setTimeout(r,20));resume();await Promise.all([full,quick]);
 const plan=(await store.getStudyPlan(user.id,state)).document;
 assert.equal(plan.settings.newQuestions,7,state+' quick completion must preserve concurrent settings');
 assert.equal(plan.checks.full.proUsage.eventId,'full-receipt');assert.ok(plan.checks.quick);
}
console.log('NY/PA/LA quick completion preserves concurrent full receipt and study settings under the same user lock');
