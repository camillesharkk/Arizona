import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { testLoader } from './pack-test-utils.mjs';

const base = process.env.STATE17_BASE || 'http://127.0.0.1:3482';
const load = testLoader();
const { freeStateCatalog, freeStatePaths } = load('lib/free-state-catalog.ts');
const { chromium } = await import(pathToFileURL(path.resolve('.tools/browser/node_modules/playwright/index.mjs')));
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const rows = [];
try {
  const directory = await page.goto(base + '/');
  assert.equal(directory.status(), 200);
  for (const [code, , slug] of freeStateCatalog) assert.ok(await page.locator(`a[href="/${slug}/"]`).count() > 0, `${code} directory entry`);
  const xml = await page.goto(base + '/sitemap.xml');
  assert.equal(xml.status(), 200);
  const sitemap = await xml.text();
  assert.equal(sitemap.includes('/preview/'), false);
  for (const [code, name, slug] of freeStateCatalog) {
    const site = freeStatePaths(slug);
    for (const route of [site.home, site.practice, site.study, site.become, site.resources, site.examGuide, site.laws]) {
      assert.ok(sitemap.includes(`https://arizonanotaryprep.com${route}`), `${code} sitemap ${route}`);
      const response = await page.goto(base + route);
      assert.equal(response.status(), 200, route);
      assert.ok((await page.title()).includes(name));
      assert.equal(await page.locator('link[rel="canonical"]').count(), 1);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://arizonanotaryprep.com' + route);
      assert.equal(await page.locator('meta[name="robots"]').count(), 1);
      assert.equal((await page.locator('meta[name="robots"]').getAttribute('content')).includes('noindex'), false, route);
    }
    rows.push({ code, directory: true, pages: 7, canonical: true, indexed: true, sitemap: true });
    console.log(JSON.stringify(rows.at(-1)));
  }
  for (const route of ['/arizona-notary-exam/', '/arizona-notary-practice-test/', '/california/', '/hawaii/', '/new-york/', '/pennsylvania/', '/louisiana/', '/connecticut/', '/indiana/', '/north-carolina/', '/pricing/', '/login/', '/register/']) {
    assert.equal((await page.goto(base + route)).status(), 200, route);
  }
  for (const slug of ['new-york', 'pennsylvania', 'louisiana', 'indiana']) assert.equal((await page.goto(`${base}/preview/${slug}/practice/`)).status(), 404);
  fs.writeFileSync(`.tools/state17-${process.env.STATE17_STAGE || 'production-config'}-pages.json`, JSON.stringify({ base, checkedAt: new Date().toISOString(), rows, existingRoutes: 13, previewIsolation: true }, null, 2));
} finally { await browser.close(); }
