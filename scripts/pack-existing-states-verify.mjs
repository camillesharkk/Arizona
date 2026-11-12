import assert from 'node:assert/strict';
import fs from 'node:fs';
import {randomUUID} from 'node:crypto';
import {TEST_PASSWORD} from './pack-test-utils.mjs';
const base=process.env.PACK_TEST_BASE_URL||'http://127.0.0.1:3413';
if(!/^http:\/\/(127\.0\.0\.1|localhost):/.test(base))throw new Error('Existing-state write checks are localhost-only');
const bank=JSON.parse(fs.readFileSync('.tools/pack-bank.json','utf8')),results=[];
for(const kind of ['free','pro','expired']){
 const login=await fetch(base+'/api/auth/login/',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:`pack-${kind}-http@example.invalid`,password:TEST_PASSWORD})});assert.equal(login.status,200);
 const cookie=login.headers.getSetCookie().map(v=>v.split(';')[0]).join('; ');
 const request=(route,body)=>fetch(base+route,{method:body?'POST':'GET',headers:{cookie,'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
 const me=await(await request('/api/auth/me/')).json();
 for(const flag of ['arizonaPro','californiaPro','hawaiiPro'])assert.equal(me.user[flag],kind==='pro');
 for(const state of ['AZ','CA','HI','NY']){
  const free=bank[state].find(q=>q.is_free),paid=bank[state].find(q=>!q.is_free);
  const post=q=>request('/api/progress/',{state,questionId:q.question_id,questionVersion:q.version,selected:q.correct_option,attemptId:randomUUID()});
  let response=await post(free);assert.equal(response.status,200);assert.equal((await response.json()).stat.state,state);
  if(paid){response=await post(paid);assert.equal(response.status,kind==='pro'?200:402);}
  results.push({state,kind,freeSave:200,paidSave:paid?(kind==='pro'?200:402):'no-paid-question-in-existing-bank'});
 }
}
fs.writeFileSync('.tools/pack-existing-result.json',JSON.stringify(results,null,2));console.log('AZ/CA/HI/NY actual HTTP: free/active/expired account-wide rights, free saves, available paid-question rights and correct state attribution passed');
