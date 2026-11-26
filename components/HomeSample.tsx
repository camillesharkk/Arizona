"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";

export type SampleQuestion = {
  text: string;
  options: string[];
  correct: number;
  reason: string;
  feedback: string[];
  verified: string;
};

const officialRule = "https://www.nysenate.gov/legislation/laws/EXC/136";
const steps = ["Try it", "Understand it", "Review it"];

function OfficialEvidence({ verified }: { verified: string }) {
  return <div>
    <dt>Official evidence</dt>
    <dd><a href={officialRule}>New York Executive Law § 136</a> · <a href="https://dos.ny.gov/notary-public-frequently-asked-questions">Department of State FAQ</a> · Question reviewed <time dateTime={verified}>{verified}</time></dd>
  </div>;
}

export function HomeSample({ question }: { question: SampleQuestion }) {
  const [answer, setAnswer] = useState<number | null>(null);
  const first = useRef<HTMLButtonElement>(null);
  return (
    <section className="sample-frame" aria-labelledby="sample-heading">
      <p className="editorial-kicker">Try a sample question</p>
      <div className="editorial-card sample-card">
        <span className="editorial-tag">New York · Notarial fees</span>
        <h2 id="sample-heading">{question.text}</h2>
        <div className="sample-options" role="group" aria-labelledby="sample-heading">
          {question.options.map((option, index) => (
            <button key={option} type="button" ref={index === 0 ? first : undefined}
              aria-pressed={answer === index}
              data-result={answer === null ? undefined : index === question.correct ? "correct" : answer === index ? "incorrect" : undefined}
              onClick={() => setAnswer(index)}>
              <span className="sample-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span>
              {option}
              {answer !== null && index === question.correct && <span className="sample-mark" aria-label="Correct option">✓</span>}
              {answer === index && index !== question.correct && <span className="sample-mark" aria-label="Incorrect option">×</span>}
            </button>
          ))}
        </div>
        <div role="status">
          {answer !== null && <p className="sample-feedback"><strong>{answer === question.correct ? "Correct." : "Incorrect."}</strong> {question.options[question.correct]}.</p>}
        </div>
        {answer !== null && (
          <dl className="sample-evidence">
            <div><dt>Rule</dt><dd>{question.options[question.correct]}.</dd></div>
            <div><dt>Why</dt><dd>{question.reason}</dd></div>
            <div><dt>Your option</dt><dd>{question.feedback[answer]}</dd></div>
            <OfficialEvidence verified={question.verified} />
          </dl>
        )}
      </div>
      <div className="sample-footer">
        <span>Sample only. This answer won’t affect your progress.</span>
        <button className="editorial-text-button" type="button" onClick={() => {
          setAnswer(null);
          first.current?.focus();
        }}>Reset question</button>
      </div>
    </section>
  );
}

export function HomeLearning({ question }: { question: SampleQuestion }) {
  const id = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const [step, setStep] = useState(0);
  const [flipped, setFlipped] = useState(false);

  function select(index: number) {
    setStep(index);
    setFlipped(false);
  }

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    switch (event.key) {
      case "ArrowRight": next = (index + 1) % steps.length; break;
      case "ArrowLeft": next = (index + steps.length - 1) % steps.length; break;
      case "Home": next = 0; break;
      case "End": next = steps.length - 1; break;
      default: return;
    }
    event.preventDefault();
    select(next);
    tabs.current[next]?.focus();
  }

  return (
    <section className="editorial-learning" aria-labelledby="learning-heading">
      <div className="editorial-wrap editorial-learning-grid">
        <div>
          <p className="editorial-kicker">The learning flow</p>
          <h2 id="learning-heading">One question.<br />A clearer understanding.</h2>
          <p>A practice question starts the process. An explanation and a focused review help it stick.</p>
          <a href="#state-selection">Find your practice →</a>
        </div>
        <div className="learning-interaction">
          <div className="learning-tabs" role="tablist" aria-label="Learning flow">
            {steps.map((title, index) => (
              <button key={title} type="button" role="tab" id={id + "-tab-" + index}
                tabIndex={index === step ? 0 : -1} aria-controls={id + "-panel-" + index}
                aria-selected={index === step} ref={(element) => { tabs.current[index] = element; }}
                onClick={() => select(index)} onKeyDown={(event) => navigate(event, index)}>{title}</button>
            ))}
          </div>
          {steps.map((title, index) => (
            <div className="editorial-card learning-card" key={title} role="tabpanel" hidden={step !== index}
              id={id + "-panel-" + index} aria-labelledby={id + "-tab-" + index} tabIndex={0}>
              <span className="editorial-tag">New York · {title}</span>
              {index === 0 && <>
                <h3>Start with the question.</h3>
                <p>{question.text}</p>
                <a href="#sample-heading">Try the question ↑</a>
              </>}
              {index === 1 && <>
                <h3>Read the reason behind the answer.</h3>
                <p>{question.reason}</p>
                <a href={officialRule}>Read Executive Law § 136 ↗</a>
              </>}
              {index === 2 && <>
                <h3>Recall the rule from memory.</h3>
                <p role="status">{flipped ? question.options[question.correct] : question.text}</p>
                <button type="button" className="editorial-text-button" onClick={() => setFlipped(value => !value)}>
                  {flipped ? "Show question" : "Flip this card"}
                </button>
              </>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
