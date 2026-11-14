import 'server-only';
import type { FreeStateCode } from '../lib/free-state-catalog';
import type { FullStateLearning } from '../lib/full-state-learning';
import { stateQuestion } from '../lib/state-question';
import { freeStateContent } from './free-state-content';
import { fullStateSummary } from './full-state-summary';
import ar from './full-states/AR.json';
import co from './full-states/CO.json';
import il from './full-states/IL.json';
import me from './full-states/ME.json';
import md from './full-states/MD.json';
import mo from './full-states/MO.json';
import mt from './full-states/MT.json';
import ne from './full-states/NE.json';
import nv from './full-states/NV.json';
import nj from './full-states/NJ.json';
import nm from './full-states/NM.json';
import oh from './full-states/OH.json';
import or from './full-states/OR.json';
import ut from './full-states/UT.json';
import vt from './full-states/VT.json';
import wi from './full-states/WI.json';
import wy from './full-states/WY.json';
import ri from './full-states/RI.json';
import tx from './full-states/TX.json';

const content: Partial<Record<FreeStateCode, FullStateLearning>> = {AR: ar as FullStateLearning, CO: co as FullStateLearning, IL: il as FullStateLearning, ME: me as FullStateLearning, MD: md as FullStateLearning, MO: mo as FullStateLearning, MT: mt as FullStateLearning, NE: ne as FullStateLearning, NV: nv as FullStateLearning, NJ: nj as FullStateLearning, NM: nm as FullStateLearning, OH: oh as FullStateLearning, OR: or as FullStateLearning, UT: ut as FullStateLearning, VT: vt as FullStateLearning, WI: wi as FullStateLearning, WY: wy as FullStateLearning, RI: ri as FullStateLearning, TX: tx as FullStateLearning};

export function serverStateQuestions(code: FreeStateCode) {
  const extra = content[code]?.questions || [];
  const baseQuestions = freeStateContent[code]?.questions || [];
  const free = new Set(fullStateSummary[code]?.freeQuestionIds || baseQuestions.map(question => question.id));
  return [...baseQuestions, ...extra].map(question => stateQuestion(code, question, free.has(question.id)));
}
