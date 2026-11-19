import type { Question, TopicId } from "./types.ts";
import { paths } from "./paths.ts";
import { weakTopics } from "./quiz-ui.ts";

export type AnsweredResult = {
  question: Question;
  selected?: string;
  correct: boolean;
};

/** Weakest topic among questions the user actually answered wrong. Skips do not count as evidence. */
export function weakestMissedTopic(items: AnsweredResult[]): { topic: TopicId; label: string } | null {
  const answered = items.filter((item) => item.selected);
  if (!answered.some((item) => !item.correct)) return null;
  const [top] = weakTopics(
    answered.map((item) => ({ question: item.question, correct: item.correct })),
    1
  );
  if (!top || top.wrong < 1) return null;
  return { topic: top.topic, label: top.label };
}

/** Pro opens the topic's study cards. Everyone else gets the public study-guide chapter. */
export function topicStudyHref(topic: TopicId, isPro: boolean) {
  return isPro ? `${paths.studyCards}?topic=${topic}` : `${paths.study}#${topic}`;
}
