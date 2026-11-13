import { paths } from "./paths.ts";

export const ncPaths = {
  home: "/north-carolina/",
  practice: "/north-carolina/practice/",
  questions: "/north-carolina/questions/",
  study: "/north-carolina/study-guide/",
  studyCards: "/north-carolina/study-cards/",
  mistakes: "/north-carolina/wrong-answers/",
  daily: "/north-carolina/daily-study/",
  resources: "/north-carolina/resources/",
  examGuide: "/north-carolina/exam-guide/",
  passingScore: "/north-carolina/passing-score/",
  laws: "/north-carolina/laws/",
  become: "/north-carolina/become-a-notary/",
  pricing: "/north-carolina/pricing/",
  login: paths.login,
};

export function isNorthCarolinaPath(pathname: string) {
  return pathname === "/north-carolina" || pathname.startsWith("/north-carolina/");
}

/** Study settings belong to this site. Official requirements live in nc-resources. */
export const NC_PRACTICE = { comprehensiveLimit: 60, minutes: null } as const;
