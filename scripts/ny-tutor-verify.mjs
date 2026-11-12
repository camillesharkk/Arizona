import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const native = createRequire(import.meta.url);
const cache = new Map();
let user = { id: 'free-test', plan: 'pro' };
let providerCalls = 0;
let prompt = '';
let failProvider = false;
const mockFetch = async (_url, init) => {
  providerCalls++;
  prompt = JSON.stringify(JSON.parse(init.body));
  if (failProvider) throw new TypeError('simulated provider network failure');
  return Response.json({ output: [{ type: 'message', content: [{ type: 'output_text', text: 'New York practice explanation.' }] }] });
};
function load(file) {
  file = path.resolve(file);
  if (!path.extname(file)) file += '.ts';
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const require = name => {
    if (name === 'server-only') return {};
    if (name === '@/lib/store') return { getStore: async () => store };
    if (name === '@/lib/session') return { getSession: async () => user };
    if (name === '@/lib/commerce/usage') return { recordProUsage: async () => undefined };
    if (name.startsWith('@/')) return load(name.slice(2));
    if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name));
    return native(name);
  };
  const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  vm.runInNewContext(compiled, { module, exports: module.exports, require, process, console, Date, URL, Request, Response, Headers, AbortController, AbortSignal, setTimeout, clearTimeout, fetch: mockFetch, structuredClone });
  return module.exports;
}
const store = load('lib/store/memory-store.ts').createMemoryStore();
const { publishedNyQuestions } = load('data/ny-content.ts');
const bank = publishedNyQuestions();
const free = bank.find(q => q.is_free);
const paid = bank.find(q => !q.is_free && q.version === 2);
const { POST } = load('app/api/ai/tutor/route.ts');
const before = { provider: process.env.AI_PROVIDER, key: process.env.DEEPSEEK_API_KEY, vercel: process.env.VERCEL_ENV };
process.env.AI_PROVIDER = 'deepseek';
process.env.DEEPSEEK_API_KEY = 'isolated-test-key';
process.env.VERCEL_ENV = 'preview';
const post = body => POST(new Request('http://localhost/api/ai/tutor/', { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': '127.0.0.71' }, body: JSON.stringify(body) }));
const payload = q => ({ questionId: q.question_id, questionVersion: q.version || 1, state: q.state, mode: 'why-wrong', selected: 'A', options: [q.option_d, q.option_c, q.option_b, q.option_a] });
try {
  let response = await post(payload(free));
  assert.equal(response.status, 200);
  let data = await response.json();
  assert.equal(data.provider, 'deepseek');
  assert.equal(data.used, 1);
  assert.match(prompt, /New York/);
  assert.doesNotMatch(prompt, /Arizona|A\.R\.S\./);
  assert.ok(prompt.includes(free.source_reference));
  assert.ok(prompt.includes('A. ' + free.option_d));
  assert.equal((await post(payload(paid))).status, 402);
  assert.equal((await post({ ...payload(free), state: 'CA' })).status, 400);
  assert.equal((await post({ ...payload(free), options: ['invented', 'text', 'bad', 'choices'] })).status, 400);
  assert.equal((await post({ ...payload(paid), questionVersion: 1 })).status, 409);
  assert.equal(providerCalls, 1, 'Rejected requests never reach the provider');
  const now = Date.now();
  for (const [id, expires] of [['active-test', now + 86400000], ['expired-test', now - 86400000]]) {
    await store.insertEntitlement({ userId: id, productCode: 'az_exam_pro_60d', state: 'ALL', status: 'active', startsAt: new Date(now - 86400000 * 2).toISOString(), expiresAt: new Date(expires).toISOString(), provider: 'mock', providerOrderId: id, providerCustomerId: null });
    user = { id, plan: 'pro' };
    response = await post(payload(paid));
    assert.equal(response.status, id === 'active-test' ? 200 : 402);
    response = await post(payload(free));
    data = await response.json();
    assert.equal(data.limit, id === 'active-test' ? 300 : 75);
  }
  user = null;
  assert.equal((await post(payload(free))).status, 401);
  user = { id: 'failure-test', plan: 'free' };
  failProvider = true;
  data = await (await post(payload(free))).json();
  assert.equal(data.provider, 'grounded-fallback');
  assert.equal(data.fallbackReason, 'network');
  assert.equal(data.used, 1, 'Retain the existing delivered-answer quota rule');
  process.env.VERCEL_ENV = 'production';
  const calls = providerCalls;
  assert.equal((await post(payload(free))).status, 404);
  assert.equal(providerCalls, calls);
  console.log('NY Tutor boundary checks passed with simulated provider responses, shuffled choices, current entitlements, failure attribution and production denial.');
} finally {
  for (const [key, value] of [['AI_PROVIDER', before.provider], ['DEEPSEEK_API_KEY', before.key], ['VERCEL_ENV', before.vercel]]) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
}
