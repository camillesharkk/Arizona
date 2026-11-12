import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(path.resolve('.tools/browser/node_modules/playwright/index.mjs')));
const base=process.env.PACK_TEST_BASE_URL||'http://127.0.0.1:3413';
const expected={AZ:45,CA:45,HI:50,NY:40,PA:30,LA:40},results=[];
const browser=await chromium.launch({channel:'msedge'});
try{for(const [surface,viewport] of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]){
 const page=await browser.newPage({viewport});
 await page.goto(base+'/preview/pennsylvania/practice/',{waitUntil:'networkidle'});
 for(const [state,label] of [['LA','Louisiana (LA) preview'],['PA','Pennsylvania (PA) preview'],['NY','New York (NY)'],['CA','California (CA)'],['HI','Hawaii (HI)'],['AZ','Arizona (AZ)']]){
  await page.getByRole('button',{name:/Choose state/}).click();await page.getByRole('menuitem',{name:label,exact:true}).click();
  await page.getByRole('button',{name:'Start',exact:true}).nth(1).click();await page.locator('.q-option').first().waitFor();
  await page.getByText(new RegExp(`Question\\s+1\\s+of\\s+${expected[state]}`)).first().waitFor();
  const sitting=await page.evaluate(prefix=>Object.entries(sessionStorage).filter(([key])=>key.startsWith(prefix)).map(([,value])=>JSON.parse(value)),state.toLowerCase()+'-sitting:');
  assert.ok(sitting.some(item=>item.state===state&&item.questionIds.length===expected[state]));results.push({surface,state,singleStart:true,count:expected[state]});
 }
 await page.close();
}}finally{await browser.close();}
fs.writeFileSync('.tools/pack-switch-result.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
