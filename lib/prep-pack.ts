import { ncCards, ncTopics, ncQuestionCounts, publishedNcQuestions } from "@/data/nc-content";
import { NC_PRACTICE } from "./nc-site.ts";
import { inFreeQuestions } from "@/data/in-free-questions";
import { inBankCounts, inTopics } from "@/data/in-bank-summary";
import { inPublicCards as inCards } from "@/data/in-public-cards";
import { prepNavigation, type PrepCode, type PrepPaths } from "./prep-navigation.ts";
export type { PrepCode, PrepPaths } from "./prep-navigation.ts";
import { laCards, laTopics, pickLaFullExam, publishedLaQuestions } from "@/data/la-content";
import { nyCards, nyQuestionCounts, nyTopics, pickNyFullExam, publishedNyQuestions } from "@/data/ny-content";
import { paCards, paQuestionCounts, paTopics, pickPaFullExam, pickPaQuickExam, publishedPaQuestions } from "@/data/pa-content";
import { ctCards, ctTopics, ctQuestionCounts, publishedCtQuestions, pickCtFullExam } from "@/data/ct-content";
import { ctExam } from "@/lib/ct-site";
import { shuffle } from "@/lib/answer-sequence";
import type { Question, StateCode } from "@/lib/types";

export type PrepPack = {
  code: PrepCode;
  name: string;
  slug: string;
  /** Whether this pack has a public learning route. */
  available: boolean;
  paths: PrepPaths;
  topics: { id: string; label: string }[];
  questions: () => Question[];
  counts: () => { published: number; free: number; pro: number };
  fullCount: number;
  fullCountFor?: (isPro: boolean) => number;
  fullMinutes: number | null;
  fullTitle: string;
  fullDetail: string;
  purchaseEnabled?: boolean;
  handbookUrl?: string;
  practiceNotice?: { title: string; body: string; anchor: string };
  anonKey: string;
  pickQuick: (seed: number) => Question[];
  pickFull: (seed: number, isPro?: boolean) => { questions: Question[]; unscoredIds: string[] } | null;
  /** False when the published bank cannot fill the stated practice. */
  fullReady: boolean;
  quickReady: boolean;
  cards: { id: string; study: string; title: string; front: string; rule: string; boundary: string; mixup: string; source: string; sourceUrl: string }[];
};

function quickFrom(questions: Question[], seed: number) {
  const free = questions.filter((question) => question.is_free);
  const topics = shuffle([...new Set(free.map((question) => question.study_topic || question.topic))], seed);
  const used = new Set<string>();
  const picked: Question[] = [];
  for (let round = 0; round < 4 && picked.length < 10; round += 1) {
    topics.forEach((topic, index) => {
      if (picked.length === 10) return;
      const hit = shuffle(free.filter((question) => (question.study_topic || question.topic) === topic && !used.has(question.question_id)), seed + round * 10 + index)[0];
      if (!hit) return;
      used.add(hit.question_id);
      picked.push(hit);
    });
  }
  if (picked.length < 10) {
    shuffle(free.filter((question) => !used.has(question.question_id)), seed + 50).forEach((question) => {
      if (picked.length < 10) picked.push(question);
    });
  }
  return picked.length === 10 ? shuffle(picked, seed + 99) : [];
}

const paCounts = paQuestionCounts();
const nyCounts = nyQuestionCounts();

export const prepPacks: Record<PrepCode, PrepPack> = {
  CT: {
    ...prepNavigation.CT, topics: ctTopics, questions: publishedCtQuestions, counts: ctQuestionCounts,
    fullCount: ctExam.practiceQuestionCount, fullMinutes: null, fullTitle: "Comprehensive Practice",
    fullDetail: `${ctExam.practiceQuestionCount} questions drawn from this site's Connecticut pool. No time limit. Use the official handbook while practicing.`,
    anonKey: "ct-anon-full-started", pickQuick: seed => quickFrom(publishedCtQuestions(), seed),
    pickFull: pickCtFullExam, fullReady: publishedCtQuestions().length >= ctExam.practiceQuestionCount,
    quickReady: ctQuestionCounts().free >= 10, cards: ctCards, purchaseEnabled: false,
    handbookUrl: "https://portal.ct.gov/-/media/sots/business-services/notary/state_of_connecticut_notary_public_manual_rev2023.pdf?hash=16EF7EBB701DFF05F62495C282351BFF&rev=a50b095808bf4eb2a715e864480fe05a",
  },
  NC: {
    ...prepNavigation.NC,
    topics: ncTopics,
    questions: publishedNcQuestions,
    counts: ncQuestionCounts,
    fullCount: Math.min(NC_PRACTICE.comprehensiveLimit, ncQuestionCounts().published),
    fullMinutes: NC_PRACTICE.minutes,
    fullCountFor: (isPro) => Math.min(NC_PRACTICE.comprehensiveLimit, isPro ? ncQuestionCounts().published : ncQuestionCounts().free),
    fullTitle: "Comprehensive Practice",
    fullDetail: "Prepare before class and review after class with original practice questions. Comprehensive Practice draws up to 60 accessible questions with no time limit. Your results describe this practice session.",
    anonKey: "nc-anon-full-started",
    pickQuick: (seed) => quickFrom(publishedNcQuestions(), seed),
    pickFull: (seed, isPro = false) => ({ questions: shuffle(publishedNcQuestions().filter(q => isPro || q.is_free), seed).slice(0, NC_PRACTICE.comprehensiveLimit), unscoredIds: [] }),
    fullReady: ncQuestionCounts().free >= 10,
    quickReady: ncQuestionCounts().free >= 10,
    cards: ncCards,
  },
  IN: {
    ...prepNavigation.IN,
    topics: [...inTopics],
    questions: () => inFreeQuestions,
    counts: () => inBankCounts,
    fullCount: 30,
    fullMinutes: null,
    fullTitle: "30-Question Mock Exam",
    fullDetail: "Our mock exam uses 30 original questions, four choices per question, and no timer. These are site practice settings. Indiana’s official exam has 30 questions and requires 24 correct; this practice does not fulfill the official requirement.",
    anonKey: "in-anon-full-started",
    pickQuick: (seed) => quickFrom(inFreeQuestions, seed),
    pickFull: (seed) => { const questions = shuffle(inFreeQuestions, seed).slice(0, 30); return questions.length === 30 ? { questions, unscoredIds: [] } : null; },
    fullReady: inBankCounts.free >= 30,
    quickReady: inBankCounts.free >= 10,
    cards: inCards,
  },
  PA: {
    ...prepNavigation.PA,
    topics: paTopics,
    questions: publishedPaQuestions,
    counts: paQuestionCounts,
    fullCount: 30,
    fullMinutes: 60,
    fullTitle: "30-question practice",
    fullDetail: "30 questions and 60 minutes, each with three choices. Twenty-five stand in for the scored items, in the 4/18/3 outline. Five are this site's unscored items, mixed in and not identified until you submit. The official passing result is a scaled score of 75, not a raw percent.",
    anonKey: "pa-anon-full-started",
    pickQuick: pickPaQuickExam,
    pickFull: (seed) => pickPaFullExam(seed),
    fullReady: paCounts.published >= 30,
    quickReady: paCounts.free >= 10,
    cards: paCards,
  },
  NY: {
    ...prepNavigation.NY,
    topics: nyTopics,
    questions: publishedNyQuestions,
    counts: nyQuestionCounts,
    fullCount: 40,
    fullMinutes: 60,
    fullTitle: "40-question practice",
    fullDetail: "This 40-question, 60-minute set is this site's practice setting. The Department of State's 2026 exam sheet states one hour and multiple choice. It does not state the number of questions or a numeric passing score. Official results are pass or fail only.",
    anonKey: "ny-anon-full-started",
    pickQuick: (seed) => quickFrom(publishedNyQuestions(), seed),
    pickFull: pickNyFullExam,
    fullReady: nyCounts.published >= 40,
    quickReady: nyCounts.free >= 10,
    cards: nyCards,
  },
  LA: {
    ...prepNavigation.LA,
    topics: laTopics,
    questions: publishedLaQuestions,
    counts: () => {
      const published = publishedLaQuestions();
      return { published: published.length, free: published.filter((q) => q.is_free).length, pro: published.filter((q) => !q.is_free).length };
    },
    fullCount: 40,
    fullMinutes: 90,
    fullTitle: "40-question scenario practice",
    practiceNotice: {
      title: "About this practice test",
      body: "These optional practice tests help you prepare for the official Louisiana notary exam. Your practice time, scores, and completion records are for your own study. They are not reported to the state and do not count toward any official exam, training, or application requirement. This website is independent of the Louisiana Secretary of State and the official exam provider.",
      anchor: "about-this-practice",
    },
    fullDetail: "This site's 40-question, 90-minute practice combines general knowledge and linked work scenarios, with all items scored as raw study feedback. The official computer examination lasts four hours and requires a scaled 70 out of 100. Its item count is not published. These statute-based exercises cover selected skills and do not replace the official 2026 study guide or reproduce its full coverage.",
    anonKey: "la-anon-full-started",
    pickQuick: (seed) => quickFrom(publishedLaQuestions(), seed),
    pickFull: pickLaFullExam,
    fullReady: publishedLaQuestions().length >= 40,
    quickReady: publishedLaQuestions().filter((question) => question.is_free).length >= 10,
    cards: laCards,
  },
};

export function packFor(state: StateCode | string | null | undefined): PrepPack | null {
  if (state === "NY" || state === "PA" || state === "LA" || state === "CT" || state === "NC") return prepPacks[state];
  return null;
}

export function questionById(id: string) {
  return [...inFreeQuestions, ...publishedPaQuestions(), ...publishedNyQuestions(), ...publishedLaQuestions(), ...publishedCtQuestions(), ...publishedNcQuestions()].find((question) => question.question_id === id) || null;
}
