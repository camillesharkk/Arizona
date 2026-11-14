import { serverStateQuestions } from '../data/full-state-server';
import { isFreeState } from './free-state-catalog';
import { ctProCovers } from "@/lib/account-pro";
import { isDeepStrictEqual } from "node:util";
import { caCards } from "@/data/ca-cards";
import { hiCards } from "@/data/hi-cards";
import { publishedCaQuestions } from "@/data/ca-questions";
import { publishedHiQuestions } from "@/data/hi-questions";
import { publishedQuestions } from "@/data/questions";
import { localDate } from "@/lib/calendar";
import { recentCaExams, type CaCheck } from "@/lib/ca-daily-shape";
import { caPaths } from "@/lib/ca-site";
import { hiPaths } from "@/lib/hi-site";
import { accountProCovers, accountProExpiry, hasStatePro, indianaEntitlement } from "@/lib/entitlements";
import { publicStudyCards, studyCardCatalog } from "@/lib/study-cards";
import {
  applyCardMark,
  buildDay,
  dayNumber,
  emptyDocument,
  normalizeDocument,
  planDates,
  projectPlan,
  recommendedQuotas,
  type DayTask,
  type ItemProgress,
  type StudyDocument,
  type StudySettings,
} from "@/lib/study-plan";
import { DEFAULT_STUDY_TIME_ZONE, scheduleReview } from "@/lib/review-schedule";
import { stateProCovers, stateProExpiry } from "@/lib/state-pro";
import { publishedInQuestions } from "@/data/in-questions";
import { packFor } from "@/lib/prep-pack";
import { getStore } from "@/lib/store";
import type { StateCode } from "@/lib/types";

export type StudyState = StateCode;

function isPack(state: StudyState) {
  return Boolean(packFor(state)) || state === "NY" || state === "PA" || state === "LA" || state === "CT" || state === "NC" || state === "IN";
}

function pool(state: StudyState, isPro: boolean) {
  if (isPack(state)) {
    const pack = packFor(state as StateCode);
    const questions = (state === "IN" ? publishedInQuestions() : isFreeState(state) ? serverStateQuestions(state) : pack?.questions() || []).filter((question) => isPro || question.is_free);
    const practice = pack?.paths.practice || "/";
    const cards = (pack?.cards || []).map((card) => ({
      id: card.id,
      topic: card.study,
      category: card.study,
      title: card.title,
      front: card.front,
      back: card.rule,
      rule: card.rule,
      boundary: card.boundary,
      mixup: card.mixup,
      sourceLabel: card.source,
      sourceUrl: card.sourceUrl,
      practiceHref: `${practice}?mode=practice&area=${encodeURIComponent(card.study)}`,
      locked: false,
      pending: false,
    }));
    const cardsByQuestion = new Map<string, string[]>();
    for (const card of cards) {
      for (const question of questions) {
        if (question.study_topic !== card.topic) continue;
        const list = cardsByQuestion.get(question.question_id) || [];
        list.push(card.id);
        cardsByQuestion.set(question.question_id, list);
      }
    }
    return { questions, cards, cardsByQuestion };
  }
  if (state === "CA" || state === "HI") {
    const questions = state === "HI" ? publishedHiQuestions() : publishedCaQuestions();
    const sourceCards = state === "HI" ? hiCards : caCards;
    const practice = state === "HI" ? hiPaths.practice : caPaths.practice;
    const cards = sourceCards.map((card) => ({
      id: card.id,
      topic: card.study,
      category: card.study,
      title: card.title,
      front: card.front,
      back: card.rule,
      rule: card.rule,
      boundary: card.boundary,
      mixup: card.mixup,
      sourceLabel: card.source,
      sourceUrl: card.sourceUrl,
      practiceHref: `${practice}?mode=practice&area=${encodeURIComponent(card.study)}`,
      locked: false,
      pending: false,
    }));
    const cardsByQuestion = new Map<string, string[]>();
    for (const card of cards) {
      for (const question of questions) {
        if (question.study_topic !== card.topic) continue;
        const list = cardsByQuestion.get(question.question_id) || [];
        list.push(card.id);
        cardsByQuestion.set(question.question_id, list);
      }
    }
    return { questions, cards, cardsByQuestion };
  }
  const questions = publishedQuestions().filter((question) => isPro || question.is_free);
  const cards = publicStudyCards(isPro).filter((card) => !card.locked && !card.pending);
  const allowedCards = new Set(cards.map((card) => card.id));
  const cardsByQuestion = new Map<string, string[]>();
  for (const card of studyCardCatalog()) {
    if (!allowedCards.has(card.id)) continue;
    for (const questionId of card.question_ids ?? []) {
      const list = cardsByQuestion.get(questionId) || [];
      list.push(card.id);
      cardsByQuestion.set(questionId, list);
    }
  }
  return { questions, cards, cardsByQuestion };
}

function keptChecks(raw: unknown): Record<string, CaCheck> | undefined {
  if (!raw || typeof raw !== "object" || !("checks" in raw)) return undefined;
  const checks = (raw as { checks?: unknown }).checks;
  return checks && typeof checks === "object" ? (checks as Record<string, CaCheck>) : undefined;
}

async function loadDocument(userId: string, state: StudyState, today: string, timeZoneHint?: string) {
  const store = await getStore();
  const row = await store.getStudyPlan(userId, state);
  const hint = timeZoneHint && timeZoneHint.length < 80 ? timeZoneHint : undefined;
  const doc = normalizeDocument(row?.document, today, hint || DEFAULT_STUDY_TIME_ZONE);
  if (!row && hint) doc.settings.timeZone = hint;
  return { store, doc, storedDocument: row?.document, checks: keptChecks(row?.document) };
}

async function saveDocument(store: Awaited<ReturnType<typeof getStore>>, userId: string, state: StudyState, doc: StudyDocument, checks?: Record<string, CaCheck>) {
  await store.saveStudyPlan({ userId, state, document: checks ? { ...doc, checks } : doc });
}

export async function dailyStudyView(userId: string, timeZoneHint?: string, now = new Date().toISOString(), state: StudyState = "AZ") {
  const topicPractice = state === "CA" || state === "HI" || isPack(state);
  const storeForExpiry = await getStore();
  const account = await storeForExpiry.listEntitlements(userId);
  const indiana = state === "IN" ? indianaEntitlement(account, new Date(now)) : null;
  const pro = state === "IN" ? Boolean(indiana) : state === "CT" ? ctProCovers(account) : stateProCovers(account, state);
  const expires = state === "IN" ? (indiana ? new Date(indiana.expiresAt) : null) : state === "CT" ? accountProExpiry(account, new Date(now), "CT") : stateProExpiry(account, state, new Date(now));
  const loaded = await loadDocument(userId, state, localDate(now, timeZoneHint || DEFAULT_STUDY_TIME_ZONE), timeZoneHint);
  let doc = loaded.doc;
  const { store, checks } = loaded;
  const timeZone = doc.settings.timeZone || DEFAULT_STUDY_TIME_ZONE;
  const today = localDate(now, timeZone);
  const { questions, cards, cardsByQuestion } = pool(state, pro);
  const stats = await store.listStats(userId);
  const stateStats = stats.filter((item) => item.state === state);
  if (topicPractice) {
    for (const stat of stateStats) {
      if (stat.mastered || stat.wrongCount <= 0 || stat.nextReviewAt) continue;
      stat.nextReviewAt = scheduleReview(stat.lastWrongAt || stat.firstAt || now, stat.reviewStage || 0, timeZone);
      await store.updateReviewStat(userId, stat.questionId, { nextReviewAt: stat.nextReviewAt });
    }
  }
  const progress: ItemProgress[] = questions.map((question) => {
    const stat = stateStats.find((item) => item.questionId === question.question_id);
    return {
      id: question.question_id,
      wrongCount: stat?.wrongCount ?? 0,
      reviewCount: stat?.reviewCount ?? 0,
      reviewStage: stat?.reviewStage ?? 0,
      firstAt: stat?.firstAt ?? null,
      lastWrongAt: stat?.lastWrongAt ?? null,
      lastReviewedAt: stat?.lastReviewedAt ?? null,
      nextReviewAt: stat?.nextReviewAt ?? null,
      mastered: Boolean(stat?.mastered),
    };
  });
  const built = buildDay({
    doc,
    today,
    now,
    timeZone,
    cardIds: cards.map((card) => card.id),
    questionIds: questions.map((question) => question.question_id),
    questions: progress,
    cardsByQuestion,
  });
  const previousSeconds = doc.days[today]?.visibleSeconds ?? 0;
  doc = { ...doc, days: { ...doc.days, [today]: { tasks: built.tasks, visibleSeconds: previousSeconds } } };
  const document = checks ? { ...doc, checks } : doc;
  if (!isDeepStrictEqual(loaded.storedDocument, document)) await saveDocument(store, userId, state, doc, checks);
  const projection = projectPlan({
    settings: doc.settings,
    today,
    cardIds: cards.map((card) => card.id),
    questionIds: questions.map((question) => question.question_id),
    cards: doc.cards,
    questions: progress,
    timeZone,
  });
  const introduced = cards.filter((card) => doc.cards[card.id]?.firstStudiedAt).length + progress.filter((item) => item.firstAt).length;
  const reviewed = cards.filter((card) => (doc.cards[card.id]?.reviewCount ?? 0) > 0).length + progress.filter((item) => item.reviewCount > 0).length;
  const total = cards.length + questions.length;
  const byId = new Map(cards.map((card) => [card.id, card]));
  const cardTask = (task: DayTask) => (task.key.startsWith("card:") ? byId.get(task.key.slice(5)) : undefined);
  const nextReview = [...progress.map((item) => item.nextReviewAt), ...Object.values(doc.cards).map((card) => card.nextReviewAt)]
    .filter((value): value is string => Boolean(value && Date.parse(value) > Date.parse(now)))
    .sort()[0] || null;
  const base = recommendedQuotas({
    settings: { ...doc.settings, mode: "recommended" },
    today,
    unseenCards: cards.filter((card) => !doc.cards[card.id]?.firstStudiedAt).length,
    unseenQuestions: progress.filter((item) => !item.firstAt).length,
    reviewBacklog: built.tasks.filter((task) => task.kind.startsWith("review")).length,
    activeDays: 0,
  });
  return {
    dayNumber: dayNumber(doc.settings.startedOn, today),
    today,
    done: built.done,
    goal: built.goal,
    introduced,
    reviewed,
    total,
    targetDate: planDates(doc.settings).targetDate,
    projectedDate: projection.date,
    projectReason: projection.reason,
    entitlementExpiresAt: expires ? expires.toISOString() : null,
    freeOnly: (state === "AZ" || state === "CT" || state === "NC" || state === "IN" || isFreeState(state)) && !pro,
    freeQuestionCount: pool(state, false).questions.length,
    questionCount: pool(state, true).questions.length,
    freeCardCount: pool(state, false).cards.length,
    cardCount: pool(state, true).cards.length,
    quotas: built.quotas,
    recommended: { newCards: base.newCards, newQuestions: base.newQuestions, reviews: base.reviews },
    reason: built.reason,
    settings: doc.settings,
    practiceCards: built.tasks.filter((task) => task.kind === "new-card").map(cardTask).filter((card) => card != null),
    reviewCards: built.tasks.filter((task) => task.kind === "review-card").map(cardTask).filter((card) => card != null),
    practiceQuestionIds: built.tasks.filter((task) => task.kind === "new-question").map((task) => task.key.slice(9)),
    reviewQuestionIds: built.tasks.filter((task) => task.kind === "review-question").map((task) => task.key.slice(9)),
    yesterdayWaiting: built.yesterdayWaiting,
    unmappedQuestionIds: built.unmappedQuestionIds,
    nextReviewAt: nextReview,
    taskStatus: built.tasks,
    ...californiaPlan(questions, stateStats, await store.listExams(userId), checks, state),
  };
}

function californiaPlan(
  questions: { question_id: string; question_text: string; exam_area?: string }[],
  stats: { questionId: string; state: string; wrongCount: number; savedForReview?: boolean; mastered: boolean; nextReviewAt: string | null; lastWrongAt: string | null; firstAt: string | null }[],
  exams: { id: string; mode: string; correctCount: number; total: number; at: string }[],
  checks: Record<string, CaCheck> | undefined,
  state: StudyState,
) {
  const byId = new Map(questions.map((question) => [question.question_id, question]));
  const now = new Date().toISOString();
  const scheduled = stats
    .filter((stat) => !stat.mastered && (stat.wrongCount > 0 || stat.savedForReview) && byId.has(stat.questionId))
    .map((stat) => {
      const question = byId.get(stat.questionId)!;
      return {
        questionId: question.question_id,
        prompt: question.question_text,
        area: question.exam_area || "",
        nextReviewAt: stat.nextReviewAt,
        wrongCount: stat.wrongCount,
        saved: Boolean(stat.savedForReview),
        due: Boolean(stat.nextReviewAt && stat.nextReviewAt <= now),
      };
    })
    .sort((a, b) => (a.nextReviewAt || "9").localeCompare(b.nextReviewAt || "9"));
  return {
    state,
    recent: recentCaExams(exams, checks || {}, stats, state),
    scheduled,
    due: scheduled.filter((item) => item.due).map((item) => ({ questionId: item.questionId, prompt: item.prompt, due: item.nextReviewAt, area: item.area })),
    hasPractice: recentCaExams(exams, checks || {}, stats, state).length > 0 || stats.some((stat) => stat.firstAt || stat.savedForReview),
  };
}

export async function saveStudySettings(userId: string, patch: Partial<StudySettings> & { restore?: boolean }, timeZoneHint?: string, state: StudyState = "AZ") {
  const now = new Date().toISOString();
  const { store, doc, checks } = await loadDocument(userId, state, localDate(now, timeZoneHint || DEFAULT_STUDY_TIME_ZONE), timeZoneHint);
  const settings: StudySettings = { ...doc.settings };
  if (patch.restore) {
    settings.mode = "recommended";
    settings.newCards = null;
    settings.newQuestions = null;
    settings.reviewTarget = null;
  } else {
    if (patch.mode === "recommended" || patch.mode === "custom") settings.mode = patch.mode;
    if (patch.targetDate && /^\d{4}-\d{2}-\d{2}$/.test(patch.targetDate)) settings.targetDate = patch.targetDate;
    if (Array.isArray(patch.weekdays)) {
      const days = [...new Set(patch.weekdays.filter((day) => Number.isInteger(day) && day >= 0 && day <= 6))];
      if (days.length === 0) throw new Error("Choose at least one study day.");
      settings.weekdays = days.sort();
    }
    if (patch.timeZone && patch.timeZone.length < 80) {
      try {
        Intl.DateTimeFormat("en-US", { timeZone: patch.timeZone }).format(new Date());
      } catch {
        throw new Error("Use a valid time zone, such as America/Phoenix.");
      }
      settings.timeZone = patch.timeZone;
    }
    const number = (value: number | null | undefined) => (value == null ? null : Math.max(0, Math.floor(value)));
    if (settings.mode === "custom") {
      if (patch.newCards != null) settings.newCards = number(patch.newCards);
      if (patch.newQuestions != null) settings.newQuestions = number(patch.newQuestions);
      if (patch.reviewTarget != null) settings.reviewTarget = number(patch.reviewTarget);
    } else {
      settings.newCards = null;
      settings.newQuestions = null;
      settings.reviewTarget = null;
    }
  }
  const next: StudyDocument = { ...doc, settings };
  await saveDocument(store, userId, state, next, checks);
  return settings;
}

export async function markDailyCard(userId: string, input: { cardId: string; action: "studied" | "remembered" | "need-review"; attemptId: string }, state: StudyState = "AZ") {
  const pro = await hasStatePro(userId, state);
  const allowed = new Set(pool(state, pro).cards.map((card) => card.id));
  if (!allowed.has(input.cardId)) throw new Error("not_allowed");
  const now = new Date().toISOString();
  const { store, doc, checks } = await loadDocument(userId, state, localDate(now, DEFAULT_STUDY_TIME_ZONE));
  if (doc.attempts.includes(input.attemptId)) return doc;
  const marked = applyCardMark(doc, { cardId: input.cardId, action: input.action, now, timeZone: doc.settings.timeZone });
  const next = { ...marked, attempts: [...marked.attempts, input.attemptId].slice(-500) };
  await saveDocument(store, userId, state, next, checks);
  return next;
}

export async function studyMore(userId: string, state: StudyState = "AZ") {
  await dailyStudyView(userId, undefined, undefined, state);
  const pro = await hasStatePro(userId, state);
  const { questions, cards } = pool(state, pro);
  const now = new Date().toISOString();
  const { store, doc, checks } = await loadDocument(userId, state, localDate(now, DEFAULT_STUDY_TIME_ZONE));
  const today = localDate(now, doc.settings.timeZone);
  const day = doc.days[today] || { tasks: [], visibleSeconds: 0 };
  const stats = await store.listStats(userId);
  const keys = new Set(day.tasks.map((task) => task.key));
  let sort = day.tasks.reduce((max, task) => Math.max(max, task.sort), 0);
  const tasks = [...day.tasks];
  const card = cards.find((item) => !doc.cards[item.id]?.firstStudiedAt && !keys.has(`card:${item.id}`));
  const question = questions.find((item) => !stats.some((stat) => stat.state === state && stat.questionId === item.question_id && stat.firstAt) && !keys.has(`question:${item.question_id}`));
  if (card) tasks.push({ key: `card:${card.id}`, kind: "new-card", status: "pending", sort: ++sort });
  if (question) tasks.push({ key: `question:${question.question_id}`, kind: "new-question", status: "pending", sort: ++sort });
  await saveDocument(store, userId, state, { ...doc, days: { ...doc.days, [today]: { ...day, tasks } } }, checks);
}

export async function addVisibleTime(userId: string, seconds: number, attemptId: string, state: StudyState = "AZ") {
  if (seconds <= 0 || seconds > 120) return;
  const now = new Date().toISOString();
  const { store, doc, checks } = await loadDocument(userId, state, localDate(now, DEFAULT_STUDY_TIME_ZONE));
  if (doc.attempts.includes(attemptId)) return;
  const today = localDate(now, doc.settings.timeZone);
  const day = doc.days[today] || { tasks: [], visibleSeconds: 0 };
  const next: StudyDocument = {
    ...doc,
    attempts: [...doc.attempts, attemptId].slice(-500),
    days: { ...doc.days, [today]: { ...day, visibleSeconds: day.visibleSeconds + Math.floor(seconds) } },
  };
  await saveDocument(store, userId, state, next, checks);
}

export function emptyFor(today: string) {
  return emptyDocument(today);
}
