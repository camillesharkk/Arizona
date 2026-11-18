import { registerHooks } from "node:module";
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
const banks = [["questions", "publishedQuestions"], ["ca-questions", "publishedCaQuestions"], ["hi-questions", "publishedHiQuestions"], ["in-questions", "publishedInQuestions"], ...["pa", "ny", "la", "ct", "nc"].map(code => [`${code}-content`, `published${code[0].toUpperCase()}${code[1]}Questions`])];
const questions = [];
for (const [file, name] of banks) questions.push(...(await import(`../data/${file}.ts`))[name]());
const { freeStateCatalog } = await import("../lib/free-state-catalog.ts");
const { freeStateContent } = await import("../data/free-state-content.ts");
const { stateQuestion } = await import("../lib/state-question.ts");
for (const [code] of freeStateCatalog) {
  const full = JSON.parse(readFileSync(path.join(root, "data/full-states", `${code}.json`), "utf8"));
  questions.push(...[...freeStateContent[code].questions, ...full.questions].map(question => stateQuestion(code, question, true)));
}
const byState = {};
const missing = [];
const publishedStates = new Set(availableStates().map(state => state.code));
const byResolution = {};
const urls = new Map();
const questionKeys = new Set();
const usedSources = new Set();
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
  const issues = [];
  if (!source) issues.push("source ID is absent from registry");
  if (!evidence.href) issues.push("official URL unavailable");
  if (!question.source_reference?.trim()) issues.push("question citation unavailable");
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
  for (const url of [evidence.href, ...evidence.additional].filter(Boolean)) {
    const list = urls.get(url) || [];
    list.push(question.question_id);
    urls.set(url, list);
  }
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
console.log(JSON.stringify(report, null, 2));
if (missing.length || report.states !== publishedStates.size) process.exitCode = 1;
