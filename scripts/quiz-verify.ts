/**
 * Session-level answer-position quality gate.
 * Run: npm run quiz:verify
 */
import { publishedQuestions, questions as allQuestions } from "../data/questions.ts";
import { examConfig } from "../data/exam-config.ts";
import { isActiveQuestion } from "../lib/question-status.ts";
import {
  buildBalancedAnswerSequence,
  isAcceptableSequence,
  letterCounts,
  optionText,
  presentExamQuestions,
  sequenceViolations,
  shuffle,
  type Letter,
} from "../lib/answer-sequence.ts";
import { buildQuickExam, pickQuickExam } from "../lib/quiz.ts";
import type { Question } from "../lib/types.ts";

const LETTERS: Letter[] = ["A", "B", "C", "D"];
let failures = 0;
const lines: string[] = [];

function fail(msg: string) {
  failures += 1;
  lines.push(`FAIL  ${msg}`);
}
function ok(msg: string) {
  lines.push(`OK    ${msg}`);
}
function info(msg: string) {
  lines.push(`INFO  ${msg}`);
}

function pickActive(count: number, seed: number, requireExact = true): Question[] {
  const pool = publishedQuestions().filter((q) => isActiveQuestion(q));
  const picked = shuffle(pool, seed).slice(0, count);
  if (requireExact && picked.length !== count) return [];
  return picked;
}

function assertCounts(n: number, seq: Letter[], label: string) {
  const c = letterCounts(seq);
  const vals = LETTERS.map((l) => c[l]);
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const base = Math.floor(n / 4);
  const rem = n % 4;
  if (max - min > 1) fail(`${label}: max-min=${max - min} counts=${JSON.stringify(c)}`);
  if (vals.some((v) => v < base)) fail(`${label}: a letter below base ${base}: ${JSON.stringify(c)}`);
  if (vals.reduce((a, b) => a + b, 0) !== n) fail(`${label}: counts sum ${vals.reduce((a, b) => a + b, 0)} != ${n}`);
  if (vals.filter((v) => v === base + 1).length !== rem) {
    fail(`${label}: expected ${rem} letters at ${base + 1}, got ${JSON.stringify(c)}`);
  }
}

function assertPresented(canonical: Question[], presented: Question[], maps: Record<string, Record<Letter, Letter>>, label: string) {
  if (presented.length !== canonical.length) fail(`${label}: presented ${presented.length} != picked ${canonical.length}`);
  const ids = presented.map((q) => q.question_id);
  if (new Set(ids).size !== ids.length) fail(`${label}: duplicate question ids`);
  if (ids.includes("az-081")) fail(`${label}: included inactive az-081`);
  for (let i = 0; i < canonical.length; i++) {
    const orig = canonical[i];
    const shown = presented[i];
    if (orig.question_id !== shown.question_id) fail(`${label}: order mismatch at ${i}`);
    const origText = optionText(orig, orig.correct_option);
    const shownText = optionText(shown, shown.correct_option);
    if (origText !== shownText) {
      fail(`${label} ${orig.question_id}: correct text changed (${orig.correct_option}→${shown.correct_option})`);
    }
    const toOrig = maps[orig.question_id];
    if (!toOrig) {
      fail(`${label} ${orig.question_id}: missing toOriginal map`);
      continue;
    }
    if (toOrig[shown.correct_option] !== orig.correct_option) {
      fail(`${label} ${orig.question_id}: toOriginal[${shown.correct_option}] != bank ${orig.correct_option}`);
    }
    const fb = shown.option_feedback[shown.correct_option] || "";
    if (!fb.toLowerCase().startsWith("correct")) {
      fail(`${label} ${orig.question_id}: display correct feedback is not the Correct line`);
    }
  }
}

function runMode(label: string, n: number, trials: number, seeds: number[]) {
  const seqs = new Set<string>();
  for (let t = 0; t < trials; t++) {
    const seed = seeds[t];
    const picked = pickActive(n, seed);
    if (picked.length !== n) {
      fail(`${label} seed ${seed}: could not pick ${n} (got ${picked.length})`);
      continue;
    }
    if (picked.some((q) => !isActiveQuestion(q))) fail(`${label} seed ${seed}: inactive question`);
    const { questions, maps, targets } = presentExamQuestions(picked, seed);
    if (targets.length !== n) fail(`${label} seed ${seed}: target length ${targets.length}`);
    if (!isAcceptableSequence(targets)) {
      fail(`${label} seed ${seed}: anti-pattern ${sequenceViolations(targets).join(",")}`);
    }
    const displayLetters = questions.map((q) => q.correct_option);
    if (displayLetters.join("") !== targets.join("")) {
      fail(`${label} seed ${seed}: presented letters != target sequence`);
    }
    assertCounts(n, targets, `${label} seed ${seed}`);
    assertPresented(picked, questions, maps, `${label} seed ${seed}`);
    seqs.add(targets.join(""));
  }
  const unique = seqs.size;
  info(`${label}: ${trials} seeds, unique sequences=${unique}`);
  if (unique < Math.min(90, Math.floor(trials * 0.9))) {
    fail(`${label}: unique sequences ${unique}/${trials} below 90%`);
  } else {
    ok(`${label}: unique sequences ${unique}/${trials}`);
  }
}

const bankCycle = allQuestions.map((q) => q.correct_option).join("");
if (/^(ABCD){4,}/.test(bankCycle) || /^(BCDA){4,}/.test(bankCycle) || /^(CDAB){4,}/.test(bankCycle) || /^(DABC){4,}/.test(bankCycle)) {
  fail("published bank still starts with a long ABCD-style cycle");
} else {
  ok("published bank is not an ABCD publish-time cycle");
}

const today = new Date("2026-09-02T12:00:00.000Z");
const az081 = allQuestions.find((q) => q.question_id === "az-081");
if (!az081) fail("az-081 missing");
else if (isActiveQuestion(az081, today)) fail("az-081 leaked into 2026-09-02 active pool");
else ok("az-081 remains inactive on 2026-09-02");

const fullN = examConfig.questionCount;
if (fullN !== 45) info(`examConfig.questionCount is ${fullN} (tests follow config)`);

const fullSeeds = Array.from({ length: 100 }, (_, i) => 1000 + i * 97);
const quickSeeds = Array.from({ length: 100 }, (_, i) => 2000 + i * 91);
runMode("Full 45", fullN, 100, fullSeeds);
runMode("Quick 10", 10, 100, quickSeeds);

const active = publishedQuestions().filter((q) => isActiveQuestion(q));
const wrongPool = shuffle(active, 4242).slice(0, 20);
for (const n of [5, 10] as const) {
  const label = n === 5 ? "Weak Free preview 5" : "Weak Pro preview 10";
  const seqs = new Set<string>();
  let abcdaHits = 0;
  let abcdHits = 0;
  for (let t = 0; t < 100; t++) {
    const seed = 3000 + t * 83 + n;
    const picked = shuffle(wrongPool, seed).slice(0, n);
    const { questions, maps, targets } = presentExamQuestions(picked, seed);
    if (!isAcceptableSequence(targets)) fail(`${label} seed ${seed}: ${sequenceViolations(targets).join(",")}`);
    assertCounts(n, targets, `${label} seed ${seed}`);
    assertPresented(picked, questions, maps, `${label} seed ${seed}`);
    const key = targets.join("");
    if (key === "ABCDA") abcdaHits += 1;
    if (key === "ABCDABCDAB") abcdHits += 1;
    seqs.add(key);
  }
  if (abcdaHits === 100 || abcdHits === 100) fail(`${label}: answer sequence is fixed to an ABCD cycle`);
  info(`${label}: unique sequences=${seqs.size}/100`);
  if (seqs.size < 80) fail(`${label}: unique sequences ${seqs.size}/100 too low`);
  else ok(`${label}: unique sequences ${seqs.size}/100`);
}

for (const n of [1, 2, 5, 8, 10, 45]) {
  const seq = buildBalancedAnswerSequence(n, 777 + n);
  if (seq.length !== n) fail(`generic n=${n}: length ${seq.length}`);
  if (!isAcceptableSequence(seq)) fail(`generic n=${n}: ${sequenceViolations(seq).join(",")}`);
  assertCounts(n, seq, `generic n=${n}`);
}
ok("generic n=1,2,5,8,10,45 sequences are balanced and acceptable");

const pickedA = pickActive(45, 101);
const first = presentExamQuestions(pickedA, 101);
const second = presentExamQuestions(pickedA, 101);
if (first.targets.join("") !== second.targets.join("")) fail("same seed/list produced different target sequences");
for (let i = 0; i < first.questions.length; i++) {
  const a = first.questions[i];
  const b = second.questions[i];
  if (
    a.option_a !== b.option_a ||
    a.option_b !== b.option_b ||
    a.option_c !== b.option_c ||
    a.option_d !== b.option_d ||
    a.correct_option !== b.correct_option
  ) {
    fail(`session unstable at ${a.question_id}`);
    break;
  }
}
ok("same sessionSeed + same question list is stable");

const other = presentExamQuestions(pickActive(45, 202), 202);
if (first.targets.join("") === other.targets.join("")) {
  fail("two different Full 45 seeds produced identical answer sequences");
} else {
  ok("different sessions produce different answer sequences");
}

const freeQuick = buildQuickExam({ isPro: false, seed: 404 });
if (freeQuick.length !== 10) fail(`Free Quick10 length ${freeQuick.length}`);
else if (new Set(freeQuick.map((q) => q.question_id)).size !== 10) fail("Free Quick10 is not unique");
else if (freeQuick.some((q) => !isActiveQuestion(q) || !q.is_free)) fail("Free Quick10 includes inactive or Pro-only item");
else ok("Free Quick10 always eligible");
if (freeQuick.some((q) => !q.is_free)) fail("Free Quick10 leaked a Pro-only item");
else ok("Free Quick10 has no Pro-only item");

const proItem = publishedQuestions().find((q) => !q.is_free && isActiveQuestion(q));
const inactive = allQuestions.find((q) => q.question_id === "az-081");
if (!proItem || !inactive) fail("need an active Pro item and az-081 for stale session test");
else {
  const stale = [proItem, inactive, ...freeQuick.slice(0, 3)];
  const sanitized = buildQuickExam({ isPro: false, seed: 505, stale });
  const ids = sanitized.map((q) => q.question_id);
  if (sanitized.length !== 10) fail(`stale Quick10 rebuilt to ${sanitized.length}`);
  else if (new Set(ids).size !== 10) fail("stale Quick10 rebuild is not unique");
  else if (ids.includes(proItem.question_id) || ids.includes("az-081") || sanitized.some((q) => !q.is_free || !isActiveQuestion(q))) {
    fail("stale Quick10 still contains Pro/inactive content");
  } else if (sanitized.some((q) => q.question_text === proItem.question_text)) {
    fail("stale Quick10 leaked Pro question text");
  } else ok("stale session with Pro item gets sanitized");
  ok("no Pro content leak");
  ok("exactly 10 unique eligible questions");
}

const proQuick = pickQuickExam(606, false);
if (proQuick.length !== 10) fail("Pro Quick10 should still pick 10");
else ok("Pro Quick10 keeps existing full-pool behavior");

const reportSeeds = [101, 202, 303];
lines.push("");
lines.push("=== Full 45 sample sequences ===");
for (const seed of reportSeeds) {
  const picked = pickActive(45, seed);
  const { targets } = presentExamQuestions(picked, seed);
  const c = letterCounts(targets);
  lines.push(`Seed ${seed}:`);
  lines.push(targets.join(""));
  lines.push(`A=${c.A} B=${c.B} C=${c.C} D=${c.D}`);
  lines.push("");
}

console.log(lines.join("\n"));
console.log(`quiz:verify  failures=${failures}`);
if (failures > 0) process.exit(1);
