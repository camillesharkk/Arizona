"use client";

import { useEffect } from "react";

export function StateTheme({ state }: { state: "CA" }) {
  useEffect(() => {
    document.documentElement.dataset.state = state;
  }, [state]);
  return null;
}
