import "server-only";

import { publishedCaQuestions } from "@/data/ca-questions";
import { examConfig } from "@/data/exam-config";
import { publishedHiQuestions } from "@/data/hi-questions";
import { publishedInQuestions } from "@/data/in-questions";
import { publishedQuestions } from "@/data/questions";
import { serverStateQuestions } from "@/data/full-state-server";
import { presentExamQuestions, type Letter } from "@/lib/answer-sequence";
import { pickCaFullExam, pickCaQuickExam } from "@/lib/ca-exam";
import { isFreeState } from "@/lib/free-state-catalog";
import { pickHiFullExam, pickHiQuickExam } from "@/lib/hi-exam";
import { revealedQuestion, stemQuestion } from "@/lib/question-stem";
import { isActiveQuestion } from "@/lib/question-status";
import { prepPacks, packFor } from "@/lib/prep-pack";
import { buildQuickExam, pickExamSet, pickFullExam } from "@/lib/quiz";
import { shuffle } from "@/lib/answer-sequence";
import type { Question, StateCode } from "@/lib/types";

export type Drawn = { questions: Question[]; unscoredIds: string[]; seed: number };

const bank = new Map<string, Question>();
for (const question of [...publishedQuestions(), ...publishedCaQuestions(), ...publishedHiQuestions(), ...publishedInQuestions()]) {
  bank.set(question.question_id, question);
}
for (const pack of Object.values(prepPacks)) {
  for (const question of pack.questions()) bank.set(question.question_id, question);
}
for (const code of Object.keys(prepPacks)) {
  if (!isFreeState(code)) continue;
  for (const question of serverStateQuestions(code)) bank.set(question.question_id, question);
}

export function questionByBankId(id: string) {
  return bank.get(id) || null;
}

function accessible(question: Question, isPro: boolean) {
  return isPro || question.is_free;
}

export function drawPractice(input: {
  state: StateCode;
  mode: string;
  seed: number;
  isPro: boolean;
  focusArea?: string;
  missedIds?: string[];
  presetIds?: string[];
  practice?: boolean;
}): Drawn | { error: string } {
  const { state, mode, seed, isPro } = input;
  if (input.presetIds?.length) {
    const questions = input.presetIds.flatMap((id) => {
      const question = bank.get(id);
      return question && question.state === state && accessible(question, isPro) ? [question] : [];
    });
    if (questions.length !== input.presetIds.length) return { error: "Those questions are not in this sitting." };
    return { questions, unscoredIds: [], seed };
  }
  const pack = packFor(state);
  if (state === "IN" && mode === "full") return { error: "indiana-full" };
  if (pack) {
    const source = isFreeState(state) ? serverStateQuestions(state) : pack.questions();
    const open = source.filter((question) => (state !== "NC" && !isFreeState(state)) || accessible(question, isPro));
    if (input.focusArea) {
      const pool = open.filter((question) => question.study_topic === input.focusArea || question.exam_area === input.focusArea);
      const free = pool.filter((question) => question.is_free || isPro);
      return { questions: shuffle(free.length ? free : pool.filter((question) => question.is_free), seed).slice(0, 10), unscoredIds: [], seed };
    }
    if (mode === "quick") return { questions: pack.pickQuick(seed), unscoredIds: [], seed };
    if (mode === "full") {
      if (isFreeState(state)) {
        const questions = shuffle(open, seed).slice(0, pack.fullCount);
        return { questions: questions.length === pack.fullCount ? questions : [], unscoredIds: [], seed };
      }
      const picked = pack.pickFull(seed, isPro);
      return picked ? { questions: picked.questions, unscoredIds: picked.unscoredIds, seed } : { questions: [], unscoredIds: [], seed };
    }
    const missed = new Set(input.missedIds || []);
    return {
      questions: open.filter((question) => missed.has(question.question_id) && (state !== "CT" || accessible(question, isPro))).slice(0, 10),
      unscoredIds: [],
      seed,
    };
  }
  if (state === "HI" || state === "CA") {
    const source = state === "HI" ? publishedHiQuestions() : publishedCaQuestions();
    if (input.focusArea) {
      const pool = source.filter((question) => question.study_topic === input.focusArea || question.exam_area === input.focusArea);
      const free = pool.filter((question) => accessible(question, isPro));
      return { questions: shuffle(free.length ? free : pool.filter((question) => question.is_free), seed).slice(0, 10), unscoredIds: [], seed };
    }
    if (mode === "quick") {
      const questions = state === "HI" ? pickHiQuickExam(seed) : pickCaQuickExam(seed);
      return { questions, unscoredIds: [], seed };
    }
    if (mode === "full") {
      if (state === "HI") {
        const questions = pickHiFullExam(seed) || [];
        return { questions, unscoredIds: [], seed };
      }
      const picked = pickCaFullExam(seed);
      return picked ? { questions: picked.questions, unscoredIds: picked.unscoredIds, seed } : { questions: [], unscoredIds: [], seed };
    }
    const missed = new Set(input.missedIds || []);
    return { questions: source.filter((question) => missed.has(question.question_id)).slice(0, 10), unscoredIds: [], seed };
  }
  if (mode === "quick") {
    const questions = buildQuickExam({ isPro, seed });
    return { questions: questions.length === 10 ? questions : [], unscoredIds: [], seed };
  }
  if (mode === "full") {
    const questions = pickFullExam(seed);
    return { questions: questions.length === examConfig.questionCount ? questions : [], unscoredIds: [], seed };
  }
  if (mode === "weak") {
    const missed = new Set(input.missedIds || []);
    const pool = pickExamSet(200, { seed }).filter((question) => missed.has(question.question_id));
    return { questions: pool.slice(0, isPro ? 10 : 5), unscoredIds: [], seed };
  }
  return { questions: pickExamSet(input.practice ? 10 : examConfig.questionCount, { seed }), unscoredIds: [], seed };
}

export function topicPage(input: {
  state: StateCode;
  topic?: string;
  difficulty?: string;
  filter?: string;
  offset: number;
  limit: number;
  seed: number;
  isPro: boolean;
  wrongIds?: string[];
  unansweredIds?: string[];
}) {
  const source = input.state === "AZ"
    ? publishedQuestions().filter((question) => isActiveQuestion(question))
    : input.state === "CA" ? publishedCaQuestions()
    : input.state === "HI" ? publishedHiQuestions()
    : input.state === "IN" ? publishedInQuestions()
    : isFreeState(input.state) ? serverStateQuestions(input.state)
    : packFor(input.state)?.questions() || [];
  let list = source.filter((question) => question.state === input.state && accessible(question, input.isPro));
  const topic = input.topic && input.topic !== "all" ? input.topic : input.filter && !["all", "wrong", "unanswered"].includes(input.filter) ? input.filter : "";
  if (topic) list = list.filter((question) => question.study_topic === topic || question.topic === topic || question.exam_area === topic);
  if (input.filter === "wrong") {
    const ids = new Set(input.wrongIds || []);
    list = list.filter((question) => ids.has(question.question_id));
  }
  if (input.filter === "unanswered") {
    const ids = new Set(input.unansweredIds || []);
    list = list.filter((question) => !ids.has(question.question_id));
  }
  if (input.difficulty && input.difficulty !== "all") list = list.filter((question) => question.difficulty === input.difficulty);
  const ordered = shuffle(list, input.seed);
  const page = ordered.slice(input.offset, input.offset + input.limit);
  const topicSource = topic ? source.filter((question) => question.study_topic === topic || question.topic === topic || question.exam_area === topic) : [];
  return {
    questions: page,
    total: ordered.length,
    nextOffset: input.offset + page.length < ordered.length ? input.offset + page.length : null,
    freeCount: topicSource.filter((question) => question.is_free).length,
    topicCount: topicSource.length,
  };
}

export function clientQuestions(questions: Question[], seed: number, presentationVersion: number, revealed: boolean) {
  if (!questions.length) return [];
  const presented = presentExamQuestions(questions, seed, presentationVersion).questions;
  return presented.map(revealed ? revealedQuestion : stemQuestion);
}

export function prepareChoiceReveal(questions: Question[], seed: number, presentationVersion: number) {
  const presented = presentExamQuestions(questions, seed, presentationVersion);
  const byId = new Map(presented.questions.map((question) => [question.question_id, question]));
  return (questionId: string, display: Letter) => {
    const item = byId.get(questionId);
    const canonical = presented.maps[questionId]?.[display];
    if (!item || !canonical) return null;
    return {
      correct: display === item.correct_option,
      correctOption: item.correct_option,
      explanation: item.explanation,
      optionFeedback: item.option_feedback,
      canonical,
      version: item.version,
      state: item.state,
    };
  };
}
