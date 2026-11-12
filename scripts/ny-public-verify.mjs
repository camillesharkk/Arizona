import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";
const native = createRequire(import.meta.url);
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (!path.extname(file)) file += fs.existsSync(file + ".ts") ? ".ts" : ".tsx";
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const require = name => {
    if (name === "server-only") return {};
    if (name === "next/navigation") return { notFound() { throw new Error("NOT_FOUND"); }, redirect(url) { throw new Error("REDIRECT:" + url); } };
    if (name === "@/lib/session") return { getSession: async () => null };
    if (name.startsWith("@/")) return load(name.slice(2));
    if (name.startsWith(".")) return load(path.resolve(path.dirname(file), name));
    return native(name);
  };
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  vm.runInNewContext(source, { module, exports: module.exports, require, process, console, Date, Math, URL, structuredClone });
  return module.exports;
}
const previous = process.env.VERCEL_ENV;
process.env.VERCEL_ENV = "production";
try {
  const { stateByCode, availableStates } = load("lib/states.ts");
  assert.equal(stateByCode("NY").status, "available");
  assert.equal(stateByCode("NY").homePath, "/new-york/");
  assert.deepEqual(Array.from(availableStates(), state => state.code).sort(), ["AZ", "CA", "HI", "NY"]);
  const { productionStateBlocked } = load("lib/state-release.ts");
  assert.equal(productionStateBlocked("NY"), false);
  for (const state of ["PA", "LA"]) assert.equal(productionStateBlocked(state), true);
  const { prepPacks } = load("lib/prep-pack.ts");
  assert.equal(prepPacks.NY.available, true);
  for (const [key, value] of Object.entries(prepPacks.NY.paths)) if (key !== "login") assert.ok(value.startsWith("/new-york/"), key);
  for (const code of ["PA", "LA"]) assert.equal(prepPacks[code].available, false);
  const { switchStateHref } = load("lib/ca-site.ts");
  assert.equal(switchStateHref("/california/practice/", "NY"), "/new-york/practice/");
  assert.equal(switchStateHref("/new-york/study-cards/", "HI"), "/hawaii/study-cards/");
  assert.equal(switchStateHref("/new-york/questions/", "AZ"), "/arizona-notary-exam-questions/");
  const { pathState } = load("lib/site-state.ts");
  assert.equal(pathState("/new-york/"), "NY");
  const { nyArticles } = load("data/ny-articles.ts");
  const guides = load("data/ny-guides.ts");
  assert.doesNotMatch(JSON.stringify([nyArticles, guides]), /\/preview\/new-york/);
  const pages = ["", "practice", "questions", "study-guide", "study-cards", "resources", "exam-guide", "passing-score", "laws", "become-a-notary", "pricing", "daily-study", "wrong-answers"];
  for (const feature of pages) {
    const file = `app/new-york/${feature ? feature + "/" : ""}page.tsx`;
    assert.ok(fs.existsSync(file), file);
    const page = load(file);
    assert.equal(typeof page.default, "function", file);
    assert.ok(page.metadata.alternates.canonical.endsWith(`/new-york/${feature ? feature + "/" : ""}`), file);
    assert.equal(page.metadata.robots.index, !["daily-study", "wrong-answers"].includes(feature), file);
  }
  const sitemap = load("app/sitemap.ts").default();
  const urls = sitemap.map(row => new URL(row.url).pathname);
  for (const feature of pages.filter(feature => !["daily-study", "wrong-answers"].includes(feature))) assert.ok(urls.includes(`/new-york/${feature ? feature + "/" : ""}`), feature);
  for (const article of nyArticles) assert.ok(urls.includes(article.path), article.path);
  assert.ok(!urls.some(url => url.startsWith("/preview/")));
  assert.ok(!urls.some(url => /^\/(pennsylvania|louisiana)\//.test(url)));
  console.log("NY public routing, state switching, canonical metadata, internal links, sitemap and PA/LA production isolation passed.");
} finally {
  if (previous === undefined) delete process.env.VERCEL_ENV; else process.env.VERCEL_ENV = previous;
}
