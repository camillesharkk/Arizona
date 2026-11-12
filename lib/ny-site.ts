import { paths } from "./paths.ts";

export const nyPaths = {
  home: "/new-york/",
  practice: "/new-york/practice/",
  questions: "/new-york/questions/",
  study: "/new-york/study-guide/",
  studyCards: "/new-york/study-cards/",
  mistakes: "/new-york/wrong-answers/",
  daily: "/new-york/daily-study/",
  resources: "/new-york/resources/",
  examGuide: "/new-york/exam-guide/",
  passingScore: "/new-york/passing-score/",
  laws: "/new-york/laws/",
  become: "/new-york/become-a-notary/",
  pricing: "/new-york/pricing/",
  login: paths.login,
};

export function isNewYorkPath(pathname: string) {
  return pathname === "/new-york" || pathname.startsWith("/new-york/");
}
