import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.env.IN_PLAYWRIGHT_MODULE||path.resolve('.tools/browser/node_modules/playwright/index.mjs')));
const base=process.env.IN_TEST_BASE||'http://127.0.0.1:3420';assert.match(base,/^http:\/\/(localhost|127\.0\.0\.1):/);
const browser=await chromium.launch({channel:process.env.IN_BROWSER_CHANNEL||'msedge',headless:true});const results=[];
try {for(const width of [1440,390])for(const kind of ['pro','other-pro','free','expired']){
 const surface=width===390?'mobile':'desktop';const context=await browser.newContext({viewport:{width,height:900}});
 const login=await context.request.post(base+'/api/auth/login/',{data:{email:`in-${kind}-${surface}@example.invalid`,password:'Indiana-local-test-2026!'}});assert.equal(login.status(),200);
 const page=await context.newPage();await page.goto(base+'/indiana/');
 await page.getByRole('button',{name:'Open account menu',exact:true}).click();
 const menu=page.getByRole('menu',{name:'Account menu',exact:true});
 assert.equal(await menu.locator('.badge').innerText(),kind==='pro'?'Pro':'Free plan');
 assert.equal(await menu.locator('a[href*="/pricing/"]').count(),0);
 assert.ok((await menu.getByRole('menuitem',{name:'Study Settings',exact:true}).getAttribute('href')).includes('state=IN'));
 if(kind==='pro')assert.ok(await menu.getByText('Indiana Pro · Active until',{exact:false}).count());
 await page.goto(base+'/dashboard/');
 await page.getByRole('heading',{name:'Topic accuracy',exact:true}).waitFor();
 const plan=await page.locator('.stat').filter({hasText:'Plan'}).locator('b').innerText();assert.equal(plan,kind==='pro'?'Pro':'Free',`${surface} ${kind} IN plan`);
 await page.getByRole('heading',{name:'Indiana practice history',exact:true}).waitFor();
 assert.equal(await page.locator('a[href="/pricing/"]').count(),0,'No unrelated purchase controls');
 const settings=await context.request.get(base+'/api/study-settings/?state=IN');assert.equal(settings.status(),200);
 if(kind==='pro')assert.ok(await page.getByText('Indiana Pro · Active until',{exact:false}).count());
 const continuation=page.getByRole('link',{name:'Continue Practice',exact:true});assert.match(await continuation.getAttribute('href'),/^\/indiana\//);
 results.push({width,kind,plan,state:'IN',accountReturn:true});await context.close();
}fs.writeFileSync('.tools/in-account-results.json',JSON.stringify(results,null,2));console.log('Desktop/mobile IN Dashboard plan/expiry display, purchase suppression and return paths passed');}finally{await browser.close();}
