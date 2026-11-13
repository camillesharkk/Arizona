import { paths } from "./paths.ts";

export const laPaths = {
  home: "/louisiana/",
  practice: "/louisiana/practice/",
  questions: "/louisiana/questions/",
  study: "/louisiana/study-guide/",
  studyCards: "/louisiana/study-cards/",
  mistakes: "/louisiana/wrong-answers/",
  daily: "/louisiana/daily-study/",
  resources: "/louisiana/resources/",
  examGuide: "/louisiana/exam-guide/",
  passingScore: "/louisiana/passing-score/",
  laws: "/louisiana/laws/",
  become: "/louisiana/become-a-notary/",
  pricing: "/louisiana/pricing/",
  login: paths.login,
};

export function isLouisianaPath(pathname: string) {
  return pathname === "/louisiana" || pathname.startsWith("/louisiana/");
}
