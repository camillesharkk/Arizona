import "server-only";
import { publishedInQuestions } from "@/data/in-questions";
import { questionById } from "@/lib/prep-pack";

/** Indiana paid content must stay behind server entitlement checks. */
export function serverQuestionById(id: string) {
  return id.startsWith("in-") ? publishedInQuestions().find(question => question.question_id === id) ?? null : questionById(id);
}
