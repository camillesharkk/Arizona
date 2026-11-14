import { fullStateSummary } from '../data/full-state-summary.ts';
import type { PrepPaths } from './prep-navigation';
import type { ExamGroup } from './states';

export const freeStateCatalog = [
  ['AR', 'Arkansas', 'arkansas'], ['CO', 'Colorado', 'colorado'],
  ['IL', 'Illinois', 'illinois'], ['ME', 'Maine', 'maine'],
  ['MD', 'Maryland', 'maryland'], ['MO', 'Missouri', 'missouri'],
  ['MT', 'Montana', 'montana'], ['NE', 'Nebraska', 'nebraska'],
  ['NV', 'Nevada', 'nevada'], ['NJ', 'New Jersey', 'new-jersey'],
  ['NM', 'New Mexico', 'new-mexico'], ['OH', 'Ohio', 'ohio'],
  ['OR', 'Oregon', 'oregon'], ['UT', 'Utah', 'utah'],
  ['VT', 'Vermont', 'vermont'], ['WI', 'Wisconsin', 'wisconsin'],
  ['WY', 'Wyoming', 'wyoming'],
] as const;

export type FreeStateCode = typeof freeStateCatalog[number][0];
export const releasedFreeStates: readonly FreeStateCode[] = freeStateCatalog.map(([code]) => code);

export function isFreeState(state: unknown): state is FreeStateCode {
  return freeStateCatalog.some(([code]) => code === state);
}

export function freeStatePaths(slug: string): PrepPaths {
  const home = `/${slug}/`;
  const study = `${home}study-guide/`;
  const code = freeStateCatalog.find(([, , stateSlug]) => stateSlug === slug)?.[0];
  const ready = Boolean(code && fullStateSummary[code]?.ready);
  return {
    home, practice: `${home}practice/`, mistakes: `${home}wrong-answers/`,
    study, become: `${home}become-a-notary/`, resources: `${home}resources/`,
    examGuide: `${home}exam-guide/`, laws: `${home}laws/`,
    questions: ready ? `${home}questions/` : `${home}practice/`, studyCards: ready ? `${home}study-cards/` : study, daily: `${home}daily-study/`,
    passingScore: `${home}exam-guide/`, pricing: ready ? `${home}pricing/` : home, login: '/login/',
  };
}

export function freeStateForSlug(slug: string) {
  return freeStateCatalog.find(([, , value]) => value === slug);
}

export const freeStateGroups: Record<FreeStateCode, ExamGroup> = {
  "AR": "onlineApplicationOrTraining",
  "CO": "onlineApplicationOrTraining",
  "IL": "courseQuiz",
  "MD": "courseQuiz",
  "ME": "onlineApplicationOrTraining",
  "MO": "onlineApplicationOrTraining",
  "MT": "formalExam",
  "NE": "formalExam",
  "NJ": "onlineApplicationOrTraining",
  "NM": "courseQuiz",
  "NV": "courseQuiz",
  "OH": "courseQuiz",
  "OR": "formalExam",
  "UT": "formalExam",
  "VT": "onlineApplicationOrTraining",
  "WI": "onlineApplicationOrTraining",
  "WY": "onlineApplicationOrTraining"
};
