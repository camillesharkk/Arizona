import { cleanExplanation } from "../explanation.ts";

export function localTutor(
  mode: string,
  q: {
    question_text: string;
    correct_option: string;
    explanation: string;
    option_feedback: Record<string, string>;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
  },
  selected: string | undefined,
  context: string,
  reference: string
) {
  const explanation = cleanExplanation(q.explanation);
  if (mode === "why-correct") return `${explanation}\n\nOfficial reference: ${reference}\n\n${context}`;
  if (mode === "why-wrong") {
    const letter = (selected || "A") as "A" | "B" | "C" | "D";
    const note = cleanExplanation(q.option_feedback[letter] || "");
    return `${note}\nCorrect is ${q.correct_option}.\n\n${context}`;
  }
  if (mode === "beginner") {
    return `In plain language: ${explanation}\nThe right choice is ${q.correct_option}. Confirm ${reference} before you notarize.`;
  }
  if (mode === "similar") return `Practice the same rule: ${q.question_text.replace("which", "what")}\nThen review ${reference}.`;
  return `${explanation}\n\n${context}`;
}
