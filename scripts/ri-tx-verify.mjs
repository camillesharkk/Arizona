import assert from 'node:assert/strict';
import { testLoader } from './pack-test-utils.mjs';

const load = testLoader();
const { freeStateForSlug, isFreeState, freeStateFeatures } = load('lib/free-state-catalog.ts');
const { parseStateCookie, pathState } = load('lib/site-state.ts');
const { LIVE_STATES } = load('lib/ca-site.ts');

for (const [code, slug] of [['RI', 'rhode-island'], ['TX', 'texas']]) {
  assert.equal(isFreeState(code), true, `${code} uses the main site's shared learning architecture`);
  assert.equal(freeStateForSlug(slug)?.[0], code);
  assert.equal(parseStateCookie(code), code);
  assert.equal(pathState(`/${slug}/practice/`), code);
  assert.ok(LIVE_STATES.includes(code));
  assert.equal(freeStateFeatures[code].fullPractice, false, `${code} exposes verified practice formats`);
  assert.equal(freeStateFeatures[code].purchase, false, `${code} checkout awaits validated main-site payment configuration`);
}
console.log('RI/TX main-site identity and independent learning capability gates passed');

let checkoutLookups = 0;
const serverLoad = testLoader({
  '@/lib/session': { getSession: async () => ({ id: 'ri-tx-capability-user' }) },
  '@/lib/commerce': { getCommerceRepo: async () => { checkoutLookups++; throw new Error('Closed checkout reached commerce'); } },
});
const store = serverLoad('lib/store/memory-store.ts').createMemoryStore();
const full = serverLoad('lib/ny-full-submission.ts').savePackFullSubmission;
const checkout = serverLoad('app/api/billing/checkout/route.ts');
for (const state of ['RI', 'TX']) {
  await assert.rejects(full(store, 'ri-tx-capability-user', { state, examId: crypto.randomUUID(), seed: 42,
    questions: [{ questionId: `${state.toLowerCase()}-001`, questionVersion: 1, selected: 'A' }],
  }), /practice_unavailable/);
  const response = await checkout.POST(new Request('http://localhost/api/billing/checkout/', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quoteId: crypto.randomUUID(), sourceState: state }),
  }));
  assert.equal(response.status, 403);
}
assert.equal(checkoutLookups, 0);
assert.equal((await store.listExams('ri-tx-capability-user')).length, 0);
console.log('RI/TX closed full and checkout capabilities reject direct calls without learning or commerce writes');
