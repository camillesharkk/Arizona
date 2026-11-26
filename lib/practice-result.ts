type Topic = { id: string; label: string };
type Answer = {
  id: string;
  selected?: string;
  correctOption?: string;
  topic?: Topic;
  unscored?: boolean;
};

export function diagnosePractice(rows: Answer[]) {
  const selected = rows.filter(row => row.selected);
  const skipped = rows.length - selected.length;
  const unscored = rows.filter(row => row.unscored).length;
  const unavailable = { topics: [], skipped, unscored, unmapped: 0, firstMissedId: undefined };
  if (!rows.length) return { ...unavailable, status: "unavailable" as const };
  if (!selected.length) return { ...unavailable, status: "unanswered" as const };
  if (selected.some(row => !row.correctOption)) return { ...unavailable, status: "pending" as const };

  const topics = new Map<string, Topic & { answered: number; correct: number; missed: number }>();
  let unmapped = 0;
  for (const row of selected) {
    if (!row.topic) {
      unmapped += 1;
      continue;
    }
    const topic = topics.get(row.topic.id) ?? { ...row.topic, answered: 0, correct: 0, missed: 0 };
    topic.answered += 1;
    if (row.selected === row.correctOption) topic.correct += 1;
    else topic.missed += 1;
    topics.set(topic.id, topic);
  }
  const firstMissedId = selected.find(row => row.selected !== row.correctOption)?.id;
  return {
    status: firstMissedId ? "complete" as const : "all-correct" as const,
    topics: [...topics.values()].sort((a, b) => b.missed - a.missed || a.label.localeCompare(b.label)),
    skipped,
    unscored,
    unmapped,
    firstMissedId,
  };
}

export type PracticeDiagnosis = ReturnType<typeof diagnosePractice>;
export type PracticeResultOffer = { extraQuestions: number };

export function resultOffer({ purchaseEnabled, isPro, counts }: {
  purchaseEnabled: boolean;
  isPro: boolean | undefined;
  counts: { published: number; free: number; pro: number };
}): PracticeResultOffer | null {
  if (!purchaseEnabled || isPro !== false || counts.pro <= 0 || counts.free + counts.pro !== counts.published) return null;
  return { extraQuestions: counts.pro };
}

export const RESULT_EVENT_VERSION = 1;

export function claimResultView(storage: Pick<Storage, "getItem" | "setItem">, state: string, attempt: string) {
  if (!attempt) return false;
  const key = `notary:result-view:v${RESULT_EVENT_VERSION}:${state}:${attempt}`;
  try {
    if (storage.getItem(key)) return false;
    storage.setItem(key, "1");
    return true;
  } catch {
    return false;
  }
}
