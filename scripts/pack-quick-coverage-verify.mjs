import assert from 'node:assert/strict';
import {testLoader} from './pack-test-utils.mjs';
const {prepPacks}=testLoader()('lib/prep-pack.ts');
for(const state of ['NY','PA','LA']){
 const pack=prepPacks[state],seen=new Set();
 for(let seed=0;seed<500;seed++)for(const question of pack.pickQuick(seed)){
  assert.equal(question.is_free,true);seen.add(question.study_topic);
 }
 for(const topic of pack.topics)assert.ok(seen.has(topic.id),`${state} Quick10 never reaches ${topic.id}`);
 console.log(`${state}: all free topic entries reachable across 500 Quick10 seeds`);
}
