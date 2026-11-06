import assert from "node:assert/strict";
import { dueQuestionIds, recentCaExams, recoverWrongIds } from "../lib/ca-daily-shape.ts";
import { scheduleReview } from "../lib/review-schedule.ts";

const exam = { id: "e1", mode: "ca-quick", correctCount: 6, total: 10, at: "2026-11-06T12:00:00.000Z" };
const stats = [
  { questionId: "ca-001", state: "CA", wrongCount: 1, mastered: false, nextReviewAt: "2026-11-07T07:00:00.000Z", lastWrongAt: "2026-11-06T12:00:02.000Z" },
  { questionId: "ca-002", state: "AZ", wrongCount: 1, mastered: false, nextReviewAt: "2026-11-06T01:00:00.000Z", lastWrongAt: "2026-11-06T12:00:02.000Z" },
];

const recovered = recoverWrongIds(exam.at, stats);
assert.deepEqual(recovered, ["ca-001"]);

const shown = recentCaExams([exam, { id: "az", mode: "quick", correctCount: 1, total: 10, at: exam.at }], {}, stats);
assert.equal(shown.length, 1);
assert.equal(shown[0].label, "Quick 10");
assert.equal(shown[0].correct, 6);
assert.equal(shown[0].wrong, 1);
assert.deepEqual(shown[0].wrongIds, ["ca-001"]);

const exact = recentCaExams([exam], { e1: { wrong: 4, skipped: 0, wrongIds: ["a", "b", "c", "d"] } }, []);
assert.equal(exact[0].wrong, 4);
assert.equal(exact[0].recovered, false);

const again = recentCaExams([exam], { e1: { wrong: 4, skipped: 0, wrongIds: ["a", "b", "c", "d"] } }, []);
assert.deepEqual(again, exact);

const next = scheduleReview("2026-11-06T12:00:00.000Z", 0, "America/Phoenix");
assert.equal(dueQuestionIds(stats, "2026-11-06T18:00:00.000Z").length, 0);
assert.deepEqual(dueQuestionIds([{ ...stats[0], nextReviewAt: next }], next), ["ca-001"]);
assert.deepEqual(dueQuestionIds([{ ...stats[0], nextReviewAt: next, savedForReview: true, wrongCount: 0 }], next), ["ca-001"]);
assert.deepEqual(dueQuestionIds([{ ...stats[0], nextReviewAt: next, state: "AZ" }], next), []);

console.log("ca-daily-check ok");
