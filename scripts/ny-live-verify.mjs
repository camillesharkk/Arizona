import assert from 'node:assert/strict';
import fs from 'node:fs';
const base='http://127.0.0.1:3101';
const bank=JSON.parse(fs.readFileSync('.tools/ny-bank-review.json','utf8'));
const free=bank.find(q=>q.question_id==='ny-001');
const pro=bank.find(q=>q.question_id==='ny-057');
for (const kind of ['free','pro','expired']) {
 const login=await fetch(base+'/api/auth/login/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:`ny-${kind}@example.invalid`,password:'NY-preview-test-2026!'})});
 assert.equal(login.status,200,await login.text());
 const cookie=login.headers.getSetCookie().map(v=>v.split(';')[0]).join('; ');
 const request=(url,body)=>fetch(base+url,{method:body?'POST':'GET',headers:{cookie,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
 const me=await (await request('/api/auth/me/')).json();
 assert.equal(me.user.plan,kind==='pro'?'pro':'free');
 const payload={state:'NY',questionId:free.question_id,questionVersion:free.version,selected:['A','B','C','D'].find(l=>l!==free.correct_option),attemptId:`live-${kind}-${Date.now()}`};
 let r=await request('/api/progress/',payload); assert.equal(r.status,200); const saved=await r.json(); assert.equal(saved.stat.state,'NY'); assert.equal(saved.correct,false);
 r=await request('/api/progress/',payload); assert.equal((await r.json()).stat.wrongCount,saved.stat.wrongCount);
 const mistakes=await (await request('/api/mistakes/?state=NY')).json();
 assert.ok(mistakes.mistakes.some(q=>q.questionId===free.question_id));
 const ca=await (await request('/api/mistakes/?state=CA')).json(); assert.ok(!ca.mistakes.some(q=>q.questionId.startsWith('ny-')));
 r=await request('/api/progress/',{...payload,questionId:pro.question_id,questionVersion:2,selected:pro.correct_option,attemptId:`live-pro-${kind}-${Date.now()}`}); assert.equal(r.status,kind==='pro'?200:402);
 r=await request('/api/progress/',{...payload,questionId:pro.question_id,questionVersion:1}); assert.equal(r.status,409);
 console.log(`${kind}: authenticated HTTP save, persisted wrong answer, retry, state isolation, Pro access and stale version passed`);
}
