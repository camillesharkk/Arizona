import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
const base = process.env.RELEASE_BASE_URL || "http://127.0.0.1:3324";
const pages = ["", "practice", "questions", "study-guide", "study-cards", "resources", "exam-guide", "passing-score", "laws", "become-a-notary", "pricing", "wrong-answers"];
for (const feature of pages) {
  const route = `/new-york/${feature ? feature + "/" : ""}`;
  const response = await fetch(base + route, { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, route);
  const html = await response.text();
  assert.doesNotMatch(html, /Under development|This preview is not|Preview only\./, route);
  assert.doesNotMatch(html, /href="\/preview\/new-york/, route);
  const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/);
  assert.ok(canonical, route + " canonical");
  assert.equal(new URL(canonical[1]).pathname, route);
  if (feature !== "wrong-answers") assert.doesNotMatch(html, /name="robots" content="[^"]*noindex/, route);
  if (feature === "study-cards") assert.ok(html.includes('class="study-face"'), route + " renders cards");
}
const articleSource = fs.readFileSync("data/ny-articles.ts", "utf8");
const articleModule = { exports: {} };
vm.runInNewContext(ts.transpileModule(articleSource, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { module: articleModule, exports: articleModule.exports });
for (const article of articleModule.exports.nyArticles) {
  const response = await fetch(base + article.path, { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, article.path);
  const html = await response.text();
  assert.ok(html.includes(article.h1.replaceAll("&", "&amp;").replaceAll("'", "&#x27;")), article.path + " heading");
  assert.doesNotMatch(html, /href="\/preview\/new-york|name="robots" content="[^"]*noindex/, article.path);
}
const daily = await fetch(base + "/new-york/daily-study/", { redirect: "manual", signal: AbortSignal.timeout(30000) });
if (daily.status === 307) {
  assert.ok(daily.headers.get("location").includes(encodeURIComponent("/new-york/daily-study/")));
} else {
  assert.equal(daily.status, 200);
  assert.match(await daily.text(), /<meta id="__next-page-redirect"[^>]*url=\/login\/\?next=%2Fnew-york%2Fdaily-study%2F/);
}
for (const state of ["new-york", "pennsylvania", "louisiana"]) {
  for (const headers of [{}, { RSC: "1", "Next-Router-Prefetch": "1" }]) {
    const response = await fetch(`${base}/preview/${state}/practice/`, { headers, signal: AbortSignal.timeout(30000) });
    assert.equal(response.status, 404);
    assert.equal(await response.text(), "Not found");
  }
}
for (const state of ["pennsylvania", "louisiana"]) assert.equal((await fetch(`${base}/${state}/practice/`)).status, 404);
for (const route of ["/arizona-notary-exam/", "/california/", "/hawaii/", "/california/study-cards/", "/hawaii/study-cards/"]) {
  const response = await fetch(base + route, { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, route);
  if (route.includes("study-cards")) assert.ok((await response.text()).includes('class="study-face"'), route);
}
const sitemap = await (await fetch(base + "/sitemap.xml")).text();
assert.match(sitemap, /\/new-york\/practice\//);
assert.doesNotMatch(sitemap, /\/preview\/|\/pennsylvania\/|\/louisiana\//);
console.log("Production-mode HTTP passed: public NY pages/articles/canonical links/cards, login return, preview HTML/RSC denial, PA/LA closed, AZ/CA/HI regression and sitemap.");
