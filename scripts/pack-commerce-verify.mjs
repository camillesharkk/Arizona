import assert from 'node:assert/strict';
import {testLoader} from './pack-test-utils.mjs';
let repo;
let repoReads = 0;
const load = testLoader({
  '@/lib/session': { getSession: async () => ({ id: 'pack-commerce' }) },
  '@/lib/commerce': { getCommerceRepo: async () => {
    repoReads++;
    return repo;
  } },
});
repo=load('lib/commerce/repo.ts').createMemoryCommerceRepo();
const {buildPaddleTransactionPayload}=load('lib/billing/paddle.ts');
const {POST}=load('app/api/billing/checkout/route.ts');
const { freeStateCatalog, freeStateFeatures } = load('lib/free-state-catalog.ts');
const states = ['PA', 'LA', ...freeStateCatalog.map(([code]) => code)];
for(const state of states){
 const payload=buildPaddleTransactionPayload({productId:'pro_test',finalPriceCents:2221,userId:'pack-commerce',quoteId:'quote-test',productCode:'az_exam_pro_60d',sourceState:state});
 assert.equal(payload.customData.source_state,state);assert.equal(payload.customData.product_code,'az_exam_pro_60d');
 const beforeReads = repoReads;
 const response=await POST(new Request('http://localhost/api/billing/checkout/',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({quoteId:'a929b140-4c24-41a0-893c-c955a76bded1',sourceState:state})}));
 const disabled = freeStateFeatures[state]?.purchase === false;
 assert.equal(response.status, disabled ? 403 : 404, `${state} respects purchase acceptance before quote lookup`);
 assert.equal(repoReads - beforeReads, disabled ? 0 : 1, `${state} closed purchasing never reads commerce`);
}
console.log(`${states.length} state attributions retain the shared product and accepted checkout gates without transactions or charges`);
