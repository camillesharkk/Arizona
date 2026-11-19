import { NextResponse } from "next/server";
import { historicalAzQuestions } from "@/data/questions";
import { publishedCaQuestions } from "@/data/ca-questions";
import { publishedHiQuestions } from "@/data/hi-questions";
import { editorialUpdates } from "@/data/question-editorial-events";
import { canAccessQuestion } from "@/lib/entitlements";
import { isActiveQuestion } from "@/lib/question-status";
import { serverQuestionById } from "@/lib/server-questions";
import { getSession } from "@/lib/session";
import { productionStateBlocked } from "@/lib/state-release";
import { optionText } from "@/lib/answer-sequence";
import { resolveAnswerEvidence } from "@/lib/answer-evidence";

const headers = { "Cache-Control": "private, no-store" };

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const update = editorialUpdates.find(item => item.id === id && !item.silent);
  if (!update || productionStateBlocked(update.state)) return NextResponse.json({}, { status: 404, headers });
  const questionId = update.replacementId ?? update.questionId;
  const question = [...historicalAzQuestions(), ...publishedCaQuestions(), ...publishedHiQuestions()]
    .find(item => item.question_id === questionId) ?? serverQuestionById(questionId);
  if (!question || question.state !== update.state || !isActiveQuestion(question)) {
    return NextResponse.json({}, { status: 404, headers });
  }
  const session = await getSession();
  const accessible = await canAccessQuestion(session?.id, question);
  return NextResponse.json({
    questionId,
    reason: update.reason,
    question: accessible ? {
      stem: question.question_text,
      scenario: question.scenario_text,
      answer: optionText(question, question.correct_option),
      explanation: question.explanation,
      options: (["A", "B", "C", "D"] as const).flatMap(letter => {
        const text = optionText(question, letter);
        return text ? [{ text, feedback: question.option_feedback[letter] }] : [];
      }),
      evidence: resolveAnswerEvidence(question)?.href ?? null,
    } : null,
  }, { headers });
}
