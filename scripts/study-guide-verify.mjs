import assert from "node:assert/strict";
import { testLoader } from "./pack-test-utils.mjs";

const values = new Map();
const localStorage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
};
const load = testLoader({}, { window: new EventTarget(), localStorage, Event });
const { loadProgress, saveProgress } = load("lib/storage.ts");
localStorage.setItem("az-notary-session", "stale-legacy@example.invalid");
localStorage.setItem("az-notary-progress", JSON.stringify({ chapterReads: ["commission"] }));
assert.equal(loadProgress("AZ", null).chapterReads[0], "commission", "AZ guest history keeps its original key");
for (const state of ["AZ", "NY", "PA", "LA", "CT", "NC", "IN"]) {
  saveProgress({ chapterReads: ["account-a-chapter"] }, state, "account-a@example.invalid");
  assert.equal(loadProgress(state, "account-b@example.invalid").chapterReads.length, 0, `${state} isolates accounts`);
  assert.ok(!loadProgress(state, null).chapterReads.includes("account-a-chapter"), `${state} isolates guests`);
  assert.equal(loadProgress(state, "account-a@example.invalid").chapterReads[0], "account-a-chapter", `${state} persists the explicit account`);
}
saveProgress({ chapterReads: ["ny-only"] }, "NY", "account-a@example.invalid");
assert.equal(loadProgress("PA", "account-a@example.invalid").chapterReads[0], "account-a-chapter", "states stay isolated");
saveProgress({ chapterReads: [] }, "NY", "account-a@example.invalid");
assert.equal(loadProgress("NY", "account-a@example.invalid").chapterReads.length, 0, "unmarking persists");
console.log("Guide progress: real-account keys, guest/state isolation, unmarking and legacy AZ history passed");

const { prepPacks } = load("lib/prep-pack.ts");
const { prepGuideTopics } = load("data/prep-study-guide.ts");
const { freeStateContent } = load('data/free-state-content.ts');
for (const pack of Object.values(prepPacks)) {
  for (const topic of pack.topics) {
    if (pack.freeLaunch) {
      const content = freeStateContent[pack.code];
      assert.ok(content.topics.some(item => item.id === topic.id));
      const rules = content.questions.filter(question => question.studyTopic === topic.id);
      assert.ok(rules.length > 0);
      assert.ok(rules.every(question => question.explanation.length > 20 && content.sources.some(source => source.id === question.sourceId)), `${pack.code}/${topic.id} has sourced rules and scenarios`);
      continue;
    }
    assert.ok(prepGuideTopics[pack.code]?.[topic.id]?.example.body || (["CT","NC","IN"].includes(pack.code) && pack.questions().some(q=>q.study_topic===topic.id && q.explanation.length>40)), `${pack.code}/${topic.id} has authored material`);
    assert.ok(pack.cards.some((card) => card.study === topic.id), `${pack.code}/${topic.id} has reviewed concepts`);
    assert.ok(pack.questions().some((question) => question.study_topic === topic.id), `${pack.code}/${topic.id} has topic questions`);
  }
}

const base = process.env.GUIDE_TEST_BASE_URL || "http://127.0.0.1:35373";
for (const slug of ["arizona", "new-york", "pennsylvania", "louisiana", "connecticut", "north-carolina", "indiana"]) {
  const response = await fetch(`${base}/${slug}/study-guide/`);
  assert.equal(response.status, 200, `${slug} guide loads`);
  const html = await response.text();
  for (const label of ["Chapters", "Exam checklist", "Mark chapter read", "Worked example", "Key facts", "Official source:", "Practice This Topic", "Study this topic", "Review wrong answers", "Explore Pro"]) {
    assert.ok(html.includes(label), `${slug} guide includes ${label}`);
  }
  const articles = [...html.matchAll(/<article\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g)];
  assert.ok(articles.length >= 5, `${slug} has full chapters`);
  for (const [, id, body] of articles) {
    assert.ok(html.includes(`href="#${id}"`), `${slug}/${id} is in the chapter directory`);
    assert.ok((body.match(/<h3>/g) || []).length >= 4, `${slug}/${id} has sections, example and facts`);
    assert.ok(body.includes("Official source:"), `${slug}/${id} has a source`);
    if (slug !== "arizona") {
      assert.ok(!body.includes("/arizona"), `${slug}/${id} keeps learning links in its state`);
      assert.ok(body.includes(`/${slug}/practice/?mode=practice`), `${slug}/${id} links to topic practice`);
      assert.ok(body.includes(`/${slug}/study-cards/?topic=`), `${slug}/${id} links to topic cards`);
      assert.ok(body.includes(`/${slug}/wrong-answers/?topic=`), `${slug}/${id} links to topic mistakes`);
    }
  }
  console.log(`${slug}: ${articles.length} complete chapters and AZ feature parity passed`);
}
