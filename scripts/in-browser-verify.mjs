import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {randomUUID} from 'node:crypto';
const {chromium}=await import(pathToFileURL(process.env.IN_PLAYWRIGHT_MODULE || path.resolve('.tools/browser/node_modules/playwright/index.mjs')));
const base=process.env.IN_TEST_BASE||'http://127.0.0.1:3420';
assert.match(base,/^http:\/\/(127\.0\.0\.1|localhost):/);
const bank=JSON.parse(fs.readFileSync('.tools/in-test-bank.json','utf8'));
const results=[],errors=[];fs.mkdirSync('.tools/in-browser-evidence',{recursive:true});
const browser=await chromium.launch({channel:process.env.IN_BROWSER_CHANNEL||'msedge',headless:true});
const startTime=Date.now();
async function json(response){const body=await response.json();assert.ok(response.ok(),JSON.stringify(body));return body;}
function optionText(text){return text.trim().replace(/^[A-D][.)]\s*/,'');}
async function answer(page,state,correct){
 const stem=(await page.locator('.quiz-stem').last().innerText()).replace(/^\d+\.\s*/,'');
 const q=bank[state].find(q=>q.question_text===stem);assert.ok(q,`Unknown ${state} stem: ${stem}`);
 const texts=await page.locator('.q-option').allTextContents();
 const right=q['option_'+q.correct_option.toLowerCase()];
 const index=texts.findIndex(text=>correct?optionText(text)===right:optionText(text)!==right);assert.ok(index>=0);
 await page.locator('.q-option').nth(index).click();await page.locator('.q-option[aria-pressed="true"]').waitFor();return q;
}
async function next(page,n){await page.getByRole('button',{name:'Next',exact:true}).click();await page.waitForFunction(number=>[...document.querySelectorAll('.quiz-stem')].at(-1)?.textContent?.trim().startsWith(number+'.'),n);}
async function noOverflow(page,label){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,label+' overflow');}
try {
 for(const surface of (process.env.IN_TEST_SURFACES||'desktop,mobile').split(',')) for(const kind of (process.env.IN_TEST_KINDS||'anonymous,free,pro,other-pro').split(',')) {
  const context=await browser.newContext({viewport:surface==='mobile'?{width:390,height:844}:{width:1440,height:1000},isMobile:surface==='mobile',hasTouch:surface==='mobile'});
  const record={surface,kind};results.push(record);
  if(kind!=='anonymous')await json(await context.request.post(base+'/api/auth/login/',{data:{email:`in-${kind}-${surface}@example.invalid`,password:'Indiana-local-test-2026!'}}));
  const page=await context.newPage();page.on('pageerror',e=>errors.push({surface,kind,error:e.message}));
  await page.goto(base+'/');await page.getByRole('link',{name:/Indiana \(IN\)/}).first().click();await page.getByRole('heading',{name:'Indiana Notary Exam Prep',exact:true}).waitFor();
  assert.equal(new URL(page.url()).pathname,'/indiana/');await noOverflow(page,`${surface} ${kind} home`);
  assert.equal(await page.locator('main a').filter({hasText:/Unlock Pro|View Pro/}).count(),0);
  await page.getByRole('link',{name:'Official Course & Exam',exact:true}).first().click();await page.getByRole('heading',{name:'3. Complete the official course and exam'}).waitFor();
  assert.ok(await page.locator('a[href*="apphub.notary.sos.in.gov"]').count());
  await page.goto(base+'/indiana/');await page.getByRole('link',{name:'Start Free Practice',exact:true}).first().click();await page.locator('.q-option').first().waitFor();
  const quickIds=[];
  for(let i=0;i<10;i++){
   quickIds.push((await answer(page,'IN',kind==='pro'&&i<8)).question_id);
   if(i===0){await page.getByRole('button',{name:'Show explanation'}).click();await page.locator('.explain').first().waitFor();assert.ok(await page.locator('.explain a[href*="in.gov"]').count());}
   if(i<9)await next(page,i+2);
  }
  if(await page.getByRole('button',{name:'Submit exam',exact:true}).isVisible())await page.getByRole('button',{name:'Submit exam',exact:true}).click();
  else if(await page.getByRole('button',{name:'See results',exact:true}).isVisible())await page.getByRole('button',{name:'See results',exact:true}).click();
  await page.locator('.result-summary').waitFor();assert.equal(new Set(quickIds).size,10);
  assert.ok(quickIds.every(id=>bank.IN.find(q=>q.question_id===id).is_free));
  assert.ok(await page.getByRole('heading',{name:'Topic accuracy',exact:true}).count());
  assert.ok(await page.locator('a[href*="/indiana/study-cards/?topic="]').count()<=2);
  if(kind==='pro')await page.getByRole('link',{name:'Start 30-Question Mock Exam',exact:true}).first().waitFor();
  record.quick=true;await noOverflow(page,`${surface} ${kind} quick results`);
  const access=await json(await context.request.get(base+'/api/indiana/questions/'));assert.equal(access.questions.length,kind==='pro'?bank.IN.length:bank.IN.filter(q=>q.is_free).length);assert.equal(access.pro,kind==='pro');record.authorizedQuestions=access.questions.length;
  await page.goto(base+'/indiana/practice/');await page.getByRole('heading',{name:'Topic Practice',exact:true}).waitFor();
  const topic=page.locator('a[href*="mode=practice&area="]').first();await topic.click();await page.locator('.q-option').first().waitFor();record.topic=true;
  await page.goto(base+'/indiana/study-cards/');await page.locator('.study-face').first().waitFor();await page.locator('.study-face').first().click();assert.equal(await page.locator('.study-face').first().getAttribute('aria-pressed'),'true');record.cards=true;
  await page.goto(base+'/indiana/practice/');await page.getByRole('button',{name:'Start',exact:true}).nth(1).click();await page.locator('.q-option').first().waitFor();
  const expected=kind==='other-pro'?23:24,fullIds=[];
  let submission;
  page.on('request',request=>{if(request.url().includes('/api/indiana/sitting/')&&request.method()==='POST'){const data=request.postDataJSON();if(data?.action==='submit')submission=data;}});
  for(let i=0;i<30;i++){
   fullIds.push((await answer(page,'IN',i<expected)).question_id);
   if(i===0){
    await page.getByRole('button',{name:'Flag question',exact:true}).click();
    const stem=await page.locator('.quiz-stem').last().innerText();await page.reload();await page.locator('.q-option[aria-pressed="true"]').waitFor();assert.equal(await page.locator('.quiz-stem').last().innerText(),stem);record.refresh=true;
   }
   if(i===1){await page.getByRole('button',{name:'Previous',exact:true}).click();await page.getByRole('button',{name:'Next',exact:true}).click();record.previous=true;}
   if(i<29)await next(page,i+2);
  }
  assert.equal(fullIds.length,30);assert.equal(new Set(fullIds).size,30);
  if(kind!=='pro')assert.ok(fullIds.every(id=>bank.IN.find(q=>q.question_id===id).is_free));
  await page.getByRole('button',{name:'Submit exam',exact:true}).click();await page.getByRole('heading',{name:`${expected}/30`,exact:true}).waitFor({timeout:30000});
  await page.getByText(expected===24?'Your practice result is at or above the 24/30 official reference line.':'Your practice result is 1 answer below the 24/30 official reference line.',{exact:false}).waitFor();
  await page.waitForFunction(()=>{const el=document.querySelector('.result-summary h2');return el&&el.getBoundingClientRect().top>=document.querySelector('.site-header').getBoundingClientRect().bottom&&el.getBoundingClientRect().top<innerHeight;});
  record.fullResult=`${expected}/30`;await noOverflow(page,`${surface} ${kind} full results`);
  await page.screenshot({path:`.tools/in-browser-evidence/${surface}-${kind}-result.png`,fullPage:false});
  assert.ok(submission);const duplicate=await json(await context.request.post(base+'/api/indiana/sitting/',{data:submission}));assert.equal(duplicate.duplicate,true);record.idempotent=true;
  await page.reload();await page.getByRole('heading',{name:`${expected}/30`,exact:true}).waitFor();record.resultRefresh=true;
  const nextStart=await context.request.post(base+'/api/indiana/sitting/',{data:{action:'start',examId:randomUUID()}});assert.equal(nextStart.status(),kind==='pro'?200:402);record.trial=nextStart.status();
  if(kind!=='anonymous') {
   const progress=await json(await context.request.get(base+'/api/progress/'));const exams=progress.exams.filter(e=>e.mode==='in-full');assert.equal(exams.length,1);assert.equal(exams[0].correctCount,expected);
   const mistakes=await json(await context.request.get(base+'/api/mistakes/?state=IN'));assert.equal(mistakes.state,'IN');assert.ok(mistakes.mistakes.length>=30-expected);
   const wrong=fullIds.find((id,i)=>i>=expected);assert.ok(mistakes.mistakes.some(s=>s.questionId===wrong));
   await json(await context.request.post(base+'/api/mistakes/',{data:{questionId:wrong,favorited:true}}));await json(await context.request.post(base+'/api/mistakes/',{data:{questionId:wrong,saveForReview:true}}));
   const saved=await json(await context.request.get(base+'/api/mistakes/?state=IN'));const target=saved.mistakes.find(s=>s.questionId===wrong);assert.equal(target.favorited,true);assert.equal(target.savedForReview,true);record.favorite=true;
   const daily=await json(await context.request.get(base+'/api/daily-study/?state=IN'));assert.equal(daily.state,'IN');assert.ok(daily.recent.some(e=>e.id===exams[0].id));record.daily=true;
   await page.goto(base+'/indiana/wrong-answers/');await page.getByRole('link',{name:'Study This Rule',exact:true}).first().waitFor();await page.getByRole('link',{name:'Practice This Topic',exact:true}).first().waitFor();
   await page.getByRole('button',{name:'Practice wrong answers',exact:true}).click();await page.locator('.q-option').first().waitFor();assert.equal(await page.locator('.q-num').count(),saved.mistakes.length);record.sameDayAllMistakes=true;
   const azMistakes=await json(await context.request.get(base+'/api/mistakes/?state=AZ'));assert.ok(azMistakes.mistakes.every(s=>!s.questionId.startsWith('in-')));record.stateDataIsolation=true;
  }
  // Use the state menu on practice pages, preserving the feature and testing the first Start click.
  await page.goto(base+'/indiana/practice/');await page.getByRole('button',{name:'Choose state, current state Indiana',exact:true}).click();await page.getByRole('menuitem',{name:/Arizona \(AZ\)/}).click();
  await page.getByRole('heading',{name:'Full 45',exact:true}).waitFor();await page.getByRole('button',{name:'Start',exact:true}).nth(1).click();await page.locator('.q-option').first().waitFor();
  const azStem=(await page.locator('.quiz-stem').last().innerText()).replace(/^\d+\.\s*/,'');assert.ok(bank.AZ.some(q=>q.question_text===azStem));assert.equal(await page.locator('.q-num').count(),45);record.azFull45FirstClick=true;
  await page.goto(base+'/arizona-notary-exam/');await page.getByRole('link',{name:/Full Practice Exam|Full 45/}).first().waitFor();record.azHome=true;
  await page.getByRole('button',{name:/Choose state, current state Arizona/}).click();await page.getByRole('menuitem',{name:/Indiana \(IN\)/}).click();await page.getByRole('heading',{name:'Indiana Notary Exam Prep',exact:true}).waitFor();record.switchBack=true;
  await context.close();console.log(JSON.stringify(record));
 }
 assert.deepEqual(errors,[],'Browser runtime errors');
 fs.writeFileSync('.tools/in-browser-results.json',JSON.stringify({results,errors,elapsedMs:Date.now()-startTime},null,2));
 console.log('Indiana desktop/mobile guest/free/IN Pro/other-state Pro browser flows passed');
} finally {await browser.close();fs.writeFileSync('.tools/in-browser-partial.json',JSON.stringify({results,errors},null,2));}
