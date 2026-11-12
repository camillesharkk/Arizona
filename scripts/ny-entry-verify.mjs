import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
const native = createRequire(import.meta.url), cache = new Map();
let requestedState='NY', store, user, hookValues = [], hookAt = 0, effects = [], browserFetch, hooksOn = false;
const memory = new Map(), localStorage = { getItem: k => memory.get(k) ?? null, setItem: (k,v) => memory.set(k,v), removeItem:k=>memory.delete(k) };
const react = { useState(initial) { const i=hookAt++; if (!(i in hookValues)) hookValues[i]=typeof initial==='function'?initial():initial; return [hookValues[i], value=>{hookValues[i]=typeof value==='function'?value(hookValues[i]):value;}]; }, useRef: value=>({current:value}), useMemo: fn=>fn(), useEffect: fn=>{if(hooksOn)effects.push(fn);}, useCallback: fn=>fn };
const jsx=(type,props)=>({type,props:props||{}});
function load(file) {
 file=path.resolve(file); if(!path.extname(file)) file+=fs.existsSync(file+'.ts')?'.ts':'.tsx';
 if(cache.has(file))return cache.get(file).exports;
 const module={exports:{}};cache.set(file,module);
 const require=name=>{
  if(name==='react')return react;
  if(name==='react/jsx-runtime')return {jsx,jsxs:jsx,Fragment:'fragment'};
  if(name==='next/link')return {__esModule:true,default:'a'};
  if(name==='next/navigation')return {usePathname:()=>'/new-york/daily-study/',useSearchParams:()=>new URLSearchParams(requestedState?'?state='+requestedState:'')};
  if(name==='@/components/SavedState')return {useSavedState:()=> 'NY',useResolvedState:state=>state};
  if(name==='@/lib/store')return {getStore:async()=>store};
  if(name==='@/lib/session')return {getSession:async()=>user};
  if(name==='@/lib/commerce/usage')return {recordProUsage:async()=>{}};
  if(name==='@/lib/account')return {currentEmail:()=>null};
  if(name==='@/lib/practice-auto-advance')return {usePracticeAutoAdvance:()=>({cancel(){},scheduleAfterCorrect(){}})};
  if(name==='server-only')return {};
  if(name.startsWith('@/'))return load(name.slice(2));
  if(name.startsWith('.'))return load(path.resolve(path.dirname(file),name));
  return native(name);
 };
 const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 vm.runInNewContext(source,{module,exports:module.exports,require,console,process,Date,Math,URL,URLSearchParams,Intl,structuredClone,localStorage,sessionStorage:localStorage,window:{location:{pathname:'/new-york/daily-study/',search:'?state=NY'},dispatchEvent(){},addEventListener(){},removeEventListener(){}},document:{visibilityState:'visible',addEventListener(){},removeEventListener(){}},fetch:(...args)=>browserFetch(...args),crypto:globalThis.crypto,Event,CustomEvent:globalThis.CustomEvent,requestAnimationFrame:()=>{}});
 return module.exports;
}
function render(fn,props={},reset=false){if(reset)hookValues=[];hookAt=0;return fn(props);}
function all(node){if(Array.isArray(node))return node.flatMap(all);if(!node||typeof node!=='object'||!node.props)return [];return [node,...Object.values(node.props||{}).flatMap(v=>Array.isArray(v)?v.flatMap(all):all(v))];}
async function flush(){for(let i=0;i<12;i++)await new Promise(resolve=>setImmediate(resolve));}
function request(route,data){return new Request('http://localhost'+route,{method:data?'POST':'GET',headers:{'content-type':'application/json'},...(data?{body:JSON.stringify(data)}:{})});}
process.env.VERCEL_ENV='production';
store=load('lib/store/memory-store.ts').createMemoryStore();user=await store.createUser({email:'ny-entry@example.invalid',passwordHash:'isolated',name:null});
const {GET,POST}=load('app/api/study-settings/route.ts');
await store.saveStudyPlan({userId:user.id,state:'AZ',document:{sentinel:'do not change'}});
const azBefore=JSON.stringify(await store.getStudyPlan(user.id,'AZ'));
let response=await POST(request('/api/study-settings/?state=NY',{mode:'custom',newQuestions:3,newCards:0,reviewTarget:2,timeZone:'America/New_York'}));assert.equal(response.status,200);
assert.equal(JSON.stringify(await store.getStudyPlan(user.id,'AZ')),azBefore);
assert.equal((await store.getStudyPlan(user.id,'NY')).document.settings.newQuestions,3);
assert.equal((await GET(request('/api/study-settings/?state=NY'))).status,200);
for(const state of ['LA'])for(const handler of [GET,POST])assert.equal((await handler(request('/api/study-settings/?state='+state,handler===POST?{}:undefined))).status,404);
const daily=load('app/api/daily-study/route.ts');response=await daily.GET(request('/api/daily-study/?state=NY&timeZone=America%2FNew_York'));assert.equal(response.status,200);const view=await response.json();assert.equal(view.state,'NY');assert.ok(view.practiceQuestionIds.length);
browserFetch=async url=>{assert.match(url,/api\/daily-study/);return Response.json(view);};
const {DailyStudyClient}=load('components/DailyStudyClient.tsx');hooksOn=true;render(DailyStudyClient,{stateCode:'NY'},true);const dailyEffects=effects;effects=[];for(const effect of dailyEffects)effect();await flush();hooksOn=false;
let tree=render(DailyStudyClient,{stateCode:'NY'});const runners=all(tree).filter(n=>typeof n.type==='function'&&n.type.name==='ExamRunner');assert.ok(runners.length);const practice=runners.find(n=>n.props.sittingMode==='daily-practice');assert.ok(practice.props.preset.length);assert.ok(practice.props.preset.every(q=>q.state==='NY'));
const question=practice.props.preset[0];const progress=load('app/api/progress/route.ts');response=await progress.POST(request('/api/progress/',{questionId:question.question_id,questionVersion:question.version,state:'NY',selected:question.correct_option,attemptId:'daily-real-answer-ny'}));assert.equal(response.status,200);assert.equal((await store.getStat(user.id,question.question_id)).state,'NY');
const {AccountMenu}=load('components/AccountMenu.tsx');tree=render(AccountMenu,{me:{email:user.email,name:null,plan:'free'},stateCode:'NY',onLogout(){}},true);all(tree).find(n=>n.type==='button').props.onClick();tree=render(AccountMenu,{me:{email:user.email,name:null,plan:'free'},stateCode:'NY',onLogout(){}});const hrefs=all(tree).map(n=>n.props.href).filter(Boolean);for(const href of ['/new-york/pricing/','/new-york/wrong-answers/','/account/?state=NY#study-settings'])assert.ok(hrefs.includes(href),href);
const {StudySettings}=load('components/StudySettings.tsx');let settingsCalls=[];browserFetch=async (url,opts)=>{settingsCalls.push(url);return opts?POST(request(url,JSON.parse(opts.body))):GET(request(url));};hooksOn=true;render(StudySettings,{},true);for(const effect of effects.splice(0))effect();await flush();hooksOn=false;tree=render(StudySettings);all(tree).find(n=>n.type==='input'&&n.props.type==='date').props.onChange({target:{value:'2027-01-15'}});await flush();assert.ok(settingsCalls.length>=2);assert.ok(settingsCalls.every(url=>url.includes('state=NY')));
// The generic account route still uses the remembered NY state without a query.
requestedState=''; settingsCalls=[]; hooksOn=true;render(StudySettings,{},true);for(const effect of effects.splice(0))effect();await flush();hooksOn=false;assert.ok(settingsCalls.every(url=>url.includes('state=NY')));requestedState='NY';
// A same-page state query switch hides the old state's form before the new response.
requestedState='CA';hooksOn=true;tree=render(StudySettings);assert.ok(!all(tree).some(n=>n.type==='input'&&n.props.type==='date'));for(const effect of effects.splice(0))effect();await flush();hooksOn=false;tree=render(StudySettings);assert.ok(all(tree).some(n=>n.type==='input'&&n.props.type==='date'));assert.ok(settingsCalls.at(-1).includes('state=CA'));requestedState='NY';
const {QuestionsClient}=load('components/QuestionsClient.tsx');let questionRequests=[];browserFetch=async(url,opts)=>{questionRequests.push([url,opts]);return url.includes('/api/auth/me/')?Response.json({user:{id:user.id,plan:'free'}}):Response.json({ok:true});};
hooksOn=true;render(QuestionsClient,{stateCode:'NY',questions:[question]},true);for(const effect of effects.splice(0))effect();await flush();hooksOn=false;tree=render(QuestionsClient,{stateCode:'NY',questions:[question]});
assert.ok(all(tree).some(n=>n.type==='button'&&JSON.stringify(n.props.children).includes('Appointment')), 'NY topics appear');
const questionNode=all(tree).find(n=>typeof n.type==='function'&&n.type.name==='QuestionBlock');assert.ok(questionNode);questionNode.props.onChoose(questionNode.props.q.correct_option);await flush();
const storage=load('lib/storage.ts');assert.ok(storage.loadProgress('NY').answeredIds.includes(question.question_id));assert.ok(!storage.loadProgress('AZ').answeredIds.includes(question.question_id));assert.equal(storage.loadProgress('NY').lastQuestionId,question.question_id);
assert.equal(JSON.parse(questionRequests.find(([,opts])=>opts)[1].body).state,'NY');
const {SaveForReview}=load('components/SaveForReview.tsx');let hydrate=[];browserFetch=async(url,opts)=>{hydrate.push([url,opts]);if(opts)return Response.json({ok:true,savedForReview:false});return Response.json({mistakes:url.includes('state=NY')?[{questionId:question.question_id,savedForReview:true}]:[]});};hooksOn=true;render(SaveForReview,{questionId:question.question_id},true);for(const effect of effects.splice(0))effect();await flush();hooksOn=false;tree=render(SaveForReview,{questionId:question.question_id});let button=all(tree).find(n=>n.type==='button');assert.equal(button.props['aria-pressed'],true);await button.props.onClick();assert.equal(JSON.parse(hydrate.find(([,opts])=>opts)[1].body).saveForReview,false);
console.log('NY actual settings GET/POST preserve AZ, LA blocked; daily API IDs render NY practice and answer 200; account menu and settings links retain NY; saved review refresh/removal passed.');
