import "server-only";

import { resolveAnswerEvidence } from "@/lib/answer-evidence";
import { prepPacks } from "@/lib/prep-pack";
import { isActiveQuestion } from "@/lib/question-status";

// An entry approves only this reviewed revision for public display, never a replacement.
export const publicPracticeSampleVersions = {
  NY: { "ny-051": 1, "ny-005": 1, "ny-008": 1, "ny-010": 1, "ny-011": 1 },
  OH: { "oh-001": 1, "oh-003": 1, "oh-004": 1, "oh-005": 1, "oh-007": 1, "oh-009": 1 },
};

export function publicPracticeSamples(state: keyof typeof publicPracticeSampleVersions) {
  const pack = prepPacks[state];
  const approved = Object.entries(publicPracticeSampleVersions[state]);
  const bank = new Map(pack.questions().map(question => [question.question_id, question]));
  return approved.flatMap(([id, version]) => {
    const q = bank.get(id);
    if (!q || q.state !== state || !q.is_free || q.version !== version || !isActiveQuestion(q) ||
      !q.last_verified_at || !q.option_feedback || !q.study_topic || !resolveAnswerEvidence(q).href) return [];
    const topic = pack.topics.find(topic => topic.id === q.study_topic);

    return [{
      question_id: q.question_id,
      question_text: q.question_text,
      options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
      correct: q.correct_option,
      explanation: q.explanation,
      optionFeedback: q.option_feedback,
      source_id: q.source_id,
      source_reference: q.source_reference,
      last_verified_at: q.last_verified_at,
      moreHref: `${pack.paths.practice}?mode=practice&area=${encodeURIComponent(q.study_topic)}`,
      guideHref: topic ? `${pack.paths.study}#${encodeURIComponent(topic.id)}` : undefined,
    }];
  });
}
