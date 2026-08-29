import { randomUUID } from "crypto";
import { publishedQuestions } from "@/data/questions";
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
}) {
  const store = await getStore();
  const q = publishedQuestions().find((x) => x.question_id === opts.questionId);
  if (!q) throw new Error("unknown_question");
  const prev = await store.getStat(opts.userId, opts.questionId);
  const now = new Date().toISOString();
  const next: QuestionStat = {
    userId: opts.userId,
    questionId: opts.questionId,
    topic: q.topic,
    bank: "arizona-notary-exam",
    chapter: q.topic,
    firstCorrect: prev?.firstCorrect ?? opts.correct,
    lastCorrect: opts.correct,
    wrongCount: (prev?.wrongCount || 0) + (opts.correct ? 0 : 1),
    rightCount: (prev?.rightCount || 0) + (opts.correct ? 1 : 0),
    lastSelected: opts.selected,
    lastCorrectOption: q.correct_option,
    firstAt: prev?.firstAt || now,
    lastAt: now,
    mastered: prev?.mastered && opts.correct ? true : false,
    favorited: prev?.favorited ?? false,
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
}) {
  const store = await getStore();
  await store.addExam({
    id: randomUUID(),
    userId: opts.userId,
    mode: opts.mode,
    score: opts.score,
    correctCount: opts.correctCount,
    total: opts.total,
    at: new Date().toISOString(),
  });
  const user = await store.getUserById(opts.userId);
  if (user) {
    const best = user.bestScore == null ? opts.score : Math.max(user.bestScore, opts.score);
    await store.updateUser(opts.userId, { ...applyStreak(user), bestScore: best });
  }
}
