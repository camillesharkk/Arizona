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
  if (mode === "why-correct") return `${q.explanation}\n\nOfficial reference: ${reference}\n\n${context}`;
  if (mode === "why-wrong") {
    const letter = (selected || "A") as "A" | "B" | "C" | "D";
    return `${q.option_feedback[letter]}\nCorrect is ${q.correct_option}.\n\n${context}`;
  }
  if (mode === "beginner") {
    return `In plain language: ${q.explanation}\nThe right choice is ${q.correct_option}. Confirm ${reference} before you notarize.`;
  }
  if (mode === "similar") return `Practice the same rule: ${q.question_text.replace("which", "what")}\nThen review ${reference}.`;
  return `${q.explanation}\n\n${context}`;
}
