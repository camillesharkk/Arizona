/**
 * Question-bank quality gate. Run: npm run questions:verify
 * Does not invent legal answers. Flags gaps for human review.
 */
import { questions, publishedQuestions } from "../data/questions.ts";
import { sources } from "../data/sources.ts";
import { examConfig, topics } from "../data/exam-config.ts";
import { chapters } from "../data/study-guide.ts";
import { isActiveQuestion } from "../lib/question-status.ts";

const LETTERS = ["A", "B", "C", "D"] as const;
type Letter = (typeof LETTERS)[number];

let failures = 0;
let warnings = 0;
const lines: string[] = [];

function fail(msg: string) {
  failures += 1;
  lines.push(`FAIL  ${msg}`);
}

function warn(msg: string) {
  warnings += 1;
  lines.push(`WARN  ${msg}`);
}

function info(msg: string) {
  lines.push(`INFO  ${msg}`);
}

function normText(s: string) {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

const published = publishedQuestions();
const all = questions;

info(`Total bank rows: ${all.length}`);
info(`Published + active: ${published.length}`);

const ids = all.map((q) => q.question_id);
const idCounts = new Map<string, number>();
for (const id of ids) idCounts.set(id, (idCounts.get(id) ?? 0) + 1);
for (const [id, n] of idCounts) {
  if (n > 1) fail(`duplicate question_id: ${id} (${n})`);
}

const textMap = new Map<string, string[]>();
for (const q of all) {
  const key = normText(q.question_text);
  const list = textMap.get(key) ?? [];
  list.push(q.question_id);
  textMap.set(key, list);
}
for (const [text, list] of textMap) {
  if (list.length > 1) fail(`duplicate question_text: ${list.join(", ")} — "${text.slice(0, 80)}"`);
}

const near: string[][] = [];
const entries = [...textMap.entries()];
for (let i = 0; i < entries.length; i++) {
  for (let j = i + 1; j < entries.length; j++) {
    const a = entries[i][0];
    const b = entries[j][0];
    if (a === b) continue;
    if (a.includes(b) || b.includes(a) || similar(a, b)) {
      near.push([entries[i][1].join("/"), entries[j][1].join("/")]);
    }
  }
}
if (near.length) {
  for (const pair of near) warn(`near-duplicate stems: ${pair[0]} ~ ${pair[1]}`);
}

function similar(a: string, b: string) {
  const wa = new Set(a.split(" ").filter((w) => w.length > 3));
  const wb = new Set(b.split(" ").filter((w) => w.length > 3));
  if (wa.size < 6 || wb.size < 6) return false;
  let inter = 0;
  for (const w of wa) if (wb.has(w)) inter += 1;
  const union = new Set([...wa, ...wb]).size;
  return inter / union >= 0.72;
}

for (const q of all) {
  if (!LETTERS.includes(q.correct_option as Letter)) {
    fail(`${q.question_id}: invalid correct_option ${String(q.correct_option)}`);
  }
  for (const letter of LETTERS) {
    const text = q[`option_${letter.toLowerCase()}` as "option_a"];
    if (!text?.trim()) fail(`${q.question_id}: empty option ${letter}`);
    if (!q.option_feedback[letter]?.trim()) fail(`${q.question_id}: empty option_feedback ${letter}`);
  }
  if (!q.explanation?.trim()) fail(`${q.question_id}: missing explanation`);
  if (!q.question_text?.trim()) fail(`${q.question_id}: empty question_text`);

  const from = new Date(q.effective_from);
  const to = q.effective_to ? new Date(q.effective_to) : null;
  if (Number.isNaN(from.getTime())) fail(`${q.question_id}: invalid effective_from`);
  if (q.effective_to && to && Number.isNaN(to.getTime())) fail(`${q.question_id}: invalid effective_to`);
  if (to && !Number.isNaN(from.getTime()) && to < from) fail(`${q.question_id}: effective_to before effective_from`);

  if (q.status === "published") {
    if (!q.source_id?.trim()) fail(`${q.question_id}: published but missing source_id`);
    else if (!sources[q.source_id]) warn(`${q.question_id}: source_id "${q.source_id}" not in registry`);
    if (!q.source_reference?.trim()) fail(`${q.question_id}: published but missing source_reference`);
    if (!q.last_verified_at?.trim()) fail(`${q.question_id}: published but unverified (no last_verified_at)`);
    if (!isActiveQuestion(q)) {
      const now = new Date();
      if (!Number.isNaN(from.getTime()) && now < from) {
        info(`${q.question_id}: published but not yet active (effective_from ${q.effective_from})`);
      } else {
        warn(`${q.question_id}: status published but not active (dates)`);
      }
    }
  }
}

const leaked = all.filter((q) => q.status !== "published" && published.some((p) => p.question_id === q.question_id));
if (leaked.length) {
  for (const q of leaked) fail(`${q.question_id}: non-published status leaked into publishedQuestions()`);
}

const dist: Record<Letter, number> = { A: 0, B: 0, C: 0, D: 0 };
for (const q of published) dist[q.correct_option] += 1;
const n = published.length || 1;
info("Correct-option distribution (published + active, bank letters before session shuffle):");
for (const l of LETTERS) {
  const pct = ((dist[l] / n) * 100).toFixed(1);
  info(`  ${l}: ${dist[l]} (${pct}%)`);
  if (dist[l] / n < 0.15 || dist[l] / n > 0.4) {
    warn(`correct_option ${l} is ${pct}% of published bank (target roughly 20–30%)`);
  }
}

const freeCount = published.filter((q) => q.is_free).length;
info(`is_free true: ${freeCount}; is_free false: ${published.length - freeCount}`);
if (freeCount < examConfig.questionCount && published.length >= examConfig.questionCount) {
  info(
    `Historical Full-45 trap: filtering is_free would yield ${freeCount} items (need ${examConfig.questionCount}). Full exam must use the full published pool.`
  );
}

const eligible = published.filter((q) => isActiveQuestion(q));
info(`Full 45 eligible count: ${eligible.length} (need ${examConfig.questionCount})`);
if (eligible.length < examConfig.questionCount) {
  fail(`Full 45 eligible count is ${eligible.length}, not ${examConfig.questionCount}. Do not silently shorten the exam.`);
}

const withSourceId = published.filter((q) => q.source_id).length;
const withRef = published.filter((q) => q.source_reference).length;
const withVerified = published.filter((q) => q.last_verified_at).length;
info(`Coverage: source_id ${withSourceId}/${published.length}`);
info(`Coverage: source_reference ${withRef}/${published.length}`);
info(`Coverage: last_verified_at ${withVerified}/${published.length}`);

info("By topic:");
for (const t of topics) {
  const c = published.filter((q) => q.topic === t.id).length;
  info(`  ${t.id}: ${c}`);
  if (c < 3) warn(`topic ${t.id} has only ${c} published questions`);
}

info("By study chapter (mapped via topic; questions have no separate chapter field):");
for (const ch of chapters) {
  const c = published.filter((q) => q.topic === ch.topic).length;
  info(`  ${ch.id} (${ch.title}): ${c} via topic=${ch.topic}`);
}

info("Source registry:");
for (const s of Object.values(sources)) {
  const used = published.filter((q) => q.source_id === s.source_id).length;
  info(`  ${s.source_id} [${s.source_type}] ${s.title} — used by ${used} questions; last_verified_at ${s.last_verified_at}`);
}

const genericRef = published.filter((q) => !/\bA\.?R\.?S\.?\b|\d{2}-\d{3}/i.test(q.source_reference));
info(`${genericRef.length} published questions cite handbook/SOS headings without an A.R.S. pin-cite.`);
for (const q of genericRef) {
  warn(`${q.question_id}: source_reference is not a statute pin-cite ("${q.source_reference}"). Human must confirm the answer against SOS/Manual/Statute.`);
}

const sameVerify = new Set(published.map((q) => q.last_verified_at));
if (sameVerify.size === 1) {
  warn(
    `All published questions share last_verified_at=${[...sameVerify][0]}. This is a batch stamp from publish(), not per-item legal review.`
  );
}

const fbMismatch = published.filter((q) => {
  const fb = q.option_feedback[q.correct_option].toLowerCase();
  return fb.includes("incorrect") || fb.includes("not correct");
});
for (const q of fbMismatch) fail(`${q.question_id}: option_feedback for correct_option reads as incorrect`);

info("Official topics with no dedicated questions beyond study-guide-only chapters:");
const topicIds = new Set(topics.map((t) => t.id));
const chapterOnly = chapters.filter((ch) => !topicIds.has(ch.topic as (typeof topics)[number]["id"]));
if (!chapterOnly.length) {
  info("  All study-guide chapters map onto an exam topic id. Extra chapters (exam-day, after-exam) reuse topic=commission.");
}
const examDayQs = published.filter((q) => /exam day|open.book|passing score/i.test(q.question_text));
if (examDayQs.length === 0) warn("No published questions specifically drill exam-day / open-book procedure (study chapter exam-day).");
const afterQs = published.filter((q) => /bond|oath|filing|commission issu/i.test(q.question_text));
if (afterQs.length === 0) warn("Few/no questions on post-exam commissioning steps (bond/oath/filing).");

info("Do not auto-generate unpublished legal items in this script.");

console.log(lines.join("\n"));
console.log("");
console.log(`questions:verify  failures=${failures}  warnings=${warnings}`);
if (failures > 0) process.exit(1);
