"use client";

import { useEffect } from "react";

export function StateTheme({ state }: { state: "CA" | "HI" }) {
  useEffect(() => {
    document.documentElement.dataset.state = state;
  }, [state]);
  return null;
}
