import { publishedQuestions } from "@/data/questions";
import { localDate } from "@/lib/calendar";
import { hasArizonaPro } from "@/lib/entitlements";
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
import { DEFAULT_STUDY_TIME_ZONE } from "@/lib/review-schedule";
import { getStore } from "@/lib/store";

const STATE = "AZ";

function pool(isPro: boolean) {
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

async function loadDocument(userId: string, today: string, timeZoneHint?: string) {
  const store = await getStore();
  const row = await store.getStudyPlan(userId, STATE);
  const hint = timeZoneHint && timeZoneHint.length < 80 ? timeZoneHint : undefined;
  const doc = normalizeDocument(row?.document, today, hint || DEFAULT_STUDY_TIME_ZONE);
  if (!row && hint) doc.settings.timeZone = hint;
  return doc;
}

export async function dailyStudyView(userId: string, timeZoneHint?: string, now = new Date().toISOString()) {
  const pro = await hasArizonaPro(userId);
  const storeForExpiry = await getStore();
  const expires = await storeForExpiry.getLatestArizonaExpiry(userId);
  let doc = await loadDocument(userId, localDate(now, timeZoneHint || DEFAULT_STUDY_TIME_ZONE), timeZoneHint);
  const timeZone = doc.settings.timeZone || DEFAULT_STUDY_TIME_ZONE;
  const today = localDate(now, timeZone);
  const { questions, cards, cardsByQuestion } = pool(pro);
  const store = await getStore();
  const stats = await store.listStats(userId);
  const progress: ItemProgress[] = questions.map((question) => {
    const stat = stats.find((item) => item.questionId === question.question_id && item.state === STATE);
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
  await store.saveStudyPlan({ userId, state: STATE, document: doc });
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
    freeOnly: !pro,
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
  };
}

export async function saveStudySettings(userId: string, patch: Partial<StudySettings> & { restore?: boolean }, timeZoneHint?: string) {
  const now = new Date().toISOString();
  const store = await getStore();
  const row = await store.getStudyPlan(userId, STATE);
  const doc = normalizeDocument(row?.document, localDate(now, timeZoneHint || DEFAULT_STUDY_TIME_ZONE), timeZoneHint);
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
  await store.saveStudyPlan({ userId, state: STATE, document: next });
  return settings;
}

export async function markDailyCard(userId: string, input: { cardId: string; action: "studied" | "remembered" | "need-review"; attemptId: string }) {
  const pro = await hasArizonaPro(userId);
  const allowed = new Set(pool(pro).cards.map((card) => card.id));
  if (!allowed.has(input.cardId)) throw new Error("not_allowed");
  const store = await getStore();
  const now = new Date().toISOString();
  const row = await store.getStudyPlan(userId, STATE);
  let doc = normalizeDocument(row?.document, localDate(now, DEFAULT_STUDY_TIME_ZONE));
  if (doc.attempts.includes(input.attemptId)) return doc;
  doc = applyCardMark(doc, { cardId: input.cardId, action: input.action, now, timeZone: doc.settings.timeZone });
  doc = { ...doc, attempts: [...doc.attempts, input.attemptId].slice(-500) };
  await store.saveStudyPlan({ userId, state: STATE, document: doc });
  return doc;
}

export async function studyMore(userId: string) {
  await dailyStudyView(userId);
  const pro = await hasArizonaPro(userId);
  const { questions, cards } = pool(pro);
  const store = await getStore();
  const now = new Date().toISOString();
  const row = await store.getStudyPlan(userId, STATE);
  const doc = normalizeDocument(row?.document, localDate(now, DEFAULT_STUDY_TIME_ZONE));
  const today = localDate(now, doc.settings.timeZone);
  const day = doc.days[today] || { tasks: [], visibleSeconds: 0 };
  const stats = await store.listStats(userId);
  const keys = new Set(day.tasks.map((task) => task.key));
  let sort = day.tasks.reduce((max, task) => Math.max(max, task.sort), 0);
  const tasks = [...day.tasks];
  const card = cards.find((item) => !doc.cards[item.id]?.firstStudiedAt && !keys.has(`card:${item.id}`));
  const question = questions.find((item) => !stats.some((stat) => stat.questionId === item.question_id && stat.firstAt) && !keys.has(`question:${item.question_id}`));
  if (card) tasks.push({ key: `card:${card.id}`, kind: "new-card", status: "pending", sort: ++sort });
  if (question) tasks.push({ key: `question:${question.question_id}`, kind: "new-question", status: "pending", sort: ++sort });
  await store.saveStudyPlan({ userId, state: STATE, document: { ...doc, days: { ...doc.days, [today]: { ...day, tasks } } } });
}

export async function addVisibleTime(userId: string, seconds: number, attemptId: string) {
  if (seconds <= 0 || seconds > 120) return;
  const store = await getStore();
  const now = new Date().toISOString();
  const row = await store.getStudyPlan(userId, STATE);
  const doc = normalizeDocument(row?.document, localDate(now, DEFAULT_STUDY_TIME_ZONE));
  if (doc.attempts.includes(attemptId)) return;
  const today = localDate(now, doc.settings.timeZone);
  const day = doc.days[today] || { tasks: [], visibleSeconds: 0 };
  const next: StudyDocument = {
    ...doc,
    attempts: [...doc.attempts, attemptId].slice(-500),
    days: { ...doc.days, [today]: { ...day, visibleSeconds: day.visibleSeconds + Math.floor(seconds) } },
  };
  await store.saveStudyPlan({ userId, state: STATE, document: next });
}

export function emptyFor(today: string) {
  return emptyDocument(today);
}
