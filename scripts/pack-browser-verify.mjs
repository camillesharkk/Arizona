import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {TEST_PASSWORD} from './pack-test-utils.mjs';
const {chromium}=await import(pathToFileURL(path.resolve('.tools/browser/node_modules/playwright/index.mjs')));
const base=process.env.PACK_TEST_BASE_URL||'http://127.0.0.1:3413';
if(!/^http:\/\/(127\.0\.0\.1|localhost):/.test(base))throw new Error('This seeded browser test is localhost-only');
const bank=JSON.parse(fs.readFileSync('.tools/pack-bank.json','utf8'));
const states=(process.env.PACK_TEST_STATES||'PA,LA').split(',');
const dirs={PA:'pennsylvania',LA:'louisiana'},names={PA:'Pennsylvania',LA:'Louisiana'};
const results=[],errors=[];fs.mkdirSync('.tools/browser-evidence',{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
try {
 for(const surface of ['desktop','mobile'])for(const kind of ['anonymous','free','pro','expired']){
  const context=await browser.newContext({viewport:surface==='mobile'?{width:390,height:844}:{width:1440,height:1000},isMobile:surface==='mobile',hasTouch:surface==='mobile'});
  if(kind!=='anonymous'){
   const login=await context.request.post(base+'/api/auth/login/',{data:{email:`pack-${kind}-${surface}@example.invalid`,password:TEST_PASSWORD}});
   assert.equal(login.status(),200,await login.text());
  }
  const page=await context.newPage();page.on('pageerror',e=>errors.push({surface,kind,message:e.message}));
  for(const state of states){
   const root=`/preview/${dirs[state]}/`,count=state==='PA'?30:40;
   const record={surface,kind,state};
   await page.goto(base+root,{waitUntil:'networkidle'});
   assert.ok((await page.locator('h1').first().innerText()).includes(names[state]));
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);assert.equal(overflow,false,`${surface} ${state} home overflows`);
   await page.goto(base+root+'practice/');
   await page.getByRole('button',{name:'Start',exact:true}).nth(0).click();
   await page.locator('.q-option').first().waitFor();
   assert.equal(await page.locator('.q-option').count(),state==='PA'?3:4);
   const quickStem=(await page.locator('.quiz-stem').last().innerText()).replace(/^\d+\.\s*/,'');
   const quickQuestion=bank[state].find(q=>q.question_text===quickStem);
   const quickOptions=await page.locator('.q-option').allTextContents();
   const wrong=quickOptions.findIndex(t=>t.trim().slice(3)!==quickQuestion['option_'+quickQuestion.correct_option.toLowerCase()]);
   await page.locator('.q-option').nth(wrong).click();
   await page.getByRole('button',{name:'Show explanation'}).click();
   const tutor=page.locator('.explain').filter({has:page.getByText('AI Tutor',{exact:true})}).last();
   await page.getByText('AI Tutor',{exact:true}).waitFor();
   if(kind==='anonymous')await page.getByRole('link',{name:'Sign in to use Tutor'}).waitFor();
   else{
    const req=page.waitForResponse(r=>r.url().includes('/api/ai/tutor/')&&r.request().method()==='POST');
    await page.getByRole('button',{name:'Why is this correct?',exact:true}).click();
    const response=await req;assert.equal(response.status(),200);const data=await response.json();
    assert.equal(data.limit,kind==='pro'?300:75);assert.equal(data.provider,'grounded-fallback');
    await page.getByText(/Saved explanation|Grounded|fallback|unavailable|verified explanation/i).first().waitFor({timeout:5000}).catch(()=>{});
    record.Tutor={provider:data.provider,fallbackReason:data.fallbackReason,limit:data.limit};
   }
   record.quick=true;
   await page.goto(base+root+'study-cards/');await page.locator('.study-face').first().waitFor();
   await page.locator('.study-face').first().click();assert.equal(await page.locator('.study-face').first().getAttribute('aria-pressed'),'true');
   await page.reload();await page.locator('.study-face').first().waitFor();record.cards=true;
   await page.goto(base+root+'study-guide/');
   const topic=page.locator('main a[href*="area="]').first();await topic.click();await page.locator('.q-option').first().waitFor();record.topic=true;
   await page.goto(base+root+'practice/');
   await page.getByRole('button',{name:'Start',exact:true}).nth(1).click();
   await page.locator('.q-option').first().waitFor();
   for(let i=0;i<count;i++){
    const stem=(await page.locator('.quiz-stem').last().innerText()).replace(/^\d+\.\s*/,'');
    const q=bank[state].find(q=>q.question_text===stem);assert.ok(q,`Unknown ${state} browser stem ${stem}`);
    const text=q['option_'+q.correct_option.toLowerCase()];
    const options=await page.locator('.q-option').allTextContents();
    const index=options.findIndex(t=>t.trim().slice(3)===text);assert.ok(index>=0,`Correct option absent ${q.question_id}`);
    await page.locator('.q-option').nth(index).click();
    await page.locator('.q-option[aria-pressed="true"]').waitFor();
    if(i===0){
     const before=await page.locator('.quiz-stem').last().innerText();await page.reload();await page.locator('.q-option[aria-pressed="true"]').waitFor();assert.equal(await page.locator('.quiz-stem').last().innerText(),before);record.inProgressRefresh=true;
    }
    if(i<count-1){await page.getByRole('button',{name:'Next',exact:true}).click();await page.waitForFunction(n=>document.querySelector('.quiz-stem')?.textContent?.trim().startsWith(n+'.'),i+2);}
   }
   const delay=kind==='pro'&&surface==='desktop';let delayed=false;
   if(delay)await page.route('**/api/progress/',async route=>{
    const body=route.request().postDataJSON();
    if(body?.kind==='pack-full'&&!delayed){delayed=true;const response=await route.fetch();await sleep(21500);await route.fulfill({response}).catch(()=>{});}
    else await route.continue();
   });
   const start=performance.now();await page.getByRole('button',{name:'Submit exam',exact:true}).click();
   await page.getByRole('status').filter({hasText:'Saving your sitting'}).waitFor().catch(()=>{});
   if(delay){await page.getByRole('button',{name:'Try again',exact:true}).waitFor({timeout:30000});await page.getByRole('button',{name:'Try again',exact:true}).click();record.timeoutRetry=true;}
   const heading=page.getByRole('heading',{name:state==='PA'?'25 of 25 practice-scored':/40 of 40|40\/40|100/}).first();
   await heading.waitFor({timeout:45000});record.submitMs=Math.round(performance.now()-start);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1),false,`${surface} ${state} results overflow`);
   record.result=await heading.innerText();await page.reload();await heading.waitFor({timeout:20000});record.resultRefresh=true;
   await page.screenshot({path:`.tools/browser-evidence/${state}-${surface}-${kind}-result.png`,fullPage:false});
   if(kind!=='anonymous'){
    const progress=await (await context.request.get(base+'/api/progress/')).json();const mine=progress.exams.filter(e=>e.mode===state.toLowerCase()+'-full');assert.equal(mine.length,1);assert.equal(mine[0].score,100);record.savedExams=mine.length;
    await page.goto(base+root+'daily-study/');await page.getByRole('heading',{name:/Daily Study|daily study/i}).first().waitFor();
    const view=await (await context.request.get(base+'/api/daily-study/?state='+state)).json();assert.ok(view.recent.some(e=>e.id===mine[0].id));record.dailyHistory=true;
    await page.goto(base+root+'wrong-answers/');await page.locator('main').waitFor();record.mistakes=true;
   }
   for(const slug of ['exam-guide/','resources/','passing-score/','laws/','become-a-notary/','pricing/']){const response=await page.goto(base+root+slug);assert.equal(response.status(),200,`${state}${slug}`);}
   record.navigation=true;results.push(record);console.log(JSON.stringify(record));
  }
  await context.close();
 }
} finally {await browser.close();fs.writeFileSync('.tools/pack-browser-result.json',JSON.stringify({checkedAt:new Date().toISOString(),base,results,pageErrors:errors},null,2));}
assert.equal(errors.length,0,JSON.stringify(errors));
