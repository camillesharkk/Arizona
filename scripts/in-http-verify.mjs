import assert from 'node:assert/strict';
import fs from 'node:fs';
import {testLoader} from './pack-test-utils.mjs';
const base=process.env.IN_TEST_BASE||'http://127.0.0.1:3420';
assert.match(base,/^http:\/\/(127\.0\.0\.1|localhost):/);
const production=process.argv.includes('--production-gates');
const load=testLoader();const {inPaths}=load('lib/in-site.ts');const reports=[];
for(const route of Object.values(inPaths).filter(path=>path.startsWith('/indiana/'))) {
 const response=await fetch(base+route,{redirect:'manual'});const html=await response.text();
 if(!production&&route===inPaths.daily){assert.ok(response.status===307||(response.status===200&&html.includes('NEXT_REDIRECT')),route+' sign-in redirect');reports.push({route,status:response.status,signIn:true});continue;}
 assert.equal(response.status,production?404:200,route);
 if(!production&&response.status===200){assert.match(html,/noindex/,route+' noindex');if(route!==inPaths.pricing)assert.ok(html.includes(`https://arizonanotaryprep.com${route}`),route+' canonical');assert.doesNotMatch(html,/href="\/indiana\/pricing\/"[^>]*>(?:Unlock|Upgrade|View Pro)/);}
 if(!production&&[inPaths.study,inPaths.become,inPaths.resources].includes(route))for(const step of ['prepare','apply','course-exam','appointment'])assert.ok(html.includes(`id="${step}"`),route+' four-step guide');
 reports.push({route,status:response.status});
}
const sitemap=await (await fetch(base+'/sitemap.xml')).text();assert.doesNotMatch(sitemap,/\/indiana\//);assert.match(sitemap,/arizona-notary-exam/);
const root=await (await fetch(base+'/')).text();if(production)assert.doesNotMatch(root,/href="\/indiana\/"[^>]*>[\s\S]{0,200}Available/);
if(production) {
 for(const route of ['/api/indiana/questions/','/api/indiana/sitting/'])assert.equal((await fetch(base+route)).status,404);
 for(const route of ['/indiana/','/indiana/practice/','/preview/indiana/'])assert.equal((await fetch(base+route,{headers:{RSC:'1'}})).status,404);
}else {
 assert.equal((await fetch(base+'/preview/indiana/practice/',{redirect:'manual'})).status,307);
 const publicBank=await (await fetch(base+'/api/indiana/questions/')).json();assert.equal(publicBank.questions.length,60);assert.ok(publicBank.questions.every(q=>q.is_free&&q.status==='published'&&q.state==='IN'));
}
fs.mkdirSync('.tools',{recursive:true});fs.writeFileSync(`.tools/in-http-${production?'production':'preview'}.json`,JSON.stringify({reports,sitemap:'Indiana absent',production},null,2));
console.log(`${production?'Production gates':'Preview routes'}: ${reports.length} routes, canonicals/noindex and sitemap checks passed`);
