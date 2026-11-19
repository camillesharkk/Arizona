import { publishedQuestions } from "@/data/questions";
import { publishedCaQuestions } from "@/data/ca-questions";
import { publishedHiQuestions } from "@/data/hi-questions";
import { packFor } from "@/lib/prep-pack";
import { presentExamQuestions } from "@/lib/answer-sequence";
import { saveCaQuickAttempt } from "@/lib/ca-attempts";
import type { Sitting } from "@/lib/sitting";

/** Older AZ Quick10 results predate the durable quick-attempt archive. */
export function archiveGuestArizonaQuick(sitting: Sitting) {
  if (!sitting.done || !sitting.examId || sitting.state !== "AZ" || (sitting.mode !== "quick" && sitting.mode !== "home-quick")) return;
  archiveGuestSitting(sitting);
}

/** Map a finished sitting onto the guest archive. The question bank stays on the server. */
export function guestAttemptFromSitting(sitting: Sitting) {
  if (!sitting.done || !sitting.examId || !["quick", "home-quick", "full", "home-full"].includes(sitting.mode)) return null;
  const bank = packFor(sitting.state)?.questions() || (sitting.state === "CA" ? publishedCaQuestions() : sitting.state === "HI" ? publishedHiQuestions() : publishedQuestions());
  const byId = new Map(bank.map((question) => [question.question_id, question]));
  const questions = sitting.questionIds.flatMap((id) => byId.get(id) || []);
  if (questions.length !== sitting.questionIds.length) return null;
  const { maps } = presentExamQuestions(questions, sitting.seed, sitting.presentationVersion ?? 1);
  const originalAnswers = Object.fromEntries(Object.entries(sitting.answers).map(([id, selected]) => [id, maps[id]?.[selected] ?? selected]));
  const correctIds = questions.filter((question) => originalAnswers[question.question_id] === question.correct_option).map((question) => question.question_id);
  return {
    id: sitting.examId,
    owner: "guest",
    state: sitting.state,
    mode: sitting.mode.endsWith("full") ? "full" as const : "quick" as const,
    sittingMode: sitting.mode,
    seed: sitting.seed,
    finishedAt: new Date(sitting.startedAt || Date.now()).toISOString(),
    questionIds: sitting.questionIds,
    questionVersions: sitting.questionVersions,
    presentationVersion: sitting.presentationVersion,
    unscoredIds: sitting.unscoredIds,
    answers: sitting.answers,
    originalAnswers,
    attemptIds: sitting.attemptIds,
    correctIds,
    wrongIds: sitting.questionIds.filter((id) => sitting.answers[id] && !correctIds.includes(id)),
    skippedIds: sitting.questionIds.filter((id) => !sitting.answers[id]),
    topicMisses: [],
  };
}

export function archiveGuestSitting(sitting: Sitting) {
  const attempt = guestAttemptFromSitting(sitting);
  if (attempt) saveCaQuickAttempt(attempt);
}
