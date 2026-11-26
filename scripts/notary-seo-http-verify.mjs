import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";

const origin = "https://arizonanotaryprep.com";
const base = process.env.SEO_TEST_BASE || "http://127.0.0.1:3238";
const live = process.env.SEO_INVENTORY_ONLY === "1";
const focus = [
  "/indiana/become-a-notary/", "/new-york/study-guide/", "/new-york/practice/",
  "/ohio/questions/", "/ohio/practice/", "/is-the-arizona-notary-exam-open-book/",
  "/arizona-notary-practice-test/", "/north-carolina/practice/",
];
const aliases = ["/arizona-notary-courses/", "/arizona-notary-training/"];
const missing = ["/pricing/lifetime/", "/unknown-review-location/", "/unknown-review-location/another/", "/unknown/review/location/"];
const parameterPages = ["/arizona-notary-practice-test/?mode=quick", "/new-york/practice/?mode=full", "/ohio/practice/?mode=practice&area=identity"];
const distinct = ["/arizona-notary-practice-test-free/", "/arizona-notary-exam-questions/", "/arizona-notary-exam-prep/"];
const text = value => value?.replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/<[^>]+>/g, "").trim() || "";
function attr(tag, key) {
  return tag?.match(new RegExp(" " + key + '="([^"]*)"'))?.[1] || "";
}
async function inventory(path, sitemap) {
  const first = await fetch(base + path, { redirect: "manual" });
  const response = first.status >= 300 && first.status < 400 ? await fetch(base + path) : first;
  const html = await response.text();
  const tags = html.match(/<(?:meta|link) [^>]+>/g) ?? [];
  const getMeta = key => attr(tags.find(tag => attr(tag, "name") === key || attr(tag, "property") === key), "content");
  const json = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(([,raw]) => {
    try { return JSON.parse(raw); } catch { return null; }
  });
  const headings = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map(match => text(match[1]));
  const canonical = attr(tags.find(tag => attr(tag, "rel") === "canonical"), "href");
  return {
    path, status: first.status, finalStatus: response.status,
    finalPath: new URL(response.url).pathname + new URL(response.url).search,
    title: text(html.match(/<title>(.*?)<\/title>/)?.[1]),
    description: text(getMeta("description")), headings, canonical,
    robots: getMeta("robots"), xRobots: response.headers.get("x-robots-tag"),
    inSitemap: sitemap.has(origin + path), siteName: getMeta("og:site_name"),
    jsonLd: json.length, validJsonLd: json.every(Boolean),
    organization: json.flatMap(row => row?.["@graph"] ?? []).find(row => row["@type"] === "Organization")?.name,
    articleCta: html.includes('mode=quick'),
    visibleSampleCount: (html.match(/<article class="card" style="margin-top:16px">/g) || []).length,
    forbiddenMarketing: /Pass-Rate Comparison|Synthetic demonstration data|Software preparation comparison|Pro access comparison|\+40% relative|\+25% relative/i.test(html),
  };
}

const sitemapResponse = await fetch(base + "/sitemap.xml");
assert.ok(sitemapResponse.ok);
const xml = await sitemapResponse.text();
const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
const sitemap = new Set(urls);
const pricing = [...sitemap].map(url => new URL(url).pathname).filter(path => path.endsWith("/pricing/"));
const sitemapPaths = process.env.SEO_FULL_SITEMAP === "1" ? urls.map(url => new URL(url).pathname) : [];
const targets = [...new Set([...focus, ...sitemapPaths, ...pricing, "/", "/lifetime/", "/contact/", "/courses/", ...aliases, ...missing, ...parameterPages, ...distinct])];
const rows = [];
for (let offset = 0; offset < targets.length; offset += 6) {
  rows.push(...await Promise.all(targets.slice(offset, offset + 6).map(path => inventory(path, sitemap))));
}
if (process.env.SEO_EVIDENCE_FILE) writeFileSync(process.env.SEO_EVIDENCE_FILE, JSON.stringify({ base, sitemapCount: urls.length, rows }, null, 2));
if (live) {
  console.log(`Production inventory recorded for ${rows.length} routes and ${urls.length} sitemap URLs.`);
} else {
  assert.equal(sitemap.size, urls.length);
  for (const url of sitemap) {
    const parsed = new URL(url);
    assert.equal(parsed.origin, origin);
    assert.ok(!parsed.search && !parsed.hash);
    assert.doesNotMatch(parsed.pathname, /^\/(?:account|admin|api|dashboard|preview)(?:\/|$)/);
  }
  for (const row of rows) {
    assert.equal(row.validJsonLd, true, row.path);
    if (row.inSitemap) {
      assert.equal(row.status, 200, row.path);
      assert.equal(new URL(row.canonical).href, origin + row.path, row.path);
      assert.doesNotMatch((row.robots || "") + (row.xRobots || ""), /noindex/i, row.path);
    }
    if (focus.includes(row.path)) {
      assert.ok(row.inSitemap && row.title && row.description && row.headings.length === 1 && row.jsonLd, row.path);
      assert.equal(row.siteName, "Notary Exam Prep", row.path);
      assert.equal(row.organization, "Notary Exam Prep", row.path);
    }
    if (pricing.includes(row.path) || row.path === "/lifetime/") {
      assert.equal(row.forbiddenMarketing, false, row.path);
    }
    if (missing.includes(row.path)) {
      assert.equal(row.status, 404, row.path);
      assert.ok(!row.inSitemap, row.path);
    }
    if (aliases.includes(row.path)) {
      assert.equal(row.status, 308, row.path);
      assert.equal(row.finalPath, "/courses/", row.path);
      assert.ok(!row.inSitemap, row.path);
    }
    if (parameterPages.includes(row.path)) {
      assert.equal(row.status, 200, row.path);
      assert.equal(row.finalPath, row.path);
      assert.equal(row.canonical, origin + row.path.split("?")[0]);
      assert.ok(!row.inSitemap);
    }
    if (row.path === "/contact/") assert.ok(!row.inSitemap && /noindex/.test(row.robots), row.path);
  }
  for (const [path, count] of [["/new-york/practice/", 5], ["/ohio/questions/", 6], ["/north-carolina/practice/", 3]]) {
    assert.equal(rows.find(row => row.path === path).visibleSampleCount, count, path);
  }
  console.log(`Verified ${rows.length} routes, ${pricing.length + 1} purchase entries and ${urls.length} sitemap entries.`);
}
