import assert from 'node:assert/strict';
import { testLoader } from './pack-test-utils.mjs';
const load=testLoader();
const {indianaReference,indianaWeakTopics}=load('lib/in-site.ts');
assert.equal(indianaReference(23).atReference,false); assert.equal(indianaReference(23).gap,1);
assert.equal(indianaReference(24).atReference,true); assert.equal(indianaReference(24).percentage,80);
assert.equal(indianaWeakTopics([{id:'a',right:0,total:1}]).length,0,'One observation cannot establish weak topic');
assert.deepEqual([...indianaWeakTopics([{id:'a',right:0,total:2},{id:'b',right:1,total:2},{id:'c',right:0,total:2}])].map(t=>t.id),['a','c']);
console.log('Indiana score boundaries and weak-topic evidence passed');
