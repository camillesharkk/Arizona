import { publishedCaQuestions } from "@/data/ca-questions";
import { getStore } from "@/lib/store";

export async function caDailyView(userId: string) {
  const store = await getStore();
  const stats = await store.listStats(userId);
  const questions = new Map(publishedCaQuestions().map((question) => [question.question_id, question]));
  const now = new Date().toISOString();
  const due = stats.filter((stat) => stat.state === "CA" && stat.nextReviewAt && stat.nextReviewAt <= now && questions.has(stat.questionId));
  return {
    state: "CA",
    due: due.map((stat) => {
      const question = questions.get(stat.questionId)!;
      return {
        questionId: question.question_id,
        prompt: question.question_text,
        due: stat.nextReviewAt,
        area: question.exam_area,
      };
    }),
  };
}
