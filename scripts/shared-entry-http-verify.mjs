import assert from 'node:assert/strict';
import fs from 'node:fs';
import {randomUUID} from 'node:crypto';
import {testLoader,TEST_PASSWORD} from './pack-test-utils.mjs';

const base=process.env.PACK_TEST_BASE_URL||'http://127.0.0.1:3429';
if(!/^http:\/\/(127\.0\.0\.1|localhost):/.test(base))throw Error('Shared write regression requires seeded localhost data');
const pages=['/','/arizona-notary-exam/','/california/','/hawaii/','/new-york/','/pennsylvania/','/louisiana/','/connecticut/','/indiana/'];
for(const path of pages){
  const response=await fetch(base+path,{headers:{'user-agent':'Mozilla/5.0'}});assert.equal(response.status,200,path);
  const html=await response.text(),head=html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1]||'';
  for(const pattern of [/<link\b[^>]*rel="canonical"/g,/<meta\b[^>]*name="robots"/g]){
    assert.equal((html.match(pattern)||[]).length,1,path+' has one metadata tag');
    assert.equal((head.match(pattern)||[]).length,1,path+' keeps metadata in head');
  }
}
for(const path of ['/login/','/register/','/forgot-password/','/reset-password/']){
  const response=await fetch(base+path);assert.equal(response.status,200,path);
  const html=await response.text();assert.doesNotMatch(html,/<form\b/i,'No credential form before JavaScript initialization');
  assert.match(html,/Enable JavaScript to sign in and save your practice/);
}
for(const slug of ['connecticut','indiana','north-carolina'])assert.equal((await fetch(base+'/'+slug+'/practice/')).status,404,'Shared fixes do not open a state candidate');
console.log('Public/candidate-placeholder metadata stays unique in HEAD; unhydrated auth HTML contains no credential form; candidate practice remains closed');

const load=testLoader();
const draws={AZ:seed=>({questions:load('lib/quiz.ts').pickFullExam(seed),unscoredIds:[]}),CA:load('lib/ca-exam.ts').pickCaFullExam,HI:seed=>({questions:load('lib/hi-exam.ts').pickHiFullExam(seed),unscoredIds:[]})};
const results=[];
for(const kind of ['free','pro','expired']){
  const login=await fetch(base+'/api/auth/login/',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:`pack-${kind}-http@example.invalid`,password:TEST_PASSWORD})});assert.equal(login.status,200);
  const cookie=login.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');
  const request=(path,body)=>fetch(base+path,{method:body?'POST':'GET',headers:{cookie,'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  const me=await(await request('/api/auth/me/')).json();assert.equal(me.user.plan,kind==='pro'?'pro':'free');
  for(const [state,pick] of Object.entries(draws)){
    const draw=pick(614),examId=randomUUID();
    const input={kind:'pack-full',state,examId,accountId:me.user.id,seed:614,unscoredIds:draw.unscoredIds,score:0,questions:draw.questions.map(question=>({questionId:question.question_id,questionVersion:question.version,selected:question.correct_option}))};
    const started=performance.now();
    const response=await request('/api/progress/',input);assert.equal(response.status,200,state+' full');
    const saved=await response.json();assert.equal(saved.exam.score,100);assert.equal(saved.fullExamCount,1);
    const firstSubmitMs=Math.round(performance.now()-started);
    const before=await(await request('/api/progress/')).json();
    const replay=await(await request('/api/progress/',input)).json();assert.equal(replay.duplicate,true);assert.equal(replay.fullExamCount,1);
    assert.deepEqual((await(await request('/api/progress/')).json()).stats,before.stats);
    assert.equal(before.exams.filter(exam=>exam.id===examId).length,1);
    assert.equal(before.stats.filter(stat=>stat.state===state).length,draw.questions.length);
    const extra=await request('/api/progress/',{...input,examId:randomUUID()});assert.equal(extra.status,kind==='pro'?200:402);
    assert.equal((await request('/api/progress/',{...input,accountId:'another-account'})).status,409);
    const paid=draw.questions.find(question=>!question.is_free);
    if(paid)assert.equal((await request('/api/progress/',{state,questionId:paid.question_id,questionVersion:paid.version,selected:paid.correct_option,attemptId:randomUUID()})).status,kind==='pro'?200:402);
    const daily=await(await request('/api/daily-study/?state='+state)).json();assert.ok(daily.recent.some(exam=>exam.id===examId));
    results.push({kind,state,answers:draw.questions.length,total:saved.exam.total,score:saved.exam.score,firstSubmitMs,replay:true,extraStatus:extra.status});
  }
}
fs.writeFileSync('.tools/shared-entry-http-results.json',JSON.stringify(results,null,2));
console.log('AZ/CA/HI actual HTTP full grading, history, immutable replay, owner boundary and free/active/expired rights passed');
