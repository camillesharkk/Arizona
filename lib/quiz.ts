import type { Question, TopicId } from "@/lib/types";
import { topics } from "@/data/exam-config";
import { examConfig } from "@/data/exam-config";
import { publishedQuestions } from "@/data/questions";
import { isActiveQuestion } from "@/lib/question-status";

export { isActiveQuestion };

export type Letter = "A" | "B" | "C" | "D";
const LETTERS: Letter[] = ["A", "B", "C", "D"];

export function shuffle<T>(items: T[], seed?: number): T[] {
  const copy = [...items];
  let s = seed ?? Date.now() % 100000;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function hashId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

export function eligibleExamPool(opts?: { freeOnly?: boolean; topic?: TopicId }): Question[] {
  let pool = publishedQuestions().filter((q) => isActiveQuestion(q));
  if (opts?.freeOnly) pool = pool.filter((q) => q.is_free);
  if (opts?.topic) pool = pool.filter((q) => q.topic === opts.topic);
  return pool;
}

export function pickExamSet(
  count: number,
  opts?: { freeOnly?: boolean; topic?: TopicId; requireExact?: boolean; seed?: number }
): Question[] {
  const pool = eligibleExamPool({ freeOnly: opts?.freeOnly, topic: opts?.topic });
  const picked = shuffle(pool, opts?.seed).slice(0, count);
  if (opts?.requireExact && picked.length !== count) return [];
  return picked;
}

export function pickFullExam(seed?: number): Question[] {
  return pickExamSet(examConfig.questionCount, { requireExact: true, seed });
}

export function pickQuickExam(seed?: number, freeOnly = false): Question[] {
  return pickExamSet(10, { requireExact: true, freeOnly, seed });
}

/** Session-stable option order. Display letters map back to original bank letters for scoring. */
export function shuffleQuestionOptions(
  q: Question,
  seed: number
): { question: Question; toOriginal: Record<Letter, Letter> } {
  const order = shuffle([...LETTERS], seed + hashId(q.question_id)) as Letter[];
  const texts: Record<Letter, string> = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d };
  const fbs = q.option_feedback;
  const toOriginal: Record<Letter, Letter> = { A: order[0], B: order[1], C: order[2], D: order[3] };
  const origToDisplay = Object.fromEntries(LETTERS.map((d) => [toOriginal[d], d])) as Record<Letter, Letter>;
  return {
    toOriginal,
    question: {
      ...q,
      option_a: texts[order[0]],
      option_b: texts[order[1]],
      option_c: texts[order[2]],
      option_d: texts[order[3]],
      option_feedback: {
        A: fbs[order[0]],
        B: fbs[order[1]],
        C: fbs[order[2]],
        D: fbs[order[3]],
      },
      correct_option: origToDisplay[q.correct_option],
      explanation: rewriteOptionLetters(q.explanation, origToDisplay),
    },
  };
}

/** Avoid A→B then B→C collisions when rewriting letter mentions. */
function rewriteOptionLetters(text: string, origToDisplay: Record<Letter, Letter>): string {
  let out = text;
  for (const orig of LETTERS) {
    const token = `__OPT_${orig}__`;
    out = out.replace(new RegExp(`\\boption ${orig}\\b`, "gi"), `option ${token}`);
    out = out.replace(new RegExp(`\\bOption ${orig}\\b`, "g"), `Option ${token}`);
  }
  for (const orig of LETTERS) {
    const display = origToDisplay[orig];
    out = out.replaceAll(`option __OPT_${orig}__`, `option ${display}`);
    out = out.replaceAll(`Option __OPT_${orig}__`, `Option ${display}`);
  }
  return out;
}

export function scorePercent(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export function topicLabel(id: TopicId): string {
  return topics.find((t) => t.id === id)?.label ?? id;
}

export function weakTopics(
  results: { question: Question; correct: boolean }[],
  limit = 2
): { topic: TopicId; label: string; wrong: number; total: number }[] {
  const map = new Map<TopicId, { wrong: number; total: number }>();
  for (const r of results) {
    const cur = map.get(r.question.topic) ?? { wrong: 0, total: 0 };
    cur.total += 1;
    if (!r.correct) cur.wrong += 1;
    map.set(r.question.topic, cur);
  }
  return [...map.entries()]
    .map(([topic, v]) => ({ topic, label: topicLabel(topic), ...v }))
    .sort((a, b) => b.wrong / b.total - a.wrong / a.total || b.wrong - a.wrong)
    .slice(0, limit);
}
