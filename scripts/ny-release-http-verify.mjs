import assert from 'node:assert/strict';

// Run against the isolated build with VERCEL_ENV=production and STATE_PREVIEW=1.
const base = process.env.RELEASE_BASE_URL || 'http://127.0.0.1:3312';
for (const state of ['new-york', 'pennsylvania', 'louisiana']) {
  for (const headers of [{}, { RSC: '1', 'Next-Router-Prefetch': '1' }]) {
    const response = await fetch(`${base}/preview/${state}/practice/`, { headers, signal: AbortSignal.timeout(30000) });
    assert.equal(response.status, 404);
    assert.equal(await response.text(), 'Not found');
  }
}
for (const path of ['/arizona-notary-exam/', '/california/', '/hawaii/', '/california/study-cards/', '/hawaii/study-cards/', '/new-york/', '/new-york/practice/', '/new-york/questions/', '/new-york/study-cards/', '/new-york/pricing/']) {
  const response = await fetch(base + path, { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, path);
  const html = await response.text();
  if (path.includes('study-cards')) assert.ok(html.includes('class="study-face"'), path + ' must render its study cards');
}
const sitemap = await (await fetch(base + '/sitemap.xml', { signal: AbortSignal.timeout(30000) })).text();
assert.doesNotMatch(sitemap, /\/preview\//);
assert.match(sitemap, /\/new-york\/practice\//);
assert.match(sitemap, /\/pennsylvania\//);
assert.match(sitemap, /\/louisiana\//);
console.log('Production HTTP: preview HTML/RSC denied; existing public routes and study cards render; NY/PA/LA remain public in sitemap');
