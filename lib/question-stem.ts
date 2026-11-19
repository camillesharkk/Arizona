import type { Question } from "@/lib/types";

/** Browser payload: stem and choices only. */
export function stemQuestion(question: Question): Question {
  return {
    ...question,
    correct_option: "" as Question["correct_option"],
    explanation: "",
    option_feedback: { A: "", B: "", C: "", D: "" },
  };
}

export function revealedQuestion(question: Question): Question {
  return question;
}
