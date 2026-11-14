import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
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

// Isolated callback contract. The Transactions API is mocked and SDK signature verification is real.
// This does not establish remote Paddle sandbox acceptance.
const paddleModule = load('lib/billing/paddle.ts');
const fixtureConfig = {
  apiKey: 'paddle-local-contract-fixture',
  productId: 'pro_main_shared_contract_fixture',
  webhookSecret: 'local-callback-contract-fixture',
  environment: 'sandbox',
};
const sdk = paddleModule.createPaddleSdk(fixtureConfig);
let contractStore;
let contractRepo;
const contractLoad = testLoader({
  '@/lib/store': { getStore: async () => contractStore },
  '@/lib/commerce': { getCommerceRepo: async () => contractRepo },
  '@/lib/billing/lemonsqueezy': { isLemonProvider: () => false },
  '@/lib/billing/paddle': {
    ...paddleModule,
    isPaddleProvider: () => true,
    getPaddleWebhookConfig: () => ({ ok: true, config: fixtureConfig }),
    createPaddleSdk: () => sdk,
    paddleLog: () => undefined,
  },
  '../analytics-server.ts': { reportCheckoutCreate: () => undefined, reportPaddleFulfillment: async () => undefined },
});
contractStore = contractLoad('lib/store/memory-store.ts').createMemoryStore();
contractRepo = contractLoad('lib/commerce/repo.ts').createMemoryCommerceRepo();
const { createQuote } = contractLoad('lib/commerce/service.ts');
const { ensurePaddleCheckout } = contractLoad('lib/billing/paddle-checkout.ts');
const webhook = contractLoad('app/api/billing/webhook/route.ts');
const { hasStatePro } = contractLoad('lib/entitlements.ts');

for (const state of ['RI', 'TX']) {
  const user = await contractStore.createUser({ email: `${state}-callback@example.invalid`, passwordHash: 'isolated', name: null });
  await contractRepo.putUser({ id: user.id, createdAt: new Date().toISOString(), firstPurchaseAt: null });
  const quoted = await createQuote(contractRepo, { userId: user.id, applyCredit: false, policyAccepted: true });
  assert.equal(quoted.ok, true);
  const quote = quoted.quote;
  let transactionCreates = 0;
  let payload;
  const transactionId = `txn_${state.toLowerCase()}maincontract123456`;
  const transactionSdk = { transactions: {
    create: async request => {
      transactionCreates++;
      payload = request;
      return { id: transactionId, checkout: { url: null } };
    },
    list: async function* () {},
  } };
  const checkout = () => ensurePaddleCheckout({ repo: contractRepo, quote, config: fixtureConfig, sourceState: state, sdk: transactionSdk });
  assert.equal((await checkout()).ok, true);
  assert.equal((await checkout()).transactionId, transactionId);
  assert.equal(transactionCreates, 1, `${state} retry reuses the bound transaction`);
  assert.equal(payload.customData.source_state, state);
  assert.equal(payload.customData.product_code, 'az_exam_pro_60d');
  assert.equal(payload.items[0].price.productId, fixtureConfig.productId);
  const event = {
    event_id: `evt_${state.toLowerCase()}contract`,
    notification_id: `ntf_${state.toLowerCase()}contract`,
    event_type: 'transaction.completed',
    occurred_at: new Date().toISOString(),
    data: {
      id: transactionId, status: 'completed', currency_code: 'USD', payments: [],
      custom_data: payload.customData,
      items: [{ quantity: 1, price: { product_id: fixtureConfig.productId, quantity: { minimum: 1, maximum: 1 },
        unit_price: { amount: String(quote.finalPriceCents), currency_code: 'USD' }, billing_cycle: null } }],
      details: { tax_rates_used: [], totals: { discount: '0', subtotal: String(quote.finalPriceCents) },
        line_items: [{ quantity: 1, product: { id: fixtureConfig.productId }, totals: { discount: '0', subtotal: String(quote.finalPriceCents) } }] },
    },
  };
  const raw = JSON.stringify(event);
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = `ts=${timestamp};h1=${createHmac('sha256', fixtureConfig.webhookSecret).update(`${timestamp}:${raw}`).digest('hex')}`;
  const decoded = await sdk.webhooks.unmarshal(raw, fixtureConfig.webhookSecret, signature);
  assert.equal(decoded.data.customData.source_state, state);
  const callback = signatureValue => webhook.POST(new Request('http://localhost/api/billing/webhook/', {
    method: 'POST', headers: { 'paddle-signature': signatureValue }, body: raw,
  }));
  assert.equal((await callback(`ts=${timestamp};h1=${'0'.repeat(64)}`)).status, 401);
  assert.equal((await contractStore.listEntitlements(user.id)).length, 0);
  const first = await callback(signature);
  assert.equal(first.status, 200, `${state} signed callback reaches the real route`);
  assert.equal((await first.json()).duplicate, false);
  const [entitlement] = await contractStore.listEntitlements(user.id);
  assert.equal(entitlement.productCode, 'az_exam_pro_60d');
  assert.equal(entitlement.state, 'ALL');
  assert.equal(Date.parse(entitlement.expiresAt) - Date.parse(entitlement.startsAt), 60 * 86400000);
  for (const covered of ['RI', 'TX', 'CA']) assert.equal(await hasStatePro(user.id, covered), true);
  const repeated = await callback(signature);
  assert.equal(repeated.status, 200);
  assert.equal((await repeated.json()).duplicate, true);
  assert.equal((await contractStore.listEntitlements(user.id)).length, 1);
  assert.equal((await contractStore.listEntitlements(user.id))[0].expiresAt, entitlement.expiresAt);
  const orders = await contractRepo.listOrders(user.id);
  assert.equal(orders.length, 1);
  assert.equal(orders[0].status, 'paid');
  assert.equal(orders[0].entitlementId, entitlement.id);
}
console.log('RI/TX isolated signed webhook routes passed shared-product source attribution, 60-day ALL rights and retry idempotency with a mocked Transactions API');
