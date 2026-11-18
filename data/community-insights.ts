import { publishedQuestions } from "./questions";
import { getSource } from "./sources";

export type CommunityInsight = {
  id: string;
  state: string;
  title: string;
  summary: string;
  platform: "Reddit" | "LinkedIn";
  postUrl: string;
  checkedAt: string;
  updatedAt: string;
  studyHref: string;
  studyLabel: string;
  officialUrl: string;
};

// Manually curated through the same checked-in editorial workflow as study cards.
// Public discussions identify study needs. Official references support the learning material.
export const communityInsights = [
  {
    id: "az-manual-navigation",
    state: "AZ",
    title: "Finding the rule under time pressure",
    summary:
      "Candidates describe different ways they searched the on-screen manual. Rehearse finding one rule by heading and one by keyword before a timed practice session.",
    platform: "Reddit",
    postUrl:
      "https://www.reddit.com/r/Notary/comments/1or8gh6/arizona_notary_exam/",
    checkedAt: "2026-11-18",
    updatedAt: "2026-11-18",
    studyHref:
      "/arizona-notary-study-cards/?topic=commission&card=kc-manual-navigation",
    studyLabel: "Study manual navigation",
    officialUrl: "https://azsos.gov/business/notary-public/new-notary",
  },
  {
    id: "ca-retake-topics",
    state: "CA",
    title: "Turn a retake into focused review",
    summary:
      "A candidate asks what to study before a retake. Replies point to acceptable identification and journal entries. Start with identification scenarios and check the rule after each answer.",
    platform: "Reddit",
    postUrl:
      "https://www.reddit.com/r/Notary/comments/1qvax7b/study_advice_for_retaking_the_exam_got_a_69_on_my/",
    checkedAt: "2026-11-18",
    updatedAt: "2026-11-18",
    studyHref: "/california/practice/?mode=practice&area=identification",
    studyLabel: "Practice identification",
    officialUrl: "https://www.sos.ca.gov/notary/handbook",
  },
  {
    id: "ny-recall-notarial-fees",
    state: "NY",
    title: "Practice recalling notarial fees",
    summary:
      "A New York exam taker describes annotating the official booklet, then quizzing themselves on fees and definitions. Try recalling the fee for an acknowledgment before turning over the study card.",
    platform: "Reddit",
    postUrl:
      "https://www.reddit.com/r/Notary/comments/1x1r806/passed_my_nys_notary_exam_what_worked_for_me/",
    checkedAt: "2026-11-18",
    updatedAt: "2026-11-18",
    studyHref: "/new-york/study-cards/?topic=fees",
    studyLabel: "Review New York fee flashcards",
    officialUrl: "https://www.nysenate.gov/legislation/laws/EXC/136",
  },
  {
    id: "la-scenario-application",
    state: "LA",
    title: "Connect rules in a single scenario",
    summary:
      "A Louisiana discussion about the official guide highlights how several concepts can apply to the same situation. After reading one topic, work through a scenario and explain why each rule applies.",
    platform: "Reddit",
    postUrl: "https://www.reddit.com/r/Notary/comments/1li4jg7/louisiana_notary/",
    checkedAt: "2026-11-18",
    updatedAt: "2026-11-18",
    studyHref: "/louisiana/practice/?mode=practice&area=acts",
    studyLabel: "Practice Louisiana authentic acts",
    officialUrl: "https://www.sos.la.gov/notary/application-process",
  },
  {
    id: "ca-exam-to-commission",
    state: "CA",
    title: "Map the steps after the exam",
    summary:
      "A California applicant shares how they moved from handbook study and testing to their commission. Review the official sequence, then test yourself on which steps an applicant must complete before notarizing.",
    platform: "LinkedIn",
    postUrl:
      "https://www.linkedin.com/posts/melodygwhite_on-march-8th-i-decided-to-start-ritual-notary-activity-7468725664741908480-2eEE",
    checkedAt: "2026-11-18",
    updatedAt: "2026-11-18",
    studyHref: "/california/practice/?mode=practice&area=commission",
    studyLabel: "Practice California commissioning",
    officialUrl: "https://www.sos.ca.gov/notary/qualifications",
  },
] as const satisfies readonly CommunityInsight[];

export const communityInsightsUpdatedAt = communityInsights
  .map(({ updatedAt }) => updatedAt)
  .sort()
  .at(-1);

const sample = publishedQuestions().find(
  (question) => question.question_id === "az-001",
)!;
export const sourceTrustSample = {
  questionId: sample.question_id,
  question: sample.question_text,
  answer: sample.option_b,
  reference: sample.source_reference,
  officialUrl: getSource(sample.source_id).url,
  lastVerifiedAt: sample.last_verified_at,
  practiceHref: "/arizona/practice-test/",
};
