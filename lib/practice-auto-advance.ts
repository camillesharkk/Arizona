import { useCallback, useEffect, useRef } from "react";

/** Delay after a correct practice answer before advancing. Wrong answers never auto-advance. */
export const PRACTICE_CORRECT_ADVANCE_MS = 900;

export function usePracticeAutoAdvance() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (timer.current != null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => cancel, [cancel]);

  const scheduleAfterCorrect = useCallback(
    (hasNext: boolean, goNext: () => void) => {
      cancel();
      if (!hasNext) return;
      timer.current = setTimeout(() => {
        timer.current = null;
        goNext();
      }, PRACTICE_CORRECT_ADVANCE_MS);
    },
    [cancel]
  );

  return { cancel, scheduleAfterCorrect };
}
