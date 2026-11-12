import assert from 'node:assert/strict';

// Run against the isolated build with VERCEL_ENV=production and STATE_PREVIEW=1.
const base = 'http://127.0.0.1:3312';
for (const state of ['new-york', 'pennsylvania', 'louisiana']) {
  for (const headers of [{}, { RSC: '1', 'Next-Router-Prefetch': '1' }]) {
    const response = await fetch(`${base}/preview/${state}/practice/`, { headers });
    assert.equal(response.status, 404);
    assert.equal(await response.text(), 'Not found');
  }
}
for (const path of ['/arizona-notary-exam/', '/california/', '/hawaii/']) {
  const response = await fetch(base + path);
  assert.equal(response.status, 200, path);
}
const sitemap = await (await fetch(base + '/sitemap.xml')).text();
assert.doesNotMatch(sitemap, /\/preview\//);
console.log('Isolated production HTTP: NY/PA/LA HTML and RSC denied before render; AZ/CA/HI homes return 200; no preview URLs in sitemap');
