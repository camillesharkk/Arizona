import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { testLoader } from './pack-test-utils.mjs';

const base = path.resolve(process.env.IN_VERIFY_DIR || '.tools');
fs.mkdirSync(base, {recursive:true});
const dir = fs.mkdtempSync(path.join(base, 'in-server-tests-'));
const previous = Object.fromEntries(['NOTARY_DATA_DIR','DATABASE_URL','STATE_PREVIEW','VERCEL_ENV','AI_PROVIDER'].map(key=>[key,process.env[key]]));
process.env.NOTARY_DATA_DIR = dir;
process.env.STATE_PREVIEW = '1';
process.env.VERCEL_ENV = 'preview';
process.env.AI_PROVIDER='local';
delete process.env.DATABASE_URL;
let store, session = null, cookieValues = new Map();
const load = testLoader({
  '@/lib/store': { getStore: async () => store },
  '@/lib/session': { getSession: async () => session },
  'next/headers': { cookies: async () => ({ get: key => cookieValues.has(key) ? {value:cookieValues.get(key)} : undefined, set: (key,value) => cookieValues.set(key,value) }) },
}, {Error});
const request = (url,body) => new Request('http://localhost'+url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
try {
  store = load('lib/store/file-store.ts').fileStore;
  async function verifyGuestStore(backend, name) {
    const owner='store-contract:'+randomUUID(), first={owner,state:'IN',examId:randomUUID(),sitting:{questionIds:['in-test'],seed:123}};
    const reservations=await Promise.all([backend.reserveGuestExam(first),backend.reserveGuestExam({...first,examId:randomUUID(),sitting:{seed:999}})]);
    assert.equal(reservations[0].examId,reservations[1].examId);
    assert.equal((await backend.getGuestExam(owner,'IN')).sitting.seed,123);
    const result={id:first.examId,mode:'in-full',score:100,correctCount:30,total:30,at:new Date().toISOString()};
    const finished=await Promise.all([backend.finishGuestExam(owner,'IN',first.examId,result),backend.finishGuestExam(owner,'IN',first.examId,{...result,score:0,correctCount:0})]);
    assert.equal(finished.filter(item=>!item.duplicate).length,1);
    assert.equal(new Set(finished.map(item=>item.row.result.score)).size,1);
    const retry=await backend.finishGuestExam(owner,'IN',first.examId,{...result,score:5});
    assert.equal(retry.duplicate,true);
    assert.equal(retry.row.result.score,finished[0].row.result.score);
    await assert.rejects(backend.finishGuestExam(owner,'IN',randomUUID(),result),/invalid_exam/);
    console.log(`${name} guest storage: immutable first reservation, concurrent first-result winner and altered retry rejection passed`);
  }
  await verifyGuestStore(load('lib/store/memory-store.ts').createMemoryStore(),'Memory');
  await verifyGuestStore(store,'File');
  if(process.env.IN_PGLITE_MODULE) {
    const {pathToFileURL}=await import('node:url');
    const {PGlite}=await import(pathToFileURL(path.resolve(process.env.IN_PGLITE_MODULE)).href);
    const db=new PGlite();
    try {
      for(const file of fs.readdirSync('db/migrations').filter(file=>file.endsWith('.sql')).sort()) await db.exec(fs.readFileSync('db/migrations/'+file,'utf8'));
      await db.exec('create table schema_migrations(id text primary key)');
      for(const file of fs.readdirSync('db/migrations').filter(file=>file.endsWith('.sql'))) await db.query('insert into schema_migrations values ($1)',[file.slice(0,-4)]);
      function sql(strings,...values) {
        const fragment={strings,values};
        fragment.then=(resolve,reject)=>{
          const parameters=[];
          const flatten=part=>part.strings.reduce((text,string,index)=>{
            if(!index)return string;
            const value=part.values[index-1];
            if(value?.strings)return text+flatten(value)+string;
            parameters.push(value);return text+'$'+parameters.length+string;
          },'');
          return db.query(flatten(fragment),parameters).then(result=>result.rows).then(resolve,reject);
        };
        return fragment;
      }
      const pgLoad=testLoader({'postgres':()=>sql});
      await verifyGuestStore(pgLoad('lib/store/pg-store.ts').pgStore,'Isolated PostgreSQL');
    } finally {await db.close();}
  }
  const rights = load('lib/entitlements.ts');
  const user = await store.createUser({email:'indiana-isolated@example.invalid',passwordHash:'isolated',name:null});
  const legacy = await store.createUser({email:'legacy-isolated@example.invalid',passwordHash:'isolated',name:null});
  const now = Date.now();
  const grant = (userId,productCode,state,overrides={}) => store.insertEntitlement({userId,productCode,state,status:'active',startsAt:new Date(now-1000).toISOString(),expiresAt:new Date(now+86400000).toISOString(),provider:'mock',providerOrderId:randomUUID(),providerCustomerId:null,...overrides});
  for (const code of ['az_exam_pro_60d','ca_exam_pro_60d','hi_exam_pro_60d']) await grant(legacy.id,code,'ALL');
  assert.equal(await rights.hasStatePro(legacy.id,'IN'),true,'Historical shared Pro covers Indiana');
  assert.equal(await rights.hasStatePro(legacy.id,'NY'),true);
  for (const state of ['NY','PA','LA']) await grant(legacy.id,'az_exam_pro_60d',state);
  assert.equal(await rights.hasStatePro(legacy.id,'IN'),true);
  const historical = await grant(user.id,'in_exam_pro_60d','ALL');
  assert.equal(await rights.hasStatePro(user.id,'IN'),true,'Historical Indiana products now participate in shared Pro');
  await store.setEntitlementStatus(user.id,'mock',historical.providerOrderId,'revoked');
  for (const overrides of [{startsAt:new Date(now+100000).toISOString()},{expiresAt:new Date(now-1).toISOString()},{status:'refunded'},{status:'revoked'},{status:'expired'}]) {
    const row = await grant(user.id,'in_exam_pro_60d','IN',overrides);
    assert.equal(rights.indianaEntitlement([row],new Date(now)),null);
    await store.setEntitlementStatus(user.id,'mock',row.providerOrderId,'revoked');
  }
  const boundary = {productCode:'in_exam_pro_60d',state:'IN',status:'active',startsAt:new Date(now).toISOString(),expiresAt:new Date(now+1).toISOString()};
  assert.ok(rights.indianaEntitlement([boundary],new Date(now)));
  assert.equal(rights.indianaEntitlement([boundary],new Date(now+1)),null);
  const paid = await rights.grantStatePro60d({userId:user.id,state:'IN',provider:'mock',providerOrderId:'indiana-grant-1'});
  assert.equal(paid.entitlement.productCode,'az_exam_pro_60d');
  assert.equal(paid.entitlement.state,'ALL');
  assert.equal(Date.parse(paid.entitlement.expiresAt)-Date.parse(paid.entitlement.startsAt),60*86400000);
  assert.equal((await rights.grantStatePro60d({userId:user.id,state:'IN',provider:'mock',providerOrderId:'indiana-grant-1'})).duplicate,true);
  assert.equal(await rights.hasStatePro(user.id,'IN'),true);
  for (const state of ['AZ','CA','HI','NY','PA','LA']) assert.equal(await rights.hasStatePro(user.id,state),true,`Indiana-source purchase covers ${state}`);
  assert.ok(rights.accountProExpiry(await store.listEntitlements(user.id)));
  const beforeLegacy = rights.accountProExpiry(await store.listEntitlements(legacy.id)).toISOString();
  await rights.grantStatePro60d({userId:legacy.id,state:'IN',provider:'mock',providerOrderId:'separate-indiana-window'});
  const afterLegacy = rights.accountProExpiry(await store.listEntitlements(legacy.id)).toISOString();
  assert.ok(Math.abs(Date.parse(afterLegacy)-Date.parse(beforeLegacy)-60*86400000)<1000,'Indiana-source purchase extends shared Pro by 60 days');
  assert.equal(await rights.aiDailyLimit(user.id,'IN'),rights.AI_LIMIT_PRO);
  assert.equal(await rights.aiDailyLimit(user.id,'AZ'),rights.AI_LIMIT_PRO);
  console.log('Entitlements: shared product, active interval, all-state access, grant idempotency and queued 60-day renewal passed');

  const content = load('data/in-questions.ts');
  const bank = content.publishedInQuestions(), freeCount=bank.filter(q=>q.is_free).length;
  assert.equal(content.inQuestions.length,203,'authored questions remain preserved independently of evidence publication status');
  assert.ok(bank.length>freeCount && freeCount>=30,'published bank must fill the free full sitting and retain premium questions');
  const summary=load('data/in-bank-summary.ts').inBankCounts;
  assert.equal(summary.published,bank.length);
  assert.equal(summary.free,freeCount);
  assert.equal(summary.pro,bank.length-freeCount);
  const free = bank.find(q=>q.is_free), locked = bank.find(q=>!q.is_free);
  assert.ok(free && locked);
  const draft=content.inQuestions.find(q=>q.status!=='published');
  if(draft) assert.equal(load('lib/server-questions.ts').serverQuestionById(draft.question_id),null,'unverified drafts must never be served');
  const endpoints = load('app/api/indiana/questions/route.ts');
  session = {id:user.id};
  assert.equal((await (await endpoints.GET()).json()).questions.length,bank.length);
  const trialUser = await store.createUser({email:'indiana-trial@example.invalid',passwordHash:'isolated',name:null});
  session = {id:trialUser.id};
  assert.equal((await (await endpoints.GET()).json()).questions.length,freeCount,'Free account receives the Indiana free pool');
  const progress = load('app/api/progress/route.ts');
  const answer = q => ({questionId:q.question_id,questionVersion:q.version,selected:q.correct_option,state:'IN',attemptId:randomUUID()});
  assert.equal((await progress.POST(request('/api/progress/',answer(locked)))).status,402);
  assert.equal((await progress.POST(request('/api/progress/',{...answer(free),state:'NY'}))).status,400);
  assert.equal((await progress.POST(request('/api/progress/',{...answer(free),questionVersion:999}))).status,409);
  assert.equal((await progress.POST(request('/api/progress/',answer(free)))).status,200);
  assert.equal((await store.getStat(trialUser.id,free.question_id)).bank,'indiana-notary-exam');
  const me = load('app/api/auth/me/route.ts');
  assert.equal((await (await me.GET()).json()).user.indianaPro,false);
  session = {id:user.id};
  const account = (await (await me.GET()).json()).user;
  assert.equal(account.indianaPro,true);
  assert.equal(account.arizonaPro,true);
  assert.equal(account.plan,'pro');
  assert.ok(account.indianaProExpiresAt);
  assert.equal(account.packFullExamCount.IN,0);
  assert.equal((await progress.POST(request('/api/progress/',answer(locked)))).status,200);
  session={id:legacy.id};
  assert.equal((await progress.POST(request('/api/progress/',answer(locked)))).status,200);
  const commerce=await load('lib/commerce/index.ts').getCommerceRepo();
  assert.equal((await commerce.listUsageForUser(legacy.id)).length,6,'Indiana paid answers mark the six currently serving shared orders used');
  session={id:user.id};
  const mistakes = load('app/api/mistakes/route.ts');
  const save = await mistakes.POST(request('/api/mistakes/',{questionId:locked.question_id,saveForReview:true}));
  assert.equal(save.status,200);
  assert.equal((await (await mistakes.GET(new Request('http://localhost/api/mistakes/?state=IN'))).json()).mistakes[0].bank,'indiana-notary-exam');
  const daily = load('lib/daily-study.ts');
  const paidPlan = await store.learningTransaction(user.id,()=>daily.dailyStudyView(user.id,undefined,undefined,'IN'));
  assert.equal(paidPlan.questionCount,bank.length);
  assert.ok(paidPlan.practiceQuestionIds.every(id=>id.startsWith('in-')));
  const trialPlan = await store.learningTransaction(trialUser.id,()=>daily.dailyStudyView(trialUser.id,undefined,undefined,'IN'));
  assert.equal(trialPlan.freeOnly,true);
  assert.ok(trialPlan.practiceQuestionIds.every(id=>bank.find(q=>q.question_id===id)?.is_free));
  assert.ok(load('lib/ai/prompt.ts').buildTutorInstructions('explain','official','IN').includes('Indiana'));
  const tutor = load('app/api/ai/tutor/route.ts');
  session = {id:trialUser.id};
  assert.equal((await tutor.POST(request('/api/ai/tutor/',{questionId:locked.question_id,questionVersion:locked.version,state:'IN',mode:'explain'}))).status,402);
  assert.equal((await (await tutor.GET(new Request('http://localhost/api/ai/tutor/?state=IN'))).json()).plan,'free');
  session={id:user.id};
  assert.equal((await (await tutor.GET(new Request('http://localhost/api/ai/tutor/?state=IN'))).json()).plan,'pro');
  session={id:legacy.id};
  const aiDay=load('lib/ai/quota.ts').utcAiDay();
  await Promise.all(Array.from({length:rights.AI_LIMIT_FREE},()=>store.bumpAi(legacy.id,aiDay)));
  assert.equal((await tutor.POST(request('/api/ai/tutor/',{questionId:locked.question_id,questionVersion:locked.version,state:'IN',mode:'explain'}))).status,200);
  assert.equal((await commerce.listUsageForUser(legacy.id)).length,6,'Indiana Pro Tutor quota marks shared serving orders used');
  session={id:user.id};
  console.log(`Actual account/question/progress/mistakes/Daily Study/Tutor handlers: ${freeCount} free vs ${bank.length} published paid-accessible, state/version guards and isolated flags passed`);

  const sitting = load('lib/indiana-sitting.ts');
  const submit = load('lib/ny-full-submission.ts').savePackFullSubmission;
  const fullAnswers = row => sitting.indianaSittingQuestions(row).map(q=>({questionId:q.question_id,questionVersion:q.version,selected:q.correct_option}));
  const starts = await Promise.all([1,2].map(()=>sitting.startIndianaSitting(store,trialUser.id,randomUUID())));
  assert.equal(starts[0].examId,starts[1].examId,'concurrent starts must resume same trial');
  assert.equal(starts[0].questionIds.length,30);
  assert.equal(new Set(starts[0].questionIds).size,30);
  assert.ok(sitting.indianaSittingQuestions(starts[0]).every(q=>q.is_free));
  await store.learningTransaction(trialUser.id,()=>daily.dailyStudyView(trialUser.id,undefined,undefined,'IN'));
  assert.equal((await sitting.readIndianaSitting(store,trialUser.id)).examId,starts[0].examId,'daily normalization must preserve reservation');
  const full = {state:'IN',examId:starts[0].examId,questions:fullAnswers(starts[0]),seed:999999};
  const forged = {...full,questions:full.questions.map((q,i)=>i ? q : {questionId:locked.question_id,questionVersion:locked.version,selected:locked.correct_option})};
  await assert.rejects(submit(store,trialUser.id,forged),/invalid_exam/);
  await assert.rejects(submit(store,trialUser.id,{...full,questions:full.questions.slice(1)}),/invalid_exam/);
  await assert.rejects(submit(store,trialUser.id,{...full,questions:full.questions.map((q,i)=>i===1?full.questions[0]:q)}),/invalid_exam/);
  await assert.rejects(submit(store,trialUser.id,{...full,questions:full.questions.map((q,i)=>i? q:{...q,questionVersion:999})}),/question_updated/);
  const transaction = store.learningTransaction.bind(store);
  store.learningTransaction = (id,action)=>transaction(id,async scoped=>{
    const failing = Object.create(scoped);
    failing.upsertStat = async ()=>{throw new Error('injected Indiana write failure')};
    if(scoped.upsertStats) failing.upsertStats = failing.upsertStat;
    return action(failing);
  });
  await assert.rejects(submit(store,trialUser.id,full),/injected Indiana write failure/);
  store.learningTransaction=transaction;
  assert.equal((await store.listExams(trialUser.id)).length,0);
  const results = await Promise.all([1,2].map(()=>submit(store,trialUser.id,full)));
  assert.equal(results.filter(result=>!result.duplicate).length,1);
  assert.equal(results[0].exam.correctCount,30);
  assert.equal(results[0].exam.total,30);
  assert.equal(results[0].exam.score,100);
  assert.equal((await store.listExams(trialUser.id)).filter(exam=>exam.mode==='in-full').length,1);
  await assert.rejects(sitting.startIndianaSitting(store,trialUser.id,randomUUID()),/full_trial_used/);
  const proStart=await sitting.startIndianaSitting(store,user.id,randomUUID());
  assert.equal(proStart.pro,true);
  assert.ok(sitting.indianaSittingQuestions(proStart).some(q=>!q.is_free));
  await store.setEntitlementStatus(user.id,'mock','indiana-grant-1','refunded');
  await assert.rejects(submit(store,user.id,{state:'IN',examId:proStart.examId,questions:fullAnswers(proStart)}),/pro_required/);
  assert.equal((await rights.packFullExamCounts(trialUser.id)).IN,1);
  console.log('Signed full sitting: random server draw, 30 unique free/premium pools, immutable reservation, forged IDs/seed/version rejection, rollback, duplicate/concurrent submit and expired entitlement checks passed');

  const fullRoute = load('app/api/indiana/sitting/route.ts');
  session=null; cookieValues=new Map();
  await endpoints.GET();
  const initialCookie=new Map(cookieValues);
  let response=await fullRoute.POST(request('/api/indiana/sitting/',{action:'start',examId:randomUUID(),seed:1}));
  assert.equal(response.status,200);
  const guest=await response.json();
  assert.equal(guest.questionIds.length,30);
  assert.ok(guest.questions.every(q=>q.is_free));
  assert.equal((await (await fullRoute.GET()).json()).examId,guest.examId);
  const heldCookie=new Map(cookieValues);
  cookieValues=new Map(initialCookie); // Lost original start response; reservation already exists.
  const recovered=await (await fullRoute.POST(request('/api/indiana/sitting/',{action:'start',examId:randomUUID()}))).json();
  assert.equal(recovered.examId,guest.examId);
  assert.deepEqual(recovered.questionIds,guest.questionIds);
  const guestBody={action:'submit',examId:guest.examId,questions:guest.questions.map(q=>({questionId:q.question_id,questionVersion:q.version,selected:q.correct_option}))};
  assert.equal((await fullRoute.POST(request('/api/indiana/sitting/',{...guestBody,questions:guestBody.questions.map((q,i)=>i?q:{questionId:locked.question_id,questionVersion:locked.version,selected:locked.correct_option})}))).status,400);
  const guestResults=await Promise.all([guestBody,guestBody].map(async body=>await (await fullRoute.POST(request('/api/indiana/sitting/',body))).json()));
  assert.equal(guestResults.filter(item=>!item.duplicate).length,1);
  assert.equal(new Set(guestResults.map(item=>item.exam.score)).size,1);
  const result=guestResults[0];
  assert.equal(result.exam.score,100);
  assert.equal((await (await fullRoute.POST(request('/api/indiana/sitting/',guestBody))).json()).duplicate,true);
  cookieValues=new Map(initialCookie); // Replay a valid cookie issued before submission.
  const replay=await (await fullRoute.POST(request('/api/indiana/sitting/',{...guestBody,questions:guestBody.questions.map(q=>({...q,selected:undefined}))}))).json();
  assert.equal(replay.duplicate,true);
  assert.equal(replay.exam.score,100,'a replayed old cookie must not overwrite the first server result');
  assert.equal((await fullRoute.POST(request('/api/indiana/sitting/',{action:'start',examId:randomUUID()}))).status,402);
  cookieValues=new Map(); // Another browser gets its own server-controlled identity.
  const other=await (await fullRoute.POST(request('/api/indiana/sitting/',{action:'start',examId:randomUUID()}))).json();
  assert.notEqual(other.examId,guest.examId);
  const guestTokens=load('lib/indiana-guest.ts');
  assert.equal(guestTokens.decodeIndianaGuest([...heldCookie.values()][0]+'tamper'),null);
  const file=JSON.parse(fs.readFileSync(path.join(dir,'store.json'),'utf8'));
  assert.equal(file.guestExams.filter(row=>row.state==='IN' && !row.owner.startsWith('store-contract:')).length,2);
  console.log('Anonymous full sitting: signed cookie identity, durable reservation, lost-response resume, server-selected 30 free IDs, forged paid-ID denial, idempotent repeat, one-browser trial limit and independent browser identity passed');

  session={id:trialUser.id};
  const checkout=load('app/api/billing/checkout/route.ts');
  assert.equal((await checkout.POST(request('/api/billing/checkout/',{sourceState:'IN'}))).status,400,'Shared checkout requires a server quote');
  process.env.VERCEL_ENV='production';
  process.env.STATE_PREVIEW='0';
  assert.equal((await endpoints.GET()).status,200,'Indiana question access is open in production');
  assert.equal((await fullRoute.GET()).status,200,'Indiana sitting access is open in production');
  assert.equal((await progress.GET(new Request('http://localhost/api/progress/?state=IN'))).status,200);
  console.log('Public release: Indiana reads are available in production and shared checkout validates quotes');
} finally {
  for (const [key,value] of Object.entries(previous)) { if(value===undefined) delete process.env[key]; else process.env[key]=value; }
  fs.rmSync(dir,{recursive:true,force:true});
}
