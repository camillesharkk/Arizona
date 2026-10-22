/**
 * Study-card coverage and wrong-answer review rules.
 * Run: npm run study:verify
 */
import { publishedQuestions } from "../data/questions.ts";
import { addCalendarDays, localDate } from "../lib/calendar.ts";
import { applyReviewAnswer, compareMistakes, migrateReviewFields, scheduleReview } from "../lib/review-schedule.ts";
import { buildDay, defaultSettings, emptyDocument, projectPlan, recommendedQuotas } from "../lib/study-plan.ts";
import { HOME_STUDY_CARD_IDS, publicStudyCards, studyCardCatalog, studyCardGaps } from "../lib/study-cards.ts";
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

const zone = "America/Phoenix";
const now = "2026-11-01T15:00:00.000Z";
const wrong = applyReviewAnswer(null, { correct: false, review: false, now, timeZone: zone });
check("first wrong count", wrong.wrongCount === 1);
check("first interval", wrong.nextReviewAt === scheduleReview(now, 0, zone));
check("next local day", localDate(wrong.nextReviewAt || "", zone) === "2026-11-02");
const again = applyReviewAnswer(wrong, { correct: false, review: true, now, timeZone: zone });
check("second wrong", again.wrongCount === 2 && again.reviewStage === 0 && again.consecutiveCorrect === 0);
const early = applyReviewAnswer(wrong, {
  correct: true,
  review: true,
  now: new Date(Date.parse(now) + 60_000).toISOString(),
  timeZone: zone,
});
check("early correct holds stage", early.reviewStage === 0 && early.nextReviewAt === wrong.nextReviewAt && early.wrongCount === 1);
const due = applyReviewAnswer(wrong, { correct: true, review: true, now: wrong.nextReviewAt || now, timeZone: zone });
check("due correct advances", due.reviewStage === 1 && due.wrongCount === 1 && due.reviewCount === 1);
check("seven days", localDate(due.nextReviewAt || "", zone) === "2026-11-09");
const second = applyReviewAnswer(due, { correct: true, review: true, now: due.nextReviewAt || now, timeZone: zone });
const third = applyReviewAnswer(second, { correct: true, review: true, now: second.nextReviewAt || now, timeZone: zone });
check("fourteen days", localDate(second.nextReviewAt || "", zone) === "2026-11-23");
check("thirty days", localDate(third.nextReviewAt || "", zone) === "2026-12-23");
const firstCorrect = applyReviewAnswer(null, { correct: true, review: false, now, timeZone: zone });
check("correct is not a mistake", firstCorrect.wrongCount === 0 && firstCorrect.reviewCount === 0 && Boolean(firstCorrect.nextReviewAt));
const practice = applyReviewAnswer(wrong, { correct: true, review: false, now, timeZone: zone });
check("practice correct keeps plan", practice.nextReviewAt === wrong.nextReviewAt && practice.wrongCount === 1);
const dst = addCalendarDays("2026-03-08T16:00:00.000Z", 1, "America/New_York");
check("dst calendar day", localDate(dst, "America/New_York") === "2026-03-09");
const migrated = migrateReviewFields({
  wrongCount: 2, rightCount: 0, reviewCount: 0, consecutiveCorrect: 0, reviewStage: 0,
  lastWrongAt: "2026-11-01T15:00:00.000Z", lastReviewedAt: null, nextReviewAt: "2026-11-01T15:10:00.000Z", reviewPlan: null,
}, "2026-11-01T15:05:00.000Z", zone);
check("ten minute plan moves to one day", localDate(migrated.nextReviewAt || "", zone) === "2026-11-02" && migrated.reviewPlan === "v2");
const alreadyDue = migrateReviewFields({ ...migrated, reviewPlan: null, reviewStage: 0, nextReviewAt: "2026-11-01T15:00:00.000Z" }, "2026-11-01T16:00:00.000Z", zone);
check("due task stays due", Date.parse(alreadyDue.nextReviewAt || "") <= Date.parse("2026-11-01T16:00:00.000Z"));
const twice = migrateReviewFields(alreadyDue, "2026-11-01T16:00:00.000Z", zone);
check("migration is stable", twice.nextReviewAt === alreadyDue.nextReviewAt && twice.reviewStage === alreadyDue.reviewStage);
const settings = defaultSettings("2026-11-01", zone);
const quotas = recommendedQuotas({ settings, today: "2026-11-01", unseenCards: 40, unseenQuestions: 80, reviewBacklog: 0, activeDays: 0 });
check("forty day pace", quotas.newCards === 1 && quotas.newQuestions === 2 && quotas.introDays === 40);
const doc = emptyDocument("2026-11-01", zone);
const day = buildDay({
  doc, today: "2026-11-01", now, timeZone: zone, cardIds: ["c1", "c2"], questionIds: ["q1", "q2"],
  questions: [
    { id: "q1", wrongCount: 3, reviewCount: 0, reviewStage: 0, firstAt: now, lastWrongAt: "2026-10-31T18:00:00.000Z", lastReviewedAt: null, nextReviewAt: "2026-11-01T07:00:00.000Z", mastered: false },
    { id: "q2", wrongCount: 1, reviewCount: 0, reviewStage: 0, firstAt: now, lastWrongAt: "2026-10-31T18:00:00.000Z", lastReviewedAt: null, nextReviewAt: "2026-11-02T07:00:00.000Z", mastered: false },
  ],
  cardsByQuestion: new Map([["q1", ["c1"]]]),
});
check("due wrong is queued", day.tasks.some((task) => task.key === "question:q1"));
check("future yesterday wrong waits", day.yesterdayWaiting.some((item) => item.id === "q2") && !day.tasks.some((task) => task.key === "question:q2"));
check("q1 has no card gap only for q2", day.unmappedQuestionIds.includes("q2"));
const projected = projectPlan({
  settings, today: "2026-11-01", cardIds: ["c1"], questionIds: ["q1"], cards: {}, questions: [], timeZone: zone,
});
check("small plan has a date", Boolean(projected.date));
const freeCards = publicStudyCards(false).filter((card) => !card.locked && !card.pending).length;
const proCards = publicStudyCards(true).filter((card) => !card.pending).length;

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
const freeQuestions = questions.filter((question) => question.is_free).length;
const freePace = recommendedQuotas({ settings, today: "2026-11-01", unseenCards: freeCards, unseenQuestions: freeQuestions, reviewBacklog: 0, activeDays: 0 });
const proPace = recommendedQuotas({ settings, today: "2026-11-01", unseenCards: proCards, unseenQuestions: questions.length, reviewBacklog: 0, activeDays: 0 });
console.log("study review ok", {
  questions: questions.length,
  freeQuestions,
  cards: catalog.length,
  freeCards,
  proCards,
  pending: gaps.length,
  spot: sample?.id,
  freePace,
  proPace,
  target: settings.targetDate,
  smallPlan: projected.date,
});
