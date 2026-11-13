import { paths } from './paths.ts';

export const CT_CHECKED_ON = '2026-11-13';
export const ctSources = {
  licensing: 'https://portal.ct.gov/SOTS/Business-Services/Notary/Notary-Public-Licensing',
  manual: 'https://portal.ct.gov/-/media/sots/business-services/notary/state_of_connecticut_notary_public_manual_rev2023.pdf?hash=16EF7EBB701DFF05F62495C282351BFF&rev=a50b095808bf4eb2a715e864480fe05a',
  forms: 'https://portal.ct.gov/sots/business-services/notary/notary-forms',
  jurat: 'https://portal.ct.gov/-/media/sots/business-services/notary/elicense-forms/jurat-and-writing-sample.pdf',
  character: 'https://portal.ct.gov/-/media/sots/business-services/notary/elicense-forms/certificate-of-character.pdf',
  statutes: 'https://www.cga.ct.gov/current/pub/chap_033.htm',
  feeAct: 'https://www.cga.ct.gov/2026/ACT/PA/PDF/2026PA-00081-R00SB-00294-PA.PDF',
  application: 'https://www.elicense.ct.gov/',
};

export const ctExam = {
  allAnswersCorrect: true,
  officialQuestionCount: null,
  officialTimeLimitMinutes: null,
  officialFormat: null,
  officialReferenceMaterials: null,
  practiceQuestionCount: 40,
  practiceMinutes: null,
  checkedOn: CT_CHECKED_ON,
  manualVersion: 'Rev. 2026-1',
};

export const ctPaths = {
  home: '/connecticut/', practice: '/connecticut/practice/', questions: '/connecticut/questions/',
  study: '/connecticut/study-guide/', studyCards: '/connecticut/study-cards/', mistakes: '/connecticut/wrong-answers/',
  daily: '/connecticut/daily-study/', resources: '/connecticut/resources/', examGuide: '/connecticut/exam-guide/',
  passingScore: '/connecticut/passing-score/', laws: '/connecticut/laws/', become: '/connecticut/become-a-notary/',
  pricing: '/connecticut/pricing/', login: paths.login,
};

export function isConnecticutPath(pathname: string) {
  return pathname === '/connecticut' || pathname.startsWith('/connecticut/');
}
