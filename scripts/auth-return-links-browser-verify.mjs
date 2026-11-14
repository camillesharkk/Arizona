import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const base = process.env.STATE17_BASE || 'http://localhost:3483';
const headers = process.env.STATE17_HEADER_FILE ? JSON.parse(fs.readFileSync(process.env.STATE17_HEADER_FILE, 'utf8')) : {};
const { chromium } = await import(pathToFileURL(path.resolve('.tools/browser/node_modules/playwright/index.mjs')));
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const results = [];
try {
  for (const width of [1440, 390]) for (const slug of (process.env.AUTH_RETURN_SLUGS || 'arkansas,colorado,california').split(',')) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, extraHTTPHeaders: headers });
    const page = await context.newPage();
    const next = `/${slug}/wrong-answers/?attempt=link-acceptance`;
    await page.goto(base + '/login/?next=' + encodeURIComponent(next));
    const create = page.getByRole('link', { name: 'Create account', exact: true });
    await create.waitFor();
    assert.equal(new URL(await create.getAttribute('href'), base).searchParams.get('next'), next);
    await create.click();
    const signIn = page.getByRole('link', { name: 'Already have an account?', exact: true });
    await signIn.waitFor();
    assert.equal(new URL(await signIn.getAttribute('href'), base).searchParams.get('next'), next);
    assert.ok((await context.cookies()).some(cookie => cookie.name === 'np_auth_return'));
    await page.goto(base + '/verify-email/?sent=1&next=' + encodeURIComponent(next));
    const back = page.getByRole('link', { name: 'Back to registration', exact: true });
    assert.equal(new URL(await back.getAttribute('href'), base).searchParams.get('next'), next);
    await page.goto(base + '/register/');
    await page.getByRole('button', { name: 'Create Free Account', exact: true }).waitFor();
    assert.equal((await context.cookies()).some(cookie => cookie.name === 'np_auth_return'), false);
    results.push({ width, slug, loginRegisterReturn: true, verificationBackReturn: true, abandonedReturnCleared: true });
    await context.close();
  }
  fs.writeFileSync(`.tools/state17-${process.env.STATE17_STAGE || 'local'}-auth-links.json`, JSON.stringify({base, results}, null, 2));
  console.log(JSON.stringify(results));
} finally { await browser.close(); }
