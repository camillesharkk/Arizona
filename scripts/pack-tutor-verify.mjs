import assert from 'node:assert/strict';
import {testLoader,verificationStates} from './pack-test-utils.mjs';
const load=testLoader(),{runTutorTurn,tutorOptionOrder}=load('lib/ai/tutor.ts');
const {prepPacks}=load('lib/prep-pack.ts');
const store=load('lib/store/memory-store.ts').createMemoryStore();
const states=verificationStates(['PA','LA']);
for(const state of states){
 const q=prepPacks[state].questions().find(q=>q.is_free),options=[q.option_c,q.option_a,q.option_b,q.option_d];
 const shown=tutorOptionOrder(q,options);assert.ok(shown);
 let prompt='';
 const response=await runTutorTurn({store,userId:'context-'+state,question:shown,mode:'why-wrong',selected:'A',limit:75,provider:'deepseek',apiKey:'isolated-test-key',fetch:async(_url,init)=>{prompt=init.body;return Response.json({output:[{type:'message',content:[{type:'output_text',text:'Verified state-specific explanation.'}]}]});}});
 assert.equal(response.provider,'deepseek');assert.ok(prompt.includes(prepPacks[state].name));assert.ok(prompt.includes(q.source_reference));assert.doesNotMatch(prompt,/Arizona|A\.R\.S\./);assert.ok(prompt.includes('A. '+q.option_c));
 const fallback=await runTutorTurn({store,userId:'fallback-'+state,question:shown,mode:'explain',limit:75,provider:'deepseek',apiKey:'isolated-test-key',fetch:async()=>{throw new Error('injected provider outage');}});
 assert.equal(fallback.provider,'grounded-fallback');assert.ok(fallback.fallbackReason);assert.ok(fallback.text.length>30);
 assert.equal(tutorOptionOrder(q,['invented','invalid','options','text']),null);
}
console.log(`${states.join('/')} Tutor: correct state/source/shuffled-choice context, no Arizona context, invalid-choice rejection and attributed provider-outage fallback passed`);
