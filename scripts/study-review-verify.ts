/**
 * Study-card coverage and wrong-answer review rules.
 * Run: npm run study:verify
 */
import { publishedQuestions } from "../data/questions.ts";
import { applyReviewAnswer, compareMistakes, REVIEW_INTERVALS_MS } from "../lib/review-schedule.ts";
import { HOME_STUDY_CARD_IDS, studyCardCatalog, studyCardGaps } from "../lib/study-cards.ts";
import { createMemoryStore } from "../lib/store/memory-store.ts";
import type { QuestionStat } from "../lib/store/types.ts";

let failures = 0;
function check(name: string, ok: boolean) {
  if (ok) return;
  failures += 1;
  console.error("FAIL", name);
}

const catalog = studyCardCatalog();
const linked = new Set(catalog.flatMap((card) => card.question_ids ?? []));
const questions = publishedQuestions();
const uncovered = questions.filter((question) => !linked.has(question.question_id));
check("every question linked", uncovered.length === 0);
check("home eight", HOME_STUDY_CARD_IDS.length === 8);
check("home ids exist", HOME_STUDY_CARD_IDS.every((id) => catalog.some((card) => card.id === id)));
const gaps = studyCardGaps();
const sample = catalog.find((card) => card.id.startsWith("qc-") && !card.pendingVerification);
const sampleQuestion = sample ? questions.find((question) => question.question_id === sample.question_ids?.[0]) : undefined;
if (sample) {
  check("spot check uses the question explanation", Boolean(sampleQuestion && sample.back === sampleQuestion.explanation.trim()));
}

const now = "2026-10-22T10:00:00.000Z";
const wrong = applyReviewAnswer(null, { correct: false, review: false, now });
check("first wrong count", wrong.wrongCount === 1);
check("first interval", Date.parse(wrong.nextReviewAt || "") - Date.parse(now) === REVIEW_INTERVALS_MS[0]);
const again = applyReviewAnswer(wrong, { correct: false, review: true, now });
check("second wrong", again.wrongCount === 2 && again.reviewStage === 0 && again.consecutiveCorrect === 0);
const early = applyReviewAnswer(wrong, {
  correct: true,
  review: true,
  now: new Date(Date.parse(now) + 60_000).toISOString(),
});
check("early correct holds stage", early.reviewStage === 0 && early.nextReviewAt === wrong.nextReviewAt && early.wrongCount === 1);
const due = applyReviewAnswer(wrong, {
  correct: true,
  review: true,
  now: new Date(Date.parse(wrong.nextReviewAt || "") + 1000).toISOString(),
});
check("due correct advances", due.reviewStage === 1 && due.wrongCount === 1 && due.reviewCount === 1);
const practice = applyReviewAnswer(wrong, { correct: true, review: false, now });
check("practice correct keeps plan", practice.nextReviewAt === wrong.nextReviewAt && practice.wrongCount === 1);

const stat = (id: string, count: number, next: string | null): QuestionStat => ({
  userId: "u",
  questionId: id,
  topic: "commission",
  bank: "arizona-notary-exam",
  chapter: "commission",
  state: "AZ",
  firstCorrect: false,
  lastCorrect: false,
  wrongCount: count,
  rightCount: 0,
  reviewCount: 0,
  consecutiveCorrect: 0,
  reviewStage: 0,
  lastWrongAt: now,
  lastReviewedAt: null,
  nextReviewAt: next,
  lastSelected: "A",
  lastCorrectOption: "B",
  firstAt: now,
  lastAt: now,
  mastered: false,
  favorited: false,
});
const moment = Date.parse("2026-10-22T12:00:00.000Z");
const ordered = [
  stat("b", 1, "2026-10-22T13:00:00.000Z"),
  stat("a", 2, "2026-10-22T11:00:00.000Z"),
  stat("c", 5, "2026-10-22T11:30:00.000Z"),
  stat("d", 5, "2026-10-22T11:00:00.000Z"),
].sort((a, b) => compareMistakes(a, b, moment));
check("sort", ordered.map((item) => item.questionId).join(",") === "d,c,a,b");
const memory = createMemoryStore();
const claimed = await memory.claimAttempt("u", "attempt-1", "q");
const repeated = await memory.claimAttempt("u", "attempt-1", "q");
check("attempt once", claimed && !repeated);

if (failures) {
  console.error(failures, "failed", { uncovered: uncovered.map((q) => q.question_id), gaps });
  process.exit(1);
}
console.log("study review ok", {
  questions: questions.length,
  cards: catalog.length,
  pending: gaps.length,
  spot: sample?.id,
});
