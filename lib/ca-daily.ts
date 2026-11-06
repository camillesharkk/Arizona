import { caCards } from "@/data/ca-cards";
import { publishedCaQuestions } from "@/data/ca-questions";
import { localDate } from "@/lib/calendar";
import { dueQuestionIds, recentCaExams, type CaCheck } from "@/lib/ca-daily-shape";
import { DEFAULT_STUDY_TIME_ZONE, scheduleReview } from "@/lib/review-schedule";
import { getStore } from "@/lib/store";
import { buildDay, dayNumber, normalizeDocument, planDates, type ItemProgress } from "@/lib/study-plan";

function checksFrom(raw: unknown): Record<string, CaCheck> {
  if (!raw || typeof raw !== "object" || !("checks" in raw)) return {};
  const checks = (raw as { checks?: unknown }).checks;
  if (!checks || typeof checks !== "object") return {};
  const out: Record<string, CaCheck> = {};
  for (const [id, value] of Object.entries(checks)) {
    if (!value || typeof value !== "object") continue;
    const row = value as Partial<CaCheck>;
    const wrongIds = Array.isArray(row.wrongIds) ? row.wrongIds.filter((item) => typeof item === "string") : [];
    out[id] = {
      wrong: typeof row.wrong === "number" ? row.wrong : wrongIds.length,
      skipped: typeof row.skipped === "number" ? row.skipped : 0,
      wrongIds,
    };
  }
  return out;
}

export async function saveCaExamCheck(userId: string, examId: string, input: { wrongIds: string[]; skipped: number }) {
  const store = await getStore();
  const row = await store.getStudyPlan(userId, "CA");
  const raw = row?.document && typeof row.document === "object" ? { ...(row.document as Record<string, unknown>) } : {};
  const checks = checksFrom(raw);
  const prev = checks[examId];
  if (prev?.wrongIds.length && input.wrongIds.length === 0) return;
  checks[examId] = { wrong: input.wrongIds.length, skipped: input.skipped, wrongIds: input.wrongIds };
  await store.saveStudyPlan({ userId, state: "CA", document: { ...raw, checks } });
}

export async function caDailyView(userId: string, timeZoneHint?: string, now = new Date().toISOString()) {
  const store = await getStore();
  const timeZone = timeZoneHint && timeZoneHint.length < 80 ? timeZoneHint : DEFAULT_STUDY_TIME_ZONE;
  const today = localDate(now, timeZone);
  const [stats, exams, plan] = await Promise.all([
    store.listStats(userId),
    store.listExams(userId),
    store.getStudyPlan(userId, "CA"),
  ]);
  const caStats = stats.filter((stat) => stat.state === "CA");
  for (const stat of caStats) {
    if (stat.mastered || stat.wrongCount <= 0 || stat.nextReviewAt) continue;
    const from = stat.lastWrongAt || stat.firstAt || now;
    stat.nextReviewAt = scheduleReview(from, stat.reviewStage || 0, timeZone);
    await store.updateReviewStat(userId, stat.questionId, { nextReviewAt: stat.nextReviewAt });
  }
  const checks = checksFrom(plan?.document);
  const recent = recentCaExams(exams, checks, caStats);
  const questions = publishedCaQuestions();
  const byId = new Map(questions.map((question) => [question.question_id, question]));
  const due = caStats.filter((stat) => dueQuestionIds([stat], now).length > 0 && byId.has(stat.questionId));
  const nextReviewAt = caStats
    .map((stat) => stat.nextReviewAt)
    .filter((value): value is string => Boolean(value && Date.parse(value) > Date.parse(now)))
    .sort()[0] || null;
  const doc = normalizeDocument(plan?.document, today, timeZone);
  if (!plan && timeZoneHint) doc.settings.timeZone = timeZone;
  const progress: ItemProgress[] = questions.map((question) => {
    const stat = caStats.find((item) => item.questionId === question.question_id);
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
  const cardsByQuestion = new Map<string, string[]>();
  for (const card of caCards) {
    for (const question of questions) {
      if (question.study_topic !== card.study) continue;
      const list = cardsByQuestion.get(question.question_id) || [];
      list.push(card.id);
      cardsByQuestion.set(question.question_id, list);
    }
  }
  const built = buildDay({
    doc,
    today,
    now,
    timeZone,
    cardIds: caCards.map((card) => card.id),
    questionIds: questions.map((question) => question.question_id),
    questions: progress,
    cardsByQuestion,
  });
  const previousSeconds = doc.days[today]?.visibleSeconds ?? 0;
  const nextDoc = { ...doc, days: { ...doc.days, [today]: { tasks: built.tasks, visibleSeconds: previousSeconds } }, checks };
  await store.saveStudyPlan({ userId, state: "CA", document: nextDoc });
  const cardById = new Map(caCards.map((card) => [card.id, card]));
  const todayCards = built.tasks.flatMap((task) => {
    if (task.kind !== "new-card" || task.status !== "pending") return [];
    const card = cardById.get(task.key.slice(5));
    return card ? [{ id: card.id, title: card.title, front: card.front, study: card.study }] : [];
  });
  const todayQuestionIds = built.tasks.filter((task) => task.kind === "new-question" && task.status === "pending").map((task) => task.key.slice(9));
  return {
    state: "CA" as const,
    today,
    dayNumber: dayNumber(doc.settings.startedOn, today),
    done: built.done,
    goal: built.goal,
    targetDate: planDates(doc.settings).targetDate,
    recent,
    due: due.map((stat) => {
      const question = byId.get(stat.questionId)!;
      return { questionId: question.question_id, prompt: question.question_text, due: stat.nextReviewAt, area: question.exam_area };
    }),
    nextReviewAt,
    todayCards,
    todayQuestionIds,
    hasPractice: recent.length > 0 || caStats.some((stat) => stat.firstAt || stat.savedForReview),
    scheduled: caStats
      .filter((stat) => !stat.mastered && (stat.wrongCount > 0 || stat.savedForReview) && byId.has(stat.questionId))
      .map((stat) => {
        const question = byId.get(stat.questionId)!;
        return {
          questionId: question.question_id,
          prompt: question.question_text,
          nextReviewAt: stat.nextReviewAt,
          wrongCount: stat.wrongCount,
          saved: Boolean(stat.savedForReview),
          due: Boolean(stat.nextReviewAt && stat.nextReviewAt <= now),
        };
      })
      .sort((a, b) => (a.nextReviewAt || "9").localeCompare(b.nextReviewAt || "9")),
  };
}
