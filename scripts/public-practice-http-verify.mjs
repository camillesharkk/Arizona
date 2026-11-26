import assert from "node:assert/strict";

const base = process.env.PACK_TEST_BASE_URL;
assert.ok(base, "Set PACK_TEST_BASE_URL to the running isolated preview.");
const origin = "https://arizonanotaryprep.com";
const ohioRobots = process.argv.includes("--vercel-preview") ? "noindex, follow" : "index, follow";

async function read(path) {
  const response = await fetch(new URL(path, base), { redirect: "manual" });
  if (path === "/preview/new-york/practice/" && !process.argv.includes("--vercel-preview")) {
    assert.equal(response.status, 404, "Production blocks the internal preview route");
    return "";
  }
  assert.equal(response.status, 200, path);
  return (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}

function verifyMetadata(html, path, title, robots = "index, follow") {
  assert.deepEqual(Array.from(html.matchAll(/<title>([^<]+)<\/title>/g), match => match[1]), [title]);
  assert.deepEqual(Array.from(html.matchAll(/<meta name="robots" content="([^"]+)"/g), match => match[1]), [robots]);
  if (path) {
    assert.deepEqual(Array.from(html.matchAll(/<link rel="canonical" href="([^"]+)"/g), match => match[1]), [origin + path]);
  }
}

const paths = {
  az: "/arizona-notary-practice-test/",
  in: "/indiana/become-a-notary/",
  ohQuestions: "/ohio/questions/",
  ohPractice: "/ohio/practice/",
  nyPractice: "/new-york/practice/",
  nyPreview: "/preview/new-york/practice/",
  nyStudy: "/new-york/study-guide/",
};
const [az, indiana, ohioQuestions, ohioPractice, nyPractice, nyPreview, nyStudy, sitemap] = await Promise.all(
  [...Object.values(paths), "/sitemap.xml"].map(read)
);

verifyMetadata(az, paths.az, "Arizona Notary Practice Test | Free Quick 10 &amp; Full 45");
assert.match(az, /<h1>Arizona Notary Practice Test<\/h1>/);
assert.match(az, /Arizona Secretary of State exam notice/);
const legacy = await fetch(new URL("/arizona/practice-test/?mode=quick", base), { redirect: "manual" });
assert.equal(legacy.status, 308);
assert.equal(new URL(legacy.headers.get("location"), base).pathname, paths.az);
assert.equal(new URL(legacy.headers.get("location"), base).searchParams.get("mode"), "quick");

verifyMetadata(indiana, paths.in, "How to Become a Notary in Indiana | Application, Course &amp; Exam");
const examStep = indiana.match(/id="course-exam">[\s\S]+?<\/section>/)?.[0];
assert.match(examStep, /href="\/indiana\/practice\/\?mode=quick"/);
assert.match(indiana, /id="apply">[\s\S]+?href="https:\/\/apphub\.notary\.sos\.in\.gov\/"[\s\S]+?id="course-exam"[\s\S]+?id="appointment"/);

verifyMetadata(ohioQuestions, paths.ohQuestions, "Ohio Notary Questions &amp; Answers | Original Examples", ohioRobots);
assert.match(ohioQuestions, /<h1>Ohio Notary Questions and Answers<\/h1>/);
assert.equal((ohioQuestions.match(/<strong>Answer:/g) || []).length, 6, "Ohio questions SSR samples");
assert.match(ohioQuestions, /href="\/ohio\/practice\//);
assert.match(ohioQuestions, /https:\/\/codes\.ohio\.gov\/ohio-revised-code\/section-147\.141/);

verifyMetadata(ohioPractice, paths.ohPractice, "Ohio Notary Practice Test | Free Questions &amp; Explanations", ohioRobots);
assert.match(ohioPractice, /<h1>Ohio Notary Practice Test<\/h1>/);
assert.doesNotMatch(ohioPractice, /<strong>Answer:/);
assert.match(ohioPractice, /href="\/ohio\/questions\/#sample-questions"/);

verifyMetadata(nyPractice, paths.nyPractice, "Free New York Notary Practice Test | Questions &amp; Explanations");
assert.match(nyPractice, /<h1>New York Notary Practice Test<\/h1>/);
assert.equal((nyPractice.match(/<strong>Answer:/g) || []).length, 5, "New York practice SSR samples");
assert.match(nyPractice, /https:\/\/dos\.ny\.gov\/july-december-2026-notary-written-exam-info-and-schedule/);
for (const id of ["exam-day", "appointment", "fees", "journal", "electronic"]) {
  assert.ok(nyPractice.includes(`href="${paths.nyStudy}#${id}"`), id);
  assert.ok(nyStudy.includes(`id="${id}"`), id);
}
if (nyPreview) assert.deepEqual(Array.from(nyPreview.matchAll(/<meta name="robots" content="([^"]+)"/g), match => match[1]), ["noindex, nofollow"]);
assert.doesNotMatch(nyPreview, /<strong>Answer:/);

for (const path of [paths.az, paths.in, paths.ohQuestions, paths.ohPractice, paths.nyPractice]) {
  assert.ok(sitemap.includes(`<loc>${origin}${path}</loc>`), path);
}
assert.ok(!sitemap.includes(paths.nyPreview));

console.log("AZ, IN, Ohio Questions, Ohio Practice and NY public SSR, metadata, preview robots and sitemap passed.");
