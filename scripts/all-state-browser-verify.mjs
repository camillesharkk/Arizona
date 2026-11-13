import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';import {createRequire} from 'node:module';
import {testLoader} from './pack-test-utils.mjs';
const load=testLoader();const packs=load('lib/prep-pack.ts');const password='All-state-isolated-2026!';
if(process.argv.includes('--seed')){
 process.env.NOTARY_DATA_DIR=path.resolve('.tools/all-state-data');delete process.env.DATABASE_URL;
 const store=load('lib/store/file-store.ts').fileStore;const {hashSync}=createRequire(import.meta.url)('bcryptjs');
 for(const code of ['CT','NC','IN'])for(const width of [390,1440])for(const kind of ['free','pro','expired','claim']){
 const email=`allstate-${code.toLowerCase()}-${width}-${kind}-r4@example.invalid`;let user=await store.getUserByEmail(email);if(!user)user=await store.createUser({email,passwordHash:hashSync(password,4),name:null});await store.updateUser(user.id,{emailVerified:true,emailVerifiedAt:new Date().toISOString()});
 if(['pro','expired'].includes(kind)&&!(await store.listEntitlements(user.id)).length)await store.insertEntitlement({userId:user.id,productCode:code==='IN'?'in_exam_pro_60d':code==='NC'?'nc_exam_pro_60d':'az_exam_pro_60d',state:code,status:'active',startsAt:new Date(Date.now()-86400000).toISOString(),expiresAt:new Date(Date.now()+(kind==='expired'?-3600000:86400000*30)).toISOString(),provider:'mock',providerOrderId:email,providerCustomerId:null});
 }console.log('Seeded isolated state/identity/width accounts');process.exit(0);
}
const {chromium}=await import(pathToFileURL(path.resolve('.tools/browser/node_modules/playwright/index.mjs')));
const browser=await chromium.launch({channel:'msedge',headless:true});const base=process.env.ALL_STATE_TEST_BASE||'http://127.0.0.1:3460';const results=[],errors=[];
fs.mkdirSync('.tools/all-state-browser-evidence',{recursive:true});
const banks={CT:load('data/ct-content.ts').publishedCtQuestions(),NC:load('data/nc-content.ts').publishedNcQuestions(),IN:load('data/in-questions.ts').publishedInQuestions()};
async function answerSet(page,code,count,practice){
 const ids=[];
 for(let i=0;i<count;i++){
  await page.locator('.quiz-stem').last().waitFor();const stem=(await page.locator('.quiz-stem').last().innerText()).replace(/^\d+\.\s*/,'');const q=banks[code].find(q=>q.question_text===stem);assert.ok(q,code+' unknown question');ids.push(q.question_id);
  const right=q['option_'+q.correct_option.toLowerCase()];const texts=await page.locator('.q-option').allTextContents();const option=texts.findIndex(text=>text.trim().replace(/^[A-D][.)]\s*/,'')!==right);assert.ok(option>=0);await page.locator('.q-option').nth(option).click();
  if(i<count-1){await page.getByRole('button',{name:'Next',exact:true}).click();await page.waitForFunction(n=>[...document.querySelectorAll('.quiz-stem')].at(-1)?.textContent?.trim().startsWith(n+'.'),i+2);}
 }
 assert.equal(new Set(ids).size,count);await page.getByRole('button',{name:practice?'See results':'Submit exam',exact:true}).click();await page.locator('.result-summary').waitFor({timeout:30000});return ids;
}
try{
for(const width of [1440,390])for(const code of (process.env.ALL_STATE_TEST_STATES||'CT,NC,IN').split(','))for(const kind of ['guest','free','pro','expired']){
 const pack=packs.packFor(code);const context=await browser.newContext({viewport:{width,height:900}});const page=await context.newPage();page.on('pageerror',error=>errors.push({code,width,kind,error:error.message}));
 if(kind!=='guest'){const login=await context.request.post(base+'/api/auth/login/',{data:{email:`allstate-${code.toLowerCase()}-${width}-${kind}-r4@example.invalid`,password}});assert.equal(login.status(),200,await login.text());}
 await page.goto(base+pack.paths.home);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,code+' home overflow');
 await page.goto(base+pack.paths.study);await page.getByRole('navigation',{name:'Chapters'}).waitFor();assert.equal(await page.getByRole('button',{name:'Mark chapter read',exact:true}).count(),pack.topics.length);await page.getByRole('button',{name:'Mark chapter read',exact:true}).first().click();await page.getByRole('button',{name:'Marked read',exact:true}).first().waitFor();await page.reload();await page.getByRole('button',{name:'Marked read',exact:true}).first().waitFor();await page.getByRole('button',{name:'Marked read',exact:true}).first().click();assert.equal(await page.getByRole('button',{name:'Mark chapter read',exact:true}).count(),pack.topics.length);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,code+' guide overflow');
 await page.goto(base+pack.paths.practice+'?mode=quick&start=1');await page.locator('.q-option').first().waitFor();await answerSet(page,code,10,true);
 await page.goto(base+pack.paths.practice);await page.getByRole('button',{name:'Start',exact:true}).nth(1).click();await page.locator('.q-option').first().waitFor();const full=await answerSet(page,code,pack.fullCount,false);
 await page.reload();await page.locator('.result-summary').waitFor();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,code+' result overflow');
 if(kind==='guest'){
  await page.goto(base+'/login/?next='+encodeURIComponent(pack.paths.mistakes));await page.locator('input[type="email"]').fill(`allstate-${code.toLowerCase()}-${width}-claim-r4@example.invalid`);await page.locator('input[type="password"]').fill(password);await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.waitForURL(url=>url.pathname===pack.paths.mistakes);await page.getByRole('heading',{name:/Wrong.answer notebook/i}).first().waitFor();await page.waitForTimeout(500);
  const progress=await (await context.request.get(base+'/api/progress/')).json();const saved=progress.exams.find(exam=>exam.mode===code.toLowerCase()+'-full');assert.ok(saved,code+' guest full recovered');assert.equal(saved.total,pack.fullCount);assert.equal(progress.stats.filter(stat=>stat.state===code).length>=pack.fullCount,true);
 }
 await page.screenshot({path:`.tools/all-state-browser-evidence/${code}-${width}-${kind}.png`,fullPage:false});results.push({code,width,kind,quick:10,full:full.length,guideProgress:true,resultRefresh:true,guestImport:kind==='guest',overflow:false});console.log(JSON.stringify(results.at(-1)));await context.close();
}
assert.deepEqual(errors,[]);fs.writeFileSync('.tools/all-state-browser-result.json',JSON.stringify({results,errors},null,2));
}catch(error){fs.writeFileSync('.tools/all-state-browser-partial.json',JSON.stringify({results,errors,error:error.message},null,2));throw error;}finally{await browser.close();}
