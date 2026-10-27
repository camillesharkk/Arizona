export function BookmarkIcon() {
  return (
    <svg className="flag-icon" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 1.5h8v13l-4-2.4-4 2.4v-13z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function FlagIcon() {
  return (
    <svg className="flag-icon" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 1.5v13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3 2.2h8.2L9.4 5l1.8 2.8H3" fill="currentColor" />
    </svg>
  );
}

export function LoadingNote({ text = "Loading your questions…" }: { text?: string }) {
  return (
    <p className="loading-row" role="status">
      <span className="spinner" aria-hidden="true" />
      {text}
    </p>
  );
}

export function QuestionJump({
  ids,
  index,
  flagged,
  onJump,
}: {
  ids: string[];
  index: number;
  flagged: string[];
  onJump: (index: number) => void;
}) {
  const flaggedAt = ids.flatMap((id, i) => (flagged.includes(id) ? [i] : []));
  function jumpFlagged() {
    const next = flaggedAt.find((i) => i > index) ?? flaggedAt[0];
    if (next != null) onJump(next);
  }
  return (
    <div className="q-jump-wrap">
      <button className="chip" type="button" onClick={jumpFlagged} disabled={flaggedAt.length === 0}>
        <FlagIcon /> Flagged ({flaggedAt.length})
      </button>
      <div className="q-jump" aria-label="Question numbers">
        {ids.map((id, i) => (
          <button
            key={id}
            className={`q-num${i === index ? " on" : ""}`}
            type="button"
            aria-current={i === index ? "true" : undefined}
            onClick={() => onJump(i)}
          >
            {i + 1}
            {flagged.includes(id) ? <FlagIcon /> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ExamNav({
  prevDisabled,
  nextDisabled,
  onPrev,
  onNext,
  nextLabel,
  progress,
  submit,
}: {
  prevDisabled: boolean;
  nextDisabled: boolean;
  onPrev: () => void;
  onNext: () => void;
  nextLabel: string;
  progress: string;
  submit?: boolean;
}) {
  return (
    <div className="home-exam-nav">
      <div className="exam-nav">
        <button className="btn btn-ghost" type="button" disabled={prevDisabled} onClick={onPrev}>
          Previous
        </button>
        <span className="exam-nav-progress">{progress}</span>
        <button className={submit ? "btn btn-sage" : "btn btn-primary"} type="button" disabled={nextDisabled} onClick={onNext}>
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
