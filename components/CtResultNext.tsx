import { ctPaths, ctSources } from '@/lib/ct-site';

export function CtResultNext({ correct, total, missedTopics, attemptId }: {
  correct: number; total: number; missedTopics: { id: string; label: string }[]; attemptId: string;
}) {
  const complete = correct === total;
  return (
    <div className="next-step">
      <h3>Your next step</h3>
      <p>{complete ? 'You answered every question in this practice set correctly.' : 'Review the questions you missed, then practice those topics again.'}</p>
      <div className="result-next">
        {complete ? <a className="btn btn-primary" href={ctSources.application} target="_blank" rel="noopener noreferrer">Open Official Application</a> : (
          <a className="btn btn-primary" href={`${ctPaths.mistakes}${attemptId ? `?attempt=${encodeURIComponent(attemptId)}` : ''}`}>Review Missed Questions</a>
        )}
        {missedTopics.map(topic => <a className="btn btn-ghost" key={topic.id} href={`${ctPaths.practice}?mode=practice&area=${encodeURIComponent(topic.id)}`}>Practice {topic.label}</a>)}
        <a className="btn btn-ghost" href={ctPaths.become}>First Application Checklist</a>
      </div>
    </div>
  );
}
