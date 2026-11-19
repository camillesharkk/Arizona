import { registerHooks } from "node:module";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

// Resolve the application's TS aliases and extensionless imports for this read-only audit.
const root = fileURLToPath(new URL("../", import.meta.url));
registerHooks({ resolve(specifier, context, nextResolve) {
  let target = specifier.startsWith("@/") ? path.join(root, specifier.slice(2)) : specifier.startsWith(".") && context.parentURL ? fileURLToPath(new URL(specifier, context.parentURL)) : null;
  if (target && !path.extname(target) && existsSync(`${target}.ts`)) target += ".ts";
  return nextResolve(target ? pathToFileURL(target).href : specifier, context);
} });
const { sources } = await import("../data/sources.ts");
const { resolveAnswerEvidence } = await import("../lib/answer-evidence.ts");
const { availableStates } = await import("../lib/states.ts");
const { questionReviewTimestamps } = await import("../data/question-review-dates.ts");
const banks = [["questions", "historicalAzQuestions"], ["ca-questions", "publishedCaQuestions"], ["hi-questions", "publishedHiQuestions"], ["in-questions", "publishedInQuestions"], ...["pa", "ny", "la", "ct", "nc"].map(code => [`${code}-content`, `published${code[0].toUpperCase()}${code[1]}Questions`])];
const questions = [];
for (const [file, name] of banks) questions.push(...(await import(`../data/${file}.ts`))[name]());
const { freeStateCatalog } = await import("../lib/free-state-catalog.ts");
const { freeStateContent } = await import("../data/free-state-content.ts");
const { fullStateSummary } = await import("../data/full-state-summary.ts");
const { stateQuestion } = await import("../lib/state-question.ts");
for (const [code] of freeStateCatalog) {
  const full = JSON.parse(readFileSync(path.join(root, "data/full-states", `${code}.json`), "utf8"));
  const freeIds = new Set(fullStateSummary[code]?.freeQuestionIds ?? freeStateContent[code].questions.map(question => question.id));
  questions.push(...[...freeStateContent[code].questions, ...full.questions].map(question => stateQuestion(code, question, freeIds.has(question.id))));
}
const byState = {};
const missing = [];
const publishedStates = new Set(availableStates().map(state => state.code));
const byResolution = {};
const urls = new Map();
const questionKeys = new Set();
const usedSources = new Set();
const inventory = [];
for (const question of questions) {
  if (!publishedStates.has(question.state)) continue;
  const key = `${question.state}:${question.question_id}`;
  if (questionKeys.has(key)) throw new Error(`Duplicate published question: ${key}`);
  questionKeys.add(key);
  const source = sources[question.source_id];
  usedSources.add(question.source_id);
  const state = byState[question.state] ??= { questions: 0, missing: 0, oldestQuestionVerification: question.last_verified_at, newestQuestionVerification: question.last_verified_at };
  state.questions++;
  state.oldestQuestionVerification = [state.oldestQuestionVerification, question.last_verified_at].sort()[0];
  state.newestQuestionVerification = [state.newestQuestionVerification, question.last_verified_at].sort().at(-1);
  const evidence = resolveAnswerEvidence(question);
  const evidenceUrls = [evidence.href, ...evidence.additional].filter(Boolean);
  const issues = [];
  if (!source) issues.push("source ID is absent from registry");
  if (!evidence.href) issues.push("official URL unavailable");
  if (!question.source_reference?.trim()) issues.push("question citation unavailable");
  const letters = ["A", "B", "C", "D"].filter(letter => question[`option_${letter.toLowerCase()}`]?.trim());
  if (!letters.includes(question.correct_option)) issues.push("key does not name an available option");
  if (!question.question_text?.trim() || !question.explanation?.trim()) issues.push("stem or explanation unavailable");
  if (letters.some(letter => !question.option_feedback?.[letter]?.trim())) issues.push("option feedback unavailable");
  const date = new Date(question.last_verified_at);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(question.last_verified_at || "") ||
      !Number.isFinite(date.valueOf()) || date.toISOString().slice(0, 10) !== question.last_verified_at) {
    issues.push("real verification date unavailable");
  }
  if (issues.length) {
    state.missing++;
    missing.push({ questionId: question.question_id, sourceId: question.source_id, issues });
  }
  byResolution[evidence.resolution] = (byResolution[evidence.resolution] || 0) + 1;
  for (const url of evidenceUrls) {
    const list = urls.get(url) || [];
    list.push(question.question_id);
    urls.set(url, list);
  }
  inventory.push({
    state: question.state, id: question.question_id, tier: question.is_free ? "free" : "pro",
    topic: question.study_topic ?? question.topic, version: question.version,
    publishedWindowEnd: question.effective_to,
    sourceId: question.source_id, citation: question.source_reference, evidenceUrls,
    sourceVersion: source?.version ?? null, displayedVerificationDate: question.last_verified_at,
    contentSha256: createHash("sha256").update(JSON.stringify([
      question.state, question.question_id, question.version, question.question_text, question.scenario_text,
      ...["A", "B", "C", "D"].map(letter => [question[`option_${letter.toLowerCase()}`], question.option_feedback?.[letter]]),
      question.correct_option, question.explanation, question.source_id, question.source_reference,
      question.effective_from, question.topic, question.study_topic, question.is_free,
    ])).digest("hex"),
    reviewedAt: questionReviewTimestamps.get(question.question_id) ?? null, structuralIssues: issues,
  });
}
const report = {
  states: Object.keys(byState).length,
  questions: questionKeys.size,
  byState,
  missing,
  usedSourceCount: usedSources.size,
  distinctEvidenceLinks: urls.size,
  byResolution,
};
if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify([...urls], null, 2));
if (process.argv[3]) writeFileSync(process.argv[3], inventory.map(row => JSON.stringify(row)).join("\n") + "\n");
console.log(JSON.stringify(report, null, 2));
if (missing.length || report.states !== publishedStates.size) process.exitCode = 1;
