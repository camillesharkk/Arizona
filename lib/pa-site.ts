import { paths } from "./paths.ts";

export const paPaths = {
  home: "/pennsylvania/",
  practice: "/pennsylvania/practice/",
  questions: "/pennsylvania/questions/",
  study: "/pennsylvania/study-guide/",
  studyCards: "/pennsylvania/study-cards/",
  mistakes: "/pennsylvania/wrong-answers/",
  daily: "/pennsylvania/daily-study/",
  resources: "/pennsylvania/resources/",
  examGuide: "/pennsylvania/exam-guide/",
  passingScore: "/pennsylvania/passing-score/",
  laws: "/pennsylvania/laws/",
  become: "/pennsylvania/become-a-notary/",
  pricing: "/pennsylvania/pricing/",
  login: paths.login,
};

export function isPennsylvaniaPath(pathname: string) {
  return pathname === "/pennsylvania" || pathname.startsWith("/pennsylvania/");
}
