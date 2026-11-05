"use client";

import { useEffect } from "react";

export function StateTheme({ state }: { state: "CA" }) {
  useEffect(() => {
    document.documentElement.dataset.state = state;
    return () => {
      delete document.documentElement.dataset.state;
    };
  }, [state]);
  return null;
}
