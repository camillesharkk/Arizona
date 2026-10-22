import { eachDay, isStudyDay, localDate, shiftDate, weekdayIndex } from "./calendar.ts";
import { DEFAULT_STUDY_TIME_ZONE, scheduleReview } from "./review-schedule.ts";

export const PLAN_LENGTH_DAYS = 60;
export const FIRST_STUDY_DAYS = 40;

export type StudyMode = "recommended" | "custom";

export type StudySettings = {
  mode: StudyMode;
  targetDate: string;
  weekdays: number[];
  newCards: number | null;
  newQuestions: number | null;
  reviewTarget: number | null;
  timeZone: string;
  startedOn: string;
};

export type CardProgress = {
  firstStudiedAt: string | null;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
  reviewStage: number;
  reviewCount: number;
};

export type DayTask = {
  key: string;
  kind: "new-card" | "new-question" | "review-card" | "review-question";
  status: "pending" | "done";
  sort: number;
};

export type StudyDocument = {
  settings: StudySettings;
  cards: Record<string, CardProgress>;
  days: Record<string, { tasks: DayTask[]; visibleSeconds: number }>;
  attempts: string[];
};

export type ItemProgress = {
  id: string;
  wrongCount: number;
  reviewCount: number;
  reviewStage: number;
  firstAt: string | null;
  lastWrongAt: string | null;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
  mastered: boolean;
};

const ALL_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

export function defaultSettings(today: string, timeZone = DEFAULT_STUDY_TIME_ZONE): StudySettings {
  return {
    mode: "recommended",
    targetDate: shiftDate(today, PLAN_LENGTH_DAYS - 1),
    weekdays: ALL_WEEKDAYS,
    newCards: null,
    newQuestions: null,
    reviewTarget: null,
    timeZone,
    startedOn: today,
  };
}

export function emptyDocument(today: string, timeZone?: string): StudyDocument {
  return { settings: defaultSettings(today, timeZone), cards: {}, days: {}, attempts: [] };
}

export function normalizeDocument(raw: unknown, today: string, timeZone?: string): StudyDocument {
  const base = emptyDocument(today, timeZone);
  if (!raw || typeof raw !== "object") return base;
  const doc = raw as Partial<StudyDocument>;
  const settings = { ...base.settings, ...(doc.settings || {}) };
  if (!Array.isArray(settings.weekdays) || settings.weekdays.length === 0) settings.weekdays = ALL_WEEKDAYS;
  settings.weekdays = [...new Set(settings.weekdays.filter((day) => day >= 0 && day <= 6))].sort();
  if (settings.weekdays.length === 0) settings.weekdays = ALL_WEEKDAYS;
  return {
    settings,
    cards: doc.cards && typeof doc.cards === "object" ? doc.cards : {},
    days: doc.days && typeof doc.days === "object" ? doc.days : {},
    attempts: Array.isArray(doc.attempts) ? doc.attempts : [],
  };
}

function studyDaysFrom(start: string, end: string, weekdays: number[]) {
  return eachDay(start, end).filter((day) => isStudyDay(day, weekdays));
}

export function planDates(settings: StudySettings) {
  const firstWindowEnd = shiftDate(settings.startedOn, FIRST_STUDY_DAYS - 1);
  return { firstWindowEnd, targetDate: settings.targetDate };
}

export function pace(remaining: number, days: number) {
  if (remaining <= 0) return 0;
  if (days <= 0) return remaining;
  return Math.ceil(remaining / days);
}

type Track = { introducedOn: string | null; reviewCount: number; nextReviewAt: string | null; stage: number };

function blankTrack(): Track {
  return { introducedOn: null, reviewCount: 0, nextReviewAt: null, stage: 0 };
}

export function projectPlan(input: {
  settings: StudySettings;
  today: string;
  cardIds: string[];
  questionIds: string[];
  cards: Record<string, CardProgress>;
  questions: ItemProgress[];
  timeZone: string;
}) {
  const cards = new Map<string, Track>();
  const questions = new Map<string, Track>();
  for (const id of input.cardIds) {
    const row = input.cards[id];
    cards.set(id, row?.firstStudiedAt
      ? { introducedOn: localDate(row.firstStudiedAt, input.timeZone), reviewCount: row.reviewCount, nextReviewAt: row.nextReviewAt, stage: row.reviewStage }
      : blankTrack());
  }
  for (const id of input.questionIds) {
    const row = input.questions.find((item) => item.id === id);
    questions.set(id, row?.firstAt
      ? { introducedOn: localDate(row.firstAt, input.timeZone), reviewCount: row.reviewCount, nextReviewAt: row.nextReviewAt, stage: row.reviewStage }
      : blankTrack());
  }
  const unseen = (map: Map<string, Track>) => [...map].filter(([, row]) => !row.introducedOn).map(([id]) => id);
  const needsReview = (map: Map<string, Track>) => [...map].filter(([, row]) => row.introducedOn && row.reviewCount < 1).length;
  const settings = input.settings;
  if (settings.weekdays.length === 0) return { date: null as string | null, reason: "Choose at least one study day." };
  if (
    (settings.mode === "custom" && settings.newCards === 0 && unseen(cards).length > 0) ||
    (settings.mode === "custom" && settings.newQuestions === 0 && unseen(questions).length > 0) ||
    (settings.mode === "custom" && settings.reviewTarget === 0 && (needsReview(cards) + needsReview(questions) > 0 || unseen(cards).length + unseen(questions).length > 0))
  ) {
    return { date: null as string | null, reason: "New study or review is paused, so there is no completion date." };
  }

  let day = input.today;
  for (let guard = 0; guard < 1200; guard += 1) {
    const cardLeft = unseen(cards);
    const questionLeft = unseen(questions);
    const reviewLeft = needsReview(cards) + needsReview(questions);
    if (cardLeft.length === 0 && questionLeft.length === 0 && reviewLeft === 0) return { date: day, reason: null as string | null };
    if (!isStudyDay(day, settings.weekdays)) {
      day = shiftDate(day, 1);
      continue;
    }
    const { firstWindowEnd, targetDate } = planDates(settings);
    const introDays = studyDaysFrom(day, day < firstWindowEnd ? firstWindowEnd : targetDate, settings.weekdays).length || 1;
    const planDays = Math.max(studyDaysFrom(day, targetDate, settings.weekdays).length, 1);
    const newCards = settings.mode === "custom" && settings.newCards != null ? settings.newCards : pace(cardLeft.length, introDays);
    const newQuestions = settings.mode === "custom" && settings.newQuestions != null ? settings.newQuestions : pace(questionLeft.length, introDays);
    const reviewQuota = settings.mode === "custom" && settings.reviewTarget != null ? settings.reviewTarget : pace(reviewLeft + cardLeft.length + questionLeft.length, planDays);
    for (const id of cardLeft.slice(0, newCards)) {
      const row = cards.get(id)!;
      row.introducedOn = day;
      row.nextReviewAt = shiftDate(day, 1);
      row.stage = 0;
    }
    for (const id of questionLeft.slice(0, newQuestions)) {
      const row = questions.get(id)!;
      row.introducedOn = day;
      row.nextReviewAt = shiftDate(day, 1);
      row.stage = 0;
    }
    const due = [...cards, ...questions]
      .filter(([, row]) => row.introducedOn && row.introducedOn < day && row.reviewCount < 1 && row.nextReviewAt && row.nextReviewAt <= day)
      .map(([id]) => id);
    for (const id of due.slice(0, reviewQuota)) {
      const row = cards.get(id) || questions.get(id);
      if (!row) continue;
      row.reviewCount += 1;
      row.stage = Math.min(row.stage + 1, 3);
      row.nextReviewAt = shiftDate(day, [1, 7, 14, 30][row.stage]);
    }
    day = shiftDate(day, 1);
  }
  return { date: null as string | null, reason: "The remaining work does not finish on this schedule." };
}

export function recommendedQuotas(input: {
  settings: StudySettings;
  today: string;
  unseenCards: number;
  unseenQuestions: number;
  reviewBacklog: number;
  activeDays: number;
}) {
  const { firstWindowEnd, targetDate } = planDates(input.settings);
  const introEnd = input.today <= firstWindowEnd ? firstWindowEnd : targetDate;
  const introDays = studyDaysFrom(input.today, introEnd, input.settings.weekdays).length;
  const planDays = studyDaysFrom(input.today, targetDate, input.settings.weekdays).length;
  let newCards = pace(input.unseenCards, introDays);
  let newQuestions = pace(input.unseenQuestions, introDays);
  let reviews = pace(input.reviewBacklog, Math.max(planDays, 1));
  let reason: string | null = null;
  if (input.settings.mode === "recommended" && input.activeDays >= 3 && reviews > 0 && input.reviewBacklog > reviews * 2) {
    newCards = Math.max(0, newCards - 1);
    newQuestions = Math.max(0, newQuestions - 1);
    reviews += 1;
    reason = "Due reviews are ahead of the daily target, so new study is a little lower and review is a little higher.";
  }
  return { newCards, newQuestions, reviews, reason, introDays, planDays };
}

function cardTrack(doc: StudyDocument, id: string): CardProgress {
  return doc.cards[id] || { firstStudiedAt: null, lastReviewedAt: null, nextReviewAt: null, reviewStage: 0, reviewCount: 0 };
}

export function applyCardMark(
  doc: StudyDocument,
  input: { cardId: string; action: "studied" | "remembered" | "need-review"; now: string; timeZone: string }
): StudyDocument {
  const current = cardTrack(doc, input.cardId);
  const next = { ...current };
  if (input.action === "studied") {
    if (!next.firstStudiedAt) {
      next.firstStudiedAt = input.now;
      next.reviewStage = 0;
      next.nextReviewAt = scheduleReview(input.now, 0, input.timeZone);
    }
  } else if (!next.firstStudiedAt) {
    next.firstStudiedAt = input.now;
    next.reviewStage = 0;
    next.nextReviewAt = scheduleReview(input.now, 0, input.timeZone);
  } else if (input.action === "need-review") {
    next.reviewStage = 0;
    next.lastReviewedAt = input.now;
    next.nextReviewAt = scheduleReview(input.now, 0, input.timeZone);
  } else {
    const due = !next.nextReviewAt || Date.parse(next.nextReviewAt) <= Date.parse(input.now);
    const eligible = localDate(next.firstStudiedAt, input.timeZone) < localDate(input.now, input.timeZone);
    next.lastReviewedAt = input.now;
    if (due && eligible) {
      next.reviewStage = Math.min(next.reviewStage + 1, 3);
      next.reviewCount += 1;
      next.nextReviewAt = scheduleReview(input.now, next.reviewStage, input.timeZone);
    }
  }
  return { ...doc, cards: { ...doc.cards, [input.cardId]: next } };
}

export type BuiltDay = {
  tasks: DayTask[];
  goal: number;
  done: number;
  quotas: { newCards: number; newQuestions: number; reviews: number };
  yesterdayWaiting: { id: string; nextReviewAt: string }[];
  unmappedQuestionIds: string[];
  reason: string | null;
};

export function buildDay(input: {
  doc: StudyDocument;
  today: string;
  now: string;
  timeZone: string;
  cardIds: string[];
  questionIds: string[];
  questions: ItemProgress[];
  cardsByQuestion: Map<string, string[]>;
}): BuiltDay {
  const doc = input.doc;
  const questionById = new Map(input.questions.map((item) => [item.id, item]));
  const unseenCards = input.cardIds.filter((id) => !doc.cards[id]?.firstStudiedAt).sort();
  const unseenQuestions = input.questionIds.filter((id) => !questionById.get(id)?.firstAt).sort();
  const dueQuestions = input.questions.filter((item) => item.nextReviewAt && Date.parse(item.nextReviewAt) <= Date.parse(input.now) && !item.mastered);
  const reviewBacklog = dueQuestions.length + input.cardIds.filter((id) => {
    const card = doc.cards[id];
    return card?.nextReviewAt && Date.parse(card.nextReviewAt) <= Date.parse(input.now);
  }).length;
  const activeDays = Object.values(doc.days).filter((day) => day.tasks.some((task) => task.status === "done")).length;
  const quotas = recommendedQuotas({
    settings: doc.settings,
    today: input.today,
    unseenCards: unseenCards.length,
    unseenQuestions: unseenQuestions.length,
    reviewBacklog,
    activeDays,
  });
  const used = {
    newCards: doc.settings.mode === "custom" && doc.settings.newCards != null ? doc.settings.newCards : quotas.newCards,
    newQuestions: doc.settings.mode === "custom" && doc.settings.newQuestions != null ? doc.settings.newQuestions : quotas.newQuestions,
    reviews: doc.settings.mode === "custom" && doc.settings.reviewTarget != null ? doc.settings.reviewTarget : quotas.reviews,
  };
  const yesterday = shiftDate(input.today, -1);
  const yesterdayWaiting = input.questions
    .filter((item) => item.wrongCount > 0 && item.lastWrongAt && localDate(item.lastWrongAt, input.timeZone) === yesterday)
    .filter((item) => item.nextReviewAt && Date.parse(item.nextReviewAt) > Date.parse(input.now))
    .map((item) => ({ id: item.id, nextReviewAt: item.nextReviewAt as string }));
  const waitingIds = new Set(yesterdayWaiting.map((item) => item.id));
  const unmappedQuestionIds = input.questions
    .filter((item) => item.wrongCount > 0 && (input.cardsByQuestion.get(item.id) || []).length === 0)
    .map((item) => item.id)
    .sort();

  const existing = doc.days[input.today]?.tasks ? doc.days[input.today].tasks.map((task) => ({ ...task })) : [];
  const keys = new Set(existing.map((task) => task.key));
  let sort = existing.reduce((max, task) => Math.max(max, task.sort), 0);

  function add(key: string, kind: DayTask["kind"]) {
    if (keys.has(key)) return;
    keys.add(key);
    sort += 1;
    existing.push({ key, kind, status: "pending", sort });
  }

  const newCardCount = existing.filter((task) => task.kind === "new-card").length;
  const newQuestionCount = existing.filter((task) => task.kind === "new-question").length;
  for (const id of unseenCards.slice(0, Math.max(0, used.newCards - newCardCount))) add(`card:${id}`, "new-card");
  for (const id of unseenQuestions.slice(0, Math.max(0, used.newQuestions - newQuestionCount))) add(`question:${id}`, "new-question");

  type ReviewCandidate = { key: string; kind: DayTask["kind"]; rank: number; wrong: number; next: string; id: string };
  const reviews: ReviewCandidate[] = [];
  function pushReview(candidate: ReviewCandidate) {
    if (reviews.some((item) => item.key === candidate.key) || keys.has(candidate.key)) return;
    reviews.push(candidate);
  }
  const rankedWrong = dueQuestions
    .filter((item) => !waitingIds.has(item.id))
    .map((item) => {
      const yesterdayWrong = item.lastWrongAt && localDate(item.lastWrongAt, input.timeZone) === yesterday;
      return { item, rank: yesterdayWrong ? 0 : item.wrongCount > 0 ? 1 : 2 };
    })
    .sort((a, b) => a.rank - b.rank || b.item.wrongCount - a.item.wrongCount || (a.item.nextReviewAt || "").localeCompare(b.item.nextReviewAt || "") || a.item.id.localeCompare(b.item.id));
  for (const { item, rank } of rankedWrong) {
    pushReview({ key: `question:${item.id}`, kind: "review-question", rank, wrong: item.wrongCount, next: item.nextReviewAt || "", id: item.id });
    const wrong = item.wrongCount;
    for (const cardId of input.cardsByQuestion.get(item.id) || []) {
      const card = doc.cards[cardId];
      if (!card?.nextReviewAt || Date.parse(card.nextReviewAt) > Date.parse(input.now)) continue;
      pushReview({ key: `card:${cardId}`, kind: "review-card", rank, wrong, next: card.nextReviewAt, id: cardId });
    }
  }
  for (const id of input.cardIds) {
    const card = doc.cards[id];
    if (!card?.nextReviewAt || Date.parse(card.nextReviewAt) > Date.parse(input.now)) continue;
    const linkedWrong = input.questions.filter((item) => (input.cardsByQuestion.get(item.id) || []).includes(id));
    const wrong = linkedWrong.reduce((max, item) => Math.max(max, item.wrongCount), 0);
    pushReview({ key: `card:${id}`, kind: "review-card", rank: 2, wrong, next: card.nextReviewAt, id });
  }
  reviews.sort((a, b) => a.rank - b.rank || b.wrong - a.wrong || a.next.localeCompare(b.next) || a.id.localeCompare(b.id));
  for (const review of reviews) add(review.key, review.kind);

  for (const task of existing) {
    if (task.kind === "new-card" && doc.cards[task.key.slice(5)]?.firstStudiedAt) task.status = "done";
    if (task.kind === "new-question" && questionById.get(task.key.slice(9))?.firstAt) task.status = "done";
    if (task.kind === "review-card") {
      const card = doc.cards[task.key.slice(5)];
      if (card?.lastReviewedAt && localDate(card.lastReviewedAt, input.timeZone) === input.today) task.status = "done";
    }
    if (task.kind === "review-question") {
      const question = questionById.get(task.key.slice(9));
      if (question?.lastReviewedAt && localDate(question.lastReviewedAt, input.timeZone) === input.today) task.status = "done";
    }
  }

  const keptNewCards = existing.filter((task) => task.kind === "new-card" && task.status === "done");
  const pendingNewCards = existing.filter((task) => task.kind === "new-card" && task.status === "pending").slice(0, used.newCards);
  const keptNewQuestions = existing.filter((task) => task.kind === "new-question" && task.status === "done");
  const pendingNewQuestions = existing.filter((task) => task.kind === "new-question" && task.status === "pending").slice(0, used.newQuestions);
  const reviewsKept = existing.filter((task) => task.kind === "review-card" || task.kind === "review-question");
  const tasks = [...keptNewCards, ...pendingNewCards, ...keptNewQuestions, ...pendingNewQuestions, ...reviewsKept].sort((a, b) => a.sort - b.sort);
  const done = tasks.filter((task) => task.status === "done").length;
  const goal = used.newCards + used.newQuestions + Math.min(used.reviews, reviewsKept.filter((task) => task.status === "pending").length + reviewsKept.filter((task) => task.status === "done").length);
  return { tasks, goal, done, quotas: used, yesterdayWaiting, unmappedQuestionIds, reason: doc.settings.mode === "recommended" ? quotas.reason : null };
}

export function dayNumber(startedOn: string, today: string) {
  return eachDay(startedOn, today).length;
}

export function weekdayLabel(index: number) {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][index] || "";
}

export { weekdayIndex };
