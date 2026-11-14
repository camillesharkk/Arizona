import { serverStateQuestions } from '@/data/full-state-server';
import { freeStateCatalog, isFreeState } from './free-state-catalog';
import "server-only";
import { publishedInQuestions } from "@/data/in-questions";
import { questionById } from "@/lib/prep-pack";

const stateQuestionIndex = new Map(freeStateCatalog.flatMap(([code]) => serverStateQuestions(code)).map(question => [question.question_id, question]));

/** Paid question lookups stay behind server entitlement checks. */
export function serverQuestionById(id: string) {
  const code = id.split('-')[0]?.toUpperCase();
  if (isFreeState(code)) return stateQuestionIndex.get(id) ?? null;
  return id.startsWith("in-") ? publishedInQuestions().find(question => question.question_id === id) ?? null : questionById(id);
}
