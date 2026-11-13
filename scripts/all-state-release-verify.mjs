import assert from 'node:assert/strict';
import {testLoader} from './pack-test-utils.mjs';
const load=testLoader();
const publicMode=process.argv.includes('--public');
const states=['AZ','CA','HI','NY','PA','LA','CT','NC','IN'];
const catalog=load('lib/states.ts');
assert.deepEqual(Array.from(catalog.availableStates(),s=>s.code).sort(),(publicMode ? [...states] : ['AZ','CA','HI','NY','PA','LA']).sort(),'Public catalog must match the selected release mode');
const release=load('lib/state-release.ts');
process.env.VERCEL_ENV='production';
for(const state of states)assert.equal(release.productionStateBlocked(state),!publicMode && ['CT','NC','IN'].includes(state),state+' production access');
const pro=load('lib/state-pro.ts');
const now=new Date();const row={id:'global',state:'ALL',productCode:'az_exam_pro_60d',status:'active',startsAt:new Date(now-86400000).toISOString(),expiresAt:new Date(+now+86400000).toISOString(),provider:'mock',providerOrderId:'global'};
for(const state of publicMode ? states : ['AZ','CA','HI','NY','PA','LA','CT']){assert.equal(pro.stateProCovers([row],state),true,state+' global Pro');assert.equal(pro.stateProCovers([{...row,expiresAt:new Date(now-1).toISOString()}],state),false,state+' expired Pro');}
const packs=load('lib/prep-pack.ts');
for(const state of ['CT','NC','IN']){const p=packs.packFor(state);if(publicMode)assert.ok(p.available,state+' navigation');assert.equal(p.counts().published,203,state+' question count');assert.ok(p.cards.length>=50,state+' independent cards');if(publicMode)assert.equal(p.purchaseEnabled,true,state+' shared purchase');}
console.log(publicMode ? 'Nine-state public release checks passed' : 'Gated candidate: six public states preserved; CT/NC/IN blocked in production; content thresholds passed');
