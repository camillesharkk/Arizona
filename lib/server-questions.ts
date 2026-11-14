import { serverStateQuestions } from '@/data/full-state-server';
import { isFreeState } from './free-state-catalog';
import "server-only";
import { publishedInQuestions } from "@/data/in-questions";
import { questionById } from "@/lib/prep-pack";

/** Indiana paid content must stay behind server entitlement checks. */
export function serverQuestionById(id: string) {
  const code = id.split('-')[0]?.toUpperCase();
  if (isFreeState(code)) return serverStateQuestions(code).find(question => question.question_id === id) ?? null;
  return id.startsWith("in-") ? publishedInQuestions().find(question => question.question_id === id) ?? null : questionById(id);
}
