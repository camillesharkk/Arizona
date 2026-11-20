import type { Letter } from "./answer-sequence";
import type { Question } from "./types";

export const ANSWER_FEEDBACK_STREAM = "application/x-ndjson";

export type AnswerFeedback = {
  correct: boolean;
  correctOption: Letter;
  explanation: string;
  optionFeedback: Question["option_feedback"];
  canonical: Letter;
};

type FeedbackResult = AnswerFeedback | { correctOption?: never; error?: string };

export async function readAnswerFeedback(
  response: Response | null,
  onReveal: (feedback: AnswerFeedback) => void,
): Promise<FeedbackResult> {
  if (!response) return {};
  if (!response.ok || !response.headers.get("content-type")?.includes(ANSWER_FEEDBACK_STREAM) || !response.body) {
    return (await response.json().catch(() => null)) ?? {};
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffered = "";
  let revealed = false;
  async function readLine() {
    let newline = buffered.indexOf("\n");
    while (newline < 0) {
      const part = await reader.read();
      if (part.done) throw new Error("Incomplete answer feedback");
      buffered += decoder.decode(part.value, { stream: true });
      newline = buffered.indexOf("\n");
    }
    const line = buffered.slice(0, newline);
    buffered = buffered.slice(newline + 1);
    return JSON.parse(line);
  }
  try {
    const feedback: AnswerFeedback = await readLine();
    if (!feedback?.correctOption) return {};
    revealed = true;
    onReveal(feedback);
    const saved = await readLine();
    if (saved?.saved === true) return feedback;
  } catch {
    // A truncated stream never confirms a write.
  } finally {
    reader.releaseLock();
  }
  return revealed ? { error: "Your answer was checked, but progress could not be saved." } : {};
}
