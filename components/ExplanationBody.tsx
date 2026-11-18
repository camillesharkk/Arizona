import { cleanExplanation, explanationParts } from "@/lib/explanation";

export function ExplanationBody({
  explanation,
  wrongNote,
}: {
  explanation: string;
  wrongNote?: string;
}) {
  const { rule, reasoning } = explanationParts(explanation);
  const note = wrongNote ? cleanExplanation(wrongNote) : "";

  if (!rule) return <p>No explanation is recorded for this question.</p>;

  return (
    <dl className="explanation-sections">
      <div>
        <dt>The rule</dt>
        <dd>
          <p>{rule}</p>
        </dd>
      </div>
      {reasoning.length ? (
        <div>
          <dt>Why it applies</dt>
          <dd>
            <ul>
              {reasoning.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </dd>
        </div>
      ) : null}
      {note ? (
        <div>
          <dt>Why your choice is incorrect</dt>
          <dd>
            <p>{note}</p>
          </dd>
        </div>
      ) : null}
    </dl>
  );
}
