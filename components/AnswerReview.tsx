import { AnswerExplain } from "@/components/AnswerExplain";
import { SaveForReview } from "@/components/SaveForReview";
import { getSource } from "@/data/sources";
import type { Question } from "@/lib/types";

export function AnswerReview({
  q,
  index,
  selected,
  onBack,
}: {
  q: Question;
  index: number;
  selected?: "A" | "B" | "C" | "D";
  onBack?: () => void;
}) {
  const options = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d };
  const source = getSource(q.source_id);
  const wrong = selected && selected !== q.correct_option ? q.option_feedback[selected] : undefined;
  return (
    <div className="card">
      <div className="quiz-meta">
        <p className="kicker">Answer explanation</p>
        <div className="quiz-meta-actions">
          <SaveForReview questionId={q.question_id} hint={false} />
        </div>
      </div>
      <h3 className="quiz-stem">
        {index + 1}. {q.question_text}
      </h3>
      <p>
        <strong>Your answer. </strong>
        {selected ? `${selected}. ${options[selected]}` : "Not answered"}
      </p>
      <p>
        <strong>Correct answer. </strong>
        {q.correct_option}. {options[q.correct_option]}
      </p>
      <AnswerExplain
        explanation={q.explanation}
        wrongNote={wrong}
        sourceUrl={source?.url}
        sourceLabel={source ? `${source.title} · ${q.source_reference}` : q.source_reference}
        expanded
      />
      {onBack ? (
        <button className="btn btn-primary" type="button" onClick={onBack}>
          Back to this question
        </button>
      ) : null}
    </div>
  );
}
