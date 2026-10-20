import type { ReactNode } from "react";

export function CardStage({
  children,
  onPrev,
  prevDisabled,
  prevLabel = "Previous",
  onNext,
  nextDisabled,
  nextLabel = "Next",
  corner,
}: {
  children: ReactNode;
  onPrev?: () => void;
  prevDisabled?: boolean;
  prevLabel?: string;
  onNext?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  corner?: ReactNode;
}) {
  return (
    <div className="card-stage">
      <div className="card-side-col">
        <button className="card-side" type="button" onClick={onPrev} disabled={prevDisabled || !onPrev} aria-label={prevLabel}>
          <span aria-hidden="true">‹</span>
          <span className="card-side-label">{prevLabel}</span>
        </button>
      </div>
      <div className="card-stage-body">
        {corner ? <div className="card-corner">{corner}</div> : null}
        {children}
      </div>
      <div className="card-side-col">
        <button className="card-side" type="button" onClick={onNext} disabled={nextDisabled || !onNext} aria-label={nextLabel}>
          <span aria-hidden="true">›</span>
          <span className="card-side-label">{nextLabel}</span>
        </button>
      </div>
    </div>
  );
}
