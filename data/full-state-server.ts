import 'server-only';
import type { FreeStateCode } from '../lib/free-state-catalog';
import type { FullStateLearning } from '../lib/full-state-learning';
import { stateQuestion } from '../lib/state-question';
import { freeStateContent } from './free-state-content';
import { fullStateSummary } from './full-state-summary';
import ar from './full-states/AR.json';
import mt from './full-states/MT.json';
import or from './full-states/OR.json';

const content: Partial<Record<FreeStateCode, FullStateLearning>> = {AR: ar as FullStateLearning, MT: mt as FullStateLearning, OR: or as FullStateLearning};

export function serverStateQuestions(code: FreeStateCode) {
  const extra = content[code]?.questions || [];
  const free = new Set(fullStateSummary[code]?.freeQuestionIds || freeStateContent[code]!.questions.map(question => question.id));
  return [...freeStateContent[code]!.questions, ...extra].map(question => stateQuestion(code, question, free.has(question.id)));
}
