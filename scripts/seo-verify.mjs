import assert from 'node:assert/strict';
import { request } from 'node:http';
import { chapters } from '../data/study-guide.ts';
import { eligibleExamPool } from '../lib/quiz.ts';

const base = process.env.SEO_TEST_BASE || 'http://localhost:3100';
const canonicalBase = process.env.SEO_CANONICAL_BASE || 'https://arizonanotaryprep.com';
const paths = ['/arizona-notary-practice-test/', '/arizona-notary-study-guide/', '/arizona-notary-exam-prep/', '/arizona/new-laws/'];
const reports = [];
const documents = new Map();
const clean = html => html.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
for (const path of paths) {
  const response = await fetch(base + path);
  assert.equal(response.status, 200, path);
  const html = await response.text();
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];
  assert.ok(main, `${path} has an HTML main without executing JavaScript`);
  assert.equal((main.match(/<h1\b/g) || []).length, 1);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)[1];
  assert.equal(canonical, canonicalBase + path, path);
  assert.ok(!/<meta name="robots" content="[^"]*noindex/.test(html));
  documents.set(path, main);
  reports.push({ path, status: response.status, canonical, bodyCharacters: clean(main).length, h1: clean(main.match(/<h1[^>]*>(.*?)<\/h1>/)[1]) });
}
const practice = documents.get(paths[0]);
const pool = eligibleExamPool();
assert.equal(new Set(pool.map(q => q.question_text.trim().toLowerCase())).size, pool.length);
assert.match(clean(practice), new RegExp(`${pool.length} unique questions`));
assert.match(clean(practice), new RegExp(`${pool.filter(q => q.is_free).length} available for free topic practice`));
const decode = text => text.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const sampleTexts = [...practice.replace(/<!--[\s\S]*?-->/g, '').matchAll(/<h3[^>]*>\d+\.\s*([\s\S]*?)<\/h3>/g)].map(match => decode(clean(match[1])).trim());
assert.equal(sampleTexts.length, 6);
for (const text of sampleTexts) {
  const question = pool.find(q => q.question_text === text);
  assert.ok(question?.is_free, `Public sample must be an active free question: ${text}`);
}
assert.match(clean(practice), /No registration or email required/);
assert.equal((practice.match(/Official basis:/g) || []).length, 6);
assert.equal((practice.match(/Answer:/g) || []).length, 6);
const study = documents.get(paths[1]);
assert.equal((study.match(/Worked example:/g) || []).length, chapters.length);
for (const chapter of chapters) {
  assert.ok(chapter.example, chapter.id);
  assert.ok(study.includes(`id="${chapter.id}"`));
  assert.ok(study.includes(`href="/arizona/questions/${chapter.topic}/"`));
}
assert.equal((documents.get(paths[2]).match(/id="step-\d"/g) || []).length, 7);
assert.match(clean(documents.get(paths[3])), /September 12, 2026/);
assert.match(clean(documents.get(paths[3])), /at least seven years/);
const sitemap = await (await fetch(base + '/sitemap.xml')).text();
assert.ok(!sitemap.includes('/arizona-notary-practice-test-free/'));
for (const match of sitemap.matchAll(/<loc>(.*?)<\/loc>/g)) assert.ok(match[1].startsWith(canonicalBase + '/'));
const alias = await (await fetch(base + '/arizona-notary-practice-test-free/')).text();
assert.ok(alias.includes(`rel="canonical" href="${canonicalBase}${paths[0]}"`));
for (const [old, current] of [['/arizona/practice-test/', paths[0]], ['/arizona/study-guide/', paths[1]], ['/arizona/exam-guide/', paths[2]]]) {
  const response = await fetch(base + old, { redirect: 'manual' });
  assert.equal(response.status, 308);
  assert.equal(new URL(response.headers.get('location'), base).pathname, current);
}
// Native HTTP preserves the explicit Host header; Node fetch replaces it.
const www = await new Promise((resolve, reject) => {
  const req = request(base + paths[0], { headers: { Host: 'www.arizonanotaryprep.com' } }, res => {
    res.resume(); resolve({ status: res.statusCode, location: res.headers.location });
  });
  req.on('error', reject); req.end();
});
assert.equal(www.status, 308);
assert.equal(www.location.replace(/\/$/, ''), (canonicalBase + paths[0]).replace(/\/$/, ''));
const robot = await (await fetch(base + '/robots.txt')).text();
assert.ok(robot.includes(`Sitemap: ${canonicalBase}/sitemap.xml`));
const linkedPaths = new Set();
for (const main of documents.values()) for (const match of main.matchAll(/href="(\/[^"?#]*)(?:[?#][^"]*)?"/g)) linkedPaths.add(match[1]);
for (const path of linkedPaths) {
  const response = await fetch(base + path, { redirect: 'manual' });
  assert.equal(response.status, 200, `Internal link should resolve directly: ${path}`);
}
for (const slug of ['effective-date-discipline', 'ron-is-regulated', 'fee-cap-reminders']) {
  const html = await (await fetch(`${base}/arizona/laws/${slug}/`)).text();
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
  assert.ok(!main.includes('Effective 2026-01-01'));
}
console.log(JSON.stringify({ reports, result: 'PASS' }, null, 2));
console.log(`PASS: 4 public HTML pages, 6 public sample answers, ${chapters.length} worked examples, 7 study steps, ${linkedPaths.size} direct internal links, canonical/sitemap/robots/legacy redirects.`);
