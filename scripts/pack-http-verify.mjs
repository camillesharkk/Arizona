import assert from 'node:assert/strict';
import fs from 'node:fs';
import {randomUUID} from 'node:crypto';
import {testLoader,TEST_PASSWORD} from './pack-test-utils.mjs';
const base=process.env.PACK_TEST_BASE_URL||'http://127.0.0.1:3412';
if(!/^http:\/\/(127\.0\.0\.1|localhost):/.test(base)) throw new Error('This seeded test is localhost-only');
const {prepPacks}=testLoader()('lib/prep-pack.ts');
const results=[];
for(const kind of ['free','pro','expired']) {
  const login=await fetch(base+'/api/auth/login/',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:`pack-${kind}-http@example.invalid`,password:TEST_PASSWORD})});
  assert.equal(login.status,200,await login.text());
  const cookie=login.headers.getSetCookie().map(v=>v.split(';')[0]).join('; ');
  const request=(route,body)=>fetch(base+route,{method:body?'POST':'GET',headers:{cookie,'content-type':'application/json'},signal:AbortSignal.timeout(60000),...(body?{body:JSON.stringify(body)}:{})});
  const json=async(route,body)=>{const r=await request(route,body);assert.equal(r.status,200,route+': '+await r.clone().text());return r.json();};
  const me=await json('/api/auth/me/');assert.equal(me.user.plan,kind==='pro'?'pro':'free');
  const azBefore=JSON.stringify(await json('/api/study-settings/?state=AZ'));
  for(const state of ['PA','LA']) {
    const pack=prepPacks[state],free=pack.questions().find(q=>q.is_free),paid=pack.questions().find(q=>!q.is_free);
    const answer={state,questionId:free.question_id,questionVersion:free.version,selected:['A','B','C','D'].find(l=>l!==free.correct_option && free['option_'+l.toLowerCase()]),attemptId:randomUUID()};
    const saved=await json('/api/progress/',answer);assert.equal(saved.stat.state,state);assert.equal(saved.correct,false);
    const duplicate=await json('/api/progress/',answer);assert.equal(duplicate.stat.wrongCount,saved.stat.wrongCount);
    let r=await request('/api/progress/',{...answer,questionId:paid.question_id,questionVersion:paid.version,selected:paid.correct_option,attemptId:randomUUID()});assert.equal(r.status,kind==='pro'?200:402);
    r=await request('/api/progress/',{...answer,questionVersion:999});assert.equal(r.status,409);
    r=await request('/api/progress/',{...answer,state:state==='PA'?'LA':'PA'});assert.equal(r.status,400);
    const mistakes=await json('/api/mistakes/?state='+state);assert.ok(mistakes.mistakes.some(q=>q.questionId===free.question_id));
    await json('/api/mistakes/',{questionId:free.question_id,favorited:true});
    await json('/api/mistakes/',{questionId:free.question_id,saveForReview:true});
    const again=await json('/api/mistakes/?state='+state);assert.ok(again.favorites.some(q=>q.questionId===free.question_id));
    await json('/api/study-settings/?state='+state,{mode:'custom',newCards:2,newQuestions:3,reviewTarget:2,timeZone:state==='PA'?'America/New_York':'America/Chicago'});
    const settings=await json('/api/study-settings/?state='+state);assert.equal(settings.settings.newQuestions,3);
    const card=settings.practiceCards[0]||settings.reviewCards[0];assert.ok(card,state+' needs daily cards');
    await json('/api/daily-study/?state='+state,{action:'studied',cardId:card.id,attemptId:randomUUID()});
    let daily=await json('/api/daily-study/?state='+state);assert.ok(daily.taskStatus.some(t=>t.key==='card:'+card.id && t.status==='done'));
    const seed=77123,draw=pack.pickFull(seed);assert.ok(draw);
    const input={kind:'pack-full',state,examId:randomUUID(),seed,unscoredIds:draw.unscoredIds,questions:draw.questions.map(q=>({questionId:q.question_id,questionVersion:q.version,selected:q.correct_option}))};
    const start=performance.now();const full=await json('/api/progress/',input);const saveMs=Math.round(performance.now()-start);
    assert.equal(full.exam.correctCount,state==='PA'?25:pack.fullCount);assert.equal(full.exam.score,100);
    assert.equal((await json('/api/progress/',input)).duplicate,true);
    const progress=await json('/api/progress/');assert.equal(progress.exams.filter(e=>e.id===input.examId).length,1);
    assert.equal(progress.exams.find(e=>e.id===input.examId).mode,state.toLowerCase()+'-full');
    r=await request('/api/progress/',{...input,examId:randomUUID()});assert.equal(r.status,kind==='pro'?200:402);
    const tutorPayload=q=>({state,questionId:q.question_id,questionVersion:q.version,mode:'why-wrong',selected:q.correct_option,options:[q.option_a,q.option_b,q.option_c,q.option_d]});
    const tutor=await json('/api/ai/tutor/',tutorPayload(free));assert.equal(tutor.limit,kind==='pro'?300:75);assert.equal(tutor.provider,'grounded-fallback');assert.ok(tutor.fallbackReason);
    r=await request('/api/ai/tutor/',tutorPayload(paid));assert.equal(r.status,kind==='pro'?200:402);
    daily=await json('/api/daily-study/?state='+state);assert.ok(daily.recent.some(e=>e.id===input.examId));
    assert.ok((await json('/api/mistakes/?state=CA')).mistakes.every(q=>!q.questionId.startsWith('pa-')&&!q.questionId.startsWith('la-')));
    results.push({state,kind,saveMs,history:full.exam.total,answers:input.questions.length,settings:true,dailyCard:true,Tutor:'grounded-fallback',paidAccess:kind==='pro'});
  }
  const azAfter=await json('/api/study-settings/?state=AZ');assert.equal(JSON.stringify(azAfter),azBefore,'PA/LA study settings must not change AZ');
}
for(const state of ['PA','LA']) {
  assert.equal((await fetch(base+'/api/progress/',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({state})})).status,401);
  assert.equal((await fetch(base+'/api/ai/tutor/',{method:'POST',headers:{'content-type':'application/json'},body:'{}'})).status,401);
}
fs.mkdirSync('.tools',{recursive:true});fs.writeFileSync('.tools/pack-http-result.json',JSON.stringify({checkedAt:new Date().toISOString(),base,results},null,2));
console.log(JSON.stringify(results,null,2));
