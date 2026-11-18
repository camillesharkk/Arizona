import { publishedQuestions } from "./questions";
import { getSource } from "./sources";

// Manually curated through the same checked-in editorial workflow as study cards.
// Public discussions identify study needs. Official references support the learning material.
export const communityInsights = [
  {
    id: "az-manual-navigation",
    state: "AZ",
    title: "Finding the rule under time pressure",
    summary:
      "Arizona candidates discuss anxiety about finding answers in the on-screen manual. We added a study card for rehearsing a rule lookup before timed practice.",
    postUrl:
      "https://www.reddit.com/r/Notary/comments/1or8gh6/arizona_notary_exam/",
    checkedAt: "2026-11-17",
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
      "A California retake discussion asks how to study beyond a course. Identification and journal entries recur in the replies. Use the existing identification topic practice to check individual rules and read their official explanations.",
    postUrl:
      "https://www.reddit.com/r/Notary/comments/1qvax7b/study_advice_for_retaking_the_exam_got_a_69_on_my/",
    checkedAt: "2026-11-17",
    studyHref: "/california/practice/?mode=practice&area=identification",
    studyLabel: "Practice identification",
    officialUrl: "https://www.sos.ca.gov/notary/handbook",
  },
] as const;

export type CommunityInsight = (typeof communityInsights)[number];

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
