import type { ExamRow, QuestionStat } from "@/lib/store/types";
import { topicLabel } from "@/lib/quiz";
import type { TopicId } from "@/lib/types";
import { addDays, arizonaToday } from "./arizona-time";

export function overallAccuracy(stats: QuestionStat[]) {
  const right = stats.reduce((n, s) => n + s.rightCount, 0);
  const wrong = stats.reduce((n, s) => n + s.wrongCount, 0);
  const answered = right + wrong;
  return { answered, right, wrong, accuracy: answered ? Math.round((right / answered) * 100) : 0 };
}

function inWindow(iso: string | null, startYmd: string, endYmd: string) {
  if (!iso) return false;
  const day = iso.slice(0, 10);
  return day >= startYmd && day <= endYmd;
}

function windowStats(stats: QuestionStat[], startYmd: string, endYmd: string) {
  const practiced = stats.filter((s) => inWindow(s.lastAt, startYmd, endYmd));
  const correct = practiced.filter((s) => s.lastCorrect).length;
  const wrong = practiced.length - correct;
  const byTopic = new Map<string, { correct: number; total: number }>();
  for (const s of practiced) {
    const cur = byTopic.get(s.topic) || { correct: 0, total: 0 };
    cur.total += 1;
    if (s.lastCorrect) cur.correct += 1;
    byTopic.set(s.topic, cur);
  }
  const ranked = [...byTopic.entries()]
    .filter(([, v]) => v.total > 0)
    .map(([topic, v]) => ({
      topic,
      label: topicLabel(topic as TopicId),
      accuracy: Math.round((v.correct / v.total) * 100),
      total: v.total,
    }))
    .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total);
  return {
    questionsPracticed: practiced.length,
    correct,
    wrong,
    accuracy: practiced.length ? Math.round((correct / practiced.length) * 100) : 0,
    weakest: ranked[0] || null,
    strongest: ranked.length ? ranked[ranked.length - 1] : null,
  };
}

export function weeklyReport(stats: QuestionStat[], exams: ExamRow[], today = arizonaToday()) {
  const thisStart = addDays(today, -6);
  const prevEnd = addDays(thisStart, -1);
  const prevStart = addDays(prevEnd, -6);
  const current = windowStats(stats, thisStart, today);
  const previous = windowStats(stats, prevStart, prevEnd);
  const testsThisWeek = exams.filter((e) => inWindow(e.at, thisStart, today)).length;
  const testsLastWeek = exams.filter((e) => inWindow(e.at, prevStart, prevEnd)).length;
  return { thisStart, today, current, previous, testsThisWeek, testsLastWeek };
}
