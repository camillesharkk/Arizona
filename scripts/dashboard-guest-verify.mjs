import assert from 'node:assert/strict';
import { testLoader } from './pack-test-utils.mjs';

const hooks = [], effects = [];
let index = 0, finishImport, reads = 0;
const imported = new Promise(resolve=>{finishImport=resolve;});
const jsx = (type,props)=>({type,props:props||{}});
const react = {
  useState(initial) { const slot=index++; if(!(slot in hooks))hooks[slot]=initial; return [hooks[slot],value=>{hooks[slot]=typeof value==='function'?value(hooks[slot]):value;}]; },
  useRef(value) { return {current:value}; }, useCallback(fn) { return fn; }, useEffect(fn) { effects.push(fn); },
};
const load = testLoader({
  react, 'react/jsx-runtime':{jsx,jsxs:jsx}, 'next/link':{__esModule:true,default:'a'},
  '@/components/SavedState':{useSavedState:()=> 'NY',useResolvedState:()=> 'NY'},
  '@/components/WrongAnswersLink':{WrongAnswersLink:'a'},
  '@/lib/ca-sync':{syncGuestProgress:()=>imported},
}, {window:{location:{search:''}},fetch:async()=>{reads++;return Response.json({user:{id:'one',streakDays:1},stats:[],exams:[]});}});
const { DashboardClient } = load('components/DashboardClient.tsx');
DashboardClient();
effects.splice(0).forEach(effect=>effect());
await new Promise(resolve=>setImmediate(resolve));
assert.equal(reads,0,'The default post-login dashboard waits for pending guest imports');
finishImport([{ok:true,pending:false}]);
for(let turn=0;turn<5;turn++)await new Promise(resolve=>setImmediate(resolve));
assert.equal(reads,1,'Read the dashboard after the imported answers and history are committed');
index=0;
const rendered = DashboardClient();
assert.match(JSON.stringify(rendered),/Answers/);
console.log('Default post-login dashboard waits for guest import before reading its progress');
