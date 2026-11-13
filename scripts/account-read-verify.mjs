import assert from 'node:assert/strict';
import { testLoader } from './pack-test-utils.mjs';
let store;
let session;
const load = testLoader({ '@/lib/store': { getStore: async () => store }, '@/lib/session': { getSession: async () => session } });
const inner = load('lib/store/memory-store.ts').createMemoryStore();
let entitlementReads = 0;
let examReads = 0;
let planWrites = 0;
store = new Proxy(inner, { get(target, key) {
  if (key === 'listEntitlements') return async (...args) => { entitlementReads++; return target.listEntitlements(...args); };
  if (key === 'listExams') return async (...args) => { examReads++; return target.listExams(...args); };
  if (key === 'saveStudyPlan') return async (...args) => { planWrites++; return target.saveStudyPlan(...args); };
  return typeof target[key] === 'function' ? target[key].bind(target) : target[key];
} });
const user = await store.createUser({email:'read-check@example.invalid',passwordHash:'isolated',name:null});
session = {id:user.id};
const { GET } = load('app/api/auth/me/route.ts');
await store.insertEntitlement({userId:user.id,productCode:'az_exam_pro_60d',state:'ALL',status:'active',startsAt:new Date(Date.now()-86400000*2).toISOString(),expiresAt:new Date(Date.now()-86400000).toISOString(),provider:'mock',providerOrderId:crypto.randomUUID(),providerCustomerId:null});
for(const mode of ['full','ca-full','hi-full','ny-full','pa-full','la-full']) await store.addExam({id:crypto.randomUUID(),userId:user.id,mode,score:70,correctCount:7,total:10,at:new Date().toISOString()});
for(const active of [false,true]) {
  if(active) await store.insertEntitlement({userId:user.id,productCode:'az_exam_pro_60d',state:'ALL',status:'active',startsAt:new Date(Date.now()-86400000).toISOString(),expiresAt:new Date(Date.now()+86400000).toISOString(),provider:'mock',providerOrderId:crypto.randomUUID(),providerCustomerId:null});
  entitlementReads = 0; examReads = 0;
  const result = await (await GET()).json();
  assert.equal(result.user.arizonaPro,active);
  assert.equal(result.user.californiaPro,active);
  assert.equal(result.user.hawaiiPro,active);
  assert.equal(result.user.aiDailyLimit,active?300:75);
  for(const field of ['fullExamCount','caFullExamCount','hiFullExamCount']) assert.equal(result.user[field],1);
  assert.deepEqual(result.user.packFullExamCount,{NY:1,PA:1,LA:1});
  assert.equal(entitlementReads,1,'Read account-wide entitlements once per response');
  assert.equal(examReads,1,'Read exam history once per response');
}
console.log('Account response retains all-state rights, AI limits and six-state counts with one entitlement/history read');
const { dailyStudyView, saveStudySettings } = load('lib/daily-study.ts');
for (const state of ['AZ','CA','HI','NY','PA','LA']) {
  const now = new Date().toISOString();
  planWrites = 0;
  await dailyStudyView(user.id,'America/New_York',now,state);
  assert.equal(planWrites,1,'Initialize the daily plan');
  planWrites = 0; entitlementReads = 0;
  await dailyStudyView(user.id,'America/New_York',now,state);
  assert.equal(planWrites,0,state+' repeated reads preserve the unchanged document');
  assert.equal(entitlementReads,1,state+' daily access reads entitlements once');
  const initialPlan = await store.getStudyPlan(user.id,state);
  await store.saveStudyPlan({userId:user.id,state,document:{...initialPlan.document,checks:{receipt:{wrong:0,skipped:0,wrongIds:[],submissionVersion:1}}}});
  await saveStudySettings(user.id,{mode:'custom',newQuestions:3},'America/New_York',state);
  const updated = await dailyStudyView(user.id,'America/New_York',now,state);
  assert.equal(updated.settings.newQuestions,3);
  assert.equal((await store.getStudyPlan(user.id,state)).document.checks.receipt.submissionVersion,1,'Keep the immutable full-practice receipt across daily reads and settings changes');
}
console.log('Six-state Daily Study initializes once, skips unchanged writes and retains edited settings');
