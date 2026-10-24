import { randomUUID } from "crypto";
import { publishedQuestions } from "@/data/questions";
import { applyReviewAnswer, DEFAULT_STUDY_TIME_ZONE, migrateReviewFields } from "@/lib/review-schedule";
import { getStore } from "@/lib/store";
import type { QuestionStat } from "@/lib/store/types";
import type { UserRow } from "@/lib/store/types";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function applyStreak(user: UserRow): Partial<UserRow> {
  const d = today();
  if (user.lastStudyDate === d) return { lastStudyAt: new Date().toISOString() };
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = y.toISOString().slice(0, 10);
  const streakDays = user.lastStudyDate === yesterday ? user.streakDays + 1 : 1;
  return { lastStudyAt: new Date().toISOString(), lastStudyDate: d, streakDays };
}

export async function recordQuestionAnswer(opts: {
  userId: string;
  questionId: string;
  selected: "A" | "B" | "C" | "D";
  correct: boolean;
  review?: boolean;
  attemptId?: string;
}) {
  const store = await getStore();
  const q = publishedQuestions().find((x) => x.question_id === opts.questionId);
  if (!q) throw new Error("unknown_question");
  if (opts.attemptId) {
    const fresh = await store.claimAttempt(opts.userId, opts.attemptId, opts.questionId);
    if (!fresh) return (await store.getStat(opts.userId, opts.questionId)) ?? null;
  }
  const prev = await store.getStat(opts.userId, opts.questionId);
  const now = new Date().toISOString();
  const savedPlan = await store.getStudyPlan(opts.userId, "AZ");
  const savedSettings = (savedPlan?.document as { settings?: { timeZone?: string } } | undefined)?.settings;
  const timeZone = savedSettings?.timeZone || DEFAULT_STUDY_TIME_ZONE;
  const migrated = prev ? migrateReviewFields(prev, now, timeZone) : null;
  const review = applyReviewAnswer(migrated, { correct: opts.correct, review: Boolean(opts.review), now, timeZone });
  const next: QuestionStat = {
    userId: opts.userId,
    questionId: opts.questionId,
    topic: q.topic,
    bank: "arizona-notary-exam",
    chapter: q.topic,
    state: "AZ",
    firstCorrect: prev?.firstCorrect ?? opts.correct,
    lastCorrect: opts.correct,
    ...review,
    lastSelected: opts.selected,
    lastCorrectOption: q.correct_option,
    firstAt: prev?.firstAt || now,
    lastAt: now,
    mastered: prev?.mastered && opts.correct ? true : false,
    favorited: prev?.favorited ?? false,
    savedForReview: prev?.savedForReview ?? false,
  };
  await store.upsertStat(next);
  const user = await store.getUserById(opts.userId);
  if (user) await store.updateUser(opts.userId, applyStreak(user));
  return next;
}

export async function recordExam(opts: {
  userId: string;
  mode: string;
  score: number;
  correctCount: number;
  total: number;
  examId?: string;
}) {
  const store = await getStore();
  const inserted = await store.addExam({
    id: opts.examId || randomUUID(),
    userId: opts.userId,
    mode: opts.mode,
    score: opts.score,
    correctCount: opts.correctCount,
    total: opts.total,
    at: new Date().toISOString(),
  });
  if (!inserted) return false;
  const user = await store.getUserById(opts.userId);
  if (user) {
    const best = user.bestScore == null ? opts.score : Math.max(user.bestScore, opts.score);
    await store.updateUser(opts.userId, { ...applyStreak(user), bestScore: best });
  }
  return true;
}
