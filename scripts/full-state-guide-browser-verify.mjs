import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { testLoader } from './pack-test-utils.mjs';

const base = process.env.FULL_STATE_BASE;
assert.ok(base);
const headers = process.env.STATE17_HEADER_FILE ? JSON.parse(fs.readFileSync(process.env.STATE17_HEADER_FILE, 'utf8')) : {};
const load = testLoader();
const { freeStateCatalog } = load('lib/free-state-catalog.ts');
const { packFor } = load('lib/prep-pack.ts');
const { chromium } = await import(pathToFileURL(path.resolve('.tools/browser/node_modules/playwright/index.mjs')));
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const rows = [];
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, extraHTTPHeaders: headers });
    await context.addInitScript(() => sessionStorage.setItem('az_ops_acceptance', '1'));
    const page = await context.newPage();
    for (const [code] of freeStateCatalog.filter(([code]) => !process.env.VERIFY_STATES || process.env.VERIFY_STATES.split(',').includes(code))) {
      const pack = packFor(code);
      await page.goto(base + pack.paths.study, { waitUntil: 'domcontentloaded' });
      const mark = page.getByRole('button', { name: 'Mark chapter read', exact: true });
      await mark.first().waitFor();
      assert.equal(await mark.count(), pack.topics.length);
      assert.equal(await page.getByRole('button', { name: 'Marked read', exact: true }).count(), 0);
      await mark.first().click();
      await page.reload();
      const marked = page.getByRole('button', { name: 'Marked read', exact: true });
      await marked.first().waitFor();
      assert.equal(await marked.count(), 1);
      await marked.first().click();
      await page.reload();
      await mark.first().waitFor();
      assert.equal(await marked.count(), 0);
      assert.equal(await mark.count(), pack.topics.length);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      rows.push({ code, width, guestReadUnreadRefresh: true, chapters: pack.topics.length });
      console.log(JSON.stringify(rows.at(-1)));
      fs.writeFileSync(`.tools/full-state-${process.env.FULL_STATE_STAGE || 'guides'}-guest-guides.json`, JSON.stringify({ base, rows }, null, 2));
    }
    await context.close();
  }
} finally {
  await browser.close();
}
