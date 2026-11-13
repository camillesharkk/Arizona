import { randomUUID } from "crypto";
import { publishedQuestions } from "@/data/questions";
import { publishedCaQuestions } from "@/data/ca-questions";
import { publishedHiQuestions } from "@/data/hi-questions";
import { questionById } from "@/lib/prep-pack";
import { currentQuestionVersion, currentRevisionStat } from "@/lib/question-revisions";
import { applyReviewAnswer, DEFAULT_STUDY_TIME_ZONE, migrateReviewFields } from "@/lib/review-schedule";
import { getStore } from "@/lib/store";
import type { QuestionStat, Store } from "@/lib/store/types";
import type { UserRow } from "@/lib/store/types";
import type { StateCode } from "@/lib/types";

/** Keep the normal answer/revision rules while grouping one imported sitting's I/O. */
export async function recordQuestionAnswers(opts: {
  store: Store;
  userId: string;
  state: StateCode;
  answers: { questionId: string; selected: "A" | "B" | "C" | "D"; correct: boolean; attemptId: string }[];
  plan: Awaited<ReturnType<Store["getStudyPlan"]>>;
  timeZone?: string;
}) {
  const { store, userId, state, plan } = opts;
  let user = await store.getUserById(userId);
  let userPatch: Partial<UserRow> | undefined;
  const answerStore: Store = Object.assign(Object.create(store) as Store, {
    getStudyPlan: async (id: string, code: StateCode) => id === userId && code === state ? plan : store.getStudyPlan(id, code),
    getUserById: async (id: string) => id === userId ? user : store.getUserById(id),
    updateUser: async (id: string, patch: Partial<UserRow>) => {
      if (id !== userId || !user) return store.updateUser(id, patch);
      userPatch = { ...userPatch, ...patch };
      user = { ...user, ...patch };
      return user;
    },
  });
  const pending: QuestionStat[] = [];
  if (store.claimAttempts && store.getStats && store.upsertStats) {
    const fresh = new Set(await store.claimAttempts(userId, opts.answers));
    const stats = new Map((await store.getStats(userId, opts.answers.map(answer => answer.questionId))).map(stat => [stat.questionId, stat]));
    answerStore.claimAttempt = async (_id, attemptId) => fresh.has(attemptId);
    answerStore.getStat = async (_id, questionId) => stats.get(questionId) ?? null;
    answerStore.upsertStat = async stat => {
      stats.set(stat.questionId, stat);
      pending.push(stat);
      return stat;
    };
  }
  for (const answer of opts.answers) await recordQuestionAnswer({ ...answer, userId, timeZone: opts.timeZone, store: answerStore });
  if (pending.length) await store.upsertStats!(pending);
  if (userPatch) await store.updateUser(userId, userPatch);
}

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
  timeZone?: string;
  store?: Store;
}): Promise<QuestionStat | null> {
  const store = opts.store || await getStore();
  const q = [...publishedQuestions(), ...publishedCaQuestions(), ...publishedHiQuestions()].find((x) => x.question_id === opts.questionId) ?? questionById(opts.questionId);
  if (!q) throw new Error("unknown_question");
  if ((q.state === "NY" || q.state === "PA" || q.state === "LA") && !opts.store) {
    return store.learningTransaction(opts.userId, transaction => recordQuestionAnswer({ ...opts, store: transaction }));
  }
  if (opts.attemptId) {
    const fresh = await store.claimAttempt(opts.userId, opts.attemptId, opts.questionId);
    if (!fresh) return (await store.getStat(opts.userId, opts.questionId)) ?? null;
  }
  const stored = await store.getStat(opts.userId, opts.questionId);
  const prev = stored ? currentRevisionStat(stored) : null;
  const now = new Date().toISOString();
  const state = q.state;
  const savedPlan = await store.getStudyPlan(opts.userId, state);
  const savedSettings = (savedPlan?.document as { settings?: { timeZone?: string } } | undefined)?.settings;
  const timeZone = savedSettings?.timeZone || opts.timeZone || DEFAULT_STUDY_TIME_ZONE;
  const migrated = prev ? migrateReviewFields(prev, now, timeZone) : null;
  const review = applyReviewAnswer(migrated, { correct: opts.correct, review: Boolean(opts.review), now, timeZone });
  const next: QuestionStat = {
    questionVersion: currentQuestionVersion(opts.questionId),
    revisionHistory: prev?.revisionHistory,
    userId: opts.userId,
    questionId: opts.questionId,
    topic: q.topic,
    bank: state === "CA" ? "california-notary-exam" : state === "HI" ? "hawaii-notary-exam" : state === "NY" ? "new-york-notary-exam" : state === "PA" ? "pennsylvania-notary-exam" : state === "LA" ? "louisiana-notary-exam" : "arizona-notary-exam",
    chapter: q.topic,
    state,
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
  updateBest?: boolean;
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
    const patch = applyStreak(user);
    if (opts.updateBest === false) {
      await store.updateUser(opts.userId, patch);
    } else {
      const best = user.bestScore == null ? opts.score : Math.max(user.bestScore, opts.score);
      await store.updateUser(opts.userId, { ...patch, bestScore: best });
    }
  }
  return true;
}
