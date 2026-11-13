import { publishedQuestions } from "@/data/questions";
import { presentExamQuestions } from "@/lib/answer-sequence";
import { saveCaQuickAttempt } from "@/lib/ca-attempts";
import type { Sitting } from "@/lib/sitting";

/** Older AZ Quick10 results predate the durable quick-attempt archive. */
export function archiveGuestArizonaQuick(sitting: Sitting) {
  if (!sitting.done || !sitting.examId || sitting.state !== "AZ" || (sitting.mode !== "quick" && sitting.mode !== "home-quick")) return;
  const byId = new Map(publishedQuestions().map(question => [question.question_id, question]));
  const questions = sitting.questionIds.flatMap(id => byId.get(id) || []);
  if (questions.length !== sitting.questionIds.length) return;
  const { maps } = presentExamQuestions(questions, sitting.seed, sitting.presentationVersion ?? 1);
  const originalAnswers = Object.fromEntries(Object.entries(sitting.answers).map(([id, selected]) => [id, maps[id]?.[selected] ?? selected]));
  const correctIds = questions.filter(question => originalAnswers[question.question_id] === question.correct_option).map(question => question.question_id);
  saveCaQuickAttempt({
    id: sitting.examId, owner: "guest", state: "AZ", mode: "quick", sittingMode: sitting.mode, seed: sitting.seed,
    finishedAt: new Date(sitting.startedAt || Date.now()).toISOString(), questionIds: sitting.questionIds,
    questionVersions: sitting.questionVersions, presentationVersion: sitting.presentationVersion,
    answers: sitting.answers, originalAnswers, attemptIds: sitting.attemptIds, correctIds,
    wrongIds: sitting.questionIds.filter(id => sitting.answers[id] && !correctIds.includes(id)),
    skippedIds: sitting.questionIds.filter(id => !sitting.answers[id]), topicMisses: [],
  });
}
