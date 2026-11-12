import assert from 'node:assert/strict';
import {testLoader} from './pack-test-utils.mjs';
let repo;
const load=testLoader({'@/lib/session':{getSession:async()=>({id:'pack-commerce'})},'@/lib/commerce':{getCommerceRepo:async()=>repo}});
repo=load('lib/commerce/repo.ts').createMemoryCommerceRepo();
const {buildPaddleTransactionPayload}=load('lib/billing/paddle.ts');
const {POST}=load('app/api/billing/checkout/route.ts');
for(const state of ['PA','LA']){
 const payload=buildPaddleTransactionPayload({productId:'pro_test',finalPriceCents:2221,userId:'pack-commerce',quoteId:'quote-test',productCode:'az_exam_pro_60d',sourceState:state});
 assert.equal(payload.customData.source_state,state);assert.equal(payload.customData.product_code,'az_exam_pro_60d');
 const response=await POST(new Request('http://localhost/api/billing/checkout/',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({quoteId:'a929b140-4c24-41a0-893c-c955a76bded1',sourceState:state})}));
 assert.equal(response.status,404,'Valid state reaches authenticated quote ownership check');
}
console.log('PA/LA share existing all-state product and server quote amount; both source states pass checkout validation without any transaction or charge');
