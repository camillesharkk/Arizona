import { laCards, laTopics, pickLaFullExam, publishedLaQuestions } from "@/data/la-content";
import { nyCards, nyQuestionCounts, nyTopics, pickNyFullExam, publishedNyQuestions } from "@/data/ny-content";
import { paCards, paQuestionCounts, paTopics, pickPaFullExam, pickPaQuickExam, publishedPaQuestions } from "@/data/pa-content";
import { shuffle } from "@/lib/answer-sequence";
import { nyPaths } from "./ny-site.ts";
import { paPaths } from "./pa-site.ts";
import { paths as sharedPaths } from "@/lib/paths";
import type { Question, StateCode } from "@/lib/types";

export type PrepCode = "NY" | "PA" | "LA";

export type PrepPaths = {
  home: string;
  practice: string;
  questions: string;
  study: string;
  studyCards: string;
  mistakes: string;
  daily: string;
  resources: string;
  examGuide: string;
  passingScore: string;
  laws: string;
  become: string;
  pricing: string;
  login: string;
};

function paths(slug: string): PrepPaths {
  const root = `/preview/${slug}`;
  return {
    home: `${root}/`,
    practice: `${root}/practice/`,
    questions: `${root}/questions/`,
    study: `${root}/study-guide/`,
    studyCards: `${root}/study-cards/`,
    mistakes: `${root}/wrong-answers/`,
    daily: `${root}/daily-study/`,
    resources: `${root}/resources/`,
    examGuide: `${root}/exam-guide/`,
    passingScore: `${root}/passing-score/`,
    laws: `${root}/laws/`,
    become: `${root}/become-a-notary/`,
    pricing: `${root}/pricing/`,
    login: sharedPaths.login,
  };
}

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
  fullMinutes: number | null;
  fullTitle: string;
  fullDetail: string;
  anonKey: string;
  pickQuick: (seed: number) => Question[];
  pickFull: (seed: number) => { questions: Question[]; unscoredIds: string[] } | null;
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
  PA: {
    code: "PA",
    name: "Pennsylvania",
    slug: "pennsylvania",
    available: true,
    paths: paPaths,
    topics: paTopics,
    questions: publishedPaQuestions,
    counts: paQuestionCounts,
    fullCount: 30,
    fullMinutes: 60,
    fullTitle: "30-question practice",
    fullDetail: "30 questions and 60 minutes, each with three choices. Twenty-five stand in for the scored items, in the 4/18/3 outline. Five are this site's unscored items, mixed in and not identified until you submit. The official passing result is a scaled score of 75, not a raw percent.",
    anonKey: "pa-anon-full-started",
    pickQuick: pickPaQuickExam,
    pickFull: pickPaFullExam,
    fullReady: paCounts.published >= 30,
    quickReady: paCounts.free >= 10,
    cards: paCards,
  },
  NY: {
    code: "NY",
    name: "New York",
    slug: "new-york",
    available: true,
    paths: nyPaths,
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
    code: "LA",
    name: "Louisiana",
    slug: "louisiana",
    available: false,
    paths: paths("louisiana"),
    topics: laTopics,
    questions: publishedLaQuestions,
    counts: () => {
      const published = publishedLaQuestions();
      return { published: published.length, free: published.filter((q) => q.is_free).length, pro: published.filter((q) => !q.is_free).length };
    },
    fullCount: 40,
    fullMinutes: 90,
    fullTitle: "40-question scenario practice",
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
  if (state === "NY" || state === "PA" || state === "LA") return prepPacks[state];
  return null;
}

export function questionById(id: string) {
  return [...publishedPaQuestions(), ...publishedNyQuestions(), ...publishedLaQuestions()].find((question) => question.question_id === id) || null;
}
