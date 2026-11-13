import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {testLoader} from './pack-test-utils.mjs';

function storage(){const values=new Map();return{get length(){return values.size;},key:index=>[...values.keys()][index]??null,getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};}
const localStorage=storage(),sessionStorage=storage();
const hooks=[],effects=[];
let hook=0,pageUrl='http://localhost/',state;
const jsx=(type,props,key)=>({type,props:props||{},key});
function Runner(){}
const load=testLoader({
  react:{useState(initial){const slot=hook++;if(!(slot in hooks))hooks[slot]=initial;return[hooks[slot],value=>{hooks[slot]=typeof value==='function'?value(hooks[slot]):value;}];},useRef(initial){const slot=hook++;if(!(slot in hooks))hooks[slot]={current:initial};return hooks[slot];},useEffect(fn){effects.push(fn);}},
  'react/jsx-runtime':{jsx,jsxs:jsx,Fragment:'fragment'},'next/link':{__esModule:true,default:'a'},
  'next/navigation':{useSearchParams:()=>new URL(pageUrl).searchParams},
  '@/components/ExamRunner':{ExamRunner:Runner},
  '@/lib/client-account':{fetchAccount:async()=>Response.json({user:{id:'viewer',plan:'free',fullExamCount:1,caFullExamCount:1,hiFullExamCount:1,packFullExamCount:{NY:1,PA:1,LA:1}}})},
},{localStorage,sessionStorage,window:{location:{get search(){return new URL(pageUrl).search;},get href(){return pageUrl;}},history:{replaceState(_state,_title,url){pageUrl=new URL(url,pageUrl).href;}}}});
const {PracticeLaunch}=load('components/PracticeLaunch.tsx');
const {writeSitting}=load('lib/sitting.ts');
const banks={AZ:load('data/questions.ts').publishedQuestions(),CA:load('data/ca-questions.ts').publishedCaQuestions(),HI:load('data/hi-questions.ts').publishedHiQuestions(),NY:load('data/ny-content.ts').publishedNyQuestions(),PA:load('data/pa-content.ts').publishedPaQuestions(),LA:load('data/la-content.ts').publishedLaQuestions()};
const render=()=>{hook=0;return PracticeLaunch({stateCode:state});};
function nodes(node){if(Array.isArray(node))return node.flatMap(nodes);if(!node||!node.props)return[];return[node,...nodes(node.props.children)];}
for(state of Object.keys(banks)){
  for(const legacyStart of [false,...(['AZ','CA','HI'].includes(state)?[true]:[])]){
    hooks.length=0;effects.length=0;
    const question=banks[state][0],id=randomUUID();
    writeSitting(sessionStorage,{version:1,owner:'viewer',state,mode:'full',seed:614,questionIds:[question.question_id],questionVersions:{[question.question_id]:question.version},presentationVersion:2,done:true,examId:id,answers:{},attemptIds:{}});
    pageUrl='http://localhost/practice/?mode=full'+(legacyStart?'&start=1':'&attempt='+id);
    render();effects.splice(0).forEach(effect=>effect());
    for(let turn=0;turn<6;turn++)await new Promise(resolve=>setImmediate(resolve));
    const full=nodes(render()).find(node=>node.type===Runner);
    assert.ok(full,state+' can view its completed result after the trial is used');
    assert.equal(full.props.mode,'full');assert.ok(!new URL(pageUrl).searchParams.has('start'));
    pageUrl='http://localhost/practice/?mode=practice&area=next-topic';
    render();effects.splice(0).forEach(effect=>effect());
    for(let turn=0;turn<6;turn++)await new Promise(resolve=>setImmediate(resolve));
    const topic=nodes(render()).find(node=>node.type===Runner);
    assert.equal(topic.props.mode,'practice');assert.notEqual(topic.key,full.key,'A new topic remounts the sitting component');
  }
  console.log(state+': completed full results bypass only the viewing gate, stale start flag is consumed, and topic practice remounts');
}
