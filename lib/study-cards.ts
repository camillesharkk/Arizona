import { knowledgeCards } from "../data/knowledge-cards.ts";
import { publishedQuestions } from "../data/questions.ts";
import { topics } from "../data/exam-config.ts";
import { chapters } from "../data/study-guide.ts";
import { findSource } from "../data/sources.ts";
import type { Flashcard, TopicId } from "./types.ts";

export const HOME_STUDY_CARD_IDS = [
  "kc-id",
  "kc-appearance",
  "cmp-appearance-remote",
  "kc-thumbprint",
  "cmp-thumbprint",
  "kc-spouse",
  "kc-advice",
  "kc-fee",
] as const;

const TOPIC_IDS = new Set<string>(topics.map((topic) => topic.id));

export const chapterTopic = Object.fromEntries(chapters.map((chapter) => [chapter.id, chapter.topic])) as Record<
  string,
  TopicId
>;

export type StudyCardRecord = {
  id: string;
  category: string;
  topic: TopicId;
  title?: string;
  front: string;
  back: string;
  rule?: string;
  boundary?: string;
  example?: string;
  mixup?: string;
  memory?: string;
  source_id: string;
  question_ids?: string[];
  kind?: Flashcard["kind"];
  compare?: Flashcard["compare"];
  pendingVerification?: boolean;
};

function derivedCard(question: ReturnType<typeof publishedQuestions>[number]): StudyCardRecord {
  const explanation = question.explanation?.trim() || "";
  const pending = explanation.length < 40 || !findSource(question.source_id);
  const wrong = (["A", "B", "C", "D"] as const).find((letter) => letter !== question.correct_option);
  return {
    id: `qc-${question.question_id}`,
    category: question.topic,
    topic: question.topic,
    title: question.source_reference,
    front: question.question_text,
    back: pending ? "" : explanation,
    rule: pending ? "" : explanation,
    mixup: pending || !wrong ? undefined : question.option_feedback[wrong],
    source_id: question.source_id,
    question_ids: [question.question_id],
    kind: "core",
    pendingVerification: pending,
  };
}

function authoredCards(): StudyCardRecord[] {
  const cards = knowledgeCards.flatMap((card) => (card.topic ? [{ ...card, topic: card.topic, question_ids: [...(card.question_ids ?? [])] }] : []));
  const byId = new Map(cards.map((card) => [card.id, card]));
  for (const question of publishedQuestions()) {
    for (const conceptId of question.concept_ids ?? []) {
      const card = byId.get(conceptId);
      if (card && !card.question_ids?.includes(question.question_id)) card.question_ids?.push(question.question_id);
    }
  }
  return cards;
}

export function studyCardCatalog(): StudyCardRecord[] {
  const authored = authoredCards();
  const covered = new Set(authored.flatMap((card) => card.question_ids ?? []));
  const derived = publishedQuestions()
    .filter((question) => !covered.has(question.question_id))
    .map(derivedCard);
  return [...authored, ...derived];
}

export function studyCardGaps() {
  return studyCardCatalog().flatMap((card) =>
    card.pendingVerification ? [{ cardId: card.id, questionIds: card.question_ids ?? [], sourceId: card.source_id }] : []
  );
}

export function isTopicSlug(value: string | undefined): value is TopicId {
  return Boolean(value && TOPIC_IDS.has(value));
}

export type PublicStudyCard = {
  id: string;
  topic: string;
  title: string;
  front: string;
  back: string;
  rule?: string;
  boundary?: string;
  example?: string;
  mixup?: string;
  memory?: string;
  kind?: Flashcard["kind"];
  compare?: Flashcard["compare"];
  sourceLabel: string;
  sourceUrl: string;
  locked: boolean;
  pending: boolean;
};

export function publicStudyCards(isPro: boolean): PublicStudyCard[] {
  const questions = new Map(publishedQuestions().map((question) => [question.question_id, question]));
  const preview = new Set<string>(HOME_STUDY_CARD_IDS);
  return studyCardCatalog().map((card) => {
    const linked = (card.question_ids ?? []).map((id) => questions.get(id)).filter((item) => item != null);
    const free = preview.has(card.id) || linked.some((question) => question.is_free);
    const source = findSource(card.source_id);
    const locked = !isPro && !free;
    const pending = Boolean(card.pendingVerification) || !source;
    const hidden = locked || pending;
    return {
      id: card.id,
      topic: card.topic || card.category,
      title: card.title || card.front,
      front: locked ? "" : card.front,
      back: hidden ? "" : card.back,
      rule: hidden ? undefined : card.rule,
      boundary: hidden ? undefined : card.boundary,
      example: hidden ? undefined : card.example,
      mixup: hidden ? undefined : card.mixup,
      memory: hidden ? undefined : card.memory,
      kind: card.kind,
      compare: hidden ? undefined : card.compare,
      sourceLabel: hidden || !source ? "" : source.reference,
      sourceUrl: hidden || !source ? "" : source.url,
      locked,
      pending,
    };
  });
}
