import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { testLoader } from './pack-test-utils.mjs';

let store;
let cookie;
let sessionWorks = true;
const load = testLoader({
  '@/lib/store': { getStore: async () => store },
  '@/lib/devices/http': { issueUserSession: async () => ({ ok: sessionWorks }) },
  'next/headers': { cookies: async () => ({ get: () => cookie ? { value: cookie } : undefined }) },
});
store = load('lib/store/memory-store.ts').createMemoryStore();
const user = await store.createUser({ email: 'signup-return@example.invalid', passwordHash: 'isolated', name: null });
const { GET } = load('app/api/auth/verify/route.ts');
const next = '/arkansas/wrong-answers/?attempt=' + randomUUID();
async function verify(returnTo) {
  cookie = returnTo ? encodeURIComponent(returnTo) : undefined;
  const token = randomUUID();
  await store.putToken({ token, type: 'verify', userId: user.id, expiresAt: new Date(Date.now() + 60000).toISOString() });
  return GET(new Request('http://localhost/api/auth/verify/?token=' + token));
}
let response = await verify(next);
assert.equal(response.headers.get('location'), 'http://localhost' + next, 'Email verification returns to the original state and sitting');
sessionWorks = false;
response = await verify(next);
assert.equal(new URL(response.headers.get('location')).searchParams.get('next'), next);
sessionWorks = true;
response = await verify(undefined);
assert.equal(response.headers.get('location'), 'http://localhost/dashboard/');
for (const invalid of ['https://other.invalid/', '//other.invalid/', '/\\other.invalid/']) {
  response = await verify(invalid);
  assert.equal(response.headers.get('location'), 'http://localhost/dashboard/');
}
console.log('Verification preserves the state/sitting return, retains it on sign-in fallback and rejects external redirects');
