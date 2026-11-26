import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { testLoader } from "./pack-test-utils.mjs";

const load = testLoader();
const { prepPacks } = load("lib/prep-pack.ts");
const { drawPractice } = load("lib/practice-draw.ts");
const { publicPracticeSamples, publicPracticeSampleVersions } = load("lib/public-practice-samples.ts");
const { resolveAnswerEvidence } = load("lib/answer-evidence.ts");
const { examStartParams, examCompleteParams } = load("lib/analytics.ts");
const ledger = new Map(readFileSync("docs/question-bank-audit/evidence.jsonl", "utf8")
  .trim().split("\n").map(line => JSON.parse(line)).map(row => [row.id, row]));

for (const state of ["NY", "OH"]) {
  const samples = publicPracticeSamples(state);
  assert.equal(samples.length, Object.keys(publicPracticeSampleVersions[state]).length);
  assert.ok(samples.length >= 5 && samples.length <= 10);
  assert.equal(new Set(samples.map(row => row.moreHref)).size, samples.length);
  for (const sample of samples) {
    const question = prepPacks[state].questions().find(row => row.question_id === sample.question_id);
    assert.ok(question?.is_free);
    assert.equal(question.state, state);
    assert.ok(Object.values(sample.optionFeedback).every(value => value.trim()));
    assert.ok(resolveAnswerEvidence(sample).href?.startsWith("https://"));
    const review = ledger.get(sample.question_id);
    assert.match(review.status, /^verified_/);
    assert.equal(review.version, question.version);
    const fingerprint = createHash("sha256").update(JSON.stringify([
      question.state, question.question_id, question.version, question.question_text, question.scenario_text,
      ...["A", "B", "C", "D"].map(letter => [question[`option_${letter.toLowerCase()}`], question.option_feedback?.[letter]]),
      question.correct_option, question.explanation, question.source_id, question.source_reference,
      question.effective_from, question.topic, question.study_topic, question.is_free,
    ])).digest("hex");
    assert.equal(review.contentSha256, fingerprint, sample.question_id);
  }
  const start = examStartParams({ mode: "full", questionCount: prepPacks[state].fullCount, plan: "free", state });
  const complete = examCompleteParams({ ...start, mode: "full", questionCount: start.question_count, answeredCount: 40, score: 90, passed: false });
  assert.equal(start.mode, "full40");
  assert.equal(complete.mode, "full40");
  assert.equal(complete.state, state);
}

for (const focusArea of ["acknowledgments", "identification"]) {
  const result = drawPractice({ state: "AZ", seed: 12, isPro: false, mode: "practice", focusArea });
  assert.ok(result.questions.length > 0 && result.questions.length <= 10);
  assert.ok(result.questions.every(question => question.topic === focusArea && question.state === "AZ" && question.is_free));
}
console.log("Reviewed public NY/OH revisions, official references, AZ topic draws, and state-specific full practice analytics passed.");

if (process.env.PRACTICE_SEO_BASE) {
  const base = process.env.PRACTICE_SEO_BASE.replace(/\/$/, "");
  const dist = join(process.env.NEXT_DIST_DIR || ".next", "static");
  const bundles = readdirSync(dist, { recursive: true }).filter(file => file.endsWith(".js"))
    .map(file => readFileSync(join(dist, file), "utf8"));
  assert.ok(bundles.length);
  const ohio = load("data/full-state-server.ts").serverStateQuestions("OH");
  for (const [state, bank] of [["NY", prepPacks.NY.questions()], ["OH", ohio]]) {
    const approved = publicPracticeSampleVersions[state];
    const protectedStems = bank.filter(question => !Object.hasOwn(approved, question.question_id));
    assert.ok(protectedStems.length > 0);
    for (const question of protectedStems) {
      assert.ok(!bundles.some(bundle => bundle.includes(question.question_text)),
        `${question.question_id} is present in a client chunk`);
    }
    for (const headers of [{}, { RSC: "1" }]) {
      const response = await fetch(base + prepPacks[state].paths.practice, { headers });
      assert.equal(response.status, 200);
      const markup = await response.text();
      assert.ok(!markup.includes("previous_versions"));
      for (const question of protectedStems) {
        assert.ok(!markup.includes(question.question_text), `${question.question_id} is present in the practice response`);
      }
    }
    console.log(`${state}: inspected HTML, RSC and ${bundles.length} client chunks for ${protectedStems.length} non-sample questions.`);
  }
}
