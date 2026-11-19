import { topics } from "../data/exam-config.ts";
import type { TopicId } from "./types.ts";

const TOPIC_IDS = new Set<string>(topics.map((topic) => topic.id));

export function isTopicSlug(value: string | undefined): value is TopicId {
  return Boolean(value && TOPIC_IDS.has(value));
}
