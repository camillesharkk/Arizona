import Link from "next/link";
import { notFound } from "next/navigation";
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

export const metadata = { title: "Updated practice question", robots: { index: false, follow: false } };

export default async function UpdatedQuestion({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const update = editorialUpdates.find(item => item.id === id);
  if (!update || productionStateBlocked(update.state)) notFound();
  const questionId = update.replacementId ?? update.questionId;
  const question = [...historicalAzQuestions(), ...publishedCaQuestions(), ...publishedHiQuestions()].find(item => item.question_id === questionId)
    ?? serverQuestionById(questionId);
  if (!question || question.state !== update.state || !isActiveQuestion(question)) notFound();
  const session = await getSession();
  const accessible = await canAccessQuestion(session?.id, question);
  const evidence = accessible ? resolveAnswerEvidence(question) : null;
  return (
    <main className="container">
      <Link href="/question-updates/">Question updates</Link>
      <h1>{questionId.toUpperCase()} · {update.topic}</h1>
      <p>{update.reason}</p>
      {accessible ? (
        <article className="card">
          <h2>{question.question_text}</h2>
          {question.scenario_text ? <p>{question.scenario_text}</p> : null}
          <h3>Answer and reasoning</h3>
          <p><strong>{optionText(question, question.correct_option)}</strong></p>
          <p>{question.explanation}</p>
          <h3>Option feedback</h3>
          <ul>{(["A", "B", "C", "D"] as const).flatMap(letter => optionText(question, letter) ?
            [<li key={letter}><strong>{optionText(question, letter)}</strong> {question.option_feedback[letter]}</li>] : [])}</ul>
          {evidence?.href ? <p><a href={evidence.href}>Official evidence</a></p> : null}
        </article>
      ) : <p>This question requires Pro. Your earlier activity remains in your history.</p>}
    </main>
  );
}
