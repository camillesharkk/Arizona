"use client";

import { scrollUnderHeaderSoon } from "@/lib/scroll-under-header";

export function StudyPager({
  index,
  total,
  onPrev,
  onNext,
  target,
  pin = true,
  nextLabel = "Next",
}: {
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  target: React.RefObject<HTMLElement | null>;
  pin?: boolean;
  nextLabel?: string;
}) {
  function go(move: () => void) {
    move();
    scrollUnderHeaderSoon(target.current);
  }

  return (
    <div className={pin ? "study-pager-nav" : "study-pager-nav is-inline"}>
      <div className="exam-nav">
        <button className="btn btn-ghost" type="button" disabled={index <= 0} onMouseDown={(event) => event.preventDefault()} onClick={() => go(onPrev)}>
          Previous
        </button>
        <span className="exam-nav-progress">
          {total ? index + 1 : 0} / {total}
        </span>
        <button className="btn btn-primary" type="button" disabled={index >= total - 1} onMouseDown={(event) => event.preventDefault()} onClick={() => go(onNext)}>
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
