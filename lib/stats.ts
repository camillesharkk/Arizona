import type { ExamRow, QuestionStat } from "@/lib/store/types";

export function readinessScore(stats: QuestionStat[], exams: { score: number }[]) {
  const answered = stats.reduce((n, s) => n + s.rightCount + s.wrongCount, 0);
  const right = stats.reduce((n, s) => n + s.rightCount, 0);
  const acc = answered ? Math.round((right / answered) * 100) : 0;
  const last = exams[0]?.score ?? 0;
  const coverage = Math.min(100, Math.round((stats.length / 48) * 100));
  return Math.round(acc * 0.5 + last * 0.3 + coverage * 0.2);
}
