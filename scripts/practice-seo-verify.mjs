import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { testLoader } from "./pack-test-utils.mjs";

const load = testLoader();
const { prepPacks } = load("lib/prep-pack.ts");
const { drawPractice } = load("lib/practice-draw.ts");
const { publicPracticeSamples, publicPracticeSampleVersions } = load("lib/public-practice-samples.ts");
const { resolveAnswerEvidence } = load("lib/answer-evidence.ts");
const { examStartParams, examCompleteParams } = load("lib/analytics.ts");
const ledger = new Map(readFileSync("docs/question-bank-audit/evidence.jsonl", "utf8")
  .trim().split("\n").map(line => JSON.parse(line)).map(row => [row.id, row]));

for (const state of ["NY", "OH", "NC"]) {
  const samples = publicPracticeSamples(state);
  assert.equal(samples.length, Object.keys(publicPracticeSampleVersions[state]).length);
  assert.ok(samples.length >= (state === "NC" ? 3 : 5) && samples.length <= 6);
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
  if (state === "NC") continue;
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
console.log("Reviewed public NY/OH/NC revisions, official references, AZ topic draws, and state-specific full practice analytics passed.");
