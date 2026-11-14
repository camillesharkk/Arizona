import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {testLoader} from './pack-test-utils.mjs';

function storage(){const values=new Map();return{get length(){return values.size;},key:index=>[...values.keys()][index]??null,getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};}
const localStorage=storage(),sessionStorage=storage();
let store,owner,imports=0;
const load=testLoader({
  '@/lib/store':{getStore:async()=>store},'@/lib/session':{getSession:async()=>owner},
  '@/lib/commerce/usage':{recordProUsage:async()=>({recorded:true})},
},{localStorage,sessionStorage,window:{},fetch:async(url,options)=>{
  assert.equal(url,'/api/progress/','Full practice uses the authoritative sitting endpoint');
  imports++;
  return load('app/api/progress/route.ts').POST(new Request('http://localhost'+url,{...options,signal:undefined}));
}});
store=load('lib/store/memory-store.ts').createMemoryStore();
const packs=load('lib/prep-pack.ts').prepPacks;
const drawFor={
  AZ:seed=>({questions:load('lib/quiz.ts').pickFullExam(seed),unscoredIds:[]}),
  CA:load('lib/ca-exam.ts').pickCaFullExam,
  HI:seed=>({questions:load('lib/hi-exam.ts').pickHiFullExam(seed),unscoredIds:[]}),
  // Indiana's server-issued guest sittings have their dedicated handler/integration suites.
  ...Object.fromEntries(Object.entries(packs).filter(([state, pack]) => pack.fullReady && state !== 'IN').map(([state,pack])=>[state,pack.pickFull])),
};
const sitting=load('lib/sitting.ts');
const attempts=load('lib/ca-attempts.ts');
const sync=load('lib/ca-sync.ts');
const {presentExamQuestions}=load('lib/answer-sequence.ts');
for(const [state,pick] of Object.entries(drawFor)){
  owner=await store.createUser({email:`guest-full-${state}@example.invalid`,passwordHash:'isolated',name:null});
  const seed=614,draw=pick(seed),id=randomUUID();
  assert.ok(draw?.questions?.length,state+' draw');
  const presentation=presentExamQuestions(draw.questions,seed,2);
  const answers=Object.fromEntries(draw.questions.map((question,index)=>[question.question_id,Object.entries(presentation.maps[question.question_id]).find(([,original])=>index<6?original!==question.correct_option:original===question.correct_option)[0]]));
  const legacy={version:1,owner:'guest',state,mode:'full',seed,questionIds:draw.questions.map(question=>question.question_id),questionVersions:Object.fromEntries(draw.questions.map(question=>[question.question_id,question.version])),presentationVersion:2,unscoredIds:draw.unscoredIds||[],answers,attemptIds:Object.fromEntries(draw.questions.map(question=>[question.question_id,randomUUID()])),startedAt:Date.now()-60000,done:true,examId:id};
  sitting.writeSitting(sessionStorage,legacy);
  const synced=await sync.syncCaAttempts(state,owner.id);
  assert.equal(synced.ok,true,state+' completed guest full practice imports');
  const archive=attempts.readCaAttempt(owner.id,id,state);
  assert.equal(archive.mode,'full');assert.equal(archive.synced,true);assert.equal(archive.wrongIds.length,6);
  assert.equal(attempts.latestCaQuick(owner.id,state),null,'A full practice does not replace the Quick10 recommendation');
  const stats=await store.listStats(owner.id);
  assert.equal(stats.length,draw.questions.length);assert.ok(stats.every(stat=>stat.state===state&&stat.rightCount+stat.wrongCount===1));
  const exams=await store.listExams(owner.id);
  assert.equal(exams.length,1);assert.equal(exams[0].total,draw.questions.length-(draw.unscoredIds?.length||0));
  assert.equal(exams[0].at,archive.finishedAt,'Keep the original browser history timestamp');
  const before=imports;await sync.syncCaAttempts(state,owner.id);assert.equal(imports,before);
  const daily=await load('lib/daily-study.ts').dailyStudyView(owner.id,undefined,undefined,state);
  assert.equal(daily.recent.find(exam=>exam.id===id).wrong,6);
  assert.equal((await store.getStudyPlan(owner.id,state)).document.checks[id].submissionVersion,1);
  sitting.writeSitting(sessionStorage,{...legacy,examId:randomUUID(),attemptIds:Object.fromEntries(draw.questions.map(question=>[question.question_id,randomUUID()]))});
  const pending=await sync.syncCaAttempts(state,owner.id);
  assert.equal(pending.pending,true,'An already-used free trial remains a local result');
  assert.equal((await store.listExams(owner.id)).length,1);
  assert.ok(attempts.listCaAttempts(owner.id,state).some(attempt=>!attempt.synced));
  for(let index=0;index<35;index++) attempts.saveCaQuickAttempt({...archive,id:randomUUID(),mode:'quick',sittingMode:'quick',synced:true,questionIds:archive.questionIds.slice(0,10)});
  assert.ok(attempts.listCaAttempts(owner.id,state).some(attempt=>attempt.mode==='full'&&!attempt.synced),'Pruning acknowledged history retains the pending full practice');
  assert.equal(attempts.listCaAttempts(owner.id,state).filter(attempt=>attempt.synced).length,30);
  await store.insertEntitlement({userId:owner.id,productCode:'az_exam_pro_60d',state:'ALL',status:'active',startsAt:new Date(Date.now()-1000).toISOString(),expiresAt:new Date(Date.now()+86400000).toISOString(),provider:'mock',providerOrderId:randomUUID(),providerCustomerId:null});
  assert.equal((await sync.syncCaAttempts(state,owner.id)).ok,true);
  assert.equal((await store.listExams(owner.id)).length,2);
  assert.ok((await store.listStats(owner.id)).every(stat=>stat.rightCount+stat.wrongCount===2));
  console.log(`${state}: ${draw.questions.length}-question guest full archive, login import, graded history, replay, trial boundary and Pro retry passed`);
}
