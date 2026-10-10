import { createSign } from 'node:crypto';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const out = 'docs/audits/2026-09-28';
mkdirSync(out, { recursive: true });
const site = 'https://arizonanotaryprep.com';
const paths = ['/arizona-notary-practice-test/', '/arizona-notary-study-guide/', '/arizona-notary-exam-prep/', '/arizona/new-laws/'];
async function post(url, token, body) {
  console.log('Reading', url.includes('index:inspect') ? body.inspectionUrl : body.dimensions);
  let r;
  for (let attempt = 0; attempt < 3; attempt++) {
    try { r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body), signal: AbortSignal.timeout(30000) }); break; }
    catch (error) { if (attempt === 2) throw new Error(error.cause?.code || error.message); }
  }
  if (!r.ok) throw new Error(`Google API HTTP ${r.status}`);
  return r.json();
}
if (process.argv.includes('--gsc')) {
  const account = JSON.parse(readFileSync(join(process.env.USERPROFILE, '.secrets/arizona-ops-readonly.json'), 'utf8'));
  const now = Math.floor(Date.now() / 1000);
  const unsigned = [ { alg: 'RS256', typ: 'JWT' }, { iss: account.client_email, scope: 'https://www.googleapis.com/auth/webmasters.readonly', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 } ].map(x => Buffer.from(JSON.stringify(x)).toString('base64url')).join('.');
  const assertion = unsigned + '.' + createSign('RSA-SHA256').update(unsigned).sign(account.private_key, 'base64url');
  const auth = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }), signal: AbortSignal.timeout(60000) });
  if (!auth.ok) throw new Error(`Google authentication HTTP ${auth.status}`);
  const { access_token: token } = await auth.json();
  const property = 'sc-domain:arizonanotaryprep.com';
  const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`;
  const range = { startDate: '2026-08-28', endDate: '2026-09-25', dataState: 'final', type: 'web', rowLimit: 25000 };
  const pages = await post(endpoint, token, { ...range, dimensions: ['page'] });
  const queries = await post(endpoint, token, { ...range, dimensions: ['page', 'query'] });
  writeFileSync(`${out}/gsc.json`, JSON.stringify({ property, range, pages, queries }, null, 2));
  const inspections = [];
  for (const path of paths) {
    const result = await post('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', token, { siteUrl: property, inspectionUrl: site + path, languageCode: 'en-US' });
    inspections.push({ url: site + path, result: result.inspectionResult });
  }
  const report = { property, range, pages, queries, inspections };
  writeFileSync(`${out}/gsc.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} else {
  const urls = [...paths.map(p => site + p), site + '/arizona-notary-practice-test-free/', site + '/sitemap.xml', site + '/robots.txt', ...['http://arizonanotaryprep.com', 'http://www.arizonanotaryprep.com', 'https://www.arizonanotaryprep.com'].map(s => s + paths[0]), ...['/arizona/practice-test/', '/arizona/study-guide/', '/arizona/exam-guide/'].map(p => site + p)];
  const report = await Promise.all(urls.map(async input => {
    let url = input; const chain = [];
    try { for (let i = 0; i < 8; i++) {
      const r = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(45000) });
      chain.push({ url, status: r.status, location: r.headers.get('location'), robots: r.headers.get('x-robots-tag') });
      if (r.status >= 300 && r.status < 400 && r.headers.get('location')) { url = new URL(r.headers.get('location'), url).href; continue; }
      const html = await r.text();
      const filename = new URL(input).hostname + new URL(input).pathname.replaceAll('/', '_');
      writeFileSync(`${out}/${filename || 'home'}.html`, html);
      const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] || '';
      return { input, chain, title: html.match(/<title>(.*?)<\/title>/)?.[1], canonical: html.match(/<link[^>]+rel="canonical"[^>]+>/)?.[0], main: main.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(), text: main ? undefined : html.slice(0, 6000) };
    }
    return { input, chain, error: 'Too many redirects' };
    } catch (error) { return { input, chain, error: error.cause?.code || error.message }; }
  }));
  writeFileSync(`${out}/live.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
