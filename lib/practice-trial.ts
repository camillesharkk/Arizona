import "server-only";

import { FREE_FULL_EXAMS } from "@/lib/product";
import { getStore } from "@/lib/store";

export async function fullTrialAvailable(state: string, owner: string, accountId?: string) {
  const store = await getStore();
  if (await store.getGuestExam(`practice-full:${owner}`, state)) return false;
  if (!accountId) return true;
  const mode = state === "AZ" ? "full" : `${state.toLowerCase()}-full`;
  return (await store.listExams(accountId)).filter((exam) => exam.mode === mode).length < FREE_FULL_EXAMS;
}
