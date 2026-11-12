import assert from 'node:assert/strict';
import fs from 'node:fs';
import {TEST_PASSWORD} from './pack-test-utils.mjs';
const base=process.env.PACK_TEST_BASE_URL||'http://127.0.0.1:3414';
if(!/^http:\/\/(127\.0\.0\.1|localhost):/.test(base))throw new Error('Gates write checks are localhost-only');
const checks=[];
for(const slug of ['pennsylvania','louisiana']){
 for(const route of ['','practice/','resources/','laws/','passing-score/','become-a-notary/','guides/'+(slug==='pennsylvania'?'bond-and-stamp-2026':'authentic-act-execution')+'/'])for(const rsc of [false,true]){
  const path='/preview/'+slug+'/'+route;
  const response=await fetch(base+path,{headers:rsc?{RSC:'1','Next-Router-Prefetch':'1'}:{}});
  assert.equal(response.status,404,path);checks.push({path,rsc,status:404});
 }
 const response=await fetch(base+'/'+slug+'/');assert.equal(response.status,200);assert.match(await response.text(),/Under development/);
}
const login=await fetch(base+'/api/auth/login/',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:'pack-free-http@example.invalid',password:TEST_PASSWORD})});assert.equal(login.status,200);
const cookie=login.headers.getSetCookie().map(v=>v.split(';')[0]).join('; ');
const request=(route,body)=>fetch(base+route,{method:body?'POST':'GET',headers:{cookie,'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
for(const state of ['PA','LA']){
 for(const route of ['/api/mistakes/','/api/daily-study/','/api/study-settings/','/api/ai/tutor/'])assert.equal((await request(route+'?state='+state)).status,404,route+state);
 assert.equal((await request('/api/progress/',{kind:'pack-full',state})).status,404);
}
const bank=JSON.parse(fs.readFileSync('.tools/pack-bank.json','utf8'));
for(const [state,route] of [['AZ','/arizona-notary-practice-test/'],['CA','/california/practice/'],['HI','/hawaii/practice/'],['NY','/new-york/practice/']]){
 assert.equal((await fetch(base+route)).status,200);
 const q=bank[state].find(q=>q.is_free);assert.equal((await request('/api/progress/',{state,questionId:q.question_id,questionVersion:q.version,selected:q.correct_option,attemptId:'gates-'+state+'-'+Date.now()})).status,200);
 checks.push({state,practice:200,answer:200});
}
const sitemap=await (await fetch(base+'/sitemap.xml')).text();assert.doesNotMatch(sitemap,/\/preview\/|\/pennsylvania\/|\/louisiana\//);assert.match(sitemap,/\/new-york\//);
fs.writeFileSync('.tools/pack-gates-result.json',JSON.stringify({checkedAt:new Date().toISOString(),checks,sitemap:'PA/LA excluded; NY retained'},null,2));
console.log('Production-mode localhost: PA/LA HTML/RSC + learning blocked; coming-soon pages retained; AZ/CA/HI/NY practice and answer saves passed; sitemap unchanged');
