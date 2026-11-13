import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {testLoader} from './pack-test-utils.mjs';
process.env.VERCEL_ENV='preview';process.env.STATE_PREVIEW='1';process.env.NEXT_PUBLIC_CT_PREVIEW='1';
let store,session=null;const cookies=new Map();let used=[];
const load=testLoader({'@/lib/store':{getStore:async()=>store},'@/lib/session':{getSession:async()=>session},'next/headers':{cookies:async()=>({get:key=>cookies.has(key)?{value:cookies.get(key)}:undefined,set:(key,value)=>cookies.set(key,value)})},'./index.ts':{getCommerceRepo:async()=>({})},'./service.ts':{markProUsed:async(_repo,input)=>{used=input.entitlements.map(row=>row.id);return{recorded:true};}}});
store=load('lib/store/memory-store.ts').createMemoryStore();
const failures=[];async function check(name,fn){try{await fn();console.log('PASS '+name);}catch(error){failures.push(name);console.error('FAIL '+name+': '+error.message);}}
const post=(body)=>new Request('http://localhost/api/indiana/sitting/',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
await check('Three Indiana grants extend through 180 days',async()=>{
const user=await store.createUser({email:randomUUID()+'@example.invalid',passwordHash:'isolated',name:null});const grant=load('lib/entitlements.ts').grantStatePro60d;const rows=[];
for(let i=0;i<3;i++)rows.push((await grant({userId:user.id,state:'IN',provider:'mock',providerOrderId:randomUUID()})).entitlement);
assert.ok(Date.parse(rows[2].expiresAt)-Date.parse(rows[0].startsAt)>=180*86400000-1000,'Third renewal must not overlap the second');});
await check('CT usage does not mark AZ-only purchase used',async()=>{
const user=await store.createUser({email:randomUUID()+'@example.invalid',passwordHash:'isolated',name:null});const now=Date.now();
const create=state=>store.insertEntitlement({userId:user.id,productCode:'az_exam_pro_60d',state,status:'active',startsAt:new Date(now-86400000).toISOString(),expiresAt:new Date(now+86400000).toISOString(),provider:'mock',providerOrderId:randomUUID(),providerCustomerId:null});const ct=await create('CT'),az=await create('AZ');
await load('lib/commerce/usage.ts').recordProUsage(user.id,'pro_question',undefined,'CT');assert.deepEqual(Array.from(used),[ct.id]);
await load('lib/commerce/usage.ts').recordProUsage(user.id,'pro_question',undefined,'AZ');assert.deepEqual(Array.from(used),[az.id]);});
await check('Completed Indiana guest sitting imports unchanged and idempotently after login',async()=>{
session=null;const route=load('app/api/indiana/sitting/route.ts');const start=await (await route.POST(post({action:'start',examId:randomUUID()}))).json();assert.equal(start.questions.length,30);
const questions=start.questions.map((q,i)=>({questionId:q.question_id,questionVersion:q.version,selected:i<2?['A','B','C','D'].find(x=>x!==q.correct_option):q.correct_option}));
const submit={action:'submit',examId:start.examId,questions};assert.equal((await route.POST(post(submit))).status,200);
const user=await store.createUser({email:randomUUID()+'@example.invalid',passwordHash:'isolated',name:null});session={id:user.id};
const response=await route.POST(post({...submit,action:'import'}));assert.equal(response.status,200,await response.clone().text());
const result=await response.json();assert.equal(result.exam.correctCount,28);assert.equal((await store.listStats(user.id)).length,30);assert.equal((await store.listExams(user.id)).length,1);
assert.equal((await route.POST(post({...submit,action:'import'}))).status,200);assert.equal((await store.listExams(user.id)).length,1);
const altered=questions.map((q,i)=>i? q:{...q,selected:['A','B','C','D'].find(x=>x!==q.selected)});
const other=await store.createUser({email:randomUUID()+'@example.invalid',passwordHash:'isolated',name:null});session={id:other.id};assert.equal((await route.POST(post({...submit,action:'import',questions:altered}))).status,400);assert.equal((await store.listExams(other.id)).length,0);
});
await check('Indiana rejects a changed account before importing a completed guest exam',async()=>{
cookies.clear();session=null;const route=load('app/api/indiana/sitting/route.ts');const start=await (await route.POST(post({action:'start',examId:randomUUID()}))).json();const questions=start.questions.map(q=>({questionId:q.question_id,questionVersion:q.version,selected:q.correct_option}));await route.POST(post({action:'submit',examId:start.examId,questions}));
const intended=await store.createUser({email:randomUUID()+'@example.invalid',passwordHash:'isolated',name:null});const current=await store.createUser({email:randomUUID()+'@example.invalid',passwordHash:'isolated',name:null});session={id:current.id};
assert.equal((await route.POST(post({action:'import',examId:start.examId,questions,accountId:intended.id}))).status,409);assert.equal((await store.listExams(current.id)).length,0);
});
await check('Indiana adopts an unfinished signed-cookie guest draw without changing IDs or seed',async()=>{
cookies.clear();session=null;const route=load('app/api/indiana/sitting/route.ts');const start=await (await route.POST(post({action:'start',examId:randomUUID()}))).json();const user=await store.createUser({email:randomUUID()+'@example.invalid',passwordHash:'isolated',name:null});session={id:user.id};const response=await route.POST(post({action:'start',examId:start.examId,accountId:user.id}));assert.equal(response.status,200);const adopted=await response.json();assert.equal(adopted.seed,start.seed);assert.deepEqual(adopted.questionIds,start.questionIds);
});
if(failures.length)process.exitCode=1;
