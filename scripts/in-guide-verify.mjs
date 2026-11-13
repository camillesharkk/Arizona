import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.env.IN_PLAYWRIGHT_MODULE||path.resolve('.tools/browser/node_modules/playwright/index.mjs')));
const base=process.env.IN_TEST_BASE||'http://127.0.0.1:3420';assert.match(base,/^http:\/\/(localhost|127\.0\.0\.1):/);
const browser=await chromium.launch({channel:process.env.IN_BROWSER_CHANNEL||'msedge',headless:true});const results=[];
try{for(const width of [1440,390]){
 const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage();
 await page.goto(base+'/indiana/study-guide/');await page.getByRole('heading',{name:'Indiana Notary Study Guide',exact:true}).waitFor();
 const steps=await page.locator('main section.card[id]').evaluateAll(nodes=>nodes.slice(0,4).map(n=>n.id));assert.deepEqual(steps,['prepare','apply','course-exam','appointment']);
 for(const id of steps)assert.ok(await page.locator(`#${id} a[href*="in.gov"]`).count(),id+' has adjacent official source');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 await page.locator('main a[href*="mode=practice&area="]').first().click();await page.locator('.q-option').first().waitFor();
 results.push({width,fourSteps:true,officialLinks:true,topicLaunch:true,overflow:false});await context.close();
}fs.writeFileSync('.tools/in-guide-results.json',JSON.stringify(results,null,2));console.log('Final four-step guide, adjacent official links and topic launch passed at desktop/mobile widths');}finally{await browser.close();}
