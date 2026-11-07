export type CaCheck = { wrong: number; skipped: number; wrongIds: string[] };

export type CaExamLike = {
  id: string;
  mode: string;
  correctCount: number;
  total: number;
  at: string;
};

export type CaStatLike = {
  questionId: string;
  state: string;
  wrongCount: number;
  mastered: boolean;
  nextReviewAt: string | null;
  lastWrongAt: string | null;
  savedForReview?: boolean;
};

const RECOVER_MS = 10 * 60 * 1000;

export function dueQuestionIds(stats: CaStatLike[], now: string, state = "CA") {
  return stats
    .filter((stat) => stat.state === state && !stat.mastered && stat.nextReviewAt && stat.nextReviewAt <= now && (stat.wrongCount > 0 || stat.savedForReview))
    .map((stat) => stat.questionId);
}

export function recoverWrongIds(examAt: string, stats: CaStatLike[], state = "CA") {
  const at = Date.parse(examAt);
  if (!Number.isFinite(at)) return [];
  return stats
    .filter((stat) => stat.state === state && stat.wrongCount > 0 && stat.lastWrongAt && Math.abs(Date.parse(stat.lastWrongAt) - at) <= RECOVER_MS)
    .map((stat) => stat.questionId);
}

export function recentCaExams(exams: CaExamLike[], checks: Record<string, CaCheck>, stats: CaStatLike[], state: "CA" | "HI" = "CA") {
  const prefix = state === "HI" ? "hi-" : "ca-";
  return exams
    .filter((exam) => exam.mode.startsWith(prefix))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 8)
    .map((exam) => {
      const saved = checks[exam.id];
      const recovered = saved?.wrongIds?.length ? saved.wrongIds : recoverWrongIds(exam.at, stats, state);
      const wrong = saved ? saved.wrong : recovered.length || Math.max(0, exam.total - exam.correctCount);
      const skipped = saved ? saved.skipped : 0;
      return {
        id: exam.id,
        at: exam.at,
        mode: exam.mode,
        label: exam.mode.endsWith("full") ? (state === "HI" ? "Comprehensive Practice" : "Full 45") : exam.mode.endsWith("quick") ? "Quick 10" : exam.mode.endsWith("weak") ? "Weak areas" : "Topic practice",
        correct: exam.correctCount,
        total: exam.total,
        wrong,
        skipped,
        wrongIds: saved?.wrongIds?.length ? saved.wrongIds : recovered,
        recovered: !saved?.wrongIds?.length && recovered.length > 0,
      };
    });
}
